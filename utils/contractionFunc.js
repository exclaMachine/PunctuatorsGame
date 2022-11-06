//shall -> shan't is an exception to the first word as well as will -> won't
const firstContractionWordSet = new Set([
  "are",
  "can",
  "could",
  "did",
  "does",
  "do",
  "had",
  "has",
  "have",
  "he",
  "I",
  "is",
  "let",
  "might",
  "must",
  "she",
  "should",
  "that",
  "there",
  "they",
  "we",
  "were",
  "what",
  "where",
  "who",
  "would",
  "you",
]);
const secondContractionWordSet = new Set(["not"]);

export const surroundContractionWordsWithSpans = (typedSentence) => {
  let words = typedSentence.split(" ");
  console.log(words);
  words.map((word, index) => {
    if (index === words.length - 1) return;
    if (
      firstContractionWordSet.has(word) &&
      secondContractionWordSet.has(words[index + 1])
    ) {
    }
  });
};
