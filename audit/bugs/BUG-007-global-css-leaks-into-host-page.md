---
# BUG-007: The stylesheet resets and restyles the *entire host page*, not just the editor

**Category:** Bug
**Severity:** Critical
**Confidence:** Certain
**Effort:** Small

## Where
`src/global.css` lines 1-29, specifically:
- Lines 4-22: `:root { --primary-color: ...; ... }`
- Lines 24-29: `* { margin: 0; padding: 0; box-sizing: border-box; }`

## What
This file is imported directly by the component (`import
'./global.css';` in `MarkdownEditor.tsx`), so it ships with the npm
package and loads into whatever page uses `<MarkdownEditor />`.

It defines its color/spacing variables on `:root` — the host page's
own root element, not something scoped to the editor. Worse, it
includes a universal selector reset:

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
```

`*` matches every single element on the page, not just elements inside
`.markdown-editor`.

## Why it matters
Any website or app that installs this package and renders the editor
gets its global margin, padding, and box-sizing reset for its *entire*
page, not just the editor widget. This can silently break the layout
of everything else on that page — headers, nav bars, other components,
spacing between sections — the moment this package is imported.

The `:root` custom properties (`--primary-color`, `--text-color`,
`--border-radius`, etc.) are also generic, commonly-used names. If the
host app already defines CSS variables with the same names on
`:root` (a very reasonably likely for `--primary-color` or
`--border-radius`), whichever stylesheet loads last silently wins,
causing values to bleed in either direction between the host page and
the editor.

This is the most consequential finding in this audit: for a component
meant to be embedded in other people's products, a page-wide visual
reset is very likely to be reported as "your package broke my site's
layout."

## How to confirm
Create a plain HTML page with some existing spacing (e.g. a `<h1>`
with default browser margin) alongside `<MarkdownEditor />`, import
the package, and observe that the page's own unrelated elements lose
their default margin/padding as soon as the editor is imported.

## Suggested fix
Scope every rule to `.markdown-editor` (e.g. `.markdown-editor,
.markdown-editor * { margin: 0; padding: 0; box-sizing: border-box;
}`) instead of the bare `*` selector, and move the CSS custom
properties off `:root` and onto `.markdown-editor` so they only affect
elements inside the widget. Consider prefixing the variable names
(e.g. `--mdrj-primary-color`) to avoid collisions with the host app's
own variables.

## Risk of fixing
Low. Scoping selectors more tightly only reduces what the CSS affects;
it should not change how the editor itself looks, as long as every
rule that currently relies on the global reset is re-checked against
the scoped version.

## Related
None yet (no specs exist in this repo).
