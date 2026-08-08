/* =====================================================================
   main.js — wiring + game loop
   ---------------------------------------------------------------------
   Milestone 2: raycaster + grid-step movement, plus the VoiceInput mic
   detector wired in behind a calibration entry screen. Still no beat
   clock and no Augminotaur — those are the next steps.

   Two on-screen readouts (FPS + the last mouth-verb) are debug aids,
   toggled with F, not part of the game — the final has no HUD.
   ===================================================================== */

import { MAP, SPAWN } from "./map.js";
import { Player } from "./player.js";
import { render } from "./raycaster.js";
import { createInput } from "./input.js";
import { runEntry } from "./calibrate.js";

const W = 320, H = 200;
const canvas = document.getElementById("view");
canvas.width = W;
canvas.height = H;
const g = canvas.getContext("2d", { alpha: false });
g.imageSmoothingEnabled = false;

const player = new Player(SPAWN);
const intent = createInput({
  left: document.getElementById("btn-left"),
  forward: document.getElementById("btn-fwd"),
  right: document.getElementById("btn-right"),
});

// ---- debug readouts (F toggles both) ----
const fpsEl = document.getElementById("fps");
const verbEl = document.getElementById("verb");
let fps = 60, showDbg = true;
addEventListener("keydown", e => {
  if (e.code === "KeyF") {
    showDbg = !showDbg;
    const d = showDbg ? "block" : "none";
    fpsEl.style.display = d;
    verbEl.style.display = d;
  }
});

// The mic detector, populated once calibration finishes. Until then the
// raycaster still runs behind the entry overlay so movement feels alive.
let vi = null;
let lastVerbAt = -1e9;

// ---- loop ----
let last = performance.now();
function frame(now) {
  let dt = now - last;
  last = now;
  if (dt > 50) dt = 50; // clamp after a stall so tweens don't jump

  // Pump the mic each frame once it's live. Detected verbs are logged to
  // the debug readout for now — nothing scores against them yet.
  if (vi) vi.update();

  // When idle, begin one action. Forward/back beat turning if both held.
  if (player.idle) {
    if (intent.forward)      player.step(+1, MAP);
    else if (intent.back)    player.step(-1, MAP);
    else if (intent.left)    player.turn(-1);
    else if (intent.right)   player.turn(+1);
  }
  player.update(dt);
  render(g, W, H, player, MAP);

  if (showDbg) {
    fps += ((1000 / Math.max(dt, 1)) - fps) * 0.1;
    fpsEl.textContent = fps.toFixed(0) + " fps";
    if (now - lastVerbAt > 700) verbEl.textContent = "";
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---- entry / calibration, then go live ----
runEntry({
  overlay: document.getElementById("entry"),
  title:   document.getElementById("entry-title"),
  prompt:  document.getElementById("entry-prompt"),
  sub:     document.getElementById("entry-sub"),
}).then(({ vi: v, offsetMs }) => {
  vi = v;
  // Latency offset isn't used until the beat clock exists (next step); we
  // stash it on the detector so the clock can subtract it from every hit.
  vi.latencyOffsetMs = offsetMs;
  // Route detected verbs to the debug readout. HOLD/HISS upgrades replace
  // the plosive shown a moment earlier; _END events don't count.
  vi.onEvent = ev => {
    if (ev.silent) return;
    lastVerbAt = performance.now();
    verbEl.textContent = ev.verb;
  };
});
