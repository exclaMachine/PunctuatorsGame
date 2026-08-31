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

/* Beat 2, the union. It is independent of her flight — she leaves the top of the screen about 0.12s
   after clearing the word, and the span she ate stays in the sentence either way (see the collision
   branch in index.js for why it must).

   THE APPROACH. How long the gap takes to shut once she is clear. MUST MATCH the font-size
   transitions on .cx-eat and .shrink-space in index.css, which ease IN — the two words are still
   gaining speed when they meet. */
const COLLAPSE_MS = 260;
/* THE SQUASH. The whole finished word compresses, springs back wide, and settles. Long on purpose:
   a deformation the eye has to READ needs about twice the time an impact needs to register. */
const SNAP_MS = 640;
// The `will` -> `wo` flip, matching the cx-morph keyframes in index.css.
const MORPH_MS = 300;
// When the stem holder can safely go back to being a plain text node.
const CLOSE_MS = COLLAPSE_MS + SNAP_MS + 40;
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
    box: null, // the .cx-union wrapper, built at the start of beat 2
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
  unwrapUnion(state.box);
};

/* ─── BEAT 2: THE SQUASH ────────────────────────────────────────────────────────────────────────
   The eating is beat 1 and it is hers. The union is beat 2 and it belongs to the two words: the gap
   accelerates shut, and then the finished word is SQUEEZED — the letters compress toward each other
   and stretch taller off the line, spring back wider and shorter than they started, and settle.
   Squash and stretch, the oldest trick there is, and the pun made visible: a contraction contracts.
   The apostrophe pops out of the same moment (see MARK_FRAMES). Then she seals it — THE CARTOUCHE.

   ALL OF IT IS ONE TRANSFORM ON ONE BOX. Anything that deformed the word through layout instead —
   letter-spacing, margins, per-letter font-size — changes the line's width, and #output centres
   every line INDIVIDUALLY, so the whole sentence would slide sideways on the impact. A transform
   affects nothing outside the element it is on, so the problem cannot arise. That is also why the
   apostrophe takes its full width during the APPROACH (invisible, scaled to nothing) and only pops
   with a transform: growing it for real at the impact would resize the box mid-squash.

   The box is `.cx-union`, built by wrapUnion() below, and it is the only reason the first word
   deforms too — it is plain text and has no element of its own. */
const SQUASH_FRAMES = [
  { transform: "scale(1, 1)", easing: "ease-in" },
  // Squeezed: narrow and tall. Arrived at fast, because it is a collision.
  { transform: "scale(0.80, 1.18)", offset: 0.22, easing: "ease-out" },
  // Sprung back the other way: wide and short.
  { transform: "scale(1.08, 0.94)", offset: 0.52, easing: "ease-in-out" },
  // A smaller counter-swing, which is what stops it reading as a bounce and starts it reading as
  // something with weight coming to rest.
  { transform: "scale(0.975, 1.02)", offset: 0.78, easing: "ease-in-out" },
  { transform: "scale(1, 1)" },
];

/* The mark is not there at all until the two halves collide — it is what they knock loose. Scale,
   not font-size: it is inside the squashing box and must not change its width. */
const MARK_FRAMES = [
  { transform: "scale(0)", opacity: 0, easing: "ease-out" },
  { transform: "scale(1.35)", opacity: 1, offset: 0.45, easing: "ease-in-out" },
  { transform: "scale(0.92)", offset: 0.72 },
  { transform: "scale(1)" },
];
const MARK_MS = 340;

/* The union — both words and the gap between them — as ONE element, so the squash is a single
   transform on a single box rather than N letters that would each have to be measured and moved.
   Only the second word is an element to begin with; the first is plain text, so the wrapper is
   built by walking back from the space to the previous space (or the start of the sentence) and
   moving everything from there up to the span inside it. That walk is also what picks up the
   separate `W` span of `Will` when Full Stop's capital has taken it.

   It is taken apart again in finish(). Master Asterisk reads the word in front of him with
   `previousSibling.data`, which an element answers with undefined — the same reason the `will` stem
   holder goes back to being a text node, and the reason this is not left in the sentence. */
