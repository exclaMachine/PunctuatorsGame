# Handoff — Augminotaur level

Paste this into Claude Code as the opening message. Drop `augminotaur-input-bench.html` in the repo root first so it can read the working detector.

---

I'm building a voice-controlled horror game for mobile and desktop browsers. Read `augminotaur-input-bench.html` in the repo root before writing anything — it contains a working `VoiceInput` class that is the foundation of the whole project, and it has already been tuned against a real microphone. Don't reinvent it.

## Hard constraints

- **No network at runtime, ever.** No third-party APIs, no cloud speech-to-text, no CDN fonts, no analytics. The game must work fully offline after first load. Web Audio, Canvas, and `getUserMedia` are fine — they're local browser APIs.
- **No speech recognition.** The game listens to *how* the player sounds, not *what* they say: pitch, rhythm, loudness, timbre. This is a deliberate design constraint, not a limitation to work around.
- **Retro pixel, first-person.** Wolfenstein-style raycaster on a low-resolution canvas (target 320×200 internal, upscaled with `image-rendering: pixelated`). Grid-aligned labyrinth.
- **Mobile-first.** Portrait, touch for movement, voice for everything else. Assume a cheap phone mic and 100+ ms of audio latency.
- No build step if avoidable — vanilla ES modules served statically. Keep it something I can open in a browser and debug.

## What the detector does

`VoiceInput` emits four "mouth verbs" that any untrained player can produce on the first try:

| Verb | Player does | Detected by |
|---|---|---|
| `BOOM` | "buh" / "puh" | transient, energy below 250 Hz (tilt high) |
| `TSS` | "ts" / "ss" | transient, energy above 3 kHz (tilt low) |
| `HOLD` | sustained "aaah" | voiced (low zero-crossing rate) lasting past ~250 ms |
| `HISS` | sustained "shhh" | unvoiced sustain — reserved, not used this level |

Important behaviour to design around: **`HOLD` arrives late.** A sustained note's attack is indistinguishable from a `BOOM`, so the detector fires `BOOM` immediately to keep rhythm honest, then emits a `HOLD` with a `replaces: <id>` field once the note outlives the sustain threshold. Always score sustained notes on `ev.t` (when the note *started*), never on when the event arrived.

Event shape: `{ id, verb, t, tilt, zcr, level, replaces? }`. `t` is a `performance.now()` timestamp. `*_END` events carry `duration` and should not count as hits.

Also non-negotiable, and already handled in the bench — keep it that way: `getUserMedia` must request `echoCancellation:false, noiseSuppression:false, autoGainControl:false`. All three default to on and all three destroy the signal (noise suppression literally deletes "tss").

## The level

The player is trapped in a labyrinth with the **Augminotaur**, a creature that drones an augmented triad. An augmented chord is three notes spaced identically — no root, no resolution, perfectly symmetrical. The labyrinth loops because the chord never resolves. Escaping means resolving it.

The level has multiple solutions. **Build the beatbox route first**; the others come later and should not be designed out of existence by the architecture.

### The beatbox fight, in three movements

1. **Mimicry.** He stomps a rhythm; the player echoes it. Strict turn-taking — he is silent while the player answers, so his drums can't trigger the player's own onset detector. Patterns grow from 2 hits to 4 with a rest. This is the tutorial.
2. **The Groove.** He locks into a loop and stops waiting. The player must maintain a counter-rhythm continuously underneath while he throws fills and fake-outs. Three consecutive misses collapses the groove. This is where it becomes a fight — endurance, not memory.
3. **The Seam.** His loop is three beats long: symmetrical, no downbeat, nothing to grab. The player must find where the loop restarts and jam a `HOLD` into it. Three successful seams and the symmetry breaks; he resolves and dies.

### Systems

- **Damage is distance.** No health bar. Each miss steps him closer down the corridor; each clean phrase pushes him back. In the raycaster he simply renders larger, and his drums get louder and drier as the reverb wet/dry mix shifts. When he fills the screen, the player is dead. Audio *is* the UI — there should be no HUD.
- **The world pulses on the beat.** Wall shading brightens a few percent on each downbeat, giving the player a visual metronome. When they start failing, take it away and let the corridor go still.
- **He plays the player back to themselves.** Keep a rolling buffer of mic input. On a clean phrase, replay a snippet of the player's own recorded voice, pitched down and slightly wrong. Cheap, offline, genuinely unsettling.
- **Mercy is menacing.** If the player is failing badly, he stops stomping and hums a slow lullaby in time. Comfort as a threat.

### Tuned numbers — start here, don't guess new ones

- Tempo 76 BPM opening, ceiling ~110.
- Timing windows: ±120 ms perfect, ±220 ms good, ±300 ms counts, beyond that a miss.
- Refractory period 80 ms (below this one plosive registers as two).
- Sustain threshold 250 ms for `HOLD`.
- Latency calibration is mandatory on level entry. The bench measures it by playing a click and listening for it; port that. Subtract the offset from every hit or the game feels broken on phones.

## Known problem I want solved, not papered over

In Movement 2 he drums while the player drums, so game audio bleeds into the mic. Options, roughly in order of preference: require headphones (make it diegetic — "put on the mask"), duck his loop during input windows, or spectrally subtract the known playback signal. Prototype assuming headphones, then tell me whether the phone-speaker case is salvageable before we design around it.

## First milestone

Don't build the whole level. I want, in this order:

1. A raycaster rendering a hardcoded 16×16 grid labyrinth at 320×200, with touch/keyboard movement and a solid 60 fps on mobile.
2. `VoiceInput` extracted from the bench into its own module, unchanged in behaviour, with the calibration flow wired into level start.
3. A beat clock driven by `AudioContext.currentTime` (not `setTimeout`) that everything else schedules against, with the wall-shading pulse hanging off it.
4. Movement 1 only — call and response, four patterns, win and lose states.

Stop after each step and show me. Ask before adding dependencies. If something in the design above fights the architecture, say so rather than quietly working around it.
