---
# DX-004: No linting or formatting tool configured

**Category:** DX
**Severity:** Low
**Confidence:** Certain
**Effort:** Small

## Where
Whole repo. No ESLint, Prettier, or `.editorconfig` file exists.

## What
Nothing automatically checks or enforces code style. This is the
tooling gap behind the inconsistent spacing and comment style noted in
DEBT-001 — there is nothing that would catch it before it is written.

## Why it matters
Small inconsistencies (like the long unspaced prop-destructuring line
in `MarkdownEditor.tsx`) can keep accumulating with no automated
feedback, and every contributor has to rely on manual review to catch
them.

## How to confirm
`ls` the repo root and `package.json` `devDependencies`; no
ESLint/Prettier config or dependency is present.

## Suggested fix
Add ESLint (with a React/TypeScript config) and Prettier, plus a
`"lint"` script in `package.json`.

## Risk of fixing
None — purely additive. Running a formatter across the existing files
would touch a lot of lines at once, so if adopted, do that as its own
separate change rather than mixed into other work.

## Related
DEBT-001.
