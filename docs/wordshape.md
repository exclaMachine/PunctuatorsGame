# Wordshape — draw the word with the word

Status: **SPECCED 2026-09-07.** **M1's drawing tool is BUILT (`wordshape-draw.html`, 2026-09-07) — the ten
targets are still to be drawn.** Milestones are §9; what M1 actually shipped is §11.

**The pitch:** you are given a word and a simple line drawing of that word's meaning. You draw the picture
using **only the letters of the word** — position and rotate `c`, `a` and `t` until they trace out a cat.
The game scores, live and as a percentage, how closely your letters lie along the drawing's lines.

This is a **calligram** — the shaped-text form of Apollinaire and George Herbert — but inverted. A calligram
sets a *text* into a shape; Wordshape gives you a shape and a tiny alphabet and makes fitting them together
the puzzle.

---

## 0. The reframe that makes it a game

The obvious framing — *trace this outline with letters* — is tedious vector-editor work. The framing the
whole design hangs on instead is:

> **Each letter is a brush, and the word is your brush set.**

`cat` hands you an arc (`c`), a bowl-with-a-stem (`a`) and a cross (`t`). Drawing a cat *with only those
three shapes* is the puzzle. Which brush goes where is the skill; the letter budget is the resource.

Two things fall out of it immediately:

- **A longer word is an easier word.** More letters means a bigger brush palette. So word length is *not*
  the difficulty axis it looks like — difficulty comes from the drawing's complexity and the letter budget.
  (§8 covers the rules that make long words hard again, when we want that.)
- **The unlock ladder should be capabilities, not cosmetics.** Free scaling, mirroring and new fonts each
  change what you can *draw*, so they're worth earning. Colour is the one cosmetic and it comes last.

---

## 1. Decisions settled with the dev (2026-09-07)

| # | Decision | |
|---|---|---|
| 1 | **Standalone bench first** — `wordshape.html`, self-contained, not folded into Inklings | The repo's proven path (IPA Scrabble → the Sound Board). `inklings.html` is already 748 KB; a fold-in is a later launcher-only change if the game earns it (§10). |
| 2 | **The dev draws the ten targets** | Faster and better than curating Quick, Draw! doodles, zero licensing question, and the targets can be *drawn to be drawable with letters* — which found art never is. Needs a dev tool (M1). |
| 3 | **Stamp gesture** — press to place, drag out before releasing to set the angle | One gesture per letter, touch-friendly, no tool modes. Existing letters can be grabbed and re-dragged. |
| 4 | **Fixed letter budget + a % threshold to pass** | The budget is what makes it a puzzle, and it's the only thing stopping a win-by-scribbling with 200 tiny letters. |
| 5 | **The guide is always visible in the MVP** | It's a placement puzzle, not a memory test. Hiding it is a **later difficulty mode** (§8), not a v1 rule. |
| 6 | **The score is live while you drag** | You feel a letter snap into place. It also teaches the scoring rule by showing it. Accepts that a player can wiggle to min-max. |
| 7 | **Coverage outweighs fidelity (F₂)** | Filling the drawing counts about twice what staying on the lines does. Rewards the bold placements that make calligrams *look* good, and stops a curvy letter on a straight line from feeling like a mistake. §3. |
| 8 | **MVP transforms: rotate + three discrete sizes** | One fixed size can make a target literally unwinnable — a cat's whiskers and its body need different scales. Free scaling is an unlock. |
| 9 | **No flips in the MVP** | A mirrored `c` is the single biggest power spike on the ladder — it doubles every curved letter. Reserved as a late unlock/powerup. |
| 10 | **Every letter of the word must be used at least once** | The one composition rule in v1. Keeps `fox` from being solved entirely in `o`. |
| 11 | **No fixed multiset** — one pool, spend it however you like | A dealt multiset (exactly 4·`c`, 4·`a`, 4·`t`) is a harder and arguably better puzzle, but it can dead-end a player. Revisit after the MVP. |
| 12 | **No placement-order rule** | Real calligrams run the text along the contour, spelling `c-a-t-c-a-t…`. Rejected for v1: *it should actually look like the animal*. Parked in §8 as a purist mode. |
| 13 | **Ten words, pickable from a menu** | A linear ladder is more game, but this is a bench first and free picking is easier to test against. |
| 14 | **Three-letter words** | Keeps the brush set small and the puzzle legible. §4. |
| 15 | **Name: Wordshape** | *Calligrampus* and *The Illuminator's Desk* stay in reserve — the latter is the natural Inklings bench name if it folds in. |
| 16 | **Saving and sharing your art is a first-class goal** | Community voting on favourites becomes a *second scoring axis* beside the algorithmic %. But the two have very different costs — §7. |

