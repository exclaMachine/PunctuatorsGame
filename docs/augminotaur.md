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
| M3 — `AudioContext.currentTime` beat clock + wall-shading pulse | not built |
| M4 — Movement 1 (call & response, 4 patterns, win/lose) | not built |
| Snare **"ka"** verb (this doc, below) | **designed, not built** |
| Procedural maze + voice-only traversal | **tentative** (parked — see below) |

## Architecture

ES-module split so audio/game systems drop in without a rewrite:

- `augminotaur.html` — shell: 320×200 pixelated canvas, three thumb buttons, the entry/calibration
  overlay, and two debug readouts (FPS + last mouth-verb, toggle `F`). No HUD in the final.
- `augminotaur/main.js` — wiring + game loop. Runs the entry flow at load, pumps `vi.update()` each
  frame once the mic is live, stashes `vi.latencyOffsetMs` for the coming beat clock.
- `augminotaur/map.js` — the labyrinth grid + spawn (currently a hardcoded 16×16: outer ring + central plus).
- `augminotaur/player.js` — grid-step/tank movement (90° snap-turns, one-cell steps, dt-tweened, wall-bump nudge).
- `augminotaur/raycaster.js` — DDA raycaster, flat-shaded walls with a `light` multiplier ready for the beat pulse.
- `augminotaur/input.js` — keyboard (arrows/WASD) + touch intents.
- `augminotaur/voice.js` — the detector (below), extracted verbatim from the bench.
- `augminotaur/calibrate.js` — the entry overlay + calibration flow (below).

## The detector (`VoiceInput`)

Offline mouth-verb detector, tuned against a real mic in `augminotaur-input-bench.html` (sliders + a live
scope). **Don't reinvent it; tune it in the bench, then port settled constants to `voice.js`.**

Four verbs today:

| Verb | Player does | Signature |
| --- | --- | --- |
| `BOOM` | "buh" / "puh" | transient, energy **below 250 Hz** (tilt high) |
| `TSS`  | "ts" / "ss"   | transient, energy **above 3 kHz** (tilt low) |
| `HOLD` | sustained "aaah" | voiced (low zero-crossing rate), outlives the ~250 ms sustain threshold |
| `HISS` | sustained "shhh" | unvoiced sustain — reserved, not used this level |

How it decides an attack: two cascaded biquads each isolate a **low** band (lowpass 250 Hz) and a **high**
band (highpass 3 kHz). `tilt = eLow / (eLow + eHigh)` — high tilt = BOOM, low tilt = TSS, and the
ambiguous middle is broken by zero-crossing rate. **`HOLD` arrives late by design:** a sustained note's
attack is indistinguishable from a `BOOM`, so `BOOM` fires immediately (keeps rhythm honest) and a `HOLD`
is emitted later with a `replaces:<id>` field once the note outlives the sustain threshold. **Always score
sustained notes on `ev.t`** (when the note started), never on arrival. Event shape:
`{ id, verb, t, tilt, zcr, level, replaces? }`; `*_END` events carry `duration` and don't count as hits.

`getUserMedia` requests `echoCancellation:false, noiseSuppression:false, autoGainControl:false` — all three
default on and all three destroy the signal (noise suppression literally deletes "tss"). Never change that.

### Calibration entry flow (`calibrate.js`)

`getUserMedia` + `AudioContext` need a user gesture, so the descent starts behind a tap. In-theme guided
overlay: **AUGMINOTAUR → tap to descend → "Be silent…"** (1.6 s noise-floor calibration, runs inside
`start()`) **→ "Listen…"** (four latency clicks played and heard back through the mic). Latency measurement
needs the speaker→mic acoustic path, so it **fails on headphones** — that's expected: graceful fallback to a
0 ms offset with a tap-to-retry. The diegetic "put on the mask" framing for the headphone case is deferred.
Measured offset is stashed as `vi.latencyOffsetMs` for the beat clock to subtract from every hit.

---

## DESIGN — Snare "ka" verb (proposed, not built)

**Goal:** add a beatbox **snare** — "ka" (velar plosive + open vowel) / dry "k" / "kt" — as a new
attack verb alongside `BOOM` and `TSS`, without disturbing the tuned BOOM/TSS/HOLD/HISS. Completes the
classic beatbox kit: kick (`BOOM`), hi-hat (`TSS`), snare (`KA`).

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

**Bench-first tuning (the workflow, non-negotiable):** add `KA` to the verb legend + a `--ka` swatch, a
mid readout/lane on the scope, and knobs (`kaMidShare`, mid band center/width) mirroring the existing knob
pattern (`kBoom`/`kTss`/… table). Dial "ka" in live against a real mic — the same way BOOM/TSS were tuned —
**then** port the settled constants into `voice.js`. Don't hand-guess final thresholds.

**Note — bench/voice.js are duplicated.** `voice.js` is a verbatim copy of the bench's inline `VoiceInput`.
Any detector change must land in both (or, cleaner, refactor the bench to import `voice.js` — decide before
coding).

**Open questions for review:**

- **Which snare flavor?** Dry "k"/"kt" click (high zcr, mid-band burst, ~no vowel) vs. "kah" with an open
  vowel (some low-mid, lower zcr). "Something like a ka" reads as the vowel version — confirm. Affects the
  mid band center and whether zcr is a secondary cue.
- **Mid vs TSS separation** is the crux (both are un-low). May need the mid bandpass tuned tight and an
  upper guard so a bright "kt" doesn't leak into TSS.
- **Sync strategy:** patch both files, or refactor the bench to import the module first?

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
