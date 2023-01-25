//wrap the spooner word in characters depending on if it has one, two, or three letters taken from the beginning
//can make functions for kniferisms (end change) and forkerisms (middle vowel change) too

// const CONSONANTS = /[(?![aeiou])[a-z]]/gi;

const wrapSpoonerismWithUniqueCharacter = (splitWordArray) => {
  splitWordArray.map(async (spoonerWord, index) => {
    if (index === splitWordArray.length - 1) return;

    let secondWord = splitWordArray[index + 1];

    let firstWordOneLetterReplaced = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${
        secondWord[0] + spoonerWord.slice(1)
      }`
    );
    let firstData = await firstWord.json();

    let secondWordOneLetterReplaced = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${
        spoonerWord[0] + secondWord.slice(1)
      }`
    );
    let secondData = await secondWord.json();

    if (!firstData[0] || !secondData[0]) return;

    if (firstData[0] && secondData[0]) {
      splitWordArray[index] = `Ð${splitWordArray[index]}Ð`;
      splitWordArray[index + 1] = `Ð${splitWordArray[index + 1]}Ð`;
    }

    console.log(secondWord[0] + spoonerWord.slice(1));
    console.log(spoonerWord[0] + secondWord.slice(1));
  });
};

// console.log(wrapSpoonerismWithUniqueCharacter(["butt", "just", "cut", "go"]));
