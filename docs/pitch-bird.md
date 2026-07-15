# Pitch Bird — sing to fly

**Entry file:** `pitch-bird.html` · **Status:** in development, **not yet shipped to production**

A voice-controlled singing game in the Flappy-Bird lineage — except the bird's **height is
controlled by the pitch of your voice** (higher pitch = higher bird). Pure vanilla JS + HTML
Canvas + the Web Audio API. No frameworks, no external requests, no build step; it runs offline
from a single self-contained file.

---

## What it is

Two modes share one playfield:

- **Obstacle mode** — Flappy-style scrolling pipes. You thread the gaps by singing higher or
  lower. Score = gaps cleared; a best-score readout persists for the session.
- **Song mode** — karaoke. UltraStar-format target notes scroll right-to-left with their
  syllables; you sing each note as it reaches the "now" line at the bird's x. Note bars turn
  **green** when your live pitch matches, and the game scores how many notes you held in tune,
  ending with a final percentage. Includes a **3-2-1 count-in** before the first note.

The playfield shares a single coordinate space across everything:

- A live **note-name + cents tuner** readout sits in the HUD (big note name, cents-off needle).
- An in-canvas **staff** (faint horizontal note lines, one per semitone in range) is drawn in the
  *exact same* vertical mapping as the bird — so where the bird sits visually equals the note it
  represents.
- A right-hand **gutter** prints the note-name scale (C4, D4, …) and highlights the note you're
  currently singing, drawing a marker line across to the bird.

---

## How pitch works (read this before touching the audio math)

- The mic is captured via `getUserMedia`. Each animation frame, pitch is detected by
  **autocorrelation** over the `AnalyserNode`'s time-domain data (`detectPitch`) — a classic ACF
  with parabolic-interpolation refinement and an RMS silence gate.
- Detected frequency is mapped to a **vertical Y position logarithmically** across a configurable
  MIDI range (`rangeMin` / `rangeMax`), because musical pitch is logarithmic — each octave doubles
  the frequency. See `freqToY`:

  ```js
  function freqToY(f) {
    const t = (Math.log(f) - Math.log(fMin)) / (Math.log(fMax) - Math.log(fMin));
    const tc = Math.max(0, Math.min(1, t));           // clamp to playfield
    return playBot - tc * (playBot - playTop);
  }
  ```

- The live frequency is lightly smoothed (`smoothFreq`) for a stable note readout, and the bird
  eases toward its target Y (`smoothing`, the "glide" slider) so the motion isn't jittery.

### Player-facing tuning features

- **Calibration** (Yousician-style) — the *Calibrate range* button walks the singer through
  "sing your lowest note" then "sing your highest note" (each with a lead-in + hold count), takes
  the **median** of the collected pitches, pads a couple semitones of headroom, and sets the
  range. Bad/degenerate input (high ≤ low) is rejected with a retry prompt.
- **Manual range** — two dropdowns (Lowest / Highest note, C2..C6) set `rangeMin`/`rangeMax`
  directly. `applyRange` clamps them to keep at least ~5 semitones of span.
- **Transpose** — a ±12-semitone slider shifts a *song's* target notes into the singer's range
  (song mode only). Re-fits the visible range around the transposed notes.
- **Glide / smoothing** — how fast the bird chases the target Y (5–40% per frame).
- **Gap size** — obstacle-mode pipe gap in px (120–260).
- **Drift down when silent** — optional gentle "gravity" in obstacle mode: when no voice is
  detected the bird sinks, so silence isn't a safe hover.

---

## ⚠️ Gotchas — audio bugs that cost hours (do not reintroduce)

These are the hard-won reasons the audio graph is built the way it is. The code carries inline
comments at each spot; this section is the index so nobody "simplifies" one back into a bug.

1. **Keep the audio nodes alive in outer scope.** `micStream`, `micSource`, `silentGain`, and
   `micTrack` are module-scoped on purpose. If they're local to `initMic`, Chrome
   garbage-collects them after the function returns and the analyser **silently reads zeros** —
   the classic "mic granted, red dot on, but nothing happens."

2. **Route the graph all the way to the speakers.** The chain is
   `source → analyser → muted GainNode (gain 0) → audioContext.destination`. Safari (and recent
   Chrome) won't pull audio through an `AnalyserNode` that isn't connected through to
   `destination`. The **muted** gain means the graph is actively pulled (audio flows) with **no
   audible echo**.