const wrapUnion = (span, space) => {
  const parent = span.parentNode;
  if (!parent) return null;

  let first = span;
  let node = space && space.previousSibling;
  while (node && !(node.nodeType === 1 && node.classList.contains("space"))) {
    first = node;
    node = node.previousSibling;
  }

  const box = document.createElement("i");
  box.className = "cx-union";
  parent.insertBefore(box, first);
  let n = first;
  while (n) {
    // Read the sibling BEFORE the move — appendChild is what takes it out of the line.
    const next = n.nextSibling;
    const last = n === span;
    box.appendChild(n);
    if (last) break;
    n = next;
  }
  return box;
};

const unwrapUnion = (box) => {
  if (!box || !box.isConnected) return;
  const parent = box.parentNode;
  while (box.firstChild) parent.insertBefore(box.firstChild, box);
  parent.removeChild(box);
  // The two words are one word now, so their text should be one text node too, or Master Asterisk
  // finds only the half of it that used to be the second word.
  parent.normalize();
};

const squash = (state) => {
  const mark = state.span.querySelector(".cx-mark");
  /* .cx-show is the mark's resting state — full width, visible, untransformed — and it goes on now,
     at the START of the approach, so the hole the letters leave is already the right size and the
     box has stopped resizing by the time the squash begins. What keeps it invisible until the
     impact is `fill: "backwards"` on its animation, which holds scale(0) all through the delay. */
  if (mark) mark.classList.add("cx-show");
  if (!state.box || !state.box.animate) return;

  if (mark && mark.animate) {
    mark.animate(MARK_FRAMES, {
      duration: MARK_MS,
      delay: COLLAPSE_MS,
      fill: "backwards",
    });
  }
  const hit = state.box.animate(SQUASH_FRAMES, {
    duration: SNAP_MS,
    delay: COLLAPSE_MS,
  });
  // The seal follows the union, and hanging it off the end of the spring means the ring is measured
  // with the word back at its resting size rather than mid-deformation.
  hit.onfinish = () => sealCartouche(state);
};

/* ─── THE CARTOUCHE ─────────────────────────────────────────────────────────────────────────────
   A cartouche is the ring Egyptian writing draws around a name, which is exactly the claim this
   beat has to make: THESE TWO WORDS ARE ONE WORD NOW. It draws itself round the finished word in
   gold, holds, and fades.

   It is absolutely positioned inside #output and never joins the line box (the ladder rung strip's
   rule), so it cannot reflow the sentence it is drawn on. #output is `position: fixed` with no
   border or padding, so it is the containing block and its client rect IS the origin — which also
   means the ring dies with the sentence the moment #output is rewritten. */
const GOLD_DRAW_MS = 420;
const GOLD_TIE_MS = 200;
const GOLD_HOLD_MS = 280;
const GOLD_FADE_MS = 320;

