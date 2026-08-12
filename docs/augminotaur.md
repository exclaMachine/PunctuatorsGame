# Augminotaur

A voice-controlled first-person horror level for mobile + desktop browsers. The player is trapped in a
labyrinth with the **Augminotaur**, a creature that drones an augmented triad — three notes spaced
identically, no root, no resolution. The maze loops because the chord never resolves; escaping means
resolving it, and the primary route is a **beatbox fight**. Retro Wolfenstein-style raycaster, no HUD,
audio *is* the UI.

**Hard constraints (non-negotiable):** no network at runtime ever; **no speech recognition** — the game
listens to *how* the player sounds (pitch, rhythm, loudness, timbre), never *what* they say; vanilla ES
modules, no build step. Full brief in `HANDOFF.md` at repo root.

Entry file: `augminotaur.html` · modules in `augminotaur/` · input research bench:
`augminotaur-input-bench.html`.

## Status

| Milestone | State |
| --- | --- |
| **M1** — raycaster + grid-step movement | **BUILT** (`99bb194`) |
| **M2** — `VoiceInput` module + calibration entry flow | **BUILT** (`ecd44ab`) |
| **M3** — `AudioContext.currentTime` beat clock + wall-shading pulse | **BUILT** (`clock.js`) |
| **M4** — Movement 1 (call & response, 4 patterns, win/lose) | **BUILT** (`movement1.js` + `sprite.js` + `drums.js`) |
| Snare **"ka"** verb (this doc, below) | **BUILT** in `voice.js` + bench — default thresholds pending mic tuning |
| **Speaker-enrolled verb templates** (MFCC + DTW) | **BUILT** (`verbmatch.js`) — `MATCH_TH`/`MARGIN` pending mic tuning |
| Procedural maze + voice-only traversal | **tentative** (parked — see below) |

## Architecture

ES-module split so audio/game systems drop in without a rewrite:

- `augminotaur.html` — shell: 320×200 pixelated canvas, three thumb buttons, the entry/calibration
  overlay, and two debug readouts (FPS + last mouth-verb, toggle `F`). No HUD in the final.
- `augminotaur/main.js` — wiring + game loop. Runs the entry flow at load, pumps `vi.update()` each
  frame once the mic is live, creates the `BeatClock` once the AudioContext is live, and feeds
  `pulseLight(clock)` into the raycaster each frame. Stashes `vi.latencyOffsetMs` for M4 hit-scoring.
- `augminotaur/clock.js` — the shared beat clock (below). `timeAtBeat`/`perfAtBeat` bridge audio time
  (scheduling sound) and `performance.now()` (mic-event stamps) for M4 scoring.
- `augminotaur/movement1.js` — Movement 1, the call-and-response fight controller (below).
- `augminotaur/drums.js` — his procedural kit (kick/hat/snare = BOOM/TSS/KA) + the win-resolve triad. No assets.
- `augminotaur/sprite.js` — the depth-tested Augminotaur billboard (horned silhouette + live eye-glow),
  occluded against the raycaster's z-buffer.
- `augminotaur/map.js` — the labyrinth grid + spawn (currently a hardcoded 16×16: outer ring + central plus).
- `augminotaur/player.js` — grid-step/tank movement (90° snap-turns, one-cell steps, dt-tweened, wall-bump nudge).
- `augminotaur/raycaster.js` — DDA raycaster, flat-shaded walls with a `light` multiplier (beat pulse) and an
  optional per-column z-buffer (`render(...)` fills it) so `sprite.js` occludes the creature behind walls.
- `augminotaur/input.js` — keyboard (arrows/WASD) + touch intents.
- `augminotaur/voice.js` — the detector (below). The bench imports it, so there's one source of truth.
- `augminotaur/calibrate.js` — the entry overlay + calibration flow (below).
- `augminotaur/verbmatch.js` — MFCC/DTW template matching for speaker-enrolled verbs (below).

## The detector (`VoiceInput`)