3. **Match the AudioContext sample rate to the mic track's rate.** On macOS the mic commonly
   runs at 48000 while the context defaults to the 44100 output rate; that mismatch makes the
   source node emit **pure silence** (live, unmuted track, but all-zero samples). We read
   `track.getSettings().sampleRate` and do `new AudioContext({ sampleRate })`.

4. **Request the mic plainly: `getUserMedia({ audio: true })`.** Do **not** request
   `echoCancellation:false` / `noiseSuppression:false` / `autoGainControl:false` — Safari
   immediately **ends** the track (`readyState === "ended"`) if you do. The browser's default
   processing is fine for pitch detection.

5. **Secure context required.** The mic only works over `https://` or `http://localhost`. Opening
   via `file://` gives an opaque origin and can deliver a silent/blocked stream. **In production
   this must be served over HTTPS.** (`showError` special-cases this and tells the user to serve
   from localhost or download + open in Chrome.)

6. **A wedged audio service is machine state, not a code bug.** If a single browser (often Chrome
   on macOS) gives silence even when everything above is correct, its audio service can be locally
   wedged — restart it (`chrome://restart`, or Task Manager → *Utility: Audio Service* → End
   process). This does **not** affect other users' browsers, and no code change fixes it.

Supporting robustness already in place: `micTrack.onended` (`onMicEnded`) re-prompts if another
tab/app steals the mic (Safari allows only one at a time), and a live **diagnostics line** under
the canvas prints device label, muted/readyState, context state, and input level for debugging
dead-mic reports.

---

## Song format — the UltraStar `.txt` parser

Song mode loads the **UltraStar** karaoke `.txt` format. A built-in public-domain demo,
*Twinkle, Twinkle, Little Star*, ships in the file so song mode works out of the box; users can
also **load their own `.txt`** from disk via the song selector.

### Format

- **Metadata lines** start with `#`: `#TITLE`, `#ARTIST`, `#BPM`, `#GAP`, `#LANGUAGE`, etc.
- **Note lines**: `TYPE  startBeat  lengthBeat  pitch  syllable`
  - `TYPE` — `:` normal, `*` golden, `F` freestyle.
  - `-` on its own is a **phrase break**; `E` **ends** the song.
  - `pitch` is **MIDI minus 60**, so `0` = middle C / C4.
- **Timing**: beat duration in ms = `15000 / BPM` (UltraStar beats are ¼ of a BPM beat). A note's
  start time = `GAP(ms) + startBeat * beatMs`.
- **Word boundaries**: a syllable that **begins a new word** carries a **leading space** in its
  text; continuation syllables do not. The parser preserves this exactly — it's what the
  (planned) mad-libs feature keys off of.

### Parser output

`parseUltraStar(text)` returns `{ meta, notes[], lastEndMs }`. Each note is normalized to:

```js
{ type,               // 'normal' | 'golden' | 'freestyle'
  startBeat, lenBeat,
  midi,               // absolute MIDI (parsed pitch + 60)
  text,               // syllable, leading space preserved for new words
  startMs, durMs, endMs,
  hitMs, done, hit }  // scoring state, filled during play
```

Notes are sorted by `startMs`. Duet player markers (`P1`/`P2` lines) are skipped — single player
only. Song mode scrolls these notes and scores your held pitch against them
(`NOTE_TOL = 1.5` semitones tolerance; you must hold a note in tune for `HIT_FRAC = 0.35` of its
duration to clear it).

---

## Mad-libs hook — planned, seam already in place

Every syllable is passed through `applyLyricTransform(text)` before it's drawn. **It currently
returns the text unchanged** (a no-op). This is the deliberate seam for the future mad-libs
feature (players substitute words to make parodies):

```js
// Syllables that begin a new word carry a leading space in n.text, so you can
// group syllables into words and swap them here later. Currently a no-op.
function applyLyricTransform(s) { return s; }
```

To build it: group syllables into words using the leading-space word-boundary flag, swap words,
and the new lyrics render automatically wherever `applyLyricTransform` is already called (the
scrolling labels and the big active-line lyric).

---

## Content / copyright notes

*General information, explicitly **not legal advice.** Included so nobody bundles infringing
content into a public build.*

- A song carries **two separate copyrights**: the **composition** (melody + lyrics) and the
  **recording**. They expire on different timelines.
- The **melody is copyrighted on its own.** Putting new lyrics on a copyrighted melody is a
  derivative work that generally needs permission. Mad-libs word-swapping does **not** change
  that, and legally reads as **satire** (unprotected) rather than **parody** (which must comment
  on the original work itself).
