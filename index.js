import { addSpansAndIds } from "./utils/utils.js";
import { addSpansAndIdsForWordPlay } from "./utils/utils.js";
import { waitForElement } from "./utils/utils.js";
import { nodeArr, numberOfPunctuationArray } from "./utils/utils.js";
import { heroToTheRescue } from "./utils/utils.js";
import { setClassName } from "./utils/utils.js";
import { createRandomMadLibSentence } from "./SentenceFunc.js";
import {
  shortenContraction,
  secondContractionWordSet,
} from "./utils/contractionFunc.js";
import { textRevealSpeeds, changeTextToSpeechBubble } from "./speechbubble.js";
import { shakeAndBorderizeArticle } from "./articleFunc.js";
import { hasAmbigrams } from "./AmbigramFunc.js";
import { hasAnagrams } from "./anagrams.js";
import { hasHomophones } from "./HomophonesFuncs.js";
// The Tree of Kinds — the ladder progress map (docs/punctuators-ladder.md §13). Only the wiring is
// imported here; ladderPOJO.js (337 KB) is fetched on demand, shared with the mode below.
// The ladder collision branch calls ladderMapVisit() on every rung it lands on.
import { initLadderMap, ladderMapVisit, ladderMapHas } from "./ladderMap.js";
// General & Specific — the is-a-kind-of ladder (docs/punctuators-ladder.md §§2–4).
import {
  LADDER_ID,
  loadLadders,
  hasLadders,
  ladderParentOf,
  ladderChainFor,
  ladderRungStrip,
  renderRung,
  shelfFor,
  shelfProgress,
  shelfMilestoneCrossed,
} from "./ladderFunc.js";
// Word Race — the same two heroes, but the player IS a word (docs/punctuators-ladder.md §12).
// ladderAltPOJO.js (98 KB) rides along with the main corpus and is fetched only by this mode.
import {
  RACE_UP_ID,
  RACE_DOWN_ID,
  GUESS,
  loadRace,
  classifyGuess,
  createRace,
  raceFieldHTML,
  ancestorsOf,
} from "./ladderRace.js";
//import { swapWord } from "./spoonerismFunc.js";
const canvas = document.getElementById("background");
const c = canvas.getContext("2d");
// const period = document.getElementById("first");

let root = document.documentElement;

let CREATE_SENTENCE_COUNT = 1;
let SWITCH_CASE_NUMBER = 2;
let ENDING_REACHED = false;
const PUNC_REGEX = /[\'\".,\/#!$%\^&\*;:{}?=\-_`~()\‘\’\“\”]/g;
let speechContainer = document.querySelector(".speech-bubble");

let speechLineForWin = [
  {
    string: "You found all the punctuation and capital letters!!",
    speed: textRevealSpeeds.fast,
  },
  // {
  //   string: "Refresh the page to play again!",
  //   speed: textRevealSpeeds.fast,
  //   classes: ["green"],
  // },
];

let previousElement = null;
let isAnimating = false; // Add a flag to check if the animation is currently in progress

const errorMessage = document.getElementById("error-message");
const characterCount = document.getElementById("character-count");
const initialTypedSentence = document.getElementById("input-sentence");
const removePuncButton = document.getElementById("punc-button");
const createSentenceButton = document.getElementById("create-sentence-button");
const out1 = document.getElementById("output");
const footer = document.getElementById("footer");
const start = document.getElementById("start");
const startBanner = document.getElementById("banner");

const wordPlayOptions = document.getElementById("wordPlayOptions");
//const doWordPlayButton = document.querySelector(".create-wordplay-button");

const endingMessage1 = document.getElementById("ending_message_1");
const refreshButton = document.querySelector(".refresh-game-btn");

const characterControls = document.getElementById("control-buttons");
const shootButton = document.getElementById("shoot-button");
const leftButton = document.getElementById("left-button");
const switchButton = document.getElementById("switch-button");
const rightButton = document.getElementById("right-button");
const nameTag = document.getElementById("name-tag");
const hintButton = document.getElementById("hint-button");
const footNote = document.querySelector("#footnote");

//https://www.youtube.com/watch?v=MBaw_6cPmAw
const openModalButtons = document.querySelectorAll("[data-modal-target]");
const closeModalButtons = document.querySelectorAll("[data-close-button]");
const overlay = document.getElementById("overlay");

function spinLetter(letterSpan, fromChar, toChar, callback) {
  // Clean any previous content
  letterSpan.innerHTML = "";

  const reel = document.createElement("div");
  reel.className = "reel";

  const neighbors = getAlphabetNeighbors(fromChar);

  for (let ch of neighbors) {
    const face = document.createElement("span");
    face.textContent = ch;
    reel.appendChild(face);
  }

  letterSpan.appendChild(reel);

  setTimeout(() => {
    letterSpan.textContent = toChar;
    if (callback) callback();
  }, 900);
}

function getAlphabetNeighbors(letter) {
  const code = letter.charCodeAt(0);
  return [
    String.fromCharCode(code === 122 ? 97 : code + 1), // next
    letter,
    String.fromCharCode(code === 97 ? 122 : code - 1), // previous
  ];
}

// Swirl-then-settle animation for anagram words. The current word's letters are
// copied into absolutely-positioned overlays that drift/orbit in place
// (bubble-like), then glide into the next anagram's order before collapsing back
// to plain text. The original letters stay in normal flow but invisible, so they
// hold the line's box + baseline and the surrounding sentence never moves.
// `nextWord` is an anagram of the current text (same letters, new order).
function animateAnagramSwirl(span, nextWord, nextIndex) {
  if (span.dataset.anagramAnimating === "true") return;

  const currentWord = span.textContent;

  // Restore the span to a plain word once the letters have settled.
  const settle = () => {
    span.textContent = nextWord;
    span.className = `word-${nextIndex}`;
    span.style.position = "";
    span.dataset.anagramAnimating = "false";
  };

  // Reduced-motion users (and the degenerate empty case) just get the swap.
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || currentWord.length === 0) {
    settle();
    return;
  }

  span.dataset.anagramAnimating = "true";

  // Lay a word out as inline tiles and read each letter's position relative to
  // the span's own box.
  const renderInline = (word) => {
    span.innerHTML = word
      .split("")
      .map(
        (ch) =>
          `<span class="anagram-tile">${ch === " " ? "&nbsp;" : ch}</span>`,
      )
      .join("");
    const spanRect = span.getBoundingClientRect();
    return Array.from(span.querySelectorAll(".anagram-tile")).map((t) => {
      const r = t.getBoundingClientRect();
      return { left: r.left - spanRect.left, top: r.top - spanRect.top };
    });
  };

  // Measure where the new word's letters will land, then re-render the current
  // word as the in-flow tiles.
  const targets = renderInline(nextWord);
  const starts = renderInline(currentWord);
  const box = span.getBoundingClientRect();

  // Keep the span inline; its (now hidden) letters hold the box and baseline so
  // the rest of the sentence stays put. The visible, moving letters are absolute
  // overlays positioned within it.
  span.style.position = "relative";

  // The soap bubble: an absolute overlay centred on the word, sized a bit larger
  // so the letters have room to drift. It fades in together with the drift.
  const padX = 22;
  const padY = 16;
  const bubbleW = box.width + padX * 2;
  const bubbleH = box.height + padY * 2;
  const cx = box.width / 2;
  const cy = box.height / 2;
  const bubble = document.createElement("span");
  bubble.className = "anagram-bubble";
  bubble.style.width = bubbleW + "px";
  bubble.style.height = bubbleH + "px";
  bubble.style.left = cx + "px";
  bubble.style.top = cy + "px";
  span.appendChild(bubble);
  bubble.animate(
    [
      { opacity: 0, transform: "translate(-50%, -50%) scale(0.6)" },
      { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
    ],
    { duration: 320, easing: "ease-out", fill: "forwards" },
  );

  const spacers = Array.from(span.querySelectorAll(".anagram-tile"));
  const movers = spacers.map((sp, i) => {
    sp.style.visibility = "hidden";
    const m = document.createElement("span");
    m.textContent = currentWord[i] === " " ? " " : currentWord[i];
    m.style.position = "absolute";
    m.style.left = starts[i].left + "px";
    m.style.top = starts[i].top + "px";
    m.style.willChange = "transform";
    span.appendChild(m);
    return m;
  });

  // Map each source letter to a destination slot: for every position in the new
  // word, claim an unused source letter holding the same character.
  const used = new Array(movers.length).fill(false);
  const targetForMover = new Array(movers.length).fill(null);
  for (let j = 0; j < nextWord.length; j++) {
    for (let i = 0; i < movers.length; i++) {
      if (!used[i] && currentWord[i] === nextWord[j]) {
        used[i] = true;
        targetForMover[i] = targets[j];
        break;
      }
    }
  }

  const rand = (a, b) => a + Math.random() * (b - a);
  const waypoint = () =>
    `translate(${rand(-22, 22).toFixed(1)}px, ${rand(-18, 18).toFixed(
      1,
    )}px) rotate(${rand(-35, 35).toFixed(0)}deg)`;

  // Each letter drifts through a few random waypoints (the bubble swirl), then
  // the final keyframe lands it exactly on its destination slot.
  const finished = movers.map((m, i) => {
    const tgt = targetForMover[i] || starts[i];
    const endDX = tgt.left - starts[i].left;
    const endDY = tgt.top - starts[i].top;
    const anim = m.animate(
      [
        { transform: "translate(0px, 0px) rotate(0deg)" },
        { transform: waypoint(), offset: 0.2 },
        { transform: waypoint(), offset: 0.45 },
        { transform: waypoint(), offset: 0.7 },
        { transform: `translate(${endDX}px, ${endDY}px) rotate(0deg)` },
      ],
      { duration: 1500, easing: "ease-in-out", fill: "forwards" },
    );
    return anim.finished;
  });

  // Burst the bubble once the letters have settled: a quick scale-up + fade plus
  // a ring of droplets flung outward.
  const popBubble = () => {
    for (let k = 0; k < 8; k++) {
      const drop = document.createElement("span");
      drop.className = "anagram-droplet";
      drop.style.left = cx + "px";
      drop.style.top = cy + "px";
      span.appendChild(drop);
      const ang = (k / 8) * Math.PI * 2 + rand(-0.3, 0.3);
      const dist = rand(bubbleW * 0.4, bubbleW * 0.6);
      drop.animate(
        [
          { transform: "translate(-50%, -50%) scale(1)", opacity: 0.95 },
          {
            transform: `translate(calc(-50% + ${(Math.cos(ang) * dist).toFixed(
              1,
            )}px), calc(-50% + ${(Math.sin(ang) * dist).toFixed(
              1,
            )}px)) scale(0.2)`,
            opacity: 0,
          },
        ],
        { duration: 420, easing: "ease-out", fill: "forwards" },
      );
    }
    return bubble.animate(
      [
        { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
        { transform: "translate(-50%, -50%) scale(1.2)", opacity: 0 },
      ],
      { duration: 280, easing: "ease-out", fill: "forwards" },
    ).finished;
  };

  Promise.all(finished).then(popBubble).then(settle).catch(settle);
}

// Homophones sound identical but are spelled differently, so the swap plays as a
// "struck tuning fork": the word shudders with a damped lateral vibration (the
// shared pitch ringing out) while a metallic shimmer sweeps across, and the
// spelling morphs under the brightest pass of the sweep. One shared pitch, a new
// spelling — the audio-flavoured cousin of the anagram swirl / ambigram spin.
function animateHomophoneShiver(span, nextWord, nextIndex) {
  if (span.dataset.homophoneAnimating === "true") return;

  // Leave the span as a plain word so the next hit can read className/textContent.
  const settle = () => {
    span.textContent = nextWord;
    span.className = `word-${nextIndex}`;
    span.style.position = "";
    span.style.transform = "";
    span.dataset.homophoneAnimating = "false";
  };

  // Reduced-motion users (and the degenerate empty case) just get the swap.
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || span.textContent.length === 0) {
    settle();
    return;
  }

  span.dataset.homophoneAnimating = "true";

  const box = span.getBoundingClientRect();
  const currentWord = span.textContent;

  // Hold the text in an inner span so its spelling can crossfade without wiping
  // the shimmer overlay that sits alongside it.
  span.style.position = "relative";
  span.innerHTML = `<span class="homophone-word">${currentWord}</span>`;
  const wordEl = span.querySelector(".homophone-word");

  const padX = 12;
  const padY = 7;
  const shimmer = document.createElement("span");
  shimmer.className = "homophone-shimmer";
  shimmer.style.left = -padX + "px";
  shimmer.style.top = -padY + "px";
  shimmer.style.width = box.width + padX * 2 + "px";
  shimmer.style.height = box.height + padY * 2 + "px";
  span.appendChild(shimmer);

  const dur = 520;

  // Damped lateral vibration + a hair of rotation = a struck tuning fork ringing
  // down to rest. Amplitude decays to 0 so the word settles flush in place.
  const N = 22;
  const maxAmp = 5.5;
  const cycles = 6;
  const vibe = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const s = Math.sin(t * Math.PI * 2 * cycles) * maxAmp * (1 - t);
    vibe.push({
      transform: `translateX(${s.toFixed(2)}px) rotate(${(s * 0.2).toFixed(
        2,
      )}deg)`,
    });
  }
  span.animate(vibe, { duration: dur, easing: "linear" });

  // The shimmer sweeps left→right, brightest across the middle of the ring.
  shimmer.animate(
    [
      { transform: "translateX(-120%)", opacity: 0 },
      { transform: "translateX(-25%)", opacity: 1, offset: 0.35 },
      { transform: "translateX(25%)", opacity: 1, offset: 0.6 },
      { transform: "translateX(120%)", opacity: 0 },
    ],
    { duration: dur, easing: "ease-in-out", fill: "forwards" },
  );

  // Crossfade the spelling under the shimmer's brightest pass: dip the word out,
  // swap the letters at the trough, fade the new spelling back in.
  wordEl.animate(
    [{ opacity: 1 }, { opacity: 0.1, offset: 0.5 }, { opacity: 1 }],
    { duration: 300, delay: dur * 0.28, easing: "ease-in-out" },
  );
  setTimeout(
    () => {
      if (wordEl.isConnected) wordEl.textContent = nextWord;
    },
    dur * 0.28 + 150,
  );

  setTimeout(settle, dur + 40);
}

