import caretWords from "./oneMoreCharacterWordsWithSpan.js";
import roundWords from "./RoundedSpans.js";
//TODO move all exports to this wrap function and make it work for all spans

/* Every lookup below goes through this, never a bare `dict[word]`.

   These dictionaries are plain objects, so `dict["constructor"]` answers with Object's constructor
   — a truthy function — for any dictionary that doesn't happen to own that key. `constructor` is an
   ordinary English word, and a bare lookup would have wrapped it in the function's own source code.
   (The Tree of Kinds hit the same trap from the other side and answered it with Map/Set; here the
   dictionaries are generated files, so the own-property test is the cheaper half of the same fix.) */
const entryFor = (dict, word) =>
  Object.prototype.hasOwnProperty.call(dict, word) ? dict[word] : undefined;

export const wrapCaretWords = (sentence) => {
  const words = sentence.split(/\b/); // Splitting by word boundary

  const splitted = words.map((word) => {
    const entry = entryFor(caretWords, word);
    if (entry) {
      return entry;
    }
    return word;
  });
  return splitted.join("");
};

export const wrapRoundSpanWords = (sentence) => {
  const words = sentence.split(/\b/); // Splitting by word boundary

  const splitted = words.map((word) => {
    const entry = entryFor(roundWords, word);
    if (entry) {
      return entry;
    }
    return word;
  });
  return splitted.join("");
};

/* The guards for Zana and Roundabout. Both dictionaries are keyed by the exact token the wrapper
   looks up — lowercase entries, no case folding — so the test has to be the same lookup on the same
   \b split, or the guard would let through a sentence with nothing to shoot. */
export const hasCaretWords = (sentence) =>
  sentence.split(/\b/).some((word) => entryFor(caretWords, word));

export const hasRoundedWords = (sentence) =>
  sentence.split(/\b/).some((word) => entryFor(roundWords, word));
