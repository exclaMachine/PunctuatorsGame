const SPACES = " ";

export const addSpaceSpans = (typedString, outputSentence) => {
  newString.map((char, i) => {
    if (char === " ") {
      newString[i] = `<span id=\"Spacel \" class=\"space\">${SPACES}</span>`;
    }
  });
};

export const shortenContraction = (node) => {
  switch (node.className) {
    case "had":
    case "would":
      node.innerHTML = `<span id=\"Apostrophantom '\" class=\"hidden-punc\">‘</span>d`;
      node.previousSibling.className = "shrink";
      break;
  }
};
