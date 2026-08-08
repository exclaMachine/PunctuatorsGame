/* =====================================================================
   map.js — the labyrinth
   ---------------------------------------------------------------------
   A hardcoded 16x16 grid. 1 = wall, 0 = floor.

   The layout is an outer RING corridor (a loop you can walk forever)
   wrapped around a central plus-shaped corridor that splits the interior
   into four solid blocks. The ring is deliberate: the Augminotaur's
   augmented triad never resolves, so the maze never resolves either —
   it loops. Later movements break the symmetry; for now it just gives
   the raycaster long hallways and hard corners to draw.
   ===================================================================== */

const GRID = [
  "1111111111111111",
  "1000000000000001",  // ring — top
  "1011111001111101",
  "1011111001111101",
  "1011111001111101",
  "1011111001111101",
  "1011111001111101",
  "1000000000000001",  // central corridor — horizontal
  "1000000000000001",
  "1011111001111101",
  "1011111001111101",
  "1011111001111101",
  "1011111001111101",
  "1011111001111101",
  "1000000000000001",  // ring — bottom
  "1111111111111111",
];

export const MAP_W = 16;
export const MAP_H = 16;

// Row-major: MAP[y][x], y = row (increases downward), x = column.
export const MAP = GRID.map(row => row.split("").map(Number));

// A safe floor cell to spawn on, facing east down the top ring corridor.
export const SPAWN = { x: 1.5, y: 1.5, angle: 0 };

export function isWall(map, x, y) {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return true;
  return map[y][x] !== 0;
}
