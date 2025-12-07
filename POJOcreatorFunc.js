const fs = require("fs");
const roundWords = require("./roundLettersMulti.js");
const roundWordsSingle = require("./roundLetters.js");

let bIsOnlyChangedWords = false;

let AmbigramPairs = {
  a: ["e", "v", "h"], // a ↔ e, v, h
  b: ["q", "g", "e"], // b ↔ q; B to E
  d: ["p", "g"], // d ↔ p
  e: ["a", "e"], // e ↔ a
  h: ["y", "h", "a"], // h ↔ y, a
  i: ["r", "e", "i"], // i ↔ r, e
  j: ["l", "r"], // j ↔ l, r
  l: ["j", "l", "t"], // l ↔ j, t
  m: ["w", "uu"], // m ↔ w, uu
  n: ["u", "n"], // n ↔ u
  o: ["e", "o"], // o ↔ e
  p: ["d"], // p ↔ d
  q: ["b"], // q ↔ b //Q and O?
  r: ["j", "d"], // r ↔ j; R ↔ d
  s: ["e", "g", "s"], // s ↔ e //g and s could also be done
  t: ["t", "l"], // t ↔ l
  u: ["n"], // u ↔ n
  w: ["m", "nn"], // w ↔ m, nn
  x: ["x", "o"], // x ↔ o
  y: ["h", "t"], // y ↔ h
  z: ["z"], // z ↔ z

  // --- digraph reverse mappings ---
  uu: ["m"],
  nn: ["w"],
};

//right angle numbers
let rightAngleNums = {
  a: ["1", "4"],
  e: ["9"],
  h: ["1"],
  l: ["1", "7"],
  n: ["5"],
  o: ["0"],
  p: ["6"],
  t: ["4", "7"],
  u: ["2"],
  v: ["7"],
  y: ["2"],
  w: ["3"], //Add digraphs next like 8 oo and 5 ju
};

let horPairs = {
  b: "d",
  //d: "b",
  //i: "i",
  //l: "l",
  //m: "m",
  //o: "o",
  //p: "q",
  q: "p",
  //t: "t",
  //v: "v",
  //w: "w",
  //x: "x",
};

let NinetyDegreesClockWise = {
  a: ["u", "a"], //capital A with lines extended
  b: ["w"],
  c: ["n"],
  d: ["u"],
  e: ["n", "m", "t"],
  f: ["f"],
  h: ["i", "z"],
  i: ["h", "n"],
  j: ["u"],
  m: ["b"],
  n: ["z", "s", "i"],
  o: ["o", "e"],
  r: ["r"], //lowercase and slightly diagonal
  s: ["n"],
  t: ["t", "y"],
  u: ["c", "e"],
  w: ["e"],
  x: ["x"],
  y: ["y"],
  z: ["n"],
};

//flip vertical and then rotate clockwise 90 deg
let rightAngles = {
  a: ["a", "n", "u"], //Cap, fancy a is u, other is n
  b: ["w"],
  c: ["n"],
  d: ["u"],
  e: ["m", "t"], //t from Capital E
  g: ["g"],
  h: ["i", "l", "z"], //h to capital L
  i: ["h", "n"],
  j: ["u"],
  l: ["t"],
  m: ["e"],
  n: ["s", "z", "c"], //maybe a capital C
  o: ["o"],
  q: ["q"], //capital Q
  r: ["t"],
  s: ["n"],
  t: ["t", "f"], //Cap T to F
  u: ["d"],
  w: ["b"],
  x: ["x"],
  y: ["y"],
  z: ["n"],
};

