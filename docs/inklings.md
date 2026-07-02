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
- **`lookupWord(word)` / `checkWord()`** — word validation + definitions + **part(s) of speech** come
  **entirely** from the Free Dictionary API (`api.dictionaryapi.dev`); there is no local word list.
  `lookupWord` is async and returns `{ok:true, def, pos}` (`pos` = unique `partOfSpeech` list across all
  entries/meanings) for a real word, `{ok:false}` if the API rejects it (incl. 404), or `{ok:null}` if
  the API can't be reached. `checkWord` is async: shows a "Checking the dictionary…" state, disables the
  button + guards with a `checking` flag, aborts silently if the bench changed during the await, and
  on `{ok:null}` keeps the letters + reports it couldn't reach the dictionary. **Rewards (step 7) are
  repeatable:** it always consumes the bench letters on a successful spell and pays out by POS — nouns
  add `ink`, adjectives brew a random potion (both if the word is both). New words also record to the
  dex (`{def, found, pos}`) and run letter/weapon unlocks; a known word caches its `pos` so re-spells
  skip the network. A known word that's neither noun nor adjective short-circuits with letters returned
  (no point re-spelling it). Defs are HTML-escaped via `esc()`.
- **Letter spawn pool** — `FREQ` (per-letter weights, vowels common, j/k/x/q/z rare) + `TIER`
  (common/mid/rare/legend) drive `weightedLetter(rng, dist)`, which also pushes rare/legend letters
  farther from home (`dist` = `|sx|+|sy|`). (The old `LETTER_BAG` const is gone.)
