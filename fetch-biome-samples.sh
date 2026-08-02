#!/usr/bin/env bash
# Fetch the BIOME ambience beds used by Critter Hunt (Phase 3 audio-first layer) into
# sounds/biomes/<slug>.mp3. These make the LOCATION axis ear-identifiable (card ▶, per-clue ▶ cue,
# and "Listen to the case"). The game already plays a compact SYNTH fallback per climate, so these
# real clips are an ENHANCEMENT — you can fill URLs incrementally; unfilled rows are skipped.
#
# SOURCES (prefer, in order): Freesound CC0 (https://freesound.org, filter License = "Creative
# Commons 0") for field ambiences; Wikimedia Commons (CC0 / PD) environmental recordings. AVOID
# CC-BY-ND — we trim/loop these (a derivative). Record provenance (author, source URL, license) in
# data/critter-credits.json + sounds/CREDITS.md, matching the animal-sample convention.
#
# Each source is downloaded, TRIMMED (start/dur below), downmixed to mono, loudness-normalised, faded,
# and encoded to mp3 — a consistent, Safari-safe set. REQUIRES ffmpeg (brew install ffmpeg).
#
#   Fill a URL, then:  ./fetch-biome-samples.sh reef desert     (slugs below)
#   Re-fetch all set:  ./fetch-biome-samples.sh
set -euo pipefail

command -v ffmpeg >/dev/null 2>&1 || { echo "ERROR: ffmpeg not found. Run: brew install ffmpeg"; exit 1; }
out="sounds/biomes"; mkdir -p "$out"; tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
UA="PunctuatorsGame-sample-fetch/1.0 (https://github.com/exclaMachine/PunctuatorsGame; ty.rickers@gmail.com)"

# slug | source URL (SILENT → intentionally no clip; REPLACE_ME → unfilled, skipped) | trim start (s) | trim dur (s)
# Slugs MUST match LOCATIONS names in critter-hunt.html (slugify(nm)): desert reef forest jungle tundra mountain city savanna.
# All Wikimedia Commons; every clip is a distinct real recording so the biomes are ear-distinguishable.
# start/dur are best-guess windows — audition in the game and nudge. Provenance: data/critter-credits.json.
ROWS=(
"desert|SILENT|0|0"                                                                                                    # no recognisably-DESERT PD/CC0 recording exists on Commons (the "Desert Wind" category is a train) → stays silent
"reef|https://upload.wikimedia.org/wikipedia/commons/f/f1/Oceanwavescrushing.ogg|2|3.2"                                # ocean waves on shore — Luftrum, CC BY 3.0
"forest|https://upload.wikimedia.org/wikipedia/commons/3/38/Birds_forest.ogg|3|3.2"                                    # temperate woodland birdsong (Fontainebleau wrens) — Barracuda1983, PD
"jungle|https://upload.wikimedia.org/wikipedia/commons/0/0a/20090610_0_ambience.ogg|5|3.2"                             # Costa Rica rainforest birds/insects — nille, PD
"tundra|https://upload.wikimedia.org/wikipedia/commons/2/2d/Howling_wind.ogg|5|3.2"                                    # cold howling wind — Tvabutzku1234, CC0
"mountain|https://upload.wikimedia.org/wikipedia/commons/f/f3/Wind_in_Swedish_pine_forest_at_25_mps.ogg|3|3.2"         # strong wind through pines (25 m/s) — W.carter, CC BY-SA 4.0
"city|https://upload.wikimedia.org/wikipedia/commons/2/24/Sunday_in_the_city_street_noise2.ogg|10|3.2"                 # urban street traffic — cori, PD
"savanna|https://upload.wikimedia.org/wikipedia/commons/4/4c/Crickets_choir.ogg|2|3.2"                                 # grassland cricket chorus — Serg Childed, CC BY-SA 4.0
)

want=("$@")
in_want(){ [ "${#want[@]}" -eq 0 ] && return 0; for w in "${want[@]}"; do [ "$w" = "$1" ] && return 0; done; return 1; }

ok=0; skip=0; fail=0
for row in "${ROWS[@]}"; do
  IFS='|' read -r slug url start dur <<<"$row"
  in_want "$slug" || continue
  if [ "$url" = "SILENT" ]; then echo "· $slug  (intentionally silent — no PD/CC0 recording; game plays nothing)"; skip=$((skip+1)); continue; fi
  if [ "$url" = "REPLACE_ME" ]; then echo "· $slug  (no URL yet — fill it in ROWS, then re-run)"; skip=$((skip+1)); continue; fi
  ext="${url##*.}"; src="$tmp/$slug.$ext"
  echo "· $slug  (trim ${start}s +${dur}s)"
  if ! curl -fsSL -A "$UA" --max-time 60 -o "$src" "$url"; then echo "  ! download failed"; fail=$((fail+1)); continue; fi
  fade="$(awk -v d="$dur" 'BEGIN{printf "%.3f", (d-0.2>0?d-0.2:0)}')"
  if ffmpeg -y -loglevel error -ss "$start" -i "$src" -t "$dur" -ac 1 -ar 44100 \
       -af "loudnorm=I=-18:TP=-1.5:LRA=11,afade=t=in:st=0:d=0.15,afade=t=out:st=${fade}:d=0.2" \
       -codec:a libmp3lame -b:a 128k "$out/$slug.mp3"; then
    ok=$((ok+1)); echo "  -> $out/$slug.mp3"
  else echo "  ! ffmpeg convert failed"; fail=$((fail+1)); fi
done
echo "biomes: $ok ok, $skip awaiting-URL, $fail failed -> $out  (serve over http, not file://; game falls back to synth for any missing)"
