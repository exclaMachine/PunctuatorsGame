//wrap the spooner word in characters depending on if it has one, two, or three letters taken from the beginning
//can make functions for kniferisms (end change) and forkerisms (middle vowel change) too

const VOWELS = "aeiouAEIOU";

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
          splitWordArray[i] = secondWord.slice(0, j) + firstWord.slice(j);
          splitWordArray[i + 1] = firstWord.slice(0, j) + secondWord.slice(j);
        }
      } else if (
        !VOWELS.includes(letterOfFirstWord) &&
        !VOWELS.includes(letterOfSecondWord)
      ) {
        console.log("cont");
        continue;
      } else if (
        !VOWELS.includes(letterOfFirstWord) &&
        (VOWELS.includes(letterOfSecondWord) || letterOfSecondWord === 'y')
      ) {
        if (VOWELS.includes(firstWord[j + 1])) {
          splitWordArray[i] = secondWord.slice(0, j) + firstWord.slice(j);
          splitWordArray[i + 1] = firstWord.slice(0, j) + secondWord.slice(j);
          console.log({ splitWordArray });
        }
      } else if (
        (VOWELS.includes(letterOfFirstWord) || || letterOfFirstWord === 'y') &&
        !VOWELS.includes(letterOfSecondWord)
      ) {
        if (VOWELS.includes(secondWord[j + 1])) {
          splitWordArray[i] = secondWord.slice(0, j) + firstWord.slice(j);
          splitWordArray[i + 1] = firstWord.slice(0, j) + secondWord.slice(j);
        }
      }
    }
  }
  return splitWordArray;
};

console.log(
  wrapSpoonerismWithUniqueCharacter(["auto", "butt", "just", "chut", "go"])
);
