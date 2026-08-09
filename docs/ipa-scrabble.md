# IPA Scrabble — Inklings word game (MVP, dev-only)

A Scrabble-style word game where you **spell by sound, not letters**. The tiles are **IPA phonemes**;
a play is valid when the phoneme sequence you lay matches **some real word's pronunciation**. So
`/t u/` is valid (two·too·to) and homophones collapse into one entry — the whole charm of the mode.

**Status:** **BUILT 2026-08-08** — standalone `ipa-scrabble.html`, launched from Inklings' DEV badge.
Shipped as a **rack word-builder MVP**, then upgraded the same day to a **full 15×15 board game** with
**play-off-others** (below). Not yet integrated into `inklings.html` proper.

## Design decisions (settled with the dev)
- **Spell by sound.** Validity = the laid phoneme string is a real word's IPA (not a spelling). Homophones
  are one word. This is what distinguishes it from letter Scrabble and ties it to the game's IPA layer.
- **Full 15×15 board with play-off-others** (BUILT 2026-08-08, dev-stated). Real Scrabble/WWF:
  - **Full cross-word rule** — a play forms a main line **plus every perpendicular cross-run** it
    touches, and **each run must be a valid pronunciation** (2-phoneme words like `/t u/`, `/b i/`, `/aɪ/`
    are the grease). Standard placement rules: single line, no gaps, first word crosses the ★ center,
    later plays must connect to a word already on the board.
  - **Full premium squares** — standard-layout DL/TL/DW/TW (verified TW 8 / DW 16 / TL 12 / DL 24, 180°
    symmetric), letter/word multipliers applied only to tiles newly placed this turn, center = double-word,
    **BINGO +50** for using all 7. (The rack-only builder was the first MVP cut; the board subsumes it.)
- **Solo score-attack.** No opponent; you play off your own words. Empty the bag / chase a high score.
- **Standalone dev file first.** `ipa-scrabble.html` at repo root keeps the giant `inklings.html`
  untouched and easy to iterate; a DEV-only launcher badge in Inklings opens it. Folding it into an
  in-game room is a later step.

## How it works
- **Data:** fetches `data/ipa-pronunciations.json` (`word → space-separated IPA`, **49,947 entries**,
  39-phoneme English inventory; affricates `tʃ dʒ` and diphthongs `eɪ oʊ aɪ aʊ ɔɪ` are single atomic
  tiles). Built offline by **`build-ipa-pronunciations.js`** from the **full CMU dict**
  (`text-to-ipa-master/lib/ipadict.txt`, ~133k prons) **filtered to `enable1.txt`** (the Scrabble word
  list), symbols converted to the IPA-fan-game convention. **This replaced `IPA-fan-game/ipa_words.js`**,
  which was a curated vocabulary list with **no ≤3-letter words at all** (had `napped` but not `nap`,
  `pin`, `tin`, `cat`, `the`, `two`…) — fatal for a board game whose glue is short words. Fetching JSON,
  the page **must be served over http** (Live Server), not `file://` — a fallback panel says so, and to
  run the builder if the file is missing.
- **Lexicon:** every pronunciation string → a `VALID` Set; `PRON_WORDS` maps each pronunciation to its
  **shortest example spelling** (for display).
- **Tile economy is data-driven** (derived at load from real phoneme frequency, not hardcoded):
  - **Point values** by rarity (`valueForPct`): ≥4%→1, ≥2%→2, ≥1.2%→3, ≥0.8%→4, ≥0.5%→5, ≥0.2%→8, else
    10. So `ə/n/t/ɪ`=1 … `ɔɪ/ð/ʒ`=10, a Scrabble-like spread.
  - **Bag distribution** proportional to frequency, scaled to `BAG_TARGET≈100` tiles (min 1 each).
- **Board model & turn evaluation** (`evaluateTurn`): tiles you drop this turn live in a `pending` map
  (immovable committed tiles live in `board`); `cellTile(r,c)` reads pending-over-board so runs see the
  merged state. `runAt(r,c,dr,dc)` returns the maximal contiguous run through a cell in one axis; the main
  word is the run along the placement axis and cross-words are the perpendicular run through each placed
  tile. It enforces single-line + no-gaps + center-on-first-move / connect-on-later-moves, validates every
  run against `VALID`, and scores via `scoreCells` (letter/word premiums count only for `isNew` tiles). A
  **live status** under the board previews each run (green valid `/pron/ word +pts`, red ✗) and the turn
  total, and **✓ Play** is disabled until every run is a real word.
