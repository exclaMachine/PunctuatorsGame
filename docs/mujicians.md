# Mujicians — a Balatro-style music-theory deckbuilder

**Entry file:** `mujicians.html` · **Status:** **v1 vertical slice built** — a Balatro-style deckbuilder
(cards = notes, hands = chords/scales, score = theory correctness, hands are sounded, and a whole run
**builds one continuous Mario-Paint-style song in one fixed key** — **gigs were removed 2026-07-17**, so a
run is now **one continuous performance** (one key, one Muse drafted at the start)
that fills a single loop — and you can **Save a Song** you like — name the whole-run song, read a theory
report card, and replay/share it from a Home **Setlist**). The demoted slice-1 note-grid is preserved in
**`mujicians-compose.html`** (the future free-compose side tool). **The applause threshold was removed
2026-07-18** — a performance is now **open-ended (you press ✓ Finish when done; loop space is the only
limit, warned before it fills; win/lose collapse to one "Performance complete")** — see **[Open-ended
performance (BUILT)](#open-ended-performance--no-threshold-you-decide-when-youre-done-built)**. A partner
**backstage shop + "Tips" currency** is designed **but not built** — see **[The backstage shop & Tips
economy](#the-backstage-shop--tips-economy-planned)**. The economy beyond the slice (Étude/Accidental
cards, Daily-Set seed, set-playback) is still the plan below.

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

## ⚠️ Known issues / fixes to do (noted 2026-07-17 – 07-18, NOT yet fixed)

Playtest feedback captured for a later pass — **no code changed yet** (except where marked DONE). Listed
newest-first.

0. ~~**The applause threshold cuts you off mid-song.**~~ **✅ core DONE (2026-07-18).** Beating the
   threshold ended the run instantly, interrupting performances that were going well. Fixed: the threshold
   is removed — a performance is **open-ended** (press **✓ Finish song** when done; the only hard limit is
   loop space, warned at ≤3 bars left), win/lose collapse to one "Performance complete," and campaign
   movements advance by their **skill-demo gate**. See **[Open-ended performance (BUILT)](#open-ended-performance--no-threshold-you-decide-when-youre-done-built)**.
   *(Still planned, not built: the partner **[backstage shop & Tips economy](#the-backstage-shop--tips-economy-planned)**,
   and persisting gate counters across runs — see that section's *deferred* note.)*
1. **Chord duration is ignored — a multi-note (M5+) stacked chord always rings the whole bar (M2/M5).**
   You can pick a note value (♩/𝅗𝅥/𝅝) for a chord, but it plays for the full bar regardless. `handIsSequenced`
   returns `false` for a consonant multi-note hand, so `scheduleVoices` takes the **ring-the-bar** branch
   (`bs*0.92`) and the per-card `noteDur` only governs **sequenced** (melodic/single) hands — never a chord.
   This is *currently documented as intended* ("stacked hand rings the bar; per-note durations ignored"),
   but the **desired behavior** is for a chord to **honor a chosen duration**: pick a value and the whole
   chord sounds for that length, leaving the rest of the bar as a rest. *(Related nit: the **M2 gate** still
   credits the picked value via `gateDurs` even though the chord didn't audibly play it — tighten when
   fixed.)* **Fix sketch:** give a stacked chord a single **shared duration** (a dedicated chord-duration
   control, or reuse the first/longest picked value) and schedule it as a **held-for-`d`-slots chord**
   through `scheduleVoices` instead of the full-bar `else` branch. Touches `handIsSequenced`/`scheduleVoices`
   /`soundCards`/`scheduleBar` + the grid's `barHits`/`hitsFor` so the held span shows.
2. **Rhythm/melody — one flowing line, consistent stacking, playable rests.** ✅ **Stage 1 BUILT
   (2026-07-18) — see [Continuous timeline + consistent stacking](#continuous-timeline--consistent-stacking--the-core-rhythmmelody-rework-decided-2026-07-18-not-built).**
   Notes now flow **right after each other on one continuous timeline** (`run.loop.events[]` + a tick
   `cursor`; no one-play-per-bar gaps), **multiple selected cards always play together** (a chord — the old
   Melody "sequence the selection" behavior + `handIsSequenced` are gone), the **stack cap grows 1→2→3→4 by
   movement** (`maxSelect` = 1,1,1,2,3,4,4), a **rest card is playable by itself** (M2+), duration is a
   **per-play** ♩/𝅗𝅥/𝅝 picker (`run.curDur`), timing is **integer ticks (`TPB=24`)**, and the loop grid is a
   **piano-roll**. Known-issues #1 (chord duration ignored) and #5 (whole-note + more) are subsumed — a stack
   honors `curDur` and long values simply continue across the (now visual-only) barlines. **Deferred to Stage
   2:** 8ths/16ths/triplets in the picker (the tick model already fits them), fuller timeline run-detection &
   form scoring, and save-format migration polish. See that section's *Stage 1 — build brief* for the
   as-built map.
3. ~~**Do away with gigs (design change).**~~ **✅ DONE (2026-07-17).** A run is now **one continuous
   performance in one fixed key (C major)** with a **single applause threshold** and **one Muse drafted
   once at the start** — the 3-gig Set, C→G→F modulation, and per-gig re-drafts are removed. See the
   **[Removing gigs — a run becomes one performance (BUILT)](#removing-gigs--a-run-becomes-one-performance-built)**
   section for the as-built code map. *(Follow-ons still planned: key change → Melody (M4), accidentals →
   Pitch (M1).)*
4. ~~**Whole/half notes don't actually sustain longer (audio bug).**~~ **✅ DONE (2026-07-17).** `_tone` used
   a pure **exponential pluck** — it decayed the same steep shape at every length, so the audible front
   transient was identical and a whole note "sounded like a quarter" (its tail was near-silent by ~40% of
   the duration). Replaced with an **attack–decay–sustain–release** envelope: the note decays to a sustain
   level across its held portion and only releases in the last ~`min(0.12, D/2)`s, so longer `dur` (from
   `d*slot` in `scheduleVoices`) now audibly rings ~4× longer.
5. **A bar can't hold a whole note plus anything (M4).** A bar is `BEATS_PER_BAR`=4 beats, so a **whole
   note fills the bar** and any additional note/rest in the same hand overflows and is clipped/dropped.
   **⚠️ SUBSUMED by the [continuous-timeline rework](#continuous-timeline--consistent-stacking--the-core-rhythmmelody-rework-decided-2026-07-18-not-built)** (2026-07-18): once the song is one flowing timeline where
   the cursor advances by each event's duration, long values simply continue across the (now purely visual)
   barlines — the separate "multi-bar spanning" mechanism is no longer needed. See that section.
6. ~~**Single-select should swap, not block (M1–M3).**~~ **✅ DONE (2026-07-17).** When `maxSelect()===1`,
   clicking a **different** card now **clears the current selection and selects the new one** instead of
   returning early — `toggleSel` clears `run.sel` before adding when the cap is 1 (multi-select still
   respects the cap).

---

## Continuous timeline + consistent stacking — the core rhythm/melody rework (DECIDED 2026-07-18, NOT built)

> **Status: DECIDED, not built.** This supersedes several *built* behaviors and earlier plans — read it as
> the new source of truth for how a hand becomes music. It replaces: the **one-play-per-bar** loop model
> (from *Removing gigs* / Phase 4), the **`handIsSequenced` "melody sequences the selection"** behavior
> (Stage 2A), the earlier **rest** designs (palette token; four rest cards; one adjustable rest card as a
> per-card duration), and the **multi-bar-spanning** spec (Known issue #5 — now subsumed). Known issues #2
> and #5 fold into this. **Do not start building until this section is signed off.**

**Why.** The system had grown inconsistent: at **Melody** selecting multiple cards played them *in sequence*,
but at **Harmony** selecting multiple cards played a *chord* — the same gesture meaning two different things.
And each play filled its own bar, so successive plays didn't butt together — you couldn't build a flowing
line. This rework makes one gesture mean one thing everywhere and makes the song a single continuous line.

### The four decisions (locked)

1. **One continuous timeline, not one-play-per-bar.** The song is a single flowing sequence of events. A
   write **cursor** sits at a beat position; each **play appends** its event at the cursor, then the cursor
   **advances by the event's duration**. So notes come **right after each other** with no per-bar gaps. Bars
   are **purely visual** — faint gridlines every `BEATS_PER_BAR` (4) beats; an event may cross a barline.
2. **Multi-select = ALWAYS a simultaneous stack (a chord).** 1 card = a note, 2 = an interval, 3 = a triad,
   4 = a 7th chord. **Never a sequence.** A *melody* is built by playing notes **one after another** on the
   timeline (successive single plays), not by selecting several cards. `handIsSequenced` and the whole
   arp/sequence branch are **deleted**.
3. **The stack cap grows with the campaign:** **M1 1 · M2 1 · M3 1 · M4 2 · M5 3 · M6 4 · M7 4** (Free Play
   4). (`MOVEMENTS[].maxSelect` becomes `1,1,1,2,3,4,4`.) 7th chords (4 notes) survive because the cap
   reaches 4 by M6/M7. *(Note: 7ths becoming available at M6 Timbre rather than M5 Harmony is a little odd
   pedagogically — flag if you'd rather M5 allow 4. Kept per your pick.)*
4. **Rests are a card you can play by itself.** One rest card; played **alone** (not inside a stack with
   notes); appends silence of the chosen duration and advances the cursor. Future **Sleeping Noteling** skin.

### How a play works (the new unified model)

- **An event** is either a **stack** of 1–N notes sounding **together for one shared duration**, or a
  **rest** of a duration. There is no per-card duration anymore — **one duration per play**.
- **Duration is a per-play control**, like Dynamics: a single ♩/𝅗𝅥/𝅝 picker sets **`run.curDur`** (the value
  for the *next* play), shown with note glyphs for a note-stack and rest glyphs (𝄽/𝄼/𝄻) when the selection
  is the rest card. (Replaces the per-card `run.noteDur[cardId]` chips.) Per-note rhythm in a melody comes
  from setting `curDur` between successive single plays.
- **Playing** appends `{ notes:[…], dur, dyn }` (or `{ rest:true, dur, dyn }`) at the cursor and advances
  the cursor by `dur` **ticks**. **Stage space** = total timeline ticks (`LOOP_BARS × barTicks`); the
  "notes left" meter becomes **beats/bars remaining** (a whole note eats 4× a quarter). Auto-finish when the
  timeline is full (warned near the end); the **✓ Finish** button stays.
- **Duration resolution — integer ticks, tuplet-safe (supersedes the `beats`/`SUBDIV`-only model).** Store
  every duration as **integer ticks** with **`TPB = 24` ticks per beat** (24 is divisible by 2/3/4/6/8/12,
  so it covers 8ths/16ths **and triplets and dotted values** with no float drift — the power-of-2 `SUBDIV`
  model could never do thirds). Reference values: whole `96` · half `48` · quarter `24` · eighth `12` ·
  sixteenth `6` · **eighth-triplet `8`** · **dotted-quarter `36`**. The same picker drives note-stacks and
  the rest card, so **8ths/16ths/triplets/dotted arrive for notes AND rests together** — just add the value
  to the picker. The **on-screen grid resolution is a separate display choice** (how many columns per beat
  to draw), independent of tick precision.
- **Meter is a variable, not a constant.** Replace the hard-coded 4-beat bar with a **time signature
  `{ beatsPerBar, beatUnit }`** (fixed **4/4** for now: `beatsPerBar=4`, `beatUnit=4`), so `barTicks =
  beatsPerBar × TPB × (4/beatUnit)`. This lets **3/4, 6/8, cut time** become teachable later instead of
  being baked out of the model. Bars/measures stay purely visual gridlines derived from `barTicks`.

### Scoring becomes timeline-aware

- **The current stack** is classified as today for its base + in-key + consonance + resolution: 1=note,
  2=interval, 3=triad, 4=7th, else cluster. (No `run` type from a single play anymore.)
- **Melodic motion (M4)** is scored between the **new note and the previous timeline note** (stepwise motion
  vs leap), not within a selection.
- **Scale runs (M4)** are **detected across consecutive single-note timeline events** moving stepwise (3+ in
  a row) → run bonus + Codex. (This is where the old `run` structure moves to.)
- **Rhythm/groove (M2)** rewards varied durations across the timeline; a played rest is a rhythmic event.
- **Form (M7)** reads phrase fingerprints over the timeline (as today, just timeline-based).

### Storage & migration

- The loop becomes an **event list** (`{notes,dur,dyn}` / `{rest,dur,dyn}`) with position from cumulative
  duration (or an explicit start beat). This **replaces** the `bars[]` (one-per-bar) + `seq`/`durs` model.
- **Save format changes** (Setlist songs store the event list). Keep a **back-compat read** for old saved
  songs (interpret legacy `bars[]` as one event per bar). `snapshotBars`/`songReport`/`scheduleBar`/the grid
  all move from per-bar to per-event.

### UI — the loop grid becomes a piano-roll

- Rows = pitches, columns = beats at the chosen **display resolution** (independent of tick precision). Each
  event draws as a horizontal bar spanning its duration at its timeline position (rests = gaps). The **write
  cursor** is a movable vertical line; click a beat to aim it (append/overwrite from there — detailed
  mid-timeline editing can come later). The hand + duration + dynamics controls set the **next** play.
- **⚠️ A staff-notation view is a strong future direction the dev may prefer over this color/piano-roll grid**
  — see the coverage checklist. Keep the render layer swappable so the timeline (event list) can drive
  either a piano-roll *or* a staff without touching the model.

### Open sub-decisions (defaults I'll use unless you say otherwise)

- **Chord = one shared duration** (a stack rings for `curDur`, then the cursor advances). **[assumed yes]**
- **Rests are solo-only** (can't be mixed into a note stack). **[assumed yes]**
- **Click-to-aim** moves the cursor to a beat and overwrites forward; full insert/ripple editing is deferred.
- **Build staging (proposed):** Stage 1 = timeline + stacking + per-play duration + rest-alone + caps +
  piano-roll + timeline scheduler + stack/melodic-motion scoring; Stage 2 = timeline run detection, form on
  the timeline, save-format migration polish.

### Stage 1 — ✅ BUILT (2026-07-18)

All nine points below shipped in `mujicians.html`. **As built:** `run.loop = { events:[], cursor }` (ticks)
replaced `bars[]`/`writePos`; `TPB=24`, `METER={beatsPerBar:4,beatUnit:4}`, `BAR_TICKS=96`, `LOOP_BARS=12`,
`TOTAL_TICKS=1152`; `DURATIONS` carry **ticks** + rest glyphs and a per-play `run.curDur` (one `durControlHTML`
picker, swaps to rest glyphs when the rest card is selected). `playHand` builds **one stack** (or a lone rest)
→ `placeEvent` (overwrites collisions in the span, sorts by tick, advances the cursor). New timeline
scheduler (`schedTick`/`scheduleEvent`/`tickPlayhead`) cycles the whole event list and sweeps a playhead
**column**; `soundStack` is the immediate play-preview. Grid is a **piano-roll** (`eventCoverage` →
on/held columns; a bar-number ruler footer; gold write-cursor column; click-to-aim by `data-tick`). Scoring
is timeline-aware (rhythmic variety vs the previous event's dur; dynamic contrast over events; melodic
**stepwise motion** vs the previous timeline note; form restatement over events). Stage space = the cursor's
distance to `TOTAL_TICKS` (auto-finish at the end; ✓ Finish stays). Save format is now an **event list**
(`snapshotEvents`); `songReport`/`suggestName`/`saveSong` take events; **MJ2:** share codes carry events and
legacy **MJ1:**/`bars[]` saves still read via `eventsFromBars`. Rest cards (`REST_COPIES=3`) join the deck at
M2+ and are solo-select. **Two deliberate deviations from the brief:** (a) a **minimal timeline scale-run
detector** (`detectTimelineRun` — 3 stepwise single notes in a row) was pulled forward from Stage 2 so the
**M4 melody gate stays clearable** now that the M4 cap is 2 (can't stack a 3-note run); (b) the loop-grid
footer is a **bar-number ruler**, not per-event structure labels (the preview still names the current
structure). **Deferred to Stage 2 (unchanged):** 8ths/16ths/triplets in the picker (the tick model already
fits them), fuller run-detection & form scoring, save-format migration polish, chord-inside-melody.

**⚠️ TODO (grow the stage instead of showing all 12 bars at once).** Right now the whole `LOOP_BARS=12`
(`TOTAL_TICKS`) grid is drawn from the start, so the backing loop takes far too long to come back around to
the player's first notes. Fix: **start small (≈4 bars) and grow only as the player needs room** — i.e. keep
the *visible/looping* length **one step ahead of the cursor** so the next play's landing spot is always
shown (in ghost form) but the loop stays tight. Implementation sketch: track a live `run.loop.lenTicks` (or
derive `max(minBars, ceil((cursor+curDur)/BAR_TICKS)+1 bars)`), use it for `TOTAL_COLS`/the grid, the
scheduler's `schedTotalTicks()` (the loop wraps at the *current* length, not the full 12), the notes-left
meter, and auto-finish. `LOOP_BARS` becomes the **max** stage (and the *+loop-bars* shop item raises it).
Watch the loop-length change mid-groove (the scheduler reads it fresh each tick, so growing it is safe, but
verify the playhead phase doesn't jump jarringly when it grows).

<details><summary>Original Stage 1 build brief (the nine points, for reference)</summary>

Build against the current shipped `mujicians.html` (rest-card/subdivision prototype was reverted). Deliver a
thin but complete vertical slice of the new model, parse-check as you go, let the dev verify in-browser.

1. **Data model.** Replace the per-bar loop (`run.loop.bars[]`, `handIsSequenced`, per-card `run.noteDur`)
   with an **event list** `run.loop.events = [ {notes:[{pc,letter,instId,midi}], dur, dyn} | {rest:true, dur, dyn} ]`
   and a **cursor** (in ticks). `dur` is **ticks**; `TPB = 24`; `meter = {beatsPerBar:4, beatUnit:4}`;
   `barTicks = beatsPerBar*TPB`. A per-play **`run.curDur`** (default quarter=24) set by one picker; `run.curDyn` stays.
2. **Play.** `playHand` = take selected cards → **one stack** (all notes together) OR a lone rest → append
   `{notes,dur:curDur,dyn}`/`{rest,dur:curDur,dyn}` at the cursor → advance cursor by `curDur`. No sequencing.
3. **Caps.** `MOVEMENTS[].maxSelect` → `1,1,1,2,3,4,4`. Selecting counts notes only; a rest is solo.
4. **Rest card.** One `{rest:true}` card in the deck at M2+ (groove on); played alone; uses `curDur`.
5. **Scheduler.** One continuous timeline: schedule each event at its tick offset; a stack sounds together
   for `dur`; a rest is silence. Loop cycles the whole timeline. Playhead sweeps by ticks.
6. **Grid → piano-roll.** Rows = pitches, columns = beats at a display resolution; each event = a horizontal
   bar spanning `dur` at its tick position; rests = gaps; movable write cursor (click a beat to aim).
7. **Scoring (thin).** Classify the current stack (note/interval/triad/7th/cluster) for base + in-key +
   consonance + resolution; **melodic motion** vs the previous timeline note. (Run-detection & form → Stage 2.)
8. **Stage space & finish.** "Notes left" = ticks/bars remaining; auto-finish when full; ✓ Finish stays.
9. **Save.** Snapshot the event list; keep a back-compat read of old `bars[]` saves (one event per bar).

Defer to Stage 2: timeline scale-run detection, form scoring on the timeline, save-format migration polish,
chord-inside-melody, eighths/sixteenths/triplets in the picker (the tick model already supports them).

</details>

---

## Music-theory coverage — gaps to design around (checklist, mostly not built)

> **Status: a running audit** (started 2026-07-18) of theory concepts the current model can't yet express,
> so they're recorded and can be tied to movements rather than discovered late. Ordered by how expensive
> they are to retrofit. **Nothing here is a commitment to build now** — it's the map. Several are already
> planned elsewhere (accidentals → M1, key change → M4) and cross-referenced.

**Designed in already (from the rework above):**
- ✅ **Tuplet-safe rhythm** — integer ticks, `TPB=24`, so triplets/dotted/8ths/16ths are all representable.
- ✅ **Meter as a variable** — `{beatsPerBar,beatUnit}` (fixed 4/4 now) so **3/4, 6/8, cut time** are reachable.

**Structural — cheaper to allow-for now than to retrofit:**
- **Scale degrees / function vs. absolute color.** ROYGBIV = *absolute* letters, but most theory is
  *relative* (tonic/dominant, scale degrees 1–7, ii–V–I, solfège). Once the key changes (planned M4), the
  color stays fixed while the *function* is what's being taught. **Plan:** a scale-degree / solfège overlay
  so learners think "the 5th (dominant)," not just "G." Keep the key + a `degreeOf(pc, key)` helper central.
- **Chord inversions & voicing.** Detection is pitch-class-set (mod-12), so a root-position triad and its
  inversions (or a unison vs. an octave, a 3rd vs. a 10th) are **indistinguishable** to the engine. Inversions
  / figured bass / voice-leading are central to harmony. **Plan:** track actual `midi`s (register), not just
  pcs, in classification when harmony matters.
- **Enharmonic spelling & interval quality.** pc-sets can't tell C♯ from D♭, or an augmented-4th from a
  diminished-5th — but correct *spelling* (key-dependent) is exactly what theory drills. Ties into the
  accidentals plan (M1). **Plan:** carry a spelled letter+accidental, not just a pitch class.

**Content — slot into movements / modes later:**
- **Modes & minor.** C major is fixed; natural/harmonic/melodic minor and the church modes are core.
  (Partly the planned "minor key" boss.) Needs the accidentals + key work.
- **Accidentals / chromaticism / key signatures** — already planned (M1 accidentals, M4 key change); listed
  here so the theory map is complete.

**Pedagogy — how it teaches, not just what it models:**
- **Name the concept.** Teaching = labeling. Prefer "you played a **ii–V–I** (perfect cadence)" over a bare
  "+1." Lean on the Codex/report card to *explain*, not just score.
- **Staff-notation view (strong candidate — dev may prefer it over the color/piano-roll grid).** The
  color grid is accessible but sidesteps the staff, which is *the* literacy skill in most theory curricula.
  Because the model is a clean event list, a **staff renderer can be an alternate view** (or the default)
  driven by the same data. Flagged for a later pass; keep the render layer swappable now.
- **Ear-training mode.** Hear an interval/chord → name it — the natural complement to the audible-payoff
  pillar.

---

## Removing gigs — a run becomes one performance (BUILT)

> **Status: BUILT (2026-07-17)** in `mujicians.html`. A run is now **one continuous performance in one
> fixed key** with a **single applause threshold** and **one Muse drafted once at the start**. The 3-gig
> Set, the C→G→F modulation, per-gig thresholds, per-gig Muse re-drafts, and the loop's section/key-strip
> UI are all gone. The three forks below record the decisions; the **As built** subsection is the code map.
> *(Follow-ons still open: key change relocated to the Melody movement (M4) and accidentals to Pitch (M1)
> remain **planned, not built** — see the Progression notes.)*

**Why.** The 3-gig Set **disrupts play** (three separate threshold gates + two between-gig Muse-draft
interruptions per run), and the dev "doesn't really care about the Muses." Collapsing a run to **one
continuous performance** removes the mid-run gates and drafts, so a run reads as *sit down → build one
song → done*, which is what the "made some music" payoff and Save-a-Song already want to be.

### The three forks

1. **Run shape — ⚠️ SUPERSEDED 2026-07-18.** *Was* DECIDED "one session, one threshold" (win = beat the
   applause threshold, lose = run out of hands) as the built gig-removal cut. **Playtest reversed this:**
   the threshold **cut the dev off mid-song**, so it's being removed — a performance is now **open-ended**
   (you decide when you're done; the only hard limit is loop space). The **endless/no-threshold** option
   listed here as "surfaced but not chosen" is now the chosen direction. See **[Open-ended performance —
   no threshold](#open-ended-performance--no-threshold-you-decide-when-youre-done-planned)**. *(The built
   code still has the threshold win-check; the new section is the plan to delete it.)*
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
  `sectionOfBar` is removed. `loopLenNow()` — with no sections — returns a constant `LOOP_BARS` (the full
  loop is always shown and always grooves). *(Note: an early attempt to shrink it to the "filled prefix"
  broke the groove — `startLoop` freezes the length once — so it must stay constant. See **As built**.)*
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

### As built (code map)

- **`GIGS` array → `RUN_KEY`** (`{ keyName:"C major", key:majorScale(0) }`) — one fixed key. All former
  `GIGS[run.gigIdx]` / `curGig()` reads now hit `RUN_KEY`. `sectionOfBar`/`sectionKey`/`gigIdxClamped`/
  `curGig`/`modKeyName` are **deleted**.
- **One flat loop.** `SECTION_BARS` is gone; `LOOP_BARS = PLAYS`. The write head advances
  `(writePos+1) % LOOP_BARS` across the **whole** loop (no per-section confinement; click-to-aim reaches
  any bar). `loopLenNow()` returns a **constant `LOOP_BARS`** — the full grid is always shown and always
  grooves (empty bars are rests you fill in). *(This must stay constant: `startLoop` freezes
  `playSrc.n = loopLenNow()` once, so a growing value would strand the groove on the bars filled at start
  — the bug in the first cut.)*
- **Deck recycle.** Gigs used to reshuffle a **fresh full deck each gig** (3 decks/run). With one
  `startPlay` + one shuffle, `drawUp()` now **reshuffles the whole deck when the draw pile empties**, so a
  single continuous run doesn't starve — the **`PLAYS` budget**, not deck exhaustion, is the real limiter
  (the `hand.length===0` loss path is now effectively unreachable).
- **Budget & threshold.** `PLAYS = 12`, `DISCARDS = 4` are now the **whole-run** budget (were per-gig).
  `gigThreshold()` → **`runThreshold()`**: campaign uses the movement's `thr` (retuned ~×2 for the longer
  single run — M1 90 … M6 2000), Free Play/M7 uses the new **`RUN_THRESHOLD = 2600`** (replaced the
  escalating `GIGS` thresholds). `run.gigScore` → **`run.runScore`**.
- **Lifecycle.** `run.gigIdx` removed. `startGig()` → **`startPlay()`** (deals the hand, `writePos=0`,
  starts the groove) — called once after the single draft. `winGig()` (which incremented `gigIdx` and
  re-drafted) → **`winRun()`** (threshold met = run won, straight to the win screen). `offerDraft()` is
  called **once** from `startRun`; the `winGig` re-draft is gone (`pickMuse`/empty-pool → `startPlay`).
- **Loop grid (`loopStripHTML`).** Removed **section dividers** (`.secstart`), the **per-section key strip**
  (`.lsecbar`), and the **locked-cell** logic — the whole loop is one writable key; row-greying keys off
  `RUN_KEY.key`. (The now-unused `.lsec/.secstart/.locked` CSS rules are left in place, harmless.)
- **Save-a-Song.** `saveSong`/`renderSaveOverlay` pass `songReport` the key as the `RUN_KEY.key`
  **pc-array** (the per-bar `sectionKey` function path is retired for live runs but `songReport` still
  accepts a function for forward-compat); `keyName` is `"C major"` (not `"C→G→F"`). `decodeSong` falls
  back to `RUN_KEY.key`.
- **Copy.** HUD ("Key … · M_n_"), draft dialog (once, no "modulates to…"), save/end overlays
  ("Performance complete", "beat the applause threshold"), home rules, and the top-of-file header were all
  de-gigged.
- **Untouched (as predicted):** `classify`, the scheduler (`scheduleBar`/`scheduleVoices`/`barQueue`),
  tempo, Codex, `MUSE_POOL` contents, and **M7 `hasABA`/form scoring** (reads the flat `run.loop.bars`).
  The render function is still named `renderGig` / screen `"gig"` / `.gigbar` CSS — kept as plain names for
  "the play screen" (no behavior tied to gigs).

### Open items for this feature

- **Balance the new numbers in play** — `PLAYS`/`DISCARDS`/`LOOP_BARS` (12/4/12) and the retuned
  thresholds (campaign `thr`, `RUN_THRESHOLD`) are first-pass placeholders.
- **Repeatable hand-size Muses** — Extra Hand / Big Hand can no longer re-draft to stack across gigs; they
  now pay out once. Revisit their value/`repeatable` flag (currently unchanged).
- **Modulation at Melody (M4)** — the design of the player-driven key-change mechanic and its scoring
  lives with the Melody movement, not here (see the **Progression** note). This section only removes the
  *gig-boundary* modulation; M4 reintroduces key change deliberately.

*(Forks 1 & 2 are now decided — see above. The **accidentals** direction is recorded in **Progression →
Movement 1 (Pitch)**.)*

---

## Open-ended performance — no threshold, you decide when you're done (BUILT)

> **Status: ✅ core BUILT (2026-07-18)** in `mujicians.html`. Supersedes **Removing gigs → Fork 1** (which
> DECIDED "one session, one threshold"). Playtest feedback reversed that call: **the applause threshold
> that ended a run is removed.** A performance now ends when the **player** presses **✓ Finish song**, or
> when the **loop runs out of space** — never because a score gate cut them off. The *endless/no-threshold*
> option that Fork 1 surfaced-but-rejected is now the shipped direction. **One planned piece was
> deliberately deferred:** persisting the per-run gate counters across runs (see *As built* → deferred).

**Why (the frustration).** The single applause threshold ends the run the moment you cross it — which
repeatedly **cut the dev off mid-song while a performance was going well**. A tool whose whole payoff is
"I made some music I like" shouldn't yank the song away the instant a number is hit. Balatro's pass/fail
tension is wrong for a *creative* toy: the fun is building the song, not clearing a bar.

### The new run shape

- **Applause is a running score, not a gate.** It counts up as you play hands; you watch it climb. There
  is **no win/lose** — a performance just **completes**.
- **You decide when you're done.** A **✓ Finish song** control on the play screen ends the performance
  whenever the player wants (→ the end overlay: report card, Tips earned, Save-a-Song, any movement
  unlocked).
- **The only hard limit is space.** The loop has `LOOP_BARS` slots (the "there's only so much room on
  screen" limit). Each played hand fills one bar and advances the write head; when **every bar is filled,
  the performance auto-completes** (you're out of canvas). Because a play already writes exactly one bar
  and `LOOP_BARS = PLAYS`, the **hands budget and the loop-space limit are the same limiter** — they
  unify, so "no threshold" is mostly *deleting the win-check*, not adding a new limiter.
- **Warn before the space runs out.** A **notes-left meter** ("Notes left: 6 of 12 bars") sits where the
  threshold progress bar was; it turns to a warning color at **≤2–3 bars left** so the auto-finish never
  ambushes the player. (More stage space is buyable — see the **backstage shop**'s *+loop bars*.)
- **Discards** stay a small separate budget (a light "re-draw" tension), or become generous — tune in
  play. They are **not** a run-ending limiter anymore; only space is.

### What collapses (the threshold's old jobs)

`runThreshold()` / `MOVEMENTS[].thr` / `RUN_THRESHOLD` fed three things — all replaced:

| Old (threshold) | New (open-ended) |
|---|---|
| Win-check in `playHand` (`runScore >= runThreshold()` → `winRun()`) | **Deleted.** No score ends the run. |
| Scoreline "Applause X / thr" + progress bar | **"Applause X ★"** + a **notes-left meter**. |
| `winRun()` / `loseRun()` two terminal states | **One `finishRun()`** → end overlay "Performance complete." |

`MOVEMENTS[].thr` and `RUN_THRESHOLD` become **vestigial**. Keep them (optional) only as a **non-blocking
"applause star"** — a bragging target shown on the report card, never a gate. Otherwise delete.

### The conflict this resolves early — campaign advancement

This is exactly the kind of clash the dev wanted surfaced up front: **movements currently unlock at run
end via `maybeAdvance()`, and a run ended on the threshold.** Remove the threshold and advancement needs a
new trigger. Good news: **the gates are already skill-demonstration objectives, not score checks** —
`gateStatus(mv)` counts *doing the mechanic* (play each note value, log N triads + a cadence, compose an
A·B·A…), and `maybeAdvance()` already fires on `gateStatus(mv).met`, **not** on beating `thr`. So the
decision — **"unlock the next movement by demonstrating its skill N times"** — is *already how gates
work*; the only coupling to sever is *when* the check runs.

**Decided & built:**
- **Advance on `finishRun()`** (`maybeAdvance()` still runs at performance end): finish a song, and if you
  met the frontier movement's gate during it, the next movement unlocks. No new UI. **This works better
  than before** — the old threshold ended a run *early* (M1's `thr` was 90), sometimes before you'd
  demonstrated the skill; now a performance runs the full ~12 hands (or until you Finish), giving *more*
  room to hit a gate, not less. So the per-run gates stay clearable in one sitting.
- **Deferred (not built): persisting the per-run gate counters across runs.** The plan to move
  `gateDurs`/`gateDyns`/`gateTriads`/… into `persist.progress.gates` so demos accumulate across the
  daily-capped runs was **left out of this pass** — it's a nicety, not required, because a full-length
  open-ended performance clears each gate on its own (unlike the old early-ending threshold run). Revisit
  if playtest shows a gate is hard to clear in one sitting. *(M1 pitch letters already persist.)*
- *(Optional polish, later, not built)* a **live "🎓 Movement unlocked!" toast** the instant a gate is met
  mid-song, instead of waiting for the end overlay.

### As built (code map)

- **`playHand`:** deleted the `run.runScore >= runThreshold()` win-check. The `run.playsLeft <= 0 ||
  hand.length===0` path now **auto-completes** the performance (→ `finishRun()`) instead of a "loss."
- **`winRun()` / `loseRun()` → one `finishRun()`** — `run.done=true; maybeAdvance(); screen="win"`. Guarded
  against double-fire. `run.won` init renamed `run.done`. `screen="win"` is kept as the **single**
  end-of-performance screen; `screen==="lose"` is removed from `render()` and the `syncChrome` pile list.
- **`runThreshold()`** left **defined-but-unused** (marked vestigial in-code) as the source for a future
  optional **non-blocking "applause star"**; `RUN_THRESHOLD` / `MOVEMENTS[].thr` kept for the same reason.
- **HUD (`renderGig`):** dropped the `runScore/thr` progress bar + "Applause X / thr" scoreline. Now shows
  **"Applause X ★"** and a **notes-left meter** — `Notes left: N of LOOP_BARS bars`, colored `--bad` and
  captioned "running out of stage!" at **≤3 left** ("stage full" at 0). The `.track` bar now fills with
  *used* space (`(LOOP_BARS-playsLeft)/LOOP_BARS`). Removed the redundant "Hands" figure from the counts
  row (the meter replaces it). Added a **✓ Finish song** button to the controls (disabled until ≥1 bar is
  filled), wired to `finishRun`.
- **End overlay (`renderEndOverlay()`):** no longer takes a `won` flag; single **"🎉 Performance
  complete!"** state. Copy reads "You performed an N-bar song for X applause…". The movement-unlock line,
  Save-a-Song (`offerSave("win")`), replay, and New-Run/Home CTAs are unchanged. `afterSave()` dropped its
  `"lose"` branch. *(Tips-earned line will be added with the shop.)*
- **Untouched:** `classify`/`score`/scheduler/loop groove/Codex/Save-a-Song/motion — only *what ends a run*
  changed. Parse-checked OK.
- **Untouched:** `classify`/`score`/scheduler/loop groove/Codex/Save-a-Song/motion — the score model and
  the audible-payoff pillar are unchanged; only *what ends a run* changes.

### Interactions / open items

- **Loop capacity (known-issue #5, #1).** A bigger canvas matters more now that filling it *is* the end
  condition — revisit letting a melodic/whole-note hand span bars alongside the *+loop bars* shop item.
- **Free Play vs Campaign.** Both go threshold-free. Free Play's "star" target = the old `RUN_THRESHOLD`
  (optional). Campaign shows the **gate objective**, not a score bar, as the thing to chase.
- **Save-a-Song** now has *no losing branch to special-case* — every performance ends the same way and is
  always saveable. Simplifies `offerSave(retScreen)` (one ret path).

---

## The backstage shop & Tips economy (PLANNED)

> **Status: PLANNED, not built (decided 2026-07-18).** Fills the long-standing "economy" gap (the Balatro
> shop analog). **Decided:** a **separate currency** ("**Tips**" 💰, working name) — *not* applause;
> a **persistent Home "backstage" meta-shop** open **between performances**; spending never touches your
> applause score. Numbers below are first-pass placeholders to tune in play.

**Why a separate currency.** Applause is the **score/achievement** — the thing the report card grades and
the Setlist brags about. If you *spent* applause, buying things would visibly lower the song you just
earned (bad). Balatro keeps chips (score) and $ (money) separate for exactly this reason. So performing
earns **Tips**, a spendable currency; **applause stays pure.**

### Earning Tips

At performance end, convert the run's quality into Tips (tunable):

```
tips = floor(applause / TIP_DIVISOR)         // the base earn (e.g. TIP_DIVISOR ≈ 150)
     + structureBonus                        // small bonus per distinct structure played (variety)
     + gateBonus                             // one-time bonus the run you clear a movement's gate
```

Kept **modest** (Balatro pays ~3–6 $ a blind) so the shop is a slow burn. Because play is **hard-capped
at 3 runs/day**, Tips accrue over the *ritual* — which gives the daily cap a **progression reason to
return**: come back tomorrow, perform, then spend the Tips you banked. Store as **`persist.tips`**
(additive to the `mujicians-save-v2` blob, default `0`). Show the balance on Home and the end overlay.

### The persistent loadout (why the shop is meta, not per-run)

Balatro's shop is *per-run* (money resets each run). Mujicians is different: **short, single-key,
daily-capped sessions** — a per-run shop would barely have time to matter. So the shop is a **persistent
backstage** on Home, and what you buy goes into a **loadout you carry into future performances**:

```
persist.loadout = {
  muses:   [ …owned Muse ids… ],   // your collected build-engine pieces
  extraCards: [ …note/accidental cards added to the deck… ],
  etude:   { triad:0, seventh:0, run:0, … },  // per-structure base-score levels
  loopBonus: 0,     // extra LOOP_BARS bought (bigger stage)
  restCards: 0,     // extra copies / special rests (fermata/grand-pause); the basic rest card ships with the rhythm rework
  instruments: [ …extra voices unlocked early… ],
}
```

`startRun()` reads the loadout when building the deck / loop / Muse-draft pool.

### What the shop sells

| Item | Effect | Ties to |
|---|---|---|
| **Muse** (Joker analog) | Adds a passive scoring engine to your **owned pool**; the run-start draft then offers from a bigger set (targeted acquisition vs. the free random draft). | `MUSE_POOL`, `offerDraft()` |
| **Note cards / copies** | Grow the deck (the design wants 7 → 20–40 cards for draw variety). | `buildDeck()` |
| **Accidental pack** (Tarot analog) | Sharpen/flatten/transpose cards; seeds the M1-accidentals & M4-modulation mechanics. | planned accidentals |
| **Étude** (Planet analog) | Level up a structure type (triad / 7th / scale-run) → higher **base** score. | `STRUCT` base |
| **+Loop bars** (bigger stage) | +N `LOOP_BARS` — more room before the space limit auto-finishes you; **the direct sink for "there's only so much screen."** | new `loopBonus` |
| **Rest cards** | Extra copies / **special** rests (fermata, grand-pause). The basic rest card ships with the rhythm rework. | rhythm rework |
| **Instrument voice** | Buy guitar/bass/etc. **early** (before its campaign movement). | `INSTRUMENTS` |
| **Reroll / restock** | Refresh the shop's offers. | — |

### Scope guard — economy lives in Free Play, not the teaching campaign

The **campaign movements stay curated** (fixed per-movement deck, instrument gating, one isolated concept
each) — that isolation is the pillar's teaching contract, and a bought Muse or extra instrument would
break a movement's "one concept at a time." So the **loadout/shop applies to Free Play** (and
post-graduation play), the mode that *is* the full deckbuilder. **Tips can still be earned during campaign
runs** (they teach you the game), but they're **spent on the Free-Play loadout**. This keeps the shop from
polluting the lessons while still rewarding every performance.

### Shop UI (when built)

- A **"🏪 Backstage"** panel on Home (near the Setlist), showing the **Tips balance** and a small grid of
  offers (icon · name · effect · 💰 price · Buy). A **reroll** button. Owned Muses/loadout shown as a
  small "your kit" strip.
- Prices/stock are placeholders; gate a couple of pricier items behind having graduated far enough so a
  brand-new player isn't overwhelmed.

### Open items

- **Currency name** — "Tips" is the working name (buskers/applause fit); alternatives: Royalties, Gate
  (as in door money), Cred. Pick during build.
- **Tip formula constants** (`TIP_DIVISOR`, bonuses) and **prices** — tune so 3 runs/day feels like
  steady-but-not-instant progress.
- **Draft vs. shop for Muses** — does the free run-start draft-of-3 stay (drawn from owned + a few
  always-available), or does the shop replace it entirely? Leaning **keep the draft**, sourced from the
  owned pool, for run-to-run variety.
- **Do campaign runs earn Tips, or only Free Play?** Leaning **earn everywhere, spend on Free-Play
  loadout** (above), but a "Free-Play-only economy" is simpler — decide in build.

---

## Mobile landscape — more stage room for longer songs (PLANNED)

> **Status: PLANNED, not built (decided 2026-07-18).** Goal: give phones the **horizontal room** the loop
> grid wants, so a run can hold **more bars** without cramping. **Helpful context — Mujicians is NOT a
> `<canvas>` game:** the loop grid is a **CSS grid of `<div>`s** (`loopStripHTML` → `.loopgrid`) and the
> cards are DOM, so the layout **reflows with CSS** — landscape is far easier here than in a fixed-size
> canvas game.

**The key constraint (why we don't *force* rotation).** The web's **Orientation Lock API**
(`screen.orientation.lock('landscape')`) works on **Android Chrome only, and only inside fullscreen from a
user tap**. **iOS Safari does not support it at all** — you cannot force landscape on an iPhone from a web
page. (This is the one place a *native app* would genuinely win: an app can pin its orientation; mobile
web can't, on iOS.) So forcing is off the table as the primary approach.

**Decided approach — responsive + a "rotate your phone" nudge** (works on iOS *and* Android):
- **Detect portrait** via `matchMedia("(orientation: portrait)")` / a CSS `@media (orientation: portrait)`
  block (or the `innerWidth<innerHeight` fallback).
- On a **narrow portrait phone**, show a lightweight **"🔄 Turn your phone sideways for more room"**
  overlay instead of the cramped board; when the player physically rotates, the game renders normally in
  the wider landscape layout. No fullscreen, no API quirks, no rotated-coordinate hacks.
- **Progressive enhancement (Android only):** on a tap, *try* `requestFullscreen()` + `orientation.lock`
  in a `try/catch` and silently ignore failure (iOS just no-ops and falls back to the nudge). Never depend
  on it.
- **Rejected:** the **CSS `transform: rotate(90deg)` hack** (forces landscape everywhere but rotates the
  whole coordinate space — breaks touch hit-testing and the Save-a-Song text input). Not worth it for a
  DOM app with inputs.

**Landscape ≠ longer songs by itself.** Song length is `LOOP_BARS` (a fixed logical count, today 12) —
orientation only changes how many bars **fit on screen**. So this pairs with **raising `LOOP_BARS`** (and
the planned **+loop bars** shop item): landscape supplies the pixels, `LOOP_BARS` supplies the song. Build
them together so a longer loop doesn't just overflow a phone.

**How it'd be built (when we do it).** Mostly CSS: an `@media (orientation: landscape)` / min-width block
that lets `.loopgrid` (and the hand row) use the wider viewport (more visible bars, larger cells); a small
portrait-overlay component gated on `matchMedia`; and an optional tap-to-fullscreen-lock helper for
Android. Single-file, no deps, in keeping with the repo rules.

**Testing.** **Chrome DevTools → Device Mode** (the phone icon, `⌘⇧M`) — pick an iPhone/Pixel and use the
**rotate** button — is great for the responsive layout + rotate-nudge (approach above). It **won't**
faithfully test the *lock API* or reproduce iOS Safari's *lack* of it, so the fullscreen-lock enhancement
needs a **real Android phone** (and any "does it force on iPhone?" question is answered on a **real
iPhone** — it won't).

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
| Blinds (score gates) | ~~Gigs / applause threshold~~ — **removed.** No score gate; a performance is **open-ended** (loop space is the only limit). Campaign advancement is a **skill-demo gate**, not a score. |
| Boss blind gimmicks | **Boss constraints** (Free-Play modifiers) — "atonal night: no in-key bonus," "minor key only," "one instrument silenced," "dissonance taxed" (no longer per-gig — tentative) |
| Ante (3 blinds) | ~~A Set (3 gigs)~~ — **removed** (a run is one continuous performance) |
| Shop between blinds | **Backstage shop** on Home (persistent, between performances) paid in **Tips** — Muses, Étude/Accidental cards, notes/instruments, +loop bars ([plan](#the-backstage-shop--tips-economy-planned)) |
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

**Economy — ⚠️ updated 2026-07-18.** The Balatro-faithful "hands/discards + escalating applause
thresholds + shop between gigs" is superseded: **no thresholds** (open-ended performance, loop space is
the limit), and the shop is a **persistent Home backstage** paid in **Tips** (a separate currency from
applause), not a between-gig stop. See **[Open-ended performance](#open-ended-performance--no-threshold-you-decide-when-youre-done-planned)**
and **[The backstage shop & Tips economy](#the-backstage-shop--tips-economy-planned)**.

---

## The "made some music" payoff

> **⚠️ Note (2026-07-17):** the gig-specific mechanics described in this section and the Phase-4 /
> Implemented sections below (3 gigs, C→G→F modulation, per-section loop, per-gig Muse re-drafts) were
> **removed** — a run is now one continuous single-key performance. See **Removing gigs — a run becomes
> one performance (BUILT)**. The prose below is kept for history; the *one accumulating loop / Save-a-Song*
> spine survives, just in one key.

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
  durs, arp}` (`durs` replaced the old `fig` in Stage 2A); `saveSong(bars,name)` pushes
  `{id,name,date,keyName,key,tempo,bars,stars,starred}` onto
  `persist.setlist` (`localStorage["mujicians-save-v2"]`, additive) and `pruneSetlist()` caps at
  `SETLIST_CAP=30` (★-pinned never pruned). ⚠️ **Post gig-removal:** a save now stores
  `keyName: RUN_KEY.keyName` (`"C major"`) and `key: RUN_KEY.key.slice()` — the run's **single** key
  (Setlist replay is key-agnostic, sound is from MIDI). *(The old `"C→G→F"`/`modKeyName()`/`GIGS[0].key` are
  gone — see **Removing gigs**.)* `snapshotBars()` also stores per-bar `durs` (see Stage 2A).
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

## Animations & card motion (**v1 core BUILT 2026-07-17**)

> **Status: v1 core BUILT (2026-07-17)** in `mujicians.html` — a Balatro-style card-motion layer.
> **Decided this pass** (dev): **(1)** build the motion system **now, against today's cards** — the
> pixel/Inklings reskin stays a separate later track (motion is art-agnostic, so it inherits any future
> card art for free); **(2)** feel = **snappy & subtle** (fast tweens, light overshoot/settle — not
> full-Balatro bounce), dial-up-able later; **(3)** add **minimal visible deck + discard piles** as motion
> anchors; **(4)** first pass = **core card motion only** (deal, play→note, discard, hand reflow, animated
> Sort, note-cell bloom). Score-juice, idle sway, draft reveal, and screen transitions are deferred.
>
> **As built (code map).** A self-contained inline block (`/* card motion (v1 core) */`), no deps, Web
> Animations API + FLIP. Chrome added **outside `#game`** so it survives the full re-render: `#fxlayer`
> (the throwaway-clone overlay), `#deckpile` (bottom-left, shows the draw count), `#discardpile`
> (bottom-right); `syncChrome()` (called from `render()`) shows/refreshes the piles **only while a run's
> play board is on screen** (`gig`/`save`/`win`/`lose`) and **hides them off-play** (home/capped/pre-run
> draft). *(Because `.pile` sets `display:flex`, an explicit `.pile[hidden]{display:none}` rule is needed
> for the `hidden` toggle to actually hide them — an early cut showed the piles on Home.)* Cards now carry
> **`data-id`** (stable card id) + **`data-midi`**, and loop cells carry **`data-midi`**, so motion can
> target a card's landing cell and FLIP can track survivors by id.
> - **`flyClone(srcEl, from, to, opts)`** — clones a card onto `#fxlayer`, animates it `from`→`to` (with
>   optional `scale`/`fade`), removes it on finish. `srcEl` may be **detached** (already removed by the
>   re-render) — only the captured rects are read, never the node's live box.
> - **`snapHand()`/`flipHand(prev)`** — FLIP the hand: record rects by `data-id` before render, slide
>   survivors from old→new box after (used by play, discard, Sort).
> - **`dealIn()`** (called at the end of `renderGig`) — cards drawn this render (`run._justDrawn`, set in
>   `drawUp()`) fly from the deck pile to their hand slot, staggered; the real card is hidden until its
>   clone lands.
> - **`flyPlay(flyFrom, bar, handSnap)`** (from `playHand`) — each played card, captured via
>   `captureSelected()` **before** mutation, shrinks and flies to its loop cell
>   (`.lgcell[data-bar][data-midi]`), then the cell **blooms** (`bloomCell`).
> - **`flyDiscard(flyFrom, handSnap)`** (from `discardHand`) — discarded cards fan to the discard pile and
>   fade.
> - **Reduced motion:** `reduceMotion()` (`prefers-reduced-motion`) + a CSS `@media` guard cut every
>   animation to an instant state change (piles/cells still update; no clones fly). Timings live in one
>   `ANIM` table (`deal/play/discard/stagger/playScale`) for easy dial-up toward "full Balatro" later.
> - **Untouched:** `classify`, `score`, the scheduler/tempo/loop groove + playhead, Codex, Save-a-Song,
>   the Progression/movement system — motion is purely presentational and reads existing state.
>
> **Deferred (unchanged):** score juice (+chips pips, Applause count-up), idle sway/hover-tilt,
> Muse-draft reveal, screen transitions, and the pixel/Inklings reskin (the motion layer inherits it free).

### The core challenge — a full-re-render DOM

Every action calls `renderGig()`, which does `$game.innerHTML = \`…\``, destroying and rebuilding every card
node (`cardHTML(c, idx)`, keyed by hand position `data-idx`). DOM nodes have **no identity across renders**,
so a card can't naturally persist and travel between states (deck→hand, hand→note-cell, hand→discard). The
plan therefore adds a **motion layer that doesn't rewrite the render model** — no retained-mode refactor.
Because a card animation just moves a *rectangle*, it's **art-agnostic**: works identically whether the card
face is today's CSS div, an emoji, or a future pixel sprite. (Cards already carry a stable `c.id`, which the
FLIP/tracking below keys off.)

### Three reusable primitives (vanilla, no new deps — WAAPI + FLIP)

1. **Flying-clone overlay.** One absolutely-positioned, `pointer-events:none` layer (in the page chrome,
   **outside `$game`** so it survives re-renders). For deal/play/discard: snapshot source + target rects
   (`getBoundingClientRect()`), spawn a throwaway clone of the card, animate it across with
   `element.animate()`, remove it on finish. The real re-rendered DOM sits underneath — game state never has
   to persist a node.
2. **FLIP for reflow.** When cards leave the hand or you Sort, the *surviving* cards slide to new spots
   instead of snapping: record rects **by `c.id`** before render → after render → invert (transform to old
   spot) → play (transition to zero). ~20 lines, reused by play/discard/sort.
3. **Note-cell bloom.** When a note is written into the loop grid, its target cell pops/glows in the note's
   ROYGBIV color — reuses the existing playhead machinery (rAF + `classList`), just a new transient class.

**Select stays CSS-only** (it re-renders constantly and must not animate — the existing `.card.sel`
transform is enough). Only the "worth animating" transitions get motion. A **`prefers-reduced-motion`**
guard swaps every animation for an instant cut (one flag checked in the clone/FLIP helpers).

### Deck & discard piles (new, minimal)

Add a small **draw-pile stack** (bottom-left) and **discard-pile stack** (bottom-right) as fixed anchors so
"dealt from the deck / discarded to a pile" reads. Put them in the **static page chrome (outside `$game`)**
so their screen rects are stable across re-renders; a tiny updater refreshes the deck count on them (the
HUD's `Deck N` text moves onto the draw pile). They're the source rect for deal and the target rect for
discard.

### v1 scope — the core-motion set

| Animation | Trigger | Motion (snappy & subtle) |
|---|---|---|
| **Deal-in** | `drawUp()` adds cards | Newly drawn cards fly from the draw pile to their hand slot, **staggered** ~40ms, small settle overshoot. |
| **Play → note-cell** | `playHand()` | Each selected card shrinks and flies from the hand to **its loop cell** (row = its `midi`, column = the write-position bar), then the cell **blooms** in its color. |
| **Discard** | `discardHand()` | Selected cards fly to the discard pile with a slight fan + fade. |
| **Hand reflow** | after play/discard | Surviving cards FLIP-slide to close the gap (concurrent with the fly-out clones). |
| **Animated Sort** | Sort-by-pitch | Cards FLIP to their sorted positions instead of snapping. |

### Code map (where each hooks in, when built)

- **`playHand()` (~L1003):** capture selected-card rects **before** `removeSelected()/drawUp()/render()`;
  compute each card's target cell from `run.loop.writePos` (the pre-increment bar) + its `midi` row; after
  render, fly clones from the captured rects to those cells and trigger the bloom. FLIP the surviving hand.
- **`discardHand()` (~L1038):** capture rects before `removeSelected()`; fly clones to the discard-pile
  anchor; FLIP the survivors.
- **`drawUp()` (~L991) / render:** tag the newly pushed card ids (e.g. `run._justDrawn`); after the next
  render, animate the matching `.card` nodes in from the draw-pile anchor, staggered.
- **Sort handler (~L1328):** wrap the existing sort in a FLIP (capture-by-id before, invert+play after).
- **`loopStripHTML()` / playhead (~L1210, L723):** add the transient bloom class to the just-written cell.
- **New:** a small `anim.js`-style block **inline** (single-file rule) — `flyClone(fromRect,toRect,opts)`,
  `flip(container, keyFn)`, `bloomCell(sel)`, plus the pile DOM + `reducedMotion()` guard.
- **Untouched:** `classify`, `score`, the scheduler/tempo/loop groove, Codex, Save-a-Song, the whole
  Progression/movement system — motion is purely presentational and reads existing state.

### Tuning knobs (placeholders, tune in play)

Durations (~180–260ms), deal stagger (~40ms), overshoot amount, clone scale on play (~0.35 into the cell).
All centralized so "snappy & subtle" can be dialed toward "full Balatro" later without touching call sites.

### Deferred (named, not in v1)

- **Score juice** — Applause count-up + per-note "+chips" pips flying off as notes land.
- **Idle sway / hover-tilt** on the hand; **Muse-draft reveal** (cards flip/deal in); **screen transitions**
  (home↔gig, win/lose overlay slide-in).
- **Pixel/Inklings reskin** of the card face + chrome (the doc's open "visual identity" question) — a
  separate track that the motion layer will inherit for free.

---

## Timbre as collectible card skins — editions, not creature breeds (PLANNED)

> **Status: PLANNED, not built (decided 2026-07-18).** Reframes how **timbre** is collected and shown.
> **Supersedes** the Notelings "**Instrument (suit) → breed / material**" channel below: timbre is no
> longer a *creature variation* — it becomes a **collectible translucent card skin (an "edition")**, in
> the spirit of Balatro's Foil / Holographic / Polychrome cards. **Engine decision: hand-rolled Web-Audio
> synth presets — NOT Tone.js** (considered and declined — the dependency, its own scheduler, and its own
> AudioContext fight the repo's vanilla single-file rule and the game's existing `scheduleBar` clock; the
> goal here is *variety to collect*, not realism, which a small preset system delivers with zero assets).

**The idea.** A **timbre skin** is one collectible unit carrying **both**:
- a **synth preset** — the *sound* (a distinct voice: waveform stack + filter + envelope + maybe one light
  effect like detune/tremolo), and
- a **translucent card overlay** — the *look* (a CSS gradient / holo shimmer laid over the card face).

Collect skins, equip one, and a card **sounds and looks** like that timbre — "Foil Pluck," "Holo Bell,"
"Neon Saw," "Frosted Glass," "Vapor Pad." The name, the sound, and the sheen are the *same object*. That's
the **collection fantasy** the dev wants, expressed on the card itself rather than as a monster variant.

**Why this beats the old "creature breed" channel.**
- The skin lives on the **DOM card we already render** (`cardHTML`) as a **pure-CSS overlay** — zero
  assets, art-agnostic, and it **layers cleanly on the existing card-motion system** (a skin just rides
  along with the fly/bloom clones). The creature-breed channel needed per-instrument sprite art to read.
- It frees the **Notelings** creatures to stay a clean **seven-letter set** (color, morphology, size,
  fusion, mood…) without a 7×N breed explosion.
- It maps 1:1 onto Balatro's editions — a proven, legible "shiny card you collected" language.

**How it maps onto the current code.**
- Today "instrument = suit = waveform = timbre" (`INSTRUMENTS`: piano/`triangle`, guitar/`sawtooth`,
  bass/`sine`, sounded by `_tone`). Under the reframe, **the 3 instruments become the 3 *seed* timbre
  skins**, and growth = **more presets, each with its own skin** — the deck's collectible "voices."
- Extend `_tone` (one oscillator) into a small **preset system** behind a `playPreset(midi, preset, …)`
  seam: a preset is data (`{ oscs:[…], filter, env, fx }`); the scheduler (`scheduleVoices`/`scheduleBar`)
  calls `playPreset` instead of a bare `wave`. ~150–250 lines, no dependency, drops into the existing
  clock with no conflict (the reason we skipped Tone.js).
- A card gains an **equipped-skin id**; `cardHTML` adds the skin's CSS class; the scheduler reads the
  skin's preset. Sound-preset and overlay stay one unit, so "equip skin" changes both at once.

**Collection & unlock (ties to existing systems).**
- The **Codex** tracks which timbre skins you've discovered/collected (it already catalogs concepts).
- The planned **[backstage shop](#the-backstage-shop--tips-economy-planned)** sells skins for **Tips**
  (a natural Tips sink), and/or they drop from play milestones. **Equip** a skin to an instrument/deck
  between runs (part of the Free-Play loadout).
- Because skins are cosmetic-**plus**-audio (not power), they can be pure collectibles without unbalancing
  score — though a skin *could* later carry a small Muse-like scoring quirk if desired (open item).

**Visual (pure CSS, reduced-motion aware).** The overlay is a translucent gradient / animated sheen over
the card, gated behind `prefers-reduced-motion` (static sheen when reduced), matching the card-motion
layer's guard. No images; it inherits any future card reskin for free.

**Interaction with the Timbre movement (M6) — open question.** M6 currently teaches **multi-instrument
blends** (gate = "play N multi-instrument blends"; term = +mult per extra distinct instrument voice). With
timbre reframed as skins, M6's mechanic could evolve to **"blend distinct timbre skins"** or **"collect /
equip your first N skins,"** and the `timbre` scoring term would count distinct *skins* per hand instead of
distinct *suits*. That's a real change to M6's gate/term — **flagged, not decided here.** The current
instrument-blend M6 keeps working unchanged until this is built.

**App / portability.** Zero new assets, pure CSS + the existing Web-Audio engine → **fully app- and
offline-safe**, no CDN, no dependency. This is a big part of *why* Tone.js was declined: the
collectible-timbre goal is reachable inside the repo's vanilla single-file rules.

**Open items.**
- **Preset palette** — the starting set of voices/skins and their synth recipes (waveform stacks, filters,
  a pluck/Karplus voice, a noise voice for a future percussion suit).
- **Purely cosmetic+audio, or a scoring quirk?** (Leaning purely collectible.)
- **M6 rework** — whether the Timbre movement's gate/term switches from *instrument* blends to *skin*
  blends (above).
- **Skin taxonomy** — a flat list vs. Balatro-style tiers (foil < holo < polychrome) with escalating sheen.
- **Where equip lives** — per-card, per-instrument, or per-deck; and how it surfaces in the loadout UI.

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
- **Instrument (suit) → ~~breed / material~~ — ⚠️ SUPERSEDED (2026-07-18).** Timbre is no longer shown as
  a creature breed/material. It moved to a **collectible translucent card skin (edition)** — see
  **[Timbre as collectible card skins](#timbre-as-collectible-card-skins--editions-not-creature-breeds-planned)**.
  The Noteling stays defined by letter/color/morphology/size/fusion; the card's small instrument emoji
  (🎹/🎸/🎻) may remain as a marker, but the *variation you collect* now lives on the **card skin**, not a
  7×3 creature-breed matrix.
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
> M2→M7 arc walkable, thin) + Phase 3 Stage 2A (M2 per-note durations) are built** in `mujicians.html`.
> **⚠️ The rhythm/melody layer is being reworked** into a continuous timeline with consistent stacking (see
> that section) — that supersedes the Phase-3 detail here. Still planned beyond it: draftable rhythm content
> and syncopation scoring. A long-arc progression
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
- **Phase 3 — Rhythm (M2). ✅ built as Stage 2A; ⚠️ NOW BEING REWORKED — see the [continuous-timeline
  rework](#continuous-timeline--consistent-stacking--the-core-rhythmmelody-rework-decided-2026-07-18-not-built), which is the source of truth for all rhythm/melody work.** *In the current shipped
  game:* a `BEATS`=4 sub-bar grid where each selected note carries a duration (♩/𝅗𝅥/𝅝 picker → `run.noteDur`),
  a melodic hand plays its notes back-to-back in pick order (`handIsSequenced`), a stacked chord rings the
  bar; groove scoring + the M2 "play each note value" gate. **The Stage-2A/2B/2C detail below is SUPERSEDED
  historical** (the rework replaces one-play-per-bar with a timeline, `handIsSequenced` with always-stack,
  per-card durations with per-play, and adds ticks/rests) — kept only as context; git holds the rest.
  - **As built (Stage 2A)** — *⚠️ SUPERSEDED historical (see the rework section); describes the current
    shipped code, which the rework replaces.* — the `FIGURES` picker is replaced by a **`DURATIONS` palette** (quarter `♩` 1
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
      (per-note durations ignored; sequencing off, as today). ⚠️ **This "rings the bar" behavior is now
      flagged for change — see Known issue #1:** a chord should honor a picked value (a shared chord
      duration) instead of always sounding whole. **Single note** (M1–M3): one event + duration +
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
    - **Staging.** **A (core):** quarter/half/whole per-note durations — in the current shipped code. **B/C
      (subdivision, rest cards) were prototyped then REVERTED 2026-07-18** and are folded into the
      continuous-timeline rework instead (ticks, one rest card played alone). See that section.

  - **Stage 2B — subdivision-agnostic timing (⚠️ REVERTED 2026-07-18 — folded into the rework as integer
    ticks `TPB=24`; this beats/`SUBDIV` version is superseded, kept as context).** The old model conflated "beats per
    bar" with "grid columns" in one `BEATS`=4 constant and stored durations as integer **slots**, so
    anything finer than a quarter was impossible. Rebuilt so **eighths now and sixteenths later** just work:
    - **Durations are stored in BEATS (float).** A shared `VALUES` table gives each note/rest value a `beats`
      length: whole 4 · half 2 · quarter 1 · **eighth 0.5** (· sixteenth 0.25 — commented out, ready). This
      is **save-compatible**: legacy bars stored `durs` in slots where quarter=1=1 beat, so old values (1/2/4)
      are already beats.
    - **Two constants replace `BEATS`:** `BEATS_PER_BAR = 4` (musical beats/bar, drives the scheduler clip)
      and **`SUBDIV`** (grid sub-columns **per beat**; **`1` now** = quarter resolution, since the picker only
      offers quarter/half/whole; set `2` for eighths, `4` for sixteenths), with `COLS = BEATS_PER_BAR *
      SUBDIV` sub-columns per bar. The scheduler uses `secPerBeat = bs / BEATS_PER_BAR` and places each event
      at `when + t*secPerBeat` (t in beats); the grid maps a beat-offset to a column via `round(t * SUBDIV)`,
      and a note spans `round(beats * SUBDIV)` columns.
    - **To add eighths/sixteenths later:** add the value to `DURATIONS` (the `e`/`s` `VALUES` rows are ready)
      and set `SUBDIV` to 2/4. No scheduler change. The picker drives note cards **and** the rest card, so
      both gain the new value together. (The M2 gate reads `DURATIONS.length`.)

  - **Stage 2C — a rest is a CARD (⚠️ REVERTED 2026-07-18 — the rest-as-card concept lives on in the rework
    (one card, played alone, per-play duration); this build is superseded, kept as context).** Silence is a **real card you draw and
    play**, not a palette gadget — because rests will eventually become **Sleeping Notelings** (collectible
    creatures), so they must flow through the deck/hand/animation pipeline like any card. *(An earlier
    palette-token build, and a four-fixed-cards build, were both reverted at the dev's direction.)*
    - **One rest card, adjustable duration.** A single `{rest:true}` card whose length you set with the
      **same ♩/𝅗𝅥/𝅝 picker as a note card** — rendered with rest glyphs (𝄽/𝄼/𝄻) — stored in the shared
      `run.noteDur[cardId]`. `buildDeck` adds `REST_COPIES` (3) **once rhythm is taught** (any movement whose
      terms include `groove` → **M2→M7 + Free Play**; M1 Pitch has none). Rendered as a dashed, muted card
      showing its current value's rest glyph + a **💤** (foreshadowing the Sleeping Noteling); `cardHTML`
      special-cases `c.rest`. Adding eighth/sixteenth to the picker (Stage 2B) gives the rest card those
      values automatically.
    - **The core rhythm rule (as the dev intended):** a sequenced hand plays its cards **in selection
      (play) order, back-to-back — each note lasts its own duration and the next event starts immediately,
      UNLESS a rest card is placed, which inserts silence of its value.** So you build a line note-by-note
      and drop a rest card wherever you want a gap.
    - **Model — note-only bars + a timing `seq`.** The selection can mix notes and rest cards.
      `splitSeq(sel)` derives `{ notes (pitched cards only), seq }` where `seq` is the ordered timing list
      (`{d:beats}` per note, `{r:beats}` per rest). A played **bar stores `cards` = notes only** (so every
      note-consumer — `classify`/`score`/`songReport`/`suggestName`/`pcSetFp`/`hasABA` — is untouched) **plus
      `seq`** for timing. `seqEvents(notes, seq)` resolves the two into the event list the scheduler and grid
      share; `barSeq(bar)` falls back for legacy `durs` bars. `scheduleVoices`/`hitsFor` walk events and a
      **rest just advances the play-head, emitting no `_tone` and lighting no cell** (a visible gap). Stored
      in Setlist saves via `snapshotBars` (the `MJ1:` share code stays note-only — rests survive only in the
      full save).
    - **Selection & scoring.** Rest cards **don't count against the per-movement note cap** (`toggleSel` only
      counts pitched cards; M1-style single-select swaps the note but keeps rests) and don't audition a
      pitch. A hand needs **≥1 note** to Play (a pure-silence bar is disallowed for now); Discard works on a
      rest-only selection. A placed rest earns the **`rhythmic variety +1`** groove bonus and is never
      penalized. `classify` filters rests (empty → a `rest` type with a `STRUCT.rest` 0-chip base).
    - **Deferred:** the rest card as a **Sleeping Noteling** skin (art layer, ties to the Notelings +
      "collectible card skins" plans); **eighth/sixteenth** values (add to the picker + raise `SUBDIV`);
      pure-silence bars; special rests (fermata/grand-pause) as shop `restCards`.

  - **Multi-bar spanning (⚠️ SUBSUMED by the rework — a continuous timeline makes long values cross barlines
    for free; no separate spanning mechanism needed).** *(Original spec kept as context.)* Decouple "one play = one bar" so a phrase (long
    values + rests) isn't clipped at the `BEATS_PER_BAR` edge — the decided fix for **Known issue #5** and the
    partner to rest cards. **Model:** a sequenced hand's events total `Σ beats`, occupying **`span = max(1,
    ceil(total / BEATS_PER_BAR))` consecutive loop bars** from the write head. **Storage (keep the hand
    whole):** the head bar stores the full hand + a `span`; the following `span-1` bars are `{cont:true}`
    continuation placeholders the scheduler skips and the grid draws as a spanned continuation (a note
    sustaining across a barline is one `_tone` longer than `srcBarSec()` — ties fall out free). **Budget:**
    `playHand` advances `writePos` by `span` and consumes `span` bars of stage space (so `LOOP_BARS===PLAYS`
    stops holding; the "notes left" meter becomes bars-of-stage), with a UI guard that **caps a phrase to the
    remaining loop** (disable Play / clip when it won't fit). With spanning the implicit auto-tail-rest fully
    dies: a hand occupies exactly its events' span.
  - **Deferred to later stages (unchanged otherwise):** draftable/unlockable rhythm content (a Codex
    sub-set), and syncopation & cross-loop-consistency scoring.
- **Phase 4 — Structure payoff & polish. ✅ CORE BUILT** (⚠️ **partly superseded 2026-07-17 — gigs
  removed**). Cross-gig loop accumulation + real M7 form scoring + a real M7 gate. **The M7 form scoring &
  gate (`pcSetFp`/`hasABA`) survive unchanged** (they read the flat `run.loop.bars`), but the **cross-gig /
  sectioned / C→G→F-modulating** framing below is gone — the loop is now one flat single-key loop of
  `LOOP_BARS = PLAYS`. Boss capstones and mentor/chapter prose stay **deferred**. See **Removing gigs — a
  run becomes one performance (BUILT)**; the sectioned description below is kept for history.
  - **As built (gig-era, superseded):** the loop is **one song per run**, allocated once in `startRun` (`run.loop`, sized
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
- **The song loop (Mario-Paint-style "make a song as you go") — one loop per RUN.** ⚠️ **The gig details
  in this bullet are SUPERSEDED (2026-07-17):** gigs were removed, so there are no sections, no `SECTION_BARS`,
  no C→G→F modulation, no locked cells, and `winGig`/`startGig` are gone. **Current model:** one flat loop of
  `LOOP_BARS = PLAYS` slots in one fixed key; `loopLenNow()` is a constant `LOOP_BARS` (the full grid always
  shows and grooves); the write head wraps the whole loop; click-to-aim reaches any bar. See **Removing gigs
  — a run becomes one performance (BUILT)**. The original (gig-era) description is kept below for history.
  The whole run is **one continuous loop of `LOOP_BARS` slots** (= `SECTION_BARS × GIGS.length` = 18), allocated once
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

**Not yet (still plan):** the **rhythm/melody rework** (continuous timeline, consistent stacking, per-play
duration, playable rest card, ticks) — the next build, see its section — plus later rhythm depth
(sixteenths/triplets, dotted notes, draftable rhythm content, syncopation + cross-loop-consistency scoring).
**Built so far in rhythm: Stage 2A per-note durations (quarter/half/whole) + pick-order playback + groove
scoring/gate** (the rework replaces the model around them); **Phase 4 core =
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
