---
# BUG-005: Toolbar buttons have no text or label for screen readers

**Category:** Bug
**Severity:** Medium
**Confidence:** Certain
**Effort:** Small
**Status:** Fixed

## Where
`src/MarkdownEditor.tsx` lines 71-74, the four toolbar `<button>`
elements.

## What
Each toolbar button contains only an icon, with no visible text and no
`aria-label`, `title`, or other accessible name:

```tsx
<button className='toolbar-button' onClick={() => formatText('bold')}><i className="bi bi-type-bold"></i></button>
```

The icon comes from an icon font (`bootstrap-icons`), which screen
readers do not read as meaningful text on its own.

## Why it matters
A screen reader user tabbing through the toolbar hears an unlabeled
"button" with no indication of what it does (bold, italic,
strikethrough, or list). This makes the toolbar unusable without
sight, in a component whose whole purpose is to be embedded in other
people's forms.

## How to confirm
Inspect the rendered toolbar with a screen reader (e.g. NVDA, VoiceOver)
or an accessibility checker (e.g. axe), and confirm each button is
announced without a name describing its action.

## Suggested fix
Add an `aria-label` (e.g. `aria-label="Bold"`) to each toolbar button.

## Risk of fixing
Very low. Adding `aria-label` attributes has no effect on existing
behavior or styling.

## Related
None yet (no specs exist in this repo).

## Resolution
**Date:** 2026-09-15

Each of the four toolbar buttons now has an `aria-label` that describes what
it does in `formatText`: `Bold`, `Italic`, `Strikethrough` (all three toggle
their markers on and off), and `Bulleted list` (`ul` puts `- ` in front of
each selected line). Each `<i>` icon now has `aria-hidden="true"`, so the icon
font is hidden from assistive technology and the label is each button's only
accessible name. No `title` attribute was added because the component does not
use one anywhere else. Class names, styling, and the icon library are
unchanged. The line numbers quoted above predate BUG-001 to BUG-004. The
buttons were at lines 113-116 when this fix was made.

**Files changed:** `src/MarkdownEditor.tsx`

**`role="toolbar"`: added.** All four buttons were already children of the
single `<div className="toolbar">`, so that div was given `role="toolbar"` and
`aria-label="Formatting"`. The DOM structure did not change. Arrow-key
navigation (roving `tabindex`), which the ARIA toolbar pattern recommends, was
not added. Tab still moves through each button, as it did before.

**Separate behavior bug found: toolbar buttons submitted parent forms.** None
of the buttons had a `type`, and a `<button>` without one is
`type="submit"`. When the editor was placed inside a consumer's `<form>`,
clicking Bold, Italic, Strikethrough, or List submitted that form, which
usually means a page reload or a premature submit. All four buttons now have
`type="button"`. This is a behavior fix, not an accessibility one, and it may
deserve its own finding and changelog entry.

**Verification** (no test framework exists yet, see DX-001, so no test was
added). The component was transpiled with the repo's `typescript` and
rendered inside a `<form>` with `react-dom/server`. The output was checked
for each button:
- `type="button"` is present, so no button can submit the parent form.
- There is exactly one `aria-label` (`Bold`, `Italic`, `Strikethrough`,
  `Bulleted list`) and no `title`.
- There is no text content, and the only child is an `<i>` with
  `aria-hidden="true"`, so no icon text competes with the label.
- The toolbar div renders with `role="toolbar"` and `aria-label="Formatting"`.

`tsc --noEmit` on `src/MarkdownEditor.tsx` reports no errors.

**Version bump needed:** Patch. There is no API change.