Offline mouth-verb detector. **`augminotaur/voice.js` is the single source of truth** — the bench
(`augminotaur-input-bench.html`) now **imports it as a module**, so tuning happens against the exact code
the game runs (no more duplicated class to keep in sync). Tune the constants in the bench (sliders + a live
scope), then commit the settled defaults into `voice.js`. **Don't reinvent the detector.**

Five verbs:

| Verb | Player does | Signature |
| --- | --- | --- |
| `BOOM` | "buh" / "puh" | transient, energy **below 250 Hz** (tilt high) |
| `TSS`  | "ts" / "ss"   | transient, energy **above 3 kHz** (tilt low) |
| `KA`   | "kah" (snare) | transient, **mid-band dominant** (`kaMidShare`) — the gap between the crossovers |
| `HOLD` | sustained "aaah" | voiced (low zero-crossing rate), outlives the ~250 ms sustain threshold |
| `HISS` | sustained "shhh" | unvoiced sustain — reserved, not used this level |

How it decides an attack: cascaded biquads isolate a **low** band (lowpass 250 Hz), a **high** band
(highpass 3 kHz), and a **mid** bandpass (`midHz`/`midQ`, the gap between them). `tilt = eLow / (eLow + eHigh)`
— high tilt = BOOM, low tilt = TSS. **`KA` is checked first** on `midShare = maxMid / (maxLow+maxMid+maxHigh)`:
mid-dominant → snare; a real "buh"/"tss" stays low-/high-dominant so its mid share stays under `kaMidShare`
and it falls through to the untouched BOOM/TSS logic (the old zcr tiebreak still resolves anything left in
the middle). **`HOLD` arrives late by design:** a sustained note's attack is indistinguishable from a
`BOOM`, so `BOOM` fires immediately (keeps rhythm honest) and a `HOLD` is emitted later with a
`replaces:<id>` field once the note outlives the sustain threshold — **`KA` is attack-only and spawns no
sustain-watch.** **Always score sustained notes on `ev.t`** (when the note started), never on arrival.
Event shape: `{ id, verb, t, tilt, mid, zcr, level, replaces? }` (`mid` = mid share on attacks); `*_END`
events carry `duration` and don't count as hits.

`getUserMedia` requests `echoCancellation:false, noiseSuppression:false, autoGainControl:false` — all three
default on and all three destroy the signal (noise suppression literally deletes "tss"). Never change that.

### Calibration entry flow (`calibrate.js`)

`getUserMedia` + `AudioContext` need a user gesture, so the descent starts behind a tap. In-theme guided
overlay: **AUGMINOTAUR → tap to descend → "Be silent…"** (1.6 s noise-floor calibration, runs inside
`start()`) **→ "Speak in his tongue"** (voice enrollment — skippable, skipped outright for a returning
player; see the templates section) **→ "Listen…"** (four latency clicks played and heard back through the
mic). Latency measurement needs the speaker→mic acoustic path, so it **fails on headphones** — graceful
fallback to a 0 ms offset with a tap-to-retry. The diegetic "put on the mask" framing for the headphone
case is deferred. Measured offset is stashed as `vi.latencyOffsetMs` for M4's hit-scoring to subtract from
every hit. The overlay runs its own rAF `pump(vi)` while it owns the screen — `main.js` doesn't start
pumping the detector until `runEntry` resolves, and both enrollment and the latency clicks need onset
events to fire.

## The beat clock (`clock.js`) — BUILT

The single shared timebase, driven by **`AudioContext.currentTime`** (never `setTimeout`/`rAF`): audio
time is monotonic and drift-free, so once the Augminotaur's drums and the player's scored hits exist they
line up against one ruler. `BeatClock(ctx, bpm=76, beatsPerBar=4)` is created in `main.js` off the live mic
context (`vi.ctx`) the moment calibration finishes; before that the walls hold at full light. It's a **pure
timing source** — makes no sound, touches no canvas — exposing `beats()` (continuous float since start) and
`barPhase()` (beats since the last downbeat). Tempo is HANDOFF's opening 76 BPM.

