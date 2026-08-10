/* =====================================================================
   sprite.js — the Augminotaur billboard
   ---------------------------------------------------------------------
   One depth-tested sprite standing down the corridor. Projected with the
   raycaster's exact FOV (PLANE_LEN) so it sits in the world, and blitted
   column-by-column against the wall z-buffer so it hides behind corners.

   Distance is the whole point (he grows as he closes in — "damage is
   distance"). Optional live ember eyes are drawn on top, brightening while
   he listens for your answer.

   ─── SWAP IN YOUR OWN ART ────────────────────────────────────────────
   The built-in bull is just the DEFAULT. To use your own picture, drop a
   PNG in the repo (transparent background, facing the camera) and either:
     • set CREATURE_SPRITE_SRC below to its path, or
     • call setAugminotaurSprite({ src: "sprites/augminotaur.png" }) once
       at startup (returns a Promise that resolves when the image loads).
   Any aspect ratio works — width follows the image, height is HEIGHT cells.
   If your art already has eyes, pass eyes:false (or set CREATURE_EYES=null)
   to turn off the drawn embers. Nothing else in the game needs to change.
   ===================================================================== */

import { PLANE_LEN } from "./raycaster.js";

// ---- swap point: point this at your own image, or leave null for the bull.
const CREATURE_SPRITE_SRC = null;               // e.g. "sprites/augminotaur.png"
let CREATURE_EYES = { y: 0.30, dx: 0.16 };      // eye anchors (fractions); null = none

// World height in cell-units: >1 so he looms taller than a wall is high.
const HEIGHT = 1.75;
// Default silhouette resolution (only used when no image is supplied).
const SRC_W = 64, SRC_H = 96;

// The active art: { canvas, w, h, eyes }. `canvas` is any CanvasImageSource
// (an offscreen canvas or a loaded <img>), so drawImage blits either the
// same. Lazily set to the procedural default on first draw if left unset.
let art = null;

/**
 * Replace the sprite art. Pass no src to restore the built-in silhouette.
 * @param {object} [opts]  { src?:string, eyes?:{y,dx}|false }
 * @returns {Promise<void>} resolves once the image (if any) has loaded
 */
export function setAugminotaurSprite(opts = {}) {
  const eyes = opts.eyes === false ? null : (opts.eyes || CREATURE_EYES);
  if (!opts.src) { art = buildDefaultArt(eyes); return Promise.resolve(); }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      art = { canvas: img, w: img.naturalWidth || SRC_W, h: img.naturalHeight || SRC_H, eyes };
      resolve();
    };
    img.onerror = () => {
      // Fall back to the bull rather than drawing nothing.
      art = buildDefaultArt(eyes);
      reject(new Error(`sprite load failed: ${opts.src}`));
    };
    img.src = opts.src;
  });
}

/** The procedural bull: horns + head + hunched body, near-black. */
function buildDefaultArt(eyes = CREATURE_EYES) {
  const c = document.createElement("canvas");
  c.width = SRC_W; c.height = SRC_H;
  const x = c.getContext("2d");
  const cx = SRC_W / 2;

  x.fillStyle = "#07080b"; // shadow body, barely above the ceiling colour

  // Hunched body: a bell/trapezoid from the shoulders down.
  x.beginPath();
  x.moveTo(cx - 8, SRC_H * 0.42);
  x.quadraticCurveTo(cx - 30, SRC_H * 0.70, cx - 24, SRC_H);
  x.lineTo(cx + 24, SRC_H);
  x.quadraticCurveTo(cx + 30, SRC_H * 0.70, cx + 8, SRC_H * 0.42);
  x.closePath();
  x.fill();

  // Head: a heavy block.
  x.beginPath();
  x.ellipse(cx, SRC_H * 0.30, 13, 15, 0, 0, Math.PI * 2);
  x.fill();

  // Horns: two curved spikes sweeping up and out from the head.
  for (const s of [-1, 1]) {
    x.beginPath();
    x.moveTo(cx + s * 9, SRC_H * 0.22);
    x.quadraticCurveTo(cx + s * 26, SRC_H * 0.10, cx + s * 30, SRC_H * 0.0);
    x.quadraticCurveTo(cx + s * 20, SRC_H * 0.12, cx + s * 13, SRC_H * 0.26);
    x.closePath();
    x.fill();
  }

  // Faint warm rim so the edge separates from a black corridor.
  x.globalCompositeOperation = "source-atop";
  x.strokeStyle = "rgba(60,42,34,0.5)";
  x.lineWidth = 1;
  x.stroke();

  return { canvas: c, w: SRC_W, h: SRC_H, eyes };
}

