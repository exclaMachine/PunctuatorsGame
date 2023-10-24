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

// function createWordsWithOneLessCharacterJS() {
//   const filename = "2of12.txt";
//   const words = fs.readFileSync(filename, "utf8").split("\n").filter(Boolean);
//   const matchingWords = {};
//   for (let word of words) {
//     for (let i = 0; i < word.length; i++) {
//       const alteredWord = word.slice(0, i) + word.slice(i + 1);
//       const alteredWordWithSpan =
//         word.slice(0, i) +
//         `<span id="Sir Dele of Dallying">${word[i]}</span>` +
//         word.slice(i + 1);
//       if (binarySearch(words, alteredWord)) {
//         matchingWords[word] = alteredWordWithSpan;
//         break;
//       }
//     }
//   }

//   const outputContent = `const witeOutWords = ${JSON.stringify(
//     matchingWords
//   )};\nexport default witeOutWords;`;

//   fs.writeFileSync("oneLessCharacterWordsWithSpan.js", outputContent);
//   console.log(`Successfully created oneLessCharacterWordsWithSpan.js!`);
// }

// //For testing
// createWordsWithOneLessCharacterJS();

export const wrapWiteOutWords = (sentence) => {
  const words = sentence.split(/\b/); // Splitting by word boundary

  const splitted = words.map((word) => {
    if (witeOutWords[word]) {
      return witeOutWords[word];
    }
    return word;
  });
  return splitted.join("");
};
