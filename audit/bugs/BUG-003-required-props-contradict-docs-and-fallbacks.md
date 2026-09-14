---
# BUG-003: `rows`, `maxLength`, `placeholder` are required in the types but the README example omits them

**Category:** Bug
**Severity:** Medium
**Confidence:** Certain
**Effort:** Small

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
