const fs = require("fs");
const semordnilaps = require("./semordnilaps.js");

// Helper function to check if a string is a palindrome
const isPalindrome = (str) => str === str.split("").reverse().join("");

// Function to find two-word palindromes
function findTwoWordPalindromes() {
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

  for (const word1 of Object.keys(semordnilaps)) {
    const reversedWord2 = semordnilaps[word1];

    // Check direct palindrome formation (e.g., "live evil")
    const directCandidate = word1 + reversedWord2;
    if (isPalindrome(directCandidate)) {
      const palindrome = word1 + " " + reversedWord2;
      if (words.has(reversedWord2)) {
        // Ensure reversedWord2 is valid
        matchingPalindromes.push({
          word1,
          middle: null,
          word2: reversedWord2,
          palindrome,
        });
      }
    }

    // Check palindrome formation by adding a middle letter to the end of `word2` (e.g., "evil olive")
    for (let middle of middleLetters) {
      const possibleWord2 = reversedWord2 + middle; // Append middle letter to `word2`
      if (words.has(possibleWord2)) {
        // Validate `possibleWord2`
        const spacedPhrase = word1 + " " + possibleWord2;
        if (isPalindrome(word1 + possibleWord2)) {
          matchingPalindromes.push({
            word1,
            middle,
            word2: possibleWord2,
            palindrome: spacedPhrase,
          });
        }
      }

      // Check palindrome formation by adding a middle letter to the beginning of `word2` (e.g., "evil olive")
      const possibleWord2Start = middle + reversedWord2; // Prepend middle letter to `word2`
      if (words.has(possibleWord2Start)) {
        // Validate `possibleWord2Start`
        const spacedPhrase = word1 + " " + possibleWord2Start;
        if (isPalindrome(word1 + possibleWord2Start)) {
          matchingPalindromes.push({
            word1,
            middle,
            word2: possibleWord2Start,
            palindrome: spacedPhrase,
          });
        }
      }
    }
  }

  // Write matching palindromes to a file
  const outputContent = `const twoWordPalindromes = ${JSON.stringify(
    matchingPalindromes,
    null,
    2
  )};\nmodule.exports = twoWordPalindromes;`;

  fs.writeFileSync("twoWordPalindromes.js", outputContent);
  console.log("Successfully created twoWordPalindromes.js with valid pairs!");
}

// For testing
findTwoWordPalindromes();