//There are actually for 90 degree rotation possibilites. You can have it be reversed like it is falling over and be reversed or if you rotate the book
let NinetyDegreesCounterClockWise = {
  a: ["u", "j", "a"], //capital A with lines extended],
  b: ["m"],
  c: ["u"],
  d: ["n"],
  e: ["u", "w"],
  h: ["i", "z"],
  i: ["h", "n"],
  m: ["e"],
  n: ["z", "s", "i"],
  o: ["o", "e"],
  r: ["r"], //lowercase and slightly diagonal
  s: ["n"],
  t: ["t", "y"],
  u: ["d"],
  w: ["b"],
  x: ["x"],
  y: ["y"],
  z: ["n"],
};

let vertPairs = {
  a: ["a"],
  b: ["b"], // Only Cap visually
  c: ["c"],
  d: ["d"], // Only Cap visually
  e: ["e"], // E -> E, e -> o TODO  "o" add after
  f: ["t", "b", "z"],
  g: ["g", "c", "q"],
  h: ["h"], // Only Cap visually
  i: ["i", "l"], // Only Cap visually
  j: ["l"],
  k: ["k"],
  l: ["l", "i", "t"],
  m: ["w"],
  n: ["n"], // N looks like lowercase n flipped
  o: ["o"], //"e"
  p: ["b"],
  q: ["d"],
  r: ["e"],
  s: ["z", "a", "g"], // curvy Cap Z
  t: ["l"], // Cap L with serif
  u: ["n"], // without tail
  v: ["a"], // Cap V with a dot in the middle
  x: ["x"],
  y: ["d"],
  z: ["f"],
};

let hanglerAngles = {
  b: "k", //add an angle to the bottom of a b and it looks like lower case k
  c: "q",
  //d: "r", //Cap D to cap R
  //h: "a", //Cap
  h: "m",
  //i: "a", //cap I to A, if it's rotated
  k: "t",
  l: "y",
  //m: "n",
  //n: "l",
  p: "e",
  //r: "f", maybe
  t: "x",
  v: "w",
  //y: "g",
};

let capVertPairs = {
  b: "b",
  c: "c",
  d: "d",
  e: "e",
  h: "h",
  i: "i",
  m: "w",
  o: "o",
  w: "m",
  x: "x",
};

//can use lowercase and uppercase and type in spongebob ex. hElLo yOu
// each key -> array of *possible* mirror outputs
let HorizPairs = {
  a: ["a", "fl"], // a ↔ a or fl to A
  b: ["d", "cl", "el", "e"], // b ↔ d or cl to b, or El to B
  d: ["c", "cl", "h", "s", "g"], // d ↔ c or cl to D, cursive s to a d kind of works
  e: ["o", "s"],
  f: ["z", "t"],
  h: ["h", "rl"], // h ↔ h or rl to h
  i: ["i"],
  j: ["t"],
  k: ["tl", "ti"], //capital T
  l: ["l"],
  m: ["m", "nn"],
  o: ["o"],
  p: ["cj", "ej"], // p ↔ cj
  s: ["z", "a"], // s ↔ z or a (cursive)
  t: ["t"],
  u: ["u"],
  v: ["v"],
  w: ["w", "vv"],
  x: ["x"],
  y: ["y", "lv"],

  // digraph *inputs* as well (for the “vice versa” direction)
  cl: ["b", "d"],
  ej: ["p"],
  el: ["b"],
  fl: ["a"],
  lv: ["y"],
  nn: ["m"],
  rl: ["h"],
  cj: ["p"],
  vv: ["w"],
  z: ["s"],
  a_s: ["s"], // optional if you want a ↔ s; or just keep z↔s
};

//USE when Mr. Murmerer trying to talk in vertical, use this with single letter replacement
//Characters can use the less symmetrical ones like R to R. Do something with numbers
let SymmetricAcrossVerticalPlane = {
  a: ["a"], // a ↔ a
  b: ["d", "e"], // b ↔ d
  d: ["b", "h"], //
  e: ["e"],
  f: ["t"], //lowercase
  h: ["h"], // h ↔ h or rl to h
  i: ["i"],
  j: ["t"],
  l: ["l"],
  m: ["m"],
  n: ["n"],
  o: ["o"],
  p: ["q"], // p ↔ cj
  r: ["r"],
  s: ["z"],
  t: ["t"],
  u: ["u"],
  v: ["v"],
  w: ["w"],
  x: ["x"],
  y: ["y"],
  z: ["z"],
};

