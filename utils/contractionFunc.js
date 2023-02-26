//Problem because these actually can't be done before punctuation because splitting will split the spans... and cause spaces in between. Not add spaces but split up spaces into own elements?

export const secondContractionWordSet = new Set([
  "not",
  "had",
  "would",
  "will",
  "shall",
  "is",
  "has",
  "am",
  "have",
  "us",
  "are",
]);

const notSubsetOfFirstContractionWordSet = new Set([
  "are",
  "can",
  "could",
  "did",
  "does",
  "do",
  "had",
  "has",
  "have",
  "is",
  "might",
  "must",
  "shall",
  "should",
  "were",
  "will",
  "would",
  "Are",
  "Can",
  "Could",
  "Did",
  "Does",
  "Do",
  "Had",
  "Has",
  "Have",
  "Is",
  "Might",
  "Must",
  "Shall",
  "Should",
  "Were",
  "Will",
  "Would",
]);

const hadWouldSubsetOfFirstContractionWordSet = new Set([
  "he",
  "I",
  "i",
  "it",
  "she",
  "they",
  "we",
  "who",
  "you",
  "He",
  "It",
  "She",
  "They",
  "We",
  "Who",
  "You",
]);

const willShallSubsetOfFirstContractionWordSet = new Set([
  "he",
  "i",
  "I",
  "it",
  "she",
  "they",
  "we",
  "what",
  "who",
  "you",
  "He",
  "It",
  "She",
  "They",
  "We",
  "What",
  "Who",
  "You",
]);

const isHasSubsetOfFirstContractionWordSet = new Set([
  "he",
  "she",
  "that",
  "there",
  "what",
  "where",
  "who",
  "He",
  "She",
  "That",
  "There",
  "What",
  "Where",
  "Who",
]);

const haveSubsetOfFirstContractionWordSet = new Set([
  "I",
  "they",
  "we",
  "what",
  "who",
  "you",
  "They",
  "We",
  "What",
  "Who",
  "You",
]);

const areSubsetOfFirstContractionWordSet = new Set([
  "they",
  "we",
  "what",
  "who",
  "you",
  "They",
  "We",
  "What",
  "Who",
  "You",
]);

const secondContractionWordHashMap = new Map();

secondContractionWordHashMap
  .set("not", "¬")
  .set("had", "©")
  .set("would", "°")
  .set("is", "§")
  .set("has", "§")
  .set("have", "¢")
  .set("are", "®")
  .set("shall", "¦")
  .set("will", "±")
  .set("am", "µ")
  .set("us", "¶");

const articleHashMap = new Map();

articleHashMap.set("a", "¼").set("the", "½");

//try different approach where use array and surround words with unique characters (emoji) so no interference with punc spans

export const wrapContractionWithSpan = (typedSentence, outputSentence) => {
  let words = typedSentence.split(" ");

  words.map((word, index) => {
    if (index === words.length - 1) return;

    // word.toLowerCase();  need to work on capital somehow...
    let wrapperSymbol = secondContractionWordHashMap.get(words[index + 1]);
    let articleWrapper = articleHashMap.get(words[index]);
    if (
      (notSubsetOfFirstContractionWordSet.has(word) &&
        (words[index + 1] === "not" ||
          words[index + 1] === "not?" ||
          words[index + 1] === "not." ||
          words[index + 1] === "not!")) ||
      (hadWouldSubsetOfFirstContractionWordSet.has(word) &&
        (words[index + 1] === "had" || words[index + 1] === "would")) ||
      (willShallSubsetOfFirstContractionWordSet.has(word) &&
        (words[index + 1] === "will" || words[index + 1] === "shall")) ||
      (isHasSubsetOfFirstContractionWordSet.has(word) &&
        (words[index + 1] === "is" || words[index + 1] === "has")) ||
      (word === "i" && words[index + 1] === "am") ||
      (haveSubsetOfFirstContractionWordSet.has(word) &&
        words[index + 1] === "have") ||
      (word === "let" && words[index + 1] === "us") ||
      ((word === "here" || word === "it" || word === "Here" || word === "It") &&
        words[index + 1] === "is") ||
      (areSubsetOfFirstContractionWordSet.has(word) &&
        words[index + 1] === "are")
    ) {
      words[index + 1] = `<span>${words[index + 1]}</span>`;
    }
    if (articleHashMap.has(word)) {
      words[index] = `${articleWrapper}${words[index]}${articleWrapper}`;
    }
  });

  return words.join(" ");
};

