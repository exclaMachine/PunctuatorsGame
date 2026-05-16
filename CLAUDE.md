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

# Write. Right! — Project Context

## What This Is

A single-file HTML card game (`WriteRight.html`) built with vanilla HTML/CSS/JS — no frameworks, no build tools. Hosted on GitHub Pages as a static file.

## Game Rules Summary

- Players take turns playing cards to build sentences with the structure: **Noun + Verb + Preposition + Noun**
- Cards can be played to **any open matching position** in any sentence — there is no required order
- There are always **one active sentence slot per player** on the board at all times
- When a sentence is completed, the player who finished it draws it on the in-browser canvas while others guess
- The player who completed the sentence earns points equal to the sum of all cards played in that sentence
- A completed slot is immediately replaced with a fresh empty slot
- Game ends when the deck runs out and all hands are empty

## Card Types

| Type | Positions                          | Points |
| ---- | ---------------------------------- | ------ |
| Noun | NOUN 1 or NOUN 2 (first available) | 2      |
| Verb | VERB                               | 3      |
| Prep | PREP                               | 1      |
| Wild | Any open position, any word        | 4      |

## File Structure

Everything lives in `WriteRight.html` — styles, game logic, and canvas drawing are all inline. There are no external dependencies except two Google Fonts (`Bangers`, `Patrick Hand`).

## Key State Objects

- `G` — global game state (players, deck, slots, phase, timer)
- `DS` — drawing state (color, size, tool, undo history); kept separate so timer ticks don't wipe the canvas
- `SS` — setup screen state (player count, names)

## Game Phases

`game` → `word-choice` or `wild-choice` → (sentence completes) → `drawing` → `score-reveal` → back to `game`

## Rendering

The app uses a manual `render()` function that tears down and rebuilds `#app` innerHTML each call. The drawing overlay (`.draw-ov`) is appended directly to `<body>` and removed on `endDrawing()` or `resetGame()` to avoid losing canvas content during timer re-renders. Timer ticks use `tickTimer()` to patch only the DOM nodes that change, not a full re-render.

## Things to Keep in Mind

- Do not add a framework — keep it vanilla JS, single file
- Canvas sizing happens in `initCanvas()` via `requestAnimationFrame` after the overlay renders
- `x()` is the HTML escape helper — always use it when rendering user-supplied strings
- Slot positions are keyed as `n1`, `v`, `p`, `n2` internally
- The deck is 18 cards: 2× each of 9 card definitions (4 noun types, 2 verb types, 2 prep types, 1 wild)

The Prescriptivist's Gauntlet (prescriptivist.html)
A single-file browser game built with vanilla HTML/CSS/JS, deployable to GitHub Pages.
Concept: The player is shown a sentence tagged by part of speech and must transcribe it while obeying a set of active "laws" — each one stolen from a real human language. Laws stack over 12 rounds. Survive with 5 HP to win.
Mechanics:

Sentences are drawn from an 80-item corpus and tagged via Compromise.js (CDN), with a built-in fallback word-list tagger if the CDN is unavailable
Each word is displayed as a color-coded chip labeled by POS (noun, verb, article, pronoun, conjunction, preposition, adverb, adjective)
Chips whose POS is banned by an active rule get a red warning border
Violations are only revealed on submit, never while typing
A Show/Hide Rules toggle lets players attempt hard mode without seeing the active laws

The 12 rules (introduced one at a time, each with a real linguistics fact):

No letter "E" — French lipogram tradition
No a/an/the — Russian and 40%+ of languages
Words must end in vowels — Hawaiian open-syllable structure
No personal pronouns — Japanese/Mandarin pro-drop
Max 5 letters per word — Toki Pona
No 3+ consonant clusters — Maori vs. Georgian
No conjunctions — Classical Latin asyndeton
No prepositions — Latin/Finnish case endings
No -ly adverbs — Mandarin adverb system
No abstract nouns (-tion/-ness/-ity etc.) — Pirahã
No doubled consecutive letters — Turkish vowel harmony
No comparatives/superlatives — Mandarin/Yoruba invariant adjectives

Key files: prescriptivist.html (self-contained — all game logic, rules, corpus, and styles are inline)
Sprite hook: The villain character (Professor Prescripta) is intentionally absent from the current build. Sprite/animation integration is planned — the game UI leaves the left side of the main panel open for a character overlay.

# KAIMOJU カイモジュ — Project Context

Kaimoju (怪文字, kaomoji + kaiju) is a browser-based HTML5 Canvas game inspired by Rampage. The player controls a kaomoji monster and destroys ASCII-art buildings by correctly typing the romaji for katakana characters displayed on each block.

---

## Design Authority

**The user's suggestions and decisions are confirmed requirements.** Implement them without question.

**Claude's proposed suggestions are tentative.** Do not implement them without explicit user approval. When proposing new ideas, label them clearly as suggestions and wait for a yes before touching them.

**Keep this CLAUDE.md current.** Whenever a feature is added, removed, or changed in `kaimoju.html`or any other game in the project, update the relevant sections of this file in the same change — the Confirmed MVP Features list, the Core Data Structures block, and any related notes. Treat the doc as part of the diff, not an afterthought.

---

## Tech Stack

- **Single HTML file** — all HTML, CSS, and JavaScript lives in `kaimoju.html`. Do not split into separate files unless the user asks.
- No frameworks, no build tools, no dependencies.
- HTML5 Canvas (`<canvas>`) for all rendering.
- Vanilla JavaScript for all game logic.
- Target browsers: modern Chrome/Firefox/Safari/Edge.

---

## File Structure

```
your-project-folder/
├── kaimoju.html   ← entire game
└── CLAUDE.md      ← this file
```

---

