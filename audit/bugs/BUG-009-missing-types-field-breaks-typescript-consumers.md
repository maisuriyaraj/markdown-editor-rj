---
# BUG-009: Published package has no working TypeScript types for consumers

**Category:** Bug
**Severity:** High
**Confidence:** Certain
**Effort:** Small

## Where
`package.json` (missing `"types"`/`"typings"` field), `tsconfig.json`
(`declarationDir: "./dist"`), `rollup.config.mjs` (`input:
"src/MarkdownEditor.tsx"`).

## What
`package.json` has no `"types"` or `"typings"` field. When that field
is absent, TypeScript falls back to looking for a declaration file
next to the `"main"` entry with the same base name — i.e. it looks for
`dist/index.d.ts` (from `"main": "dist/index.js"`).

I ran the actual build (`npm run build`) and checked what gets
generated:

```
dist/MarkdownEditor.d.ts
dist/index.css
dist/index.es.css
dist/index.es.js
dist/index.es.js.map
dist/index.js
dist/index.js.map
```

The declaration file is named `MarkdownEditor.d.ts` (matching the
source file name), not `index.d.ts`. `dist/index.d.ts` does not exist
anywhere in the build output.

## Why it matters
A TypeScript consumer importing this package gets no type information
for `MarkdownEditor` or its `Props` — no autocomplete, no compile-time
checking of which props exist, no protection against the exact
`Props`/README mismatch described in BUG-003. This undercuts a main
selling point of a package that is built with TypeScript in the first
place (`"declaration": true` in `tsconfig.json`, `@types/react` in
devDependencies).

## How to confirm
Run `npm run build`, then check `ls dist/` — `index.d.ts` is not
present, only `MarkdownEditor.d.ts`. In a separate TypeScript project
with this package installed, `import MarkdownEditor from
'markdown-editor-rj'` will not bring in any prop types.

## Suggested fix
Either add `"types": "dist/MarkdownEditor.d.ts"` to `package.json`, or
change the rollup/TypeScript setup to emit (or re-export) a
`dist/index.d.ts` matching the JS entry file names.

## Risk of fixing
Very low. Adding or correcting a `"types"` field is additive and does
not affect any existing runtime behavior.

## Related
Same underlying "publish config is incomplete" theme as BUG-008.
