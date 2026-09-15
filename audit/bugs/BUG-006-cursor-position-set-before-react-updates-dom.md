---
# BUG-006: Cursor position is set before React has applied the new text to the DOM

**Category:** Bug
**Severity:** Medium
**Confidence:** Likely. The mechanism was reproduced in jsdom (a spec-compliant DOM, not a browser) for the original code and for the controlled-mode gaps left after BUG-002. It has not been reproduced in a real browser.
**Effort:** Small
**Status:** Fixed (unverified in browser)

## Where
`src/MarkdownEditor.tsx`, `formatText` function, lines 59-65.

## What
```ts
const newText = `${text.slice(0, selectionStart)}${formattedText}${text.slice(selectionEnd)}`;
setText(newText);
handleChange(newText);

const newCursorPos = selectionStart + formattedText.length;
textarea.setSelectionRange(newCursorPos, newCursorPos);
```

`setText(newText)` only schedules a React state update; it does not
change the textarea's DOM value immediately. `textarea.setSelectionRange`
runs right after, while the DOM element's `.value` is still the *old*
text. Browsers clamp `setSelectionRange` positions to the current
value's length, so if `newCursorPos` is larger than the old text's
length, the browser will clamp it to a different position than
intended. Then React re-renders moments later and sets `.value` to the
new (longer) text.

## Why it matters
If this plays out the way the order of operations suggests, the
cursor can land in the wrong place after clicking a toolbar button
(for example, snapping to the end of the old text instead of right
after the newly inserted markers), which would be a small but
noticeable annoyance every time the toolbar is used.

## How to confirm
This needs to be checked in an actual browser, since it depends on
timing between React's state commit and the DOM update, which cannot
be confirmed by reading the source alone. Steps: type a sentence,
select a word in the middle, click Bold, and check exactly where the
text cursor ends up. Repeat with a few different selection positions
(start, middle, end of the text).

## Suggested fix
Move the `setSelectionRange` call into a `useEffect` (or
`requestAnimationFrame`/`queueMicrotask`) that runs after the state
update has been committed and the textarea's value has actually
changed, instead of calling it synchronously right after `setText`.

## Risk of fixing
Low. This is a timing change local to `formatText` and does not affect
the public API.

## Related
None yet (no specs exist in this repo).

## Resolution
**Date:** 2026-09-15

**The code quoted above no longer exists.** BUG-002 (commit `d310547`) had
already replaced the synchronous `setSelectionRange` with a `pendingSelection`
ref, restored by a `useEffect` keyed on `displayValue`. The line numbers above
predate BUG-002 to BUG-005.

**What the original code actually did.** Under the HTML spec, assigning a
textarea's `value` moves the caret to the end of the new text. React makes that
assignment when it commits the new text, after `formatText` has returned. So the
early `setSelectionRange` was clamped, as described above, and then overwritten.
The caret ended up at the end of the whole text after every format, not only
when the clamp applied. In jsdom, the `5f6e093` version behaved exactly this way
on both React 19.0.0 and 18.3.1. Bold on "quick" in "The quick brown fox" left
the caret at 23 instead of 13. Formatting at the very end of the text only
looked right because the end was the correct spot.

**What was still wrong after BUG-002.** The deferred restore was correct for
uncontrolled mode and for a parent that passes the value straight back. Two
gaps remained. Both follow from the source, and both reproduced in jsdom:
- *The parent ignores the value.* `displayValue` never changes, so the effect
  never runs and the pending position stays set. It then fires on the next
  unrelated text change. After the parent rejected a format, typing one
  character moved the caret to where the formatted text's closing marker would
  have been (13 instead of 4).
- *The parent rewrites the value* (for example with `trimStart`).
  `displayValue` changes, but not to the formatted text. The stale offset was
  still applied, putting the caret at 15 in text whose closing marker ends at 13.

A third point depends on timing and was not observed. `useEffect` runs after
React's value write, so there is always a moment when the caret sits at the end
of the text. React 18/19 flush passive effects before yielding to the browser
when the update came from a click (react-dom 19 source:
`0 !== (pendingPassiveEffectsLanes & 3) && flushPassiveEffects()`). So for
uncontrolled mode and echoing parents, that moment should never be painted. A
parent that applies the value asynchronously (in a `setTimeout`, a transition,
or an external store) gets a scheduled effect instead, and a paint can happen in
between. Whether that shows as a visible caret jump depends on the browser and
on whether the textarea keeps focus after the button click. That has not been
checked.

**What changed** (`src/MarkdownEditor.tsx`):
- The restore now runs in a layout effect (`useIsomorphicLayoutEffect`, see
  below), still keyed on `displayValue`.
