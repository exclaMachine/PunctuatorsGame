#!/usr/bin/env bash
# Fetch the eleven classification-leaf typefaces the Scriptorium teaches with, into
# fonts/<Face>-latin.woff2 + fonts/<Face>-OFL.txt.
#
# One font per Vox-ATypI leaf (docs/inklings-typography.md §4.1), every one OFL, so the SPECIMEN
# the player compares their traced glyph against is a genuine face rather than our approximation.
# The letterform the player TRACES is always the shared skeleton (data/wordshape-alphabet.json) —
# these files are the reference half of that division, plus the field glyph once M3 lands.
#
# Source is Google Fonts' own latin subset (unicode-range U+0000-00FF …), which is 9–24 KB per
# face. If fontTools is installed the script then cuts each down to the 52 Latin letters the album
# uses (~5 KB), which is what the doc asks for; without it the latin subsets ship as-is and the
# game is identical, just heavier. To take the smaller path:
#
#     pip install fonttools brotli        # then re-run this script
#
#   Re-fetch all:    ./fetch-typeface-fonts.sh
#   Re-fetch some:   ./fetch-typeface-fonts.sh ebgaramond unifrakturmaguntia
#
# Licence: OFL 1.1 for every face here. The licence text lands beside the woff2 (the convention
# fonts/PixelifySans-OFL.txt already sets). OFL's two live obligations: keep the licence file, and
# never reuse a Reserved Font Name on a MODIFIED copy — so a subset we cut keeps the file name it
# arrived with and is never renamed to look like the original release.
set -euo pipefail

out="fonts"; mkdir -p "$out"; tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
# The css2 endpoint serves woff2 only to a browser-shaped UA; the default curl UA gets a .ttf.
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
# 52 Latin letters — everything the 26x11 album and the field glyph can ever ask for.
GLYPHS="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

# slug | Google family | output basename | Vox leaf it stands for
ROWS=(
  "cardo|Cardo|Cardo|Humanist (Venetian)"
  "ebgaramond|EB Garamond|EBGaramond|Garalde (Aldine)"
  "librebaskerville|Libre Baskerville|LibreBaskerville|Transitional (Reale)"
  "librebodoni|Libre Bodoni|LibreBodoni|Didone"
  "bitter|Bitter|Bitter|Mechanistic (slab)"
  "archivo|Archivo|Archivo|Lineal - grotesque"
  "jost|Jost|Jost|Lineal - geometric"
  "opensans|Open Sans|OpenSans|Lineal - humanist sans"
  "unifrakturmaguntia|UnifrakturMaguntia|UnifrakturMaguntia|Blackletter (Textura)"
  "uncialantiqua|Uncial Antiqua|UncialAntiqua|Uncial / Insular"
  "pinyonscript|Pinyon Script|PinyonScript|Script"
)

want=("$@")
has_subsetter=0
command -v pyftsubset >/dev/null 2>&1 && has_subsetter=1
[ "$has_subsetter" = 0 ] && echo "note: pyftsubset not found — shipping Google's latin subsets as-is (pip install fonttools brotli to shrink them)"

for row in "${ROWS[@]}"; do
  IFS='|' read -r slug family base leaf <<< "$row"
  if [ ${#want[@]} -gt 0 ]; then
    keep=0; for w in "${want[@]}"; do [ "$w" = "$slug" ] && keep=1; done
    [ "$keep" = 1 ] || continue
  fi

  echo "── $family  ($leaf)"
  css="$tmp/$slug.css"
  curl -fsS -A "$UA" "https://fonts.googleapis.com/css2?family=${family// /+}&display=swap" -o "$css"
  # Google emits one @font-face per script, each preceded by a /* name */ comment; take latin's.
  url="$(grep -A9 '/\* latin \*/' "$css" | grep -o 'https://[^)]*woff2' | head -1)"
  [ -n "$url" ] || { echo "   ERROR: no latin subset in the css for $family"; exit 1; }
  curl -fsS -A "$UA" "$url" -o "$tmp/$base.woff2"

  if [ "$has_subsetter" = 1 ]; then
    pyftsubset "$tmp/$base.woff2" --text="$GLYPHS" --flavor=woff2 \
      --layout-features='' --no-hinting --desubroutinize \
      --output-file="$out/$base-latin.woff2"
  else
    cp "$tmp/$base.woff2" "$out/$base-latin.woff2"
  fi

  curl -fsS "https://raw.githubusercontent.com/google/fonts/main/ofl/$slug/OFL.txt" -o "$out/$base-OFL.txt"
  printf '   %s-latin.woff2  %s bytes\n' "$base" "$(wc -c < "$out/$base-latin.woff2" | tr -d ' ')"
done

echo
echo "done — fonts/ now holds the faces named in data/typefaces.json."