- **Safe path — use public-domain melodies.** As of 2026, US compositions published in **1930 or
  earlier** are public domain; traditional / folk / nursery / classical tunes are free. Tom
  Lehrer released his entire catalog to the public domain. Recordings enter the public domain
  *later* than compositions, so **synthesize/generate your own audio** rather than bundling old
  recordings.
- **Ship only public-domain content yourself; let users import their own `.txt`** for newer
  songs, so the rights decision sits with the user. The bundled demo (Twinkle) is public domain.

---

## Deployment notes

- It's **one static file** — drop it into the site and **serve over HTTPS** (see Gotcha #5).
- The browser prompts for mic permission on the first *Enable microphone*. Mic behavior varies by
  browser / OS / hardware.
- **Recommended before launch:** a start-screen "can you hear me?" mic-level check, so users with
  audio issues get a clear message instead of a dead game. (A live level meter already exists in
  the control bar; this would surface it up front.)

### Offline / Raspberry Pi (future target)

- Fully offline-capable: **no network calls.** `localhost` is served from the device itself, so
  the secure-context requirement is met without internet.
- A Pi needs a **USB microphone** (no built-in mic). Launch Chromium in kiosk mode with
  `--use-fake-ui-for-media-stream` to auto-allow the mic.
- Pi 4/5 handle the current autocorrelation detector fine; older Pis may need a lighter detector
  or a smaller buffer.

---

## Pixel-art plan (future design note)

Target a low virtual resolution — **480×270** (clean 16:9, whole-number scaling to 1080p) — and
scale up with nearest-neighbor: `ctx.imageSmoothingEnabled = false` and `image-rendering:
pixelated` on the canvas. Sprite sizing: bird ~24×24; pipes as a **cap** plus a **repeatable
shaft tile**; a ~**5×7 pixel font** for note labels. Export sprites as PNG.

---

## Roadmap / TODO

- Wire up the **mad-libs word-swap** on the existing `applyLyricTransform` hook.
- Add more **public-domain demo songs** + a short **`.txt` authoring guide**.
- Build the **sprite / pixel-art rendering pipeline** (see plan above).
- Add the **start-screen mic check**.
- **Refine song scoring** (tolerance curve, golden notes, streaks).

---

## Key functions & entry points

Everything lives in one IIFE inside the single `<script>` in `pitch-bird.html`. Where to look:

**Audio / pitch**
- `initMic` — builds the whole audio graph; carries Gotchas #1–#4 inline.
- `onMicEnded` — re-prompt when the mic track ends (stolen/stopped).
- `showError` — maps `getUserMedia` failures (incl. insecure context) to user messages.
- `detectPitch(buf, sampleRate)` — autocorrelation pitch detector with RMS silence gate.

**Musical mapping**
- `midiToFreq` / `freqToMidi` / `midiName` / `isSharp` — note math helpers.
- `applyRange` / `nearestOption` — clamp and set the active pitch range.
- `freqToY` — the log-scale pitch → screen-Y mapping (the heart of the game).

**Game loop & state**
- `frame(now)` — the single `requestAnimationFrame` loop: read pitch → move bird → update the
  active mode → draw. State machine `S = { IDLE, READY, PLAY, OVER, CAL }`.
- Obstacle mode: `resetGame`, `spawnPipe`, `hit`, `gameOver`.
- Song mode: `startSong`, `resetSong`, `activeNote`, `finalizeNote`, `songComplete`,
  `fitRangeToSong`.

**Song data / parsing**
- `TWINKLE` — bundled public-domain demo song (UltraStar text).
- `parseUltraStar(text)` — the format parser (see Song format above).
- `applyLyricTransform(s)` — **mad-libs seam (no-op today).**
- `loadSongText` / `fileInput.onchange` — load the demo or a user `.txt`.

**Rendering**
- `draw` — top-level frame render (sky, staff, mode content, bird, gutter).
- `drawStaff` — the semitone note lines (shared Y space with the bird).
- `drawSong` — scrolling target notes, syllable labels, active-line lyric, count-in.
- `drawPipe`, `drawBird`, `drawGutter`, `roundRect` (guards against negative-radius crash).

**Tuner / readout**
- `updateReadout` — HUD note name, cents, needle, in-tune/sharp/flat label.

**Calibration**
- `startCalibration` / `updateCal` / `finishCalibration` / `median` — the sing-low-then-high
  range calibration flow.

**Flow / UI wiring**
- `enableMic`, `startPlay`, `showOverlay` / `showOverlayCal` — overlay + button flow.
- `resize` — DPR-aware canvas sizing; recomputes `playW` / `playTop` / `playBot`.
- Event handlers at the bottom wire the buttons, dropdowns, sliders, song selector, and file
  input.
