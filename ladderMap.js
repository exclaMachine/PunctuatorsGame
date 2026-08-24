/* ladderMap.js — THE TREE OF KINDS (docs/punctuators-ladder.md §13) — M12 the map, M13 the fill,
 * M14 the feel.
 *
 * A viewer, not a mode. It draws the WHOLE is-a-kind-of hierarchy at once as nested circles —
 * 1,002 trees, 30,545 words, five levels deep — and lights every word you have ever landed on.
 * You pan and zoom it like a map; zoomed all the way out it is a heat map of your own progress.
 *
 * Three things make this cheap enough to be worth having:
 *
 *  1. THE LAYOUT IS A PURE FUNCTION OF ladderPOJO.js. Children ship commonness-ordered (§3.3), so a
 *     deterministic pack over them gives identical coordinates on every machine, every session,
 *     forever. There is no layout file to generate, ship or version — ZERO new data bytes. It is
 *     computed once on first open and never recomputed: what changes as you play is lit-vs-dark,
 *     not position.
 *  2. IT IS A FOREST, NOT A GRAPH. Every word has exactly one parent (verified: 0 collisions), so
 *     containment is exact rather than an approximation — no edge crossings are possible, no force
 *     simulation, no settling, and hit-testing is a walk down the same static tree.
 *  3. DRAW COST IS BOUNDED AT BOTH ENDS OF THE ZOOM, BY TWO DIFFERENT THINGS. Zoomed IN, viewport
 *     culling plus the <3px tier (which collapses a whole subtree to one dot and stops recursing)
 *     keep a frame small. Zoomed all the way OUT they do not: the pack is tight enough that a leaf
 *     is ~1.6px, above the dot threshold's parents, so a fit-scale frame really does visit 28,976
 *     of the 30,545 nodes. What saves that frame is batching — every dot is queued by ramp colour
 *     and flushed as at most 33 fill() calls, not 29,000.
 *
 * M12: layout, LOD draw, pan/zoom/hit-test, the visited set and its storage. M13 adds the SHELF —
 * lit/total of one word's own kinds — as an arc on every circle, a counter beside every label, a
 * line in the readout and the panel's second headline number, all derived in relight() and none of
 * it stored. The 25/50/100% milestones themselves are announced in play rather than here, because
 * that is where they are earned: index.js's noteShelfProgress reads the same numbers off
 * ladderFunc's shelfProgress().
 *
 * M14 (§13.13) adds the four things that make it read rather than merely draw: the ANCESTRY
 * BREADCRUMB in the readout (one hop was the least useful hop — the picture already shows it), the
 * spoiler-free SHARE STRING, the map's own HELP CARD, and the DAILY-RUN GUARD. The guard ships with
 * NO CALLER on purpose: it is map-side work, so writing it here means §11/§12 add one line rather
 * than a feature (?maplock= proves it out until then). M14's other half — the post-game route
 * overlay — left for §12's M11, because a route is the racing mode's artifact and there is nothing
 * to draw without it.
 *
 * THE SEAM FOR THE HEROES: ladderMapVisit(word) / ladderMapVisitAll(words). Nothing calls them yet —
 * M3's collision branch does, on every rung landing, including the rungs a §12.2 descendant jump
 * passes through. Until then ?mapseed=N lights a deterministic sample so the drawing is verifiable.
 *
 * ONE TRAP WORTH NAMING: `constructor` and `prototype` are real words in the corpus (both are
 * children of `person` / `concept`). A plain object keyed by word therefore reports a parent for
 * words that have none — measured, it silently invents a multi-parent edge and corrupts the subtree
 * sizes. Everything keyed by word in here is a Map or a Set for that reason.
 */

/* ── Constants ────────────────────────────────────────────────────────────────────────────────── */
const STORE_KEY = "punctuators.ladderMap";
const LEAF_R = 1; // a leaf is one unit across; every other radius falls out of the packing
const PAD = 1.02; // air between a parent's hull and its outermost child. Tuned, not guessed: the
// median shelf holds 2 children, so PAD is the binding constraint on half the
// map. 1.05 → 34.1% leaf fill, 1.02 → 41.5%, 1.01 → 43.9% but leaves no visible
// gap between a parent's stroke and its contents.
const DOT_PX = 3; // LOD tier 1 → 2 boundary, screen px (§13.4)
const LABEL_PX = 20; // LOD tier 2 → 3 boundary
const MAX_LEAF_PX = 44; // zoom ceiling: a leaf this big is as close as it is useful to get
const DRAG_SLOP = 6; // px of wobble that still counts as a tap rather than a pan

/* ── The forest ───────────────────────────────────────────────────────────────────────────────── */
// Flat, index-addressed, built once. Word → index lives in a Map (see the `constructor` trap above).
let WORDS = null; // idx -> word
let KIDS = null; // idx -> Int32Array of child indices (null for a leaf)
let PARENT = null; // Int32Array, -1 for a root
let SIZE = null; // Int32Array, subtree node count including self
let LIT = null; // Int32Array, visited words in the subtree including self (derived, see relight)
let SELFLIT = null; // Uint8Array, 1 if this exact word is visited — LIT can't be asked, it's a total
let KLIT = null; // Int32Array, visited DIRECT children: the shelf numerator (§13.6, derived)
let POST = null; // Int32Array, a post-order traversal — lets SIZE/LIT be one reverse loop
let X = null,
  Y = null,
  R = null; // Float64Array, absolute world coordinates + radius
let ROOTS = null; // Int32Array
let FOREST_R = 0; // radius of the whole field, for the zoom floor and the clamp
let built = false;

/* ── What you have visited ────────────────────────────────────────────────────────────────────── */
const SEEN = new Set(); // lowercase words; the ONLY persisted state (§13.6 — shelves are derived)
let seenLoaded = false;
let litDirty = true; // LIT needs recomputing before the next draw
let ephemeral = false; // ?mapseed sample — never written back to storage
let helpSeen = false; // §13.13.4 — the first-open card has been dismissed once. Same record as SEEN.
let lockReason = ""; // §13.13.3 — non-empty while a daily run owns the map. No caller yet.

