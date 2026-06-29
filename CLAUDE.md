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

**Card-play animation:** because `render()` rebuilds the DOM, played cards are animated with a fly-a-clone (FLIP-style) trick instead of CSS transitions. `commit()` snapshots the played `.card`'s `getBoundingClientRect()` + a `cloneNode` **before** the rebuild (cards carry `data-c`, filled slot cells carry `data-slot`/`data-pos`), then after `render()` calls `flyCardToSlot(node, srcRect, destEl)` which fixed-positions the clone at the source and uses the Web Animations API (`element.animate`) to arc it to the slot with a scale-down/pop, hiding the destination cell until it lands. Skipped on `prefers-reduced-motion` (`PREFERS_REDUCED`) and when the play completes a sentence (the drawing overlay takes over). This mirrors the canvas card-move animation in the exquisite-corpse game.

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
- **Progression + HP system (kata/hira only)** — kana modes now ramp by gojuon order. `GOJUON_KATA` / `GOJUON_HIRA` arrays drive the order (base 46 then dakuon then handakuon). `LEVEL_START_SIZE = 6` so level 1's pool is the first 6 chars; each `advanceLevel` appends one more. `learnedPool` is what `makeBuildings` samples from; `newCharThisLevel` is the just-added char. The kaomoji has 5 HP (`KAIJU_MAX_HP`); wrong romaji costs 1 HP and triggers a **miss reveal** (`MISS_REVEAL_MS = 1400`): the bottom-panel target hint and the romaji letter boxes force-reveal in red, AND `drawMissReveal()` paints a huge centered banner (`WRONG — type this:` + the glyph + romaji) over the playfield until the timer fades. 0 HP triggers `endGame(false)`. **Hint reveal is gated by `hintAllowed()`**: only the level-1 tutorial building (1 col × `LEVEL_START_SIZE` floors; one starter char per floor, bottom→top in gojuon order so the player meets all 6 with the hint on) or — on level 2+ — the **first** cell of `newCharThisLevel` (`makeBuildings` pins it to building 0 / floor 0 / col 0 so it's the player's first encounter that level). Once that cell is destroyed, `newCharIntroduced` flips true and the char loses its hint reveal for the rest of the run; further instances behave like any already-learned char. Find Mode is locked out (`findLockedOnNewChar()`) whenever the active target is a char the player hasn't been introduced to yet — anywhere inside the level-1 tutorial tower (all 6 starter chars), or the un-introduced new char on level 2+. Prevents the player from skipping learning by detonating every instance at once. All other cells stay blank under the glyph (`???`). HUD adds `LV N` and a row of 5 hearts. Gameover screen shows `LEVEL REACHED`. Kanji and words modes keep the old random-pool + no-HP behavior; their gameover still uses the old "CITY DESTROYED!" win banner when all buildings fall.
- **Hiragana mode** — all 46 base hiragana **plus** the 25 dakuon/handakuon (が・ぎ…ぱ・ぴ…). Base set lives in `HR`; voiced/semi-voiced set lives in a separate `DR` const and is spread into the mode's `chars` map (`{...HR, ...DR}`). ぢ/づ use `di`/`du` to avoid colliding with じ/ず. TraceMode's `romajiFor` also reads `DR` so dakuon glyphs work if added to stroke data later.
- **Kanji mode** — 33 JLPT N5 essentials (`KJR` map): numbers, body parts, nature, common words. One reading per kanji to keep the input unambiguous; readings hand-picked to avoid romaji collisions (e.g. 四 → `yon` not `shi`, 七 → `nana` not `shichi`, 火 → `ka` not `hi` so 日 owns `hi`).
- **Words mode** — N5 vocabulary (`N5_WORDS`, ~70 entries with `{jp, romaji, en}` in hiragana). Buildings are generated by `makeWordBuildings`: 2–3 towers, 3–5 floors each, **one wide cell per floor** holding the word. Each tower's `cellW` = the longest word's width (`max(72, len*26+18)`); cells use this for box rendering, particles, standX, find lasers — `drawCell` takes an optional `cellW` arg defaulting to `CW`. Cell glyph font scales down for longer words (16/18/20 px). The English translation pops as a `#9adfff` `addFloat` over the destroyed cell.
- **Set block count per level (kana modes)** — kana progression levels spawn a _fixed_ number of building blocks = `BLOCKS_PER_CHAR` (3) × chars learned so far, capped at `blockCap()` (54 desktop / 30 mobile). `targetBlockCount()` computes it; `makeProgressionConfigs()` distributes that exact total across a **mix of taller and wider** buildings via `partitionConfigs()` (picks a total column count `C`, base height `h = floor(N/C)`, and makes `N − C·h` columns one floor taller, grouped into "tall" buildings interleaved with "short" ones by `shuffleArr`). Level 1 prepends the 1-wide tutorial tower inside `makeProgressionConfigs`. So the city grows as the player's vocab grows, then plateaus at the cap. **Side-scroll hook:** `SIDE_SCROLL` (default `false`) — flipping it true removes both the block cap and the column-fit limit in the generator; the remaining work to actually ship side-scrolling is a horizontal camera offset in render/targeting/movement (not yet built).
- **Kanji mode buildings** — still 3–4 buildings per round with random column/floor counts (`makeBuildingConfigs`); each cell is destroyed by one correct romaji input (no per-block HP)
- **Random kaomoji** character at game start — random head + random body drawn from preset pools
- **Combo system** — consecutive correct inputs build a multiplier, any miss resets to zero
- **Destroy-punch animation** — every correct katakana fires a brief (`PUNCH_DUR` = 14 frames) punch in the kaomoji: a sine-curve lunge toward the destroyed cell plus an extending `══►` fist sprite and a `BAM!` flash at peak. Triggered in `doHit`; movement is locked during the punch. Find-mode laser kills don't trigger it (the punch is for the typed-romaji moment, not for chained destruction).
- **Background vehicles** — `VEHICLE_DEFS` registry (plane / helicopter / tank) with multi-frame sprite arrays. Instances live in `vehicles[]`, spawn off the left edge on a 3–9 s timer (`maybeSpawnVehicle`), drift right at type-specific speeds, despawn past the right edge. Helicopter has a 2-frame rotor cycle stepped by `animDur`. Drawn after buildings/trees, before particles, so they pass in front of the city. Updated in `updateAmbient` so they keep moving on menu/select/gameover too. Decorative only for now — planned to carry attached romaji and shoot at the kaomoji later.
- **Title/select chiptune** — short 16-step looping melody + I-IV-V-I bass played via Web Audio (`SONG_MELODY` / `SONG_BASS`, `SONG_STEP_MS = 160`). `startSong`/`stopSong` manage two chained `setTimeout` schedulers. Plays on menu and select screens; stops when `startGame` flips state to playing. Web Audio autoplay rules force gesture-gated start, so `maybeStartIntroSong` runs on every keypress/tap and no-ops if already playing or not on menu/select. `muted` is respected — loop continues silently and resumes audibly on unmute.
- **TraceMode (experimental, encapsulated, currently dormant)** — Duolingo-style stroke tracing mini-game. Lives entirely inside one IIFE-wrapped `TraceMode` module so it can be ripped out without touching the rest of the game. Currently a Step-1 MVP: 5 hand-defined glyphs (一/二/三/い/こ), guided "tracks" only (Tier 1). **No menu shortcut** — the `T` launcher was removed because lowercase `t` is needed in-game for テ/タ etc.; TraceMode can only be entered if a future feature explicitly calls `TraceMode.start(char)`. Pointer events still feed `TraceMode.pointer('down'|'move'|'up', x, y)` and rendering is a full-screen overlay drawn last in `render()`, so once a re-entry hook is wired up the module is ready. **Removal recipe**: delete the `TraceMode` IIFE block + the remaining call sites tagged `// TraceMode:` in `handleKey`, `render`, and the pointer handlers. No other code reads its state.
- **Round-start intro** — `introActive` flag flipped on by `startGame` (so it plays every new level, not on page load). Tiny ASCII crowd of 7 people (`\o/ | / \` at 11 px) holds for `INTRO_STAND` (1.1 s) under a `うわああ怪獣だ！！ / AAAGH KAIJU!!!` speech bubble centered above the scene (`drawIntroBubble`), then bolts **right** off-screen with bobbing legs. The crowd overlay renders for `INTRO_DUR` (4 s), but the kaomoji is only held off-screen until `KAIJU_HOLD_MS` (`INTRO_STAND + 350` ms) — so the kaiju walks on while the last stragglers are still running, instead of waiting for every person to clear the frame. `kaijuLocked()` is the single gate used by `update` (movement), `drawPlayer` (rendering), `typeChar`, and `activateFind`. Any key/tap clears `introActive` immediately, which also releases the kaiju. `drawIntroOverlay` is layered on top of the playing scene after the HUD.
- **Romaji hint delay** — only the active target cell ever shows its romaji under the glyph, and only after a 1-second delay (`HINT_DELAY_MS`). Non-active cells render blank under the char so the player can't look ahead at upcoming readings. The cell hint, the bottom-panel target hint, and the per-letter input boxes all show `???` / `?` placeholders during the delay; letters the player has already typed correctly still show. Tracked via `activeKey` + `activeStartTime`; `hintRevealed()` is the gate.
- **Help overlay** — a `[?]` button in the top-right corner (and the `?` key) opens a full-screen how-to-play overlay. The game pauses while it's open (update() bails on `showHelp`); ESC, `?`, or clicking the overlay closes it. Closing resets the hint timer so the player still gets a fresh delay.
- **Ctrl+F — Find Mode**:
  - Scans all alive katakana on screen, finds the one that appears most frequently
  - Highlights every instance of that character in gold
  - The next time the player correctly destroys a cell of that character, the kaomoji fires laser beams from its eyes at every highlighted instance, destroying them all
  - Laser flight time scales with distance; the last beam to land triggers the floor-collapse pass so debris falls together
  - **Streak-gated, not time-gated**: needs `FIND_CHARGE_REQUIRED` (10) clean hits in a row to unlock. `findMode.charge` increments on each correct hit in `doHit` and resets to 0 on any miss (`doMiss`) or after the burst fires (`doFindBurst`). The charge **persists across level-ups** — `initGame` only zeroes it on level 1, so a partial streak carries into the next level. (Activation against the level's un-introduced new char is still blocked by `findLockedOnNewChar()`.) The bottom on-canvas FIND button shows `STREAK N/10 → unlock FIND` until charged, then the usual ready label. A `FIND READY!` float fires the frame the streak completes.
- **ASCII / terminal aesthetic** — dark background, green-on-black, scanlines, monospace font
- **Score + stats** on game over screen (score, high score, max combo, blocks hit, misses, accuracy)
- **No external dependencies** — one file, drop-in ready
- **Day / Night themes** — `THEME_DAY` and `THEME_NIGHT` palettes are spread into the live `P` palette by `applyTheme(name)`. Night = warm yellow-lit windows on dark masonry walls under a navy/purple sky; Day = cool light-blue windows on tan walls under a pale sky (windows are a _darker_ blue than the sky so they read as glass). `currentTheme` defaults to OS `prefers-color-scheme` and live-updates on system change. A `[☀]/[☾]` button (top-right, just left of `[?]`) and a click handler in pointerdown let the user toggle manually. Cells are rendered as `wall_bg`/`wall_bd` rectangles with an inset `pane_bg`/`pane_bd` window pane plus a faint mullion cross — this is what made buildings actually read as buildings. State changes (idle / active / find / hit) swap pane color **and** border thickness **and** shadow glow so red-green or blue-yellow colorblind users can still parse them. Stars are skipped in day mode. Body CSS bg is repainted from JS to match. Many menu/select/gameover hardcoded greens were swapped for theme-aware `P.hud` / `P.hud_dim`.
- **Character-order toggle (kana modes)** — a two-segment toggle on the difficulty-select screen (`SELECT_TOGGLE`, drawn below the mode cards) lets the player pick `SEQUENTIAL` (default) or `RANDOM` order. Click either segment (`seg1`/`seg2` hitboxes in the pointer handler) or press `R` on the select screen to flip it. It's **session-only — not persisted** (resets to SEQUENTIAL on reload) and **kana-only** (no effect on kanji/words; left open to extend to words later). The ramp/HP/hint scaffolding is unchanged — only the _order_ the gojuon chars are introduced changes: when `randomOrder` is true, `startGame` builds `runOrder = shuffleArr(baseGojuon(mode).slice())` once per run, and `gojuonOrder()` returns `runOrder` (falling back to the fixed `GOJUON_KATA`/`GOJUON_HIRA` via `baseGojuon` when off). So level 1's 6 starter chars and each level's single new char (`poolForLevel`/`newCharForLevel`, both routed through `gojuonOrder`) become random but stay consistent across that run's levels. Built to solve "early chars repeat forever, later chars take ~65 levels to reach." `runOrder` is rebuilt every `startGame`, so each run gets a fresh shuffle. **Two separate UIs — keep them in sync.** The difficulty-select screen is canvas-rendered on desktop (`renderSelect` + `SELECT_TOGGLE`, positioned by `layoutSelect()` which is recomputed from `sizeCanvas`; `SELECT_CARDS`/`SELECT_TOGGLE`/`SELECT_TITLE_Y`/`SELECT_SUB_Y`/`SELECT_BACK_Y` are `let`s) **but on mobile it is a DOM overlay** (`#mob-select`, shown by `updateMobOverlays`), NOT the canvas. So the toggle exists twice: the canvas `SELECT_TOGGLE` (desktop, click `seg1`/`seg2` or press `R`) and a DOM mirror `#mob-order` (mobile — `.mob-order-seg` SEQUENTIAL/RANDOM buttons, `syncMobOrder()` keeps the `.active` class in sync). Both just flip the same module-level `randomOrder` flag. The original mobile bug was that the toggle was only ever drawn on the canvas, which is `visibility:hidden` behind the mobile overlay — so it never showed on phones until the `#mob-order` DOM control was added. When changing the toggle, update **both** paths.
- **Mobile on-screen keyboard** — on touch devices the OS soft keyboard is no longer used; a custom DOM keyboard (`#mob-kbd`) is built and wired in JS (`buildMobKeyboard` / `kbdPress`). QWERTY layout, **no spacebar** (romaji never needs one). The four letters that never appear in any romaji — `l`, `q`, `v`, `x` (`KBD_DISABLED`) — are shown but grayed/disabled. A `⌫` backspace (→ `deleteOneFromBuf`) and a wide `CLEAR` (wipes `inputBuf`) sit below the letters. Keys fire on `pointerdown` (a key tap also skips the level-start intro, mirroring the canvas tap). It's only `.show`n while `gState==='playing'` (hidden behind menu/select/help overlays). Styling reuses the overlay theme CSS vars (`--kj-*`) so it follows day/night. `sizeCanvas` reserves a fixed bottom band via `--kbd-h` (≈40% of viewport, clamped 190–280px) and sizes the canvas to `innerHeight − 44 − kbdH`; the legacy hidden `#ki` input and `focusMobileInput()` are kept but `focusMobileInput` is now a no-op (blurs `#ki`) so the OS keyboard never opens.

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
  (on, char, count, charge); // charge = current clean-hit streak (0..FIND_CHARGE_REQUIRED)
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
- **Mobile support** — DONE: custom on-screen keyboard + touch input shipped (see "Mobile on-screen keyboard" in Confirmed MVP Features). Remaining polish (landscape layout, haptics) still open.
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

# Exquisite Corpse Project Context

Project guidance for working on this codebase. Read this before making changes.

## What this is

**Specimen Lab** is a Rummikub-style card game with an _Exquisite Corpse_ twist: players
collect monster parts (skull, claw, foot) and assemble them into complete monsters. It is a
single self-contained HTML file using `<canvas>` for the board — no build step, no
dependencies, no framework.

- **Entry point:** `exquisite-corpse-rummy.html` (open directly in a browser to run).
- **Status:** working prototype. Core loop, building, stealing, dig-deeper graveyard,
  last-turn trigger, and scoring are implemented. Placeholder art; basic AI.

## Running it

It is a static file, so just open it in a browser. In VS Code the smoothest loop is the
**Live Server** extension (right-click the HTML → "Open with Live Server") so edits reload
automatically. There is no compile/test/lint step yet.

## Architecture

Everything lives in one file, split into clearly commented sections inside the single
`<script>` block:

1. **Data model & constants** — suits, parts, names, colors, glyphs, deck builder.
2. **Game state** — the global `G` object and `newGame()`.
3. **Rules helpers** — `validateMonster`, `monsterSuit`, `canFormMonsterWith`, etc.
4. **Turn flow** — draw / build / steal / discard / round-end logic.
5. **Simple AI** — `findBestMonster`, `aiTurn`.
6. **Rendering (canvas)** — all `draw*` functions plus `render()`.
7. **Interaction** — canvas pointer events → hit-test against `regions[]`. A tap routes to
   `handleHit`. The action phase is **unified (no build/steal mode)**: tapping a hand card
   `selectHandCard` selects it (`selectedCard`), lighting up its build `stage-slot` and any
   stealable `wild` cells; tapping one of those commits (build or steal). Tapping a wild first
   arms it (`G.stealTarget`) and lights up matching hand cards. Drag still builds. Non-
   actionable hand cards are dimmed (`handCardActionable`); valid targets glow green.
8. **HUD / controls / log** — DOM status bar, buttons, message log.
9. **Setup UI** — seat selection and start/restart wiring.

The board (battlefield, lab, graveyard, hand) is drawn on the canvas. Buttons, status, and
the log are plain DOM elements styled with CSS variables at the top of `<style>`.

### Rendering model

`render()` is the single source of truth for what's on screen. It recomputes canvas height
from the current content, clears, redraws every section, and rebuilds the `regions[]`
array. Each interactive element pushes a hit-rect via `add(x, y, w, h, type, data)`. The
click handler walks `regions` **in reverse** so the topmost (last-drawn) element wins —
this is what makes the graveyard's top card take priority. (The graveyard fans out to the
**right**, each card rotated 90° CCW via `drawCardLandscapeCCW` so its banner stays visible;
the rightmost/newest card is on top and is the free draw, deeper cards expose only their
left banner strip.) Call `render()` after any state change; do not mutate the canvas outside
the `draw*` helpers.

