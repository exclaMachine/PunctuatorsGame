/* =====================================================================
   main.js — wiring + game loop
   ---------------------------------------------------------------------
   Milestone 3: raycaster + grid-step movement, the VoiceInput mic detector
   behind a calibration entry screen, and now the AudioContext-driven beat
   clock feeding the wall-shading pulse. Still no Augminotaur — call &
   response (Movement 1) is the next step, and it schedules against this
   same clock.

   Two on-screen readouts (FPS + the last mouth-verb) are debug aids,
   toggled with F, not part of the game — the final has no HUD.
   ===================================================================== */

import { MAP, SPAWN } from "./map.js";
import { Player } from "./player.js";
import { render } from "./raycaster.js";
import { createInput } from "./input.js";
import { runEntry } from "./calibrate.js";
import { BeatClock, pulseLight } from "./clock.js";

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

// The beat clock, created once the AudioContext is live (post-calibration).
// Until then there is no beat and the walls hold at full light.
let clock = null;

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
  const light = clock ? pulseLight(clock) : 1;
  render(g, W, H, player, MAP, light);

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
  // Stash the measured latency on the detector. The clock itself doesn't
  // need it (the pulse is a pure visual), but Movement 1's scoring will
  // subtract it from every hit's timestamp before comparing to a beat.
  vi.latencyOffsetMs = offsetMs;

  // Start the shared beat clock off the live AudioContext. From here the
  // walls pulse on every downbeat; later systems schedule against it too.
  clock = new BeatClock(vi.ctx);
  // Route detected verbs to the debug readout. HOLD/HISS upgrades replace
  // the plosive shown a moment earlier; _END events don't count.
  vi.onEvent = ev => {
    if (ev.silent) return;
    lastVerbAt = performance.now();
    verbEl.textContent = ev.verb;
  };
});
