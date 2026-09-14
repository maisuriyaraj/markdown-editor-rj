---
# BUG-002: Editor has no way to receive or reset its text from outside

**Category:** Bug
**Severity:** High
**Confidence:** Certain
**Effort:** Medium

## Where
`src/MarkdownEditor.tsx` lines 4-24 (the `Props` interface and the
`const [text, setText] = useState('')` line).

## What
The component keeps its own internal `text` state and only ever sends
that text *out* through `handleChange`. There is no `value` prop in
`Props`, and nothing in the component ever reads a `value` from
`props`. The textarea's `value={text}` always comes from the
component's own internal state.

## Why it matters
The parent app has no way to set or change the editor's content once
it is rendered. Common, everyday cases break:
- Clearing the box after the user submits a form
- Pre-filling the box when editing something that already has text
- Resetting the box from a "Cancel" or "Clear" button elsewhere on the
  page

The README's own usage example stores the value in `editorValue` state
in the parent (`const [editorValue, setEditorValue] = useState('')`),
which strongly implies the parent is meant to be able to drive the
editor's content. Today it cannot; `editorValue` in that example is
write-only from the parent's point of view.

## How to confirm
Follow the README example, then try to set `editorValue` to some text
programmatically (e.g. after a successful submit) and observe that the
textarea on screen does not change.

## Suggested fix
Accept an optional `value` prop and use it as the source of truth (a
standard controlled-component pattern), or clearly document that this
is an uncontrolled component and provide an imperative way (e.g. a ref
with a `clear()`/`setValue()` method) to change it from outside.

## Risk of fixing
Medium. Changing to a controlled pattern changes the public API and
may require a major version bump, since existing consumers rely on the
current uncontrolled behavior.

## Related
None yet (no specs exist in this repo).
