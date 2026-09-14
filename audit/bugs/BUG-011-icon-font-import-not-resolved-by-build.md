---
# BUG-011: Toolbar icons will not load in a real consumer app — the icon font's `@import` is never resolved by the build

**Category:** Bug
**Severity:** Critical
**Confidence:** Certain
**Effort:** Small

## Where
`src/global.css` line 1: `@import
url('bootstrap-icons/font/bootstrap-icons.min.css');`, bundled by
`rollup.config.mjs`'s `postcss({ extract: true })` step (no
`postcss-import` or equivalent plugin is configured).

## What
I rebuilt the package and inspected the published CSS output
(`dist/index.css`):

```css
@import url('bootstrap-icons/font/bootstrap-icons.min.css');
```

This line is carried through into `dist/index.css` completely
unchanged. `rollup-plugin-postcss` does not resolve `@import`
statements by default (there is no `postcss-import` plugin configured
in `rollup.config.mjs`), and `@import url(...)` in plain CSS is a
literal browser URL, not an npm module specifier. `'bootstrap-icons/font/bootstrap-icons.min.css'`
is not a valid path from wherever a consumer's built CSS is served —
it only exists inside `node_modules` on whichever machine installed
the package.

## Why it matters
The toolbar's four buttons (`bi bi-type-bold`, `bi bi-type-italic`,
`bi bi-type-strikethrough`, `bi bi-list-ul`) are entirely dependent on
this icon font loading. In a typical consumer app, the browser
requests `bootstrap-icons/font/bootstrap-icons.min.css` relative to
the page and gets a 404, so the icon font's own CSS (and the font
files it points to) never loads. The toolbar buttons render as empty,
unlabeled boxes — the editor's whole formatting toolbar becomes
effectively invisible/unusable out of the box, with no error thrown
that would point a consumer at the actual cause.

## How to confirm
1. `npm run build`, then open `dist/index.css` and see the unresolved
   `@import url('bootstrap-icons/...')` line at the top.
2. Install the built package into a separate, minimal app (not this
   monorepo, so `node_modules/bootstrap-icons` is not sitting at a
   coincidentally-matching relative path), render `<MarkdownEditor />`,
   and check the browser network tab / rendered toolbar — the icon
   font request will fail and the buttons will show no icons.

## Suggested fix
Add a CSS import-resolving plugin (e.g. `postcss-import`) to the
`postcss()` step in `rollup.config.mjs` so `bootstrap-icons`'s CSS
(and font files) get inlined/copied into the package's own build
output at publish time, instead of left as an unresolved runtime
`@import`.

## Risk of fixing
Low. This only changes how the icon font CSS is bundled; it does not
change the component's behavior or API.

## Related
Same file as BUG-007 (global.css scoping). Also relevant to DEBT-002 —
once this is fixed, the actual bundled font weight (see PERF-001) will
become visible in this package's own `dist/` output rather than being
silently broken today.