- **Placement UX** (click-to-place, matching the bench convention): click a rack tile to hold it (gold
  highlight), click an empty board cell to drop it, click a pending tile to pick it back up. Vowels tinted.
  Also a **keyboard caret** for fast entry — see the "Keyboard caret placement" section below.
- **Aids:** **↩ Recall** (return all pending to rack), **⇄ Shuffle** (reorder rack), **♻ Trade rack** (dump
  rack to bag, redraw — no penalty), **💡 Rack idea** (brute-forces the rack for one spellable pronunciation
  as a nudge — placement still up to you), **✦ New game**. Game ends when bag and rack are both empty.

## Keyboard caret placement (BUILT 2026-08-09)

Goal: lay a whole word in a few keystrokes instead of alternating click-tile / click-cell. Model chosen =
a **board caret** (the text-cursor pattern real Scrabble apps like Woogles use). **Click-to-place stays
fully intact** — the keyboard layer is additive and shares the same `pending` map + `evaluateTurn`.

### Interaction
- **Set the caret.** Click an empty board cell (or press an arrow key from cold) to drop a blinking caret
  there. Direction starts **across** (`▸`). Clicking the caret cell again flips it to **down** (`▾`);
  clicking a third time hides it. `Enter` also flips `▸`⇄`▾`.
- **Move the caret.** Arrow keys move it one cell (clamped to the board). Movement does not skip.
- **Drop a tile.** `1`–`7` drop the rack tile in that **slot** at the caret, then the caret **auto-advances**
  one step in its direction, **skipping over any already-filled cells** (committed *or* pending) until it
  lands on an empty cell or the board edge. So `caret on ★ → 3 1` can lay `/t u/`, and playing off an
  existing word flows because the caret hops over the tiles already there.
- **Undo.** `Backspace` steps the caret back one cell (opposite its direction, skipping filled-by-others
  cells); if that cell holds one of *this turn's* pending tiles, it returns to its rack slot and the caret
  parks on it. Mirrors text-editing backspace.
- **Esc** hides the caret and clears any held/selected tile. **Space / Enter on caret** does not play —
  ✓ Play stays the explicit commit (button; may also bind a key later).
- Number keys with **no caret** set act as **select/hold** (same as clicking the rack tile) so numbers are
  useful in both the keyboard and click flows.

### Stable rack slots during a turn (the one refactor it required)
So `3 1 5` is predictable, `rack` is a **fixed-length slot array** (length `RACK_SIZE`, entries tile|null)
rather than a splicing list. Placing a tile (by key **or** click) keeps the same tile object in its slot but
**ghosts it** (the object also goes into `pending`); the slot keeps its number. Picking it back up un-ghosts
the slot (`recall` un-places everything; clicking a ghosted slot picks that one up). `Play` (commit) is the
only thing that nulls played slots, then `drawToFull` refills nulls. `Shuffle` reorders slots; `Trade`
rebuilds them. `isPlaced`/`rackTiles`/`availTiles` read this model; both input methods share it.

### Visuals
- Caret: a cell overlay with a blinking `▸`/`▾` arrow in `--gold`; distinct from the `held` gold ring.
- Rack tiles show a small **slot-number badge** (`1`–`7`) in a corner; placed-this-turn slots render ghosted
  (low opacity) but keep their number so you can see what `Backspace` will return.
- A one-line **keyboard legend** under the rack (e.g. `1–7 place · ← ↑ ↓ → move · Enter flip · Backspace undo · Esc clear`).

### Implementation notes
- A single `keydown` listener on the game container; `preventDefault()` on arrows/Backspace so the page
  doesn't scroll. Desktop-focused (mobile keeps touch/click).
- New state: `caret = {r,c,dir}|null` where `dir` is `'h'|'v'`. Auto-advance/undo use a
  `nextEmpty(r,c,dr,dc)` helper over `cellTile`.
- `clickCell` branches: if a tile is `held` → drop (existing behavior); else → set/flip/hide the caret.
- No change to `evaluateTurn`, scoring, or validity — placement only.

## Not built / deferred
- **AI opponent** (currently solo score-attack), **wildcard/blank tiles**, turn timer.
- Persistence (high score, saved games) — none yet; each load is a fresh bag.
- In-Inklings integration (a room/screen sharing the bench UI), reward hookup (ink/décor), and the
  **fishing/Phonicon tile source** + poetry phoneme engine tie-in.
- Difficulty tuning of value thresholds and bag size once play-tested.
