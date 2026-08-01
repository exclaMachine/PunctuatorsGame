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
# Wikimedia throttles (HTTP 429) default curl User-Agents under load — send a descriptive one per policy.
UA="PunctuatorsGame-sample-fetch/1.0 (https://github.com/exclaMachine/PunctuatorsGame; ty.rickers@gmail.com)"

# slug | Commons upload URL | trim start (s) | trim dur (s)
# (start/dur are best-guess windows — audition in the game and nudge; parrot's call is at ~0:11.)
# Every slug names a SPECIFIC species and the file is a recording OF that species, so the in-game
# name can honestly match the actual call (e.g. snake = a real rattlesnake, owl = Great Horned Owl).
# Sparse-on-Commons species (lion, seal, a labelled bottlenose dolphin) were dropped in favour of
# equally iconic, well-recorded ones (orca, wolf, whale, …). Provenance: data/critter-credits.json.
ROWS=(
# --- the original six: recording already IS this species, kept as-is ---
"fox|https://upload.wikimedia.org/wikipedia/commons/0/0b/Vulpes_vulpes%2C_at_Henclov%C3%A1%2C_Slovakia_XC108315.mp3|0|4.0"          # Red Fox
"parrot|https://upload.wikimedia.org/wikipedia/commons/d/d6/Ara_severus_-_Chestnut-fronted_Macaw_XC519607.mp3|10.3|3.5"             # Chestnut-fronted Macaw
"snake|https://upload.wikimedia.org/wikipedia/commons/2/22/Rattlesnake.ogg|0.3|3.0"                                                 # Rattlesnake
"owl|https://upload.wikimedia.org/wikipedia/commons/6/6f/Bubo_virginianus_-_Great_Horned_Owl_XC450919.mp3|0|5.0"                    # Great Horned Owl
"bat|https://upload.wikimedia.org/wikipedia/commons/b/b4/Hoary_bat_chirp_recording.wav|0|3.0"                                       # Hoary Bat
"cricket|https://upload.wikimedia.org/wikipedia/commons/8/80/Field_cricket_Gryllus_pennsylvanicus.ogg|1.0|3.0"                      # Field Cricket
# --- the four ex-generic slots, re-sourced to a KNOWN species ---
"bullfrog|https://upload.wikimedia.org/wikipedia/commons/c/c5/Banded_Bull_Frog_Call.ogg|0|3.0"                                     # Banded Bullfrog (was generic "frog")
"elephant|https://upload.wikimedia.org/wikipedia/commons/f/f5/Bee-Threat-Elicits-Alarm-Call-in-African-Elephants-pone.0010346.s002.ogg|0|4.0"  # African Elephant (labelled; alt trims: s001/s003)
"alligator|https://upload.wikimedia.org/wikipedia/commons/1/1a/Alligatorbellow1.ogg|0|4.0"                                         # American Alligator (was generic "turtle")
"orca|https://upload.wikimedia.org/wikipedia/commons/7/79/Killer_whale.ogg|0|3.5"                                                   # Orca / Killer Whale (was generic "dolphin")
# --- ten new species ---
"wolf|https://upload.wikimedia.org/wikipedia/commons/8/87/Wolf_howls.ogg|0|4.0"                                                     # Gray Wolf
"whale|https://upload.wikimedia.org/wikipedia/commons/1/13/Humpbackwhale2.ogg|0|4.0"                                                # Humpback Whale
"mallard|https://upload.wikimedia.org/wikipedia/commons/6/69/Anas_platyrhynchos_-_Mallard_XC62258.mp3|0|3.0"                        # Mallard
"peafowl|https://upload.wikimedia.org/wikipedia/commons/0/05/Pavo_cristatus_%28call%29.ogg|0|3.0"                                   # Indian Peafowl
"howler|https://upload.wikimedia.org/wikipedia/commons/8/81/Mantled_Howler_Monkey_%28Alouatta_palliata%29_%28W_ALOUATTA_PALLIATA_R1_C2%29.ogg|0|4.0"  # Mantled Howler Monkey
"turkey|https://upload.wikimedia.org/wikipedia/commons/f/f3/Meleagris_gallopavo_-_Wild_Turkey_XC136045.ogg|0|3.0"                   # Wild Turkey
"goat|https://upload.wikimedia.org/wikipedia/commons/b/bc/Herd_of_goats_bleating.ogg|0|3.0"                                         # Domestic Goat
"rooster|https://upload.wikimedia.org/wikipedia/commons/c/c5/Rooster_crowing.ogg|0|3.0"                                             # Rooster (Red Junglefowl)
"cow|https://upload.wikimedia.org/wikipedia/commons/a/a5/Single_Cow_Moo.ogg|0|3.0"                                                  # Cow
"sheep|https://upload.wikimedia.org/wikipedia/commons/1/13/Sheep_bleating.ogg|0|3.0"                                               # Sheep
)

want=("$@")
in_want(){ [ "${#want[@]}" -eq 0 ] && return 0; for w in "${want[@]}"; do [ "$w" = "$1" ] && return 0; done; return 1; }

ok=0; fail=0
for row in "${ROWS[@]}"; do
  IFS='|' read -r slug url start dur <<<"$row"
  in_want "$slug" || continue
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
echo "animals: $ok ok, $fail failed -> $out  (serve over http, not file://)"