function loadSeen() {
  if (seenLoaded) return;
  seenLoaded = true;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const rec = JSON.parse(raw);
    if (rec && Array.isArray(rec.seen)) for (const w of rec.seen) SEEN.add(w);
    // M14's help flag rides along in the SAME record with no version bump: the reader above only
    // ever asks for rec.seen, so an older build ignores this field and this one treats a missing
    // field as "not seen yet". Nothing to migrate in either direction (§13.13.4).
    if (rec && rec.help) helpSeen = true;
  } catch (e) {
    /* a corrupt record is not worth losing the game over — start the map empty */
  }
}

let saveTimer = null;
function saveSeen() {
  if (ephemeral) return; // a seeded demo must never overwrite a real record
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify({ v: 1, seen: [...SEEN], help: helpSeen ? 1 : 0 })
      );
    } catch (e) {
      /* quota or private mode — the map still works for this session */
    }
  }, 400);
}

/* The seam M3 calls. Safe before the map has ever been opened: it only touches the word set, and the
   forest recomputes its lit counts the next time it draws. Returns true if the word newly lit. */
export function ladderMapVisit(word) {
  if (!word) return false;
  loadSeen();
  const w = String(word).toLowerCase();
  if (SEEN.has(w)) return false;
  SEEN.add(w);
  litDirty = true;
  saveSeen();
  if (mapOpen) requestDraw();
  return true;
}

/* A §12.2 descendant jump crosses real rungs and should pay for all of them. */
export function ladderMapVisitAll(words) {
  let n = 0;
  for (const w of words || []) if (ladderMapVisit(w)) n++;
  return n;
}

export function ladderMapHas(word) {
  loadSeen();
  return SEEN.has(String(word || "").toLowerCase());
}

export function ladderMapCount() {
  loadSeen();
  return SEEN.size;
}

/* ── Building the forest ──────────────────────────────────────────────────────────────────────── */
function buildForest(ladderDown) {
  const words = [];
  const idx = new Map();
  const childList = []; // idx -> number[] (compacted to Int32Array below)
  const id = (w) => {
    let i = idx.get(w);
    if (i === undefined) {
      i = words.length;
      words.push(w);
      idx.set(w, i);
      childList.push(null);
    }
    return i;
  };

  // Insertion order of the shipped object is the build's own order, so this is reproducible.
  for (const parent in ladderDown) {
    const p = id(parent);
    const kids = [];
    for (const child of ladderDown[parent].split(" ")) {
      if (!child) continue;
      const k = id(child);
      if (k === p) continue; // paranoia: a word is never a kind of itself
      kids.push(k);
    }
    childList[p] = kids;
  }

  const n = words.length;
  WORDS = words;
  PARENT = new Int32Array(n).fill(-1);
  KIDS = new Array(n).fill(null);
  for (let p = 0; p < n; p++) {
    const kids = childList[p];
    if (!kids || !kids.length) continue;
    const keep = [];
    for (const k of kids) {
      if (PARENT[k] !== -1) continue; // first parent wins — the data has none of these, but be safe
      PARENT[k] = p;
      keep.push(k);
    }
    if (keep.length) KIDS[p] = Int32Array.from(keep);
  }

  const roots = [];
  for (let i = 0; i < n; i++) if (PARENT[i] === -1) roots.push(i);
  ROOTS = Int32Array.from(roots);

  // One explicit post-order, reused by every bottom-up pass (subtree size, lit counts, the pack).
  // Depth caps at 5, so the walk cannot run away.
  POST = new Int32Array(n);
  let at = 0;
  const visit = (i) => {
    const kids = KIDS[i];
    if (kids) for (let j = 0; j < kids.length; j++) visit(kids[j]);
    POST[at++] = i;
  };
  for (const r of roots) visit(r);

  SIZE = new Int32Array(n);
  for (let j = 0; j < n; j++) {
    const i = POST[j];
    let s = 1;
    const kids = KIDS[i];
    if (kids) for (let k = 0; k < kids.length; k++) s += SIZE[kids[k]];
    SIZE[i] = s;
  }
  LIT = new Int32Array(n);
  SELFLIT = new Uint8Array(n);
  KLIT = new Int32Array(n);

  X = new Float64Array(n);
  Y = new Float64Array(n);
  R = new Float64Array(n);
  packForest();
  built = true;
}

/* Recompute lit-per-subtree AND lit-per-shelf. One pass over the post-order — a few ms over 30k
   nodes, run only when the visited set has changed and the map is about to draw. Both numbers are
   derived here and stored nowhere, which is why a corpus rebuild needs no migration (§13.6).
 *
 * The two counts answer different questions and the map draws both: LIT is the whole subtree, which
 * colours the zoomed-out heat map, while KLIT is this word's OWN list of kinds — the shelf, and the
 * thing that can actually be finished (§13.6: 89% of shelves hold ≤10 children, so unlike the
 * uncompletable 30,545-word whole it is a real goal). SELFLIT exists because LIT cannot be asked
 * whether a particular word is lit — it is a total, so a parent with lit descendants and a dark
 * name looks identical to one with a lit name. Post-order means every child is stamped before its
 * parent reads it, so the shelf count costs one Set lookup per node, not two. */
function relight() {
  if (!built) return;
  litDirty = false;
  for (let j = 0; j < POST.length; j++) {
    const i = POST[j];
    const self = SEEN.has(WORDS[i]) ? 1 : 0;
    SELFLIT[i] = self;
    let l = self;
    let shelf = 0;
    const kids = KIDS[i];
    if (kids)
      for (let k = 0; k < kids.length; k++) {
        l += LIT[kids[k]];
        shelf += SELFLIT[kids[k]];
      }
    LIT[i] = l;
    KLIT[i] = shelf;
  }
  readShown = -2; // the numbers under the pointer just changed; let the next move rebuild the line
}

/* A finished shelf: every one of this word's own kinds lit. Leaves have no shelf and are never
   "done" — a bud is lit or dark, which is a different statement. */
function shelfDone(i) {
  const kids = KIDS[i];
  return !!kids && KLIT[i] === kids.length;
}

