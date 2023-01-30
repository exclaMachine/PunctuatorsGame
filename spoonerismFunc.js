//wrap the spooner word in characters depending on if it has one, two, or three letters taken from the beginning
//can make functions for kniferisms (end change) and forkerisms (middle vowel change) too

//Add in the surrounding character as well that way the function doesn't create spoonerism on an already spoonerized word
const VOWELS = "aeiouAEIOUÐ";

const wrapSpoonerismWithUniqueCharacter = (splitWordArray) => {
  for (let i = 0; i < splitWordArray.length - 1; i++) {
    let firstWord = splitWordArray[i];
    let secondWord = splitWordArray[i + 1];

    for (let j = 0; j < 3; j++) {
      let letterOfFirstWord = firstWord[j];
      let letterOfSecondWord = secondWord[j];
      console.log(i, j, !VOWELS.includes(letterOfFirstWord));
      console.log(i, j, !VOWELS.includes(letterOfSecondWord));

      if (
        VOWELS.includes(letterOfFirstWord) ||
        VOWELS.includes(letterOfSecondWord)
      ) {
        if (j === 0) {
          console.log("break");
          break;
        } else {
          splitWordArray[i] = `Ð${secondWord.slice(0, j) + firstWord.slice(j)}`;
          splitWordArray[i + 1] = `${
            firstWord.slice(0, j) + secondWord.slice(j)
          }Ð`;
        }
      } else if (
        !VOWELS.includes(letterOfFirstWord) &&
        !VOWELS.includes(letterOfSecondWord)
      ) {
        console.log("cont");
        continue;
      } else if (
        !VOWELS.includes(letterOfFirstWord) &&
        (VOWELS.includes(letterOfSecondWord) || letterOfSecondWord === "y")
      ) {
        if (VOWELS.includes(firstWord[j + 1])) {
          splitWordArray[i] = `Ð${secondWord.slice(0, j) + firstWord.slice(j)}`;
          splitWordArray[i + 1] = `${
            firstWord.slice(0, j) + secondWord.slice(j)
          }Ð`;
        } else if (
          VOWELS.includes(firstWord[j + 1]) ||
          letterOfFirstWord === "y"
        ) {
          splitWordArray[i] = `Ð${
            secondWord.slice(0, j) + firstWord.slice(j + 1)
          }`;
          splitWordArray[i + 1] = `${
            firstWord.slice(0, j + 1) + secondWord.slice(j)
          }Ð`;
        }
        console.log({ splitWordArray });
      } else if (
        (VOWELS.includes(letterOfFirstWord) || letterOfFirstWord === "y") &&
        !VOWELS.includes(letterOfSecondWord)
      ) {
        if (VOWELS.includes(secondWord[j + 1]) || letterOfFirstWord === "y") {
          splitWordArray[i] = `Ð${secondWord.slice(0, j) + firstWord.slice(j)}`;
          splitWordArray[i + 1] = `${
            firstWord.slice(0, j) + secondWord.slice(j)
          }Ð`;
        }
      }
    }
  }
  return splitWordArray;
};

console.log(
  wrapSpoonerismWithUniqueCharacter([
    "auto",
    "butt",
    "just",
    "chut",
    "go",
    "stripe",
  ])
);
