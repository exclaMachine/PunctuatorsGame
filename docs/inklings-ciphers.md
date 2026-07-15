# Inklings — The Cipher Menagerie (tentative)

Planning doc. A **farm-anchored** family of livestock that each embody a **real cipher / signalling system**.
You *read* the animals to decode a word (or, for one animal, a direction) — literacy taught through a second
notation, delivered as a cozy renewable-supply layer, not a lecture. The anchor is **Pig Pens**, a literal
staging of the **Pigpen cipher**.

Status: **Pig Pens shipped DEV-only (anchor + hard mode); the rest is plan only.** Reflects the 2026-07
brainstorm. The pigs are the committed core — **now built** as a DEV-gated modal (§1.3); rabbits and cows are
agreed candidates; bees and chickens are **tentative** (kept until each has a mechanic worth its keep).
Cross-refs: [`inklings.md`](inklings.md) (core loop, letter-unlock curve, capitals, SFX), [`inklings-farming.md`](inklings-farming.md)
(the cozy farm this rides on — seasons, daily seed, once-per-day cadence, hard mode), [`inklings-signal-flags.md`](inklings-signal-flags.md)
(**nautical** signal flags / Omen Mast — a *different* flag system from rabbit **semaphore**; see §3.1), [`inklings-grammar-systems.md`](inklings-grammar-systems.md)
(the "teach through mechanics" mission this shares).

---

## 0. Why this fits (and why it's not just a minigame)

- **The farm is supposed to renew letters.** `inklings.md` decision #2 reserves farming/ranching as the
  *renewable-supply* upgrade. A pen that yields a whole **word** per day is that idea, leveled up — livestock
  alongside the Braille-bed crops.
- **The pig *is* the dot.** Pigpen glyphs come in with-dot / without-dot pairs. An empty pen is one letter; a
  pen **with a pig in it** is its dotted twin. The enclosure walls give the grid/X shape; the pig gives the
  dot. The cipher's two halves land on "pen" and "pig" with zero contrivance — this coincidence is the reason
  the whole system exists.
- **Teach by reading, not lecturing** (the grammar-systems philosophy). You learn the cipher because you must
  read it to claim the reward. A **hard mode** hides the reference key, reusing the farm's quiz/hard-mode
  precedent.
- **Distinct *modalities*, so decodes don't blur.** The reward is often "a word," but the *skill* differs per
  animal: read a static **glyph** (pigs), read a **pose** (rabbits/semaphore), hear a **rhythm** (cows/Morse).
  Bees break the pattern entirely (location intel, not a word). One reward per *sense*, not five identical
  "decode → word" buttons.
- **No new art required.** Every cipher here is procedural line-work + dots (or synthesized audio), matching
  the single-file / offline / no-asset ethos.

---

## 1. The anchor — Pig Pens (Pigpen cipher) — **the committed core**