/* ── The pack ─────────────────────────────────────────────────────────────────────────────────── */
/* Children go inside their parent, so a parent's radius is whatever its children's arrangement
   needs — computed bottom-up, never forced.
 *
 * §13.4 proposed a golden-angle spiral, on the grounds that "optimal packing would look ~15%
 * tighter and is not worth a dependency". BUILT AND MEASURED, that estimate was wrong by an order
 * of magnitude, and the difference is load-bearing rather than cosmetic. The spiral filled only
 * 4.65% of the field with leaf area, because looseness COMPOUNDS through five levels of nesting:
 * ~47% fill in the root field × ~36-51% on the mid-size shelves × again at every level below.
 * That put the whole forest at radius 811 world units, so at a 900 px viewport a leaf was 0.54 px —
 * and §13.4's actual payoff, the zoomed-out heat map of your own progress, was an invisible haze.
 *
 * So this is a real circle pack: FRONT-CHAIN placement (Wang et al., the algorithm behind d3's
 * pack layout), reimplemented inline. It is an algorithm, not a dependency, so the repo's
 * vanilla/no-build rule is untouched, and it is fully deterministic — no randomness anywhere, so
 * §13.3's "same coordinates on every machine, forever" still holds and there is still no layout
 * file to ship. Measured result below in packForest().
 *
 * Siblings are placed largest-first, which is what makes front-chain behave; the commonness order
 * children ship in (§3.3) is Keen Arrow's business, not the layout's. Each parent then rotates its
 * whole arrangement by a hash of its own name, so shelves don't all point the same way and the map
 * reads as a field of flowers rather than a moiré. */

function angleOffset(word) {
  let h = 2166136261;
  for (let i = 0; i < word.length; i++) {
    h ^= word.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) / 4294967296) * Math.PI * 2;
}

// Place c externally tangent to both a and b.
function place(a, b, c) {
  const dx = b.x - a.x,
    dy = b.y - a.y,
    d2 = dx * dx + dy * dy;
  if (!d2) {
    c.x = a.x + a.r + c.r;
    c.y = a.y;
    return;
  }
  let a2 = a.r + c.r;
  a2 *= a2;
  let b2 = b.r + c.r;
  b2 *= b2;
  if (a2 > b2) {
    const x = (d2 + b2 - a2) / (2 * d2);
    const y = Math.sqrt(Math.max(0, b2 / d2 - x * x));
    c.x = b.x - x * dx - y * dy;
    c.y = b.y - x * dy + y * dx;
  } else {
    const x = (d2 + a2 - b2) / (2 * d2);
    const y = Math.sqrt(Math.max(0, a2 / d2 - x * x));
    c.x = a.x + x * dx - y * dy;
    c.y = a.y + x * dy + y * dx;
  }
}

function overlaps(a, b) {
  const dr = a.r + b.r - 1e-6;
  const dx = b.x - a.x,
    dy = b.y - a.y;
  return dr > 0 && dr * dr > dx * dx + dy * dy;
}

// How close a chain link sits to the origin — the front-chain grows from wherever this is smallest,
// which is what keeps the arrangement round instead of sprawling off in one direction.
function linkScore(node) {
  const a = node.c,
    b = node.next.c;
  const ab = a.r + b.r;
  const dx = (a.x * b.r + b.x * a.r) / ab;
  const dy = (a.y * b.r + b.y * a.r) / ab;
  return dx * dx + dy * dy;
}

/* Smallest circle enclosing a set of circles, by Badoiu–Clarkson: start at the centroid and walk
   toward whatever currently sticks out furthest, with a shrinking step. Deterministic and O(kn).
   It converges to within a fraction of a percent, which is all this needs — the alternative
   (Welzl's exact algorithm) is four times the code to save a rounding error. */
function enclose(list) {
  let cx = 0,
    cy = 0;
  for (const c of list) {
    cx += c.x;
    cy += c.y;
  }
  cx /= list.length;
  cy /= list.length;
  for (let it = 0; it < 48; it++) {
    let far = null,
      best = -Infinity;
    for (const c of list) {
      const d = Math.hypot(c.x - cx, c.y - cy) + c.r;
      if (d > best) {
        best = d;
        far = c;
      }
    }
    const step = 1 / (it + 2);
    cx += (far.x - cx) * step;
    cy += (far.y - cy) * step;
  }
  let r = 0;
  for (const c of list) r = Math.max(r, Math.hypot(c.x - cx, c.y - cy) + c.r);
  return { x: cx, y: cy, r };
}

/* Front-chain packing. Places every circle in `list` (each {r}) around the origin, writing .x/.y,
   and returns the radius of the circle enclosing them all. */
function packSiblings(list) {
  const n = list.length;
  if (!n) return 0;
  const a = list[0];
  a.x = 0;
  a.y = 0;
  if (n === 1) return a.r;

  const b = list[1];
  a.x = -b.r;
  b.x = a.r;
  b.y = 0;
  if (n === 2) return a.r + b.r;

  place(b, a, list[2]);

  // The chain is a doubly-linked ring of the circles currently on the hull.
  const node = (c) => ({ c, prev: null, next: null });
  let A = node(a),
    B = node(b);
  let C = node(list[2]);
  A.next = C.prev = B;
  B.next = A.prev = C;
  C.next = B.prev = A;

  outer: for (let i = 3; i < n; i++) {
    const c = list[i];
    place(A.c, B.c, c);
    C = node(c);
    // Walk both ways along the chain looking for the nearest circle the newcomer would collide
    // with. Hitting one means the chain must be spliced there and the placement retried.
    let j = B.next,
      k = A.prev,
      sj = B.c.r,
      sk = A.c.r;
    do {
      if (sj <= sk) {
        if (overlaps(j.c, c)) {
          B = j;
          A.next = B;
          B.prev = A;
          i--;
          continue outer;
        }
        sj += j.c.r;
        j = j.next;
      } else {
        if (overlaps(k.c, c)) {
          A = k;
          A.next = B;
          B.prev = A;
          i--;
          continue outer;
        }
        sk += k.c.r;
        k = k.prev;
      }
    } while (j !== k.next);

    C.prev = A;
    C.next = B;
    A.next = B.prev = B = C;

    // Re-aim at the link closest to the origin.
    let bestScore = linkScore(A);
    let walk = C;
    while ((walk = walk.next) !== B) {
      const s = linkScore(walk);
      if (s < bestScore) {
        bestScore = s;
        A = walk;
      }
    }
    B = A.next;
  }

  const hull = [B.c];
  for (let w = B.next; w !== B; w = w.next) hull.push(w.c);
  const e = enclose(hull);
  for (let i = 0; i < n; i++) {
    list[i].x -= e.x;
    list[i].y -= e.y;
  }
  return e.r;
}

