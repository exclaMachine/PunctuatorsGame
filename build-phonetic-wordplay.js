#!/usr/bin/env node
// build-phonetic-wordplay.js
// Finds phonetic PALINDROMES, phonetic SEMORDNILAPS (sound-reversals) and phonetic ANAGRAMS
// (same sounds, different order) and writes them to data/.
//
// Word set:      enable1.txt (Scrabble-valid word list, no pronunciations)
// Pronunciations: text-to-ipa-master/lib/ipadict.txt (CMU->IPA, ~133k entries)
// Symbols are converted to the IPA fan game's convention (matches IPA-fan-game/ipa_words.js:
//   ə ɝ tʃ dʒ eɪ oʊ aɪ aʊ ɔɪ ɡ …) so the JSONs drop straight into that game.
//
// A "phonetic palindrome" = the phoneme-token sequence reads the same reversed (compared by
//   token, so eɪ/tʃ/dʒ are single units).
// A "phonetic anagram" set = words built from the SAME multiset of phonemes in a DIFFERENT order
//   (cats / tacks / scat / acts). Words that sound identical (cats/kats) are stacked as one entry,
//   so a set is only kept when it holds >=2 distinct sequences.
// A "phonetic semordnilap" = reversing a word's phoneme sequence yields a DIFFERENT word that
//   also exists in the set (e.g. dervish <-> shivered).
// EXACT = phoneme-for-phoneme (reversal, or anagram). LOOSE = same but merging near-equivalent vowels
//   ({i,ɪ} {u,ʊ} {ə,ɝ} {ɑ,ɔ}); each loose JSON holds ONLY what the exact pass missed.
//
// Re-run to regenerate:  node build-phonetic-wordplay.js

const fs = require("fs");
const path = require("path");
const ROOT = __dirname + "/";
const DATA = ROOT + "data/";

// ---- ipadict tokenizer (its diphthongs are vowel+glide; ʧ/ʤ are single chars) ----
const DIPH = new Set(["aj", "ej", "ɔj", "aw", "ow", "oj"]);
const KNOWN = new Set(
  "nsltɹkdiwjmzɛɑæbpovŋuhʃθðʒgefiuɪʊɔʌ".split("").concat(["ʤ", "ʧ", "ɚ"])
);
// ipadict symbol -> IPA-fan-game (ipa_words.js) symbol
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

// ---- load ----
const enable = new Set(
  fs.readFileSync(ROOT + "enable1.txt", "utf8").split(/\r?\n/).map(x => x.trim()).filter(Boolean)
);
const toks = {}; // word -> [phoneme tokens]
for (const line of fs.readFileSync(ROOT + "text-to-ipa-master/lib/ipadict.txt", "utf8").split(/\r?\n/)) {
  if (!line) continue;
  const p = line.split("\t");
  let w = p[0];
  const ipa = p[p.length - 1];
  if (!w || !ipa || w.includes("(")) continue; // skip alternate pronunciations
  w = w.toLowerCase();
  if (!enable.has(w) || (w in toks)) continue; // enable1 filter, primary pronunciation only
  const t = tokenize(ipa);
  if (t && t.length) toks[w] = t;
}
const words = Object.keys(toks);

// ---- indexes ----
const CLASS = { "i": "I", "ɪ": "I", "u": "U", "ʊ": "U", "ə": "@", "ɝ": "@", "ɑ": "A", "ɔ": "A" };
const norm = t => CLASS[t] || t;
const indexBy = keyFn => {
  const m = new Map();
  for (const w of words) {
    const k = keyFn(toks[w]);
    if (!m.has(k)) m.set(k, new Set());
    m.get(k).add(w);
  }
  return m;
};
const exactIdx = indexBy(t => t.join(" "));
const looseIdx = indexBy(t => t.map(norm).join(" "));

// ---- palindromes (>=2 phonemes; 1-phoneme words are trivially palindromic, excluded) ----
const palindromes = words
  .filter(w => toks[w].length >= 2 && toks[w].join(" ") === [...toks[w]].reverse().join(" "))
  .sort((a, b) => toks[b].length - toks[a].length || a.localeCompare(b))
  .map(w => ({ word: w, ipa: toks[w].join(" "), n: toks[w].length }));

// ---- semordnilaps ----
function collect(index, normed) {
  const seen = new Map();
  for (const w of words) {
    const t = toks[w];
    if (t.length < 2) continue;
    const seq = normed ? t.map(norm) : t;
    const fwd = seq.join(" ");
    const rev = [...seq].reverse().join(" ");
    if (rev === fwd) continue; // palindrome
    const matches = index.get(rev);
    if (!matches) continue;
    for (const other of matches) {
      if (other === w) continue;
      const [a, b] = w < other ? [w, other] : [other, w];
      seen.set(a + "\t" + b, [a, b]);
    }
  }
  return seen;
}
const exactMap = collect(exactIdx, false);
const looseMap = collect(looseIdx, true);

const toRec = ([a, b], withLoose) => {
  const rec = { a, b, ipaA: toks[a].join(" "), ipaB: toks[b].join(" "), n: toks[a].length };
  if (withLoose) rec.looseKey = toks[a].map(norm).join(" ");
  return rec;
};
const sortPairs = arr => arr.sort((x, y) => y.n - x.n || x.a.localeCompare(y.a));