let roundedLetterPairs = {
  a: "r", //A -> R
  d: "o", //D -> O
  e: "b", //E -> B
  f: "p", //F -> P
  g: "o",
  h: "b", //H -> B
  k: "r",
  l: ["c", "s", "j"], //what if I also change an l to a j by adding a dot at the top, curves to an s
  t: ["j", "b"],
  v: "u",
  x: "r",
  y: "m",//TODO q -> g, y -> g
};

// cache for normalized mappings so we don't recompute for every call
const _singleChangeCache = new WeakMap();

function _getSingleChangeMapping(pairs) {
  let cached = _singleChangeCache.get(pairs);
  if (cached) return cached;

  const singleMap = new Map(); // single char -> outputs[]
  const digraphMap = new Map(); // 2-char key -> outputs[]
  let hasDigraphs = false;

  for (const key in pairs) {
    const val = pairs[key];
    const outputs = Array.isArray(val) ? val : [val];

    if (key.length === 1) {
      singleMap.set(key, outputs);
    } else if (key.length === 2) {
      digraphMap.set(key, outputs);
      hasDigraphs = true;
    }
  }

  const mapping = { singleMap, digraphMap, hasDigraphs };
  _singleChangeCache.set(pairs, mapping);
  return mapping;
}

/**
 * SingleChange:
 * Change exactly ONE unit (1 letter or 2-letter digraph) in `word`
 * using `pairs`, and return all *different* words that exist in `wordSet`.
 *
 * Returns false if there are no different words, otherwise an array of words.
 */
const SingleChange = (word, pairs, wordSet) => {
  const s = word.toLowerCase();
  const len = s.length;
  if (len === 0) return false;

  const { singleMap, digraphMap, hasDigraphs } = _getSingleChangeMapping(pairs);
  const results = new Set();

  // quick bail-out if no chars in the word are mappable and no digraphs
  let hasMappableChar = false;
  for (let i = 0; i < len; i++) {
    if (singleMap.has(s[i])) {
      hasMappableChar = true;
      break;
    }
  }
  if (!hasMappableChar && !hasDigraphs) return false;

  for (let i = 0; i < len; i++) {
    // 1) digraph at position i (if we have any digraph keys)
    if (hasDigraphs && i + 1 < len) {
      const digraph = s.slice(i, i + 2);
      const outs = digraphMap.get(digraph);
      if (outs) {
        for (const out of outs) {
          const candidate = s.slice(0, i) + out + s.slice(i + 2);
          // 🔑 must be different from original
          if (candidate !== s && wordSet.has(candidate)) {
            results.add(candidate);
          }
        }
      }
    }

    // 2) single-character mapping at position i
    const ch = s[i];
    const outs = singleMap.get(ch);
    if (!outs) continue;

    for (const out of outs) {
      const candidate = s.slice(0, i) + out + s.slice(i + 1);
      // 🔑 must be different from original
      if (candidate !== s && wordSet.has(candidate)) {
        results.add(candidate);
      }
    }
  }

  return results.size ? Array.from(results) : false;
};

