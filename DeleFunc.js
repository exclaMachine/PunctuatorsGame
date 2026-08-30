// const fs = require("fs");
import witeOutWords from "./oneLessCharacterWordsWithSpan.js";

//import { binarySearch } from "./utils/utils.js";

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

function createWordsWithOneLessCharacterJS() {
  const filename = "2of12.txt";
  const words = fs.readFileSync(filename, "utf8").split("\n").filter(Boolean);
  const matchingWords = {};
  for (let word of words) {
    if (word.length < 3) continue;

    for (let i = 0; i < word.length; i++) {
      const alteredWord = word.slice(0, i) + word.slice(i + 1);
      if (binarySearch(words, alteredWord)) {
        const wordWithSpan = `<span id="Sir Dele of Dallying" data-wited-word="${alteredWord}">${word}</span>`;
        matchingWords[word] = wordWithSpan;
        break;
      }
    }
  }

  const outputContent = `const witeOutWords = ${JSON.stringify(
    matchingWords,
    null,
    2
  )};\nexport default witeOutWords;`;

  fs.writeFileSync("oneLessCharacterWordsWithSpan.js", outputContent);
  console.log(
    `Successfully created oneLessCharacterWordsWithSpan.js with formatted output!`
  );
}

// For testing
// createWordsWithOneLessCharacterJS();

/* See CaretFunc.js's entryFor: a bare `dict[word]` answers for `constructor`, which is an ordinary
   English word, with Object's own constructor function. */
const entryFor = (dict, word) =>
  Object.prototype.hasOwnProperty.call(dict, word) ? dict[word] : undefined;

export const wrapWiteOutWords = (sentence) => {
  const words = sentence.split(/\b/); // Splitting by word boundary

  const splitted = words.map((word) => {
    const entry = entryFor(witeOutWords, word);
    if (entry) {
      return entry;
    }
    return word;
  });
  return splitted.join("");
};

/* Sir Dele's guard — the same \b split and the same exact-token lookup as the wrapper above. */
export const hasWiteOutWords = (sentence) =>
  sentence.split(/\b/).some((word) => entryFor(witeOutWords, word));