/**
 * Draw the Augminotaur.
 * @param g       320x200 context
 * @param W,H     canvas size
 * @param player  { x, y, angle }
 * @param aug     { x, y, scale, eyeGlow, alpha } world pos + visual state
 * @param zbuf    Float32Array(W) of wall depths from render()
 */
export function drawAugminotaur(g, W, H, player, aug, zbuf) {
  if (!art) art = buildDefaultArt();
  if (aug.alpha <= 0) return;

  // World offset, then into camera space (standard raycaster sprite maths).
  const dx = aug.x - player.x;
  const dy = aug.y - player.y;
  const dirX = Math.cos(player.angle), dirY = Math.sin(player.angle);
  const planeX = -dirY * PLANE_LEN, planeY = dirX * PLANE_LEN;

  const invDet = 1 / (planeX * dirY - dirX * planeY);
  const tX = invDet * (dirY * dx - dirX * dy);      // left/right on screen
  const depth = invDet * (-planeY * dx + planeX * dy); // forward distance
  if (depth <= 0.08) return; // behind the camera

  const screenX = (W / 2) * (1 + tX / depth);
  const scale = aug.scale || 1;
  const wallH = Math.abs(H / depth);          // a 1-unit wall at this depth
  const spriteH = wallH * HEIGHT * scale;
  const spriteW = spriteH * (art.w / art.h);
  // Stand him on the floor line (bottom of a wall stripe at this depth).
  const feetY = H / 2 + wallH * 0.5;
  const topY = feetY - spriteH;

  const left = screenX - spriteW / 2;
  const x0 = Math.floor(left);
  const x1 = Math.ceil(screenX + spriteW / 2);

  g.globalAlpha = aug.alpha;
  for (let sx = x0; sx < x1; sx++) {
    if (sx < 0 || sx >= W) continue;
    if (zbuf && depth >= zbuf[sx]) continue; // wall is nearer — occluded
    // Which source column maps to this screen column.
    const u = (sx - left) / spriteW;
    const srcX = Math.min(art.w - 1, Math.max(0, Math.floor(u * art.w)));
    g.drawImage(art.canvas, srcX, 0, 1, art.h, sx, topY, 1, spriteH);
  }
  g.globalAlpha = 1;

  // ---- eyes: two embers, live glow (only if the art wants them + visible) --
  if (!art.eyes) return;
  const centreCol = Math.round(screenX);
  const seen = !zbuf || centreCol < 0 || centreCol >= W || depth < zbuf[centreCol];
  const glow = aug.eyeGlow || 0;
  if (seen && glow > 0.01) {
    const eyeY = topY + spriteH * art.eyes.y;
    const eyeR = Math.max(1, spriteH * 0.018);
    const lit = Math.min(1, glow);
    // ember -> hot: red rising toward orange as he listens harder
    g.fillStyle = `rgb(${(120 + 135 * lit) | 0},${(20 + 70 * lit) | 0},${(15 + 25 * lit) | 0})`;
    g.shadowColor = `rgba(255,80,40,${0.6 * lit})`;
    g.shadowBlur = eyeR * 4 * lit;
    for (const s of [-1, 1]) {
      g.beginPath();
      g.arc(screenX + s * spriteW * art.eyes.dx, eyeY, eyeR, 0, Math.PI * 2);
      g.fill();
    }
    g.shadowBlur = 0;
  }
}

// Honor the top-of-file swap point at load (bull stays the default if null).
if (CREATURE_SPRITE_SRC) {
  setAugminotaurSprite({ src: CREATURE_SPRITE_SRC }).catch(err => console.warn(err.message));
}
