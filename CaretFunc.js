import caretWords from "./oneMoreCharacterWordsWithSpan.js";
import roundWords from "./RoundedSpans.js";
//TODO move all exports to this wrap function and make it work for all spans

export const wrapCaretWords = (sentence) => {
  const words = sentence.split(/\b/); // Splitting by word boundary

  const splitted = words.map((word) => {
    if (caretWords[word]) {
      return caretWords[word];
    }
    return word;
  });
  return splitted.join("");
};

export const wrapRoundSpanWords = (sentence) => {
  const words = sentence.split(/\b/); // Splitting by word boundary

  const splitted = words.map((word) => {
    if (roundWords[word]) {
      return roundWords[word];
    }
    return word;
  });
  return splitted.join("");
};