// word        : input word (string)
// pairs       : your symmetric dictionary
// wordSet     : a Set of valid words (lowercase) from 2of12.txt
const VerticalSymmetry = (word, pairs, wordSet) => {
  const lower = word.toLowerCase();
  const len = lower.length;

  // Normalize pairs into a Map: key -> array of possible outputs
  const map = new Map();
  for (let key in pairs) {
    const val = pairs[key];
    map.set(key, Array.isArray(val) ? val : [val]);
  }

  // We also need a quick lookup of allowed letters for final output
  const allowedLetters = new Set(Object.keys(pairs));

  // DFS search: try all mapping combinations
  let found = null;

  const dfs = (pos, segments) => {
    if (found) return;

    if (pos === len) {
      const candidate = segments.join("");

      // Rule #1: must be a real word
      if (!wordSet.has(candidate)) return;

      // Rule #2: candidate can ONLY contain letters from the symmetry key
      for (let ch of candidate) {
        if (!allowedLetters.has(ch)) return;
      }

      found = candidate;
      return;
    }

    const ch = lower[pos];
    if (!map.has(ch)) return; // no mapping at all → dead end

    for (const out of map.get(ch)) {
      segments.push(out);
      dfs(pos + 1, segments);
      segments.pop();

      if (found) return;
    }
  };

  dfs(0, []);

  return found || false;
};

// word: string (lowercase)
// pairs: { [letter]: string[] }
const encodeRightAngle = (word, pairs) => {
  const s = word.toLowerCase();
  const len = s.length;

  // normalize pairs so every value is an array
  const map = {};
  for (const ch in pairs) {
    map[ch] = Array.isArray(pairs[ch]) ? pairs[ch] : [pairs[ch]];
  }

  const results = new Set();

  const dfs = (pos, currentCode) => {
    if (pos === len) {
      if (currentCode.length > 0) {
        results.add(currentCode);
      }
      return;
    }

    const ch = s[pos];
    const options = map[ch];
    if (!options) {
      // this word can't be fully encoded
      return;
    }

    for (const digit of options) {
      dfs(pos + 1, currentCode + digit);
    }
  };

  dfs(0, "");

  return results.size ? Array.from(results) : false;
};

//const fs = require("fs");

const CreateRightAngleJS = (jsName, pairs) => {
  const filename = "2of12.txt";
  const raw = fs.readFileSync(filename, "utf8").split("\n");
  const words = raw.map((w) => w.trim().toLowerCase()).filter(Boolean);

  const codeToWords = {};

  for (const word of words) {
    const codes = encodeRightAngle(word, pairs);
    if (!codes) continue;

    for (const code of codes) {
      if (!codeToWords[code]) {
        codeToWords[code] = [];
      }
      codeToWords[code].push(word);
    }
  }

  // 🔥 No more "delete if length < 2"!
  // If you EVER want that behavior again, it would go here.

  const content =
    `const data = ${JSON.stringify(codeToWords, null, 2)};\n\n` +
    `export default data;`;

  fs.writeFileSync(jsName, content, "utf-8");
  console.log(`Successfully created ${jsName}!`);
};

// Ambigram generator:
// - supports multi-output pairs
// - supports digraph input keys ("uu", "nn")
// - supports multi-letter output segments
// - produces ALL possible results (not just one)
// - reverses segments (ambigram behavior)
// - filters against wordSet if provided
const ambigram = (word, pairs, wordSet) => {
  const lower = word.toLowerCase();
  const len = lower.length;

  // Normalize pairs into Map<string, string[]>
  const map = new Map();
  for (const key in pairs) {
    const val = pairs[key];
    map.set(key, Array.isArray(val) ? val : [val]);
  }

  const results = new Set();

  const dfs = (pos, segments) => {
    if (pos === len) {
      // Ambigram flips 180°, reversing glyph order
      const candidate = segments.slice().reverse().join("");

      if (!wordSet || wordSet.has(candidate)) {
        results.add(candidate);
      }
      return;
    }

    // Try 2-letter input digraphs first (e.g. "uu", "nn")
    if (pos + 1 < len) {
      const digraph = lower.slice(pos, pos + 2);
      if (map.has(digraph)) {
        for (const out of map.get(digraph)) {
          segments.push(out);
          dfs(pos + 2, segments);
          segments.pop();
        }
      }
    }

    // Try single-letter mapping
    const ch = lower[pos];
    if (!map.has(ch)) return; // dead path if no mapping available

    for (const out of map.get(ch)) {
      segments.push(out);
      dfs(pos + 1, segments);
      segments.pop();
    }
  };

  dfs(0, []);

  return results.size ? Array.from(results) : false;
};

