const SPACES = " ";

export const addSpaceSpans = (typedString, outputSentence) => {
  newString.map((char, i) => {
    if (char === " ") {
      newString[i] = `<span id=\"Spacel \" class=\"space\">${SPACES}</span>`;
    }
  });
};