### Sound effects

A tiny `SFX` module (IIFE near the top of the script) plays **subtle synthesized Web Audio
blips** — no asset files. Events: `select`, `place`, `build`, `steal`, `draw`, `discard`,
`invalid`, `win`; fire them with `SFX.play('build')`. Tone params live in `SFX.DEFS` (`freq`
can be a single note or a short arpeggio). **Easy to replace with real audio later**: set
`SFX.files.build = 'sounds/build.mp3'` (a URL string or a preloaded `<audio>` element) and the
file plays instead of the synth for that one event — swap them in one at a time. A `[🔊]`
top-bar button toggles mute (`SFX.setMuted`, persisted in `localStorage` as `sfxMuted`).
Browsers gate audio behind a gesture, so a `document` `pointerdown` calls `SFX.resume()`.

### Card move animations

Cards tween from their old spot to their new one (build → battlefield, hand → slot, steal
swaps, deck/graveyard → hand) with a playful arc + landing pop (`easeOutBack` + a `sin` bow).
Because `render()` is immediate-mode, every draw site records each card's on-screen transform
(`note(card, cx, cy, scale, rot)` → `cardRects[id]`) and **skips drawing any card in the
`flying` set**. A mutation that should animate: (1) captures the moving cards' current
transforms via `snapRect(card)` **before** mutating state, (2) mutates, (3) calls
`commit(specs)` where `specs = [{card, from}]`. `commit` marks them flying, renders once to
record their destinations, then runs an rAF loop (`animStep`) that re-renders the board
(flying cards hidden) and draws each card in-flight on top via `drawFlyingCard`. Input is
locked while `anims.length` (pointerdown bails); `render()` skips `updateHUD()` while
`animating`. `prefers-reduced-motion` (and any missing from/to) falls straight through to a
plain `render()`. `labRect` is the draw source for the LAB deck. AI builds are **not**
animated (the AI hand has no per-card rects). Hooked in: `drawFromLab`, `drawFromGraveyard`,
`placeInStage` (hand→slot, or all staged→battlefield when it builds), `doSteal`.

