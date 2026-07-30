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
cards, Daily-Set seed, set-playback) is still the plan below. **The game is now linked from the site hub
(`index.html`).** **TEMP (2026-07-23): the daily run cap is disabled for open playtesting** — a single
`RUN_CAP_ON = false` toggle (near `MAX_RUNS_PER_DAY`) short-circuits `atCap()`/`runsLeftToday()` and swaps the
run counter to "free playtest ∞"; flip it back to `true` to restore the 3-runs-a-day cap.

A roguelike deckbuilder where **cards are notes** and the "poker hands" you play are **chords, scales,
and progressions**. You score by making music that's *theory-correct* — in key, consonant, resolving,
moving by the circle of fifths — and because every hand is **played as audio**, a high score literally
*sounds good*. The fantasy comes from the dev's *Mujicians* story world (magic made of music); **no
in-game story yet** — the flavor is enough. This doc is the source of truth; prefer it over generic
game-dev defaults.

> **Relationship to Pitch Bird.** Pitch Bird (`pitch-bird.html`) stays a separate voice game. Mujicians
> reuses its **Web Audio pipeline** (oscillators, note math, the pitch detector). Sing-input and the
> slice-1 grid are candidate **side activities**, not the spine. See [`pitch-bird.md`](pitch-bird.md).

