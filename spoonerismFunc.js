export const spoonerism = (sentence) => {
  let words = sentence.split(/\b/); // Splitting on word boundaries to retain spaces/punctuation
  let firstConsonantWordIndex = -1;

  const isConsonant = (ch) =>
    "aeiouAEIOU".indexOf(ch) === -1 && /[a-zA-Z]/.test(ch);

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

  return words.join("");
};

// Extract consonant cluster from a word
export const getConsonantCluster = (word) => {
  let cluster = "";
  for (let ch of word) {
    if ("aeiouAEIOU".indexOf(ch) === -1 && /[a-zA-Z]/.test(ch)) {
      cluster += ch;
    } else {
      break;
    }
  }
  return cluster;
};

// Swap the word based on a consonant cluster
export const swapWord = (word, cluster) => {
  return cluster + word.slice(getConsonantCluster(word).length);
};

console.log(spoonerism("I jumped over the shark"));
console.log(spoonerism("The quick brown fox"));
