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
- **Japanese sound-effect bursts (擬音語 onomatopoeia) — learning-first** — every destroy pops a
  manga-style katakana SFX over the rubble, AND parks the meaning in a **centered readable banner** so
  the player actually absorbs real onomatopoeia while smashing. Data lives in `SFX_IMPACT` (four tiers:
  `cell` / `floor` / `building` / `blast`), each an array of `{jp, romaji, en}`. `addSfxBurst(entry, x,
  y, sz, col)` does two things: (1) pushes a **kana-only** float that rises off the rubble as spectacle
  (`pop` = a brief spawn scale-up drawn in `drawFloats`), and (2) refreshes `sfxBanner` — a single
  centered card (`drawSfxBanner`, upper-middle at `SFX_BANNER_Y` behind a dark panel) that holds the
  big katakana + `romaji — meaning` for `SFX_BANNER_MS` (~2.6s, quick fade-in / ½s fade-out), newest
  SFX wins. The banner exists because the original rising subtitle was too small/fast to read. Tiers
  are wired to the size of the moment: **per-cell** bursts fire from `doHit`
  (**char modes only** — word/SFX cells already float their own meaning) and are throttled by a frame
  cooldown (`sfxBurstCd` / `SFX_BURST_COOLDOWN`, decremented in `update`, reset in `initGame`) so rapid
  typing can't stack a wall of text; **floor** bursts fire from `collapseDestroyedFloors` (also char-only,
  gated with the existing `FLOOR!` callout since word cells are one-per-floor); **building** bursts fire
  from `checkCollapsed` and **blast** bursts from `doFindBurst` — both in **all modes**, ignoring the
  cooldown (big enough moments). Colors: `SFX_COL` (amber, small) / `SFX_COL_BIG` (orange-red, big).
  The banner-set is factored into `setSfxBanner(entry, col)` (called by `addSfxBurst`); in **SOUND FX
  mode** `doHit` also calls it directly on a correct hit with the just-typed word `{jp:cell.char,
  romaji, en}`, so the onomatopoeia you smashed lands on the same centered card with its meaning.
- **SFX difficulty mode (`sfx`)** — a fifth `MODES` entry using the words-shape (`isWords:true`,
  `words: SFX_WORDS`). `SFX_WORDS` is a broad onomatopoeia lesson (~24 katakana entries across
  weather / fire·water / animals / feelings / texture / light·motion, same `{jp, romaji, en}` shape as
  `N5_WORDS`), so it reuses `makeWordBuildings` with zero engine changes — smash the sound-word, its
  English floats up. Katakana is authentic for giongo and doubles as katakana reading practice. Adding
  the 5th card meant the **desktop select layout** stopped being fixed-height: `layoutSelect`'s desktop
  branch now packs card height between the toggle and the back hint (`cardH` clamped 56–80, `gap` 10) so
  the list scales with mode count — 4 modes ≈ 80px w/ descriptions, 5 ≈ 65px still tall enough to keep
  them. Mobile was already adaptive. `renderSelect` already scales card text to `card.h`.
- **Mobile on-screen keyboard** — on touch devices the OS soft keyboard is no longer used; a custom DOM keyboard (`#mob-kbd`) is built and wired in JS (`buildMobKeyboard` / `kbdPress`). QWERTY layout, **no spacebar** (romaji never needs one). The four letters that never appear in any romaji — `l`, `q`, `v`, `x` (`KBD_DISABLED`) — are shown but grayed/disabled. A `⌫` backspace (→ `deleteOneFromBuf`) and a wide `CLEAR` (wipes `inputBuf`) sit below the letters. Keys fire on `pointerdown` (a key tap also skips the level-start intro, mirroring the canvas tap). It's only `.show`n while `gState==='playing'` (hidden behind menu/select/help overlays). Styling reuses the overlay theme CSS vars (`--kj-*`) so it follows day/night. `sizeCanvas` reserves a fixed bottom band via `--kbd-h` (≈40% of viewport, clamped 190–280px) and sizes the canvas to `innerHeight − 44 − kbdH`; the legacy hidden `#ki` input and `focusMobileInput()` are kept but `focusMobileInput` is now a no-op (blurs `#ki`) so the OS keyboard never opens.
- **VoiceFX — speak the onomatopoeia to smash it (SOUND FX mode)** — an **alt input in the `sfx` mode**:
  type OR speak the glowing target. Offline, speaker-enrolled **MFCC + DTW** template matching (no server,
  no speech-to-text) ported from the `kaimoju-mic-test.html` probe into one **IIFE-wrapped `VoiceFX`
  module** (encapsulated like `TraceMode`; `VOICE_FX_ENABLED` flag). A **🎙 top-bar toggle** (sfx only) +
  the **`v` key** turn the mic on; first-ever enable runs a **guided calibration overlay** (auto voice-gate
  from room tone + enroll a curated starter handful `gorogoro/wanwan/pikapika/dokidoki/zaazaa`), and every
  other word enrolls **silently** the first time you say it in play (take stored, cell **not** smashed — you
  type it that time — then voice-matchable once 2 takes are banked). A confident match funnels into the
  normal `doHit`; a 700 ms cooldown stops one utterance destroying several cells; misses are **forgiving**.
  `isSecureContext`-guarded (needs https/localhost). Full detail + design rationale in the "Voice / mic
  onomatopoeia detection" bullet under Tentative Future Features.

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
**`floats[]`** — floating score/status text. Base fields `{txt, x, y, vx, vy, life, maxLife, col, sz}`;
onomatopoeia rubble pops (`addSfxBurst`) add an optional `pop` (spawn scale-up counter, decremented per
frame, rendered in `drawFloats`). The SFX *meaning* is not a float — it lives in `sfxBanner`
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