## Data model

```js
card    = { id, suit, part, name, owner }   // owner = player index, or null in deck/graveyard
monster = { id, owner, cards: [...] }        // cards ordered skull, claws..., foot
```

`G` (global game state):

```js
G = {
  players: [{ name, type: "human" | "cpu", hand: [card] }],
  monsters: [monster],
  lab: [card], // draw pile; top = last element
  graveyard: [card], // discard pile; top = last element
  current, // index of player whose turn it is
  phase: "draw" | "action" | "discard", // no build/steal sub-mode — the action phase is unified
  stage: { skull, claws: [card], foot }, // cards placed into the assembly slots
  stealTarget, // { monsterId, cardIdx } of an armed wild (steal); also `selectedCard` (module var) = armed hand card
  builtThisTurnIds: Set,
  mustUseIds: Set, // dug cards that MUST be built this turn
  drewThisTurn,
  lastTurn,
  lastTurnRemaining,
  roundOver,
  log,
};
```

## Game rules (the domain logic)

- **Setup:** 2–6 players, 10 cards each. Remaining deck is the face-down **LAB**. One card
  flipped to start the **graveyard**.
- **Turn:** Draw → Action (build &/or steal, freely interleaved) → Discard. There is **no
  build/steal mode toggle** — the action phase is unified: clicking a hand card highlights
  both the build slot it fits and any wilds it can steal, and the next click commits.