---

## 2. The play loop

1. Pick a word from the menu of ten. The target line art fades in as a faint ghost.
2. You're given a **letter budget** (§5) and the three letters of the word.
3. Select a letter (click it, or press its key). Press on the canvas to place, and **drag out before
   releasing to set the angle** — the letter pivots around the press point as you drag, its baseline
   pointing at the cursor. Release to commit. Size is picked from three buttons (or `1`/`2`/`3`) before
   placing.
4. The **percentage updates live** as you drag, so a letter visibly snaps into place when it finds a line.
5. Grab a placed letter to move it. Delete refunds it to the budget — always; a punishing undo makes
   experimentation expensive, and experimentation is the game.
6. When you're at or over the threshold **and** have used all three letters at least once, the round passes:
   the ghost guide brightens for a moment so you can see what you matched, and the artwork is offered for
   saving (§7).

There's no timer and no fail state. Running the budget to zero below threshold isn't a loss — you delete
something and try again.

---

## 3. The scoring — how the percentage works

This is the load-bearing technical piece, and it's ~40 lines of vanilla JS with no library.

### 3.1 The two numbers

One number can't describe the fit. Coverage alone lets you scribble everywhere; fidelity alone lets you
place one perfect `t` and stop. So:

- **Fidelity** *(precision)* — what fraction of **your ink** lies on the drawing's lines. *Is your ink on
  the lines?*
- **Coverage** *(recall)* — what fraction of **the drawing's lines** has your ink near it. *Did you draw the
  whole cat?*