// Pack a set of node indices around their parent's origin, rotated by `off`. Returns the hull.
function packInto(idxs, off) {
  const list = new Array(idxs.length);
  for (let i = 0; i < idxs.length; i++) list[i] = { i: idxs[i], r: R[idxs[i]], x: 0, y: 0 };
  list.sort((p, q) => q.r - p.r || p.i - q.i); // largest first — and a stable tie-break, so pure
  const hull = packSiblings(list);
  const cos = Math.cos(off),
    sin = Math.sin(off);
  for (const c of list) {
    X[c.i] = c.x * cos - c.y * sin;
    Y[c.i] = c.x * sin + c.y * cos;
  }
  return hull;
}

/* Measured on the shipped ladderPOJO.js, spiral → front-chain (both at PAD 1.02):
     FOREST_R      811  →  271          leaf fill    4.65%  →  41.5%
     leaf @900px  0.54  →  1.61 px      root field    47%   →  78% fill
   Verified alongside: 0 sibling overlaps and 0 children escaping their parent, across all 30,545
   nodes. Build cost 0.1-0.3 s, paid once on first open behind the "growing the forest…" message. */
function packForest() {
  // Bottom-up: every child's radius is final before its parent packs them.
  for (let j = 0; j < POST.length; j++) {
    const i = POST[j];
    const kids = KIDS[i];
    if (!kids) {
      R[i] = LEAF_R;
      continue;
    }
    R[i] = Math.max(LEAF_R, packInto(kids, angleOffset(WORDS[i]))) * PAD;
  }

  // The field: the 1,002 roots. Biggest first (packInto sorts), so `person` lands near the middle
  // of the world and the 465 shrub trees settle around the rim.
  FOREST_R = packInto(ROOTS, 0) * PAD;

  // Local offsets → absolute, top-down. POST is post-order, so reversing it is parents-first.
  for (let j = POST.length - 1; j >= 0; j--) {
    const i = POST[j];
    const p = PARENT[i];
    if (p === -1) continue;
    X[i] += X[p];
    Y[i] += Y[p];
  }
}

/* ── Colour ───────────────────────────────────────────────────────────────────────────────────── */
/* A subtree's lit fraction, cold slate → violet → gold. Precomputed as a small ramp so the draw
   loop never builds a colour string. Gold at the top is deliberate: it is the same "finished"
   signal M13's completed shelves will use. */
const RAMP_N = 33;
const RAMP = [];
const RAMP_DIM = [];
(function buildRamp() {
  const stops = [
    [0.0, [43, 39, 64]],
    [0.15, [72, 56, 122]],
    [0.5, [131, 83, 214]],
    [0.8, [226, 130, 176]],
    [1.0, [255, 212, 94]],
  ];
  for (let i = 0; i < RAMP_N; i++) {
    const f = i / (RAMP_N - 1);
    let a = stops[0],
      b = stops[stops.length - 1];
    for (let s = 0; s < stops.length - 1; s++) {
      if (f >= stops[s][0] && f <= stops[s + 1][0]) {
        a = stops[s];
        b = stops[s + 1];
        break;
      }
    }
    const t = b[0] === a[0] ? 0 : (f - a[0]) / (b[0] - a[0]);
    const ch = (k) => Math.round(a[1][k] + (b[1][k] - a[1][k]) * t);
    const [r, g, bl] = [ch(0), ch(1), ch(2)];
    RAMP.push(`rgb(${r},${g},${bl})`);
    RAMP_DIM.push(`rgba(${r},${g},${bl},0.13)`);
  }
})();
const rampIdx = (i) => Math.round((LIT[i] / SIZE[i]) * (RAMP_N - 1));
const heat = (i) => RAMP[rampIdx(i)];
const heatDim = (i) => RAMP_DIM[rampIdx(i)];

const C_LEAF_DARK = "#332e4d";
const C_LEAF_LIT = "#ffd45e";
const C_SHELF = "#ffd45e"; // the shelf arc and a finished counter — the same gold as a lit bud
const C_SHELF_DIM = "#a99ad6"; // an unfinished shelf counter, quieter than the word above it
const C_LABEL = "#cfc8ea";
const C_LABEL_LIT = "#ffe6a3";
const C_BG = "#14111f";

/* ── The viewport ─────────────────────────────────────────────────────────────────────────────── */
/* Lifted from Inklings' Sound Board (`sbView` / `sbClampView` / drag-to-pan / ⌖ recentre), with the
   discrete cell grid swapped for a continuous scale — the map zooms rather than stepping. */
let view = { x: 0, y: 0, s: 1 }; // world point at the centre of the canvas, and px per world unit
let cnv = null,
  ctx = null,
  W = 0,
  H = 0,
  dpr = 1;

function fitScale() {
  return Math.min(W, H) / (FOREST_R * 2.06);
}
function clampView() {
  // Zoom floor: never smaller than the whole forest. Ceiling: a leaf at MAX_LEAF_PX.
  const lo = fitScale(),
    hi = MAX_LEAF_PX / LEAF_R;
  view.s = Math.max(lo, Math.min(hi, view.s));
  // Pan: keep the forest overlapping the canvas rather than letting it drift off into void.
  const mx = Math.max(0, FOREST_R - W / (2 * view.s));
  const my = Math.max(0, FOREST_R - H / (2 * view.s));
  view.x = Math.max(-mx, Math.min(mx, view.x));
  view.y = Math.max(-my, Math.min(my, view.y));
}
function home() {
  view.x = 0;
  view.y = 0;
  view.s = fitScale();
  clampView();
  requestDraw();
}
function zoomAt(px, py, factor) {
  // Keep the world point under the cursor pinned while the scale changes.
  const wx = view.x + (px - W / 2) / view.s;
  const wy = view.y + (py - H / 2) / view.s;
  view.s *= factor;
  clampView();
  view.x = wx - (px - W / 2) / view.s;
  view.y = wy - (py - H / 2) / view.s;
  clampView();
  requestDraw();
}

function resize() {
  if (!cnv) return;
  // clientWidth/Height, NOT getBoundingClientRect: the panel is shown by animating a transform, and
  // a transformed rect reports the scaled box (0×0 mid-animation). The layout box is what we want.
  dpr = Math.min(2, window.devicePixelRatio || 1);
  W = Math.max(1, cnv.clientWidth);
  H = Math.max(1, cnv.clientHeight);
  cnv.width = Math.round(W * dpr);
  cnv.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (!built) return;
  clampView();
  draw();
}

