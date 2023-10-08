const fs = require("fs");

// Binary search implementation to check if a word is present in the words.txt file. TODO need to put in own file so not repeating
function binarySearch(arr, val) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === val) {
      return true;
    } else if (arr[mid] < val) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return false;
}

function isValidSplit(firstWord, secondWord, words) {
  if (
    (firstWord.length === 1 && firstWord !== "a" && firstWord !== "i") ||
    (secondWord.length === 1 && secondWord !== "a" && secondWord !== "i")
  ) {
    return false;
  }
  return binarySearch(words, firstWord) && binarySearch(words, secondWord);
}

// Function to create a JS file exporting words split into two valid words
function createWordsThatCanBeSplitJS() {
  //This is from http://wordlist.aspell.net/12dicts/
  const filename = "2of12.txt";
  const words = fs.readFileSync(filename, "utf8").split("\n").filter(Boolean);
  const matchingWords = {};

  for (let word of words) {
    let bestSplit = null;
    let bestDistanceToCenter = Infinity;

    for (let i = 1; i < word.length; i++) {
      const firstWord = word.slice(0, i);
      const secondWord = word.slice(i);

      if (isValidSplit(firstWord, secondWord, words)) {
        const currentDistanceToCenter = Math.abs(word.length / 2 - i);
        if (currentDistanceToCenter < bestDistanceToCenter) {
          bestDistanceToCenter = currentDistanceToCenter;
          bestSplit = i;
        }
      }
    }

    if (bestSplit !== null) {
      const firstWord = word.slice(0, bestSplit);
      const secondWord = word.slice(bestSplit);
      const wordWithSpan = `<span id="Space-el" data-splitwords="${firstWord} ${secondWord}">${word}</span>`;
      matchingWords[word] = wordWithSpan;
    }
  }

  const jsContent = `export const splitWords = ${JSON.stringify(
    matchingWords,
    null,
    2
  )};`;

  fs.writeFileSync("splitWords.js", jsContent);
  console.log(`Successfully created splitWords.js!`);
}

createWordsThatCanBeSplitJS();
