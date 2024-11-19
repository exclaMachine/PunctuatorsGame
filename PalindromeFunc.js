const fs = require("fs");

// Main function to find palindromes
function findPalindromes() {
  const filename = "2of12.txt"; // Input word list file
  const words = fs
    .readFileSync(filename, "utf8")
    .split("\n")
    .map((word) => word.trim().toLowerCase())
    .filter(Boolean); // Read and clean the word list

  const palindromes = words.filter(
    (word) => word === word.split("").reverse().join("")
  );

  // Write palindromes to a file
  const outputContent = `const palindromes = ${JSON.stringify(
    palindromes,
    null,
    2
  )};\nexport default palindromes;`;

  fs.writeFileSync("palindromes.js", outputContent);
  console.log("Successfully created palindromes.js with all palindromes!");
}

// For testing
findPalindromes();

const wrapPalindromes = (sentence) => {
  const words = sentence.split(/\b/); // Splitting by word boundary

  return words
    .map((word) => {
      const lowerCaseWord = word.toLowerCase();
      if (palindromes.includes(lowerCaseWord)) {
        return `<span class="palindrome">${word}</span>`;
      }
      return word;
    })
    .join("");
};
