let punc = "!?;:'.,";

const punctuationHashMap = new Map();

//this is called chaining
punctuationHashMap
  .set("!", "Excla Machine")
  .set("?", "Question Markswoman")
  .set(";", "Semicolonel")
  .set(":", "Sergeant Colon")
  .set("'", "Apostrophantom")
  .set("*", "Master Asterisk")
  .set(",", "Comma Chameleon")
  .set(".", "Full Stop")
  .set('"', "QuetzalQuotel")
  .set("-", "Dr. Hyphenol")
  // .set("(", "parenthesis left")
  // .set(")", "parenthesis right");
  .set("(", "Parents of the Seas")
  .set(")", "Parents of the Seas");

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
      newString[i] = `<span id="hidden-punc" class=\"${punctuationHashMap.get(
        char
      )}\">${char}</span>`;
    }
  });

  outputSentence.innerHTML = newString.join("");
  button.setAttribute("class", "go-away");
  typedSentence.setAttribute("class", "go-away");
  banner.setAttribute("class", "go-away");
  // footer.innerHTML =
  //   "Use the arrow keys to play (up = shoot, left & right = move, down = switch character)";
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

let nodeObj = {};
export let nodeArr = [];
// https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
export const waitForElement = (selector) => {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      let mutArr = mutations[0].addedNodes;
      mutArr.forEach((el) => {
        if (el.className) {
          //this does not work because the el loses its position when changed into object
          //   nodeObj[el.className] = el;
          //   nodeArr.push(nodeObj);
          nodeArr.push(el);
        }

        //this can be replaced with if (el.className)
        // if (
        //   el.className === "p" ||
        //   el.className === "ap" ||
        //   el.className === "e" ||
        //   el.className === "q" ||
        //   el.className === "sc" ||
        //   el.className === "c" ||
        //   el.className === "as" ||
        //   el.className === "co"
        // ) {
        //   nodeArr.push(el);
        // }
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
      if (punctuationInSentenceArray[i].className) {
        //tried to do this for left and right parenthesis, might need to come back to it
        // if (value.symbol.includes(punctuationInSentenceArray[i].className)) {
        if (value.symbol === punctuationInSentenceArray[i].className) {
          return value;
        }
      }
    }
  });
  return filteredArr;
};