// A drag or a wheel can fire many times per frame; the map only ever needs the last one.
let frame = 0;
function requestDraw() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    draw();
  });
}

/* ── The draw ─────────────────────────────────────────────────────────────────────────────────── */
/* Three LOD tiers (§13.4). The cheapest one is the feature, not a compromise: below 3px a whole
   subtree is a single dot coloured by how much of it you have lit, so the zoomed-out view is a
   picture of your own progress. It also bounds the frame — a full-forest draw is a few thousand
   shapes rather than 30,545. */
let labelQueue = [];
// Tier-1 dots, bucketed by ramp colour. Zoomed out the map is ~30,000 of them, and one fill() per
// dot is what would make a drag stutter; batching by colour turns 30,000 fills into at most 33.
const dots = [];
for (let i = 0; i < RAMP_N; i++) dots.push([]);

function drawNode(i, s) {
  const rs = R[i] * s;
  const cx = (X[i] - view.x) * s + W / 2;
  const cy = (Y[i] - view.y) * s + H / 2;
  if (cx + rs < -2 || cx - rs > W + 2 || cy + rs < -2 || cy - rs > H + 2) return;

  const kids = KIDS[i];

  if (rs < DOT_PX) {
    // Tier 1 — one dot for the whole subtree, coloured by how much of it you have lit. Recursion
    // stops here, which is what bounds a frame by zoom instead of by the size of the corpus.
    //
    // §13.6: a finished shelf takes the top of the ramp even when its grandchildren are dark, so a
    // filled region stays gold when you zoom past it. The ramp's own end is already this gold, so
    // "done" costs a bucket index rather than a colour, and the batching still holds.
    const b = dots[shelfDone(i) ? RAMP_N - 1 : rampIdx(i)];
    b.push(cx, cy, Math.max(0.5, rs));
    return;
  }

  if (!kids) {
    // A leaf big enough to be a shape: a bud, filled when you have landed on it.
    const on = LIT[i] === 1;
    ctx.fillStyle = on ? C_LEAF_LIT : C_LEAF_DARK;
    ctx.beginPath();
    ctx.arc(cx, cy, rs * 0.82, 0, Math.PI * 2);
    ctx.fill();
    if (on && rs > LABEL_PX * 0.6) labelQueue.push(i, cx, cy, rs, 1);
    return;
  }

  // Tiers 2 & 3 — the containing circle, then its children.
  ctx.fillStyle = heatDim(i);
  ctx.strokeStyle = heat(i);
  ctx.lineWidth = rs > 60 ? 1.6 : 1;
  ctx.beginPath();
  ctx.arc(cx, cy, rs, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // §13.6's shelf progress, drawn ON the circle's own stroke: a gold arc covering lit/total of this
  // word's kinds, clockwise from twelve o'clock. It lives here rather than only in the label because
  // most of the map is between 3 and 20 px, where there is no room to write "7/33" but plenty to
  // read an arc — and a full ring is a finished shelf, legible at a glance from across the forest.
  // Only shelves you have started cost anything to draw; early on almost none do.
  if (KLIT[i] > 0) {
    const a0 = -Math.PI / 2;
    ctx.strokeStyle = C_SHELF;
    ctx.lineWidth = Math.max(1, Math.min(2.8, rs * 0.12));
    ctx.beginPath();
    ctx.arc(cx, cy, rs, a0, a0 + (KLIT[i] / kids.length) * Math.PI * 2);
    ctx.stroke();
  }

  // Internal words are the map's coastline and are ALWAYS named (§13.5) — without them the map is
  // unnavigable. Leaf names stay fogged until visited, so an answer can never be read off it.
  //
  // KNOWN ISSUE (2026-08-24, §13.5) — except it can, and this is where. A word whose whole branch is
  // ONE child is a leaf with a tail, not coastline, and naming it just prints an answer: `kinsman
  // 0/4` hands you `brother`, `nephew` and `uncle` because each has a single child, leaving only the
  // true leaf `brethren` fogged. 1,623 of the 4,837 internal words (33.6%) are single-child parents.
  // The fix is to fog them like buds until visited — see §13.5 for what it does to the breadcrumb.
  if (rs >= LABEL_PX) labelQueue.push(i, cx, cy, rs, 0);

  for (let k = 0; k < kids.length; k++) drawNode(kids[k], s);
}

function drawDots() {
  const TAU = Math.PI * 2;
  for (let b = 0; b < RAMP_N; b++) {
    const a = dots[b];
    if (!a.length) continue;
    ctx.fillStyle = RAMP[b];
    ctx.beginPath();
    for (let k = 0; k < a.length; k += 3) {
      ctx.moveTo(a[k] + a[k + 2], a[k + 1]); // no stray connecting line between dots
      ctx.arc(a[k], a[k + 1], a[k + 2], 0, TAU);
    }
    ctx.fill();
    a.length = 0;
  }
}

function drawLabels() {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.9)";
  ctx.shadowBlur = 4;
  for (let q = 0; q < labelQueue.length; q += 5) {
    const i = labelQueue[q],
      cx = labelQueue[q + 1],
      cy = labelQueue[q + 2],
      rs = labelQueue[q + 3],
      isLeaf = labelQueue[q + 4];
    const size = Math.max(10, Math.min(22, rs * (isLeaf ? 0.5 : 0.28)));
    ctx.font = `600 ${size}px Palanquin, sans-serif`;
    const text = WORDS[i].replace(/_/g, " ");
    if (ctx.measureText(text).width > rs * 2.1) continue; // no clipped half-words
    // A big circle is full of children, so its name rides the top edge like a region label.
    const y = isLeaf || rs < 46 ? cy : cy - rs + size * 0.9;
    ctx.fillStyle = LIT[i] ? C_LABEL_LIT : C_LABEL;
    ctx.fillText(text, cx, y);

    // §13.6's shelf counter, under the name: `dog 7/33`. Only at label zoom, where the arc has
    // already said roughly the same thing and there is finally room to say it exactly. It names no
    // leaf, so it is fog-safe (§13.5) — it counts them without listing them.
    if (!isLeaf) {
      const csize = Math.max(9, size * 0.7);
      ctx.font = `600 ${csize}px Palanquin, sans-serif`;
      const count = `${KLIT[i]}/${KIDS[i].length}`;
      if (ctx.measureText(count).width <= rs * 1.6) {
        ctx.fillStyle = shelfDone(i) ? C_SHELF : C_SHELF_DIM;
        ctx.fillText(count, cx, y + csize * 1.2);
      }
    }
  }
  ctx.shadowBlur = 0;
  labelQueue.length = 0;
}

