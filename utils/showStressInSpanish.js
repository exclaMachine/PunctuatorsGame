function emphasizeVowelsWithSpan(sentence) {
  const words = sentence.split(/\s+/);

  function emphasizeWord(word) {
    if (word.length === 2) {
      const vowelIndex = /[aeiouáéíóú]/i.exec(word).index;
      return (
        word.substring(0, vowelIndex) +
        `<span id="Dr. Ácuta">${word[vowelIndex]}</span>` +
        word.substring(vowelIndex + 1)
      );
    } else if (/[áéíóú]/i.test(word)) {
      const accentedVowel = /[áéíóú]/i.exec(word)[0];
      return word.replace(
        accentedVowel,
        `<span id="Dr. Ácuta">${accentedVowel}</span>`
      );
    } else if (/[b-df-hj-np-tv-z]([.,!?;:"'()\s]|$)/i.test(word)) {
      const lastVowelIndex = findLastVowelIndex(word);
      if (lastVowelIndex !== -1) {
        return (
          word.substring(0, lastVowelIndex) +
          `<span id="Dr. Ácuta">${word[lastVowelIndex]}</span>` +
          word.substring(lastVowelIndex + 1)
        );
      }
    } else if (
      /s$|n$|[aeiouáéíóú][b-df-hj-np-tv-z]*[snaeiouáéíóú]$/.test(word)
    ) {
      const penultimateVowelIndex = findPenultimateVowelIndex(word);
      if (penultimateVowelIndex !== -1) {
        return (
          word.substring(0, penultimateVowelIndex) +
          `<span id="Dr. Ácuta">${word[penultimateVowelIndex]}</span>` +
          word.substring(penultimateVowelIndex + 1)
        );
      }
    }
    return word;
  }

  function findLastVowelIndex(word) {
    for (let i = word.length - 1; i >= 0; i--) {
      if (/[aeiouáéíóú]/i.test(word[i])) {
        return i;
      }
    }
    return -1; // No vowel found
  }

  function findPenultimateVowelIndex(word) {
    const vowels = word.match(/[aeiouáéíóú]/gi);
    if (vowels && vowels.length >= 2) {
      return word.lastIndexOf(vowels[vowels.length - 2]);
    }
    return -1; // No penultimate vowel found
  }

  const emphasizedWords = words.map(emphasizeWord);

  const emphasizedSentence = emphasizedWords.join(" ");

  return emphasizedSentence;
}

const inputSentence = "El estrés es una respuesta natural. del cuerpo.";
const emphasizedSentence = emphasizeVowelsWithSpan(inputSentence);
console.log(emphasizedSentence);