/* ── §2.5 THE SHELF FAN ───────────────────────────────────────────────────────────────────────────
   docs/punctuators-ladder.md §2.5. Keen Arrow's hit no longer swaps the word behind your back — it
   fans the word's narrower kinds out beneath it as a row of shootable words, and you pick one by
   walking under it and firing. The descent was always deterministic (unvisited-first, §13.7), but it
   READ as random: two siblings carry an identical rung strip and share one flare, so a sideways hop
   looked exactly like a narrowing. The unvisited-first rule survives intact — it now chooses the
   row's contents instead of choosing for you, so the Tree of Kinds still steers the game (§13.7).
   The leaf sidestep itself is gone: Keen Arrow goes DOWN OR NOT AT ALL, and the sideways move is
   reached by broadening to the parent and narrowing again, where the parent's row is the sibling
   list. Drawing the row is what made that possible — shelves fill from the parent either way.

   Horizontal is forced, not chosen. Projectiles fly straight up with no aiming (velocity {x:0,y:-10},
   see shoot()), so a word's x-range IS its selectability; a vertical stack or an arc cannot be aimed
   at, because you would always hit whatever sits lowest.

   Three things here are load-bearing:

   1. The row lives in <body> as position:fixed, NOT inside the .word-ladder span. Inside, the span's
      own `textContent = …` on the next landing would wipe it, and anything in normal flow would
      reflow the sentence and move every OTHER word's hit rectangle — the same reason §2.4's rung
      strip is an absolutely positioned ::after.
   2. nodeArr is filled once, by the MutationObserver in waitForElement, which then DISCONNECTS. A
      span created after the sentence renders is never collision-tested, so each child is pushed in by
      hand — and spliced back out on close, because a detached node's getBoundingClientRect() is all
      zeros and would otherwise leave a phantom hit box parked in the top-left corner eating shots.
   3. Children carry id = LADDER_ID so the existing collision gate matches them unchanged; the branch
      splits on data-ladder-child, so there is still one ladder path through animate(), not two. */

const SHELF_FAN_MAX = 7; // wider than this stops reading as a set at a glance
const SHELF_FAN_MIN = 3; // narrower than this is not a choice
const SHELF_FAN_DROP = 30; // px of branch-line between the word and the row, clear of the rung strip

let shelfFan = null; // { el, host, children: [span] } — at most one open at a time

/* Measured per draw rather than assumed: #output is 300% on a desktop and 30px on a phone, so the
   same row is ~11 words wide in one and ~5 in the other. */
function shelfFanWidth() {
  const em = parseFloat(getComputedStyle(out1).fontSize) || 48;
  const slot = em * 0.45 * 4.6; // a child renders at 0.45em; ~7 characters of advance plus its gap
  const fits = Math.floor((window.innerWidth - 32) / slot);
  return Math.max(SHELF_FAN_MIN, Math.min(SHELF_FAN_MAX, fits));
}

/* §6: the branch lines draw outward from the word as the fan opens — "here are the many" — and the
   lens snap then plays on the child you shoot. Lengths differ per line, so the dash length is set
   per element and CSS animates the offset to zero. */
function drawShelfFanLines(el, wordRect, children) {
  const box = el.getBoundingClientRect();
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "shelf-fan-lines");
  svg.setAttribute("width", box.width);
  svg.setAttribute("height", SHELF_FAN_DROP);
  svg.setAttribute("viewBox", `0 0 ${box.width} ${SHELF_FAN_DROP}`);

  const fromX = wordRect.left + wordRect.width / 2 - box.left;
  for (const kid of children) {
    const k = kid.getBoundingClientRect();
    const toX = k.left + k.width / 2 - box.left;
    const line = document.createElementNS(NS, "line");
    line.setAttribute("x1", fromX);
    line.setAttribute("y1", 0);
    line.setAttribute("x2", toX);
    line.setAttribute("y2", SHELF_FAN_DROP);
    const len = Math.hypot(toX - fromX, SHELF_FAN_DROP);
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;
    svg.appendChild(line);
  }
  el.appendChild(svg);
}

/** Open the shelf beneath `span`. Returns false when there is nothing to show — that is a clank.
 *  `pulse` is false when a landing animation has already marked the word (§6): pickRung re-opens the
 *  fan on the rung it just landed on, and the aperture flicker would fire on top of the lens snap. */
function openShelfFan(span, hero, pulse = true) {
  closeShelfFan();

  const word = span.getAttribute("data-ladder-word");
  if (!word) return false;
  const shelf = shelfFor(word, shelfFanWidth(), ladderMapHas);
  if (!shelf) return false;

  const el = document.createElement("div");
  el.className = "shelf-fan";
  el.style.setProperty("--ladder-color", hero.characterColor);

  const row = document.createElement("div");
  row.className = "shelf-fan-row";
  const children = [];
  for (const item of shelf.items) {
    const kid = document.createElement("span");
    kid.id = LADDER_ID; // the collision gate matches on id …
    kid.dataset.ladderChild = "1"; // … and the ladder branch splits on this
    kid.dataset.word = item.word;
    kid.className = "shelf-child" + (item.branch ? " branch" : "");
    kid.textContent = item.word;
    row.appendChild(kid);
    children.push(kid);
  }
  el.appendChild(row);

  const caption = document.createElement("div");
  caption.className = "shelf-fan-caption";
  // Two different counts, deliberately both here (§13.5, §13.6). `7/33 found` is how much of this
  // shelf you have ever lit — the map's number, brought to where you are playing. `+26 more` is how
  // much of it didn't fit on the row: honest about what is left, but never naming it, because a
  // printed leaf name is a readable answer.
  const prog = shelfProgress(word, ladderMapHas);
  const bits = [`kinds of ${word}`];
  if (prog) bits.push(`${prog.lit}/${prog.total} found`);
  if (shelf.hidden > 0) bits.push(`+${shelf.hidden} more`);
  caption.textContent = bits.join(" · ");
  if (prog && prog.lit === prog.total) caption.classList.add("done"); // a finished shelf goes gold
  el.appendChild(caption);

  // Pinned to the left edge before measuring: the row is shrink-to-fit, so measuring it at its
  // static position would let a cramped origin wrap what should be one line.
  el.style.left = "0px";
  document.body.appendChild(el);

  const rect = span.getBoundingClientRect();
  el.style.top = `${rect.bottom + SHELF_FAN_DROP}px`;
  const w = el.offsetWidth;
  el.style.left = `${Math.max(
    8,
    Math.min(window.innerWidth - w - 8, rect.left + rect.width / 2 - w / 2),
  )}px`;

  drawShelfFanLines(el, rect, children);

  for (const kid of children) nodeArr.push(kid); // see note 2 above
  shelfFan = { el, host: span, children };

  // The shot has to register on the word itself too, or opening the fan reads as something that
  // happened next to the word rather than to it. The fan is not a swap — the word stays put — so
  // §6's mark here is an aperture flicker in the hero's colour rather than a movement.
  if (pulse) flashLadder(span, hero, "ladder-aperture");
  // §7. `pulse` is false exactly when a landing just happened, which is also exactly when the
  // flutter should wait a beat for _keenHit's tick.
  _keenFan(children.length, pulse ? 0 : 0.07);
  return true;
}

function closeShelfFan() {
  if (!shelfFan) return;
  // Splice, don't merely detach: a removed node's rect is all zeros, so a leftover entry would keep
  // matching shots fired near the left edge for the rest of the round (note 2).
  //
  // This can run mid-iteration of animate()'s nodeArr.forEach, which sounds like the classic
  // mutate-while-iterating bug and isn't: the children are always pushed as a contiguous tail, so
  // removing them either ends the walk early (when the shot hit a child, and everything before it
  // has already been visited) or trims only the tail (when the shot hit a sentence word). Either
  // way nothing still on the board is skipped.
  for (const kid of shelfFan.children) {
    const i = nodeArr.indexOf(kid);
    if (i !== -1) nodeArr.splice(i, 1);
  }
  shelfFan.el.remove();
  shelfFan = null;
}

/* ── Shelf milestones (§13.6) ─────────────────────────────────────────────────────────────────── */

/* The map's own metric, announced where it is earned. A shelf's progress is derived, so nothing here
   is stored — the banner is a reading of the visited set at the moment a word lit, and re-lighting
   the same word can never fire it twice because ladderMapVisit only returns true the first time.
 *
 * Above the word rather than below it: §2.5's fan owns the space underneath, and the two can be on
 * screen together — completing a shelf is exactly the shot that opens the next one. */
let shelfToast = null;

function clearShelfMilestone() {
  if (!shelfToast) return;
  clearTimeout(shelfToast.t);
  shelfToast.el.remove();
  shelfToast = null;
}

function showShelfMilestone(span, word, prog, ms) {
  clearShelfMilestone();
  const el = document.createElement("div");
  el.className = "shelf-milestone" + (ms.tier === 3 ? " complete" : "");
  el.textContent = `★ ${prog.lit} of ${prog.total} kinds of ${word} · ${ms.label}`;
  // Same measure-then-place order as the fan: pinned left so a shrink-to-fit box is measured at
  // full width rather than wrapped by a cramped origin.
  el.style.left = "0px";
  document.body.appendChild(el);
  const rect = span.getBoundingClientRect();
  const w = el.offsetWidth;
  el.style.left = `${Math.max(
    8,
    Math.min(window.innerWidth - w - 8, rect.left + rect.width / 2 - w / 2),
  )}px`;
  el.style.top = `${Math.max(4, rect.top - el.offsetHeight - SHELF_FAN_DROP)}px`;
  shelfToast = { el, t: setTimeout(clearShelfMilestone, 2400) };
}

/* Called only when ladderMapVisit reported a word NEWLY lit. A word's arrival advances its PARENT's
   shelf, not its own — the shelf you were picking from is the one that just got fuller. */
function noteShelfProgress(span, word) {
  const parent = ladderParentOf(word);
  if (!parent) return;
  const prog = shelfProgress(parent, ladderMapHas);
  if (!prog) return;
  const ms = shelfMilestoneCrossed(prog.lit, prog.total);
  if (!ms) return;
  showShelfMilestone(span, parent, prog, ms);
  // A beat behind the landing cue, which is playing on the same shot.
  _shelfMilestone(ms.tier, 0.16);
}

/* The fan is anchored to a viewport rectangle that a resize invalidates, and nothing else re-measures
   it — so drop it and let the next shot redraw. The banner is anchored the same way. */
window.addEventListener("resize", () => {
  closeShelfFan();
  clearShelfMilestone();
});

/* A glow in the hero's own colour, for the two moments where the word does NOT move: the fan
   opening on it, and the capstone — at the top of the ladder `animal` IS the answer, so that one is
   a good moment, not a miss. Both are drop-shadow rather than text-shadow, so they layer over the
   black outline landOnRung writes instead of blanking it for the length of the flare. */
function flashLadder(span, hero, className) {
  span.style.setProperty("--ladder-color", hero.characterColor);
  span.classList.remove("ladder-aperture", "ladder-capstone");
  void span.offsetWidth; // restart the animation on a repeat hit
  span.classList.add(className);
  setTimeout(() => span.classList.remove(className), 620);
}

/* §6, the landing animations. Both rebuild the span for the length of a swap as an in-flow `face`
   (the new rung — it holds the box, so the sentence reflows once and only once) plus an absolutely
   positioned `ghost` (the rung being left behind, out of flow so it can swell or shrink freely),
   and both leave the span as plain text at the new rung when they finish — animateAnagramSwirl's
   settle() discipline — because the word has to be hittable again immediately.

   A sequence token guards that settle. A second shot can land while the first swap is still in
   flight, and the stale animation must not write its old word back over the new one. */
let ladderAnimSeq = 0;

function animateLadderSwap(span, fromWord, toWord, hero) {
  const seq = String(++ladderAnimSeq);
  span.dataset.ladderSeq = seq;

  const settle = () => {
    if (span.dataset.ladderSeq !== seq) return; // a later shot owns the span now
    span.textContent = toWord;
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    settle();
    return;
  }

  span.textContent = "";

  const face = document.createElement("span");
  face.className = "ladder-face";
  face.textContent = toWord;
  span.appendChild(face);

  const ghost = document.createElement("span");
  ghost.className = "ladder-ghost";
  ghost.textContent = fromWord;
  span.appendChild(ghost);

  const anims =
    hero.ladderDirection === "up"
      ? ladderPullBack(face, ghost)
      : ladderLensSnap(face, ghost);

  Promise.all(anims.map((a) => a.finished)).then(settle, settle);
}

/* General Ization — the camera pulls back. The word you shot shrinks away to a point while the
   broader one fades in oversized behind it and settles at normal size: you are not looking at a
   different word, you are standing further back from the same thing. */
