/* ladderRace.js — Word Race, the traversal mode.
   docs/punctuators-ladder.md §12 (§12.1 what the data forces, §12.2 the engine, §12.3 the daily).

   The other ladder modes shift words inside a sentence. This one throws the sentence away: the
   player IS a word, and play is travelling the hierarchy — `poodle` ⟶ `salmon`, par 5. This module
   owns the TRAVERSAL (where you are, what a typed word means, how far you still have to go);
   index.js owns the field and the heroes, exactly as it does for free play.

   Three things about this file are load-bearing:

   1. NOTHING IS KEYED BY A PLAIN OBJECT. `constructor` and `prototype` are both real words in
      ladderPOJO.js, so `{}[word]` hands back a function and invents edges the corpus doesn't have.
      Map/Set throughout — the same warning ladderFunc.js and ladderMap.js carry.
   2. THE CORPUS IS BORROWED, NOT RE-PARSED. ladderFunc.js already lazy-loads ladderPOJO.js into
      Maps and hands out ladderParentOf / ladderChildrenOf, so this file imports those rather than
      building a second 30,545-entry copy. Only the ALT map (below) is ours.
   3. ladderAltPOJO.js IS ANSWER-CHECKING ONLY. It exists because a player's sense and the data's
      sense diverge — `oak` climbs to `wood`, so typing it at `tree` is rejected and the rejection
      is a lie (§12.2). It widens what we ACCEPT and must never widen what we ASSERT: the route you
      travel is always the main map's, so no ladder ever states a relation from a second sense.
*/

import {
  loadLadders,
  laddersReady,
  ladderParentOf,
  ladderChildrenOf,
  isLadderWord,
} from "./ladderFunc.js";

/* The two span ids the heroes answer to. Unlike free play — where both heroes share ONE id because
   they act on the same word (§4) — a race puts two different words on the field at once, and each
   hero must only be able to hit its own: General the parent floating above, Keen the word you
   summoned below. Giving them separate ids means the existing `id === (targetId ?? symbol)` gate in
   animate() does that separation for free, with no new collision code. */
export const RACE_UP_ID = "Ization Race Up";
export const RACE_DOWN_ID = "Keen Race Down";

/* How many rungs of alt edge an answer may take. ONE, deliberately: an alt edge is a jump between
   two of a word's senses, and chaining them ("an oak is a kind of wood, and wood is a kind of…")
   walks away from anything the player meant. One hop covers every case §12.2 catalogues. */
const ALT_HOPS = 1;

let ALT = null; // Map<child, string[]> — a word's other-sense parents, inverted from the shipped down-map
let ALT_PARENTS = null; // Set<word> — the same map's keys, i.e. every word something alt-descends from
let loadingAlt = null;

export function raceReady() {
  return laddersReady() && ALT !== null;
}

/** Load both corpora. Idempotent, and safe to call from several places at once. */
export function loadRace() {
  if (raceReady()) return Promise.resolve();
  loadingAlt =
    loadingAlt ||
    Promise.all([
      loadLadders(),
      import("./ladderAltPOJO.js").then(({ ladderAlt }) => {
        const alt = new Map();
        const parents = new Set();
        for (const parent of Object.keys(ladderAlt)) {
          parents.add(parent);
          for (const kid of ladderAlt[parent].split(" ")) {
            const list = alt.get(kid);
            if (list) list.push(parent);
            else alt.set(kid, [parent]);
          }
        }
        ALT = alt;
        ALT_PARENTS = parents;
      }),
    ]).then(() => undefined);
  return loadingAlt;
}

/* ── Walking the tree ─────────────────────────────────────────────────────────────────────────── */

/** Every rung above `word`, nearest first: dog → [mammal, animal]. Never includes `word`. */
export function ancestorsOf(word) {
  const out = [];
  let w = word;
  // The build caps chains at 6 rungs; the guard is only here so a bad rebuild can't hang the page.
  for (let i = 0; i < 12; i++) {
    const p = ladderParentOf(w);
    if (!p) break;
    out.push(p);
    w = p;
  }
  return out;
}

