---
# DX-001: No automated tests exist for the component

**Category:** DX
**Severity:** Medium
**Confidence:** Certain
**Effort:** Medium

## Where
Whole repo. `package.json` has no `"test"` script and no testing
library in `devDependencies`. No `*.test.*` or `*.spec.*` files exist
anywhere in the project.

## What
There is no automated way to verify the component's behavior. All of
this audit's logic-related findings (BUG-004, BUG-006, IMP-001) are
exactly the kind of thing a handful of unit tests around `formatText`
would have caught.

## Why it matters
Every future change to `formatText`, the props, or the CSS has no
safety net. Regressions (like the `maxLength` bypass in BUG-004) can
be reintroduced silently, and there is no fast way to confirm a fix
actually works other than manual testing in a browser.

## How to confirm
Check `package.json` for a `"test"` script (none exists) and search
the repo for test files (none exist).

## Suggested fix
Add a test runner (e.g. Vitest or Jest + React Testing Library) and
cover at minimum: `formatText` for bold/italic/strikethrough/list,
the `maxLength` boundary case, and basic rendering of the toolbar and
textarea with different props.

## Risk of fixing
None — purely additive.

## Related
BUG-004, BUG-006, IMP-001 are the kinds of regressions tests would
catch.
