/* ladderPhrase.js — Restore the Phrase, the puzzle mode.
   docs/punctuators-ladder.md §11 (§11.3 the corpus, §11.5 what the build guarantees, §11.6 the rules).

   Free play (§§2–4) lets you climb any word with no goal. This mode gives the ladder a WIN STATE:
   a well-known saying arrives with some of its words already shifted along the ladder — *A canine is
   a person's best friend* — and shooting them back is the puzzle. It is Punctuators' first wordplay
   mode with a right answer.

   This file owns the PUZZLE side: loading the authored corpus, marking up a phrase, and keeping the
   run's score. index.js owns the heroes and the field, exactly as it does for free play — and the
   spans this file writes ARE free-play ladder spans, so climbLadder, the shelf fan and both landing
   animations drive them unchanged. The only additions are a goal and a lock.

   Three things here are load-bearing:

   1. NOTHING IS KEYED BY A PLAIN OBJECT. `constructor` and `prototype` are both real words in
      ladderPOJO.js, so `{}[word]` hands back a function and invents edges the corpus doesn't have.
      The same warning ladderFunc.js, ladderMap.js and ladderRace.js carry.
   2. THE CORPUS IS BORROWED. ladderFunc.js already lazy-loads ladderPOJO.js and hands out
      ladderParentOf / ladderChildrenOf; phrasePOJO.js (24 KB) rides along beside it and is fetched
      only when this mode starts. `build-ladders.py --phrases` builds the puzzles by reading the
      shipped ladderPOJO.js, so every chain edge here is an edge the game already has — VERIFIED on
      the shipped pair: 0 chain words missing from the corpus, 0 chain edges the corpus doesn't hold.
   3. THE AUTHORED CHAIN IS A SCORE-KEEPER, NOT A RAIL. §11.6 assumed a hit walks the authored chain
      by ±1, which was written before §2.5's shelf fan shipped. With the fan, Keen Arrow shows the
      word's REAL children and the player may pick one that leaves the chain — so distance to the
      goal is measured on the live hierarchy (rungsBetween), and General broadening back up is the
      way home. A wander is a wasted move, never a dead end.
*/

import {
  LADDER_ID,
  loadLadders,
  laddersReady,
  ladderChainFor,
  pluralizeRung,
} from "./ladderFunc.js";
// Tree arithmetic over the MAIN corpus only — no alt data is involved, and importing these does not
// fetch ladderAltPOJO.js (loadRace does, and this mode never calls it).
import { ancestorsOf, parFor } from "./ladderRace.js";

let PHRASES = null;
let loading = null;

export function phrasesReady() {
  return laddersReady() && PHRASES !== null;
}

/** Load the ladder corpus and the puzzles. Idempotent, and safe to call concurrently. */
export function loadPhrases() {
  if (phrasesReady()) return Promise.resolve();
  loading =
    loading ||
    Promise.all([
      loadLadders(),
      import("./phrasePOJO.js").then(({ ladderPhrases }) => {
        PHRASES = ladderPhrases;
      }),
    ]).then(() => undefined);
  return loading;
}

export function phraseCount() {
  return PHRASES ? PHRASES.length : 0;
}

/** One puzzle, by index or — M6's practice pick (§11.9) — at random. Null before the corpus lands.
 *  The daily's positional `dayIndex % N` selection is M7; passing an index here is what it will use. */
export function pickPhrase(index) {
  if (!PHRASES || !PHRASES.length) return null;
  if (!Number.isInteger(index)) return PHRASES[Math.floor(Math.random() * PHRASES.length)];
  return PHRASES[((index % PHRASES.length) + PHRASES.length) % PHRASES.length];
}

/* ── Walking toward the goal ──────────────────────────────────────────────────────────────────── */

/** Rungs between two words on the live hierarchy, through their LCA. Infinity across trees, which a
 *  puzzle can't produce: every chain the build emits lives in one tree. */
export function rungsBetween(a, b) {
  return parFor(a, b);
}

/**
 * The one child of `from` that leads to `goal`, or null when the goal is not below you.
 *
 * This is what keeps the fan honest in a puzzle. A shelf can be far wider than the row — `food` has
 * 239 children and `eggs` sits at index 164 — so an unpinned fan would simply never offer the answer
 * and the puzzle would be unsolvable by narrowing. MEASURED on the shipped pair: 77 of the narrowing
 * steps in the 108 puzzles descend through a shelf wider than a 7-slot fan. index.js passes this to
 * shelfFor as its `pin`, which is why the pin exists at all.
 */
export function nextRungToward(from, goal) {
  if (!from || !goal || from === goal) return null;
  const path = [goal, ...ancestorsOf(goal)];
  const i = path.indexOf(from);
  return i > 0 ? path[i - 1] : null;
}

