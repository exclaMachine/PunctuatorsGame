import { wrapSplitWords } from "./splitWords.js";
import { highlightAndClassifyArticles } from "./articleFunc.js";
import { wrapWiteOutWords } from "./DeleFunc.js";
import { wrapCaretWords, wrapRoundSpanWords } from "./CaretFunc.js";
import { wrapHomophones } from "./HomophonesFuncs.js";
import { wrapAnagrams } from "./anagrams.js";
import { wrapAlphabetNeighbors } from "./alphabeticalNeighbors.js";
import { wrapAbjads } from "./onlyConsonants.js";
import { wrapLadders } from "./ladderFunc.js";
import { wrapAffixes } from "./affixFunc.js";

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
export const protectedAnagrams = withSpanPlaceholders(wrapAnagrams);

export const protectedRounded = withSpanPlaceholders(wrapRoundSpanWords);

export const protectedAlphabetNeighbors = withSpanPlaceholders(
  wrapAlphabetNeighbors
);

export const protectedAbjads = withSpanPlaceholders(wrapAbjads);

// General & Specific. wrapLadders is a no-op until loadLadders() has resolved, so index.js awaits
// the corpus before starting a ladder round (docs/punctuators-ladder.md §3.3).
export const protectedLadders = withSpanPlaceholders(wrapLadders);

// Affix Aliens. wrapAffixes needs no corpus at all — detection is startsWith/endsWith over the
// hand-written tables in affixData.js (docs/punctuators-affixes.md §3) — so unlike the ladder it is
// ready the moment the module loads.
export const protectedAffixes = withSpanPlaceholders(wrapAffixes);

// // Usage:
// let result = protectedSpoonerism(sentence);
// result = protectedWrapHomophones(result);
