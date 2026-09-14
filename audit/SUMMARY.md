# Audit Summary

## Overall health

The actual React component logic here is small and mostly easy to
follow — it is a ~100-line file with one job (wrap selected text in
Markdown markers). The bugs found inside that logic are real but minor
(a `maxLength` bypass, a possible cursor-position glitch, missing
accessible labels).

The bigger problems are all in how this package is packaged and
shipped, not in the formatting logic itself. Three separate issues
combine to mean the toolbar icons likely do not render at all for a
real consumer today (BUG-011), and a global CSS reset means installing
this package can visibly break the rest of the host page's layout
(BUG-007). On top of that, the only thing currently keeping `npm
publish` from shipping a broken package (missing its own entry-point
files) is a filename typo that happens to work by accident on this
machine but would not survive someone "fixing" it (BUG-008). None of
these would show up from just reading the component's formatting logic
— they only became visible by actually running the build and checking
what gets published, which is what this audit did.

There are no tests, no CI, and no lint/format tooling, so none of this
would currently be caught automatically before a publish.

No security findings were filed. This package has no server code, no
use of `dangerouslySetInnerHTML` or `eval`, no network calls, and does
not render arbitrary HTML from user input — it is a controlled-ish
textarea that only ever inserts plain text markers. There was nothing
here to find.

## Counts

**By category**

| Category | Count |
|---|---|
| Bug | 11 |
| Improvement | 1 |
| Security | 0 |
| Performance | 1 |
| Tech Debt | 2 |
| DX | 5 |
| **Total** | **20** |

**By severity**

| Severity | Count |
|---|---|
| Critical | 3 |
| High | 4 |
| Medium | 5 |
| Low | 8 |

## Top 5 to fix first

1. **BUG-011 — Toolbar icons don't load for real consumers.** The
   icon font's `@import` is never resolved by the build, so the
   toolbar's whole reason for existing (clickable formatting buttons)
   is likely invisible out of the box. This is the core feature.
2. **BUG-007 — global.css resets the entire host page.** Every app
   that installs this package risks a broken layout the moment it's
   imported, not just around the editor. High chance of "your package
   broke my site" reports.
3. **BUG-008 — One accidental filename fix away from a fully broken
   publish.** The `.gitIgnore` typo is the only reason `dist/` still
   ships today. Fixing the typo without also adding a `"files"` field
   first will silently ship a package with no working entry point.
4. **BUG-001 — Hardcoded `id="editor"` breaks any page with more than
   one editor.** A very plausible real-world layout (two comment boxes,
   an edit form with two fields) will misdirect toolbar clicks to the
   wrong textarea.
5. **BUG-010 — `react`/`react-dom` listed as direct dependencies, not
   just peer deps.** Risk of "Invalid hook call" errors for consumers
   through no fault of their own code.

Close behind: BUG-009 (no working TypeScript types ship today) and
BUG-002 (no way to set/reset the editor's text from the parent) — both
undercut the package for a large share of its likely users.

## Patterns seen repeatedly

- **Config that was never verified against a real build.** The
  gitignore casing, the missing `"files"`/`"types"` fields, and the
  unresolved CSS `@import` are four different bugs with the same root
  cause: nobody had run `npm run build` + `npm pack --dry-run` and
  checked what actually ends up in the tarball. All four were only
  found by doing exactly that during this audit.
- **Built and tested against a single, isolated usage.** The hardcoded
  DOM id and the unscoped global CSS both assume there is only ever one
  editor on one otherwise-empty page — which matches the README's own
  example, but not realistic usage.
- **Types, docs, and runtime defaults drifting apart.** `Props` marks
  some fields required while the code and the README treat them as
  optional (BUG-003); the declared license has no matching file
  (DX-003); the README's Installation section never shows the install
  command (DX-005). None individually severe, but the same "written
  once, never re-checked against the others" pattern each time.

## Things I could not fully verify

- **BUG-006** (cursor position after formatting) depends on the exact
  timing between React's state commit and the DOM update. That can
  only be confirmed by clicking through the toolbar in an actual
  browser, which this audit could not do. I marked its confidence as
  "Needs checking" and described exactly how to test it.

## Areas deliberately skipped

- **`package-lock.json` contents.** I confirmed the direct-dependency
  placement problems visible in `package.json` (BUG-010, DEBT-002),
  but did not do a full transitive-dependency or `npm audit`
  vulnerability scan — that is a scan of external registry data, not
  this codebase's own code, and felt out of scope for a code audit.
  Happy to run one separately if wanted. Note also that
  `package-lock.json` already had a large pending uncommitted diff at
  the start of this audit (unrelated to anything above); I left it
  untouched.
- **Security folder.** Created, then removed — there was nothing to
  file. Noted above under "Overall health" rather than left as a silent
  empty folder.
