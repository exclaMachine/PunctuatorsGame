#!/usr/bin/env bash
# Fetch the ANIMAL vocalisation samples used by Critter Hunt (and, later, Mujicians' Sound
# Collection) from Wikimedia Commons, into sounds/animals/<slug>.mp3.
#
# Unlike the instruments (one clean GM soundfont), animal recordings are hand-curated per animal
# from Commons — each has its own author/license (all CC0 / Public-domain / CC-BY-SA here, i.e.
# NON-ND, so they're repitch-safe if a note-playable version is ever wanted). Provenance +
# attribution: data/critter-credits.json and sounds/CREDITS.md.
#
# Each source is downloaded, TRIMMED to a short one-shot (per-animal start/dur below), downmixed to
# mono, loudness-normalised (so wildly different sources match), faded, and encoded to mp3 — so the
# game gets a consistent, Safari-safe set. REQUIRES ffmpeg (brew install ffmpeg).
#
#   Re-fetch all:      ./fetch-animal-samples.sh
#   Re-fetch some:     ./fetch-animal-samples.sh fox owl        (slugs below)
#   Tweak a trim:      edit the start/dur in the ROWS table, re-run that slug, re-audition.
set -euo pipefail

command -v ffmpeg >/dev/null 2>&1 || { echo "ERROR: ffmpeg not found. Run: brew install ffmpeg"; exit 1; }
out="sounds/animals"; mkdir -p "$out"; tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT

# slug | Commons upload URL | trim start (s) | trim dur (s)
# (start/dur are best-guess windows — audition in the game and nudge; parrot's call is at ~0:11.)
ROWS=(
"fox|https://upload.wikimedia.org/wikipedia/commons/0/0b/Vulpes_vulpes%2C_at_Henclov%C3%A1%2C_Slovakia_XC108315.mp3|0|4.0"
"frog|https://upload.wikimedia.org/wikipedia/commons/9/9f/Single_Frog_Croak.oga|0|3.0"
"parrot|https://upload.wikimedia.org/wikipedia/commons/d/d6/Ara_severus_-_Chestnut-fronted_Macaw_XC519607.mp3|10.3|3.5"
"elephant|https://upload.wikimedia.org/wikipedia/commons/4/40/Elephant_voice_-_trumpeting.ogg|0|1.4"
"snake|https://upload.wikimedia.org/wikipedia/commons/2/22/Rattlesnake.ogg|0.3|3.0"
"owl|https://upload.wikimedia.org/wikipedia/commons/6/6f/Bubo_virginianus_-_Great_Horned_Owl_XC450919.mp3|0|5.0"
"turtle|https://upload.wikimedia.org/wikipedia/commons/2/27/Sound_of_tortoise_sex.ogg|0|3.0"
"bat|https://upload.wikimedia.org/wikipedia/commons/b/b4/Hoary_bat_chirp_recording.wav|0|3.0"
"dolphin|https://upload.wikimedia.org/wikipedia/commons/5/5a/161691_felixblume_dolphin-screaming-underwater-in-caribbean-sea-mexico.wav|1.5|3.0"
"cricket|https://upload.wikimedia.org/wikipedia/commons/8/80/Field_cricket_Gryllus_pennsylvanicus.ogg|1.0|3.0"
)

want=("$@")
in_want(){ [ "${#want[@]}" -eq 0 ] && return 0; for w in "${want[@]}"; do [ "$w" = "$1" ] && return 0; done; return 1; }

ok=0; fail=0
for row in "${ROWS[@]}"; do
  IFS='|' read -r slug url start dur <<<"$row"
  in_want "$slug" || continue
  ext="${url##*.}"; src="$tmp/$slug.$ext"
  echo "· $slug  (trim ${start}s +${dur}s)"
  if ! curl -fsSL --max-time 60 -o "$src" "$url"; then echo "  ! download failed"; fail=$((fail+1)); continue; fi
  fade="$(awk -v d="$dur" 'BEGIN{printf "%.3f", (d-0.15>0?d-0.15:0)}')"
  if ffmpeg -y -loglevel error -ss "$start" -i "$src" -t "$dur" -ac 1 -ar 44100 \
       -af "loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:st=0:d=0.02,afade=t=out:st=${fade}:d=0.15" \
       -codec:a libmp3lame -b:a 128k "$out/$slug.mp3"; then
    ok=$((ok+1)); echo "  -> $out/$slug.mp3"
  else echo "  ! ffmpeg convert failed"; fail=$((fail+1)); fi
done
echo "animals: $ok ok, $fail failed -> $out  (serve over http, not file://)"
