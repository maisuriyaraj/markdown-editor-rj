---
# DX-003: `package.json` declares a license, but there is no LICENSE file

**Category:** DX
**Severity:** Low
**Confidence:** Certain
**Effort:** Small

## Where
`package.json` line 13 (`"license": "ISC"`). No `LICENSE` or
`LICENSE.md` file exists anywhere in the repo.

## What
The package claims the ISC license, but there is no license file
containing the actual license text, copyright line, or year.

## Why it matters
Consumers (and tools like npm's registry page, or company legal/OSS
review checklists) that look for the actual license text will not
find one. It is a small but real gap between what is declared and
what is provided.

## How to confirm
`ls` the repo root; there is no `LICENSE` file.

## Suggested fix
Add a `LICENSE` file with the standard ISC license text and the
author's name/year.

## Risk of fixing
None — purely additive.

## Related
None yet (no specs exist in this repo).
