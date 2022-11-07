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
  } else {
    return;
  }
};

export const findAndSurroundSynonymWordsWithStrong = (typedSentence) => {
  let words = typedSentence.split(" ");
};
