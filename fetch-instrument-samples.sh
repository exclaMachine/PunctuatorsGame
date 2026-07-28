#!/usr/bin/env bash
# Fetch the ANCHOR instrument samples used by Critter Hunt + Mujicians, from the gleitz
# midi-js-soundfonts mirror of the FluidR3_GM soundfont, into sounds/instruments/<name>/<Note>.mp3.
#
# We keep ONE sample every 3 semitones across C3–C6 (13 notes) and pitch-shift the nearest one at
# playback (playbackRate, ≤1.5 semitones) — indistinguishable from per-note in testing, ~1/3 the files.
#
#   Source: https://github.com/gleitz/midi-js-soundfonts  (FluidR3_GM, by Frank Wen; free/permissive)
#   See sounds/CREDITS.md for licensing/attribution.
#
# GOTCHA: black keys are named with FLATS (Eb, Gb), NOT sharps, and the per-format folder is
#         "<name>-mp3" (e.g. violin-mp3). MIDI 60 = C4, A4 = 440 Hz.
#
# Usage:  ./fetch-instrument-samples.sh                 # the 7 pitched Critter Hunt instruments
#         ./fetch-instrument-samples.sh cello marimba   # any FluidR3_GM instrument names
set -euo pipefail
base="https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM"
anchors="C3 Eb3 Gb3 A3 C4 Eb4 Gb4 A4 C5 Eb5 Gb5 A5 C6"   # C3..C6, every 3 semitones (13 notes)
# Critter Hunt's 7 pitched instruments -> FluidR3_GM folder names:
insts=("$@"); [ "${#insts[@]}" -eq 0 ] && insts=(violin flute trumpet acoustic_guitar_nylon tenor_sax tubular_bells banjo)

for gm in "${insts[@]}"; do
  out="sounds/instruments/$gm"; mkdir -p "$out"; ok=0; fail=0
  for f in $anchors; do
    if curl -fsS --max-time 25 -o "$out/$f.mp3" "$base/$gm-mp3/$f.mp3"; then ok=$((ok+1)); else fail=$((fail+1)); fi
  done
  echo "$gm: $ok/$((ok+fail)) -> $out"
done
