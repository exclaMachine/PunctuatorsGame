import { wrapSplitWords } from "./splitWords.js";
import { highlightAndClassifyArticles } from "./articleFunc.js";
import { wrapWiteOutWords } from "./DeleFunc.js";
import { wrapCaretWords, wrapRoundSpanWords } from "./CaretFunc.js";
import { wrapHomophones } from "./HomophonesFuncs.js";

export const applySpanPlaceholders = (text) => {
  let placeholders = [];
  let tempText = text.replace(/<span[^>]*>(.*?)<\/span>/g, (match) => {
    placeholders.push(match);
    return `PLACEHOLDER${placeholders.length - 1}`;
  });
  return { tempText, placeholders };
};

function restoreSpanPlaceholders(text, placeholders) {
  placeholders.forEach((placeholder, index) => {
    text = text.replace(`PLACEHOLDER${index}`, placeholder);
  });
  return text;
}

function withSpanPlaceholders(callback) {
  return function (text) {
    const { tempText, placeholders } = applySpanPlaceholders(text);
    let result = callback(tempText);
    return restoreSpanPlaceholders(result, placeholders);
  };
}

// Wrap each of your functions using `withSpanPlaceholders`
// const protectedSpoonerism = withSpanPlaceholders(spoonerism);
// const protectedWrapHomophones = withSpanPlaceholders(wrapHomophones);
export const protectedSplitWords = withSpanPlaceholders(wrapSplitWords);
export const protectedArticles = withSpanPlaceholders(
  highlightAndClassifyArticles
);
export const protectedWiteOutWords = withSpanPlaceholders(wrapWiteOutWords);

export const protectedCaretWords = withSpanPlaceholders(wrapCaretWords);

export const protectedHomophones = withSpanPlaceholders(wrapHomophones);

export const protectedRounded = withSpanPlaceholders(wrapRoundSpanWords);

// // Usage:
// let result = protectedSpoonerism(sentence);
// result = protectedWrapHomophones(result);