- **Draw:** take the top LAB card, the top graveyard card (free), or dig deeper in the
  graveyard. Digging is only legal if that card can complete a monster this turn
  (`canFormMonsterWith`), and you must sweep every card above it into your hand. The dug
  card is recorded in `mustUseIds` and the turn cannot end until it is built.
- **Build:** a monster is exactly **one skull + one foot + any number of claws**, all
  sharing one suit. The `wild` suit substitutes for any suit. Build as many as you like.
  Building uses **labeled slots** (`G.stage` = `{skull, claws:[], foot}`): the on-canvas
  Assembly row (always shown during the action phase) has a **HEAD** slot, one **BODY** slot
  per claw plus one always-open BODY slot, and a **FOOT** slot — portrait cards in the same
  orientation as the hand. To build: **click** a hand card (`selectHandCard`) → its matching
  slot lights up → **click that slot** (`stage-slot` region → `placeInStage`); or **drag** the
  card onto the row (auto-routes by part). A second skull/foot is rejected. When a head **and**
  a foot are both staged the monster **auto-builds** (`tryStageBuild`) — add claws first. Suit
  clash blocks with a warning. Click a staged card (or "Clear staging") to return it.
- **Steal:** swap a real card (matching the monster's suit and the wild's part) into another
  monster, taking the displaced wild. **Bidirectional and toggle-free**: click a hand card →
  the wilds it can replace light up (`validStealTargets`), then click one; OR click a wild →
  it arms (`attemptSteal` sets `G.stealTarget`) and your matching hand cards light up, then
  click one. Always an explicit two-click (no auto-complete). Clicking the armed thing again
  cancels; clicking a different card/wild re-targets. The swap is `doSteal(card, monsterId,
cardIdx)`, gated by the side-effect-free predicate `canStealWith`. The same `selectedCard`
  that drives building also drives card-first stealing — one selection lights up both its
  build slot and its stealable wilds, and whichever target you click decides the action.
- **Discard:** send one card to the graveyard to end the turn. An empty hand may end the
  turn without discarding.
- **Round end:** emptying your hand triggers the **last turn**; every other player gets one
  more turn. Score = **+1 per card you played into a monster, −1 per card left in hand**.
  Discarded cards are neutral.

## Where to find things (code map)

| Task                            | Look at                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Deck size / wild frequency      | `COPIES_COLORED`, `COPIES_WILD`, `buildDeck()`                                                         |
| Suit/part names, colors, glyphs | `SUITS`, `NAMES`, `SUIT_COLOR`, `SUIT_GLYPH`, `PART_GLYPH`                                             |
| Is a monster legal?             | `validateMonster()`, `monsterSuit()`                                                                   |
| Dig-deeper legality             | `canFormMonsterWith()` + `drawFromGraveyard()`                                                         |
| Building                        | click/drag → `placeInStage()` → `tryStageBuild()` (human), `findBestMonster()` (AI)                    |
| Click-to-select / highlight     | `selectHandCard()`, `selectedCard`, `handCardActionable()`                                             |
| Drag-and-drop / slots           | `pointerdown/move/up`, `dragState`, `stageLayout()`, `drawStage()`, `stageZoneRect`                    |
| Stealing                        | `canStealWith()` / `validStealTargets()` → `doSteal()`; `attemptSteal()` arms a wild (`G.stealTarget`) |
| Turn advance / last turn        | `finalizeTurn()`                                                                                       |
| Scoring                         | `endRound()`                                                                                           |
| AI behavior                     | `aiTurn()`                                                                                             |
| Card visuals / connectors       | `drawCard()`, `drawPartArt()`                                                                          |
| Card move animations            | `commit()`, `animStep()`, `note()`/`snapRect()`, `cardRects`, `flying`, `drawFlyingCard()`             |
| Sound effects                   | `SFX` module — `SFX.play(name)`, `SFX.DEFS` (tones), `SFX.files` (file override), mute `[🔊]`          |
| Click/drag routing              | canvas `pointerdown/move/up` + `handleHit()`                                                           |