/** The top of `word`'s tree — the forest is 1,002 disjoint trees, so this is its identity (§12.1). */
export function rootOf(word) {
  const anc = ancestorsOf(word);
  return anc.length ? anc[anc.length - 1] : word;
}

/** Rungs from the root down to `word`. A root is 0. */
export function depthOf(word) {
  return ancestorsOf(word).length;
}

/** True if both words live in the same tree — `tulip → oak` does not, and has no route at all. */
export function sameTree(a, b) {
  return rootOf(a) === rootOf(b);
}

/** The deepest word that is an ancestor of (or equal to) both, or null across trees. */
export function lowestCommonAncestor(a, b) {
  if (a === b) return a;
  const up = new Set([a, ...ancestorsOf(a)]);
  if (up.has(b)) return b;
  for (const w of ancestorsOf(b)) if (up.has(w)) return w;
  return null;
}

/** The single-rung path length between two words, through their LCA — the race's par (§12.3).
 *  Infinity across trees, which is what pair selection must never hand the player. */
export function parFor(a, b) {
  const lca = lowestCommonAncestor(a, b);
  if (!lca) return Infinity;
  return depthOf(a) - depthOf(lca) + (depthOf(b) - depthOf(lca));
}

/* ── What a typed word means ──────────────────────────────────────────────────────────────────── */

/** `word`'s other-sense parents (`oak` → [tree]), or an empty array. Never mutate the result. */
export function altParentsOf(word) {
  return (ALT && ALT.get(word)) || [];
}

/** Is `word` a descendant of `of` through the MAIN map alone? Returns the rung count, or 0. */
function mainDescent(word, of) {
  const anc = ancestorsOf(word);
  const i = anc.indexOf(of);
  return i === -1 ? 0 : i + 1;
}

/**
 * Is `word` a kind of `of`, and how many rungs down is it?
 * Returns {rungs, via} — via is "main" or "alt" — or null when it isn't one at all.
 *
 * This reports the TRUE relation, not what the race accepts. A deep descendant still answers with
 * its real rung count, because that count is what the "too deep" rejection tells the player
 * (classifyGuess, GUESS.DEEPER) — the race itself only ever travels one rung at a time (§12.2).
 */
export function descentFrom(word, of) {
  if (word === of) return null;
  const direct = mainDescent(word, of);
  if (direct) return { rungs: direct, via: "main" };

  // One alt hop, then the main map again (see ALT_HOPS). The rung count is the MAIN-map distance
  // from the alt parent, plus the hop itself, so a jump still scores as the travel it is.
  if (ALT_HOPS) {
    for (const p of altParentsOf(word)) {
      if (p === of) return { rungs: 1, via: "alt" };
      const d = mainDescent(p, of);
      if (d) return { rungs: d + 1, via: "alt" };
    }
  }
  return null;
}

/**
 * Is there anything at all below `word` — i.e. can the player descend from here?
 *
 * Asked BEFORE the player types, because Keen's shot on the word you're standing on is what opens
 * the move box (§12.8 Note 2) and offering a box on a word with nothing under it would be asking
 * for an answer that cannot exist. The alt map has to be consulted too, not just the main one: a
 * word can be a main-map leaf and still have alt children (`tree`'s only route to `oak` is an alt
 * edge), so `ladderChildrenOf` alone would clank on a word the player could in fact descend from.
 * ALT is keyed child → parents, hence the parents-only Set built alongside it.
 */
export function canDescend(word) {
  const kids = ladderChildrenOf(word);
  if (kids && kids.length) return true;
  return !!(ALT_PARENTS && ALT_PARENTS.has(word));
}

/* The kinds of "no", and they must sound different (§12.2). Lumping them together is what makes a
   typing game feel broken — and UNKNOWN is not the player's fault at all, so it must never read as
   "you were wrong": five of the thirty guesses probed were simply absent from the data. DEEPER is
   the same shape of not-your-fault: the word IS a kind of where you stand, just further down than
   one step, so the message has to concede that before it refuses. */
export const GUESS = {
  OK: "ok", // the rung immediately below you — travel
  DEEPER: "deeper", // a true descendant, but more than one rung down (§12.2, no skipping)
  BROADER: "broader", // an ancestor: right word, wrong hero
  UNRELATED: "unrelated", // in the book, but not a kind of where you stand
  UNKNOWN: "unknown", // not in the book at all — apologise, charge nothing
  SAME: "same", // you are already standing on it
};

