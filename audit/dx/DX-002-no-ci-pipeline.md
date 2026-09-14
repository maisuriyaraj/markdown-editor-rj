---
# DX-002: No CI pipeline — nothing runs automatically before a publish

**Category:** DX
**Severity:** Medium
**Confidence:** Certain
**Effort:** Small

## Where
Whole repo. No `.github/workflows` folder or any other CI
configuration exists.

## What
There is no automated check that runs the build (or tests, once they
exist) on every push or pull request. `npm run build` is only ever run
by hand.

## Why it matters
Combined with DX-001 (no tests) and BUG-008/BUG-009 (broken publish
config), there is currently nothing that would catch a broken build or
a broken package before it reaches npm — every safety check depends on
a person remembering to run it manually.

## How to confirm
Check for `.github/workflows/*.yml` or any other CI config file; none
exist.

## Suggested fix
Add a simple CI workflow that runs `npm install` and `npm run build`
(and tests, once added) on every push/PR, so a broken build is caught
before publishing.

## Risk of fixing
None — purely additive.

## Related
BUG-008, BUG-009, DX-001.
