# IPA Scrabble — Inklings word game (MVP, dev-only)

A Scrabble-style word game where you **spell by sound, not letters**. The tiles are **IPA phonemes**;
a play is valid when the phoneme sequence you lay matches **some real word's pronunciation**. So
`/t u/` is valid (two·too·to) and homophones collapse into one entry — the whole charm of the mode.

**Status:** MVP **BUILT 2026-08-08** — standalone `ipa-scrabble.html`, **rack + word-builder,
solo score-attack**, launched from Inklings' DEV badge. Not yet integrated into `inklings.html` proper.

## Design decisions (settled with the dev)
- **Spell by sound.** Validity = the laid phoneme string is a real word's IPA (not a spelling). Homophones
  are one word. This is what distinguishes it from letter Scrabble and ties it to the game's IPA layer.
- **Rack + word-builder, not a board.** Leanest MVP: draw a rack, arrange one valid-sounding word, score,
  refill. (A small crossword board and vs-AI were the other forks — deferred.)
- **Solo score-attack.** No opponent; empty the bag / chase a high score.
- **Standalone dev file first.** `ipa-scrabble.html` at repo root keeps the giant `inklings.html`
  untouched and easy to iterate; a DEV-only launcher badge in Inklings opens it. Folding it into an
  in-game room is a later step.

## How it works
- **Data:** imports `IPA-fan-game/ipa_words.js` (`word → space-separated IPA`, ~22k words, 39-phoneme
  English inventory; affricates `tʃ dʒ` and diphthongs `eɪ oʊ aɪ aʊ ɔɪ` are single atomic tiles). Being
  an ES-module import, the page **must be served over http** (Live Server), not `file://` — a fallback
  panel says so if the import is CORS-blocked.
- **Lexicon:** every pronunciation string → a `VALID` Set; `PRON_WORDS` maps each pronunciation to its
  **shortest example spelling** (for display).
- **Tile economy is data-driven** (derived at load from real phoneme frequency, not hardcoded):
  - **Point values** by rarity (`valueForPct`): ≥4%→1, ≥2%→2, ≥1.2%→3, ≥0.8%→4, ≥0.5%→5, ≥0.2%→8, else
    10. So `ə/n/t/ɪ`=1 … `ɔɪ/ð/ʒ`=10, a Scrabble-like spread.
  - **Bag distribution** proportional to frequency, scaled to `BAG_TARGET≈100` tiles (min 1 each).
- **Loop:** click rack tiles into the build row (click a built tile to take it back); a live status shows
  the current `/pron/` and, when valid, the example word. **✓ Lay word** scores `Σ tile values` (+`20`
  BINGO for using all 7), consumes those tiles, and refills the rack from the bag. Vowels are tinted.
- **Aids:** **⇄ Shuffle** (reorder rack), **↩ Recall** (clear build), **♻ Trade rack** (dump rack back to
  bag, redraw — no penalty, no points), **💡 Hint** (brute-forces subsets×permutations of the rack for one
  playable word, longest first), **✦ New game**.

## Intended direction (post-MVP — dev-stated 2026-08-08)
The MVP is a rack-only builder, but the target is a **true Scrabble / Words-with-Friends game**:
- **A grid board you place words on**, playing **off already-placed words** (crossing/extending existing
  tiles), with premium squares. The rack builder is the on-ramp to this, not the end state.
- **Tiles eventually sourced from fishing.** The phonemes you **catch via phoneme fishing** (the Phonicon —
  see [`inklings-fishing.md`](inklings-fishing.md)) become your tile supply, tying this into the core
  collect→spend loop rather than an infinite random bag.

## Not built / deferred
- **The grid board + play-off-others** (see Intended direction above) — the big next step; an AI opponent,
  wildcard/blank tiles, turn timer.
- Persistence (high score, saved games) — none yet; each load is a fresh bag.
- In-Inklings integration (a room/screen sharing the bench UI), reward hookup (ink/décor), and the
  **fishing/Phonicon tile source** + poetry phoneme engine tie-in.
- Difficulty tuning of value thresholds and bag size once play-tested.
