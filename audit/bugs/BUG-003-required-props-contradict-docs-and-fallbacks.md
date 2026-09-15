---
# BUG-003: `rows`, `maxLength`, `placeholder` are required in the types but the README example omits them

**Category:** Bug
**Severity:** Medium
**Confidence:** Certain
**Effort:** Small
**Status:** Fixed

## Where
`src/MarkdownEditor.tsx` lines 8-10 (`Props` interface: `placeholder:
string; rows: number; maxLength: number;` — no `?`), versus lines
79/85/86 (`maxLength={maxLength || 1000}`, `rows={rows || 5}`,
`placeholder={placeholder || "Enter your text here"}`), versus
`README.md` lines 38-41.

## What
In the `Props` interface, `placeholder`, `rows`, and `maxLength` are
declared as required (no `?`). But the component's own JSX immediately
falls back to defaults if they are missing (`|| 5`, `|| 1000`, `||
"Enter your text here"`), and the README's usage example only passes
`handleChange` and `placeholder`:

```jsx
<MarkdownEditor
  handleChange={handleEditorChange}
  placeholder="Start typing your markdown here..."
/>
```

This omits `rows` and `maxLength` entirely.

## Why it matters
A TypeScript consumer who copies the README example as-is will get a
compile error, because `rows` and `maxLength` are required by the
type, e.g. `Property 'rows' is missing in type '...' but required in
type 'Props'.` The documented usage does not actually type-check
against the component it documents.

## How to confirm
In a TypeScript React project with this package installed, paste the
README's exact usage example and run the TypeScript compiler. It will
report missing required props for `rows` and `maxLength`.

## Suggested fix
Mark `placeholder`, `rows`, and `maxLength` as optional (`?`) in the
`Props` interface, matching the fallback defaults already coded in the
component.

## Risk of fixing
Low. Making required props optional is backward compatible for
existing consumers who already pass values.

## Related
None yet (no specs exist in this repo).

## Resolution
**Date:** 2026-09-15

Marked `placeholder`, `rows`, and `maxLength` as optional (`?`) in the `Props`
interface, matching the fallback defaults the component already applied. The
README's usage example now type-checks against the component; before the fix
the same example failed with `TS2739: ... is missing the following properties
from type 'Props': rows, maxLength`.

Moved the defaults out of the JSX and into default parameter values in the
props destructure (`rows = 5`, `maxLength = 1000`, `placeholder = 'Enter your
text here'`, and likewise `name = 'editor'`, `disabled/readOnly/autoFocus/
required = false`), replacing the inline `||` fallbacks. This is a small
deliberate behavior change for explicitly-passed falsy values: `||` treated
them as missing, so `maxLength={0}` silently became `1000`, `placeholder=""`
became `"Enter your text here"`, and `name=""` became `"editor"`. A default
parameter only applies when the prop is `undefined`, so those explicit values
are now respected. The four boolean defaults are exactly equivalent to the old
`|| false` and change nothing.

**Files changed:** `src/MarkdownEditor.tsx`

**Flagged but left alone — different class of problem:**
`spellCheck={spellCheck || true}` is a genuine logic bug, not a type mismatch:
`|| true` makes the expression `true` for every input, so `spellCheck={false}`
cannot turn spellcheck off. It was left as-is because it is a behavior bug
rather than the types-vs-defaults mismatch this finding covers, and deserves
its own audit entry. Fixing it is a one-word change (`spellCheck = true` in the
destructure, `spellCheck={spellCheck}` in the JSX).

No other prop mismatches were found: `handleChange` is required and always
called; `value`, `handlePaste`, `handleKeyDown`, `onFocus`, and `onBlur` are
optional and passed straight through to the textarea (or, for `value`,
guarded by an explicit `value !== undefined` check), so none are dereferenced
without a guard.

**Version bump needed:** Patch/minor — relaxing required props to optional is
backward compatible for consumers already passing values.