function ladderPullBack(face, ghost) {
  return [
    ghost.animate(
      [
        { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
        { transform: "translate(-50%, -50%) scale(0.4)", opacity: 0 },
      ],
      { duration: 380, easing: "ease-in", fill: "forwards" },
    ),
    face.animate(
      [
        { transform: "scale(1.75)", opacity: 0 },
        { transform: "scale(1.6)", opacity: 0.5, offset: 0.3 },
        { transform: "scale(1)", opacity: 1 },
      ],
      { duration: 560, easing: "cubic-bezier(.2,.7,.3,1)", fill: "backwards" },
    ),
  ];
}

/* Keen Arrow — the lens snaps in. The broader word swells and goes soft, as if the focal plane were
   sliding off it, and the narrower one drops into focus a beat later with a hair of overshoot.
   `fill: backwards` holds the face hidden through that beat; its last keyframe is the span's own
   resting state, so nothing needs to be held forwards afterwards. */
function ladderLensSnap(face, ghost) {
  return [
    ghost.animate(
      [
        {
          transform: "translate(-50%, -50%) scale(1)",
          filter: "blur(0px)",
          opacity: 1,
        },
        {
          transform: "translate(-50%, -50%) scale(1.9)",
          filter: "blur(6px)",
          opacity: 0,
        },
      ],
      { duration: 320, easing: "ease-out", fill: "forwards" },
    ),
    face.animate(
      [
        { transform: "scale(0.6)", filter: "blur(7px)", opacity: 0 },
        {
          transform: "scale(1.08)",
          filter: "blur(0px)",
          opacity: 1,
          offset: 0.72,
        },
        { transform: "scale(1)", filter: "blur(0px)", opacity: 1 },
      ],
      {
        duration: 420,
        delay: 110,
        easing: "cubic-bezier(.3,1.1,.5,1)",
        fill: "backwards",
      },
    ),
  ];
}

/* §6: the child you shot is pulled out of the row and into the word — "you picked one". It flies as
   a fixed, pointer-events:none clone rather than as the real child, because closeShelfFan has
   already spliced that one out of nodeArr (note 2) and a second hit on it must be impossible. */
function flyPickedChild(from, to, text, color) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const clone = document.createElement("span");
  clone.className = "shelf-child shelf-child-picked";
  clone.textContent = text;
  clone.style.left = `${from.left}px`;
  clone.style.top = `${from.top}px`;
  clone.style.setProperty("--ladder-color", color);
  document.body.appendChild(clone);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const done = () => clone.remove();
  clone
    .animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        {
          transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(
            1,
          )}px) scale(1.6)`,
          opacity: 0,
        },
      ],
      { duration: 340, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" },
    )
    .finished.then(done, done);
}

/* Move the word to `rung` and leave the span consistent. Shared by both directions: General reaches
   it with the parent, Keen with whichever child you shot out of the fan. */
function landOnRung(span, rung, hero) {
  // A swap may still be in flight, in which case the span's own textContent is face + ghost run
  // together and the face is the only honest reading of what is on screen.
  const inFlight = span.querySelector(".ladder-face");
  const shown = inFlight ? inFlight.textContent : span.textContent;
  const original = span.getAttribute("data-ladder-orig") || shown;
  const plural = span.getAttribute("data-ladder-plural") === "1";

  span.setAttribute("data-ladder-word", rung);

  // Recomputed, not carried: which child you shoot out of the fan decides the path, so the chain
  // through this rung is only known once you have picked it. Frozen at wrap time it would start
  // lying on the first descent that took anything but the first child.
  const chain = ladderChainFor(rung);
  span.setAttribute("data-ladder", chain.join(","));
  span.setAttribute("data-rung", String(chain.indexOf(rung)));
  span.setAttribute("data-rung-strip", ladderRungStrip(rung));

  span.style.color = hero.characterColor;
  span.style.textShadow =
    "1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000";
  const newlyLit = ladderMapVisit(rung);
  // §7. The landing sound is the direction's, not the hero's generic hit — see the note on the two
  // hero classes for why hitProjectileSound() is silent for these two.
  if (hero.ladderDirection === "up") _izoHit();
  else _keenHit();
  animateLadderSwap(span, shown, renderRung(rung, original, plural), hero);
  // After the swap, not before: the face carries the new word's width the moment it is built, so the
  // banner is measured against the box the word actually ends up holding.
  if (newlyLit) noteShelfProgress(span, rung);
}

/* One ladder action per shot, for two reasons. A projectile is not spliced out until a
   setTimeout(…, 0), so without a latch it registers on the same span in consecutive frames; and with
   §2.5's fan the row sits directly in the flight path, so a single shot would otherwise pick a child
   and then go on to climb the word standing behind it. */
function claimLadderShot(projectile) {
  if (!projectile) return true;
  if (projectile.ladderDone) return false;
  projectile.ladderDone = true;
  return true;
}

function climbLadder(span, hero, projectile) {
  if (!claimLadderShot(projectile)) return;

  const current = span.getAttribute("data-ladder-word");
  if (!current) return;

  // Standing on a rung counts as landing on it, so the word you typed lights the first time you
  // shoot it — even on a shot that cannot move (§13.6). A word typed straight out of a wide shelf
  // can therefore be the one that crosses a milestone, before it has moved anywhere.
  if (ladderMapVisit(current)) noteShelfProgress(span, current);
  span.setAttribute("data-rung-strip", ladderRungStrip(current));

  if (hero.ladderDirection === "up") {
    // Broadening has no shelf to offer, and a row of narrower kinds is noise when the goal is to
    // zoom out — so General closes any open fan (§2.5.2).
    closeShelfFan();
    const next = ladderParentOf(current);
    if (!next) {
      flashLadder(span, hero, "ladder-capstone"); // the capstone: `animal` IS the answer
      _ladderCapstone();
      return;
    }
    landOnRung(span, next, hero);
    return;
  }

  // Keen Arrow shows the shelf rather than choosing from it, and goes down or not at all — a clank
  // means simply "this word has no narrower kinds". General Ization is the way out of one.
  if (!openShelfFan(span, hero)) {
    flashLadder(span, hero, "ladder-capstone");
    _ladderCapstone(); // the same chime as the top: a leaf having no kinds is a fact, not a miss
  }
}

/* Shooting one of the fanned words. The word becomes that rung and the fan re-opens on it, so a run
   of shots reads as a descent rather than as a sequence of unrelated swaps. */
function pickRung(kid, hero, projectile) {
  if (!claimLadderShot(projectile)) return;
  // Guard against a child left over from a fan that has already closed.
  if (!shelfFan || !shelfFan.children.includes(kid)) return;

  const host = shelfFan.host;
  const rung = kid.dataset.word;
  // Measured before the row goes: a detached node's rect is all zeros (note 2).
  const kidRect = kid.getBoundingClientRect();
  const kidText = kid.textContent;

  closeShelfFan();
  landOnRung(host, rung, hero);
  // After the landing, not before — the face carries the new word's width the moment it is built,
  // so the word is already the size the clone should be flying into.
  flyPickedChild(kidRect, host.getBoundingClientRect(), kidText, hero.characterColor);
  // No aperture flicker: the lens snap landOnRung just started is this shot's mark on the word.
  openShelfFan(host, hero, false);
}

/* ── WORD RACE (docs/punctuators-ladder.md §12) ───────────────────────────────────────────────────

   Type to summon, shoot to travel. Going UP needs no typing — there is only ever one parent, so
   General shoots the rung floating above you. Going DOWN is where the typing lives: name a narrower
   kind, it spawns beneath you, and Keen Arrow shoots it to travel there.

   Why typing at all, when no other Punctuators mode asks for it (§14.1): branching is simply too
   wide to draw. `person` has 805 children, `fish` 221 — a "shoot one of the children shown" field
   can only ever show a subset, and if that subset is guaranteed to contain the route, it telegraphs
   the answer. The shootable field survives as easy mode instead (decoysFor in ladderRace.js).

   M9 is the engine only: one hardcoded pair, no daily, no stats, no share, no route overlay. The
   daily and its map lock are M10, the win card and easy mode are M11.
*/

// The doc's own worked example (§12.3), par 5. M10 replaces this with the frozen daily pair list.
const RACE_PAIR = { start: "poodle", target: "salmon" };

let race = null; // the run in progress, from createRace()
let raceEls = null; // {up, here, down} — resolved once after the field renders, then rewritten in place
let raceSummoned = ""; // the word currently sitting in Keen's slot, "" when empty

function raceActive() {
  return race !== null;
}

/* The three spans are built once and only ever rewritten, never replaced — see raceFieldHTML for
   why that matters to nodeArr. This resolves them after the initial render. */
function bindRaceField() {
  raceEls = {
    up: out1.querySelector(".race-up"),
    here: out1.querySelector(".race-here"),
    down: out1.querySelector(".race-down"),
  };
  return !!(raceEls.up && raceEls.here && raceEls.down);
}

function setRaceSpan(el, word, placeholder) {
  el.dataset.raceWord = word || "";
  el.textContent = word || placeholder;
  el.classList.toggle("race-none", !word);
}

function updateRaceField() {
  if (!raceEls) return;
  setRaceSpan(raceEls.up, race.up(), "— the top —");
  setRaceSpan(raceEls.here, race.at, race.at);
  setRaceSpan(raceEls.down, raceSummoned, "type a narrower kind");
  paintRaceBanner();
}

/* The status line. Deliberately thin in M9 — it says where you're going, what par is and what
   you've spent, and nothing else; §12.3's stats, streak and share are M10's. */
function paintRaceBanner() {
  const bar = document.getElementById("race-banner");
  if (!bar || !race) return;
  const bits = [
    `<strong>${race.start}</strong> ⟶ <strong>${race.target}</strong>`,
    `Par ${race.par}`,
    `${race.moves} move${race.moves === 1 ? "" : "s"}`,
  ];
  if (race.detours) bits.push(`${race.detours} detour${race.detours === 1 ? "" : "s"}`);
  const hint = race.hint();
  if (hint) bits.push(hint);
  bar.innerHTML = bits.join(" · ");
  bar.classList.toggle("solved", race.solved);
}

function raceSay(text, tone = "") {
  errorMessage.style.color = tone;
  errorMessage.innerText = text;
}

/* Three kinds of "no", and they must sound different (§12.2) — lumping them together is what makes
   a typing game feel broken. The third is not the player's fault at all: the word is real, the data
   just lacks it, so it costs nothing and must never read as "you were wrong". */
function summonFromMoveBox() {
  if (!raceActive() || race.solved) return;
  const typed = initialTypedSentence.value;
  if (!typed.trim()) return;

  const verdict = classifyGuess(typed, race.at);
  switch (verdict.kind) {
    case GUESS.OK:
      raceSummoned = verdict.word;
      updateRaceField();
      raceSay(
        verdict.via === "alt"
          ? `yes — and ${verdict.word} is also a kind of ${ancestorsOf(verdict.word)[0]}. Shoot it with Keen Arrow.`
          : `${verdict.word} — shoot it with Keen Arrow.`,
        "black",
      );
      initialTypedSentence.value = "";
      break;
    case GUESS.BROADER:
      raceSay(`${verdict.word} is BROADER than ${race.at} — switch to General Ization and shoot upward.`);
      break;
    case GUESS.SAME:
      raceSay(`you're standing on ${verdict.word}.`);
      break;
    case GUESS.UNRELATED:
      raceSay(`${verdict.word} isn't a kind of ${race.at}.`);
      break;
    default:
      // Apologetic on purpose: five of the thirty guesses §12.2 probed were simply absent.
      raceSay(`${verdict.word || "that"} isn't in my book — try another word. (No cost.)`);
      break;
  }
}

/* Landing. A descendant jump crosses every rung between, so `beagle` from `dog` is two rungs for
   one shot — and each of them lights on the Tree of Kinds, which §13 fills from every ladder mode
   alike. Only the rungs actually travelled light: the map is a record of where you have been. */
function raceTravel(word, hero) {
  const before = race.at;

  // The rungs this move actually passes through. Going up that is just the parent; going down it is
  // every ancestor of the landing word that sits BELOW where we stood, nearest-first, plus the word
  // itself — so `beagle` from `dog` lights `hound` on the way. A jump taken through an alt edge
  // (§12.2) has no such intermediates: `tree` is nowhere in oak's main chain, indexOf returns -1,
  // and the move correctly lights only the word landed on.
  const above = ancestorsOf(word);
  const stop = above.indexOf(before);
  const crossed =
    hero.ladderDirection === "up" || stop === -1
      ? [word]
      : [...above.slice(0, stop), word];

  const { detour, solved } = race.travelTo(word);
  raceSummoned = "";
  for (const w of crossed) ladderMapVisit(w);

  if (hero.ladderDirection === "up") _izoHit();
  else _keenHit();
  updateRaceField();

  if (solved) {
    _ladderCapstone();
    raceSay(
      `✔ ${race.target} — ${race.moves} moves against par ${race.par}` +
        (race.detours ? `, ${race.detours} detour${race.detours === 1 ? "" : "s"}` : ""),
      "black",
    );
    initialTypedSentence.disabled = true;
  } else if (detour) {
    raceSay(`${word} — that's not closer.`);
  } else {
    raceSay("");
  }
}

/* Keen's target. An empty slot is a clank rather than a rejection: nothing has been named yet. */
function raceShootDown(span, hero, projectile) {
  if (!claimLadderShot(projectile) || !raceActive() || race.solved) return;
  const word = span.dataset.raceWord;
  if (!word) {
    flashLadder(span, hero, "ladder-capstone");
    _ladderCapstone();
    raceSay("name a narrower kind first — type it in the box.");
    return;
  }
  raceTravel(word, hero);
}

/* General's target. At a root there is nothing above, which is the capstone, not a miss. */
function raceShootUp(span, hero, projectile) {
  if (!claimLadderShot(projectile) || !raceActive() || race.solved) return;
  const word = span.dataset.raceWord;
  if (!word) {
    flashLadder(span, hero, "ladder-capstone");
    _ladderCapstone();
    raceSay(`${race.at} is the top of its tree — nothing is broader.`);
    return;
  }
  raceTravel(word, hero);
}

const buttonSounds = {
  clicky: new Howl({
    src: ["./sounds/click.mp3"],
  }),
};

refreshButton.addEventListener("click", () => {
  refreshButton.classList.add("go-away");
  location.reload();
});

//Might be able to use Intersection Observer to make this more efficient
// console.log("per", period.getBoundingClientRect());

//number accounts for the padding and height of the inputs. Need to fix for when that goes away
canvas.width = innerWidth - 4;
canvas.height = innerHeight - 50;

//When the sentence is first loaded it shows the team. We set this to True and then any button pressed will just bring up first character
let bRightAfterSentenceIsLoaded = false;
let dropDownSelection = "";

removePuncButton.addEventListener("click", async () => {
  buttonSounds.clicky.play();
  closeShelfFan(); // a new sentence invalidates any shelf left open over the old one
  clearShelfMilestone(); // …and any banner still hanging over where a word used to be
  // Word Race is the one mode that starts with an empty box, because the box isn't a sentence here
  // — it is the move box the player types destinations into once the race is running (§12.2).
  if (!initialTypedSentence.value && wordPlayOptions.value !== "wordRace") {
    return (errorMessage.innerText = "Field cannot be blank");
  }

  // Hide Typing Game link once main game starts
  const typingLink = document.getElementById("typing-game-link");

  let selectedOption = wordPlayOptions.value;
  dropDownSelection = selectedOption;
  if (selectedOption === "removePunc") {
    if (!PUNC_REGEX.test(initialTypedSentence.value)) {
      return (errorMessage.innerText = "Sentence must have punctuation!");
    }
    let punctuated = addSpansAndIds(initialTypedSentence.value, out1);
  } else {
    if (
      selectedOption === "anagrams" &&
      !hasAnagrams(initialTypedSentence.value)
    ) {
      return (errorMessage.innerText =
        "No anagrams found in your sentence — try different words!");
    }
    if (
      selectedOption === "homophones" &&
      !hasHomophones(initialTypedSentence.value)
    ) {
      return (errorMessage.innerText =
        "No homophones found in your sentence — try different words!");
    }
    if (
      selectedOption === "ambigrams" &&
      !hasAmbigrams(initialTypedSentence.value)
    ) {
      return (errorMessage.innerText =
        "No ambigrams found in your sentence — try different words!");
    }
    if (selectedOption === "ladder") {
      // The only mode whose corpus is fetched rather than bundled. Awaiting here is what keeps
      // hasLadders/wrapLadders synchronous everywhere else (docs/punctuators-ladder.md §3.3).
      // #error-message is red by default, so borrow it in black: this is progress, not a fault.
      errorMessage.style.color = "black";
      errorMessage.innerText = "Loading the ladder…";
      try {
        await loadLadders();
      } catch (e) {
        errorMessage.style.color = "";
        return (errorMessage.innerText =
          "Couldn't load the ladder — try again.");
      }
      errorMessage.style.color = "";
      errorMessage.innerText = "";
      if (!hasLadders(initialTypedSentence.value)) {
        return (errorMessage.innerText =
          "No ladder words found in your sentence — try naming some things!");
      }
    }
    if (selectedOption === "wordRace") {
      // Same lazy corpus as the ladder, plus ladderAltPOJO.js — the answer-checking map that makes
      // typing fair (§12.2). Only this mode fetches it, which is why it ships as its own file.
      errorMessage.style.color = "black";
      errorMessage.innerText = "Loading the race…";
      try {
        await loadRace();
      } catch (e) {
        errorMessage.style.color = "";
        return (errorMessage.innerText = "Couldn't load the race — try again.");
      }
      errorMessage.style.color = "";
      errorMessage.innerText = "";
      race = createRace(RACE_PAIR);
      raceSummoned = "";
      ladderMapVisit(race.at); // where you start counts as somewhere you've been (§13)
      // The column layout goes on #output, not on a wrapper span — see raceFieldHTML for why a
      // wrapper would empty the team.
      out1.classList.add("race-mode");
      addSpansAndIdsForWordPlay(raceFieldHTML(race), out1, selectedOption);
    } else {
      addSpansAndIdsForWordPlay(initialTypedSentence.value, out1, selectedOption);
    }
  }
  mySong.stop();
  // Everything goes away except, in a race, the sentence box — which becomes the move box and has
  // to stay on screen and usable for the whole run (§12.2).
  setClassName(
    "go-away",
    ...(selectedOption === "wordRace" ? [] : [initialTypedSentence]),
    removePuncButton,
    startBanner,
    wordPlayOptions,
    typingLink,
  );
  if (selectedOption === "wordRace") {
    initialTypedSentence.value = "";
    initialTypedSentence.placeholder = "name a narrower kind, then press Enter";
    initialTypedSentence.disabled = false;
    if (bindRaceField()) updateRaceField();
    initialTypedSentence.focus();
  }

  // The native <select> is hidden by CSS and replaced by a custom dropdown
  // (.custom-select-wrapper, built in index.html). Hiding the select alone
  // leaves the visible wrapper on screen, so hide the wrapper too. Use
  // classList.add (not setClassName) to keep the wrapper class intact.
  const selectWrapper = wordPlayOptions.closest(".custom-select-wrapper");
  if (selectWrapper) selectWrapper.classList.add("go-away");

  if (dropDownSelection === "alphabetNeighbors") {
    updateCharacterModal("alphabetNeighbors");
  } else if (dropDownSelection === "ladder") {
    updateCharacterModal("ladder");
  }
  // else if (dropDownSelection === "rounded") {
  //   updateCharacterModal("rounded");
  // }

  setClassName("grid-container", characterControls);

  // A race writes its own status into #error-message as you play, so clearing it here would wipe
  // the line that just told the player where they're going.
  if (selectedOption !== "wordRace") errorMessage.innerText = "";
  bRightAfterSentenceIsLoaded = true;
});

