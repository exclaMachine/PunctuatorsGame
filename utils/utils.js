let punc = "!?;:'.,";

const punctuationHashMap = new Map();

//this is called chaining
punctuationHashMap
  .set("!", "exclamation")
  .set("?", "question")
  .set(";", "semicolon")
  .set(":", "colon")
  .set("'", "apostrophe")
  .set("*", "asterisk")
  .set(",", "comma")
  .set(".", "period");

export const addSpansAndIds = (
  string,
  typedSentence,
  button,
  outputSentence,
  footer
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
  footer.innerHTML =
    "Use the arrow keys to play (up=shoot, left & right=move, down=switch character)";

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
