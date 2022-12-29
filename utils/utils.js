import { changeEmoticonsToEmojis } from "./emojiFunc.js";

let punc = "!?;:'.,";
const CAPITAL_LETTERS = /[A-Z]/g;
const SPACES = " ";

const punctuationHashMap = new Map();

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
  .set("-", "Dr. Hyphenol -")
  // .set("(", "parenthesis left")
  // .set(")", "parenthesis right");
  .set("(", "Parents of the Seas ( )")
  .set(")", "Parents of the Seas ( )")
  .set("#", "Octo-Thwarter #");

export const addSpansAndIds = (typedString, outputSentence) => {
  let emojified = changeEmoticonsToEmojis(typedString);

  let newString = emojified.split("");

  newString.map((char, i) => {
    if (punctuationHashMap.has(char)) {
      newString[i] = `<span id=\"${punctuationHashMap.get(
        char
      )}\" class=\"hidden-punc\">${char}</span>`;
    } else if (CAPITAL_LETTERS.test(char)) {
      newString[
        i
      ] = `<span id=\"Full Stop (Capitalize)\" class=\"capital-black-hole\">${char.toLowerCase()}</span>`;
    }
    // else if (char === " ") {
    //   newString[i] = `<span id=\"Spacel \" class=\"space\">${SPACES}</span>`;
    // }
  });
  outputSentence.innerHTML = newString.join("");
  return newString.join("");
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
        if (el.className === "space") {
          spaceArr.push(el);
        } else {
          nodeArr.push(el);

          if (el.className) numberOfPunctuationArray.push(el);
        }
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
