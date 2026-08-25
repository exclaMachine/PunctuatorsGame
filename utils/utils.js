import { changeEmoticonsToEmojis } from "./emojiFunc.js";
import { wrapContractionWithSpan } from "./contractionFunc.js";
import { findAndSurroundAmbigramWordsWithSpan } from "../AmbigramFunc.js";
import { spoonerism } from "../spoonerismFunc.js";
import { wrapHomophones } from "../HomophonesFuncs.js";
import {
  protectedArticles,
  protectedCaretWords,
  protectedHomophones,
  protectedSplitWords,
  protectedWiteOutWords,
  protectedRounded,
  protectedAlphabetNeighbors,
  protectedAbjads,
  protectedAnagrams,
  protectedLadders,
} from "../SpanPlaceholder.js";

const secondContractionWordHashMap = new Map();

let punc = "!?;:'.,";
const CAPITAL_LETTERS = /[A-Z]/g;
const SPACES = " ";
const ENDING_SECOND_CONTRACTION_WORD = /[.?!\s]/g;

const punctuationHashMap = new Map();

const RemoveVowels = (word) => {
  return word.toLowerCase().replace(/[aeiou]/g, "");
};

//this is called chaining
punctuationHashMap
  .set("!", "Excla Machine !")
  .set("?", "Question Markswoman ?")
  .set(";", "Semicolonel ;")
  .set(":", "Sergeant Colon :")
  .set("'", "Apostrophantom '")
  .set("‘", "Apostrophantom '") //u2018  https://stackoverflow.com/questions/57712081/javascript-regexp-dosnt-recognize-apostrophe-on-mobile-ios
  .set("’", "Apostrophantom '") //u2019
  .set("*", "Master Asterisk *")
  .set(",", "Comma Chameleon ,")
  .set(".", "Full Stop .")
  .set('"', "QuetzalQuotel")
  .set("“", "QuetzalQuotel") //quick fix study. https://github.com/frankrausch/Typographizer
  .set("”", "QuetzalQuotel")
  .set("-", "Ms. Hyphen -")
  // .set("(", "parenthesis left")
  // .set(")", "parenthesis right");
  .set("(", "Parents of the Seas ( )")
  .set(")", "Parents of the Seas ( )")
  .set("#", "HashTagger #");

export const addSpansAndIds = (typedString, outputSentence) => {
  let emojified = changeEmoticonsToEmojis(typedString);

  let contractionized = wrapContractionWithSpan(emojified);
  //when you split an emoji it can be up to 5 different characters "🏴‍☠️" = '/uD83C' '/uDFF4' '' '☠' ''

  let newString = contractionized.split("");

  for (let i = 0; i < newString.length; i++) {
    let char = newString[i];

    if (newString[i] === "<") {
      i++;
      while (newString[i] !== "<") {
        i++;
      }
      //now it makes it to the closing </span> so add 6 to get past
      i += 6;
    }

    if (punctuationHashMap.has(char)) {
      newString[i] = `<span id=\"${punctuationHashMap.get(
        char
      )}\" class=\"hidden-punc\">${char}</span>`;
    } else if (CAPITAL_LETTERS.test(char)) {
      newString[
        i
      ] = `<span id=\"Full Stop (Capitalize)\" class=\"capital-black-hole\">${char.toLowerCase()}</span>`;
    } else if (char === " ") {
      newString[i] = `<span id=\"Spacel \" class=\"space\">${SPACES}</span>`;
    }
  }
  outputSentence.innerHTML = newString.join("");
  return newString.join("");
};

