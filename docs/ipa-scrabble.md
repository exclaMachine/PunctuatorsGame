# IPA Scrabble — Inklings word game (MVP, dev-only)

A Scrabble-style word game where you **spell by sound, not letters**. The tiles are **IPA phonemes**;
a play is valid when the phoneme sequence you lay matches **some real word's pronunciation**. So
`/t u/` is valid (two·too·to) and homophones collapse into one entry — the whole charm of the mode.

**Status:** **BUILT 2026-08-08** — standalone `ipa-scrabble.html`, launched from Inklings' DEV badge.
Shipped as a **rack word-builder MVP**, then upgraded the same day to a **full 15×15 board game** with
**play-off-others** (below), and on **2026-08-14** gained **sound-wordplay bonuses** (phonetic palindromes &
semordnilaps). **§10 is the production build** in `inklings.html` (endless board, tiles spent from your fished
Phonicon) — **M1 (data & stock plumbing) BUILT 2026-08-15**, **M2 (the endless board model) BUILT 2026-08-17**,
**M3 (the overlay — it's playable in Inklings now) BUILT 2026-08-17**; **M4 (the economy & the save)
BUILT 2026-09-05 — the loop is closed**. Then two fixes from playing it: **💡 Rack idea ported from the
bench 2026-09-06 (§10.12)** and **the stock guard 2026-09-06 (§10.13)**, which stops the board ever opening
onto a rack that can spell nothing. M5 planned.

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
    instead of letting each tile land next to any unrelated word: *no tile placed yet* → **every empty square
    your rack can still reach the board from** (see reach-based targeting below); *one tile placed* → its four
    empty orthogonal neighbors (the second tile locks the axis), plus that line's extensions if an abutting
    committed tile already set the axis; *two+ tiles placed* → the axis is fixed, so only the empty cell
    extending **each end** (skipping over committed tiles, which may bridge the line, per real Scrabble) plus
    any empty **interior gap** between placed tiles (so a picked-up middle tile can be refilled). Full legality
    (single line, no gaps, every run a real word) is still re-checked at ✓ Play.
  - **Reach-based targeting** (`isHook`/`canStillHook`, BUILT 2026-08-14) — it's the **play** that must connect
    to the board, not the tile you happen to lay first, so the reach is bounded by **how many tiles you hold**:
    with 7 in hand you may start 6 squares out in open space and hook the board with your last one (the far end
    of your word butting against, or bridging over, what's already there). A **hook** (`isHook`) is the ★ center
    on an empty board, else any empty square orthogonally touching a committed tile; `canStillHook(cells,dr,dc,
    remaining)` walks outward from both ends of the line you're building and asks whether a hook is within
    `remaining` **empty** squares (committed tiles inside the span bridge for free and cost no tile). Every
    candidate square — first tile *and* later ones — is dropped unless the play can still reach a hook with the
    tiles left after it, so you can never strand yourself in a spot ✓ Play would reject for not connecting.
    The board shows the two tiers: squares that hook on their own keep the solid blue outline, reach-only
    squares get a faint one (`.cell.target.far`, `near` flag on each target).
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
- **First tile forced to touch the board (fixed 2026-08-14).** `validTargets` required the *first* tile of a
  turn to be the ★ center (empty board) or a square orthogonally touching a committed tile — but Scrabble
  requires the **play** to connect, not the tile you lay first, so a word starting several squares out and
  hooking the board with its last phoneme was unplaceable. Targets are now **reach-based** (`isHook`/
  `canStillHook`): reach = how many tiles you hold, committed tiles bridge for free, and every candidate
  (first and later) is pruned unless the play can still hook with the tiles remaining after it. Two-tier
  highlight distinguishes hooking squares from reach-only ones.
- **Single-line targeting too strict right after the first tile connects (fixed 2026-08-09).** When your
  first placed tile of a turn lands next to an existing **committed** letter, `validTargets` used to offer
  only that tile's four neighbors, so you couldn't continue the existing word's line (e.g. place `x` left of
  committed `A T`, then extend past `T`). Now, when a single placed tile abuts a committed tile along an
  axis, that axis is treated as set: the bridged extension along it (skipping over committed tiles) is
  offered too, while the four neighbors are still offered so a perpendicular word can start.

## Not built / deferred
- **AI opponent** (currently solo score-attack), **wildcard/blank tiles**, turn timer.
- Persistence (high score, saved games) — none yet in the bench; **§10 M4 BUILT the persistent board** in
  Inklings (save v12).
- ~~In-Inklings integration, reward hookup (ink/dex) and the **fishing/Phonicon tile source**~~ — **all
  BUILT in Inklings, §10 M1–M4.** Poetry phoneme-engine tie-in still unplanned.
- ~~**💡 Rack idea has not been ported to the Sound Board.**~~ **PORTED 2026-09-05 — see §10.12.** The gap
  existed because M3's port simply didn't include it and nothing here flagged it.
- Difficulty tuning of value thresholds and bag size once play-tested.

---

# 10. Production build — the endless Sound Board in Inklings (PLANNED 2026-08-14; M1–M4 BUILT)

The bench proved the engine; this is the plan to make it a **real Inklings system**. Two changes carry all
the weight:

1. **Tiles are the sounds you fished.** The bag is gone — your rack is drawn from `state.phonicon`, and
   **laying a tile spends it forever**. Fishing finally has a sink, and the board finally has an economy.
2. **The board never ends.** One persistent, ever-growing crossword you extend a word or two at a time,
   day after day, with a **chain multiplier** you protect. No games, no final score, no reset.

## 10.1 Decisions (settled with the dev, 2026-08-14)

| # | Fork | Decision |
| - | ---- | -------- |
| 1 | Where it lives | **Folded into `inklings.html`** as a toolbar-opened overlay (like 🔉 Fish Phoneme). A **world bench** (walk up + `E`) is wanted later — build the overlay so only the *launcher* changes. |
| 2 | Tile source | **Consumable stock.** The rack draws from `state.phonicon`; committed tiles are **destroyed**. |
| 3 | Dex counts | **One number** — `state.phonicon[ipa].count` *is* the tile stock, and it goes down when you play. |
| 4 | Leftovers | **Only tiles you actually lay are spent.** Drawing/holding/trading costs no tiles. |
| 5 | Board shape | **Endless & persistent.** Panels are added as you reach the edge; nothing resets. |
| 6 | Stuck | **Player presses 🌱 New patch** — the next word may be laid anywhere free. No engine search; being wrong is the player's call. |
| 7 | Chain | **A multiplier on each play**, +0.1 per connected play. A new patch drops it to ×1.0. |
| 8 | Chain life | **Persists across days** — it's part of the board, so a long chain is a weeks-long thing you're protecting. |
| 9 | Rack | **Random draw of 7** from stock, weighted by counts. **♻ Trade costs ink** — a couple, escalating with each trade the same day. |
| 10 | Premiums | Standard **DL/TL/DW/TW** on every panel, **plus articulatory squares** (below) — the board teaches articulation the way the fishing water does. |
| 11 | Payout | **Ink + words into the Word Hoard**, per play (there is no game end to pay out at). |

**Open (dev to confirm during the build):**
- ~~**Name.**~~ **Settled in M3 (dev's pick): "the Sound Board."** "IPA Scrabble" stays the dev codename for
  the bench file and this doc; every player-facing surface — toolbar `🔡 Sound Board`, the panel's title, the
  Controls entry — says **the Sound Board**. (*Sound Loom* / *Soundwright's Bench* were the runners-up.)
- ~~**Zero stock.**~~ **Settled in M1:** a card whose count hits 0 **stays revealed** and its Phonicon card
  reads **"out of stock"** instead of `×N`, so `X/40 caught` never goes down (the alternative — re-locking to
  `???` — would make the collection genuinely destructible). `recordPhonemeCatch` still treats it as a repeat,
  so re-fishing that sound restocks it rather than re-announcing a first catch.
- ~~**Homophone logging.**~~ **Settled in M4 (2026-09-05): one sound grants one word.** A run inks a single
  canonical spelling, never the homophone set — but *not* the shortest spelling outright, which for a
  homophone set is usually the function word (`to`, `for`, `be`) and those are exactly what WordNet leaves
  out, so the grant would almost never fire. It's the **shortest spelling the Hoard actually knows**
  (`sbSpellingsFor` + `localLookup`), which is still one fixed word per pronunciation chosen the same way
  every time, so a sound can never be farmed for a second spelling later. The run's *display* word stays
  `SB_WORDS`'s shortest, so a `/t u/` play reads `to +6` and inks `too`.

## 10.2 The endless board

**Premiums are a pure function of position, so the board needs no panel state at all.** A panel is 15×15;
`premiumAt(r,c)` indexes the standard symmetric layout by `((r%15+15)%15, (c%15+15)%15)`, which makes the grid
infinite in all four directions by construction. "Adding a board when you reach the edge" is therefore purely
**viewport work** — there is nothing to allocate.

- **★ centre** exists only once, at absolute `(7,7)` (panel 0's middle) — the anchor for the very first play.
- **Board state** is sparse: `{ tiles: {"r,c": ipa}, minR, maxR, minC, maxC, chain, mult, score, patches }`.
  Bounds are only used to size the view and to know where the frontier is.
- **Placement logic ports nearly unchanged.** `runAt` / `cellTile` / `evaluateTurn` / `validTargets` /
  `isHook` / `canStillHook` only ever walk neighbours — swapping the fixed array for the sparse map plus a
  "is this square within the explored region + 1 panel" bound is the whole change.
- **Viewport.** The overlay renders a window onto the infinite grid (~15×15 desktop, ~9–11 wide on a phone),
  panning with the keyboard cursor at the edges, drag on touch, and a **⌖ recentre** button that jumps to the
  frontier of your last play. The `1`–`7` select → cursor → `Enter` flow is untouched.

### Articulatory squares (decision #10)

The unique-to-this-game premiums, reusing the `place`/`manner`/`voice`/`backness`/`height` fields the fishing
mode already authored in `data/phonemes.json` (§9.3 of `inklings-fishing.md`) — so a square pays only for a
**kind of sound**, and learning where they are is learning the chart:

| Square | Pays | Scores for |
| ------ | ---- | ---------- |
| ◆ **VOWEL** | ×3 letter | any vowel/diphthong tile |
| ≈ **FRICATIVE** | ×3 letter | `f v s z ʃ ʒ θ ð h` |
| 🔊 **VOICED** | ×2 letter | `b d ɡ v z ʒ ð m n ŋ l ɹ j w` |

Placement: a small deterministic set per panel (seeded off the panel coords via the existing `mulberry32`, so
it is stable forever without being stored), replacing a few of that panel's ordinary premium squares rather
than adding to them. A tile that doesn't match scores its face value there — the square is a bonus to aim at,
never a penalty. Rejected for v1 (kept in the back pocket): a **minimal-pair** square, a **mirror** square
doubling the palindrome/semordnilap bonus, a **rare-sound** square.

## 10.3 The tile economy

- **Stock = `state.phonicon[ipa].count`.** Drawing a rack does **not** touch it; `✓ Play` decrements each
  laid tile by 1. Everything else (rack leftovers, recall, trade, closing the overlay) returns to stock
  because it never left.
- **Two symbol aliases are required** (measured against the real data):
  - `data/ipa-pronunciations.json` uses **`ɡ` (U+0261 script g)**; `data/phonemes.json` uses **ASCII `g`**.
    One alias map, applied when a caught sound becomes a tile.
  - **`ʌ` never appears in the pronunciation data at all** (CMU's `AH` collapsed to `ə`), so a caught `ʌ`
    would be an unplayable trophy. Alias **`ʌ` → `ə` tiles**, with a note on the card.
- **Rack** = 7, drawn randomly from stock weighted by count (a sound you hold ×4 is 4× as likely). Fewer than
  7 owned sounds = a shorter rack; the board still opens.
- **♻ Trade** rerolls the rack: costs **2 ink** the first time each day, **+2 per further trade that day**
  (2·4·6…), tracked as `{tradeDay, tradeCount}` on the board state. No tiles are lost. Can't afford it → the
  button dims with the price shown.
- **Empty state.** ~~Fewer than ~2 usable sounds~~ → **REVISED 2026-09-06 (§10.13): a distinct-sound count
  is the wrong test** — at 2 distinct sounds 74.7% of stocks can spell nothing. The gate is now the exact
  question (`sbStockCanSpell`), and the blocked state names the gap.
  There is deliberately **no minimum-stock gate** beyond that: an endless board means you play when you can.

**Pacing sanity check** (why consumption works here): the map is 5×5 screens, `FISH_SCREEN_CHANCE=0.4`, 1 spot
(35% → 2) per fishing screen, one catch each, hard daily reset — so **a thorough day's fishing yields ~12–14
phonemes** and a casual day a handful. That is one or two words a day on the board, which is exactly the
cadence the endless-board design wants.

## 10.4 Scoring, the chain, and payout

- **Per play:** `runs scored with premiums (incl. articulatory) + BINGO + wordplay bonuses`, then the whole
  total is **multiplied by the chain** and rounded.
- **Chain:** starts ×1.0, **+0.1 per connected play**, no cap (decision #7/#8 — dev chose the uncapped,
  persists-across-days form; if late-game totals get silly, the growth step and a soft cap are the tuning
  knobs). Shown as `chain ×7 (×1.7)` in the board's statbar.
- **🌱 New patch** — the button that lets the next word be laid anywhere free (no hook required, exactly like
  an opening move). Costs the chain: back to ×1.0, `patches++`. Labelled with what it costs at press time.
- **Ink:** `floor(playScore / 10)` per play, under a **daily ink cap** (first pass: 40/day) so a huge chain
  can't print currency. Numbers are tuning.
- **Word Hoard:** each valid run's example word is inked into the dex on commit, cross-checked against
  Inklings' own dictionary (`data/dictionary.json`) so the board can't grant words the rest of the game
  doesn't know. Words already collected simply don't re-pay.
- **No high score / no game over.** The board's permanent `score` accumulates forever; the statbar carries
  score · chain · words · ↔ wordplay · patches.

## 10.5 Where the code goes

- **A `/* SOUND BOARD */` block in `inklings.html`**, overlay `#soundboard`, opened by a non-contextual
  toolbar entry (`tb-board`) + touch button (`tc-board`), joining every overlay guard (movement, `canBeHurt`,
  hints, `syncTouchUI`, `closeAnyDialog`, `musicDialogueOpen`) exactly as `#phonicon` does. ~700 lines ported
  from the bench into a 9.9k-line file.
- **`data/ipa-pronunciations.json` (1.4 MB) is lazy-loaded on first open**, mirroring the curator's
  `wordnet-relations.json` lazy-load — the field-play path must not pay for it.
- **SFX** map onto Inklings' existing engine; the bench's palindrome/semordnilap mirrored-arpeggio cues are
  worth porting as new entries rather than dropping.
- **`ipa-scrabble.html` stays** as the standalone engine bench (random bag, free play, DEV badge) — it is much
  faster to iterate placement/scoring rules there. Policy: the bench is the sandbox, Inklings is production,
  and changes are ported deliberately in one direction. Expect drift otherwise; note it in both docs when it
  happens.
- **Save `v11` → `v12`**, additive: `board` joins `snapshot`/`applySnapshot` + Export/Import; old saves get an
  empty board. `state.phonicon` already persists and needs no shape change (its `count` just became meaningful).

## 10.6 Build order (each shippable)

1. **M1 — Data & stock plumbing (no UI). BUILT 2026-08-15.** See §10.8.
2. **M2 — Endless board model. BUILT 2026-08-17.** See §10.9.
3. **M3 — The overlay. BUILT 2026-08-17.** See §10.10.
4. **M4 — Economy & persistence. BUILT 2026-09-05.** See §10.11. Consumption on commit, chain multiplier
   + 🌱 New patch, ink-priced trade, ink payout + Word Hoard logging, board in the save (v12).
5. **M5 — Teaching & polish.** Articulatory-square explainer (and a pointer from the Fish Phoneme Guide tab —
   same chart, second use), chain/patch UI feel, the wordplay SFX, first-word celebration through the shared
   queue. *(The **empty state** left M5 early — §10.13 rebuilt it as the stock guard, since it had to be a
   real viability gate rather than polish. 💡 Rack idea came early too — §10.12.)*
6. **Later — the world bench.** Swap the toolbar launcher for a placeable/fixed bench object (`tileInFront()`
   + `E`), per decision #1. The overlay itself doesn't change.

## 10.7 Conflicts & considerations

1. **This amends fishing's reward-routing rule.** `inklings-fishing.md` §8.1 says fishing pays **sounds only**
   and must not drift into ink. It still doesn't — but the Sound Board now converts sounds → ink + words, so
   the effective loop is fish → board → ink. That's the dev's call (decision #11) and is recorded here rather
   than left as a silent contradiction; the fishing doc's §3.3 sink list gains the board.
2. **Consumption makes the Phonicon a currency.** Its "coverage-honest X/40" promise (fishing §3.2) survives
   only under the ×0-stays-revealed rule, which M1 built and M4 is the first thing that can actually reach.
3. **One-way spend, no refunds.** There is no un-play; a committed word is permanent on an endless board.
   **Settled in M4:** `✓ Play` confirms, but not on a tile's *value* — the irreversible thing isn't the
   points, it's dropping a sound to **zero stock**, which takes its Phonicon card to "out of stock" until
   you fish another. So the confirm fires when a play lays your **last copy** of a sound (`sbLastCopies`)
   and is silent otherwise, so ordinary play never nags. The same card asks before 🌱 New patch breaks a
   chain.
4. **The `ʌ` alias is user-visible.** A player who fishes `ʌ` and finds `ə` tiles needs the card to say so.
5. **Chain persistence + no cap** is the one number most likely to need retuning after play. Named
   constants as of M4: `SB_CHAIN_STEP` (0.1), `SB_INK_PER` (10), `SB_INK_CAP` (40/day), `SB_TRADE_COST`
   (2) and `SB_TRADE_STEP` (2).
6. **Viewport on a phone.** An infinite board in a retro-pixel overlay is the real UX risk of this plan —
   M3 should be judged on the phone, not the desktop. **Built and still unjudged:** M3's phone window is
   24 px cells, ~11 wide (§10.10), driven by tap-to-place and drag-to-pan. If it reads badly in the hand,
   the knobs are `SB_CELL_PX_SM` and the `availH` reserve in `sbLayout`.

## 10.8 M1 — Data & stock plumbing (BUILT 2026-08-15)

Headless: a `/* THE SOUND BOARD — M1 */` block in `inklings.html` (above the M2 block and the Atlas), plus one
line in `renderPhonicon`. No overlay, no board, and **nothing spends yet** — `sbSpend` exists but M4 is what
calls it. Verify in the console with `loadPronunciations().then(()=>console.log(sbDrawRack(7)))` (needs http
serving, like the rest of the game's data).

- **Lexicon (lazy).** `loadPronunciations()` fetches `data/ipa-pronunciations.json` **once, on demand** (the
  curator's `wordnet-relations.json` pattern — 1.4 MB must not land on the field-play path); it caches the
  promise, resolves `null` on failure, and clears the promise so a later attempt retries. `sbBuildLexicon`
  makes one pass over the dictionary and builds all three tables together: `SB_VALID` (the pronunciation Set
  a run is judged against), `SB_WORDS` (pron → **shortest** example spelling, so homophones collapse to one
  display word), and `SB_TILE` (token → `{val, pct, vowel}`, values from `sbValueForPct` over this lexicon's
  **own** measured frequency, not a hardcoded table). Accessors: `sbIsWord(pron)` / `sbExample(pron)`.
  `SB_PRONS` keeps the raw map for M4's Word Hoard cross-check.
- **The two aliases** (`SB_ALIAS` / `sbToken`), both verified against the shipped data rather than assumed:
  `g`→`ɡ` (inventory ASCII vs the prons' U+0261) and `ʌ`→`ə` (**`ʌ` occurs in 0 of the 49,947 pronunciations**
  — CMU folds `AH` into `ə`). Checked both directions: all **40** inventory sounds map onto playable tokens,
  and all **39** data tokens are reachable by fishing — no dead tiles, no unfishable tile.
- **Stock over `state.phonicon`** (one number, no parallel ledger): `sbStock(ipa)`, `sbStockList()` (owned
  sounds with tiles left, each carrying the token it plays as), `sbStockTotal()` and `sbSpend(tiles)`
  (one-way debit, returns how many landed). *(`sbDistinctPlayable()` shipped here as M3's empty-state gate
  and was **deleted 2026-09-06** — see §10.13, the count was the wrong question.)*
- **Weighted rack draw.** `sbDrawRack(want, held)` draws up to 7 weighted by count (held ×4 = 4× as likely)
  and **without replacement against the stock**, reserving `held` first, so a rack can never show more copies
  of a sound than you own; fewer than 7 owned just yields a shorter rack. It deliberately **does not touch
  the counts** — drawing, holding, recalling and trading are free (decision #4). A tile carries both the
  inventory symbol it came **from** (`ipa`) and the token it plays **as** (`tok`), so spending an aliased `ə`
  tile debits the `ʌ` card it was actually drawn from.
- **Phonicon card at zero:** `×N` becomes **"out of stock"** at 0 (the §10.1 rule) — the only visible change
  in M1, and unreachable until M4 spends.

## 10.9 M2 — The endless board model (BUILT 2026-08-17)

Still headless: a second `/* THE SOUND BOARD — M2 */` block in `inklings.html`, directly under M1. No overlay,
nothing spends, nothing persists. What exists now is a complete, playable-by-console board engine.

- **Premiums are a pure function of position.** One 15×15 `SB_PREMIUM` table (standard Scrabble layout, centre
  = DW) read at `(r mod 15, c mod 15)` by **`sbPremiumAt(r,c)`** — so the grid is infinite in all four
  directions *by construction*, with no panel to allocate, store or save. The **★ exists exactly once**, at
  absolute `(7,7)`.
- **Articulatory squares** (§10.2) resolve in the same call: `sbArtPanel(pr,pc)` seeds `mulberry32(hash2(pr,pc))`,
  shuffles that panel's **letter-premium squares** (DL/TL only — word multipliers and the ★ are never touched)
  and converts **6 of them, two per kind** (`◆ VOWEL ×3 · ≈ FRICATIVE ×3 · 🔊 VOICED ×2`). Deterministic
  forever, memoised per panel, never stored. **`sbArtPays`** reads the *same* `data/phonemes.json` fields
  fishing authored (`manner`/`voice`), so the two modes can't disagree about what a fricative is; ◆ falls back
  to the tile's own vowel flag so it still works if that file failed to load. A non-matching tile scores face
  value — the squares are targets, never penalties.
- **Board state** is sparse on `state.soundboard`: `{tiles:{"r,c":tile}, count, minR..maxC, score, chain,
  patches, words, wordplay, patchFree, tradeDay, tradeCount}` (`sbNewBoard`/`sbBoard`). Bounds only size the
  view and bound the walks; `sbInb` = **explored region + one panel** of frontier. It deliberately **does not
  join `snapshot()` yet** — the save stays `v11` until M4.
- **The engine ported onto it:** `sbCellTile`/`sbRunAt`/`sbScoreCells`/`sbWordplayFor`/`sbEvaluateTurn`/
  `sbValidTargets`/`sbIsHook`/`sbCanStillHook`, plus turn state (`sbRack`, `sbPending`, `sbFillRack`,
  `sbRecall`) and **`sbCommitPlacement()`** — which writes tiles into the map and grows the bounds, the
  *structural* half of a play; M4 layers spend/chain/ink/Hoard on top. `sbEvaluateTurn` also returns
  `mult`/`final` (the chain multiplier applied and rounded) so M3 can preview what M4 will pay.
- **One thing couldn't be ported literally.** The bench finds first-tile targets by scanning all 225 squares
  and testing each with `canStillHook` — on an endless board that cost grows with the *area* you've explored.
  **`sbReachFromHooks(budget)`** enumerates the identical set backwards, walking outward from each hook
  (`sbHooks()`, derived from the tile map) up to `budget` empty squares, bridging committed tiles for free.
  Same relation, read from the other end; the cost is now board **tiles**, not board **area**. Later tiles in a
  turn still use the bench's candidate-then-`sbCanStillHook` filter, where the candidate set is tiny.
- **`patchFree`** (the flag M4's 🌱 New patch sets) is honoured throughout: every free square hooks, the
  connect-to-the-board check is skipped, and first-tile targets become the whole in-bounds region.

## 10.10 M3 — The overlay (BUILT 2026-08-17)

The board is now playable inside Inklings. A third `/* THE SOUND BOARD — M3 */` block, the `#soundboard`
overlay markup + CSS, and the usual launcher/guard wiring. Still **economy-free by design**: ✓ Play commits
the word and moves the board's own score/word counters, but **nothing is debited from the Phonicon, the chain
never grows, no ink or Word Hoard entry is paid, and none of it is saved** — that's M4 (save v11 → v12).

- **The viewport is the whole M3 problem.** An infinite grid has to live in a small panel, so the overlay
  renders a **window** of `sbView={r0,c0,rows,cols}` and asks each coordinate what it is. `sbLayout()` sizes it
  from the window (**32 px cells desktop / 24 px phone**, ≤19 either way) rather than measuring the panel —
  the mobile breakpoint turns the book into a plain scrolling block, where measuring reads 0. Panning is
  **drag anywhere on the board**, **arrow keys when no tile is picked**, the aim cursor pushing the edge
  (`sbEnsureVisible`), or **⌖ Recentre** / `C` (`sbHome()` = your last play, else the middle of what you've
  built, else the ★). `sbClampView()` keeps the window against the playable region (explored + one panel), so
  you can't pan off into featureless void; squares past the frontier render dimmed (`.sb-cell.out`).
  Nothing is allocated by panning — that's what "premiums are a pure function of position" buys.
- **The bench's select → aim → place flow, unchanged.** `1`–`7`/tap picks a rack tile, arrows aim the cursor
  over valid squares only, `Tab` hops to the next one (sorted into reading order, since the targets arrive
  hook-outward), `Enter` lays it, `Enter` again plays, `Backspace` undoes, `Esc` backs out one layer at a time
  (aim → placement → close). Targets are drawn in the M2 two tiers: **solid** where the square hooks the board
  on its own, **faint** where it's legal only because the rest of your rack can carry the word back.
- **One pointer handler, not 225.** The board is re-rendered wholesale on every change, so per-cell listeners
  would be re-bound constantly; instead `sbCellFromEvent` works the cell out from the viewport rect, and a
  single pointerdown/move/up on `#sb-view` decides tap-to-place vs drag-to-pan (7 px of travel = a drag).
- **Live per-run status,** ported from the bench: each run the placement forms, its example word and points,
  the **gold wordplay preview** before you commit, and the running `= total` that gates ✓ Play.
- **♻ Trade is free in M3** (dev's call, so a phone test can't dead-end on an unplayable rack); M4 prices it in
  ink using the `tradeDay`/`tradeCount` fields `sbNewBoard` already carries. Nothing is lost either way —
  drawing never touched the stock. **🌱 New patch** stays M4, with the chain it costs.
- **Empty state (§10.3):** as shipped in M3, below `SB_MIN_SOUNDS`=2 distinct playable sounds the overlay
  said *go fishing* rather than dealing a dead rack — **superseded 2026-09-06 by §10.13's exact viability
  gate; `SB_MIN_SOUNDS` is gone.** A rack tile whose fished symbol differs from the token it plays as (the
  `ʌ`→`ə` / `g`→`ɡ` aliases) says so in its tooltip (§10.7.4).
- **Launcher & guards:** a non-contextual toolbar row (`tb-board`, 🔡) + touch button (`tc-board`), through
  `tbSwitch` like every other dialog, plus `state.soundboardOpen` added to all six play guards (movement,
  `canBeHurt`, the two hint gates, `syncTouchUI`, `musicDialogueOpen`) and to `closeAnyDialog`. The **world
  bench** (§10.6 "Later") changes only this launcher. The Controls panel gained a Sound Board paragraph and a
  key row; the **articulatory-square explainer** and the pointer from the Fish Phoneme Guide are still M5.

Verify in the console (needs http serving): `loadPronunciations().then(()=>{ sbFillRack(); console.log(sbRack.map(t=>t.tok), sbValidTargets().length); })` — on a fresh board the targets are the ★ and everything within reach of it.

## 10.11 M4 — The economy & the save (BUILT 2026-09-05)

The loop is closed. M1 built the stock, M2 the board model, M3 the overlay you could play but that neither
cost nor paid anything. M4 is a fourth `/* THE SOUND BOARD — M4 */` block plus a 🌱 button, a confirm card
and the save bump: **laying a tile spends it out of the Phonicon for good**, a play pays **ink** and can ink
its word into the **Word Hoard**, the **chain** grows and 🌱 New patch trades it away, **♻ Trade costs ink**,
and the board **persists** (save `v11` → `v12`). Fishing's reward-routing rule is now amended in practice as
well as on paper (§10.7.1): the effective loop is **fish → board → ink**.

### What a ✓ Play now does

`sbPlay` → (confirm, if needed) → `sbCommitPlay`, in this order:

1. **`sbCommitPlacement()`** — M2's structural half, unchanged: tiles into the sparse map, bounds grown.
2. **`sbSpend(laid)`** — the half that costs. `state.phonicon[ipa].count` goes down by one per tile laid,
   and only tiles actually laid (decision #4: drawing, holding, recalling and trading are free because the
   tiles never left the stock). A tile debits **the card it was drawn from**, not the token it played as, so
   an aliased `ə` tile takes it out of the `ʌ` card (§10.3).
3. **Chain** — `b.chain++`. The chain counts **plays since the last patch**: this play scored at the
   multiplier that was in force, and now extends the chain (or, straight after a patch, starts the new one
   at 1). So the play *on* a fresh patch is always ×1.0, and the next is ×1.1.
4. **Ink** — `floor(final / SB_INK_PER)`, clipped by what's left of `SB_INK_CAP` today. Both day-scoped
   counters (`inkDay`/`inkToday`, `tradeDay`/`tradeCount`) **roll over lazily**, asked at the point of use
   rather than reset by a day-change hook — the board may sit unopened for a week, and there is no clock to
   wire up or miss.
5. **The Word Hoard** — `sbGrantWords` (below).

The message line then reports all of it in one go: the wordplay banners, the score with its chain, the ink
(and "today's ink cap" when it was clipped), and what went into the Hoard.

### The Word Hoard payout — dex entry and nothing more (dev's call, 2026-09-05)

The fork was how deep the board reaches into the collection, given that `commitSpell` fires a whole reward
chain at the desk. **Decided: the board is a second front door into the collection, not a second desk.** A
word it spells joins `state.dex` and therefore counts toward `wordsCollected()` — so it moves the
**letter-unlock ladder**, puts a spine in the **Nouns wing** and can trip a **seed grant** — but it pays **no
noun ink, brews no potion and advances no verb or adjective ladder**. Those are the desk's rewards for
spelling a word out of letters you hunted; the board pays in its own currency instead.

Two rules fall out of it:

- **A play the dictionary can't place still scores and still pays ink.** The board judges a run against the
  49,947-word pronunciation lexicon; `data/dictionary.json` is a different, smaller list. Rejecting the play
  would fail it for a reason the board's own word list says is fine — so it stands, and simply isn't inked
  (the curator, the Nouns wing and the mad-libs have nothing to do with a word carrying no definition and no
  part of speech). The status line says so by name.
- **One sound grants one word.** §10.1's homophone rule, but *not* by inking `SB_WORDS`'s shortest spelling:
  for a homophone set the shortest is usually the function word (`to`, `for`, `be`) and those are exactly
  what WordNet leaves out, so the grant would almost never fire. `sbSpellingsFor` inverts the raw lexicon for
  the play's own pronunciations (one pass, built per play rather than kept resident — 50k iterations is
  nothing beside a board re-render, an always-resident index is 50k strings) and the grant is the **shortest
  spelling `localLookup` accepts**. Still one fixed word per pronunciation, chosen the same way every time,
  so a sound can never be farmed for a second spelling later. A `/t u/` play reads `to +6` and inks `too`.

A new word can unlock a letter, and `#unlockmodal` opens **over** the board (z-index 10 to its 7). The global
keydown handler's branch for that modal sits *below* the Sound Board's, so `sbKey` hands the keys over
itself — otherwise the notice could only be dismissed with the mouse.

### 🌱 New patch, and ♻ Trade priced

- **🌱 New patch** (decision #6) is the way out of a board you can no longer hook onto, with deliberately **no
  engine search** for whether you're really stuck — that's the player's call. It costs the chain and nothing
  else: `chain=0`, `patches++`, `patchFree=true`, and the next play may be laid anywhere free. Arming
  **persists**, so arming it and closing the board can't quietly refund the chain; the play that uses it
  spends it (`sbCommitPlacement` already cleared `patchFree`). Disabled while armed, and on an empty board,
  where the first word has to cross the ★ regardless.
- **♻ Trade** was free in M3 so a phone test couldn't dead-end on an unplayable rack. Now 2 ink, **+2 per
  further trade the same day**. It buys a re-roll, not tiles — nothing is lost either way. The button carries
  its live price (`♻ Trade · 4 ink`) and dims when you can't afford it, because a dimmed button with no price
  is a dead end.

### The confirm card

One small dialog (`#sb-confirm`, above the overlay rather than inside its clipped flex `.book`) serves both
irreversible presses. **It fires on the last copy of a sound, not on an expensive tile** — §10.7.3 floated
value-based, but the irreversible thing isn't the points, it's dropping a sound to zero stock and reading
"out of stock" on its Phonicon card until you fish another. Ordinary play never sees it. While it's up it
**owns the keyboard**: `sbKey` returns early, so Enter answers the question instead of also playing a word
behind it.

### The save (v11 → v12)

`state.soundboard` joins `snapshot()`/`applySnapshot` (and therefore Export/Import, which go through the same
function). Old saves have none and get a fresh board on first open. Restore goes through **`sbAdoptBoard`**,
which rebuilds onto a fresh `sbNewBoard` rather than trusting the saved object wholesale: the tile map comes
back from JSON carrying `Object`'s prototype, keys are re-checked against `r,c`, and **`count` and the bounds
are re-derived from the tiles themselves** — so a truncated or hand-edited save can't leave the reach walks
(`sbInb`/`sbReachFromHooks`) looking at a region that holds nothing. Fields a save predates keep their
defaults. `sbNewBoard` gained `inkDay`/`inkToday` and a lifetime `hoard` tally alongside M2's `tradeDay`/
`tradeCount`.

### Statbar & Controls

The statbar gained **INK TODAY `n/40`** (a cap nobody can see is baffling when it bites), the chain readout
got a tooltip, and the live total in the status line names the multiplier it will be paid at
(`= 42 (×1.4)`). The Controls panel's Sound Board paragraph now says that laying a tile spends it, what a
play pays, and what 🌱/♻ cost — the spend being the single biggest fact a player needs before their first
word.

### Still M5

The articulatory-square explainer + the Fish Phoneme Guide pointer, chain/patch UI feel, the ported
palindrome/semordnilap SFX, and the first-word celebration through the shared queue. Two M5 items landed
early instead: **💡 Rack idea** (§10.12) and the **empty state**, which §10.13 rebuilt as a real viability
gate rather than the polish M5 had it down as.

## 10.12 💡 Rack idea — ported from the bench (BUILT 2026-09-05)

**A gap, not a removal.** The bench has had a `💡 Rack idea` button since it shipped (`findRackWord` /
`combos` / `permHit` / `hint`); M3's port to Inklings simply didn't include it, and nothing in §10 flagged
the omission, so it went missing without ever being decided against. `git log -S findRackWord --
inklings.html` is empty — it had never existed there. Now ported.

**It searches the rack only, and says so.** Every subset of your rack, **longest first**, then every
permutation of that subset, asked of the lexicon: is this sequence a real word's sound? First hit wins.
Worst case on a full rack is Σ C(7,k)·k! ≈ **13.7k Set lookups**, which is nothing.

The fork the endless board creates, and the decision: the bench is a standalone rack game, so "your rack
could spell /f ɪ ʃ/" is a *complete* answer there. Here a word also has to hook the board and form valid
cross-runs. **Decided (dev, 2026-09-05): port it as-is and let the label carry the caveat** — "Rack idea"
promises a rack fact, not a placement. On an empty board or a fresh patch it's exactly right; on a crowded
one it may name a word you can't place, which is the honest failure for a hint that deliberately knows
nothing about the board. A **placement-aware** hint (words × hooks × axis × offset, cross-run validated,
squares flashed) was considered and rejected for now: real engine work, slow on a dense board, and it stops
being a nudge and becomes the answer.

**Kept faithful to the bench on purpose.** Only the seams changed (`sbRack`, `sbIsWord`, `sbExample`,
`sbMsg`); the search is verbatim, including `permHit`'s adjacent-duplicate skip — which is only *partially*
effective on unsorted input but is correct, and sorting to sharpen it would be exactly the kind of drift
§10.5's one-way port policy exists to avoid. SFX reuses the existing `capture` cue (a short rising blip)
rather than adding one; the ported wordplay cues remain M5.

Wired as `sbRackIdea`, the `💡 Rack idea` button between ⇄ Shuffle and ♻ Trade, and the **`H`** key beside
`C` for recentre. Disabled with an empty rack or an unloaded lexicon. The "no word hides in this rack"
message names ♻ Trade's **live ink price**, so the dead end points at the thing that costs money.

**One layout consequence:** seven buttons plus ♻ Trade's price-bearing label wrap the button block to two
rows, so `sbLayout`'s `availH` reserve went 270 → 302 desktop / 290 → 320 phone. The grid gives back one
cell row; without it the board overflows the clipped, fixed-height `.book`.

## 10.13 The stock guard — never open onto a board you can't play (BUILT 2026-09-06)

**Found by playing M4.** The dev hit a rack that could spell nothing — and ♻ Trade, which M4 had just
started charging for, re-rolled from the same doomed pool for ink, over and over. The board could take your
currency and give you nothing back. There are **two separate failure modes** here and they need two
separate fixes; conflating them is why the original guard was useless.

### Mode 1 — the stock itself is dead

No arrangement of what you own spells anything, so **no amount of trading can ever help**. The M3 gate was
`sbDistinctPlayable() < SB_MIN_SOUNDS` (=2) — a *count* standing in for viability. Measured against the
shipped lexicon, that proxy is wrong most of the time **at its own threshold**:

| distinct sounds owned | 2 | 3 | 4 | 5 | 6 | 8 | 10+ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| stocks that can spell **nothing** | **74.7%** | 42.0% | 17.0% | 11.3% | 3.7% | 1.3% | 0.0% |

So `SB_MIN_SOUNDS` waved through three-quarters of the dead stocks it was the only defence against, and
`sbDistinctPlayable` is deleted with it. The gate is now the exact question, asked exactly:
**`sbStockCanSpell()`** walks the pronunciations **shortest-first** and returns the first whose multiset
fits inside the stock. Measured in node against the real file: **0.018 ms** on a viable stock (it exits in
the first handful of tests) and **43 ms** for the full scan a genuinely dead stock forces — which is
exactly the case that has to be *certain* rather than fast, and is why the result is **memoised on a
signature of the stock** rather than re-asked by every render. A dead stock can't change without fishing or
spending, and the signature self-invalidates on both. The index (`sbSortedProns`, 48,355 prons, sorted by
string length as a cheap stand-in for token count) is built once, lazily, in 19 ms.

**Naming the gap, not the answer** (dev's call). `sbStockGap()` diagnoses and says it in the game's own
vocabulary, so a blocked board teaches instead of stonewalling. The dominant cause is **no vowel at all** —
70% of sampled dead stocks — which is no accident, since every English pronunciation has one; that branch
also names the two commonest vowels *you don't hold* (by the lexicon's own frequency, via `SB_TILE.pct`) as
a direction to fish in. An empty Phonicon and a has-vowels-but-still-dead stock get their own wording.
Deliberately **not** built: naming a specific sound that would unblock you, which turns fishing into a
fetch-quest.

### Mode 2 — the stock is fine, the draw was unlucky

**3.6–11.2%** of random 7-tile racks from a viable stock spell nothing. ♻ Trade does fix that, but it should
never cost ink to undo a bad shuffle. **`sbFillRack` now deals until the rack holds a word** — drawing has
always been free (decision #4), so a redraw costs nothing. Measured: **median 1 redraw, 90th percentile 1,
worst case 8**; `SB_DEAL_TRIES` is 24.

Three things about the guarantee:

- **It requires the rack to spell a word ON ITS OWN**, which is stricter than the real rule once tiles are
  down (a lone `/s/` can extend `/k æ t/`). Deliberate, and the dev's call: it's a **floor, never a
  ceiling**, it reuses `sbFindRackWord` and needs no placement search, and on an empty board or a fresh
  patch it *is* the rule, since that play must stand alone. Over-strictness is invisible — it only ever
  redraws a rack you'd have found awkward anyway.
- **Kept tiles are never silently swapped.** A redraw reserves the leftovers and re-rolls only the new
  tiles, so the guarantee never reaches into a hand you're holding. A **mid-turn top-up** (tiles already
  laid) skips the guarantee entirely — the turn in progress is the player's.
- **`sbSeedRack` is the last resort behind the redraws**: build the rack around the word `sbStockCanSpell`
  already proved the stock can make. It re-deals whole, discarding leftovers — normally the wrong thing to
  do to someone's tiles, but it is only reachable after every random deal has failed, which the measurement
  says is vanishingly rare, and the alternative is handing back the dead rack this section exists to
  prevent. `sbFillRack` also short-circuits on a dead stock rather than spinning 24 times over it (spending
  your last vowel on a play can reach that).

### What the player sees

A stock that can't spell anything **opens the board and explains it** rather than dimming a toolbar button
— a dead button says nothing, the same principle as the Tree of Kinds' lock. Every control is disabled,
**♻ Trade included**, so the ink sink is shut off at the source.
