# Mujicians — a Balatro-style music-theory deckbuilder

**Entry file:** `mujicians.html` · **Status:** **v1 vertical slice built** — a Balatro-style deckbuilder
(cards = notes, hands = chords/scales, score = theory correctness, hands are sounded, and every gig now
**builds a repeating Mario-Paint-style loop** you compose over as you play, and you can now **Save a Song**
you like — name it, read a theory report card, and replay/share it from a Home **Setlist**). The demoted
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

**Now partly built:** each gig is a **repeating loop you fill hand-by-hand** (see the "song loop" bullet
under *Implemented*), and the loop **keeps playing continuously through the end of a run** — it does not
cut off when a run finishes (win *or* lose) or when the between-gigs **Muse draft** dialog pops up, so you
keep hearing your creation while you read the result or pick a Muse. Still to do: **accumulate one loop
across all 3 gigs** (currently the loop resets per gig, and each gig has its own key), plus a real **seed +
set export/share**. The **Save a Song** feature below is the first concrete piece of that export/brag loop.

---

## Save a Song — Setlist, report card & export (**built**)

> **Status: built** in `mujicians.html`. Extends the existing per-gig loop and `persist` store. The
> report-card stats/thresholds and the prune cap are tunable placeholders. Design notes below describe the
> shipped behavior; the **detailed** theory breakdown remains the deferred upgrade.

**The problem it solves.** The loop **resets per gig** (`startGig` allocates a fresh `run.loop`), so a
good little song you built in a gig is **wiped the moment the next gig starts**. Right now you can hear it
grooving under the Muse draft, then it's gone. This feature lets a player **keep a gig's loop they liked**
— name it, learn *why* it sounds good, replay it later, and share it.

**Decided this pass:** save unit = **the just-finished gig's loop** (one save = one ~6-bar song, not the
whole run — matches the per-gig reset); saved songs live in **both** a Home **Setlist gallery** *and* a
copyable **share code**; the theory breakdown is a **brief report card** for v1 (designed to grow into a
detailed teaching breakdown later); song names are **freeform with a suggested Noteling portmanteau**
prefilled.

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
{ id, name, date, key:{root,mode,name}, tempo:BAR_SEC,
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

- **Trigger:** `winGig()` calls `offerSave(finishedGig,"draft")` before `offerDraft()` for non-final wins
  (skipped when the loop is empty); the **end overlay** (`renderEndOverlay`) shows a **💾 Save this song**
  button for the final win / any loss (retScreen `"win"`/`"lose"`), disabled to **✓ Saved** once done
  (tracked in `run.saved[gigIdx]`). `screen==="save"` renders the gig board behind + `renderSaveOverlay()`.
- **Snapshot/model:** `snapshotBars()` stores per filled bar `{cards:[{pc,letter,instId,midi}], cls}`;
  `saveSong()` pushes `{id,name,date,keyName,key,tempo,bars,stars,starred}` onto `persist.setlist`
  (`localStorage["mujicians-save-v2"]`, additive) and `pruneSetlist()` caps at `SETLIST_CAP=30` (★-pinned
  never pruned).
- **Report card:** `songReport(bars,key)` computes `{inKeyPct, structs, consGrade, consRatio, cadence,
  tritone, topLetter, stars}`; `reportCardHTML()` renders the **brief** subset. The detailed breakdown =
  same stats, longer view (deferred).
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
- **The song loop (Mario-Paint-style "make a song as you go").** Each gig is a **fixed loop of
  `LOOP_BARS` slots** (= `PLAYS`, one per hand). Playing a hand **writes it into the current (gold) slot**
  and advances the write head (wraps to overwrite/refine). A Web Audio **lookahead scheduler** (`startLoop`
  /`schedTick`/`scheduleBar`, `BAR_SEC` tempo) cycles the loop **continuously as a backing groove**; each
  filled slot re-sounds every pass (chords together, runs arpeggiated within the bar) and a rAF
  **playhead** (`tickPlayhead`→`paintPlayCol`) sweeps the columns. The loop renders as a **pitch grid**
  (`loopStripHTML`, `.loopgrid`): **rows = every playable pitch across the deck's true range** (`loopRowMidis`
  — bass register low, piano/guitar high, the empty middle octave skipped since no card lands there), **columns
  = the `LOOP_BARS` bars**. A played hand lights up its notes as **ROYGBIV cells across the scale** (color =
  note letter), so note additions are *visible on the staff* rather than a cluster of dots. Row labels mark the
  gig-key **tonic** (gold) and grey out **off-key** rows (e.g. F in G major — teaches "out of key"); a short
  **structure label** sits under each column. Click any cell/label in a column to aim the write head there, and a
  **pause/play** toggle mutes the groove. (This reuses the `mujicians-compose.html` grid concept for the loop
  display.)
  The loop resets per gig (a fresh song each gig, swapped in cleanly by `startGig`→`startLoop`, whose
  `stopLoop` resets the scheduler). The loop **never stops on its own between gig and end state**: `winGig`
  and `loseRun` no longer call `stopLoop`, so the just-finished gig's loop **keeps grooving under the Muse
  draft** (rendered behind the draft overlay) and under the **end overlay** (win or lose — `renderEndOverlay`
  calls `renderGigStatic()` unconditionally so the pitch grid + playhead stay visible behind it). The end
  overlay's **"▶ Hear your set" / "⏸ Pause your set"** toggle (shown on both win and lose) just pauses/resumes
  that already-running loop rather than starting it — the "made some music" payoff. `stopLoop` now only fires
  on explicit user actions (Home, starting a new run/gig, the pause toggle). So a gig literally **builds an
  audible loop** you can sit with after the run ends.
