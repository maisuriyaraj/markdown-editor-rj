---
# DEBT-001: Repeated wrap/unwrap logic and inconsistent formatting in MarkdownEditor.tsx

**Category:** Tech Debt
**Severity:** Low
**Confidence:** Certain
**Effort:** Small

## Where
`src/MarkdownEditor.tsx`:
- `toggleFormatting`, lines 34-46: the bold, italic, and strikethrough
  cases each repeat the same "does it already start/end with the
  marker, then strip or wrap" pattern with only the marker string
  changing (`**`, `_`, `~`).
- Line 23: the props destructuring line is a single long line with
  inconsistent spacing (`handleChange,handlePaste, handleKeyDown,...`).
- Lines 37, 41, 45: inline comments state what the line already says
  (`// Remove the bold markers if already applied`, `// Apply bold
  formatting`, etc.) rather than explaining anything non-obvious.

## What
This is a grouped style/duplication finding, not a functional bug.
The three marker-based cases in `toggleFormatting` differ only in
which marker string is used, and could be handled by one shared
function parameterized by marker. Formatting/spacing and comment style
are inconsistent in a few spots.

## Why it matters
None of this breaks anything today. It makes the file slightly harder
to scan and slightly more work to extend (e.g. adding a new marker
style means copy-pasting another near-identical case).

## How to confirm
Read `toggleFormatting` lines 34-46 and compare the bold, italic, and
strikethrough branches.

## Suggested fix
Extract a small helper like `wrapOrUnwrap(selectedText, marker)` and
call it for bold/italic/strikethrough with the right marker string.
Reformat the props destructuring onto multiple lines. Remove comments
that just restate the code next to them.

## Risk of fixing
Very low. Pure refactor, no behavior change intended.

## Related
None yet (no specs exist in this repo).