function draw() {
  if (!mapOpen || !built || !ctx) return;
  if (litDirty) relight();
  ctx.fillStyle = C_BG;
  ctx.fillRect(0, 0, W, H);
  const s = view.s;
  for (let k = 0; k < ROOTS.length; k++) drawNode(ROOTS[k], s);
  drawDots();
  drawLabels();
  paintStat();
}

/* ── Hit-testing ──────────────────────────────────────────────────────────────────────────────── */
/* Containment means at most one child can hold the point, so this is a walk down the same static
   tree the draw walks — no spatial index. Two things keep it honest:
     · it stops where the DRAW stops, so a subtree collapsed to a single dot reads out as that
       subtree rather than as whichever invisible leaf the pixel happens to cover;
     · a few screen pixels of slop, converted to world units, so a 2 px bud is actually hoverable. */
function hit(px, py) {
  if (!built) return -1;
  const wx = view.x + (px - W / 2) / view.s;
  const wy = view.y + (py - H / 2) / view.s;
  const slop = 3 / view.s;
  let best = -1;
  const descend = (i) => {
    const reach = R[i] + slop;
    const dx = wx - X[i],
      dy = wy - Y[i];
    if (dx * dx + dy * dy > reach * reach) return false;
    best = i;
    if (R[i] * view.s < DOT_PX) return true; // this node IS the dot under the pointer
    const kids = KIDS[i];
    if (kids) for (let k = 0; k < kids.length; k++) if (descend(kids[k])) break;
    return true;
  };
  for (let k = 0; k < ROOTS.length; k++) if (descend(ROOTS[k])) break;
  return best;
}

/* ── Chrome ───────────────────────────────────────────────────────────────────────────────────── */
let elMap = null,
  elStat = null,
  elRead = null,
  elShare = null,
  elHelp = null,
  elBtn = null,
  mapOpen = false;
let shareTimer = null,
  lockTimer = null;

// draw() runs on every pan frame; the count almost never changes, so don't touch the DOM unless it
// does — which is also what makes the 30k-node shelf sweep below free in practice.
let statShown = -1;
function paintStat() {
  if (!elStat || SEEN.size === statShown) return;
  statShown = SEEN.size;
  const pct = ((SEEN.size / WORDS.length) * 100).toFixed(1);
  // Two headline numbers, because they say opposite things. The word count is the honest scale of
  // the corpus and will never be finished. Shelves are the metric that CAN be (§13.6), so they are
  // what the panel actually keeps score with.
  const { done, parents } = countShelves();
  const n = (v) => v.toLocaleString();
  elStat.textContent =
    `${n(SEEN.size)} of ${n(WORDS.length)} words lit · ${pct}% · ` +
    `${n(done)} of ${n(parents)} shelves filled`;
}

/* One sweep of the 4,837 parents. Shared by the panel's headline and the share string so the two can
   never disagree, and cheap enough that neither has to cache it (the statShown guard above already
   keeps it off the draw path). */
function countShelves() {
  let done = 0,
    parents = 0;
  for (let i = 0; i < WORDS.length; i++) {
    if (!KIDS[i]) continue;
    parents++;
    if (KLIT[i] === KIDS[i].length) done++;
  }
  return { done, parents };
}

/* ── §13.13.2 The share string ────────────────────────────────────────────────────────────────── */
const SHARE_MIN_TREE = 50; // a tree has to be this big to be worth bragging about — see below

/* The best-filled tree of real size: the highest LIT FRACTION among the 88 roots holding ≥50 nodes,
   tie-broken by lit count.
 *
 * Not simply the most-lit tree, which is the obvious reading of §13.9's `ANIMAL 31%`: `person` is
 * 4,415 nodes — 14% of the whole corpus — so it would win for very nearly every player, and a share
 * stat that never moves as you play and never differs between two people is not a stat. The ≥50
 * floor is what stops the other failure: 465 of the 1,002 roots hold fewer than five words, and a
 * two-node shrub at 100% would otherwise take the slot every time. */
function bestTree() {
  let best = -1,
    bestFrac = 0;
  for (let k = 0; k < ROOTS.length; k++) {
    const i = ROOTS[k];
    if (SIZE[i] < SHARE_MIN_TREE || !LIT[i]) continue;
    const frac = LIT[i] / SIZE[i];
    if (frac > bestFrac || (frac === bestFrac && best !== -1 && LIT[i] > LIT[best])) {
      best = i;
      bestFrac = frac;
    }
  }
  return best;
}

/* Spoiler-free by construction: it names at most one ROOT, and a root has children, so it is an
   internal word — §13.5's fog rule cannot be broken by it. It can never print a leaf. */
export function shareText() {
  if (!built) return "";
  if (litDirty) relight();
  const n = (v) => v.toLocaleString();
  const { done } = countShelves();
  const parts = [
    "🌳 Tree of Kinds",
    `${n(SEEN.size)} word${SEEN.size === 1 ? "" : "s"}`,
    `${n(done)} shel${done === 1 ? "f" : "ves"}`,
  ];
  const b = bestTree();
  if (b !== -1)
    parts.push(
      `${WORDS[b].replace(/_/g, " ").toUpperCase()} ${Math.round(
        (LIT[b] / SIZE[b]) * 100
      )}%`
    );
  return parts.join(" · ");
}

/* Clipboard API with the textarea fallback, the same shape as Critter Hunt's copyShare
   (critter-hunt.html:1092) — execCommand is what still works in a file:// or an older WebView. */
function copyShare() {
  const txt = shareText();
  if (!txt) return;
  const done = (ok) => {
    if (!elShare) return;
    elShare.classList.add("ok");
    elShare.textContent = ok ? "Copied" : "Copy failed";
    clearTimeout(shareTimer);
    shareTimer = setTimeout(() => {
      elShare.classList.remove("ok");
      elShare.textContent = "📋";
    }, 1600);
  };
  if (navigator.clipboard && navigator.clipboard.writeText)
    navigator.clipboard.writeText(txt).then(
      () => done(true),
      () => done(fallbackCopy(txt))
    );
  else done(fallbackCopy(txt));
}