/* The move box (§12.2). Enter summons; the keydown guard added to the movement handler is what
   keeps `a`/`d`/the arrows from walking the hero while the player types the word. */
initialTypedSentence.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || !raceActive()) return;
  event.preventDefault();
  summonFromMoveBox();
});

//const modal = document.querySelector(button.dataset.modalTarget);

function updateCharacterModal(selection) {
  const templates = {
    alphabetNeighbors: `
    <div class="char-modal">
      <h2>Betar — Alphabet Slots</h2>
      <p class="lead">
        An alphabet neighbor is the letter directly before or after a letter in the alphabet
        (with wrap-around: <code>a</code> ↔ <code>z</code>). Betar spins one letter to a neighbor
        to form a real word.
      </p>

      <div class="example">
        <div>Start</div><code>timer</code>
        <div>Hit #1</div><code>tiler</code><small>(m → l)</small>
      </div>

      <ul class="tips">
        <li>Only one letter changes per hit.</li>
        <li>Neighbors wrap: <code>a</code> ↔ <code>z</code>.</li>
        <li>Words alternate: original → neighbor → original → next neighbor…</li>
      </ul>
    </div>
  `,

    // docs/punctuators-ladder.md §9 (M4). The load-bearing sentence is the first tip: since §2.5's
    // fan, shooting a word no longer moves it, which is the one rule a player cannot infer from
    // watching. Everything else here is a gloss on something already on screen — the rung strip, the
    // ▾, the fog count, the clank, the capstone.
    ladder: `
    <div class="char-modal">
      <h2>General &amp; Specific — General Ization &amp; Keen Arrow</h2>
      <p class="lead">
        Every naming word sits somewhere on a <strong>kind-of ladder</strong>: a <code>poodle</code>
        is a kind of <code>dog</code>, a dog is a kind of <code>mammal</code>, a mammal is a kind of
        <code>animal</code>. These two heroes move a word along that ladder, and
        <strong>Switch Character</strong> is what picks the direction.
      </p>

      <div class="example">
        <div>General</div>
        <div><code>dog</code> → <code>mammal</code><small>one shot, one rung broader</small></div>
        <div>Keen Arrow</div>
        <div><code>hound▾</code> <code>terrier▾</code> <code>corgi</code> …<small>fans out the kinds of dog</small></div>
        <div>Shoot one</div>
        <div><code>dog</code> → <code>terrier</code><small>one rung narrower</small></div>
      </div>

      <ul class="tips">
        <li><strong>Keen Arrow doesn't move the word.</strong> Hitting it fans the narrower kinds out
          underneath — walk under the one you want and shoot <em>it</em>. A <code>▾</code> means that
          kind has kinds of its own, so you can keep going down.</li>
        <li>The little strip under a word is the ladder itself: <code>▲</code> a rung broader,
          <code>●</code> you are here, <code>▼</code> a level of narrower kinds still below.</li>
        <li><code>+25 more</code> means the shelf is wider than the row. Play the word again and
          different kinds come up — that's how you work through a big family.</li>
        <li>A word with nothing narrower <strong>clanks</strong>. Broaden it with General Ization and
          narrow again: a word's neighbours are the other kinds on its parent's row.</li>
        <li>At the top of the ladder the word <strong>flares and stays</strong>.
          <code>animal</code> is the answer, not a miss.</li>
        <li><code>7/33 found</code> is your shelf: how many of that word's kinds you have ever landed
          on. Fill a quarter, a half, or all of it and it says so — and the shelf turns gold on the
          <strong>🌳 Tree of Kinds</strong>, where every word you land on lights up. The map explains
          itself when you open it; press <code>?</code> in there to read it again.</li>
      </ul>
    </div>
  `,
  };

  // Write into the body, not the whole modal: the header carries the × close button, and replacing
  // it left the modal closable only by clicking the overlay.
  const box = document.getElementById("modal");
  if (!box) return;
  (box.querySelector(".modal--body") ?? box).innerHTML =
    templates[selection] ??
    `
  <div class="char-modal">
    <h2>Character Info</h2>
    <p class="lead">Details for this character will appear here.</p>
  </div>
`;
}

openModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    buttonSounds.clicky.play();
    const modal = document.querySelector(button.dataset.modalTarget);
    // if (dropDownSelection === "alphabetNeighbors") {
    //   console.log("alph");
    //   modal.innerHTML =
    //     "An alphabet neighbor is the letter that is next to that letter in the alphabet. Betar uses this power to create new words";
    // }
    openModal(modal);
  });
});

overlay.addEventListener("click", () => {
  const modals = document.querySelectorAll(".modal.active");
  modals.forEach((modal) => {
    closeModal(modal);
  });
});

let openModal = (modal) => {
  if (modal === null) return;
  modal.classList.add("active");
  overlay.classList.add("active");
};

closeModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const modal = button.closest(".modal");
    closeModal(modal);
  });
});

let closeModal = (modal) => {
  if (modal === null) return;
  modal.classList.remove("active");
  overlay.classList.remove("active");
};

// Wires the 🌳 button and the map's own pan/zoom/keys. Cheap — it touches no word data until the
// panel is actually opened. (M14 adds the daily-run guard that hides the button mid-puzzle, §13.8.)
initLadderMap();

//TODO Make a button to do alphabet work similar to addSpansAndIdsForWordPlay

//TODO incorporate when more self-made sentences are made. The too variables don't work if game restart involves refresh
// createSentenceButton.addEventListener("click", () => {
//   if (CREATE_SENTENCE_COUNT === SWITCH_CASE_NUMBER) CREATE_SENTENCE_COUNT = 1;

//   addSpansAndIds(
//     createRandomMadLibSentence(CREATE_SENTENCE_COUNT),
//     out1,
//   );

// setClassName("go-away", startBanner, createSentenceButton);
// setClassName("grid-container", characterControls);
// });

const gameSfx = {
  end: new Howl({
    src: ["./sounds/success-fanfare-trumpets.mp3"],
  }),
};

let mySong = new Howl({
  src: ["./sounds/FourNote.mp3"],
  autoplay: false,
  loop: true,
  volume: 0.5,
});

// ── Synth SFX (Web Audio API) ─────────────────────────────────────────────
const _ac = new (window.AudioContext || window.webkitAudioContext)();
const _go = () => {
  if (_ac.state === "suspended") _ac.resume();
};

function _tone(freq, type, dur, vol = 0.35, freqEnd, delay = 0) {
  _go();
  const t = _ac.currentTime + delay;
  const o = _ac.createOscillator(),
    g = _ac.createGain();
  o.connect(g);
  g.connect(_ac.destination);
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (freqEnd != null)
    o.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.start(t);
  o.stop(t + dur);
}

