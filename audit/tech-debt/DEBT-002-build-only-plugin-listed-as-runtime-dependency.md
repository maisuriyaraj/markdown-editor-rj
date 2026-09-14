---
# DEBT-002: `@rollup/plugin-url` is a build tool but is listed as a runtime dependency

**Category:** Tech Debt
**Severity:** Low
**Confidence:** Certain
**Effort:** Small

## Where
`package.json` line 19 (`"dependencies"`), used in `rollup.config.mjs`
line 6 (`import url from '@rollup/plugin-url';`).

## What
`@rollup/plugin-url` is only used inside `rollup.config.mjs`, to
handle asset imports during the build. It is listed under
`"dependencies"` in `package.json`, which means every consumer who
installs this package also downloads this build-time tool into their
own `node_modules`, even though they never run this package's build.

## Why it matters
No functional bug — the package still works for consumers. It is
unnecessary install weight and a sign the dependency lists were not
curated (regular dependencies vs. dev-only tooling).

## How to confirm
Search `src/MarkdownEditor.tsx` for any use of `@rollup/plugin-url`;
it only appears in `rollup.config.mjs`.

## Suggested fix
Move `@rollup/plugin-url` from `"dependencies"` to `"devDependencies"`.

## Risk of fixing
Very low. Purely a `package.json` classification change.

## Related
Same file/section as BUG-010 (`react`/`react-dom` also misplaced in
`"dependencies"`).
