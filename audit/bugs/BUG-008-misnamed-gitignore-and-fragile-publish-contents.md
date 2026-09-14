---
# BUG-008: The ignore file is misnamed, and only an accident is keeping npm publishes working

**Category:** Bug
**Severity:** Critical
**Confidence:** Certain
**Effort:** Small

## Where
`.gitIgnore` (the file itself — note the capital "I"), and
`package.json` (missing `"files"` field).

## What
The file that is supposed to be `.gitignore` is actually named
`.gitIgnore` on disk (verified with `ls -la`). On this Windows machine
(`core.ignorecase=true`), `git check-ignore` still finds and applies
its rules, because git and the filesystem here treat the name as
case-insensitive.

`npm`, however, does its own file listing when deciding what goes into
a published package, and it does **not** apply this fix. I verified
this directly:

```
npm notice Tarball Contents
...
npm notice 3.9kB dist/index.es.js
npm notice 3.9kB dist/index.js
...
```

`npm pack --dry-run` included the entire `dist/` folder, even though
`dist/` is listed in the ignore file (`dist/` on line 5) and `git
status` confirms git itself treats `dist/` as ignored (`!! dist/`).
npm's packing step is not reading `.gitIgnore` as an ignore file at
all, because it is looking for a file literally named `.gitignore` and
this one does not match by exact case.

`package.json` also has no `"files"` field, so there is nothing else
telling npm what should or should not be published — the only thing
controlling this today is whichever ignore-file lookup npm happens to
do.

## Why it matters
`package.json`'s `"main"` and `"module"` fields point at
`dist/index.js` and `dist/index.es.js`. Those files only exist after
running the build, and `dist/` is meant to be excluded from git.

Right now, because npm fails to read the misnamed ignore file, `dist/`
ends up in the published tarball anyway — so the package currently
works. But this is fragile, not designed: if anyone renames the file
to the correct `.gitignore` (a completely reasonable-looking cleanup,
and something a future contributor is very likely to do without
knowing why it matters), npm will start honoring the `dist/` exclusion
rule on the next publish, and the published package will be **missing
its own entry point files**. Every consumer's `import` of this package
would then fail, because `dist/index.js` would not exist in the
installed package.

## How to confirm
1. `ls -la` in the repo root and note the file is `.gitIgnore`, not
   `.gitignore`.
2. Run `npm run build` then `npm pack --dry-run` and see that
   `dist/index.js` and `dist/index.es.js` are included in the tarball
   contents, despite `dist/` being listed as an ignore rule.
3. Rename the file to `.gitignore` (exact lowercase) and re-run `npm
   pack --dry-run`. Confirm `dist/` disappears from the tarball
   listing.

## Suggested fix
Add an explicit `"files": ["dist"]` (or similar) entry to
`package.json` so publish contents are controlled directly and do not
depend on ignore-file name matching at all. Separately, rename
`.gitIgnore` to `.gitignore` for git's own sake, but only after the
`"files"` field is in place — otherwise the rename alone will break
the next publish exactly as described above.

## Risk of fixing
Low, but order matters: add the `"files"` field first, verify with
`npm pack --dry-run` that `dist/` is still included, and only then
rename the ignore file.

## Related
None yet (no specs exist in this repo).
