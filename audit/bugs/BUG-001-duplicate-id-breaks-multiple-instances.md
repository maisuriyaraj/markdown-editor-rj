---
# BUG-001: Hardcoded textarea id breaks any page with more than one editor

**Category:** Bug
**Severity:** High
**Confidence:** Certain
**Effort:** Small
**Status:** Fixed

## Where
`src/MarkdownEditor.tsx` lines 27 and 77.

## What
The toolbar's `formatText` function finds the textarea like this:

```ts
const textarea = document.getElementById('editor') as HTMLTextAreaElement;
```

And the textarea it needs to find is rendered like this:

```tsx
<textarea id="editor" ... />
```

The id `"editor"` is a fixed string. It does not use the `name` prop or
anything else that would make it unique per instance.

## Why it matters
HTML ids must be unique on a page. If a developer renders two or more
`<MarkdownEditor />` components on the same page (for example, a page
with several comment boxes, or an edit form with two text fields),
every instance ends up with `id="editor"`.

`document.getElementById('editor')` always returns the first matching
element in the document, no matter which toolbar button the user
actually clicked. So clicking "Bold" on the second editor's toolbar
will format text inside the *first* editor's textarea instead — or do
nothing useful if the first editor's selection is empty.

## How to confirm
Render two `<MarkdownEditor />` instances on one page, type different
text into each, select text in the second one, and click its Bold
button. The formatting will apply to the first editor, not the one the
user is interacting with.

## Suggested fix
Use a React ref (`useRef`) instead of `getElementById`, and if an id is
still needed for the `<textarea>`, generate one per instance (e.g. from
the `name` prop or `React.useId()`) instead of hardcoding `"editor"`.

## Risk of fixing
Low. Switching to a ref is a self-contained change inside this one
component and does not change the public props API.

## Related
None yet (no specs exist in this repo).

## Resolution
**Date:** 2026-09-14

Replaced `document.getElementById('editor')` with a `useRef<HTMLTextAreaElement>`
attached to the `<textarea>`, so each `MarkdownEditor` instance's `formatText`
always reads and writes its own DOM node. The hardcoded `id="editor"` on the
`<textarea>` was replaced with `React.useId()`, generating a unique id per
instance.

**Files changed:** `src/MarkdownEditor.tsx`

**Deviation from suggested fix:** The suggestion allowed generating the id from
either `useId()` or the `name` prop. Used `useId()` unconditionally instead of
`name || useId()`, since two instances can legitimately share the same `name`
(e.g. two forms with the same field name), which would have reintroduced the
same id-collision bug this fix addresses. The `name` prop's existing behavior
(used for the textarea's `name` attribute, defaulting to `"editor"`) is
unchanged.
