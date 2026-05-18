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

- **Difficulty modes** — `MODES` registry holds `katakana` (KR), `hiragana` (HR), `kanji` (KJR), and `words` (`N5_WORDS` list). `gameMode` selects which set `makeBuildings` populates cells from. A `chars`-based mode plugs in by adding a `{ label, desc, chars, sample }` entry; the word-mode shape adds `isWords:true` + `words:[{jp, romaji, en}]`.
- **Difficulty select screen** — `gState === 'select'` reached from menu/gameover Enter (or tap). Press `1`/`2`/`3` (or tap a card) to start that mode; ESC returns to title. `SELECT_CARDS` is built from `MODE_KEYS` so adding a mode automatically gets a card. `startGame(mode)` is the single entry point that sets `gameMode`, flips state to `playing`, and calls `initGame` + `sndStart`. Gameover `R` retries the same mode, Gameover Enter routes back to select.
- **Katakana mode** — all 46 base katakana **plus** the 25 dakuon/handakuon (ガ・ギ…パ・ピ…). Base set lives in `KR`; voiced/semi-voiced set lives in a separate `DKR` const and is spread into the mode's `chars` map (`{...KR, ...DKR}`). ヂ/ヅ use `di`/`du` to avoid colliding with ジ/ズ.
- **Progression + HP system (kata/hira only)** — kana modes now ramp by gojuon order. `GOJUON_KATA` / `GOJUON_HIRA` arrays drive the order (base 46 then dakuon then handakuon). `LEVEL_START_SIZE = 6` so level 1's pool is the first 6 chars; each `advanceLevel` appends one more. `learnedPool` is what `makeBuildings` samples from; `newCharThisLevel` is the just-added char. The kaomoji has 5 HP (`KAIJU_MAX_HP`); wrong romaji costs 1 HP and triggers a **miss reveal** (`MISS_REVEAL_MS = 1400`): the bottom-panel target hint and the romaji letter boxes force-reveal in red, AND `drawMissReveal()` paints a huge centered banner (`WRONG — type this:` + the glyph + romaji) over the playfield until the timer fades. 0 HP triggers `endGame(false)`. **Hint reveal is gated by `hintAllowed()`**: only the level-1 tutorial building (1 col × `LEVEL_START_SIZE` floors; one starter char per floor, bottom→top in gojuon order so the player meets all 6 with the hint on) or — on level 2+ — the **first** cell of `newCharThisLevel` (`makeBuildings` pins it to building 0 / floor 0 / col 0 so it's the player's first encounter that level). Once that cell is destroyed, `newCharIntroduced` flips true and the char loses its hint reveal for the rest of the run; further instances behave like any already-learned char. Find Mode is locked out while the un-introduced new char is the active target (`findLockedOnNewChar()`), so the player can't skip learning it by detonating every instance at once. All other cells stay blank under the glyph (`???`). HUD adds `LV N` and a row of 5 hearts. Gameover screen shows `LEVEL REACHED`. Kanji and words modes keep the old random-pool + no-HP behavior; their gameover still uses the old "CITY DESTROYED!" win banner when all buildings fall.
- **Hiragana mode** — all 46 base hiragana **plus** the 25 dakuon/handakuon (が・ぎ…ぱ・ぴ…). Base set lives in `HR`; voiced/semi-voiced set lives in a separate `DR` const and is spread into the mode's `chars` map (`{...HR, ...DR}`). ぢ/づ use `di`/`du` to avoid colliding with じ/ず. TraceMode's `romajiFor` also reads `DR` so dakuon glyphs work if added to stroke data later.
- **Kanji mode** — 33 JLPT N5 essentials (`KJR` map): numbers, body parts, nature, common words. One reading per kanji to keep the input unambiguous; readings hand-picked to avoid romaji collisions (e.g. 四 → `yon` not `shi`, 七 → `nana` not `shichi`, 火 → `ka` not `hi` so 日 owns `hi`).
- **Words mode** — N5 vocabulary (`N5_WORDS`, ~70 entries with `{jp, romaji, en}` in hiragana). Buildings are generated by `makeWordBuildings`: 2–3 towers, 3–5 floors each, **one wide cell per floor** holding the word. Each tower's `cellW` = the longest word's width (`max(72, len*26+18)`); cells use this for box rendering, particles, standX, find lasers — `drawCell` takes an optional `cellW` arg defaulting to `CW`. Cell glyph font scales down for longer words (16/18/20 px). The English translation pops as a `#9adfff` `addFloat` over the destroyed cell.
- **3–4 buildings per round** with random column/floor counts; each cell is destroyed by one correct romaji input (no per-block HP)
- **Random kaomoji** character at game start — random head + random body drawn from preset pools
- **Combo system** — consecutive correct inputs build a multiplier, any miss resets to zero
- **Destroy-punch animation** — every correct katakana fires a brief (`PUNCH_DUR` = 14 frames) punch in the kaomoji: a sine-curve lunge toward the destroyed cell plus an extending `══►` fist sprite and a `BAM!` flash at peak. Triggered in `doHit`; movement is locked during the punch. Find-mode laser kills don't trigger it (the punch is for the typed-romaji moment, not for chained destruction).
- **Background vehicles** — `VEHICLE_DEFS` registry (plane / helicopter / tank) with multi-frame sprite arrays. Instances live in `vehicles[]`, spawn off the left edge on a 3–9 s timer (`maybeSpawnVehicle`), drift right at type-specific speeds, despawn past the right edge. Helicopter has a 2-frame rotor cycle stepped by `animDur`. Drawn after buildings/trees, before particles, so they pass in front of the city. Updated in `updateAmbient` so they keep moving on menu/select/gameover too. Decorative only for now — planned to carry attached romaji and shoot at the kaomoji later.
- **Title/select chiptune** — short 16-step looping melody + I-IV-V-I bass played via Web Audio (`SONG_MELODY` / `SONG_BASS`, `SONG_STEP_MS = 160`). `startSong`/`stopSong` manage two chained `setTimeout` schedulers. Plays on menu and select screens; stops when `startGame` flips state to playing. Web Audio autoplay rules force gesture-gated start, so `maybeStartIntroSong` runs on every keypress/tap and no-ops if already playing or not on menu/select. `muted` is respected — loop continues silently and resumes audibly on unmute.
- **TraceMode (experimental, encapsulated)** — Duolingo-style stroke tracing mini-game. Lives entirely inside one IIFE-wrapped `TraceMode` module so it can be ripped out without touching the rest of the game. Currently a Step-1 MVP: 5 hand-defined glyphs (一/二/三/い/こ), guided "tracks" only (Tier 1), launched via `T` on the menu. Pointer events feed `TraceMode.pointer('down'|'move'|'up', x, y)`; rendering is a full-screen overlay drawn last in `render()` regardless of `gState`. **Removal recipe**: delete the `TraceMode` IIFE block + the four call sites tagged `// TraceMode:` in `handleKey`, `render`, the menu hint, and the pointer handlers. No other code reads its state.
- **Round-start intro** — `introActive` flag flipped on by `startGame` (so it plays every new level, not on page load). Tiny ASCII crowd of 7 people (`\o/ | / \` at 11 px) holds for `INTRO_STAND` (1.1 s) under a `うわああ怪獣だ！！ / AAAGH KAIJU!!!` speech bubble centered above the scene (`drawIntroBubble`), then bolts **right** off-screen with bobbing legs. The kaomoji is held off-screen (early-return in `update`, skip in `drawPlayer`) and input is gated (`typeChar`/`activateFind` bail) until intro ends after `INTRO_DUR` (4 s). Once it ends the existing auto-walk pulls the kaomoji in from the left. Any key/tap skips. `drawIntroOverlay` is layered on top of the playing scene after the HUD.
- **Romaji hint delay** — only the active target cell ever shows its romaji under the glyph, and only after a 1-second delay (`HINT_DELAY_MS`). Non-active cells render blank under the char so the player can't look ahead at upcoming readings. The cell hint, the bottom-panel target hint, and the per-letter input boxes all show `???` / `?` placeholders during the delay; letters the player has already typed correctly still show. Tracked via `activeKey` + `activeStartTime`; `hintRevealed()` is the gate.
- **Help overlay** — a `[?]` button in the top-right corner (and the `?` key) opens a full-screen how-to-play overlay. The game pauses while it's open (update() bails on `showHelp`); ESC, `?`, or clicking the overlay closes it. Closing resets the hint timer so the player still gets a fresh delay.
- **Ctrl+F — Find Mode**:
  - Scans all alive katakana on screen, finds the one that appears most frequently
  - Highlights every instance of that character in gold
  - The next time the player correctly destroys a cell of that character, the kaomoji fires laser beams from its eyes at every highlighted instance, destroying them all
  - Laser flight time scales with distance; the last beam to land triggers the floor-collapse pass so debris falls together
  - Has a cooldown after use
- **ASCII / terminal aesthetic** — dark background, green-on-black, scanlines, monospace font
- **Score + stats** on game over screen (score, high score, max combo, blocks hit, misses, accuracy)
- **No external dependencies** — one file, drop-in ready
- **Day / Night themes** — `THEME_DAY` and `THEME_NIGHT` palettes are spread into the live `P` palette by `applyTheme(name)`. Night = warm yellow-lit windows on dark masonry walls under a navy/purple sky; Day = cool light-blue windows on tan walls under a pale sky (windows are a *darker* blue than the sky so they read as glass). `currentTheme` defaults to OS `prefers-color-scheme` and live-updates on system change. A `[☀]/[☾]` button (top-right, just left of `[?]`) and a click handler in pointerdown let the user toggle manually. Cells are rendered as `wall_bg`/`wall_bd` rectangles with an inset `pane_bg`/`pane_bd` window pane plus a faint mullion cross — this is what made buildings actually read as buildings. State changes (idle / active / find / hit) swap pane color **and** border thickness **and** shadow glow so red-green or blue-yellow colorblind users can still parse them. Stars are skipped in day mode. Body CSS bg is repainted from JS to match. Many menu/select/gameover hardcoded greens were swapped for theme-aware `P.hud` / `P.hud_dim`.

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
  (x, vx, facing, head, body, legs, wFrame, wTimer, punch, punchDir, tgt);
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
- `?` and ESC are reserved for the help overlay; while `showHelp` is true, all other key input is swallowed in `handleKey`

### Game Flow

```
menu  →  [Enter]  →  select  →  [1/2 or tap card]  →  playing  →  all buildings collapsed  →  gameover
                       ↑                                                                       │
                       └─────────────────── [Enter] ──────────────────────────────────────────┘
                                                                                              [R] → retry same mode
```

### Targeting Logic

- `nearestBuilding()` — finds closest non-collapsed building to player by center-x distance
- `firstCell(b)` — returns first non-destroyed cell in building (bottom → top, left → right)
- `activeTarget()` — combines both: returns `{f, c, cell}` for current player target

---

## Tentative Future Features (Proposed — Needs User Approval)

The following ideas were discussed but are **not confirmed**. Ask the user before implementing any of them:

- **Kanji expansion** — extend `KJR` toward full JLPT N5 (~80 kanji) or up to N4. Furigana hint overlays still tentative.
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
- **Mobile support** — on-screen soft keyboard / touch input
- **Stroke-tracing mini-game (Duolingo-style)** — Step 1 MVP is now in the codebase (see "TraceMode" below). Future steps to validate before expanding:
  - Tier 2: freehand mode where only the faded full glyph is shown and a similarity scorer (Fréchet / chamfer) decides pass/fail.
  - Expand `STROKES` data — current set is 5 hand-defined glyphs (一二三 + い + こ). Real expansion would pull from [KanjiVG](https://kanjivg.tagaina.net/) and embed a JSON subset (kana + N5 kanji ≈ 130 glyphs, 40–80 KB).
  - Game integration beyond the standalone menu shortcut: trigger trace as a between-round bonus, or as a buff-granting power-up.

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
