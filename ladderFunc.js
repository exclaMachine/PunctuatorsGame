/* ladderFunc.js — General Ization & Keen Arrow, the "is a kind of" ladder.
   docs/punctuators-ladder.md §§2–4 (the mode, the span, the data) and §13.7 (sibling cycling).

   This module owns the WORD side of the mode: loading the corpus, deciding which words in a sentence
   can climb, wrapping them, and answering "what is one rung up / down from here". index.js owns the
   HERO side (who shot it, what it looks like when it moves).

   Two things about this file are load-bearing and easy to break:

   1. NOTHING IS KEYED BY A PLAIN OBJECT. `constructor` and `prototype` are both real words in
      ladderPOJO.js (verified), so `{}[word]` would hand back a function and invent edges that are not
      in the corpus. Everything here is a Map/Set. ladderMap.js carries the same warning.
   2. THE CORPUS IS LOADED LAZILY. ladderPOJO.js is 337 KB and only this mode and the Tree of Kinds
      need it, so it arrives via a dynamic import() the first time the player picks the mode — the two
      callers share one cached module. (§3.3 originally specced a static import so that hasLadders /
      wrapLadders could stay synchronous; they still ARE synchronous — the await moved out to the one
      click handler that starts a round, which is already async-safe.)
*/

/* The span id both heroes answer to. It is a hero's targetId, not its symbol, which is the whole
   point of the §4 engine change: one span, two heroes, Switch Character flips the direction. */
export const LADDER_ID = "Ization Ladder";

let DOWN = null; // Map<parent, string[]>  — children, most familiar first (the shipped order)
let UP = null; // Map<child, parent>     — inverted once at load
let DEPTH = null; // Map<word, number>     — memoised subtree depth, for the rung strip
let loading = null;

export function laddersReady() {
  return DOWN !== null;
}

/* Idempotent, and safe to call from several places at once — they all await the same promise. */
export function loadLadders() {
  if (DOWN) return Promise.resolve();
  loading =
    loading ||
    import("./ladderPOJO.js").then(({ ladderDown }) => {
      const down = new Map();
      const up = new Map();
      for (const parent of Object.keys(ladderDown)) {
        const kids = ladderDown[parent].split(" ");
        down.set(parent, kids);
        // The corpus is a forest — measured 0 duplicate children and 0 cycles — so first-wins here
        // only ever guards against a future rebuild that stops being one.
        for (const kid of kids) if (!up.has(kid)) up.set(kid, parent);
      }
      DOWN = down;
      UP = up;
      DEPTH = new Map();
    });
  return loading;
}

/* ── Reading the ladder ───────────────────────────────────────────────────────────────────────── */

export function ladderParentOf(word) {
  return (UP && UP.get(word)) || null;
}

/** The children of a word, most familiar first, or null. Never mutate the returned array. */
export function ladderChildrenOf(word) {
  return (DOWN && DOWN.get(word)) || null;
}

/** True if the word sits anywhere on the ladder — as a child, a parent, or both. */
export function isLadderWord(word) {
  return !!DOWN && (UP.has(word) || DOWN.has(word));
}

/** Most specific → most general, e.g. poodle,dog,mammal,animal. */
export function ladderChainFor(word) {
  const chain = [word];
  let w = word;
  // The build caps chains at 6 rungs; the guard is only here so a bad rebuild can't hang the page.
  for (let i = 0; i < 12 && UP.has(w); i++) {
    w = UP.get(w);
    chain.push(w);
  }
  // One rung below the typed word, so Keen Arrow has somewhere to go on the very first shot (§2.2).
  const kids = DOWN.get(word);
  if (kids && kids.length) chain.unshift(kids[0]);
  return chain;
}

/** How many rungs of narrower kinds sit below a word (0 for a leaf). Memoised; the forest is ≤5 deep. */
export function ladderDepthBelow(word) {
  if (!DOWN) return 0;
  const memo = DEPTH.get(word);
  if (memo !== undefined) return memo;
  const kids = DOWN.get(word);
  let d = 0;
  if (kids) for (const k of kids) d = Math.max(d, 1 + ladderDepthBelow(k));
  DEPTH.set(word, d);
  return d;
}

