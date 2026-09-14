---
# BUG-006: Cursor position is set before React has applied the new text to the DOM

**Category:** Bug
**Severity:** Medium
**Confidence:** Needs checking
**Effort:** Small

## Where
`src/MarkdownEditor.tsx`, `formatText` function, lines 59-65.

## What
```ts
const newText = `${text.slice(0, selectionStart)}${formattedText}${text.slice(selectionEnd)}`;
setText(newText);
handleChange(newText);

const newCursorPos = selectionStart + formattedText.length;
textarea.setSelectionRange(newCursorPos, newCursorPos);
```

`setText(newText)` only schedules a React state update; it does not
change the textarea's DOM value immediately. `textarea.setSelectionRange`
runs right after, while the DOM element's `.value` is still the *old*
text. Browsers clamp `setSelectionRange` positions to the current
value's length, so if `newCursorPos` is larger than the old text's
length, the browser will clamp it to a different position than
intended. Then React re-renders moments later and sets `.value` to the
new (longer) text.

## Why it matters
If this plays out the way the order of operations suggests, the
cursor can land in the wrong place after clicking a toolbar button
(for example, snapping to the end of the old text instead of right
after the newly inserted markers), which would be a small but
noticeable annoyance every time the toolbar is used.

## How to confirm
This needs to be checked in an actual browser, since it depends on
timing between React's state commit and the DOM update, which cannot
be confirmed by reading the source alone. Steps: type a sentence,
select a word in the middle, click Bold, and check exactly where the
text cursor ends up. Repeat with a few different selection positions
(start, middle, end of the text).

## Suggested fix
Move the `setSelectionRange` call into a `useEffect` (or
`requestAnimationFrame`/`queueMicrotask`) that runs after the state
update has been committed and the textarea's value has actually
changed, instead of calling it synchronously right after `setText`.

## Risk of fixing
Low. This is a timing change local to `formatText` and does not affect
the public API.

## Related
None yet (no specs exist in this repo).
