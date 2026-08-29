/* affixData.js — The Grand Prefixer & Sufferix, the tables and the swap.
   docs/punctuators-affixes.md §3 (the data) and §6 (the rules on a hit).

   M1: pure data + pure functions. No wordlist, no build step, no DOM, no imports. affixFunc.js owns
   the sentence side (which words are marked, what the span looks like); index.js will own the hero
   side (who shot it, what it looks like when it changes).

   Two things about this file are load-bearing:

   1. THE MODE IS FULLY LOOSE (§1.1, dev's call 2026-08-29). Detection is startsWith/endsWith and
      nothing checks that the stem is a real word — measured, only 43% of prefix-shaped words have
      one. `uncle -> noncle`, `intone -> atone`, `income -> outcome`: the misfires ARE the mode, an
      alien over-applying a rule it half-understands. That is why there is no affixPOJO.js — the
      relation is computable at runtime, unlike the ladder's or the ambigrams'. The real-word layer
      is M5 and deliberately deferred.
   2. EVERY AFFIX BELONGS TO EXACTLY ONE GROUP (§3.4). `in-` is NOT in *inactive* and INTO in
      *inhale*; loose means there is nothing to disambiguate with, so the table picks the commoner
      sense and `inhale -> unhale` is a wrong answer that is also a joke. Adding a string to a
      second group would make longest-first matching pick by table order instead of by meaning —
      assertAffixTables() below refuses to let that happen quietly.
*/

/* Groups hold affixes that are EQUAL — interchangeable in meaning. Groups are PAIRED for opposite.
   Order inside a group is the cycling order a repeated shot walks (§3.5), so the most legible
   member goes first: shooting `unhappy` three times gives nonhappy -> imhappy -> dishappy. */
export const PREFIX_GROUPS = {
  // il-/ir-/im- are assimilated forms that only ever attach before l/r/m, so they go last: they
  // read as noise on any other stem, and the head of the list is what a first shot shows.
  NOT: ["un", "non", "dis", "in", "a", "an", "im", "il", "ir"],
  BEFORE: ["pre", "ante", "fore", "pro"],
  AFTER: ["post"],
  AGAIN: ["re"],
  UNDO: ["de"],
  AGAINST: ["anti", "contra", "counter", "ob"],
  WITH: ["co", "com", "con", "syn", "sym"],
  ACROSS: ["trans", "dia", "per"],
  AROUND: ["circum", "peri"],
  BEYOND: ["super", "hyper", "supra", "over", "ultra"],
  BELOW: ["sub", "hypo", "under", "infra"],
  OUT: ["ex", "exo", "out", "e"],
  INTO: ["intra", "endo", "en", "em"],
  HALF: ["semi", "hemi", "demi"],
  MANY: ["multi", "poly"],
  ONE: ["mono", "uni"],
  TWO: ["bi", "di", "duo", "twi"],
  SMALL: ["micro", "mini"],
  LARGE: ["macro", "mega", "maxi", "grand"],
  SELF: ["auto", "self"],
  BAD: ["mal", "mis", "dys", "caco"],
  GOOD: ["bene", "eu"],
  ALL: ["omni", "pan"],
};

export const SUFFIX_GROUPS = {
  AGENT: ["er", "ist", "or", "ian", "eer", "ster", "ant", "ent", "ard"],
  PATIENT: ["ee"],
  QUALITY: ["ness", "ity", "hood", "ship", "dom", "tude", "cy", "ance", "ence", "ism"],
  FULL_OF: ["ful", "ous", "ose", "some", "ive"],
  WITHOUT: ["less", "free"],
  ABLE: ["able", "ible", "ile"],
  MAKE: ["ize", "ify", "en", "ate"],
  LIKE: ["ish", "like", "esque", "oid", "ly"],
  SMALL: ["let", "ette", "ling", "kin", "cule"],
  PLACE: ["ery", "arium", "orium", "ary"],
  STUDY: ["ology", "ics", "graphy"],
  LOVER: ["phile", "philia"],
  HATER: ["phobe", "phobia"],
};