## Conventions & constraints

- **Ask clarifying questions before coding.** For any non-trivial change to this game,
  surface clarifying questions and get answers before writing code. (Standing requirement —
  the user should not have to ask for this each time.)
- **Vanilla JS only.** Keep it a single dependency-free file unless there's a strong reason
  to split it. If splitting, extract `<script>` into `game.js` and `<style>` into
  `style.css` and link them.
- **Always re-`render()` after state changes** rather than patching the canvas directly.
- **Colors come from CSS variables** (`:root`) for DOM, and from `SUIT_COLOR` for canvas.
- Wrap AI turns in try/catch (already done in `startTurn`) so a logic bug can't freeze the
  game.
- No persistent storage is used. (As a local file in a browser, `localStorage` would work
  if you later want to save settings — it was only avoided for the original artifact host.)

## Adding real artwork

### Full-card art (current, hand-off friendly)

Each card can be a **single full-bleed image** — the whole card is the artist's art, with the
card name and any symbols baked into the picture (no game-drawn banner). Cards render at
**standard trading-card proportions** (`CARD_W=164, CARD_H=230` ≈ 2.5:3.5); artists design at
**750×1050px**. Authoring needs **no code edits**:

- Drop `cards/suit_part_name.png` into the `cards/` folder (e.g. `bug_skull_horned.png`;
  `_xN` before the extension sets copies) and list the filename in `cards/cards.txt`
  (one per line, `#` comments). `cards/README.txt` is the full guide for collaborators.
- `loadCardArt()` fetches the manifest, parses `suit_part_name[_xN]` from each filename, and
  loads each image into `CARD_ART['suit_part_name']`. `part` must be skull/claw/foot.
- `drawCard()` checks `hasArt(card)`: if an image is loaded it draws it full-bleed (rounded
  clip) and skips the placeholder/banner entirely; selection/steal/dim outlines still draw on
  top (interaction state, not card content). A name matching an existing card **re-skins** it;
  a new name **adds** a card via `buildDeck()` folding in `ART_ENTRIES`.
- `PLACEHOLDER_DECK = true` (top of script) keeps the original generated deck so un-arted
  cards keep placeholder faces and art can replace them one at a time; set it to `false` to
  build the deck only from `cards.txt`. The game must be served over http (the manifest fetch
  fails on `file://`). Note: full-card art monsters just stack (no spine band) — continuity is
  the artist's call.

### Legacy part-slot hook

`PART_IMAGES['skull_horned'] = img` still fills only the **art slot** of a _placeholder_ card
via `drawPartArt()` (spine band at ~52% height so monsters link). Superseded by `CARD_ART`
for real artwork. `NAMES` holds the per-part names (`insectoid/horned/bloodshot` skulls, etc.).

## Open design decisions (confirm before building on these)

These were judgment calls during the prototype — flag in commit messages if you change them:

1. **Assembly direction** on the battlefield is vertical (skull on top → claws → foot on
   bottom). Each monster card is the normal portrait `drawCard` rotated 90° CW by
   `drawCardLandscape` (banner ends up on the right edge; art + spine rotate with it).
   Hand/lab/graveyard still use upright portrait cards.
2. **Build + Steal are one unified action phase with no mode toggle.** A single click-to-
   select model drives both (a selected hand card lights up its build slot and its stealable
   wilds; click the target to decide). Could be split back into a moded/sequential flow.
3. **One suit circle + one part circle per card.** (The earlier redundant second suit
   circle was removed.) If a card is ever meant to carry two _different_ suits,
   building/matching logic changes significantly.
4. **AI does not steal** and does not dig the graveyard — kept simple for reliability.

## Suggested roadmap / TODO

- [ ] Replace placeholder art via `PART_IMAGES`; finalize the connecting-edge alignment.
- [ ] Add AI stealing and smarter discard/draw evaluation.
- [ ] Pass-and-play polish for all-human tables (a "hand off the device" interstitial so a
      player's hand isn't revealed to the next).
- [ ] Multi-round match play with a target score.
- [ ] Touch/mobile hit-testing pass (clicks already scale; verify tap targets).
- [ ] Optional: split into `index.html` + `game.js` + `style.css` once the file grows.
- [ ] Decide and lock the open design questions above.

# Inklings — project context

A word-collecting adventure game for the browser, built on HTML canvas. Inspired by the
day-to-day rhythm of Stardew Valley, but built around a different core mechanic: instead of
growing crops, you hunt **letter-creatures ("inklings")**, collect the letters they drop, and
spell them into real words at your writing desk. Every valid word is recorded in your library
with its definition. The fantasy is a scholar-adventurer filling a personal dictionary.

This file is the source of truth for the project's design and conventions. When in doubt,
prefer what's written here over generic game-dev defaults.

---

## Core loop

This single loop is the whole game. Everything else is a layer on top of it.

```
Home base (writing desk + library)
      → enter a field screen ("book")
      → hunt letter-creatures, attack to make them drop a letter
      → collect letters into your inventory
      → return home (teleport)
      → spell a word at the desk
      → dictionary check
      → valid word saved to the library with its definition
      → back out to hunt more
```

If this loop is fun, the game is fun. New features must serve it, not distract from it.

---

## Aesthetic identity: ink and paper, retro-pixel chrome

The theme is load-bearing — the weapons are writing implements, so the whole world is built
from the vocabulary of writing. The UI now wears a **retro-pixel skin** (matching the pixel theme
of the other games in this project) layered on top of the ink/paper palette. Keep to both.

