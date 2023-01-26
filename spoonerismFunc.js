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
            firstWord = secondWord.splice(j); // need to think on this...
          }
        }
      }
    }

    // let firstWordOneLetterReplaced = await fetch(
    //     `https://api.dictionaryapi.dev/api/v2/entries/en/${
    //         secondWord[0] + spoonerWord.slice(1)
    //     }`
    //     );
    //     let firstData = await firstWord.json();

    //     let secondWordOneLetterReplaced = await fetch(
    //         `https://api.dictionaryapi.dev/api/v2/entries/en/${
    //             spoonerWord[0] + secondWord.slice(1)
    //         }`
    //         );
    //         let secondData = await secondWord.json();

    if (!firstData[0] || !secondData[0]) return;

    if (firstData[0] && secondData[0]) {
      splitWordArray[index] = `Ð${splitWordArray[index]}Ð`;
      splitWordArray[index + 1] = `Ð${splitWordArray[index + 1]}Ð`;
    }
  }
  console.log(secondWord[0] + spoonerWord.slice(1));
  console.log(spoonerWord[0] + secondWord.slice(1));
};

// console.log(wrapSpoonerismWithUniqueCharacter(["butt", "just", "cut", "go"]));