/* Opposites are declared one way and mirrored below, so a pair can never disagree with itself.
   AGAIN <-> UNDO is `re-` <-> `de-` rather than "strip the re-" (dev's call, 2026-08-29):
   reactivate <-> deactivate is a real and productive pair that teaches something, where
   `rewrite -> write` only removes. Measured bonus — `de-` and `re-` both sit on Latin stems, so it
   is the mode's heaviest producer of accidental real words: delight->relight, depress->repress,
   detain->retain, deform->reform, defer->refer, deserve->reserve, all of them in 2of12.

   TWO <-> HALF is the same shape and the same call (dev's, 2026-08-29): HALF used to be strippable
   and TWO had no partner at all, which left `semicircle` reading as a deletion and `bicycle` as a
   clank. Doubling and halving are each other's inverse, so the pair is honest — and it pays out the
   same way: the calendar words swap straight across in 2of12, biannual <-> semiannual, bimonthly
   <-> semimonthly, biweekly <-> semiweekly, biyearly <-> semiyearly, plus the one-way joke
   `seminary -> binary` (binary itself reads as bin+ary, §3.5's longest-affix rule). */
const PREFIX_PAIRS = [
  ["BEFORE", "AFTER"],
  ["AGAIN", "UNDO"],
  ["AGAINST", "WITH"],
  ["BEYOND", "BELOW"],
  ["OUT", "INTO"],
  ["MANY", "ONE"],
  ["TWO", "HALF"],
  ["SMALL", "LARGE"],
  ["BAD", "GOOD"],
];

const SUFFIX_PAIRS = [
  ["AGENT", "PATIENT"],
  ["FULL_OF", "WITHOUT"],
  ["LOVER", "HATER"],
];

/* Strip is a legitimate opposite (§3.3): removing the affix IS the inversion, and `unhappy -> happy`
   is the single most legible move in the mode. NOT is the only group left that works this way —
   HALF moved out when it gained TWO as a partner — and no suffix group qualifies at all. */
const PREFIX_STRIPPABLE = new Set(["NOT"]);
const SUFFIX_STRIPPABLE = new Set();

/* §3.5's matching rules. Minimum word length keeps `use`, `over` and `into` out of the mode
   entirely; minimum stem keeps `under` (yields `der`) in but `ends` (would yield `s`) out. */
export const MIN_WORD = 5;
export const MIN_STEM = 3;

export const EQUAL = "equal";
export const OPPOSITE = "opposite";
export const PRE = "pre";
export const SUF = "suf";

/* ── Indexes, built once at module load ───────────────────────────────────────────────────────── */

/* Longest affix wins (§3.5) — `hyper` must be checked before `hy`, `ness` before `ess`. Ties keep
   table order, which only ever decides between two different strings of the same length, never
   between two readings of the same one (see assertAffixTables). */
function buildIndex(groups) {
  const groupOf = new Map(); // affix -> group name
  const members = new Map(); // group name -> affix[]  (the declared cycling order)
  const sorted = [];
  for (const name of Object.keys(groups)) {
    members.set(name, groups[name]);
    for (const affix of groups[name]) {
      groupOf.set(affix, name);
      sorted.push(affix);
    }
  }
  sorted.sort((a, b) => b.length - a.length);
  return { groupOf, members, sorted };
}

function buildOpposites(pairs) {
  const opp = new Map();
  for (const [a, b] of pairs) {
    opp.set(a, b);
    opp.set(b, a);
  }
  return opp;
}

const PRE_IX = buildIndex(PREFIX_GROUPS);
const SUF_IX = buildIndex(SUFFIX_GROUPS);
const PRE_OPPOSITE = buildOpposites(PREFIX_PAIRS);
const SUF_OPPOSITE = buildOpposites(SUFFIX_PAIRS);

const END = {
  [PRE]: { ix: PRE_IX, opposite: PRE_OPPOSITE, strippable: PREFIX_STRIPPABLE, prefix: true },
  [SUF]: { ix: SUF_IX, opposite: SUF_OPPOSITE, strippable: SUFFIX_STRIPPABLE, prefix: false },
};

/* A tables-only sanity check, exported so a dev can call it from the console after editing §3's
   tables. It catches the one edit that fails silently: the same string in two groups, which turns
   longest-first matching into first-declared-wins and quietly retires a group. */
export function assertAffixTables() {
  const problems = [];
  for (const [end, groups] of [
    ["prefix", PREFIX_GROUPS],
    ["suffix", SUFFIX_GROUPS],
  ]) {
    const seen = new Map();
    for (const name of Object.keys(groups)) {
      for (const affix of groups[name]) {
        if (seen.has(affix))
          problems.push(`${end} "${affix}" is in both ${seen.get(affix)} and ${name}`);
        seen.set(affix, name);
      }
    }
  }
  for (const [end, pairs, groups] of [
    ["prefix", PREFIX_PAIRS, PREFIX_GROUPS],
    ["suffix", SUFFIX_PAIRS, SUFFIX_GROUPS],
  ]) {
    for (const [a, b] of pairs) {
      if (!groups[a]) problems.push(`${end} pair names unknown group ${a}`);
      if (!groups[b]) problems.push(`${end} pair names unknown group ${b}`);
    }
  }
  return problems;
}