- **Run = a Set of 3 Gigs** (`GIGS`), each with a **key** (C→G→F major, so "in key" is a live choice
  with a natural-note deck) and an escalating **applause threshold** (`650 / 1150 / 1800` — deliberately
  high so a gig can't be cleared in one or two lucky hands; you play several, filling more of the loop);
  `PLAYS` (**6**) hands + `DISCARDS` discards per gig. Beat the threshold → next gig; run out → run over.
  Because `LOOP_BARS = PLAYS`, the song loop is now **6 bars** — you can lay down a 4+-bar phrase before
  passing.
- **Muses (the build engine).** Before each gig you **draft 1 of 3** from `MUSE_POOL`. Scoring Muses
  (Perfect Pitch, Consonance, Low End, Cadence, Arpeggiator, Virtuoso) fold their `onNote`/`onHand` hooks
  into `score`. Two **hand-size Muses** (Extra Hand +1, Big Hand +2) instead carry a `handSize` field and
  are `repeatable:true` — `pickMuse` adds their value to `run.handSize` and, because they're repeatable,
  they can be re-drafted every gig and **stack** (so the hand grows from 4 toward a Balatro-ish ~8). They
  compete with scoring Muses for the same draft slots — a real tradeoff.
- **Hard daily cap.** `MAX_RUNS_PER_DAY` (3); `persist.runsUsed` resets when the local date rolls over.
  When capped, the UI points at Pitch Bird / "come back tomorrow." **DEV override** (`DEV`): unlimited
  runs, on via **`?dev`** in the URL or toggled with **Ctrl/Cmd+Shift+D** (persisted in
  `localStorage["mujicians-dev"]`); shows a **DEV ∞** badge and doesn't increment `runsUsed`.
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
  (Partly answered: the **Save a Song** feature — Setlist gallery + versioned share code — is speced and
  shares its encoder with this; see that section.)
- **Visual identity / palette** — Mujicians should get its own look (the current dark-neon slice-1 skin
  is a placeholder; ROYGBIV cards drive the new identity). Leaning toward **Inklings' retro-pixel style**;
  first pass is **pixel creatures only** (see *Notelings*), full chrome reskin deferred.
- **Notelings collection/story layer** — the letter-creature + Bestiary design is speced as *tentative*
  (see the **Notelings** section); its own open items (procedural fusion, legendary-chimera recipes,
  instrument-as-texture, Bestiary-as-rename-vs-view) live there.

---

## Originality / licensing note

We take **mechanical inspiration** from Balatro (game mechanics and rules aren't copyrightable) but
**copy no Balatro assets, art, code, text, or Joker names** — Balatro is a closed-source commercial
game. Same rule for the earlier references: reuse **ideas/UX** from Chrome Music Lab (its GitHub repo is
Apache-2.0, but Song Maker itself was never open-sourced) and Incredibox (concept only), never their
assets. All Mujicians art, audio, and code is our own; if any actual Apache-2.0 snippet is ever used, we
keep its license notice.