M3's only consumer is the **wall-shading pulse**: `pulseLight(clock)` returns the raycaster's `light`
multiplier — a **subtle few-percent brighten on the downbeat** (`PULSE_AMP=0.06`) that decays fast
(`PULSE_TAU=0.17` beats → ~10% of peak within ~0.4 beat), a flash-and-fade "visual metronome" rather than a
bar-long throb. **Silent by design** for now: the augmented-triad drone and his drums arrive with M4+.
Everything later (call-&-response windows, the groove loop, the seam) schedules against these same beat
numbers. The latency offset is *not* applied to the pulse (it's a pure visual); M4 will subtract it from
scored mic hits.

---

## M4 — Movement 1 (Mimicry / call & response) — BUILT

The tutorial fight. Strict turn-taking: the Augminotaur drums a pattern (**CALL**), then falls silent while
the player echoes it back by voice (**ANSWER**). Because he never drums during the answer window, his output
can't trip the player's own onset detector — the self-triggering problem is solved by *structure*, not DSP.
Introduces the game's **first audio** (his drums) and **first creature presence** (the billboard). Everything
schedules against the M3 `BeatClock`. Movement is locked during the fight — it's a stationary face-off; you
answer with your voice, not your feet.

**Modules:** `drums.js` (procedural kick/hat/snare = BOOM/TSS/KA one-shots at `AudioContext` times, short &
dry so a CALL can't bleed into the ANSWER; + a `resolve()` triad for the win), `sprite.js` (depth-tested
billboard, blitted column-by-column against the z-buffer; live ember eyes; lunges on CALL hits; grows as he
closes), `movement1.js` (the state machine: ladder, CALL→ANSWER scheduling, scoring, distance tug-of-war,
win/lose). Supporting changes: `raycaster.js` z-buffer, `clock.js` `timeAtBeat`/`perfAtBeat`.

**Swappable art:** the horned bull is only `sprite.js`'s *default*. To use your own picture, drop a
transparent PNG (camera-facing) in the repo and either set `CREATURE_SPRITE_SRC` at the top of `sprite.js`
or call `setAugminotaurSprite({ src: "sprites/augminotaur.png" })` once at startup (returns a load Promise).
Any aspect ratio works — width follows the image, world height is `HEIGHT` cells. If the art already has
eyes, pass `eyes:false` to turn off the drawn embers. Nothing else changes; a bad path falls back to the bull.

**Dev readout (F):** a bottom-left panel (alongside fps/verb, same F toggle) shows the live fight state —
current pattern `n/4`, his distance, the CALL pattern laid out on the bar (`B · K ·`), and, during ANSWER,
each of your hits as it lands with its grade and signed ms offset (`BPERF+8  KGOOD-40`); after judging, a
per-slot recap (`got: B✓ K✗ +1 extra`). `movement1.dbgText()` builds it; final game has no HUD.

**Ladder** (four patterns, `{beat,verb}` on a 4-beat bar, in `movement1.js`): `BOOM . KA .` → `BOOM KA BOOM .`
→ `BOOM . TSS KA` → `BOOM TSS KA BOOM` (2→4 hits, with a rest).

**Turn-taking & scoring:** phrase = CALL bar (scoring off) → 1 breath beat → ANSWER bar (scoring on, eyes
brighten) → judge → short rest, all in beats off the clock. A hit scores only if its **verb matches** the
expected verb **and** it lands within the tuned window (`WIN_COUNTS`=±300 ms; ±120/±220 are the finer grades
the data carries) after subtracting the calibrated latency (`ev.t - latencyMs`, mapped via `perfAtBeat`).
Verb-match is enforced from the first pattern (the CALL demonstrates it). Extra/spurious hits count as errors.
`_END` and HOLD/HISS `replaces` upgrades are ignored — score on the attack, per the detector contract.

**Distance tug-of-war:** a **clean** answer (no misses, no extras) advances the ladder and pushes him back
(`+PUSHBACK`); a flawed answer keeps the pattern and steps him closer by the error count (capped `MISS_CAP`
per phrase, so one whiff isn't instant death). Clear the ladder → **win** (his augmented triad `resolve()`s to
major, he fades — "IT RESOLVES"). He reaches you (`distance ≤ DIST_MIN`, fills the screen) → **lose** ("THE
MAZE KEEPS YOU"), tutorial-forgiving restart from pattern 1 after ~3 beats. Win/lose text is the only on-screen
copy; otherwise audio + his size/eyes are the UI (no HUD). Debug (F) shows the answer grade.

**Tuning note:** the `drums.js` synth params were dev-tuned by ear (not mic-dependent, no bench). If the
per-hit distance step feels too punishing/lenient once played on a real mic, adjust `PUSHBACK`/`MISS_CAP`/
`DIST_*` in `movement1.js`.

---

## Snare "ka" verb — BUILT (defaults pending mic tuning)

Chose the **"kah"** (open-vowel) snare over a dry "k"/"kt" click: the click is bright and high-zcr —
TSS's corner of the feature space — whereas "kah" sits in the mid band at *moderate* zcr, cleanly separated
from all four other verbs, and its vowel makes onset detection robust on a cheap mic. Completes the classic
beatbox kit: kick (`BOOM`), hi-hat (`TSS`), snare (`KA`). **What remains is dialing the default
`kaMidShare` / `midHz` / `midQ` against a real mic in the bench, then committing those numbers.** Design
record below.

**Goal:** a beatbox **snare** — "kah" — as a new attack verb alongside `BOOM` and `TSS`, without
disturbing the tuned BOOM/TSS/HOLD/HISS.

**Why the current detector can't hear it.** The tilt axis measures only **low (<250 Hz)** vs
**high (>3 kHz)**. A snare's energy sits in the **mid band** — the /k/ burst peaks around ~1–2 kHz, and
the "ah" adds low-mid — so it registers as neither low- nor high-dominant. `tilt` lands near 0.5 and falls
into the zcr tiebreak, which today is forced to either BOOM or TSS. That ambiguous middle is exactly where
the snare lives, which is why "ka" currently misfires.

**Approach — add a mid band, make the attack classifier 3-way:**

1. **New mid-band analyser.** A bandpass biquad chain (two cascaded, matching the existing 24 dB/oct low/high
   chains) centered in the gap between the crossovers — roughly **~300 Hz–3 kHz**, center ~1.2 kHz — giving
   `eMid` alongside `eLow`/`eHigh`. During attack capture, track `maxMid` too.
2. **Classify on the three band peaks (argmax with margins).** Preserve BOOM/TSS's tuned tilt thresholds;
   `KA` only claims an attack when **mid clearly dominates both low and high** (e.g.
   `maxMid / (maxLow + maxMid + maxHigh)` above a tunable `kaMidShare`). So KA carves out the mid tiebreak
   zone rather than moving the BOOM/TSS boundaries — existing behavior should stay stable (but needs mic
   re-verification).
3. **KA is attack-only.** A snare is a hit, not a sustain, so KA does **not** spawn a sustain-watch (no
   HOLD/HISS upgrade). Event shape unchanged: `{ id, verb:'KA', t, tilt, zcr, level }`.

**Bench tuning (the workflow):** the bench exposes a `--ka` swatch, a **Mid share** readout (with the KA
line), a `mid` column in the event log, and three knobs — **Mid share above this = KA**, **Mid band center
(Hz)**, **Mid band width (Q)** — the last two written live onto the running bandpass. Dial "kah" in against
a real mic (the same way BOOM/TSS were tuned), then commit the settled `kaMidShare` / `midHz` / `midQ`
defaults into `voice.js`. Don't hand-guess final thresholds. **Resolved:** the bench now imports
`voice.js`, so there is one source of truth — no duplicated class to keep in sync.

**Open items:** verify BOOM/TSS are undisturbed at the tuned `kaMidShare` (the mid bandpass overlaps the
lower skirt of sibilance, so a bright "kt" could leak — the upper-Q/center is the guard); confirm a quick
"kah" never accidentally reads as the start of a HOLD (it can't upgrade, but the plosive still fires).

**Open questions for review:**

- **Which snare flavor?** Dry "k"/"kt" click (high zcr, mid-band burst, ~no vowel) vs. "kah" with an open
  vowel (some low-mid, lower zcr). "Something like a ka" reads as the vowel version — confirm. Affects the
  mid band center and whether zcr is a secondary cue.
- **Mid vs TSS separation** is the crux (both are un-low). May need the mid bandpass tuned tight and an
  upper guard so a bright "kt" doesn't leak into TSS.
- **Sync strategy:** patch both files, or refactor the bench to import the module first? **Resolved** —
  the bench imports `voice.js`.

**Superseded, partly:** the planned template matcher below takes over as the *primary* classifier. The
tilt/mid-share thresholds stay as the fallback path, so `kaMidShare`/`midHz`/`midQ` still want mic tuning
— just for the un-enrolled case rather than for everyone.

---

## Speaker-enrolled verb templates (MFCC + DTW) — BUILT

**BUILT 2026-08-12.** **Full replacement of the attack classifier with per-player templates, thresholds
kept as fallback**, enrollment **in the entry flow but skippable**. `MATCH_TH`/`MARGIN` defaults are
first guesses — **tune them in the bench against a real mic and commit the numbers**, exactly as with
BOOM/TSS/KA.

**Why.** Hand-tuning `tiltBoom`/`tiltTss`/`kaMidShare` picks one set of numbers for every mouth, every mic
and every room — and `KA` is the verb that suffers, because it lives in exactly the ambiguous middle the
two-pole tilt can't resolve. Kaimoju's probe (`kaimoju-mic-test.html`, `docs/kaimoju.md`) already proved the
alternative works offline: local MFCC + DTW matching against templates **the player records in their own
voice** hit ≥85% on five deliberately confusable Japanese onomatopoeia with 3 takes each. Three beatbox
verbs is a far easier problem than five words. Constraints hold — this is speaker-enrolled *timbre*
matching on the player's own recordings, **not speech recognition**, and nothing leaves the device.

**The one structural difference from Kaimoju.** The probe endpoints a whole utterance (RMS VAD →
`HANG_FRAMES` of silence → `finishUtterance`) and classifies *after the sound ends* — fine when the payoff
is a building collapsing, fatal here, where hits are scored to ±120 ms against `clock.js`. So the split is:

> **The onset detector keeps owning *when*. Templates only own *what*.**

`capture.t` and therefore `ev.t` are untouched, so `movement1.js` scoring, `latencyOffsetMs` and the
HOLD/HISS sustain path all keep working exactly as they do today.

### Module split

- **`augminotaur/verbmatch.js`** — `VerbMatcher`: mel filterbank + DCT (`frame()`), `cmn`, `resample`,
  `dtw`, and the template store. **Ported from `kaimoju-mic-test.html`**, which is working tuned code —
  same rule as the detector: don't reinvent it. Kept Augminotaur-local rather than shared with Kaimoju:
  that file is a standalone POC and coupling two games through it buys nothing yet.
- **`voice.js`** — owns a `VerbMatcher`, keeps the MFCC ring, and routes attacks through `judge()`.
- **`calibrate.js`** — the enrollment ritual (and, now, the rAF pump — see below).
- **`augminotaur-input-bench.html`** — the Enroll panel: take counts, live per-verb distances,
  `MATCH_TH`/`MARGIN` sliders, and a per-hit tag in the log showing which classifier decided.

### Features and matching

- **Frames** off the existing `aFull` analyser via `getFloatFrequencyData`: `NUM_MEL=26`, `NUM_MFCC=13`,
  80 Hz–8 kHz, same as the probe. `aFull.fftSize` stays **1024** (the probe uses 2048) — the ~21 ms window
  is what the onset detector needs; the filterbank is built off the live `frequencyBinCount` so nothing
  hardcodes a bin count.
- **Two windows, not one.** `captureMs=55` still measures tilt/mid/zcr (the fallback features are computed
  exactly as before); `classifyMs=110` is the longer window the templates need (~7 rAF frames — 55 ms is
  only ~3, too thin a spectrogram for a burst). The timestamp is still `c.t`, so **only the emit is later**,
  by ~55 ms, and only when templates are active. Scoring is unaffected; the visible cost is the sprite lunge
  reacting slightly later.
- **CMN per burst**, then resample to `NORM_FRAMES=8` — kills mic/level offset and normalises burst length.
- **DTW** for the distance. Overkill for a plosive on its own, but it's free (ported) and burst lengths
  genuinely vary between a lazy "tss" and a sharp one. 3 verbs × 3 takes is trivial cost per hit.
- **Decision** (`VoiceInput.judge`): best distance across each verb's takes; accept if `bestD < matchTh`
  **and** `bestD/second < margin`; otherwise fall through to the threshold cascade. **Never drop the hit** —
  a dropped real hit reads as a miss in `movement1.js`, which is worse than a misclassification. Events
  gain `path` (`template` / `fallback` / `threshold`) plus `dist`/`per` for the readouts; the game's F
  readout shows `BOOM·T` / `BOOM·F`.
- **`ready()` is re-checked at the decision site**, not just when routing, so a partial set can never
  decide a hit.

### Storage

`localStorage["augminotaur.verbTemplates.v1"]` = `{BOOM:[take…], TSS:[…], KA:[…]}`, each take an array of
13-dim frames; `MAX_TAKES=3`. Versioned key so a feature change invalidates cleanly. **All-or-nothing:** if
the parse fails or *any* verb has zero takes, the whole template path switches off and the thresholds run —
a partial set would bias every hit toward the verbs that happen to be enrolled.

### Enrollment (in-flow, skippable)

Slots into `calibrate.js` **after the noise floor** (it needs the gate) and **before the latency clicks**
(the clicks are the boring part; a player who bails has still given us the valuable half).

> **AUGMINOTAUR** → tap to descend → **"Be silent…"** (noise floor) → **"Speak in his tongue"** (enroll) →
> **"Listen…"** (latency) → enter

Three prompts, three takes each (~15 s), progress dots, in-theme copy, with a visible skip (*"three sounds
— tap to skip"*) and an 8 s per-take silence timeout that also bails. Ends on **"He knows your voice."** or
**"He will misunderstand you."** A returning player with a full stored set skips the step entirely;
force a re-enroll with **`?enroll=1`** (fresh takes evict the old ones via `MAX_TAKES`).

**Each take is captured by the same onset detector the game uses** — `vi.enrollNext(verb)` arms it, the
next real attack is stored, and an `ENROLL` event (`silent:true`, so `movement1.js` and the verb readout
drop it) reports back. Deliberate departure from the probe, which uses one RMS VAD for both paths:
enrolled frames have to come from the exact code path that will produce the frames they're matched
against, or the templates encode the recorder rather than the mouth.

### Two implementation notes worth keeping

**The MFCC ring, not per-capture collection.** `refractMs=80` is shorter than the 110 ms classify window,
so a fast second hit arrives while the first is still being judged. Frames therefore go into a rolling
600 ms ring (`mfccRing`), and an attack pulls its own window out of it by timestamp (`mfccWindow`). The
capture slot is released at 55 ms and the attack moves to a `pending` queue, so **an in-flight
classification never blocks the next onset**. Raising `refractMs` instead would have cost real drumming
speed. The ring only runs when templates are active (nothing enrolled = zero added cost, and behaviour is
bit-for-bit what it was before).

**Nothing was pumping the detector during the entry flow.** `main.js` only starts calling `vi.update()`
once `runEntry` resolves, so no onset event could fire while the overlay was up. Enrollment needs
events — and so did the latency measurement, which means **the four latency clicks were never being
heard**: `measureLatency` always timed out and fell back to a 0 ms offset, indistinguishable from the
documented headphone case. `calibrate.js` now runs its own rAF `pump(vi)` for the duration of the overlay
and hands off to `main.js` at `finish()`. Latency measurement should actually work now (on speakers);
worth re-checking what offset it reports.

### Open items

- **Tune `matchTh` (34) and `margin` (0.80) in the bench** — both are unverified first guesses. Watch the
  live per-verb distance columns while drumming each verb; `matchTh` wants to sit above your worst true
  match and below your best false one, and `margin` rejects the ties. Then commit the numbers into
  `verbmatch.js`.
- **BOOM vs. the start of a HOLD.** A sustained "aaah" spends its first 110 ms looking like something the
  matcher will judge. The sustain upgrade keys off the emitted `id` so the mechanism still works; enroll
  BOOM with short "buh" takes only and let the sustain watch do its job.
- **Mic/room drift** — templates recorded on the laptop mic, then played with headphones plugged in. The
  fallback covers it; an automatic "re-enroll?" prompt when the match rate collapses is deferred.
- **Three takes may not be enough** for a verb you produce inconsistently. `MAX_TAKES` is one constant in
  `verbmatch.js` if the bench says otherwise.

---

## TENTATIVE — Procedural maze + voice-only traversal (parked)

Brainstormed, not committed. Kept here so the architecture doesn't design them out.

### Procedural maze

Swap the hardcoded `map.js` grid for a generator emitting the same format (low risk — the raycaster just
reads a grid). Leading directions:

- **Braided maze (loops, few/no dead ends).** Matches "the labyrinth loops because the chord never
  resolves," and avoids dead-end death-traps against a pursuer. Simplest to generate well.
- **Three-winged (embody the triad).** Central hub + three identical wings (generate one, mirror thrice):
  three symmetric chambers, no root, no obvious exit — the topology *says* the augmented chord. Use three
  rectangular wings off a plus hub (true 120° rotation fights a square grid).
- **Seeded RNG** (mulberry32 + hashStr, as in Critter Hunt): fresh per run by default, but a seed keeps a
  shareable/daily maze open for free.

### Voice-only traversal

The core tension: movement and the beatbox fight both want the one voice channel. The trap is *two* input
paradigms (analog steering to walk, rhythmic drumming to fight) → mode confusion. The fix is to **make
movement and combat the same skill.** Candidate models:

- **Rhythmic voice tank-controls (leading).** The world pulses (the M3 wall-shading metronome). On each
  pulse the last mouth-verb resolves into a grid action — `BOOM`=forward, `TSS`=turn-right, `HOLD`=turn-left,
  `HISS`=back. Voice-only, **no new DSP**, and it *is* the beatbox tutorial: you've been drumming to walk the
  whole maze, so when the Augminotaur corners you the same verbs answer his patterns — one language, no mode
  switch. (A new snare `KA` gives a fourth clean action here — e.g. a distinct turn or interact.)
- **Sung-pitch steering (reserve for the finale).** Hold a note; pitch steers, loudness = speed —
  atmospheric but analog (fights grid-step) and needs a **new pitch tracker (YIN/autocorrelation)** the
  detector doesn't have. Better as Movement 3's "Seam" (jam a sustained note to resolve the chord) than as a
  walking control.
- **Echolocation.** BOOM and the maze echoes what's open. Deeply on-theme, subtle on a phone speaker, lots of
  work — later flavor.

**Open forks (unanswered):** which traversal model; maze character; whether the maze is an exploration phase
*before* the fight or the Augminotaur hunts through it; how to keep constant vocalizing from tiring the
player (e.g. input only at junctions, not every cell).
