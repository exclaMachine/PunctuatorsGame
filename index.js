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
// The How-to-Play card for the mode you have picked (one per <option>) — swapped in on selection,
// not at Pow!, so the rules are readable while you are still choosing what to play.
import { modeHelpFor } from "./modeHelp.js";
// The centre-of-screen picture for the mode you have picked (one card per <option>), swapped in on
// selection alongside the How-to-Play card and cleared when the round starts.
import { renderModeArt } from "./modeArt.js";
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
  loadRacePairs,
  pickRacePair,
  raceDayIndex,
  classifyGuess,
  canDescend,
  createRace,
  raceFieldHTML,
  ancestorsOf,
} from "./ladderRace.js";
// Restore the Phrase — the ladder's puzzle mode (docs/punctuators-ladder.md §11). phrasePOJO.js
// (24 KB) rides along with the main corpus and is fetched only by this mode.
import {
  loadPhrases,
  pickPhrase,
  wrapPhrase,
  createPuzzle,
  nextRungToward,
  phraseSurface,
} from "./ladderPhrase.js";
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
  // In a puzzle the row must be able to contain the answer, or narrowing simply cannot solve it:
  // shelves run far wider than the row (`food` has 239 children, `eggs` is the 164th), so the next
  // rung toward the goal is pinned into the row and the row re-sorted so it doesn't sit in a
  // tell-tale slot. Free play pins nothing and is untouched (§11.6, shelfFor's `pin`).
  const shelf = shelfFor(
    word,
    shelfFanWidth(),
    ladderMapHas,
    phrasePinFor(span, word),
  );
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
  // `a dog` → `an animal`, live. Art the Tickler is suppressed in every ladder mode, so the article
  // in front of a word that just changed is plain text that nothing else will fix — the same
  // text-node edit Restore the Phrase makes (§11.6), now that free play has no hero to do it either.
  // Harmless to run twice: notePhraseLanding below makes the same call in the puzzle, and the second
  // one finds the article already right and returns.
  const surface = renderRung(rung, original, plural);
  fixArticleBefore(span, surface);
  animateLadderSwap(span, shown, surface, hero);
  // After the swap, not before: the face carries the new word's width the moment it is built, so the
  // banner is measured against the box the word actually ends up holding.
  if (newlyLit) noteShelfProgress(span, rung);
  // Restore the Phrase scores the landing and locks the word if it has come home (§11.6). A no-op
  // in free play, which is why the puzzle needs no branch of its own through climbLadder.
  notePhraseLanding(span, rung);
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
  flyPickedChild(
    kidRect,
    host.getBoundingClientRect(),
    kidText,
    hero.characterColor,
  );
  // No aperture flicker: the lens snap landOnRung just started is this shot's mark on the word.
  openShelfFan(host, hero, false);
}

/* ── WORD RACE (docs/punctuators-ladder.md §12) ───────────────────────────────────────────────────

   Shoot to ask, type to summon, shoot to travel. Going UP needs no typing — there is only ever one
   parent, so General shoots the rung floating above you. Going DOWN takes two of Keen's shots and a
   word: the first shot lands on the word you are STANDING on and is the ask — it opens the move box
   and names what it wants ("a kind of dog?") — then what you type spawns beneath you, and a second
   shot travels there (§12.8 Note 2).

   That first shot is why the move box is not simply on screen for the whole run. A text box sitting
   open from the first frame reads as an instruction for right now, and the first move of a race is
   usually General's; asking for it with a shot means the box only ever appears at the moment there
   is something to type, and it appears because the player did something.

   Why typing at all, when no other Punctuators mode asks for it (§14.1): branching is simply too
   wide to draw. `person` has 805 children, `fish` 221 — a "shoot one of the children shown" field
   can only ever show a subset, and if that subset is guaranteed to contain the route, it telegraphs
   the answer. The shootable field survives as easy mode instead (decoysFor in ladderRace.js).

   M9 is the engine only: one hardcoded pair, no daily, no stats, no share, no route overlay. The
   daily and its map lock are M10, the win card and easy mode are M11.
*/

/* ── WHICH PAIR (§12.3) ───────────────────────────────────────────────────────────────────────
 *
 * The pool is racePOJO.js — 239 hand-kept pairs, frozen, each with its par baked in. Two ways to
 * draw from it, one flag apart:
 *
 *   PRACTICE  a random pair every Pow!, which is how the mode runs while it is dev-only. Replaying
 *             is the point: 239 pairs is 34 weeks of dailies, and sweeping them at random is how
 *             the ones still wanting a prune get found. (§11's M6 deals its sayings the same way,
 *             for the same reason.)
 *   DAILY     pickRacePair(raceDayIndex()) — positional, so everyone gets the same race that day
 *             and yesterday's never changes. Flip RACE_DAILY and it is live; the rest of M10 (the
 *             lock, the stats, the share, and the map's ladderMapLock/Unlock pair) hangs off that.
 *
 * `?race=N` forces one pair by index for testing, and beats both.
 */
const RACE_DAILY = false;
const RACE_INDEX_PARAM = new URLSearchParams(location.search).get("race");

let racePair = null; // {start, target, par, index} — the pair the goal display is promising

/* Draw the next pair. `keep` is for the goal display, which must not re-roll what Pow! is about to
   deal — the destination on screen has to be the one you then race to. */
function chooseRacePair(keep = false) {
  if (keep && racePair) return racePair;
  // Guarded against RACE_INDEX_PARAM being null, which Number() turns into a perfectly valid 0 —
  // that would pin every visitor to the first pair in the list forever.
  const forced =
    RACE_INDEX_PARAM === null ? NaN : Number.parseInt(RACE_INDEX_PARAM, 10);
  const index = Number.isInteger(forced)
    ? forced
    : RACE_DAILY
      ? raceDayIndex()
      : undefined; // undefined = the practice pick, a random pair
  racePair = pickRacePair(index);
  return racePair;
}

let race = null; // the run in progress, from createRace()
let raceEls = null; // {up, here, down} — resolved once after the field renders, then rewritten in place
let raceSummoned = ""; // the word currently sitting in Keen's slot, "" when empty
let raceArmed = false; // Keen has struck the word you stand on: the move box is open, awaiting a kind

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

/* Keen's target is wherever his next shot should land, and that is one of two spans (see
   raceFieldHTML). Moving the id rather than giving both spans one keeps animate()'s gate the sole
   arbiter — there is never a frame in which two spans could answer to the same hero. */
function aimKeenAt(el) {
  for (const other of [raceEls.here, raceEls.down]) {
    if (other !== el) other.removeAttribute("id");
  }
  el.id = RACE_DOWN_ID;
}

function updateRaceField() {
  if (!raceEls) return;
  setRaceSpan(raceEls.up, race.up(), "— the top —");
  setRaceSpan(raceEls.here, race.at, race.at);
  // The slot below is not a standing invitation: it exists only while it holds a word you named,
  // and is off the screen entirely the rest of the time (§12.8 Note 2). Hiding the last item of a
  // centred column moves nothing above it, so §12.2's worry about the field shifting under the
  // player's aim doesn't apply.
  setRaceSpan(raceEls.down, raceSummoned, "");
  raceEls.down.hidden = !raceSummoned;
  aimKeenAt(raceSummoned ? raceEls.down : raceEls.here);
  paintMoveBox();
  paintRaceGoal();
}

/* The move box is open exactly while Keen is waiting for a word: from his shot on the current word
   until the move that shot pays for. It stays up (blurred) after a summon rather than closing, so a
   misheard guess can be replaced without spending another shot to reopen it. */
function paintMoveBox() {
  if (!raceActive()) return;
  const open = raceArmed && !race.solved;
  initialTypedSentence.classList.toggle("go-away", !open);
  if (open) initialTypedSentence.placeholder = `a kind of ${race.at}…`;
}

/* ── THE GOAL DISPLAY (§12.8, Note 1) ─────────────────────────────────────────────────────────────

   The destination has to be on screen or the mode is unplayable: a traversal game whose target
   isn't visible is indistinguishable from aimless word-climbing, which is exactly how the first
   play of M9 read. The predecessor (#race-banner) painted its line correctly and was simply never
   seen — it was the only in-flow element on a page whose other siblings are all absolute or fixed,
   so it landed under the fixed title. It is retired here rather than repositioned: two places
   showing race state is one too many, so this display absorbs par, moves and detours as well.

   It lives in #input-container because that is fixed, always in view, and where the player just
   clicked Pow!. Chosen from the dropdown, it REPLACES the sentence box — the box has no job before
   a race starts, and an empty text field reads as "type your sentence here", the exact wrong
   instruction. The box returns beneath it as the move box only when Keen Arrow asks for a word
   (§12.8 Note 2), so the route — not the box — is what stays on screen for the whole run.
*/
const raceGoal = document.getElementById("race-goal");
const inputContainer = document.getElementById("input-container");