function fallbackCopy(txt) {
  try {
    const ta = document.createElement("textarea");
    ta.value = txt;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch (e) {
    return false;
  }
}

/* §13.13.1 — the chain of ever-broader words above `i`, root first. Depth caps at 5 in the shipped
   corpus (measured; the deepest real path is six words, `immorality › … › sanctimoniousness`), so
   this needs no truncation logic. The spin guard is belt-and-braces: the forest is a tree by
   construction, so a cycle would mean the build is broken, not that the walk is. */
function ancestry(i) {
  const path = [];
  for (let c = i; c !== -1 && path.length < 12; c = PARENT[c]) path.push(c);
  return path.reverse();
}

const esc = (s) =>
  s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const say = (i) => esc(WORDS[i].replace(/_/g, " "));

/* Rebuilt only when the hovered node changes. readout() runs on every pointermove, and M14 turned
   it from one textContent write into a built string — the same guard paintStat() already uses. */
let readShown = -2;

function readout(i) {
  if (!elRead || i === readShown) return;
  readShown = i;
  if (i < 0) {
    elRead.textContent = "";
    elRead.classList.remove("on");
    return;
  }
  // §13.13.1. One hop — `a kind of mammal` — was the least useful hop, because the picture already
  // draws `dog` inside `mammal`. What it cannot show at a readable zoom is where you are in the
  // whole hierarchy, so the readout carries the entire chain, broad → narrow: the direction the
  // ladder reads in play (General walks left, Keen walks right).
  //
  // IT CAN NEVER NEED REDACTING. Every ancestor has a child by definition, so every ancestor is an
  // internal word, and §13.5 names all of those. Only the hovered word itself can be fogged.
  const path = ancestry(i);
  const named = KIDS[i] || SEEN.has(WORDS[i]);
  const crumbs = path
    .slice(0, -1)
    .map((a) => `<span class="tree-map__crumb">${say(a)}</span>`)
    .join("<i>›</i>");
  const here = `<span class="tree-map__here">${
    named ? say(i) : "an unvisited kind"
  }</span>`;

  const bits = [];
  if (named) bits.push(SEEN.has(WORDS[i]) ? "lit" : "not yet");
  // The exact shelf, for the word under the pointer — the arc's number, spelled out (§13.6).
  if (KIDS[i])
    bits.push(`${KLIT[i]}/${KIDS[i].length} kinds${shelfDone(i) ? " ★" : ""}`);
  if (path.length === 1) bits.push("a root of the forest");

  elRead.innerHTML =
    (crumbs ? crumbs + "<i>›</i>" : "") +
    here +
    (bits.length
      ? `<span class="tree-map__meta"> · ${bits.join(" · ")}</span>`
      : "");
  elRead.classList.add("on");
}

/* ── §13.13.3 The daily-run guard ─────────────────────────────────────────────────────────────── */
/* NOTHING CALLS THESE YET, on purpose. §13.8 wants the map shut while a daily is in progress — the
   named skeleton is a routing atlas, and Word Race is a routing game, so a player with it open is
   reading the answer instead of recalling it. Neither daily exists (§11 M6–M8, §12 M9–M11), but the
   LOCK is map-side work: writing it here means each daily adds one line on start and one on finish
   (see §11.8 / §12.5) rather than learning this file. `?maplock=<reason>` proves it out until then.
   Free play never locks (§13.8). The other half of §13.8 — drawing your route on the map afterwards
   — is NOT map-side: a route is the racing mode's own artifact, so it went to §12's M11. */
export function ladderMapLock(reason) {
  lockReason = String(reason || "the map is closed right now");
  if (mapOpen) closeLadderMap(); // a lock can arrive while it is already open
  paintLock();
}

export function ladderMapUnlock() {
  lockReason = "";
  paintLock();
}

export function isLadderMapLocked() {
  return !!lockReason;
}

function paintLock() {
  if (!elBtn) return;
  clearTimeout(lockTimer);
  elBtn.classList.toggle("locked", !!lockReason);
  elBtn.setAttribute("aria-disabled", lockReason ? "true" : "false");
  elBtn.title = lockReason || "";
  elBtn.textContent = lockReason ? "🔒 Tree of Kinds" : "🌳 Tree of Kinds";
}

/* §13.8 asks for "disabled, and says why". A dead button says nothing, so clicking a locked one
   swaps its own label for the reason and puts itself back a couple of seconds later. */
function refuse() {
  if (!elBtn) return;
  elBtn.textContent = `🔒 ${lockReason}`;
  clearTimeout(lockTimer);
  lockTimer = setTimeout(paintLock, 2400);
}

/* ── §13.13.4 The map's own How-to-Play ───────────────────────────────────────────────────────── */
/* The ladder hero modal ends with one sentence about the map, which is the right place to MENTION
   it and the wrong place to explain it — you read that modal before you have ever opened the panel.
   So the four things you cannot infer from looking at the picture are said over the picture, once,
   the first time it opens. The `?` in the bar brings it back. */
function showHelp() {
  if (!elHelp) return;
  elHelp.classList.add("on");
  elHelp.setAttribute("aria-hidden", "false");
}

function dismissHelp() {
  if (!elHelp) return;
  elHelp.classList.remove("on");
  elHelp.setAttribute("aria-hidden", "true");
  if (helpSeen) return;
  helpSeen = true;
  saveSeen();
}

/* ── Wiring ───────────────────────────────────────────────────────────────────────────────────── */
let loading = null;

export function isLadderMapOpen() {
  return mapOpen;
}

export function closeLadderMap() {
  if (!mapOpen) return;
  mapOpen = false;
  elMap.classList.remove("on");
  elMap.setAttribute("aria-hidden", "true");
  dismissHelp();
  readout(-1);
}

export async function openLadderMap() {
  if (!elMap || mapOpen) return;
  if (lockReason) return refuse(); // §13.13.3
  loadSeen();
  mapOpen = true;
  elMap.classList.add("on");
  elMap.setAttribute("aria-hidden", "false");
  if (!built) {
    if (elStat) elStat.textContent = "growing the forest…";
    // 337 KB, fetched once and only from here. A static import would put it on every page load for
    // a panel most sessions never open; nothing on this path is synchronous, so §3.3's reason for
    // a static import (keeping hasLadders/wrapLadders sync) does not apply to the map.
    loading = loading || import("./ladderPOJO.js");
    let mod;
    try {
      mod = await loading;
    } catch (e) {
      loading = null; // don't cache the rejection, or reopening can never succeed
      if (elStat) elStat.textContent = "couldn't load the word forest";
      return;
    }
    if (!mapOpen) return;
    buildForest(mod.ladderDown);
    seedFromUrl();
    relight();
  }
  resize();
  home();
  if (!helpSeen) showHelp(); // §13.13.4 — once, then only from the ? button
}

function wirePointer() {
  let drag = null;
  const pointers = new Map();
  let pinch = null;

  cnv.addEventListener("pointerdown", (e) => {
    cnv.setPointerCapture?.(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) };
      drag = null;
      return;
    }
    drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false };
  });

  cnv.addEventListener("pointermove", (e) => {
    if (pointers.has(e.pointerId))
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pinch && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.d > 0) {
        const r = cnv.getBoundingClientRect();
        zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, d / pinch.d);
      }
      pinch.d = d;
      return;
    }

    if (drag) {
      const dx = e.clientX - drag.x,
        dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < DRAG_SLOP) return; // a small wobble is still a tap
      drag.moved = true;
      cnv.classList.add("dragging");
      view.x = drag.vx - dx / view.s;
      view.y = drag.vy - dy / view.s;
      clampView();
      requestDraw();
      return;
    }

    const r = cnv.getBoundingClientRect();
    readout(hit(e.clientX - r.left, e.clientY - r.top));
  });

  const end = (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (!drag) return;
    const wasDrag = drag.moved;
    drag = null;
    cnv.classList.remove("dragging");
    if (wasDrag) return;
    const r = cnv.getBoundingClientRect();
    readout(hit(e.clientX - r.left, e.clientY - r.top));
  };
  cnv.addEventListener("pointerup", end);
  cnv.addEventListener("pointercancel", end);
  cnv.addEventListener("pointerleave", () => readout(-1));

  cnv.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const r = cnv.getBoundingClientRect();
      zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.0016));
    },
    { passive: false }
  );
}

