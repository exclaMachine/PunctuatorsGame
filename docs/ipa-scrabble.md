# IPA Scrabble — Inklings word game (MVP, dev-only)

A Scrabble-style word game where you **spell by sound, not letters**. The tiles are **IPA phonemes**;
a play is valid when the phoneme sequence you lay matches **some real word's pronunciation**. So
`/t u/` is valid (two·too·to) and homophones collapse into one entry — the whole charm of the mode.

**Status:** **BUILT 2026-08-08** — standalone `ipa-scrabble.html`, launched from Inklings' DEV badge.
Shipped as a **rack word-builder MVP**, then upgraded the same day to a **full 15×15 board game** with
**play-off-others** (below), and on **2026-08-14** gained **sound-wordplay bonuses** (phonetic palindromes &
semordnilaps). Not yet integrated into `inklings.html` proper.

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
- **Sound FX** (BUILT 2026-08-09) — a tiny **procedural WebAudio chiptune** engine (`SFX`, no assets, works
  even `file://`; matches the 8-bit look, distinct from the game's other real-recording audio which needs
  http). A lazily-built (suspended-until-first-gesture) `AudioContext` drives short oscillator blips + a
  filtered-noise swoosh: **select/deselect** tile, **place** (pitch rises as the turn's tiles stack, via
  `SFX.place(pending.size)`), **pick-up/recall**, keyboard **cursor move** (very quiet), **error** (illegal
  placement / illegal play / dead hint), a **valid-word arpeggio** (longer/brighter with points; a big
  **BINGO** fanfare), the **palindrome/semordnilap** cues (below), **shuffle/trade** swooshes, a **hint**
  sparkle, a **new-game** jingle, and a
  **game-over** cadence. A **🔊 Sound / 🔇 Muted** button toggles all of it, persisted in
  `localStorage["ipascrabble.muted"]`.

## Wordplay bonuses — phonetic palindromes & semordnilaps (BUILT 2026-08-14)

The point of a spell-by-sound game is that sound-wordplay becomes *mechanically* real: `/b ɪ b/` reads the
same backwards as phonemes even where spelling wouldn't tell you, and `stop` ⇄ `pots` only mirror in IPA.
So a played run that is a **phonetic palindrome** (or reverses into **another** real word) pays a bonus and
is called out by name.

### Detection — live check, no new data file
Both tests are one line against the lexicon already in memory, so **nothing new is fetched** (`data/ipa-palindromes.json`
and `data/ipa-semordnilaps-*.json` stay build-time artifacts of `build-phonetic-wordplay.js`, unused here):

```
toks = run's phoneme tokens          rev = toks.slice().reverse().join(" ")
palindrome  : rev === pron                        && toks.length >= 3
semordnilap : rev !== pron && VALID.has(rev)      && toks.length >= 3
```

Checked **per run** inside `evaluateTurn`'s validate-and-score loop (`ipa-scrabble.html:444`), so the main
word *and* every cross-word it forms are each eligible — a single play can fire more than one. Only runs
that already passed `VALID` are tested; nothing else in the turn-legality path changes.

Yield over the game's 48,365 pronunciations (measured, not estimated):
- **Palindromes: 86** — 79 at 3 phonemes (`bib`, `mime`, `kayak`, `gag`, `sees`…), 6 at 5 (`states`,
  `stats`, `towboat`, `revere`, `falloff`, `rehear`), 1 at 7 (`canonic`). Rare enough to feel like a find.
- **Semordnilaps: 824 run-directions** (412 pairs) — 540 at 3 phonemes, 180 at 4, 32 at 5 (`spots`⇄`stops`,
  `skits`⇄`sticks`, `trots`⇄`start`, `tulip`⇄`pollute`, `luggage`⇄`juggle`, `scalp`⇄`plaques`).