/* ── Surfaces ─────────────────────────────────────────────────────────────────────────────────── */

/* A chain holds lemmas; the sentence holds words. `plu` and `cap` are the build's record of what the
   saying does to this one (§11.5), and they travel with the word as it moves — *Too many chefs* is
   plural at every rung, *Birds of a feather* capitalised at every rung. */
export function phraseSurface(fix, rung) {
  const w = fix.plu ? pluralizeRung(rung) : rung;
  return fix.cap ? w[0].toUpperCase() + w.slice(1) : w;
}

/* Punctuation and possessives ride along inside the token (§11.5) — `{man}'s` is shown as `guy's` —
   and they must stay OUTSIDE the span, because the span is the projectile's hit rectangle and the
   thing the swap animations rebuild. Split the token around the word and leave the rest as text. */
function affixesFor(token, fix) {
  const shown = phraseSurface(fix, fix.chain[fix.at]);
  const at = token.toLowerCase().indexOf(shown.toLowerCase());
  // Unreachable while the build's "the token really holds the shifted word" check passes (§11.5);
  // if a hand-edited phrasePOJO.js ever broke it, the word simply keeps its whole token.
  if (at === -1) return { pre: "", post: "" };
  return { pre: token.slice(0, at), post: token.slice(at + shown.length) };
}

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Mark up a puzzle for #output.
 *
 * The shiftable words become ORDINARY free-play ladder spans — same id, same data-ladder-word, same
 * data-ladder-orig/plural — so index.js's climbLadder, shelf fan and landing animations drive them
 * with no puzzle-specific branch. Two attributes are added: data-phrase-slot (which fix this is) and
 * data-phrase-goal (the word it belongs at). Everything else in the phrase is plain text.
 *
 * The spans are TOP-LEVEL children of #output, never inside a wrapper. A MutationRecord's addedNodes
 * lists only directly inserted nodes — never their descendants — so a wrapper would leave nodeArr
 * holding the wrapper alone, the team would come back empty, and every mode would white-screen
 * (docs/punctuators-ladder.md §12.2, the third of that family of footguns).
 */
export function wrapPhrase(entry) {
  const fixes = new Map(entry.fix.map((f, n) => [f.i, { ...f, n }]));
  return entry.show
    .split(" ")
    .map((token, i) => {
      const f = fixes.get(i);
      if (!f) return esc(token);
      const word = f.chain[f.at];
      const shown = phraseSurface(f, word);
      const { pre, post } = affixesFor(token, f);
      // The chain through this rung is read off the LIVE corpus, not off f.chain: once the fan can
      // take the word off the authored path, the authored chain stops describing where it stands.
      const chain = ladderChainFor(word);
      return (
        esc(pre) +
        `<span id="${LADDER_ID}" class="word-ladder phrase-word"` +
        ` data-ladder="${chain.join(",")}" data-rung="${chain.indexOf(word)}"` +
        ` data-ladder-word="${word}" data-ladder-orig="${shown}"` +
        (f.plu ? ` data-ladder-plural="1"` : "") +
        ` data-phrase-slot="${f.n}" data-phrase-goal="${f.chain[f.goal]}"` +
        `>${esc(shown)}</span>` +
        esc(post)
      );
    })
    .join(" ");
}

/* ── The run ──────────────────────────────────────────────────────────────────────────────────── */

/**
 * One puzzle in progress. Plain state plus one method, as createRace is: index.js drives it and
 * everything it needs to draw is readable off it.
 *
 * No fail state (§11.2). The score is WASTED MOVES — §11.6 counts wasted *shots*, but the shelf fan
 * makes a descent two shots (open the row, then pick from it) and §12.8 already settled that the
 * extra shot is free: moves are the score, not shots. A move that doesn't close the distance to the
 * goal is the wasted one, which is the same skill signal either way.
 */
export function createPuzzle(entry) {
  const slots = entry.fix.map((f) => ({
    start: f.chain[f.at],
    at: f.chain[f.at],
    goal: f.chain[f.goal],
    dist: rungsBetween(f.chain[f.at], f.chain[f.goal]),
    locked: false,
  }));

  return {
    entry,
    slots,
    moves: 0,
    wasted: 0,

    get locked() {
      return slots.filter((s) => s.locked).length;
    },
    get solved() {
      return slots.every((s) => s.locked);
    },

    /** Record a landing on slot `n`. Returns {wasted, locked}, or null for a slot already done. */
    landOn(n, word) {
      const s = slots[n];
      if (!s || s.locked) return null;
      const before = s.dist;
      s.at = word;
      s.dist = rungsBetween(word, s.goal);
      this.moves++;
      const wasted = s.dist >= before;
      if (wasted) this.wasted++;
      if (s.dist === 0) s.locked = true;
      return { wasted, locked: s.locked };
    },
  };
}