- **Voice / mic onomatopoeia detection — PROOF-OF-CONCEPT BUILT 2026-08-04 (standalone, NOT yet in
  `kaimoju.html`).** Goal: let the player **speak** a SOUND-FX onomatopoeia to trigger an in-game action.
  Three approaches were evaluated in throwaway probe files; the third won:
  1. **Acoustic pattern only** (loudness + rhythm + pitch contour, Web-Audio analyser) — *rejected as
     insufficient alone.* It reliably reads the **shape** (e.g. ドキドキ = a two-beat amplitude pulse) but
     **cannot tell which word** — pika-pika / kira-kira / doki-doki are all 2-beat, so any same-rhythm
     utterance ("na-na") triggers the same. Good for spectacle, useless for "did you say *this* sound."
  2. **Web Speech ASR** (`webkitSpeechRecognition`) — *rejected.* Online-only (streams audio to Google),
     needs a **secure context** (`localhost`/https) + internet, is Chrome/Edge-only, and **mis-hears
     non-lexical onomatopoeia** (doki-doki → "donkey"). A throwaway probe (`onomatopoeia-game.html`) was
     hardened with a secure-context guard, flip-flop kill-switch, real error messages, and an EN/JA
     toggle, then deemed a dead end and **deleted** — do not resurrect this path.
  3. **Local template matching (MFCC + DTW, speaker-enrolled)** — ✅ **the chosen approach**, offline /
     vanilla, no server. `kaimoju-mic-test.html` records the mic (Web Audio, with Pitch Bird's capture
     fixes: module-scoped source so Chrome can't GC it to zeros, context sample-rate matched to the mic,
     silent-gain sink), segments each utterance (RMS voice-gate), turns it into a sequence of **MFCC**
     frames (mel filterbank → log → DCT — a timbre-over-time fingerprint of the actual phonetics), and
     matches it against templates **the player records in their own voice** (`localStorage`
     `kaimoju.voiceTemplates.v1`) via **DTW** distance (which absorbs tempo differences). Because it keys
     on phonetic content, it *does* separate pika/doki/zaa/wan/gao. **Result: all 5 test words matched
     ≥85%** for the enrolling speaker. Tunable match-threshold + voice-gate sliders.
  - **Key properties / limits:** speaker-dependent (enroll your own voice first — most accurate as a
    personal PoC, worse cross-speaker); needs an **acoustically-distinct vocabulary** (confusable pairs
    are the failure mode → curate the word list); needs a **secure context** (`localhost`) for mic access.
  - **Probe file (standalone, drop-in, not linked from the game):** `kaimoju-mic-test.html` — the winning
    template-matcher. (The rejected ASR probe `onomatopoeia-game.html` was deleted.)
  - **GRADUATION — BUILT INTO `kaimoju.html` 2026-08-04** as the `VoiceFX` module (IIFE-wrapped +
    encapsulated like `TraceMode`; kill by setting `VOICE_FX_ENABLED=false` or deleting the block + its
    `// VoiceFX:` call sites). Voice is an **alt input inside the existing `sfx` mode** — type OR speak the
    glowing target; the typed path is untouched. Controls: a **🎙 top-bar toggle** (sfx mode only, drawn by
    `drawMicButton`, left of the theme button) + the **`v` key** (`v` is never a valid romaji char). Only
    the standalone `kaimoju-mic-test.html` probe still exists separately; the game does not link it.
    - **Matcher = discriminative verify-the-active-target**: the finished utterance is scored (min **DTW**
      distance) against the active cell's word templates *and* against every other enrolled word. It only
      funnels into the **same `doHit` path** as a correct type (destroy/punch/SFX-meaning-banner/combo++)
      when the target both clears an **absolute** ceiling (`< MATCH_TH`, 50) **and wins by a margin**
      (`dTarget ≤ dOther × REJECT_RATIO`, 0.80 — i.e. ≥20% closer than the best *other* word). The margin is
      the key fix: a pure absolute "close enough" threshold accepted almost any utterance (the reported
      "say anything and it destroys" bug); requiring the target to out-score its rivals gives real rejection
      power. Under `?dev=1` the target-vs-best-other distances print to the console for tuning. An
      **`ACT_COOLDOWN` (700 ms) anti-cascade gate** in `onUtterance` means one utterance (or a burst chopped
      by the VAD) can only ever trigger a single voice action — fixes the "spoke once, destroyed a bunch at
      once" bug. **Store is `kaimoju.voiceFX.v2`** — the key was bumped from `v1` because the old
      trust-and-smash path saved a template on *every* utterance, polluting v1 so it matched anything;
      bumping discards those and forces one clean recalibration. **Classify-any-on-screen** left open as a
      future toggle.
    - **All 24 `SFX_WORDS` voice-able, calibrated LAZILY.** First enable ever → a **guided calibration
      overlay** (canvas, pauses the game, eats taps/keys): (a) ~1.2 s of room tone auto-sets the RMS voice
      gate (Yousician-style "find your baseline"); (b) enroll the curated **starter handful**
      `gorogoro / wanwan / pikapika / dokidoki / zaazaa`, `MIN_TAKES` (2) takes each. Every other word
      enrolls **silently on first say in play**: a word with `< MIN_TAKES` stored takes is *learn-only* —
      the utterance is **stored but does NOT smash** (there's no template to verify it against yet, so
      auto-smashing would fire on any stray noise). The player **types** it that time; once `MIN_TAKES`
      takes are banked the word becomes voice-matchable and later says are verified against them. (This
      replaced the original *trust-and-smash* behavior, which destroyed un-enrolled targets on any sound —
      the reported "too sensitive" bug.) Store = `localStorage["kaimoju.voiceFX.v2"]` =
      `{gate, calibrated, templates:{romaji:[…]}}` (own key/schema — NOT the probe's `kaimoju.voiceTemplates.v1`;
      **v2** bump discards the polluted v1 store from the old trust-and-smash path and forces a clean recalibration).
    - **Forgiving misses:** a non-match does nothing (combo holds, retry freely, no HP); closest DTW distance
      shown only under `?dev=1`.
    - **Mic capture** carries the probe's Pitch-Bird hardening (module-scoped source, mic-matched context
      rate, silent-gain sink) in its **own AudioContext**; `isSecureContext`-guarded and gesture-gated
      (toggle is a click/keypress); denied/insecure → a visible `addFloat` message, stays typing-only (GH
      Pages https works, `file://` gets no mic). Mobile: the calibration overlay is on-canvas (visible during
      play), and `#mob-kbd` hides while it's open.
    - **v1 uses always-listening VAD** (proven in the probe). Push-to-talk is still the recommended
      follow-up (voice runs alongside typing, so always-on VAD *can* phantom-fire) but is **deferred** — a
      confident wrong-word match would need to be phonetically close to the target template, which is
      unlikely, and misses are free. **Public surface:** `{isSupported, isOn, toggle, off, overlayActive,
      handleEsc, pointer, render}`.
- **Kotodama Caster (擬音語 side game — proposed, not built)** — a *separate but related* game where the
  player **speaks sound-effects to affect the world**, themed on 言霊 *kotodama* ("word-spirit": spoken
  words carry power). Each onomatopoeia is a "spell": ゴロゴロ summons thunder, ザーザー rain, メラメラ
  fire, ピューピュー wind, キラキラ makes things sparkle — a zen sandbox or element-combining puzzle
  (rain + fire = steam). Could reuse the **local MFCC+DTW template-matching** tech proven by the Kaimoju
  mic probe above (speaker-enrolled, offline) instead of raw acoustic-feature detection — a spell fires
  when the spoken utterance matches its enrolled template. Would live as its own single HTML file. Related sibling concepts discussed:
  a voice-fed creature/Tamagotchi, onomatopoeia karaoke (match a word's loudness/duration/pitch
  envelope — the most detection-honest), voice cooking (じゅうじゅう sear → ぐつぐつ simmer → サクサク
  crisp), and a reduplication rhythm/beatbox mode (ties into the Mujicians Beat Lab).
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

