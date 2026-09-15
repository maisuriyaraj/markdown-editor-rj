---
# BUG-004: Toolbar formatting can push the text past `maxLength`

**Category:** Bug
**Severity:** Low
**Confidence:** Certain
**Effort:** Small
**Status:** Fixed

## Where
`src/MarkdownEditor.tsx`, `formatText` function, lines 26-66,
specifically the `setText(newText)` call on line 60.

## What
The `<textarea>` has `maxLength={maxLength || 1000}`, which the
browser enforces for typing and pasting. But `formatText` builds
`newText` by wrapping the selected text with extra characters (`**`,
`_`, `~`, or `- ` per line) and calls `setText(newText)` directly,
without ever checking `newText.length` against `props.maxLength`.

## Why it matters
If the user's text is already near the `maxLength` limit and they
select text near the end and click Bold/Italic/Strikethrough/List,
the resulting text can exceed `maxLength`. The visible limit the
developer configured is silently bypassed through the toolbar, even
though typing directly is correctly capped.

## How to confirm
Set `maxLength={10}`, type text up to that limit, select some of it,
and click the Bold button. The resulting text will be longer than 10
characters.

## Suggested fix
Before calling `setText(newText)`, check `newText.length` against
`maxLength` and skip or truncate the formatting if it would exceed the
limit.

## Risk of fixing
Low. This only adds a guard condition inside `formatText` and does not
change the component's public API.

## Related
None yet (no specs exist in this repo).

## Resolution
**Date:** 2026-09-15

Added a guard in `formatText`, immediately after `newText` is built: if
`newText.length > maxLength` and the edit makes the text longer, the function
returns before touching anything. No `pendingSelection` is recorded, `setText`
is not called, and `handleChange` is not called, so the text and the
textarea's selection stay exactly as they were.

**Files changed:** `src/MarkdownEditor.tsx`

**Single effective limit.** Since BUG-003, the default is applied once in the
props destructure (`maxLength = 1000`). The guard and the textarea's
`maxLength={maxLength}` read that same variable, so they cannot disagree,
including when the prop is omitted. The line numbers and the
`maxLength || 1000` expression quoted above predate BUG-002/BUG-003.

**Controlled and uncontrolled.** The guard returns before the `isControlled`
branch, so it applies the same way in both modes. In uncontrolled mode, the
internal `setText` is skipped. In controlled mode, `handleChange` is never
called with the oversized string, so the parent never receives it and
`value` is unchanged.

**Skip, not truncate.** Truncating the result to `maxLength` would cut through
a marker and commit broken markdown such as `**bold te`, or a list with a
half-prefixed last line. That is worse than no change, because the user then
has to find and repair it by hand. Skipping keeps the text valid.

**Shrinking edits are still allowed.** The guard also requires the edit to
make the text longer. The only case where this matters is controlled mode
with a parent-supplied `value` that is already over the limit: removing
markers (e.g. un-bolding) is still allowed there. That matches the browser,
which lets users delete from an over-limit textarea. Uncontrolled mode cannot
reach an over-limit value through the editor, so this changes nothing there.

**Verification** (no test framework exists yet, see DX-001, so none was
added). The formatting and guard logic was run in a Node script covering
these cases:
- `maxLength=10`, 10 chars, select all, Bold → result would be 14 chars;
  skipped, no `setText`/`handleChange` call, selection untouched.
- Plenty of headroom (`"hello"`, default limit) → `**hello**` applied, as
  before.
- List on `"a\nb\nc"` (5 → 11 chars, +2 per line): skipped at `maxLength=10`,
  applied at `maxLength=11` (equal to the limit is allowed, as with the
  browser's `maxlength`), skipped at `maxLength=8`. The guard measures the
  final `newText`, so per-line overhead needs no special handling.
- Controlled mode, `maxLength=10`, 10 chars, Bold → `handleChange` never
  called.
- No `maxLength` prop: 1000 chars + Bold (1004) skipped; 996 chars + Bold
  (exactly 1000) applied.

`tsc --noEmit` reports no errors in `src/`. The only errors are unresolved
`undici-types`/`csstype` imports inside `node_modules` type packages, and they
are unrelated to this change.

**User feedback — recommendation, not implemented.** The skip is currently
silent. The component's only channel to the consumer today is callbacks:
`handleChange` plus the textarea events passed straight through (`handlePaste`,
`handleKeyDown`, `onFocus`, `onBlur`). None of them can report a rejected
format. The cheapest honest option is a new optional callback prop, e.g.
`onMaxLengthExceeded?: (info: { format: string; attemptedLength: number;
maxLength: number }) => void`, called from this guard just before `return`.
Consumers already own their UI, so they can show a character counter or an
inline message. It is additive and backward compatible, and the component
stays free of UI it would have to style. A zero-API alternative is the
browser's own validation bubble (`textarea.setCustomValidity(...)` +
`reportValidity()`). That needs the message cleared on the next input, and it
would block form submission if left set, so the callback is the better fit.

**Version bump needed:** Patch. It is a behavior fix with no API change.
