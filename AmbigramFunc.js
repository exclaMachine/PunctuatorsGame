// import ambigramPOJO from "/AmbigramPOJO.js";

// export const findAndSurroundAmbigramWordsWithSpan = (
//   sentence,
//   villainOutputSentence
// ) => {
//   const words = sentence.split(" ");
//   const formattedWords = [];

//   for (let i = 0; i < words.length; i++) {
//     const word = words[i];
//     let ambigramSuccess = false;

//     if (word === "was") {
//       ambigramSuccess = false;
//       formattedWords.push(word);
//       continue; //This messes up wasn't contraction. Also what is a sem???
//     }
//     if (ambigramPOJO[word]) {
//       formattedWords.push(`<span id="Ambigrambador">${word}</span>`);
//     } else {
//       formattedWords.push(word);
//     }
//   }
//   let joinedSentence = formattedWords.join(" ");

//   return joinedSentence;
// };

// let pairs = {
//   a: "e",
//   b: "q",
//   d: "p",
//   e: "a",
//   h: "y",
//   i: "i",
//   j: "r",
//   l: "l",
//   m: "w",
//   n: "u",
//   o: "o",
//   p: "d",
//   q: "b",
//   r: "j",
//   s: "s",
//   t: "t",
//   u: "n",
//   v: "r",
//   w: "m",
//   x: "x",
//   y: "h",
//   z: "z",
// };

// export const makeAmbigram = (word) => {
//   // if (word.includes('c') || word.includes('f') || word.includes('k')) return false;  //this can be replaced with the if statement in loop. more dynamic

//   let arr = word.split("").reverse();

//   for (let i = 0; i < arr.length; i++) {
//     if (pairs[arr[i]] === undefined) {
//       return false;
//     } else {
//       arr[i] = pairs[arr[i]];
//     }
//   }

//   return arr.join("");
// };
