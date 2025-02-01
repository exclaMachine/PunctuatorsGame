window.onload = function () {
  TextToIPA.loadDict("../lib/ipadict.txt");
};

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
};

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
    ConverterForm.convert("ipa-in", "ipa-out", "ipa-err");
    setTimeout(function () {
      let ipaOutput = document.getElementById("ipa-out").value;
      let outputText = ipaOutput;

      // Convert IPA to English phonetic equivalents
      for (let [ipa, eng] of Object.entries(phoneticAlphToEnglishConversions)) {
        outputText = outputText.split(ipa).join(eng);
      }

      // Apply French-specific changes
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

      // Set the final result in the output element
      document.getElementById("ipa-out").textContent = outputText;
      styleORInOutput();
    }, 100);
  } else if (conversionType === "german") {
    ConverterForm.convert("ipa-in", "ipa-out", "ipa-err");
    setTimeout(function () {
      var ipaOutput = document.getElementById("ipa-out").value;
      var outputText = ipaOutput;
      for (let [ipa, eng] of Object.entries(phoneticAlphToEnglishConversions)) {
        outputText = outputText.split(ipa).join(eng);
      }
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
      const ipaOutElement = document.getElementById("ipa-out");
      ipaOutElement.textContent = outputText;
      styleORInOutput();
    }, 100);
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
  } else if (conversionType === "russian") {
    ConverterForm.convert("ipa-in", "ipa-out", "ipa-err");
    setTimeout(function () {
      var ipaOutput = document.getElementById("ipa-out").value;
      var outputText = ipaOutput;
      // Convert IPA to English phonetic equivalents
      for (let [ipa, eng] of Object.entries(phoneticAlphToEnglishConversions)) {
        outputText = outputText.split(ipa).join(eng);
      }
      // Apply general Russian conversions
      for (let [key, value] of Object.entries(englishToRussianConversions)) {
        outputText = outputText.split(key).join(value);
      }
      // Replace initial letters for Russian accent
      for (let [initial, replacement] of russianInitialLetterConversion) {
        var regex = new RegExp(`\\b${initial}`, "g");
        outputText = outputText.replace(regex, replacement);
      }
      // Replace final letters for Russian accent
      for (let [final, replacement] of russianFinalLetterConversion) {
        var regex = new RegExp(`${final}\\b`, "g");
        outputText = outputText.replace(regex, replacement);
      }
      // Output the final result
      const ipaOutElement = document.getElementById("ipa-out");
      ipaOutElement.textContent = outputText;
      styleORInOutput();
    }, 100);
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
    ConverterForm.convert("ipa-in", "ipa-out", "ipa-err");
    setTimeout(function () {
      var ipaOutput = document.getElementById("ipa-out").value;
      var outputText = ipaOutput;
      // Convert IPA to English phonetic equivalents
      for (let [ipa, eng] of Object.entries(phoneticAlphToEnglishConversions)) {
        outputText = outputText.split(ipa).join(eng);
      }
      // Apply general Russian conversions
      for (let [key, value] of Object.entries(englishToSwedishConversions)) {
        outputText = outputText.split(key).join(value);
      }
      // Replace initial letters for Russian accent
      for (let [initial, replacement] of swedishInitialLetterConversion) {
        var regex = new RegExp(`\\b${initial}`, "g");
        outputText = outputText.replace(regex, replacement);
      }
      // Replace final letters for Russian accent
      for (let [final, replacement] of swedishFinalLetterConversion) {
        var regex = new RegExp(`${final}\\b`, "g");
        outputText = outputText.replace(regex, replacement);
      }
      // Output the final result
      const ipaOutElement = document.getElementById("ipa-out");
      ipaOutElement.textContent = outputText;
      styleORInOutput();
    }, 100);
  } else if (conversionType === "cockney") {
    ConverterForm.convert("ipa-in", "ipa-out", "ipa-err");
    setTimeout(function () {
      let ipaOutput = document.getElementById("ipa-out").value;
      let outputText = ipaOutput;

      // Convert IPA to English phonetic equivalents
      for (let [ipa, eng] of Object.entries(phoneticAlphToEnglishConversions)) {
        outputText = outputText.split(ipa).join(eng);
      }

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

      // Remove "r" before a consonant or at the end of a word
      const removeRRegex = /r([bcdfgjklmnpqstvxz\s?.;,!:]|$)/g;
      outputText = outputText.replace(removeRRegex, "$1");

      // Restore protected "OR" placeholder
      outputText = outputText.replace(new RegExp(placeholder, "g"), "OR");

      // Set the final result in the output element
      document.getElementById("ipa-out").textContent = outputText;
      styleORInOutput();
    }, 100);
  }
}