### 1.1 The mechanic
- **Buy pens with ink**, repeatable (same shape as the Stall's satchel upgrade). **Pen count = the maximum
  word length** you can be given.
- **Each real day the pens are arranged into one word** you haven't collected yet, **daily-seeded** off
  `state.daySeed` (Wordle-style — same word all day, no rerolling, new tomorrow; mirrors once-per-day harvest).
- **Decoding is a *reading* puzzle, not a spelling one.** You read the pigs-in-pens, type the word, and — if
  correct — **the word is added to your library directly. You do not need the letters in your satchel.** That
  is the whole point: it's a second acquisition path for words (and letters) you can't yet catch in the field.
- **The daily word may use letters you haven't unlocked yet** (decided 2026-07). Reading a letter you can't
  yet catch in the field is precisely what makes a cipher worth having — pens are a leapfrog path, not a
  mirror of the spawn pool. (The word is still chosen to be one not already in your dex.)
- **More pens → longer, rarer words.** Because the library word-count drives the letter-unlock curve, a
  correct decode also nudges unlocks forward. Late pens can deliberately reach **Q/X/Z** words that are
  otherwise ~100 words out.
- **Hard mode:** hide the reference key (the `#` / `X` grids) for a bonus, reusing the farm's quiz mode.

### 1.2 How a pen renders a letter
Standard Pigpen: a 3×3 tic-tac-toe grid → 9 cells, each letter = the walls around its cell (⌐, ⊐, ⊏ …); the
same 9 **with a dot** = the next 9; an `X` split into 4 quadrants = 4 more; those **with a dot** = the last 4.
9+9+4+4 = 26. A "pen" is drawn as an enclosure showing **only the walls that letter has** (some sides open),
with a **pig inside = the dot**. A tiny `drawPigpen(letter, x, y, size)` — sibling to `drawGlyph` — is all the
art. The reference key is the same two grids drawn once.

### 1.3 What shipped (DEV-only build) — `inklings.html`
Built exactly on the **Garden** pattern (a self-contained modal + a DEV cheat bar), but **DEV-gated like the
Herald's Bench**: the 🐖 toolbar button and the **K** shortcut appear only on `localhost`/`file://`, invisible
to prod players until we promote it. Pieces:
- **`drawPigpen` → `pigpenSVG(letter, size)`** — draws only the walls that letter's Pigpen cell has (grid
  interior lines for A–R, an X-wedge for S–Z) plus a **🐖 pig** centred in the pen for the dotted twins
  (J–R, W–Z). Strokes use `currentColor` so a pen reads on the dark pen-yard **and** the light reference key.
  `PIGPEN_MAP` builds the 9+9+4+4 = 26 assignment; the on-screen **key** (all 26, hidden in hard mode) makes
  it self-teaching regardless of variant.
