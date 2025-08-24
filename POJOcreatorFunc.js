const fs = require("fs");
const roundWords = require("./roundLettersMulti.js");
const roundWordsSingle = require("./roundLetters.js");

let AmbigramPairs = {
  a: "e",
  b: "q",
  d: "p",
  e: "a",
  h: "y",
  i: "i",
  j: "r",
  l: "l",
  m: "w",
  n: "u",
  o: "o",
  p: "d",
  q: "b",
  r: "j",
  s: "s",
  t: "t",
  u: "n",
  w: "m",
  x: "x",
  y: "h",
  z: "z",
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

let vertPairs = {
  //a: "a",
  b: "p",
  //c: "c",
  d: "q",
  f: "t",
  //k: "k",
  //l: "l",
  m: "w",
  //o: "o",
  //p: "b",
  //q: "d",
  //t: "f",
  //w: "m",
  //x: "x",
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

const ambigram = (word, pairs) => {
  let arr = word.split("");

  for (let i = 0; i < arr.length; i++) {
    if (pairs[arr[i]] === undefined) {
      return false;
    } else {
      arr[i] = pairs[arr[i]];
    }
  }

  let reversed = arr.reverse().join("");
  //let reversed = arr.join("");

  if (reversed === word) {
    return false;
  } else {
    return reversed;
  }
};

const VertMirror = (word, pairs) => {
  let arr = word.split("");

  for (let i = 0; i < arr.length; i++) {
    if (pairs[arr[i]] === undefined) {
      return false;
    } else {
      arr[i] = pairs[arr[i]];
    }
  }

  let reversed = arr.join("");
  //let reversed = arr.join("");

  if (reversed === word) {
    return false;
  } else {
    return reversed;
  }
};

const HorizMirror = (word, pairs) => {
  let arr = word.split("");

  for (let i = 0; i < arr.length; i++) {
    if (pairs[arr[i]] === undefined) {
      return false;
    } else {
      arr[i] = pairs[arr[i]];
    }
  }

  let reversed = arr.reverse().join("");
  //let reversed = arr.join("");

  if (reversed === word) {
    return false;
  } else {
    return reversed;
  }
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

    if (alteredWord === word) {
      return false;
    } else {
      return alteredWord;
    }
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
        return alteredWord;
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
      if (typeOfJSFunction === "SingleLetterVertMirror") {
        alteredWord = RoundLetters(word, vertPairs, data);
      }
      if (typeOfJSFunction === "SingleLetterHorizMirror") {
        alteredWord = RoundLetters(word, horPairs, data);
      }
      if (typeOfJSFunction === "sideMirror") {
        alteredWord = HorizMirror(word, horPairs);
      }
      if (typeOfJSFunction === "ambigram") {
        alteredWord = ambigram(word, AmbigramPairs);
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
// CreateJS("todbotPOJO.js", "mirror");
//CreateJS("todbotHorizontalPOJO.js", "sideMirror");
//CreateJS("roundLetters.js", "roundLetters");
//CreateJS("roundLettersMulti.js", "roundLettersMulti");
//CreateJS("alphabeticalWords.js", "alphabetical");
//CreateJS("alphabeticalWordsReverse.js", "reverseAlphabetical");
//CreateJS("onlyConsonants.js", "onlyConsonants");
//CreateJS("alphabeticalNeighbors.js", "alphabeticalNeighbors");
CreateJS("SingleLetterVertMirror.js", "SingleLetterVertMirror");
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
