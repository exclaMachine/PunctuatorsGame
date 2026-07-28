# Bundled instrument sample credits

The instrument samples in `sounds/instruments/<name>/<Note>.mp3` come from the **FluidR3_GM**
General-MIDI soundfont (by Frank Wen), sliced into per-note mp3s by the
**gleitz/midi-js-soundfonts** project.

- Source: https://github.com/gleitz/midi-js-soundfonts (FluidR3_GM branch)
- License: FluidR3_GM is a free, widely-redistributed GM soundfont; the midi-js-soundfonts
  packaging is MIT. Fine for a free educational game with this attribution.
- Format: one mp3 per note, ~25 KB each. **Black keys are named with FLATS** (Eb, Gb, etc.),
  not sharps. MIDI 60 = `C4`, A4 = 440 Hz.

**Anchor set (what's bundled):** one sample every 3 semitones across C3–C6 — 13 notes:
`C3 Eb3 Gb3 A3 C4 Eb4 Gb4 A4 C5 Eb5 Gb5 A5 C6`. At playback the nearest anchor is pitch-shifted
≤1.5 semitones (`playbackRate`) — indistinguishable from per-note sampling in testing, ~⅓ the files.

**Instruments bundled (7 pitched, → GM folder):**
trumpet · violin · Guitar=`acoustic_guitar_nylon` · Sax=`tenor_sax` · flute · Bell=`tubular_bells` · banjo.
(Drum/Conga percussion stay on the synth for now — unpitched.)

Re-fetch / add instruments with `fetch-instrument-samples.sh` in the repo root.

If strict CC0 is required later, swap to **VSCO2 Community Edition** or **VCSL** (both CC0) — the
loader and folder layout stay identical.