**Score = F₂** — the weighted harmonic mean favouring coverage 2:1 (decision #7):

```
F_beta = (1 + b^2) * P * R / (b^2 * P + R)     with b = 2, P = fidelity, R = coverage
```

### 3.2 How they're computed

Everything is polyline-to-polyline: the targets are polylines (§4) and the glyphs are polylines (§6), so
there is no glyph rasterizing or outline-tracing anywhere.

**Precomputed once per target, on load:**

1. Rasterize the target's polylines into a boolean grid, `S = 256` square, one pixel wide.
2. Run a **two-pass chamfer distance transform** over it (3-4 or 5-7-11 weights) → `D[i]` = distance in grid
   pixels from cell `i` to the nearest target ink. Two linear passes, no queue, ~5 lines.
3. Sample the target polylines into points spaced ~2 px apart → `T`. Store `|T|`.

**Per placed letter:** transform the glyph's polylines by `(x, y, angle, scale)`, then **resample** the
transformed path at ~2 px spacing — resampling *after* the transform, not before, so a big letter
contributes proportionally more sample points than a small one and neither is over- or under-weighted.

**Fidelity** = mean over your sample points of `max(0, 1 - D[p] / TOL)`. A **soft falloff rather than a hard
threshold** on purpose: it makes the live number move continuously as you drag instead of snapping between
values, which is what makes decision #6 feel good.

**Coverage** = rasterize your ink into a second grid, distance-transform it the same way, then for each
target sample point take `max(0, 1 - D_player[t] / TOL)` and average. 256² with two passes is ~500k
operations — about a millisecond, fine at 60 fps. *(Optimization if it ever isn't: hold the coverage bitmask
for committed letters and test only the dragged letter's points against it, rebuilding the full transform
on commit. Not needed for the MVP.)*

**`TOL` is the difficulty knob.** Start at ~6 px on the 256 grid (≈2.3% of the canvas width) and tune it per
target if needed.

### 3.3 What the scorer gives us for free

- **The hint.** Target sample points with no ink within `TOL` are *exactly* the parts you've missed. Cluster
  them along the polyline and highlight the longest uncovered run: **"you've missed the tail."** No separate
  hint data, no authored hints.
- **A per-letter contribution.** Score the board with and without a given letter and the difference is what
  that letter is worth — usable for a "your best letter" flourish, or to grey out a letter that's doing
  nothing.
- **A debug overlay.** Rendering `D` as a heat map is the fastest way to see whether the scorer is honest,
  and it's three lines. Build it in M3 and keep it behind `?dev=1`.

### 3.4 Anti-degenerate-play, checked

- *Spam tiny letters along the lines?* The budget caps it (decision #4), and coverage is capped at 100% so
  extra ink on already-covered line buys nothing while still costing fidelity.
- *One giant letter?* Fidelity collapses.
- *Ignore the hard parts?* Coverage collapses, and it's the heavier of the two.
- *Wiggle to min-max each letter?* Possible and accepted (decision #6). It's slow and self-limiting, and the
  player who does it is learning the scorer, which is fine.

---

## 4. The ten words and their drawings

Chosen for **brush-shape coverage** — the three letters should span genuinely different strokes (a curve, a
straight, a cross, an arch, a descender) rather than just being a short common noun. Ordered by rough
difficulty; the menu shows all ten unlocked (decision #13).

| Word | Brush set | Why it works |
|---|---|---|
| `cup` | arc, u-bowl, descender-stem | The `u` *is* the cup. The best first level — the mapping is immediate. |
| `sun` | s-curve, two arches | `s` for curling rays, `u`/`n` for the disc. Very forgiving. |
| `cat` | arc, bowl+stem, cross | The canonical example. `c` ears, `a` body, `t` whiskers/legs. |
| `dog` | three rounds, one descender | All-curves palette for a round dog; `g`'s tail is a tail. |
| `owl` | circle, zigzag, straight | Best variety of the ten — `o` eyes, `w` wings and feet, `l` the branch. |
| `ant` | bowl, arch, cross | `n`'s arches are legs. Teaches "the letter is a shape, not a letter." |
| `pig` | bowl+descender, dot+stem, curl | `g` is the curly tail; `i`'s dot is an eye. |
| `bee` | ascender+bowl, two curls | Only two distinct shapes — the tightest palette here, so the hardest of the easy ones. |
| `fox` | hook, circle, crossed diagonals | `x` legs, `f` a tail hook. `x` is genuinely awkward, which is the point of rule #10. |
| `key` | diagonals, curl, descender | Mostly straight lines against a mostly straight object. |

The drawings are made **by the dev in the M1 tool**, and made *to be drawable* — the targets are tuned to
the brush sets, which is the whole reason for decision #2. Expect this table to move once the drawings
exist; if `bee` or `key` won't come out, swap them.

---

## 5. The letter budget

One pool, spent freely across the three letters (decision #11), with a floor of one of each (decision #10).

Set it **per target, by hand**, once the drawing exists — a number derived from the drawing's total stroke
length divided by the average glyph length, then rounded up generously and tuned by playing. Roughly 12–20
for these ten. Authored per target in the data file, not computed at runtime; a computed budget will be
wrong on exactly the targets that matter.

The HUD shows `letters left`, and greys out placement at zero. Deleting refunds.

---

## 6. The alphabet — glyphs as polylines

The letters must be **polylines, not font outlines**, or the whole comparison in §3.2 gets messy: a filled
glyph rendered from a normal font is a *shape with two edges*, and matching its outline against a
single-stroke drawing scores the letter's thickness as error.

Two routes, in order of preference:

**A. Hershey fonts** *(preferred, pending a licence check)* — A. V. Hershey's 1967 vector fonts for the US
National Bureau of Standards. Every glyph is literally a list of polylines, which is exactly the data
structure we need, and they come in **Roman Simplex / Duplex / Complex, Script, Gothic English / German /
Italian, Greek, Cyrillic**. That variety is the **font-unlock ladder for free — and mechanically meaningful,
not cosmetic**, because a Gothic `c` and a Script `c` are genuinely different brush shapes and change how a
target is best solved.

The data originates as a US government work and is generally treated as public domain, **but some
redistributions carry a "may not be sold" note added by later packagers**. Verify the terms on the specific
copy we pull before bundling it, and record provenance in the repo the way `sounds/CREDITS.md` and
`data/critter-credits.json` already do.

**B. Hand-drawn monoline alphabet** *(fallback, and possibly better)* — 26 lowercase glyphs drawn in the
same M1 tool used for the targets. It's an afternoon's work, sidesteps the licence question entirely, and
gives total control over the brush shapes — which matters, because the game is *about* those shapes. The
cost is that the font-unlock ladder then has to be drawn rather than downloaded.

Either way the MVP ships **one font, lowercase only**, as `data/wordshape-alphabet.json` — a few KB.

---

## 7. Saving, sharing, and the second score

The dev's addition: people should be able to keep and share their art, and vote on each other's favourites —
a **community score sitting beside the algorithmic one**. The %-score measures accuracy; a vote measures
whether it actually looks good, which is the thing the scorer can't see.

These have very different costs, so they are two separate phases.

### 7.1 Sharing — no backend needed (M6)

A finished piece is just `word + [(letter, x, y, angle, size), …]`. At 10 bits each for `x`/`y`, 9 for the
angle and 2 for the size, that's ~5 bytes per letter — a 20-letter piece packs into ~134 base64url
characters. So:

- **A share code**, `WS1:…`, pasteable and short enough for a URL hash. The repo already does exactly this
  with Mujicians' `MJ2:` song codes, so it's a known pattern here.
- Opening a link with a code **renders the piece and its score**, read-only.
- **PNG export** via `canvas.toDataURL` for actually posting it anywhere.
- A local **gallery** of your own saved pieces in `localStorage`.

All of that is static-site-safe and ships with no infrastructure.

### 7.2 Voting — the one thing that breaks the repo's rules (deferred)

**Flagging this honestly:** this site is flat static hosting on GitHub Pages with a documented no-runtime-API
rule. A gallery that lets strangers see and vote on each other's work needs shared, writable, persistent
state — a backend. There is no way around that; a share code can carry the art *to* a person but can't
count what anyone thought of it.

Three ways it could go, cheapest first:

1. **A GitHub-hosted gallery.** Players post their `WS1:` code as a comment on a pinned GitHub issue or
   Discussion; a page fetches them via the public GitHub API and renders them, with 👍 reactions as the vote.
   Zero infrastructure to run, uses an account most players won't have. Cheeky, but genuinely works.
2. **A curated gallery.** Players send codes however; the dev picks favourites and commits them to a JSON in
   the repo. No voting, but no backend either, and the curation *is* a kind of endorsement.
3. **A real backend.** A tiny serverless store. The honest answer if the gallery matters, and a deliberate
   departure from the repo's architecture that should be its own decision, not a side effect of this game.

**Recommendation:** ship §7.1 in M6, treat §7.2 as a separate project, and default to option 2 until the
game has enough players to justify anything more.

---

## 8. The unlock ladder

Everything below is **post-MVP** (M7). The ordering is by power, and it's a *capability* ladder — each rung
changes what you can draw, so it's worth earning. Colour is the only cosmetic and it's deliberately last.

1. **Free scale** — replaces the three discrete sizes with continuous sizing.
2. **New fonts** — Script, Gothic, Complex. Different brush shapes, so a solved target can be re-solved
   differently. The strongest rung, and the reason §6's route A is attractive.
3. **Mirroring** — flipped glyphs (decision #9). The biggest single power spike; hold it back.
4. **Non-uniform stretch** — squash and stretch a glyph. Very powerful, arguably too much; gate it hard or
   cut it.
5. **Colour palettes** — cosmetic, and the right reward for the sharing layer since it's what makes a piece
   worth showing.

Difficulty modes, which are the *inverse* of unlocks and where the rejected ideas live:

- **Peek mode** — the guide hides once you place your first letter; peeking costs score. (The dev liked this
  as a later difficulty rather than a v1 rule — decision #5.)
- **Purist mode** — placements must cycle `c-a-t-c-a-t…`, the authentic calligram constraint (decision #12).
- **Dealt multiset** — a fixed count of each letter rather than a free pool (decision #11).
- **Longer words** — remember §0: more letters is a *bigger palette*. Long words are only harder in
  combination with a tighter budget, a more complex drawing, or purist mode.

---

## 9. Build order

Each milestone is independently checkable. Nothing here is a big-bang.

| M | What | Ships |
|---|---|---|
| **M1** | **The drawing tool + the ten targets.** **Tool BUILT 2026-09-07 (§11); the ten drawings are the dev's to make** → `data/wordshape-targets.json`. | Nothing playable. A tool, then a data file. |
| **M2** | **The alphabet.** §6 route A or B → `data/wordshape-alphabet.json`, lowercase monoline polylines, plus a preview page rendering all 26 at game size. | The brush set exists. |
| **M3** | **The scorer, headless.** Chamfer DT, resampling, fidelity/coverage/F₂, the uncovered-run hint. Verified with a `?dev=1` heat-map overlay and a few hand-placed letters. | The percentage is real and honest. |
| **M4** | **The bench — the playable MVP.** `wordshape.html`: the ten-word menu, the stamp gesture, three sizes, the budget, the live %, the use-every-letter gate, the pass threshold, the hint button. | **This is the MVP.** |
| **M5** | **Feel.** Placement/snap/pass cues on the repo's existing procedural `_tone`/`_noise` kit (no audio assets), the settle animation on placement, the guide-brightens reveal on a pass. | It feels like a game. |
| **M6** | **Save & share.** `WS1:` codes, URL-hash import, PNG export, a local gallery. §7.1. | Art leaves the machine. |
| **M7** | **Progression & unlocks.** §8's ladder, a save, peek mode. | It has a spine. |
| *later* | **The gallery & voting.** §7.2 — its own decision, not a milestone here. | |
| *later* | **The Inklings fold-in.** §10. | |

---

## 10. If it folds into Inklings later

Not a decision to make now (decision #1), but worth recording so the MVP doesn't foreclose it.

The natural home is **the Illuminator's Desk** — a bench in the Library, beside the existing desk and
lectern. Illuminated manuscripts are literally what this game does, so the theme is exact rather than
convenient. The fit is unusually clean because three Inklings systems already exist and would each do a job:

- **The Word Hoard** supplies the words — you illuminate a noun you've actually collected, so the game's
  content grows from play instead of a fixed list of ten.
- **Ink** is the cost, exactly like the Sound Board's Trade.
- **Object placement** takes the output — a finished calligram becomes **placeable décor**, a framed picture
  you hang in the Wordhoard or the cozy square. That's a genuinely good sink for the art, and it's the one
  reward the standalone version can't offer.

Constraints that fall out, which the MVP should respect for free: targets are keyed by word (so a
Hoard-driven version just needs more drawings), and the artwork format in §7.1 is compact enough to sit in
Inklings' save without bloating it.

---

## 11. M1 as built — `wordshape-draw.html` (2026-09-07)

A standalone dev tool at the repo root, vanilla and single-file like everything else here, styled to match
`emoji-pixelizer.html`. It is not linked from anywhere and ships no game code.

### 11.1 The output contract

This is the part M3 and M4 depend on, so it is fixed here rather than discovered later:

```json
{ "v": 1, "targets": [ { "word": "cat", "budget": 16, "threshold": 0.7,
                         "len": 3.42, "strokes": [ [[x,y],[x,y], …], … ] } ] }
```

- **Coordinates are normalised into the [0,1] square, aspect preserved, centred, with a `MARGIN` of 0.06** —
  the longer side fills `1 − 2·MARGIN` and the shorter is centred against it. Never stretched to fill, or a
  cat would export the wrong shape. *(Verified: 2:1 stays 2:1, both axes centre, every point lands inside
  [0,1], and a degenerate single-point stroke doesn't divide by zero.)*
- **`threshold` exports as a 0–1 fraction** while the UI edits whole percents; import accepts either.
- **`len`** is total normalised polyline length, carried so M3/M4 can sanity-check a target without
  re-walking it.
- Targets with no strokes or no word are **skipped on export**, and the message says how many.

### 11.2 What it does

- **Three tools** — freehand drag, click-to-place polyline (rubber-banded, finished with `Enter`,
  double-click or right-click), and click-a-stroke-to-delete erase with hover highlight.
- **Freehand is simplified on release** by Ramer–Douglas–Peucker at a tunable epsilon, after raw
  `pointermove` has already been decimated at 1.5 px. Both are needed: raw pointer data is hundreds of noisy
  points per stroke, and shipping it would bloat the data file for no visible gain.
- **A reference image** can be dropped or pasted and is drawn faint behind the canvas for tracing. It is
  **held in memory only** — never exported, never autosaved — because a base64 photo would blow the
  `localStorage` budget that the strokes actually need. Losing it to a refresh is cheap; losing an hour of
  drawing is not.
- **Autosave** to `localStorage` on every change, seeded on first run with §4's ten words already queued.
- Grid, snap, undo/redo, per-target word/budget/threshold fields, JSON download / clipboard / import, and
  drag-drop of either an image or a `.json` anywhere on the page.

### 11.3 The two features that exist to de-risk M4

M1's real hazard is that **a target drawn without the brush set in mind can be unwinnable, and nothing would
reveal that until M4**. Two readouts push that discovery earlier:

- **A suggested budget**, from total ink length ÷ average glyph length × 1.35 slack, flagged in red past 30 —
  a target needing more letters than that is too detailed to trace by hand. **The glyph length is a guess
  until M2** (the alphabet doesn't exist yet), so it's exposed as a slider and labelled as such in the UI;
  re-tune it once the glyphs are real.
- **A play-size preview** rendering the *normalised* result at 200 px — which both validates the export
  framing visually and catches fine detail that reads at 640 px and vanishes at play size.

Neither is a substitute for actually placing letters. The letter-fit check can't exist before M2.

### 11.4 One thing not to re-break

`snapshot()` must be called **before** a mutation, never after. History holds the state to go *back to*, so
snapshotting after the fact stores the change itself and the first undo becomes a silent no-op. This was
written the wrong way round first and caught before shipping; `changed()` deliberately does not touch
history so that every mutation site has to say so explicitly.

---

## 12. Open questions

- **The Hershey licence** (§6). Settle it in M2; route B is the answer if it's murky.
- **`TOL` and the thresholds** are guesses until M4 is playable. Expect all three to move.
- **Does the score need to be hidden until commit?** Decision #6 says live, but if wiggle-optimizing turns
  out to dominate play it's a one-line change.
- **Are ten drawings enough** to tell whether the game is good? Possibly not — but it's enough to tell
  whether the *scorer* is good, which is what the MVP is really testing.
