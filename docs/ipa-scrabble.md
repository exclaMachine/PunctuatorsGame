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
- **Placement UX** — two ways, both share `pending`/`evaluateTurn` **and the same single-line target set**
  (`validTargets`), so click and keyboard obey identical rules:
  - **Single-line targeting** (`validTargets`) keeps a turn's tiles on one contiguous line as you lay them,
    instead of letting each tile land next to any unrelated word: *no tile placed yet* → the ★ center on an
    empty board, else any empty cell touching a committed tile (the play must connect somewhere); *one tile
    placed* → its four empty orthogonal neighbors (the second tile locks the axis); *two+ tiles placed* → the
    axis is fixed, so only the empty cell extending **each end** (skipping over committed tiles, which may
    bridge the line, per real Scrabble) plus any empty **interior gap** between placed tiles (so a picked-up
    middle tile can be refilled). Full legality (single line, no gaps, every run a real word) is still
    re-checked at ✓ Play.
  - *Click:* click a rack tile to hold it (gold), click a **highlighted** target cell to drop it (a click on
    any other empty cell is rejected with a hint), click a pending tile to pick it back up. Vowels tinted.
  - *Keyboard (select → aim → place):* `1`–`7` (or a click) **select** a rack tile; a **cursor** then only
    visits the valid target squares above. Arrow keys move the cursor to the nearest valid square that way,
    `Tab` cycles them; **`Enter`/`Space` places** the selected tile there. `Backspace` picks up the last
    placed tile, `Esc` deselects. No direction/orientation to manage. Helpers:
    `validTargets`/`moveCursor`/`cycleCursor`/`placeAt`; rack tiles show their `1–7` slot number.
- **Aids:** **↩ Recall** (return all pending to rack), **⇄ Shuffle** (reorder rack), **♻ Trade rack** (dump
  rack to bag, redraw — no penalty), **💡 Rack idea** (brute-forces the rack for one spellable pronunciation
  as a nudge — placement still up to you), **✦ New game**. Game ends when bag and rack are both empty.

## Known bugs
- **Single-line targeting is too strict right after the first tile connects (2026-08-09).** When your
  first placed tile of a turn lands next to an existing **committed** letter, the axis is still treated as
  undecided, so `validTargets` only offers that tile's four neighbors. It should let you continue in a
  **continuous line off the committed letter you connected to** — i.e. the second tile should be placeable
  extending that existing word's line, not only adjacent to your own first tile. (Consequence of the
  "all-4-neighbors until the second tile locks the axis" rule colliding with the "bridge through committed
  tiles" rule.) **Fix later**, not now.

## Not built / deferred
- **AI opponent** (currently solo score-attack), **wildcard/blank tiles**, turn timer.
- Persistence (high score, saved games) — none yet; each load is a fresh bag.
- In-Inklings integration (a room/screen sharing the bench UI), reward hookup (ink/décor), and the
  **fishing/Phonicon tile source** + poetry phoneme engine tie-in.
- Difficulty tuning of value thresholds and bag size once play-tested.
