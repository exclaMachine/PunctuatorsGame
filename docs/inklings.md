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
- **Implements** — the (future) weapon/equipment vocabulary (stick, brush, pencil, pen, …). **Deferred:
  no equipment system is currently in the game** — attacking uses one fixed `ATTACK`. See design decision
  #6 and roadmap #6 for the eventual dual-use-implement vision.

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
- **`ATTACK`** — the single fixed base attack (`dmg`/`range`/`cd`). There is **no equipment/implement
  system** — it was removed (stick/brush/pencil + the SWAP/Q switch mechanic) because it did nothing yet
  and only added a dead button. Future gear can override this const. `dmg 1` one-shots creatures.
- **`SPRITESHEET`** — glyph-sheet config (`url`, `cols`/`rows`, `cellW`/`cellH`, `letterToFrame`)
  - loader. Wired to `Alpha.png` (the same hand-drawn sheet Spin Nids uses): a 7×8 grid of 32×32
    cells where a–z = frames 0–25 and **A–Z = 26–51** (both mapped in `letterToFrame`; capitals are now in
    play — see Capital letters). `drawGlyph(letter,cx,cy,size)` blits one
    cell. `drawCreature` renders the creature **as the glyph itself** — no tile, eyes, or feet — with a
    brief scale-up "pop" **and a white damage-flash** while `c.flash>0` (just hit), falling back to dark
    `fillText` if the sheet hasn't loaded or the letter isn't on it. A shared **HP bar** (`drawHpPips`, used
    by every creature) draws above it when damaged: a near-black frame for contrast on any terrain, segments
    told apart by **brightness** (bright amber = remaining, dark = spent) not hue, so it reads for
    colour-blind players too.
- **Hit-flash** (`flashAmt`/`tintFlashImage`/`flashProcedural`) — on hit **every** creature is overlaid with
  a fading solid-white silhouette of its own art (~0.15s), on top of the scale-pop. It builds the silhouette
  on a scratch canvas via a `source-in` white fill (respecting transparency), not a rectangle, so it works on
  any art: **image sprites** (Alpha.png glyph now, and a creature's custom `sprite` PNG automatically once you
  add one) go through `tintFlashImage` (`drawGlyph`/`drawCreatureSprite`), and **procedural `RES_DRAW` bodies**
  go through `flashProcedural`, which re-renders the body into an offscreen buffer by pointing the shared
  `RCTX` draw-context at it (`pxSprite`/`RES_DRAW` draw to `RCTX`, normally the live canvas). The Writer's
  Block cube additionally colour-flashes in its own draw.
- **Player sprite** (`playerImg` → `Lumberjack_Jack.png`) — **art by Kenmi, purchased on itch.io;
  credit Kenmi (kept in the source comment above the loader)**. Sheet = 6 cols × 10 rows of 64×64
  frames; `PR` maps rows: 0 idle-down, 1 idle-right, 2 idle-up, 3 walk-down, 4 walk-right, 5 walk-up,
  6 fall-right (unused), 7 attack-right, 8 attack-down, 9 attack-up. `drawPlayer` picks the row from
  `p.face` (cardinal) + state (`p.atkAnim>0` attack → `p.moving` walk → idle), advances the frame from
  `p.animT` (idle/walk cycle) or attack progress, and **mirrors the right-facing rows for left**. Drawn
  at `PLAYER_DRAW` (80px, `imageSmoothingEnabled=false`), feet near `p.y`. There's no weapon sprite (the
  Lumberjack sprite has its own axe); the primitive "scholar" draw remains as a fallback until the PNG
  loads. `doAttack` sets `p.atkAnim=ATTACK_ANIM` to play the attack row.
- **`lookupWord(word)` / `checkWord()`** — word validation + definitions + **part(s) of speech** come
  **entirely** from the Free Dictionary API (`api.dictionaryapi.dev`); there is no local word list.
  `lookupWord` is async and returns `{ok:true, def, pos}` (`pos` = unique `partOfSpeech` list across all
  entries/meanings) for a real word, `{ok:false}` if the API rejects it (incl. 404), or `{ok:null}` if
  the API can't be reached. `checkWord` is async: shows a "Checking the dictionary…" state, disables the
  button + guards with a `checking` flag, aborts silently if the bench changed during the await, and
  on `{ok:null}` keeps the letters + reports it couldn't reach the dictionary. **Rewards (step 7) are
  repeatable:** it always consumes the bench letters on a successful spell and pays out by POS — nouns
  add `ink`, adjectives brew a random potion (both if the word is both). New words also record to the
  dex (`{def, found, pos}`) and run letter unlocks; a known word caches its `pos` so re-spells
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
  bench regardless.
