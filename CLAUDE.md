# Ambigram Word Game — Project Brief

## Trigger Phrases

- **"ship it"** — When the user says "ship it", immediately run `git add .`, then `git commit -m '<relevant message based on recent changes>'`, then `git push`. Write a concise, accurate commit message reflecting what was actually changed. No confirmation needed — just do it.

## Concept

A word game built around ambigram tiles. Each tile is a square divided into 4 quadrants, each containing a letter. Tiles are placed on a grid and can be rotated (90°, 180°, 270°). Rotating a tile transforms letters into their ambigram equivalents — for example, `n` rotated 180° becomes `u`. Players type words using letters from the grid.

The long-term vision includes custom-drawn glyphs for each letter so the letter doesn't visually change when rotated — it is simply read differently depending on orientation. This means the "invalid rotation" concept (red × markers) will eventually go away entirely.

## Current Stack

- Single-file HTML5 Canvas game (`SpinNidIndex.html`)
- Vanilla JS, no frameworks or build tools
- `2of12.txt` — the 2-of-12 word list (~41,000 words), loaded via `fetch()` at runtime
- Hosted on GitHub Pages
- Developed in VS Code

## Project Structure

```
/
├── index.html    ← entire game: canvas rendering, game logic, UI
├── words.txt     ← dictionary, one word per line, \r\n line endings
├── README.md     ← setup and GitHub Pages deployment instructions
└── CLAUDE.md     ← this file
```

## Ambigram Letter Map

Each letter maps to what it reads as at `[0°, 90°CW, 180°, 270°CW]`. `null` = invalid/unreadable at that rotation.

### 180° pairs

| Base | 180° |
| ---- | ---- |
| a    | e    |
| A    | V    |
| b    | q    |
| C    | D    |
| d    | p    |
| g    | g    |
| h    | y    |
| i    | i    |
| j    | r    |
| l    | l    |
| L    | T    |
| m    | w    |
| M    | W    |
| n    | u    |
| H    | H    |
| N    | N    |
| O    | O    |
| Z    | Z    |
| s    | s    |
| t    | t    |
| x    | x    |
| y    | R    |
| z    | z    |

### 90° CW pairs

| Base | 90°CW |
| ---- | ----- |
| B    | w     |
| c    | n     |
| E    | m     |
| H    | I     |
| j    | L     |
| L    | r     |
| N    | Z     |
| n    | s     |
| o    | o     |
| t    | t     |
| u    | c     |
| w    | E     |
| x    | x     |
| Y    | Y     |
| Z    | N     |

### 270° CW (= 90° CCW) pairs

| Base | 270°CW |
| ---- | ------ |
| c    | u      |
| E    | w      |
| H    | I      |
| I    | H      |
| m    | E      |
| n    | s      |
| N    | Z      |
| O    | O      |
| r    | L      |
| s    | n      |
| t    | t      |
| u    | D      |
| w    | B      |
| x    | x      |
| Y    | Y      |
| Z    | N      |

### Implementation in code

```js
const AM = {
  // [at 0°, at 90°CW, at 180°, at 270°CW]
  a: ["a", null, "e", null],
  n: ["n", "s", "u", "s"],
  N: ["N", "Z", "N", "Z"],
  // etc.
};
```

Quad slot remapping after rotation (which base slot fills each visual position):

```js
const RS = [
  [0, 1, 2, 3], // 0° — identity
  [2, 0, 3, 1], // 90°CW
  [3, 2, 1, 0], // 180°
  [1, 3, 0, 2], // 270°CW
];
```

## Tile Layout

Quadrant indices within a tile:

```
┌───┬───┐
│ 0 │ 1 │   TL=0  TR=1
├───┼───┤   BL=2  BR=3
│ 2 │ 3 │
└───┴───┘
```

The origin dot (visible white/dark dot) sits at the TL corner of each tile and rotates with it — it's the primary visual indicator that a tile has been rotated.

## Difficulty Modes

Three modes are implemented, selectable via radio buttons:

| Mode                   | Rule                                                                              |
| ---------------------- | --------------------------------------------------------------------------------- |
| **Free (beginner)**    | Any letter from anywhere on the board                                             |
| **One per tile**       | Max one letter used from each tile per word                                       |
| **Adjacent (classic)** | Each letter must be in a quadrant touching the previous one (including diagonals) |

More modes are planned. The adjacency check uses absolute quad positions (each tile = 2×2 sub-grid of quad positions on the full board).

## Planned Features

### Board transformations

- **Whole-board rotation** — rotate all tiles together 90°/180°/270°, updating all tile rotations accordingly
- **Mirror image** — flip the whole board horizontally or vertically. This requires a new letter map for mirrored readings (not yet designed). Special mirror tiles will trigger this mode.

### Gameplay modes

- Timed scoring rounds
- Campaign / puzzle mode with preset tile layouts
- Multiplayer / hot-seat
- Endless mode with random tile draws

### Visual / UX

- Custom ambigram glyphs to replace standard font characters — once in place, all letters are always valid at any rotation (no more red × markers), they simply read differently
- Better tile hand UI
- Animations for scoring

## Key Design Decisions

- **Case matters** — `n` and `N` are distinct letters with different ambigram mappings
- **Greedy matching** — when a player types a letter, the system finds the first available matching quadrant in grid order (left-to-right, top-to-bottom). Same quadrant can't be used twice in one word.
- **Re-resolution** — when a new tile is placed or a tile is rotated, the current typed word is re-resolved against the new grid state. Red (unmatched) letters can turn green.
- **Word validation** — done locally against `words.txt` (no API calls). Case-insensitive lookup.
- **No adjacency in Free mode** — letters can come from anywhere; this is intentional for accessibility

## Known Issues / Watch Out For

- `words.txt` has `\r\n` line endings — strip with `/\r?\n/` when parsing
- Word lookup must be case-insensitive (player types lowercase, word list is lowercase)
- The `R` key rotates a selected tile — but only when `wordSeq` is empty, otherwise `r` is treated as a letter
- Tile rotation animation uses `ca` (current angle) lerping toward `ta` (target angle). Check `Math.abs(t.ca - t.ta) < 0.05` before allowing trace/match on a still-spinning tile
- `dpr` is capped at 2 to avoid performance issues on high-DPI screens
