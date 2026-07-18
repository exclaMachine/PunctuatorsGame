# Mujicians — a Balatro-style music-theory deckbuilder

**Entry file:** `mujicians.html` · **Status:** **v1 vertical slice built** — a Balatro-style deckbuilder
(cards = notes, hands = chords/scales, score = theory correctness, hands are sounded, and a whole run now
**builds one continuous Mario-Paint-style song across all 3 gigs** — the loop accumulates and modulates
C→G→F as you play (Phase 4) — and you can **Save a Song** you like — name the whole-run song, read a theory
report card, and replay/share it from a Home **Setlist**). The demoted slice-1 note-grid is preserved in
**`mujicians-compose.html`** (the future free-compose side tool). The economy beyond the slice (antes, boss
gigs, Étude/Accidental cards, Daily-Set seed, set-playback) is still the plan below.

A roguelike deckbuilder where **cards are notes** and the "poker hands" you play are **chords, scales,
and progressions**. You score by making music that's *theory-correct* — in key, consonant, resolving,
moving by the circle of fifths — and because every hand is **played as audio**, a high score literally
*sounds good*. The fantasy comes from the dev's *Mujicians* story world (magic made of music); **no
in-game story yet** — the flavor is enough. This doc is the source of truth; prefer it over generic
game-dev defaults.

> **Relationship to Pitch Bird.** Pitch Bird (`pitch-bird.html`) stays a separate voice game. Mujicians
> reuses its **Web Audio pipeline** (oscillators, note math, the pitch detector). Sing-input and the
> slice-1 grid are candidate **side activities**, not the spine. See [`pitch-bird.md`](pitch-bird.md).

---

## ⚠️ Known issues / fixes to do (noted 2026-07-17, NOT yet fixed)

Playtest feedback captured for a later pass — **no code changed yet.** Listed newest-first.