/* CAPTURE phase, and it swallows what it uses. index.js:2388 binds the same four arrow keys to the
   game (↑ shoot, ↓ switch character, ←/→ move), so a bubbling listener would pan the map AND fire
   the hero underneath it. Capturing on window runs before any bubble-phase listener regardless of
   which module registered first, so this needs no ordering assumption between the two files. Keys
   the map doesn't use fall through untouched — typing must still reach the sentence box. */
function wireKeys() {
  window.addEventListener(
    "keydown",
    (e) => {
      if (!mapOpen) return;
      const k = e.key;
      const eat = () => {
        e.preventDefault();
        e.stopImmediatePropagation();
      };
      if (k === "Escape") {
        eat();
        // A layer at a time, the way the shelf fan's Esc works: the help card first, the panel next.
        if (elHelp && elHelp.classList.contains("on")) dismissHelp();
        else closeLadderMap();
        return;
      }
      if (k === "?" && elHelp) {
        eat();
        return elHelp.classList.contains("on") ? dismissHelp() : showHelp();
      }
      if (k === "c" || k === "C") {
        eat();
        home();
        return;
      }
      if (k === "+" || k === "=") {
        eat();
        return zoomAt(W / 2, H / 2, 1.25);
      }
      if (k === "-" || k === "_") {
        eat();
        return zoomAt(W / 2, H / 2, 0.8);
      }
      const step = 90 / view.s;
      if (k === "ArrowLeft") view.x -= step;
      else if (k === "ArrowRight") view.x += step;
      else if (k === "ArrowUp") view.y -= step;
      else if (k === "ArrowDown") view.y += step;
      else return;
      eat();
      clampView();
      requestDraw();
    },
    true
  );
}

/* Dev only: light a deterministic sample so the lit/dark drawing can be checked before M3 exists to
   light anything for real. Session-only — `ephemeral` blocks every write, so a demo can never land
   in a player's record. Clusters the sample down real branches rather than sprinkling it uniformly,
   because that is what actual play looks like. */
function seedFromUrl() {
  let n = 0;
  try {
    n = parseInt(new URLSearchParams(location.search).get("mapseed") || "", 10);
  } catch (e) {
    /* no query string to read */
  }
  if (!n || n < 1) return;
  ephemeral = true;
  let a = 0x9e3779b9;
  const rnd = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const want = Math.min(n, 20000);
  // The walk revisits words it has already lit, so it cannot be counted on to converge on a target
  // near the size of the corpus — the spin guard, not the target, is what ends the loop.
  for (let spin = 0; spin < want * 4 && SEEN.size < want; spin++) {
    let i = ROOTS[(rnd() * ROOTS.length) | 0];
    if (SIZE[i] < 3 && rnd() < 0.8) continue; // favour trees with something in them
    for (let hop = 0; hop < 40 && SEEN.size < want; hop++) {
      SEEN.add(WORDS[i]);
      const kids = KIDS[i];
      if (!kids || rnd() < 0.18) break;
      i = kids[(rnd() * kids.length) | 0];
    }
  }
  litDirty = true;
}

export function initLadderMap() {
  elMap = document.getElementById("tree-map");
  if (!elMap) return;
  cnv = document.getElementById("tree-map-canvas");
  ctx = cnv.getContext("2d");
  elStat = document.getElementById("tree-map-stat");
  elRead = document.getElementById("tree-map-readout");
  elShare = document.getElementById("tree-map-share");
  elHelp = document.getElementById("tree-map-help");
  elBtn = document.getElementById("tree-map-btn");

  elBtn?.addEventListener("click", openLadderMap);
  document
    .getElementById("tree-map-close")
    ?.addEventListener("click", closeLadderMap);
  document.getElementById("tree-map-home")?.addEventListener("click", home);
  elShare?.addEventListener("click", copyShare);
  document.getElementById("tree-map-helpbtn")?.addEventListener("click", showHelp);
  document
    .getElementById("tree-map-helpok")
    ?.addEventListener("click", dismissHelp);
  window.addEventListener("resize", () => mapOpen && resize());
  wirePointer();
  wireKeys();
  loadSeen();

  const q = new URLSearchParams(location.search);
  // Dev only, and the only way to exercise §13.13.3 until a daily exists to call ladderMapLock().
  const lk = q.get("maplock");
  if (lk !== null) ladderMapLock(lk || "finish today's puzzle to open the map");
  if (q.has("map")) openLadderMap();
}
