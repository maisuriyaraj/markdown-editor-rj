---
# IMP-001: Clicking a formatting button with no text selected inserts empty markers

**Category:** Improvement
**Severity:** Low
**Confidence:** Certain
**Effort:** Small

## Where
`src/MarkdownEditor.tsx`, `toggleFormatting` function, lines 33-55.

## What
If the user clicks Bold, Italic, or Strikethrough with no text
selected (cursor just sitting in the textarea), `selectedText` is an
empty string. The bold case, for example, produces `` `**${''}**` ``,
which inserts `****` at the cursor. The cursor is then placed right
after the inserted markers, not between them, so the user cannot start
typing the bolded word right away — they have to click back between
the two pairs of asterisks first.

## Why it matters
This is a common way people expect to use a formatting toolbar (click
Bold, then type the word). Today it inserts unusable-looking marker
pairs and leaves the cursor in the wrong spot, which is confusing
rather than broken.

## How to confirm
Click into the empty textarea (or place the cursor with nothing
selected) and click the Bold button. Observe `****` appears and the
cursor sits after it, not between the two `**` pairs.

## Suggested fix
When `selectedText` is empty, insert the markers and place the cursor
between them (e.g. `selectionStart + 2` for bold) instead of after the
whole inserted string.

## Risk of fixing
Low. This only changes cursor placement math for the empty-selection
case.

## Related
Related to BUG-006 (cursor positioning after formatting).
