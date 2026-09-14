# Audit Index

ID | Category | Severity | Title | File(s) | Status
---|---|---|---|---|---
BUG-001 | Bug | High | Hardcoded textarea id breaks any page with more than one editor | src/MarkdownEditor.tsx | Open
BUG-002 | Bug | High | Editor has no way to receive or reset its text from outside | src/MarkdownEditor.tsx | Open
BUG-003 | Bug | Medium | `rows`/`maxLength`/`placeholder` required in types but README omits them | src/MarkdownEditor.tsx, README.md | Open
BUG-004 | Bug | Low | Toolbar formatting can push text past `maxLength` | src/MarkdownEditor.tsx | Open
BUG-005 | Bug | Medium | Toolbar buttons have no accessible name | src/MarkdownEditor.tsx | Open
BUG-006 | Bug | Medium | Cursor position set before React updates the DOM | src/MarkdownEditor.tsx | Open
IMP-001 | Improvement | Low | No cursor placement for empty-selection formatting | src/MarkdownEditor.tsx | Open
DEBT-001 | Tech Debt | Low | Repeated toggle-marker logic and inconsistent formatting | src/MarkdownEditor.tsx | Open
BUG-007 | Bug | Critical | global.css resets and restyles the entire host page, not just the editor | src/global.css | Open
BUG-008 | Bug | Critical | Misnamed .gitIgnore means only an accident keeps npm publishes working | .gitIgnore, package.json | Open
BUG-009 | Bug | High | Published package has no working TypeScript types for consumers | package.json, dist/ (build output) | Open
BUG-010 | Bug | High | react/react-dom listed as regular dependencies, not just peer deps | package.json | Open
DEBT-002 | Tech Debt | Low | Build-only @rollup/plugin-url listed as a runtime dependency | package.json | Open
BUG-011 | Bug | Critical | Toolbar icons will not load for consumers — icon font @import unresolved | src/global.css, rollup.config.mjs | Open
PERF-001 | Performance | Low | Full icon font pulled in to show 4 icons | src/global.css, package.json | Open
DX-001 | DX | Medium | No automated tests exist | (whole repo) | Open
DX-002 | DX | Medium | No CI pipeline | (whole repo) | Open
DX-003 | DX | Low | License declared but LICENSE file missing | package.json | Open
DX-004 | DX | Low | No lint or format tooling configured | (whole repo) | Open
DX-005 | DX | Low | README Installation section has no install command | README.md | Open