- **World**: aged graph-paper ground, like exploring the pages of a book.
- **Creatures**: hand-drawn ink-stamp letter glyphs from `Alpha.png` (until distinct creature art is drawn).
- **Desk / library**: a parchment panel; collected words get "stamped" in with their meaning.
- **Palette**: ink `#26233a`, paper `#ece3cf`, parchment `#e3d8bd`, accents gold `#c89b3c`,
  ink-blue `#3b4a7a`, moss `#5b7a4b`, violet `#7a4a9a` (the live CSS `:root` vars). Dark page bg `#15131c`.
- **Retro-pixel chrome**: square corners only (no `border-radius`), chunky 2–3px `--edge` ink borders,
  hard offset drop-shadows (`box-shadow: Npx Npx 0` — no blur), `image-rendering:pixelated` on the
  canvas, stepped (non-eased) animations (`steps()`).
- **Type**: `Press Start 2P` (`--disp`) for display/UI chrome (titles, labels, buttons, letter chips,
  canvas labels) and `VT323` (`--read`) for readable body text (definitions, paragraphs, key hints).
  Press Start 2P is wide and only legible small — use ~7–16px; VT323 needs ~17–19px to read well.

Avoid generic AI-design defaults (cream + terracotta + high-contrast serif). The ink/ledger +
retro-pixel direction is specific to this game — keep it that way.

---

## Naming / vocabulary

Use these terms consistently in code, UI, and writing:

- **Inklings** — the letter-creatures (also the game's name).
- **The desk / writing desk** — the word-building bench at home base.
- **The library** — the collection of words you've spelled (the "dex"). It is currently a list;
  long-term it becomes a walkable room you fill (see roadmap).
- **Field / books** — the screens you travel to and hunt in.
- **Implements** — the weapons (stick, brush, pencil, pen, …).

---

## Key design decisions (and why)

These are settled. Don't reverse them without a real reason.

1. **HTML canvas, not Godot/Unity.** The dev is fluent in canvas and ships canvas games.
   The hard parts of this game are text, data, and the dictionary/library UI — all web-native.
   Switching engines would stack "learn an engine" on top of "design a novel game."

2. **Collect letters by combat now; farming is deferred.** The dev has letter-creature sprites
   but no crop/plant art yet, so acquisition is hunting. Farming/ranching returns later as the
   _renewable supply_ upgrade (keep an inkling on your farm and it produces its letter).

3. **The library is the dex made physical.** The collection and the "decorate a space" fantasy
   are the same feature. MVP renders it as a list; later it becomes a room with shelves. Same
   underlying data, nicer skin — so deferring the room costs nothing.

4. **No home town.** The house/desk is the only hub. Big content saving vs. a Stardew-style
   village; revisit only if the game clearly needs NPC density.

5. **Yoda-Stories-style travel.** A grid of screens; walk off an edge to enter the neighbor.
   Long-term these become genre "books" whose genre weights which letters spawn (a sci-fi book
   is rich in Q/X/Z), giving players a reason to choose one book over another.

6. **Weapons are dual-use.** Each implement is both how you fight _and_ a verb at the desk.
   The punctuation-superhero characters become later weapon upgrades with bench powers:
   - Question Markswoman's **bow** — ranged; dropped creatures yield a "?" wildcard tile.
   - Apostrophantom's **sword** — melee; unlocks contractions/possessives (CANT → CAN'T).
   - Excla Machine's **belt** — "shouts" a word to double its effect at a cost.

7. **Letters are consumed when you spell a word** (`CONSUME_LETTERS = true`). This is what makes
   the hunt→craft loop actually _loop_. The flag exists so the feel can be tested both ways.

8. **Bench is click-to-build, not drag-and-drop.** Drag-and-drop tests the same fun for far more
   effort. Click a tray letter to add, click a bench letter to remove. (May prettify later.)

9. **Self-contained single file.** No build step, no bundled dependencies; drops straight onto
   GitHub Pages. **Exception (intentional):** word validation + definitions call the Free
   Dictionary API (`api.dictionaryapi.dev`) — the same API the punctuators game (`index.js`) uses —
   so the game isn't limited to a baked-in list. There is **no local word list anymore** (the old
   `DICT` was fully removed); with no connection, word-checking can't resolve and the desk reports
   it couldn't reach the dictionary. Keep everything else local; don't add other external fetches
   without a strong reason.

---

## Current file & code map

Current file: `inklings.html`. One self-contained HTML/CSS/JS file. Config lives in clearly-marked
blocks at the top of the `<script>`. The displayed game name is **Inklings** (title, start card,
save file `inklings-save.json`). Fonts: `Press Start 2P` + `VT323` (Google Fonts), declared as the
`--disp` / `--read` CSS vars and also used by the canvas `ctx.font` calls (floats, BENCH label).

- **CONFIG constants** — `TILE`, `COLS/ROWS`, `WORLD_W/H`, `HOME`, speeds, `CONSUME_LETTERS`.
- **`WEAPONS`** — per-implement `dmg` / `range` / `cd` (cooldown) / visual. Tune feel here.
- **`WEAPON_DROPS`** — which field screen hides which implement upgrade.
- **`SPRITESHEET`** — glyph-sheet config (`url`, `cols`/`rows`, `cellW`/`cellH`, `letterToFrame`)
  - loader. Wired to `Alpha.png` (the same hand-drawn sheet Spin Nids uses): a 7×8 grid of 32×32
    cells where a–z = frames 0–25 (A–Z = 26–51, unused here). `drawGlyph(letter,cx,cy,size)` blits one
    cell. `drawCreature` renders the creature **as the glyph itself** — no tile, eyes, or feet — with a
    brief scale-up "pop" while `c.flash>0` (just hit), falling back to dark `fillText` if the sheet
    hasn't loaded or the letter isn't on it. HP pips still draw above the glyph when damaged.
- **Player sprite** (`playerImg` → `Lumberjack_Jack.png`) — **art by Kenmi, purchased on itch.io;
  credit Kenmi (kept in the source comment above the loader)**. Sheet = 6 cols × 10 rows of 64×64
  frames; `PR` maps rows: 0 idle-down, 1 idle-right, 2 idle-up, 3 walk-down, 4 walk-right, 5 walk-up,
  6 fall-right (unused), 7 attack-right, 8 attack-down, 9 attack-up. `drawPlayer` picks the row from
  `p.face` (cardinal) + state (`p.atkAnim>0` attack → `p.moving` walk → idle), advances the frame from
  `p.animT` (idle/walk cycle) or attack progress, and **mirrors the right-facing rows for left**. Drawn
  at `PLAYER_DRAW` (80px, `imageSmoothingEnabled=false`), feet near `p.y`. Weapons are **stats-only**
  now (no drawn implement — the sprite has its own axe); the primitive "scholar" draw remains as a
  fallback until the PNG loads. `doAttack` sets `p.atkAnim=ATTACK_ANIM` to play the attack row.