- **Capital letters** (roadmap #10, groundwork done) — `'A' ≠ 'a'` throughout (separate `state.inv` slots,
  spawns, glyphs). Capitals unlock **only after every lowercase letter is unlocked** (`n ≥ LOWER_DONE_AT`,
  118 words), then **one at a time in frequency order** (`CAP_ORDER`) on a continuing curve
  (`capUnlockAt(i)` = `LOWER_DONE_AT + CAP_FIRST_GAP + i*CAP_GAP + …`; first capital ~130 words, all 26 by
  ~530 — tune via `CAP_FIRST_GAP`/`CAP_GAP`). They render from Alpha.png frames **26–51** (added to
  `SPRITESHEET.letterToFrame`; the glyphs already existed in the sheet's second half). `weightedLetter`
  appends capitals to the pool (skipped until unlocked, so **pre-capital daily maps are byte-identical to
  before**) with an extra `isUpper` rarity+distance scaling, so capital inklings are rare and skew far from
  home. A capital shares its lowercase counterpart's tier/colour (`tierOf`/`freqOf` are case-folded). At the
  desk you place capitals with **Shift+letter** (physical keyboard, `e.key` preserves case) or a **⇧ toggle**
  on the on-screen tray (`benchShift`, shown only once `hasUnlockedCapital()`); dictionary validation stays
  case-insensitive for now (`checkWord` lowercases the word), so capitals also work in ordinary words — their
  distinct purpose (proper nouns for a geography level) is the future payoff. Letter chips/floats now show
  the **actual case** (a vs A) so the two read differently.
- **No respawn (Wordle-style daily map)** — creatures do **not** respawn within a day. Capturing one
  adds its stable id (`"sx,sy,i"`) to `state.captured`; `genScreen` skips any creature already in that
  set, so a taken creature stays gone until tomorrow. To get more letters you wait for the next day's
  map. `makeCreature(rng, dist, tiles)` is called for every index (to keep RNG/positions stable) but
  only pushed if not yet captured. **All-cleared notice:** `dayTotalCreatures()` sums the day's
  per-screen creature counts across the whole map (replaying each screen's first `rng()` draw, the
  same one `genScreen` uses — no need to visit them), memoized per day. `dayCleared()` = `captured.size
  > = dayTotalCreatures()`. When cleared, `render()` draws a **persistent** bottom-centre banner
(`drawClearedBanner`, "ALL CREATURES CAPTURED! / Come back tomorrow…") that stays on screen all day —
it does **not** fade like a toast. `maybeNotifyCleared()`only plays the one-time`unlock`chime
(guarded by`\_clearedDay`); it's called from `doAttack`(clearing the last one) and each frame in`update()` while started (so loading into an already-cleared day still chimes once).
- **Creatures / drops / bestiary** (data-driven, `data/creatures.json`) — one JSON is the **single source of
  truth** for both the spawner (`tier`/`hp`/`speed`/`behavior`/`special`/`spawn`/`drops`) and the bestiary
  UI (`dex.*`). Loaded once at startup (`fetch`, same pattern as `data/levels/…`); `onCreaturesLoaded()`
  drops the screen cache so pre-load field screens repopulate. `CREATURES_BY_ID` indexes it; `RESOURCE_POOL`
  = entries with `spawn.weight>0` (so weight-0 `inkling` is excluded — it's the existing letter-creature,
  present only for its bestiary entry).
  - **Spawn:** `genScreen` rolls `RES_PER_SCREEN_MIN..MAX` (1–3) resource-creatures per **field** screen
    **after** the letters (so `letterScatter` stays the first `rng()` draw and `screenCreatureCount`/
    `dayTotalCreatures` are unchanged). `rollResourceCreature(rng,dist)` is a weighted pick gated by
    `spawn.minDist ≤ (|sx|+|sy|)`. Writer's Block is folded into this roll but keeps its `kind:"cube"` art/
    behavior; every other new creature is a generic `kind:"resource"` (`makeResourceCreature`). Resource-
    creatures are **not** added to `state.captured` (that set stays letters-only so the "all captured"
    banner + `dayCleared` stay correct); like cubes they regenerate on reload. Same per-screen RNG → a
    day's resource layout is deterministic.
  - **Behavior** (`updateResourceCreature`): `chaser`/`shambler` home in, `stalker` chases + line-strikes,
    `drifter` loosely drifts+wanders, `darter` jitters fast toward you, `oozer` slow-oozes (drops rings),
    `scuttler` flees fast, `sinkhole` is stationary (handled by `updateSinkhole`), plus carry-over
    `lunger`/`skittish`/`flutter`/`wander`. Non-still creatures bounce off water/rock and freeze while a
    dialog is open. `special` hooks (a creature can bite **and** harass — the contact checks are independent
    `if`s): `contact-damage` → `hurtPlayer`; `contact-swaps-a-held-letter` (The Typo) → `swapCarried`
    (swaps a random carried letter for a different unlocked one, cooldowned, no heart); `leaves-slippery-rings`
    (Mugwump) → drops decaying `sc.slicks` floor rings that steal the player's steering for ~0.5s when stepped
    on (`p.slipT`/`slipCd`/`slipDir` in the movement code; `drawSlick`); `pulls-player-in` (Plot Hole,
    `updateSinkhole`) → radial pull toward centre, contact = a heart; `strikes-lines` (The Proofreaper,
    `updateStalkerStrike`) → telegraphed red aim-line then a speed-burst lunge (**TODO: real slash art**);
    `scorches-dropped-loot` (The Kindle) → `scorchNearbyLoot` (**fire-spread visuals are a TODO stub**).
    `contact-erases-carried-letter` → `eraseCarried` remains wired for the archived Erazor.
  - **Drops** (`rollDrops(cre,rng)` — the spec's resolver; `mode:"one"` = weighted single, `mode:"each"` =
    independent chance rolls, `qty` fixed or `qtyMin..qtyMax`). On defeat, `defeatCreature` logs the
    bestiary + scatters each drop as a **ground pickup** on `sc.pickups` (`grantDrop`). **Auto-collect
    (magnet):** a pickup within `PICKUP_MAGNET` homes toward you (`PICKUP_PULL`, accelerating), and within
    `PICKUP_DIST` `collectPickup` adds it to `state.resources`; a `heal:` effect (cheese) heals a heart
    (capped). Loot still sits on the ground briefly, so The Kindle can scorch it before it reaches you. `blank-tile` is stored now (future: usable as any letter on the bench). Pickups draw via
    `drawPickup`; resource bodies via `drawResourceCreature`/`RES_DRAW` (per-creature pixel silhouettes +
    shared `pxSprite`/`drawHpPips`).
  - **Material icons:** dropped materials draw as **letterless pixel icons** (`ICON_DRAW`, each `fn(g,x,y,s)`
    so the same code paints the ground pickup on the main ctx *and* a bestiary swatch via an offscreen
    canvas → `iconDataURL`, memoized). `drawPickup` uses the icon; the bestiary materials list uses the
    cached data URL (or the custom PNG when present).
  - **Custom sprites (drop-in):** each creature may declare a `sprite` PNG path (+ optional `spriteSize`),
    and each entry in the `resources` map supports the same override for its material icon.
    `loadCreatureSprite`/`creatureSprites` + `loadResourceSprites`/`resourceSprites` preload them;
    `drawCreatureSprite`/`drawResourceSprite` blit the image in place of the procedural art
    (`drawResourceCreature`/`drawCube`/`drawPickup` all try it first) and **fall back** to the drawn art if
    the file is missing/unloaded. So adding real art = drop `sprites/<id>.png` (creature) or
    `sprites/<material>.png` in + reload, no code change. See `sprites/README.md`. `"enabled": false` on a
    creature (`creatureEnabled`) removes it from both the spawn pool and the bestiary — currently used to
    shelf **The Erazor**.
  - **Bestiary state:** `recordBestiary(id)` on every defeat (and on letter capture → `"inkling"`) sets
    `seen=true` + bumps `kills`. `dexView(cre,rec)` gates reveals: an unseen creature is a locked `???`
    card; once seen, each `dex.reveal.<field>` is a kill threshold that unlocks description → stats → drops
    → lore (rarer creatures unlock sooner by design).
  - **Bestiary UI** (`#bestiary` overlay, `state.bestiaryOpen`, opened with `B` / the 🐾 touch button):
    `renderBestiary` draws a 3-col card grid (retro-pixel, like the library/shop panels) + a **Binding
    materials** tally (`renderMaterials`). Each seen card's header shows a **portrait** (`.bes-portrait`) to
    the right of the name/tier/kills, via `creatureThumbURL` — the creature's custom PNG if present, else its
    built-in art rendered once to a memoized data URL (glyph for the Inkling through `drawGlyphTo`, `drawCube`-
    style thumb for Writer's Block, the `RES_DRAW` body via the `RCTX` redirect for the rest). Closed with
    `✕`/`Esc`/`B`/backdrop. `state.bestiaryOpen` is added to every overlay guard (movement, `canBeHurt`, hint,
    `syncTouchUI`, `overworldDialogueOpen`).
- **`SFX`** — a small Web Audio IIFE (no asset files) that synthesizes chiptune blips, matching the
  retro-pixel theme and the single-file/offline rule. `SFX.play(name)` plays a named cue (`swing`,
  `capture`, `newword`, `known`, `invalid`, `unlock`, `home`, `click`); internals are `tone()` (one
  oscillator+gain blip with optional pitch slide) and `seq()` (notes back-to-back). Hooked into:
  attack swing + creature capture (`doAttack`), word results (`checkWord`: new/known/invalid), letter
  unlock, teleport (`teleportHome`), desk open (`openOverlay`), and UI button taps. Mute state persists in `localStorage["inklings_muted"]` and is
  toggled by `#sound-btn` (🔊/🔇), which lives inside `.hud`. It is **hidden on desktop** (it got in
  the way) and **shown only on touch** (`body.touch`), where it sits in the static HUD top bar.
  Browsers gate audio behind a gesture, so `play()` calls `SFX.resume()` and the Start button resumes
  the context on click.
- **Background music** (`OverworldTheme` + `syncOverworldMusic`) — a synthesized 8-bit chiptune loop
  (Web Audio, no asset files), in its **own `<script>` block after the game script** (it only reads the
  game's global `state`/mute, changing no game logic). `overworldTheme` (`setVolume(OVERWORLD_VOL=0.3)`).
  A 250ms tick + gesture/visibility listeners drive `syncOverworldMusic`: it fully **`stop()`s** unless
  gameplay is active (`state.started`, not `inklings_muted`, tab visible); while any dialogue is open
  (`overlay`/`help`/`shop`/`madlibs`) it keeps running but **fades the master gain to 0** (`overworldFade`,
  ~120ms ramp) so it resumes seamlessly on close. Gesture-gated (nothing autoplays on load). The class's
  own `module.exports` is guarded (`typeof module`), so it's browser-safe.
- **`state`** — `{ player, inv:{letter:count}, dex:{word:{def,found,pos}}, bagCap,
ink, potions:{size,speed,reveal}, buffs:{size,speed,reveal}, resources:{item:count},
bestiary:{id:{kills,seen}} }`. `resources` (book-binding materials) + `bestiary` (creature kill/seen log)
  persist forever like `dex`/`ink`. `ink` (noun currency) + `potions`
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
- **Screen-slide transition** — crossing an edge doesn't cut instantly: `goScreen` records the travel
  direction + the screen you left in `trans`, and for `TRANS_DUR` (~0.32s) `render` draws **both** screens
  offset (old sliding out toward `-dir`, new entering from `+dir`, via `renderWorld(sc, ox, oy)` which just
  `translate`s the normal draw) with an `easeIO` smoothstep; the player rides the incoming screen. Gameplay
  **freezes** during the slide (movement, the creature loop, attacks, contact are gated on `!trans`);
  `update()` advances/clears `trans`. `teleportHome`/`faint`/`startNewDay` cancel it (they reposition
  instantly). `drawEdgeHints`/`fx` only draw in the non-transition path.
- **Tile terrain + collision** — each screen has a `tiles[TROWS][TCOLS]` map on a **24px grid**
  (`TS=24`, `TCOLS=30 × TROWS=22`, separate from the 48px gameplay `TILE`). Four pixel-art types:
  `T_GRASS`/`T_PATH` are walkable, `T_WATER`/`T_ROCK` block movement (`walkType()`). `genTiles(sx,sy,isBase)`
  (own seeded RNG `hash2 ^ 0x5a17b3`) fills grass, grows water ponds + rock clusters as random-walk
  `blob()`s (interior only; bigger with `dist`), carves a **connected path network** (`carvePaths()`,
  overwriting obstacles so it's always walkable), then **keeps every collidable tile ≥`EDGE_MARGIN`
  (2) tiles from any edge** — `blob()` is confined to the interior and a final pass scrubs any
  water/rock in the 2-tile border band. This guarantees edge arrivals (you land in col/row 0–1) are
  always valid and you can never be boxed in on arrival. A whole side can still be walled behind that
  margin for "blocked-ish" variety. Home `(0,0)` gets no
  ponds/rocks. **Connected paths** (`carvePaths`): each shared edge's crossing point ("gate") is a
  deterministic hash of that edge + `daySeed` (`vGateRow`/`hGateCol`), so both neighbouring screens compute
  the same row/column and the trails line up across the seam; each screen then carves a 2-wide L-path
  (`carveLine`) from every in-bounds edge-gate to a central hub, so paths connect within a screen and from
  screen to screen, vertically as well as horizontally (replacing the old per-screen random left→right trail).
  Movement in `update()` resolves X/Y independently via `canStand(sc,x,y)` (samples a
  ~10px foot footprint against `blockedAt`) so you slide along walls; off-screen counts as unblocked
  so edge transitions still fire. Creatures spawn only on walkable tiles (`makeCreature` retries) and
  bounce off water/rock so none drift somewhere unreachable. On the home screen the **desk and shop stall
  are solid** too: `canStand` rejects the foot box overlapping the `DESK` or `STALL` rect
  (`overlapsSolid(rect,…)`), so you walk up to them instead of through them (still close enough to trigger
  the `E` prompt — `nearShop`/`nearBench`).
- **Desk + stall + lectern art** — `drawBench()` / `drawStall()` / `drawLectern()` are drawn in the
  retro-pixel style: square corners, flat fills, chunky 2px ink borders via `pxBox(x,y,w,h,fill)`, hard
  offset drop-shadows (no blur). Desk = wood slab + front panel, parchment sheet, ink pot + quill, `BENCH`
  label (centre). Stall = wooden counter + posts + striped awning + a coin, `SHOP` label (left). Lectern =
  pedestal + open book on a slanted rest, `BOOK` label (right). `DESK`/`STALL`/`LECTERN` collision rects
  (`overlapsSolid`) match the drawn footprints; `nearBench`/`nearShop`/`nearLectern` gate the `E`/touch
  interaction and open `#overlay` / `#shop` / `#madlibs` respectively.
- **Mad-libs module** (`/* MAD-LIBS */`) — `BOOKS` registry. For a big book, an entry points at an
  **`index:"data/levels/index.json"`** (book-ordered `[{id,title,file,blanks}]`) instead of a hardcoded
  `levels` array; `ensureBookLevels(reg)` fetches that index once and fills `reg.chapters` (metadata) +
  `reg.levels` (paths, used by the completion count). `openBook` → `showChapterMenu` renders the chapter
  list **straight from the index** (title + blank count + `state.restored` progress — **no per-chapter
  fetch**; kept in index/book order, not re-sorted) → `openChapter(path)` loads that one level via
  `loadLevelCached`/`mlCache` → `renderMadlibs` (+ `passageHTML`/`neededHTML`/`pickerHTML`/`completionHTML`/
  `wirePicker`); `backToChapters` returns to the menu (`#ml-back`).
  `selectBlank`/`pickWord`/`clearActive`, `usedWordSet`/`eligibleWords`, `allFilled`/`completeLevel`.
  State: `state.restored` (per-level `{fills,done,exact,bookId}`) + `state.books`, both saved.
  `mlReg`/`mlBook`/`mlLevel`/`mlActive` are the open session. Blank fills come from the dex filtered by
  cached POS; a word used anywhere is locked forever (`usedWordSet`).
- **Level content pipeline** (`build_levels.py`, project root) — offline, run once per book: turns a
  Project Gutenberg plain-text book into one mad-libs level JSON per chapter/fable (spaCy POS-tagging; POS
  blanks spaced apart, single-occurrence, never sentence-initial) + an `index.json`. **The book text is
  never committed** — download to a temp path, run, delete. The current book is *The Aesop for Children*
  (#19994) → **147 fables** in `data/levels/` (3 hand-tuned fables substituted for their generated versions;
  the TOC-leak "Page" pseudo-fable quarantined to `data/levels/_quarantine/`; same-title distinct fables
  disambiguated with `-2`/"(2)"). Regenerate/add books by re-running the script and pointing a `BOOKS`
  entry at the new `index.json`.
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
  regenerated each real calendar day; walk-off-edge travel between screens with a smooth **screen-slide**
  transition; `H` to teleport home;
  translucent explored-area minimap in the bottom-right (resets daily).
- Attack-based combat (no bump-to-collect); **letter-creatures** (`kind:"letter"`) are captured in a
  **single hit** (`CREATURE_HP = 1`) and drop their letter. The satchel holds a capped number of letters
  (`state.bagCap`, starts at 10); when full, **letter capture** is blocked (you can still fight cubes).
- **Letters are now rare** — `letterScatter(rng)` gives a thin, even scatter (usually 0, sometimes 1–2
  per screen) so finding one feels good; the WOTD's guaranteed pinned letters (`Math.max(scatter,guar)`)
  still ensure the daily word is makeable. `screenCreatureCount`/`dayTotalCreatures` (the "all letters
  gathered" banner) count **letters only**.
- **Home-base tutorial letter** — home `(0,0)` spawns exactly **one guaranteed letter-creature per day**
  (`makeHomeLetter`, placed clear of the desk/stall/lectern and the player spawn), so new players see what
  an "inkling" looks like right where they start. It counts toward the daily total (`screenCreatureCount`
  returns `1` for home), and once captured it stays gone until tomorrow's map like any other letter.
- **Writer's-block cubes** (`kind:"cube"`, `makeCube`/`drawCube`) — a cheese play on the gelatinous cube:
  a slow chaser (`CUBE_SPEED`) that takes `CUBE_HP` (2) hits to break. **Touching one costs a heart**
  (`hurtPlayer`, contact within `CONTACT_DIST`); attack range out-reaches contact so you can kite them.
  They freeze while a dialog is open and now spawn via the **unified resource-creature roll** (weight 20;
  see the Creatures & bestiary section) rather than a standalone `CUBE_CHANCE`. Their hp / contact damage /
  drops / bestiary entry come from `data/creatures.json` (`"writers-block"`) — they now **drop cheese (heals
  a heart) or glue**. Cubes don't count toward the daily letter total and (like the other resource-creatures)
  reappear on reload.
- **Resource-creatures + drops + bestiary** — a data-driven creature system (`data/creatures.json`). See the
  dedicated **Creatures & bestiary** section below. Resource-creatures roam the field alongside inklings,
  drop **book-binding materials** (paper/glue/thread/wax/leather/…) as ground pickups you walk over to
  collect (`state.resources`), and are catalogued in a **bestiary overlay** (`B` / 🐾). Kill/seen tracking is
  `state.bestiary`; both persist in the save.
- **Hearts (life):** `state.player.hearts` (max `PLAYER_MAX_HEARTS` = 3), drawn top-centre (`drawHearts`).
  A hit costs 1 heart + `HURT_IFRAMES` invulnerability (player blinks) + knockback. **0 → `faint()`**:
  teleport to the desk, refill hearts, keep everything. **Heal by resting at home** (on the base screen,
  `+1` heart every `HEAL_SEC`). Hearts also refill on a new day.
- No equipment/implement system yet (the old stick/brush/pencil + SWAP switch was removed — it did
  nothing). Attacking uses a single fixed `ATTACK` (dmg/range/cd). Equipment may return later.
- No equipment/implement system yet (the old stick/brush/pencil + SWAP switch was removed — it did
  nothing). Attacking uses a single fixed `ATTACK` (dmg/range/cd). Equipment may return later.
- Letter pickups → inventory; **no respawn within a day** (captured creatures stay gone until the next
  day's fresh map). Satchel empties at the start of each new day.
- Desk/Library: click-to-build word, async API dictionary check with feedback states (checking /
  new / known / invalid / couldn't-reach-API). **Stable fixed-size panel** (`#overlay .book` is a
  fixed-height flex column; only the collection list scrolls). The **definition appears in one place
  only** — the collection list, truncated to one line with an ellipsis (no horizontal scroll);
  clicking an entry opens a full-text modal (`#defmodal`). The new-word reveal celebrates the word
  but no longer prints a second copy of the definition.
- **Mad-libs "restore the chapter"** — a book lectern (right of the desk) opens a **chapter menu**
  (`data/levels/`; **147 Aesop fables**, listed from `index.json` — see the Level content pipeline). Pick a chapter, then
  fill each blank with a **collected word** matching its part of speech; exact-original matches earn bonus
  ink (never required). Words are single-use across all books (you keep learning new vocab). Completing a
  chapter restores it; completing a book adds it to your library. Persisted. (POS uses the FreeDictionary
  data cached on each dex word — WordNet bundle is future.)
- Backup: export state to JSON, import it back (also the manual cross-device transfer).
- Keyboard on desktop; **on-screen touch controls on mobile** (joystick bottom-right, action cluster
  bottom-left). See the Controls section + code map for details.
- **Background music** — a synthesized overworld chiptune loop (`OverworldTheme`) plays while walking
  around; it fades to silence while any dialogue is open (resumes seamlessly) and stops when muted /
  not started / tab hidden.
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

## Creatures & bestiary

A data-driven creature system layered on the core loop. `data/creatures.json` is the **single source of
truth** — edit it to add/tune creatures and their loot; the spawner and the bestiary UI both read from it
(don't hardcode creature stats in `inklings.html`). Schema per creature: `id`, `name`, `kind`, `tier`,
`hp`, `speed` (`still`/`slow`/`medium`/`fast`), `behavior`, `special[]`, `contactDamage`, `spawn:{weight,
minDist,notOnHome}`, `drops:{mode,table}`, and `dex:{silhouette,reveal,description,lore}`. A top-level
`resources` map tags each material with a `tier` (and `effect`/`wildcard` where relevant). **The loader reads
only the `creatures` and `resources` keys**, so any top-level key starting with `_` is ignored — retired
creatures live in `_archived` (currently Bookworm, Bindmoth, Silverfish, The Erazor) so they're preserved,
not deleted; move an entry back into `creatures` to revive it.

**Design intent.** HP is deliberately low (there's no weapon-upgrade system yet — see decision #6), so
creatures differ by **behavior**, not bulk (The Proofreaper mini-boss at hp 5 is the deliberate exception).
**Every non-letter creature costs a heart on contact** (`contactDamage:1`); the nuisance pests *also* harass.
Letters remain the scarce prize; resource-creatures are a modest 1–3 per field screen and drop **book-binding
materials** — the future "bind a finished book onto the shelf" gate will spend these (that gate is **not
built yet**; for now materials just collect in `state.resources`). Roster: **Writer's Block** (cube,
cheese/glue), **The Slush Pile** (bulk paper), **The Typo** (graphite/blank-tile, swaps a carried letter),
**Mugwump** (paste/leather, drops slippery rings), **The Spineless** (thread/glue, flees), **The Kindle**
(wax/ash, burns dropped loot), **Plot Hole** (stationary sinkhole that pulls you in; blank-tile), **The
Proofreaper** (mini-boss, hp 5, telegraphed line strike; the ONLY source of **red-ink**, a special resource —
gate only optional/prestige content with it, never core progression), **The Overdue** (elite, leather +
paper). **Inkling** (the letter-creature) is in the file only for its bestiary entry (`spawn.weight:0` keeps
it out of the resource roll — letter spawning is unchanged: `letterScatter` + the WOTD guarantee).

**Resource coverage** (each material keeps a reliable source): paper = Slush Pile + Overdue; glue = Writer's
Block + Spineless; cheese (heal) = Writer's Block; thread = Spineless; paste = Mugwump; ash + wax = Kindle;
graphite = Typo; leather = Mugwump + Overdue + Proofreaper; blank-tile = Typo + Plot Hole; red-ink =
Proofreaper only.

**Not static.** The spawn roll (mix + positions) is seeded by `hash2(sx,sy) ^ daySeed`, so every field screen
carries a **different** blend of creatures, and the whole map re-rolls each calendar day — no two grids or
days look the same. Tier weighting + `minDist` gating just push rarer creatures farther from home.

**Custom art.** Non-letter creatures **and** the dropped materials are drawn from built-in pixel art but will
use a `sprites/<id>.png` / `sprites/<material>.png` PNG if you drop one in (`sprite`/`spriteSize` in the JSON;
see `sprites/README.md`) — no code change. Material icons are letterless.

**Bestiary reveal.** An unseen creature is a locked `???` card (with its silhouette hint). First defeat/
capture sets `seen` and shows the kill counter; each `dex.reveal.<field>` is a kill threshold that unlocks
description → stats → drops → lore. Rarer creatures unlock at lower kill counts. Open with `B` / the 🐾
touch button; the panel also shows a running **binding-materials** tally.

See the code map (**Creatures / drops / bestiary**) for the function-level wiring.

## Controls

**Keyboard (desktop):** Move `WASD` / arrows · Attack `Space` · Teleport
home `H` · Use bench when near it `E` · Open library `Tab` · Open bestiary `B` · Drink potion `1`/`2`/`3`
(size/speed/reveal) · Controls/help `?` · Close any panel `Esc`.

**Touch (mobile):** On touch devices a DOM control overlay (`#touch`) appears over the canvas:

- **Joystick** bottom-right (`#joystick` + `#joy-thumb`, a fixed circular base) — drag the thumb; the
  clamped offset from centre becomes the movement vector (`joy.{active,x,y}`, `-1..1`, with a `JOY_DEAD`
  ~0.22 deadzone). Uses **pointer capture** so dragging past the base still tracks. In `update()` the
  joystick overrides the keyboard keys and the vector is normalized → **constant speed at any 360° angle**
  (replaced the old 4-way d-pad). Reset (thumb recentred) whenever the touch UI goes non-live.
- **Action cluster** bottom-left (`#tact`): a large **ATK** button (hold to keep swinging — `update()`
  calls cooldown-gated `doAttack()` while `attackHeld`; attack uses the facing direction, same as
  Space), plus small **HOME** / **?** / **🐾** (bestiary) buttons (always shown) and the **contextual DESK /
  SHOP / BOOK** buttons that mirror `H` / help / bestiary / desk / stall / lectern. **DESK and SHOP only appear (and only
  fire) when you're standing by the desk (`nearBench()`) / stall (`nearShop()`)** — `syncTouchUI()`
  toggles their `display` each frame and the tap handlers re-check proximity. They're ordered last in
  the grid so showing/hiding them doesn't shift HOME/?. The "Press E to use your bench/shop" hint
  is **keyboard-only** (`!IS_TOUCH`) — touch has no E key, so the contextual buttons replace it. The
  library overlay's footer key-hints row carries `.kbd-only` too, so it's hidden on touch (mobile has no
  keyboard) via the shared `body.touch .kbd-only{display:none}` rule.
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
  bar is static at the bottom** (`order:1`, `#tact` at the left end, `#joystick` at the right end), and the
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
   key `save`). `snapshot()` builds a clone-safe object (`v:3` — `day`, inv, dex,
   bagCap, captured[], `ink`, `potions`, `wotdDay`, `restored`, `books`, `resources`, `bestiary`; the
   **map/visited/pickups are not saved**); `applySnapshot()`
   restores it. `dex`/`ink`/`potions`/`resources`/`bestiary` restore unconditionally, but `inv` + `captured` only carry over
   when the saved `day` matches today —
   a new calendar day loads with an empty satchel and a fresh map (`state.day` is set to `todayStr()`
   synchronously before load so the comparison works). `scheduleSave()` (600 ms debounce) is called on the
   meaningful mutations (capture, new word, new screen visited); `saveNow()` also fires
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
   exception** (like the API) — 2of12 is used only to _pick_ the word, never for validation. Spelling it
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
    **Status: DONE (incl. capitals groundwork).** Lowercase unlock one at a time in frequency order; once all
    26 are unlocked, capital letters unlock the same way (`CAP_ORDER`/`capUnlockAt`) and spawn as rare
    capital inklings (glyphs = Alpha.png 26–51). Capitals are collectible + usable at the desk now
    (Shift/⇧, case-insensitive validation). **Still ahead:** make capitals *matter* — a geography level where
    country/capital-city **proper nouns** require the leading capital (a separate proper-noun validation
    source, since the Free Dictionary API won't have most place names).
11. **Books as worlds; mad-libs restoration (core loop, post-pivot)** — **Status: MVP DONE (chapter
    menu; 3 chapters).** A **book lectern** structure sits right of the desk on the home screen
    (`drawLectern`, solid via the `LECTERN` rect, walk-up + `E` / `nearLectern()` / touch `BOOK` button →
    `openBook()`). `openBook()` shows a **chapter menu** (`showChapterMenu()`): it loads each of the
    book's `BOOKS[…].levels` JSONs (`loadLevelCached`, memoized in `mlCache`) and lists them by `order`
    with title, blank count, and restored ✓ / `filled/total` progress. Picking one runs
    `openChapter(path)` → the passage view; a **`← Chapters`** footer button (`backToChapters`) returns to
    the menu (so finishing a chapter → back → pick the next). `loadLevel(path)` fetches + parses a chapter
    JSON (`data/levels/…`; graceful http/parse-error handling). The `#madlibs` overlay (`state.madlibs`,
    gated like `#shop`) renders the passage from
    `segments` (`passageHTML` — text runs with `\n\n` → paragraphs, each blank a POS-labelled slot);
    clicking a blank opens a **word picker of your collected words** (`eligibleWords(pos)` = dex words
    whose cached `pos` includes the blank's, **filtered by the FreeDictionary POS stored on the dex
    entry — no API call at fill time; WordNet isn't bundled yet**). **Each collected word can fill only
    ONE blank ever, across all books** (`usedWordSet()` unions all `state.restored[*].fills`; used words
    are locked but stay in your dex) — this is deliberate, to push learning new vocabulary (a future
    item could "unlock" used words). Any correct-POS word fills a blank; matching the original `answer`
    exactly awards `MADLIB_EXACT_BONUS` ink (per blank, on completion) but is **never required**.
    Completing every blank marks the chapter `done` (persisted in `state.restored[levelId]`), shows the
    finished passage + `moral`; finishing every chapter of a book adds it to `state.books` (your
    library). `restored`/`books` persist in the save. `BOOKS` is the registry (add chapters/books by
    listing JSON paths). The fuller pipeline vision below (Gutenberg + spaCy content pipeline, genre
    letter pools, walkable library room) is still ahead:
    each world is a
    public-domain book; each chapter (or, for fable/tale collections, each tale) is a level.
    Fiction: letters have "escaped" the book, so the player rounds them up (the catch-and-collect
    loop), spells words from them, and uses those words to refill part-of-speech-typed blanks in
    the chapter, mad-libs style. Completing a chapter restores it; completing a book adds it to the
    library. This unifies every prior system: letter-collection → words → POS-typed blanks
    validated by the bundled WordNet POS data (see item on the dictionary bundle).

- **Blank validation:** accept any word whose WordNet POS matches the blank's `pos`; matching
  or bettering the original `answer` earns bonus flavor, but is never required (that's the fun).
- **Content pipeline (offline, once per book):** pull clean text from Project Gutenberg,
  POS-tag each chapter with spaCy/NLTK, and emit one level JSON per chapter — a `segments`
  array alternating `{type:"text"}` runs with `{type:"blank", id, pos, answer, lemma?}` slots
  (see `sample-level.json`). The game loads pre-processed levels; no runtime NLP.
- **Source rules:** use works published 1930 or earlier (US public domain as of 2026), favor
  short/episodic ones (fables, tales, short stories, or naturally chaptered books). Use only
  OLD public-domain translations (Grimm/Andersen/Verne); do NOT use modern abridged editions —
  they carry a fresh copyright. Note US term = publication+95, but UK/EU = author death+70, so
  global distribution timelines differ (e.g. Winnie-the-Pooh clears the US but not everywhere
  yet). Not legal advice; verify before a commercial launch.
- **Reframes existing items:** each book's genre drives its letter pool / tileset (the old
  "genre books" idea); the library becomes a shelf of restored books; word-effects become an
  optional secondary reward layered on top of blank-filling.

---

## Conventions for working on this project

- Keep the game a single self-contained file with no external runtime dependencies, unless a
  feature truly requires one (say so and why). Current intentional exceptions: the Free Dictionary
  API for word validation/definitions (no local fallback word list), a one-time fetch of
  `2of12.txt` used only to pick the Word of the Day (not for validation), the mad-libs chapter JSONs
  in `data/levels/`, and `data/creatures.json` (the data-driven creature/drop/bestiary source of truth).
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