- **Daily word** (`pigpenWord`) — daily-seeded off `state.daySeed` **+ pen count**, ≤ count letters, biased
  toward the **longest that fits** (more pens → rarer words), and **not already in `state.dex`**. Drawn from a
  wider `PIGPEN_POOL` (3–10-letter slice of `2of12.txt`) and — unlike the WOTD — **not gated by unlocked
  letters** (reading a letter you can't yet catch is the point). Cached per `day:count`; nothing about the
  puzzle is saved.
- **Read-and-type decode** (`pigpenSubmit`) — a real `<input>`; on a correct read the word commits through
  `pigpenCommit`, which mirrors the collection half of `commitSpell` (dex entry + `onNewVerbWord`/
  `onNewAdjWord`, noun→ink, adjective→potion, the letter-unlock diff + staggered new-letter/Feat celebrations)
  **without spending any letters**. **One decode per day** (`state.pigpens.decoded={day,word}`); the daily seed
  already forbids rerolls.
- **Buy a pen** (`pigpenBuyPen`, in-modal button) — escalating ink (`25 + 15×extra`), `PIGPEN_START=4` …
  `PIGPEN_MAX=10`. Raising the count can lengthen *today's* word (the seed keys off count).
- **Hard mode** (`state.pigpenHard`) — hides the reference key for self-testing (the farm's quiz-mode
  precedent). **DEV bar:** reveal / auto-decode today's word, clear today's decode to retest, free pens + ink.
- **Persistence:** `state.pigpens` (`{v,count,decoded}`) + `state.pigpenHard` in `snapshot`/`applySnapshot`;
  `pigpenInit` re-validates/versions the shape (`PIGPEN_V`). Only the *outcome* (decoded word in the dex)
  persists — the puzzle rederives from the date.

**Not yet built** (from §1.1/§1.4): the golden-pig **uppercase** slot, the **pen-grid crossword**, themed
pens, and **decode streaks**. Promotion to prod (drop the DEV gate) is a later call.

### 1.4 Extra layers (later, optional)
- **Golden pig = uppercase.** A rare breed fills the "with-dot capital" slot — ties into the capital-letter
  endgame (`CAP_ORDER`).
- **Pen-grid crossword.** The farm already has a *crossword-garden*; arrange pens in a grid so the pigs spell
  **across *and* down** at once — double reward for reading both axes.
- **Themed pens (by genre "book").** A sci-fi pen skews its daily word toward Q/X/Z, mirroring how genre books
  weight field letter-spawns.
- **Decode streaks** pay bonus ink or a rare seed — a cozy daily-return hook.

---

## 2. The menagerie at a glance

| Animal | System | Real semantics | Decode skill | Reward | Status |
| ------ | ------ | -------------- | ------------ | ------ | ------ |
| 🐷 **Pigs** | **Pigpen cipher** | grid/X cell + dot per letter | read a static **glyph** | **a word** → library | **Core** |
| 🐰 **Rabbits** | **Flag semaphore** | two flag/arm angles per letter | read a **pose** | a word (or letters) | Agreed |
| 🐄 **Cows** | **Morse code** | short / long tone + gaps | **hear** a rhythm | a word (audio) | Agreed |
| 🐝 **Bees** | **Waggle dance** | angle = direction, duration = distance | read **direction + distance** | a **map/location hint** | Tentative |
| 🐔 **Chickens** | *TBD* | *(needs a cipher — §3.4)* | *TBD* | *TBD* | Tentative |
| ~~🐭 Moles~~ | ~~Braille~~ | — | — | — | **Excluded** — the garden already *is* Braille (§4) |

Design thread to hold onto: **each animal should reward something the others don't** — and where two share
"a word," they must differ by **sense** (sight-glyph vs sight-pose vs sound-rhythm).

---

## 3. The other animals

### 3.1 🐰 Rabbits → Flag semaphore (agreed)
A rabbit's **two ears** are the two semaphore flags; each letter is a distinct pair of ear angles. Very
readable, cheap to draw (two rotating segments off a head), and a genuinely different skill from Pigpen —
**positional**, read as a pose rather than a static glyph.

- **Distinct from the Omen Mast.** The [signal-flags doc](inklings-signal-flags.md) covers **nautical signal
  flags** (one flag = one letter/meaning by *pattern*). Flag **semaphore** (two-arm *positions*) is a separate
  historical system — keep them thematically distinct so they don't collide (rabbits = arms/ears, mast =
  flag patterns).
- **Open:** does a rabbit hutch give a whole daily word (like pigs) or a **letter-at-a-time** feed (each
  rabbit = one letter, buy more rabbits = longer word)? Leaning: same daily-word model as pigs, so the two
  read as siblings.

### 3.2 🐄 Cows → Morse code (agreed) — *solves the "sustained signal" problem*
Morse needs a **short** unit (dot) and a **long** unit (dash, ~3× the dot), separated by gaps. A **peck can't
be sustained**, which is why chickens/woodpeckers don't work for Morse — but **a cow's *moo* can be held.**
Short *moo* = dot, long *moooo* = dash; silence between = the letter/word gaps. You **listen** and decode.

- **Audio-first** — synthesized through the existing `SFX` Web-Audio engine (no asset files); a genuinely
  different decode *sense* from the visual animals.
- **Easy/hard split falls out naturally:** show a visual transcript of the dots/dashes (and/or the key) as the
  easy mode; **audio-only** is the hard mode for a bonus.
- **Reward:** a word, like pigs — but earned by ear, not eye.

### 3.3 🐝 Bees → Waggle dance (tentative) — *and why it can't spell words*
**Yes, we know the "language":** the honeybee **waggle dance** encodes exactly two things — the **angle** of
the waggle run relative to vertical = the **direction** to a resource relative to the sun, and the **duration**
of the waggle = the **distance**. It is **not an alphabet.** So bees honestly *cannot* spell letters without
misrepresenting the real system. The faithful reading is **a bearing + a distance to a thing** — i.e. a
**map/location hint** (e.g. "today's rare-letter creature is far to the NE"). That's the design-honest use,
and it's *why* bees are the menagerie's non-word reward.

