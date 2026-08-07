#!/usr/bin/env bash
# Fetch per-PHONEME audio for Inklings' Phoneme Fishing (the "Fish Phoneme" / deep sound-only tier)
# from Wikimedia Commons, into sounds/phonemes/<ipa>.mp3.
#
# WHY: docs/inklings-fishing.md §4.3 / §7 — the deep (sound-only) fishing tier is deferred behind an
# audio source; §9.5 also wants the full-IPA set later. This is the "bundled recorded phoneme clips"
# option: clips are downloaded ONCE and become offline assets (like Alpha.png), not a runtime service.
# The file is keyed by the SAME IPA symbol phonemes.json uses (PHONEMES_BY_IPA), and named
# sounds/phonemes/<ipa>.mp3 to match the doc (§4.3: "sounds/phonemes/ʃ.mp3").
#
# HOW filenames work: Commons names IPA audio by articulatory description
# ("Voiceless_dental_fricative.ogg", "Close_front_unrounded_vowel.ogg") — which is exactly the M1
# feature data (place/manner/voice, backness/height/round). We fetch by FILENAME via
# Special:FilePath (curl -L follows the redirect to the hashed upload.wikimedia.org path), so no
# hash-hunting. A wrong/renamed filename 404s loudly — fix that one row and re-run.
#
# STATUS (verified 2026-08-06): all 35 filenames below resolve on Commons and all 35 downloaded OK.
# Licenses confirmed: 34× CC-BY-SA-3.0, 1× public domain (/dʒ/); none ND. Attribution recorded in
# data/phoneme-credits.json + sounds/CREDITS.md. Notes if you edit rows later:
#   - Commons files SIBILANTS under "sibilant" (not "fricative"): s/z/ʃ/ʒ. Postalveolar = "palato-alveolar".
#   - A wrong/renamed filename 404s loudly; a burst gets 429 (rate-limited) — the retry/sleep below handles it.
#   - AUDITION each per the sample-quality bar: silence beats a bad clip. Drop/replace poor ones.
#
# DIPHTHONGS (eɪ aɪ ɔɪ oʊ aʊ) are NOT fetched — Commons has no clean single-file for them and the 2D
# chart already plots them at their STARTING vowel (§9.2). Stopgap: reuse the start-vowel clip in
# code; a real drifting-glide clip is deferred (§9.5).
#
#   Fetch all:     ./fetch-phoneme-samples.sh
#   Fetch some:    ./fetch-phoneme-samples.sh ʃ θ i          (IPA symbols, UTF-8 args)
#   Tweak a trim:  edit start/dur in ROWS, re-run that symbol, re-audition in-game.
#
# REQUIRES ffmpeg (brew install ffmpeg). Serve over http (not file://) so the game can decode.
set -euo pipefail

command -v ffmpeg >/dev/null 2>&1 || { echo "ERROR: ffmpeg not found. Run: brew install ffmpeg"; exit 1; }
out="sounds/phonemes"; mkdir -p "$out"; tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
# Wikimedia throttles (HTTP 429) default curl User-Agents under load — send a descriptive one per policy.
UA="PunctuatorsGame-sample-fetch/1.0 (https://github.com/exclaMachine/PunctuatorsGame; ty.rickers@gmail.com)"
FILEPATH="https://commons.wikimedia.org/wiki/Special:FilePath"

