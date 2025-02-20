window.onload = function () {
  TextToIPA.loadDict("../lib/ipadict.txt");
};

//https://www.masswerk.at/mespeak/
//https://itinerarium.github.io/phoneme-synthesis/
//https://ipa-reader.com/

//TODO trigger change of out put on any dropdown change

const phoneticAlphToEnglishConversions = {
  eɪ: "ay",
  aɪ: "I",
  Aɪ: "I",
  oʊ: "O",
  aʊ: "ow",
  ɔɪ: "oy",
  ʧ: "ch",
  ʤ: "dg",
  ŋ: "ng",
  ʃ: "sh",
  ð: "TH",
  θ: "th",
  ɛ: "e",
  ʒ: "zh",
  æ: "a",
  ɪ: "i",
  u: "oo",
  o: "O",
  a: "A",
  ɔ: "aw",
  i: "ee",
  ə: "ə",
  ʊ: "oo",
  ʌ: "u",
  j: "y",
  ɚ: "er",
  ɹ: "r",
};

// Reverse the simplified-to-IPA map for conversion back
// const englishToIpaConversions = Object.fromEntries(
//   Object.entries(phoneticAlphToEnglishConversions).map(([ipa, simplified]) => [
//     simplified,
//     ipa,
//   ])
// );

// Function to convert Simplified Pronunciation back to IPA. Too many errors
// function convertToIPA(simplifiedText) {
//   return simplifiedText.replace(
//     /ay|I|O|ow|oy|ch|dg|ng|sh|TH|th|e|zh|a|i|oo|A|aw|ee|ə|u|y|er|r/g,
//     (match) => {
//       return englishToIpaConversions[match] || match;
//     }
//   );
// }

const englishToItalianConversions = {
  TH: "d",
  th: "t",
  aw: "O",
  ooo: "O",
  A: "a",
  e: "a",
};

const tripleOtoTheDiphthong = {
  ooo: "O",
};

const germanInitialLetterConversion = [
  ["w", "v"],
  ["s", "z"],
  ["kw", "kv"],
];

const germanFinalLetterConversion = [
  ["b", "p"],
  ["d", "t"],
  ["dg", "ch"],
  ["g", "k"],
  ["v", "f"],
  ["z", "s"],
];

const italianInitialLetterConversion = [["h", ""]];

// Russian-specific mappings
const englishToRussianConversions = {
  ooo: "aw",
  TH: "d",
  th: "f",
  a: "A",
  uh: "aw",
  l: "L",
};

const russianInitialLetterConversion = [
  ["w", "v"],
  ["h", "KH"],
];

const russianFinalLetterConversion = [
  ["b", "p"],
  ["d", "t"],
  ["dg", "ch"],
  ["g", "k"],
  ["v", "f"],
  ["z", "s"],
];

function convertToEnglishPhonetics(callback) {
  ConverterForm.convert("ipa-in", "ipa-out", "ipa-err");
  setTimeout(function () {
    let ipaOutput = document.getElementById("ipa-out").value;
    let outputText = ipaOutput;

    // Convert IPA to English phonetic equivalents
    for (let [ipa, eng] of Object.entries(phoneticAlphToEnglishConversions)) {
      outputText = outputText.split(ipa).join(eng);
    }

    // Call the language-specific transformation function
    callback(outputText);
  }, 100);
}

function styleORInOutput() {
  const ipaOutElement = document.getElementById("ipa-out");
  const textContent = ipaOutElement.textContent;

  // Replace all occurrences of "OR" with styled HTML
  const styledContent = textContent.replace(
    /OR/g,
    '<span class="highlight-or">OR</span>'
  );

  // Update the output with styled content
  ipaOutElement.innerHTML = styledContent;
}

function removeRBeforeConsonantOrAtEnd(sentence) {
  return sentence.replace(/r([bcdfgjklmnopqstvxz\s\?\.\;\,\!\:]|$)/g, "$1");
}

function italianAddSchwaBetweenConsonants(sentence) {
  return sentence.replace(
    /([bcdfgklmnopqstvz])\s([bdfghjkmnpstvz])/g,
    "$1uh $2"
  );
}

