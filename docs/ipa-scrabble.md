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
- **Aids:** **↩ Recall** (return all pending to rack), **⇄ Shuffle** (reorder rack), **♻ Trade rack** (dump
  rack to bag, redraw — no penalty), **💡 Rack idea** (brute-forces the rack for one spellable pronunciation
  as a nudge — placement still up to you), **✦ New game**. Game ends when bag and rack are both empty.

## Not built / deferred
- **AI opponent** (currently solo score-attack), **wildcard/blank tiles**, turn timer.
- Persistence (high score, saved games) — none yet; each load is a fresh bag.
- In-Inklings integration (a room/screen sharing the bench UI), reward hookup (ink/décor), and the
  **fishing/Phonicon tile source** + poetry phoneme engine tie-in.
- Difficulty tuning of value thresholds and bag size once play-tested.