- **The `n >= 3` floor matters.** It drops 10 single-phoneme words that are trivially palindromic (`ɔ`, `aɪ`,
  `u`…) and 72 cheap 2-phoneme mirrors (`pa`⇄`op`, `ti`⇄`eat`, `lo`⇄`ole`) that would otherwise pay out
  constantly on throwaway glue tiles.

Implemented as **`wordplayFor(pron)`** → `null | {kind:'pal'|'sem', bonus, mirror?}`, called from
`evaluateTurn`'s scoring loop; the constants are `PALINDROME_PER_PHONEME`, `SEMORDNILAP_BONUS`, `WORDPLAY_MIN`.

### Scoring (dev-chosen)
- **Palindrome: +10 per phoneme** — `+30` for the common 3s, `+50` for `states`, `+70` for `canonic`.
  Length-scaled so the rare long ones are the prize; the top end sits just above BINGO territory.
- **Semordnilap: flat +10.** Deliberately small and flat — they're ~10× more common than palindromes, so
  they read as a nice noticing rather than a payday.
- Both are **flat adds after `scoreCells`**, like `BINGO_BONUS` — *not* multiplied by a DW/TW the run sits on.
- Both stack: a run can only be one or the other (mutually exclusive by definition), but different runs in
  one turn each pay, and either stacks with BINGO.

### Presentation (all three, dev-chosen)
- **Live status preview** (`renderStatus`) — the per-run chip gains a gold tag *before* you commit, so you can
  see the bonus coming and choose to chase it: `/b ɪ b/ bib +6 ↔ palindrome +30`, `/s t ɑ p/ stop +7 ⇄ pots +10`.
  The `= N pts` total already includes them.
- **Banner + special SFX on play** — `wordplayBanner()` names the wordplay in plain language through `msg()`,
  because half the value here is teaching the word: `↔ PALINDROME! bib sounds the same backwards — +30` /
  `⇄ SEMORDNILAP! stop backwards is pots — +10` (then the usual `Played for +N pts.`). `SFX.palindrome()` is a
  **mirrored arpeggio** (run up, then the identical notes back down — the sound *is* the concept);
  `SFX.semordnilap()` is a two-note swap (a rising pair answered by the same pair falling). Both fire on a
  short timer *after* `SFX.play(...)` so they don't collide with the word arpeggio (longer wait after a BINGO);
  a turn showing both kinds plays the palindrome cue.
- **Found-words list** — word entries carry a gold `↔`/`⇄` tag, the bonus gets its own dashed line beneath
  (`bonusLine()`, as BINGO already does), and the statbar gains an **↔ WORDPLAY** counter beside WORDS
  (`wpcount`; bonus lines are excluded from the word count).

### Open/deferred inside this feature
- **Mirror-on-the-board combo** (playing `stop` while `pots` is already committed somewhere) — considered and
  set aside; the live-reverse check above doesn't care where the partner word is. Could be a later escalation.
- No persistence, so palindrome finds don't accumulate across games (matches the rest of the file today).

## Known bugs
- *(none currently)*

## Fixed
- **Single-line targeting too strict right after the first tile connects (fixed 2026-08-09).** When your
  first placed tile of a turn lands next to an existing **committed** letter, `validTargets` used to offer
  only that tile's four neighbors, so you couldn't continue the existing word's line (e.g. place `x` left of
  committed `A T`, then extend past `T`). Now, when a single placed tile abuts a committed tile along an
  axis, that axis is treated as set: the bridged extension along it (skipping over committed tiles) is
  offered too, while the four neighbors are still offered so a perpendicular word can start.

## Not built / deferred
- **AI opponent** (currently solo score-attack), **wildcard/blank tiles**, turn timer.
- Persistence (high score, saved games) — none yet; each load is a fresh bag.
- In-Inklings integration (a room/screen sharing the bench UI), reward hookup (ink/décor), and the
  **fishing/Phonicon tile source** + poetry phoneme engine tie-in.
- Difficulty tuning of value thresholds and bag size once play-tested.