/* One route line, two states. `sub` is the second line: the instruction before the run, the score
   during it. Written as HTML because both lines carry markup. */
function drawRaceGoal(start, target, sub, solved = false) {
  if (!raceGoal) return;
  raceGoal.innerHTML =
    `<span class="race-goal-route">` +
    `<strong class="race-goal-from">${start}</strong> ⟶ ` +
    `<strong class="race-goal-to">${target}</strong></span>` +
    `<span class="race-goal-sub">${sub}</span>`;
  raceGoal.classList.toggle("solved", solved);
  inputContainer?.classList.add("race-on");
}

function clearRaceGoal() {
  if (!raceGoal) return;
  raceGoal.innerHTML = "";
  raceGoal.classList.remove("solved");
  inputContainer?.classList.remove("race-on");
}

/* Before Pow!. racePOJO.js is 7 KB against the corpus's 337, so the pair — and its baked par — can
   be on screen the instant the mode is picked, while the ladder itself is still unfetched. Drawn
   twice on purpose: once immediately with whatever is already loaded, then again when the pool
   lands, because the display is what makes the mode legible and an empty box in its place for two
   seconds is the very failure §12.8 opened with. */
async function previewRaceGoal(reroll = false) {
  const rule = "Travel from one word to the other in as few moves as you can.";
  const paint = (pair) =>
    pair
      ? drawRaceGoal(pair.start, pair.target, `Par ${pair.par} · ${rule}`)
      : drawRaceGoal("…", "…", rule);
  paint(chooseRacePair(!reroll));
  try {
    await loadRacePairs();
  } catch (e) {
    return drawRaceGoal("…", "…", "Couldn't load the races — try again.");
  }
  // Still the right mode? A slow fetch must not repaint over a dropdown change made meanwhile.
  if (wordPlayOptions.value !== "wordRace" || raceActive()) return;
  // `keep` from here on: the first draw may have had nothing to show, but once a pair is on screen
  // it is a promise about the race Pow! is going to deal, and re-rolling underneath it breaks that.
  paint(chooseRacePair(true));
}

/* During the run. Deliberately thin in M9 — where you're going, what par is and what you've spent,
   and nothing else; §12.3's stats, streak and share are M10's. */
function paintRaceGoal() {
  if (!race) return;
  const bits = [
    `Par ${race.par}`,
    `${race.moves} move${race.moves === 1 ? "" : "s"}`,
  ];
  if (race.detours)
    bits.push(`${race.detours} detour${race.detours === 1 ? "" : "s"}`);
  const hint = race.hint();
  if (hint) bits.push(hint);
  drawRaceGoal(race.start, race.target, bits.join(" · "), race.solved);
}

/* The two modes that bring their own words, so the sentence box has no job in either (§12.8 Note 1,
   §11.6). An empty text field reads as "type your sentence here", the exact wrong instruction. */
const NO_SENTENCE_MODES = new Set(["wordRace", "ladderPuzzle"]);

/* The swap happens on SELECTION, not on Pow!. Both the native <select> and the custom dropdown that
   covers it end up here — the dropdown dispatches a change event after setting sel.value. */
wordPlayOptions.addEventListener("change", () => {
  if (raceActive() || phraseActive()) return; // mid-run the dropdown is hidden; nothing to swap
  const mode = wordPlayOptions.value;
  // The card for the mode you just picked, before Pow! — an empty modal saying "shoot the
  // punctuation back in" is the wrong instruction for eleven of the twelve modes.
  updateCharacterModal(mode);
  // …and the picture in the middle of the screen, which is the half of that answer you get without
  // opening anything.
  paintModeArt(mode);
  initialTypedSentence.classList.toggle("go-away", NO_SENTENCE_MODES.has(mode));
  errorMessage.innerText = ""; // a leftover "Field cannot be blank" is about the old mode
  // Re-roll on every selection: picking the mode again is the one gesture that plainly means
  // "deal me another", and while the mode is practice-only (RACE_DAILY) that is how you sweep the
  // pool. Under the daily it is a no-op — the index is the date either way.
  if (mode === "wordRace") previewRaceGoal(true);
  else clearRaceGoal();
  if (mode === "ladderPuzzle") {
    // Word Race paints its destination into #race-goal in the box's place; this mode has nothing to
    // show before Pow! (the saying is dealt then), so it says what the button is about to do.
    phraseSay(
      "Press Pow! for a saying with its words shifted along the ladder.",
      "black",
    );
  }
});

function raceSay(text, tone = "") {
  errorMessage.style.color = tone;
  errorMessage.innerText = text;
}

/* The kinds of "no", and they must sound different (§12.2) — lumping them together is what makes a
   typing game feel broken. Two of them aren't the player's fault: UNKNOWN (the word is real, the
   data just lacks it) and DEEPER (the word really IS a kind of where you stand, just not the next
   rung down), so both concede before they refuse and neither reads as "you were wrong". */
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
      // Hand the keyboard back. The global movement handler ignores keystrokes aimed at an input,
      // so leaving focus in the box would mean the shot the message just asked for could not be
      // fired without clicking away first.
      initialTypedSentence.blur();
      break;
    // True, but too far down. Naming the rungs it skips would hand over the answer, so the message
    // says only HOW FAR — real information about the hierarchy, in the same spirit as race.hint().
    case GUESS.DEEPER:
      raceSay(
        `${verdict.word} is a kind of ${race.at}, but ${verdict.rungs} rungs down — ` +
          `one rung at a time. What comes between?`,
      );
      break;
    case GUESS.BROADER:
      raceSay(
        `${verdict.word} is BROADER than ${race.at} — switch to General Ization and shoot upward.`,
      );
      break;
    case GUESS.SAME:
      raceSay(`you're standing on ${verdict.word}.`);
      break;
    case GUESS.UNRELATED:
      raceSay(`${verdict.word} isn't a kind of ${race.at}.`);
      break;
    default:
      // Apologetic on purpose: five of the thirty guesses §12.2 probed were simply absent.
      raceSay(
        `${verdict.word || "that"} isn't in my book — try another word. (No cost.)`,
      );
      break;
  }
}

/* Landing. A move is exactly one rung in either direction (§12.2 — no skipping), so the word landed
   on is the whole of what this move crossed, and it lights on the Tree of Kinds, which §13 fills
   from every ladder mode alike. Only the rungs actually travelled light: the map is a record of
   where you have been, which is why this lights the landing word and nothing above it. */
function raceTravel(word, hero) {
  const { detour, solved } = race.travelTo(word);
  raceSummoned = "";
  raceArmed = false; // a new word to stand on: Keen has to ask again before the box comes back
  ladderMapVisit(word);

  if (hero.ladderDirection === "up") _izoHit();
  else _keenHit();
  updateRaceField();

  if (solved) {
    _ladderCapstone();
    raceSay(
      `✔ ${race.target} — ${race.moves} moves against par ${race.par}` +
        (race.detours
          ? `, ${race.detours} detour${race.detours === 1 ? "" : "s"}`
          : ""),
      "black",
    );
    initialTypedSentence.disabled = true;
  } else if (detour) {
    raceSay(`${word} — that's not closer.`);
  } else {
    raceSay("");
  }
}

/* Keen's shot, which means one of two things depending on which span his id is currently on
   (raceFieldHTML). On the word you're standing on it is the ASK — it opens the move box; on the
   word you summoned it is the MOVE. Split on the span rather than on emptiness, because the word
   you're standing on is never empty and would otherwise read as a destination. */
function raceShootDown(span, hero, projectile) {
  if (!claimLadderShot(projectile) || !raceActive() || race.solved) return;
  if (span === raceEls?.here) return raceAskForKind(span, hero);
  const word = span.dataset.raceWord;
  if (!word) return; // unreachable: the slot is hidden and id-less until it holds a word
  raceTravel(word, hero);
}

/* The ask. A word with nothing beneath it clanks instead — the capstone, the same sound General
   gets at the top of a tree, because "there is nothing narrower" is a fact about the hierarchy and
   not a miss. Opening a box for an answer that cannot exist would be the worse failure. */
