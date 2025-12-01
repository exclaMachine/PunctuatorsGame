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
  e: ["n", "m"],
  f: ["f"],
  h: ["i", "z"],
  i: ["h", "n"],
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
  e: ["e", "o"], // E -> E, e -> o
  f: ["t", "b"],
  g: ["g", "c", "q"],
  h: ["h"], // Only Cap visually
  i: ["i", "l"], // Only Cap visually
  j: ["l"],
  k: ["k"],
  l: ["l"],
  m: ["w"],
  n: ["n"], // N looks like lowercase n flipped
  o: ["o"],
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
  h: "b", //H -> B
  k: "r",
  l: "c",
  t: "j",
  v: "u",
  y: "m",
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

// Ambigram with arrays + digraph support + dictionary filtering
const ambigram = (word, pairs, wordSet) => {
  const lower = word.toLowerCase();
  const len = lower.length;

  // normalize pairs so every key maps to an array
  const map = new Map();
  for (let key in pairs) {
    const val = pairs[key];
    map.set(key, Array.isArray(val) ? val : [val]);
  }

  // if wordSet not provided, just use first mapping per letter
  if (!wordSet) {
    const out = [];
    for (let i = 0; i < len; i++) {
      const ch = lower[i];
      if (!map.has(ch)) return false;
      out.push(map.get(ch)[0]);
    }
    return out.reverse().join("");
  }

  // DFS search: try all combos until one forms a valid dictionary word
  let found = null;

  const dfs = (pos, segments) => {
    if (found) return;

    if (pos === len) {
      const candidate = segments.slice().reverse().join("");
      if (wordSet.has(candidate)) {
        found = candidate;
      }
      return;
    }

    // Try 2-letter input digraphs (like "uu", "nn") first
    if (pos + 1 < len) {
      const digraph = lower.slice(pos, pos + 2);
      if (map.has(digraph)) {
        for (const out of map.get(digraph)) {
          dfs(pos + 2, segments.concat(out));
          if (found) return;
        }
      }
    }

    // Try single-letter mapping
    const ch = lower[pos];
    if (!map.has(ch)) return;

    for (const out of map.get(ch)) {
      dfs(pos + 1, segments.concat(out));
      if (found) return;
    }
  };

  dfs(0, []);

  return found || false;
};

// word: string
// pairs: { [char]: string | string[] }
// wordSet: Set<string> or undefined
const VertMirror = (word, pairs, wordSet) => {
  const chars = word.split("");

  // normalize pairs into { key: string[] }
  const norm = {};
  for (const key in pairs) {
    const val = pairs[key];
    norm[key] = Array.isArray(val) ? val : [val];
  }

  // If no wordSet is given, just use the first option per character
  if (!wordSet) {
    const out = [];
    for (const ch of chars) {
      if (!norm[ch]) return false;
      out.push(norm[ch][0]);
    }
    return out.join("");
  }

  // If wordSet exists, explore combinations until we find a real word
  let found = null;

  const dfs = (idx, acc) => {
    if (found !== null) return; // early exit if we already found one

    if (idx === chars.length) {
      const candidate = acc.join("");
      if (wordSet.has(candidate)) {
        found = candidate;
      }
      return;
    }

    const ch = chars[idx];
    const options = norm[ch];
    if (!options) {
      // this character has no mapping -> dead path
      return;
    }

    for (const opt of options) {
      acc.push(opt);
      dfs(idx + 1, acc);
      acc.pop();
      if (found !== null) return;
    }
  };

  dfs(0, []);

  return found || false;
};

// word: original word (string)
// pairs: object where key -> string | string[] (we’ll normalize to arrays)
// wordSet: Set of valid dictionary words (from 2of12.txt)
const HorizMirror = (word, pairs, wordSet) => {
  const s = word.toLowerCase();
  const len = s.length;

  // normalize pairs into a Map<string, string[]>
  const map = new Map();
  for (const key in pairs) {
    const val = pairs[key];
    if (Array.isArray(val)) {
      map.set(key, val);
    } else {
      map.set(key, [val]);
    }
  }

  let found = null;

  const dfs = (pos, segments) => {
    if (found !== null) return; // early exit if we already found a valid word

    if (pos === len) {
      // finished scanning input; build mirrored word
      const mirrored = segments.slice().reverse().join("");
      if (wordSet.has(mirrored)) {
        found = mirrored;
      }
      return;
    }

    // Try a 2-character chunk first (digraphs like "rl", "cl", "cj")
    if (pos + 1 < len) {
      const digraph = s.slice(pos, pos + 2);
      if (map.has(digraph)) {
        const outs = map.get(digraph);
        for (const out of outs) {
          dfs(pos + 2, segments.concat(out));
          if (found !== null) return;
        }
      }
    }

    // Then try single-character mapping
    const ch = s[pos];
    if (map.has(ch)) {
      const outs = map.get(ch);
      for (const out of outs) {
        dfs(pos + 1, segments.concat(out));
        if (found !== null) return;
      }
    } else {
      // no mapping for this character at all: this path is dead
      return;
    }
  };

  dfs(0, []);

  return found || false;
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
        alteredWord = VertMirror(word, vertPairs);
      }
      if (typeOfJSFunction === "NinetyDegreeClockwise") {
        alteredWord = VertMirror(word, NinetyDegreesClockWise, wordSet);
      }
      if (typeOfJSFunction === "NinetyDegreeRise") {
        alteredWord = HorizMirror(word, NinetyDegreesCounterClockWise, wordSet);
      }
      if (typeOfJSFunction === "NinetyDegreeCounterClock") {
        alteredWord = VertMirror(word, NinetyDegreesCounterClockWise, wordSet);
      }
      if (typeOfJSFunction === "NinetyDegreeClockBack") {
        alteredWord = HorizMirror(word, NinetyDegreesClockWise, wordSet); //seen in reverse
      }
      if (typeOfJSFunction === "SingleLetterVertMirror") {
        //alteredWord = RoundLetters(word, vertPairs, data);
        alteredWord = RoundLetters(word, hanglerAngles, data);
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
        alteredWord = HorizMirror(word, HorizPairs, wordSet);
      }
      if (typeOfJSFunction === "ambigram") {
        alteredWord = ambigram(word, AmbigramPairs, wordSet);
      } else if (typeOfJSFunction === "roundLetters") {
        alteredWord = RoundLetters(word, roundedLetterPairs, data);
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
CreateJS("SingleLetterVertSpeakPOJO.js", "SingleLetterVertSpeak");
//CreateJS("NinetyDegreeCounterClockPOJO.js", "NinetyDegreeCounterClock");
//CreateJS("NinetyDegreesRisePOJO.js", "NinetyDegreeRise");
//CreateJS("todbotHorizontalPOJO.js", "sideMirror");
//CreateJS("roundLetters.js", "roundLetters");
//CreateJS("roundLettersMulti.js", "roundLettersMulti");
//CreateJS("alphabeticalWords.js", "alphabetical");
//CreateJS("alphabeticalWordsReverse.js", "reverseAlphabetical");
//CreateJS("onlyConsonants.js", "onlyConsonants");
//CreateJS("alphabeticalNeighbors.js", "alphabeticalNeighbors");
//CreateJS("SingleLetterVertMirror.js", "SingleLetterVertMirror");
//CreateJS("SingleLetterHorizMirror.js", "SingleLetterHorizMirror");

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