- **Tentative because** the map/hint economy has to be worth building — it depends on there being map intel
  worth pointing at (rare letters, décor, atlas content). Park until the field has hidden things to find.
- **Alternative** if we don't want a hint economy: bees give **direction-only** flavor (which field edge is
  "richest" today), a soft nudge rather than a reward.

### 3.4 🐔 Chickens (tentative — needs a cipher)
Kept because the dev wants chickens; **no mechanic attached yet.** Candidate hooks to evaluate later:
- **Polybius square / tap code** — a **5×5 coop**; a hen roosts at a `(row, column)` cell = one letter. Purely
  spatial (dodges the peck-can't-sustain problem), and a fresh grid skill distinct from Pigpen's shapes.
- **"Chicken scratch"** — lean into the idiom (illegible shorthand). Flavorful but hard to make *decodable*;
  more likely a cosmetic than a real cipher.
- Whatever we pick must clear the menagerie bar: a real system, a distinct decode sense, and a reward the
  other animals don't already give.

---

## 4. Explicitly excluded — Moles / Braille
A mole-warren Braille cell was considered and **cut**: the **farm's seed beds already *are* Braille** (2×3
cells, one seed per dot — see [`inklings-farming.md`](inklings-farming.md)). A second Braille reader would
teach nothing new and step on the crop system. Braille stays the crops' job; the menagerie covers *other*
notations.

---

## 5. Shared build / data notes
- **All procedural.** Pigpen (lines + dot), semaphore (two segments), Morse (audio + optional dot/dash
  transcript), waggle (an arrow at an angle). No sprite sheets; consistent with single-file / offline.
- **Daily-seeded content.** The daily word/target is derived from `state.daySeed` (like the field map and the
  farm), so a day's puzzle is deterministic, stable all day, and new tomorrow. **No map/word is saved** — it
  rederives from the date; only the *outcome* (a decoded word entering `state.dex`) persists.
- **Reward routing.** A decoded word commits through the normal new-word path (dex + POS payouts + unlock
  diff), so it participates in everything a hand-spelled word does. It just skips the letter-cost.
- **Where it lives.** Ranching is a farm sibling; this likely extends the farm zone / its dialogue rather than
  a new room. Confirm when building (could be its own "barnyard" tab).

---

## 6. Open questions / to decide when building
- **Word source & difficulty curve:** how the daily word is chosen (length = pen count; **may use
  unlocked-or-locked letters — decided 2026-07, §1.1**; bias toward rare/locked letters as pens grow; avoid
  words already in the dex).
- **Anti-cheese:** one decode per animal per day (daily seed already enforces "no reroll").
- **Rabbits:** whole-word hutch vs one-rabbit-per-letter.
- **Bees:** does the map-hint economy exist yet? If not, park bees until there's intel worth pointing at.
- **Chickens:** pick a cipher (Polybius/tap-code coop is the front-runner) or leave shelved.
- **Cross-animal pacing:** ink costs so the menagerie complements (not replaces) field hunting.
- **Capitals:** golden-pig uppercase — in v1 or later?

## 7. Rough build order
1. **Pig Pens** — ✅ **DONE (DEV-only, §1.4):** `pigpenSVG`, buy-a-pen upgrade, daily-seeded word, read-and-type
   decode → dex commit, key shown. The whole system stands on this alone.
2. **Hard mode** (hide key) — ✅ **DONE (§1.4).** **Decode streak** reward — not yet.
3. **Rabbits (semaphore)** — second visual cipher, second reward cadence.
4. **Cows (Morse)** — the audio decode (transcript easy-mode → audio-only hard-mode).
5. **Bees (waggle)** — *only once* there's map intel worth a bearing (§3.3).
6. **Chickens** — once a cipher earns its place (§3.4).