// word      : input word (string)
// pairs     : mapping, values can be string or string[]
// wordSet   : Set<string> of valid words from 2of12.txt (or undefined)
const VertMirror = (word, pairs, wordSet) => {
  const lower = word.toLowerCase();
  const len = lower.length;

  // normalize pairs into key -> array of options
  const map = new Map();
  for (const key in pairs) {
    const val = pairs[key];
    map.set(key, Array.isArray(val) ? val : [val]);
  }

  const results = new Set();

  // DFS over positions, building all combinations
  const dfs = (pos, segments) => {
    if (pos === len) {
      const candidate = segments.join("");

      if (!wordSet || wordSet.has(candidate)) {
        results.add(candidate);
      }
      return;
    }

    const ch = lower[pos];
    if (!map.has(ch)) {
      // no mapping for this character => dead path
      return;
    }

    const outs = map.get(ch);
    for (const out of outs) {
      segments.push(out);
      dfs(pos + 1, segments);
      segments.pop();
    }
  };

  dfs(0, []);

  if (results.size === 0) return false;
  return Array.from(results); // you can sort if you want
};

// word: string
// pairs: { [key: string]: string | string[] }
// wordSet: Set<string> of valid words (from 2of12.txt)
const HorizMirror = (word, pairs, wordSet) => {
  const s = word.toLowerCase();
  const len = s.length;

  // normalize pairs into Map<string, string[]>
  const map = new Map();
  for (const key in pairs) {
    const val = pairs[key];
    map.set(key, Array.isArray(val) ? val : [val]);
  }

  const results = new Set();

  const dfs = (pos, segments) => {
    if (pos === len) {
      // mirror across vertical axis: reverse glyph segments
      const mirrored = segments.slice().reverse().join("");
      if (!wordSet || wordSet.has(mirrored)) {
        results.add(mirrored);
      }
      return;
    }

    // Try a 2-letter input chunk first (digraphs like "rl", "cl", "cj")
    if (pos + 1 < len) {
      const digraph = s.slice(pos, pos + 2);
      if (map.has(digraph)) {
        for (const out of map.get(digraph)) {
          segments.push(out);
          dfs(pos + 2, segments);
          segments.pop();
        }
      }
    }

    // Then try single-letter mapping
    const ch = s[pos];
    if (!map.has(ch)) return; // dead end if no mapping

    for (const out of map.get(ch)) {
      segments.push(out);
      dfs(pos + 1, segments);
      segments.pop();
    }
  };

  dfs(0, []);

  if (results.size === 0) return false;

  // convert to array; you can sort if you want deterministic order
  return Array.from(results);
};

const VertCapitalMirror = (word, pairs) => {
  let arr = word.split("");

  for (let i = 0; i < arr.length; i++) {
    //ABCDEHIKOX plus M and W switch. Need to keep track of this so
    let verticalSymmetricCapitalLetters = "abcdehikox";

    // if (i === 0) {
    //   if (verticalSymmetricCapitalLetters.includes(arr[i])) {
    //     continue;
    //   } else if (arr[i] === "m") {
    //     arr[i] = "w";
    //     continue;
    //   } else if (arr[i] === "w") {
    //     arr[i] = "m";
    //     continue;
    //   }
    // }

    if (i === 0) {
      if (capVertPairs[arr[i]] === undefined) {
        return false;
      } else {
        arr[i] = capVertPairs[arr[i]];
      }
    } else {
      if (pairs[arr[i]] === undefined) {
        return false;
      } else {
        arr[i] = pairs[arr[i]];
      }
    }

    let alteredWord = arr.join("");

    // if (alteredWord === word) {
    //   return false;
    // } else {
    return alteredWord;
    // }
  }
};

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.substring(1);
}

