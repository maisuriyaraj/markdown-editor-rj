---
# BUG-004: Toolbar formatting can push the text past `maxLength`

**Category:** Bug
**Severity:** Low
**Confidence:** Certain
**Effort:** Small

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
