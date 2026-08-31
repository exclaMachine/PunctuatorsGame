//Problem because these actually can't be done before punctuation because splitting will split the spans... and cause spaces in between. Not add spaces but split up spaces into own elements?

export const secondContractionWordSet = new Set([
  "not",
  "had",
  "would",
  "will",
  "shall",
  "is",
  "has",
  "am",
  "have",
  "us",
  "are",
]);

const notSubsetOfFirstContractionWordSet = new Set([
  "are",
  "can",
  "could",
  "did",
  "does",
  "do",
  "had",
  "has",
  "have",
  "is",
  "might",
  "must",
  "shall",
  "should",
  "were",
  "will",
  "would",
  "Are",
  "Can",
  "Could",
  "Did",
  "Does",
  "Do",
  "Had",
  "Has",
  "Have",
  "Is",
  "Might",
  "Must",
  "Shall",
  "Should",
  "Were",
  "Will",
  "Would",
]);

const hadWouldSubsetOfFirstContractionWordSet = new Set([
  "he",
  "I",
  "i",
  "it",
  "she",
  "they",
  "we",
  "who",
  "you",
  "He",
  "It",
  "She",
  "They",
  "We",
  "Who",
  "You",
]);

const willShallSubsetOfFirstContractionWordSet = new Set([
  "he",
  "i",
  "I",
  "it",
  "she",
  "they",
  "we",
  "what",
  "who",
  "you",
  "He",
  "It",
  "She",
  "They",
  "We",
  "What",
  "Who",
  "You",
]);

const isHasSubsetOfFirstContractionWordSet = new Set([
  "he",
  "she",
  "that",
  "there",
  "what",
  "where",
  "who",
  "He",
  "She",
  "That",
  "There",
  "What",
  "Where",
  "Who",
]);

const haveSubsetOfFirstContractionWordSet = new Set([
  "I",
  "they",
  "we",
  "what",
  "who",
  "you",
  "They",
  "We",
  "What",
  "Who",
  "You",
]);

const areSubsetOfFirstContractionWordSet = new Set([
  "they",
  "we",
  "what",
  "who",
  "you",
  "They",
  "We",
  "What",
  "Who",
  "You",
]);

const articleWordSet = new Set(["a", "the", "an"]);

export const wrapContractionWithSpan = (typedSentence, outputSentence) => {
  let words = typedSentence.split(" ");

  words.map((word, index) => {
    if (index === words.length - 1) return;

    // word.toLowerCase();  need to work on capital somehow...
    if (
      (notSubsetOfFirstContractionWordSet.has(word) &&
        words[index + 1] === "not") ||
      (hadWouldSubsetOfFirstContractionWordSet.has(word) &&
        (words[index + 1] === "had" || words[index + 1] === "would")) ||
      (willShallSubsetOfFirstContractionWordSet.has(word) &&
        (words[index + 1] === "will" || words[index + 1] === "shall")) ||
      (isHasSubsetOfFirstContractionWordSet.has(word) &&
        (words[index + 1] === "is" || words[index + 1] === "has")) ||
      (word === "i" && words[index + 1] === "am") ||
      (haveSubsetOfFirstContractionWordSet.has(word) &&
        words[index + 1] === "have") ||
      (word === "let" && words[index + 1] === "us") ||
      ((word === "here" || word === "it" || word === "Here" || word === "It") &&
        words[index + 1] === "is") ||
      (areSubsetOfFirstContractionWordSet.has(word) &&
        words[index + 1] === "are")
    ) {
      words[index + 1] = `<span id=\"ApostroPharaoh (Contraction)\" class=\"${
        words[index + 1]
      }\">${words[index + 1]}</span>`;
    }
  });

  return words.join(" ");
};

/* ─── THE EATING ────────────────────────────────────────────────────────────────────────────────
   ApostroPharaoh does not stop at the word she hits. Her shot IS her — `secondHeroImage: "white"`
   means no hero is drawn at the bottom of the screen while it is up — so she carries straight on
   through the sentence and off the top, and the letters go WHILE SHE IS CROSSING THEM. Nothing in
   here is on a timer for that reason: index.js's collision branch hands us the top and bottom of
   her body every frame, and how much of the word is gone is a pure function of how far she has
   crossed it.

   The rule the whole thing is built on: THE APOSTROPHE STANDS EXACTLY WHERE THE EATEN LETTERS WERE.
   Every case is the same shape — a head that survives, the run of letters she takes, a tail — so
   the mark goes into the DOM at the very start, collapsed to nothing, and simply grows into the
   hole the letters leave behind.

   See docs/punctuators.md, "ApostroPharaoh eats the letters".                                     */

/* The word you shoot, split into what survives and what she takes. Keyed by the word itself, which
   is exactly what wrapContractionWithSpan above writes into the span's class. */
const CONTRACTION_PLAN = new Map([
  ["had", { head: "", eat: "ha", tail: "d" }],
  ["would", { head: "", eat: "woul", tail: "d" }],
  ["is", { head: "", eat: "i", tail: "s" }],
  ["has", { head: "", eat: "ha", tail: "s" }],
  ["us", { head: "", eat: "u", tail: "s" }],
  ["shall", { head: "", eat: "sha", tail: "ll" }],
  ["will", { head: "", eat: "wi", tail: "ll" }],
  ["not", { head: "n", eat: "o", tail: "t" }],
  ["am", { head: "", eat: "a", tail: "m" }],
  ["are", { head: "", eat: "a", tail: "re" }],
  ["have", { head: "", eat: "ha", tail: "ve" }],
]);