function convertText() {
  var inputText = document.getElementById("ipa-in").value;
  var conversionType = document.getElementById("conversionType").value;

  if (conversionType === "shatner") {
    var outputText = inputText.split(" ").join(", ");
    const ipaOutElement = document.getElementById("ipa-out");
    ipaOutElement.textContent = outputText;
    return;
  } else if (conversionType === "ipa") {
    ConverterForm.convert("ipa-in", "ipa-out", "ipa-err");

    // Delay to ensure the conversion completes before styling
    setTimeout(function () {
      // Retrieve the raw output from the temporary hidden textarea
      const temporaryOutput = document.getElementById("ipa-out").value;

      // Update the actual output div with text content
      const ipaOutElement = document.getElementById("ipa-out");
      ipaOutElement.textContent = temporaryOutput;
      styleORInOutput();
    }, 100);
  } else if (conversionType === "english") {
    ConverterForm.convert("ipa-in", "ipa-out", "ipa-err");
    setTimeout(function () {
      var ipaOutput = document.getElementById("ipa-out").value;
      var outputText = ipaOutput;
      for (let [ipa, eng] of Object.entries(phoneticAlphToEnglishConversions)) {
        outputText = outputText.split(ipa).join(eng);
      }
      const ipaOutElement = document.getElementById("ipa-out");
      ipaOutElement.textContent = outputText;
      styleORInOutput();
    }, 200);
  } else if (conversionType === "french") {
    convertToEnglishPhonetics(function (outputText) {
      const englishToFrenchConversions = {
        TH: "d",
        th: "t",
        ooo: "O",
        I: "Aee",
        h: "",
      };
      for (let [key, value] of Object.entries(englishToFrenchConversions)) {
        outputText = outputText.split(key).join(value);
      }

      document.getElementById("ipa-out").textContent = outputText;
      styleORInOutput();
    });
  } else if (conversionType === "german") {
    convertToEnglishPhonetics(function (outputText) {
      for (let [key, value] of Object.entries(tripleOtoTheDiphthong)) {
        outputText = outputText.split(key).join(value);
      }
      for (let [initial, replacement] of germanInitialLetterConversion) {
        var regex = new RegExp(`\\b${initial}`, "g");
        outputText = outputText.replace(regex, replacement);
      }
      for (let [final, replacement] of germanFinalLetterConversion) {
        var regex = new RegExp(`${final}\\b`, "g");
        outputText = outputText.replace(regex, replacement);
      }
      outputText = removeRBeforeConsonantOrAtEnd(outputText); //non-rhotic

      // 🔹 Check dropdown and convert to IPA if selected
      // if (document.getElementById("conversionSelect").value === "ipa") {
      //   outputText = convertToIPA(outputText);
      // }

      document.getElementById("ipa-out").textContent = outputText;
      styleORInOutput();
    });
  } else if (conversionType === "hungarian") {
    const englishToHungarianConversions = {
      TH: "d",
      th: "t",
      O: "aw",
      kw: "kv",
      ee: "i",
      ay: "e",
    };

    const hungarianInitialLetterConversion = [["w", "v"]];

    // Protect uppercase "OR" by replacing it with a placeholder
    const placeholder = "__PRTECTED__";
    outputText = outputText.replace(/\bOR\b/g, placeholder);

    outputText = removeRBeforeConsonantOrAtEnd(outputText); //non-rhotic

    convertToEnglishPhonetics(function (outputText) {
      for (let [key, value] of Object.entries(englishToHungarianConversions)) {
        outputText = outputText.split(key).join(value);
      }
      for (let [initial, replacement] of hungarianInitialLetterConversion) {
        var regex = new RegExp(`\\b${initial}`, "g");
        outputText = outputText.replace(regex, replacement);
      }

      // Restore protected "OR" placeholder
      outputText = outputText.replace(new RegExp(placeholder, "g"), "OR");

      // Output the final result
      const ipaOutElement = document.getElementById("ipa-out");
      ipaOutElement.textContent = outputText;
      styleORInOutput();
    });
  } else if (conversionType === "italian") {
    ConverterForm.convert("ipa-in", "ipa-out", "ipa-err");
    setTimeout(function () {
      var ipaOutput = document.getElementById("ipa-out").value;
      var outputText = ipaOutput;
      for (let [ipa, eng] of Object.entries(phoneticAlphToEnglishConversions)) {
        outputText = outputText.split(ipa).join(eng);
      }
      for (let [initial, replacement] of italianInitialLetterConversion) {
        var regex = new RegExp(`\\b${initial}`, "g");
        outputText = outputText.replace(regex, replacement);
      }
      for (let [eng, ita] of Object.entries(englishToItalianConversions)) {
        outputText = outputText.split(eng).join(ita);
      }
      outputText = italianAddSchwaBetweenConsonants(outputText);
      const ipaOutElement = document.getElementById("ipa-out");
      ipaOutElement.textContent = outputText;
      styleORInOutput();
    }, 100);
  } else if (conversionType === "japanese") {
    const englishToJapaneseConversions = {
      l: "r",
      TH: "z",
      th: "s",
      zh: "sh",
    };

    // const swedishInitialLetterConversion = [
    //   ["w", "v"],
    //   ["dg", "y"],
    //   ["kw", "kv"],
    // ];

    const japaneseFinalLetterConversion = [
      ["b", "p"],
      ["d", "t"],
      ["g", "k"],
    ];

    convertToEnglishPhonetics(function (outputText) {
      for (let [key, value] of Object.entries(englishToJapaneseConversions)) {
        outputText = outputText.split(key).join(value);
      }

      outputText = removeRBeforeConsonantOrAtEnd(outputText); //non-rhotic

      for (let [final, replacement] of japaneseFinalLetterConversion) {
        var regex = new RegExp(`${final}\\b`, "g");
        outputText = outputText.replace(regex, replacement);
      }

      outputText = italianAddSchwaBetweenConsonants(outputText);
      // Output the final result
      const ipaOutElement = document.getElementById("ipa-out");
      ipaOutElement.textContent = outputText;
      styleORInOutput();
    });
  } else if (conversionType === "russian") {
    convertToEnglishPhonetics(function (outputText) {
      for (let [key, value] of Object.entries(englishToRussianConversions)) {
        outputText = outputText.split(key).join(value);
      }
      for (let [initial, replacement] of russianInitialLetterConversion) {
        var regex = new RegExp(`\\b${initial}`, "g");
        outputText = outputText.replace(regex, replacement);
      }
      for (let [final, replacement] of russianFinalLetterConversion) {
        var regex = new RegExp(`${final}\\b`, "g");
        outputText = outputText.replace(regex, replacement);
      }
      document.getElementById("ipa-out").textContent = outputText;
      styleORInOutput();
    });
  } else if (conversionType === "swedish") {
    const englishToSwedishConversions = {
      sw: "sv",
    };

    const swedishInitialLetterConversion = [
      ["w", "v"],
      ["dg", "y"],
      ["kw", "kv"],
    ];

    const swedishFinalLetterConversion = [["m", ""]];

    convertToEnglishPhonetics(function (outputText) {
      for (let [key, value] of Object.entries(englishToSwedishConversions)) {
        outputText = outputText.split(key).join(value);
      }
      for (let [initial, replacement] of swedishInitialLetterConversion) {
        var regex = new RegExp(`\\b${initial}`, "g");
        outputText = outputText.replace(regex, replacement);
      }
      for (let [final, replacement] of swedishFinalLetterConversion) {
        var regex = new RegExp(`${final}\\b`, "g");
        outputText = outputText.replace(regex, replacement);
      }
      // Output the final result
      const ipaOutElement = document.getElementById("ipa-out");
      ipaOutElement.textContent = outputText;
      styleORInOutput();
    });
  } else if (conversionType === "swahili") {
    const englishToSwahiliConversions = {
      zh: "sh",
      th: "t",
      TH: "d",
      t: "ts", //dentalized
      ay: "e",
      O: "aw",
      r: "l",
    };

    convertToEnglishPhonetics(function (outputText) {
      //remove the r before changing to an l
      outputText = removeRBeforeConsonantOrAtEnd(outputText); //non-rhotic

      for (let [key, value] of Object.entries(englishToSwahiliConversions)) {
        outputText = outputText.split(key).join(value);
      }

      //   for (let [initial, replacement] of swahiliInitialLetterConversion) {
      //     var regex = new RegExp(`\\b${initial}`, "g");
      //     outputText = outputText.replace(regex, replacement);
      //   }
      //   for (let [final, replacement] of swahiliFinalLetterConversion) {
      //     var regex = new RegExp(`${final}\\b`, "g");
      //     outputText = outputText.replace(regex, replacement);
      // }

      // Output the final result
      const ipaOutElement = document.getElementById("ipa-out");
      ipaOutElement.textContent = outputText;
      styleORInOutput();
    });
  } else if (conversionType === "cockney") {
    convertToEnglishPhonetics(function (outputText) {
      // Protect uppercase "OR" by replacing it with a placeholder
      const placeholder = "__PRTECTED__";
      outputText = outputText.replace(/\bOR\b/g, placeholder);

      // Apply Cockney-specific changes
      const cockneyChanges = {
        ay: "I",
        I: "oy",
        O: "ow",
        TH: "v",
        th: "f",
        tt: "?", // Replace with glottal stop
      };
      for (let [key, value] of Object.entries(cockneyChanges)) {
        outputText = outputText.split(key).join(value);
      }

      // Replace "t" with glottal stop, but only between vowels and not followed by "ch"
      const glottalStopRegex = /([aeiouɑ])(t)(?![ch])/g;
      outputText = outputText.replace(glottalStopRegex, "$1?");

      // Remove initial "h"
      const initialHRegex = /\bh/g;
      outputText = outputText.replace(initialHRegex, "");

      // Change "ooo" to "O"
      outputText = outputText.split("ooo").join("O");

      //   const removeRRegex = /r([bcdfgjklmnpqstvxz\s?.;,!:]|$)/g;
      //   outputText = outputText.replace(removeRRegex, "$1");
      outputText = removeRBeforeConsonantOrAtEnd(outputText); //non-rhotic

      // Restore protected "OR" placeholder
      outputText = outputText.replace(new RegExp(placeholder, "g"), "OR");

      // Set the final result in the output element
      document.getElementById("ipa-out").textContent = outputText;
      styleORInOutput();
    });
  }
}
