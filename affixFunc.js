/* affixFunc.js — the sentence side of Affix Aliens.
   docs/punctuators-affixes.md §5 (the span) and §5.1 (the marker).

   affixData.js owns the tables and the swap; this file owns which words in a typed sentence are
   targets and what their markup looks like — both at wrap time (affixSpanHTML) and after a shot has
   changed a word (updateAffixSpan). index.js owns the hero side: who shot it, and what it costs.

   THE SPAN SHAPE IS THE DESIGN DECISION. Every affixed word gets the SAME id, and all four heroes
   set targetId = "affix" — the ladder's §4 mechanism (Hero.targetId, which defaults to symbol so
   the other 23 heroes are untouched) used as intended. Separate ids per word-shape would mean
   giving Hero a set of ids instead of one string, for no gain: with one id, heroToTheRescue fields
   all four heroes whenever any affixed word exists, and a hero with nothing to do on a particular
   word simply clanks — which is informative rather than annoying, since the clank IS the lesson
   that `hopeful` has no prefix.

   THE INNER MARKERS ARE <i>, NEVER <span>. A nested or wrapping <span> inside #output is the third
   member of the engine's footgun family: waitForElement() waits on `#output span`, and nodeArr is
   filled from the observer's addedNodes, which lists only directly-inserted nodes — so a nested
   span becomes a phantom target and a wrapping one empties the team. Non-span elements inside a
   target span are already proven safe (the ladder puts .ladder-face / .ladder-ghost inside one).
*/

import { detect } from "./affixData.js";
import { applyLadderCase } from "./ladderFunc.js";

/* The span id all four heroes answer to (§5). One id, four heroes. */
export const AFFIX_ID = "affix";

/* Affixes differ in length from the ones they replace, so case is copied by SHAPE — ALL CAPS stays
   all caps, Leading cap stays leading — not position by position like Betar's matchCase. The ladder
   hit this first and solved it; this is the same rule, borrowed rather than rewritten. */
export const applyAffixCase = applyLadderCase;

/** True if any word in the sentence carries an affix. Same tokenizer and lookup as wrapAffixes, so
 *  the two can never disagree. Measured (§2): half of all common words are targets, so this guard
 *  essentially never fires — it exists because every other wordplay mode has one. */
export const hasAffixes = (sentence) =>
  sentence.split(/\b/).some((token) => detect(token) !== null);

/* The inner markup of an affixed word — the two <i> markers with the stem between them.

   The detected affix is lowercase (the tables are), but the DISPLAY is sliced out of the original
   token, so `Unhappy` keeps its capital and only the data attributes are normalised. Shared by
   affixSpanHTML (which builds the span from scratch at wrap time) and updateAffixSpan (which
   rewrites one in place after a shot), so the two can never draw the same word differently. */
const affixInnerHTML = (token, d) => {
  const preText = d.pre ? token.slice(0, d.pre.length) : "";
  const sufText = d.suf ? token.slice(token.length - d.suf.length) : "";
  const stemText = token.slice(preText.length, token.length - sufText.length);

  return (
    (preText ? `<i class="afx afx-pre">${preText}</i>` : "") +
    stemText +
    (sufText ? `<i class="afx afx-suf">${sufText}</i>` : "")
  );
};

/** The markup for one affixed word, or the token unchanged if it isn't one. A function of a bare
 *  token and nothing else — which is what lets a shot rebuild the span by calling updateAffixSpan
 *  with the new spelling. */
export const affixSpanHTML = (token) => {
  const d = detect(token);
  if (!d) return token;

  return (
    `<span id="${AFFIX_ID}" class="affix-word"` +
    ` data-word="${d.word}" data-stem="${d.stem}"` +
    (d.pre ? ` data-pre="${d.pre}" data-pre-group="${d.preGroup}"` : "") +
    (d.suf ? ` data-suf="${d.suf}" data-suf-group="${d.sufGroup}"` : "") +
    `>` +
    affixInnerHTML(token, d) +
    `</span>`
  );
};

/**
 * Rewrite an existing span in place to `token`, the word a shot just produced (§6.6).
 *
 * The span KEEPS ITS ID — a swapped word is still a target, and `unhappy -> nonhappy -> imhappy` is
 * the intended play — so this is a redraw, never a lock. The data attributes are recomputed rather
 * than patched, because the new spelling can carry a different affix at the other end, or none at
 * all: `unhappy -> happy` leaves a word with nothing on either end, whose span stays on the field
 * and clanks for both characters. That is the honest outcome, not a bug.
 */
export const updateAffixSpan = (span, token) => {
  const d = detect(token);

  span.setAttribute("data-word", token.toLowerCase());
  for (const attr of ["data-stem", "data-pre", "data-pre-group", "data-suf", "data-suf-group"])
    span.removeAttribute(attr);

  if (!d) {
    span.textContent = token;
    return;
  }

  span.setAttribute("data-stem", d.stem);
  if (d.pre) {
    span.setAttribute("data-pre", d.pre);
    span.setAttribute("data-pre-group", d.preGroup);
  }
  if (d.suf) {
    span.setAttribute("data-suf", d.suf);
    span.setAttribute("data-suf-group", d.sufGroup);
  }
  span.innerHTML = affixInnerHTML(token, d);
};

/* Mark every affixed word in the sentence. No dictionary and no gating: the mode is fully loose
   (§1.1), so `uncle` is a target and `noncle` is the answer. */
export const wrapAffixes = (sentence) =>
  sentence
    .split(/\b/)
    .map((token) => affixSpanHTML(token))
    .join("");
