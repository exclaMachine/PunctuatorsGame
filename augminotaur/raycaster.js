/* =====================================================================
   raycaster.js — Wolfenstein-style DDA renderer
   ---------------------------------------------------------------------
   Casts one ray per screen column across a grid of solid cells and draws
   a vertical wall stripe per column. Flat-shaded: a single stone colour,
   darkened by which face was hit (N/S vs E/W) and by distance. No
   textures, so the whole wall can be brightened a few percent later to
   flash the beat.

   Everything is drawn straight to the 320x200 canvas context; at that
   resolution 320 fillRect stripes per frame is trivially 60fps.
   ===================================================================== */

const FOV = (66 * Math.PI) / 180;
// Camera-plane half-length. Exported so the sprite billboard projects with
// the exact same FOV as the walls (or it would drift across the view).
export const PLANE_LEN = Math.tan(FOV / 2);

// Palette (matches the input bench's stone/bone tones).
const CEIL  = [12, 14, 20];    // near-black, cold
const FLOOR = [30, 25, 21];    // dark warm dungeon floor
const WALL  = [168, 138, 110]; // warm bone-stone
const SIDE_SHADE = 0.66;       // N/S faces darker than E/W
const FOG_FAR = 13;            // cells at which walls fade to near-black
const FOG_MIN = 0.12;          // floor brightness so far walls aren't pure black

const rgb = c => `rgb(${c[0]|0},${c[1]|0},${c[2]|0})`;

/**
 * @param g      2D context of the 320x200 canvas
 * @param W,H    canvas pixel size (320, 200)
 * @param player {x, y, angle}
 * @param map    MAP[y][x]
 * @param light  brightness multiplier (1 = normal; >1 for the beat pulse later)
 * @param zbuf   optional Float32Array(W); filled with per-column wall depth
 *               so a billboard sprite can be depth-tested against the walls
 */
export function render(g, W, H, player, map, light = 1, zbuf = null) {
  // Ceiling and floor as two flat halves.
  g.fillStyle = rgb(CEIL);  g.fillRect(0, 0, W, H >> 1);
  g.fillStyle = rgb(FLOOR); g.fillRect(0, H >> 1, W, H - (H >> 1));

  const dirX = Math.cos(player.angle);
  const dirY = Math.sin(player.angle);
  const planeX = -dirY * PLANE_LEN;
  const planeY =  dirX * PLANE_LEN;

  for (let x = 0; x < W; x++) {
    const cameraX = (2 * x) / W - 1;
    const rayX = dirX + planeX * cameraX;
    const rayY = dirY + planeY * cameraX;

    let mapX = Math.floor(player.x);
    let mapY = Math.floor(player.y);

    const deltaX = Math.abs(1 / rayX);
    const deltaY = Math.abs(1 / rayY);

    let stepX, stepY, sideDistX, sideDistY;
    if (rayX < 0) { stepX = -1; sideDistX = (player.x - mapX) * deltaX; }
    else          { stepX =  1; sideDistX = (mapX + 1 - player.x) * deltaX; }
    if (rayY < 0) { stepY = -1; sideDistY = (player.y - mapY) * deltaY; }
    else          { stepY =  1; sideDistY = (mapY + 1 - player.y) * deltaY; }

    // Digital Differential Analysis — march cell to cell until a wall.
    let side = 0;
    for (let guard = 0; guard < 64; guard++) {
      if (sideDistX < sideDistY) { sideDistX += deltaX; mapX += stepX; side = 0; }
      else                       { sideDistY += deltaY; mapY += stepY; side = 1; }
      const row = map[mapY];
      if (row === undefined || row[mapX] === undefined || row[mapX] > 0) break;
    }

    // Perpendicular distance (no fisheye).
    let perp = side === 0 ? sideDistX - deltaX : sideDistY - deltaY;
    if (perp < 1e-4) perp = 1e-4;
    if (zbuf) zbuf[x] = perp;

    const lineH = Math.floor(H / perp);
    let y0 = ((H - lineH) >> 1);
    let y1 = y0 + lineH;
    if (y0 < 0) y0 = 0;
    if (y1 > H) y1 = H;

    let bright = 1 - perp / FOG_FAR;
    if (bright < FOG_MIN) bright = FOG_MIN;
    if (side === 1) bright *= SIDE_SHADE;
    bright *= light;

    g.fillStyle = `rgb(${(WALL[0]*bright)|0},${(WALL[1]*bright)|0},${(WALL[2]*bright)|0})`;
    g.fillRect(x, y0, 1, y1 - y0);
  }
}
