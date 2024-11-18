// Import necessary modules
const fs = require("fs");

// Utility function: binary search
const binarySearch = (arr, val) => {
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
};

// Main function to find semordnilaps
function findSemordnilaps() {
  const filename = "2of12.txt"; // Input word list file
  const words = fs
    .readFileSync(filename, "utf8")
    .split("\n")
    .map((word) => word.trim().toLowerCase())
    .filter(Boolean); // Read and clean the word list

  const matchingWords = {}; // Object to store semordnilaps
  words.sort(); // Ensure words are sorted for binary search

  for (const word of words) {
    const reversedWord = word.split("").reverse().join("");
    if (word !== reversedWord && binarySearch(words, reversedWord)) {
      // Ensure each pair is added only once
      if (!matchingWords[reversedWord]) {
        matchingWords[word] = reversedWord;
      }
    }
  }

  // Write semordnilaps to a file
  const outputContent = `const semordnilaps = ${JSON.stringify(
    matchingWords,
    null,
    2
  )};\nexport default semordnilaps;`;

  fs.writeFileSync("semordnilaps.js", outputContent);
  console.log("Successfully created semordnilaps.js with matching pairs!");
}

// For testing
findSemordnilaps();

const wrapSemordnilaps = (sentence) => {
  const words = sentence.split(/\b/); // Splitting by word boundary

  return words
    .map((word) => {
      const lowerCaseWord = word.toLowerCase();
      if (semordnilaps[lowerCaseWord]) {
        return `<span data-reversed-word="${semordnilaps[lowerCaseWord]}">${word}</span>`;
      }
      return word;
    })
    .join("");
};
