---
# BUG-005: Toolbar buttons have no text or label for screen readers

**Category:** Bug
**Severity:** Medium
**Confidence:** Certain
**Effort:** Small

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
