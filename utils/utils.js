import { changeEmoticonsToEmojis } from "./emojiFunc.js";
import { wrapContractionWithUniqueCharacter } from "./contractionFunc.js";

const secondContractionWordHashMap = new Map();

//https://stackoverflow.com/questions/9907419/how-to-get-a-key-in-a-javascript-object-by-its-value
function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

secondContractionWordHashMap
  .set("¬", "not")
  .set("had", "©")
  .set("would", "°")
  .set("is", "§")
  .set("have", "⚔️")
  .set("are", "®")
  .set("shall", "¦")
  .set("will", "±")
  .set("am", "µ")
  .set("us", "¶");

let punc = "!?;:'.,";
const CAPITAL_LETTERS = /[A-Z]/g;
const SPACES = " ";
const ENDING_SECOND_CONTRACTION_WORD = /[.?!\s]/g;

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
  let emojified2 = changeEmoticonsToEmojis(typedString);

  //let emojified2 = wrapContractionWithUniqueCharacter(emojified);

  //when you split an emoji it can be up to 5 different characters "🏴‍☠️" = '/uD83C' '/uDFF4' '' '☠' ''
  let newString = emojified2.split("");

  newString.map((char, i) => {
    console.log(i, char);
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
    else if (secondContractionWordHashMap.has(char)) {
      console.log("in");
      newString[i] = `<span id=\"${secondContractionWordHashMap.get(char)}\">`;
      while (
        !ENDING_SECOND_CONTRACTION_WORD.test(char[i] || i <= newString.length)
      ) {
        i++;
      }
      newString[i - 1] = `${char[i - 1]}</span>`;
    }
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