function _noise(dur, vol = 0.3, filtFreq = 800, q = 4, delay = 0) {
  _go();
  const sr = _ac.sampleRate,
    n = Math.ceil(sr * dur);
  const buf = _ac.createBuffer(1, n, sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src = _ac.createBufferSource();
  src.buffer = buf;
  const f = _ac.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = filtFreq;
  f.Q.value = q;
  const g = _ac.createGain();
  src.connect(f);
  f.connect(g);
  g.connect(_ac.destination);
  const t = _ac.currentTime + delay;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.start(t);
  src.stop(t + dur);
}

// Apostrophantom — ghostly wail with vibrato (shoot) / shriek (hit)
function _ghostWail() {
  _go();
  const lfo = _ac.createOscillator(),
    lfoG = _ac.createGain();
  const osc = _ac.createOscillator(),
    outG = _ac.createGain();
  lfo.frequency.value = 5.5;
  lfoG.gain.value = 28;
  osc.type = "sine";
  osc.frequency.setValueAtTime(500, _ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(160, _ac.currentTime + 1.5);
  outG.gain.setValueAtTime(0.28, _ac.currentTime);
  outG.gain.exponentialRampToValueAtTime(0.001, _ac.currentTime + 1.5);
  lfo.connect(lfoG);
  lfoG.connect(osc.frequency);
  osc.connect(outG);
  outG.connect(_ac.destination);
  lfo.start();
  osc.start();
  lfo.stop(_ac.currentTime + 1.5);
  osc.stop(_ac.currentTime + 1.5);
  _tone(180, "sine", 1.2, 0.1, 60);
}
function _ghostShriek() {
  _tone(1200, "sine", 0.12, 0.32, 400);
  _tone(700, "sine", 0.18, 0.15, 150);
  _noise(0.12, 0.15, 1500, 6);
}

// Ambigrambador — rising magic arpeggio (shoot) / descending sparkle (hit)
function _ambiShoot() {
  [262, 330, 392, 523, 659].forEach((f, i) =>
    _tone(f, "sine", 0.2, 0.27, null, i * 0.07),
  );
}
function _ambiHit() {
  [523, 392, 330, 220].forEach((f, i) =>
    _tone(f, "triangle", 0.18, 0.23, null, i * 0.06),
  );
}

// AnacontractShine — slurp/contract
function _anaShoot() {
  _tone(100, "sawtooth", 0.28, 0.22, 900);
  _noise(0.28, 0.15, 400, 3);
}

// MasterAsterisk — sparkle twinkling star pings
function _asteriskShoot() {
  [2093, 1760, 2637, 2093, 1976].forEach((f, i) =>
    _tone(f, "sine", 0.1, 0.2, null, i * 0.045),
  );
}

// Roundabout — palindrome whorl: pitch goes up then back down
function _roundaboutShoot() {
  _tone(200, "sine", 0.22, 0.28, 800);
  _tone(800, "sine", 0.22, 0.25, 200, 0.22);
}
function _roundaboutHit() {
  _tone(600, "sawtooth", 0.28, 0.22, 80);
  _noise(0.18, 0.18, 300, 5);
}

// Morph each differing letter using an SVG displacement-map warp.
// The straight strokes appear to bend and curve into the target letter.
function _animateRoundabout(el, fromWord, toWord) {
  const from = fromWord.toUpperCase().split("");
  const to = toWord.toUpperCase().split("");

  el.innerHTML = from
    .map(
      (ch, i) =>
        `<span style="display:inline-block"${ch !== to[i] ? ` data-to="${to[i]}"` : ""}>${ch}</span>`,
    )
    .join("");

  const changing = [...el.querySelectorAll("span[data-to]")];
  if (changing.length === 0) {
    el.textContent = toWord.toUpperCase();
    el.classList.add("rounded-word");
    return;
  }

  const HALF = 300; // ms per half of the warp
  const MAX_SCL = 24; // peak displacement (px)
  const STAGGER = 120; // ms between each letter's start

  changing.forEach((span, idx) => {
    const toChar = span.dataset.to;
    const isLast = idx === changing.length - 1;

    setTimeout(() => {
      const uid = `ra${Date.now()}${idx}`;
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute(
        "style",
        "position:absolute;width:0;height:0;overflow:hidden",
      );
      svg.innerHTML =
        `<defs><filter id="${uid}" x="-30%" y="-30%" width="160%" height="160%">` +
        `<feTurbulence type="fractalNoise" baseFrequency="0.04 0.025" numOctaves="2" seed="${4 + idx}" result="n"/>` +
        `<feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" id="${uid}d"/>` +
        `</filter></defs>`;
      document.body.appendChild(svg);

      const disp = svg.getElementById(`${uid}d`);
      span.style.filter = `url(#${uid})`;

      let start = null;
      let swapped = false;

      (function step(ts) {
        if (!start) start = ts;
        const t = ts - start;

        if (t < HALF) {
          disp.setAttribute("scale", (MAX_SCL * (t / HALF)).toFixed(1));
        } else if (t < HALF * 2) {
          if (!swapped) {
            span.textContent = toChar;
            swapped = true;
          }
          disp.setAttribute(
            "scale",
            (MAX_SCL * (1 - (t - HALF) / HALF)).toFixed(1),
          );
        } else {
          disp.setAttribute("scale", "0");
          span.style.filter = "";
          svg.remove();
          if (isLast) {
            el.textContent = toWord.toUpperCase();
            el.classList.add("rounded-word");
          }
          return;
        }
        requestAnimationFrame(step);
      })(performance.now());
    }, idx * STAGGER);
  });
}

// SargeColon — sharp military snare (shoot) / heavy thud (hit)
function _sargeShoot() {
  _noise(0.08, 0.55, 2500, 1);
  _noise(0.07, 0.3, 500, 9);
  _tone(80, "sine", 0.1, 0.35, 35);
}
function _sargeHit() {
  _noise(0.12, 0.45, 1200, 2);
  _tone(65, "sine", 0.15, 0.42, 28);
}

// SemiColonel — half-intensity snare/thud
function _semiShoot() {
  _noise(0.06, 0.28, 2200, 1);
  _tone(90, "sine", 0.09, 0.22, 50);
}
function _semiHit() {
  _noise(0.1, 0.25, 1000, 2);
  _tone(70, "sine", 0.12, 0.25, 38);
}

// WhiteKnight — eraser strokes (shoot) / metallic clang (hit)
function _knightShoot() {
  // four quick eraser scrubs followed by a letter fading away
  [0, 0.07, 0.14, 0.21].forEach((d) => _noise(0.055, 0.32, 2800, 2.5, d));
  _tone(550, "sine", 0.28, 0.14, 80, 0.26);
}
function _knightHit() {
  _tone(440, "sawtooth", 0.55, 0.3);
  _tone(880, "sine", 0.45, 0.18);
  _noise(0.07, 0.38, 3500, 2);
}

/* General Ization & Keen Arrow — the word ladder (docs/punctuators-ladder.md §7).
   Six cues rather than the usual two, because a ladder hit has four outcomes, not one: you moved a
   rung, you opened a shelf, or you reached an end. Which one happened is only known inside the
   handler, so the two heroes' hitProjectileSound() are deliberately silent and the ladder branch
   plays its own landing sound — see the note on their classes. */

// A bugle can only sound the harmonic series, which is most of why a bugle call reads as military.
// Two notes rising a third, over an octave-down body: a general calling the wider view.
function _izoShoot() {
  _tone(392, "square", 0.12, 0.14);
  _tone(494, "square", 0.26, 0.16, null, 0.1);
  _tone(196, "triangle", 0.34, 0.09, null, 0.1);
}

// The pull-back, as sound: two voices start together and pull APART as they fall, so the interval
// widens on the way down — the same gesture ladderPullBack makes with the word. The 2 Hz detune
// leaves a slow beat under it, which keeps a low pad from sounding like one flat organ note.
function _izoHit() {
  _tone(240, "sine", 0.55, 0.2, 110);
  _tone(238, "triangle", 0.6, 0.14, 74);
  _tone(120, "sine", 0.5, 0.12, 55, 0.06);
}

// Bowstring, then the arrow off it: a high-Q band of noise down at 220 thrums rather than hisses.
function _keenShoot() {
  _noise(0.12, 0.3, 220, 8);
  _tone(500, "sine", 0.09, 0.16, 1400);
}

// Landing on one thing, and nothing either side of it — the shortest cue in the game.
function _keenHit() {
  _tone(2200, "square", 0.045, 0.16, 1500);
  _noise(0.05, 0.22, 3200, 2);
}

/* §2.5's fan opening: one tick per child drawn, so the row's SIZE is audible before it is readable —
   a three-word shelf and a seven-word shelf are different sounds. Pitch climbs across the row the
   way the eye travels it. `delay` offsets the whole flutter when the fan is re-opening straight
   after a landing, so _keenHit's tick gets to speak first. */
function _keenFan(n, delay = 0) {
  for (let i = 0; i < n; i++) {
    _tone(900 + i * 110, "triangle", 0.05, 0.11, null, delay + i * 0.035);
    _noise(0.03, 0.06, 2600, 3, delay + i * 0.035);
  }
}

// Both ends of the ladder, shared: a bright major triad, because `animal` IS the answer and a leaf
// having no kinds is a fact about the word, not a miss. It must not sound like a buzzer.
function _ladderCapstone() {
  [784, 1047, 1319].forEach((f, i) =>
    _tone(f, "sine", 0.5, 0.16, null, i * 0.06),
  );
}

/* §13.6's shelf milestone — the seventh ladder cue, and the only one that isn't about the shot. It
   has to sit clear of the six above, all of which are the hero's: this one belongs to the MAP, so it
   is a bell rather than a bugle or a bowstring, and it climbs where the others fall. Three rising
   notes for a quarter, four for a half, and at 100% the same run capped by the octave, which is the
   only place in the game two cues ring together. `delay` keeps it a beat behind the landing sound
   playing on the same shot. */
function _shelfMilestone(tier, delay = 0) {
  const run = [784, 988, 1175, 1568]; // G B D G — a major triad closing on its own octave
  const n = tier === 1 ? 3 : 4;
  for (let i = 0; i < n; i++)
    _tone(run[i], "triangle", 0.3, 0.13, null, delay + i * 0.075);
  if (tier === 3) {
    // The finished shelf: a second voice underneath, so completion is audibly different in kind and
    // not merely one note longer than a half.
    _tone(392, "sine", 0.75, 0.13, null, delay + 0.075);
    _tone(2349, "sine", 0.5, 0.07, null, delay + 0.3);
  }
}

// Zana — quick insertion pop (shoot) / click (hit)
function _zanaShoot() {
  _tone(900, "sine", 0.06, 0.45, 200);
  _tone(450, "sine", 0.04, 0.28, 100, 0.03);
}
function _zanaHit() {
  _tone(650, "sine", 0.05, 0.38, 180);
}

// CommaChameleon — tongue slap on hit
function _commaHit() {
  _tone(110, "sine", 0.09, 0.48, 55);
  _noise(0.07, 0.32, 180, 4);
}

// DrHyphenol — chemical fizz pop on hit
function _hyphenHit() {
  _noise(0.28, 0.32, 2200, 2);
  _tone(280, "sine", 0.14, 0.18, 95);
}

// ExclaMachine — bell ding on hit
function _exclaHit() {
  _tone(1047, "sine", 0.65, 0.38);
  _tone(1319, "sine", 0.45, 0.2, null, 0.02);
}

// FullStopGrenade — explosion boom on hit
function _grenadeHit() {
  _noise(0.5, 0.55, 110, 1);
  _noise(0.38, 0.38, 55, 2, 0.05);
  _tone(48, "sine", 0.5, 0.48, 18);
}

// OctoThwarter — spray splat on hit
function _octoHit() {
  _noise(0.15, 0.42, 1600, 3);
  _tone(190, "sawtooth", 0.1, 0.28, 75);
}

// QuestionMarkswoman — arrow thwack on hit
function _questionHit() {
  _noise(0.09, 0.48, 750, 5);
  _tone(170, "triangle", 0.14, 0.32, 58);
}

// QuetzalQuotel — feather flutter on hit
function _quotelHit() {
  _noise(0.18, 0.18, 550, 2);
  _tone(580, "sine", 0.14, 0.12, 280);
}

// Spacel — fart impact on hit
function _spacelHit() {
  _tone(75, "sawtooth", 0.22, 0.38, 38);
  _noise(0.18, 0.28, 140, 3);
}

// Betar — reel click on hit
function _betarHit() {
  _noise(0.04, 0.38, 3200, 2);
  _tone(750, "square", 0.04, 0.22, 380);
}

class Hero {
  /**
   * Creates a new Hero.
   * @param {string} heroImage - The image of the hero.
   * @param {number} heroScale - The scale of the hero image.
   * @param {string} symbol - The symbol for the hero.
   * @param {string} characterColor - The color of the character's text.
   * @param {number} projectileStartPositionX - The starting position X of the projectile.
   * @param {number} projectileLength - The length of the projectile.
   * @param {string} projectileImage - The image for the projectile.
   * @param {string} projectileShootSound - The sound when the projectile is shot.
   * @param {number} projectileScale - The scale of the projectile image.
   * @param {number} [projectileSoundRate] - The rate of the projectile sound.
   * @param {number} [projectileSoundVolume] - The volume of the projectile sound.
   * @param {string} [secondHeroImage] - The second image of the hero.
   * @param {string} projectileHitSound - The sound when the projectile hits.
   */

  constructor(
    heroImage,
    heroScale,
    symbol,
    characterColor,
    projectileStartPositionX,
    projectileLength,
    projectileImage,
    projectileShootSound,
    projectileScale,
    projectileSoundRate,
    projectileSoundVolume,
    secondHeroImage,
    projectileHitSound,
  ) {
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.heroImage = heroImage;
    this.heroScale = heroScale;
    this.characterColor = characterColor;
    this.symbol = symbol;
    // Which span id this hero hits. Defaults to its own name, so nothing changes for the 23 heroes
    // that own their span outright; the two ladder heroes override it to share one
    // (docs/punctuators-ladder.md §4).
    this.targetId = symbol;
    this.projectileStartPositionX = projectileStartPositionX;
    this.projectileLength = projectileLength;
    this.projectileImage = projectileImage;
    this.projectileShootSound = projectileShootSound;
    this.projectileScale = projectileScale;
    this.projectileSoundRate = projectileSoundRate;
    this.projectileSoundVolume = projectileSoundVolume;
    this.secondHeroImage = secondHeroImage;
    this.projectileHitSound = projectileHitSound;

    this.sfx = {
      shoot: this.projectileShootSound
        ? new Howl({
            src: [this.projectileShootSound],
            rate: this.projectileSoundRate,
          })
        : null,
      hit: this.projectileHitSound
        ? new Howl({ src: [this.projectileHitSound] })
        : null,
    };

    //should put these in an array
    const image = new Image();
    const image2 = new Image();

    image.src = this.heroImage;
    image.onload = () => {
      this.image = image;
      this.width = image.width * heroScale;
      this.height = image.height * heroScale;
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height + 20,
      };
    };

    if (this.heroImage === "white") {
      image2.fillStyle = "white";
      image2.fillRect(
        this.position.x,
        this.position.y,
        this.width,
        this.height,
      );
    } else {
      image2.src = this.secondHeroImage;
      image2.onload = () => {
        this.image2 = image2;
        this.width = image2.width * heroScale;
        this.height = image2.height * heroScale;
        this.position = {
          x: canvas.width / 2 - this.width / 2,
          y: canvas.height - this.height + 20,
        };
      };
    }
  }

  shootProjectileSound() {
    this.sfx.shoot?.play();
  }

  hitProjectileSound() {
    this.sfx.hit?.play();
  }

  draw() {
    c.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height,
    );
  }

  draw2() {
    c.save();
    c.drawImage(
      this.image2,
      this.position.x,
      this.position.y,
      this.width,
      this.height,
    );
    c.restore();
  }

  update() {
    if (this.image) {
      this.draw();
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
  }

  update2() {
    if (this.image2) {
      this.draw2();
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
  }
}

//create a function that makes him disappear when projectile shoots
class Ambigrambador extends Hero {
  constructor() {
    super(
      "./images/Ambigram.png",
      0.3,
      "Ambigrambador",
      "violet",
      118,
      50,
      "./images/Colon_Wave.png",
      undefined,
      0.1,
      5.0,
      undefined,
      "./images/Ambigram2.png",
    );
  }
  shootProjectileSound() {
    _ambiShoot();
  }
  hitProjectileSound() {
    _ambiHit();
  }
}

class AnacontractShine extends Hero {
  constructor() {
    super(
      "./images/AnacontractshineEat2.png",
      0.3,
      "ApostroPharaoh (Contraction)",
      "lightgreen",
      118,
      50,
      "./images/AnacontractshineEat3.png",
      undefined,
      0.2,
      5.0,
      undefined,
      "white",
      "./sounds/projectile-hit/ana-eat.mp3",
    );
  }
  shootProjectileSound() {
    _anaShoot();
  }
}

class Apostrophantom extends Hero {
  constructor() {
    super(
      "./images/Apostrophantom.png",
      0.8,
      "Apostrophantom '",
      "purple",
      118,
      50,
      "./images/Ectoplasm.png",
      undefined,
      0.2,
      5.0,
      undefined,
      "white",
    );
  }
  shootProjectileSound() {
    _ghostWail();
  }
  hitProjectileSound() {
    _ghostShriek();
  }
}

class ArtTheTickler extends Hero {
  constructor() {
    super(
      "./images/Article.png",
      0.4,
      "Art The Tickler (Article)",
      "black",
      118,
      50,
      "./images/Ectoplasm.png",
      "./sounds/featherSwish.mp3",
      0.2,
      undefined,
      undefined,
      "./images/Article2.png",
      "./sounds/article-laughing.mp3",
    );
  }
}

class Betar extends Hero {
  constructor() {
    super(
      "./images/Betar_1.png",
      0.4,
      "Betar (Alphabet Slots)",
      "gray",
      118,
      50,
      "./images/Ectoplasm.png",
      "./sounds/featherSwish.mp3",
      0.2,
      undefined,
      undefined,
      "./images/Betar_2.png",
    );
  }
  hitProjectileSound() {
    _betarHit();
  }
}

/* General Ization & Keen Arrow — the two halves of General & Specific (docs/punctuators-ladder.md §2).
   They are the first heroes to share a target: both answer to LADDER_ID and differ only in
   ladderDirection, so Switch Character is what flips broaden ↔ narrow.

   Hero art is still placeholder (§8): Generic.png is literally a generic figure, and Arrow.png is
   the arrow. Real two-frame hero art is what's left of M4; both projectiles are final.
   projectileStartPositionX is set to half the drawn width for both, because that is the value where
   the Projectile's spawn x and its on-load x agree, so the shot doesn't jump sideways on a hero this
   narrow. */
/* General Ization's projectile: a BROADsword, because the joke is already in the name — the broad
   blade for the hero who broadens (§8).

   Drawn once into an offscreen canvas and handed to the Hero constructor as a data URL, so it takes
   exactly the same Image() path as every other projectile and swapping it for real art is one
   string: replace GENERAL_PROJECTILE below with "./images/Broadsword.png". Nothing else knows how
   the pixels were made.

   Point-up, because projectiles fly straight up and are never rotated (velocity {x:0,y:-10}), and
   sized so that at the constructor's unchanged 0.2 scale it lands at ~27px wide — the width the
   borrowed Ectoplasm.png had, which is what projectileStartPositionX (90) was centred against. */
const SWORD_W = 136;
const SWORD_H = 460;

function drawBroadswordSprite() {
  const cv = document.createElement("canvas");
  cv.width = SWORD_W;
  cv.height = SWORD_H;
  const g = cv.getContext("2d");
  const mid = SWORD_W / 2;

  // Everything is outlined in near-black: the canvas behind it is painted white every frame, so a
  // steel blade with no outline would simply disappear.
  g.lineJoin = "round";
  g.strokeStyle = "#14170f";
  g.lineWidth = 5;

  // The blade. Broad and near-parallel down its length, taking its taper only near the point.
  const steel = g.createLinearGradient(mid - 37, 0, mid + 37, 0);
  steel.addColorStop(0, "#f4f7f8");
  steel.addColorStop(0.42, "#cbd3d8");
  steel.addColorStop(0.5, "#eef2f4"); // the fuller's highlight, down the centre line
  steel.addColorStop(0.58, "#9fa9b1");
  steel.addColorStop(1, "#79838b");
  g.beginPath();
  g.moveTo(mid, 10);
  g.lineTo(mid + 34, 88);
  g.lineTo(mid + 37, 296);
  g.lineTo(mid - 37, 296);
  g.lineTo(mid - 34, 88);
  g.closePath();
  g.fillStyle = steel;
  g.fill();
  g.stroke();

  // The fuller — the groove down the middle. Two thin strokes read better than a filled band once
  // the whole sprite is scaled to 27px wide.
  g.lineWidth = 3;
  g.strokeStyle = "rgba(20, 23, 15, 0.35)";
  g.beginPath();
  g.moveTo(mid - 9, 96);
  g.lineTo(mid - 9, 286);
  g.moveTo(mid + 9, 96);
  g.lineTo(mid + 9, 286);
  g.stroke();

  // The crossguard, flaring down and out to quillon tips.
  g.lineWidth = 5;
  g.strokeStyle = "#14170f";
  g.beginPath();
  g.moveTo(10, 300);
  g.lineTo(SWORD_W - 10, 300);
  g.lineTo(SWORD_W - 22, 334);
  g.lineTo(22, 334);
  g.closePath();
  g.fillStyle = "darkolivegreen";
  g.fill();
  g.stroke();

  // The grip, wrapped in leather.
  g.beginPath();
  g.rect(mid - 13, 334, 26, 78);
  g.fillStyle = "#3b3226";
  g.fill();
  g.stroke();
  g.lineWidth = 3;
  g.strokeStyle = "rgba(240, 236, 220, 0.3)";
  g.beginPath();
  for (let y = 348; y < 412; y += 16) {
    g.moveTo(mid - 12, y);
    g.lineTo(mid + 12, y - 5);
  }
  g.stroke();
  g.lineWidth = 5;
  g.strokeStyle = "#14170f";

  // The pommel.
  g.beginPath();
  g.arc(mid, 424, 22, 0, Math.PI * 2);
  g.fillStyle = "#6b8e23"; // olivedrab — the guard's colour, lifted so the pommel reads as round
  g.fill();
  g.stroke();

  return cv.toDataURL("image/png");
}

const GENERAL_PROJECTILE = drawBroadswordSprite();

class GeneralIzation extends Hero {
  constructor() {
    super(
      "./images/Generic.png",
      0.5,
      "General Ization (Broader)",
      "darkolivegreen",
      90,
      50,
      GENERAL_PROJECTILE,
      undefined,
      0.2,
      undefined,
      undefined,
      "./images/Generic.png",
    );
    this.targetId = LADDER_ID;
    this.ladderDirection = "up";
  }
  shootProjectileSound() {
    _izoShoot();
  }
  /* Deliberately silent (§7). Every other hero's hit means one thing, so playing it from the
     generic call site works; a ladder hit means one of four — a rung climbed, a shelf fanned open,
     or either end of the chain reached — and only the handler knows which. landOnRung and
     climbLadder play the outcome's own cue instead. */
  hitProjectileSound() {}
}

class KeenArrow extends Hero {
  constructor() {
    super(
      "./images/qm.png",
      0.7,
      "Keen Arrow (Narrower)",
      "crimson",
      20,
      50,
      "./images/Arrow.png",
      undefined,
      0.25,
      undefined,
      undefined,
      "./images/QM2.png",
    );
    this.targetId = LADDER_ID;
    this.ladderDirection = "down";
  }
  shootProjectileSound() {
    _keenShoot();
  }
  hitProjectileSound() {} // silent for the same reason as General's — see there
}

/* The same two heroes again, for Word Race (§12.2). Only the target id differs, so these subclass
   rather than repeat: art, colours, projectiles and all six SFX come along unchanged.

   They need to be separate INSTANCES because a race puts two different words on the field at once
   and each hero must only be able to hit its own — General the rung above, Keen the word you
   summoned. In free play the two share one id, because there both heroes act on the same word.
   heroToTheRescue builds the team from the ids actually present, so the race pair never joins a
   free-play team and the free-play pair never joins a race. */
class GeneralIzationRace extends GeneralIzation {
  constructor() {
    super();
    this.targetId = RACE_UP_ID;
  }
}

class KeenArrowRace extends KeenArrow {
  constructor() {
    super();
    this.targetId = RACE_DOWN_ID;
  }
}

class CommaChameleon extends Hero {
  constructor(projectileLength) {
    super(
      "./images/CC1.png",
      0.5,
      "Comma Chameleon ,",
      "pink",
      70,
      projectileLength,
      undefined,
      "./sounds/lick.mp3",
      0.2,
      undefined,
      undefined,
      "./images/cc.png",
    );
  }
  hitProjectileSound() {
    _commaHit();
  }
}

class OctoThwarter extends Hero {
  constructor(projectileLength) {
    super(
      "./images/Octo.png",
      0.5,
      "HashTagger #",
      "turquoise",
      110,
      projectileLength,
      undefined,
      "./sounds/spray_paint.mp3",
      0.1,
      undefined,
      undefined,
      "./images/Octo2.png",
    );
  }
  hitProjectileSound() {
    _octoHit();
  }
}

class DrHyphenol extends Hero {
  constructor() {
    super(
      "./images/Hyphenol_1.png",
      0.6,
      "Ms. Hyphen -",
      "turquoise",
      118,
      50,
      "./images/Flask.png",
      "./sounds/whoosh.mp3",
      0.25,
      undefined,
      undefined,
      "./images/Hyphenol_2.png",
    );
  }
  hitProjectileSound() {
    _hyphenHit();
  }
}

class ExclaMachine extends Hero {
  constructor() {
    super(
      "./images/EM.png",
      0.6,
      "Excla Machine !",
      "yellow",
      118,
      50,
      "./images/EM_Belt.png",
      "./sounds/whoosh.mp3",
      0.5,
      undefined,
      undefined,
      "./images/EM_Belt2.png",
    );
  }
  hitProjectileSound() {
    _exclaHit();
  }
}

class Foon extends Hero {
  constructor() {
    super(
      "./images/Foon_.png",
      0.35,
      "The Foon (Spoonerism)",
      "green",
      70,
      50,
      "./images/Foon_Projectile.png",
      "./sounds/whoosh.mp3",
      0.1,
      undefined,
      undefined,
      "./images/Foon_2.png",
      "./sounds/foon_hit.mp3",
    );
  }
}

class FullStop extends Hero {
  constructor() {
    super(
      "./images/fs.png",
      0.5,
      "Full Stop .",
      "red",
      110,
      50,
      "./images/Laser.png",
      "./sounds/laser-bolt.mp3",
      0.2,
      undefined,
      undefined,
      undefined,
      "./sounds/projectile-hit/laser-hit.mp3",
    );
  }
}

class FullStopGrenade extends Hero {
  constructor() {
    super(
      "./images/FS_capital1.png",
      0.5,
      "Full Stop (Capitalize)",
      "red",
      110,
      50,
      "./images/Grenade.png",
      "./sounds/whoosh.mp3",
      0.2,
      undefined,
      undefined,
      "./images/FS_capital2.png",
    );
  }
  hitProjectileSound() {
    _grenadeHit();
  }
}

class MasterAsterisk extends Hero {
  constructor() {
    super(
      "./images/Asterisk.png",
      0.35,
      "Master Asterisk *",
      "gold",
      50,
      50,
      "./images/Asterisk_Star.png",
      undefined,
      0.1,
      1,
      undefined,
      "./images/Asterisk2.png",
      "./sounds/projectile-hit/asterisk-hit.mp3",
    );
  }
  shootProjectileSound() {
    _asteriskShoot();
  }
}

class ParentsOfTheSeas extends Hero {
  constructor() {
    super(
      "./images/Parents.png",
      0.35,
      "Parents of the Seas ( )",
      "lightblue",
      50,
      50,
      "./images/Bubble.png",
      "./sounds/bubble.mp3",
      0.1,
      undefined,
      undefined,
      undefined,
      "./sounds/projectile-hit/bubble-hit.mp3",
    );
  }
}

class Phonia extends Hero {
  constructor() {
    super(
      "./images/Phonia.png",
      0.3,
      "Phonia (Homophones)",
      "seagreen",
      100,
      50,
      "./images/Bubble.png",
      "./sounds/bubble.mp3",
      0.1,
      undefined,
      undefined,
      "./images/Phonia2.png",
      "./sounds/projectile-hit/bubble-hit.mp3",
    );
  }
}

class QuestionMarkswoman extends Hero {
  constructor() {
    super(
      "./images/qm.png",
      0.7,
      "Question Markswoman ?",
      "blue",
      126,
      50,
      "./images/Arrow.png",
      "./sounds/arrow-shot.mp3",
      0.2,
      undefined,
      undefined,
      "./images/QM2.png",
    );
  }
  hitProjectileSound() {
    _questionHit();
  }
}

//need to fix with code or choose different font so we get smart quotes instead of dumb quotes https://www.fontshop.com/content/curly-quotes
class QuetzalQuotel extends Hero {
  constructor() {
    super(
      "./images/Qq_2.png",
      0.7,
      "QuetzalQuotel",
      "green",
      126,
      50,
      "./images/Feather.png",
      "./sounds/wings.mp3",
      0.1,
      undefined,
      undefined,
      "./images/Qq.png",
    );
  }
  hitProjectileSound() {
    _quotelHit();
  }
}

class Roundabout extends Hero {
  constructor() {
    super(
      "./images/Roundabout1.png",
      0.4,
      "Roundabout",
      "cyan",
      80,
      50,
      "./images/Colon_Wave.png",
      undefined,
      0.2,
      undefined,
      undefined,
      "./images/Roundabout2.png",
    );
  }
  shootProjectileSound() {
    _roundaboutShoot();
  }
  hitProjectileSound() {
    _roundaboutHit();
  }
}

class SargeColon extends Hero {
  constructor() {
    super(
      "./images/Colon1.png",
      0.9,
      "Sergeant Colon :",
      "brown",
      126,
      50,
      "./images/Colon_Wave.png",
      undefined,
      0.1,
      undefined,
      undefined,
      "./images/Colon.png",
    );
  }
  shootProjectileSound() {
    _sargeShoot();
  }
  hitProjectileSound() {
    _sargeHit();
  }
}

class SemiColonel extends Hero {
  constructor() {
    super(
      "./images/Semicolonel-profile.png",
      0.9,
      "Semicolonel ;",
      "orange",
      100,
      50,
      "./images/Semicolonel.png",
      undefined,
      0.5,
      undefined,
      undefined,
      "white",
    );
  }
  shootProjectileSound() {
    _semiShoot();
  }
  hitProjectileSound() {
    _semiHit();
  }
}

class Spacel extends Hero {
  constructor() {
    super(
      "./images/Spacel.png",
      0.5,
      "Space-el",
      "violet",
      126,
      50,
      "./images/Colon_Wave.png",
      "./sounds/523467__tv_ling__perfect-fart.mp3",
      0.1,
      undefined,
      undefined,
      "./images/Spacel2.png",
    );
  }
  hitProjectileSound() {
    _spacelHit();
  }
}

class WhiteKnight extends Hero {
  constructor() {
    super(
      "./images/Whiteknight1.png",
      0.5,
      "Sir Dele of Dallying",
      "brown",
      80,
      50,
      "images/Colon_Wave.png",
      undefined,
      0.2,
      undefined,
      undefined,
      "./images/Whiteknight2.png",
    );
  }
  shootProjectileSound() {
    _knightShoot();
  }
  hitProjectileSound() {
    _knightHit();
  }
}

class Zana extends Hero {
  constructor() {
    super(
      "./images/Zana.png",
      0.5,
      "Zana (caret)",
      "whitesmoke",
      80,
      50,
      "images/Caret.png",
      undefined,
      0.05,
      undefined,
      undefined,
      "./images/Zana2.png",
    );
  }
  shootProjectileSound() {
    _zanaShoot();
  }
  hitProjectileSound() {
    _zanaHit();
  }
}

//need to make this more generic and create a laser one
class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 3;
    this.height = player.projectileLength;
    this.projectileImage = player.projectileImage;

    const projImage = new Image();

    projImage.src = this.projectileImage;

    projImage.onload = () => {
      //   const scale = 0.2;
      const scale = player.projectileScale;
      this.projImage = projImage;
      this.width = projImage.width * scale;
      this.height = projImage.height * scale;
      this.position = {
        x: player.position.x + player.projectileStartPositionX,
        y: player.position.y,
      };
    };
  }

  draw() {
    if (this.projImage) {
      c.drawImage(
        this.projImage,
        this.position.x,
        this.position.y,
        this.width,
        this.height,
      );
    }
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

// class CommaTongue extends Projectile {
class CommaTongue {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 5;
    this.height = player.projectileLength;
    this.startYPosition = -40;
  }

  draw() {
    c.fillStyle = "pink";
    c.fillRect(
      this.position.x,
      this.position.y + this.startYPosition,
      this.width,
      this.height,
    );
  }

  update() {
    this.draw();
    this.height -= this.velocity.y;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

// Maybe down the road can have the sentence move downward

let allPunctuationHit = new Set();

let player = new Hero("./images/Title_Page.png", 0.4);

/* The heroes whose spans are actually in this sentence. Declared here rather than at the bottom of
   the file, where it is filled: it is read by animate(), doActionOnce() and switchToNextHero(), all
   of which can fire on the very click that starts a round — before the top-level await below has
   resolved. As a `let` down there it was in the temporal dead zone for that first click; as an empty
   array up here it is merely empty, which every reader already handles. */
let elm = null;
let chosenHeroArray = [];

let apostrophe = new Apostrophantom();
let asterisk = new MasterAsterisk();
let comma = new CommaChameleon(100);
let exclamation = new ExclaMachine();
let parenthesis = new ParentsOfTheSeas();
let period = new FullStop();
let capitalize = new FullStopGrenade();
let question = new QuestionMarkswoman();
let quotes = new QuetzalQuotel();
let colon = new SargeColon();
let semicolon = new SemiColonel();
let hyphen = new DrHyphenol();
let hashtag = new OctoThwarter(100);
let anacontraction = new AnacontractShine();
let article = new ArtTheTickler();
let ambigram = new Ambigrambador();
let foon = new Foon();
let phonia = new Phonia();
let spacel = new Spacel();
let dele = new WhiteKnight();
let zana = new Zana();
let roundabout = new Roundabout();
let betar = new Betar();
let general = new GeneralIzation();
let keen = new KeenArrow();
let generalRace = new GeneralIzationRace();
let keenRace = new KeenArrowRace();

let availableHeroArray = [
  period,
  capitalize,
  colon,
  comma,
  parenthesis,
  semicolon,
  question,
  exclamation,
  apostrophe,
  quotes,
  hyphen,
  betar,
  asterisk,
  hashtag,
  anacontraction,
  ambigram,
  phonia,
  spacel,
  dele,
  zana,
  roundabout,
  // Adjacent on purpose: Switch Character then flips straight between broaden and narrow (§4).
  general,
  keen,
  // The Word Race pair, adjacent for the same reason (§12.2).
  generalRace,
  keenRace,
  article,
  foon,
];

const projectiles = [];

const PROJECTILE_HIT_MARGIN_OF_ERROR = 5;

function animate() {
  //this creates an animation loop

  //Need this or else there will be multiple Full Stops
  c.fillStyle = "white";
  c.fillRect(0, 0, canvas.width, canvas.height);

  requestAnimationFrame(animate);
  // Insurance, not logic: the loop must survive a frame with no hero. Losing it takes the canvas
  // with it, and every mode goes blank for the rest of the session with one console line to show
  // for it — which is precisely how the 2026-08-21 waitForElement regression presented.
  if (!player) return;
  player.update();

  projectiles.forEach((projectile, index) => {
    if (nodeArr) {
      nodeArr.forEach((punctuationSymbol) => {
        // A node detached from the document reports an all-zero rect, which the tests below read as
        // a hit box parked in the top-left corner — so it silently eats shots fired near the left
        // edge. nodeArr held only the sentence's own spans until §2.5's fan started adding and
        // removing targets mid-round, which is what makes this reachable.
        if (!punctuationSymbol.isConnected) return;
        // One ladder action per shot (§2.5). Picking a word out of the fan closes that row and opens
        // the next one inside the same call, and forEach walks to the length it captured at the
        // start — so those fresh targets sit at indices it is still going to visit, in this very
        // frame. Without the latch the shot would register twice and splice itself out of
        // `projectiles` twice, taking an unrelated shot with it. Undefined in every other mode.
        if (projectile.ladderDone) return;
        //tried to do this for left and right parenthesis, might need to come back to it
        // if (punctuationSymbol.className.includes(player.symbol)) {
        // targetId, not symbol — the ladder heroes share one span id (§4). Identical for everyone else.
        if (punctuationSymbol.id === (player.targetId ?? player.symbol)) {
          // for Comma Chameleon. TODO refactor because only difference is projectileLength and code for when I add tongue retract
          if (
            player.symbol === comma.symbol ||
            player.symbol === hashtag.symbol
          ) {
            if (
              projectile.position.y - player.projectileLength <=
                punctuationSymbol.getBoundingClientRect().y &&
              projectile.position.x + projectile.width >=
                punctuationSymbol.getBoundingClientRect().left -
                  PROJECTILE_HIT_MARGIN_OF_ERROR &&
              projectile.position.x <=
                punctuationSymbol.getBoundingClientRect().right +
                  PROJECTILE_HIT_MARGIN_OF_ERROR
            ) {
              // console.log("hitTongue!");
              //end game logic
              allPunctuationHit.add(punctuationSymbol);
              if (
                allPunctuationHit.size === numberOfPunctuationArray.length &&
                ENDING_REACHED === false
              ) {
                // console.log("All comma Punctuation Hit!");

                changeTextToSpeechBubble(speechLineForWin, endingMessage1);

                refreshButton.classList.remove("go-away");
                root.style.setProperty(
                  "--speech-bubble-triangle",
                  projectile.position.x,
                );
                root.style.setProperty("--color", player.characterColor);
                ENDING_REACHED = true;
                gameSfx.end.play();
              }

              setTimeout(() => {
                //need to change the velocity of the y to +1. this could make the tongue retract. Maybe later
                // console.log("proj", projectiles);
                player.hitProjectileSound();
                // projectiles[index].velocity.y = 1;
                projectiles.splice(index, 1);
                punctuationSymbol.classList.remove("hidden-punc");
                punctuationSymbol.style.color = `${player.characterColor}`;
                punctuationSymbol.style.textShadow =
                  "1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000";
              }, 0);
            } else if (projectile.position.y <= 0) {
              setTimeout(() => {
                // projectiles[index].velocity.y = 1;
                projectiles.splice(index, 1);
              }, 0);
            } else {
              if (player.secondHeroImage) {
                c.fillStyle = "white";
                c.fillRect(0, 0, canvas.width, canvas.height);
                player.update2();
              }
              projectile.update();
            }
          } else {
            if (
              //need to go through this more. Should be able to do .bottom but something up with padding
              projectile.position.y - projectile.height <=
                punctuationSymbol.getBoundingClientRect().y &&
              projectile.position.x + projectile.width >=
                punctuationSymbol.getBoundingClientRect().left -
                  PROJECTILE_HIT_MARGIN_OF_ERROR &&
              projectile.position.x <=
                punctuationSymbol.getBoundingClientRect().right +
                  PROJECTILE_HIT_MARGIN_OF_ERROR
            ) {
              // console.log("hit!");
              if (punctuationSymbol.id == capitalize.symbol) {
                setClassName("blackhole-expand", punctuationSymbol);

                setTimeout(() => {
                  punctuationSymbol.innerText =
                    punctuationSymbol.innerText.toUpperCase();
                  setClassName("blackhole-collapse", punctuationSymbol);
                }, 1800);
              } else if (punctuationSymbol.id === ambigram.symbol) {
                // Two-face spin reveal (ported from Spin Nids' chip-rot): the word
                // spins 180° and lands reading as its dictionary-validated partner,
                // which is pre-stashed in data-ambigram. One-shot per word.
                const span = punctuationSymbol;
                if (
                  span.hasAttribute("data-ambigram") &&
                  !span.classList.contains("ambi-spinning")
                ) {
                  span.classList.add("ambi-spinning");
                  span.innerHTML =
                    `<span class="ambi-face ambi-front">${span.textContent}</span>` +
                    `<span class="ambi-face ambi-back">${span.getAttribute(
                      "data-ambigram",
                    )}</span>`;
                  span.classList.add("ambi-spin");
                }
              } else if (punctuationSymbol.id === phonia.symbol) {
                if (punctuationSymbol.hasAttribute("data-homophones")) {
                  const span = punctuationSymbol;
                  const homophonesList = span
                    .getAttribute("data-homophones")
                    .split(",");
                  let currentIndex = parseInt(
                    span.className.replace("word-", ""),
                  );

                  // Get the next index, or loop back to 0 if we're at the last word
                  let nextIndex = (currentIndex + 1) % homophonesList.length;

                  // Tuning-fork shiver: the word vibrates and shimmers, then
                  // settles on the next same-sounding spelling.
                  animateHomophoneShiver(
                    span,
                    homophonesList[nextIndex],
                    nextIndex,
                  );
                }
              } else if (punctuationSymbol.id === parenthesis.symbol) {
                if (punctuationSymbol.hasAttribute("data-anagrams")) {
                  const span = punctuationSymbol;
                  const anagramList = span
                    .getAttribute("data-anagrams")
                    .split(",");
                  let currentIndex = parseInt(
                    span.className.replace("word-", ""),
                  );

                  // Get the next index, or loop back to 0 if we're at the last word
                  let nextIndex = (currentIndex + 1) % anagramList.length;

                  // Float the letters around (bubble swirl) before they settle
                  // into the next anagram.
                  animateAnagramSwirl(span, anagramList[nextIndex], nextIndex);
                }
              } else if (punctuationSymbol.id === betar.symbol) {
                const span = punctuationSymbol;

                // Store original word on first hit
                if (!span.hasAttribute("data-original-word")) {
                  span.setAttribute("data-original-word", span.textContent);
                }

                const originalWord = span.getAttribute("data-original-word");
                const neighborsList = span
                  .getAttribute("data-alphabetical-neighbors")
                  .split(",");

                // Track state via data attributes so we never read mid-animation DOM
                // neighborsList[0] is always the original word; neighbors start at index 1
                if (!span.hasAttribute("data-neighbor-cursor")) {
                  span.setAttribute("data-neighbor-cursor", "1");
                }
                if (!span.hasAttribute("data-showing-original")) {
                  span.setAttribute("data-showing-original", "true");
                }

                // Skip if a spin is already in progress
                if (span.querySelector(".reel")) return;

                // Wrap letters in spans if not already done
                if (!span.querySelector(".letter")) {
                  span.innerHTML = span.textContent
                    .split("")
                    .map((ch) => `<span class="letter">${ch}</span>`)
                    .join("");
                }

                const letterSpans = span.querySelectorAll(".letter");
                const showingOriginal =
                  span.getAttribute("data-showing-original") === "true";
                const cursor = parseInt(
                  span.getAttribute("data-neighbor-cursor"),
                );

                // Apply the original word's capitalization pattern to a neighbor word
                // (neighbors are stored lowercase; the original may have capitals)
                const matchCase = (orig, word) =>
                  word
                    .split("")
                    .map((ch, i) =>
                      orig[i] >= "A" && orig[i] <= "Z" ? ch.toUpperCase() : ch,
                    )
                    .join("");

                if (showingOriginal) {
                  // Animate from original → next neighbor (case-corrected)
                  const targetWord = matchCase(
                    originalWord,
                    neighborsList[cursor],
                  );
                  let diffIndex = -1;
                  for (let i = 0; i < originalWord.length; i++) {
                    if (originalWord[i] !== targetWord[i]) {
                      diffIndex = i;
                      break;
                    }
                  }
                  if (diffIndex === -1) return;

                  spinLetter(
                    letterSpans[diffIndex],
                    originalWord[diffIndex],
                    targetWord[diffIndex],
                    () => {
                      for (let i = 0; i < letterSpans.length; i++) {
                        letterSpans[i].textContent = targetWord[i];
                      }
                      span.setAttribute("data-showing-original", "false");
                      span.setAttribute("data-current-neighbor", targetWord);
                    },
                  );
                } else {
                  // Animate from current neighbor → original
                  const currentNeighbor = span.getAttribute(
                    "data-current-neighbor",
                  );
                  let diffIndex = -1;
                  for (let i = 0; i < originalWord.length; i++) {
                    if (currentNeighbor[i] !== originalWord[i]) {
                      diffIndex = i;
                      break;
                    }
                  }
                  if (diffIndex === -1) return;

                  spinLetter(
                    letterSpans[diffIndex],
                    currentNeighbor[diffIndex],
                    originalWord[diffIndex],
                    () => {
                      for (let i = 0; i < letterSpans.length; i++) {
                        letterSpans[i].textContent = originalWord[i];
                      }
                      span.setAttribute("data-showing-original", "true");
                      // cycle through indices 1..length-1 (index 0 is the original)
                      const nextCursor =
                        cursor >= neighborsList.length - 1 ? 1 : cursor + 1;
                      span.setAttribute(
                        "data-neighbor-cursor",
                        String(nextCursor),
                      );
                    },
                  );
                }
              } else if (punctuationSymbol.id === LADDER_ID) {
                // Both ladder heroes land here; hero.ladderDirection is the only difference. The
                // fan's children share the id so this gate matches them unchanged (§2.5, note 3),
                // and the split is on the attribute rather than on a second collision branch.
                if (punctuationSymbol.dataset.ladderChild) {
                  pickRung(punctuationSymbol, player, projectile);
                } else {
                  climbLadder(punctuationSymbol, player, projectile);
                }
              } else if (punctuationSymbol.id === RACE_UP_ID) {
                // Word Race splits the two heroes across two ids instead of sharing one (§12.2), so
                // the gate above has already decided which hero this is — General can only ever
                // reach the rung above, Keen only the word you summoned.
                raceShootUp(punctuationSymbol, player, projectile);
              } else if (punctuationSymbol.id === RACE_DOWN_ID) {
                raceShootDown(punctuationSymbol, player, projectile);
              } else if (punctuationSymbol.id === spacel.symbol) {
                if (punctuationSymbol.hasAttribute("data-splitwords")) {
                  const [firstWord, secondWord] =
                    punctuationSymbol.dataset.splitwords.split(" ");
                  punctuationSymbol.textContent = `${firstWord} ${secondWord}`;

                  // Remove the attribute so it doesn't split again on subsequent clicks
                  punctuationSymbol.removeAttribute("data-splitwords");
                }
              } else if (punctuationSymbol.id === zana.symbol) {
                const originalText = punctuationSymbol.textContent;
                const alteredText = punctuationSymbol.dataset.caret;
                let additionalLetter = "";

                for (let i = 0; i < alteredText.length; i++) {
                  if (originalText[i] !== alteredText[i]) {
                    additionalLetter = alteredText[i];
                    break;
                  }
                }

                if (additionalLetter) {
                  const newText = alteredText.replace(
                    additionalLetter,
                    `<sup class="superscript">${additionalLetter}</sup>`,
                  );
                  punctuationSymbol.innerHTML = newText;
                }
              } else if (punctuationSymbol.id === foon.symbol) {
                const animationEnd = (which, element) =>
                  new Promise((resolve) => {
                    element.addEventListener(which, function callback() {
                      element.removeEventListener(which, callback);
                      resolve();
                    });
                  });

                const swapClusters = async () => {
                  if (isAnimating) return; // If an animation is in progress, return immediately to avoid processing

                  //if (target.id !== "The Foon (Spoonerism)") return;
                  if (punctuationSymbol.id !== "The Foon (Spoonerism)") return;

                  if (previousElement) {
                    if (previousElement === punctuationSymbol) {
                      // Same element triggered in succession, so just return
                      return;
                    }
                    isAnimating = true;

                    // Determine the direction of movement
                    let targetUpwardAnimation, prevElemUpwardAnimation;
                    if (
                      punctuationSymbol.getBoundingClientRect().left <
                      previousElement.getBoundingClientRect().left
                    ) {
                      targetUpwardAnimation = "floatingUpToRight";
                      prevElemUpwardAnimation = "floatingUpToLeft";
                    } else {
                      targetUpwardAnimation = "floatingUpToLeft";
                      prevElemUpwardAnimation = "floatingUpToRight";
                    }

                    punctuationSymbol.classList.add(targetUpwardAnimation);
                    previousElement.classList.add(prevElemUpwardAnimation);

                    await Promise.all([
                      animationEnd("animationend", punctuationSymbol),
                      animationEnd("animationend", previousElement),
                    ]);

                    // Cleanup the floatingUp animations
                    punctuationSymbol.classList.remove(targetUpwardAnimation);
                    previousElement.classList.remove(prevElemUpwardAnimation);

                    // Swap the actual clusters
                    const tempClass = punctuationSymbol.className;
                    punctuationSymbol.className = previousElement.className;
                    previousElement.className = tempClass;

                    const tempText = punctuationSymbol.textContent;
                    punctuationSymbol.textContent = previousElement.textContent;
                    previousElement.textContent = tempText;

                    // Apply the "float down" animation based on direction
                    let targetDownwardAnimation, prevElemDownwardAnimation;
                    if (targetUpwardAnimation === "floatingUpToLeft") {
                      targetDownwardAnimation = "floatingDownFromLeft";
                      prevElemDownwardAnimation = "floatingDownFromRight";
                    } else {
                      targetDownwardAnimation = "floatingDownFromRight";
                      prevElemDownwardAnimation = "floatingDownFromLeft";
                    }

                    punctuationSymbol.classList.add(targetDownwardAnimation);
                    previousElement.classList.add(prevElemDownwardAnimation);

                    await Promise.all([
                      animationEnd("animationend", punctuationSymbol),
                      animationEnd("animationend", previousElement),
                    ]);

                    // Clean up post-animation
                    punctuationSymbol.classList.remove(targetDownwardAnimation);
                    previousElement.classList.remove(prevElemDownwardAnimation);
                    previousElement = null;
                    isAnimating = false;
                    previousElement.style.textDecoration = "none";
                    // Reset for the next interaction
                  } else {
                    punctuationSymbol.style.textDecoration = "underline";
                    previousElement = punctuationSymbol;
                  }
                };

                swapClusters();
              } else if (punctuationSymbol.id === dele.symbol) {
                if (punctuationSymbol.getAttribute("data-handled") === "true")
                  return;
                punctuationSymbol.setAttribute("data-handled", "true");

                // Get the word to change into from the data-wited-word attribute
                const witedWord =
                  punctuationSymbol.getAttribute("data-wited-word");
                const originalWord = punctuationSymbol.textContent;
                let indexToFadeOut = -1;

                // Find the index of the letter that is different between the original word and the wited word
                for (let i = 0; i < originalWord.length; i++) {
                  if (witedWord.indexOf(originalWord[i]) === -1) {
                    indexToFadeOut = i;
                    break;
                  }
                }

                // Split the word into parts: before, the letter to fade out, and after
                const partBefore = originalWord.slice(0, indexToFadeOut);
                const partAfter = originalWord.slice(indexToFadeOut + 1);
                const letterToFadeOut = originalWord[indexToFadeOut];

                // Wrap the letter to fade out in a span with the fade-out class
                punctuationSymbol.innerHTML =
                  partBefore +
                  `<span class="fade-out">${letterToFadeOut}</span>` +
                  partAfter;

                // Wait for the next frame so the browser acknowledges the new span and then start the fade out
                requestAnimationFrame(() => {
                  const fadeOutSpan =
                    punctuationSymbol.querySelector(".fade-out");
                  fadeOutSpan.style.transition = "opacity 0.5s";
                  fadeOutSpan.style.opacity = "0";

                  // After the fade out transition, set the text to the wited word
                  setTimeout(() => {
                    punctuationSymbol.textContent = witedWord;
                  }, 500); // This duration should match the CSS transition
                });
              } else if (punctuationSymbol.id === roundabout.symbol) {
                if (punctuationSymbol.getAttribute("data-handled") === "true")
                  return;
                punctuationSymbol.setAttribute("data-handled", "true");

                const roundedWord = punctuationSymbol.dataset.roundedWord;
                const currentWord = punctuationSymbol.textContent.trim();

                _animateRoundabout(punctuationSymbol, currentWord, roundedWord);
              } else {
                punctuationSymbol.style.color = `${player.characterColor}`;
                punctuationSymbol.style.textShadow =
                  "1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000";
              }

              allPunctuationHit.add(punctuationSymbol);
              if (
                allPunctuationHit.size === numberOfPunctuationArray.length &&
                ENDING_REACHED === false
              ) {
                // console.log("All Punctuation Hit!");
                changeTextToSpeechBubble(speechLineForWin, endingMessage1);
                refreshButton.classList.remove("go-away");
                root.style.setProperty(
                  "--speech-bubble-triangle",
                  projectile.position.x,
                );
                root.style.setProperty("--color", player.characterColor);
                ENDING_REACHED = true;
                gameSfx.end.play();
              }
              setTimeout(() => {
                projectiles.splice(index, 1);
                player.hitProjectileSound();

                if (player.symbol === asterisk.symbol) {
                  if (punctuationSymbol.previousSibling === null) return;
                  let words = punctuationSymbol.previousSibling.data.split(" ");
                  let capital =
                    punctuationSymbol.previousSibling.previousSibling;
                  if (capital?.id === capitalize.symbol) {
                    let lastWord = `${capital["innerText"]}${
                      words[words.length - 1]
                    }`;
                    freeDictionaryFetchDefinition(lastWord);
                    footNote.classList.remove("go-away");
                  } else {
                    let lastWord = words[words.length - 1];
                    freeDictionaryFetchDefinition(lastWord);
                    footNote.classList.remove("go-away");
                  }
                }
                punctuationSymbol.classList.remove("hidden-punc");
              }, 0);

              if (player.symbol === anacontraction.symbol) {
                shortenContraction(punctuationSymbol);
              }
              if (player.symbol === article.symbol) {
                const currentText = punctuationSymbol.textContent;
                const alternateText =
                  punctuationSymbol.getAttribute("data-alternate");

                punctuationSymbol.textContent = alternateText;
                punctuationSymbol.setAttribute("data-alternate", currentText);

                punctuationSymbol.classList.add("giggling-text");
                setTimeout(function () {
                  punctuationSymbol.classList.remove("giggling-text");
                }, 900); // Remove the giggling effect after 0.3s * 3 iterations
              }
              //Garbage collection for when the projectile goes off the screen. Settimeout prevents flashing of projectile
            } else if (projectile.position.y + projectile.height <= 0) {
              setTimeout(() => {
                projectiles.splice(index, 1);
              }, 0);
            } else {
              //hero disappears otherwise.
              if (player.secondHeroImage) {
                c.fillStyle = "white";
                c.fillRect(0, 0, canvas.width, canvas.height);
                player.update2();
              }
              projectile.update();
            }
          }
        }
      });
    }
  });
}

//mySong.play();
animate();

//https://stackoverflow.com/questions/69491293/how-to-do-a-work-when-mousedown-until-mouseup

//Do not want the user to be able to move the title team page
function doActionOnce() {
  if (bRightAfterSentenceIsLoaded) {
    // The click that starts a round bubbles up to here in the SAME task that filled #output, so the
    // MutationObserver that fills chosenHeroArray (a microtask) has not run yet. Leave the flag set
    // and let the next click or keypress do the reveal, rather than spending it on an empty team —
    // `player = undefined` is unrecoverable, since animate() then throws on every frame.
    if (chosenHeroArray.length === 0) return;
    bRightAfterSentenceIsLoaded = false;
    //console.log("Action triggered!");

    player = chosenHeroArray[0];
    // Clean up event listeners
    document.removeEventListener("keydown", handleFirstClickOrKeyPress);
    document.removeEventListener("click", handleFirstClickOrKeyPress);

    hintButton.setAttribute("class", "");
  }
}

function handleFirstClickOrKeyPress() {
  doActionOnce();
}

// Attach listeners
document.addEventListener("keydown", handleFirstClickOrKeyPress);
document.addEventListener("click", handleFirstClickOrKeyPress);

leftButton.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  let interval = setInterval(() => {
    //want them to be able to move off the screen a little hence the subtraction
    if (player.position.x >= 0 - player.width / 2) {
      // player.velocity.x = -5;
      player.position.x -= 10;
    }
  }, 50);
  leftButton.addEventListener("pointerup", () => {
    clearInterval(interval);
  });
});

rightButton.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  let interval = setInterval(() => {
    if (player.position.x <= canvas.width - player.width / 2) {
      player.position.x += 10;
    }
  }, 50);
  rightButton.addEventListener("pointerup", () => {
    clearInterval(interval);
  });
});