## Confirmed MVP Features (Do Not Change Without User Approval)

These are locked-in. All of the following are the user's decisions:

- **Katakana-only mode** (all 46 characters, romaji input via Latin keyboard)
- **3–4 buildings per round** with random column/floor counts; each cell is destroyed by one correct romaji input (no per-block HP)
- **Random kaomoji** character at game start — random head + random body drawn from preset pools
- **Combo system** — consecutive correct inputs build a multiplier, any miss resets to zero
- **Ctrl+F — Find Mode**:
  - Scans all alive katakana on screen, finds the one that appears most frequently
  - Highlights every instance of that character in gold
  - The next time the player correctly destroys a cell of that character, the kaomoji fires laser beams from its eyes at every highlighted instance, destroying them all
  - Laser flight time scales with distance; the last beam to land triggers the floor-collapse pass so debris falls together
  - Has a cooldown after use
- **ASCII / terminal aesthetic** — dark background, green-on-black, scanlines, monospace font
- **Score + stats** on game over screen (score, high score, max combo, blocks hit, misses, accuracy)
- **No external dependencies** — one file, drop-in ready

---

## Architecture Overview

### Key Constants

- `CW = 48, CH = 48` — cell width/height in pixels
- `GY = 460` — ground Y coordinate (player feet)
- `PNL_Y = 473` — input panel top
- `W = 920, H = 580` — canvas dimensions

### Core Data Structures

**`buildings[]`** — array of building objects

```js
{
  x, width, cols, floors,
  cells: [ // cells[floor][col], floor 0 = bottom
    [ { char, romaji, destroyed, hi, hitAnim, dieAnim, fallY, fallVy }, ... ],
    ...
  ],
  collapsed, shakeX, roof
}
```

**`player{}`**

```js
{
  (x, vx, facing, head, body, legs, wFrame, wTimer, tgt);
}
```

`legs` is one of `LEG_SETS` — `{ stand, walk: [4 frames] }`. Body stays fixed; legs cycle through `walk` via `wFrame` while moving (any `|vx| > 0.25`) and snap to `stand` when idle. A small sine-driven vertical bob is added to the head and body while moving.

**`findMode{}`**

```js
{
  (on, char, count, cooldown);
}
```

**`particles[]`** — ASCII explosion effect particles
**`floats[]`** — floating score/status text
**`lasers[]`** — find-mode beams: `{ x1,y1, x2,y2, bIdx,f,c, life, hitAt, maxLife, hit, isLast }`. `hitAt` is when the beam reaches the target (and destroys the cell); the `isLast` beam (latest `hitAt`) triggers `collapseDestroyedFloors` for all buildings once it lands

### Input System

- `window.addEventListener('keydown', ...)` — no hidden input element
- `typeChar(ch)` handles romaji buffering:
  - If buffer + new char **equals** target romaji → CORRECT, destroy cell
  - If target romaji **starts with** buffer + char → valid prefix, keep buffering
  - Otherwise → MISS, reset buffer (or keep new char if it's a valid prefix start)
- Multi-char romaji (shi, chi, tsu, fu, wo) handled automatically by prefix logic
- Ctrl+F is `preventDefault`'d before it can open the browser find dialog
- Arrow keys are `preventDefault`'d to prevent page scrolling

### Game Flow

```
menu  →  [Enter]  →  playing  →  all buildings collapsed  →  gameover
                                                              [Enter/R]  →  playing
```

### Targeting Logic

- `nearestBuilding()` — finds closest non-collapsed building to player by center-x distance
- `firstCell(b)` — returns first non-destroyed cell in building (bottom → top, left → right)
- `activeTarget()` — combines both: returns `{f, c, cell}` for current player target

---

## Tentative Future Features (Proposed — Needs User Approval)

The following ideas were discussed but are **not confirmed**. Ask the user before implementing any of them:

- **Hiragana mode** — difficulty tier 2 (46 hiragana characters, same romaji system)
- **Kanji mode** — difficulty tier 3, JLPT N5→N3 vocabulary with furigana hints
- **Oni Mode** — timed typing windows, no romaji hints, buildings "fight back"
- **Kaomoji unlock/collection system** — earn new heads/bodies by destroying buildings
- **Additional power-ups** (tentative key bindings):
  - Ctrl+R — Rage Mode (simplifies all chars to kana for 10s)
  - Ctrl+S — Speed Burst (doubles typing window)
  - Ctrl+E — Chain (one correct input collapses whole floor)
  - Ctrl+D — Shield (next 3 misses forgiven)
  - Ctrl+A — Atomic Roar (clears all chars on screen)
- **Scrolling city** — infinite city that advances as buildings are cleared
- **Day/dusk/night cycle** — visual atmosphere that changes as difficulty ramps
- **HP / lose condition** — player takes damage from building collapses or enemy attacks
- **High score persistence** — localStorage
- **Japanese word dictionary** — real JLPT N5 vocabulary replacing individual characters
- **Difficulty select screen** — choose kana vs kanji, speed, etc.
- **Mobile support** — on-screen soft keyboard / touch input

---

## Coding Notes

- Keep all game code inside the single `<script>` tag in `kaimoju.html`
- The canvas is `920×580`. Adjust layout constants at the top of the script if resizing.
- Fonts: `'Courier New', monospace` — no external font imports needed
- `ctx.shadowBlur` is used for glow effects; always reset to `0` after use
- `ctx.textAlign` is often changed; always reset to `'left'` after centered drawing
- `ctx.globalAlpha` is used for fades; always reset to `1` after use
- The `frame` counter increments every `requestAnimationFrame` tick and is used for blink animations
- `Date.now()` is used directly for smooth time-based animations (stars, player bounce, etc.)