> **Voice set-pieces (tentative, split into sub-docs 2026-07-30).** Exploring making *playing* each
> movement a **voice-only mic mini-game** (keeping the grid as the lesson/composer). Two candidates so
> far, both designed-not-built: **Beatbox Boxing** (Punch-Out-style rhythm boxing, M2/earth) —
> [`mujicians-voice-boxing.md`](mujicians-voice-boxing.md); and **Vowel Monkey** (formant/vowel control,
> team-up-with-a-monkey, M6 Timbre/wood) — [`mujicians-voice-monkey.md`](mujicians-voice-monkey.md).

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
distance to the stage end (`TOTAL_TICKS` at Stage 1; now `maxStageTicks()` — see *Grow the stage* below;
auto-finish at the end; ✓ Finish stays). Save format is now an **event list**
(`snapshotEvents`); `songReport`/`suggestName`/`saveSong` take events; **MJ2:** share codes carry events and
legacy **MJ1:**/`bars[]` saves still read via `eventsFromBars`. Rest cards (`REST_COPIES=3`) join the deck at
M2+ and are solo-select. **Two deliberate deviations from the brief:** (a) a **minimal timeline scale-run
detector** (`detectTimelineRun` — 3 stepwise single notes in a row) was pulled forward from Stage 2 so the
**M4 melody gate stays clearable** now that the M4 cap is 2 (can't stack a 3-note run); (b) the loop-grid
footer is a **bar-number ruler**, not per-event structure labels (the preview still names the current
structure). **Deferred to Stage 2 (unchanged):** 8ths/16ths/triplets in the picker (the tick model already
fits them), fuller run-detection & form scoring, save-format migration polish, chord-inside-melody.

**✅ Grow the stage (BUILT 2026-07-18).** The stage now **starts at `START_BARS=4` and grows only as the
player needs room** — `run.loop.stageBars` (grow-only) is bumped by `growStageToFit()` to keep one empty
**ghost bar of headroom** past the cursor (`needBars = ceil((max(cursor+curDur, lastEventEnd))/BAR_TICKS)+1`,
clamped `[START_BARS, maxStageBars()]`). Only the grown stage is drawn (grid cols = `stageBarsNow()×beats`)
and the backing **loop wraps at the current length** so it comes back around fast. `LOOP_BARS=12` is now the
**max capacity** (`maxStageBars()`/`maxStageTicks()`, `+loopBonus` reserved for the *+loop-bars* shop) — the
notes-left meter and auto-finish key off the max, so the stage grows *into* it. **No mid-cycle playhead
jump:** the scheduler + playhead read the loop length **per iteration** (`loopTicksNow()`), so a growth
mid-groove only takes effect at the next loop boundary. Saved songs store a **tight** `totalTicks` (rounded
up to the last bar) so Setlist replays loop around the actual song, not empty stage.

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

## Rhythm — live finger-drumming (DECIDED 2026-07-20, NOT built)

> **Status: DECIDED, not built.** This is the source of truth for the **M2 Rhythm** movement and
> **supersedes** the earlier rhythm-as-composition plans for M2: the **"clap it back" call-and-response**
> row (in the table below), the **backing-groove menu-pick**, the **two-pass card-placement** sketch, and
> the **rest-card-in-rhythm** design. Rhythm becomes a **live, timed rhythm game** (finger-drumming) rather
> than grid composition. The continuous-timeline data model (`events[]`, ticks, `TPB=24`) is **reused
> unchanged** — this is a new *input + scoring* layer on top of it, plus a percussion voice.

### The core idea

The **beat (percussion) is performed live in time** — you play *with* the looping backing track. The
**melody is NOT live** (dev decision 2026-07-22): it's composed **at your own pace** with the existing
card→duration→Play flow, just with **keyboard shortcuts** added (select a card like clicking it, Space =
Play). The two rounds:

- **Round 1 — Melody (own pace).** The existing composition flow, unchanged — place cards on the timeline at
  your own pace. **S2.2** adds keyboard shortcuts only (see the staging list below). *(A future, separate
  mode may let the melody also be played live like the beat — deferred, not a replacement.)*
- **Round 2 — The beat (live, one pass).** The loop replays your melody; you hold **drum cards only** and lay
  the beat over it in a live pass.

This makes the **beat** a real rhythm game (DDR / finger-drumming lineage) — fun, a skill you get better at,
and real performance shortcut keys — while keeping **melodic composition** thoughtful and un-rushed.

### The input scheme (locked)

- **Home-row keys = refilling hand slots.** `j k l ;` (right-handed) or `a s d f` (left-handed) each hold one
  card. Pressing a key **fires that card at the playhead and immediately refills the slot from the deck** — so
  which drum a key plays **drifts as you burn the deck** (embraced randomness; the only stable voice is the
  bass). A handedness toggle swaps the key set.
- **Space = bass/kick — always stable.** The one fixed voice, the backbone of the beat.
- **Polyphonic.** Held keys live in a Set; each press schedules independently, so `j`+`k`+space together = a
  stacked hit on one tick. Never swallow simultaneous presses (`e.repeat` guard; `preventDefault` on space so
  the page doesn't scroll).
- **Mobile = touch pads.** The slots become on-screen pads (a big bass pad + refilling drum pads);
  `touchstart`/`changedTouches` feed the **same** "fire slot N at the playhead" function as the keys, with
  multi-touch for simultaneous hits (`touch-action:none`). One code path for keyboard + touch.

### The M2 lesson ladder (progressive, like the pitch ladder)

`persist.progress.rhythmStage`, walked in order; M3 opens only past the last stage (mirrors M1's `pitchStage`).
The ladder has **two halves — self-paced *notation* first, then live *timing*** (echoes M1's shown→ear ramp:
learn the symbol calmly, then feel it live):

1. **Durations (notation, self-paced).** Learn note-values 𝅝/𝅗𝅥/♩/♪ on the calm place-a-note gig grid via the
   **Break** mechanic (below). No live timing. *(BUILT 2026-07-24 — gate: play each value.)*
2. **Rests (notation, self-paced).** Same **Break** verb on a rest card; learn 𝄻/𝄼/𝄽 as the silent mirrors of
   the durations just learned. *(BUILT 2026-07-24 — gate: place each rest value.)*
3. **Match the beat (shown).** Four-on-the-floor is drawn as a **ghost overlay**; you tap **space** on each
   beat to match it. A couple of tries; timing-window feedback. The gentle on-ramp *into live play*.
4. **New grooves (shown → memory).** More overlays to match — backbeat → son clave → shuffle — first shown,
   then hidden so you reproduce from memory. Each nailed groove is collected.
5. **Free take.** Play your own one-pass beat over your melody; it becomes the song's backing loop.

(The old M2 "play each note value" `gateDurs` gate is superseded on two fronts: **note-value *notation*** by the
**Durations stage** above, and **groove** by **timing accuracy** against the overlay. The deferred
hold-to-sustain melody control becomes a later *expressive* way to speak the values, **not** the lesson that
teaches them.)

### Note-value & rest notation — the **Break** mechanic (front of the ladder)

> **Status: Increments 1–3 BUILT (2026-07-24).** The M2
> *notation* stages (ladder stages 1–2) **teach** the mechanic — note-value and rest *notation*, the symbols and
> their halving relationships — before the live-timing half applies them. But **Break is not lessons-only: it's a
> first-class control in Free Play too** (dev 2026-07-24). Runs on the **M1 self-paced place-a-note gig engine**,
> not the live drum engine, so a value is legible on the unified 8th-note grid (a whole note visibly spans 8
> columns, a quarter spans 2). Verb is **Break** (chosen over "Split" 2026-07-24 — could revert if "Split" reads
> clearer; "cut/slice" rejected — reads violent, collides with musical "cut time", and is odd on a rest).
>
> **Increment 1 as built (2026-07-24):** the data model + core verb, Free-Play-first. `DURATIONS` gained an
> **eighth (`"e"`, 12 ticks)** as the Break floor; a `DUR_LADDER`/`halfDur`/`doubleDur` drive it. Every card
> carries **`c.dur`** (default `"q"`; set in `buildDeck`). **`run.curDur` is retired** — `selDurId()`/`selDurTicks()`
> read the selected card(s) (a note **stack shares the longest** selected card's value), and all ~10 callsites
> (playHand, `growStageToFit`, `score()` variety, ghost preview, rest glyph, the M2 `gateDurs` gate) use them.
> **`breakSelected()`/`mergeSelected()`** act on a **single** selected card: Break splices it into two half-value
> copies (new ids from `run.cardSeq`); Merge fuses it with the **nearest equal** mergeable partner **anywhere in
> hand** (same pc+instId+midi, or two rests). *(Relaxed from "adjacent" during Increment 2 — adjacency made
> reaching half/whole in the lesson too luck-dependent.)* A **`breakControlHTML`** row (⤵ Break / value / Merge ⤴,
> keys **`x`/`m`**) replaces `durControlHTML`. The card shows its value: a **corner `noteheadSVG`**
> (filled/hollow/stem/flag — not the astral-plane Unicode glyphs) + a **bottom length-bar** (`lenBarHTML`, width ∝
> value), both gated to `termOn("groove")` (M2+/Free Play; **M1 stays plain, all quarters**). Chords (M4+) disable
> Break/Merge — they need a single selection.
>
> **Increment 2 as built (2026-07-24) — the M2 notation ladder stages.** `RHYTHM_STAGES` is now
> **`["durations","rests","match","grooves","free"]`** (default/DEV-reset → `durations`; a one-time
> `rhythmNotationV1` migration rolls anyone still on/at M2 to `durations`). The two notation stages run on the
> **normal self-paced gig** (`dismissIntro` routes only `match`/`grooves` to the drum engine; durations/rests/free
> compose on the gig), reuse the standard **campaign goal→finish→`maybeAdvance`** flow (they advance the same
> `RHYTHM_STAGES` ladder), and use a **duration-focused deck** (`buildNotationDeck` — one tonic pitch + generous
> rest copies, so pitch is irrelevant and Break/Merge can reach every value incl. the whole, which the normal
> 2-copy deck can't). **Gates:** durations = play each of ♪ ♩ 𝅗𝅥 𝅝 (reuses `gateDurs`, `>= DURATIONS.length`);
> rests = place each of 𝄾 𝄽 𝄼 𝄻 (new `run.gateRestDurs`, fed in `playHand` since rests are excluded from the
> note-gate block). Two Dee intros (`m2:durations`/`m2:rests`) + a rewritten `m2` (match) intro that bridges
> notation→live; `RHYTHM_STAGE_LABEL` + the Home ladder strip + the win-screen advancement text are all
> movement-aware. **Simplified for MVP:** the rests gate is "each rest value" (not yet "one pattern mixing notes
> + rests"); the durations stage is a value-checklist, not a shown/sounded target rhythm to match.
>
> **Increment 3 as built (2026-07-24) — gestures, dynamics gesture, length-bar fade, glyph cleanup.**
> **Card gestures** (pointer events, single `pointerup` handler with `setPointerCapture`; `.card` gets
> `touch-action:none`): a **vertical swipe** = Break (down) / Merge (up) via `breakAt(idx)`/`mergeAt(idx)` (the
> button/key `breakSelected`/`mergeSelected` are thin wrappers now); a **tap** = select; a **double-tap** =
> louder (`onCardTap` → `loudenCard`, cycles `run.curDyn` p→mf→f→p + swell, M3+ only). **Axis conflict resolved
> (dev 2026-07-24):** vertical swipe was wanted for both Break/Merge *and* Dynamics — since Break/Merge own the
> vertical swipe, **Dynamics uses double-tap, not a drag** (the doc's earlier drag idea is dropped; pinch was
> never load-bearing). Thresholds: `CARD_SWIPE_MIN`=24px vertical (must dominate horizontal ×1.3),
> `CARD_TAP_MAX`=14px; double-tap window 320ms; gesture state is module-scope so it survives the re-render each
> gesture triggers. **Length-bar fade:** `lenBarHTML` adds `.faded` (opacity .28) unless `notationLesson()`
> (a campaign durations/rests run) — full scaffold during the lessons, ghosted once values are learned.
> **Glyph cleanup:** `noteGlyph`/`restGlyph` (inline SVG, `currentColor`) replace the tofu-prone Unicode
> note/rest glyphs in the M2 gate labels + the `m2:durations`/`m2:rests` intros (`.ndhead`/`.restsvg` get
> `vertical-align:middle`; `restSVG` gained a colour param). *(Load-order: `noteGlyph`/`restGlyph` are hoisted
> function declarations since `LESSON_INTROS` evaluates them at module-load.)* The `DURATIONS.label`/`.rest`
> Unicode fields remain but are dead-for-display (only `.ticks`/`.name`/`.id` are read).
>
> **Duration becomes a per-card property (default = quarter).** Under Break, a card *carries* a value: **every
> note/rest card defaults to a quarter note (♩)**, and the player **Breaks it shorter or Merges it longer** from
> there. This is the **Free Play** model too — you compose by placing quarter cards and reshaping their length
> in place. **Decision (2026-07-24): `curDur` retires in favour of Break — everywhere.** The per-play
> `run.curDur` picker (one duration for the *next* play) is **replaced** by the **per-card** value: cards carry
> their own duration (default ♩), reshaped by Break/Merge, in **every** mode (M2 lessons, later movements, and
> Free Play). No "cast the next N cards at value X" convenience is kept — Break *is* the duration control. *(This
> is a design decision; `curDur` is still the live shipped control until Break is built — migrating the `curDur`
> callsites, incl. M4+ and the `durControlHTML` picker, to per-card values is part of building Break, not a
> separate change. The per-play-`curDur` descriptions elsewhere in this doc describe the current, to-be-retired
> model.)*

**The core verb — Break in half.** Select a card and **Break** it → it becomes **two cards of half the value**
(a single downward "snap" stroke; the card cracks down the middle and falls into two halves). This *is* the
binary tree of note-values made tactile: ♩→two ♪, 𝅗𝅥→two ♩, 𝅝→two 𝅗𝅥 (ticks 24→12·12, 48→24·24, 96→48·48 at
`TPB=24`). **The same verb works on a rest card** (𝄽→two shorter rests) — which is exactly why the ladder does
**durations first, rests second**: the Rests stage reuses a verb the player already owns.

**Merge — the inverse.** Two **equal-value** mergeable cards **Merge** into one of double the value (an upward
swipe / drag-together). *As built, the partner is the **nearest equal card anywhere in hand**, not strictly the
neighbour — adjacency made reaching half/whole too luck-dependent.* Break and Merge are a matched pair (down =
halve, up = combine); Merge also teaches **ties**.

**Start at the quarter note, not the whole.** Because Merge exists, the lesson **starts in the middle of the
value tree (♩)** so the player can go **both directions from turn one** — Break a ♩ *down* into ♪♪, *and* Merge
♩+♩ *up* into 𝅗𝅥 (then 𝅗𝅥+𝅗𝅥 into 𝅝). Starting at the whole note would only allow breaking downward; the quarter
start exercises the whole mechanic immediately. (Supersedes the earlier "start with a whole note" sketch.)

**Lesson flow.** *(Built Increment 2 as a value-checklist; the shown/sounded target-rhythm framing below is the
richer future version.)*
- **Durations stage.** Mentor shows/sounds a target rhythm on the grid; you Break/Merge from a starting ♩ to
  build the matching values. **Gate (as built):** play each of **♪ ♩ 𝅗𝅥 𝅝** at least once (`gateDurs`).
- **Rests stage.** Same Break/Merge, now on a **rest card**; a target pattern has sounding beats and gaps —
  fill sounds with notes, gaps with rests of matching value. **Gate:** place each rest value 𝄻/𝄼/𝄽 and build
  one pattern mixing notes + rests.

**Input — action decoupled from gesture (so nothing load-bearing can break).** `breakSelected()` /
`mergeSelected()` are plain functions bound to **both** a button **and** a gesture; the button (+ a keyboard
key, e.g. `x` / `/`, for parity with M2's existing shortcuts and desktop testability) is the always-works
substrate, and the gesture is **juice layered on top, never the only path**:
- **MVP ✅ BUILT (2026-07-24):** a **Break/Merge control row** above the dynamics row + keyboard keys **`x`**
  (Break) / **`m`** (Merge). Zero gesture risk, fully testable on desktop. *(Keys are `x`/`m`, not the
  earlier-sketched `x`/`/` — `m` reads as "merge" and neither collides with the hand-select home row.)*
- **Layer 2 (juice) ✅ BUILT (Increment 3, 2026-07-24):** a **single-pointer vertical swipe** across the card —
  **down = Break, up = Merge** (`touch-action:none` so the browser can't steal it for scroll; `setPointerCapture`
  so the swipe completes even off-card). **Single-pointer only** — robust on mouse and touch alike.
- **Layer 3 (crack-and-fall-apart animation) ✅ BUILT (2026-07-24):** Break/Merge are no longer instant
  re-renders — they animate on `#fxlayer` like the other card motion (overlay clones + FLIP, art-agnostic,
  reduced-motion cuts to the instant swap). **Break** (`flyBreak`): a bright **crack flash** (`.crackflash`,
  tinted by the note's `--cc`) runs down the card's centre; two clip-path half-clones (`.fxhalf`, left = `inset(0
  50% 0 0)`, right = `inset(0 0 0 50%)`) recoil then **fall to the two new slots** while the real half-value
  cards **pop in** there (`.card.popin` `cardpop` keyframe, 90ms delay so the halves land first). **Merge**
  (`flyMerge`): the two source clones **slide together into the merged card's slot** and fade as the real
  double-value card pops in. Both are driven by `breakAt`/`mergeAt` capturing the source rect(s) + `--cc` colour
  **before** the re-render (so every input path — button, key, swipe — gets it for free). A short **SFX**
  (`_crack(merge)`, filtered-noise burst + woody transient) plays on both, even under reduced motion: Break =
  bright pitch-dropping snap; Merge = lower pitch-rising clunk.
- **Do NOT use tap-and-hold for Break** — hold is reserved for the deferred **hold-to-sustain** expressive
  duration control; one gesture, one meaning.

**Dynamics gesture ✅ BUILT (Increment 3, 2026-07-24) — double-tap = louder.** Keep the **p / mf / f buttons**;
the card gesture is **double-tap = louder** (`onCardTap`→`loudenCard`, cycles p→mf→f→p + size-swell, M3+ only).
**The A/B resolved to double-tap by necessity:** vertical swipe is taken by Break/Merge, so a vertical *drag*
for dynamics would collide — double-tap sits on a free axis (and was the dev's lean anyway). The earlier
**vertical-drag** idea is **dropped**; **pinch** was never load-bearing (two-finger pinch fights browser zoom,
no clean desktop equivalent).

**Tentative future extensions (flagged, not v1):**
- **Merge *unequal* same-pitch cards → dotted / tied values (preferred dotted-note route).** Relax Merge so two
  cards of the **same pitch + instrument** (or two rests) fuse **even when their durations differ**, **summing
  their ticks** — e.g. a ♩(24) + ♪(12) A-Guitar → a **dotted quarter (36t)**; ♩+♩+♪ → dotted half; etc. This is
  almost certainly **easier and more discoverable than the uneven-Break swipe** (dev 2026-07-24): it reuses the
  existing Merge verb/gesture and just drops the "equal value" guard. **Build cost:** the merged value is
  **off-ladder** (36t isn't a `DURATIONS` id), so `c.dur` must stop being a bare id — either store **raw ticks**
  or add a **dot/tie flag** — and `noteheadSVG`/`lenBarHTML`/the save format must render the dot. `TPB=24`
  divides cleanly (dotted-quarter 36, dotted-half 72). **Deferred, tentative** (needs the dotted-duration
  representation; Increment 1 Merge still requires equal values). *Supersedes the uneven-Break approach below as
  the primary path.*
- **Uneven / directional Break → dotted values (alternative).** Straight-down = clean halve; down-and-to-a-side
  = uneven split. Same gesture family, but more edge-case headaches (unequal ticks, grid fit) than the
  unequal-Merge route above — **deferred, tentative, lower priority.**
- **Prism tool-card (Balatro-style).** A **Prism** action-card played *onto* a note to break it — like a
  Balatro Tarot/Spectral card that modifies another card. Thematically apt: notes are **ROYGBIV**, and a prism
  *refracts* one into two. **Note:** base Break/Merge is **free** in both the lessons *and* Free Play (above), so
  Prism is **not** the way you break — it's an **optional flavour/economy extra** (e.g. a fancier break, a
  one-tap "break to eighths", or a Tips-shop collectible), never a gate on the core verb. **Deferred, tentative.**
- **A "Break-ling" creature** — a cell/mitosis bug that *divides* when a card breaks; sibling to the Beatlings.
  Tentative, art-later.

**Card layout — showing a card's duration.** With duration now a per-card value, the card wears it like a
playing-card index (creature art fills the center):

- **Base card 71×95 px** (classic SVG playing-card size, ratio ~0.75).
- **Corner index (primary).** Two diagonally-opposite corners carry **note letter (the "rank") + duration
  notehead (the "suit")**, stacked, ~4–5px inset. Sizes for legibility at this scale: **letter 16px bold**
  (range 15–17, cap-height ~11px; floor 14px), **duration glyph 12px** (range 11–13) centered ~1px under the
  letter; index footprint ~13w × ~28h px. Overlay the indices **on top of the art** with a contrast halo
  (text-shadow), not boxed out, to keep the art big. Follow the poker convention — **top-left + bottom-right**
  so the index peeks out when the hand is fanned (match to whichever way the hand actually fans); the second
  index may be rotated 180° for card authenticity.
- **✅ Fixed 2026-07-24: the glyphs use a fixed dark ink (`GLYPH_INK`), NOT the note's colour.** Increment 1 drew
  the notehead in the note's own colour, and **yellow (C) was nearly invisible** on the white card. Now the
  duration glyph is legibility-first ink; the pitch is carried by the letter colour. (Applies to `noteheadSVG`
  and `restSVG`.)
- **Draw the noteheads AND rests as inline SVG, not Unicode. ✅ BUILT 2026-07-24 (`noteheadSVG`, `restSVG`).**
  `♩` (U+2669) is widely supported, but **`𝅗𝅥`/`𝅝` (half/whole) and ALL the rests (`𝄾 𝄽 𝄼 𝄻`) live in the
  astral-plane Musical Symbols block and render as tofu rectangles in many system fonts** — the rest cards were
  showing bare rectangles. SVG per value stays crisp cross-platform: **quarter = filled
  ellipse + stem · half = hollow (stroke-only) ellipse + stem · whole = hollow ellipse, no stem · eighth =
  filled + stem + flag.** **Rests:** whole = filled bar **hanging below** a faint staff line · half = filled bar
  **sitting on** the line (the line disambiguates the two otherwise-identical bars) · quarter = the squiggle ·
  eighth = a slanted stroke + one flag. Bonus: the notehead *is* the lesson (filled→hollow, stem→no-stem is the
  exact notation being taught). **✅ Increment 3 (2026-07-24): gate labels + the `m2:durations`/`m2:rests`
  intros now use inline SVG** (`noteGlyph`/`restGlyph`, `currentColor`, `.ndhead`/`.restsvg` get
  `vertical-align:middle`). The `DURATIONS.label`/`.rest` Unicode fields remain but are dead-for-display (only
  `.ticks`/`.name`/`.id` are read), so no user-facing tofu remains.
- **Bottom length-bar (teaching aid, fadeable). ✅ BUILT (fade in Increment 3).** A thin bar along the card's
  bottom edge whose **width is proportional to the value** (♪ = ¼ width · ♩ = ½ · 𝅗𝅥 = ½+ · 𝅝 = full), mapping
  the abstract symbol to visible *length* — reinforcing that duration = time = horizontal on the grid. **Full
  during the M2 notation lessons** (`notationLesson()`), **faded to .28 opacity** everywhere else once values are
  learned (like the M1 shown→ear ramp). Pairs *with* the corner index, not instead of it.
- **When the index shows.** The corner duration reflects the **card's own value** in every mode — Free Play,
  the M2 stages, and later movements — since `curDur` retires in favour of per-card Break (see the decision
  above). Cards always carry a value (default ♩), so the index is always meaningful.

### Scoring — rhythm-game timing

- Each hit is judged against the nearest grid tick: **Perfect / Good / Miss** (timing windows), reusing M1's
  bloom / floating-rating-word / proximity-chime juice.
- A **combo streak** of on-beat hits ramps the applause **mult** (skill → score).
- The run reports a **rhythm accuracy %** (reuse `pitchAccuracy()`'s shape).
- Hits are stored **lightly quantized** (snap to the nearest subdivision so playback grooves clean) while
  scoring reflects **raw** timing. (Default chosen to test; a raw-feel / quantize-toggle is an open
  sub-decision below.)

### Rests are free (in the live half)

In a **live take** (the Match / grooves / free stages), **a rest is simply not pressing a key** — silence falls
out for nothing. This **deletes the rest card / rest creature** from the *live* rhythm design (they were only
needed in the grid-composition model; the shipped `REST_COPIES` rest card can retire from live M2 when this
lands). Note the rest card **does** return in the self-paced **Rests notation stage** above — a different job
(teach the *symbol* 𝄽/𝄼/𝄻 via Break), not live timing.

### The creatures — Beatlings (drum-pun beetles)

The percussion voices are **Beatlings**: one beetle species, a variation per drum voice, each name a
**percussion-synonym pun**. Confirmed so far: **Boombardier** (kick/space — the bombardier beetle really
fires with an audible bang), **Snarab** (snare + scarab), **Ticker** (hi-hat). A 4th+ is TBD (the refill
model means voices aren't permanently key-bound, so the pool can grow freely; *Rimshot/Tapper were floated
and rejected*). Their **card skins ride the existing foil/holo `SKINS` system to swap drum timbres**
(collecting skins = collecting drum sounds). Sibling class to the pitched **Notelings**.

### Graduation (like accidentals)

`rhythmUnlocked()` = `persist.progress.movement > 2` (mirrors `accidentalsUnlocked()` = `> 1`). **✅ BUILT
2026-07-23** (see the S2.3 "Graduation" increment above for the as-built map). Once M2 clears:

- **The live drum pass becomes an OPTIONAL round in M3–M7 + Free Play** — compose the melody at your own pace,
  then **🥁 Lay a beat over it** runs the live drum pass and returns you to the (now unified) gig. *(The melody
  round stays own-pace, per the 2026-07-22 reframe; it is not forced live.)*
- The **beat loops under the song and is saved with it** — `bakeFreeBeat` folds the recorded beat into
  `run.loop.events` as first-class `{drum}` events (already in `snapshotEvents` + the MJ2 kind-`2` share code
  from S2.1; no version bump needed — additive).
- Timing/combo scoring stays on across later movements (the `groove` term is already in every M2+ `terms`
  list).

### MVP staging (to "see if it works" cheapest)

- **Stage 1 — the fun test. ✅ BUILT 2026-07-21 as a standalone "🥁 Beat Lab" practice screen** (Home button,
  **no daily cap** — it's a feel test, deliberately isolated from the run/movement/save flow so nothing else is
  destabilised). As built in `mujicians.html`: a **2-bar C-major riff loops** (`LAB_MELODY`) while you drum
  **live in time**; **Space = kick** (Boombardier, stable) and three **home-row slots** (`j k l` / `a s d`,
  handedness toggle) fire whatever Beatling is loaded and **refill from a small snare/hat drum deck**
  (`labDrawDrum`); **keyboard *and* touch**, **polyphonic** (a `labPressed` Set ignores auto-repeat, each pad is
  its own touch target, `preventDefault` on Space stops page-scroll). Hits are judged by **timing vs the
  8th-note grid** — Perfect ≤60 ms / Good ≤140 ms / Miss — driving a **combo**, a live **accuracy %**, a
  per-pad glow + floating rating word (reusing the `.ratingpop` juice), and a grid-cell flash. Hits are stored
  **lightly quantized** to the nearest 8th and **loop back** (loop-pedal): a dedicated lookahead scheduler
  (`labSchedTick`) + rAF playhead (`labTickHead`) run **separately from the game loop**, and each recorded hit
  is **skipped on its creation lap** (it already played live on keypress) so it isn't doubled, then repeats
  every later lap. New **`_drum(voice,t,vel)`** vanilla Web-Audio synths (kick/snare/hat via a cached noise
  buffer) — the reserved "noise voice." Four-on-the-floor shows as a **gold ghost on the kick lane**; a **↺
  Clear beat** wipes the loop. *(Simplifications vs the full design, deferred to Stage 2: the overlay is a
  visual guide — scoring is grid-tightness, not per-target-hit matching; the lab loops continuously with rolling
  stats rather than a single committed one-pass take; no gate/advancement/save wiring yet.)*
- **Stage 2 — in progress.** Broken into increments:
  - **S2.1 — Drums are first-class timeline events + "Keep this beat." ✅ BUILT 2026-07-21.** A drum is now a
    timeline event **`{drum:<voice>, at, dyn}`** (pitchless one-shot, `dur:0`) alongside note/rest events —
    `DRUM_VOICES = ["kick","snare","hat"]` is the canonical **save-order index** (append-only). `scheduleEvent`
    plays a drum via `_drum` (so saved songs with drums replay), `snapshotEvents` stores them, and the **MJ2**
    share code gained **kind `2` = `[2, at, voiceIdx]`** (additive — old codes never contain it, so old saves
    still decode; no version bump). `eventCoverage` already skips no-note events, so nothing else changed. The
    Beat Lab gained **💾 Keep this beat** (`labKeepBeat`/`labSongEvents`): the backing riff (as note events) +
    your recorded beat (as drum events) become one song saved to the **Setlist** — replay/star/rename/export/
    import like any other (per the dev's pick, melody **and** beat are saved together).
  - **S2.2 — Gig keyboard shortcuts. ✅ BUILT 2026-07-22.** *(Reframed from "melody goes live" per the dev —
    melody composition stays **at your own pace**; a live-melody mode is a deferred future option, not this.)*
    On the gig screen you can now **select a hand card with a key** (like clicking it) and **Space = Play
    Hand**. `persist.hand` (`"right"`/`"left"`, shared with the Beat Lab) picks a side; the home row covers 4
    cards and **extends outward** as the hand grows — the **5th** card takes the outer-left key (Caps / h), the
    **6th** the outer-right (g / '): right = `h j k l ; '`, left = `⇪ a s d f g` (`handKeysFor`). **No on-card
    key badge** (removed 2026-07-22 — dev wants the card face clear for future art); a **🤚/✋ hand toggle**
    button in the gig controls is the only surfaced hint. Hand size is **capped at
    `MAX_HAND_SIZE` (6)** (a Muse rework to respect this is deferred). Guards: ignored while typing in an input,
    on a focused button (native Space), or when a modal (goal prompt) is open. *(Caveat: CapsLock is an
    unreliable game key — it toggles the OS caps state — flagged for a possible swap.)*
  - **S2.3 — Campaign M2 integration. 🚧 Increment 1 BUILT 2026-07-22 (foundation + Stage 1 "Match").** The
    Beat Lab engine is now a **configurable live-drum session** with two consumers via a `labCfg`
    (`{mode,stage,target}`): free **practice** (Home 🥁 Beat Lab, unchanged) and **campaign** (M2's ladder).
    - **The M2 ladder** — `persist.progress.rhythmStage` walked in order **match → grooves → free** (mirrors
      M1's `pitchStage`; migration in `loadPersist`; `RHYTHM_STAGES`). `rhythmUnlocked()` = `movement>2` (for the
      later graduation, not yet consumed). A **rhythm-ladder strip** on Home when `mv===2` (`rhythmLadderHTML`)
      and the Campaign button follows the frontier stage.
    - **Flow.** A campaign M2 run gets the **Dee mentor intro** (rewritten to the live-drumming lesson — the old
      note-value text is gone; per-stage keys `m2` / `m2:grooves` / `m2:free`), then **skips the Muse draft**
      (`dismissIntro`→`enterRhythmStage`) straight into the drum session (drum-only lessons, per the dev's pick).
    - **Stage 1 "Match" (playable).** A groove is a list of **slots** (`GROOVES` registry
      `{id,name,slots:[{col,voices:[…]}]}`) on the 8th-note grid; each slot is one gate unit at a column,
      satisfiable by **any** of its `voices` (an **OR** — e.g. a backbeat playable with snare **or** ticker,
      since the pads refill randomly). Slots are drawn as a **blue ghost overlay** on every voice-lane they
      involve; a **Good+** hit whose voice the slot accepts satisfies it (`run.grooveMatched` = Map col→voice),
      **greening the cell you hit and un-ghosting the slot's alternatives** (`labMarkSlotMatched`). The **gate**
      collects **every** slot (cumulative like M1's "play all 7 letters", `run.grooveMet`), shown live in a
      `.labgate` HUD line. Four-on-the-floor (match) = 8 kick slots; the backbeat (grooves) = kick on 1 & 3
      (Space) + a snare-or-ticker slot on 2 & 4. **Every placed beat keeps its orange record-fill**
      (`.hit` — so you can see it, and it matches what the loop plays back); a **landed slot is un-ghosted and
      turned green** (`labMarkSlotMatched` strips `.hit` **and** `.tghost`/`.hidden`, then adds `.tmatch` on the
      hit voice and un-ghosts the slot's alternative voices — the un-ghost also avoids a CSS-specificity fight
      where `.tghost.hidden` would out-rank `.tmatch`), leaving the states unmistakable: **blue ghost** = not yet
      landed, **green** = landed, **orange** = a beat you placed that isn't a clean target hit. For an OR-slot
      (backbeat's 2 & 4) the ghost shows on **both** the snare and hat rows, and landing either clears both.
      Meeting the gate pops the **`rhythmwin`** end screen
      (`renderRhythmEnd`) and `maybeAdvance` walks the ladder / unlocks **M3** past "free". Scoring/loop/pads/
      keyboard are the **shared** Beat Lab engine.
    - **The "free" stage melody round. ✅ BUILT 2026-07-23** — "play your own one-pass beat over your melody;
      it becomes the song's backing loop." Two phases: **Phase 1 — compose (gig).** The free stage no longer
      skips the Muse draft (`dismissIntro` routes only match/grooves to `enterRhythmStage`; free falls through to
      the normal draft → gig), so you build a melody **at your own pace** on the piano-roll. The Campaign
      **✓ Finish** button is replaced by **🥁 Lay a beat over it** (enabled at ≥`FREE_MELODY_NOTES`(6) notes,
      `melodyNoteCount`); filling the whole stage ends the *composing* phase (not the run) with a nudge, and the
      goal-prompt never fires (the gate needs the beat). **Phase 2 — drum over it (`enterFreeBeat`).** The
      composed melody becomes the drum session's **backing loop** via `labSetBacking` — a new
      `labBacking`/`labBackingTicks`/`labBackingFades` that plays the melody at **full volume, looped at its own
      whole-bar length**, decoupled from the fixed 2-bar drum loop (`labSchedBackingSeg` schedules it
      independently; the scaffold `LAB_MELODY` still fades for practice/match/grooves). You finger-drum over it
      (same shared engine); passing on ≥`FREE_TAKE_HITS` hits **bakes** the recorded 2-bar beat across the song
      as first-class `{drum}` events (`bakeFreeBeat`) so `run.loop.events` = melody + beat, one keepable track.
      The `rhythmwin` end screen (`renderRhythmEnd`) shows a **💾 Save this song** button for the free stage.
      Two-part gate label in `gateStatus`.
    - **Graduation — live drums in M3–M7 + Free Play + the UNIFIED grid. ✅ BUILT 2026-07-23.** Once M2
      clears (`rhythmUnlocked()` = `persist.progress.movement>2`), drums join every run and the **gig
      piano-roll and the drum grid become one grid with one playhead** (the dev ask). **Display:** the gig
      display resolution went from 1 col/beat to **8th-note columns** (`DISPLAY_COLS_PER_BEAT = 2`) so notes
      **and** drums share one column grid; `loopStripHTML` now draws **kick/snare/hat lanes beneath the note
      rows** (`showDrumLanes` = graduated **or** the song already has drums), rendering each `{drum}` event at
      its true 8th column (`drumCov`), and the existing gig playhead (`paintPlayCol` → `.loopgrid [data-col]`)
      sweeps **both** with no new scheduler. **Input:** a **🥁 Lay a beat over it** button sits next to
      Play/Discard in Free Play and any campaign movement ≥ 3 (`graduatedBeatContext()` — past M2, mode free or
      mv≥3), **always visible** so it's discoverable, **disabled with an `(n/6)` counter** until you've composed
      ≥`FREE_MELODY_NOTES` notes (mirrors the M2-free button; no goal-prompt gating) → `layBeatOverSong()` reuses the **same live free-take drum engine** as
      M2's free stage but sets **`run.beatReturn`**. Unlike M2-free (which auto-passes at `FREE_TAKE_HITS`), the
      graduated pass is a **loop-pedal that keeps running** — the `labCampaignScore` auto-finish is guarded by
      `!run.beatReturn`, so you build/refine indefinitely and press **✓ Done — back to song** (`finishGraduatedBeat`,
      needs ≥1 recorded hit) when it grooves. That routes through `rhythmStagePass`' `beatReturn` branch, which
      **bakes the beat and drops back to the gig** (`screen="gig"`, not the `rhythmwin` end screen) with melody +
      drums on the unified grid, and **auto-starts the loop** (`startLoop()`) so the playhead immediately grooves
      the whole song (notes + drums) on return — you Finish/Save normally. Give-up (`exitBeatLab`) returns to the gig, melody
      intact. `renderBeatLab`/`beatGateLabel` show graduated chrome (title, hint, live-hit gate, ✓ Done) when `run.beatReturn`.
    - **Count-in before every live drum pass. ✅ BUILT 2026-07-23** (dev ask — "the band counts you in").
      `countInThen(cb)` runs a **4-beat count-in at the current tempo** (big `1·2·3·4` overlay + a hat click on
      each beat via `_drum`) **before the loop starts recording**, wrapping the `labStartLoop` call in every
      live-drum entry (Beat Lab practice, M2 match/grooves/free, the graduated free-beat) — **not** on a
      mid-session tempo-change restart. `clearCountIn()` on exit; reduced-motion drops the pop animation only.
    - **Still simplified / next increments:** the **grooves** stage currently matches one target (the
      kick-1&3 + snare-or-ticker-2&4 `backbeat`), drawn **clearly** — not yet the backbeat→son-clave→shuffle
      walk with a **shown→from-memory** reveal (the `GROOVES` set + the `.tghost.hidden` CSS are in place for
      it; son-clave/shuffle slot data is provisional). Free Play M2 keeps the legacy "play each note value"
      `gateDurs` gate. The graduated beat pass is a **free-form** take (no target overlay) at 8th-note quantize;
      in-gig **placement/editing** of individual drums (click a drum lane to drop a hit) is not built — drums
      come from the live pass or a bake. **Dev asks (deferred, 2026-07-24):** (1) the live drum pass should
      happen **on the small unified gig grid itself** (drum lanes + notes, one playhead) rather than routing to
      the separate larger-celled Beat Lab screen — *the current larger grid is "fine for now"*; (2) the
      **Beatling pads should look like the note cards** (the collectible card treatment / `SKINS`), not the
      current wide buttons. (Free-stage edge, deferred: exiting the drum phase with **← Give up**
      discards the composed melody, like the other campaign stages.)
- **Later:** **hold-to-sustain** note length in the melody round (dev likes it, deferred); more
  Beatlings/grooves; raw-feel toggle; a **count-in variant** (a swung "and-a-1, and-a-2").

### Beat Lab — feedback fixed (2026-07-21)

Both playtest items are now ✅ **fixed** in `mujicians.html`:

- **Recorded beats no longer stop looping + the backing riff fades once you've locked in.** Root cause was
  **unbounded hit accumulation** (hundreds of scheduled voices/lap could choke the AudioContext). The recorded
  beat is now a **bounded, deduped set** (`labLoop` of `{voice,tick,bornLap}` — see the cap below), and the
  scheduler gained a **fell-behind snap** (`if(labSchedFrom < now) labSchedFrom = now`) so a throttled
  background tab resumes cleanly instead of runaway-catching-up the past. The **backing melody is now an
  explicit tempo scaffold** — `labMelodyGain(lap)` fades it linearly to silence over **`LAB_LEAD_LAPS` (4)**
  laps ("training wheels off"), while your beats keep looping; a **🎵 Backing riff** button (`labReplayBacking`)
  re-summons it (resets the fade) if you lose the pulse.
- **Percussion is capped — tunable.** `LAB_MAX_HITS = round(lanes × cols × LAB_FILL_PCT)` with **`LAB_FILL_PCT
  = 0.35`** (~17 of 48 slots — tweak the %). Recording is **deduped by (voice, column-slot)** (re-hitting a
  slot just refreshes it, never grows the loop) and **FIFO-evicts the oldest** hit past the cap, so you keep
  playing but the beat stays legible — good play means *choosing* hits, not spamming every pad.

### Code map (sketch, when built)

- **New audio voice** `_drum(voice, t, vel)` — vanilla Web-Audio noise/click synths (kick = sine pitch-drop +
  click, snare = filtered noise burst + tone, hat = short high-passed noise). This is the "noise voice for a
  future percussion suit" the doc reserved; `_tone` stays pitched-only.
- **Live input module:** `keydown`/`touchstart` → `fireSlot(n)` → read the current playhead tick (the
  scheduler/`tickPlayhead` already exist) → place a drum (or note) event there + immediate audio preview;
  the slot refills from the deck. A handedness toggle swaps the key set.
- **Loop length:** live rounds want a **fixed** loop length (loop-pedal semantics, stable loop point) rather
  than `growStageToFit` — pick at run start (default 4 bars). Open sub-decision.
- **Overlay lesson:** a target pattern in a `GROOVES` registry (`{id,name,hits:[{tick,voice}]}`) drawn as
  ghost cells on the drum lanes; score each of your hits vs the nearest target hit.
- **Untouched:** `classify`, the pitch scoring, the scheduler/loop groove, Codex, Save-a-Song — this is a
  live **input + a percussion voice + timing scoring**, layered on the existing timeline.

### Open sub-decisions (defaults noted)

- **Quantize vs raw feel** — default **light quantize** (clean playback, honest scoring); a raw-feel or
  player toggle is TBD (dev: "not sure what this means, let's test it out").
- **Round-1 laps** — default **loop-pedal** (multiple laps until Finish) for melody; **Round 2 stays one pass.**
- **Loop length** — default **fixed** length chosen at run start for live mode (vs the grow-to-fit stage of
  the composition model).
- **Note length in the melody round** — default **fixed quarter per tap** for the MVP; **hold-to-sustain** is
  the liked-but-deferred upgrade (dev: "I like this idea, but it can be a later addition").
- **4th+ Beatling voice/name** — TBD; the refill model keeps the pool open.

---

## Call-and-response scoring — making card choice matter (DECIDED 2026-07-18 · M1 BUILT 2026-07-19)

> **Status: DECIDED; M1 Pitch call-and-response is ✅ BUILT (2026-07-19)** in `mujicians.html` — see
> **[M1 — as built](#m1-pitch--as-built-2026-07-19)**. M2–M7 remain designed-not-built. Fixes a load-bearing
> flaw the dev hit in playtest: **in the starting movements, card choice doesn't matter.** M1 scored
> `chips × (in-key ? 2 : 1)`, but all 7 starting cards are the C-major diatonic notes — every card is in-key,
> every card scored the same, so which note you played was meaningless. This section is the fix and the
> scoring spine for the whole campaign. Four forks were decided with the dev; two sub-designs (Dynamics'
> sleeping-creature lesson, the later-movement freeform-consonance turn) are captured below.

### The root cause (why choice is flat)

Scoring is **context-free** — each note is judged in isolation against a fixed rubric (in-key? yes for all
7). Nothing makes one card better than another. The fix is to make scoring **relational** — judge the
response against a **target/context** instead of a fixed rule. The instant there's something to match, one
card is best, near ones are decent, far ones are bad, so **every card scores differently and choice matters.**

### The frame: call-and-response (the campaign spine)

The computer (flavored as the movement's **element-spirit / mentor**, tying into the [character-Muse cast](#the-character-muses--the-graphic-novel-cast-is-the-muse-roster-planned))
plays a **call**; you play a **response**; score = how well the response relates to the call, **graded by
proximity** (partial credit — "as close as possible," not pass/fail). Two response flavors:

- **Imitate** (echo it back) — pitch, rhythm, dynamics, melody, timbre.
- **Complement** (answer / harmonize it) — harmony, structure.

Call-and-response is the oldest music-teaching method (echo the phrase, clap it back, answer the question),
so it gives every movement a **non-arbitrary** scoring target and maps cleanly onto the dev's elements.

### The four decisions (locked)

1. **Call-and-response is the CAMPAIGN scoring spine; Free Play stays open-ended.** Every campaign movement
   grades your response against a call (so card choice always matters *while learning*). **Free Play has no
   call** — applause just accumulates, you make whatever you want. This preserves the [open-ended "made some
   music I like" pillar](#open-ended-performance--no-threshold-you-decide-when-youre-done-built) where it
   belongs (the creative mode) while making the *teaching* mode demand real choices.
2. **Graded proximity, not exact match.** Exact = full credit; near = partial; far = little. A gradient is
   better pedagogy (partial credit) *and* is what makes every wrong card score differently (D scores more
   than G when the target is E) — the actual fix to the flat-choice problem.
3. **Shown early, ear-only later (a difficulty ramp).** Early movements **reveal the call's card** (beginners
   match by sight). Later movements / a boss go **audio-only** ("blindfold") — the call is a sound you must
   identify and reproduce **by ear**, which is real ear-training. If the call always showed its color it'd be
   a trivial color-match; hiding it is what turns matching into a music skill.
4. **Later movements turn toward FREEFORM composition, not just echo — see [The later-movement turn](#the-later-movement-turn--from-echo-to-original-composition) below.** (Dev's explicit ask: don't leave the
   whole campaign as call-and-repeat; reward users for making *original* good-sounding music.)

### Whether the call joins the saved song — DECIDED 2026-07-19: only your notes

**Decided (playtest):** the saved song is **only the notes you enter** — the call is **never written to the
timeline** (no call-and-response "duet"). This is how M1 shipped: the call is an **off-timeline audio+visual
cue**, so `snapshotEvents` already captures your responses only. No toggle, no `call`/`response` event tagging
needed. *(Rejected: writing the call into the loop as a duet — it made the loop playback not line up with what
you'd played and read as disorienting.)*

### The per-movement calls

| # | Element | The **call** (computer plays…) | Your **response** | Scored on (graded proximity) |
|---|---------|-------------------------------|-------------------|------------------------------|
| **1** | **Pitch · Wind** | a target note "carried on the breeze" | play the matching pitch | **absolute pitch distance** — exact=full, a step off=nearly full, ~an octave off=least (NOT consonance — that's Melody) |
| — | *M1 Sharps level* | a natural note | play **any note higher** (bonus: the exact ♯, then resolve up) | direction (higher) + exact-♯ bonus + optional ♯→up [resolution](#accidentals--the-sharps--flats-runs--the--boss-planned) |
| — | *M1 Flats level* | a natural note | play **any note lower** (bonus: the exact ♭, then resolve down) | direction (lower) + exact-♭ bonus + optional ♭→down resolution |
| **2** | **Rhythm · Earth** | a rhythm pattern (the ground's pulse) | clap it back — same onsets/durations | onset + duration match (a played rest is a rhythmic event) |
| **3** | **Dynamics · Fire** | a **creature scenario** (see below), not a note | play at the demanded loudness (+ rests when sneaking) | matching the target dynamic the scene demands — teaches pp→ff **notation** |
| **4** | **Melody · Water** | a short melodic phrase (a wave) | **echo it**, or **answer it** (antecedent→consequent) | contour match / a good complementary answer |
| **5** | **Harmony · Metal** | a single tone (bass/root) to forge onto | **build the chord** that fits it | consonance with the given tone (harmonize the alloy) |
| **6** | **Timbre · Wood** | a note in a specific tone-color | play a note that **matches / blends** that timbre | timbre match / blend quality |
| **7** | **Structure · Time** | states an **A** theme | develop (**B**) and **return to A** | form / restatement (the existing `hasABA`) |

*(Element flavor per the dev's graphic novel: pitch=wind, rhythm=earth, dynamics=fire, melody=water,
harmony=metal, timbre=wood, structure=**Time** (chosen over "void" — form is a memory-across-time arc; the A
returns because you remember it. "Void" is a candidate for the rests/silence layer instead).)*

> **⚠️ Rhythm (M2) update 2026-07-20:** the M2 "clap it back — same onsets/durations" row above is
> **superseded** — M2 is now a **live finger-drumming rhythm game**, not a call-and-response echo. See
> **[Rhythm — live finger-drumming](#rhythm--live-finger-drumming-decided-2026-07-20-not-built)**. The
> other movements' calls stand.

### M1 Pitch — as built (2026-07-19)

The first slice of the frame, shipped in `mujicians.html`:

- **The call.** `run.call = { pc, letter, midi }` — a random **in-key** note (a C-major diatonic pc at the
  piano register, `midi = 60+pc`, so a hand card can exactly match it). `newCall()` picks a pc (varying from
  the previous call) and **sounds it** (`soundCall()` → `playTone` on the piano timbre). A first call is set
  in `startPlay()`; a fresh call is generated after every non-finishing play in `playHand()`.
- **Scoring — the `respond` term (raw pitch nearness, reworked 2026-07-19).** Added to `MOVEMENTS[1].terms`
  (`["inkey","respond"]`) and to `score()`. **M1 grades by absolute pitch distance, NOT consonance** — the
  lesson is ear-training ("match the pitch you hear"); consonance is deferred to the **Melody** movement (where
  notes are judged together and the green `fitsSelection()` cells matter). For a single played note,
  `d = |playedMidi − callMidi|` (0..11 semitones, since the M1 deck is one octave). The bonus **ramps smoothly
  per-semitone and never hits zero** (every guess scores something — a locked decision): proximity mult
  `pm = max(1, 5 − floor((d+1)/2))` → `5·4·4·3·3·2·2·1…`, plus bonus chips `+8` for a bullseye (`d=0`) and `+4`
  when very close (`d≤2`). So the nearest note wins big and it degrades gracefully with distance — and because
  a half-step is now *close* (not a dissonant "miss"), the grading matches pitch intuition. `respond` also
  carries a **4-tier bucket** (`exact` 0 · `soclose` 1–2 · `close` 3–5 · `far` 6–11) for the reward juice.
  Because `score()` runs live in `previewHTML()`, the bonus shows **before you commit** — instant feedback.
  *(Note: raw semitones means a call in the middle of the octave is inherently easier — nothing is more than
  ~6 away — an accepted trade-off; C4-vs-B4 = 11 = worst, as intended.)*
- **UI.** `callBarHTML()` renders a "🎧 Match this note" bar above the preview with the target as a colored
  letter chip (**shown**, per the early-ramp decision) + a **🔊 Hear it** replay button. Gated by
  `callActive()` = `run.mode==="campaign" && run.movement===1 && termOn("respond")`.
- **Amped reward feedback — the close-vs-far tier reads instantly (2026-07-19).** Playtest note: proximity only
  nudged the applause bar — too subtle to feel. The **4 nearness tiers** now drive loud, Balatro-style juice.
  `respondTier(midi)` (absolute distance → `exact` 0 ≫ `soclose` 1–2 ≫ `close` 3–5 ≫ `far` 6–11) is the single
  source for both scoring-bucket labels and feedback; `score()` returns it as `res.respond`. On commit: a
  **tier-graded cell bloom** (`bloomCell(cell, tier)` → gold burst+glow · amber · green · faint gray, scaling
  down with distance), a **floating rating word** rising off the cell (`floatRating` → ✦ PERFECT! / 🔥 SO
  CLOSE! / 👍 Close / · far ·), and a **reward chime** whose warmth/pitch tracks nearness (`respondChime` →
  a soft **inharmonic bell** via `_bell()` — a two-note rising sparkle for exact, down to a single dim low bell
  for far; scheduled `~ANIM.play` so it lands with the bloom. The bell's struck-metal partial ratios keep it
  deliberately un-grating and distinct from the melody's plain oscillator notes, not "another loud note."). **Live pre-commit:** the call bar glows + shows a verdict **stamp** (`✓ match! / 🔥 so
  close / 👍 close / far`) and the preview shows a matching **tier tag** for the currently-selected card, so
  "you've got it" reads *before* you play. Reduced-motion drops the bloom/word (the chime + text stamps remain).
- **Scope / firewall.** `callActive()` is M1-campaign-only, so **Free Play and M2–M7 are untouched** (they
  don't carry the `respond` term). The **M1 gate** (catalog the 7 in-key letters) is now the run's **goal**
  that stops the song — see **[Run goals (BUILT 2026-07-19)](#run-goals--each-campaign-run-has-a-finish-line-built-2026-07-19)**;
  it fills naturally as you answer random in-key calls, and the run's pitch-accuracy score reports how close.
- **Saved song = your notes only (decided).** The call is an **off-timeline audio+visual cue**, never written
  to the loop — so `snapshotEvents` captures only your responses. See [the decision above](#whether-the-call-joins-the-saved-song--decided-2026-07-19-only-your-notes).
- **Scheduler look-ahead race — fixed (2026-07-19).** Placing a note into the backing loop's already-committed
  ~120ms look-ahead window skipped its loop echo for that one lap (you'd hear the click-preview, but the
  playhead swept over it silently until next lap). `catchUpEvent()` (called from `placeEvent`) now schedules
  that single onset for the current lap when it lands in the committed window; `schedTick` only schedules
  onsets `≥ schedFrom`, so no double. General fix (all movements + Free Play), inert while paused.
- **Blind "by Ear" sub-level — BUILT (2026-07-19).** *(Superseded 2026-07-19: by-Ear is no longer a standalone
  Home button — it's **stage 2 of the gated M1 ladder** (Naturals → **by-Ear** → Sharps → Flats), driven by
  `persist.progress.pitchStage`. See [Accidentals → M1 ladder as built](#m1-ladder--as-built-2026-07-19). The
  original design below is kept for the ear-mode mechanics, which are unchanged.)* The [shown-early→ear-only ramp](#the-four-decisions-locked) exists for M1 as a **sub-level** (the frame chosen with the dev, mirroring the
  Sharps/Flats sub-levels). Originally, once the 7 shown naturals were catalogued (`persist.progress.gates.pitch`
  full), Home showed a **🎧 M1 Pitch — by Ear** button that starts an M1 campaign run with
  **`run.pitchLevel:"ear"`** (`startRun(mode, opts)` gained `opts.movement`/`opts.pitchLevel`; `callHidden()` =
  `callActive() && pitchLevel==="ear"`). In ear mode the call **sounds only** — `callBarHTML` draws a **muffled
  `?` chip** (no colour) + the **🔊 Hear it** button and **no pre-commit verdict**; `previewHTML` **hides the
  whole numeric readout** (applause/mult would jump on the right card and let you brute-force by watching it).
  You commit **blind**; the existing bloom + floating-rating word + proximity chime judge you *after*, and a
  **reveal banner** (its own prominent, tier-coloured row in the call bar) then names what the call was
  (`run.callReveal` → "The note was **E** ✓ nailed it! — you played **D**"). The reveal **stays up until you
  select your next answer card** (cleared in `toggleSel`; also reset on `startPlay`) — a short auto-clear timer
  was too easy to miss while watching the cell bloom. The run's **goal is unchanged** (catalogue the 7 in-key letters — now *by
  ear*); finishing reports **pitch accuracy "(by ear)"** and sets `persist.progress.gates.pitchEar` for the
  Home "✓" badge. **Firewall:** ear mode is forced `movement:1` and pins there, so a run past M1 doesn't
  double-advance (`maybeAdvance` early-returns off-frontier); Free Play & M2–M7 untouched. Reduced-motion keeps
  the text reveal (drops bloom/word as before).
- **Still deferred:** calls stay **single-note per play** (phrase calls arrive with later movements); the
  by-ear ramp is a **discrete sub-level**, not an in-run shown→hidden gradient. The proximity curve
  (per-semitone ramp + 4 tiers above) is tunable.

### Dynamics · Fire — the sleeping-creature lesson (dev's design, teach the notation)

The Dynamics movement's job is to **teach the notations of loudness** (pp · p · mp · mf · f · ff, plus the
crescendo/decrescendo hairpins) — not just "match a volume" (only 3 built levels; too trivial to echo). The
dev's framing does the teaching through a **story/scenario** that also **folds in rests**:

- **A creature is asleep or awake, and has a size.** The scene sets the **target dynamic**:
  - **Sleeping** → you must **sneak past without waking it**: play **soft** (pp/p) and use **rests**
    (silence = making no noise). A **big** sleeper raises the stakes — quieter still, more rests.
  - **Awake** → you must **scare it away**: be as **loud as possible** (ff).
- So the "call" here is a **situation**, not a pitch — your **dynamic choice matters because the context
  demands a specific loudness**, and the game labels the required level with its **notation** (pp = "sneak,"
  ff = "roar"), teaching the vocabulary in play.
- **Rests get their diegetic home here:** a rest is the quietest possible dynamic — a held breath while you
  tiptoe past the sleeper. (Ties the [rest card](#continuous-timeline--consistent-stacking--the-core-rhythmmelody-rework-decided-2026-07-18-not-built) to Dynamics as well as Rhythm.)
- **Reuses size = volume (BUILT):** a big/loud card visibly swells; a big
  sleeping creature ↔ the need to keep your cards small (quiet).
- The **A/B/C dynamic ideas** (match-a-swell / answer-with-contrast / feed-the-fire-crescendo) become
  **deeper Dynamics sub-levels** once the notation basics land — not the intro lesson.

### The later-movement turn — from echo to original composition

**Dev's explicit ask (locked):** the later levels must **not** stay pure call-and-repeat, or the player never
makes *original* music. So the campaign **shifts flavor across the arc**:

- **Early (M1–M3): imitate.** Call-and-response teaches the atoms (pitch, rhythm, dynamics) — echo the call,
  scored on proximity. This is where "make choice matter" is won.
- **Later (M4+): compose.** Scoring turns toward **freeform good-sounding combinations** — reward the player
  for playing **consonant, in-key** notes that sound good together, i.e. landing in the **green "good" cells**
  the game already highlights in Free Play. **This is the [`fitsSelection()`](mujicians.html) system**
  (mujicians.html:1541): a cell glows green when a pitch is **in-key AND forms a consonant interval (3rd/4th/
  5th/6th or a doubling) with every selected note** (empty selection → all in-key rows glow, FL-Studio-style).
  Scoring later movements on **how much of your line lands in the green** lets the player build **original
  soundtracks that sound good**, not just copies of a call.
- **The bridge:** call-and-response and freeform-consonance **coexist** rather than replace — a later movement
  can still open with a call (a theme to answer) but reward you for developing it with your *own* consonant,
  in-key material. This also aligns the campaign's late game with **Free Play's** open scoring, so graduating
  M7 → Free Play is a smooth handoff (the green-cell reward is already how Free Play grades quality).

### Code map (sketch, when built)

- **A `call` per movement.** A `makeCall(mv, level)` produces the target the response is scored against:
  a pitch (M1), a rhythm figure (M2), a creature scenario → target dynamic (M3), a phrase/contour (M4), a
  root tone (M5), a timbre (M6), an A-theme (M7). Stored on `run.call`; re-rolled per call (per-play early,
  per-phrase later — TBD per movement).
- **Scoring = proximity to the call**, added alongside today's terms. Each movement's `terms` gains a
  **`respond`** term (or a per-movement proximity function) that reads `run.call` and the just-played event.
  For M1, pitch proximity replaces the flat `inkey ? 2 : 1` with a graded distance-to-target. **Free Play
  omits the `respond` term** (no call) — so `MOVEMENTS[].terms` gates it exactly like every other term.
- **Shown vs ear-only** — **BUILT for M1** as `run.pitchLevel` (`"naturals"` shown · `"ear"` hidden) surfaced
  as a discrete Home sub-level, rather than the originally-sketched `run.callHidden` flag. `callHidden()` gates
  the audio-only call bar (muffled `?` chip, no pre-commit verdict) + the blank numeric preview + the post-commit
  reveal banner. Later movements/bosses can reuse the same `callHidden()`-style suppression. See
  [M1 — as built](#m1-pitch--as-built-2026-07-19).
- **Dynamics scenario:** a small table of `{creature, asleep, size} → targetDyn (+ wantRests)`; the HUD shows
  the scene + the demanded notation (pp…ff); scoring compares the played `dyn` (and rest usage) to the target.
- **Later-movement freeform:** reuse `fitsSelection()` — score a per-event/per-line **green-fraction** bonus
  (how many played notes are in-key + consonant with their context). This is the Free-Play quality signal
  turned into a campaign scoring term for M4+.
- **Call on/off the timeline** = tag placed events `role:'call'|'response'`; `snapshotEvents`/`saveSong`
  include or strip calls per the player option.
- **Untouched:** `classify`, the scheduler, the loop groove — call-and-response is a **scoring + a target
  cue**, layered on the existing timeline model, not a rewrite of it.

### Open sub-decisions (defaults noted)

- **Call size per movement** — per-play single-note calls (M1) vs multi-note phrase calls (M4) that test
  memory. *[recommended: grows with the movement — 1 note early, a short phrase by M4.]*
- **Saved-song: call included?** — ✅ **DECIDED 2026-07-19: only your notes** (call never written to the
  timeline; no toggle). See [the decision](#whether-the-call-joins-the-saved-song--decided-2026-07-19-only-your-notes).
- **Proximity curve** — ✅ **DECIDED 2026-07-19 for M1: raw semitone distance** (per-semitone ramp, never
  zero, 4 tiers). Consonance-weighting was **rejected for M1** (a half-step is *close*, not a "miss") and
  moved to the **Melody** movement where notes are judged together. Later movements may still weight
  differently; the curve is tunable.
- **Dynamics scenario depth** — one creature per run vs a changing scene per phrase; whether "wake the
  sleeper" is an explicit fail-state or just lost points. *[recommended: lost points, no hard fail — matches
  the no-fail pillar.]*
- **Where the freeform turn starts** — M4 (melody) *[recommended]* vs M5 (harmony); how much call-and-response
  survives into the late game.

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
  diminished-5th — but correct *spelling* (key-dependent) is exactly what theory drills. **The sharps/flats
  runs [address the C♯-vs-D♭ half of this](#accidentals--the-sharps--flats-runs--the--boss-planned)** — the
  two decks spell the same 5 pitches oppositely, forcing a **`letter`+`acc`** field on cards (scoped to
  display/resolution/naturalize). **Still open (bigger):** interval quality (aug-4 vs dim-5) and full
  key-signature-aware spelling. **Plan:** carry a spelled letter+accidental, not just a pitch class.

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

## Accidentals — the sharps & flats runs + the ♮ boss (Sharps/Flats BUILT 2026-07-19; boss deferred)

> **Status: ✅ Sharps & Flats BUILT 2026-07-19** in `mujicians.html`; the **♮ boss is deferred** (dev's call).
> This realizes the long-flagged **"accidentals belong in M1 Pitch"** note in favor of **sub-level runs with
> dedicated decks**, and **funds the enharmonic-spelling gap** (the engine now carries `acc` and tells C♯ from
> D♭). Forks locked with the dev (2026-07-19): **full mechanic** (spelled cards + colour shades + chromatic-
> resolution scoring + per-deck 5-card gates), **call-and-response + resolution** play, gate = **catalogue 5
> spellings + one correct resolution**, mentors **🎭 Sharpist** (jester) / **🤺 Sir Flatterer** (knight). See
> **[M1 ladder — as built](#m1-ladder--as-built-2026-07-19)** below.

**The shape (BUILT).** Accidentals are **internal levels of the Pitch movement (M1)**, walked as a **gated
ladder** before M2 Rhythm unlocks — and **ear training now sits in that ladder** (moved out of a standalone
Home button; dev's ask 2026-07-19 — ear comes right after the first pitch lesson, not after Rhythm):

```
M1 PITCH  (a gated ladder — each stage unlocks the next; only past Flats does M2 Rhythm open)
 ├─ Naturals  — catalogue the 7 letters in key (shown call)         ← BUILT (hangman row)
 ├─ by Ear    — the 7 naturals again, call HIDDEN (ear training)    ← BUILT (was a side button; now in-line)
 ├─ Sharps    — call-and-response: play any note HIGHER (bonus: exact ♯ + resolve UP)  ← BUILT (🎭 Sharpist)
 ├─ Flats     — call-and-response: play any note LOWER (bonus: exact ♭ + resolve DOWN) ← BUILT (🤺 Sir Flatterer)
 └─ BOSS ♮    — capstone whose debuff naturalizes every ♯/♭          ← DEFERRED (not built)
```

### M1 ladder — as built (2026-07-19)

- **`persist.progress.pitchStage`** ∈ `naturals → ear → sharps → flats` is the M1 frontier stage. While
  `movement===1`, the Home **Campaign** button follows it (label `▶ Campaign · M1 Pitch — <stage>`), and a
  **ladder strip** (`pitchLadderHTML`) shows done/current stages. `maybeAdvance` advances the *stage* (not
  the movement) until Flats clears, which finally bumps `movement→2`. **Migration:** old saves derive the
  stage from prior gates (`movement>1`→done · `gates.pitchEar`→sharps · 7 naturals→ear · else naturals). Once
  past M1 a compact **🎼 Pitch practice** row (`pitchPracticeHTML`) replays any sub-level.
- **`startRun(mode,opts)`** resolves `pitchLevel` from `opts.pitchLevel || pitchStage` (M1 only). The old
  standalone **🎧 by-Ear** Home button is gone (folded into the ladder); "New Run" just follows the frontier.
- **Spelled cards.** Card/note objects carry **`acc`** (`0`/`+1`/`−1`); `buildDeck(mv, level)` adds the 5
  accidental cards to the naturals for `sharps`/`flats` (`SHARP_NOTES` C♯D♯F♯G♯A♯ · `FLAT_NOTES` D♭E♭G♭A♭B♭ —
  same pcs/midis, different `letter`+`acc`). `noteLabel`/`spellId` render/key the spelling; `shadeFor` tints
  each accidental toward the natural it **resolves to** (♯→next letter up, ♭→prev letter down — colour shows
  the voice-leading pull). `rowLetter` labels the black-key piano-roll rows to match the deck.
- **Call-and-response — forgiving DIRECTION play (reworked 2026-07-20).** Because it's a random card game you
  rarely draw the exact accidental, so demanding it was frustrating. Now the mentor **sounds a natural** and you
  just answer with **any note higher** (♯) / **lower** (♭); landing the **exact accidental** is a *bonus*, and
  only after an exact hit does the two-play **resolution** open (also a bonus, `run.call.awaitingResolve`).
  Scoring (`score()` respond term, accidental first-play branch): **exact ♯/♭** `+5 mult/+8 chips`; **correct
  direction** (`(played−call)·dir>0`) `+3 mult/+2 chips`; **wrong way** `+1 mult` (never zero). `respondTier`
  is direction-aware (`exact` ≫ `soclose`/`close` for right-way ≫ `far` for wrong-way) so the bloom/rating/chime
  and the live call-bar stamp read direction. The **chromatic-resolution bonus** (`+2 mult/+6 chips` + Codex) is
  unchanged but now purely optional. Calls stay in **C major** (accidentals are out of key — no flat `inkey ×2`
  to punish them). `newCall` **never calls a note with no room in the required direction** (filters the natural
  pool by the deck's pitch range — nothing above for ♯ / below for ♭ would be unanswerable). `callBarHTML`'s
  accidental branch says "play any note **higher/lower** — bonus for the exact ♯/♭" (mentor face + natural chip +
  target chip + live direction stamp).
- **Gate (`gateStatus` case 1 branch) — direction + one exact.** Sharps/Flats met = **`ACC_DIR_TARGET` (4)
  correct-direction responses** (`run.gateDir`) **+ one exact accidental landed** (`run.gateAcc.size≥1`).
  Resolution is **no longer required** to advance (optional bonus). Shown in-gig via `accTrackerHTML`
  (higher/lower count + the 5 exact-spelling slots + an "exact ✓" + a "resolve ✓ bonus").
- **Mentors.** `CHARACTERS.sharpist` (🎭, giddy/upward) and `CHARACTERS.flatter` (🤺, glum/downward) narrate
  `LESSON_INTROS["m1:sharps"]` / `["m1:flats"]`; `lessonKey()` returns `m1:<level>` for any non-naturals M1
  stage. Dee still narrates Naturals + by-Ear.
- **Deferred (unchanged):** the **♮ boss**, its naturalize debuff, and the ♮-card / Ranger reward.

### Accidentals graduate to every later mode + Free Play (BUILT 2026-07-20)

Once **both** M1 accidental lessons are cleared (finishing Flats bumps `persist.progress.movement>1`),
accidentals stop being M1-only and join **every later Campaign movement (M2–M7) and Free Play**:

- **Unlock gate.** `accidentalsUnlocked()` = `persist.progress.movement > 1`. Gated on **campaign progress**,
  not the run's movement — so a first-timer who jumps straight into **Free Play** (a run at movement 7) still
  won't meet accidentals until they've actually been taught them.
- **A mix of BOTH spellings.** `buildDeck` (the `else if(m>=2 && accidentalsUnlocked())` branch) adds **both**
  the sharp AND flat spelling of every black key — the enharmonic pair (C♯ *and* D♭, D♯ *and* E♭, …) — at
  **`ACC_COPIES` (1)** copy **per unlocked timbre**. The whole deck is **capped at `MAX_TIMBRES` (4)** timbres
  (`instrumentsFor(m).slice(0,4)`) so it can't explode as more instruments arrive. (M1's own Sharps/Flats
  sub-levels keep their **single**-spelling teaching deck; this is the separate graduated deck.)
- **They're worth playing — resolution rewarded everywhere.** The **chromatic-resolution bonus** (play an
  accidental, then step a half-step in its pull direction onto an in-key scale tone → `+2 mult/+6 chips` +
  Codex "Chromatic resolution") is no longer M1-only — its guard is now `(isAccidentalLevel() ||
  accidentalsUnlocked())`, so accidentals function as **leading/passing tones** in the later movements and Free
  Play. (They're still out-of-key in C major, so they get no `inkey ×2` on their own — resolving them is the
  payoff.) `addCodex("Chromatic resolution")` fires in any mode; the M1 gate's `gateResolved` still only flips
  during the Sharps/Flats sub-levels.
- **Piano-roll honours the spelling.** `eventCoverage` now carries a per-cell **colour** (`shadeFor(nt)`), so a
  played **C♯ looks warm** and a **D♭ looks cool** even though they share a row/pitch; the placement **ghost**
  uses the selected card's spelling colour (`selCol`). Black-key **row labels** show **both** spellings
  (`enharmonicPair` → "C♯/D♭") once unlocked (single spelling inside the M1 sub-levels).
- **Future: an enharmonics lesson.** C♯ and D♭ are the same pitch spelled two ways — a natural dedicated
  **enharmonics lesson** (why spelling depends on key/direction) is flagged as a future movement/sub-level;
  seeding both spellings into the deck now sets it up. *(Not built.)*

**Why this doesn't revert "gigs removed."** The 2026-07-18 cut removed per-run **antes/gigs** from normal &
Free-Play performances (a run is one continuous open-ended song). This boss is **not** that — it's a
**campaign capstone / special challenge run** (the doc already keeps "boss = movement capstone" alive). Normal
and Free-Play runs stay threshold-free and open-ended; only the ♮ boss run carries a win target. Keep that
firewall: **don't** reintroduce antes into the everyday performance.

### The two decks — same 5 pitches, spelled two ways (decided)

The distinguishing lesson is **spelling**, not new sounds:

| Deck | Cards | Color shade | The pull it teaches |
|---|---|---|---|
| **Sharps** | C♯ D♯ F♯ G♯ A♯ | **warmer** — each letter's ROYGBIV color nudged toward the **next** letter's | a ♯ **resolves up** a half-step (C♯→D) |
| **Flats** | D♭ E♭ G♭ A♭ B♭ | **cooler** — nudged toward the **previous** letter's | a ♭ **resolves down** a half-step (D♭→C) |

Same five black-key pitches; the **name, color-shade, and voice-leading pull** differ. This is *the* reason
spelling matters — **C♯ and D♭ are one key but pull in opposite directions** — and it's what makes the two
runs feel distinct instead of reskinned. It forces the engine to carry **letter + accidental**, not just a
pitch class (the enharmonic fix).

### Scoring — chromatic resolution *[recommended; sub-decision]*

> **AMENDED 2026-07-20 — forgiving direction is the primary score; resolution is a bonus.** Requiring the
> *exact* accidental was frustrating in a random card game (you rarely drew it). The accidental levels now
> score first on **playing the right DIRECTION** (higher for ♯ / lower for ♭) with the **exact ♯/♭ as a bonus**;
> the chromatic-resolution bonus below only opens after an exact hit and is **optional** (not gated). The
> gate became **direction ×`ACC_DIR_TARGET` + one exact** (not "all 5 + resolve"). See
> [M1 ladder — as built](#m1-ladder--as-built-2026-07-19). The rest of this section is the original resolution design.

The runs are still in **C major**, where every accidental is **out of key** — so plain "in-key = ×2" would
punish the very cards the level is about. Instead the accidental levels turn on a **chromatic-resolution
bonus**: a ♯ that moves **up** a half-step to a chord/scale tone (or a ♭ that moves **down**) on the next
timeline note scores a bonus and a Codex "resolution" note. This

- teaches what accidentals are **for** (leading tones / voice-leading), not just that they exist;
- reuses the timeline's **melodic-motion** machinery (already scored between the new note and the previous
  timeline note — a semitone-resolution check sits right beside stepwise-motion);
- keeps `maxSelect = 1` (still M1): you play the accidental, then play its resolution — a two-play gesture on
  the continuous timeline. **No key change needed** (that's still M4).

*(Rejected alt: setting the sharps run in a sharp key so accidentals read in-key — pulls in key signatures,
overlaps M4 modulation, bigger lift. Kept C major + resolution bonus.)*

### The ♮ boss — "the Natural cancels all accidentals" (decided: adapt & keep scoring)

> **The *encounter* is now fleshed out** as **[Ranger — "Natural Selection"](#ranger--the-m1-pitch-boss-natural-selection-designed-2026-07-26-not-built)** (fantasy / feel / phases / capture). This subsection remains the **mechanics spec + code map**; that section rounds out the fight without restating it. **Still not built.**

A **capstone run** unlocked once both accidental gates are full. Its debuff: **every ♯/♭ card you play is
naturalized** — scored *and sounded* as the letter's natural pitch (F♯ → F, D♭ → D — the pitch audibly
**moves**, since we carry letter+acc). You **win by still making theory-correct music** and hitting a target
(the boss run **does** carry a win check — the one place a run does). The lesson lands **by absence**: you
feel what the accidental was doing once it's gone, and you must build a line that still works when your
color notes collapse to the scale.

- **Reward for beating it:** unlock the **♮ (natural) as a playable Accidental card** — the third accidental,
  which **cancels** a ♯/♭. That both pays off the boss thematically and seeds the **Accidental-card (Tarot)**
  shop line. Plus a Codex badge + Tips.
- **Keep it simple v1:** full naturalization for the whole run (not partial/growing). Growing debuff, or
  naturalizing only some bars, is a later tuning knob.

### M1 graduation — does the accidental arc gate M2? **DECIDED 2026-07-19: yes, gated ladder**

**Built as a required ladder** (dev reversed the earlier "optional track" recommendation): M2 Rhythm only
unlocks after the **whole** M1 arc — **Naturals → by-Ear → Sharps → Flats** — is cleared in sequence. This
also moved **ear training** to sit right after the first pitch lesson (it used to be a standalone Home button
that appeared *alongside* Rhythm's unlock). The **♮ boss** is now **designed ([Ranger — "Natural Selection"](#ranger--the-m1-pitch-boss-natural-selection-designed-2026-07-26-not-built), 2026-07-26) but not
built**, so Flats is the final stage that graduates M1→M2 for now.

### Code map (Sharps/Flats built — see [as built](#m1-ladder--as-built-2026-07-19); ♮-boss rows below are TODO)

> The Sharps/Flats rows are **built** (with deliberate deviations from this original sketch: the gate is
> **per-run** — `run.gateDir` correct-direction count + `run.gateAcc` for the one-exact requirement (resolution
> `run.gateResolved` is an optional bonus, not gated) — matching M1's other per-run gates, **not** persisted
> `gates.sharps`/`.flats`; the ladder frontier `persist.progress.pitchStage` is what persists; and play is the
> **forgiving DIRECTION** model, not "play the exact accidental," per the 2026-07-20 rework). The **boss
> debuff / ♮-card / Home boss-unlock** rows remain unbuilt.

- **Spelled notes (the core retrofit).** Card/note objects gain an **`acc`** field (`0` natural / `+1` sharp
  / `−1` flat) alongside `pc`/`letter`/`midi`. `C♯` and `D♭` share `pc`/`midi` but differ in `letter`+`acc`.
  Everything pitch-class-based (`classify`, in-key, consonance) is unaffected; **spelling-aware** bits
  (display, the resolution bonus, naturalization) read `letter`+`acc`. This is the doc's flagged enharmonic
  fix, scoped to where it's needed rather than a global rewrite.
- **Decks & levels.** `buildDeck(mv, level)` gains a **level** (`'naturals'|'sharps'|'flats'|'natboss'`);
  `run.pitchLevel` is set at run start for M1. Sharps/flats levels = **naturals + the 5 accidental cards** of
  that spelling (naturals stay so you can resolve into them and still make music).
- **Color shades.** A `shade(letter, acc)` helper interpolates the base `COLOR[letter]` toward the neighbor
  letter's color (♯ → next, ♭ → prev). `cardHTML` draws the **accidental glyph** (♯/♭/♮) beside the letter and
  applies the shade. (Noteling **morphology** — ♯ spikier, ♭ rounder — stays deferred to the art layer.)
- **Scoring.** Add a **chromatic-resolution** term keyed off the previous timeline note (semitone up for ♯,
  down for ♭, landing on a scale/chord tone). Slots next to the existing melodic-motion scoring.
- **Gates (mirror the M1 hangman).** `persist.progress.gates.sharps` / `.flats` — additive 5-slot sets, each
  surfaced as its own hangman-style tracker (reusing `pitchTrackerHTML`). Both full ⇒ the ♮ boss unlocks;
  beating it sets a `natBoss` flag / grants the ♮ card.
- **Boss debuff.** `run.debuff = 'naturalize'` on the boss run; `playHand`/`classify`/`soundStack`/the
  scheduler map each accidental note to its **letter's natural** `pc`/`midi` before sounding & scoring. The
  boss run is the **one** run with a win target (`runThreshold()` — the otherwise-vestigial threshold gets a
  real use here).
- **Home UI.** Once naturals are catalogued, M1 offers the next level as the run flavor (Sharps ▸ Flats ▸ ♮
  Boss). Light touch — detail in build. The DEV movement jumper can gain level buttons for testing.

### Open sub-decisions (defaults noted)

- **Scoring** = chromatic-resolution bonus in C major *[recommended]* vs sharp/flat-key framing.
- **M1 graduation** = naturals still advance; accidental arc optional *[recommended]* vs required before M2.
- **Boss reward** = capture **Ranger** as a legendary Muse that grants the ♮ (cancel) power *[recommended]*
  — see [The character Muses](#the-character-muses--the-graphic-novel-cast-is-the-muse-roster-planned); alt/additional rewards TBD.
- **Boss debuff** = full naturalization v1 *[recommended]*; growing/partial later.
- **Enharmonic scope** — carry `acc` only where needed (display/resolution/naturalize) *[recommended]* vs a
  fuller spelled-pitch model (interval quality, key signatures) — the latter is the theory-coverage
  checklist's bigger item, kept separate.

---

## The character Muses — the graphic-novel cast IS the Muse roster (PLANNED)

> **Status: PLANNED, not built (designed 2026-07-18; full roster + two more decisions 2026-07-25).** Turns the
> abstract Muse pool into the dev's *Mujicians* graphic-novel characters, and realizes the long-flagged **"each
> movement is a chapter/mentor from the story"** hook with actual named cast. **The complete M1–M7 hero/villain
> roster is now mapped — see [The full cast](#the-full-cast--movement-roster-dev-supplied-2026-07-25).** Two
> decisions locked 2026-07-25: **villains debut dialogue-first** (boss mechanics staged later) and **each hero
> narrates its own lesson** (Dee stays M1). Supersedes the generic `MUSE_POOL` names.

**The decision (locked).** A character plays **two roles**:

1. **Mentor / tutorial** — introduces and teaches their concept during the relevant lesson (portrait +
   guidance). This is the game's first real story/tutorial prose, and it's cheap (framing over the existing
   mechanic).
2. **A legendary Muse (the Joker analog)** — you earn the character as a **persistent, collected** Muse when
   you complete their lesson. **The cast replaces the generic Muses** (Perfect Pitch / Consonance / Cadence /
   … get reskinned to characters) rather than sitting alongside them — one unified named roster.

**Card type = Joker, not Tarot (decided).** Characters are **Muses**, not one-shot consumables — a story
figure you earn once should be **permanent**, and a burn-once Tarot you can't re-earn feels bad. For the
**accidental** characters, the Muse *grants or dispenses the transform ability* — so the ♯/♭/♮ **Tarot
operation lives inside the Joker**. Generic **Accidental/Tarot cards** stay a separate shop consumable that
these character-Muses can generate; the character is the *master* of the operation, not the disposable card.

### Level narration — mentor intros (Dee Composer) — BUILT (2026-07-19)

> **Status: ✅ BUILT** in `mujicians.html` — the **mentor / tutorial** role above, shipped first (as a
> Balatro-joker-style intro card). Realizes the "each movement is a chapter/mentor" hook. Forks decided with
> the dev (2026-07-19): intro **before** the Muse draft · **full first time → compact-on-repeat** · **intro
> card only** (no in-play follower yet). **Per-level mentors are now wired (Stage A, 2026-07-25): each
> movement's hero narrates its own lesson in-voice** — Dee M1 naturals, Sharpist/Sir Flatterer M1 ♯/♭, Gaia
> M2, Crescendra M3, Cantrip M4, Mage Orc M5, Timbrewolf M6, The Key M7 — each foiling its villain in the
> dialogue. See [The full cast](#the-full-cast--movement-roster-dev-supplied-2026-07-25).

At the start of a **campaign** run, before the Muse draft, a **character card + speech bubble** explains the
movement's **music theory** and the **lesson's task** (kid-friendly voice — Dee is a little girl). **Free Play
shows no intro** (it's the open creative mode; teaching is campaign-only — same firewall as the call system).

- **Two data registries (both swap-friendly).** `CHARACTERS` — each entry's **art is a token**
  (`{kind:"emoji", value:"🍄"}` now; change to `{kind:"sprite", src:…}` to move to **pixel art** with no other
  edits — `charArtHTML()` is the only place art is drawn). `LESSON_INTROS` — keyed by movement (+ sub-level:
  `"m1"`, `"m1:ear"`, `"m2"`…`"m7"`), each carries **`char`** (who speaks — **now the per-level mentor**: Dee /
  Sharpist / Sir Flatterer / Gaia / Crescendra / Cantrip / Mage Orc / Timbrewolf / The Key), a **`title`** +
  **`theory[]`** paragraphs + a **`task`** line (the full first-time script), and a **`compact`** one-liner.
  **All seven movements have real authored dialogue** — Stage A (2026-07-25) rewrote M2–M7 into each hero's
  own voice (from the earlier all-Dee text), each tied to its story **element** (rhythm=earth pulse,
  dynamics=fire, melody=water, harmony=forged metal, timbre=wood voices, structure=time/memory), accurate to
  that level's actual mechanic + gate (durations & rests, p/mf/f size-is-volume, stepwise melody + intervals,
  consonant triads + cadence, multi-instrument blends, A·B·A form), and naming its villain as a foil.
- **Flow.** `startRun()` → **`offerIntro()`** (was `offerDraft()`) → `screen="intro"` (rendered over the empty
  stage, mirroring the draft) → **"Got it — let's play ▸"** → `offerDraft()` → `pickMuse()` → `startPlay()`.
  `offerIntro()` falls straight through to the draft when there's no lesson (Free Play).
- **Full first-time → compact on repeat.** `persist.progress.seenIntros[key]` records that you've seen a level.
  First time = the full script; after that = the `compact` one-liner with a **"more ▾"** that expands the full
  text inline (`introExpanded`). `m1` and `m1:ear` are **distinct keys**, so the by-ear level gets its own
  first-time full intro.
- **Content.** Each mentor has a distinct voice (Dee warm & playful; Gaia earthy/streetwise; Crescendra
  electric & theatrical; Cantrip a quick trickster; Mage Orc a forge-bright commander; Timbrewolf a wild
  howler; The Key a sly rogue); theory named plainly but simply, each level flavoured by its element and
  pointed at what that level actually asks you to do. All M1–M7 authored (no placeholders).
- **Presentation.** Current-style CSS (`.charcard`/`.charart`/`.speech` with a bubble tail; reuses the theme
  vars). Pixel-ready: art is a token and the frame is plain CSS, so a future `.pixel` sprite skin is additive.
  Responsive (stacks under ~520px); reduced-motion drops the bubble pop.
- **Deferred (unchanged):** a persistent **Jiminy-style corner follower** + in-play barks; **pixel sprite** art
  + mood variants; the **villains' boss-fight mechanics** (they're seated in `CHARACTERS` + named in the intros
  now, but only Ranger's ♮ boss is even designed); the cast as **earnable Muses** (mentor-only for now — Stage D).
- **Deferred — dialogue delivery (dev preference, 2026-07-19):** the intro currently renders as a **modal
  dialog** (the speech bubble lives inside a blocking overlay). Eventually the dev wants the dialogue to come
  from a **speech bubble anchored to Dee in-scene** (the follower speaking), **not** a modal dialog box. The
  current bubble markup (`.speech` + tail) is reusable as-is; the change is *where it's anchored* (to the
  on-screen character rather than centred in an overlay). This is fine as a modal for now.

### The full cast — movement roster (dev-supplied 2026-07-25)

The *Mujicians* graphic-novel cast is now mapped across all seven movements. **Two decisions locked
2026-07-25:** (1) **villains debut dialogue-first** — every villain is seated in `CHARACTERS` now with a
taunt / the hero's warning inside the lesson intro; their **boss-fight debuff mechanics come later, one at a
time** (Ranger's ♮ boss is the already-designed template). (2) **Each movement's hero narrates its own lesson
in-voice** (like Sharpist/Sir Flatterer), with **Dee Composer staying the M1 Pitch mentor**.

| Movement (element) | Hero(es) — narrates the lesson | Villain — dialogue foil now, boss later |
|---|---|---|
| **M1 Pitch** | 🎭 **Sharpist** (jester, ♯) · 🤺 **Sir Flatterer** (knight, ♭) · *(Dee Composer narrates naturals)* | 🏹 **Ranger** (♮ — nature *cancels* the accidental) |
| **M2 Rhythm** (earth pulse) | 🧝 **Gaia** — City Gnome (the beat / groove) | 💤 **Sandmar** — Sand Kobold; raises **gravity** + puts you to sleep with **rest symbols** (a Sandman) |
| **M3 Dynamics** (fire) | ⚡ **Crescendra** — Frankenstein woman (the swell / spark) | 💀 **Morendo** — skeleton; drains your volume ("dying away") |
| **M4 Melody** (water) | 👺 **Cantrip** — goblin (a clean, flowing stepwise line) | 🫠 **Slurry** — shapeshifting blob; smears distinct notes into legato **mush** |
| **M5 Harmony** (forged metal) | ⛏️ **Miner Minor** (dwarf, minor) · 🧙 **Mage Orc** (wizard, major) · 😈 **Demonish** (demon, diminished) · 🐂 **Augminotaur** (augmented minotaur) | 🎻 **Tritony** — the band's **former leader** turned villain (the "devil's interval," dissonance) |
| **M6 Timbre** (wood voices) | 🐺 **Timbrewolf** (many voices in one) | 🪱 **Wormwood** *(tentative; a.k.a. **Woodworm**)* — see lore below |
| **M7 Structure** (time / memory) | 🗝️ **The Key** — rogue (unlocks the return home) | 🍸 **The Bartender** — "**bars**" / last call; muddles memory (structure *is* memory) |

*(Emoji here are illustrative doc placeholders; the `CHARACTERS` registry art tokens get chosen when Stage A
is built. Dee, Sharpist and Sir Flatterer are already in code.)*

**Names still tentative — M6 timbre villain:** recorded as **Wormwood** (dev pick), alt **Woodworm**. Other
options that fit his lore (wooden teeth, a busker, bites to homogenise voices): **Timberjaw** (the wooden
teeth, and it echoes Timbrewolf's *timber* root), **Cordwood** (chord/cord + wood), **Maestro Wormwood / The
Choirmaster** (his choir), **Gnash**.

**Cast lore (dev-supplied 2026-07-25):**
- **The Harmony heroes were a band of adventurers, and Tritony was their leader** before she fell to villainy
  — so M5's four chord-quality heroes (Miner Minor / Mage Orc / Demonish / Augminotaur) and their boss share
  a **fallen-leader** backstory. (The tritone she embodies is the classic *diabolus in musica* dissonance.)
- **Wormwood / Woodworm (M6 villain)** was a **street busker** who gained **wooden teeth**. When he **bites a
  person**, they **sound more like him** — he is assembling a homogenous **choir**, which *is* his
  timbre-flattening villainy (one voice swallowing the many). But when he bites an **animal**, it becomes
  **more human-like and better at music** — and **that is how Timbrewolf was created** (the M6 hero is
  Wormwood's accidental masterpiece). Hero and villain are linked by origin.
- **Slurry is now a VILLAIN (reframe 2026-07-25).** She was previously written as a *hero* Muse (legato/slur
  bonus). Recast: her shapeshifting slur **smears distinct notes into indistinct mush**, and the goblin hero
  **Cantrip** teaches the crisp stepwise line that fights it. *(The old legato-bonus Muse mechanic can migrate
  onto Cantrip or become Slurry's boss debuff — TBD when the M4 boss is built.)*

**Muse-effect sketches** (for Stage D, when the cast becomes the collectible Muse roster): Gaia = groove /
rhythmic-variety bonus · Crescendra = dynamic-contrast bonus · Cantrip = stepwise-melody / scale-run bonus ·
the four Harmony heroes = their chord quality (minor / major / dim / aug) · Timbrewolf = timbre-blend bonus ·
The Key = form / A·B·A-return bonus. Villains are **captured** on boss defeat and grant their gimmick (Ranger
♮ cancel is the template).

Mapping is **concept-based, not one-per-movement** (M1 holds three: two hero mentors + Dee + the villain; M5
holds five: four chord heroes + the boss).

### Other ways they show up (menu, not all committed)

- **Recurring villain arc** — *(reframed 2026-07-25)* each movement now has its **own** villain (Sandmar,
  Morendo, Slurry, Tritony, Wormwood, The Bartender) rather than Ranger recurring, so the antagonist arc is a
  **rogues' gallery** — one boss per movement, dialogue-first now (see the roster's locked decisions). A
  throughline where one villain recurs is no longer the plan. **All seven bosses now have fleshed-out designs
  (all designed; two standalone core-loop MVPs built — Morendo & Tritony):
  [Ranger — "Natural Selection"](#ranger--the-m1-pitch-boss-natural-selection-designed-2026-07-26-not-built)**
  (M1 Pitch, the on-the-gig **Boss Blind** — ♮ arrows naturalize your accidentals),
  **[Sandmar — "The Lullaby Duel"](#sandmar--the-m2-rhythm-boss-the-lullaby-duel-designed-2026-07-25-not-built)**
  (M2 Rhythm, the template), **[Morendo — "Scorch the Bones"](#morendo--the-m3-dynamics-boss-scorch-the-bones-designed-2026-07-25-not-built)**
  (M3 Dynamics, an off-grid first-person loudness/mic set-piece — standalone MVP built), and
  **[Slurry — "Stepping Stones"](#slurry--the-m4-melody-boss-stepping-stones-designed-2026-07-25-not-built)**
  (M4 Melody, a voice-**pitch** stepping-stone crossing), and
  **[Tritony — "The Devil's Forge"](#tritony--the-m5-harmony-boss-the-devils-forge-designed-2026-07-25-not-built)**
  (M5 Harmony, an off-grid **chord-forging** Opus-Magnum-style craft puzzle — the *vertical* axis — standalone MVP built), and
  **[Wormwood — "Wormwood's Choir"](#wormwood--the-m6-timbre-boss-wormwoods-choir-designed-2026-07-26-not-built)**
  (M6 Timbre, a **pure-listening** find-the-odd-voice game — pluck true timbres out of his homogenized choir), and
  **[The Bartender — "Last Call"](#the-bartender--the-m7-structure-boss-last-call-designed-2026-07-26-not-built)**
  (M7 Structure, the **capstone/final boss** — a **musical-staff** memory fight: state an A theme, the night blurs, then *D.S. al Coda* recall it home from memory).
  Ranger = accidentals (♮/voice-leading, on-gig Boss Blind) · Sandmar = timing · Morendo = loudness · Slurry = pitch · Tritony = harmony · Wormwood = timbre · The Bartender = structure (form/memory).
- **Equipped companion** — carry one earned character for a run (persistent passive + flavor barks), à la
  Inklings' story companions; a soft loadout choice. *(Optional.)*
- **Codex "cast" gallery** — collecting characters fills a cast page (naturalist framing), separate from the
  note-creature **Notelings**.
- **Signature decks** — a character themes an alternate starting deck (the Balatro deck-unlock analog).

### Code map (when built)

- **`MUSE_POOL` becomes the character roster.** Each entry gains `name`/`class`/`portrait`/`mentor` (tutorial
  copy) + `legendary:true`, keeping the existing `onNote`/`onHand` hook shape and `minMv` gating. The current
  generic Muses (Perfect Pitch, Consonance, Low End, Cadence, Arpeggiator, Virtuoso, + the hand-size Muses)
  are **reskinned to characters** as the dev supplies names for each effect — until then they keep working
  under provisional names.
- **Earning a character** *(recommended default — the open fork)*: completing a character's lesson/gate grants
  their Muse into an **owned pool** (`persist.loadout.muses`, already planned in the backstage-shop section);
  heroes join on lesson-clear, villains (Ranger) are captured on **boss defeat**. The run-start draft then
  offers from **owned + always-available** characters (keeps run-to-run variety; ties into the shop plan).
- **Accidental-transform Muses.** Sharpist/Sir Flat/Ranger carry a `grants: '#'|'b'|'natural'` power the deck
  builder / a per-play control can apply (sharpen/flatten/naturalize a note), reusing the accidentals section's
  `acc` field. Ranger's ♮ is the boss reward (see the Accidentals section's *Boss reward*).
- **Slurry (now the M4 villain — reframe 2026-07-25).** The old legato-*bonus* mechanic (connected-line
  scoring; an optional per-play **slur** control that ties two consecutive events with no re-articulation — a
  short pitch glide, lit on the grid as a tie/curve) **lands on Slurry's capture Muse** (tamed portamento +
  smooth-stepwise bonus) — decided in the ["Stepping Stones" M4 boss design](#slurry--the-m4-melody-boss-stepping-stones-designed-2026-07-25-not-built).
  The boss itself fights via **discrete pitch targets** (slurring fails to land), so it doesn't need glide
  detection.
- **Mentor surface.** A lightweight portrait + tip on entering a character's lesson (first pass); fuller
  scripted dialogue is a later prose pass (the doc's flavor-only stance relaxes here, using existing fiction).

### Open sub-decisions

- ~~**Name the rest of the cast.**~~ **✅ RESOLVED 2026-07-25** — full roster mapped above (Gaia / Crescendra /
  Cantrip / the four Harmony heroes / Timbrewolf / The Key, with villains Sandmar / Morendo / Slurry / Tritony /
  Wormwood / The Bartender).
- ~~**Ranger recurrence.**~~ **✅ RESOLVED 2026-07-25** — not a throughline; each movement gets its **own**
  villain (a rogues' gallery).
- **How earned** = complete the lesson (heroes join / villain captured) *[recommended default]* vs shop-bought
  vs both. **Still open — confirm when Stage D (Muse roster) is built.**
- **M6 timbre villain name** — **Wormwood** (tentative) vs Woodworm / Timberjaw / Cordwood / Maestro Wormwood.
- **M5 intro narrator** — which of the four Harmony heroes opens the lesson (default: **Mage Orc**, major),
  or a tag-team, with the others surfacing as their chord quality comes up.
- ~~**Slurry's legato mechanic.**~~ **✅ RESOLVED 2026-07-25** — the old slur/glide bonus lands on **Slurry's
  capture Muse** (tamed portamento + smooth-stepwise bonus), per the ["Stepping Stones" boss design](#slurry--the-m4-melody-boss-stepping-stones-designed-2026-07-25-not-built).
- **Equipped-companion layer** — build the one-carried-character companion mode, or keep characters purely as
  drafted Muses.

---

## Ranger — the M1 Pitch boss: "Natural Selection" (DESIGNED 2026-07-26, not built)

> **Status: DESIGNED, not built.** The seventh fleshed boss — **completing the set** (Ranger is M1, so it sits *first* in movement order; the others are M2–M7). This section is the **fantasy / feel / phases**; the **mechanics spec + code map already live** in [the Accidentals section's *♮ boss*](#the--boss--the-natural-cancels-all-accidentals-decided-adapt--keep-scoring) (`run.debuff='naturalize'`, `buildDeck` `'natboss'` level, the ♮-card reward, `runThreshold` as the win target) — this rounds out the *encounter*, it doesn't restate those. **Distinct by design:** Ranger is the **one boss fought on the core card-play gig** — Mujicians' first **Balatro-style Boss Blind** (a constraint on the normal hand, not a bespoke set-piece) — which is exactly right for a *first* boss: home turf, one twist. That's the deliberate contrast to the escalating set-pieces of M2–M7 (drum duel / crypt / stream / forge / choir / staff). Same boss template otherwise: retryable, capture → Muse; and it's the **one everyday run that carries a win target** (the doc's firewall — normal & Free-Play runs stay open-ended). `run.debuff='naturalize'`.

**Fantasy.** **Ranger** (🏹 a wilderness archer/warden — **♮ = *nature***) believes the accidentals are *artificial* — cultivated, civilized alterations of the wild — and his job is to **let nature reclaim them**. His ♮ arrows **cancel** your ♯/♭ back to their natural pitch (F♯ → F, D♭ → D); the wild **overgrows** your color notes until the loop is all naturals. The pun is the whole character: *natural* = nature, and the ♮ sign literally **cancels** a sharp/flat. Sharpist (🎭) and Sir Flatterer (🤺) — the mentors who *taught* you the accidentals — stand with you: this is the **capstone exam** of their two lessons, and Ranger is out to undo both. The lesson lands **by absence** — you feel what a leading tone was *doing* only once it's gone.

### The render surface — the core gig, one twist (a Boss Blind)

No new surface: you play the **normal card-play gig** (deal a hand, stack/play notes onto the timeline), and Ranger is a **debuff modifier** over it — Balatro's Boss-Blind pattern, themed. Presentation is a light overlay, not a new engine: **Ranger stalks the edge of the screen**, the loop's margins **overgrow with vines**, and each naturalized note gets a quick **♮-arrow strike** cue (an accidental card collapsing to its natural, the pitch audibly *moving*). This "home turf, one rule change" framing is *why* it's the gentle first boss — the fundamentals you already know, bent.

### The core loop — make theory-correct music while your accidentals collapse

You still compose on the timeline, but **every ♯/♭ you play is naturalized** — scored *and sounded* as the letter's natural (carried via the `acc` field). So you **win by still making music that works** and clearing the run's applause target (`runThreshold` — the one everyday run with a win check). The skill: build lines that hold up when the color notes fall to the scale, and — the taught counter — **resolve an accidental *before* it's canceled** (play it and step a half-step onto its target: the **chromatic-resolution** the Sharps/Flats levels taught, now under fire). Beating Ranger = a strong, target-hitting line delivered *despite* the reclaiming.

### Ranger's signature move — Naturalize (the ♮ arrow)

His debuff is the M1-flavored sibling of the others' perception/tool-robbers (Sandmar's yawn / Morendo's hush / Slurry's smear / Wormwood's flatten / the Bartender's muddle): where they rob a *sense*, Ranger **strips your alteration** — the ♯/♭ you're counting on reverts to natural. **v1 (MVP, per the Accidentals spec): full naturalization the whole run** (a clean constraint — every accidental always collapses). The **deferred "make it a real duel" layer** turns it into an archer's telegraph: Ranger **nocks a ♮ arrow at a queued accidental** (a drawn-bow tell + a reticle on the card), and you race to **resolve it before he looses** — miss the window and it's canceled; escalating **volleys** grow the naturalization phase by phase.

### Phases (escalating — the deferred archer layer)

1. **The Clearing** — occasional naturalize; wide windows to resolve first. Learn to lead-and-resolve under threat.
2. **The Overgrowth** — faster, multi-arrow **volleys**; more of the loop reverts each bar.
3. **Second Nature** — **full** naturalization + press; you must land the target line entirely in the naturals (the v1 constraint becomes the climax). *(MVP ships the full-naturalization end-state directly; the ramp is the polish pass.)*

### Meters (boss-standard, retryable)

- **Ranger's HP = the applause target** — hitting `runThreshold` under naturalization banishes him (win). *(The one everyday run that carries a win check.)*
- **Fail-state** — running out of hands without reaching the target → **instant retry** (challenge-run framing; you lose the fight, not a saved song).

### Capture reward — capture Ranger → the ♮ (natural) card + Muse

Beating him **captures Ranger** (villains join on boss defeat — the planned earn path, and Ranger is its **template**): unlock the **♮ (natural) as a playable Accidental card** — the *third* accidental, which **cancels** a ♯/♭ — plus a legendary **Ranger Muse** granting the ♮/cancel power (naturalize a note at will: a leading-tone reset / an enharmonic tool). His weapon becomes yours, and it **seeds the Accidental-card (Tarot) shop line**. (Codex badge + Tips too.) "Weapon → your tool," like the rest — see [the Accidentals section's *Reward*](#the--boss--the-natural-cancels-all-accidentals-decided-adapt--keep-scoring).

### Placement, reuse & scope

- **Placement:** M1 Pitch capstone — the **final stage of the M1 gated ladder** (Naturals → by-Ear → Sharps → Flats → **♮ boss**), gating M2. *(Today `pitchStage` graduates M1→M2 at Flats since the boss is unbuilt; the boss slots in as the capstone before that unlock when built.)* Sharpist & Sir Flatterer narrate the intro, foiling Ranger.
- **Reuse (small — that's the point):** the **whole core gig** (deck/hand/timeline/scoring), the built **`acc` spelling** + **naturalize** mapping, **`runThreshold`** as the win target, the mentor/intro system, a boss end-screen. **New:** the Boss-Blind **overlay presentation** (Ranger sprite, vine overgrowth, the ♮-arrow strike cue), and — deferred — the **telegraphed-arrow / volley** phase logic, plus capture → the Ranger Muse + ♮ card.
- **Distinct modality:** the six others are timing · loudness · pitch · harmony · timbre · structure; **Ranger owns the *accidentals* axis — ♯/♭/♮ spelling & voice-leading** (M1). Both Ranger and Slurry are pitch-family but distinct: Slurry = *singing discrete pitches* (mic set-piece), Ranger = *the alteration of a note* (♮ cancel, on the deck). It's also the only **on-the-gig / Boss-Blind** boss.
- **Steal-from:** **Balatro's Boss Blinds** (a debuff that changes the rules of the normal hand — e.g. a suit gets debuffed) is the exact model; Ranger debuffs the *accidental* cards.
- **MVP:** the naturalize **Boss-Blind run** (full naturalization + `runThreshold` win + retry) with the light Ranger/vine overlay, and capture → the ♮ card. **Deferred:** the telegraphed **♮-arrow / volley** phases (growing naturalization), the Ranger Muse's cancel power beyond the card, sprite/vine art polish.
- **Open sub-decisions:** full vs. growing naturalization as the shipped default (Accidentals spec says full v1); whether resolving-before-canceled is a real timing window (needs the arrow telegraph) or just "resolve early helps"; exact `runThreshold` for the boss run; whether Sharpist/Sir Flatterer get active ally barks or just the intro.

---

## Sandmar — the M2 Rhythm boss: "The Lullaby Duel" (DESIGNED 2026-07-25, not built)

> **Status: DESIGNED, not built.** The first fleshed-out villain **boss encounter** (the cast's bosses were
> seated dialogue-first in Stage A; this is the template for turning one into a fight). Sandmar is the **M2
> Rhythm capstone**. Like Ranger's ♮ boss, a boss run is the **one run that carries a win target** — normal
> and Free-Play runs stay open-ended. Runs on the **live Beat Lab drum engine** (Space = kick, refilling
> snare/hat pads, Perfect/Good/Miss + combo, `countInThen`, `GROOVES` ghost overlays), so it's mostly a new
> *input-pressure + win/lose* layer over shipped systems. Two forks locked with the dev (2026-07-25):
> **call-and-response duel** format · **tug-of-war, retryable** fail-state.

**Fantasy.** Sandmar (Sand Kobold, a Sandman) is a **DJ lulling the crowd — and you — to sleep**. Rhythm is
wakefulness: you drum to stay awake and wake the room back up. His two story powers map straight to mechanics:
**rest symbols → sleep pressure** (the fail-state) and **gravity → timing warp** (his attack).

### The meter — his HP *and* your fail-state (one tug-of-war bar)

```
😴 Asleep  ◀————————[●]————————▶  Awake 🎉
```

Starts ~25% toward Awake. **Clean echoes + combos push Awake; misses + his hits pull Asleep; a passive sleep
aura always drifts sleepward** so you can't coast. **Win** = fill Awake (crowd roars, Sandmar defeated).
**Lose** = fill Asleep (you nod off) → **instant retry** (challenge-run framing — you lose the *fight*, not a
saved song). Reuses the vestigial `runThreshold`/`RUN_THRESHOLD` as the Awake target; `run.debuff='drowsy'`.

### The round loop — a call-and-response drum duel

Sandmar plays a short groove, shown as a **ghost overlay** (his *call*); you **echo it back live** over the
next bar. Echo scoring reuses the grooves-stage **OR-slot matching + Perfect/Good/Miss** windows: a clean echo
**staggers him** (a damage window) and lights the meter Awake; a sloppy bar lets the lull win it. *(Format
picked over "survival — hold one groove" and "freeform — just don't sleep"; it's the capstone **exam** of the
grooves the ladder taught.)*

- **Echo core + trade-fours flourish (defaulted — adjustable).** The fight is **Simon-says echo** for its
  teachable phases, with the **final phase turning into trading fours** (he plays a bar, you answer with your
  *own* bar) as the climactic flourish. *Open:* make the **whole** fight a freeform **trading-fours** jam
  instead (cooler set-piece, but scored on freeform-fit rather than the clean OR-slot echo) — flag if preferred.

### Three phases, escalating (reuse `GROOVES` as his calls + the "shown → memory" ramp)

1. **Warm-up** — four-on-the-floor echoes; introduces the **rest hex**.
2. **Groove** — backbeat / syncopated calls; adds the **gravity drag**.
3. **Nightmare** — clave-ish calls, **yawn blackouts**, combined attacks, and the **trade-fours** climax; final
   push to Awake.

### His debuff kit (every attack telegraphed, so it's fair)

- **Rest hex** ⭐ (sleep) — a rest glyph winds up over a drum lane, then **mutes that voice for a bar**
  (Sandmar *silences* a pad — weaponizing the rest symbol the Rests stage taught). You **reroute** to other
  pads; the grooves' **OR-slots** (a beat playable with snare *or* hat) keep it survivable. **Fairness rule:**
  his call **never requires the lane he just muted** (the same "never ask the unanswerable" guard M1's `newCall`
  uses for out-of-range accidentals).
- **Gravity drag** ⭐ (gravity) — a telegraphed **tempo sag / late-feel** for 1–2 bars; you resist by hitting
  **early** to stay on the true grid, and holding the groove through it **staggers him**. *(Held back: literal
  input latency / "heavy pads" — reads like lag/jank unless very clearly telegraphed; drag the *feel*, not the
  registration.)*
- **Yawn blackout** (sleep) — a brief sleepy-eyelid wipe **hides the ghost overlay/playhead for a beat**, so you
  echo from **memory** (calls back the grooves "shown → memory" ramp).

### Presentation

Desaturation + a **Zzz vignette** closing in as you near Asleep; color floods back on a clean streak; the
crowd cheers awake on the win. Sandmar's backing is a **slow, low, dreamy half-tempo lull**. Reuses
`countInThen`, the timing bloom / floating-rating juice, and a **boss variant of `renderRhythmEnd`** for the
win/lose screens.

### Capture reward — the Sandmar Muse "Gravity Groove"

Beating him **captures Sandmar as a Muse** (villains join on boss defeat — the planned earn path; Ranger's ♮ is
the template). *Gravity Groove* = his powers tamed: **steadies your tempo + widens the Good/Perfect windows a
hair** (gravity mastered = rock-steady time), and your **placed rests now give a small combo/score bump**
instead of nothing (his sleep-weapon becomes your syncopation tool).

### Where it sits & build reuse

- **Placement:** the M2 ladder is durations → rests → match → grooves → **free** → **Sandmar**, gating the jump
  to M3 (today `maybeAdvance` unlocks M3 past "free"; the boss slots in as the capstone before that unlock).
- **Reuse map:** the Beat Lab live engine (pads/timing/combo), `GROOVES` for his calls, `countInThen`, the
  ghost overlay (shown call → hidden for the echo), `run.debuff` + `runThreshold`, `renderRhythmEnd`. **New:**
  the tug-of-war meter, the three telegraphed debuffs (lane-mute / tempo-sag / overlay-hide), phase escalation,
  the trade-fours final phase, and the capture → add Sandmar to the Muse pool.
- **Open sub-decisions:** echo-only vs whole-fight trade-fours (above); phase count / length / difficulty
  tuning; whether the sleep aura scales with phase; exact `Gravity Groove` numbers.

---

## Morendo — the M3 Dynamics boss: "Scorch the Bones" (DESIGNED 2026-07-25, not built)

> **Status: DESIGNED; standalone MVP BUILT 2026-07-25 (`scorch-bones.html`).** The second fleshed-out boss
> (after [Sandmar](#sandmar--the-m2-rhythm-boss-the-lullaby-duel-designed-2026-07-25-not-built)) and the **most
> ambitious** — it goes **off-grid** into a first-person mini-game, becoming the game's **loudness set-piece**
> (sibling to Pitch Bird, whose **mic pipeline it reuses** — amplitude is *easier* to read than pitch). Morendo
> is the **M3 Dynamics capstone** (gating M4). Same boss template as Sandmar: one win-target run, telegraphed
> debuffs, capture → Muse; but a **new render surface + mic input**, so the biggest lift so far.
> `run.debuff='draining'`; Morendo's HP reuses the vestigial `runThreshold`.
>
> **MVP as built (`scorch-bones.html`, standalone — isolated like the Beat Lab / mujicians-compose prototypes,
> to feel-test before porting into `mujicians.html`):** the **full core loop** — mic loudness (`getUserMedia`
> → `AnalyserNode` RMS, reusing Pitch Bird's sample-rate-match + muted-gain graph), a **sensitivity slider** +
> live level readout for calibration, the **three zones** (silence / whisper / forte) with guide lines, the
> **fire as bottom peak-meter bars**, a distance-**scaling** 💀 sprite, the **wander → whisper-aggro (`!`) →
> approach** AI, **erupt-scorch-when-close** (flat damage) with a scare-off if blasted from afar, the **Breath**
> recharge gate, **Torch-light** life (strike flash) + darkness overlay, win/lose + retry, and a **no-mic
> keyboard/touch pump** fallback (hold Space). Tunables are constants at the top. **Scorch → flee-and-re-lure
> round loop (tightened 2026-07-26):** damage is **discrete — one clean scorch = one hit**, and `HITS_TO_WIN`
> (default **4**, a top-of-file tunable) defeats him. The first touch of fire lands the hit and **commits Morendo
> to bolting** — he sprints fully **offscreen** (`FLEE_SPEED`, sliding to a random side + fading into the dark)
> and goes **deaf to your whisper** for a short cooldown (`FLEE_COOLDOWN`), so the fight is a tight series of
> **lure → scorch → flee → re-lure** rounds instead of one continuous burn. **Not yet built (next
> steps):** the voice-steal → hidden-size p/mf/f **card quiz**, the three **phases** (feints), the old-PC
> **canvas** look, the **contrast-combo** (tentative), Crescendra's intro, capture → the "Dying Fall" Muse,
> and porting into `mujicians.html` as a real M3 capstone.

**Fantasy.** Morendo (skeleton; the marking *morendo* = "dying away") stalks a dark crypt, snuffing the light.
Crescendra taught you that a flame *flickers* — dynamic **contrast** is life — so you fight with fire and your
own voice: coax the skeleton close in near-silence, then flare **loud** to scorch him. The design's cleverness
is that the loop **is** the M3 lesson — the gameplay is maximum dynamic contrast (near-silence → BLAST) — and
it stays **voice-safe** because you're silent most of the time and only burst occasionally (a short forte, never
a sustained scream).

### The controller — loudness, mic-default

- **Input = live amplitude** (voice / **harmonica** / **piano** / clap — source-agnostic), read off Pitch Bird's
  mic pipeline. **Mic is the default** (it's the fun of it); an **opt-out** swaps to a **tap-pump** (soft taps =
  lure, a hard burst = erupt) so the fight is fully playable silently / mic-less.
- **The three mic zones ARE the three dynamic levels** — the pedagogical spine:
  - **Silence** (a **rest**) → Morendo wanders, oblivious, drifting away.
  - **Whisper** (***piano***) → an **!** pops over his head (classic stealth aggro tell) and he turns and
    **approaches you**. The whisper literally *is* the piano lesson.
  - **Loud** (***forte***) → the **fire erupts** (below). The blast *is* the forte lesson.
- **Crescendra's intro** carries the **pianoforte** hook: the piano is *named* for this soft/loud control
  (Cristofori's "gravicembalo col piano e forte"), so "grab a piano or harmonica if you've got one" lands
  in-world *and* is the safest controller.

### The fire — a peak meter, not a projectile (dev call 2026-07-25)

The flames are **peak-meter bars rising from the bottom edge of the screen = your true, live loudness** (a
direct, satisfying correlation to how loud you actually are). **You don't hurl fire — he walks into it.** The
blaze is **local to you** (your hearth/torch roaring up in the foreground) and **short-range**, so **he must be
close to burn**. Luring him in is the risk; the payoff is the scorch.

### The loop — lure, let him close, erupt

- **Whisper to aggro** (he's oblivious in silence; keep coaxing).
- **Let him come close** — the fire is short-range, so he has to be right on you to burn.
- **Erupt (forte) in range** — the peak bars shoot past the **forte line** and the local blaze **scorches him
  where he stands** (flat scorch damage — MVP). Blasting while he's **far** flares an empty fire (whiff) **and a
  skeleton is wary of fire, so it can scare him back to wandering** — you re-whisper and start over. Teaches
  patience + real control, not noise-spam.
- **Breath / Ember recharge (your "mana")** — every erupt spends a **Breath meter** that refills over time;
  empty = you can't flare and you're **exposed** while it recovers. Rations loudness (**voice-safe**) and makes
  each flare a real decision. *(Dev liked the recharge — "like MP, you can't just scream as much as you want.")*

### Meters (boss-standard, retryable)

- **Morendo's HP** — he **chars/cracks** as you scorch him (reuses `runThreshold`). Empty → banished (win).
- **Torch-light = your life** — he **strikes it when he reaches you**; the scene darkens as it drops; fully dark
  → torch gutters out, **you lose → instant retry**.
- **Breath / Ember** — the recharge gate on erupting.
- Distance + breath are the live tensions between his HP and your life.

### His signature debuff — "he steals your voice" → the notation quiz

Periodically Morendo **hushes** you (mutes the mic for a stretch). The **cards stand in** — dealt as
**p / mf / f with their size cue hidden** — and they map to the **same three verbs**: **p = whisper/lure ·
f = erupt · mf = a weak middle.** To scorch you must **remember which symbol is loud** and play **f**; pick
**p** thinking it's loud and you fizzle while he advances. The **mic layer tests dynamics as *feel***, the
**card layer tests it as *notation*** — same three levels, both ways. (Also a graceful fallback if a mic flakes.)

### Three phases (escalating)

1. **The Wander** — he drifts; learn whisper-to-aggro → let-close → erupt. Wide windows.
2. **The Hush** — faster approach; introduces the **voice-steal card quiz**.
3. **The Reckoning** — frenzied rushes, **feints**, combined hush + rush; a point-blank forte (or a resonant
   building crescendo) shatters his bones to dust.

### Presentation

**First-person old-PC dungeon-crawler** view (Wizardry / early-Doom — dithered, limited palette, optional CRT
scanlines): you face down a dark crypt corridor, your **torch-fire fills the bottom foreground** (the peak
meter). **Morendo is a scaling sprite — tiny in the distance, looming huge as he nears.** The scene **darkens**
as your torch-light drops (he thrives in the dark); a forte flare floods light and reveals him.

### Capture reward — the Morendo Muse "Dying Fall"

*(named for the poetic "dying fall" — a fading cadence.)* His hush, tamed into expression: grants a controlled
**fade-out phrase ending** (end on an intentional decrescendo) **plus a dynamic-contrast bonus** — fitting,
since the whole fight rewarded contrast. Mirrors Sandmar's "weapon → your tool."

### Placement, reuse & scope

- **Placement:** M3 Dynamics capstone, gating M4. (If M3 grows a lesson ladder like M1/M2, the boss sits at its
  end.)
- **Reuse:** Pitch Bird's **mic pipeline** (amplitude), the **card system** for the quiz (just suppress the
  size overlay), the mentor/intro, `run.debuff` + `runThreshold`, a boss end-screen.
- **New (bigger than Sandmar):** the **first-person scaling-sprite render surface** (a self-contained little
  canvas), the **amplitude → scorch** mapping, the **approach AI** (wander / aggro-on-whisper / rush / feint),
  the **Breath recharge**, phase/meter logic, and capture → add Morendo to the Muse pool. It's the game's
  **loudness set-piece**, which justifies the lift.
- **Open sub-decisions:** **contrast-combo layer** *(tentative)* — chaining clean whisper→erupt→whisper→erupt
  for a rising damage multiplier (scores *range*, not raw volume — very on-theme), held for after the flat-damage
  MVP; feint/"hit-the-tell" depth; exact recharge/HP/range tuning; whether the finisher is a point-blank forte
  or a true building crescendo (needs a continuous-swell read, vs. the discrete p/mf/f model today).

---

## Slurry — the M4 Melody boss: "Stepping Stones" (DESIGNED 2026-07-25, not built)

> **Status: DESIGNED, not built.** The third fleshed-out boss (after [Sandmar](#sandmar--the-m2-rhythm-boss-the-lullaby-duel-designed-2026-07-25-not-built) and [Morendo](#morendo--the-m3-dynamics-boss-scorch-the-bones-designed-2026-07-25-not-built)),
> and the game's **pitch set-piece** — it introduces **voice-pitch control** (Pitch Bird's mechanic + detection
> pipeline). Slurry is the **M4 Melody capstone** (gating M5). Same boss template: one win-target run,
> telegraphed debuffs, capture → Muse. Modality is distinct from the other two: **Sandmar = timing (drums),
> Morendo = loudness (mic amplitude), Slurry = pitch (mic pitch).** `run.debuff='smear'`; Slurry's HP is the
> crossing progress (see meters).
>
> **Extra element beyond a plain pitch-platformer (dev keeper 2026-07-26):** **Cantrip's garments = scales/modes** — his graphic-novel power (gain a skill by wearing someone's garment; impart a skill into a garment for others) becomes a **swap-a-scale-to-bridge-the-gap** puzzle layer (see *Cantrip's garments = scales & modes*). The **platformer is the MVP**; the garment/mode system is the second pass that gives M4 its own identity.

**Fantasy.** Slurry (shapeshifting blob) **smears distinct pitches into legato mush**; the hero **Cantrip**
(goblin) teaches the opposite — a clean line **hopped stone to stone across a stream** (M4's stepwise melody).
So the fight's core skill is the anti-mush: **hitting clean, discrete pitches** with your voice. Water element
throughout (melody = water; a slurry is sludge). This makes Slurry the **pitch** sibling to Pitch Bird, the way
Morendo is the loudness one.

### The controller & core loop — sing the stone's pitch to hop

- **Side-scrolling stream; pitch = height** (Pitch Bird's voice-pitch-to-vertical-position). A line of **stones**
  spells a **melody** — each stone sits at the vertical position of **its pitch**.
- **Pitch-accuracy on discrete targets (dev call — no glide detection).** Sing a stone's pitch (match within a
  tolerance window) and Cantrip **hops** to it; land the whole line to cross. Slurring/gliding simply **fails to
  land** you — you slip into the water where Slurry waits — so the slur is punished *implicitly*, no
  hop-vs-slur re-articulation detection needed for the MVP. *(That deeper "reward clean re-articulation" read
  stays a tentative future layer.)*
- **Stepwise-favoring melody** (small hops) with occasional **leaps** (bigger pitch jumps), so **intervals** get
  taught naturally.
- **Cantrip is an active ally**, not just an intro: he **hops a stone ahead** demonstrating the line and **hums
  the blurred note** to give you an ear reference (below).

### Cantrip's garments = scales & modes — the extra element (dev keeper 2026-07-26)

**The hook (from the graphic novel):** Cantrip's power is that he **absorbs a person's skills by wearing a piece of their clothing/armor**, and he can **imbue a garment with an ability and hand it to someone else** to grant them that same power. Map that onto **scales/modes**: a **garment *is* a scale**. Donning one **re-tunes the whole crossing to that mode** — changing its colour/mood *and* reshaping **which stepping-stones exist**. This is the element that lifts M4 above a plain pitch-platformer: **reading a gap and choosing/swapping the right garment (scale) to bridge it** is a music-theory puzzle laid over the singing, and the mechanic *is* the lesson (you learn a mode by its defining note because that's the note that drops the stone you need).

**How it layers on the platformer:**
- The stream is **set in a mode**, and the **stepping-stones are that scale's degrees** — the garment defines the "keyboard" you sing on. An in-scale pitch → a stone is there to land on; an out-of-scale pitch → open water (you fall).
- **A gap is only bridgeable in the right garment.** See the gap → pick the mode whose **characteristic note** puts a stone where you need it → sing the line. (Primary design: swapping garments **changes the stone layout / opens alternate paths** — the navigation puzzle. A lighter alt — garment only constrains which pitches are "safe" on a fixed path — is in *Open sub-decisions*.)
- **Cantrip imparts garments to you** (the teaching path): he hands you a mode-cloak before a section; in the deferred party layer he can **impart one to an ally** who crosses a parallel path — his give-to-others power.

**The garments (real modes, correct characteristic notes):**

| Garment (scale) | Real mode | Characteristic note(s) vs. major | Feel / what it unlocks |
|---|---|---|---|
| **Pentatonic poncho** | major/minor pentatonic (5 notes) | *no half-steps — no "wrong" note* | the beginner garment: forgiving, clash-proof crossings (great MVP default) |
| **Ionian coat** | major | — (the reference) | bright; the default path |
| **Aeolian cloak** | natural minor | ♭3 ♭6 ♭7 | dark path; minor-only stones |
| **Dorian jerkin** | Dorian | ♭3 ♭7, **natural 6** | hopeful-minor; a raised-6th stone Aeolian lacks |
| **Lydian mantle** | Lydian | **♯4** | floating/"magic"; a high ♯4 stone reaches a ledge nothing else can |
| **Mixolydian vest** | Mixolydian | ♭7 | bluesy/folk; a lowered-7th bridge stone |
| **Phrygian shawl** | Phrygian | ♭2 ♭3 ♭6 ♭7 | Spanish/dark; a low ♭2 stone |
| **Locrian rag** | Locrian | ♭2 ♭5 … | unstable (the diminished mode) — a late/hazard garment |

*(Pentatonic + Ionian + one minor mode are plenty for the first pass; the rest ramp in — and this is the real modes taught by their **one** defining note, the same "accuracy layer" spirit as Tritony's metals.)*

**Slurry vs. the garments (her conflict, made mechanical):** Slurry is a formless blob — *no distinct identity* — the exact opposite of Cantrip, who *is* the identities he wears. So her attacks target the wardrobe:
- **Soak** — she dissolves your current garment; you're briefly **bare** (chromatic / no safe stones) and must **re-don** one under pressure.
- **Smear the mode** (extends her shipped *blur-the-note*) — she muddies *which* scale you're wearing, so you identify the mode **by ear** (Cantrip's hum + the stones' colour) before you can trust the path.

**Collectible payoff — the Wardrobe:** clearing each mode-gated crossing adds that garment to a **Wardrobe** (a collection, sibling to the Codex / Sound Collective), and cleared modes become **selectable garments in Free Play** (a scale-choice loadout). So the boss *teaches* the modes and the collection *keeps* them. (Slurry's capture Muse — tamed portamento + smooth-stepwise bonus — is unchanged and stacks with this.)

**MVP vs. this layer:**
- **MVP = the platformer** (sing-pitch-to-hop across stones, flood fail-state) in a **single forgiving scale** (pentatonic or major) — no garment-swapping yet.
- **This extra element** (garments = modes, swap-to-bridge-gaps, Wardrobe, Slurry's soak/smear) is the **second pass** that gives M4 its own identity.
- **Deferred:** the **impart-to-an-ally** party path (Cantrip's give-to-others power → a co-op / parallel-path layer; ties to the deferred Mujicians party angle).

### Slurry's signature debuff — Blur the note (dev keeper)

She **smears an upcoming stone so its pitch/height is hidden** — you must **sing it by ear** from the melodic
context (Cantrip's hum + the line's direction). This is **M1 ear-training paying off inside a melody**, and
it's her defining move — the mush turned into a puzzle. (Parallels Morendo's blackout / Sandmar's yawn.)

**Support debuffs (escalate later):** **Flood** — rising sludge adds pace and forces you to keep moving /
ascend; **Shapeshift splash** — the path reshapes suddenly. *(The earlier "slur-pull / don't-follow-the-
glissando" ideas are held **tentative** — they lean on the glide-detection the MVP skips.)*

### Meters (boss-standard, retryable)

- **The Crossing = Slurry's HP** — each stone cleared **cleanly advances you across *and* dissolves her**
  (progress **is** damage); completing the line → a final clean phrase pops her.
- **Flood = your fail-state** — misses/falls **raise the sludge**; if it engulfs you, you're smeared → **instant
  retry**.
- **Pace (dev default):** mostly **self-paced** early (hop when ready); the **flood** is the pressure that
  **ramps in later phases** — not timed from the start.

### Three phases (escalating)

1. **The Crossing** — gentle stepwise stones; learn sing-to-hop. Wide windows, self-paced. *(Garment layer: the **pentatonic poncho** — clash-proof.)*
2. **The Murk** — introduces **blur-the-note** (ear); wider **leaps**. *(Garment layer: the first **mode-swap** — a gap only the right garment bridges.)*
3. **The Flood** — rising sludge for pace, rapid blurs, a shapeshift or two; a final **ascending clean phrase**
   to pop her. *(Garment layer: Slurry's **soak** — she strips your garment mid-crossing.)*

### Fallback layer (mic-less / robustness)

When she **gloops your voice** (mic muted/muddled), drop to **note cards** and trace the melody by **interval**
— is the next stone a *step* or a *leap*? Melody as *reading*, mirroring Morendo's card-quiz and giving a
mic-less path.

### Capture reward — the Slurry Muse (tamed slur)

Her slur becomes **yours as expression**: a **controlled portamento / glissando** tool (the *good* use of a
slide) plus a **smooth-stepwise / scale-run bonus**. **This resolves the character-Muses section's open "where
does Slurry's old legato bonus live" question — it lands here, on her capture** (not on Cantrip). Mirrors
Sandmar/Morendo's "weapon → your tool."

### Placement & reuse

- **Placement:** M4 Melody capstone, gating M5.
- **Reuse:** Pitch Bird's **pitch-detection** pipeline + note math, the mentor/intro, `run.debuff`, a boss
  end-screen. **New:** a **2D side-scroll render**, a **stone-spawner** that lays a melody out by pitch-height,
  **pitch → hop** landing detection, the **blur** debuff, the **flood**, and the meters. **Second pass:** the
  **garment = scale/mode** system (a scale registry → per-mode stone layouts, garment-swap UI, the Wardrobe
  collection, Slurry's soak/smear) — see *Cantrip's garments = scales & modes*.
- **Open sub-decisions:** exact pitch tolerance / hold time to "land"; flood ramp + fall penalty tuning; melody
  source (authored lines vs. generated stepwise); whether Clarity⟷Mush is ever preferred over cross-and-chip;
  reviving the tentative slur-pull / glissando-resist debuffs once (if) glide-detection is added; **for the
  garment layer:** does a garment-swap **change the stone layout** (navigation puzzle — primary) or only
  constrain which pitches are "safe" on a fixed path (lighter alt); how you swap (a wheel/menu vs. Cantrip
  hands them at fixed points); how many modes in the first non-MVP pass; whether the Wardrobe feeds Free Play.

---

## Tritony — the M5 Harmony boss: "The Devil's Forge" (DESIGNED 2026-07-25 · **core-loop MVP BUILT 2026-07-26 in `forge-quench.html`**)

> **Status: standalone core-loop MVP BUILT** (`forge-quench.html`, the Morendo/`scorch-bones.html` precedent — isolated to tune feel before porting into `mujicians.html`); the full campaign-integrated boss is still designed-not-built. The fourth fleshed-out boss (after [Sandmar](#sandmar--the-m2-rhythm-boss-the-lullaby-duel-designed-2026-07-25-not-built), [Morendo](#morendo--the-m3-dynamics-boss-scorch-the-bones-designed-2026-07-25-not-built), [Slurry](#slurry--the-m4-melody-boss-stepping-stones-designed-2026-07-25-not-built)). Tritony is the **M5 Harmony capstone** (gating M6). It **breaks the pattern of the first three on purpose:** those are all **off-grid, monophonic, mic-driven** set-pieces — Sandmar = timing, Morendo = loudness, Slurry = pitch — i.e. the three *horizontal, single-line* modalities. Harmony is the **vertical** axis (simultaneity, intervals, consonance vs. dissonance), so this fight is a **craft / assembly puzzle** — an **Opus-Magnum-style forge** where you **stack tones into chords** — **not** a fourth mic game and **not** the note-grid. Same boss template as the others: one win-target run, telegraphed attacks, retryable, capture → Muse. `run.debuff='dissonant'`; Tritony's HP reuses the vestigial `runThreshold`.
>
> **Two forks locked with the dev (2026-07-25):** (1) **MVP = a linear stack-builder** — pick ops in order → **Run** → strike-test the chord; the fuller **spatial** Opus-Magnum contraption (placeable arms/tracks you program) is deferred — **but the MVP must carry real puzzle difficulty** (a two-click "M3 then m3" recipe isn't a puzzle), so the challenge comes from **composable primitives + economy/optimization scoring + a heat budget + avoid-the-flaw** (see *The puzzle*). (2) **Build-to-spec orders first** ("forge a *minor* triad on this root"); **resolve-the-tritone orders are tentative** (a phase-3 climax / later layer, since they lean on the Temper piece the base MVP can otherwise defer).
>
> **MVP BUILT 2026-07-26 (`forge-quench.html`, standalone).** *First cut was immediate-apply (weld tone-by-tone, Quench). **Reworked same day 2026-07-26 into the real Opus-Magnum "program-the-machine" model** per dev ("make it more like Opus Magnum / a computer program — choose in advance, can't step through; bonus for one compiled run; add more piston-style variables like grinding/acid-etch").* The current build:
> - **Program-then-run (the OM identity):** you lay an ordered **instruction tape** (a "smithing pattern") from a **glyph palette**, **◌ Draft** it freely (a blue **ghost preview** of the resulting chord + would-ring/would-crack readout, *no score*), then **🔥 Forge** it **once** — an **arm walks the tape**, welding each tone with sound, ending in the strike-test. No step-by-step committing.
> - **Glyphs (data-driven `OPS` registry, each = one theory concept):** ⚒ **+M3 / +m3** (stack a major/minor 3rd), 🔧 **Temper ▲▼** (nudge the top chord tone ½-step — compose thirds / leading tones), 🪨 **Grind** (invert — lift the lowest tone an octave), 🧪 **Etch** (add a 7th color → triad→7th), 🔥 **Anneal** (resolve — snap the injected tritone flaw onto its nearest chord tone; the flaw antidote). Keys `a s . , g e n`.
> - **Stack = tagged tones `{m,flaw}`** so hammers build on **chord** tones (not the flaw) and Anneal cleanly resolves the flaw.
> - **Build-to-spec orders:** quality × root × metal, **+ voicing/inversion spec** (phase ≥2 sometimes demands a specific bass note → gives Grind a job) + a live recipe hint + **ghost target silhouette**.
> - **Opus-Magnum optimization scoring → damage:** the strike-test rewards **Cost (heat) · Cycles (swings vs `parCycles`) · Parts (distinct glyphs)**, plus a **Single-Heat bonus** (+0.2 mult) for forging without a re-heat; masterwork = at/under par cycles and combined `mult ≥ MW_MULT 1.8`. `HEAT_BUDGET 16` caps the tape.
> - **Flaw-injection debuff** (phase ≥2, `root+6` tritone welded on the ingot — skipped when the target legitimately holds it, e.g. diminished; **Anneal** resolves it), **gentle cooling** (`COOL_MS 34000`; cooling only forfeits the Single-Heat bonus, no wipe), **3 HP-gated phases** (major/minor → +dim/aug+flaw+inversions → dom7 finisher), **Tritony HP / Torch (3 lives)** with hurt/attack/shake juice + ring/crack FX, **win/lose→retry** with the *Devil's Bargain* capture line. Reuses `classify`/`TRIADS`/`SEVENTHS` + `VOICES`/`playVoice` (5 real instrument metals → voices: brass=reedorgan, bronze=glassbell, steel=grand, aluminum=vibraphone, silver=warmpad).
> - **Recycling / salvage layer BUILT 2026-07-26** (dev keeper — *Forged in Fire* "repurpose the rusted leaf-spring" + the **Recycled Orchestra of Cateura**; see the *Recycled Orchestra* framing below): you forge from **salvaged junk, not clean metal**. The metal palette became a **recycled-instrument `SOURCES` palette** (oil drum→steelpan, tin cans→can guitar, bent forks→mbira, PVC pipe→pan-pipe, glass bottles→bottle xylophone — each a real recycled instrument → a `VOICES` timbre, still the M5→M6 bridge). Each order's scrap spawns with **defects** (rust/dent, `DEFECTS`) that make it **brittle → a 2nd fail-source** (cracks regardless of the chord) until repaired with two new **salvage glyphs 🧽 De-rust / 🔨 Straighten** (keys `1`/`2`; they clear a defect, cost heat+cycles, only enabled when their defect is present); `parCycles` includes the repairs; a **♻ Redemption bonus** (`run.defects.size × 0.15` on the mult) rewards reviving worse scrap. Theme rhyme: **resolve-the-dissonance = redeem-the-discard** (Anneal the tritone ≈ restore the junk). Defects are capped (phase 1 ≤1, else ≤2; trimmed to 1 when a flaw is also injected).
> - **Deferred (next passes / port):** the **spatial** contraption (placeable arms/tracks/pistons in 2D, per-arm tapes) — the tape is the linear precursor; the **wider glyph catalog** brainstormed with the dev (Draw/Upset voicing-spread, Fold octave-double, Punch omit-5th, Pin fifth-frame, Project-via-quicksilver 7ths, reagents charcoal/flux/aqua-fortis); **cadence "V7→I" two-chord orders**, boss-blind constraint orders, forge-by-ear; the **Re-melt salvage glyph** + more junk sources/defect types; a **persistent cross-run scrap heap** (Tips-shop/loadout tie-in); the alloy-ratio metallurgy puzzle; weapon-silhouette art; White-Heat streak; her live counter-forge/telegraphed volleys; and campaign wiring (`run.debuff='dissonant'`, `runThreshold` HP, mentor intro, screen routing, capture → Muse pool).

**Fantasy.** Tritony (the band's fallen leader; the **tritone**, *diabolus in musica* — the dissonance the whole movement is set against) fights at a **forge**, since M5's element is **metal**. The design's central metaphor: **an alloy *is* a chord** — several metals melted into one material, exactly as several notes sound as one. You smith weapon-instruments by folding tones together; **consonant blends forge a sound weapon that rings true when struck; dissonant blends come out brittle and crack** (the *Forged in Fire* "there's a *crack* in your blade — you're out" test). Tritony is forged of pure dissonance, so you can only shatter her with weapons that **ring**.

### The Recycled Orchestra — the connective theme (dev keeper 2026-07-26)

The **connective tissue between Tritony and the four Harmony heroes** (Miner Minor / Mage Orc / Demonish / Augminotaur — the band she once led) is that they were a **Recycled Orchestra**, inspired by the real [Recycled Orchestra of Cateura](https://en.wikipedia.org/wiki/Recycled_Orchestra_of_Cateura) (Paraguayan kids who build instruments from a landfill) crossed with *Forged in Fire*'s "repurpose this rusted scrap" craft. The story spine: **they were five who built every instrument out of garbage, because *nothing is truly junk — even the devil's interval can be made to sing.*** Tritony *taught* them that, then fell — hoarding the good salvage and turning the forge to **weapons**. Beating her **reclaims the forge for music**. This makes the movement's harmony lesson and its story the same idea: **resolving a dissonance = redeeming a discard** (Anneal the tritone ≈ restore the junk). Mechanically it's the built salvage layer (recycled-instrument `SOURCES`, defect repair, redemption bonus — see the MVP notes above). The four heroes each read as a salvage craft + a triad quality: **Miner Minor** (minor) = the scavenger who *finds* the scrap · **Mage Orc** (major) = the smelter who re-melts it bright · **Demonish** (diminished) = works the tense "devil's offcuts" · **Augminotaur** (augmented) = crushes/hauls the big heavy junk — the deferred "heroes-as-allies at the anvil" angle. **Accuracy keeper:** use *real* recycled-orchestra instruments (oil-drum steelpan, tin-can guitar/violin, fork mbira, pipe flute, bottle xylophone), the same "teach it true" discipline as the metals table.

### The core loop — stack thirds to forge a chord (and the theory is free)

Every triad is **two thirds stacked**, and *which* thirds decide the quality — so the mechanic teaches chord quality almost automatically, because you physically choose which third to hammer on:

| Weapon quality | Recipe (root → top) | Reads as |
|---|---|---|
| **Major** ☀️ | major-3rd, then minor-3rd | bright, balanced — a gleaming leaf-blade |
| **Minor** 🌙 | minor-3rd, then major-3rd | dark, somber — a curved saber |
| **Diminished** 💀 | minor-3rd, then minor-3rd | tense — *contains the tritone* — a jagged serrated dagger |
| **Augmented** 🐂 | major-3rd, then major-3rd | overreaching, unstable — an oversized greathammer |

Tritony's "order" hands you a **root ingot** — the bass tone to forge onto (this **is** the shipped M5 call: *"a single tone to forge onto → build the chord that fits it,"* scored by consonance). You stack tones on top, **Quench**, then **strike-test**: the finished weapon **plays its chord** (reuses the game's chord audio) — a consonant, on-spec weapon **rings clean and holds** (full damage to Tritony); a dissonant / un-tempered-tritone weapon **buzzes, cracks, and shatters** (the blow whiffs, she hits back). Because every weapon rings when struck, each is a **weapon-instrument combo**, and a player can **read the theory off the silhouette** (major blade vs. jagged dim dagger vs. augmented greathammer).

### Real metals & alloys — the accuracy layer (dev keeper 2026-07-26)

The metals aren't arbitrary flavor — use the **actual metals and alloys instruments are made from**, so the forge teaches metallurgy the way the stack teaches harmony. Two axes, kept separate and honest:

- **The chord = the weapon's *pitch* (harmony)** — stacking thirds → consonance + quality (above). Unchanged.
- **The alloy = the weapon's *timbre* (voice) — and the M5→M6 bridge.** You forge the chord *out of* a real instrument metal, and it **rings in that metal's voice** — brass → trumpet-bright, bronze → bell/cymbal, aluminum → vibraphone, steel → piano-wire, silver → flute. This literally hands the player into **M6 Timbre** (the shipped `VOICES` registry / `playVoice`) at the exact moment the campaign moves there.

| Alloy / metal | Real recipe | Instruments | Voice it forges |
|---|---|---|---|
| **Brass** | copper + zinc (~70/30) | trumpet, trombone, horn, tuba, sax bodies | bright, brassy, projecting |
| **Bronze** | copper + tin | bells, gongs, wound strings | warm, resonant, long sustain |
| **Bell bronze (B20)** | ~80% Cu / 20% tin | cymbals, orchestral & hand bells | shimmering, complex ring — *near-brittle by design* |
| **Nickel silver** | copper + nickel + zinc (*no actual silver*) | student flutes, cornets, frets | mellow, even, "silvery" |
| **Sterling silver** | ~92.5% Ag + copper | pro flutes | warm, rich |
| **Gold** | gold (plating or karat alloy) | pro flute plating, mouthpieces, reeds | dense, warm, prestige |
| **Aluminum** | aluminum | vibraphone bars | ringing, mellow, sustaining |
| **Steel (high-carbon)** | iron + carbon | piano wire, guitar strings, glockenspiel, saw | bright, hard, cutting |
| **Phosphor bronze** | copper + tin + trace phosphorus | acoustic guitar & harp strings | warm, complex overtones |
| **Titanium / platinum** | Ti / Pt | modern & ultra-pro flutes | Ti = light/fast · Pt = dark/powerful |

- **The metallurgy puzzle (a second craft axis — DEFERRED past MVP).** To *make* an alloy you fold **base metals in the right proportion** — copper+zinc → brass, copper+tin → bronze — and a **wrong ratio yields a brittle ingot that cracks on the strike-test regardless of the chord** (a second fail-source, parallel to dissonance). Real backing that keeps it honest, not arbitrary: **bell bronze sits deliberately near the brittle edge (~20–23% tin) *because* that near-brittleness is what lets it ring** — so the game's "brittle-but-rings" trade is literally how bells are made. It's a very Opus-Magnum second optimization axis (combine elements to spec), and orders can then demand **both** — e.g. *"forge a **minor** triad in **bell bronze**"* (harmony **and** metallurgy) — but it stays out of the first cut.
- **MVP inclusion (lean but accurate):** the **root ingot is a real instrument metal that sets the weapon's timbre** (a `VOICES`-backed audio/visual reskin — brass / bronze / aluminum / steel / silver), pure flavor + timbre in the first cut; the **alloy-ratio mixing puzzle is the deferred second axis** above.
- **Colour note (flavor only, not a mechanic):** real metals have signature colours (gold, coppery bronze, yellow brass, blue-grey steel, white nickel/silver) — good for the ingot/weapon art, but kept **off** the ROYGBIV note-colours, which already encode pitch (don't overload the colour channel).

### The Opus-Magnum bones (what transfers)

- **A palette of parts** you place, and **a sequence you assemble, then press ▶ Run** — an "arm" walks your sequence, welding each tone on in turn (each strike sounds its note; the finished stack rings the full chord).
- **Optimization = quality.** Fewer, cleaner strikes forge a **masterwork** (big damage); a sloppy/over-worked path forges a merely **serviceable** weapon (less). This is the Zachtronics "can I do it more elegantly?" itch, and it maps straight onto the game's existing **Balatro chips×mult** scoring — **elegance → damage**.

**The parts (MVP core = the two hammers + Quench; the rest are the "piston" layer, deferred):**
- **⚒ +M3 / +m3 hammers** (core) — weld a major / minor third above the current top tone.
- **⚒ Temper ±1** — nudge the top tone a **half step**: the voice-leading tool that **resolves a dissonance** or adds a leading tone (and the antidote to her flaw attack).
- **↻ Invert** — octave-flip the bottom tone up (teaches **inversions**; changes the weapon's balance).
- **⛓ Fifth-frame** — clamp on the perfect fifth: the stable frame/guard.
- **🗡 7th-barb** — stack one more third → a **7th chord** (a barbed weapon; ties to the M5→M6 stack-cap growth).
- **🔥 Quench** — finalize and lock for the strike test.

### The puzzle — where the difficulty lives (dev keeper 2026-07-25)

The MVP is a *linear* builder, but it must feel like a puzzle, not a recipe. Four difficulty sources, none of which need the spatial contraption:

1. **Composable primitives, not ready-made answers.** Orders go beyond plain root-position triads — a **specific inversion / voicing**, a **7th**, or landing the exact perfect fifth — so reaching the target is a small reasoning + ordering problem (which ops, in what sequence), the way an Opus-Magnum arm program is. **Difficulty dial (deferred hard mode):** strip the ready-made **+M3** so a major third must be *composed* (`+m3`, then `Temper +1`) — which also surfaces the tritone lesson mechanically, since **two stacked minor thirds = a diminished fifth (6 semitones = a tritone)**, and you must Temper the top **up** to reach a consonant perfect fifth (7). Her own interval is literally the thing you learn to temper.
2. **Economy / optimization scoring (the Opus-Magnum soul).** chips×mult on **strikes used · heat spent · cleanliness**; a valid weapon just gets you by, a **masterwork** (minimal, elegant) does the real damage → replay depth and the "can I do it in fewer moves?" pull.
3. **A heat / energy budget per weapon.** Each op costs heat; you can't brute-force by hammering endlessly. The budget is the puzzle pressure (and keeps the arm from being a slot machine).
4. **Avoid-the-flaw.** The stack must ring **consonant** — a wrong path that leaves an **un-tempered tritone** cracks the weapon on the strike test, so the *path* matters, not just the endpoint. (This is also the seam for the tentative **resolve-the-tritone** order framing.)

### Her signature attack + phases (boss template)

- **⚡ Flaw injection (signature debuff, `run.debuff='dissonant'`)** — mid-forge she **cracks a tritone into your workspace**: a flaw-tone welds itself onto your stack, and if you **Quench without Tempering it out**, the weapon shatters. Her weapon (the devil's interval) turned into *your* puzzle — the exact parallel to Sandmar's rest-hex / Morendo's hush / Slurry's blur.
- **🔥 Cooling** — a light time pressure: the ingot cools, so you can't dawdle forever (not a twitch layer — the forge, not a metronome).

**Three phases (escalating):**
1. **The Forge-fire** — forge plain **major/minor** triads on a given root; learn the two hammers + the strike test. Wide, self-paced.
2. **The Flaw** — **diminished/augmented** targets appear, and she begins **injecting tritone-flaws** you must Temper out (introduces the piston layer).
3. **The Devil's Interval** — she forges tritone-weapons *at* you; you out-forge her with consonant masterworks, and the finisher is forging the one weapon that **resolves her** — a **dominant-7th that pulls to the tonic**, shattering her on the cadence (tension → release ends the fight — the ideal harmony payoff).

### Meters (boss-standard, retryable)

- **Tritony's HP** — she **cracks and dulls** as your sound weapons land (reuses `runThreshold`). Empty → shattered (win).
- **The forge / your life** — a botched strike (a cracked weapon) lets her strike back; enough failed forges → the fire goes out, **you lose → instant retry** (challenge-run framing — you lose the *fight*, not a saved song).
- **Heat / budget** — the per-weapon economy gate (see *The puzzle* #3).

### Capture reward — the Tritony Muse "The Devil's Bargain"

Beating her **captures the tritone, tamed** ("weapon → your tool," like the others). *The Devil's Bargain* = a **controlled tritone / dominant-function** tool: play a tension note (or a diminished/dominant colour) that **resolves** and you bank a big bonus — and/or it **unlocks the 7th-barb** in normal runs. Her dissonance becomes your most powerful cadence. Mirrors Sandmar's "Gravity Groove" / Morendo's "Dying Fall" / Slurry's tamed portamento.

### Placement, reuse & scope

- **Placement:** M5 Harmony capstone, gating M6. Mage Orc (major) / Miner Minor (minor) — with Demonish (dim) / Augminotaur (aug) surfacing as their qualities come up — narrate the intro and, in fiction, hand you the recipes at the forge (the deferred party angle: heroes-as-allies at the anvil).
- **Reuse:** the game's **chord classifier + consonance scoring** (`classify` / consonance term), the **chord audio** (the strike-test *is* sounding the stack), the **`VOICES`/`playVoice` timbre system** (real instrument metal → its voice — the M5→M6 bridge, see *Real metals & alloys*), the mentor/intro system, `run.debuff` + `runThreshold`, a boss end-screen. **New:** the **forge render surface** (a self-contained little canvas/DOM stage), the **op-sequence → stack** builder, **economy scoring**, the **heat budget**, the **flaw-injection** debuff, phase logic, and capture → add Tritony to the Muse pool.
- **Distinct modality:** Sandmar = timing · Morendo = loudness · Slurry = pitch · **Tritony = harmony (chord-forging / consonance)** — the vertical axis, on a craft-puzzle surface rather than a mic.
- **Open sub-decisions:** MVP fidelity beyond the linear builder (when/whether to add the spatial contraption); exact **heat budget / economy weights / masterwork thresholds**; whether the composable-primitives *hard mode* (no ready-made +M3) is the default or a later dial; how much of the **piston layer** (Temper/Invert/Fifth-frame/7th-barb) lands in the first non-MVP pass; whether **resolve-the-tritone** graduates from tentative to a real phase-3 mode; weapon-silhouette art; and the party/heroes-at-the-anvil layer (deferred).

---

## Wormwood — the M6 Timbre boss: "Wormwood's Choir" (DESIGNED 2026-07-26)

> **M6 BOSS SLOT NOW FILLED (2026-07-29) — by Critter Hunt, not this "Wormwood's Choir" set-piece.** The M6
> Timbre boss that actually ships is the **[Critter Hunt](critter-hunt.md)** Murdle-style deduction game — i.e.
> the **[Choir Line-Up deduction variant](#variant--the-choir-line-up-a-murdle-style-deduction-layer-design-fork-not-the-locked-mvp)**
> below, grown into its own standalone game (`critter-hunt.html`) and **wired in as the boss via link-out**. M6 is
> a **capstone**: clear the timbre-**blend** lesson gig (Timbrewolf's tutor) → `persist.progress.timbreStage`
> flips `"lesson"→"boss"` (instead of unlocking M7) → the Home/win-screen Campaign button becomes **🐺 Boss —
> Unmask Wormwood** and launches `critter-hunt.html?boss=mujicians`. A **win** hands the kept sound back
> (`localStorage["mujicians.boss"]` → `mujicians.html?boss=win`); `handleBossReturn()` **advances M6→M7** and
> **grants the sound into the Sound Collective** (a kept instrument's `sample` folder → its matching sampled
> `VOICE`; animal cries / synth Drum-Conga have no voice yet → stay in Critter Hunt's own collection). Forfeit
> (**← Back to Mujicians**) returns with no advance, so the boss is retryable. See `docs/critter-hunt.md` →
> "wired into Mujicians as the M6 Timbre boss". The **find-the-odd-voice "Wormwood's Choir" set-piece described
> in the rest of this section remains an unbuilt alternative** design (a possible richer/second boss cut).
>
> **Status of the design below: DESIGNED, not built.** The fifth fleshed-out boss (after [Sandmar](#sandmar--the-m2-rhythm-boss-the-lullaby-duel-designed-2026-07-25-not-built), [Morendo](#morendo--the-m3-dynamics-boss-scorch-the-bones-designed-2026-07-25-not-built), [Slurry](#slurry--the-m4-melody-boss-stepping-stones-designed-2026-07-25-not-built), [Tritony](#tritony--the-m5-harmony-boss-the-devils-forge-designed-2026-07-25-not-built)). Wormwood is the **M6 Timbre capstone** (gating M7). It owns the one modality the others don't: **timbre = the ear for *color*** — not *which* pitch, but *what* voice. And that skill is **listening and discriminating, not performing**, so this is the roster's **first "pure listening, point-don't-perform" boss** — no fourth mic game, and distinct from Tritony's craft puzzle. It is also the **payoff for the built [Sound Collective](#the-sound-collective--sound-is-the-main-collection-built-2026-07-25)**: the `VOICES` you discovered by hearing become the voices you must identify under pressure. Same boss template: one win-target run, telegraphed attacks, retryable, capture → Muse. `run.debuff='flatten'`; Wormwood's HP is the count of true voices restored (see meters).
>
> **Forks locked with the dev (2026-07-26):** (1) **Core interaction = "find the odd voice"** (scan the droning choir, pluck the timbre that *doesn't* match the flatten) — pure discrimination; the **match-the-twin** variant (Timbrewolf hums a target voice, find its match) is a **later phase**, not the MVP spine. (2) **Strictly point-and-listen** — the mic does **not** come back in (an optional *sing-in-a-voice's-timbre* idea was set aside: matching timbre with your voice is genuinely hard and would drift toward a fourth mic game). **No MVP built yet** — this section is the design; a standalone `wormwoods-choir.html` (the Morendo/`scorch-bones.html` precedent) is the eventual first cut.

**Fantasy.** Wormwood (a street busker who grew **wooden teeth**) **bites people and they start to sound like him** — one flat, wooden voice swallowing the many. His villainy *is* **homogenization** (timbre-flattening). The hero **Timbrewolf** is *"many voices in one"* — and **Wormwood's accidental masterpiece** (a wolf he bit became more human and musical), so hero and villain are linked by origin. You fight by **restoring the distinct voices** he has flattened: the anti-homogenization. Wood element throughout (timbre = wood voices).

### The core loop — pluck the true voice out of the choir

Wormwood conducts a **choir of hooded figures, all droning in the same flattened wooden timbre**. Hidden among them are **true voices** — victims not yet fully bitten, still singing in their own distinct `VOICES` colour (glassbell, vibraphone, reedorgan, …), but **visually identical** (hooded), so you can only find them **by ear**.

- **Scan and solo** — click/hover a figure to hear it **isolated** — and **tag** the one whose timbre **isn't the wooden flatten**. Restoring a true voice throws off the hood (its colour floods back) and it joins Timbrewolf's side.
- **Restore enough → the choir loses cohesion → Wormwood is exposed** and defeated. The final pluck is picking **his own voice** (the conductor) out of the last thin ranks.
- **Difficulty = timbral closeness.** Early rounds hide an obvious outlier (a bright glassbell among wooden drones); later rounds hide **near-twins** (reedorgan vs. warmpad), add more figures, and press you for time.

### Timbrewolf — your ear-guide (active ally)

Not just an intro. As *"many voices in one,"* he **howls** to briefly make one true voice **ring out** (a hint), and he demonstrates distinctness by **splitting into his many voices**. In the deferred **match-the-twin** phase, *he's the one who hums the target voice* you must find in the choir.

### Wormwood's signature debuff — the Bite / Flatten (parallel to the others' perception-robbers)

He **bites**, and one of two things happens (each robs the ear the way Sandmar's yawn / Morendo's hush / Slurry's smear rob their senses):
- **Flatten** — momentarily **homogenizes the whole choir** so even a true voice sounds flat for a beat; you must act from **memory** of where it was (the isolate/solo cue is suppressed).
- **Re-bite** — pulls a **restored** voice back into the choir if you linger, so you can't dawdle after freeing one.

### Meters (boss-standard, retryable)

- **Wormwood's HP = true voices restored** — each freed voice thins his choir (progress **is** damage); the last is his own.
- **Homogenization = your fail-state** — a wrong tag (flattening an ally) or letting re-bites win **raises a "grey" meter**; if the whole choir goes flat, the town's voice is lost → **instant retry** (challenge-run framing).
- **Pace (default):** self-paced scanning early; the **re-bite / time pressure** ramps in later phases.

### Three phases (escalating)

1. **The Buskers** — a small choir, one obvious outlier voice; learn scan → solo → tag. Wide, self-paced.
2. **The Congregation** — bigger choir, **near-twin** timbres, introduces the **Flatten** (memory) and the **match-the-twin** variant (Timbrewolf hums a target).
3. **The Choirmaster** — dense choir, rapid **re-bites**, combined Flatten + press; thin the ranks and **pick out his own voice** to end it.

### Variant — "The Choir Line-Up," a Murdle-style deduction layer (design fork, not the locked MVP)

> **Status: alternative framing, considered 2026-07-27, not locked.** The locked MVP spine is still *find-the-odd-voice by ear* (the forks above). This section records a **logic-deduction variant** — a Murdle / whodunit lens on the same choir — as either a **harder later phase** or a **distinct mode**, not a replacement for the reflex-discrimination MVP.

**Why timbre (and only timbre) fits a deduction puzzle.** Murdle works because a crime has **several independent, describable attributes** (suspect × weapon × location) that clues cross-eliminate. Pitch/rhythm/dynamics are ~single-axis, so "deduce it" collapses to guessing. **Timbre is genuinely multi-dimensional and every axis has real teachable vocabulary** — so the choir *is* a deduction grid:

- **Brightness** (spectral centroid — dark/mellow ↔ bright/piercing)
- **Attack** (plucked / bowed / struck / breathed)
- **Material** (wood / metal / reed / glass / string)
- **Sustain** (a struck bell decays; an organ holds)
- **Roughness / purity** (a pure flute vs. a reedy saw)

These map onto the shipped `VOICES` registry almost for free (glassbell, vibraphone, reedorgan, neonsaw… already differ along exactly these axes), so the **Sound Collective becomes your case file** — the voices you catalogued by hearing are the suspects you now identify under pressure (the boss = the collection's exam, as already framed).

**The one rule that keeps it ear-training, not a logic puzzle in costume.** If clues were pure text, you could solve without listening and the ear-training evaporates. So: **the grid records what you can only learn by ear.** You *solo* a chorister to hear its attributes and mark them; clues let you *deduce* the ones you haven't soloed. A **listening budget** (solo only N per round) means deduction genuinely saves you ear-checking everyone. Listening = data-gathering; logic = payoff. The reflex spine survives; reasoning sits on top.

**Whodunit framing (best thematic match).** Wormwood *bites* people — so literally: **one hooded figure is still an un-bitten true voice to rescue**, or **Wormwood is hiding in his own ranks** (already the "final pluck = the conductor"). "Which figure is the true voice?" *is* "whodunit," and the climax resurrects the deferred **name-the-voice** beat as an accusation — *"I accuse… the glassbell!"*

**Clue types (each one teaches a timbre concept), all ear-verifiable:**
- Comparative — *"The true voice is brighter than the reed but darker than the bell."*
- Material — *"No metal voice is un-bitten."*
- Positional (Zebra/Einstein-puzzle) — *"The struck voice stands directly left of the breathy one."*
- Attack — *"The bitten voices all have a soft attack; the true one bites hard."*

**The signature debuffs map onto Murdle twists** (no new fiction needed): **Flatten** → a clue turns *unreliable* (a lying witness you must re-verify by ear); **Re-bite** → a solved grid cell *scrambles* if you dawdle (the case reopens); a contradictory clue you must catch as false.

**Lighter deduction cousins** if a full logic grid is too heavy/slow for the boss pace:

| Framing | How it plays | Timbre fit |
| --- | --- | --- |
| **Murdle (deduction grid)** | Choristers × attributes, cross-eliminate to the true voice | richest; slowest |
| **Guess Who** | Ask *attribute* questions ("is it metal?") to narrow the lineup | fast, playful, very teachable |
| **Mastermind** | Guess a voice-combo, get graded hot/cold feedback | strong ear-feedback loop |
| **Sudoku-of-timbre** | Each choir "section" must hold **distinct** voices — fill so none repeat | **is literally the M6 timbre-variety gate** |
| **Set / odd-one-out** | Spot the figure differing on one attribute | closest to the current MVP; keep as phase 1 |

Guess Who and Sudoku-of-timbre are the sneaky-good ones — the Sudoku framing makes the **win condition itself teach timbre variety** (the actual M6 gate).

**Timbrewolf's role fits unchanged:** his howl hint = a **free testimony** (one clue on the house); "splitting into his many voices" = him **demonstrating the attribute axes** at run start, i.e. teaching you to read the grid.

**Resolving the pace tension (Murdle is untimed/cerebral; the boss template is a retryable real-time set-piece):** keep the **deduction untimed as each phase's spine**, and add Wormwood's **re-bite / Flatten pressure only as phases ramp** — phase 1 pure "detective," the Choirmaster finale "solve it before last call." Cerebral satisfaction early, adrenaline late; still **point-and-listen, no mic** (consistent with the locked forks). Difficulty ramp = **grid dimensions** (more figures, more attribute columns, near-twin timbres, one contradictory clue).

**Open fork (decide before building):** is this Wormwood's **actual MVP**, or a **distinct harder mode** layered over the shipped find-the-odd-voice? The locked forks make find-the-odd-voice the MVP with match-the-twin as a later phase; a full deduction grid is a bigger swing than that — so this stays a documented alternative until the dev picks.

### Capture reward — the Wormwood Muse "Choirmaster"

His identity-theft, tamed ("weapon → your tool," like the others): **recolor any note into a collected voice** — he stole voices; now *you* can wear any voice — plus a **timbre-variety bonus** (rewards using **distinct** voices, which is the M6 gate skill). Turns his homogenization into your palette.

### Placement, reuse & scope

- **Placement:** M6 Timbre capstone, gating M7. Timbrewolf narrates the intro (foiling Wormwood in the dialogue — the origin link is the hook).
- **Reuse:** the built **`VOICES` / `playVoice`** engine (the timbres to identify) and the **Sound Collective** (`sounds` / `persist.sounds` — the discovered voices become the pool that can appear, so the boss is the collection's exam), the card **`SKINS`** system for the colour-flood-back on restore, the mentor/intro system, `run.debuff` + `runThreshold`, a boss end-screen.
- **New:** the **choir render surface** (a crowd of hooded figures), the **scan/solo listening interaction** + tag/restore, the **Flatten / re-bite** debuffs, phase logic, the **match-the-twin** later phase, and capture → add Wormwood to the Muse pool.
- **Distinct modality:** Sandmar = timing · Morendo = loudness · Slurry = pitch · Tritony = harmony · **Wormwood = timbre (ear-for-colour / voice discrimination — the first pure-listening, non-mic, point-don't-perform boss).**
- **MVP:** the choir + **find-the-odd-voice** (scan/solo/tag/restore) over the Sound Collective's voices, obvious timbre contrasts, Wormwood HP + a simple homogenization loss, single difficulty. **Deferred:** the near-twin phases, the **Flatten / re-bite** signature debuffs, Timbrewolf's howl hints, the **match-the-twin** phase, the conductor finale, capture → the Choirmaster Muse, canvas/wood-cut art, and porting into `mujicians.html`.
- **Open sub-decisions:** exact solo/scan interaction (hover-to-hear vs. click-to-solo vs. a "listen cursor"); how many voices in a choir + how many true voices per round; timbre-closeness ramp / scoring for a clean vs. sloppy sweep; whether restored voices **stay** freed or need protecting (re-bite tuning); whether the **name-the-voice** angle (label which `VOICES` it is, not just "odd one") is ever layered on for a reading/quiz variant (see the *Choir Line-Up* Murdle-deduction variant above — where name-the-voice becomes the "accusation"); whether that deduction layer is Wormwood's MVP, a later phase, or a distinct mode; the villain **name** (Wormwood vs. Woodworm / Timberjaw / Cordwood — still tentative per the roster).

---

## The Bartender — the M7 Structure boss: "Last Call" (DESIGNED 2026-07-26, not built)

> **Status: DESIGNED, not built.** The sixth fleshed-out boss and the **campaign capstone / final boss** (after [Sandmar](#sandmar--the-m2-rhythm-boss-the-lullaby-duel-designed-2026-07-25-not-built), [Morendo](#morendo--the-m3-dynamics-boss-scorch-the-bones-designed-2026-07-25-not-built), [Slurry](#slurry--the-m4-melody-boss-stepping-stones-designed-2026-07-25-not-built), [Tritony](#tritony--the-m5-harmony-boss-the-devils-forge-designed-2026-07-25-not-built), [Wormwood](#wormwood--the-m6-timbre-boss-wormwoods-choir-designed-2026-07-26-not-built); only Ranger's M1 ♮ remains). The Bartender is the **M7 Structure boss** — the last movement. He owns the one modality set apart from all six before it: **structure lives *across* time — form, repetition, and the *return home*** — so it can't be a reflex test, it's a **memory** test. Reuses the **built M7 form scoring** directly (`pcSetFp` phrase fingerprints, `hasABA`). Same boss template: one win-target run, telegraphed attacks, retryable, capture → Muse. `run.debuff='muddle'`; his HP is the song getting home (see meters).
>
> **Forks locked with the dev (2026-07-26):** (1) **Render surface = a real musical staff** — the level *looks like a staff* (five lines, barlines, bars, notes, and the roadmap symbols drawn **in place**), **not** the piano-roll grid, so you read/compose real notation and the navigation symbols live exactly where a musician sees them. (2) **MVP = the memory-recall A·B·A + a minimal "D.S. al Coda brings A home" beat** — you mark your A theme with a segno and write *D.S. al Coda* to recap it, taught minimally from the first cut; the fuller map-routing (extra symbols, repeats/voltas, a Snakes-&-Ladders board) is deferred. **No MVP built yet** — a standalone `last-call.html` (the Morendo/`scorch-bones.html` precedent) is the eventual first cut.

**Fantasy.** The Bartender runs the last bar at the end of the night — and **"bars"** is the whole pun (musical bars = the pub's bar; last call; closing time; your running **tab** = the song accumulating all campaign). His weapon is **making you forget**: the night blurs, the lights come up, and if you can't remember the tune you walked in humming, you can't bring it back — no recap, no A·B·A, and the song dissolves into forgettable mush. **The Key** — the rogue who *"unlocks the return home"* — is your ally, because the **recapitulation *is* the door home**. Structure *is* memory.

### The render surface — a real musical staff (dev call 2026-07-26)

The whole fight is drawn as a **musical staff**: five lines, **barlines** dividing the **bars**, your phrase sitting on the staff as notes, and — crucially — the **roadmap symbols in place** (segno 𝄋, the *To Coda* mark, the **Coda** 𝄌, *Fine*, *D.S. al Coda* written under the staff, repeat barlines 𝄆 𝄇 later). This is what makes M7 read as its own thing: not the piano-roll grid — you're **reading and composing real notation**, and the navigation symbols sit where they belong. It also makes the "get home" goal legible — you can *see* the coda (the exit) at the end of the staff.

### The core loop — the fight's shape *is* A·B·A

1. **State the A theme** — you play a short phrase; it lands on the staff, is **fingerprinted** (`pcSetFp`), and gets **marked with a segno** (𝄋 — "the sign," pinned). The Bartender pours you a drink.
2. **The B section — the night blurs** — you're pulled into a contrasting phrase, and here he **muddles your memory of A** (fogs the pinned bars / floats a false-memory decoy — below).
3. **The Return — get home before last call** — you write **D.S. al Coda** (*"go back to the sign, replay A, then jump to the Coda and out"*) and must **restate A from memory** on the staff (the pin is fogged; you recall by ear and must reject his decoy). Match the fingerprint → the song has form (**A·B·A**, `hasABA`) → you close the night and beat him. Fail → you never make it home → **retry**.

### Coda / D.S. / segno — the notation of "remember & reuse" (the M7 teaching)

Why these belong in Structure: **the roadmap symbols exist so you *don't rewrite* music you've already stated** — *D.S. al Coda* literally means "replay the remembered section, then exit through the coda." That **is the recapitulation, written down**, so the symbols and the "structure = memory" theme are the *same idea*. The MVP teaches the core three by *using* them: **segno** (mark A) → **D.S. al Coda** (bring it back) → **Coda** (the way out / home). Deferred symbols ramp in later — **D.C. al Fine**, **Fine**, **repeat barlines** 𝄆 𝄇, **voltas** (1st/2nd endings) — each a new "jump" on the staff-board.

### The Key — the return hero (and the key-signature note)

**The Key** narrates the intro and is your **return specialist**: he owns the roadmap symbols (the segno/coda are *doors*, D.S. is the instruction to go back and unlock the return), and can **"pick the lock" on a foggy memory** — handing back a fragment of A when you're truly lost (a hint). His name puns on both keys, but the *theory* stays where it's taught: **key-signature (the sharps/flats that define a key) is a pitch idea — M1 accidentals / M4 scales & modes — not M7.** The Key the *character* owns structure's **route home**; a one-liner can tip his hat to "the other kind of key" without re-teaching it. (Hero/villain foil: The Key routes you home, the Bartender scrambles the route.)

### The Bartender's signature debuff — "Muddle" (parallel to the others' perception-robbers)

He **makes you forget** — the memory version of Slurry's smear / Wormwood's flatten:
- **Fog** — the pinned A bars blur on the staff, so you restate from memory, not by reading.
- **False-memory decoy** ⭐ — he plays a *plausible-but-wrong* version of your A ("no, it went like *this*…"); the test is genuine recall vs. a convincing impostor (the distinct twist over plain Simon).
- **Scramble the map** (later) — he slides/erases the segno or coda, so you must re-place the route correctly.
- **Last call** is a soft countdown — pressure ramps as the lights come up.

### Meters (boss-standard, retryable)

- **The Bartender's HP = getting the song home** — completing the A·B·A (a clean D.S. al Coda with A recalled) is the damage; the final recap closes his tab.
- **Closing time = your fail-state** — a botched recall (wrong A / falling for the decoy) or letting last call run out **raises the "lights-up" meter**; full → you black out, the night's forgotten → **instant retry** (challenge-run framing).
- **Pace:** self-paced through A and B; **last-call** pressure ramps in the final phase.

### Three phases (escalating)

1. **Happy Hour** — state A, a short B, one clean **D.S. al Coda** home; learn segno → recall → coda. Wide, no decoy.
2. **The Blur** — introduces the **false-memory decoy** and **Fog**; longer B; a second sign to track.
3. **Last Call** — **scramble-the-map**, rapid decoys, the countdown; a longer form (toward AABA / an added repeat) and a final recap-from-memory to close the bar.

### Capture reward — the Bartender Muse "The Regular" (a.k.a. "Reprise")

The Key already owns the plain A·B·A bonus, so the Bartender's capture is **complementary**: his false-memory decoys become **your power of theme-and-variations** — restate a theme **with a twist** for a form bonus — plus a **callback/reprise** that re-summons an earlier phrase (a *D.S.* you can invoke). His muddle → your craft. "Weapon → your tool," like the rest. (Named for **the regular** — the patron who always *returns* — the recapitulation as a person.)

### Placement, reuse & scope

- **Placement:** M7 Structure capstone — the campaign's **final boss** (nothing gates past it; it closes the arc). The Key narrates the intro, foiling the Bartender.
- **Reuse:** the **built M7 form scoring** (`pcSetFp` fingerprints, `hasABA`, the A·B·A-return bonus), the note-playing to state phrases, the mentor/intro system, `run.debuff` + `runThreshold`, a boss end-screen. **New:** the **staff render surface** (five-line staff, barlines, notes, and roadmap-symbol glyphs — 𝄋 𝄌 etc. drawn as **inline SVG** like the Break-mechanic `noteheadSVG`/`restSVG`, since the astral-plane Unicode music symbols tofu), the **recall/decoy** memory logic, **segno/coda placement + D.S.-al-Coda routing**, the **Muddle** debuffs, phases, and capture → add the Bartender to the Muse pool.
- **Distinct modality:** Sandmar = timing · Morendo = loudness · Slurry = pitch · Tritony = harmony · Wormwood = timbre · **The Bartender = structure (form / memory across time — the only *across-time* modality; a staff-notation recall + roadmap-symbol fight).**
- **MVP:** the **staff**; **state A (segno) → B → D.S. al Coda recall-from-memory → Coda** over the built `hasABA`; one **false-memory decoy**; Bartender HP + a closing-time loss; single difficulty. **Deferred:** Fog / scramble-the-map, the extra symbols (D.C./Fine/repeats/voltas), the countdown pressure, AABA/longer forms, The Key's lock-pick hint, capture → the Regular Muse, staff-art polish, and porting into `mujicians.html`.
- **Alternate cores considered (deferred):** the **Closing-Time Loop** (Outer Wilds / Groundhog Day — retain memory across a repeating "last call," building the form a little more each loop), the pure **Roadmap Navigator** (Braid / Snakes-&-Ladders / Portal — route a playhead through a score-board via segno/coda jumps), and the **Arranger** (drag phrase-blocks + place symbols into a valid form). The **recall + staff + D.S.-al-Coda synthesis** was chosen as most capstone-y — it's how you'd actually *notate* the A·B·A the whole campaign builds toward.
- **Open sub-decisions:** how "A recalled correctly" is judged (fingerprint tolerance — exact vs. close); how the segno/coda are placed (auto on state vs. player-placed); decoy difficulty ramp; whether the countdown is always-on or final-phase-only; how much of the roadmap family graduates from MVP; staff input (play notes onto the staff vs. pick from a phrase palette).

---

## Paint by music — the song colors a painting (TENTATIVE, not built)

> **Status: brainstorm only, not designed in full.** An M7-Structure feature idea: as your run's song plays, it **paints an image** — paint-by-numbers, but the "numbers" are music.

**The native hook:** Mujicians' notes are already **ROYGBIV colors** (C red → B violet), so every note you play *is* a pigment. Painting-from-music isn't a bolt-on metaphor here — the color↔note mapping already exists.

**Weak vs. strong framing.** The *weak* version (region has a target color → play the matching note to fill it) is really a **pitch** exercise (M1/M4) in disguise and teaches nothing about structure. The *strong* version makes the **canvas composition mirror the song's form**, so it belongs in M7: state **A** → the left panel paints; drift to **B** → the center paints in a contrasting palette; **recapitulate A** (the built `hasABA` gate / "return home") → the right panel paints as a **mirror of the left**, completing a symmetric triptych. A song with no reprise leaves the picture lopsided and unfinished — so "finish the painting" *is* "give the song form." Micro (notes paint in their color) and macro (composition = A·B·A) can both be true at once.

**Cheapest first cut:** a **generative "album cover"** on the existing **Save-a-Song** screen — render the finished run's song + its `hasABA`/`pcSetFp` form to a canvas as a keepsake, no new scoring. The *interactive* paint-by-form version (a standalone `paint-by-music.html` MVP first, per the `scorch-bones.html` precedent) is the richer later step, and could tie into the Bartender's `muddle` debuff (fog a panel; the D.S.-al-Coda recap un-fogs it).

**Prior art to check** (none nails "correct music → predetermined image"): **SimTunes** (Iwai — paint *is* the score, reverse direction), **Child of Eden** (Mizuguchi — restore color/life to a world by playing to the beat, the thematic bullseye), Chrome Music Lab's **Kandinsky** (free, instant), **Chime** (fill the canvas → build the music).

**Open forks:** target-image (scored, paint-by-numbers) vs. generative artifact (no wrong answer); where it lives (M7 lesson / Bartender boss / Save-a-Song reward — not exclusive); paints live-as-you-play vs. rendered at the end.

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

## Run goals — each campaign run has a finish line (BUILT 2026-07-19)

> **Status: ✅ BUILT (2026-07-19)** in `mujicians.html`. Gives **Campaign** runs a goal that stops the song
> (with a keep-building escape hatch), while **Free Play stays open-ended**. Partially reverses the
> [Open-ended pillar](#open-ended-performance--no-threshold-you-decide-when-youre-done-built) for Campaign
> only. Four decisions locked with the dev.

**Why.** Open-ended is right for the *creative* mode, but a *teaching* run wants a finish line — a clear "you
did it." So each campaign movement's run now has a **goal = that movement's existing gate**, and meeting it
ends (or offers to end) the performance and scores it.

**As built:**
- **The goal, per-run.** Every campaign movement stops at its gate, tracked **this run**: M1 = play all 7
  in-key letters A–G (`run.gatePitch`); M2 = each note value; M3 = soft/med/loud; M4 = 3 intervals + a run;
  M5 = 3 triads + a cadence; M6 = 4 blends; M7 = an A·B·A. `runGoalMet()` = `gateStatus(movement).met`, and
  `gateStatus` now reads **per-run** state (M1's case uses `run.gatePitch`; M2–M7 already used run counters).
  *(M1 no longer accumulates letters across runs — `pitchLettersGot()`/`collectPitchLetter()` still write
  `persist…gates.pitch` but it's **legacy/vestigial**; the home hangman previews the goal empty (fresh each
  run).)*
- **The choice prompt.** When the goal is first met mid-run, `showGoalPrompt()` overlays **🏁 Finish & score**
  vs **✏️ Keep building** (forced choice, ~420 ms after the note lands so it's seen). *Finish* → `finishRun()`.
  *Keep building* → `run.goalAck = true`, dismiss, resume M1 calls, keep playing. `run.goalReached`/`goalAck`
  gate the one-shot (`goalJustMet` in `playHand`).
- **Finish button.** **Removed from Campaign** — it renders only when `run.mode==="free" || run.goalAck`
  (Free Play always; Campaign only after *Keep building*). Free Play is otherwise unchanged (open-ended, stage
  space the only limit).
- **The "how close" score (M1).** `pitchAccuracy()` = average per-note nearness over `run.respondLog`
  (each response's `|played − call|`; `d` off = `max(0, 1 − d/12)`) → a `%`; `accuracyGrade()` maps it to a
  word (Perfect ear! / Great! / Good / …). Shown on the goal prompt and the end overlay ("🎯 Pitch accuracy:
  87% — Great!"). Per the dev's pick this is the **simple grade + %** (no per-tier breakdown). Other movements
  show the standard completion report.
- **Advancement** now requires meeting the goal **in one run** (`maybeAdvance` → `gateStatus(mv).met`, now
  per-run). Stage-full auto-finish is still the hard cap (rarely hit before the goal).

**Deferred / notes:** per-movement calls for M2–M7 aren't built yet, so those goals are demonstrate-the-gate,
not call-and-response; the M1 accuracy readout is M1-only. (Home intro copy updated in the same pass to
describe Campaign-goal vs Free-Play-open, replacing the stale "Beat the threshold" line.)

## Open-ended performance — no threshold, you decide when you're done (BUILT)

> **Status: ✅ core BUILT (2026-07-18)** in `mujicians.html`. Supersedes **Removing gigs → Fork 1** (which
> DECIDED "one session, one threshold"). Playtest feedback reversed that call: **the applause threshold
> that ended a run is removed.** A performance now ends when the **player** presses **✓ Finish song**, or
> when the **loop runs out of space** — never because a score gate cut them off. The *endless/no-threshold*
> option that Fork 1 surfaced-but-rejected is now the shipped direction. **One planned piece was
> deliberately deferred:** persisting the per-run gate counters across runs (see *As built* → deferred).
>
> **⚠️ AMENDED 2026-07-19 — open-ended is now FREE-PLAY-ONLY; Campaign gets a per-run GOAL that stops the
> song.** Playtest: a *learning* run wants a finish line. So each **campaign** run now ends when you meet
> that movement's **goal** (its existing gate, tracked **per-run** — M1 = play all 7 letters A–G this run;
> M2 = each note value; etc.), which pops a **choice: 🏁 Finish & score, or ✏️ Keep building** (dismiss and
> play on). The **✓ Finish button is removed from Campaign** (it only reappears after you choose *Keep
> building*); **Free Play keeps the Finish button and stays fully open-ended** (no goal, no prompt). M1's
> "how close" **pitch-accuracy score** (avg per-note nearness → `%` + a grade word) shows on the goal prompt
> and the end overlay. Advancement now requires meeting the goal **in one run** (M1 no longer accumulates
> letters across runs — `persist…gates.pitch` is legacy/vestigial; `run.gatePitch` is the live set). See
> **[Run goals (BUILT 2026-07-19)](#run-goals--each-campaign-run-has-a-finish-line-built-2026-07-19)**.

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
| **Dynamics swell** *(BUILT 2026-07-18)* | switch p/mf/f (M3+) | The **selected** card(s) scale to the chosen loudness (**size = volume**: p small, f big) via `.card.dyn-*`; `swellSelected()` plays a WAAPI overshoot tween across the re-render. The landed loop cell keeps the size too (`.lgcell.cdyn-*`, from `eventCoverage().onDyn`); the ghost cell previews the next play's size. |

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

## Timbre as collectible card skins — editions, not creature breeds (LOOK-ONLY SLICE BUILT 2026-07-20)

> **Status: the LOOK-ONLY skin slice is ✅ BUILT (2026-07-20); the SOUND engine + a "Sound Collective"
> collection are ✅ BUILT (2026-07-25) — see [The Sound Collective](#the-sound-collective--sound-is-the-main-collection-built-2026-07-25) below.** Reframes how **timbre** is collected and
> shown. **Supersedes** the Notelings "**Instrument (suit) → breed / material**" channel below: timbre is no
> longer a *creature variation* — it becomes a **collectible translucent card skin (an "edition")**, in
> the spirit of Balatro's Foil / Holographic / Polychrome cards. **Engine decision: hand-rolled Web-Audio
> synth presets — NOT Tone.js** (considered and declined — the dependency, its own scheduler, and its own
> AudioContext fight the repo's vanilla single-file rule and the game's existing `scheduleBar` clock; the
> goal here is *variety to collect*, not realism, which a small preset system delivers with zero assets).

### The Sound Collective — sound is the main collection (BUILT 2026-07-25)

> **Dev decision (2026-07-25): collecting SOUNDS is the game's main collection system.** Scope picked this
> pass: **pitched melody voices** (drums/sfx/ambient deferred); a **separate "Sound Collective" panel** (a
> sibling to the Codex, not a tab); **discover-by-hearing** (a voice is catalogued the first time it sounds);
> and **named presets now, creature/edition art later**.

**AMENDED 2026-07-28 — real sampled instrument voices.** The `VOICES` engine now also supports **`type:"sample"`
voices**: real instrument recordings played from the shared **anchor samples** in `sounds/instruments/` (the same
set Critter Hunt uses — 13 mp3s/instrument, one every 3 semitones C3–C6, nearest pitch-shifted ≤1.5 st via
`playbackRate`). `playVoice` gained a **`renderSample`** branch (the old synth body is factored into
**`renderSynth`**); a sample voice borrows its synth **`fallback`** for the split-second before buffers decode,
and **`buildDeck` preloads** a run's sample voices so play is real from the first note. Seven added first —
**violin, flute, trumpet, nylon guitar, saxophone, tubular bells, banjo** — then a **13-strong obscure/world set
on 2026-07-29** (**shamisen, koto, shakuhachi, sitar, shehnai, bagpipes, kalimba, marimba, glockenspiel, celesta,
harpsichord, dulcimer, harp** — **20 sampled voices total**), all as collectible `INSTRUMENTS` that surface in
**Free Play** and catalogue into the Collective by ear, like the synth collectibles. The obscure set is also
wired into the **M6 Timbre boss (Critter Hunt)** as instruments/rewards — a boss win maps a kept instrument's
sample folder → its matching sampled voice (`CRITTER_SAMPLE_VOICE`). (Provenance: `sounds/CREDITS.md`; loads via
fetch/decodeAudioData → needs http serving.)

Built in `mujicians.html`:

- **A data-driven voice engine.** `VOICES` registry (near `INSTRUMENTS`) — each entry is a small preset:
  an **oscillator stack** (`{wave, semi, det(cents), g}`), a shared **ADSR** `env{a,d,s,r}`, an optional
  **lowpass sweep** `filter{f0,f1,q}`, and an optional **tremolo** `trem{rate,depth}`. **`playVoice(voiceId,
  midi, dur, t, vel)`** renders it in vanilla Web-Audio (mirrors `_tone`'s attack→decay→sustain→release,
  generalised; envelope times clamp to the note length). This **fills the `preset` seam** the look-only slice
  reserved. **9 voices shipped:** `grand` (piano), `pluck` (guitar), `roundbass` (bass) — the core trio —
  plus collectibles **`glassbell`, `reedorgan`, `neonsaw`, `warmpad`, `musicbox`, `vibraphone`**. Add a voice
  = add a `VOICES` entry + point an instrument's `voice` at it.
- **Instruments now carry a `voice`.** `INSTRUMENTS` gained a `voice` field (the old `wave` kept as a legacy
  fallback) and a `core:true` flag; the melodic sound paths (`soundStack`, `scheduleEvent`, the card-click
  preview) route through `playVoice(voiceForInst(instId), …)` instead of the bare oscillator. So the existing
  3 instruments **immediately sound richer/distinct**, and every card's timbre is a named voice.
- **The palette widened without touching campaign.** Six **collectible instruments** (bell/organ/synth/pad/
  box/vibes) were added to `INSTRUMENTS`, but **`instrumentsFor()` now draws only from `CORE_INSTRUMENTS`**
  (the piano/guitar/bass trio) — so campaign teaching (incl. the M6 blend count) is **unchanged**. **Free
  Play** builds its deck from a **shuffled full palette** (`freePlayInstruments()`), sliced to `MAX_TIMBRES`
  (4), so **a different handful of voices appears each run** — you meet the whole palette over many runs.
  `buildDeck(mv, level, isFree)` gained the `isFree` flag (passed from `startRun` when `mode==="free"`).
  Save-safe: `instId` is stored as a **string** (never an index), so new instruments don't disturb old
  saved songs; unknown ids fall back to piano.
- **The Sound Collective collection.** A `sounds` `Set` (persisted in `persist.sounds`, additive; hydrated on
  load, cleared by the DEV reset) that **`catalogSound(voiceId)` fills from inside `playVoice`** — so any
  voice you *hear* in play is collected (Codex-style discovery). A **🔊 Sound Collective** button + count
  badge sits beside the Codex; its dialog (`#soundsOverlay`, mirroring the Codex modal) lists all voices —
  collected ones show name + family + description + a **▶ sample** button (plays a rising C–E–G–C so the
  timbre sings), locked ones show a silhouette. Count = collected / total.
- **Skins ride along for free.** The two spare skins finally attach — **synth = Neon, vibes = Frosted
  Glass** — so those Free-Play cards wear their edition sheen (piano/guitar/bass unchanged).

**Deferred / next:** per-voice **creature or edition art** (this pass is named-presets-only); **drum / sfx /
ambient** collection families (scope was pitched-only); an **equip / loadout** layer (choose which voice a
Free-Play deck uses) — pairs with the [backstage shop](#the-backstage-shop--tips-economy-planned) so voices
can be a Tips sink and/or milestone drops; the **M6 gate/term** possibly counting distinct *voices* instead
of distinct *instruments*; and **skinning the piano-roll loop cells** (skins still ride the hand cards only).
The wide register spread of a random Free-Play palette (bass at C2, music box at C5) is left as-is for now —
tune `baseC` per voice if the loop grid grows too tall.

### Look-only slice — as built (2026-07-20)

The **visual** half of the reframe shipped first (sound unchanged; the per-skin synth voice is the next pass):

- **`SKINS` registry** (near `INSTRUMENTS`) — one entry per skin (`{id, name, art, preset}`); `preset:null`
  is the reserved seam for the future synth voice. Add a skin = add an entry + a `.cskin.sk-<id>` CSS rule.
- **Binding rides `instId`, decided with the dev:** an instrument carries a `skin` field. **Piano = plain
  (no skin)**; **Guitar = Foil**; **Bass = Holographic**. Two spares (**Frosted Glass**, **Neon**) are
  defined in the registry and CSS, unassigned, ready to attach. `skinFor(instId)` resolves the skin object.
- **Render.** `cardHTML` lays the skin as a **child `.cskin` element** (first child of the card), *not* a
  class on the card — so it survives the FLIP/fly `cloneNode(true)` (which resets the card's `className`)
  for free, riding the deal/play/discard animations. Note text is lifted above the sheen with `z-index`.
- **Pure CSS, no assets, reduced-motion aware.** Each skin is a translucent overlay + a sweeping glint
  (`skGlint`) / hue shift (`skHolo`); `@media (prefers-reduced-motion:reduce)` freezes the motion but keeps
  a static sheen — matching the card-motion layer's guard.
- **Bring-your-own-art seam.** Set a skin's **`art`** to an image URL / data-URI → `cardHTML` adds
  `.cskin.sk-art` + a `--skin-art` var, and the CSS paints that image (cover) **instead of** the gradient,
  dropping the animation. `art:null` keeps the built-in CSS look. (Editing the `.cskin.sk-<id>` gradient
  directly is the other art path.)
- **Where they show.** Skins appear wherever **guitar/bass cards** do — **Campaign M6+** (`INSTRUMENT_UNLOCK_MV=6`)
  and **Free Play** (all instruments), plus the graduated accidental decks (`instrumentsFor(m).slice(0,MAX_TIMBRES)`).
  Before M6 the deck is piano-only, so cards stay plain.
- **Update (2026-07-25):** the per-voice **synth preset** — the "sound" half — is now **BUILT** as
  `playVoice`/`VOICES` (the `playPreset` seam this bullet reserved), and sound became a **collectible layer**
  (the [Sound Collective](#the-sound-collective--sound-is-the-main-collection-built-2026-07-25)). Still
  deferred: an **equip** layer (the shop/Tips unlock; choose a Free-Play deck's voice), **skinning the
  piano-roll loop cells** (skins ride the hand cards + clones only), and the M6 gate/term possibly counting
  distinct *voices/skins* instead of distinct *instruments*.

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

**How it maps onto the current code.** *(Much of this is now BUILT — see [The Sound Collective](#the-sound-collective--sound-is-the-main-collection-built-2026-07-25). The bullets below are the original plan sketch.)*
- Today "instrument = suit = waveform = timbre" (`INSTRUMENTS`: piano/`triangle`, guitar/`sawtooth`,
  bass/`sine`, sounded by `_tone`). Under the reframe, **the 3 instruments become the 3 *seed* timbre
  skins**, and growth = **more presets, each with its own skin** — the deck's collectible "voices." **(Built:
  each instrument now carries a `voice`; 6 collectible voices were added; Free Play surfaces them.)**
- Extend `_tone` (one oscillator) into a small **preset system** behind a `playPreset(midi, preset, …)`
  seam: a preset is data (`{ oscs:[…], filter, env, fx }`); the scheduler (`scheduleVoices`/`scheduleBar`)
  calls `playPreset` instead of a bare `wave`. ~150–250 lines, no dependency, drops into the existing
  clock with no conflict (the reason we skipped Tone.js). **(Built as `playVoice`/`VOICES`.)**
- A card gains an **equipped-skin id**; `cardHTML` adds the skin's CSS class; the scheduler reads the
  skin's preset. Sound-preset and overlay stay one unit, so "equip skin" changes both at once. **(Equip layer
  still deferred — voice binds to the instrument for now, not a per-card equip.)**

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
- ~~**Preset palette** — the starting set of voices/skins and their synth recipes.~~ **✅ First set BUILT
  2026-07-25** (9 `VOICES`: grand/pluck/roundbass + glassbell/reedorgan/neonsaw/warmpad/musicbox/vibraphone).
  A pluck/Karplus voice and a noise voice for a future percussion suit can still be added.
- **Purely cosmetic+audio, or a scoring quirk?** (Leaning purely collectible; **built purely collectible** —
  a voice carries no score effect.)
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

**Starting roster (emoji stand-ins).** Each letter is a **register pair**: a **grounded** creature (low
register) and a **flying** creature (high register) that **share the note's first letter *and* its ROYGBIV
color** — register (octave) is the channel that picks which of the two you see. Same-initial pairs double
the word-game hook (this is a word-games site) and keep the alphabet gimmick.

| Note | Color | Grounded (low) | Flying (high) |
|------|-------|----------------|---------------|
| A | Red | **Ant** 🐜 | **Angel** 😇 |
| B | Orange | **Blob** 🫧 | **Bat** 🦇 |
| C | Yellow | **Cat** 🐈 | **Chicken** 🐔 |
| D | Green | **Dog** 🐕 | **Dragonfly** 🪰 |
| E | Blue | **Elephant** 🐘 | **Eye** 👁️ *(hovering)* |
| F | Indigo | **Flower** 🌸 | **Firefly** ✨ |
| G | Violet | **Goat** 🐐 | **Goose** 🦢 |

(Emoji are placeholders — no true dragonfly/firefly emoji, so 🪰/✨ stand in; 🫧 for Blob especially. They
swap for the dev's pixel sprites later — see *Art & swap path* below. **"High C" gag:** the flappy Chicken
is the high-C flyer — the classic hard-to-hit note is a bird that can barely stay airborne.)

**Merge-legibility rule (load-bearing for chord-chimeras).** Because a chord fuses its members into **one
creature**, every creature needs **one or two unmistakable defining parts** so you can still read which
animals a fusion is built from. Design each with that silhouette in mind: Ant's antennae/segments vs.
Angel's halo+wings; Blob's shapelessness vs. Bat's leathery wings+ears; Cat's whiskers+tail vs. Chicken's
comb+wattle; Dog's floppy ears+snout vs. Dragonfly's iridescent double wings; Elephant's trunk+tusks vs.
Eye's floating eyeball; Flower's petals vs. Firefly's glowing abdomen; Goat's horns+beard vs. Goose's long
neck+webbed feet.

*(The shipped portmanteau song-namer — `NOTELING` in `mujicians.html` — predates this split and maps each
**letter** to a single name for the "Chiegoat"-style blend; it's register-agnostic. Left as-is until
register/octave is actually a played distinction, at which point it can pick grounded vs. flying by octave.)*

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
- **Register (octave) → flight, not size.** *(Corrected 2026-07-18 — this channel used to say "octave →
  size," which collided with dynamics; size now belongs to loudness, below.)* High register = **airborne**
  (the letter's flying creature — Angel, Bat, Chicken, Dragonfly, Eye, Firefly, Goose), low register =
  **grounded** (Ant, Blob, Cat, Dog, Elephant, Flower, Goat). Same note-letter and color; register just
  picks which of the pair is summoned — so the loop's pitch grid reads as "grounded beasts low, fliers high."
- **Dynamics (loudness) → size** *(**BUILT 2026-07-18** for the card + loop cell)*. A **forte** creature is
  **big**, a **piano** one is **small** — size *is* volume, a physical, felt mapping. In the live game this
  already shows on the **hand card** (a selected card swells/shrinks to `run.curDyn` — `.card.dyn-*`, with a
  WAAPI overshoot "swell" when you switch dynamic) and on the **loop grid cell** (`.lgcell.cdyn-*`, driven by
  `eventCoverage().onDyn`); the Noteling sprite inherits the same size channel for free.
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
  **Accidentals belong here (planned, not built) — now fully designed: see [Accidentals — the sharps &
  flats runs + the ♮ boss](#accidentals--the-sharps--flats-runs--the--boss-planned).** The dev's call:
  **introduce accidentals (♯/♭ — the 5 chromatic notes) within the Pitch movement**, after the 7 naturals
  are learned — Pitch's own internal "levels" (naturals → **Sharps run → Flats run → ♮ boss**). It's the
  musically correct home (accidentals *are* pitch), and it feeds the already-designed hooks: the ROYGBIV
  **in-between shades** (♯ warmer toward the next letter, ♭ cooler), the Notelings **morphology** channel
  (♯ = spikier, ♭ = rounder), and the deck-growth **Accidental cards** (the Tarot analog). Until built, the
  deck is the 7 naturals only. *(The earlier open question — new cards vs transform vs sub-level gate — is
  **resolved: dedicated sub-level decks** (same 5 pitches spelled two ways). See the Accidentals section.)*
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
- **Codex UI — a button → tabbed dialog (BUILT 2026-07-18).** The footer's always-on chip list was
  replaced by a **📖 Codex** button (with a discovered-count badge) that opens a modal in its own
  `#codexOverlay` (independent of the `screen` state machine — openable from Home or the play screen; Esc /
  backdrop / Close to dismiss). Tabs group discoveries by kind against a **complete checklist**: **Intervals**
  (all 11, consonant/dissonant tagged), **Triads** and **Sevenths** (a root × quality grid — in-key roots
  blue-outlined), **Runs** (3–7-note scale runs), plus a **Circle of 5ths** map — an inline-SVG relationship
  view where the 7 in-key notes glow in ROYGBIV as one contiguous arc, chromatic notes are greyed, and any
  root you've played is ringed gold. `codex` (the `Set`) stays the single data source; grouping is derived by
  parsing the inscribed names (`INTERVAL_NAME` values, `NOTE_NAMES[root]+" "+quality`, `Scale run (n)`).
  *(Room to grow into a fuller relationship graph — e.g. a Tonnetz — later; the tab layout is the container.)*
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
