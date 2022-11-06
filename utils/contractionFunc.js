//Problem because these actually can't be done before punctuation because splitting will split the spans...

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
  "shall",
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
  "will",
  "would",
  "you",
]);

const secondContractionWordSet = new Set([
  "not",
  "had",
  "would",
  "will",
  "shall",
  "is",
  "has",
  "am",
  "have",
  "us",
  "are",
]);

const notSubsetOfFirstContractionWordSet = new Set([
  "are",
  "can",
  "could",
  "did",
  "does",
  "do",
  "had",
  "has",
  "have",
  "is",
  "might",
  "must",
  "shall",
  "should",
  "were",
  "will",
  "would",
]);

const hadWouldSubsetOfFirstContractionWordSet = new Set([
  "he",
  "I",
  "it",
  "she",
  "they",
  "we",
  "who",
  "you",
]);

const willShallSubsetOfFirstContractionWordSet = new Set([
  "he",
  "I",
  "it",
  "she",
  "they",
  "we",
  "what",
  "who",
  "you",
]);

const isHasSubsetOfFirstContractionWordSet = new Set([
  "he",
  "she",
  "that",
  "there",
  "what",
  "where",
  "who",
]);

const haveSubsetOfFirstContractionWordSet = new Set([
  "I",
  "they",
  "we",
  "what",
  "who",
  "you",
]);

const areSubsetOfFirstContractionWordSet = new Set([
  "they",
  "we",
  "what",
  "who",
  "you",
]);

export const surroundContractionWordsWithSpans = (
  typedSentence,
  outputSentence
) => {
  let words = typedSentence.split(" ");
  console.log(words);
  words.map((word, index) => {
    if (index === words.length - 1) return;

    // word.toLowerCase();  need to work on capital somehow...

    if (
      (notSubsetOfFirstContractionWordSet.has(word) &&
        words[index + 1] === "not") ||
      (hadWouldSubsetOfFirstContractionWordSet.has(word) &&
        (words[index + 1] === "had" || words[index + 1] === "would")) ||
      (willShallSubsetOfFirstContractionWordSet.has(word) &&
        (words[index + 1] === "will" || words[index + 1] === "shall")) ||
      (isHasSubsetOfFirstContractionWordSet.has(word) &&
        (words[index + 1] === "is" || words[index + 1] === "has")) ||
      (word === "i" && words[index + 1] === "am") ||
      (haveSubsetOfFirstContractionWordSet.has(word) &&
        words[index + 1] === "have") ||
      (word === "let" && words[index + 1] === "us") ||
      ((word === "here" || word === "it") && words[index + 1] === "is") ||
      (areSubsetOfFirstContractionWordSet.has(word) &&
        words[index + 1] === "are")
    ) {
      words[index + 1] = `<span id=\"${
        words[index + 1]
      }\" class=\"contraction\">${words[index + 1]}</span>`;
    }
    // if (
    //   firstContractionWordSet.has(word) &&
    //   secondContractionWordSet.has(words[index + 1])
    // ) {
    //   if (
    //     notSubsetOfFirstContractionWordSet.has(word) &&
    //     words[index + 1] === "not"
    //   ) {
    //     words[index + 1] = `<span id=\"${
    //       words[index + 1]
    //     }\" class=\"contraction\"</span>`;
    //   } else if (
    //     hadWouldSubsetOfFirstContractionWordSet.has(word) &&
    //     (words[index + 1] === "had" || words[index + 1] === "would")
    //   ) {
    //     words[index + 1] = `<span id=\"${
    //       words[index + 1]
    //     }\" class=\"contraction\"</span>`;
    //   }
    // }
  });
  let newSentence = words.join(" ");
  //   outputSentence.innerHTML = newSentence;

  console.log({ newSentence });
};
