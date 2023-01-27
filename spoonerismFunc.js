//wrap the spooner word in characters depending on if it has one, two, or three letters taken from the beginning
//can make functions for kniferisms (end change) and forkerisms (middle vowel change) too

// const CONSONANTS = /[(?![aeiou])[a-z]]/gi;
const VOWELS = "aeiouAEIOU";

const wrapSpoonerismWithUniqueCharacter = (splitWordArray) => {
  for (let i = 0; i < splitWordArray.length - 1; i++) {
    let firstWord = splitWordArray[i];
    let secondWord = splitWordArray[i + 1];

    for (let j = 0; j < 3; j++) {
      let letterOfFirstWord = firstWord[j];
      let letterOfSecondWord = secondWord[j];

      if (
        VOWELS.includes(letterOfFirstWord) ||
        VOWELS.includes(letterOfSecondWord)
      ) {
        if (j === 0) {
          break;
        } else if (
          !VOWELS.includes(letterOfFirstWord) &&
          !VOWELS.includes(letterOfSecondWord)
        ) {
          continue;
        } else if (
          !VOWELS.includes(letterOfFirstWord) &&
          VOWELS.includes(letterOfSecondWord)
        ) {
          if (VOWELS.includes(firstWord[j + 1])) {
            // firstWord = secondWord.splice(0, j) + firstWord.splice(j);
            // secondWord = firstWord.splice(0, j) + secondWord.splice(j);
            splitWordArray[i] = secondWord.splice(0, j) + firstWord.splice(j);
            splitWordArray[i + 1] =
              firstWord.splice(0, j) + secondWord.splice(j);
            console.log({ splitWordArray });
          }
        }
      }
    }

  return splitWordArray;
};

console.log(wrapSpoonerismWithUniqueCharacter(["butt", "just", "cut", "go"]));
