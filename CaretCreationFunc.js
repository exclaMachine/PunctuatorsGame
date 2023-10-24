const fs = require("fs");

function createWordsWithOneAddedCharacterJS() {
  const filename = "2of12.txt";
  const words = fs.readFileSync(filename, "utf8").split("\n").filter(Boolean);
  const matchingWords = {};

  for (let word of words) {
    let found = false;
    for (let i = 0; i <= word.length; i++) {
      for (let char of "abcdefghijklmnopqrstuvwxyz") {
        const alteredWord = word.slice(0, i) + char + word.slice(i);
        const alteredWordWithSpan = `<span id="Zana (caret)" data-caret="${alteredWord}">${word}</span>`;
        if (binarySearch(words, alteredWord)) {
          matchingWords[word] = alteredWordWithSpan;
          found = true;
          break;
        }
      }
      if (found) break;
    }
  }

  const outputContent = `const caretWords = ${JSON.stringify(
    matchingWords
  )};\nexport default caretWords;`;

  fs.writeFileSync("oneMoreCharacterWordsWithSpan.js", outputContent);
  console.log(`Successfully created oneMoreCharacterWordsWithSpan.js!`);
}

// Binary search function for faster lookup in sorted word list
function binarySearch(words, target) {
  let low = 0;
  let high = words.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (words[mid] === target) return true;
    if (words[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return false;
}

// For testing
createWordsWithOneAddedCharacterJS();