- **`lookupWord(word)` / `checkWord()`** — word validation + definitions come **entirely** from the
  Free Dictionary API (`api.dictionaryapi.dev`); there is no local word list. `lookupWord` is async
  and returns `{ok:true, def}` for a real word, `{ok:false}` if the API rejects it (incl. 404), or
  `{ok:null}` if the API can't be reached. `checkWord` is async: it short-circuits on too-short /
  already-collected words, shows a "Checking the dictionary…" state, disables the button + guards
  with a `checking` flag against double-submit, aborts silently if the bench changed during the
  await, and only consumes letters / records the word on a confirmed new valid word. The `{ok:null}`
  case keeps the letters and tells the player it couldn't reach the dictionary. Defs are
  HTML-escaped via `esc()` before rendering since they come from an external source.
- **`LETTER_BAG`** — frequency-weighted spawn pool (vowels common, Q/X/Z rare).
- **`SFX`** — a small Web Audio IIFE (no asset files) that synthesizes chiptune blips, matching the
  retro-pixel theme and the single-file/offline rule. `SFX.play(name)` plays a named cue (`swing`,
  `capture`, `newword`, `known`, `invalid`, `unlock`, `home`, `click`); internals are `tone()` (one
  oscillator+gain blip with optional pitch slide) and `seq()` (notes back-to-back). Hooked into:
  attack swing + creature capture (`doAttack`), word results (`checkWord`: new/known/invalid), implement
  unlock (`checkUnlocks`), weapon switch (`cycleWeapon`), teleport (`teleportHome`), desk open
  (`openOverlay`), and UI button taps. Mute state persists in `localStorage["inklings_muted"]` and is
  toggled by `#sound-btn` (🔊/🔇), which lives inside `.hud`. It is **hidden on desktop** (it got in
  the way) and **shown only on touch** (`body.touch`), where it sits in the static HUD top bar.
  Browsers gate audio behind a gesture, so `play()` calls `SFX.resume()` and the Start button resumes
  the context on click.
- **`state`** — `{ player, inv:{letter:count}, dex:{word:{def,found}}, weaponIdx, unlocked, bagCap }`.
  `bagCap` is the **satchel capacity** (max letters carried; starts at 10, designed to be raised later
  by items). `satchelCount()` sums `state.inv`; `satchelFull()` gates capture in `doAttack` (a full
  satchel blocks new captures with a "Satchel full" toast so letters aren't wasted — spell words to
  free space). The HUD shows `N/cap` via `#bag-count` (turns red when full). `bagCap` is saved/loaded
  in the export/import backup.
- **Systems**, in order: screen generation → input → combat → update → render → desk/bench →
  backup (export/import) → main loop.
- **Library layout** (`#overlay`): the panel is a fixed-size flex column so it never resizes/jumps
  as content changes. The two columns (`.cols`) are a `1fr 1fr` grid where **`.cols>div` carries
  `min-width:0`** — this is the load-bearing fix: without it a long collection entry (word +
  `nowrap` definition) expands its grid track past 50%, squeezing the bench column until the
  letter chips overlap and a horizontal scrollbar appears. Bench-word chips are `flex:0 0 auto` so they
  never compress; only `.dex-list` scrolls (`flex:1;min-height:0`). Collection defs are single-line
  ellipsis; `openDefModal()` shows full text in `#defmodal`. Under `max-width:560px` the panel
  switches to a normal scrolling single column.
