---
# DX-005: README's Installation section never actually shows the install command

**Category:** DX
**Severity:** Low
**Confidence:** Certain
**Effort:** Small

## Where
`README.md` lines 13-16.

## What
```md
## Installation

To install the Markdown Editor package in your project, use npm
### Full Example Usage
```

The Installation section states the intent ("use npm") but never
actually shows the command (e.g. `npm install markdown-editor-rj`)
before jumping straight into the usage example.

## Why it matters
Small, but it is the very first thing a new user reads, and it does
not tell them what to type. It also reads as if a code block was
meant to go there and was left out.

## How to confirm
Read `README.md` lines 13-16 directly.

## Suggested fix
Add the actual install command, e.g.:
```
npm install markdown-editor-rj
```

While updating this section, note the README's title ("# Markdown
Message Editor") also does not match the package name
(`markdown-editor-rj`) or the name used in `PRODUCT_OVERVIEW.md`
("Markdown Editor RJ") — worth aligning at the same time since it's in
the same file.

## Risk of fixing
None — documentation only.

## Related
None yet (no specs exist in this repo).
