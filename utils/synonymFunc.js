//create a way where the character isn't added until the game is won. Then they can change the words
//after you fetch it should i save it as that

const UNIQUE_CHARACTER_ARRAY = ["£", "¤", "¥", "ª", "²"];

const freeDictionaryFetchSynonyms = async (word) => {
  let res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
  );
  let data = await res.json();

  let synonym;
  if (!data[0]) {
    return;
  } else if (data[0].meanings[0].definitions[0].synonyms.length > 0) {
    synonym = data[0].meanings[0].definitions[0].synonyms[0];
    return synonym;
  } else {
    return;
  }
};

const findAndSurroundSynonymWordsWithUniqueCharacter = (typedSentence) => {
  let words = typedSentence.split(" ");

  words.map((word, index) => {
    if (index === words.length - 1) return;

    //i could create a unique hashmap each time
    if (freeDictionaryFetchSynonyms(word)) {
      words[index] = freeDictionaryFetchSynonyms(word);
    }
  });
};

const createSynonymHashMap = (synonymArray) => {
  const uniqueSynonymHashMap = new Map();

  synonymArray.map((synonym, index) => {
    uniqueSynonymHashMap.set(synonym, UNIQUE_CHARACTER_ARRAY[index]);
  });

  return uniqueSynonymHashMap;
};

console.log(createSynonymHashMap(["byte", "hear", "listen"]));
