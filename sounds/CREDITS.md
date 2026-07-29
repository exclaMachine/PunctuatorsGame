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

**Instruments bundled (20 pitched, → GM folder):**
- *Core:* trumpet · violin · Guitar=`acoustic_guitar_nylon` · Sax=`tenor_sax` · flute · Bell=`tubular_bells` · banjo.
- *Obscure / world set (added 2026-07-29):* shamisen · koto · shakuhachi · sitar · Shehnai=`shanai` · bagpipe ·
  kalimba · marimba · glockenspiel · celesta · harpsichord · dulcimer · Harp=`orchestral_harp`.

(Drum/Conga percussion stay on the synth for now — unpitched.)

Re-fetch / add instruments with `fetch-instrument-samples.sh` in the repo root.

If strict CC0 is required later, swap to **VSCO2 Community Edition** or **VCSL** (both CC0) — the
loader and folder layout stay identical.

---

# Bundled animal sample credits

The animal vocalisations in `sounds/animals/<slug>.mp3` are **hand-curated from Wikimedia Commons**
(one clip per animal), then trimmed to a short one-shot, downmixed to mono, loudness-normalised, and
re-encoded to mp3 by `fetch-animal-samples.sh`. Used by **Critter Hunt** (▶ each animal) and available
to feed **Mujicians'** Sound Collection.

Full machine-readable manifest (author + source page + license per clip): **`data/critter-credits.json`**.
All sources are **CC0 / Public-domain / CC-BY-SA** — none are ND, so they're safe to re-pitch/loop.

| Animal | Source (Commons) | Author | License |
| --- | --- | --- | --- |
| Fox | *Vulpes vulpes* … XC108315 | Alexander Kurthy | CC BY-SA 4.0 |
| Frog | Single Frog Croak | MichaeltheFox8621 | CC BY-SA 4.0 |
| Parrot | *Ara severus* — Chestnut-fronted Macaw XC519607 | Oliver Komar | CC BY-SA 4.0 |
| Elephant | Elephant voice - trumpeting | தகவலுழவன் | CC0 |
| Snake | Rattlesnake | (public domain) | Public domain |
| Owl | *Bubo virginianus* — Great Horned Owl XC450919 | Michael & Katie LaTour | CC BY-SA 4.0 |
| Turtle | tortoise vocalisation (grunt) | Amada44 | CC BY-SA 3.0 |
| Bat | Hoary bat chirp recording | Kaldari | CC0 |
| Dolphin | dolphin call (Caribbean) | Félix Blume | CC0 |
| Cricket | Field cricket *Gryllus pennsylvanicus* | Thatcher | CC BY-SA 3.0 |

Re-fetch / re-trim with `fetch-animal-samples.sh` (edit a row's start/dur to change the window).