shootButton.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  player.shootProjectileSound();
  if (player === comma || player === hashtag) {
    projectiles.push(
      new CommaTongue({
        position: {
          x: player.position.x + player.width - player.projectileStartPositionX,
          y: player.position.y,
        },
        velocity: {
          x: 0,
          y: -10,
        },
      }),
    );
  } else if (player.characterColor !== undefined) {
    projectiles.push(
      new Projectile({
        position: {
          x: player.position.x + player.width - player.projectileStartPositionX,
          y: player.position.y,
        },
        velocity: {
          x: 0,
          y: -10,
        },
      }),
    );
    // player.draw2();
    // player.update2();
  }
});
console.log("node2", nodeArr);

// How fast (px per frame) a hero slides off / onto the screen when switching.
const SWITCH_SLIDE_SPEED = 32;
// Guards against starting a new switch while one is still animating.
let isSwitching = false;

// A hero's resting y — feet near the bottom of the canvas (matches the
// position set in the Hero constructor when its image loads).
function restingY(hero) {
  return canvas.height - hero.height + 20;
}

// The same horizontal range the arrow keys allow — a hero may hang half its
// width off either edge. Used when a hero inherits another's spot, so a wide
// hero taking over from a narrow one can't land somewhere unwalkable.
function clampHeroX(x, hero) {
  return Math.min(Math.max(x, -hero.width / 2), canvas.width - hero.width / 2);
}

