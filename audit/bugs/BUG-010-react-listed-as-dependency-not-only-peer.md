---
# BUG-010: `react` and `react-dom` are declared as regular dependencies, not just peer dependencies

**Category:** Bug
**Severity:** High
**Confidence:** Certain
**Effort:** Small

## Where
`package.json` lines 18-23 (`"dependencies"`) and lines 38-41
(`"peerDependencies"`).

## What
`react` and `react-dom` appear in **both** places:

```json
"dependencies": {
  "@rollup/plugin-url": "^8.0.2",
  "bootstrap-icons": "^1.11.3",
  "react": ">=16.8",
  "react-dom": ">=16.8"
},
...
"peerDependencies": {
  "react": ">=16.8",
  "react-dom": ">=16.8"
}
```

`rollup.config.mjs` also uses `rollup-plugin-peer-deps-external()`,
which is specifically meant to keep `peerDependencies` like React out
of the bundle — but that plugin only affects the bundled JS output, it
does nothing about what npm installs based on `"dependencies"`.

## What
This component uses React hooks (`useState`), so it must run against
the exact same React instance as the host application. Listing `react`
and `react-dom` under `"dependencies"` (in addition to
`peerDependencies`) means npm may install its own copies of
`react`/`react-dom` inside this package's own `node_modules` (depending
on the consumer's dependency tree and package manager), instead of
relying solely on the host app's React. Two React instances loaded at
once is a well-known source of the "Invalid hook call" runtime error
and other subtle bugs (context not matching, etc.).

## Why it matters
Consumers can hit "Invalid hook call. Hooks can only be called inside
the body of a function component" for reasons that have nothing to do
with their own code, purely because this package's dependency
declaration allows a second React copy to be installed.

## How to confirm
`npm install markdown-editor-rj` in a fresh project and inspect
whether `react`/`react-dom` get installed under
`node_modules/markdown-editor-rj/node_modules/` (this depends on the
consumer's existing React version and package manager's dedupe
behavior, so it may not reproduce in every environment, but the
misconfiguration itself is visible directly in `package.json`).

## Suggested fix
Remove `react` and `react-dom` from `"dependencies"`. Keep them only
in `"peerDependencies"` (and optionally `"devDependencies"` for local
development/building).

## Risk of fixing
Low. This only affects what gets installed for consumers; it does not
change any code in this package.

## Related
Same file/section as DX-001 (`@rollup/plugin-url` also misplaced in
`"dependencies"`).