const RoundLetters = (word, pairs, dictionary) => {
  for (let i = 0; i < word.length; i++) {
    let char = word[i];
    if (pairs[char]) {
      let alteredWord =
        word.substring(0, i) + pairs[char] + word.substring(i + 1);
      if (dictionary.includes(alteredWord)) {
        if (alteredWord === word && bIsOnlyChangedWords) {
          return false;
        } else {
          return alteredWord;
        }
      }
    }
  }

  return false;
};

const RoundLettersMultiple = (word, pairs, dictionary) => {
  let results = new Set();
  let indices = [];

  // Find all indices of characters that can be changed
  for (let i = 0; i < word.length; i++) {
    if (pairs[word[i]]) {
      indices.push(i);
    }
  }

  // Generate all combinations of changing at least two letters
  const generateCombinations = (currentWord, index, changes) => {
    if (changes >= 2 && dictionary.includes(currentWord)) {
      results.add(currentWord);
    }
    for (let i = index; i < indices.length; i++) {
      let newWord =
        currentWord.substring(0, indices[i]) +
        pairs[currentWord[indices[i]]] +
        currentWord.substring(indices[i] + 1);
      generateCombinations(newWord, i + 1, changes + 1);
    }
  };

  generateCombinations(word, 0, 0);
  return results.size > 0 ? Array.from(results) : false;
};

const CreateJSON = (jsonName) => {
  const filename = "words_alpha.txt";
  const data = fs.readFileSync(filename, "utf8").split("\n");
  let typeOfWordObj = {};

  for (let i = 0; i < data.length; i++) {
    let word = data[i].trim();
    let alteredWord = VertMirror(word, vertPairs);
    let secondAlteredWord = VertCapitalMirror(word, vertPairs);

    if (secondAlteredWord) {
      if (binarySearch(data, secondAlteredWord) !== -1) {
        typeOfWordObj[capitalizeFirstLetter(word)] =
          capitalizeFirstLetter(secondAlteredWord);
      }
    }

    if (alteredWord) {
      if (binarySearch(data, alteredWord) !== -1) {
        typeOfWordObj[word] = alteredWord;
      }
    }
  }

  fs.writeFileSync(jsonName, JSON.stringify(typeOfWordObj), "utf-8");
  console.log(`Successfully created ${jsonName}!`);
};

function binarySearch(arr, value) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] < value) {
      left = mid + 1;
    } else if (arr[mid] > value) {
      right = mid - 1;
    } else {
      return mid; // Found the value
    }
  }

  return -1; // Couldn't find the value
}