// Slide the current hero down off the bottom of the screen, swap in the next
// hero, then slide it up from the bottom into its resting position.
function switchToNextHero() {
  if (chosenHeroArray.length === 0) return;
  if (isSwitching) return;

  //This code will make it so the tongue doesn't stay on the screen if comma chameleon is switched out. All other projectiles will stay though
  if (
    projectiles.length &&
    projectiles[0]?.constructor?.name === "CommaTongue"
  ) {
    projectiles.length = 0;
  }

  const current = player;
  const next =
    current === chosenHeroArray[chosenHeroArray.length - 1]
      ? chosenHeroArray[0]
      : chosenHeroArray[chosenHeroArray.indexOf(current) + 1];

  // Only one hero to choose from — nothing to animate.
  if (next === current) return;

  // Switching is what flips broaden ↔ narrow (§4), so an open shelf belongs to the hero leaving
  // (§2.5.2). General has no shelf to show, and Keen redraws his on the next hit.
  closeShelfFan();

  isSwitching = true;

  // Phase 1: slide the current hero straight down, off the bottom edge.
  const slideOut = () => {
    current.position.y += SWITCH_SLIDE_SPEED;
    if (current.position.y < canvas.height) {
      requestAnimationFrame(slideOut);
      return;
    }
    // Park the outgoing hero back at rest for the next time it's shown.
    current.position.y = restingY(current);

    // Swap in the next hero, starting just below the screen.
    player = next;
    nameTag.innerText = player.symbol;
    root.style.setProperty("--color", player.characterColor);
    // The incoming hero takes over the outgoing hero's spot rather than
    // recentring, and it's the *centre* that's carried: heroes differ hugely in
    // width (Keen Arrow 40px, Betar 320) and the projectile spawns off the
    // hero's centre, so matching centres keeps the switch under your aim.
    const centreX = current.position.x + current.width / 2;
    player.position.x = clampHeroX(centreX - player.width / 2, player);
    player.position.y = canvas.height;
    requestAnimationFrame(slideIn);
  };

  // Phase 2: slide the new hero up from the bottom to its resting position.
  const slideIn = () => {
    const rest = restingY(player);
    player.position.y -= SWITCH_SLIDE_SPEED;
    if (player.position.y > rest) {
      requestAnimationFrame(slideIn);
      return;
    }
    player.position.y = rest;
    isSwitching = false;
  };

  requestAnimationFrame(slideOut);
}