# ipa | Commons filename (no "File:" prefix) | trim start (s) | trim dur (s)
# Phoneme clips are already short; default trim 0 +1.2s. Some files say the sound twice — nudge dur.
# Postalveolar sounds are filed under "palato-alveolar" on Commons; sibilants under "sibilant".
ROWS=(
# --- plosives ---
"p|Voiceless_bilabial_plosive.ogg|0|1.2"
"b|Voiced_bilabial_plosive.ogg|0|1.2"
"t|Voiceless_alveolar_plosive.ogg|0|1.2"
"d|Voiced_alveolar_plosive.ogg|0|1.2"
"k|Voiceless_velar_plosive.ogg|0|1.2"
"g|Voiced_velar_plosive.ogg|0|1.2"
# --- affricates (Commons: "palato-alveolar") ---
"tʃ|Voiceless_palato-alveolar_affricate.ogg|0|1.4"
"dʒ|Voiced_palato-alveolar_affricate.ogg|0|1.4"
# --- fricatives ---
"f|Voiceless_labiodental_fricative.ogg|0|1.4"
"v|Voiced_labiodental_fricative.ogg|0|1.4"
"θ|Voiceless_dental_fricative.ogg|0|1.4"
"ð|Voiced_dental_fricative.ogg|0|1.4"
"s|Voiceless_alveolar_sibilant.ogg|0|1.4"         # Commons files sibilants under "sibilant", not "fricative"
"z|Voiced_alveolar_sibilant.ogg|0|1.4"
"ʃ|Voiceless_palato-alveolar_sibilant.ogg|0|1.4"  # postalveolar = "palato-alveolar" + "sibilant" on Commons
"ʒ|Voiced_palato-alveolar_sibilant.ogg|0|1.4"
"h|Voiceless_glottal_fricative.ogg|0|1.4"
# --- nasals (no voice prefix on Commons) ---
"m|Bilabial_nasal.ogg|0|1.4"
"n|Alveolar_nasal.ogg|0|1.4"
"ŋ|Velar_nasal.ogg|0|1.4"
# --- approximants / lateral ---
"l|Alveolar_lateral_approximant.ogg|0|1.4"
"ɹ|Alveolar_approximant.ogg|0|1.4"                # ɹ filed as plain alveolar approximant on Commons
"w|Voiced_labio-velar_approximant.ogg|0|1.4"      # Commons uses "labio-velar" (not "labial-velar")
"j|Palatal_approximant.ogg|0|1.4"
# --- monophthong vowels ---
"i|Close_front_unrounded_vowel.ogg|0|1.4"
"ɪ|Near-close_near-front_unrounded_vowel.ogg|0|1.4"
"ɛ|Open-mid_front_unrounded_vowel.ogg|0|1.4"
"æ|Near-open_front_unrounded_vowel.ogg|0|1.4"     # æ = near-open (not "open") on Commons
"ə|Mid-central_vowel.ogg|0|1.4"
"ɑ|Open_back_unrounded_vowel.ogg|0|1.4"
"ɔ|Open-mid_back_rounded_vowel.ogg|0|1.4"
"ʊ|Near-close_near-back_rounded_vowel.ogg|0|1.4"
"u|Close_back_rounded_vowel.ogg|0|1.4"
"ʌ|Open-mid_back_unrounded_vowel.ogg|0|1.4"
"ɝ|En-us-er.ogg|0|1.2"                            # GA rhotic vowel: the American English "er" clip (cleaner than the mixed r-colored demo)
# --- diphthongs (eɪ aɪ ɔɪ oʊ aʊ): intentionally omitted — see header (plot/reuse start vowel) ---
)

want=("$@")
in_want(){ [ "${#want[@]}" -eq 0 ] && return 0; for w in "${want[@]}"; do [ "$w" = "$1" ] && return 0; done; return 1; }

ok=0; fail=0
for row in "${ROWS[@]}"; do
  IFS='|' read -r ipa fname start dur <<<"$row"
  in_want "$ipa" || continue
  ext="${fname##*.}"; src="$tmp/$ipa.$ext"
  echo "· /$ipa/  <- $fname  (trim ${start}s +${dur}s)"
  # Wikimedia rate-limits bursts with HTTP 429 — throttle politely between rows, and let curl retry
  # transient errors (429/5xx) with backoff, honouring the server's Retry-After header.
  sleep 1.5
  # --data-urlencode would need -G; the filename is simple enough that -L on Special:FilePath resolves it.
  if ! curl -fsSL -A "$UA" --max-time 60 --retry 5 --retry-delay 5 --retry-all-errors \
       -o "$src" "$FILEPATH/$fname"; then
    echo "  ! download failed (429=throttled, retry later; 404=check the filename on Commons)"
    fail=$((fail+1)); continue
  fi
  fade="$(awk -v d="$dur" 'BEGIN{printf "%.3f", (d-0.15>0?d-0.15:0)}')"
  if ffmpeg -y -loglevel error -ss "$start" -i "$src" -t "$dur" -ac 1 -ar 44100 \
       -af "loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:st=0:d=0.02,afade=t=out:st=${fade}:d=0.15" \
       -codec:a libmp3lame -b:a 128k "$out/$ipa.mp3"; then
    ok=$((ok+1)); echo "  -> $out/$ipa.mp3"
  else echo "  ! ffmpeg convert failed"; fail=$((fail+1)); fi
done
echo "phonemes: $ok ok, $fail failed -> $out  (serve over http, not file://)"
echo "NEXT: audition each; verify licenses; add attribution to data/critter-credits.json + sounds/CREDITS.md"
