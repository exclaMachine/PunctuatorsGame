#!/usr/bin/env node
// build-ipa-pronunciations.js
// Builds data/ipa-pronunciations.json for IPA Scrabble (ipa-scrabble.html): {word: "space-separated IPA"}.
//
// Why: IPA-fan-game/ipa_words.js is a CURATED vocabulary list with NO short words (no <=3-letter words at
//   all — missing nap/nip/pin/tin/tan/cat/dog/the/two/tree...), which is fatal for a Scrabble board where
//   short words are the glue. This uses the full CMU pronunciation dictionary instead, filtered to the
//   actual Scrabble word list so every entry is a real, playable word.
//
// Word set:      enable1.txt (the Scrabble-valid word list — exactly what a Scrabble game should accept)
// Pronunciations: text-to-ipa-master/lib/ipadict.txt (CMU->IPA, ~133k entries)
// Symbols:       converted to the IPA-fan-game convention (ə ɝ tʃ dʒ eɪ oʊ aɪ aʊ ɔɪ ɡ …) — the SAME
//                39-phoneme inventory ipa-scrabble.html already builds tile values/bag from.
// Only the PRIMARY pronunciation is kept (alternate "word(1)/(2)" lines are skipped), matching the
//   {word: ipa} shape the game consumes.
//
// Re-run to regenerate:  node build-ipa-pronunciations.js

const fs = require("fs");
const ROOT = __dirname + "/";
const DATA = ROOT + "data/";

// ---- ipadict tokenizer (shared convention with build-phonetic-wordplay.js) ----
const DIPH = new Set(["aj", "ej", "ɔj", "aw", "ow", "oj"]);
const KNOWN = new Set(
  "nsltɹkdiwjmzɛɑæbpovŋuhʃθðʒgefiuɪʊɔʌ".split("").concat(["ʤ", "ʧ", "ɚ"])
);
const MAP = {
  "ʌ": "ə", "ɚ": "ɝ", "ʧ": "tʃ", "ʤ": "dʒ", "g": "ɡ",
  "ej": "eɪ", "ow": "oʊ", "aj": "aɪ", "aw": "aʊ", "ɔj": "ɔɪ", "oj": "ɔɪ",
};
const conv = t => MAP[t] || t;
function tokenize(ipa) {
  const s = ipa.replace(/[ˈˌ]/g, "");
  const out = [];
  for (let i = 0; i < s.length;) {
    const two = s.slice(i, i + 2);
    if (DIPH.has(two)) { out.push(conv(two)); i += 2; continue; }
    const ch = s[i];
    if (!KNOWN.has(ch)) return null; // foreign/junk symbol -> reject this word
    out.push(conv(ch)); i += 1;
  }
  return out;
}

// ---- load the Scrabble word list ----
const enable = new Set(
  fs.readFileSync(ROOT + "enable1.txt", "utf8").split(/\r?\n/).map(x => x.trim()).filter(Boolean)
);

// ---- walk ipadict, keep primary pronunciation of each enable1 word ----
const out = {};
let seen = 0, rejected = 0;
for (const line of fs.readFileSync(ROOT + "text-to-ipa-master/lib/ipadict.txt", "utf8").split(/\r?\n/)) {
  if (!line) continue;
  const p = line.split("\t");
  let w = p[0];
  const ipa = p[p.length - 1];
  if (!w || !ipa || w.includes("(")) continue;   // skip alternate pronunciations (word(1)/(2))
  w = w.toLowerCase();
  if (!enable.has(w) || out[w]) continue;         // Scrabble words only; first (primary) pron wins
  seen++;
  const toks = tokenize(ipa);
  if (!toks) { rejected++; continue; }
  out[w] = toks.join(" ");
}

// stable, alphabetical output
const sorted = {};
for (const w of Object.keys(out).sort()) sorted[w] = out[w];

if (!fs.existsSync(DATA)) fs.mkdirSync(DATA);
const file = DATA + "ipa-pronunciations.json";
fs.writeFileSync(file, JSON.stringify(sorted));

const count = Object.keys(sorted).length;
const bytes = fs.statSync(file).size;
console.log(`enable1 words with a pronunciation: ${seen} (rejected for foreign symbols: ${rejected})`);
console.log(`wrote ${count} entries -> ${file} (${(bytes / 1e6).toFixed(2)} MB)`);
// spot-check the words the dev reported missing
for (const w of ["nap", "nip", "pin", "tin", "tan", "napped", "cat", "dog", "two", "key", "tree"]) {
  console.log(`  ${w.padEnd(8)} ${sorted[w] || "<MISSING>"}`);
}