switchButton.addEventListener("pointerdown", (e) => {
  e.preventDefault();

  //This initially makes the hint button appear, should make it more specific down the road so can add more classes if needed

  switchToNextHero();
});

hintButton.addEventListener("pointerdown", (e) => {
  e.preventDefault();

  numberOfPunctuationArray.forEach((punctuationSymbol) => {
    if (punctuationSymbol.className === "hidden-punc") {
      punctuationSymbol.className += " highlighted-punc";

      setTimeout(() => {
        punctuationSymbol.classList.remove("highlighted-punc");
      }, 1000);
    } else if (punctuationSymbol.classList.contains("capital-black-hole")) {
      punctuationSymbol.className += " hint-capital-underline";

      setTimeout(() => {
        punctuationSymbol.classList.remove("hint-capital-underline");
      }, 1000);
    } else if (secondContractionWordSet.has(punctuationSymbol.className)) {
      punctuationSymbol.className += " hint-contraction-underline";

      setTimeout(() => {
        punctuationSymbol.classList.remove("hint-contraction-underline");
      }, 1000);
    } else if (
      punctuationSymbol.classList.contains("a") ||
      punctuationSymbol.classList.contains("the") ||
      punctuationSymbol.classList.contains("an")
    ) {
      punctuationSymbol.className += " hint-article-underline";

      setTimeout(() => {
        punctuationSymbol.classList.remove("hint-article-underline");
      }, 1000);
    }
  });

  if (nodeArr && numberOfPunctuationArray.length === 0) {
    nodeArr.forEach((punctuationSymbol) => {
      //if (punctuationSymbol.hasAttribute("id")) {
      if (punctuationSymbol.id) {
        //This is just generic for any of the wordplay ones
        // or .hasAttribute("id")
        console.log("hitn");
        punctuationSymbol.setAttribute("data-hint", "1"); // value can be whatever

        setTimeout(() => {
          punctuationSymbol.removeAttribute("data-hint");
        }, 1000);
      }
    });
  }
});

/* Word Race keeps the sentence box on screen and repurposes it as the move box (§12.2), so for the
   first time the player can be typing while a hero is on the field — and `a`, `d` and the arrows
   would otherwise walk and fire the hero as they wrote. Harmless in every other mode, where the box
   is sent away the moment a round starts. */
function isTypingTarget(el) {
  return (
    !!el &&
    (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)
  );
}

addEventListener("keydown", (event) => {
  if (isTypingTarget(event.target)) return;
  const { key } = event;
  switch (key) {
    case "a":
    case "ArrowLeft":
      if (chosenHeroArray.length === 0) return;
      if (player.position.x >= 0 - player.width / 2) {
        player.position.x -= 10;
      }
      break;

    case "d":
    case "ArrowRight":
      if (chosenHeroArray.length === 0) return;
      if (player.position.x <= canvas.width - player.width / 2) {
        player.position.x += 10;
      }
      break;

    case "ArrowDown":
      switchToNextHero();
      break;

    //case "w":  This causes second animation to show if a w is typed in initial sentence
    case "ArrowUp":
      player.shootProjectileSound();
      if (player === comma || player === hashtag) {
        projectiles.push(
          new CommaTongue({
            position: {
              x:
                player.position.x +
                player.width -
                player.projectileStartPositionX,
              y: player.position.y,
            },
            velocity: {
              x: 0,
              y: -10,
            },
          }),
        );
      } else if (player.characterColor !== undefined) {
        projectiles.push(
          new Projectile({
            position: {
              x:
                player.position.x +
                player.width -
                player.projectileStartPositionX,
              y: player.position.y,
            },
            velocity: {
              x: 0,
              y: -10,
            },
          }),
        );
      }
  }
});

/* "#output span", not "span" — waitForElement resolves the moment its selector matches ANYTHING, and
   the only thing that fills nodeArr is the MutationObserver it installs on the way. So a single
   unrelated span in the static markup makes it resolve at page load with nodeArr still empty, and the
   whole team comes back empty. That is exactly what happened on 2026-08-21: the banner's
   <span class="title-tail">The Game</span> went in, and from then on every mode drew nothing, because
   `player = chosenHeroArray[0]` was undefined and animate() threw on every frame.
   Scoping the wait to the sentence's own output keeps it honest — #output is empty until a round starts. */
elm = await waitForElement("#output span");
chosenHeroArray = heroToTheRescue(nodeArr, availableHeroArray);

let freeDictionaryFetchDefinition = async (word) => {
  let res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
  );
  let data = await res.json();
  console.log({ data });

  let definition;
  if (!data[0]) {
    definition = data.title;
  } else {
    definition = data[0].meanings[0].definitions[0].definition;
  }

  const footnoteTitle = document.getElementById("footnote_title");
  const footnoteBody = document.getElementById("footnote--body");

  footnoteBody.innerText = `*${definition}`;
  footnoteTitle.innerText = `*${word}`;
  footNote.innerText = `*${word}`;
};