const exactPairs = sortPairs([...exactMap.values()].map(p => toRec(p, false)));
const loosePairs = sortPairs(
  [...looseMap.values()].filter(p => !exactMap.has(p[0] + "\t" + p[1])).map(p => toRec(p, true))
);

// ---- anagrams ----
// A "phonetic anagram" set = words built from the SAME multiset of phonemes in a DIFFERENT order.
// Words are stacked by sound first: cats/kats are one entry (identical sequence), and the set is
// only kept when it holds >=2 distinct sequences — otherwise it is a homophone huddle, not an
// anagram. Set key = the phoneme multiset, sorted.
function anagramSets(normed) {
  const byKey = new Map(); // multiset key -> Map(sequence -> {words, exact})
  for (const w of words) {
    const t = toks[w];
    if (t.length < 2) continue;
    const seq = normed ? t.map(norm) : t;
    const key = [...seq].sort().join(" ");
    const sig = seq.join(" ");
    if (!byKey.has(key)) byKey.set(key, new Map());
    const forms = byKey.get(key);
    if (!forms.has(sig)) forms.set(sig, { words: [], exact: new Set() });
    const f = forms.get(sig);
    f.words.push(w);
    f.exact.add(t.join(" "));
  }
  const out = [];
  for (const [key, forms] of byKey) {
    if (forms.size < 2) continue; // every word sounds the same -> homophones, not an anagram
    const sounds = [...forms.entries()]
      .map(([ipa, f]) => {
        const rec = { ipa, words: f.words.sort() };
        if (normed && f.exact.size > 1) rec.exact = [...f.exact].sort(); // which real pronunciations merged
        return rec;
      })
      .sort((a, b) => b.words.length - a.words.length || a.ipa.localeCompare(b.ipa));
    out.push({ key, n: key.split(" ").length, forms: sounds.length, sounds });
  }
  return out.sort(
    (a, b) => b.forms - a.forms || b.n - a.n || a.sounds[0].words[0].localeCompare(b.sounds[0].words[0])
  );
}
const exactSets = anagramSets(false);
const looseSets = anagramSets(true);
// LOOSE-only: drop any set the exact pass already found with the same membership (the vowel merge
// changed nothing for it); what remains is the sets the merge grew or created.
const memberSig = s => s.sounds.flatMap(f => f.words).sort().join(" ");
const exactMembers = new Set(exactSets.map(memberSig));
const looseOnlySets = looseSets.filter(s => !exactMembers.has(memberSig(s)));

// ---- write ----
const STAMP = new Date().toISOString().slice(0, 10);
const SRC = "enable1.txt words × text-to-ipa ipadict.txt pronunciations; symbols in IPA-fan-game/ipa_words.js convention";
const write = (file, doc, key, items) => {
  const out = { _doc: doc, source: SRC, generated: STAMP, count: items.length, [key]: items };
  fs.writeFileSync(DATA + file, JSON.stringify(out, null, 2) + "\n");
  console.log("wrote data/" + file + "  (" + items.length + ")");
};

write("ipa-palindromes.json",
  "Phonetic palindromes — words whose phoneme sequence reads the same reversed (compared by token). Built by build-phonetic-wordplay.js.",
  "palindromes", palindromes);
write("ipa-semordnilaps-exact.json",
  "Phonetic semordnilaps (EXACT) — word pairs where one's phoneme sequence is the exact reverse of the other's (e.g. dervish<->shivered, cats<->stack). Built by build-phonetic-wordplay.js.",
  "pairs", exactPairs);
write("ipa-semordnilaps-loose.json",
  "Phonetic semordnilaps (LOOSE-only) — reversal pairs found ONLY after merging near-equivalent vowels {i,ɪ}{u,ʊ}{ə,ɝ}{ɑ,ɔ}; excludes anything already in ipa-semordnilaps-exact.json. looseKey shows the merged form. Built by build-phonetic-wordplay.js.",
  "pairs", loosePairs);
write("ipa-anagrams-exact.json",
  "Phonetic anagrams (EXACT) — sets of words built from the same multiset of phonemes in different orders (e.g. cats / tacks / scat / acts). Words are stacked by sound: each entry in `sounds` is one distinct phoneme sequence with every spelling of it, and a set is only listed when it holds >=2 sequences (a set where every word sounds alike is a homophone list, not an anagram). Built by build-phonetic-wordplay.js.",
  "sets", exactSets);
write("ipa-anagrams-loose.json",
  "Phonetic anagrams (LOOSE-only) — anagram sets found ONLY after merging near-equivalent vowels {i,ɪ}{u,ʊ}{ə,ɝ}{ɑ,ɔ}; excludes any set ipa-anagrams-exact.json already has with the same membership. `ipa` is the merged sequence; an entry's optional `exact` lists the real pronunciations the merge folded together. Built by build-phonetic-wordplay.js.",
  "sets", looseOnlySets);

console.log("\nenable1 words with a usable pronunciation: " + words.length);
console.log("palindromes (>=2 ph): " + palindromes.length +
  "   exact pairs: " + exactPairs.length + "   loose-only pairs: " + loosePairs.length);
console.log("anagram sets — exact: " + exactSets.length +
  " (" + exactSets.reduce((n, s) => n + s.forms, 0) + " sounds, " +
  exactSets.reduce((n, s) => n + s.sounds.reduce((m, f) => m + f.words.length, 0), 0) + " words)" +
  "   loose-only: " + looseOnlySets.length);