- The pending ref, renamed `pendingCursor`, stores the text the format produced
  as well as the caret position. The effect clears the ref the first time
  `displayValue` changes. It places the caret only if `textarea.value` is
  exactly that text. The check reads the DOM value rather than the prop,
  because the DOM value is what `setSelectionRange` is clamped against.
- `formatText` clears any older pending cursor at the start of every click. A
  format whose text never arrived can no longer move the caret later.
- The BUG-004 guard still returns before any pending cursor is recorded. The
  older one has already been cleared, so a skipped format leaves the user's
  selection exactly as it was.
- Cursor behaviour is unchanged. The caret still collapses to a single point
  just after the inserted text (see the recommendation below).

**Files changed:** `src/MarkdownEditor.tsx`

**Hook choice: `useLayoutEffect`.** `setTimeout` and `requestAnimationFrame`
run after paint, so the caret would visibly sit at the end for a frame. They
would also race a parent that applies the value late. `useEffect` is only
guaranteed to run before paint for click-priority updates. A layout effect runs
synchronously in the same commit that writes the value, at any update priority,
so the caret is placed before the browser can paint.

React 18's server renderer logs "useLayoutEffect does nothing on the server".
The message is present in react-dom 18.3.1's server builds and absent from
19.0.0's. This package targets Next.js, so a module-level
`useIsomorphicLayoutEffect` falls back to `useEffect` when `window` is
undefined. Effects never run on the server, so the fallback changes no
behaviour.

**Controlled mode.**

| Parent behaviour | Result |
|---|---|
| Passes `value` straight back from `handleChange` | Same commit; caret placed after the inserted text |
| Applies it later (async) | Re-renders that still carry the old text don't change `displayValue`, so they don't consume the pending cursor. The caret is placed in the commit that delivers the text |
| Ignores it | Nothing happens; the selection is untouched. The pending cursor is dropped, unused, on the next text change or toolbar click |
| Rewrites it | The textarea doesn't hold the formatted text, so the caret is not placed. It stays where the browser put it when React wrote the value (the end) |

**Verification.** No test framework exists (DX-001), so nothing was added to
the repo.

A scratch harness rendered the component with `react-dom/client` in jsdom. It
used React's real scheduler, without `act()`, on both React 19.0.0 and 18.3.1.
It ran three versions of the file: the original (`5f6e093`), the code just
before this fix, and the fixed code. A layout effect in the parent recorded the
caret during the same commit, before any paint could happen.

jsdom follows the spec on both behaviours involved: a probe confirmed that a
`value` write moves the caret to the end and that `setSelectionRange` is clamped
to the text length. Results were identical on React 18 and 19.

| Scenario (expected) | Original | Before fix | After fix |
|---|---|---|---|
| Bold "quick" mid-sentence (13) | 23 | 13, but 23 at commit | 13 at commit |
| Bold "fox" at the very end (23) | 23 | 23 | 23 |
| List over two middle lines (27) | 31 | 27, but 31 at commit | 27 at commit |
| List over all of `a\nb\nc` (11) | 11 | 11 | 11 |
| maxLength skip, uncontrolled and controlled (selection stays [6,11]) | n/a | [6,11] | [6,11] |
| Controlled echo: mid, end, list | n/a | correct final | correct at commit |
| Controlled, parent applies in `setTimeout` (13) | n/a | 13 | 13 at the delivering commit |
| Controlled, parent ignores (selection stays [4,9]) | n/a | [4,9] | [4,9] |
| Parent rejects the format, then user types "X" at 3 (4) | n/a | **13** | 4 |
| Parent rewrites with `trimStart` (not placed) | n/a | **15** | 23 (browser default) |

`renderToString` with React 18.3.1 and no DOM logged no `console.error` for the
fixed file. As a control, swapping the helper for a plain `useLayoutEffect`
logged the warning. `tsc --noEmit -p .` reports no errors in `src/`; the 20 it
reports are in `node_modules` type packages, as noted in BUG-004.

**What still needs a real browser.** jsdom has no painting and no realistic
focus handling. None of these is confirmed yet:
- whether the original or post-BUG-002 code ever produced a visible caret jump
- whether this fix removes it
- where the caret appears once focus returns to the textarea after a toolbar
  click (in most browsers a button click moves focus to the button)

