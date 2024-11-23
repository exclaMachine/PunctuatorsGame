const fs = require("fs");
const palindromes = require("./palindromes.js"); // Import palindromes.js

// Helper function to check if a string is a palindrome
const isPalindrome = (str) => str === str.split("").reverse().join("");

// Function to find two-word palindromes using `palindromes.js`
function findTwoWordPalindromesFromPalindromes() {
  const filename = "2of12.txt"; // Input word list file
  const words = new Set(
    fs
      .readFileSync(filename, "utf8")
      .split("\n")
      .map((word) => word.trim().toLowerCase())
      .filter((word) => word.length > 1) // Skip single-letter words
  );

  const matchingPalindromes = [];
  const middleLetters = "abcdefghijklmnopqrstuvwxyz"; // Possible middle letters

  for (const word of palindromes) {
    if (word.length === 1) continue; // Exclude single-letter palindromes

    for (let middle of middleLetters) {
      // Add middle letter to the end of the first `word`
      const possibleWord1 = word + middle; // Append middle letter to the first `word`
      if (words.has(possibleWord1)) {
        const spacedPhrase = possibleWord1 + " " + word;
        matchingPalindromes.push({ palindrome: spacedPhrase, middle });
      }

      // Add middle letter to the beginning of the second `word`
      const possibleWord2Start = middle + word; // Prepend middle letter to the second `word`
      if (words.has(possibleWord2Start)) {
        const spacedPhrase = word + " " + possibleWord2Start;
        matchingPalindromes.push({ palindrome: spacedPhrase, middle });
      }
    }
  }

  // Write matching palindromes to a file
  const outputContent = `const twoWordPalindromes = ${JSON.stringify(
    matchingPalindromes,
    null,
    2
  )};\nmodule.exports = twoWordPalindromes;`;

  fs.writeFileSync("twoWordPalindromesFromPalindromes.js", outputContent);
  console.log(
    "Successfully created twoWordPalindromesFromPalindromes.js with valid pairs!"
  );
}

// For testing
findTwoWordPalindromesFromPalindromes();