/* The §2.4 rung strip: how far the ladder runs in each direction from where you are standing.
   ▲ per rung above · ● you are here · ▼ per level of narrower kinds below. */
export function ladderRungStrip(word) {
  let up = 0;
  let w = word;
  for (let i = 0; i < 12 && UP.has(w); i++) {
    w = UP.get(w);
    up++;
  }
  return "▲".repeat(up) + "●" + "▼".repeat(ladderDepthBelow(word));
}

/* ── Case and plurals (§2.3, §3.4) ────────────────────────────────────────────────────────────── */

/* Betar's matchCase (index.js) copies capitals position-by-position, which only works because an
   alphabet neighbour is the same length as its word. Ladder rungs are not, so this copies the SHAPE
   instead: ALL CAPS stays all caps, Leading cap stays leading. */
export function applyLadderCase(original, word) {
  if (!original) return word;
  if (original.length > 1 && original === original.toUpperCase() && /[A-Z]/.test(original))
    return word.toUpperCase();
  if (/^[A-Z]/.test(original)) return word[0].toUpperCase() + word.slice(1);
  return word;
}

/* Naive regular-plural rules only (§3.4). An irregular plural simply doesn't match, so the word is
   left alone — the failure mode is a word that doesn't light up, never a word displayed wrong. */
function singularize(word) {
  if (/[^aeiou]ies$/.test(word)) return word.slice(0, -3) + "y";
  if (/(sses|shes|ches|xes|zes)$/.test(word)) return word.slice(0, -2);
  if (/[^su]s$/.test(word)) return word.slice(0, -1);
  return null;
}

export function pluralizeRung(word) {
  if (/[^aeiou]y$/.test(word)) return word.slice(0, -1) + "ies";
  if (/(s|x|z|ch|sh)$/.test(word)) return word + "es";
  return word + "s";
}

/** How a rung should read in the sentence: re-pluralized if the typed word was plural, then cased. */
export function renderRung(rung, original, plural) {
  return applyLadderCase(original, plural ? pluralizeRung(rung) : rung);
}

/* ── Marking up a sentence ────────────────────────────────────────────────────────────────────── */

/* The corpus is nouns of three letters or more (§3.2 step 1), so anything shorter or non-alphabetic
   can be rejected before a lookup. Returns the lemma to climb from, or null. */
function ladderTargetFor(token) {
  if (!DOWN) return null;
  if (!/^[A-Za-z]{3,}$/.test(token)) return null;
  const lower = token.toLowerCase();
  if (isLadderWord(lower)) return { word: lower, plural: false };
  const singular = singularize(lower);
  if (singular && singular.length >= 3 && isLadderWord(singular))
    return { word: singular, plural: true };
  return null;
}

/** True if any word in the sentence can climb. Same split + lookup as wrapLadders, so they agree. */
export const hasLadders = (sentence) => {
  if (!DOWN) return false;
  return sentence.split(/\b/).some((token) => ladderTargetFor(token) !== null);
};

/* One span shape serves both heroes (§2.2). data-ladder-word is the authoritative state — the rung
   currently shown — because sibling cycling means the path down is decided shot by shot rather than
   baked in at wrap time. data-ladder / data-rung still hold the chain running through that rung, but
   index.js recomputes them on every landing so they never go stale under a sideways step. */
export const wrapLadders = (sentence) => {
  if (!DOWN) return sentence;

  return sentence
    .split(/\b/)
    .map((token) => {
      const target = ladderTargetFor(token);
      if (!target) return token;
      const chain = ladderChainFor(target.word);
      const rung = chain.indexOf(target.word);
      return (
        `<span id="${LADDER_ID}" class="word-ladder"` +
        ` data-ladder="${chain.join(",")}" data-rung="${rung}"` +
        ` data-ladder-word="${target.word}" data-ladder-orig="${token}"` +
        (target.plural ? ` data-ladder-plural="1"` : "") +
        `>${token}</span>`
      );
    })
    .join("");
};