/**
 * Classify a typed word against the word the player currently occupies.
 * Returns {kind, word, rungs, via} — `rungs` and `via` only on GUESS.OK and GUESS.DEEPER.
 *
 * ONE RUNG AT A TIME (§12.2). At `animal` you may type `fish`, not `salmon` — naming the deeper
 * word skips the rung that is the whole lesson (that salmon is a fish before it is an animal), so
 * a true-but-deep descendant is its own rejection rather than a two-rung shortcut. It reverses M9's
 * descendant-jump rule, which accepted any descendant and travelled every rung it crossed.
 */
export function classifyGuess(typed, current) {
  const word = String(typed || "")
    .trim()
    .toLowerCase();
  if (!word) return { kind: GUESS.UNKNOWN, word };
  if (!isLadderWord(word)) return { kind: GUESS.UNKNOWN, word };
  if (word === current) return { kind: GUESS.SAME, word };

  const down = descentFrom(word, current);
  if (down)
    return {
      kind: down.rungs === 1 ? GUESS.OK : GUESS.DEEPER,
      word,
      rungs: down.rungs,
      via: down.via,
    };

  // Ancestor: the player named a real rung but reached for the wrong hero. Worth its own message,
  // because saying so teaches the mechanic rather than just refusing.
  if (ancestorsOf(current).includes(word)) return { kind: GUESS.BROADER, word };
  return { kind: GUESS.UNRELATED, word };
}

/* ── Easy mode: the decoy field (§12.2) ───────────────────────────────────────────────────────── */

/* Instead of typing, a field of words floats below you — some true children, some decoys pulled
   from a sibling branch. Same engine, menu instead of recall: the version that works for a young
   player, and the one that keeps the mode playable if typing coverage disappoints.

   Decoys come from a SIBLING branch rather than at random because a random word is obviously wrong
   — `mackerel` under `dog` is a real choice to make, `democracy` is not. */
export function decoysFor(word, size = 8) {
  const kids = ladderChildrenOf(word);
  if (!kids || !kids.length) return null;

  const trueKids = kids.slice(0, Math.max(1, Math.ceil(size / 2)));
  const taken = new Set(trueKids);
  const decoys = [];

  const parent = ladderParentOf(word);
  const siblings = (parent ? ladderChildrenOf(parent) || [] : []).filter((s) => s !== word);
  for (const sib of siblings) {
    if (decoys.length >= size - trueKids.length) break;
    for (const cand of ladderChildrenOf(sib) || []) {
      if (decoys.length >= size - trueKids.length) break;
      if (taken.has(cand)) continue;
      taken.add(cand);
      decoys.push(cand);
    }
  }

  const items = [
    ...trueKids.map((w) => ({ word: w, real: true })),
    ...decoys.map((w) => ({ word: w, real: false })),
  ];
  // Deterministic interleave rather than a shuffle: the real ones must not all sit at one end, and
  // a race is replayed from a frozen pair (§12.3), so the field should look the same each time.
  items.sort((a, b) => (a.word < b.word ? -1 : a.word > b.word ? 1 : 0));
  return items;
}

/* ── The field ────────────────────────────────────────────────────────────────────────────────── */

