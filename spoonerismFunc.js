export const spoonerism = (sentence) => {
  let placeholders = [];
  let tempSentence = sentence.replace(/<span[^>]*>(.*?)<\/span>/g, (match) => {
    placeholders.push(match);
    return `PLACEHOLDER${placeholders.length - 1}`;
  });

  const isConsonant = (ch) =>
    "aeiouAEIOU".indexOf(ch) === -1 && /[a-zA-Z]/.test(ch);

  const getConsonantCluster = (word) => {
    let cluster = "";
    for (let ch of word) {
      if (isConsonant(ch) && !(ch.toLowerCase() === "y" && cluster)) {
        cluster += ch;
      } else {
        break;
      }
    }
    return cluster;
  };

  let words = tempSentence.split(" ");

  for (let i = 0; i < words.length; i++) {
    if (words[i].startsWith("PLACEHOLDER")) {
      continue;
    }

    if (
      words[i].length &&
      words[i].toLowerCase() !== "the" &&
      words[i][0].toLowerCase() !== "q" &&
      isConsonant(words[i][0]) &&
      words[i][0] !== "'"
    ) {
      let cluster = getConsonantCluster(words[i]);
      words[i] = words[i].replace(
        cluster,
        `<span id="The Foon (Spoonerism)" class="${cluster}">${cluster}</span>`
      );
    }
  }

  let result = words.join(" ");

  // Restoring placeholders with original content
  placeholders.forEach((placeholder, index) => {
    result = result.replace(`PLACEHOLDER${index}`, placeholder);
  });

  return result;
};
