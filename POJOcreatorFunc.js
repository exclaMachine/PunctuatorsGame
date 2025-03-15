const fs = require("fs");

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
  d: "b",
  i: "i",
  l: "l",
  m: "m",
  o: "o",
  p: "q",
  q: "p",
  t: "t",
  v: "v",
  w: "w",
  x: "x",
};

let vertPairs = {
  a: "a",
  b: "p",
  c: "c",
  d: "q",
  f: "t",
  k: "k",
  l: "l",
  m: "w",
  o: "o",
  p: "b",
  q: "d",
  t: "f",
  w: "m",
  x: "x",
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
  let results = [];
  for (let i = 0; i < word.length; i++) {
    let char1 = word[i];
    if (pairs[char1]) {
      let wordVariant =
        word.substring(0, i) + pairs[char1] + word.substring(i + 1);
      for (let j = i + 1; j < word.length; j++) {
        let char2 = word[j];
        if (pairs[char2]) {
          let alteredWord =
            wordVariant.substring(0, j) +
            pairs[char2] +
            wordVariant.substring(j + 1);
          if (dictionary.includes(alteredWord)) {
            results.push(alteredWord);
          }
        }
      }
    }
  }
  return results.length > 0 ? results : false;
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
  let typeOfWordObj = {};

  for (let i = 0; i < data.length; i++) {
    let word = data[i].trim();
    let alteredWord;
    if (typeOfJSFunction === "mirror") {
      alteredWord = VertMirror(word, vertPairs);
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
CreateJS("roundLetters.js", "roundLetters");
//CreateJS("roundLettersMulti.js", "roundLettersMulti");

//CreateJSON("todbotWithCapitals.json");
