# Mujicians — a Balatro-style music-theory deckbuilder

**Entry file:** `mujicians.html` · **Status:** **v1 vertical slice built** — a Balatro-style deckbuilder
(cards = notes, hands = chords/scales, score = theory correctness, hands are sounded). The demoted
slice-1 note-grid is preserved in **`mujicians-compose.html`** (the future free-compose side tool). The
economy beyond the slice (antes, boss gigs, Étude/Accidental cards, Daily-Set seed, set-playback) is
still the plan below.

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
  `COPIES` = 42 cards. Each card carries `pc`, `letter`, `instId`, `midi`. Cards render in their
  **ROYGBIV** color (`COLOR`, A=Red…G=Violet) with auto-contrast text (`textOn`/`lum`); instrument sets
  the sounding register (Bass an octave-plus lower) and timbre (`INSTRUMENTS[].wave`).
- **The hand.** Draw to `HAND_SIZE` (8) from a shuffled draw pile; select up to `MAX_SELECT` (5);
  **Play** or **Discard**; a **Sort by pitch** button. Selecting a card previews it audibly.
- **Hand evaluator (`classify`).** Detects single/**unison** · interval (named + consonance) · **triad**
  (maj/min/dim/aug) · **seventh** (maj7/7/m7/m7♭5/°7/mM7) · **scale run** (contiguous diatonic steps) ·
  cluster. This is the "music dictionary."
- **Scoring (`score`) = Applause = chips × mult.** Per-note chips (+`INKEY_CHIP` when in the gig's key);
  mult bonuses for **all-in-key** (flush), **consonant**, and **resolves-to-tonic**; `STRUCT` gives each
  structure its base chips/mult. A **live preview** shows `structure · N chips × M mult · bonuses · =Applause`
  — the teaching surface.
- **The pillar — hands are sounded.** `soundCards` plays the selection (chords together, **scale runs
  arpeggiated**) via each card's instrument timbre/register. High score ↔ good sound by construction.
- **Run = a Set of 3 Gigs** (`GIGS`), each with a **key** (C→G→F major, so "in key" is a live choice
  with a natural-note deck) and an escalating **applause threshold**; `PLAYS` hands + `DISCARDS` discards
  per gig. Beat the threshold → next gig; run out → run over.
- **Muses (the build engine).** Before each gig you **draft 1 of 3** from `MUSE_POOL` (Perfect Pitch,
  Consonance, Low End, Cadence, Arpeggiator, Virtuoso); their `onNote`/`onHand` hooks fold into `score`.
- **Hard daily cap.** `MAX_RUNS_PER_DAY` (3); `persist.runsUsed` resets when the local date rolls over.
  When capped, the UI points at Pitch Bird / "come back tomorrow."
- **Persistence + meta.** `localStorage["mujicians-save-v2"]` holds `{day, runsUsed, codex,
  totalApplause, bestApplause}`. **Renown** level derives from cumulative Applause; the **Codex** logs
  every recognized structure you play.

**Not yet (still plan):** accidentals/more instruments & drums, Étude/Accidental cards, a coin-based
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

---

## Open questions / not yet decided

- Exact **hand-type ladder** and the **scoring numbers** (base/mult/chips) — tune in play.
- **Instrument roster** (which 3–4) and their Muse synergies.
- The **Muse set** for the slice's shop (3–4) and the broader Muse pool.
- **Étude / Accidental** card designs and the shop economy.
- **Boss-gig** constraint list.
- The **hard-cap number** (attempts/day) and exactly what resets daily.
- The **Daily-Set** seed model (shared seed for a social/leaderboard angle?) and set-playback export.
- **Visual identity / palette** — Mujicians should get its own look (the current dark-neon slice-1 skin
  is a placeholder; ROYGBIV cards drive the new identity).

---

## Originality / licensing note

We take **mechanical inspiration** from Balatro (game mechanics and rules aren't copyrightable) but
**copy no Balatro assets, art, code, text, or Joker names** — Balatro is a closed-source commercial
game. Same rule for the earlier references: reuse **ideas/UX** from Chrome Music Lab (its GitHub repo is
Apache-2.0, but Song Maker itself was never open-sourced) and Incredibox (concept only), never their
assets. All Mujicians art, audio, and code is our own; if any actual Apache-2.0 snippet is ever used, we
keep its license notice.
