const fs = require("fs");

// Binary search implementation to check if a word is present in the words.txt file
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

// Function to create a JSON of words split into two valid words. Make spacel split words instead of putting them together
function createWordsThatCanBeSplitJSON() {
  const filename = "words_alpha.txt"; //Will probably change this
  const words = fs.readFileSync(filename, "utf8").split("\n").filter(Boolean);
  const matchingWords = {};

  for (let word of words) {
    let bestSplit = null; // To store the best split position
    let bestDistanceToCenter = Infinity; // To store the distance to the center for the best split

    for (let i = 1; i < word.length; i++) {
      // Starting from 1 because the minimum length for the first split word is 1
      const firstWord = word.slice(0, i);
      const secondWord = word.slice(i);

      if (binarySearch(words, firstWord) && binarySearch(words, secondWord)) {
        const currentDistanceToCenter = Math.abs(word.length / 2 - i);
        if (currentDistanceToCenter < bestDistanceToCenter) {
          bestDistanceToCenter = currentDistanceToCenter;
          bestSplit = i;
        }
      }
    }

    // If we found a best split position, store the result
    if (bestSplit !== null) {
      const firstWord = word.slice(0, bestSplit);
      const secondWord = word.slice(bestSplit);
      const wordWithSpan = `<span class="${firstWord}-${secondWord}">${word}</span>`;
      matchingWords[word] = wordWithSpan;
    }
  }

  fs.writeFileSync("wordsWithSplitClass.json", JSON.stringify(matchingWords));
  console.log(`Successfully created wordsWithSplitClass.json!`);
}

// Run the function
//createWordsThatCanBeSplitJSON();
