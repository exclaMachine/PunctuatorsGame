export const chooseRandomlyFromArray = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

export const createRandomMadLibSentence = (sentenceCount) => {
  let verbArray = ["eat", "buy", "combine"];

  let nounArray = ["pencil", "water", "stick"];

  let fruitArray = ["bananas", "apples", "strawberries"];

  let vegetableArray = ["artichokes", "carrots", "cucumbers"];

  let adjectiveArray = ["happy", "sad", "excited"];

  let desertArray = ["ice cream", "pie", "cake"];

  let familyMemberArray = ["Dad", "Mom", "Grandpa", "Grandma", "Uncle"];

  let ageArray = ["seven", "thirty", "seventy"];

  let prepositionArray = ["behind", "above", "across"];

  console.log(Math.floor(Math.random() * vegetableArray.length));

  switch (sentenceCount) {
    case 1:
      return `I'm going to ${chooseRandomlyFromArray(
        verbArray
      )} ${chooseRandomlyFromArray(vegetableArray)}, ${chooseRandomlyFromArray(
        fruitArray
      )}, and ${chooseRandomlyFromArray(desertArray)}!`;
      break;
    case 2:
      return `What did the ${chooseRandomlyFromArray(
        ageArray
      )} ${chooseRandomlyFromArray(verbArray)} for dinner?`;
  }
};