export const wrapContractionWithUniqueCharacter = (
  typedSentence,
  outputSentence
) => {
  let words = typedSentence.split(" ");

  words.map((word, index) => {
    if (index === words.length - 1) return;

    // word.toLowerCase();  need to work on capital somehow...
    let wrapperSymbol = secondContractionWordHashMap.get(words[index + 1]);
    let articleWrapper = articleHashMap.get(words[index]);
    if (
      (notSubsetOfFirstContractionWordSet.has(word) &&
        (words[index + 1] === "not" ||
          words[index + 1] === "not?" ||
          words[index + 1] === "not." ||
          words[index + 1] === "not!")) ||
      (hadWouldSubsetOfFirstContractionWordSet.has(word) &&
        (words[index + 1] === "had" || words[index + 1] === "would")) ||
      (willShallSubsetOfFirstContractionWordSet.has(word) &&
        (words[index + 1] === "will" || words[index + 1] === "shall")) ||
      (isHasSubsetOfFirstContractionWordSet.has(word) &&
        (words[index + 1] === "is" || words[index + 1] === "has")) ||
      (word === "i" && words[index + 1] === "am") ||
      (haveSubsetOfFirstContractionWordSet.has(word) &&
        words[index + 1] === "have") ||
      (word === "let" && words[index + 1] === "us") ||
      ((word === "here" || word === "it" || word === "Here" || word === "It") &&
        words[index + 1] === "is") ||
      (areSubsetOfFirstContractionWordSet.has(word) &&
        words[index + 1] === "are")
    ) {
      words[index + 1] = `${wrapperSymbol}${words[index + 1]}${wrapperSymbol}`;
    }
    if (articleHashMap.has(word)) {
      words[index] = `${articleWrapper}${words[index]}${articleWrapper}`;
    }
  });

  return words.join(" ");
};

export const shortenContraction = (node, nodeArr) => {
  //so far doesn't add span but don't know if I need them
  if (
    node.className === "not" &&
    node.previousSibling.previousSibling.nodeValue === "will"
  ) {
    node.previousSibling.previousSibling.nodeValue = `won'`;
    node.previousSibling.className = "shrink-space";
    node.outerHTML = `t`;
  }

  switch (node.className) {
    case "had":
    case "would":
      node.previousSibling.className = "shrink-space";
      node.outerHTML = `<span id=\"Apostrophantom '\">‘</span>d`;
      break;
    case "is":
    case "us":
    case "has":
      node.previousSibling.className = "shrink-space"; //this has to be called before change of outerHTML or doesn't work
      node.outerHTML = `<span id=\"Apostrophantom '\">'</span>s`;
      break;
    case "shall":
    case "will":
      node.previousSibling.className = "shrink-space";
      node.outerHTML = `<span id=\"Apostrophantom '\">'</span>ll`;
      break;
    case "not":
      node.previousSibling.className = "shrink-space";
      node.outerHTML = `n<span id=\"Apostrophantom '\">'</span>t`;
      break;
    case "am":
      node.previousSibling.className = "shrink-space";
      node.outerHTML = `<span id=\"Apostrophantom '\">'</span>m`;
      break;
    case "are":
      node.previousSibling.className = "shrink-space";
      node.outerHTML = `<span id=\"Apostrophantom '\">'</span>re`;
      break;
    case "have":
      node.previousSibling.className = "shrink-space";
      node.outerHTML = `<span id=\"Apostrophantom '\">'</span>ve`;
      break;
  }
};