/* Three spans, built ONCE and then rewritten in place — never re-rendered.
 *
 * That is not a style choice. nodeArr is filled by the MutationObserver in waitForElement, which
 * disconnects as soon as the sentence appears, so any span created afterwards is invisible to
 * collision — the shelf fan has to push its children in by hand and splice them out again, and a
 * detached node's all-zero getBoundingClientRect() eats shots near the left edge if you forget.
 * A race field is a fixed three words, so it can sidestep that entirely: render once through the
 * normal path, then only ever touch textContent and dataset. No pushes, no splices, no phantoms.
 *
 * THE THREE SPANS MUST BE SIBLINGS AT THE TOP LEVEL — no wrapper element, however tempting one is
 * for layout. A MutationRecord's addedNodes lists only the nodes inserted DIRECTLY into the
 * observed parent; descendants of an added node never get their own record. Wrap these in a
 * container and nodeArr receives the container alone, so the two shootable words are invisible to
 * collision and heroToTheRescue builds an EMPTY TEAM — the same silent white-screen failure mode
 * that the `#output span` and `mutations[0]` footguns produce (docs/punctuators-ladder.md, the
 * shared-engine footguns). The column layout lives on #output.race-mode instead.
 *
 * General's id never moves: the rung above is his target and nothing else. KEEN'S id MOVES between
 * the middle span and the bottom one, because his shot means two things in sequence (§12.8 Note 2)
 * — with nothing summoned he shoots the word you are STANDING on, which opens the move box and asks
 * for a kind; once you have named one he shoots that instead, and travelling there is the move. The
 * bottom span therefore starts empty, id-less and `hidden`, and only exists on screen while it
 * holds a summoned word. index.js owns the swap (updateRaceField).
 *
 * The id has to be on a span from the FIRST render even so, or heroToTheRescue — which builds the
 * team once, from the ids present — leaves Keen Arrow out of the race entirely. That is why it
 * starts on the middle word rather than on the hidden slot.
 *
 * Two ids, not one shared between the heroes as free play does (§4), because a race puts two
 * different words on the field at once and animate()'s existing `id === (targetId ?? symbol)` gate
 * then keeps each hero to its own with no new collision code.
 */
export function raceFieldHTML(race) {
  const up = race.up();
  return (
    `<span id="${RACE_UP_ID}" class="race-word race-up${up ? "" : " race-none"}"` +
    ` data-race-word="${up || ""}">${up || "— the top —"}</span>` +
    `<span id="${RACE_DOWN_ID}" class="race-word race-here" data-race-word="${race.at}">${race.at}</span>` +
    `<span class="race-word race-down" data-race-word="" hidden></span>`
  );
}

/* ── The run ──────────────────────────────────────────────────────────────────────────────────── */

/**
 * One race in progress. Deliberately plain state plus methods — index.js drives it, and everything
 * it needs to draw (where you are, how far is left, what just happened) is readable off it.
 *
 * No fail state and no clock (§12.3). Moves are the score; a DETOUR — a move that doesn't reduce
 * the distance to the target — is the share stat, exactly as a wasted shot is in §11.6.
 */
export function createRace({ start, target }) {
  if (!sameTree(start, target)) {
    throw new Error(`ladderRace: ${start} and ${target} are in different trees — no route exists`);
  }
  return {
    start,
    target,
    at: start,
    par: parFor(start, target),
    moves: 0,
    detours: 0,
    history: [start],
    solved: false,

    /** Rungs still to travel, by the best route from where you stand. */
    distance() {
      return parFor(this.at, this.target);
    },

    /** The parent of the current word — General's target, and null at a root. */
    up() {
      return ladderParentOf(this.at);
    },

    /** Move to `word`, which the caller has already validated. Returns {detour, solved}. */
    travelTo(word) {
      const before = this.distance();
      this.at = word;
      this.moves++;
      this.history.push(word);
      const detour = this.distance() >= before;
      if (detour) this.detours++;
      this.solved = this.at === this.target;
      return { detour, solved: this.solved };
    },

    /* Hints, late and taxonomic (§12.3). Both are real information about the hierarchy, so the
       hint teaches rather than just rescuing. */
    hint() {
      if (this.detours >= 6) {
        const lca = lowestCommonAncestor(this.at, this.target);
        if (lca) return `you and it meet at ${lca.toUpperCase()}`;
      }
      if (this.detours >= 3) return `you're heading for something in ${rootOf(this.target).toUpperCase()}`;
      return null;
    },

    /** The route the player could have taken, for the give-up reveal and §12's M11 map overlay. */
    bestRoute() {
      const lca = lowestCommonAncestor(this.start, this.target);
      if (!lca) return [];
      const upLeg = [this.start, ...ancestorsOf(this.start)];
      const downLeg = [this.target, ...ancestorsOf(this.target)];
      const up = upLeg.slice(0, upLeg.indexOf(lca) + 1);
      const down = downLeg.slice(0, downLeg.indexOf(lca)).reverse();
      return [...up, ...down];
    },
  };
}