function raceAskForKind(span, hero) {
  if (!canDescend(race.at)) {
    flashLadder(span, hero, "ladder-capstone");
    _ladderCapstone();
    raceSay(
      `nothing is a kind of ${race.at} — go broader with General Ization.`,
    );
    return;
  }
  raceArmed = true;
  flashLadder(span, hero, "ladder-aperture");
  _keenHit();
  paintMoveBox();
  initialTypedSentence.focus();
  raceSay(`a kind of ${race.at}? Type it and press Enter.`, "black");
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

/* ── RESTORE THE PHRASE (docs/punctuators-ladder.md §11) ──────────────────────────────────────────
   A famous saying arrives with some of its words already shifted along the ladder — *A mammal is a
   guy's best friend* — and the puzzle is shooting them back. The ladder's first mode with a right
   answer.

   There is deliberately NO second path through the collision block for this mode. wrapPhrase writes
   ordinary free-play ladder spans, so climbLadder, the shelf fan and both landing animations drive
   the puzzle unchanged; everything below hangs off two hooks in that existing path — a pin for the
   fan, and a scorer on the landing.

   Two things are worth knowing:

   1. THE AUTHORED CHAIN IS NOT A RAIL. §11.6 was written before §2.5's fan and assumed a hit walks
      the authored chain by ±1. With the fan, Keen shows the word's REAL children and you may pick
      one that leaves the chain, so distance is measured on the live hierarchy and General
      broadening back up is the way home. Wandering costs moves; it is never a dead end.
   2. THE FAN MUST BE ABLE TO SHOW THE ANSWER. Shelves run far wider than the row, so the next rung
      toward the goal is pinned into it (phrasePinFor → shelfFor's `pin`). Without that, 77 of the
      97 narrowing steps across the 108 puzzles would be unsolvable rather than merely hard. */

let phrase = null; // the puzzle in progress, from createPuzzle()
let phraseSpans = []; // its shiftable words, in fix order — resolved once after the field renders

function phraseActive() {
  return phrase !== null;
}

/** The child of `word` the fan must include, or null — outside a puzzle, and once a word is home. */
function phrasePinFor(span, word) {
  if (!phraseActive()) return null;
  const n = Number(span.dataset.phraseSlot);
  const slot = phrase.slots[n];
  if (!slot || slot.locked) return null;
  return nextRungToward(word, slot.goal);
}

/* The spans are addressed by data-phrase-slot, so this only has to find them in document order —
   which is fix order, since wrapPhrase numbers them as it walks the sentence. */
function bindPhraseSlots() {
  phraseSpans = Array.from(out1.querySelectorAll("[data-phrase-slot]"));
  return phraseSpans.length === phrase.slots.length;
}

function phraseSay(text, tone = "") {
  errorMessage.style.color = tone;
  errorMessage.innerText = text;
}

/* Wasted moves are the score (§11.2) and nothing else is, so the line stays short: how much of the
   saying is home, what it has cost, and — only when there is one — what the last shot did wrong. */
function paintPhraseStatus(result) {
  if (!phraseActive()) return;
  const bits = [
    `${phrase.locked} of ${phrase.slots.length} restored`,
    `${phrase.moves} move${phrase.moves === 1 ? "" : "s"}`,
  ];
  if (phrase.wasted) bits.push(`${phrase.wasted} wasted`);
  const note = result && result.wasted ? " · that one went the wrong way" : "";
  phraseSay(bits.join(" · ") + note, result && result.wasted ? "" : "black");
}

/* `A dog` → `An animal`, live (§11.6). The articles are plain text in this mode — Art the Tickler is
   suppressed precisely so this is a text-node edit — so the fix is to rewrite the word sitting in
   front of the span. Spelling, not phonetics: `an hour` and `a university` come out wrong, which is
   the same trade the build makes, and no phrase in the corpus shifts a word into one. */
function fixArticleBefore(span, surface) {
  const node = span.previousSibling;
  if (!node || node.nodeType !== Node.TEXT_NODE) return;
  const m = node.textContent.match(/(^|[\s("'])([Aa]n?)(\s+)$/);
  if (!m) return;
  const want = /^[aeiou]/i.test(surface) ? "an" : "a";
  const cased = /^[A-Z]/.test(m[2])
    ? want[0].toUpperCase() + want.slice(1)
    : want;
  if (cased === m[2]) return;
  const tail = m[2].length + m[3].length;
  node.textContent = node.textContent.slice(0, -tail) + cased + m[3];
}

/* A word that has come home is done: the id goes, so neither hero can target it again and a stray
   shot can't knock it loose, and the remaining targets stay obvious (§11.6). */
function lockPhraseWord(span) {
  if (shelfFan && shelfFan.host === span) closeShelfFan();
  span.removeAttribute("id");
  span.removeAttribute("data-rung-strip");
  span.style.color = ""; // the lock's green is the class's, not the hero who happened to land it
  span.classList.add("ladder-locked");
  _phraseLock();
}

/* Every word home. The phrase settles to plain text — the saying is the prize, not the heroes'
   colours — and the win cue that has only ever fired for the punctuation game fires here, because
   this is the first wordplay mode that can be finished (§11.1). The win CARD is M8. */
function phraseWin() {
  closeShelfFan();
  clearShelfMilestone();
  for (const span of phraseSpans) {
    span.classList.remove("ladder-locked");
    span.style.color = "";
    span.style.textShadow = "";
    span.removeAttribute("data-rung-strip");
  }
  out1.classList.add("phrase-solved");
  refreshButton.classList.remove("go-away");
  gameSfx.end.play();
  phraseSay(
    `✔ ${phrase.entry.say} — ${phrase.entry.origin} · ${phrase.moves} move` +
      `${phrase.moves === 1 ? "" : "s"}, ` +
      (phrase.wasted ? `${phrase.wasted} wasted` : "none wasted"),
    "black",
  );
}

/* The scorer, called from landOnRung on every landing in every mode — a no-op outside a puzzle. */
function notePhraseLanding(span, rung) {
  if (!phraseActive() || phrase.solved) return;
  const n = Number(span.dataset.phraseSlot);
  if (!Number.isInteger(n)) return; // a free-play word, or one of the fan's children
  const result = phrase.landOn(n, rung);
  if (!result) return;
  fixArticleBefore(span, phraseSurface(phrase.entry.fix[n], rung));
  if (result.locked) lockPhraseWord(span);
  if (phrase.solved) phraseWin();
  else paintPhraseStatus(result);
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
  // Two ladder modes bring their own words and so start with an empty box: Word Race repurposes it
  // as the move box (§12.2), and Restore the Phrase deals a saying from the corpus (§11.3).
  if (
    !initialTypedSentence.value &&
    !NO_SENTENCE_MODES.has(wordPlayOptions.value)
  ) {
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
      // typing fair (§12.2) — plus racePOJO.js, the frozen pair pool (§12.3).
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
      // `keep`: run the pair the goal display has been promising since the dropdown changed. It is
      // only ever null if racePOJO.js failed to parse, which loadRace would already have thrown on.
      const pair = chooseRacePair(true);
      if (!pair) return (errorMessage.innerText = "No races to run — try again.");
      race = createRace(pair);
      raceSummoned = "";
      raceArmed = false;
      ladderMapVisit(race.at); // where you start counts as somewhere you've been (§13)
      // The column layout goes on #output, not on a wrapper span — see raceFieldHTML for why a
      // wrapper would empty the team.
      out1.classList.add("race-mode");
      addSpansAndIdsForWordPlay(raceFieldHTML(race), out1, selectedOption);
    } else if (selectedOption === "ladderPuzzle") {
      // The ladder corpus again, plus the 24 KB of authored puzzles. Both are fetched only by the
      // modes that need them (§11.5, §3.3).
      errorMessage.style.color = "black";
      errorMessage.innerText = "Dealing a saying…";
      try {
        await loadPhrases();
      } catch (e) {
        errorMessage.style.color = "";
        return (errorMessage.innerText =
          "Couldn't load the sayings — try again.");
      }
      errorMessage.style.color = "";
      errorMessage.innerText = "";
      // A different puzzle every round: M6 is practice, and sweeping the corpus is how the phrases
      // still wanting a sense-prune get found. The daily's positional pick is M7 (§11.7).
      phrase = createPuzzle(pickPhrase());
      out1.classList.add("phrase-mode");
      addSpansAndIdsForWordPlay(wrapPhrase(phrase.entry), out1, selectedOption);
    } else {
      addSpansAndIdsForWordPlay(
        initialTypedSentence.value,
        out1,
        selectedOption,
      );
    }
  }
  mySong.stop();
  // The round is starting, so the mode picture clears the field: it is a DOM element ABOVE the
  // canvas the heroes and their shots are drawn on, and every early return before this point has
  // already had its chance to reject the sentence and leave the picture up.
  hideModeArt();
  // Everything goes away. The sentence box is left out of the list in a race not because it stays
  // on screen — it doesn't — but because its visibility is Keen's to control from here on, and
  // paintMoveBox below owns the class either way (§12.8 Note 2).
  setClassName(
    "go-away",
    ...(selectedOption === "wordRace" ? [] : [initialTypedSentence]),
    removePuncButton,
    startBanner,
    wordPlayOptions,
    typingLink,
  );
  if (selectedOption === "wordRace") {
    // The box was hidden the moment Word Race was picked (§12.8 Note 1) and STAYS hidden through
    // the start of the run: it comes back only when Keen Arrow shoots the word you're standing on
    // and asks for a kind (§12.8 Note 2). updateRaceField paints it shut here, which also covers
    // the case where the change handler never ran (a browser restoring the dropdown on reload).
    initialTypedSentence.value = "";
    initialTypedSentence.disabled = false;
    if (bindRaceField()) updateRaceField();
    // With the box gone there is nothing on screen saying how to move, so the status line opens the
    // run by naming both directions. Every message after this one is written by play.
    raceSay(
      "General Ization shoots the word above to broaden — Keen Arrow shoots your own word to narrow it.",
      "black",
    );
  }

  if (selectedOption === "ladderPuzzle") {
    // The status line has to open the run, because nothing else on screen says what the sentence in
    // front of you is — it reads as an ordinary sentence until you're told a word is out of place.
    // §12.8's lesson, in the one place this mode has to put it until M8's card.
    if (bindPhraseSlots()) {
      phraseSay(
        `This saying has ${phrase.slots.length} word${
          phrase.slots.length === 1 ? "" : "s"
        } in the wrong place on the ladder — shoot them back. General Ization broadens, Keen Arrow narrows.`,
        "black",
      );
    }
  }

  // The native <select> is hidden by CSS and replaced by a custom dropdown
  // (.custom-select-wrapper, built in index.html). Hiding the select alone
  // leaves the visible wrapper on screen, so hide the wrapper too. Use
  // classList.add (not setClassName) to keep the wrapper class intact.
  const selectWrapper = wordPlayOptions.closest(".custom-select-wrapper");
  if (selectWrapper) selectWrapper.classList.add("go-away");

  // Every mode has a card now (modeHelp.js). The dropdown's change handler has normally already
  // swapped it in; this covers the case where it never fired — a browser restoring the selection on
  // reload, or a mode set some other way.
  updateCharacterModal(dropDownSelection);

  setClassName("grid-container", characterControls);

  // Both word-supplying modes write their own status into #error-message as you play, so clearing
  // it here would wipe the line that just told the player what they're looking at.
  if (!NO_SENTENCE_MODES.has(selectedOption)) errorMessage.innerText = "";
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

/* Swap the How-to-Play modal to the card for `selection` (a dropdown <option> value). The copy for
   all twelve modes lives in modeHelp.js; here is only the wiring.

   Two things to keep: the mode's name goes in the HEADER, so no card carries an <h2> of its own and
   nothing is printed twice — and the body is written into .modal--body, NOT the whole #modal, which
   would eat the header and its × (this modal is otherwise closable only by clicking the overlay). */
function updateCharacterModal(selection) {
  const box = document.getElementById("modal");
  if (!box) return;
  const help = modeHelpFor(selection);
  const title = box.querySelector(".modal__title");
  if (title) title.textContent = help.title;
  (box.querySelector(".modal--body") ?? box).innerHTML = help.body;
}

/* The mode picture (modeArt.js). Same two rules as the How-to-Play card above: it is swapped on
   SELECTION rather than at Pow!, and an unknown mode falls back to the punctuation card.

   It also clears `is-gone`, which is insurance rather than a path anyone can walk today: Pow! hides
   the dropdown along with the picture, so the only way back to a mode change is a reload. If the
   dropdown ever survives a round, repainting a card that is still faded out would be the bug. */
function paintModeArt(selection) {
  const box = document.getElementById("mode-art");
  if (!box) return;
  box.innerHTML = renderModeArt(selection);
  box.classList.remove("is-gone");
}

/* Pow!, once the round is actually starting. Called after every validation branch has had its say,
   so a blank field or a sentence with no anagrams leaves the picture where it is. The card stays in
   the DOM (the CSS fades it), which is what lets a win screen's dropdown change bring it back. */
function hideModeArt() {
  document.getElementById("mode-art")?.classList.add("is-gone");
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

// The modal ships with the punctuation card in punctuators.html, which matches the dropdown's
// default — but a browser can restore a different selection on reload, so say it out loud.
updateCharacterModal(wordPlayOptions.value);
// Same again for the picture — the page ships with an empty #mode-art, so this first call is what
// puts the default mode's card on screen at all.
paintModeArt(wordPlayOptions.value);

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

/* The win cue for every mode. It used to be a stock trumpet sample; it is now `_victoryTune()`,
   written on the same _tone/_noise kit as every hero cue, so the game's biggest moment is in the
   game's own voice (and costs no asset load). The `.play()` shape is kept so the three call sites
   are untouched. */
const gameSfx = {
  end: { play: () => _victoryTune() },
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

/* §11.6's lock — the eighth ladder cue, and the only one that means "this is right". It has to be
   distinct from the capstone (which is an END, not an answer) and from the map's milestone bell, so
   it is a latch: a short click, then a note dropping a fourth onto its home and staying there. */
function _phraseLock() {
  _noise(0.04, 0.2, 1800, 3);
  _tone(1175, "sine", 0.14, 0.13); // D6
  _tone(784, "sine", 0.36, 0.16, null, 0.07); // settling onto G5
  _tone(392, "triangle", 0.42, 0.09, null, 0.07); // and its octave below, for weight
}

/* THE WIN — the one cue that is not a hero's and not a single event: it is the whole sentence
   finished, so it is the longest thing in the kit and the only one with real harmony under it.
   Four gestures, all in C major: a three-note pickup running up the tonic triad, an ARRIVAL on the
   octave with the chord and a bass note opening underneath it (plus a soft noise swell, the nearest
   this kit gets to a cymbal), a scalar lift back up the scale, and a final octave landing left
   ringing with two sparkles over the top. It resolves onto the tonic at both landings, which is
   what makes it read as *finished* rather than as one more thing happening. */
function _victoryTune() {
  // 1. Pickup — C5 E5 G5, fast, so the arrival has something to arrive from.
  [523, 659, 784].forEach((f, i) =>
    _tone(f, "triangle", 0.11, 0.14, null, i * 0.085),
  );

  // 2. Arrival on C6, with the chord and the bass opening under it.
  _tone(1047, "triangle", 0.45, 0.18, null, 0.28);
  _tone(262, "sine", 1.3, 0.1, null, 0.28); // C4
  _tone(330, "sine", 1.3, 0.08, null, 0.28); // E4
  _tone(392, "sine", 1.3, 0.09, null, 0.28); // G4
  _tone(131, "triangle", 1.3, 0.12, null, 0.28); // C3, the weight
  _noise(0.3, 0.09, 4000, 1, 0.28);

  // 3. The lift — G5 A5 B5 walking back up to the top note.
  [784, 880, 988].forEach((f, i) =>
    _tone(f, "triangle", 0.1, 0.13, null, 0.8 + i * 0.08),
  );

  // 4. The landing, left ringing: the octave, the chord again, and two sparkles above it.
  _tone(1047, "triangle", 0.9, 0.18, null, 1.06);
  _tone(523, "triangle", 0.9, 0.12, null, 1.06);
  _tone(659, "sine", 0.85, 0.08, null, 1.06);
  _tone(784, "sine", 0.85, 0.09, null, 1.06);
  _tone(131, "sine", 1.1, 0.12, null, 1.06);
  _noise(0.25, 0.07, 6000, 1, 1.06);
  _tone(2093, "sine", 0.2, 0.07, null, 1.1);
  _tone(3136, "sine", 0.22, 0.05, null, 1.22);
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
    /* Where a shot leaves this hero, as an offset from the TOP-LEFT OF ITS IMAGE FRAME, or null to
       keep the historical behaviour (see projectileSpawn below). Only a hero whose weapon is not at
       the top of its frame needs one — which is any hero drawn with air above its head, since the
       frame is bottom-anchored by restingY and the spare pixels all pile up at the top. */
    this.projectileAnchor = null;
    /* How fast this hero's shot climbs, in px per frame. Was hardcoded as `y: -10` at all four
       shoot sites; it lives here now so a hero can have a speed of its own. 10 is what every hero
       has always used, so only the two that set it are changed by this existing at all — and
       CommaTongue reads the same number to grow by, which is why comma and hashtag must keep the
       default. The Interrobang combo is the reason there is a difference to express: the arrow has
       to be able to catch the belt (see docs/punctuators.md, "The Interrobang"). */
    this.projectileSpeed = 10;

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

  /* The single source of truth for where a projectile is born.
     Default = exactly what the two shoot handlers did inline for years: x on the frame's midline
     (see the projectileStartPositionX note above GeneralIzation for why that expression and
     Projectile's own onload only agree there), y at the TOP OF THE IMAGE FRAME.
     That default is a lie for any hero whose art leaves empty space above its head: KeenArrow.png
     is 800x1045 but the figure only occupies (232,382)-(674,1045), so the frame top sits ~172px
     above her head and her arrow was spawning from mid-air. projectileAnchor overrides both axes
     with a straight offset instead, which is the only way to put a shot on the drawn weapon. */
  projectileSpawn() {
    if (this.projectileAnchor) {
      return {
        x: this.position.x + this.projectileAnchor.x,
        y: this.position.y + this.projectileAnchor.y,
      };
    }
    return {
      x: this.position.x + this.width - this.projectileStartPositionX,
      y: this.position.y,
    };
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

   Real hero art landed 2026-08-25 (§8): Ization.png and KeenArrow.png replace the borrowed
   Generic.png / qm.png placeholders. There is no attack frame yet, so secondHeroImage is the same
   file — the hero simply doesn't change pose while a shot is in flight, which is what every other
   hero uses that second slot for. Both projectiles are final.

   Two numbers here are derived from the art and have to move with it:

   - heroScale is 0.45 for both (dev's call, tuned on screen). The files are the same 800×1045 but
     the FIGURE inside the frame is not — General fills it (bbox 798×875), Keen doesn't (442×663) —
     so a shared scale deliberately draws Keen the smaller of the pair: ~359×394 against ~199×298.
     Both figures are bottom-anchored in their frame, which is what restingY's
     `canvas.height - height + 20` assumes.
   - projectileAnchor, not projectileStartPositionX, is what places their shots (2026-08-27). The
     default spawn is the top-left of the IMAGE FRAME, and both frames are bottom-anchored with all
     their spare pixels above the figure's head — 382 source px of it for Keen — so her arrow was
     launching from empty sky a fifth of the canvas above the crossbow. Each anchor is measured off
     the art's own alpha and has to be re-measured if the art changes; both are one line, in the
     constructors below. projectileStartPositionX (180) is now inert for these two, kept only
     because the constructor takes it positionally.
     The rule it used to carry still binds every OTHER hero: without an anchor the shoot handlers
     spawn at `position.x + width - projectileStartPositionX` while Projectile's onload rewrites to
     `position.x + projectileStartPositionX`, and those agree at, and only at, half the drawn width.
     Anchoring makes the two sites compute the same point by construction, which is what frees
     General's sword to fly from his raised blade off to the right rather than from his midline. */
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
      "./images/Ization.png",
      0.45, // 800 × 1045 → 360 × 470 drawn
      "General Ization (Broader)",
      "darkolivegreen",
      180, // half the drawn width — see the note above the class
      50,
      GENERAL_PROJECTILE,
      undefined,
      0.2,
      undefined,
      undefined,
      "./images/Ization.png", // no attack frame yet
    );
    this.targetId = LADDER_ID;
    this.ladderDirection = "up";
    /* The broadsword leaves the blade he is already holding (see the anchor note above this class).
       Ization.png's sword tip is at source (704, 170); x0.45 that is (317, 77) inside the drawn
       frame, and the sprite is 27px wide at its 0.2 scale, so half of that comes back off the x. */
    this.projectileAnchor = { x: 303, y: 76 };
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
      "./images/KeenArrow.png",
      0.45, // 800 × 1045 → 360 × 470 drawn; the figure inside it is narrower than General's
      "Keen Arrow (Narrower)",
      "crimson",
      180, // half the drawn width — see the note above General's class
      50,
      "./images/Arrow.png",
      undefined,
      0.25,
      undefined,
      undefined,
      "./images/KeenArrow.png", // no attack frame yet
    );
    this.targetId = LADDER_ID;
    this.ladderDirection = "down";
    /* The bolt leaves the crossbow, not the top of the frame — this is the whole reason
       projectileAnchor exists. KeenArrow.png's loaded bolt tips out at source (393, 470); x0.45
       that is (177, 212) inside the drawn frame, less half the arrow's 14px drawn width. Without
       it the shot started 211px higher, in the empty air the bottom-anchored frame leaves overhead. */
    this.projectileAnchor = { x: 170, y: 211 };
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

/* ════════════════════════════════════════════════════════════════════════════════════════════════
   THE INTERROBANG — a hidden two-hero combo (docs/punctuators.md, "The Interrobang")

   Throw Excla Machine's belt, hit Switch Character, and put Question Markswoman's arrow through the
   hoop before it clears the top of the screen: the two shots fuse into one interrobang, which lands
   on the next ! or ? it reaches and resolves BOTH marks at once.

   It needs almost no new machinery, because four things the engine already does happen to line up —
   none of them built for this:

     - switchToNextHero() carries the outgoing hero's CENTRE to the incoming one, so the arrow
       launches up the belt's column by itself. Projectiles fly straight up and cannot be aimed, so
       without that rule the combo would be impossible rather than merely hard; with it, the only
       skill is timing.
     - Collision is gated on span id, so Excla's belt flies straight past a ? and keeps climbing.
       Nothing has to be suppressed to let it travel over the target.
     - EM_Belt.png is literally a hoop (194x111) and Arrow.png an arrow, so the fused sprite is two
       images the game already ships, composited. No new art.
     - ! and ? spans exist only in the ordinary punctuation round, so every other mode is untouched
       by construction: no <option>, no data file, no wrap* function, no mode gate.
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

/* On a 750px-tall canvas with the sentence's first line at y~160. What matters is not either number
   but the CLOSING speed, `ARROW_SPEED - BELT_SPEED`: that is what decides how long the player has to
   press shoot after throwing the hoop, and it has to survive the ~17 frames the Switch animation
   costs before they can even press it.

   At 22px a frame the window is ~1.6s, which is generous enough that the combo lands even if you
   hesitate over the Switch. Rejected on the way here: 14 (belt 4 / arrow 18) gave ~0.92s and played
   tighter than it measured; 13 gave ~0.62s, tight enough that the egg would go unfound; and the very
   first guess of belt 6 / arrow 16 had the two meeting LEVEL with the sentence, with no room left
   for the fused shot to travel at all.

   Retune HERE — nothing else in the game knows these numbers. Widening the gap is nearly free on
   Markswoman's side (an arrow reading as fast is in character) and expensive on Excla's, since his
   belt has to stay slow enough to catch but quick enough that an ordinary round is not a wait. */
const BELT_SPEED = 4;
const ARROW_SPEED = 26;

/* The belt and the arrow, fused. A class of its own rather than flags on Projectile, because its
   draw() is bespoke — and it is the only shot in the game that answers to two different marks. */
class InterrobangShot {
  constructor({ belt, arrow }) {
    // Born where the hoop is, travelling at the arrow's speed: the arrow is what carries it home.
    this.position = { x: belt.position.x, y: belt.position.y };
    this.velocity = { x: 0, y: -ARROW_SPEED };
    /* She fired the shot that completed it, so the win bubble takes her colour and her attack pose
       holds while it flies. It has to be a REAL hero either way, not a stand-in object:
       aimSpeechTail() reads speechTailHero.position and .width off whatever wins the game. */
    this.owner = question;
    /* The one thing about this shot the collision gate cannot get from its owner — it answers to
       BOTH marks. The gate consults targetIds only when a projectile carries one, so no other shot
       in the game is affected by this field existing. */
    this.targetIds = new Set([exclamation.symbol, question.symbol]);
    /* Its landing plays _interrobang() itself, so the generic per-hit cue at the shared call site
       must not also fire — the same split the ladder heroes use, for the same reason (a hit that
       means something particular cannot be sounded by a call site that does not know that). */
    this.silentHit = true;

    this.beltImage = belt.projImage;
    this.arrowImage = arrow.projImage;
    this.beltWidth = belt.width;
    this.beltHeight = belt.height;
    this.arrowWidth = arrow.width;
    this.arrowHeight = arrow.height;

    /* Hit box: the hoop's width and the arrow's height, fed through the SAME collision expression
       as every other shot (its historical `position.y - height` quirk included, so the fused shot
       registers no earlier or later than the two that made it). The belt is what the player aimed,
       so the belt's width is what catches the mark. */
    this.width = this.beltWidth;
    this.height = this.arrowHeight;
  }

  /* Threaded, not stacked. The hoop is drawn as a ring seen from slightly above, so an arrow coming
     up through the hole passes IN FRONT of the far (top) rim and BEHIND the near (bottom) one —
     which is three source-cropped drawImage calls in that order, and reads as genuinely through. */
  draw() {
    if (!this.beltImage || !this.arrowImage) return;
    const half = this.beltHeight / 2;
    const srcW = this.beltImage.width;
    const srcH = this.beltImage.height;
    const srcHalf = srcH / 2;

    // Far rim — behind the shaft.
    c.drawImage(
      this.beltImage,
      0,
      0,
      srcW,
      srcHalf,
      this.position.x,
      this.position.y,
      this.beltWidth,
      half,
    );

    // The arrow, centred in the hole and poking out top and bottom.
    c.drawImage(
      this.arrowImage,
      this.position.x + this.beltWidth / 2 - this.arrowWidth / 2,
      this.position.y + half - this.arrowHeight / 2,
      this.arrowWidth,
      this.arrowHeight,
    );

    // Near rim — in front of the shaft, which is what sells the threading.
    c.drawImage(
      this.beltImage,
      0,
      srcHalf,
      srcW,
      srcH - srcHalf,
      this.position.x,
      this.position.y + half,
      this.beltWidth,
      this.beltHeight - half,
    );
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

/* Take a shot out of play IMMEDIATELY, unlike retireProjectile's deferred splice. That deferral
   exists to stop a landing shot visibly blinking out; nothing blinks here, because the fused shot
   takes both their places in the very same frame. Doing it now is also what keeps a belt that has
   just been consumed from still registering a hit further down this frame's collision walk, which
   the deferred path would allow. Still by identity, never by a held index. */
function consumeShot(projectile) {
  projectile.spent = true;
  const at = projectiles.indexOf(projectile);
  if (at !== -1) projectiles.splice(at, 1);
}

/* Does this arrow go THROUGH this hoop, rather than merely overlap it? */
function threadsTheHoop(belt, arrow) {
  const tip = arrow.position.y;
  const tail = arrow.position.y + arrow.height;
  const ringTop = belt.position.y;
  const ringBottom = belt.position.y + belt.height;
  // The tip has reached the ring, and the arrow has not already gone by.
  if (tip > ringBottom || tail < ringTop) return false;
  /* And the shaft's centre is inside the hoop's span — centre-in-hoop rather than a plain rect
     overlap, so grazing the rim does not count. Still forgiving: 97px of hoop against an 11px
     arrow. And the vertical window cannot be stepped over at any sane tuning — the shots overlap for
     (belt height + arrow height) = ~121px of RELATIVE travel, which even at the current 22px a frame
     of closing speed is five frames of chances to notice. */
  const shaft = arrow.position.x + arrow.width / 2;
  return shaft >= belt.position.x && shaft <= belt.position.x + belt.width;
}

/* Run once a frame, BEFORE the collision walk, so a shot is never both fused and flown. */
function checkInterrobangFusion() {
  const belts = [];
  const arrows = [];
  for (const p of projectiles) {
    // No projImage means the sprite has not loaded, so width/height are still the placeholder
    // guesses — and an InterrobangShot has none at all, which is what keeps this from re-fusing.
    if (p.spent || !p.projImage) continue;
    if (p.owner === exclamation) belts.push(p);
    else if (p.owner === question) arrows.push(p);
  }
  if (!belts.length || !arrows.length) return;

  for (const belt of belts) {
    for (const arrow of arrows) {
      if (belt.spent || arrow.spent) continue;
      if (!threadsTheHoop(belt, arrow)) continue;
      consumeShot(belt);
      consumeShot(arrow);
      projectiles.push(new InterrobangShot({ belt, arrow }));
      _interrobangFuse();
      return; // one thread per frame is plenty
    }
  }
}

/* The mark of the other kind nearest the one just struck, ignoring any already resolved. Horizontal
   distance, because the shot arrived up a column and "the one it was nearest to" is the reading a
   player will make. Null when every partner is already hit — the fusion still lands, it just has
   nothing left to absorb. */
function nearestUnhitPartner(span) {
  const wanted =
    span.id === exclamation.symbol ? question.symbol : exclamation.symbol;
  const from = span.getBoundingClientRect().left;
  let best = null;
  let bestGap = Infinity;
  for (const node of nodeArr) {
    if (!node.isConnected || node.id !== wanted) continue;
    if (allPunctuationHit.has(node)) continue;
    const gap = Math.abs(node.getBoundingClientRect().left - from);
    if (gap < bestGap) {
      bestGap = gap;
      best = node;
    }
  }
  return best;
}

/* The payoff. The struck mark becomes the two heroes' marks superimposed, and its opposite number
   is absorbed into it — revealed in its own hero's colour and counted as hit, so the combo really
   does resolve two marks with one shot. The shared win check that follows the branch chain sees
   both, so a sentence finished this way wins normally. */
function interrobangLanding(span, projectile) {
  projectile.interrobangDone = true;
  span.dataset.interrobang = "1";

  /* Stacked spans, not U+203D. The sentence is set in Palanquin, which has no interrobang glyph, so
     the real character would silently fall back to a system font and sit in the line in the wrong
     typeface. Superimposing the two heroes' own marks renders everywhere, matches the line — and
     puts the joke on screen, which one borrowed glyph would not. */
  span.innerHTML =
    `<span class="ib-stack ib-land">` +
    `<span class="ib-q" style="color:${question.characterColor}">?</span>` +
    `<span class="ib-e" style="color:${exclamation.characterColor}">!</span>` +
    `</span>`;

  const partner = nearestUnhitPartner(span);
  if (partner) {
    const owner = partner.id === exclamation.symbol ? exclamation : question;
    partner.classList.remove("hidden-punc");
    partner.style.color = owner.characterColor;
    partner.style.textShadow =
      "1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000";
    partner.classList.add("ib-absorbed");
    allPunctuationHit.add(partner);
  }

  _interrobang();
}

/* The arrow going through the hoop — a ring struck in passing. Deliberately short and bright, and
   deliberately NOT the landing cue: it is the only signal that the trick came off, a beat before
   the shot lands, and the player needs to hear that the two shots became one. */
function _interrobangFuse() {
  _noise(0.06, 0.3, 2600, 6);
  _tone(1760, "sine", 0.35, 0.26, null, 0.01);
  _tone(2637, "sine", 0.28, 0.14, null, 0.03);
}

/* The landing: the two heroes' own hit cues fused. Her thwack (_questionHit) lands first and his
   bell (_exclaHit) rings out under it, so it reads as the ring being struck rather than as two
   sounds at once, with a fifth on top for the one glyph the two marks became. Same _tone/_noise kit
   as every other hero cue in this file — no new assets. */
function _interrobang() {
  _noise(0.09, 0.48, 750, 5);
  _tone(170, "triangle", 0.14, 0.32, 58);
  _tone(1047, "sine", 0.7, 0.34, null, 0.05);
  _tone(1319, "sine", 0.5, 0.2, null, 0.07);
  _tone(1568, "sine", 0.55, 0.14, null, 0.1);
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
    /* A lobbed hoop, not a bullet. Slow enough that Question Markswoman's arrow can catch it and
       thread it before it reaches the sentence — the whole Interrobang combo hangs off the GAP
       between this number and hers, not on either one alone (see the note on ARROW_SPEED for the
       windows each gap buys). It costs Excla's ordinary shot ~0.57s → ~1.4s to reach the sentence,
       which is the point of a thrown belt, and is the one change ordinary play feels. */
    this.projectileSpeed = BELT_SPEED;
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
    // A snap, against Excla's lob — the other half of the Interrobang combo's closing speed.
    this.projectileSpeed = ARROW_SPEED;
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
    /* Who fired it. A shot outlives the hero's turn on stage now (it finishes its flight after a
       Switch Character), so "is a shot of MINE in the air?" — the question the attack pose and
       Semicolonel's vanishing act both ask — can only be answered by the projectile itself. */
    const owner = player;
    this.owner = owner;
    this.width = 3;
    this.height = owner.projectileLength;
    this.projectileImage = owner.projectileImage;

    const projImage = new Image();

    projImage.src = this.projectileImage;

    projImage.onload = () => {
      //   const scale = 0.2;
      const scale = owner.projectileScale;
      this.projImage = projImage;
      this.width = projImage.width * scale;
      this.height = projImage.height * scale;
      /* Re-placed on load because the true drawn size is only known now. An anchored hero gets the
         same answer here as the shoot handler did, so nothing moves; an un-anchored one keeps the
         historical `+ projectileStartPositionX`, which is why that number has to be half the drawn
         width for the two not to disagree.

         `owner`, never the global `player`: this callback is async, so on the first shot with an
         uncached image it can land after a Switch Character — and reading `player` then re-placed
         the shot at the INCOMING hero's muzzle, mid-flight. */
      this.position = owner.projectileAnchor
        ? owner.projectileSpawn()
        : {
            x: owner.position.x + owner.projectileStartPositionX,
            y: owner.position.y,
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
    this.owner = player;
    this.width = 5;
    this.height = this.owner.projectileLength;
    this.startYPosition = -40;
  }

  draw() {
    // The hero's own colour, not a hardcoded pink — OctoThwarter fires this same class and his
    // spray paint is turquoise.
    c.fillStyle = this.owner.characterColor;
    c.fillRect(
      this.position.x,
      this.position.y + this.startYPosition,
      this.width,
      this.height,
    );
  }

  /* The tip of the tongue as it is DRAWN. Kept here so the collision test and fillRect can never
     drift apart: the test used to read `position.y - owner.projectileLength` (100) against a tip
     drawn at `position.y - 40`, so a lick registered a hit 60px before it looked like one. */
  tipY() {
    return this.position.y + this.startYPosition;
  }

  update() {
    /* A tongue grows out of her mouth rather than travelling, so its base belongs wherever she is
       NOW — not wherever she stood when she fired. Nothing used to re-read the hero, so `position.x`
       was written once at construction and the whole column stayed put while she walked away from
       her own tongue. Re-anchoring every frame makes walking mid-lick a sideways sweep, which is
       both the fix and the only aim-after-firing move any hero has. */
    this.position.x = this.owner.projectileSpawn().x;
    this.draw();
    this.height -= this.velocity.y;
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
  // Adjacent, and in THIS order on purpose: Switch Character steps Excla -> Markswoman, which is
  // the order the Interrobang combo is performed in (throw the hoop, then thread it). Ordering also
  // decides the starting hero, so a sentence with a ! and no earlier mark now opens on Excla.
  exclamation,
  question,
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

/* Whether a shot was in flight on the previous frame — the only thing that decides which of a
   hero's two poses gets drawn. Read at the top of animate(), written at the bottom. */
let heroWasFiring = false;

/* Has this shot left the top of the screen? A CommaTongue grows out of the hero instead of
   travelling, so it is done when its tip clears the edge; everything else when its whole body has. */
function projectileIsGone(projectile) {
  return projectile instanceof CommaTongue
    ? projectile.position.y <= 0
    : projectile.position.y + projectile.height <= 0;
}

/* Take a shot out of play. Removal is BY IDENTITY and deferred by a frame — never
   `projectiles.splice(index, 1)` on the index the collision walk happened to be holding, which goes
   stale the moment anything else retires in the same frame and then removes an unrelated shot. The
   `spent` flag is what the flight pass below reads, so a shot that has already landed is not also
   flown on; the setTimeout is the original trick that stops the projectile visibly blinking out at
   the instant it lands. */
function retireProjectile(projectile) {
  if (projectile.spent) return;
  projectile.spent = true;
  setTimeout(() => {
    const at = projectiles.indexOf(projectile);
    if (at !== -1) projectiles.splice(at, 1);
  }, 0);
}

/* THE SPEECH-BUBBLE TAIL
   The win message is the winning hero speaking, so the tail has to point at that hero — and since
   ENDING_REACHED only gates the message, the player can keep walking after the win, so the tail is
   aimed every frame rather than once.

   Three things it has to get right, and all three used to be wrong:
   - It must carry a UNIT. `setProperty("--speech-bubble-triangle", projectile.position.x)` stores a
     bare number, so `left: var(--speech-bubble-triangle)` substituted to `left: 412` — invalid at
     computed-value time, which silently resolves left to `auto`. The tail then took its static
     position (the end of the last line of message text) and appeared to wander with the wording and
     the window width. The :root fallback never helped: the variable IS set, just to garbage.
   - It must be in the BUBBLE's coordinate space. `left` on the ::after is measured from
     .speech-bubble's padding box, not the canvas, and #ending-message-container's 10% margin puts
     that box a tenth of the viewport in.
   - It must be CLAMPED to the bubble. The bubble is shrink-to-fit and centred, so a hero standing
     near either screen edge is outside it entirely and an honest left would float the tail off the
     box it is supposed to be attached to. Clamping keeps it glued and still pointing the right way.

   It follows the hero who FIRED the winning shot, not whoever is on stage now, because the bubble
   is painted in that hero's colour. A Switch Character afterwards only moves the outgoing hero in
   y, so their x stays put and the tail stays sensible. */
const SPEECH_TAIL_WIDTH = 21; // the ::after's 1px left border + its 20px right border
const SPEECH_TAIL_APEX = 1; // the point of the triangle sits just inside its left edge
let speechTailHero = null;

function aimSpeechTail() {
  if (!speechTailHero) return;
  const bubble = endingMessage1.getBoundingClientRect();
  if (!bubble.width) return;
  // The canvas has its own border and is laid out in flow, so hero x is only a page x after
  // shifting by the canvas box and scaling by whatever the browser actually drew it at.
  const box = canvas.getBoundingClientRect();
  const scale = canvas.width ? canvas.clientWidth / canvas.width : 1;
  const mouthX =
    box.left +
    canvas.clientLeft +
    (speechTailHero.position.x + speechTailHero.width / 2) * scale;
  const x = mouthX - bubble.left - SPEECH_TAIL_APEX;
  const limit = Math.max(bubble.width - SPEECH_TAIL_WIDTH, 0);
  root.style.setProperty(
    "--speech-bubble-triangle",
    `${Math.min(Math.max(x, 0), limit)}px`,
  );
}

function animate() {
  //this creates an animation loop

  //Need this or else there will be multiple Full Stops
  c.fillStyle = "white";
  c.fillRect(0, 0, canvas.width, canvas.height);

  requestAnimationFrame(animate);
  // Re-aimed every frame: the hero is free to walk once the bubble is up (see aimSpeechTail).
  if (ENDING_REACHED) aimSpeechTail();
  // Insurance, not logic: the loop must survive a frame with no hero. Losing it takes the canvas
  // with it, and every mode goes blank for the rest of the session with one console line to show
  // for it — which is precisely how the 2026-08-21 waitForElement regression presented.
  if (!player) return;
  /* One hero draw per frame, chosen here rather than inside the projectile loop. The old code asked
     per-projectile and repainted the canvas white each time, which erased every projectile already
     drawn in that frame — so firing again rubbed out the shot still in the air, and only the newest
     one was ever visible. Full Stop never showed it only because it passes no secondHeroImage and
     so skipped the repaint entirely.

     Three cases, not two. `secondHeroImage` is overloaded: usually it is a second pose, but for the
     heroes who ARE their own projectile — Semicolonel and Apostrophantom — it is the string
     "white", which never loads as an image (so `image2` stays undefined and `update2()` is a
     no-op). Their whole effect was the wipe with nothing redrawn over it: the hero leaves the
     bottom of the screen because he is the thing flying at the word. So while one of their shots is
     up, the right answer is to draw NO hero at all — which the wipe at the top of the frame already
     did for us.

     `heroWasFiring` is last frame's answer (the projectile pass below sets it), which keeps the
     pose tied to a shot that is actually being flown rather than to `projectiles.length` — a
     projectile whose target span has gone (an id cleared by a solved ladder word, say) is never
     flown and never spliced, and would otherwise strand the hero off-screen forever. One frame of
     lag, invisible at 60fps. */
  if (!heroWasFiring) {
    player.update();
  } else if (player.secondHeroImage === "white") {
    // He launched himself — nothing to draw at the bottom until the shot lands or leaves.
  } else if (player.image2) {
    player.update2();
  } else {
    player.update();
  }
  let firingThisFrame = false;
  for (const projectile of projectiles) projectile.flownThisFrame = false;

  /* Before the collision walk, never during it: an arrow that threads the hoop this frame replaces
     both shots with one, and doing that mid-walk would leave the walk holding shots that are no
     longer in the array. Costs a scan of a handful of projectiles and does nothing at all unless a
     belt and an arrow are in the air together. */
  checkInterrobangFusion();

  projectiles.forEach((projectile) => {
    /* Every test and every effect below belongs to the hero that FIRED this shot, not to whoever
       is selected right now. A shot outlives its hero's turn on stage (it finishes its flight
       across a Switch Character), so reading the global `player` here meant a Semicolonel shot
       still in the air when you switched was hit-tested against Sergeant Colon's spans and
       revealed a colon in Sarge's colour with Sarge's sound. `owner` is set at construction; the
       fallback is for anything that somehow predates it. */
    const shooter = projectile.owner ?? player;
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
        // frame, and without the latch the shot would register a second ladder action against one
        // of them. (The retirement half of that old footgun is gone: retireProjectile is idempotent
        // and removes by identity, so a double retire can no longer take an unrelated shot with it.)
        // Undefined in every other mode.
        if (projectile.ladderDone) return;
        /* The same latch, for the same reason, one combo along: a fused interrobang answers to BOTH
           marks, so with an unhit ! and an unhit ? still on screen the walk would otherwise reach
           the second one in this very frame and land the shot twice. */
        if (projectile.interrobangDone) return;
        //tried to do this for left and right parenthesis, might need to come back to it
        // if (punctuationSymbol.className.includes(player.symbol)) {
        /* targetId, not symbol — the ladder heroes share one span id (§4). Identical for everyone
           else, except the one shot that answers to two marks rather than one: a fused interrobang
           carries its own `targetIds` set, and nothing else in the game has that field. */
        const wantedIds = projectile.targetIds;
        if (
          wantedIds
            ? wantedIds.has(punctuationSymbol.id)
            : punctuationSymbol.id === (shooter.targetId ?? shooter.symbol)
        ) {
          /* Comma Chameleon and HashTagger, whose shot is a CommaTongue that grows out of the
             hero instead of travelling — so the only difference from the branch below is that the
             tip is asked for (tipY) rather than derived from the shot's own height.
             TODO refactor once the tongue retracts. */
          if (
            shooter.symbol === comma.symbol ||
            shooter.symbol === hashtag.symbol
          ) {
            if (
              projectile.tipY() <= punctuationSymbol.getBoundingClientRect().y &&
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
                root.style.setProperty("--color", shooter.characterColor);
                speechTailHero = shooter;
                aimSpeechTail();
                ENDING_REACHED = true;
                gameSfx.end.play();
              }

              setTimeout(() => {
                //need to change the velocity of the y to +1. this could make the tongue retract. Maybe later
                // console.log("proj", projectiles);
                shooter.hitProjectileSound();
                // projectile.velocity.y = 1;
                retireProjectile(projectile);
                punctuationSymbol.classList.remove("hidden-punc");
                punctuationSymbol.style.color = `${shooter.characterColor}`;
                punctuationSymbol.style.textShadow =
                  "1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000";
              }, 0);
            } else if (projectile.position.y <= 0) {
              retireProjectile(projectile);
            } else {
              // Just move it — the attack pose is decided once, at the top of the frame.
              if (shooter === player && shooter.secondHeroImage) {
                firingThisFrame = true;
              }
              /* ONCE per frame. This walk is nodeArr x projectiles, so a shot is offered every
                 span that matches it — and a sentence with two commas in it therefore moved Comma
                 Chameleon's tongue twice a frame, at double speed. Long-standing and easy to miss
                 (it reads as "shots are faster in busy sentences"), but a fused interrobang answers
                 to two whole marks at once, so the measured speeds above depend on the guard. */
              if (!projectile.flownThisFrame) {
                projectile.flownThisFrame = true;
                projectile.update();
              }
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
              /* First in the chain, because it is the only branch that can arrive at either of two
                 different marks and has to win over whatever that mark would normally do. Guarded
                 on the span as well as the shot, so a mark can only be turned into an interrobang
                 once however many fused shots reach it. */
              if (projectile.targetIds && !punctuationSymbol.dataset.interrobang) {
                interrobangLanding(punctuationSymbol, projectile);
              } else if (punctuationSymbol.id == capitalize.symbol) {
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
                  pickRung(punctuationSymbol, shooter, projectile);
                } else {
                  climbLadder(punctuationSymbol, shooter, projectile);
                }
              } else if (punctuationSymbol.id === RACE_UP_ID) {
                // Word Race splits the two heroes across two ids instead of sharing one (§12.2), so
                // the gate above has already decided which hero this is — General can only ever
                // reach the rung above, Keen only the word you summoned.
                raceShootUp(punctuationSymbol, shooter, projectile);
              } else if (punctuationSymbol.id === RACE_DOWN_ID) {
                raceShootDown(punctuationSymbol, shooter, projectile);
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
                punctuationSymbol.style.color = `${shooter.characterColor}`;
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
                root.style.setProperty("--color", shooter.characterColor);
                speechTailHero = shooter;
                aimSpeechTail();
                ENDING_REACHED = true;
                gameSfx.end.play();
              }
              setTimeout(() => {
                retireProjectile(projectile);
                /* A shot whose landing means something particular sounds it from its own handler
                   and silences the generic cue — the ladder heroes do this by overriding
                   hitProjectileSound(), which a fused interrobang cannot, since its owner is
                   Markswoman and her ordinary hits must still thwack. */
                if (!projectile.silentHit) shooter.hitProjectileSound();

                if (shooter.symbol === asterisk.symbol) {
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

              if (shooter.symbol === anacontraction.symbol) {
                shortenContraction(punctuationSymbol);
              }
              if (shooter.symbol === article.symbol) {
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
              retireProjectile(projectile);
            } else {
              // Just move it — the attack pose is decided once, at the top of the frame.
              if (shooter === player && shooter.secondHeroImage) {
                firingThisFrame = true;
              }
              /* ONCE per frame. This walk is nodeArr x projectiles, so a shot is offered every
                 span that matches it — and a sentence with two commas in it therefore moved Comma
                 Chameleon's tongue twice a frame, at double speed. Long-standing and easy to miss
                 (it reads as "shots are faster in busy sentences"), but a fused interrobang answers
                 to two whole marks at once, so the measured speeds above depend on the guard. */
              if (!projectile.flownThisFrame) {
                projectile.flownThisFrame = true;
                projectile.update();
              }
            }
          }
        }
      });
    }
  });

  /* Flight belongs to the shot, not to whoever is currently selected. Everything above runs for a
     projectile only while a span matching the SELECTED hero is on screen, so switching characters
     left the outgoing hero's shots frozen in the array — neither moved nor collected — and the next
     switch resumed the whole backlog on one frame, which is what read as a crowd of Semicolonels
     suddenly flying off. Anything the collision walk did not handle this frame finishes its flight
     here and retires off the top of the screen. Deliberately does NOT set firingThisFrame: a stray
     shot from a hero who has left the stage must not hold the current one in its attack pose. */
  for (const projectile of projectiles) {
    if (projectile.spent || projectile.flownThisFrame) continue;
    if (projectileIsGone(projectile)) {
      retireProjectile(projectile);
      continue;
    }
    projectile.update();
  }

  heroWasFiring = firingThisFrame;
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
        position: player.projectileSpawn(),
        velocity: {
          x: 0,
          y: -player.projectileSpeed,
        },
      }),
    );
  } else if (player.characterColor !== undefined) {
    projectiles.push(
      new Projectile({
        position: player.projectileSpawn(),
        velocity: {
          x: 0,
          y: -player.projectileSpeed,
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

  // A tongue grows out of Comma Chameleon rather than travelling, so it has to go when he does —
  // but only the tongues. This used to test projectiles[0] and then empty the whole array, which
  // took every other hero's in-flight shot with it the moment a tongue happened to be first.
  for (let i = projectiles.length - 1; i >= 0; i--) {
    if (projectiles[i] instanceof CommaTongue) projectiles.splice(i, 1);
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
    (el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA" ||
      el.isContentEditable)
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
            position: player.projectileSpawn(),
            velocity: {
              x: 0,
              y: -player.projectileSpeed,
            },
          }),
        );
      } else if (player.characterColor !== undefined) {
        projectiles.push(
          new Projectile({
            position: player.projectileSpawn(),
            velocity: {
              x: 0,
              y: -player.projectileSpeed,
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