- **Letter unlock progression** (`unlockedLetters()`): you start with only the 8 commonest letters
  (`START_LETTERS = "etaoinsr"`); the other 18 appear in the wild **one at a time, in frequency
  order** (`UNLOCK_ORDER = "hdlucmwfgypbvkjxqz"`) as your collection grows, gated by word-count
  milestones (`UNLOCK_AT` — a slow/grindy curve; j/k/x/q/z aren't reachable until ~90–120 words).
  It's **derived purely from `wordsCollected()` (= `Object.keys(state.dex).length`)**, so nothing
  extra is saved. `weightedLetter` filters its pool to `unlockedLetters()`, so locked letters never
  spawn (and thus can't be collected or spelled yet). On a new word, `checkWord` diffs the unlocked
  set before/after and toasts (`"New letter now roams the wild: …"` + `SFX.play("unlock")`) when a
  threshold is crossed. Letters a player already owns in `state.inv` from before stay usable on the
  bench regardless. (Capitals are still not in the game — roadmap #10; the world is lowercase-only.)
- **No respawn (Wordle-style daily map)** — creatures do **not** respawn within a day. Capturing one
  adds its stable id (`"sx,sy,i"`) to `state.captured`; `genScreen` skips any creature already in that
  set, so a taken creature stays gone until tomorrow. To get more letters you wait for the next day's
  map. `makeCreature(rng, dist, tiles)` is called for every index (to keep RNG/positions stable) but
  only pushed if not yet captured. **All-cleared notice:** `dayTotalCreatures()` sums the day's
  per-screen creature counts across the whole map (replaying each screen's first `rng()` draw, the
  same one `genScreen` uses — no need to visit them), memoized per day. `dayCleared()` = `captured.size
  >= dayTotalCreatures()`. When cleared, `render()` draws a **persistent** bottom-centre banner
  (`drawClearedBanner`, "ALL CREATURES CAPTURED! / Come back tomorrow…") that stays on screen all day —
  it does **not** fade like a toast. `maybeNotifyCleared()` only plays the one-time `unlock` chime
  (guarded by `_clearedDay`); it's called from `doAttack` (clearing the last one) and each frame in
  `update()` while started (so loading into an already-cleared day still chimes once).
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
- **`state`** — `{ player, inv:{letter:count}, dex:{word:{def,found,pos}}, weaponIdx, unlocked, bagCap,
  ink, potions:{size,speed,reveal}, buffs:{size,speed,reveal} }`. `ink` (noun currency) + `potions`
  (brewed-but-undrunk counts) persist across days; `buffs` (seconds remaining on a drunk potion) are
  session-only. `updateRewardHud()` renders the `#ink-count` + the `#potions` buttons (disabled when
  you have none or while that buff is active); `drinkPotion(t)` spends a potion and starts a
  `POTION_DUR` buff; `drawBuffs()` paints the active-buff timer bars top-centre on the canvas.
  `bagCap` is the **satchel capacity** (max letters carried; starts at 10, designed to be raised later
  by items). `satchelCount()` sums `state.inv`; `satchelFull()` gates capture in `doAttack` (a full
  satchel blocks new captures with a "Satchel full" toast so letters aren't wasted — spell words to
  free space). The HUD shows `N/cap` via `#bag-count` (turns red when full). `bagCap` is saved/loaded
  in the export/import backup, and is raised by buying the **Stall**'s repeatable +1 satchel upgrade
  with `ink` (a separate shop building on the home screen — see Word effects).
- **Systems**, in order: screen generation → input → combat → update → render → desk/bench →
  backup (export/import) → main loop.
- **Bounded daily map (Wordle-style)** — the world is a fixed grid of screens sized by `MAP_RADIUS`
  (currently **1 → 3×3**, `sx,sy ∈ [-1,1]`; bump to 2 for 5×5, etc.), home `(0,0)` at centre,
  regenerated fresh each **real calendar day**. `todayStr()`
  (local Y-M-D) + `dayHash()` give `state.daySeed`, which is XOR'd into every `genScreen`/`genTiles` RNG
  so the whole map (terrain + creatures) is deterministic for the date, identical all day, and new
  tomorrow. `update()` checks `state.day !== todayStr()` each frame and calls `startNewDay()` on
  rollover (empties satchel, clears `captured`/`visited`/`screens`, wakes home, toasts). Movement at the
  outermost screens treats the world edge as a **hard wall** (clamp instead of `goScreen`); `goScreen`
  is only called when the neighbour is in-bounds. `drawEdgeHints` only draws an arrow for directions you
  can actually leave. The **map is never saved** — it's rederived from the date. `(0,0)` is home.
- **Tile terrain + collision** — each screen has a `tiles[TROWS][TCOLS]` map on a **24px grid**
  (`TS=24`, `TCOLS=30 × TROWS=22`, separate from the 48px gameplay `TILE`). Four pixel-art types:
  `T_GRASS`/`T_PATH` are walkable, `T_WATER`/`T_ROCK` block movement (`walkType()`). `genTiles(sx,sy,isBase)`
  (own seeded RNG `hash2 ^ 0x5a17b3`) fills grass, grows water ponds + rock clusters as random-walk
  `blob()`s (interior only; bigger with `dist`), carves a winding left→right `carvePath()` trail
  (overwriting obstacles so it's always walkable), then **keeps every collidable tile ≥`EDGE_MARGIN`
  (2) tiles from any edge** — `blob()` is confined to the interior and a final pass scrubs any
  water/rock in the 2-tile border band. This guarantees edge arrivals (you land in col/row 0–1) are
  always valid and you can never be boxed in on arrival. A whole side can still be walled behind that
  margin for "blocked-ish" variety. Home `(0,0)` gets no
  ponds/rocks. Movement in `update()` resolves X/Y independently via `canStand(sc,x,y)` (samples a
  ~10px foot footprint against `blockedAt`) so you slide along walls; off-screen counts as unblocked
  so edge transitions still fire. Creatures spawn only on walkable tiles (`makeCreature` retries) and
  bounce off water/rock so none drift somewhere unreachable. On the home screen the **desk and shop stall
  are solid** too: `canStand` rejects the foot box overlapping the `DESK` or `STALL` rect
  (`overlapsSolid(rect,…)`), so you walk up to them instead of through them (still close enough to trigger
  the `E` prompt — `nearShop`/`nearBench`).
- **Desk + stall art** — `drawBench()` and `drawStall()` are drawn in the retro-pixel style: square
  corners, flat fills, chunky 2px ink borders via `pxBox(x,y,w,h,fill)`, hard offset drop-shadows (no
  blur). Desk = wood slab + front panel, parchment sheet, ink pot + quill, `BENCH` label. Stall = wooden
  counter + posts + striped awning + a coin, `SHOP` label. `DESK`/`STALL` collision rects match the drawn
  footprints.
- **Terrain rendering** — `ensureBg(sc)` bakes the static tile map into a per-screen offscreen canvas
  once (`sc.bg`, with `sc.waterTiles` listed); `render()` blits it then draws **animated water ripples**
  live over each water tile (`drawWaterAnim`, sine-sliding light bars = the "wavy" water). `bakeTile`
  draws a flat type color + small pixel motifs (grass blades / path gravel / rock boulder+highlight),
  varied per tile by `tileVar(seed,c,r)` so each block looks a little unique. The old freeform
  `decos` (tufts/pebbles/flowers) and the parchment-grid floor were removed in favor of this. Note:
  `sc.bg` canvases accumulate in the `screens` Map for the session (no eviction yet) — fine for normal
  play, revisit if memory matters on very long runs.
- **Minimap** (`drawMinimap`, drawn last in `render` when `state.started`): a translucent
  explored-area map in the canvas bottom-right. `state.visited` (a `Set` of `"sx,sy"`, added to in
  `curScreen`) drives it; it renders the bounding box of visited screens padded by 1 **and clamped to
  the real map `[-MAP_RADIUS, MAP_RADIUS]`** so it never draws cells outside the bounded map (a black
  square there would wrongly imply you could travel to it). **Visited cells are lit (home `(0,0)` gold,
  others parchment), in-bounds unvisited cells are black** (those are still reachable), and the current
  screen is outlined in ink-red. Cell size auto-scales (5–15px). `visited` is **day-scoped and not
  saved** — it resets each new day (explored-only reveal). The reveal potion instead shows the full
  `[-MAP_RADIUS, MAP_RADIUS]` grid with letter-bearing screens highlighted.
- **Library layout** (`#overlay`): the panel is a fixed-size flex column so it never resizes/jumps
  as content changes. The two columns (`.cols`) are a `1fr 1fr` grid where **`.cols>div` carries
  `min-width:0`** — this is the load-bearing fix: without it a long collection entry (word +
  `nowrap` definition) expands its grid track past 50%, squeezing the bench column until the
  letter chips overlap and a horizontal scrollbar appears. Bench-word chips are `flex:0 0 auto` so they
  never compress; only `.dex-list` scrolls (`flex:1;min-height:0`). Collection defs are single-line
  ellipsis; `openDefModal()` shows full text in `#defmodal`. Under `max-width:560px` the panel
  switches to a normal scrolling single column.
- **Collection A–Z tabs ("books")** (`renderDex` → `#dex-tabs` + `#dex-list`): the collection is
  split into per-letter tabs instead of one long list. `renderDex` groups `state.dex` words by first
  letter and **only renders a tab for letters you actually own a word for** (no empty A–Z row). Each
  tab chip shows the letter + a count badge of how many words it holds (`.dex-tab b`); the active tab
  is inkblue. `dexTab` (module-level, an uppercase letter or `null`) tracks the selection and is kept
  valid each render (falls back to the first available letter). The `#dex-list` shows only the
  selected tab's words. The `#dex-count` next to the header still shows the **total** across all tabs.
  Spelling a **new** word sets `dexTab` to that word's first letter before `renderDex()`, so the
  collection jumps to where the word just landed. Genre/source tabs can layer on later. (The new
  `House_5_Wood_Red_Red.png` is staged for the future walkable library room — not wired into the
  build yet.)
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

- Home base with a writing desk; bounded **daily map** of screens (`MAP_RADIUS`, currently 3×3; walls at the world edge),
  regenerated each real calendar day; walk-off-edge travel between screens; `H` to teleport home;
  translucent explored-area minimap in the bottom-right (resets daily).
- Attack-based combat (no bump-to-collect); creatures are captured in a **single hit**
  (`CREATURE_HP = 1`) and drop their letter. (HP/pip scaffolding remains if multi-hit creatures
  are ever wanted again.) The satchel holds a capped number of letters (`state.bagCap`, starts at 10);
  when full, capture is blocked until you spell words to free space.
- Writing-implement weapons: start with stick; brush/pencil/pen hidden in field screens as
  diegetic upgrades; `1`–`4` to switch among unlocked ones.
- Letter pickups → inventory; **no respawn within a day** (captured creatures stay gone until the next
  day's fresh map). Satchel empties at the start of each new day.
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
- **Autosave (IndexedDB)** — progress persists automatically across reloads; Export/Import remain as
  manual backup/transfer; a **Reset** button (library footer, with confirm) wipes the save.
- Not started: library room, genre books / procedural layouts, hero weapons, word effects,
  farming/ranching, town/trade.

---

## Controls

**Keyboard (desktop):** Move `WASD` / arrows · Attack `Space` · Switch implement `Q` · Teleport
home `H` · Use bench when near it `E` · Open library `Tab` · Drink potion `1`/`2`/`3` (size/speed/reveal)
· Controls/help `?` · Close any panel `Esc`.

**Touch (mobile):** On touch devices a DOM control overlay (`#touch`) appears over the canvas:

- **D-pad** bottom-right (`#dpad`, 4 arrows) — press-and-hold sets the matching `keys["arrow*"]`, so
  it reuses the exact keyboard movement path in `update()`. 4-directional (matches keyboard).
- **Action cluster** bottom-left (`#tact`): a large **ATK** button (hold to keep swinging — `update()`
  calls cooldown-gated `doAttack()` while `attackHeld`; attack uses the facing direction, same as
  Space), plus small **HOME** / **SWAP** / **?** buttons (always shown) and the **contextual DESK /
  SHOP** buttons that mirror `H` / `Q` / help / desk / stall. **DESK and SHOP only appear (and only
  fire) when you're standing by the desk (`nearBench()`) / stall (`nearShop()`)** — `syncTouchUI()`
  toggles their `display` each frame and the tap handlers re-check proximity. They're ordered last in
  the grid so showing/hiding them doesn't shift HOME/SWAP/?. The "Press E to use your bench/shop" hint
  is **keyboard-only** (`!IS_TOUCH`) — touch has no E key, so the contextual buttons replace it.
- Detection: `IS_TOUCH` (`pointer:coarse` || `ontouchstart` || `maxTouchPoints`) adds `body.touch`.
  `syncTouchUI()` (called each frame from `update()`) shows the overlay only while
  `state.started && !overlay && !help` and clears held inputs when hidden, so the pad never sits on
  top of the library/help overlays. The corner `#help-btn` is hidden on touch (the `?` button replaces
  it); the start card swaps its keyboard hint (`.kbd-only`) for a touch hint (`.touch-only`).
- Controls shrink under `@media(max-width:560px)`. The canvas is a fixed 720×528 internal resolution.
  Base `#stage` is `width:720px;max-width:100%`. Desktop scaling (fill the viewport, keep 720:528) lives
  in a **`@media (hover:hover) and (pointer:fine)`** block so it only affects mouse/desktop — touch
  devices never match it, and `body.touch #stage` (the mobile reflow) outranks it regardless. `#stage`
  scales to the largest box that fits width **and** height (`min(100%, calc((100dvh-40px)*720/528))`),
  `image-rendering:pixelated` keeps the upscale crisp, and the DOM HUD/overlays stay fixed-px, anchored
  to the stage edges. Keep desktop and mobile stage sizing in separate rules so one can't break the other.
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
3. **IndexedDB autosave** — DONE. Progress autosaves to IndexedDB DB `inklings_save` (store `state`,
   key `save`). `snapshot()` builds a clone-safe object (`v:2` — `day`, inv, dex, unlocked, weaponIdx,
   bagCap, captured[], `ink`, `potions`; the **map/visited are not saved**); `applySnapshot()` restores
   it. `dex`/unlocks/`ink`/`potions` restore unconditionally, but `inv` + `captured` only carry over
   when the saved `day` matches today —
   a new calendar day loads with an empty satchel and a fresh map (`state.day` is set to `todayStr()`
   synchronously before load so the comparison works). `scheduleSave()` (600 ms debounce) is called on the
   meaningful mutations (capture, new word, weapon switch, new screen visited); `saveNow()` also fires
   on `pagehide`/`visibilitychange`. A `loaded` gate blocks autosave until the startup `idbGet()` load
   resolves so a fresh frame can't overwrite the real save. `navigator.storage.persist()` is requested
   on startup. Export/Import (file) share `snapshot()`/`applySnapshot()` and remain the backup/transfer
   path; **Reset** (`resetProgress` → `idbClear` + reload) wipes it. (Per-browser/device; true
   cross-device sync would need a backend — out of scope.) **Import gotcha:** the Import control is a
   `<label class="filebtn">` wrapping a real (visually-hidden, _not_ `display:none`) `#import-file`
   input, so the OS picker opens **natively**. Do NOT revert it to a `<button>` that calls
   `input.click()` programmatically — Chrome silently refuses to open the picker that way (handler runs,
   no dialog). Handle the chosen file in `#import-file`'s `onchange`.
4. **Library room** — render the dex as a walkable room with shelves. Organize words into
   sets/shelves (by length, by source book, by theme) so there are achievable sub-goals instead
   of one impossible "collect everything." Same data as the current list.
5. **Genre books + procedural layouts** — multiple book types with distinct tilesets and
   genre-weighted letter pools. Start with simple random scatter / room-and-corridor generation;
   do **not** build a clever dungeon generator first (classic time sink).
6. **Hero weapons** — convert the punctuation superheroes into implement upgrades with their
   dual-use bench powers (bow/wildcard, sword/contractions, belt/shout).
7. **Word effects (part-of-speech driven)** — **Status: partially DONE (nouns + adjectives).** POS
   comes live from the Free Dictionary API (not WordNet) — `lookupWord` returns a `pos` array; new
   words cache it in their dex entry so re-spells need no network. **Nouns → ink** (currency,
   `inkForWord(word)` = word length). **Adjectives → a random potion** of `size`/`speed`/`reveal`
   (`POTION_TYPES`). Rewards are **repeatable** (re-spelling a noun/adj re-consumes its letters and
   pays again — the renewable loop); multi-POS words (noun+adjective) pay **both**. Potions are stored
   (`state.potions`), drunk on demand (HUD buttons / `1`/`2`/`3`) for a `POTION_DUR` (25 s) timed buff
   (`state.buffs`): size = bigger sprite + attack reach (`SIZE_MULT`), speed = faster move (`SPEED_MULT`),
   reveal = minimap shows the whole map + which screens still have letters (`screenRemaining`). `ink` +
   `potions` persist across days in the save (buffs are session-only). Verbs/adverbs/etc. give no reward
   yet (still collected to the dex). **Ink sink — the Stall:** a separate **shop building** on the home
   screen (left of the desk; `drawStall()`, solid via the `STALL` collision rect) opens its **own**
   overlay (`#shop`, `state.shop`) — walk up + press `E` (`nearShop()` → `tryUseBench` prioritises the
   stall over the bench), or tap the `SHOP` touch button / `tc-shop`. It sells a repeatable **+1 satchel**
   upgrade whose cost climbs each buy (`bagUpgradeCost()` = `BAG_COST_BASE + BAG_COST_STEP·(bagCap −
   BAG_BASE_CAP)`, Korok-seed style); `buyBagUpgrade()` spends ink + raises `bagCap`, `updateShop()`
   refreshes the panel on `openShop()`. (It used to be a bar inside the desk/library overlay — moved out
   because it cluttered that window.) **Word of the Day:** `wordOfTheDay()` picks a daily target from the
   big **`2of12.txt`** dictionary (fetched once at startup into `WORD_POOL`, filtered to `WOTD_MIN..MAX`
   = 4–7 letters, a–z only), then **filtered again to words using only your `unlockedLetters()`** and
   picked deterministically with `mulberry32(daySeed)` — so it's stable all day, rotates daily, and is
   **always makeable**. Makeability isn't just "the letter is unlocked" — the world must spawn enough
   **copies** (e.g. two L's for "seller"). `wotdGuaranteed()` spreads the word's full letter multiset
   one-per-screen across the map and `genScreen` **pins those letters onto its first creatures** (letters
   only, so the per-screen count `n` — and thus `dayTotalCreatures`/captured tracking — is unchanged).
   The pool loads async, so `onWotdPoolResolved()` (fired on fetch success **or** failure) recomputes the
   word + pinned letters and **drops the screen cache** (`state.screens=new Map()`) so any field screen
   generated before the word was known respawns with the pinned copies. Cached per day (`_wotd`/`_wotdDay`,
   `_wotdGuar`/`_wotdGuarDay`).
   Until the fetch resolves it returns `null` (banner shows "loading…"); if the fetch fails it falls back
   to `WOTD_FALLBACK` (the old built-in etaoinsr list). This is a **second intentional network/file
   exception** (like the API) — 2of12 is used only to *pick* the word, never for validation. Spelling it
   pays a one-per-day `WOTD_BONUS` (25) ink on top of any normal reward. `checkWord` computes
   `wotdUnclaimed` up front and (a) skips the "no reward, letters returned" early-out for the unclaimed
   WOTD, and (b) **honours the WOTD even if the API 404s / is unreachable** (accepts it with empty POS +
   generic def), since it came from our own dictionary — so the daily bonus is never blocked.
   `state.wotdDay` records the claim day (persisted; re-arms when the date rolls over). The desk overlay
   shows a `.wotd` banner (`updateWotd()`). The fuller vision below
   (verbs→deeds, adverbs→amplifiers, rarity tiers, choose-1-of-3) is still aspirational:
   every word does something, with zero per-word
   tagging, by keying effects off `partOfSpeech` (from the bundled WordNet data; see item 2).
   Three independent dials keep it scalable and non-literal: **POS sets the reward category**,
   **word rarity (length + Scrabble-style letter rarity) sets the tier/magnitude**, and **a
   random roll within that category+tier picks the specific reward** — so SWIM does not grant a
   swim ability. Category mapping:
   - **Noun → currency** (scaled by rarity). The common case and the economic backbone.
   - **Verb → a banked "deed"** spent out in the field (dash, sweeping strike, blink, reveal).
   - **Adjective → a potion** drunk on demand for a timed buff (swiftness, strength, fortune, lantern).
   - **Adverb → an amplifier** that boosts the player's _next_ deed or potion (duration / area /
     strength) — adverbs modify, so in-game they modify other effects.
   - **Interjection / exclamation → an instant "shout" burst** (stun or scatter nearby inklings);
     natural fuel for the Excla Machine hero.
   - **Function words (the / and / of / it) → minor "ink scraps."** Later, conjunctions trigger a
     combine-two-words bench mechanic (joining is literally what they do).

   Multi-POS words roll randomly across their available parts of speech (a noun+verb+adjective
   word is a little wildcard); a rare / high-tier word may instead grant a choose-1-of-3 as a
   special moment. **Implementation note:** WordNet only tags noun / verb / adjective / adverb, so
   interjections and function words won't receive a POS from it — route any word WordNet doesn't
   tag into a default bucket (minor currency) until/unless we pivot to Wiktextract for the richer
   POS set. **Balance guards:** keep the definition reveal as the loud, primary celebration and the
   effect as a quieter secondary payout; first-time words give a dex entry **plus** an effect, while
   re-crafting a known word gives only the effect (the renewable currency loop — where consuming
   letters earns its keep).

8. **Farming / ranching** — renewable letters from ranched inklings; the deferred cozy layer.
9. **Town / trade** — towns that want specific words; bundle-style requests as content gates.
10. **Limit the starting letters** - start with only lowercase letters and the more common letters (not all).
    Eventually add capital letters which are stronger and they can be used to make proper nouns
    (Ex. City names to help with geography)

---

## Conventions for working on this project

- Keep the game a single self-contained file with no external runtime dependencies, unless a
  feature truly requires one (say so and why). Current intentional exceptions: the Free Dictionary
  API for word validation/definitions (no local fallback word list), and a one-time fetch of
  `2of12.txt` used only to pick the Word of the Day (not for validation).
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
