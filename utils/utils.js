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

  let processed = protectedArticles(typedString); // Always apply articles first

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
    default:
      // No additional wordplay besides articles and spoonerism
      break;
  }

  // Always apply spoonerism last
  let final = spoonerism(processed);

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
      let mutArr = mutations[0].addedNodes;
      mutArr.forEach((el) => {
        nodeArr.push(el);

        if (
          el.className === "hidden-punc" ||
          el.className === "capital-black-hole" ||
          el.id === "ApostroPharaoh (Contraction)"
        )
          numberOfPunctuationArray.push(el);
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

        if (value.symbol === punctuationInSentenceArray[i].id) {
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
