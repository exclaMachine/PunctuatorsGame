/* =====================================================================
   main.js — wiring + game loop
   ---------------------------------------------------------------------
   Milestone 4: raycaster + grid-step movement, the VoiceInput mic detector
   behind a calibration entry screen, the AudioContext beat clock feeding the
   wall pulse, and now Movement 1 — the call-and-response fight: the
   Augminotaur billboard drums patterns and the player answers by voice,
   scored against the clock. Later movements schedule against it too.

   Two on-screen readouts (FPS + the last mouth-verb / answer grade) are
   debug aids, toggled with F, not part of the game — the final has no HUD.
   ===================================================================== */

import { MAP, SPAWN } from "./map.js";
import { Player } from "./player.js";
import { render } from "./raycaster.js";
import { createInput } from "./input.js";
import { runEntry } from "./calibrate.js";
import { BeatClock, pulseLight } from "./clock.js";
import { Movement1 } from "./movement1.js";
import { drawAugminotaur } from "./sprite.js";

const W = 320, H = 200;
const canvas = document.getElementById("view");
canvas.width = W;
canvas.height = H;
const g = canvas.getContext("2d", { alpha: false });
g.imageSmoothingEnabled = false;
const zbuf = new Float32Array(W); // per-column wall depth, for sprite occlusion

const player = new Player(SPAWN);
const intent = createInput({
  left: document.getElementById("btn-left"),
  forward: document.getElementById("btn-fwd"),
  right: document.getElementById("btn-right"),
});

// ---- debug readouts (F toggles both) ----
const fpsEl = document.getElementById("fps");
const verbEl = document.getElementById("verb");
const dbgEl = document.getElementById("dbg");
let fps = 60, showDbg = true;
addEventListener("keydown", e => {
  if (e.code === "KeyF") {
    showDbg = !showDbg;
    const d = showDbg ? "block" : "none";
    fpsEl.style.display = d;
    verbEl.style.display = d;
    dbgEl.style.display = d;
  }
});

// The mic detector, populated once calibration finishes. Until then the
// raycaster still runs behind the entry overlay so movement feels alive.
let vi = null;
let lastVerbAt = -1e9;

// The beat clock, created once the AudioContext is live (post-calibration).
// Until then there is no beat and the walls hold at full light.
let clock = null;

// Movement 1 (the call-and-response fight), created after calibration. While
// it's active the player stands and drums — grid movement is locked.
let movement = null;

// ---- loop ----
let last = performance.now();
function frame(now) {
  let dt = now - last;
  last = now;
  if (dt > 50) dt = 50; // clamp after a stall so tweens don't jump

  // Pump the mic each frame once it's live. Detected verbs flow to the
  // debug readout and, during an answer window, are scored by Movement 1.
  if (vi) vi.update();

  // When idle, begin one action. Forward/back beat turning if both held.
  // Grid movement is locked while the fight owns the player (Movement 1 is
  // a stationary face-off — you answer with your voice, not your feet).
  const locked = movement && movement.active;
  if (player.idle && !locked) {
    if (intent.forward)      player.step(+1, MAP);
    else if (intent.back)    player.step(-1, MAP);
    else if (intent.left)    player.turn(-1);
    else if (intent.right)   player.turn(+1);
  }
  player.update(dt);
  if (movement) movement.update(dt);

  const light = clock ? pulseLight(clock) : 1;
  render(g, W, H, player, MAP, light, zbuf);
  if (movement) drawAugminotaur(g, W, H, player, movement.aug, zbuf);
  if (movement && movement.result) drawOutcome(movement.result);

  if (showDbg) {
    fps += ((1000 / Math.max(dt, 1)) - fps) * 0.1;
    fpsEl.textContent = fps.toFixed(0) + " fps";
    if (now - lastVerbAt > 700) verbEl.textContent = "";
    if (movement) dbgEl.textContent = movement.dbgText();
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Win/lose is the only text the level shows — audio is the UI otherwise.
function drawOutcome(result) {
  g.fillStyle = "rgba(0,0,0,0.55)";
  g.fillRect(0, (H >> 1) - 12, W, 24);
  g.fillStyle = result === "win" ? "#dbe0c8" : "#c85a4a";
  g.font = "bold 11px ui-monospace, monospace";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(result === "win" ? "IT RESOLVES" : "THE MAZE KEEPS YOU", W >> 1, H >> 1);
  g.textAlign = "left";
  g.textBaseline = "alphabetic";
}

// ---- entry / calibration, then go live ----
runEntry({
  overlay: document.getElementById("entry"),
  title:   document.getElementById("entry-title"),
  prompt:  document.getElementById("entry-prompt"),
  sub:     document.getElementById("entry-sub"),
}).then(({ vi: v, offsetMs }) => {
  vi = v;
  // Stash the measured latency on the detector. The clock itself doesn't
  // need it (the pulse is a pure visual), but Movement 1's scoring will
  // subtract it from every hit's timestamp before comparing to a beat.
  vi.latencyOffsetMs = offsetMs;

  // Start the shared beat clock off the live AudioContext. From here the
  // walls pulse on every downbeat; later systems schedule against it too.
  clock = new BeatClock(vi.ctx);

  // Begin Movement 1: he stands down the corridor the player already faces
  // (SPAWN looks east along the top ring). Player x/y anchor where he stands.
  movement = new Movement1(vi.ctx, clock, {
    latencyMs: offsetMs,
    anchorX: player.x,
    corridorY: player.y,
    onDebug: txt => { lastVerbAt = performance.now(); verbEl.textContent = txt; },
  });

  // Route detected verbs to the debug readout and to the fight. HOLD/HISS
  // upgrades replace the plosive shown a moment earlier; _END events don't
  // count. movement1 ignores anything outside its answer window.
  vi.onEvent = ev => {
    movement.onVerb(ev);
    if (ev.silent) return;
    lastVerbAt = performance.now();
    // ·T = an enrolled template decided this; ·F = no clear winner, the
    // tilt/mid-share thresholds did. Blank = nothing enrolled.
    verbEl.textContent = ev.verb +
      (ev.path === "template" ? "·T" : ev.path === "fallback" ? "·F" : "");
  };
});
