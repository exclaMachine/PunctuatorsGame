// anagrams_builder.cjs (CommonJS)
// How to use from your script:
//   const { CreateAnagramsJS } = require("./anagrams_builder.cjs");
//   CreateAnagramsJS("anagrams.js", ["q", "z"]);  // chunk by letters
//   // or CreateAnagramsJS("anagrams.js");       // process all

const fs = require("fs");
const path = require("path");

// defaults (you can override by passing options if you want)
const WORD_FILE = "2of12.txt";
const OUT_JSON = "anagrams.json"; // persistent store for merging
const PROCESSED_FILE = "processed_anagrams.json"; // set of words already handled

// ---------------------- helpers ----------------------
function readLines(filename) {
  const txt = fs.readFileSync(filename, "utf8");
  return txt
    .split(/\r?\n/)
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean);
}

function isAlpha(w) {
  return /^[a-z]+$/.test(w);
}

// "pears" -> "aeprs"
function signature(w) {
  return w.split("").sort().join("");
}

function loadJSON(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return fallback;
  }
}

function saveJSON(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), "utf8");
}

// ---------------------- core build ----------------------
/**
 * Build/merge anagrams and write a JS file like your homophones:
 *   const data = { pears:["pares","parse","reaps","spear","spare"], ... };
 *   export default data;
 *
 * @param {string} jsName - output JS filename (e.g., "anagrams.js")
 * @param {string[]|null} startLetters - starting letters to process (null/omitted = all)
 * @param {object} opts - optional overrides (wordFile,outJson,processedFile)
 */
function CreateAnagramsJS(jsName, startLetters = null, opts = {}) {
  const wordFile = opts.wordFile || WORD_FILE;
  const outJson = opts.outJson || OUT_JSON;
  const processedFile = opts.processedFile || PROCESSED_FILE;

  // 1) load words
  const raw = readLines(wordFile);
  const words = Array.from(new Set(raw.filter(isAlpha)));
  const bySig = new Map();

  for (const w of words) {
    const s = signature(w);
    if (!bySig.has(s)) bySig.set(s, []);
    bySig.get(s).push(w);
  }

  // 2) load persistent state
  const processedArr = loadJSON(processedFile, []); // ["pears", "spare", ...]
  const processed = new Set(processedArr);
  const anagramMap = loadJSON(outJson, {}); // { word: [buddies...] }

  // 3) which starting letters this run?
  const starts =
    startLetters && startLetters.length
      ? new Set(startLetters.map((c) => c.toLowerCase()))
      : null;

  // 4) walk words; when we decide to handle one, fill its whole group
  let groupsAdded = 0;

  for (const w of words) {
    if (processed.has(w)) continue;
    if (starts && !starts.has(w[0])) continue;

    const group = bySig.get(signature(w)) || [];
    if (group.length < 2) {
      // no anagrams: mark this single word as processed so we don't revisit
      processed.add(w);
      continue;
    }

    // add/merge the whole group
    for (const gw of group) {
      const buddies = group.filter((x) => x !== gw).sort();
      const prev = anagramMap[gw] || [];
      const merged = Array.from(new Set([...prev, ...buddies])).sort();
      anagramMap[gw] = merged;
    }

    // mark entire group processed
    for (const gw of group) processed.add(gw);
    groupsAdded++;
  }

  // 5) persist JSON + processed
  saveJSON(outJson, anagramMap);
  saveJSON(processedFile, Array.from(processed).sort());

  // 6) write JS in your style (ESM export is just text in the file)
  const jsContent =
    `const data = ${JSON.stringify(anagramMap, null, 2)};\n\n` +
    `export default data;\n`;
  fs.writeFileSync(jsName, jsContent, "utf8");

  // small console note for your script’s logs
  console.log(
    (starts
      ? `Processed starting letters [${Array.from(starts).join(", ")}]`
      : "Processed all letters") +
      ` | New anagram groups this run: ${groupsAdded} | Words in source: ${words.length}`
  );
}

CreateAnagramsJS("anagrams.js", ["s"]);

module.exports = { CreateAnagramsJS };
