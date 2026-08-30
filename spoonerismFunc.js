const BANNED_SUBSTRINGS = ["igger", "ew"]; // extend as needed

const cleanWord = (w) => w.replace(/[^a-zA-Z]/g, "").toLowerCase();

const containsBannedSubstring = (word) =>
  BANNED_SUBSTRINGS.some((bad) => cleanWord(word).includes(bad));

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
  let eligibleWordCount = words.reduce(
    (count, word) => count + (word.startsWith("PLACEHOLDER") ? 0 : 1),
    0
  );

  // Only proceed if there is more than one eligible word
  if (eligibleWordCount > 1) {
    for (let i = 0; i < words.length; i++) {
      if (containsBannedSubstring(words[i])) {
        continue;
      }

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
  }

  let result = words.join(" ");

  // Restoring placeholders with original content
  placeholders.forEach((placeholder, index) => {
    result = result.replace(`PLACEHOLDER${index}`, placeholder);
  });

  return result;
};

/* Is there anything here for the Foon to swap?

   TWO targets, not one: a spoonerism is a trade between two words, so a lone wrapped cluster is a
   span you can shoot at and nothing happens. The count is taken off the real output rather than
   re-deriving the eligibility rules above — the cheap re-implementation is exactly the kind that
   goes stale the first time BANNED_SUBSTRINGS or the "q"/"the" exclusions change.

   Called on the RAW sentence, while the game spoonerises the article-wrapped one. That is the same
   answer by construction: the only words protectedArticles hides are `a`, `an` and `the`, and the
   loop above already refuses all three (two are vowel-initial, "the" is excluded by name). The
   eligibleWordCount gate can only make the wrapped count LOWER, and it only bites when there is a
   single non-article word — which cannot reach two targets either way. */
export const hasSpoonerisms = (sentence) =>
  (spoonerism(sentence).match(/id="The Foon \(Spoonerism\)"/g) || []).length >= 2;
