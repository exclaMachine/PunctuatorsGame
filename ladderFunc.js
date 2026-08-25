/* ladderFunc.js — General Ization & Keen Arrow, the "is a kind of" ladder.
   docs/punctuators-ladder.md §§2–4 (the mode, the span, the data) and §2.5 (the shelf fan).

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

/* ── The shelf (§2.5) ─────────────────────────────────────────────────────────────────────────── */

/* Fill `out` from `pool` up to `target` words, unvisited first and then visited, both in the shipped
   familiarity order. `out` is never longer than SHELF_FAN_MAX, so the includes() scan beats a Set. */
function fillUnvisitedFirst(out, pool, target, seen) {
  for (const w of pool) {
    if (out.length >= target) return;
    if (!seen(w)) out.push(w);
  }
  for (const w of pool) {
    if (out.length >= target) return;
    if (!out.includes(w)) out.push(w);
  }
}

/**
 * The row of narrower kinds to fan out beneath `word`, or null at a leaf — which is a clank.
 *   width — how many slots fit on screen; index.js measures it per draw
 *   seen  — (w) => has the player landed on w before? (ladderMapHas — passed in rather than imported
 *           so this file stays independent of the map)
 *   pin   — a child that MUST appear in the row, or null. Free play never pins; Restore the Phrase
 *           (§11) always pins the next rung toward the goal, because a puzzle whose answer the fan
 *           cannot show is unsolvable — `food` has 239 children and `eggs` sits at index 164, and 77
 *           of the 108 puzzles' narrowing steps pass through a shelf wider than the row.
 * Returns { items: [{word, branch}], hidden, total }.
 *
 * Children only, never siblings: Keen Arrow goes down or nowhere (§2.3). A row of siblings would
 * make one hero's one action mean two different things — narrow, or shuffle along the shelf you are
 * already on — and the two are indistinguishable once drawn. The sideways move still exists, it just
 * costs the honest route: broaden to the parent with General, then narrow again, where the parent's
 * own row IS the sibling list. §13.7 is unaffected, because shelves fill from the parent's row.
 *
 * Why the tiers (all measured on the built corpus): the median shelf holds 2 children and 80% hold
 * ≤6, so most shelves simply fit. The words people actually type are the tail — dog 33, tree 107,
 * fish 221, person 805 — and the cut that tames it is that only 13% of children are themselves
 * parents (dog 33→8, fish 221→8). That cut cannot stand alone, though: 69.8% of parents have NO
 * branch-children at all, and neither do 134 of the 719 shelves wider than 8. So branches lead, buds
 * top up, and the rest is fogged by count rather than named (§13.5).
 */
export function shelfFor(word, width, seen = () => false, pin = null) {
  if (!DOWN) return null;

  const list = DOWN.get(word);
  if (!list || !list.length) return null; // a leaf: nothing narrower, and no sidestep on offer

  const total = list.length;
  let items = [];
  if (total <= width) {
    items.push(...list);
  } else {
    const branches = list.filter((w) => DOWN.has(w));
    const buds = list.filter((w) => !DOWN.has(w));
    // The last slot is always a bud when the shelf has any. Without that reservation the 25 buds
    // under `dog` are unreachable no matter how often you play, and §13.7's whole reason for
    // existing — that replaying fills a wide shelf — breaks again.
    fillUnvisitedFirst(items, branches, buds.length ? width - 1 : width, seen);
    fillUnvisitedFirst(items, buds, width, seen);
  }

  // The pin displaces the row's last word rather than extending it — the width is what fits on
  // screen, not a preference. Then the row is re-sorted into the corpus's own order, so the pinned
  // word doesn't sit in a tell-tale slot: a puzzle whose answer is always last would be no puzzle.
  if (pin && list.includes(pin) && !items.includes(pin)) {
    if (items.length >= width) items.pop();
    items.push(pin);
    items = list.filter((w) => items.includes(w));
  }

  return {
    items: items.map((w) => ({ word: w, branch: DOWN.has(w) })),
    hidden: total - items.length,
    total,
  };
}

/* ── Shelf progress and its milestones (§13.6) ────────────────────────────────────────────────── */

/* A shelf is a parent's own list of narrower kinds, and its progress is lit/total — DERIVED at the
   moment it is asked for, never stored. The map's visited set is the only state either side of this
   file keeps, which is what makes a corpus rebuild safe: a shelf that gains a child simply gets
   longer, and nothing has to be migrated.
 *
 * Milestones are keyed off the FRACTION rather than a count, for §13.3's reason: shelves run from 1
 * child to 805, so any fixed count is either unreachable on most of the map or instant on the rest. */
export const SHELF_MILESTONES = [
  { f: 0.25, tier: 1, label: "a quarter of them" },
  { f: 0.5, tier: 2, label: "half of them" },
  { f: 1, tier: 3, label: "every kind" },
];

/* A milestone that one shot can reach is not a milestone, and without a floor a third of the map
   would fire "every kind" on a single arrow: MEASURED on the built corpus, 1,623 of the 4,837
   shelves (33.6%) hold exactly one child, and 3,421 (70.7%) hold four or fewer. Requiring that the
   FIRST lit child not already cross 25% — 1/total < 0.25 — puts the floor at five, which leaves
   1,416 shelves able to announce. The rest still count, still turn gold on the map, and simply
   don't interrupt play to say so. */
export const SHELF_MILESTONE_MIN = 5;

/** {lit, total} for a word's shelf, or null if it has no kinds. `seen` is the map's ladderMapHas,
 *  passed in rather than imported so this file stays independent of the map (as shelfFor does). */
export function shelfProgress(word, seen) {
  const list = DOWN && DOWN.get(word);
  if (!list || !list.length) return null;
  let lit = 0;
  for (const w of list) if (seen(w)) lit++;
  return { lit, total: list.length };
}

/** The milestone a shelf's `lit`-th child just crossed, or null. Highest first, because on a narrow
 *  shelf one arrival can cross two at once — on a 5-shelf the 5th child crosses both 50% and 100%,
 *  and the honest thing to announce is that it is finished. */
export function shelfMilestoneCrossed(lit, total) {
  if (!total || total < SHELF_MILESTONE_MIN || lit < 1) return null;
  const now = lit / total;
  const before = (lit - 1) / total;
  for (let i = SHELF_MILESTONES.length - 1; i >= 0; i--) {
    const m = SHELF_MILESTONES[i];
    if (now >= m.f && before < m.f) return m;
  }
  return null;
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
   currently shown — because the player picks the path out of the shelf fan (§2.5), so the way down is
   decided shot by shot rather than baked in at wrap time. data-ladder / data-rung still hold the
   chain running through that rung, but index.js recomputes them on every landing so they never go
   stale once a descent takes anything but the first child. */
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
