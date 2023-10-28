import caretWords from "./oneMoreCharacterWordsWithSpan.js";

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