// All the letters are gone by three-quarters of her pass over the word, so the last one leaves with
// her still on top of it rather than at the instant she clears.
const EAT_WINDOW = 0.75;
// How long the gap takes to shut once she is clear. Independent of her flight — she leaves the top
// of the screen about 0.12s after clearing the word and the span she ate stays in the sentence
// either way (see the collision branch in index.js for why it must).
const CLOSE_MS = 380;
const OUTLINE = "1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000";

const eating = new WeakMap();

const letterHTML = (str, cls) =>
  [...(str || "")].map((ch) => `<i class="${cls}">${ch}</i>`).join("");

/* One element per letter, because the eating is per letter. Inner markers are <i>, never a nested
   <span> — waitForElement waits on `#output span` and has long since disconnected by now, but the
   convention is what keeps a later sentence-marking pass from tripping over these. */
const partsHTML = (p) =>
  letterHTML(p.head, "cx-keep") +
  (p.morph ? `<i class="cx-keep cx-morph">${p.morph.from}</i>` : "") +
  letterHTML(p.eat, "cx-eat") +
  (p.mark ? `<i class="cx-mark">'</i>` : "") +
  letterHTML(p.tail, "cx-keep");

/* `will not` → `won't` is the one irregular: the stem changes too, so she takes letters out of the
   word BEFORE the one you shot, and its `i` turns into an `o` rather than being eaten. Every letter
   involved sits in the single text node in front of the space — "will", or just "ill" when the W
   has already been taken by Full Stop's capital span — so the whole case is one node swap.

   (The old code did this by writing "won'" over that text node and "t" over the span, then fell
   through into the plain `not` case on a node it had just detached, where previousSibling is null:
   `will not` threw a TypeError every time.) */
const beginWontStem = (span, space) => {
  const node = space?.previousSibling;
  const text = node?.nodeValue;
  if (text !== "will" && text !== "ill") return null;

  const holder = document.createElement("i");
  holder.className = "cx-stem";
  holder.innerHTML = partsHTML({
    head: text === "will" ? "w" : "",
    morph: { from: "i", to: "o" },
    eat: "ll",
  });
  node.replaceWith(holder);
  return { holder, text: text === "will" ? "wo" : "o" };
};

const begin = (span, color) => {
  const plan = CONTRACTION_PLAN.get(span.className);
  if (!plan) return null;

  const space = span.previousSibling; // Spacel's span — the gap that shuts at the end
  const box = span.getBoundingClientRect();
  const stem = span.className === "not" ? beginWontStem(span, space) : null;

  span.innerHTML = partsHTML({ ...plan, mark: true });
  /* The hint underlines any span still classed as one of the contractable words, so the class goes
     the moment she reaches it — the word is hers now and there is nothing left to point at. The id
     stays, and the span is never removed from the sentence: the collision branch has to keep
     matching it for the rest of her flight, or the hero is drawn at the bottom of the screen again
     while her body is still climbing past the sentence. */
  span.className = "cx-eaten";

  const eaten = [
    ...(stem ? stem.holder.querySelectorAll(".cx-eat") : []),
    ...span.querySelectorAll(".cx-eat"),
  ];
  // Her colour marks what she is taking, so you can read the doomed letters before they go.
  eaten.forEach((el) => {
    el.style.color = color;
    el.style.textShadow = OUTLINE;
  });

  return {
    span,
    space,
    stem,
    eaten,
    gone: 0,
    phase: "eating",
    top: box.top,
    bottom: box.bottom,
  };
};

const finish = (state) => {
  state.phase = "done";
  /* Back to a plain text node. Master Asterisk finds the word in front of him with
     `previousSibling.data`, which an element answers with undefined. */
  if (state.stem?.holder.isConnected) {
    state.stem.holder.replaceWith(document.createTextNode(state.stem.text));
  }
};

const close = (state) => {
  state.phase = "closing";
  state.eaten.forEach((el) => el.classList.add("cx-gone"));
  /* Next frame, not this one: the letters have to be TRANSPARENT before their boxes start
     collapsing, or the word visibly shuffles sideways while you can still read it. */
  requestAnimationFrame(() => {
    state.eaten.forEach((el) => el.classList.add("cx-collapse"));
    state.span.querySelector(".cx-mark")?.classList.add("cx-show");
    if (state.space) state.space.className = "shrink-space";

    const morph = state.stem?.holder.querySelector(".cx-morph");
    if (morph) {
      morph.classList.add("cx-morphing");
      // Swapped halfway, where the flip has the letter edge-on and there is nothing to see: `will`
      // does not lose its i, it turns over into the o of `won't`.
      setTimeout(() => {
        morph.textContent = "o";
      }, 150);
    }
  });
  setTimeout(() => finish(state), CLOSE_MS);
};

/* Called every frame she is over the word, with the top and bottom of her body in viewport
   coordinates. First call sets the word up; the rest is her position deciding how much is left. */
export const swallowContraction = (span, passTop, passBottom, color) => {
  let state = eating.get(span);
  if (!state) {
    state = begin(span, color);
    if (!state) return; // a word we have no plan for — nothing to eat
    eating.set(span, state);
  }
  if (state.phase !== "eating") return;

  // 0 the moment her leading edge touches the bottom of the word, 1 when her trailing edge clears
  // the top of it.
  const crossed =
    (state.bottom - passTop) /
    (state.bottom - state.top + (passBottom - passTop));
  const want = Math.round(
    Math.min(1, Math.max(0, crossed / EAT_WINDOW)) * state.eaten.length,
  );
  while (state.gone < want) state.eaten[state.gone++].classList.add("cx-gone");

  if (passBottom <= state.top) close(state);
};
