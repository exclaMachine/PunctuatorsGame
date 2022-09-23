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
  outputSentence
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
