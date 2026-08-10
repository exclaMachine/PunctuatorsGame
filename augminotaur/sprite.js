/* =====================================================================
   sprite.js — the Augminotaur billboard
   ---------------------------------------------------------------------
   One depth-tested sprite: a dark horned silhouette standing down the
   corridor. Projected with the raycaster's exact FOV (PLANE_LEN) so it
   sits in the world, and blitted column-by-column against the wall
   z-buffer so it hides correctly behind corners.

   The body is a near-black shadow that reads as a looming mass; distance
   is the whole point (he grows as he closes in — "damage is distance"),
   so there is deliberately little detail. His eyes are drawn live on top,
   two embers that brighten while he's listening for your answer.

   No image asset: the silhouette is drawn once to an offscreen canvas at
   load, then scaled per frame.
   ===================================================================== */

import { PLANE_LEN } from "./raycaster.js";

// Source silhouette resolution. Small — it's a pixel-art shadow, upscaled.
const SRC_W = 64, SRC_H = 96;
// World height in cell-units: >1 so he looms taller than a wall is high.
const HEIGHT = 1.75;

// Where the eyes sit in source space (fraction of SRC_W/SRC_H), so the live
// glow tracks the baked head no matter the on-screen size.
const EYE_Y = 0.30;
const EYE_DX = 0.16;

let creature = null; // lazily-built offscreen canvas

/** Build the silhouette once: horns + head + hunched body, near-black. */
function buildCreature() {
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

  creature = c;
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
  if (!creature) buildCreature();
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
  const spriteW = spriteH * (SRC_W / SRC_H);
  // Stand him on the floor line (bottom of a wall stripe at this depth).
  const feetY = H / 2 + wallH * 0.5;
  const topY = feetY - spriteH;

  const x0 = Math.floor(screenX - spriteW / 2);
  const x1 = Math.ceil(screenX + spriteW / 2);

  g.globalAlpha = aug.alpha;
  for (let sx = x0; sx < x1; sx++) {
    if (sx < 0 || sx >= W) continue;
    if (zbuf && depth >= zbuf[sx]) continue; // wall is nearer — occluded
    // Which source column maps to this screen column.
    const u = (sx - (screenX - spriteW / 2)) / spriteW;
    const srcX = Math.min(SRC_W - 1, Math.max(0, Math.floor(u * SRC_W)));
    g.drawImage(creature, srcX, 0, 1, SRC_H, sx, topY, 1, spriteH);
  }
  g.globalAlpha = 1;

  // ---- eyes: two embers, live glow (only if his centre isn't occluded) --
  const centreCol = Math.round(screenX);
  const seen = !zbuf || centreCol < 0 || centreCol >= W || depth < zbuf[centreCol];
  const glow = aug.eyeGlow || 0;
  if (seen && glow > 0.01) {
    const eyeY = topY + spriteH * EYE_Y;
    const eyeR = Math.max(1, spriteH * 0.018);
    const lit = Math.min(1, glow);
    // ember -> hot: red rising toward orange as he listens harder
    g.fillStyle = `rgb(${(120 + 135 * lit) | 0},${(20 + 70 * lit) | 0},${(15 + 25 * lit) | 0})`;
    g.shadowColor = `rgba(255,80,40,${0.6 * lit})`;
    g.shadowBlur = eyeR * 4 * lit;
    for (const s of [-1, 1]) {
      g.beginPath();
      g.arc(screenX + s * spriteW * EYE_DX, eyeY, eyeR, 0, Math.PI * 2);
      g.fill();
    }
    g.shadowBlur = 0;
  }
}