**Manual test script.** This setup has not been run.
1. Next to this repo, run `npm create vite@latest mde-check -- --template react-ts`,
   then `cd mde-check` and `npm install`. In `vite.config.ts`, add
   `resolve: { dedupe: ['react', 'react-dom'] }` and
   `server: { fs: { allow: ['..'] } }`. Replace `src/App.tsx` with:
   ```tsx
   import { useState } from 'react';
   import MarkdownEditor from '../../markdown-editor-rj/src/MarkdownEditor';
   const S = 'The quick brown fox';
   export default function App() {
     const [echo, setEcho] = useState(S);
     const [noStars, setNoStars] = useState(S);
     const [trimmed, setTrimmed] = useState('  ' + S);
     return (<>
       <p>0 uncontrolled</p><MarkdownEditor handleChange={() => {}} />
       <p>1 echo</p><MarkdownEditor value={echo} handleChange={setEcho} />
       <p>2 rejects *</p><MarkdownEditor value={noStars} handleChange={(v) => { if (!v.includes('*')) setNoStars(v); }} />
       <p>3 trimStart</p><MarkdownEditor value={trimmed} handleChange={(v) => setTrimmed(v.trimStart())} />
       <p>4 maxLength 12</p><MarkdownEditor handleChange={() => {}} maxLength={12} />
     </>);
   }
   ```
   Run `npm run dev` and open the page. In the DevTools console, define
   `sel = i => { const t = document.querySelectorAll('textarea')[i]; return [t.selectionStart, t.selectionEnd, t.value]; }`.
   Select with the keyboard (Shift+arrows), not by double-clicking: on Windows,
   double-click also selects the trailing space. The buttons are, in order,
   Bold, Italic, Strikethrough, List; the icons may not render (BUG-011).
2. **Mid-sentence.** In editor 0, type `The quick brown fox`. Click just before
   `q` and press Shift+→ five times. Click Bold. Expect `sel(0)` →
   `[13, 13, "The **quick** brown fox"]`. Press Tab four times to return to the
   textarea and type `Z`. It should appear right after the closing `**`.
3. **End of text.** Reload. In editor 0, type the same text, click after `fox`,
   press Shift+← three times, and click Bold. Expect `[23, 23, …]`. Tab back
   and type `Z`: expect `**fox**Z`.
4. **List.** Reload. In editor 0, type `intro⏎line one⏎line two⏎end`. Click
   before `line one`, then press Shift+↓ and Shift+End. Click List. Expect
   `sel(0)` → `[27, 27, "intro\n- line one\n- line two\nend"]`. Tab back and
   type `Z`: expect `- line twoZ`.
5. **Controlled echo.** In editor 1, repeat step 2. Expect `sel(1)` → `[13, 13, …]`.
6. **Parent ignores the format.** In editor 2, select `quick` and click Bold.
   Expect the text unchanged and `sel(2)` → `[4, 9, …]`. Then click right after
   `The` and type `X`. The caret should stay right after the `X` (`sel(2)` →
   `[4, 4, …]`) and must not jump to 13.
7. **Parent rewrites.** In editor 3 (the text starts with two spaces), select
   `quick` and click Bold. Expect the text `The **quick** brown fox` and
   `sel(3)` → `[23, 23, …]`, not 15.
8. **maxLength skip.** In editor 4, type `hello world`, select `world`, and
   click Bold. Expect the text unchanged and `sel(4)` → `[6, 11, …]`.
9. **Flicker (optional).** Safari on macOS does not move focus to a button on
   click, so the caret stays visible. Repeat steps 2 and 5 and watch that the
   caret never flashes at the end of the text.
10. **See the old behaviour.** Run `git worktree add ../mde-orig 5f6e093` and
    point the import at `../../mde-orig/src/MarkdownEditor`. Step 2 should now
    give `[23, 23, …]`, which is the original bug. With a worktree at `d310547`
    instead, step 6 should jump to 13. Remove it afterwards with
    `git worktree remove ../mde-orig`.

**Recommendation, not implemented: re-select instead of collapsing.** With a
collapsed caret, a second click on the same button doesn't undo the first.
`toggleFormatting` only unwraps when the selection includes the markers, so
Bold, Bold on "quick" gives `The **quick****** brown fox`. Re-selecting the
whole formatted text, markers included, would make the second click unwrap it,
as most editors do. That is a small change to what `pendingCursor` stores (a
start as well as an end) and is independent of this timing fix. IMP-001 (caret
between empty markers) would be a similar change to the recorded position.

**Noticed in `formatText`, not fixed:**
- The toolbar ignores `disabled` and `readOnly`. The buttons aren't disabled
  and `formatText` has no guard, so Bold edits a read-only or disabled editor
  and calls `handleChange`.
- A selection that is only a lone `_` or `~`, or exactly `**`, gets deleted by
  Italic, Strikethrough, or Bold. `startsWith` and `endsWith` match the same
  characters, so the selection counts as already formatted and is unwrapped to
  an empty string.
- List is not a toggle: a second click gives `- - a`. It also prefixes at the
  selection start rather than the line start, so selecting `bar` in `foo bar`
  gives `foo - bar`.
- Selection offsets come from the DOM, which normalises line breaks to `\n`,
  but slicing uses `displayValue`. A controlled `value` containing `\r\n` would
  be formatted at shifted offsets. The new text check then declines to place
  the caret. This case is untested.

**Version bump needed:** Patch. It is a behavior fix with no API change.