/* ── Detection ────────────────────────────────────────────────────────────────────────────────── */

function findAffix(word, end) {
  const { ix, prefix } = END[end];
  for (const affix of ix.sorted) {
    if (prefix ? word.startsWith(affix) : word.endsWith(affix)) {
      const rest = prefix ? word.length - affix.length : word.length - affix.length;
      if (rest >= MIN_STEM) return affix;
    }
  }
  return null;
}

/**
 * What a word has on each end, or null if it is not a target at all.
 * { word, pre, preGroup, suf, sufGroup, stem } — all lowercase; the caller re-cases (affixFunc).
 *
 * A word can carry both ends (11% of common words, §2, which is what forces the one-shared-span
 * decision in §5). When it does, the middle has to survive: `unless` reads as un+less with nothing
 * between, so only the longer affix is kept, and a tie goes to the prefix — the Grand Prefixer
 * arrives first, in the word and in the roster.
 */
export function detect(word) {
  if (typeof word !== "string" || word.length < MIN_WORD || !/^[A-Za-z]+$/.test(word)) return null;
  const w = word.toLowerCase();

  let pre = findAffix(w, PRE);
  let suf = findAffix(w, SUF);
  if (pre && suf && w.length - pre.length - suf.length < MIN_STEM) {
    if (suf.length > pre.length) pre = null;
    else suf = null;
  }
  if (!pre && !suf) return null;

  return {
    word: w,
    pre,
    preGroup: pre ? PRE_IX.groupOf.get(pre) : null,
    suf,
    sufGroup: suf ? SUF_IX.groupOf.get(suf) : null,
    stem: w.slice(pre ? pre.length : 0, suf ? w.length - suf.length : w.length),
  };
}

/** True if the word has anything to shoot at. */
export function isAffixWord(word) {
  return detect(word) !== null;
}

/* ── The swap ─────────────────────────────────────────────────────────────────────────────────── */

/**
 * Resolve one shot. `end` is PRE or SUF (the character), `op` is EQUAL or OPPOSITE (the shot).
 * `turn` is how many times this word's end has already been shot with this shot — it walks the
 * group rather than picking at random (§3.5), because repetition is how a player discovers that a
 * group has several members.
 *
 * Returns { end, op, kind, group, from, to, result, options } or NULL, which is the clank (§6.3):
 * nothing on that end, or an affix whose group has neither an opposite nor a strip. A clank is a
 * fact, not a mistake — `hopeful` genuinely has no prefix — which is why it is a null and not an
 * error, and why its cue is the ladder's capstone rather than a buzzer.
 *
 * `result` is lowercase. Case is the caller's job (affixFunc's applyAffixCase), because affixes
 * differ in length from the ones they replace, so it is a shape copy and not a position copy.
 */
export function swapAffix(word, end, op, turn = 0) {
  const cfg = END[end];
  if (!cfg) return null;
  const d = detect(word);
  if (!d) return null;

  const from = end === PRE ? d.pre : d.suf;
  const group = end === PRE ? d.preGroup : d.sufGroup;
  if (!from) return null; // the character's own end is bare: clank

  let pool = null;
  let kind = null;
  if (op === EQUAL) {
    // Never the affix already there — a swap that changes nothing reads as a dud shot.
    pool = cfg.ix.members.get(group).filter((a) => a !== from);
    kind = "equal";
    if (!pool.length) return null; // a one-member group (AFTER, AGAIN, UNDO, PATIENT) has no equal
  } else {
    const opposite = cfg.opposite.get(group);
    if (opposite) {
      pool = cfg.ix.members.get(opposite);
      kind = "opposite";
    } else if (cfg.strippable.has(group)) {
      kind = "strip";
    } else {
      return null; // §3.3 step 3: no opposite, not strippable
    }
  }

  const to = pool ? pool[((turn % pool.length) + pool.length) % pool.length] : "";
  const result =
    end === PRE
      ? to + d.word.slice(from.length)
      : d.word.slice(0, d.word.length - from.length) + to;

  return { end, op, kind, group, from, to, result, options: pool ? pool.length : 0 };
}
