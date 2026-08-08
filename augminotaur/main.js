/* =====================================================================
   main.js — wiring + game loop
   ---------------------------------------------------------------------
   Milestone 1: raycaster + grid-step movement, nothing else. No audio,
   no Augminotaur yet. A tiny FPS readout (toggle with F) is a debug aid,
   not part of the game — the final has no HUD.
   ===================================================================== */

import { MAP, SPAWN } from "./map.js";
import { Player } from "./player.js";
import { render } from "./raycaster.js";
import { createInput } from "./input.js";

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

// ---- debug FPS (F toggles) ----
const fpsEl = document.getElementById("fps");
let fps = 60, showFps = true;
addEventListener("keydown", e => {
  if (e.code === "KeyF") { showFps = !showFps; fpsEl.style.display = showFps ? "block" : "none"; }
});

// ---- loop ----
let last = performance.now();
function frame(now) {
  let dt = now - last;
  last = now;
  if (dt > 50) dt = 50; // clamp after a stall so tweens don't jump

  // When idle, begin one action. Forward/back beat turning if both held.
  if (player.idle) {
    if (intent.forward)      player.step(+1, MAP);
    else if (intent.back)    player.step(-1, MAP);
    else if (intent.left)    player.turn(-1);
    else if (intent.right)   player.turn(+1);
  }
  player.update(dt);
  render(g, W, H, player, MAP);

  if (showFps) {
    fps += ((1000 / Math.max(dt, 1)) - fps) * 0.1;
    fpsEl.textContent = fps.toFixed(0) + " fps";
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