const CreateJS = (jsName, typeOfJSFunction) => {
  const filename = "2of12.txt";
  const data = fs.readFileSync(filename, "utf8").split("\n");
  const wordSet = new Set(data.map((w) => w.trim().toLowerCase()));
  let typeOfWordObj = {};
  if (typeOfJSFunction === "onlyConsonants") {
    const vowels = /[aeiou]/gi;

    for (let i = 0; i < data.length; i++) {
      const word = data[i].trim().toLowerCase();
      const key = word.replace(vowels, "");
      if (!typeOfWordObj[key]) {
        typeOfWordObj[key] = [];
      }
      typeOfWordObj[key].push(word);
    }

    // Optional: Only keep keys with multiple entries
    for (const key in typeOfWordObj) {
      if (typeOfWordObj[key].length < 2) {
        delete typeOfWordObj[key];
      }
    }
  } else if (typeOfJSFunction === "alphabeticalNeighbors") {
    for (let word of wordSet) {
      let neighbors = new Set();

      for (let i = 0; i < word.length; i++) {
        let char = word[i];
        let prevChar =
          char === "a" ? "z" : String.fromCharCode(char.charCodeAt(0) - 1);
        let nextChar =
          char === "z" ? "a" : String.fromCharCode(char.charCodeAt(0) + 1);

        // Replace with previous character
        let prevWord = word.slice(0, i) + prevChar + word.slice(i + 1);
        if (wordSet.has(prevWord)) neighbors.add(prevWord);

        // Replace with next character
        let nextWord = word.slice(0, i) + nextChar + word.slice(i + 1);
        if (wordSet.has(nextWord)) neighbors.add(nextWord);
      }

      if (neighbors.size > 0) {
        typeOfWordObj[word] = Array.from(neighbors);
      }
    }
  } else {
    for (let i = 0; i < data.length; i++) {
      let word = data[i].trim();
      let alteredWord;
      if (typeOfJSFunction === "mirror") {
        const mirroredList = VertMirror(word, vertPairs, wordSet);
        if (mirroredList && mirroredList.length) {
          typeOfWordObj[word] = mirroredList; // array of possibilities
        }
      }
      if (typeOfJSFunction === "NinetyDegreeClockwise") {
        const mirroredList = VertMirror(word, NinetyDegreesClockWise, wordSet);
        if (mirroredList && mirroredList.length) {
          typeOfWordObj[word] = mirroredList; // array of possibilities
        }
      }
      if (typeOfJSFunction === "NinetyDegreeRise") {
        const mirroredList = HorizMirror(
          word,
          NinetyDegreesCounterClockWise,
          wordSet
        );
        if (mirroredList && mirroredList.length) {
          typeOfWordObj[word] = mirroredList; // array of possibilities
        }
      }
      if (typeOfJSFunction === "NinetyDegreeCounterClock") {
        const mirroredList = VertMirror(
          word,
          NinetyDegreesCounterClockWise,
          wordSet
        );
        if (mirroredList && mirroredList.length) {
          typeOfWordObj[word] = mirroredList; // array of possibilities
        }
      }
      if (typeOfJSFunction === "90DegMirror") {
        const mirroredList = VertMirror(word, rightAngles, wordSet);
        if (mirroredList && mirroredList.length) {
          typeOfWordObj[word] = mirroredList; // array of possibilities
        }
      }
      if (typeOfJSFunction === "NinetyDegreeClockBack") {
        const mirroredList = HorizMirror(word, NinetyDegreesClockWise, wordSet);
        if (mirroredList && mirroredList.length) {
          typeOfWordObj[word] = mirroredList; // array of possibilities
        }
      } else if (typeOfJSFunction === "SingleLetterVertMirror") {
        const list = SingleChange(word, vertPairs, wordSet);
        if (list && list.length) {
          typeOfWordObj[word] = list;
        }
      }
      if (typeOfJSFunction === "SingleLetterHorizMirror") {
        alteredWord = RoundLetters(word, horPairs, data); //Roundletters can do the thing that needs done
      }
      if (typeOfJSFunction === "SingleLetterVertSpeak") {
        alteredWord = VerticalSymmetry(
          word,
          SymmetricAcrossVerticalPlane,
          wordSet
        ); //Roundletters can do the thing that needs done
      }
      if (typeOfJSFunction === "sideMirror") {
        const mirroredList = HorizMirror(word, HorizPairs, wordSet);
        if (mirroredList && mirroredList.length) {
          typeOfWordObj[word] = mirroredList; // array of possibilities
        }
      }
      if (typeOfJSFunction === "ambigram") {
        const list = ambigram(word, AmbigramPairs, wordSet);
        if (list && list.length) {
          typeOfWordObj[word] = list; // store the array of possibilities
        }
      } else if (typeOfJSFunction === "roundLetters") {
        const list = SingleChange(word, roundedLetterPairs, wordSet);
        if (list && list.length) {
          typeOfWordObj[word] = list;
        }
        //alteredWord = RoundLetters(word, roundedLetterPairs, data);
      } else if (typeOfJSFunction === "roundLettersMulti") {
        alteredWord = RoundLettersMultiple(word, roundedLetterPairs, data);
      } else if (typeOfJSFunction === "alphabetical") {
        let alphabetized = word.split("").sort().join("");
        if (alphabetized !== word && wordSet.has(alphabetized)) {
          alteredWord = alphabetized;
        }
      } else if (typeOfJSFunction === "reverseAlphabetical") {
        let reverseAlpha = word.split("").sort().reverse().join("");
        if (reverseAlpha !== word && wordSet.has(reverseAlpha)) {
          alteredWord = reverseAlpha;
        }
      }
      // let secondAlteredWord = VertCapitalMirror(word, vertPairs);

      // if (secondAlteredWord) {
      //   if (binarySearch(data, secondAlteredWord) !== -1) {
      //     typeOfWordObj[capitalizeFirstLetter(word)] =
      //       capitalizeFirstLetter(secondAlteredWord);
      //   }
      // }

      if (alteredWord) {
        if (binarySearch(data, alteredWord) !== -1) {
          typeOfWordObj[word] = alteredWord;
        }
      }
    }
  }

  const content = `const data = ${JSON.stringify(
    typeOfWordObj,
    null,
    2
  )};\n\nexport default data;`;

  fs.writeFileSync(jsName, content, "utf-8");
  console.log(`Successfully created ${jsName}!`);
};