const sealCartouche = (state) => {
  const out = state.span.closest("#output");
  if (!out || !state.box) return;
  const word = state.span.getBoundingClientRect();
  const rect = state.box.getBoundingClientRect();
  // A contraction that wrapped across two lines has no ring worth drawing round it.
  if (!rect.width || rect.height > word.height * 1.6) return;

  const em = parseFloat(getComputedStyle(state.span).fontSize) || 16;
  const padX = em * 0.3;
  const padY = em * 0.1;
  const sw = Math.max(1.5, em * 0.05);
  const w = rect.width + padX * 2;
  const h = rect.height + padY * 2;
  const x0 = sw / 2;
  const x1 = w - sw / 2;
  const y0 = sw / 2;
  const y1 = h - sw / 2;
  const r = Math.min((y1 - y0) / 2, (x1 - x0) / 2);
  const cx = w / 2;
  /* Measured, not asked for: getTotalLength() on a basic shape is SVG2 and patchy, and a pill's
     perimeter is two straight sides and two semicircles. The path starts at top centre and closes
     there, so the two ends of the stroke meet in the middle of the top edge. */
  const ring = 2 * (x1 - x0) - 4 * r + 2 * Math.PI * r;
  const tieX = x1 - r * 0.5;
  const tie = y1 - y0 + sw * 2;

  const box = document.createElement("div");
  box.className = "cx-cartouche";
  const host = out.getBoundingClientRect();
  box.style.left = `${rect.left - host.left - padX}px`;
  box.style.top = `${rect.top - host.top - padY}px`;
  box.style.width = `${w}px`;
  box.style.height = `${h}px`;
  box.innerHTML =
    `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" fill="none" ` +
    `stroke="currentColor" stroke-width="${sw}" stroke-linecap="round">` +
    `<path class="cx-ring" d="M ${cx} ${y0} L ${x1 - r} ${y0} ` +
    `A ${r} ${r} 0 0 1 ${x1 - r} ${y1} L ${x0 + r} ${y1} ` +
    `A ${r} ${r} 0 0 1 ${x0 + r} ${y0} Z" ` +
    `stroke-dasharray="${ring}" stroke-dashoffset="${ring}"/>` +
    `<line class="cx-tie" x1="${tieX}" y1="${y0 - sw}" x2="${tieX}" y2="${y1 + sw}" ` +
    `stroke-dasharray="${tie}" stroke-dashoffset="${tie}"/>` +
    `</svg>`;
  out.appendChild(box);

  const ringEl = box.querySelector(".cx-ring");
  const tieEl = box.querySelector(".cx-tie");
  if (!box.animate) {
    ringEl.setAttribute("stroke-dashoffset", "0");
    tieEl.setAttribute("stroke-dashoffset", "0");
    setTimeout(() => box.remove(), GOLD_DRAW_MS + GOLD_HOLD_MS + GOLD_FADE_MS);
    return;
  }
  ringEl.animate(
    [{ strokeDashoffset: `${ring}` }, { strokeDashoffset: "0" }],
    { duration: GOLD_DRAW_MS, easing: "ease-out", fill: "forwards" },
  );
  // The tie goes on last, the way a seal is pressed after the ring is drawn.
  tieEl.animate([{ strokeDashoffset: `${tie}` }, { strokeDashoffset: "0" }], {
    duration: GOLD_TIE_MS,
    delay: GOLD_DRAW_MS * 0.72,
    easing: "ease-out",
    fill: "forwards",
  });
  box.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: GOLD_FADE_MS,
    delay: GOLD_DRAW_MS + GOLD_TIE_MS + GOLD_HOLD_MS,
    fill: "forwards",
  }).onfinish = () => box.remove();
};

const close = (state) => {
  state.phase = "closing";
  /* Before anything is asked to move. Wrapping means taking the nodes out of the line and putting
     them back in, which resets any transition running on them — the eaten letters' fade is long
     finished by now, but the collapse below has not started, and must not. */
  state.box = wrapUnion(state.span, state.space);
  state.eaten.forEach((el) => el.classList.add("cx-gone"));
  /* Next frame, not this one: the letters have to be TRANSPARENT before their boxes start
     collapsing, or the word visibly shuffles sideways while you can still read it. */
  requestAnimationFrame(() => {
    state.eaten.forEach((el) => el.classList.add("cx-collapse"));
    if (state.space) state.space.className = "shrink-space";

    const morph = state.stem?.holder.querySelector(".cx-morph");
    if (morph) {
      /* Delayed so the flip is edge-on — nothing to see, which is where the text is swapped — at
         the exact moment the two halves meet: `will` does not lose its i, it turns over into the o
         of `won't` on the impact. */
      const lead = Math.max(0, COLLAPSE_MS - MORPH_MS / 2);
      morph.style.animationDelay = `${lead}ms`;
      morph.classList.add("cx-morphing");
      setTimeout(() => {
        morph.textContent = "o";
      }, lead + MORPH_MS / 2);
    }

    squash(state);
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