- **Library keyboard tray** (`renderBench` → `#tray`): the bench input shows a **full QWERTY keyboard**
  (`KB_ROWS`, 3 rows), not just owned letters. Each key shows a corner count badge of how many copies
  are still available to place (owned minus what's already on the bench); a key with **zero available**
  (un-owned, or all copies on the bench) gets `.off` — greyed, `grayscale`, `pointer-events:none`, and
  no `data-l` so it's unclickable. Tray keys use `flex:1 1 0;min-width:0;max-width:40px` so a 10-key
  row always fits the column width (no overflow). While the library is open the **physical keyboard
  also builds words** (handled in the `if(state.overlay)` keydown branch): an `a–z` key adds that
  letter iff a copy is still available (same availability rule as the on-screen keys), `Backspace`
  removes the last bench letter, and `Enter` runs `checkWord()`. (`Esc`/`Tab` still close.)
- **Library close** — the footer "Close" button was replaced by an **`✕` button (`#lib-close`,
  `.close-x`) in the panel's upper-right**, on both desktop and mobile. It's `position:absolute` in the
  `#overlay .book` (which is `position:relative`); on touch the panel can scroll as a whole, so the X is
  `position:fixed` to the corner there. Wired to `closeOverlay()` (same as Esc / clicking outside).

---

## Current state

**Built and working:**

- Home base with a writing desk; 3×3 world of screens; walk-off-edge travel; `H` to teleport home.
- Attack-based combat (no bump-to-collect); creatures are captured in a **single hit**
  (`CREATURE_HP = 1`) and drop their letter. (HP/pip scaffolding remains if multi-hit creatures
  are ever wanted again.) The satchel holds a capped number of letters (`state.bagCap`, starts at 10);
  when full, capture is blocked until you spell words to free space.
- Writing-implement weapons: start with stick; brush/pencil/pen hidden in field screens as
  diegetic upgrades; `1`–`4` to switch among unlocked ones.
- Letter pickups → inventory; renewable (field creatures respawn on re-entry).
- Desk/Library: click-to-build word, async API dictionary check with feedback states (checking /
  new / known / invalid / couldn't-reach-API). **Stable fixed-size panel** (`#overlay .book` is a
  fixed-height flex column; only the collection list scrolls). The **definition appears in one place
  only** — the collection list, truncated to one line with an ellipsis (no horizontal scroll);
  clicking an entry opens a full-text modal (`#defmodal`). The new-word reveal celebrates the word
  but no longer prints a second copy of the definition.
- Backup: export state to JSON, import it back (also the manual cross-device transfer).
- Keyboard on desktop; **on-screen touch controls on mobile** (D-pad bottom-right, action cluster
  bottom-left). See the Controls section + code map for details.
- **Sound effects** — synthesized chiptune blips (`SFX`, Web Audio, no asset files) on attack,
  capture, word results, unlock, and UI actions; mute toggle (`#sound-btn`, 🔊/🔇) persisted to
  `localStorage`.

**Stubbed / not yet done:**

- **Creature glyphs** — creatures render solely as their hand-drawn letter glyph from `Alpha.png`
  (the glyph sheet shared with Spin Nids) — no tile, eyes, or feet. Dedicated per-creature _art_
  (distinct bodies beyond the bare glyph) is still future work.
- **Dictionary** — validation + definitions come entirely from the Free Dictionary API (see code
  map), so any real English word works. No local word list (requires a connection to check words).
- **No autosave** — only manual export/import. IndexedDB autosave is the next persistence step.
- Not started: library room, genre books / procedural layouts, hero weapons, word effects,
  farming/ranching, town/trade.

---

## Controls

**Keyboard (desktop):** Move `WASD` / arrows · Attack `Space` · Switch implement `Q` · Teleport
home `H` · Use bench when near it `E` · Open library `Tab` · Controls/help `?` · Close any panel `Esc`.

**Touch (mobile):** On touch devices a DOM control overlay (`#touch`) appears over the canvas:

- **D-pad** bottom-right (`#dpad`, 4 arrows) — press-and-hold sets the matching `keys["arrow*"]`, so
  it reuses the exact keyboard movement path in `update()`. 4-directional (matches keyboard).
- **Action cluster** bottom-left (`#tact`): a large **ATK** button (hold to keep swinging — `update()`
  calls cooldown-gated `doAttack()` while `attackHeld`; attack uses the facing direction, same as
  Space), plus small **HOME** / **DESK** / **SWAP** / **?** buttons that mirror `H` / `Tab(openOverlay)`
  / `Q` / help.
- Detection: `IS_TOUCH` (`pointer:coarse` || `ontouchstart` || `maxTouchPoints`) adds `body.touch`.
  `syncTouchUI()` (called each frame from `update()`) shows the overlay only while
  `state.started && !overlay && !help` and clears held inputs when hidden, so the pad never sits on
  top of the library/help overlays. The corner `#help-btn` is hidden on touch (the `?` button replaces
  it); the start card swaps its keyboard hint (`.kbd-only`) for a touch hint (`.touch-only`).
- Controls shrink under `@media(max-width:560px)`. The canvas is landscape (720×528).
- **Mobile reflow (`body.touch`)** — on touch devices `#stage` becomes a full-height (`100dvh`) flex
  column so the controls live in the black bands, never over the map: the **HUD becomes a static top
  bar** (`order:-1`; the `#sound-btn` was moved into `.hud` so it flows inline there), the **`#touch`
  bar is static at the bottom** (`order:1`, `#tact` at the left end, `#dpad` at the right end), and the
  **canvas is centered between them** (`justify-content:space-between`; `max-height:calc(100dvh - 230px)`
  with `width/height:auto` to preserve aspect and reserve room for both bars). Desktop is unchanged
  (HUD/controls stay absolute). When `#touch` isn't `.live` it's removed from the column (behind an
  overlay), which is fine because an overlay is covering the screen then.

---

## Roadmap (build order from here)

1. **Wire the spritesheet** — DONE: creatures draw their letter from `Alpha.png` via `SPRITESHEET`
   - `drawGlyph` (a–z = frames 0–25). Next sprite step is real per-creature _body_ art, not just glyphs.
2. **Dictionary** — DONE (via API): word validation + definitions come from the Free Dictionary API,
   so any real English word works (`exit`, `quartz`, etc. now validate). No local word list. Optional
   future polish: bundle a local wordlist/definitions JSON for an offline fallback, and/or cache API
   results in `localStorage`.
3. **IndexedDB autosave** — persist `state` per-origin; call `navigator.storage.persist()`;
   namespace the DB (`inklings_save`) so it won't collide with other games on the same Pages
   origin. Keep export/import as the backup/transfer path. (IndexedDB is per-browser/device;
   true cross-device sync would need a backend — out of scope.)
4. **Library room** — render the dex as a walkable room with shelves. Organize words into
   sets/shelves (by length, by source book, by theme) so there are achievable sub-goals instead
   of one impossible "collect everything." Same data as the current list.
5. **Genre books + procedural layouts** — multiple book types with distinct tilesets and
   genre-weighted letter pools. Start with simple random scatter / room-and-corridor generation;
   do **not** build a clever dungeon generator first (classic time sink).
6. **Hero weapons** — convert the punctuation superheroes into implement upgrades with their
   dual-use bench powers (bow/wildcard, sword/contractions, belt/shout).
7. **Word effects ("spellbook")** — tag a few hundred words so spelling them does something
   (RAIN waters, SUN speeds growth). Most words stay plain tradeable goods.
8. **Farming / ranching** — renewable letters from ranched inklings; the deferred cozy layer.
9. **Town / trade** — towns that want specific words; bundle-style requests as content gates.
10. **Limit the starting letters** - start with only lowercase letters and the more common letters (not all).
    Eventually add capital letters which are stronger and they can be used to make proper nouns
    (Ex. City names to help with geography)

---

## Conventions for working on this project

- Keep the game a single self-contained file with no external runtime dependencies, unless a
  feature truly requires one (say so and why). Current intentional exception: the Free Dictionary
  API for word validation/definitions (no local fallback word list).
- Protect the MVP loop. New systems are layers on the working core, shipped one at a time, each
  independently testable.
- Maintain the ink-and-paper identity and the vocabulary above.
- Prefer the simplest thing that proves the fun (e.g. random scatter before procedural gen,
  list before library room, click before drag).
- Spend polish budget on the **word-collection moment** — the definition reveal is the emotional
  core; that half-second should always feel good.

---

## Open questions

- **Spritesheet mapping.** RESOLVED for `Alpha.png`: it's a glyph sheet, not creature art — 7×8
  = 56 cells holding a–z (frames 0–25), A–Z (26–51), and a few punctuation glyphs (e.g. `!` at 54).
  We map a–z → 0–25 in `SPRITESHEET.letterToFrame`. Open question reframed: if dedicated creature
  _body_ art (multiple frames or alternate forms per letter) is ever added, it would be a separate
  sheet with its own `letterToFrame`/frame-animation scheme.
