# IPA Scrabble — Inklings word game (MVP, dev-only)

A Scrabble-style word game where you **spell by sound, not letters**. The tiles are **IPA phonemes**;
a play is valid when the phoneme sequence you lay matches **some real word's pronunciation**. So
`/t u/` is valid (two·too·to) and homophones collapse into one entry — the whole charm of the mode.

**Status:** **BUILT 2026-08-08** — standalone `ipa-scrabble.html`, launched from Inklings' DEV badge.
Shipped as a **rack word-builder MVP**, then upgraded the same day to a **full 15×15 board game** with
**play-off-others** (below), and on **2026-08-14** gained **sound-wordplay bonuses** (phonetic palindromes &
semordnilaps). **§10 is the production build** in `inklings.html` (endless board, tiles spent from your fished
Phonicon) — **M1 (data & stock plumbing) BUILT 2026-08-15**, **M2 (the endless board model) BUILT 2026-08-17**,
**M3 (the overlay — it's playable in Inklings now) BUILT 2026-08-17**; M4–M5 planned.

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
- Persistence (high score, saved games) — none yet in the bench; **§10 M4 adds the persistent board** in
  Inklings.
- In-Inklings integration, reward hookup (ink/dex) and the **fishing/Phonicon tile source** — all now
  **planned in detail in §10** (not built). Poetry phoneme-engine tie-in still unplanned.
- Difficulty tuning of value thresholds and bag size once play-tested.

---

# 10. Production build — the endless Sound Board in Inklings (PLANNED 2026-08-14, not built)

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
- **Homophone logging.** A pronunciation maps to several spellings; proposed: ink only the **shortest example**
  (`PRON_WORDS`) into the Hoard, not the whole homophone set (playing `/t u/` shouldn't hand you two·too·to).

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
- **Empty state.** Fewer than ~2 usable sounds → the overlay shows "go fishing" rather than a dead board.
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
4. **M4 — Economy & persistence.** Consumption on commit, chain multiplier + 🌱 New patch, ink-priced trade,
   ink payout + Word Hoard logging, board in the save (v12).
5. **M5 — Teaching & polish.** Articulatory-square explainer (and a pointer from the Fish Phoneme Guide tab —
   same chart, second use), chain/patch UI feel, SFX, empty state, first-word celebration through the shared
   queue.
6. **Later — the world bench.** Swap the toolbar launcher for a placeable/fixed bench object (`tileInFront()`
   + `E`), per decision #1. The overlay itself doesn't change.

## 10.7 Conflicts & considerations

1. **This amends fishing's reward-routing rule.** `inklings-fishing.md` §8.1 says fishing pays **sounds only**
   and must not drift into ink. It still doesn't — but the Sound Board now converts sounds → ink + words, so
   the effective loop is fish → board → ink. That's the dev's call (decision #11) and is recorded here rather
   than left as a silent contradiction; the fishing doc's §3.3 sink list gains the board.
2. **Consumption makes the Phonicon a currency.** Its "coverage-honest X/40" promise (fishing §3.2) survives
   only under the ×0-stays-revealed rule (§10.1 open item). Decide before M4.
3. **One-way spend, no refunds.** There is no un-play; a committed word is permanent on an endless board. That
   is the point, but it means `✓ Play` deserves a confirm affordance for expensive tiles (an 8–10pt rare).
4. **The `ʌ` alias is user-visible.** A player who fishes `ʌ` and finds `ə` tiles needs the card to say so.
5. **Chain persistence + no cap** is the one number most likely to need retuning after play; keep the growth
   step and cap as named constants from M4.
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
  sounds with tiles left, each carrying the token it plays as), `sbStockTotal()`, `sbDistinctPlayable()` (for
  M3's "go fishing" empty state), and `sbSpend(tiles)` (one-way debit, returns how many landed).
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
- **Empty state (§10.3):** below `SB_MIN_SOUNDS`=2 distinct playable sounds the overlay says *go fishing*
  rather than dealing a dead rack. A rack tile whose fished symbol differs from the token it plays as (the
  `ʌ`→`ə` / `g`→`ɡ` aliases) says so in its tooltip (§10.7.4).
- **Launcher & guards:** a non-contextual toolbar row (`tb-board`, 🔡) + touch button (`tc-board`), through
  `tbSwitch` like every other dialog, plus `state.soundboardOpen` added to all six play guards (movement,
  `canBeHurt`, the two hint gates, `syncTouchUI`, `musicDialogueOpen`) and to `closeAnyDialog`. The **world
  bench** (§10.6 "Later") changes only this launcher. The Controls panel gained a Sound Board paragraph and a
  key row; the **articulatory-square explainer** and the pointer from the Fish Phoneme Guide are still M5.

Verify in the console (needs http serving): `loadPronunciations().then(()=>{ sbFillRack(); console.log(sbRack.map(t=>t.tok), sbValidTargets().length); })` — on a fresh board the targets are the ★ and everything within reach of it.