//CreateJS("ambigramPOJO.js", "ambigram");
//CreateJS("hanglerAngle.js", "SingleLetterVertMirror");
//CreateJS("todbotPOJO.js", "mirror");
//CreateJS("NinetyDegreesClockwisePOJO.js", "NinetyDegreeClockwise");
//CreateJS("NinetyDegreesClockBackPOJO.js", "NinetyDegreeClockBack");
//CreateJS("SingleLetterVertSpeakPOJO.js", "SingleLetterVertSpeak");
//CreateJS("NinetyDegreeCounterClockPOJO.js", "NinetyDegreeCounterClock");
//CreateJS("NinetyDegreesRisePOJO.js", "NinetyDegreeRise");
//CreateJS("todbotHorizontalPOJO.js", "sideMirror");
//CreateJS("RightAngleMirrorPOJO.js", "90DegMirror");
CreateJS("roundLetters.js", "roundLetters");
//CreateJS("roundLettersMulti.js", "roundLettersMulti");
//CreateJS("alphabeticalWords.js", "alphabetical");
//CreateJS("alphabeticalWordsReverse.js", "reverseAlphabetical");
//CreateJS("onlyConsonants.js", "onlyConsonants");
//CreateJS("alphabeticalNeighbors.js", "alphabeticalNeighbors");
//CreateJS("SingleLetterVertMirror.js", "SingleLetterVertMirror");
//CreateJS("SingleLetterHorizMirror.js", "SingleLetterHorizMirror");
//CreateRightAngleJS("rightAngleNums.js", rightAngleNums);

//CreateJSON("todbotWithCapitals.json");

const CreateRoundedSpans = (inputData, outputFileName) => {
  let spanMap = {};

  for (const [original, transformed] of Object.entries(inputData)) {
    if (Array.isArray(transformed)) {
      for (const word of transformed) {
        spanMap[
          original
        ] = `<span id="Roundabout" data-rounded-word="${word}">${original}</span>`;
      }
    } else {
      spanMap[
        original
      ] = `<span id="Roundabout" data-rounded-word="${transformed}">${original}</span>`;
    }
  }

  const output = `const roundedLetterSpans = ${JSON.stringify(
    spanMap,
    null,
    2
  )};\n\nexport default roundedLetterSpans;`;
  fs.writeFileSync(outputFileName, output, "utf-8");
  console.log(`Successfully created ${outputFileName}`);
};

// Example usage:
// const roundSingle = require("./roundLetters.js").default;
// const roundMulti = require("./roundLettersMulti.js").default;
//CreateRoundedSpans(roundWordsSingle, "RoundedSpans.js");
//CreateRoundedSpans(roundWords, "RoundedMultiSpans.js");
