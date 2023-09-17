export const isConsonant = (ch) =>
  "aeiouAEIOU".indexOf(ch) === -1 && /[a-zA-Z]/.test(ch);

export const getConsonantCluster = (word) => {
  let cluster = "";
  for (let ch of word) {
    if (isConsonant(ch)) {
      cluster += ch;
    } else {
      break;
    }
  }
  return cluster;
};

export const spoonerism = (sentence) => {
  console.log("intitial", sentence);

  let placeholders = [];
  let tempSentence = sentence.replace(/<span[^>]*>(.*?)<\/span>/g, (match) => {
    placeholders.push(match);
    return `PLACEHOLDER${placeholders.length - 1}`;
  });

  let words = tempSentence.split(/\b/); // Splitting on word boundaries to retain spaces/punctuation
  let firstConsonantWordIndex = -1;

  // const isConsonant = (ch) =>
  //   "aeiouAEIOU".indexOf(ch) === -1 && /[a-zA-Z]/.test(ch);

  // const getConsonantCluster = (word) => {
  //   let cluster = "";
  //   for (let ch of word) {
  //     if (isConsonant(ch)) {
  //       cluster += ch;
  //     } else {
  //       break;
  //     }
  //   }
  //   return cluster;
  // };

  for (let i = 0; i < words.length; i++) {
    if (words[i].startsWith("PLACEHOLDER")) {
      words[i] = placeholders[parseInt(words[i].replace("PLACEHOLDER", ""))];
      continue;
    }

    if (
      words[i].length &&
      words[i].toLowerCase() !== "the" &&
      words[i][0].toLowerCase() !== "q" &&
      isConsonant(words[i][0])
    ) {
      if (firstConsonantWordIndex === -1) {
        firstConsonantWordIndex = i;
      } else {
        let firstWordCluster = getConsonantCluster(
          words[firstConsonantWordIndex]
        );
        let secondWordCluster = getConsonantCluster(words[i]);

        words[firstConsonantWordIndex] = words[firstConsonantWordIndex].replace(
          firstWordCluster,
          `<span id="The Foon (Spoonerism)" class="${secondWordCluster}">${firstWordCluster}</span>`
        );
        words[i] = words[i].replace(
          secondWordCluster,
          `<span id="The Foon (Spoonerism)" class="${firstWordCluster}">${secondWordCluster}</span>`
        );

        break;
      }
    }
  }
  console.log("first", words.join(""));
  let result = words.join("");

  placeholders.forEach((placeholder, index) => {
    result = result.replace(`PLACEHOLDER${index}`, placeholder);
  });

  return result;
};

// Swap the word based on a consonant cluster
export const swapWord = (word, cluster) => {
  return cluster + word.slice(getConsonantCluster(word).length);
};

console.log(
  spoonerism(
    `The quick <span id="colorized">brown</span> fox jumps over the lazy <span id="highlighted">dog</span>.`
  )
);

// export default spoonerism;
