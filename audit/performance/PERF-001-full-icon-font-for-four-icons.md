---
# PERF-001: A full icon font library is pulled in to show 4 icons

**Category:** Performance
**Severity:** Low
**Confidence:** Certain
**Effort:** Small

## Where
`src/global.css` line 1 (`@import url('bootstrap-icons/...')`),
`package.json` line 20 (`"bootstrap-icons": "^1.11.3"`), used for 4
icon classes in `src/MarkdownEditor.tsx` lines 71-74 (`bi
bi-type-bold`, `bi bi-type-italic`, `bi bi-type-strikethrough`, `bi
bi-list-ul`).

## What
The `bootstrap-icons` package is 6.7 MB on disk, and just its font
files are 176 KB (`.woff`) + 130 KB (`.woff2`), plus an 84 KB CSS file
defining hundreds of icon classes. This component only ever uses 4 of
those icons.

## Why it matters
Once BUG-011 (unresolved `@import`) is fixed and the icon font
actually loads for consumers, every app using this editor will
download the full icon font (~300 KB of font + CSS) just to show 4
small icons. For a package whose stated goal is being "lightweight,"
this is a disproportionate amount of weight for the toolbar alone.

## How to confirm
Check `node_modules/bootstrap-icons/font/fonts/` file sizes and
compare against the 4 icon classes actually used in
`MarkdownEditor.tsx`.

## Suggested fix
Replace the icon font dependency with 4 small inline SVG icons (or a
tiny hand-picked icon set), removing the `bootstrap-icons` dependency
entirely.

## Risk of fixing
Low, but it does change the toolbar's DOM markup (icons become inline
SVG instead of `<i className="bi ...">`), so visual output should be
compared before/after.

## Related
Depends on BUG-011 being fixed first (icons do not currently load for
consumers at all, so this weight is not yet being paid in practice).
