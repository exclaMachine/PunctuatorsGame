# Mujicians — a music-theory grid-composer

**Entry file:** `mujicians.html` *(not created yet)* · **Status:** design plan only, **no code written**

A gamified music-maker that teaches **music theory** by having you build music on a grid. Where
Inklings collects letters and spells them into words, Mujicians places notes on a grid and assembles
them into validated chords, scales, and phrases — filling a **Codex** as you go. The fantasy comes
from the dev's *Mujicians* story world (characters who make magic with music), but **there is no
in-game story yet** — the "music = magic" flavor is enough. This doc is the source of truth for the
design; prefer what's written here over generic game-dev defaults.

> **Relationship to Pitch Bird.** Pitch Bird (`pitch-bird.html`) is a *separate* shipped-track voice
> game. Mujicians **reuses Pitch Bird's Web Audio pipeline** (oscillators, the audio graph, note math,
> the autocorrelation pitch detector) and folds the sing-to-play idea in as **one input mode in
> free-compose** (hum → notes land on the grid) — not as the spine. See [`pitch-bird.md`](pitch-bird.md).

---

## How we got here (design history)

The direction was chosen deliberately over several alternatives, so we don't relitigate settled forks:

- **Kept from Inklings:** only the **collection meta** (a dex/Codex you fill) and the idea of an
  **offline validator dictionary** (Inklings' WordNet check → a music-theory checker). The world,
  combat, farming, and writing-desk do **not** carry over. Mujicians is "almost entirely a different
  game," per the dev.
- **Rejected spines:** auto-battler / merge-tactics (Clash Royale), party monster-collector RPG,
  rhythm-command army (Patapon), deckbuilder (Balatro). These were good "assemble a band" fits but
  each locked the game into a battle genre. Parked as possible *modes*, not the spine.
- **Chosen spine:** a **Chrome Music Lab "Song Maker"-style note grid + puzzles**, because it "doesn't
  set me in a lane" and the player is *actually making music*. **Incredibox** supplies the
  **band-of-characters** layer (each character = an instrument lane).
- **Licensing note (settled):** Chrome Music Lab's GitHub repo is Apache-2.0, but **Song Maker itself
  is not in that repo** (never open-sourced). "Visible in the browser" ≠ licensed. We reuse the
  **ideas/UX** (grid, scale-snapping rows, scrolling playhead) — which aren't copyrightable — and build
  our own in the existing vanilla Web Audio stack. Same for Incredibox: emulate the stack-loops
  *concept*, never copy its art/audio assets. If we ever lift an actual snippet from the Apache-2.0
  repo, we keep its license notice.

---

## Core loop

```
Pick a puzzle (a piece to complete — voice a chord, finish a melody, resolve a cadence)
   → place notes on the grid across your band's tracks
   → playhead plays it back; the theory validator checks the puzzle's rule
   → correct → the chord/scale/cadence is inscribed in the CODEX (name + why it works + replayable)
   → reward: XP (level up), and unlocks — a new band member (lane), a new key/scale (rows), or an instrument
   → later puzzles use the new piece
   → payoff: FREE-COMPOSE mode with everything unlocked — pitch-bird hum-input plugs in here
```

If placing notes to complete a musically-correct piece is satisfying, the game works. Everything else
layers on top.

---

## The grid (the canvas)

Song Maker style: **rows = pitches, columns = beats.** A **playhead** scrolls left→right and sounds
whatever cells are filled. Click a cell to place/remove a note. Two **bounded limits** give it the
"bounded, completable" feel that the 26 letters give Inklings:

- **Rows = the current scale.** Start with the 7 diatonic notes of C major (locked/greyed off-scale
  rows). Unlocking more notes follows the **circle of fifths** — that progression *is* a key-signature
  lesson. Each row is labeled with its **note name and scale degree** (1–2–3 / do-re-mi): the teaching
  layer is built into the canvas.
- **Columns = a fixed bar count** (e.g. 16 = 4 bars of 4/4). Finite canvas → every puzzle is a
  completable space.

**Fixed-grid rhythm (decided).** Notes snap to the grid; no variable note durations in v1 (simplest,
most Song-Maker-like). Variable durations / richer rhythm are a later consideration, not v1.

---

## Band characters = tracks (the Incredibox layer)

Each band member is an instrument that occupies its **own lane**, and each teaches one concept.
**Your collection is the band** — unlocking a member opens a new lane *and* the theory it embodies:

| Member | Lane behavior | Teaches |
| ------ | ------------- | ------- |
| **Bassist** | one low note per bar | roots / chord tones |
| **Keys** | stacked simultaneous notes | chords |
| **Lead** | single-note line | melody, staying in key |
| **Drummer** | pitchless rhythm lane | meter / subdivision |

(Roster is a starting sketch, names not final.)

---

## The theory validator (the "dictionary")

The direct analog to Inklings' WordNet check. A **deterministic, offline** function/dataset that
answers questions the puzzles pose:

- Is this pitch-set a **named chord**? (→ name + quality/function, e.g. "C major — bright, stable")
- Is this melody **in-key** / does it land on the tonic?
- Does this progression **resolve** (V→I cadence)?
- Does this drum pattern fit the **meter**?

Built on the existing note math — **no new runtime dependency, no third-party API** (same single-file /
offline rule as every other game here). If a data file is needed (e.g. a chord/scale table), it's a
bundled local JSON fetched at startup, like Inklings' `dictionary.json`.

---

## Puzzle types (the escalating curriculum)

These are Mujicians' equivalent of Inklings' farming/fishing/combat — different flavors of the one loop:

1. **Match the melody** — hear/see target notes, place them → pitch & staff reading
2. **Complete the chord** — a root is placed; fill Keys to form a named triad → chord construction
3. **Stay in key** — write a Lead line using only scale tones that lands on the tonic → scales & resolution
4. **Make it resolve** — a progression missing its final chord; place the one that cadences (V→I) → functional harmony
5. **Fill the groove** — place drum hits to complete a meter → rhythm

**Concrete first ~10 minutes:** start with the Keys lane on a C-major grid. Puzzle 1 places a root C
and asks for two more notes; you place E and G → *"C major — a bright, stable triad,"* logged to the
Codex, Bassist lane unlocked. Puzzle 2 combines bass + keys into a two-chord move; by session's end
you've built C, F, and G triads and heard a I–IV–V.

---

## Progression / level-up (battle deferred, but hooked)

No combat in v1 (**battle deferred**). Progression levels the **musician and the band** — mastery and
capability, not attack power. Two tracks plus collection milestones:

**1. Mujician Level (global XP)** — the content gate. Every puzzle grants XP; leveling unlocks, in order:
new keys/scales (circle-of-fifths order → more rows), new band slots, new puzzle types, and
free-compose features (longer grids, export, pitch-bird hum-input).

**2. Instrument Mastery (per band member)** — "use it to grow it." Using a member in puzzles levels
*that instrument*, unlocking capabilities that are themselves more theory:
- Bassist → walking basslines, passing tones
- Keys → wider polyphony (triads → 7ths → extensions = bigger chords the lane will accept)
- Lead → wider range (more octaves/rows), then chromatic passing notes
- Drummer → finer subdivisions (quarters → eighths → syncopation)

A low-mastery instrument literally **can't place** the advanced material yet, which paces the
curriculum.

**Codex milestones (the collection reward)** — the Inklings **curator-bundle** analog, kept intact:
completing Codex **sets** (all 12 major triads, all 7 modes of a key, all common cadences) grants
**one-time rewards** (a new instrument, a venue/stage backdrop, an instrument skin). Pure grants,
nothing gated behind them.

**XP sources:** base puzzle completion · **discovery bonus** (first time building a given chord/scale =
a new Codex entry) · **daily** + streak · **no-hint / perfect** bonus.

**Battle hook (deferred, free to keep):** everything you level — Mujician Level, Instrument Mastery —
is a **capability stat** (range, polyphony, subdivision). If a "band battle" mode is ever added, those
become its power numbers, so deferring battle costs nothing.

---

## Daily puzzle

One **date-seeded** puzzle per real calendar day (same deterministic model as Inklings' Wordle-style
daily map — seed from the local date). Identical for everyone that day, new tomorrow. Completing it
grants **bonus XP + a streak counter**; a 7-day streak completes a "setlist" for a bigger reward.

---

## The Codex (the collection)

The dex made musical: every chord, scale, and cadence you've built by completing a puzzle is
**inscribed with its name, its theory (what it's built from, its quality/function), and is replayable.**
This is the collection meta the dev wanted to keep from Inklings, and the substrate for the milestone
rewards above.

**Bounded / completable shape:** max Mujician Level = all 12 keys + full band + all puzzle types; full
mastery on every instrument; a filled Codex → a clear "you've mastered it" end state, with the daily
puzzle as the forever-loop on top.

---

## Settled decisions

1. **Spine = grid + puzzle + band** (Song Maker grid × Incredibox band), not a battle genre.
2. **Fixed-grid rhythm** in v1 (no variable durations).
3. **Battle deferred**, but progression stats are designed to double as future battle stats.
4. **Daily puzzle** (date-seeded, streaks).
5. **Level-up = two tracks** (Mujician Level + Instrument Mastery) + **Codex milestone grants**.
6. **Reuse only** Inklings' collection-meta idea and the offline-validator idea; reuse Pitch Bird's
   Web Audio pipeline; pitch-bird sing-input lives in **free-compose**, not the spine.
7. **Single-file, vanilla, offline** like every game here — theory validator is local (bundled JSON if
   needed), no third-party runtime API.
8. **No copied assets** from Chrome Music Lab or Incredibox — ideas/UX only; keep the Apache-2.0 notice
   if any actual CML snippet is ever used.

---

## Open questions / not yet decided

- Exact **band roster** and names (the four above are a sketch).
- Grid dimensions (bar count, octave span) and how many rows unlock per key.
- Whether the **daily puzzle** is authored or fully generated, and the generator's difficulty curve.
- The **Codex set list** (which collections count as milestones) and their reward tables.
- Visual identity / palette (Mujicians should get its own look — not an Inklings reskin).
- Whether a later **battle/performance mode** and/or extra **modes** (à la Clash Royale) are pursued.