1. **Do away with gigs (design change).** The 3-gig structure **disrupts play** and the dev "doesn't
   really care about the Muses." Direction: **drop the 3-gigs-per-run Set**, and **replace the per-gig Muse
   draft with a single Muse chosen once at the start of a run**. **Now planned in full** — see the new
   **[Removing gigs — a run becomes one performance](#removing-gigs--a-run-becomes-one-performance-planned-not-built)**
   section below for the decided forks, the recommended (confirm-before-building) defaults, and the code map.
   (Still **not built.**)
2. **Whole/half notes don't actually sustain longer (audio bug).** Choosing a **whole note** still *sounds*
   like a quarter — the duration isn't audibly longer. Likely the synth envelope/`_tone` release is fixed
   regardless of the `d*slot` length passed by `scheduleVoices`, so longer durations don't ring out. Fix:
   make the note's amplitude envelope/decay scale with its scheduled duration.
3. **A 4-beat bar can't hold a whole note plus anything (M4).** The bar is `BEATS`=4 columns = 4 beats, so a
   **whole note (4 beats) fills the bar** and any additional note in the same hand overflows and is
   clipped/dropped. Multi-note melodies with long durations don't fit. Fix options: let a melodic hand
   **span multiple bars**, or lengthen the bar, or cap durations by remaining space in the UI. (Ties into
   #1 — if gigs go and the loop model changes, revisit bar capacity then.)
4. **Single-select should swap, not block (M1–M3).** When `maxSelect`=1, clicking a **different** card does
   nothing (current selection stays). It should **deselect the current card and select the new one**. Fix:
   in `toggleSel`, when `maxSelect()===1` and a different card is clicked, replace the selection instead of
   returning early.

---

## Removing gigs — a run becomes one performance (planned, not built)

> **Status: planned, NOT built (noted 2026-07-17).** This is the design + code map for Known-issue #1
> ("do away with gigs"). Nothing is coded yet. Two forks below are **recommended defaults flagged
> "confirm before building"**; one fork is **decided** (the Muse draft). When we build this, update the
> **Progression** and **Implemented** sections and this status line in the same change.

**Why.** The 3-gig Set **disrupts play** (three separate threshold gates + two between-gig Muse-draft
interruptions per run), and the dev "doesn't really care about the Muses." Collapsing a run to **one
continuous performance** removes the mid-run gates and drafts, so a run reads as *sit down → build one
song → done*, which is what the "made some music" payoff and Save-a-Song already want to be.

### The three forks

1. **Run shape — DECIDED: one session, one threshold.** A run is one continuous performance: a single
   hand/discard budget and a **single applause threshold** to "pass" (win = beat it, lose = run out of
   hands). This is the cleanest 1:1 for today's gig loop and keeps the Balatro pass/fail tension the whole
   design leans on. *(Alternatives surfaced but not chosen: an **endless/no-threshold** sandbox where score
   is just a report card and Save-a-Song is the only endpoint; or **milestone beats** — one key but 2–3
   escalating applause milestones inside the run for pacing.)*
2. **Key / modulation — DECIDED: one fixed key now; key changes move to the Melody movement (M4) later.**
   Removing gigs, a run stays in **one key** (start with C major) — this kills the gig-boundary C→G→F
   modulation. **Key *change* is not lost, it's relocated:** the dev's call is to **introduce modulation as
   a Melody-movement (M4) concept** in the campaign, not something bolted onto the run structure. So single
   fixed key for the gig-removal pass, and **modulation becomes a taught mechanic when Melody unlocks**
   (a mid-song key-change move the player performs and is scored on — the *player-driven modulation* shape,
   now with a home in the progression rather than an always-on run feature). **M7 form scoring (`hasABA` /
   phrase fingerprints) is unaffected either way** — it reads `run.loop.bars` regardless of key. *(An
   **auto-modulate-by-bar** flag — the old C→G→F feel on a bar cadence — stays a possible stopgap but is
   not the chosen direction; M4 modulation is.)*
3. **Muse draft — DECIDED: draft 1 of 3, once, at run start.** `offerDraft()` runs **exactly once**,
   before the run begins; there are **no between-gig re-drafts**. Keep the existing draft-of-3 UI.
   ⚠️ **Consequence to resolve:** the two **repeatable hand-size Muses** (Extra Hand +1 / Big Hand +2) were
   balanced around being **re-draftable every gig to stack** the hand from 4 toward ~8. With a single draft
   they can't stack that way — options: bump their one-shot value, fold a hand-size bump into the base run,
   or drop `repeatable` and treat them as ordinary one-pick Muses. Decide during build.

### What "a run" and "the song" become (given the defaults above)

- A run = **one performance in one key**, with one hand budget and one applause threshold, filling **one
  flat loop** (no sections, no locked past-sections, no per-section key strip).
- The accumulated song = that single-key loop. **Save-a-Song stays a whole-run capture** (it already is,
  post-Phase-4) but simplifies: `keyName` is the one key (not `"C→G→F"`), and `songReport` gets the key as
  a **single pc-array** instead of the `sectionKey` per-bar function.
- **Loop length:** today's loop is `LOOP_BARS = SECTION_BARS × GIGS.length = 6 × 3 = 18`. Keep the run's
  loop at a comparable length (**~12–18 bars**) so the song has room; size it to the single-session hand
  budget (see below). No sections to divide.

### Code map (what gets touched)

The gig structure is concentrated in a handful of spots (`mujicians.html`):

- **`GIGS` array (~L294) → a single run config.** Replace the 3-entry array with one key + one threshold
  (e.g. `RUN_KEY = majorScale(0)`, plus the per-movement/Free-Play threshold). Everything that indexed
  `GIGS[run.gigIdx]` reads the single config.
- **`SECTION_BARS` / `LOOP_BARS` / `sectionOfBar` / `sectionKey` / `loopLenNow` (~L275, L303–309).**
  Collapse: `LOOP_BARS` becomes the run's flat loop length; `sectionKey(b)` → the one `RUN_KEY`;
  `sectionOfBar` is removed. `loopLenNow()` — with no sections — cycles the **filled prefix** of the loop
  (bars written so far) instead of "sections unlocked up to the current gig," so early play still doesn't
  groove through empty future bars.
- **`run.gigIdx` / `startGig` / `winGig` (~L985, L1056).** Remove `gigIdx` and the gig-advance path.
  `startGig` folds into `startRun`. **Win** = threshold met (the check currently in `playHand` at
  `run.gigScore >= gigThreshold()` → now a run-win, not a gig-win → `screen="win"`); **lose** = out of
  hands (`loseRun`, unchanged). `maybeAdvance()` (movement gate) fires on the single terminal state.
- **`offerDraft()` (~L1074) → called once from `startRun` only.** Delete the `winGig` re-draft call.
  The between-gig **Muse-draft dialog copy** that says the song "modulates to the next gig's key" (~L1491)
  is removed (it's now a run-start dialog, single key).
- **`gigThreshold()` (~L370).** Returns one number: the movement's flat `thr` in Campaign; a **single**
  Free-Play threshold (replacing the escalating `GIGS` `650/1150/1800` — retune to one value for a
  full-length run).
- **Budgets `PLAYS` / `DISCARDS` (~L268).** Today `PLAYS = 6` was **per gig** (18 hands/run total across 3
  gigs). For one session, set the run budget directly (e.g. `PLAYS ≈ 12–18`, `DISCARDS` to match) and size
  `LOOP_BARS` to it. Tunable.
- **Loop grid (`loopStripHTML`, ~L1228–1292).** Remove **section dividers** (`.secstart`), the
  **per-section key strip** (`.lsecbar`), and the **locked-cell** logic (the whole loop is writable in one
  key). Row-greying keys off `RUN_KEY`. The write head + click-to-aim (~L1344) are no longer confined to a
  section — the whole loop is aimable.
- **Save-a-Song (`saveSong`/`songReport` calls, ~L855–864, L1525).** `modKeyName()` → the single key name;
  pass `songReport` the key as a pc-array (drop the `sectionKey` function path — keep that code branch for
  imported/legacy songs, but a fresh run uses the simple array).
- **HUD / end overlay (~L1305–1315, L1491+).** Drop "Gig **X**/3" and per-gig framing; show one key + one
  threshold + one progress bar. `gigIdxClamped()`/`curGig()` collapse to the single config.
- **Untouched:** `classify`, the scheduler (`scheduleBar`/`scheduleVoices`/`barQueue`), the tempo system,
  the Codex, `MUSE_POOL` contents, and **M7 `hasABA` form scoring** — all read the loop bars or a hand, not
  the gig count. This is why removing gigs is mostly *deletion + collapse*, not a rewrite.

### Interactions with the other open issues

- **Known-issue #3 (a 4-beat bar can't hold a whole note + more).** Independent of gigs — the bar is still
  `BEATS = 4`. Removing gigs doesn't fix it, but it's a natural moment to revisit **bar capacity / letting a
  melodic hand span bars** since the loop model is already being reworked here.
- **Phase 4 "cross-gig accumulation" narrative retires.** The *mechanism* (one accumulating loop per run)
  **stays** — it just stops being "cross-gig / modulating" and becomes "the run's single-key song." Update
  the Phase 4 prose in **Progression** when built.
- **Campaign gates.** Movement gates already advance on the terminal state (`maybeAdvance` in `winGig`/
  `loseRun`); with one terminal state they simplify, no gate logic changes.

### Open items for this feature

- Final **hand/discard budget** and **loop length** for a one-session run (and the single Free-Play
  threshold).
- **Repeatable hand-size Muses** — how they behave without between-gig re-drafts (see fork 3).
- **Modulation at Melody (M4)** — the design of the player-driven key-change mechanic and its scoring
  lives with the Melody movement, not here (see the **Progression** note). This section only removes the
  *gig-boundary* modulation; M4 reintroduces key change deliberately.

*(Forks 1 & 2 are now decided — see above. The **accidentals** direction is recorded in **Progression →
Movement 1 (Pitch)**.)*

---

## The core pillar (why this pivot)

**In Balatro the poker hand is abstract; here the hand is audible.** When you play notes, they sound.
So a high-scoring hand (in-key, consonant, resolving) *sounds good* and a low-scoring hand sounds bad —
the score and your ear teach the same lesson at once. This is the whole reason for the pivot: the
lesson-grid taught theory but was **boring**; scoring + randomness + an audible payoff make learning a
side effect of chasing a number that happens to *be music*. Everything in the design should protect
this: **score must correlate with musical quality.**

---

## Design history (so the reasoning survives)

- **v0 — collection idea (from Inklings).** Kept: a **Codex** you fill, and an **offline validator**
  (Inklings' WordNet check → a music-theory checker). Dropped: the world/combat/farming/desk.
- **Rejected battle-genre spines:** auto-battler/merge-tactics, party monster-collector RPG,
  rhythm-command (Patapon), plain deckbuilder. Good "assemble a band" fits but each locked us into a
  battle genre. Parked as possible modes.
- **Rejected spine — grid + puzzle (Chrome Music Lab "Song Maker" × Incredibox).** *Was* the chosen
  spine and is **built as slice 1** (see below). **Why rejected as the main mode:** the puzzle/lesson
  loop taught theory but played as a dry exercise — "doing these lessons is very boring." It lacked
  randomness, replay excitement, and a real "I made something" payoff. **Kept** as a likely
  **free-compose side tool** (and its audio/validator code is reused).
- **Chosen spine — Balatro-style deckbuilder.** The dev wants Balatro's randomness/excitement, real
  music as output, and score tied to theory correctness. Suits = instruments; **ROYGBIV colors = the
  notes** (Newton). Daily play is **hard-capped** so it stays a ritual (and points players at the side
  games like Pitch Bird for more).

---

## Balatro → Mujicians mapping

| Balatro | Mujicians |
|---|---|
| Card (rank + suit) | **A note** — pitch (rank) + instrument (suit) |
| Suits (♠♥♦♣) | **Instruments** — 3–4 melodic to start (e.g. piano / guitar / bass), **drums later** |
| — | **ROYGBIV color = the note** (see below) |
| Poker hands (pair, flush, straight…) | **Musical structures** — interval < triad < 7th < arpeggio/scale-run < extended |
| "Flush" (all one suit) | **All notes in the round's key** (in-key = your flush) |
| "Straight" | **A scale run** (stepwise) or a **circle-of-fifths** move |
| Base chips × mult | **Applause** — structure gives the base; theory-correctness gives the mult |
| Planet cards (level a hand) | **Étude cards** — practice that levels up a chord/structure type |
| Tarot cards (transform a card) | **Accidental cards** — sharpen/flatten/transpose a note, or modulate the key |
| Jokers (the build engine) | **Muses** — passive scoring engines ("in-key notes +2 mult," "bass doubles," "a ii–V–I this gig = ×3") |
| Blinds (score gates) | **Gigs** — hit the applause threshold to pass |
| Boss blind gimmicks | **Boss gig** constraints — "atonal night: no in-key bonus," "minor key only," "one instrument silenced," "dissonance taxed," "key modulates each hand" |
| Ante (3 blinds) | **A Set** (3 gigs) |
| Shop between blinds | Buy Muses, Étude/Accidental cards, more notes/instruments |
| **Daily Run** (seeded) | **Daily Set** — one seed/day; the **hard-capped** daily play lives here |
| Unlockable decks/jokers | Meta-unlocks (instruments, Muses, keys, starting decks), persisted in the **Codex** |

---

## Cards, suits, and colors

- **A card = a note:** a pitch (the "rank") on an instrument (the "suit").
- **Starting deck = just the notes:** the 7 diatonic notes of C major on one instrument. Within a run
  you buy more notes, **accidentals**, and instruments (the deck grows, Balatro-style); across runs you
  unlock new starting decks. The deck should grow to ~20–40 cards so draws have variety.
- **Suits = instruments:** 3–4 melodic to start (piano / guitar / bass, maybe a 4th). **No drums in
  v1** — drums are pitchless and break the note model; add a percussion suit later as a special case.
  Instrument-based Muses are the "suit synergy" analog.
- **ROYGBIV colors = the notes (Newton).** Decided mapping — the **simplest letter-order** alignment:

  | Note | A | B | C | D | E | F | G |
  |------|---|---|---|---|---|---|---|
  | Color | Red | Orange | Yellow | Green | Blue | Indigo | Violet |

  Sharps/flats are **shades between** their neighbors (A♯ = red-orange, etc.), which also teaches that
  accidentals sit "between" the naturals. *Historical caveat: Newton's own note↔color assignment varied
  across his writings; we chose the clean ascending letter mapping for legibility, not fidelity.*

---

## Scoring model (sketch, to tune in play)

**Applause = base(structure) × mult(theory) + per-note chips**, roughly:

- **base** — the musical structure played: interval < triad < 7th chord < arpeggio/scale-run <
  extended chord. Leveled up by **Étude cards** (Balatro planet analog).
- **mult** — theory correctness stacks: all notes **in the round's key** (flush), **consonant** chord,
  contains a **resolution** (leading-tone→tonic, or V→I across hands), **circle-of-fifths** adjacency.
- **per-note chips** — each note adds chips; in-key notes add more.
- **Muses** stack further modifiers on top (the build engine).

Because the played notes are **sounded**, dissonant/out-of-key hands both **score low and sound bad** —
the design's load-bearing alignment.

**Per-gig economy (Balatro-faithful):** a limited number of **hands** and **discards** per gig
(e.g. 4 hands / 3 discards), a **shop** between gigs, escalating **applause thresholds**.

---

## The "made some music" payoff

A run is a sequence of played hands = a little set. At the end of a gig/run you can **hear your set
played back**, and share the **seed + your set**. That's the export/brag loop and the answer to "a user
could make some music that would be made."

**Now built:** each run is **one continuous loop you fill hand-by-hand across all 3 gigs** (Phase 4 — see
the "song loop" bullet under *Implemented*). The loop is allocated once per run and **never resets between
gigs**; each gig fills its own `SECTION_BARS`-bar section **in that gig's key**, so the accumulated song
legitimately **modulates C→G→F** across its three sections. The loop **keeps playing continuously through
the end of a run** — it does not cut off when a run finishes (win *or* lose) or when the between-gigs
**Muse draft** dialog pops up, so you keep hearing your creation while you read the result or pick a Muse.
The live loop cycles only the **song so far** (`loopLenNow()` = sections unlocked up to the current gig)
so early gigs don't loop through empty future bars. Still to do: a real **seed + set export/share**. The
**Save a Song** feature below (now a **whole-run** capture) is the first concrete piece of that export/brag
loop.

---

## Save a Song — Setlist, report card & export (**built**)

> **Status: built** in `mujicians.html`. Extends the existing per-gig loop and `persist` store. The
> report-card stats/thresholds and the prune cap are tunable placeholders. Design notes below describe the
> shipped behavior; the **detailed** theory breakdown remains the deferred upgrade.

**The problem it solves.** A song you build should be **keepable**. This feature lets a player **keep the
song they made** — name it, learn *why* it sounds good, replay it later, and share it.

> **⚠️ Phase 4 update (built):** the loop **no longer resets per gig** — it now accumulates across the
> whole run into one modulating song. So the save unit changed from *"the just-finished gig's loop"* to
> **the whole run's accumulated song**, captured **once at run's end** (win or lose). The per-gig,
> before-the-Muse-draft save beat described just below is **retired**; the copy in this section that says
> "one gig's loop / ~6-bar song / before the Muse draft" is the pre-Phase-4 design, kept for history.
> `run.saved` is now a single boolean (not a per-gig map). See *As built* and the *Progression* section.

**Decided (pre-Phase-4, superseded above):** save unit = **the just-finished gig's loop** (one save = one
~6-bar song); saved songs live in **both** a Home **Setlist gallery** *and* a copyable **share code**; the
theory breakdown is a **brief report card** for v1 (designed to grow into a detailed teaching breakdown
later); song names are **freeform with a suggested Noteling portmanteau** prefilled.

### When the dialog appears (the "before the Muse draft" beat)

A **Save Song?** dialog is offered **once per gig, right when that gig's loop is about to be lost** — the
natural capture point the dev identified:

- **Non-final gig win (gig 1→2, 2→3):** the dialog pops in `winGig()` **before `offerDraft()`** — i.e.
  *before the Muse draft*, exactly as requested. The just-finished loop is still grooving behind it (the
  loop already survives into the draft). **Save** or **Skip** → then proceed to the Muse draft.
- **Final gig win / losing gig (terminal states):** there's no Muse draft after these, so the save option
  lives as a **"💾 Save this song"** button on the **end overlay** (win *or* lose), alongside the existing
  "▶ Hear your set" toggle. The terminal gig's loop keeps grooving there, so it's saveable too.

Net: **every gig's loop is saveable exactly once**, at the moment it finishes. Empty/near-empty loops
(0 filled bars) skip the offer. Saving is always optional and never blocks progression.

### The dialog contents

1. **A live preview** — the loop is already grooving behind the overlay; a **▶/⏸** toggle lets the player
   audition it while deciding (reuse the existing `loopOn()`/`startLoop`/`stopLoop`).
2. **The report card** (brief v1 — see below).
3. **Name field**, prefilled with a **suggested portmanteau** (editable; see below).
4. **[Save]** and **[Skip]**.

### The report card (brief v1 → detailed later)

A short, plain-language **"why this sounds good"** panel, computed from the loop's filled bars
(`run.loop.bars` = `{cards, cls}[]`) and the gig key. **v1 (brief) shows ~4–5 lines + a rating:**

- **Key** — e.g. "C major" (the gig's key).
- **In-key %** — share of notes across all filled bars that are in the key.
- **Consonance grade** — a letter (A–F) from the share of consonant structures played (reuse
  `CONSONANT_IV` / each bar's `cls`).
- **Structures** — the chord/interval/run names played (from each bar's `cls.name`, e.g. "Cmaj7 · G7 · a
  scale run") — drawn from the same data the Codex logs.
- **One headline callout** — a single bridge-to-teaching line when present: **"Contains a V–I cadence"**,
  **"Contains a tritone (tension)"**, or **"Most-used note: E (blue)"**.
- **Overall rating** — ★☆ (or a letter grade) derived from in-key % + consonance + presence of a
  resolution. This is the "did I make something good" gut read.

**Design for growth:** compute all stats in **one `songReport(bars, key)` function** and have v1 render a
subset. The **deferred detailed breakdown** (the dev's "maybe down the road") is the *same* function's full
output — per-structure explanations, cadence/voice-leading callouts, tritone flags, note-frequency
histogram, "why it's in/out of key" — shown in a longer view. No re-architecture to upgrade.

### Naming — freeform + Noteling portmanteau

The name field is **prefilled with an auto-suggested portmanteau** the player can accept or overwrite
(Incredibox-style freeform underneath). The suggestion **blends the creature names of the loop's 2–3
most-used notes** from the Notelings roster (Ant/Blob/Chicken/Dog/Eye/Flower/Goat) — e.g. a loop leaning
on C, E, G → Chicken+Eye+Goat → **"Chiegoat"**. This is an on-brand word-game hook for this site and a
soft tie-in to the **Notelings** layer (it only needs the 7-name table, **no sprites** — so it can ship
before Notelings art). Optional mood suffix from chord quality (major → "…Blues/Bright", minor → "…Lament").

### Storage model

Add **`persist.setlist = []`** to the existing `localStorage["mujicians-save-v2"]` blob (additive —
default to `[]` on load, no key bump needed). Each saved song stores only what **playback + report** need
(not full card objects):

```
{ id, name, date, key:{root,mode,name}, tempo:curBarSec(),  // bar-seconds it was played at (60/BPM)
  bars:[ { notes:[{pc,letter,instId,midi}], cls:{type,name} }, … ],  // the loop, minimally serialized
  report:{…},        // cached report-card stats (or recompute on open)
  gigThreshold, applause,   // flavor stats
  starred:false }
```

**Prune cap:** keep the most-recent **N** (e.g. 20–30); **★-favorited** songs are pinned and never pruned
(keeps localStorage bounded).

### Home "Setlist" gallery

A **"Your Setlist"** section on the home screen lists saved songs (name · key · ★). Per row:

- **▶ Play** — audition the saved loop standalone. Requires generalizing the scheduler
  (`scheduleBar`/`schedTick`) to take a **`(bars, tempo)`** pair so both the in-run loop *and* gallery
  playback share one code path (a small `playSong(song)` that feeds the scheduler a transient loop).
- **★ Favorite** (pin), **✎ Rename**, **🗑 Delete**, **⧉ Export** (copy share code).
- *(Future — not built)* a **mini pitch-grid thumbnail** of the loop on each row. Specced under
  *Future: mini pitch-grid thumbnail* below.

### Share code (export/import)

Each song has a **compact, versioned code** (e.g. `MJ1:` + base64 of terse JSON: key, tempo, bars as
`pc+instId+octave` lists). A **"paste code"** box in the Setlist imports it (creates an entry / plays it).
This **shares its encoder with the eventual Daily-Set seed export**, so building it here advances that too.

### Other additions considered (menu — not all v1)

- **★ Favorite / pin** — v1 (also protects from prune).
- **Mood tag** (major/minor/diminished lean) auto-derived — v1 (part of the report).
- **Gig applause + rating** shown as stats on the card — v1.
- **Mini pitch-grid thumbnail** in the gallery — **future, not built** (specced below under *Future: mini
  pitch-grid thumbnail*).
- **Detailed theory breakdown** (the report card's full form) — deferred, the "down the road" upgrade.
- **Notelings cross-link** — once Notelings art lands, a saved-song card can show the creatures it
  summoned (the portmanteau already names them); see the **Notelings** section.
- **Daily-Set convergence** — the share encoder feeds the planned seed+set export.

### As built (code map)

- **Trigger (Phase 4 — whole-run):** the save is offered **once, at run's end** — the **end overlay**
  (`renderEndOverlay`) shows a **💾 Save this song** button on the final win *or* any loss (retScreen
  `"win"`/`"lose"`), disabled to **✓ Saved** once done (tracked by the single boolean `run.saved`).
  `offerSave(retScreen)` snapshots the **whole** `run.loop.bars`. `screen==="save"` renders the gig board
  behind + `renderSaveOverlay()`. *(The pre-Phase-4 per-gig `offerSave(gigIdx,"draft")` before the Muse
  draft is removed — the loop no longer resets between gigs.)*
- **Snapshot/model:** `snapshotBars()` stores per filled bar `{cards:[{pc,letter,instId,midi}], cls, dyn,
  fig, arp}`; `saveSong(bars,name)` pushes `{id,name,date,keyName,key,tempo,bars,stars,starred}` onto
  `persist.setlist` (`localStorage["mujicians-save-v2"]`, additive) and `pruneSetlist()` caps at
  `SETLIST_CAP=30` (★-pinned never pruned). A whole-run save stores `keyName:"C→G→F"` (`modKeyName()`, since
  it modulates) and `key:GIGS[0].key` (home key; Setlist replay is key-agnostic — sound is from MIDI).
- **Report card:** `songReport(bars,key)` computes `{inKeyPct, structs, consGrade, consRatio, cadence,
  tritone, topLetter, stars}`. `key` is either a **pc-array** (single-key songs / imports) or a
  **function `barIndex→pc-array`** (the whole-run save passes `sectionKey`, so in-key% and cadences are
  judged **per section against that gig's key**). `reportCardHTML()` renders the **brief** subset; the
  detailed breakdown = same stats, longer view (deferred).
- **Naming:** `suggestName(bars)` blends the `NOTELING` names of the top-used notes (C+E+G → "Chiegoat").
- **Playback:** the scheduler is generalized via `playSrc={bars,n}` — `startLoop()` grooves the live gig
  loop; `startLoop({bars,n})` grooves a saved song (`toggleSongPlay` in the Setlist, `galleryPlayId`).
- **Setlist gallery:** `setlistHTML()`/`wireSetlist()` on Home — ▶ play · ★ favorite · ✎ rename · ⧉ export
  · 🗑 delete, plus a **paste-code Import** row.
- **Share code:** `encodeSong()`/`decodeSong()` → `MJ1:` + base64 JSON (bars as `[pc,instId,midi]`, cls
  recomputed via `classify` on import). Shares its encoder with the eventual Daily-Set export.

### Future: mini pitch-grid thumbnail (**not built**)

> **Status: possible future feature, not built.** Recorded so the eventual build matches intent.

Give each **Setlist row** a tiny, non-interactive **pitch-grid preview** of the saved loop — the same
"rows = pitches, columns = bars, cells = ROYGBIV note colors" language as the live loop grid, shrunk to a
row-sized glyph. It turns the gallery from a text list into a **visual index** you can scan: a busy
resolving loop and a sparse two-note loop read differently at a glance, and the colors hint at the key/mood
before you even hit ▶.

**How it should be built (when we do it):**

- **Reuse, don't fork, the loop renderer.** Factor the cell-painting core out of `loopStripHTML()` into a
  shared helper that takes `(bars, key, opts)` and can emit a **static, label-less, non-clickable** variant
  — no write-head/playhead/ghost/"good"-glow decorations, no row labels, just filled color cells on the
  dark grid. The Setlist thumbnail and the full in-gig grid then share one source of truth for the
  note→cell→color mapping (keep the ROYGBIV `COLOR` lookup identical so a song looks the same shrunk).
- **Compact geometry.** Fewer visible rows than the full grid (it spans the whole deck range). Options:
  collapse to **one row per in-key scale degree** (+ an "off-key" lane), or octave-fold to ~7–12 rows.
  Cells a few px tall; the whole thumbnail ~a row's height (e.g. 40–56px tall), CSS `image-rendering`
  left default (it's DOM cells, not a raster). Prefer a **CSS grid of divs** first (matches current
  approach, no canvas); switch to a cached `<canvas>`/data-URL only if a long Setlist shows lag.
- **Data is already there.** A saved song's `bars` carry `{cards:[{pc,letter,instId,midi}], cls}` — exactly
  what the grid needs. No new stored fields; render on the fly from `song.bars` + `song.key`.
- **Playback tie-in (optional).** If the row is auditioning (`galleryPlayId===song.id`), the thumbnail
  *could* host the sweeping playhead by reusing `paintPlayCol` against a per-row scoped selector — but this
  is gravy; a static thumbnail is the feature.

**Open sub-questions:** exact row-collapse scheme (scale-degree vs octave-fold); whether the thumbnail is
tap-to-play on touch; and whether to also show it on the **Save modal** and the **end overlay** as the
"here's what you made" glyph.

### Open items for this feature

- Exact **rating formula** and consonance-grade thresholds (tune in play).
- Whether a **losing** gig's loop is worth offering to save (leaning yes — it still played).
- Portmanteau blend rules when notes tie / a two-note loop reads awkwardly (fallback: key + mood name).
- Prune cap number and whether the gallery paginates.

---

## Notelings — letter-creatures, combos & the Bestiary (**tentative**)

> **Status: design, not built.** A collection + story layer proposed by the dev. Nothing here is coded
> yet; it's recorded so the reasoning survives and the eventual build matches intent. It **extends**
> (doesn't replace) the ROYGBIV card model and the Codex. Numbers/rosters are placeholders.

**The seed.** There are only seven note letters (A–G), so there are exactly **seven base creatures** —
a naturally closed, collectible set. Each note *already* owns a ROYGBIV color in code (`COLOR`), so a
Noteling arrives **pre-colored**: playing a card summons its creature and the card's existing color *is*
the creature's color. The theory and the mascot are the same object.

**Starting roster (emoji stand-ins).** The dev's picks, each in its note's ROYGBIV color:

| Note | Noteling | Stand-in | Color |
|------|----------|----------|-------|
| A | **Ant** | 🐜 | Red |
| B | **Blob** | 🫧 | Orange |
| C | **Chicken** | 🐔 | Yellow |
| D | **Dog** | 🐕 | Green |
| E | **Eye** | 👁️ | Blue |
| F | **Flower** | 🌸 | Indigo |
| G | **Goat** | 🐐 | Violet |

(Emoji are placeholders; 🫧 for Blob especially. They swap for the dev's pixel sprites later — see *Art &
swap path* below.)

**What each music concept maps to a visual channel** (so the picture teaches the theory — the same
alignment the audio already provides):

- **Letter → base form** (which of the seven creatures).
- **ROYGBIV → color** (already in `COLOR`).
- **Accidental → morphology.** **Sharp (♯) = more angular / spikier**, **flat (♭) = more squarish /
  rounder** — teaching "accidentals sit *between* the naturals." Stacks with the doc's existing
  "accidentals are in-between color shades" (♯ = warmer shade toward the next letter, ♭ = cooler),
  giving two reinforcing channels. (Accidentals aren't in the deck yet — this waits on the Accidental
  cards.)
- **Instrument (suit) → breed / material.** Same letter, different texture: Piano = crystalline,
  Guitar = furry/wooden, Bass = heavy/stone. Gives 7×3 collectible variants off seven base designs. In
  the **stand-in phase the card keeps its small instrument emoji** (🎹/🎸/🎻) as the breed mark.
- **Octave → size.** Bass-register creatures are big elders; high piano ones are tiny — so the loop's
  pitch grid reads as "big beasts low, little ones high."
- **Consonance → fusion quality (the load-bearing one).** A consonant hand fuses into a smooth,
  cohesive creature; a dissonant one fuses badly (mismatched limbs, snarling, coming apart). The **look
  tracks the sound**, exactly as score already does — the game's pillar extended to the eye.
- **Chord quality → temperament.** Major = bright/cute, minor = melancholy, diminished = spooky,
  augmented = uncanny. Same creatures, different mood by interval content.
- **In-key vs out-of-key → healthy vs feral/corrupted.** In-key Notelings glow; an out-of-key note
  shows as a greyed, corrupted limb — a direct extension of the loop grid **already greying off-key
  rows**.
- **Resolution → the creature settling/evolving.** A cadence (leading-tone→tonic, V→I) lets the chimera
  resolve into a stable finished form — resolution as a visible payoff.
- **Tritone → the "devil's interval" monster.** The tritone fuses two creatures into something
  genuinely unstable/demonic — a memorable teaching beat for why it's special.

**Combos — party for runs, fusion for chords (decided).**
- A **chord** (interval / triad / 7th) plays as **one fused chimera**: interval = 2-part, triad =
  3-part, 7th = 4-part. Emergent, striking, but only truly renders with sprites — until then a chord
  shows its component Noteling emojis **clustered** plus the portmanteau name.
- A **scale run** plays as a **party**: a segmented parade / conga-line of the contiguous creatures
  (keeps 5-note hands legible and reads as "stepwise"). Stand-in = the emoji laid out in a line.
- **Portmanteau names** blend the members (Chicken+Eye+Goat → *"Chiegoat"*) — an on-brand word-game hook
  for this word-games site, and the label under a summoned chimera.

**Collection & story.**
- **The Codex becomes the Bestiary.** The Codex already logs every recognized structure (inherited from
  Inklings); reframed, you're a **Mujician naturalist cataloguing sound-creatures** — each new
  chord/interval/run adds a specimen. Rare structures (7ths, later 13ths/altered, a clean ii–V–I) unlock
  **named legendary chimeras** — the Balatro-style "find the combo" carrot. (In code this can start as a
  relabel/skin of the existing Codex, then grow its own view.)
- **Meta unlocks.** Wordhoard-style, completing Bestiary sets could grant **new starting creatures/decks**
  (ties into the existing "unlock new starting decks" meta).
- **Story frame.** In the *Mujicians* world magic is made of music, so Notelings are **notes given
  flesh** — you summon them by performing. A gig is a **performance that conjures a menagerie**; the
  repeating loop is the creatures *living/dancing* in the groove you built; a **boss gig** could be a
  rival Mujician conducting a deliberately dissonant beast you must out-harmonize. (No prose story in
  v1 — the flavor is enough, per the doc's stance.)

**Art & swap path (decided).** Mirror **Inklings' load-with-fallback** sprite pipeline (see
[`inklings.md`](inklings.md) — `SPRITESHEET`/`drawGlyph`, custom `sprite` PNG auto-used once added,
"no code change needed"):

- A **`NOTELINGS` registry** keyed by letter, each `{ name, emoji, sprite:null }`. The renderer prefers
  `sprite` (a pixel PNG at a declared path) when present, else falls back to the `emoji`. Drop the dev's
  art in → it swaps live, no code change. This is the **"swap emojis for my own sprites"** requirement.
- **Pixel style, phased.** v1 = **pixel creatures inside the current dark-neon skin** — `image-rendering:
  pixelated` on the creature art, emoji stand-ins now. The **broader retro-pixel chrome port** (square
  corners, chunky ink borders, hard offset drop-shadows — Inklings' look) is **deferred** (still tracked
  under the *visual identity* open question).
- **v1 surfaces:** the **card face** (Noteling art + a **small A–G letter in its ROYGBIV color** kept as
  the teaching label + the instrument emoji as breed mark) and the **Bestiary** (the reframed Codex).
  The **summoned party/fusion chimera on Play**, Notelings lighting the **loop-grid** cells, and true
  procedural fusion are **documented stretch**, gated on real sprites.

**Decided (this pass):** party-for-runs / fusion-for-chords; **skip enharmonics for v1** (one skin per
pitch — no separate A♯-vs-B♭ creature yet); collective name **"Notelings"**; emoji stand-ins that swap to
sprites; Inklings pixel look but **pixel-creatures-only** for now (keep the neon skin); card shows
**creature + small note letter**.

**Still open:** exact procedural-fusion rendering; whether instrument becomes a texture/tint vs. keeping
the emoji long-term; the legendary-chimera recipe list; party-line layout; whether "Bestiary" renames the
Codex in code or is a new view; and the deferred full retro-pixel reskin.

---

## Progression — the seven-movement campaign (**Phases 0–2 + Phase 3 Stage 1 + Phase 4 core built; Rhythm depth remains**)

> **Phase 4 core is now built** (see the Phase 4 build-order bullet for the code map): the loop
> **accumulates across the whole run into one modulating C→G→F song** (allocated in `startRun`, sectioned
> per gig, scrollable grid with a per-section key strip), **M7 form scoring is real** (phrase-fingerprint
> restatement + an A·B·A return bonus over the accumulated bars), the **M7 gate is real** (`hasABA` —
> compose an A·B·A), and **Save-a-Song is a whole-run capture** at run's end. Deferred: boss-gig capstones,
> mentor prose, and the rest of the Rhythm subsystem (Phase 3 later stages).

> **Status: designed, and Phases 0 (scaffold) + 1 (Movement 1 + gate/advancement engine) + 2 (the whole
> M2→M7 arc walkable, thin) + Phase 3 Stage 1 (M2 Rhythm sub-bar grid + fixed figures) are now built** in
> `mujicians.html`; the deeper *content* still planned is the rest of the Rhythm subsystem (Phase 3 later
> stages — draftable figures, syncopation, explicit rests) and real cross-gig Structure scoring (Phase 4). A long-arc progression
> system proposed by the dev, grounded in the *Mujicians* graphic-novel structure. It **layers on top of**
> (doesn't revert) the current full-feature run — today's game is preserved as the "everything unlocked"
> **Free Play** mode (see below). Numbers, gate counts, and scoring terms are placeholders.
>
> **Built (Phase 2 — the middle movements, thin):** every declared scoring term is now wired into `score()`
> — **groove** (M2, a flat "kept the beat" +1 placeholder until Phase 3's sub-bar timing), **dynamic**
> (M3, a contrast bonus for varying loudness across the loop), **melodic** (M4, +1 interval / +2 run for
> stepwise motion), **timbre** (M6, +1 mult per extra distinct instrument voice), **form** (M7, a thin
> restatement bonus — repeating a structure already in the loop — placeholder until cross-gig accumulation).
> **M3 Dynamics is done properly:** a per-hand **p / mf / f** segmented control (`dynControlHTML`, shown
> whenever the `dynamic` term is live) sets the loudness of the next hand; it drives note **gain** via a
> velocity multiplier on `_tone`/`soundCards`/`scheduleBar` (each loop bar remembers its `dyn`, so playback
> and saved songs reproduce it), and varying it earns the contrast bonus. **M4 melody plays as a sequence:**
> `handIsSequenced()` arpeggiates a hand when the movement is melodic-but-not-yet-harmonic (so M4 = notes in
> a row; M5+ = stacked chords). **M6 unlocks guitar+bass** (already via `instrumentsFor`, `INSTRUMENT_UNLOCK_MV=6`).
> **Thin real per-mechanic gates** replace the old "clear the Set" placeholders for M3–M6: M3 = play soft +
> medium + loud; M4 = log `GATE_INTERVALS` intervals + a scale run; M5 = log `GATE_TRIADS` consonant triads
> + a tonic cadence; M6 = play `GATE_BLENDS` multi-instrument blends. M2 stays a "keep the beat, play
> `GATE_HANDS` hands" count (real groove gate waits on Phase 3), and M7 stays "clear the Set" (form scoring
> waits on Phase 4's cross-gig loop). All gate trackers live on `run` and feed `gateStatus(mv)`. Flat
> campaign thresholds and the Free-Play `GIGS` thresholds were **retuned** as terms switched on (tunable).
>
> **Built (Phase 0 scaffold):** a `MOVEMENTS` registry (7 movements, each with `maxSelect`, campaign
> threshold `thr`, and active scoring `terms`); `persist.progress = {movement, gates}` (additive to
> `mujicians-save-v2`, default `{movement:1}`); `startRun(mode)` sets `run.movement` from the mode
> (`"campaign"` → the reached movement, `"free"` → 7); `maxSelect()`/`termOn()` gate the select cap and
> `score()`'s terms; a **Home mode select** (Campaign · Movement N vs Free Play, both under the daily cap);
> an in-gig HUD badge. *(As of Phase 2 every term is now wired; at Phase 0 only `'inkey'`/`'consonant'`/
> `'resolves'` were.)* Free Play (movement 7) = all terms on — it's the campaign's end state, so as Phase 2
> added terms it grew past the M1-era formula (no longer "byte-for-byte" the pre-progression game, by design:
> "score grows, never rewrites").
>
> **Built (Phase 1 — Movement 1 + the gate engine):**
> - **Deck restriction by movement** — `buildDeck(mv)` uses `instrumentsFor(mv)`: **piano only until M6**
>   (Timbre), all three at M6+. `loopRowMidis()` now derives rows from the run's actual deck, so a
>   restricted movement doesn't render empty bass/guitar rows. (Instruments already existed; the campaign
>   *gates* them rather than adding new ones.)
> - **Campaign thresholds** — `gigThreshold()` returns the movement's flat `thr` (M1–M3 = 40, M4 = 220,
>   M5 = 520, M6 = 620) so each chapter is winnable with that movement's toolset; Free Play / M7 keep the
>   escalating `GIGS` thresholds (650/1150/1800). Wired into the win-check, progress bar, and scoreline.
> - **The gate/advancement engine** — `gateStatus(mv)` returns the Codex-style objective. **M1 is the real
>   one: play every in-key letter (all 7 note names)** — and this progress **persists across runs**
>   (`persist.progress.gates.pitch`, an additive letter list; `collectPitchLetter` in `playHand`, read by
>   `pitchLettersGot`), so a fresh run keeps prior letters instead of resetting to 0/7. It's surfaced as a
>   **hangman row** (`pitchTrackerHTML`) — seven underscore slots in ROYGBIV order that reveal their colored
>   letter once played in-key — shown in the in-gig HUD, on the end overlay, and on Home under the Campaign
>   button. M2–M6 are **placeholder gates** ("clear the Set") until their mechanics land. `maybeAdvance()`
>   (called from the final `winGig` and from `loseRun` — the gate can be met on a loss too) bumps
>   `persist.progress.movement` when the frontier movement's gate is met. The in-gig HUD shows live gate
>   progress; the **end overlay** shows a "🎓 Movement complete — unlocked M_n_" banner, or the gate still
>   needed. "New Run" restarts in the same mode.

### The core idea (why this exists)

Today the game drops you straight into **harmony** — triads, 7ths, and scale runs from card one. That's
teaching jazz voicings before single notes. The graphic novel's arc — **pitch → rhythm → dynamics →
melody → harmony → texture (timbre) → structure** — is (not coincidentally) the canonical order music is
actually taught: you can't build harmony before you have pitch, or structure before you have melodies to
arrange. So progression = **each element is a "movement" that unlocks one mechanic *and* adds one scoring
term**, in that order. The mechanic *is* the lesson; the current full game is what you arrive at.

The dev's "one card at a time at first, more cards as you advance" is **not an arbitrary XP gate** — it
*is* the pitch→melody→harmony progression: one note (pitch), then notes-in-a-row (melody), then
notes-stacked (harmony). Earning more cards and earning theory are the same act.

### Decided this pass

- **Shape = linear 7-movement campaign** (ordered, matches the novel's arc). Not a skill tree.
- **Gate = Codex/Bestiary milestones.** You advance by *cataloguing the concept* ("log 3 in-key
  melodies → unlock Harmony"), not by grinding an applause total. Forces playing the idea; most on-brand
  with the naturalist/Bestiary framing. **Renown** (cumulative applause) stays as a cosmetic prestige
  title, **not** the gate.
- **Free Play stays, but daily-capped.** The current all-features run is preserved as a **Free Play /
  Conservatory** mode = the "movement-7, everything on" state — *nothing is reverted*. But the **hard
  daily cap (`MAX_RUNS_PER_DAY`) is global** — it applies to Free Play too. The cap is the ritual; Free
  Play is "play the full game," not "play unlimited." (DEV override still bypasses the cap for testing.)
- **Plan all 7 movements before building** (including the heavy Rhythm system), then build in order.

### The seven movements

Each movement unlocks a mechanic, turns on one scoring term (so scoring *grows* — it never rewrites), and
has a Codex/Bestiary graduation gate. Because today's `score()` already **sums bonuses**, the plan is to
**gate which bonuses are active** by `progress.movement` — so "all terms on" is exactly today's formula,
which is why Free Play is a no-code-change end state.

| # | Element | Unlocks (mechanic) | Scoring term added | Codex gate to advance (placeholder) | Build lift |
|---|---------|--------------------|--------------------|--------------------------------------|-----------|
| 1 | **Pitch** | **One card at a time**; single notes only. Learn the 7 letters + ROYGBIV. | in-key? (×2 / ×1) | catalog all 7 note-letters played **in key** | tiny |
| 2 | **Rhythm** | **Sub-bar timing** — note placement/duration on beats, rests, a small deck of rhythm figures | groove (on-beat, non-empty) | log N loops that hit a groove threshold | **heavy** |
| 3 | **Dynamics** | **Velocity per note** (p / mf / f), accents, crescendo shape | dynamic-contrast bonus | log N loops with real dynamic variety | cheap |
| 4 | **Melody** | **Select 2–3 cards played in *sequence*** — intervals + scale runs turn on; `MAX_SELECT` grows | stepwise-motion / contour | catalog N intervals + 1 scale run | medium |
| 5 | **Harmony** | **Stack cards *simultaneously*** — triads, 7ths, consonance, cadences (today's core) | the current mult stack (consonant, resolves, flush) | catalog N consonant triads + 1 V–I cadence | **already built** |
| 6 | **Timbre** | **More instruments/suits unlock here**; multi-voice layering/orchestration | instrument-blend synergy | play N multi-instrument blends | medium |
| 7 | **Structure** | **Form across bars & across the 3-gig set** — AABA, verse/chorus, the accumulated song | phrase/form bonus | complete one structured form (e.g. AABA) | medium |

Graduating movement 7 unlocks **Free Play** (all terms on = today's game, still daily-capped).

### How the "one card → more cards" arc plays out (the load-bearing detail)

- **M1 Pitch:** `handSize` small, **`MAX_SELECT = 1`**. You play one note; it lands on the bar's downbeat.
  Score is legible: `chips × (in-key ? 2 : 1)`. A beginner grasps it instantly.
  **Accidentals belong here (planned, not built).** The dev's call: **introduce accidentals (♯/♭ — the 5
  chromatic notes) within the Pitch movement**, after the 7 naturals are learned — Pitch's own internal
  "levels" (naturals first → accidentals next). It's the musically correct home (accidentals *are* pitch),
  and it feeds the already-designed hooks: the ROYGBIV **in-between shades** (♯ warmer toward the next
  letter, ♭ cooler), the Notelings **morphology** channel (♯ = spikier, ♭ = rounder), and the deck-growth
  **Accidental cards** (the Tarot analog). Until built, the deck is the 7 naturals only. *(Open: whether
  accidentals arrive as new deck cards, as an Accidental-card transform, or as a sub-level gate inside M1.)*
- **M2 Rhythm / M3 Dynamics:** still one card, but now you place it *in time* and *at a volume* — the same
  note becomes expressive. New axes, still `MAX_SELECT = 1`.
- **M4 Melody:** **`MAX_SELECT` rises to ~3**, played **in sequence** (a line across beats — this needs
  M2's timing). `classify`'s interval + scale-run detection switches on. **Key change / modulation is
  introduced here (planned, not built)** — with gigs gone, a run is single-key, and **Melody is the home
  for teaching modulation**: a player-performed mid-song key-change (moving the melodic line to a new key,
  scored on smooth/circle-of-fifths pivots). It's deliberately taught, not an always-on run feature — see
  the **Removing gigs** section, fork 2.
- **M5 Harmony:** **`MAX_SELECT = 5`**, cards can be stacked **simultaneously**; triad/7th/consonance/
  cadence scoring switches on (today's behavior).
- **M6–M7:** more instruments and form scoring, no further select growth.

So `MAX_SELECT` and `handSize` **grow as a function of `progress.movement`**, and the existing hand-size
Muses (Extra Hand / Big Hand) become boosts *on top of* the movement floor.

### Scoring evolution (protecting the pillar)

The pillar is **score correlates with sound**. Progression protects it because each movement
**multiplies in one more factor** rather than replacing the formula:

```
M1: chips × inKeyMult
M2: … × grooveMult
M3: … × dynamicMult
M4: … × melodicMult
M5: … × (consonant, resolves, flush)   ← today's stack
M6: … × timbreBlendMult
M7: … × formMult
```

By movement 7 you've *arrived at* today's full stacked Applause formula — but you understand every term
because you earned it one at a time. Implementation: keep one `score()` that reads `progress.movement`
(or an `activeTerms` set) and skips inactive terms; Free Play sets them all active.

### The heavy one — Rhythm (movement 2), designed in full

Rhythm is the only movement that needs a genuinely new subsystem (sub-bar time). Design:

- **Sub-bar grid.** Each bar (currently one loop column) subdivides into **`BEATS` sub-slots** (start with
  4). The loop pitch-grid gains **sub-columns**: `rows = pitch`, `columns = bars × BEATS`. Cells stay the
  same ROYGBIV language, just finer.
- **How a hand gets a rhythm — a small "rhythm figure" deck.** Rather than free note-drawing (too fiddly
  for a card game), the player **picks a rhythm figure** when placing a hand: e.g. *four-on-the-floor*,
  *straight eighths*, *a syncopated push*, *dotted*, *with a rest*. Figures are **unlockable/collectible**
  (a Codex sub-set — teaches note values by name) and later **draftable like Muses/Étude cards**. The
  figure maps the played note(s) onto beat offsets within the bar.
- **Scheduler change.** `scheduleBar` today fires a bar's notes at its downbeat (runs arpeggiated). Extend
  it to schedule each note at **`t + beatOffset × (barSec / BEATS)`** per the chosen figure. The
  lookahead scheduler and the onset-queue playhead (`barQueue`) already tick per bar — subdivide to a
  **beat queue** so the sweep lands on sub-columns.
- **Scoring term — groove.** Reward: notes **on the beat**, **no empty downbeats**, and (later movements)
  **syncopation** and **rhythmic consistency across the loop**. Audible payoff is immediate — a rhythmic
  loop sounds like music where a block chord doesn't.
- **Rests.** A rest is a figure with a silent slot (or a dedicated rest token), teaching that silence is
  rhythm too. Cheap once the sub-grid exists.

Because this is the big lift, it can be **staged**: ship the sub-bar grid + 3–4 fixed figures first;
add draftable figures, syncopation scoring, and rests later. (Movements 1, 3, 4 are cheap; 5 is built; 6
and 7 are medium — so Rhythm is the pole that holds up the tent, plan it first per the dev's call.)

### Framing & tie-ins (free wins)

- **Diegetic arc = the graphic novel.** Each movement is a **chapter/mentor** from the *Mujicians* story;
  the player learning the seven elements mirrors the protagonist learning music-magic. This is the game's
  first real story hook (the doc's stance so far is "no prose story yet — flavor is enough"; the
  movements give a spine to add prose to *later* without inventing new fiction).
- **Boss gigs = movement capstones.** The already-planned boss-gig constraints become the **exam at the
  end of each chapter** (a rival Mujician conducting a deliberately dissonant beast, per Notelings).
- **Codex ⇄ Bestiary.** The graduation gates *are* Codex milestones, so this reuses the existing Codex and
  strengthens the naturalist framing — you literally catalogue your way to the next element.

### As it would be built (code map, when we do it)

- **New `persist.progress`** in `localStorage["mujicians-save-v2"]` (additive, default `{movement:1}` on
  load): `{ movement, gates:{…} }` tracking catalogued counts per gate. Free Play sets `movement:7`.
- **`MOVEMENTS` registry** — an array of `{ element, maxSelect, activeTerms, gate(codex)→bool, mentor }`.
  `MAX_SELECT` and the active scoring terms **read from `MOVEMENTS[progress.movement]`** instead of being
  constants.
- **`score()` gates terms** by `activeTerms` (no formula rewrite).
- **`classify` unchanged** — it already detects everything; movements just decide which results *score*.
- **Rhythm subsystem** (sub-bar grid + figure deck + scheduler beat-offsets) is its own module, gated off
  until movement ≥ 2.
- **Mode select on Home:** *Campaign* (movement flow) vs *Free Play* (all on) — both consume the **global
  daily cap**.

### Build order (sequenced)

Organizing principle: **build the enabling refactor once, then walk the whole 7-movement arc "thin"
end-to-end before deepening the one heavy subsystem (Rhythm).** Proves progression *feels* good fast;
matches the doc's vertical-slice philosophy. Each phase is a shippable unit.

- **Phase 0 — Progression scaffold (spine, no new mechanic). ✅ BUILT.** Added `persist.progress =
  {movement, gates}` (additive to the save blob); added the `MOVEMENTS` registry; the select cap and the
  active `score()` terms now read from `MOVEMENTS[run.movement]` via `maxSelect()`/`termOn()` (the old
  `MAX_SELECT` constant is gone); **Home mode select: Campaign vs Free Play** (Free Play = `movement:7` =
  today's exact game). Global daily cap covers both; the "New Run" button keeps the finished run's mode.
  *Net: today's game reachable via Free Play; Campaign runs at the reached movement (default M1). Pure
  plumbing, nothing reverted.* Movement content (M1 restrictions, gate advancement) is Phase 1+.
- **Phase 1 — Movement 1 (Pitch) + the gate engine. ✅ BUILT.** `maxSelect:1` (from Phase 0); single-note
  in-key scoring; **starting deck restricted to piano** (`instrumentsFor`, guitar/bass held for M6);
  movement-scaled flat campaign thresholds (`gigThreshold()`, M1 = 40 so it's winnable); the reusable
  **gate/advancement engine** (`gateStatus`/`maybeAdvance`) — M1's real gate is "play all 7 in-key letters"
  (**persisted across runs** in `persist.progress.gates.pitch`, shown as a hangman row via `pitchTrackerHTML`),
  M2–M6 are placeholder "clear the Set" gates. HUD gate progress + end-overlay "Movement complete" banner.
- **Phase 2 — Thin-slice the middle movements (walk the whole arc). ✅ BUILT.** M2→M7 now *walkable*:
  **M2 Rhythm** placeholder (downbeat only, groove = flat "kept the beat" +1); **M3 Dynamics** done properly
  (per-hand **p/mf/f** control → note gain via a velocity multiplier + a dynamic-contrast bonus for varying
  it across the loop; each bar remembers its `dyn` so playback/saved songs reproduce it); **M4 Melody**
  (`maxSelect→3`, hands **arpeggiate as a sequence** via `handIsSequenced`, interval/run melodic scoring on);
  **M5 Harmony** (`maxSelect→5`, existing consonance/cadence/flush stack); **M6 Timbre** (guitar+bass unlock
  via `instrumentsFor`, +1 mult per extra voice blend); **M7 Structure** thin restatement form bonus.
  **Thin real per-mechanic gates** for M3–M6 (M2 = hand-count, M7 = clear-the-Set) forcing each mechanic.
  Flat campaign + Free-Play thresholds retuned. ⚠️ Real M7 form still depends on the unbuilt "accumulate one
  loop across all 3 gigs" (Phase 4); the real groove gate/scoring depends on Phase 3's sub-bar timing —
  both shipped as flagged placeholders. *Net: full 7-chapter campaign playable end-to-end.*
  **Future (dev):** dynamics should eventually gain explicit **symbols** (crescendo/decrescendo, accents)
  as their own figure-like picks — for now it's the simple per-hand p/mf/f marking.
- **Phase 3 — Deepen Rhythm (the heavy subsystem). ✅ STAGE 1 BUILT (superseded); ✅ STAGE 2A BUILT
  (per-note durations).** Sub-bar grid (`BEATS`=4 sub-columns); scheduler beat-offsets reusing the
  `barQueue` onset-queue playhead → beat queue; real groove scoring. **Stage 1 shipped a fixed rhythm-figure
  picker**, but playtest exposed a design flaw (see Stage 2) — the figure model **fought melody** (multi-note
  hands always sorted ascending + evenly spread), so **Stage 2A replaced figures with per-note durations**
  (the `FIGURES` roster / `figControlHTML` / `bar.fig` are gone).
  - **As built (Stage 2A):** the `FIGURES` picker is replaced by a **`DURATIONS` palette** (quarter `♩` 1
    beat · half `𝅗𝅥` 2 · whole `𝅝` 4, each `{id,label,slots}`) on the `BEATS`=4 grid. **Each selected note
    carries its own duration** in `run.noteDur[cardId]` (keyed by the stable card id so it survives Sort;
    default quarter, `noteDurOf`). A **melodic hand plays its notes in PICK ORDER, back-to-back, each for
    its duration** (leftover bar = a rest); a harmony stack rings the bar. `handIsSequenced(cls,n)` decides
    which: runs + rhythm-on single/melodic hands sequence; an M5+ multi-note consonant stack rings. **The
    ascending sort is gone** — `scheduleVoices(cards,{arp,vel,durs,bs,when})` lays sequenced notes at
    cumulative onsets from `durs` (clip/rest at the bar edge, no dropping) and drives both the live preview
    (`soundCards`) and the loop scheduler (`scheduleBar`). Bars store **`durs`** (parallel to `cards`);
    `snapshotBars`/playback read it; the `MJ1:` code omits it → default quarter (sequenced) / ring (stacked),
    and legacy `fig` bars fall back to quarters. The loop grid's **`barHits`→`{on,held}`** lights each note's
    attack (full color) and its **held beats** (`.held`, dimmer) so **note length is visible**; the write
    ghost previews the selection's rhythm (`hitsFor`, `.ghost`/`.gheld`). The picker is a **`seqControlHTML`
    sequence editor** — the picked cards left-to-right in play order, each with `♩/𝅗𝅥/𝅝` `durbtn`s (so the
    order is visible and editable). **Groove scoring:** `groove +1` for keeping the beat + `rhythmic variety
    +1` for ≥2 distinct durations in a melodic hand (tunable). **The M2 gate:** *play each note value*
    (`gateDurs` Set vs `DURATIONS.length`), mirroring M3's "play soft/medium/loud".
  - **Stage 2A design notes (as-built rationale below).**
    - **Why the pivot.** The figure model has two knobs that don't compose: a **figure** picks *which beats
      fire*, then a melody's notes are **spread one-per-onset, sorted ascending** (`scheduleVoices` sorts
      `[...cards].sort((a,b)=>a.midi-b.midi)`). So any multi-note melody (M4) **always climbs and is evenly
      spaced** regardless of what you picked — rhythm and melody fight. Playtest verdict: make rhythm
      **granular** (choose each note's value: eighth/quarter/half/whole) instead of a whole-hand pattern.
    - **Decided (this pass):** **per-card durations**, notes play **in selection order** (monophonic v1 — a
      melodic hand is a single line; a chord is its own stacked hand at M5+). **Chords *inside* a melody**
      (two notes on one beat) are **deferred** — they need a grouping gesture. Good news: selection order is
      **already preserved** (`run.sel` is an insertion-ordered `Set`; `selectedCards()` returns pick order),
      so the only reason melodies climb is that one `.sort()` — cheap to fix.
    - **Model.** A hand = a list of events `(pitch, duration)`. **Sequenced hand** (M4 / any run): events lay
      **back-to-back from beat 1 in pick order**, each lasting its duration; leftover bar = a **rest**. The
      durations *are* the rhythm. **Stacked hand** (M5+ harmony): one simultaneous chord, rings the bar
      (per-note durations ignored; sequencing off, as today). **Single note** (M1–M3): one event + duration +
      rest — which finally makes **M2 the note-values lesson** the design calls for.
    - **Duration palette (v1):** **quarter (1 beat) · half (2) · whole (4)** on the existing `BEATS`=4 grid
      (integer beats → columns stay legible). **Eighths (½ beat) are a fast-follow** needing a grid-resolution
      bump to `BEATS`=8 (the scheduler is already float-ready via `slot = bs/BEATS`); dotted/tied notes later.
    - **Code changes.** Store per-card duration index-free in **`run.noteDur[cardId] → durId`** (survives the
      Sort button, since `card.id` is stable). `scheduleVoices`: **drop the ascending sort** for sequenced
      hands; compute **cumulative onsets from durations** (clip/rest at the bar edge). Replace `figControlHTML`
      with a **per-note sequence editor** (`seqControlHTML` — the picked cards left-to-right in order, each
      with a ♩/𝅗𝅥/𝅝 duration control; shown when the hand is sequenced / at M2–M3), so the **order is visible
      and editable**. The loop grid lights each note at its start beat and **spans its duration** (a `.held`
      continuation cell = visible note length). Bars store **`durs`** (parallel to `cards`) instead of `fig`;
      `snapshotBars`/`scheduleBar` read it; the `MJ1:` code omits it → default quarter (sequenced) / whole
      (stacked); legacy `fig` bars fall back to whole. **Groove scoring:** `groove +1` on-beat + a
      **rhythmic-interest +1** for ≥2 distinct durations (tunable). **M2 gate** → *play each note value*
      (`gateDurs` Set vs the palette), mirroring M3's soft/medium/loud (retires `gateFigs`/`FIGURES`).
    - **Staging.** **A (core): ✅ BUILT** (quarter/half/whole; see *As built (Stage 2A)* above). **B
      (fast-follow, not built):** eighths (`BEATS`=8) + dotted notes. **C (later):** chords-in-melody
      grouping, syncopation & cross-loop-consistency scoring, explicit rest token.
  - **Deferred to later stages (unchanged):** draftable/unlockable rhythm content (a Codex sub-set),
    syncopation & cross-loop-consistency scoring, and an explicit **rest** token (durations already leave the
    bar's tail silent, but there's no dedicated rest pick yet).
- **Phase 4 — Structure payoff & polish. ✅ CORE BUILT.** **Cross-gig loop accumulation** + real M7 form
  scoring + a real M7 gate. Boss-gig capstones and mentor/chapter prose are **deferred** (a later polish
  pass — chosen "core only" this pass).
  - **As built:** the loop is **one song per run**, allocated once in `startRun` (`run.loop`, sized
    `LOOP_BARS = SECTION_BARS × GIGS.length` = 18) and **never reset per gig**. `startGig` snaps the write
    head to `run.gigIdx × SECTION_BARS` so each gig fills its own `SECTION_BARS`-bar **section in that
    gig's key** — the song **modulates C→G→F**. `playHand`'s write head and click-to-aim are **confined to
    the current gig's section** (past sections lock). The live loop cycles only the **song so far**
    (`loopLenNow()` = unlocked sections; `gigSrc().n`), so early gigs don't groove through empty future
    bars; the last gig plays the full 18-bar song. The **loop grid** renders `loopLenNow()` bars, is now
    **horizontally scrollable** with a **sticky pitch-label column**, fixed-width sub-columns, **section
    dividers** (`.secstart`) + a **per-section key strip** (`.lsecbar` — ① C · ② G · ③ F, active lit),
    and dims **locked** (non-current-section) cells; row-greying keys off the **current section's** key.
  - **Real M7 form scoring** (`score()`): a **phrase** = a bar's pitch-class fingerprint (`pcSetFp`).
    Restating an earlier phrase (**motif repetition**) scores `+1`; restating it **after a contrasting
    phrase** (the **A·B·A** shape) scores `+1` more — read off the whole accumulated `run.loop.bars`.
    Replaces the Phase-2 thin restatement placeholder.
  - **Real M7 gate** (`gateStatus` default → `hasABA(run.loop.bars)`): *"compose an A·B·A — state a phrase,
    contrast it, then return to it."* Replaces the clear-the-Set placeholder. (M7 is terminal, so meeting
    it is graduation flavor rather than an advance; Free Play stays available regardless.)
  - **Save-a-Song is now whole-run** (see that section): the per-gig, before-the-draft save is retired;
    `offerSave(retScreen)` captures the full run at end (win/lose), `run.saved` is a boolean, and the
    report judges in-key%/cadence **per section** via `sectionKey`.
  - **Still deferred:** boss-gig capstones as chapter exams; optional mentor/chapter prose; explicit
    AABA/verse-chorus detection beyond the A·B·A phrase-return heuristic; seed + set export/share.

**Chosen: thin-first** (Phase 2 stubs Rhythm/Dynamics to get a walkable arc fast) over deep-in-order
(fully building Rhythm before the rest). Fastest to a complete-arc playtest; defers the Rhythm lift.

**Reframe surfaced during sequencing:** the 3 instruments (piano/guitar/bass) *already exist in the deck*,
so the campaign **restricts** the starting deck to one instrument early and **unlocks** the others at **M6
Timbre** — it doesn't add new instruments, it gates existing ones. (New instruments beyond the 3 remain a
separate later addition.)

### Open items for this feature

- Exact **gate counts** per movement and whether gates are "catalog N distinct" vs "N total."
- **Rhythm figure roster** and how figures are acquired (unlock vs draft vs both).
- Whether **Dynamics** is a per-note property, a per-hand marking, or a figure-like pick.
- **Structure (M7)** scoring: **resolved for Phase 4 core** — the loop now accumulates across all 3 gigs,
  and form scores on a **pitch-class phrase fingerprint** (restatement + an **A·B·A** return), decoupled
  from the gig count. *Still open:* richer form detection (AABA, verse/chorus, phrase length) beyond the
  A·B·A heuristic; whether letting a player edit **earlier** sections (currently locked) is worth the
  cross-key complexity.
- Whether Free Play is available **from the start** (menu) or **only after graduating** movement 7.
- How the **hand-size Muses** stack with the per-movement `MAX_SELECT` floor.
- Mentor/chapter prose (deferred; the flavor-only stance holds until the arc is built).

---

## v1 vertical slice (build this first)

Decided: **vertical slice before the full economy.** Must-haves to prove the loop is fun:

1. **A small note-deck** (7 diatonic C-major notes × 1–3 instruments) with **draw + a hand of ~8**.
2. **Select up to 5 notes → play** → **evaluate the structure** (interval / triad / 7th / scale-run)
   and **score Applause** = base × theory-mult + chips.
3. **Audible playback** of the played hand (reuse `playMidi`) — the pillar.
4. **Limited hands + discards** and **one Gig** with an applause threshold; beat it = slice complete.
5. **Hard daily cap** on attempts (persisted).

**Stretch within the slice:** a tiny **shop with 3–4 Muses** to prove the build-engine hook. Antes,
boss gigs, Étude/Accidental cards, multiple instruments, the Daily-Set seed, and the set-playback
export come **after** the slice reads as fun.

---

## Implemented (v1 slice, in `mujicians.html`)

Self-contained, offline, no deps (Web Audio, no assets). One inline `<script>` IIFE. What's built:

- **Cards = notes.** `buildDeck()` = the 7 diatonic C-major notes × 3 instruments (Piano/Guitar/Bass) ×
  `COPIES` = 42 cards. Each card carries `pc`, `letter`, `instId`, `midi`. Cards are **white** with the
  note **letter drawn in its ROYGBIV color** (`COLOR`, A=Red…G=Violet) — so the color reads as the note
  itself — and the instrument shown as an **emoji** (`INSTRUMENTS[].emoji`: 🎹 piano / 🎸 guitar / 🎻 bass,
  name kept on `title` hover) rather than a word. Instrument sets the sounding register (Bass an
  octave-plus lower) and timbre (`INSTRUMENTS[].wave`).
- **The hand.** Draw to `run.handSize` (**starts at `BASE_HAND_SIZE` = 4**, Balatro-style small start) from
  a shuffled draw pile; select up to `MAX_SELECT` (5); **Play** or **Discard**; a **Sort by pitch** button.
  Selecting a card previews it audibly. Hand size is **grown mid-run by drafting hand-size Muses** (see
  Muses below) — the HUD shows the current **Hand size**.
- **Hand evaluator (`classify`).** Detects single/**unison** · interval (named + consonance) · **triad**
  (maj/min/dim/aug) · **seventh** (maj7/7/m7/m7♭5/°7/mM7) · **scale run** (contiguous diatonic steps) ·
  cluster. This is the "music dictionary."
- **Scoring (`score`) = Applause = chips × mult.** Per-note chips (+`INKEY_CHIP` when in the gig's key);
  mult bonuses for **all-in-key** (flush), **consonant**, and **resolves-to-tonic**; `STRUCT` gives each
  structure its base chips/mult. A **live preview** shows `structure · N chips × M mult · bonuses · =Applause`
  — the teaching surface.
- **The pillar — hands are sounded.** `soundCards` plays the selection (chords together, **scale runs
  arpeggiated**) via each card's instrument timbre/register. High score ↔ good sound by construction.
- **Live learning cues on the pitch grid (FL-Studio-style).** As you select cards, the loop grid gives two
  instant, no-commitment cues (both computed in `loopStripHTML` from `selectedCards()`, so they update on
  every select/deselect since `toggleSel` re-renders):
  - **Placement ghost** — each selected card's landing cell (its row = pitch/register, in the **gold write
    column**) gets a **white inset ring + a translucent tint of the note's ROYGBIV color** (`.lgcell.ghost`),
    so you see *exactly where on the staff* a pick will be written before you Play it. On-select only (no
    hover preview — works the same on touch and desktop).
  - **"Still sounds good" glow** — rows that are **in the gig's key AND consonant with every note you've
    currently picked** get a green wash on the cells + a green bold row label (`.lgcell.good`/`.lgrow.good`,
    via `fitsSelection(pc,key,selPcs)`; consonant = interval class in `CONSONANT_IV` = 3rd/4th/5th/6th, or a
    doubling). This is the deliberate extension of FL's *static* scale-highlight: because the natural-note
    deck makes the plain in-key highlight **degenerate in C major** (every row is in-key), the glow instead
    reacts to your selection so it stays a real teaching signal every gig. Empty selection ⇒ all in-key rows
    glow (the scale). The off-key **grey** rows are unchanged (still show key membership).
- **The song loop (Mario-Paint-style "make a song as you go") — one loop per RUN (Phase 4).** The whole
  run is **one continuous loop of `LOOP_BARS` slots** (= `SECTION_BARS × GIGS.length` = 18), allocated once
  in `startRun` and **never reset between gigs**. Each gig fills its own `SECTION_BARS`-bar **section** (its
  own key): `startGig` snaps the write head to `run.gigIdx × SECTION_BARS`, and `playHand`'s write head +
  click-to-aim are **confined to the current gig's section** (past sections lock). Playing a hand **writes
  it into the current (gold) slot** and advances the write head (wraps within the section). A Web Audio
  **lookahead scheduler** (`startLoop`/`schedTick`/`scheduleBar`, `BAR_SEC` tempo) cycles the **song so far**
  (`loopLenNow()` = unlocked sections; `gigSrc().n`) **continuously as a backing groove** — so early gigs
  don't loop through empty future bars; the last gig plays the full 18-bar song. Each filled slot re-sounds
  every pass (chords together, runs arpeggiated within the bar) and a rAF **playhead**
  (`tickPlayhead`→`paintPlayCol`) sweeps the columns. The loop renders as a **pitch grid** (`loopStripHTML`,
  `.loopgrid`): **rows = every playable pitch across the deck's true range** (`loopRowMidis`), **columns =
  the `loopLenNow()` bars**. The grid is **horizontally scrollable** with a **sticky pitch-label column**,
  fixed-width sub-columns, **section dividers** (`.secstart`) and a **per-section key strip** (`.lsecbar` —
  ① C · ② G · ③ F, active section lit); **locked** (non-current-section) cells dim. A played hand lights up
  its notes as **ROYGBIV cells** (color = note letter). Row labels mark the **current section's** tonic
  (gold) / grey off-key rows; a short **structure label** sits under each bar. Click a cell/label in the
  **current section** to aim the write head there; a **pause/play** toggle mutes the groove. (Reuses the
  `mujicians-compose.html` grid concept.)
  The loop **never stops on its own between gig and end state**: `winGig` and `loseRun` no longer call
  `stopLoop`, so the accumulating song **keeps grooving under the Muse draft** (which now notes the song
  modulates to the next section's key) and under the **end overlay** (win or lose — `renderEndOverlay` calls
  `renderGigStatic()` unconditionally so the pitch grid + playhead stay visible behind it). The end overlay's
  **"▶ Hear your set" / "⏸ Pause your set"** toggle just pauses/resumes that already-running loop — the "made
  some music" payoff. `stopLoop` now only fires on explicit user actions (Home, new run, the pause toggle).
  So a run literally **builds one audible modulating song** you can sit with after it ends.
- **Adjustable tempo (global comfort setting, live).** A **Tempo slider** lets the player set the loop
  speed in **real BPM** (`MIN_BPM 40` → `MAX_BPM 200`), with a live **Italian tempo-marking label**
  (Largo/Adagio/Andante/Moderato/Allegro/Presto) next to the number — on-brand with the game's teaching
  angle. It's shown in **two places from one shared helper** (`tempoSliderHTML`/`wireTempoSlider`): a full
  version on **Home** and a **compact** version in the **in-gig loop header** (next to ▶/⏸), so tempo is
  adjustable **at any time, including mid-gig** — dragging the slider speeds up/slows the **currently
  grooving loop live** (the `input` handler updates `persist.bpm`; `change` persists it). The mapping is
  **one loop slot = one beat**, so bar-seconds = `60/BPM`; the old fixed `BAR_SEC = 0.8` is the **default
  of 75 BPM** (`DEFAULT_BPM`). BPM persists as `persist.bpm` in `localStorage["mujicians-save-v2"]`
  (additive; clamped on load). The gig loop **follows the global tempo in real time**: `gigSrc()` is marked
  `live:true` and `srcBarSec()` returns `curBarSec()` for it each tick (a saved song instead carries a
  fixed `barSec`). Because a mid-loop tempo change breaks the old constant-rate playhead math, the visual
  **playhead is now driven by a queue of scheduled bar onsets** (`barQueue` of `{idx,t}` pushed in
  `schedTick`; `tickPlayhead` advances to the latest onset already started) instead of dividing elapsed
  time by a fixed `BAR_SEC` — so the sweep stays correct at any speed and through speed changes. **Saved
  songs replay at their own tempo:** `saveSong` stores `tempo: curBarSec()` (the speed it was played at)
  and Setlist playback feeds it back as `startLoop({…, barSec:s.tempo})`, so a song sounds the way it was
  made regardless of the current global setting (older saves stored `0.8` = 75 BPM, correct for when they
  were made).
- **Run = a Set of 3 Gigs** (`GIGS`), each with a **key** (C→G→F major, so "in key" is a live choice
  with a natural-note deck) and an escalating **applause threshold** (`650 / 1150 / 1800` — deliberately
  high so a gig can't be cleared in one or two lucky hands; you play several, filling more of the loop);
  `PLAYS` (**6**) hands + `DISCARDS` discards per gig. Beat the threshold → next gig; run out → run over.
  Each gig fills a `SECTION_BARS = PLAYS` (**6**)-bar section of the run-long song, so the full song is
  `LOOP_BARS = 18` bars across the three gigs — a real little three-section, modulating piece (Phase 4).
- **Muses (the build engine).** Before each gig you **draft 1 of 3** from `MUSE_POOL`. Scoring Muses
  (Perfect Pitch, Consonance, Low End, Cadence, Arpeggiator, Virtuoso) fold their `onNote`/`onHand` hooks
  into `score`. Two **hand-size Muses** (Extra Hand +1, Big Hand +2) instead carry a `handSize` field and
  are `repeatable:true` — `pickMuse` adds their value to `run.handSize` and, because they're repeatable,
  they can be re-drafted every gig and **stack** (so the hand grows from 4 toward a Balatro-ish ~8). They
  compete with scoring Muses for the same draft slots — a real tradeoff.
  **Movement-gated draft:** each Muse carries a `minMv` (earliest movement its reward can actually pay out),
  and `offerDraft` only offers Muses that clear `run.movement` — so the campaign never hands you a dead Muse.
  Since a Muse's `onHand`/`onNote` fires **per hand** (it sees only the just-played hand's classification,
  not the whole loop), a chord/run/consonance Muse can never trigger while `maxSelect` is 1: Consonance &
  Arpeggiator need Melody (M4) multi-card sequences, Cadence & Virtuoso need Harmony (M5) chords, and Low
  End needs the bass instrument (Timbre/M6). Pitch (M1) therefore drafts from just Perfect Pitch + the two
  hand-size Muses; the pool grows as chapters unlock, and **Free Play (M7)** sees the whole pool.
- **Hard daily cap.** `MAX_RUNS_PER_DAY` (3); `persist.runsUsed` resets when the local date rolls over.
  When capped, the UI points at Pitch Bird / "come back tomorrow." **DEV override** (`DEV`): unlimited
  runs, on via **`?dev`** in the URL or toggled with **Ctrl/Cmd+Shift+D** (persisted in
  `localStorage["mujicians-dev"]`); shows a **DEV ∞** badge and doesn't increment `runsUsed`. When DEV is
  on, **Home also shows a movement jumper** (`devMovementBarHTML` — M1…M7 buttons) that sets
  `persist.progress.movement` directly so you can test any chapter without playing up to it, plus a
  **↺ Reset all** button (`resetAll()`) that wipes ALL saved progress back to a first-launch state
  (movement 1, empty Codex/Setlist, zero Renown, pitch gate cleared, runs reset) after a confirm.
- **Persistence + meta.** `localStorage["mujicians-save-v2"]` holds `{day, runsUsed, codex,
  totalApplause, bestApplause, setlist}`. **Renown** level derives from cumulative Applause; the **Codex**
  logs every recognized structure you play; **`setlist`** holds saved songs (see next bullet).
- **Save a Song (Setlist + report card + share code).** When a gig's loop is about to be lost you can
  **name and keep it**: a **💾 Save this song?** dialog pops **before the Muse draft** on a non-final gig
  win (and as a button on the end overlay for the final win / a loss). It prefills a **Noteling
  portmanteau** name, shows a brief **report card** (key · structures · in-key % · consonance grade · a
  cadence/tritone/most-used-note callout · ★ rating), and lets you **▶ audition** the loop first. Saved
  songs live in a **"Your Setlist"** gallery on Home — **play/pause, ★ favorite, rename, export
  (`MJ1:` share code), delete**, plus **Import** a pasted code. Full design + code map in the **Save a
  Song** section above.

- **Progression campaign — Phases 0–2 + Phase 3 Stage 1 + Phase 4 core (of the 7-movement arc).** A `MOVEMENTS` registry
  gates the select cap (`maxSelect()`), scoring terms (`termOn()`), the deck's instruments (`instrumentsFor()`
  — piano-only until M6), and each movement's flat campaign threshold (`gigThreshold()`) by the run's
  movement. **Home offers Campaign (at your reached movement, default M1) vs Free Play (all unlocked)**, both
  under the daily cap. **The whole M1→M7 arc is playable end-to-end:** each movement adds one scoring term
  (in-key → groove → dynamics → melody → harmony → timbre → form) and one mechanic — single notes (M1) → a
  **per-note duration** picker (♩/𝅗𝅥/𝅝) over a 4-beat sub-bar grid (M2) → a per-hand **p/mf/f dynamics** control
  (M3) → 3-card **melodic sequences played in pick order** (M4) → 5-card **harmony** stacks (M5) → guitar+bass
  **timbre** blends (M6). Each has a real advancement gate (`gateStatus`/`maybeAdvance`, persisted in
  `persist.progress.movement`): M1 = play all 7 in-key letters (**progress persists across runs**, shown as
  a hangman row of 7 slots that reveal each colored letter as it's played — in the HUD, end overlay, and on
  Home), **M2 = play each note value**, M3 = all 3 dynamics, M4 = intervals+run, M5 = triads+cadence,
  M6 = multi-instrument blends; **M7 = compose an A·B·A** (`hasABA` over the accumulated cross-gig song —
  real as of Phase 4). HUD gate meter + end-overlay unlock banner. **Phase 4 (core) is built:** the loop
  **accumulates across the whole run into one modulating C→G→F song** (18 bars, allocated in `startRun`,
  sectioned per gig, scrollable grid with a per-section key strip), **M7 form scoring** rewards
  phrase-fingerprint restatement + an A·B·A return, and **Save-a-Song is a whole-run capture** at run's end.
  Full design + phase plan in the **Progression** section.

**Not yet (still plan):** the rest of the campaign depth (Phase 3 *Stage 2B/C* = **eighths** (`BEATS`=8) +
dotted notes, **chords inside a melody** (two notes on one beat, needs a grouping gesture), syncopation +
cross-loop-consistency scoring, explicit rest tokens — **Stage 2A's per-note durations (quarter/half/whole),
sequential pick-order playback, held-note grid spans, groove scoring/gate are built**; **Phase 4 core =
cross-gig loop accumulation + real M7 form scoring/gate + whole-run Save-a-Song are built**, leaving Phase 4
*polish* = boss-gig capstones, mentor/chapter prose, and AABA/verse-chorus detection beyond the A·B·A
heuristic); explicit **dynamics symbols** (crescendo/accents) beyond
the p/mf/f marking; accidentals/more
instruments & drums, Étude/Accidental cards, a coin-based
shop (draft is free for now), antes/boss-gig constraints, the shared **Daily-Set** seed, set-playback
export, and a bespoke visual identity (current dark-neon skin is a placeholder; the ROYGBIV cards are
the start of the real look). Scoring numbers (`STRUCT`, thresholds, chip/mult constants) are **tunable
placeholders** — balance in play.

## Reuse from slice-1 code

- `nameChord`-style matching → the `classify` **hand evaluator** (extended to 7ths/scales/intervals).
- `playMidi`/`audio()` → the **audible-hand** engine (the pillar).
- `save`/`load` (`localStorage`) → run/cap state + the persistent **Codex**; XP idea → **Renown**.
- The grid UI/`buildGrid` → **preserved in `mujicians-compose.html`** (kept, not deleted) as the future
  free-compose tool.

---

## Settled decisions

1. **Spine = Balatro-style deckbuilder** (cards = notes, hands = chords/scales, score = theory
   correctness). Supersedes the grid+puzzle spine (kept as a side tool).
2. **Card = a note** (pitch = rank, instrument = suit); **deck starts as just the notes** and grows.
3. **3–4 melodic instruments** in v1; **drums deferred**.
4. **ROYGBIV = notes**, A=Red … G=Violet; accidentals = in-between shades. (Newton, simplest mapping.)
5. **Score correlates with sound** — every hand is played; this alignment is protected above all.
6. **Vertical slice first** (scoring + one gig + hard cap + audible playback), economy layered after.
7. **Hard daily cap** on plays (not a ranked-plus-practice split) — a daily ritual; more play = the
   other games (Pitch Bird, etc.).
8. **Single-file, vanilla, offline** like every game here; validator/scoring are local, no third-party
   runtime API.
9. **Progression = a linear 7-movement campaign** matching the graphic novel's arc (pitch → rhythm →
   dynamics → melody → harmony → timbre → structure); each movement unlocks one mechanic + adds one
   scoring term; advancement is gated on **Codex/Bestiary milestones** (not Renown grinding). Today's
   full game is preserved as **Free Play** (the all-unlocked end state — *not reverted*), and the **hard
   daily cap is global** (Free Play included). Designed this pass, **not built** — see *Progression*.

---

## Open questions / not yet decided

- Exact **hand-type ladder** and the **scoring numbers** (base/mult/chips) — tune in play.
- **Instrument roster** (which 3–4) and their Muse synergies.
- The **Muse set** for the slice's shop (3–4) and the broader Muse pool.
- **Étude / Accidental** card designs and the shop economy.
- **Boss-gig** constraint list.
- The **hard-cap number** (attempts/day) and exactly what resets daily.
- The **Daily-Set** seed model (shared seed for a social/leaderboard angle?) and set-playback export.
  (Partly answered: the **Save a Song** feature — Setlist gallery + versioned share code — is speced and
  shares its encoder with this; see that section.)
- **Visual identity / palette** — Mujicians should get its own look (the current dark-neon slice-1 skin
  is a placeholder; ROYGBIV cards drive the new identity). Leaning toward **Inklings' retro-pixel style**;
  first pass is **pixel creatures only** (see *Notelings*), full chrome reskin deferred.
- **Notelings collection/story layer** — the letter-creature + Bestiary design is speced as *tentative*
  (see the **Notelings** section); its own open items (procedural fusion, legendary-chimera recipes,
  instrument-as-texture, Bestiary-as-rename-vs-view) live there.
- **Progression / 7-movement campaign** — the shape (linear, Codex-gated, Free Play preserved but
  daily-capped) is decided and speced as *planned/not-built* (see the **Progression** section); its own
  open items (gate counts, rhythm-figure roster, dynamics representation, M7 form scoring, Free-Play
  availability, mentor prose) live there.

---

## Originality / licensing note

We take **mechanical inspiration** from Balatro (game mechanics and rules aren't copyrightable) but
**copy no Balatro assets, art, code, text, or Joker names** — Balatro is a closed-source commercial
game. Same rule for the earlier references: reuse **ideas/UX** from Chrome Music Lab (its GitHub repo is
Apache-2.0, but Song Maker itself was never open-sourced) and Incredibox (concept only), never their
assets. All Mujicians art, audio, and code is our own; if any actual Apache-2.0 snippet is ever used, we
keep its license notice.
