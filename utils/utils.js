let punc = "!?;:'.,";

const punctuationHashMap = new Map();

//this is called chaining
punctuationHashMap
  .set("!", "Excla Machine !")
  .set("?", "Question Markswoman ?")
  .set(";", "Semicolonel ;")
  .set(":", "Sergeant Colon :")
  .set("'", "Apostrophantom '")
  .set("*", "Master Asterisk *")
  .set(",", "Comma Chameleon ,")
  .set(".", "Full Stop .")
  .set('"', "QuetzalQuotel")
  .set("-", "Dr. Hyphenol -")
  // .set("(", "parenthesis left")
  // .set(")", "parenthesis right");
  .set("(", "Parents of the Seas ( )")
  .set(")", "Parents of the Seas ( )")
  .set("#", "Octo-Thwarter #");

//should split this function and making the divs disapper into two functions
export const addSpansAndIds = (
  string,
  typedSentence,
  button,
  outputSentence,
  footer,
  banner,
  controls
) => {
  let newString = string.split("");

  //   console.log("newstr1", newString);

  newString.map((char, i) => {
    if (punctuationHashMap.has(char)) {
      newString[i] = `<span id=\"${punctuationHashMap.get(
        char
      )}\" class=\"hidden-punc\">${char}</span>`;
    }
  });

  // let joinedString = newString.join("");
  // console.log({ joinedString });

  // outputSentence.innerHTML = newString.join("");
  outputSentence.setHTML(newString.join(""));
  button.setAttribute("class", "go-away");
  typedSentence.setAttribute("class", "go-away");
  banner.setAttribute("class", "go-away");

  controls.setAttribute("class", "grid-container");

  //This is an HTMLCollection //Need to wait for the spans to appear so this doesn't work
  //   const periods = document.querySelectorAll(".p");
  //   console.log({ periods });

  //   let periodsArray = [];
  //   Array.from(periods).forEach((el) => {
  //     console.log(el.getBoundingClientRect());
  //     periodsArray.push(el);
  //   });
  //   console.log("arr", periodsArray);

  //   return newString.join("");
};

export let nodeArr = [];
export let numberOfPunctuationArray = [];

// https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
export const waitForElement = (selector) => {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((node) => {
        nodeArr.push(node.addedNodes);
        if (node.addedNodes[0].className) {
          numberOfPunctuationArray.push(node.addedNodes[0]);
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
  // console.log("nodess", punctuationInSentenceArray[1][0].id);
  //Need to match the properties of these two arrays
  let filteredArr = heroesArray.filter((value) => {
    for (let i = 0; i < punctuationInSentenceArray.length; i++) {
      if (punctuationInSentenceArray[i][0].id) {
        // console.log("id", punctuationInSentenceArray[i].id);
        // if (punctuationInSentenceArray[i].id) {
        //tried to do this for left and right parenthesis, might need to come back to it
        // if (value.symbol.includes(punctuationInSentenceArray[i].id)) {

        if (value.symbol === punctuationInSentenceArray[i][0].id) {
          return value;
        }
      }
    }
  });
  return filteredArr;
};