export const addSpansAndIdsForWordPlay = (
  typedString,
  outputSentence,
  mode
) => {
  if (mode === "abjads") {
    typedString = RemoveVowels(typedString);
    //RemoveVowels(typedString);
  }

  // Two ladder modes hand in markup they built themselves and want it left alone.
  //
  // Word Race has no sentence at all: index.js builds a field of three words (§12.2), so there are
  // no articles to fix and nothing for Art the Tickler to do. Restore the Phrase (§11.6) does have
  // a sentence, and suppresses articles ON PURPOSE — the puzzle is to match a known saying, so a
  // hero rewriting it would be actively confusing, and plain-text articles are what make the live
  // `A dog` → `An animal` fix a text-node edit rather than a span surgery.
  const preMarked = mode === "wordRace" || mode === "ladderPuzzle";
  let processed = preMarked ? typedString : protectedArticles(typedString);

  // Apply transformation based on selected mode
  switch (mode) {
    case "ambigrams":
      processed = findAndSurroundAmbigramWordsWithSpan(processed);
      break;
    case "anagrams":
      processed = protectedAnagrams(processed);
      break;
    case "homophones":
      processed = protectedHomophones(processed);
      break;
    case "split":
      processed = protectedSplitWords(processed);
      break;
    case "whiteOut":
      processed = protectedWiteOutWords(processed);
      break;
    case "caret":
      processed = protectedCaretWords(processed);
      break;
    case "rounded":
      processed = protectedRounded(processed);
      break;
    case "alphabetNeighbors":
      processed = protectedAlphabetNeighbors(processed);
      break;
    case "abjads":
      processed = protectedAbjads(processed);
      break;
    case "ladder":
      processed = protectedLadders(processed);
      break;
    case "wordRace":
      // Already marked up by ladderRace.js's raceFieldHTML — nothing to wrap.
      break;
    case "ladderPuzzle":
      // Likewise: ladderPhrase.js's wrapPhrase marks the shifted words, and only those. The wrapper
      // needs the whole puzzle (which token, which chain, where the goal is), not a bare string, so
      // it runs in index.js before this call rather than as a protected* pass here.
      break;
    default:
      // No additional wordplay besides articles and spoonerism
      break;
  }

  // Apply spoonerism (Foon) last — but never in anagram mode, and never in either ladder mode that
  // builds its own field: Foon swapping the heads of the three Word Race words would rewrite the
  // very words being raced between, and in Restore the Phrase he'd be scrambling the saying the
  // player is trying to put back (§11.6).
  let final =
    mode === "anagrams" || preMarked ? processed : spoonerism(processed);

  // Split and render to output
  let newString = final.split("");

  for (let i = 0; i < newString.length; i++) {
    if (newString[i] === "<") {
      i++;
      while (newString[i] !== "<") {
        i++;
      }
      i += 6; // Skip past </span>
    }

    outputSentence.innerHTML = newString.join("");
    return newString.join(""); // Optional: remove if you don't use return value
  }
};

export const setClassName = (newClass, ...elements) => {
  elements.forEach((element) => {
    element.className = newClass;
  });
};

export let nodeArr = [];
export let spaceArr = [];
export let numberOfPunctuationArray = [];

// https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
export const waitForElement = (selector) => {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      // EVERY record, not just mutations[0]. Records batch per microtask checkpoint, so any other DOM
      // write in the same task — the error message being cleared, a dropdown label being set — takes
      // slot 0 and the sentence's own spans get silently dropped, leaving an empty team and nothing
      // to shoot. Reading only the first record was a live bug the moment a second writer appeared.
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((el) => {
          nodeArr.push(el);

          if (
            el.className === "hidden-punc" ||
            el.className === "capital-black-hole" ||
            el.id === "ApostroPharaoh (Contraction)"
          )
            numberOfPunctuationArray.push(el);
        });
      });

      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

export const heroToTheRescue = (punctuationInSentenceArray, heroesArray) => {
  //Need to match the properties of these two arrays
  let filteredArr = heroesArray.filter((value) => {
    for (let i = 0; i < punctuationInSentenceArray.length; i++) {
      if (punctuationInSentenceArray[i].id) {
        // if (punctuationInSentenceArray[i].id) {
        //tried to do this for left and right parenthesis, might need to come back to it
        // if (value.symbol.includes(punctuationInSentenceArray[i].id)) {

        // A hero normally hits the span named after it, but General Ization and Keen Arrow SHARE one
        // span id and differ only in direction, so match on targetId when a hero declares one
        // (docs/punctuators-ladder.md §4). targetId defaults to symbol, so every other hero is
        // unaffected.
        if ((value.targetId ?? value.symbol) === punctuationInSentenceArray[i].id) {
          return value;
        }
      }
    }
  });
  return filteredArr;
};

// Binary search implementation to check if a word is present in the words.txt file
export const binarySearch = (arr, val) => {
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
