#!/usr/bin/env bash
# Fetch the GENRE style-riff clips used by Critter Hunt (Phase 3 audio-first layer) into
# sounds/genres/<slug>.mp3. These make the (4th) GENRE axis ear-identifiable (card ▶, per-clue ▶ cue,
# "Listen to the case"). The game already plays a short SYNTH riff per style as a fallback, so these
# real clips are an ENHANCEMENT — fill URLs incrementally; unfilled rows are skipped.
#
# SOURCES (prefer, in order): for Classical → Musopen (https://musopen.org, filter "Public Domain")
# — genuinely PD recordings. For the rest → Freesound CC0 (https://freesound.org, License =
# "Creative Commons 0") short style loops. AVOID CC-BY-ND (we trim these → derivative). A tiny,
# unmistakable ~3s hook per style is ideal. Provenance → data/critter-credits.json + sounds/CREDITS.md.
#
# Each source is downloaded, TRIMMED, mono, loudness-normalised, faded, mp3. REQUIRES ffmpeg.
#
#   Fill a URL, then:  ./fetch-genre-samples.sh classical jazz    (slugs below)
#   Re-fetch all set:  ./fetch-genre-samples.sh
set -euo pipefail

command -v ffmpeg >/dev/null 2>&1 || { echo "ERROR: ffmpeg not found. Run: brew install ffmpeg"; exit 1; }
out="sounds/genres"; mkdir -p "$out"; tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
UA="PunctuatorsGame-sample-fetch/1.0 (https://github.com/exclaMachine/PunctuatorsGame; ty.rickers@gmail.com)"

# slug | source URL (SILENT → intentionally no clip; REPLACE_ME → unfilled, skipped) | trim start (s) | trim dur (s)
# Slugs MUST match GENRES names in critter-hunt.html (slugify(nm)): jazz classical folk blues rock electronic disco pop.
# Only the pre-1926 / released-to-PD styles have genuine PD recordings; the modern four have no recognisable
# PD/CC0 example, so they stay silent (dev preference over a bad synth riff). start/dur nudge-able; audition.
# Provenance (esp. the CC recordings): data/critter-credits.json.
ROWS=(
"jazz|https://upload.wikimedia.org/wikipedia/commons/1/19/Original_Dixieland_Jass_Band_-_Livery_Stable_Blues_%281917%29_with_hiss_reduction.ogg|2|3.5"   # ODJB, "Livery Stable Blues" 1917 (first jazz record) — PD (US, pre-1926)
"classical|https://upload.wikimedia.org/wikipedia/commons/e/e6/Ludwig_van_Beethoven_-_symphony_no._5_in_c_minor%2C_op._67_-_i._allegro_con_brio.ogg|0|4.0" # Beethoven 5th, i (iconic motif) — Skidmore College orchestra, released to PD
"folk|https://upload.wikimedia.org/wikipedia/commons/1/11/CrippleCreek.ogg|1|3.5"                                                                         # "Cripple Creek", old-time fiddle/banjo — Gid Tanner & his Skillet Lickers, PD (US, pre-1926)
"blues|SILENT|0|0"                                                                                                                                        # Bessie Smith "Downhearted Blues" auditioned + rejected (poor clip); silent until a suitable PD/CC0 replacement is found
"rock|SILENT|0|0"                                                                                                                                          # no PD/CC0 recognisable rock recording → silent
"electronic|SILENT|0|0"                                                                                                                                    # no PD/CC0 recognisable electronic recording → silent
"disco|SILENT|0|0"                                                                                                                                         # no PD/CC0 recognisable disco recording → silent
"pop|SILENT|0|0"                                                                                                                                           # no PD/CC0 recognisable pop recording → silent
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
  fade="$(awk -v d="$dur" 'BEGIN{printf "%.3f", (d-0.15>0?d-0.15:0)}')"
  if ffmpeg -y -loglevel error -ss "$start" -i "$src" -t "$dur" -ac 1 -ar 44100 \
       -af "loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:st=0:d=0.02,afade=t=out:st=${fade}:d=0.15" \
       -codec:a libmp3lame -b:a 128k "$out/$slug.mp3"; then
    ok=$((ok+1)); echo "  -> $out/$slug.mp3"
  else echo "  ! ffmpeg convert failed"; fail=$((fail+1)); fi
done
echo "genres: $ok ok, $skip awaiting-URL, $fail failed -> $out  (serve over http, not file://; game falls back to synth for any missing)"
