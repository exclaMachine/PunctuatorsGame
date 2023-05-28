export const findAndSurroundAmbigramWordsWithSpan = async (
  sentence,
  villainOutputSentence
) => {
  const words = sentence.split(" ");
  const formattedWords = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let ambigramSuccess = false;

    if (word === "was") {
      ambigramSuccess = false;
      formattedWords.push(word);
      continue; //This messes up wasn't contraction. Also what is a sem???
    }
    if (ambigramPOJO[word]) {
      formattedWords.push(`<span id="Ambigrambador">${word}</span>`);
    } else {
      formattedWords.push(word);
    }
  }
  let joinedSentence = formattedWords.join(" ");

  return joinedSentence;
};
