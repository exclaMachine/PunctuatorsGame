# Inklings — project context

> **Planning the map/engine future?** See [`inklings-architecture.md`](inklings-architecture.md) — the
> agreed **hybrid map** direction (authored geography + daily contents), the neutral Tiled/LDtk map schema,
> the phased seam-refactor plan, and Godot-portability notes. Read it before reworking the map layer.
>
> **Planning grammar/educational systems?** See [`inklings-grammar-systems.md`](inklings-grammar-systems.md) —
> the POS-anchored framework, the word-guide cast (Antonym, Synonomouse, À La Modal), adjective "dumbbell"
> potions, hypernym/hyponym shelves, and the build order.
>
> **Planning the cozy farm?** See [`inklings-farming.md`](inklings-farming.md) — the Braille-bed farm (**Stages 1–2
> shipped**): **real-calendar seasons**, **season-locked consumable seeds** sown one-per-dot, the Stall seed rack,
> overnight maturation + once-per-day harvest, rarity-scaled bonus seeds + a rare uppercase drop, a quiz/hard mode,
> the crossword-garden (row/column words), and the parked IPA pass.
>
> **Planning collection rewards?** See [`inklings-collections.md`](inklings-collections.md) — the Wordhoard
> curator (a librarian who hands out **one-time grants** for completing collection subgoals, reusing the
> Nouns-wing `found/total`), **placeable decorations**, and the **facing-tile placement primitive shared with
> farm planting**. Pure grant, no town, nothing gated.
>
> **Planning the poetry mechanic?** See [`inklings-poetry.md`](inklings-poetry.md) — the **Versery** (a second
> mad-libs lectern that runs poem forms), the **phoneme engine** (rhyme + syllables from the bundled
> `ipa_words.js`; meter deferred to a CMU stress fold-in), mad-libs-fill-first with free-compose later, the
> poet-NPC cast (punny, names not final), and the **Anthology** reward. Read before building the sound layer.
>
> **Planning fishing?** See [`inklings-fishing.md`](inklings-fishing.md) — **phoneme fishing** at the existing
> pond `T_WATER` tiles: a phoneme surfaces on the line and you **type its romanization** to catch a **sound**
> into the **Phonicon** (fills the empty *sounds←fishing* niche; supplies the parked Sound Garden + the poetry
> phoneme engine). Typed-input v1, no mic; a **speak-the-phoneme** tier is deferred/desired (online-only,
> opt-in). Read before building fishing.
>
> **Planning the heraldry shield?** See [`inklings-heraldry.md`](inklings-heraldry.md) — the **blazon shield**
> (compose a valid heraldic phrase → an emblazoned shield with passive, meaning-driven bonuses in the existing
> equipment slots), the v1 blazon **grammar** (field/division + ordinary + numbered charges + attitude +
> **counterchange**, with the **rule of tincture** as a hard agreement constraint), rare **scroll drops** for
> a separate term vocabulary, and the layered emblazon renderer. Read before building the shield.
>
> **Planning story companions?** See [`inklings-companions.md`](inklings-companions.md) — the **combat/bonus
> buddies** (authored book characters — Suede, Swifty, Johnny — that follow the player), the agreed v1
> (silent, one equipped at a time via a new **Equipment slot**, **passive bonus**, unlocked by **themed
> Wordhoard collection sets**), the reuse of À La Modal's follow-sprite + the creature sprite loader, and the
> parked growth path (autonomous fighting / triggered abilities). A *separate* track from the grammar guides.

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
      → walk back to the home base + enter the library
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
- **Implements** — the weapon vocabulary. **Weapons now exist** as craftable gear in the Weapon slot
  (Pencil → Reed Pen generic ladder, then the signature story weapons — Vaporl Sword, Banana, Dooter,
  Murmerer Mirror). They add `attack`/`reach`/`haste` on top of the base `ATTACK`; each signature reserves
  an `effect` for a future special ability (inert today — stats only). See the Equipment section below.

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

9. **Self-contained single file.** No build step in the shipped game, no runtime third-party services;
   drops straight onto GitHub Pages and works **fully offline**. Word validation + definitions + POS come
   from a **bundled local WordNet dataset** — `data/dictionary.json` (`{word:{pos,def,syn}}`) plus
   `data/inflections.json` (`{inflectedForm:lemma}`) so plurals/tenses/etc. validate. These are generated
   **offline** by `build_dictionary.py` (WordNet via NLTK + lemminflect) and fetched once at startup like
   `2of12.txt`; the browser only does plain map lookups (no lemmatizer). The old Free Dictionary API
   (`api.dictionaryapi.dev`) is **removed** — there is no live third-party API anymore. Keep everything
   local; don't add external fetches without a strong reason.

---

## Current file & code map

Current file: `inklings.html`. One self-contained HTML/CSS/JS file. Config lives in clearly-marked
blocks at the top of the `<script>`. The displayed game name is **Inklings** (title, start card,
save file `inklings-save.json`). Fonts: `Press Start 2P` + `VT323` (Google Fonts), declared as the
`--disp` / `--read` CSS vars and also used by the canvas `ctx.font` calls (floats, BENCH label).

- **CONFIG constants** — `TILE`, `COLS/ROWS`, `WORLD_W/H`, `HOME`, speeds, `CONSUME_LETTERS`.
- **`ATTACK`** — the base (bare-handed) attack (`dmg`/`range`/`cd`). An **equipped weapon adds on top**
  via `equipBonuses()`: `attack`→dmg (`attackDmg`), `reach`→range and `haste`→cd (both in `doAttack`,
  cd floored at 0.12s). `dmg 1` one-shots creatures; weapons let you out-damage tougher beasts.
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
- **Local dictionary (`DICT`/`INFL`/`localLookup` / `checkWord()`)** — validation + definitions + **POS**
  come from the **bundled WordNet dataset**, loaded once at startup: `dictReady = Promise.all(fetch
  dictionary.json, fetch inflections.json)` sets `DICT`/`INFL` (or `DICT_FAILED` on error). `localLookup(word)`
  is **synchronous**: lowercase → `DICT` hit → `{ok, def, pos}`; else `INFL[word]` → resolve to that lemma's
  `DICT` entry (its def/pos); else `{ok:false}` = not a real word. No JS lemmatization — one map lookup +
  one redirect. `checkWord` stays async only to `await dictReady` on the very first spell (a brief "Loading
  the dictionary…", guarded by `checking`, aborts if the bench changed during that one await); after that
  every lookup is instant. A local miss simply means "isn't a word we know" (no network/"couldn't reach"
  states anymore). **Rewards (step 7) are repeatable:** it always consumes the bench letters on a successful
  spell and pays out by POS — nouns add `ink`, adjectives brew a **meaning-driven potion** (both if the word
  is both). The adjective's potion is its WordNet **dumbbell pole**: `potionForAdj(word)` looks it up in
  `data/adj-attrs.json` (`word → potionId`), falling back to a random self-buff for unmapped adjectives.
  Self-buff poles `speed`/`size`/`reveal` are drinkable; antonym poles `slow`/`small`/`dark` accumulate in
  inventory (stored + shown disabled in the HUD for now). Planned: drinking an antonym potion **debuffs all
  beasts on the current screen** (screen-wide, no throw/aim — the Apothecary step). See
  [grammar-systems §3.2/§3.3/§8](inklings-grammar-systems.md).
  New words record to the dex (`{def, found, pos}`) and run letter unlocks; a known word caches its `pos`
  (now WordNet-sourced, via the resolved lemma) so re-spells skip the lookup. A known word that's neither
  noun nor adjective short-circuits with letters returned. Defs are HTML-escaped via `esc()`.
- **Letter spawn pool** — `FREQ` (per-letter weights, vowels common, j/k/x/q/z rare) + `TIER`
  (common/mid/rare/legend) drive `weightedLetter(rng, dist)`, which also pushes rare/legend letters
  farther from home (`dist` = `|sx|+|sy|`). (The old `LETTER_BAG` const is gone.)
- **Letter unlock progression** (`unlockedLetters()`): you start with only the 8 commonest letters
  (`START_LETTERS = "etaoinsr"`); the other 18 appear in the wild **one at a time, in frequency
  order** (`UNLOCK_ORDER = "hdlucmwfgypbvkjxqz"`) as your collection grows, gated by word-count
  milestones (`UNLOCK_AT` — a slow/grindy curve; j/k/x/q/z aren't reachable until ~90–120 words).
  It's **derived purely from `wordsCollected()` (= `Object.keys(state.dex).length`)**, so nothing
  extra is saved. `weightedLetter` filters its pool to `unlockedLetters()`, so locked letters never
  spawn (and thus can't be collected or spelled yet). On a new word, `commitSpell` diffs the unlocked
  set before/after; when a threshold is crossed it opens a **dismiss-me modal** (`showUnlockModal`, `#unlockmodal`
  — OK/✕, not a fleeting toast) with a big fanfare (`SFX.play("unlockbig")`),
  and **`spawnBonusLetter`** drops one of the just-unlocked letters onto the **home screen (0,0)** so you can
  go catch it that day even if the map's already cleared. Bonus letter-creatures live in **`state.bonus`**
  (`[{id,letter}]`, same-day like `state.captured`): `genScreen`'s home branch adds one creature per entry
  (`makeBonusCreature`), capturing one removes it from `state.bonus` (it's **not** added to `state.captured`,
  so it doesn't touch the day-total math), and `dayCleared()` requires `state.bonus` empty — so an uncaught
  unlock **reopens** the "all captured" banner (and `_clearedDay=null` lets its chime replay). Letters a
  player already owns in `state.inv` from before stay usable on the bench regardless.
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
- **Background music** (`ChiptuneTheme` + `syncMusic`) — **two** synthesized 8-bit chiptune loops (Web Audio,
  no asset files), in their **own `<script>` block after the game script** (only read `state`/mute, change no
  game logic). `ChiptuneTheme` is a **data-driven** engine: `new ChiptuneTheme(song)` where `song` =
  `{bpm, melody, harmony, bass, drums?, arp?, vol?}` (melody supports `'R'` rests; optional noise-based
  **drum groove** kick/snare/hat + a harmony-derived **arpeggio**). Two songs: **`WORDHOARD_SONG`** (the
  original cozy C-major loop, ~108 BPM, played inside the library) and **`FIELD_SONG`** (a new bouncy
  exploration tune, ~116 BPM, with drums + arpeggio, played outdoors). Both loops run together during
  gameplay; `syncMusic` **crossfades by `state.room`** (`themeFade`, ~120ms) — field outdoors, Wordhoard
  inside — so each **resumes where it left off** when you pop in/out. Everything fades to 0 while any dialogue
  is open and fully **`stop()`s** unless gameplay is active (`state.started`, not `inklings_muted`, tab
  visible). Gesture-gated; `module.exports` guarded (`typeof module`) so it's browser-safe.
- **`state`** — `{ player, inv:{letter:count}, dex:{word:{def,found,pos}}, bagCap,
ink, potions:{size,speed,reveal,small,slow,dark}, buffs:{size,speed,reveal}, resources:{item:count},
bestiary:{id:{kills,seen}} }`. `resources` (book-binding materials) + `bestiary` (creature kill/seen log)
  persist forever like `dex`/`ink`. `ink` (noun currency) + `potions`
  (brewed-but-undrunk **doses** — six poles: three drinkable self-buffs + three antonym debuff potions) persist
  across days; `buffs` (seconds remaining on a drunk **self-buff** — only the three self-buff poles are
  timed) are session-only. **Flask capacity** (grammar-systems §3.2) caps how many doses each pole holds:
  `flaskCap(pole)` = `FLASK_BASE + floor(breadth/FLASK_STEP) + (attribute noun in dex ? FLASK_NOUN_BONUS)`,
  where breadth = `state.adjCounts[pole]` (distinct adjectives per pole, session-derived from the dex via
  `rederiveAdjCounts`/`onNewAdjWord`, **not saved** — like `verbCounts`). Brewing (`commitSpell` + farm
  harvest) fills up to cap; a full flask declines the extra dose but still collects the word. The **Apothecary**
  window (`P` / ⚗️, `openApothecary`/`renderApothecary`, modal `#apothecary`, `state.apothecaryOpen`) has a
  **Flasks** tab (a dumbbell rack per attribute with a growing vial per pole) and a **Words** tab
  (`renderApothecaryWords`/`adjWordsByPole` — collected adjectives grouped by pole, clickable → def modal). `updateRewardHud()` renders the `#ink-count` + the
  `#potions` buttons (self-buffs clickable/disabled when you have none or the buff is active, titled `n/cap`;
  antonym debuff potions shown disabled until step 3 makes them usable — a **drink → debuff all beasts on
  screen** effect, no throw/aim). `drinkPotion(t)` spends a self-buff potion and starts a
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
  (`overlapsSolid`) match the drawn footprints. The **outdoor home** now has just two structures: the shop
  **STALL** (`drawStall`, `nearShop` → `#shop`) and the **HOUSE** (`drawHouse` — blits `House_5_Wood_Red_Red.png`,
  right of the shop; `nearHouse` → `enterLibrary`). The writing desk + book lectern **moved into the Library**
  (below), so `DESK`/`LECTERN`/`drawBench`/`drawLectern`/the archway were removed.
- **Library room** (`state.room==="library"`; `data/rooms/library.json`) — a **separate walkable screen**
  that is now the game's **home/study**, not part of the daily field grid, entered via the `HOUSE` (cut, not
  the field slide). Loaded once by `buildLibrary(room)` into `LIBRARY = {room, cw, ch, screen, entranceRect/Px,
  desk, book, deskStand, shelves, activeByCat, bg}`. It has its **own tile grid** (`room.cols×room.rows` = 30×24, non-square cells
  `cw=24`/`ch=22` filling 720×528) used only for collision — `blockedAt` is now cell-size-aware (`sc.cw||TS` /
  `sc.ch||TS`), so the existing `canStand` works unchanged (field screens have no `cw/ch` → `TS`). Solid
  objects → `T_ROCK`; floors/stairs/entrance walk. `update()` branches to **`updateLibrary`** (same
  movement/collision, bounded — no edge transitions/creatures/pickups; **rests/heals** here; stepping onto the
  entrance mat calls `exitLibrary`); `render()` branches to **`drawLibraryRoom`** (offscreen bake
  `ensureLibraryBg`, rebuilt per entry): two floor zones + every object (shelf/stairs/railing/ladder,
  the **desk** + **book** interactables, entrance mat) as retro-pixel rects. Inside: `nearLibraryDesk` →
  `openOverlay` (collection/bench), `nearLibraryBook` → `openBook` (mad-libs), `nearLibraryShelf` →
  `openShelfView`. Entry helpers: `enterLibrary` (via the house → entrance mat) and **`goHome`**
  (H/faint/new-day → `deskStand`) both go through `enterLibraryAt`. Touch: contextual **SHOP**/**LIB** (home)
  and **DESK**/**BOOK**/**SHELF** (room) via `syncTouchUI`. `state.room` is session-only (not saved); reload
  starts outdoors. **Placeholder pixel art** (except the house PNG) — draw code is structured by object type
  so the staged tileset can swap in later.
- **Nouns wing** (the shelves) — `data/noun-books.json` (`{categories:[…26], books:{key:{cat,children,[misc]}}}`,
  precomputed by `build_dictionary.py:build_noun_books`, ~200 KB gzip; the builder filters out WordNet junk —
  only real dictionary nouns, ≥3 letters, non-proper-noun senses — so abbreviations like OR/HI/ID/OK and names
  like Bach no longer show on the shelves) is fetched at startup into `NOUN_BOOKS`
  + a `WORDBOOK` (child→book) reverse map. **26 shelf-levels** (13 shelves × 2 board-rows) ↦ the 26 noun
  categories via `SHELF_ORDER` × `NOUN_BOOKS.categories` (`shelfCategory(id, level)`), concrete cats on the big
  top/mid shelves. `ensureLibraryBg` computes `LIBRARY.activeByCat` (category → sorted active book keys, an
  "active" book = ≥1 child in `state.dex`) and draws a plain spine per active book (`bookSpineColor`, no title)
  on its category board-row; a collected word sets `LIBRARY.bg=null` to rebake. **Shelf view** (`#shelfview`,
  one `state.shelfview` modal, two pages like the mad-libs menu→chapter): `openShelfView`→`renderShelfList`
  (the shelf's 2 categories + their books with `found/total`) → `renderBookPage(key)` (the book's full roster —
  discovered words are chips → `openDefModal`, undiscovered are `?????` blanks; `← Shelf` / `svBook` tracks the
  page). `bookName` renders `•<cat>` catch-alls as "Other <cat>". Pure view over `state.dex`; **no new saved
  state.** See [`build_dictionary.py`](../build_dictionary.py) for the book-assignment rules + known odd
  placements. The per-book/per-category `found/total` here is the **bundle substrate** for the Wordhoard
  curator (below) — see [`inklings-collections.md`](inklings-collections.md).
- **Curation panel (collection subgoals)** — a **curator** NPC (a librarian behind a desk) in the Wordhoard
  (`data/rooms/library.json` `type:"curator"` at col 10 row 14; `buildLibrary` exposes `LIBRARY.curator`,
  `nearLibraryCurator()` gates it, drawn in `ensureLibraryBg`'s object loop). Walk up + `E` (or touch
  **CURATE** / desktop toolbar **Curator** `tb-curate`) → the `#curation` modal (`state.curation`, styled off
  the shelf view). Three drill-down pages (nav via `cuCat`/`cuBook`; `cu-back`/Esc step back one page):
  `renderCuration` lists the **26 noun categories as "sets"** each with a `found/total` bar (✓ COMPLETE at
  100%) → `renderCurationCat` shows that category's books with per-book bars → `renderCurationBook` shows a
  book's words (collected = clickable chips → `#defmodal`, undiscovered = `?????` blanks, reusing the shelf's
  `.nb-chip` styling). **Sets/books with ≥1 collected word float to the top** (shelf order / alphabetical
  within each group). All computed live by `curationCats()` from `state.dex` × `NOUN_BOOKS`.
  **Milestone rewards (Claim + grant):** each category page (`renderCurationCat`) shows a **milestone strip**
  (`renderMilestones`) with three reward cards at `BUNDLE_TIERS = [5,15,30]` words — **locked** (`found/tier`),
  **claimable** (a pulsing gold **CLAIM** button), or **claimed** (✓). `claimBundle(cat,t)` sets
  `state.bundles["cat:t"]=true` (one-time, persisted, snapshot `v:6`) and grants a **décor** into
  `state.decorOwned` (the existing décor tray) with an `unlockbig` chime + toast; the reward is deterministic
  per `(cat,tier)` (`bundleReward` → tiered `BUNDLE_REWARDS` pools). Page 1 flags any category with an
  unclaimed milestone with a **🎁 badge** (`catClaimable`). Only the *claimed* flag saves; claimable state
  re-derives from `state.dex`. The reward → place loop (collect nouns → claim → place in the Wordhoard via the
  décor tray) is closed. See [`inklings-collections.md`](inklings-collections.md) + [`inklings-placement.md`](inklings-placement.md).
- **Mad-libs module** (`/* MAD-LIBS */`) — `BOOKS` registry. For a big book, an entry points at an
  **`index:"data/levels/index.json"`** (book-ordered `[{id,title,file,blanks}]`) instead of a hardcoded
  `levels` array; `ensureBookLevels(reg)` fetches that index once and fills `reg.chapters` (metadata) +
  `reg.levels` (paths, used by the completion count). `openBook` → `showChapterMenu` renders the chapter
  list **straight from the index** (title + blank count + `state.restored` progress — **no per-chapter
  fetch**; kept in index/book order, not re-sorted) → `openChapter(path)` loads that one level via
  `loadLevelCached`/`mlCache` → `renderMadlibs` (+ `passageHTML`/`neededHTML`/`pickerHTML`/`completionHTML`/
  `wirePicker`); `backToChapters` returns to the menu (`#ml-back`).
  `selectBlank`/`pickWord`/`clearActive`, `usedWordSet`/`eligibleWords`, `allFilled`/`completeLevel`.
  **Fable gating** — chapters are **recovered one at a time in book order**: `state.fables` (saved, always;
  ≥1) is how many are unlocked, **chapter 1 free**. `showChapterMenu` shows only `chapters.slice(0, state.fables)`
  and hides the rest behind a "…N more fables out there to recover" note. **`recoverNextFable()`** (unlocks the
  next, chime + toast, refreshes the open menu/shop) is driven by two sources: a **rare beast page-drop**
  (`defeatCreature` rolls `FABLE_DROP_CHANCE≈0.10` while any remain → a `"page"` ground pickup with its own
  `ICON_DRAW.page` scroll icon; `collectPickup` special-cases `"page"` → `recoverNextFable`, **not** stockpiled
  in `state.resources`), and the **Stall** ("Bind a Fable Page", costs `FABLE_COST = {paper:3, glue:2}` of
  beast-dropped materials; `buyFable`/`canBindFable`). `fableTotal()` comes from the preloaded index. The book
  only *completes* (`state.books`) once **all** chapters are restored, so all must be recovered first.
  State: `state.restored` (per-level `{fills,done,exact,bookId}`) + `state.books` + `state.fables`, all saved.
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
  `[-MAP_RADIUS, MAP_RADIUS]` grid with letter-bearing screens highlighted. The bounds/colour logic is
  shared via `minimapBounds()` + `minimapCellFill()` so the on-canvas version and the DOM panels below all
  match.
- **Side panels — feature toolbar + persistent minimap** (use the empty pillar/band space). `refreshSidePanels()`
  (called each frame in `render`) routes the minimap: on **touch** it draws into `#mini-mobile` (in the top HUD
  band), on a **wide fine-pointer desktop** into `#mini-desktop` (right pillar panel `#side-right`), else it
  falls back to the on-canvas `drawMinimap()` — all via `drawMinimapPanel(canvas)`. `panelsShown()`
  (`_mqPanels` = `matchMedia("(hover:hover) and (pointer:fine) and (min-width:1100px)")`, and not `body.touch`)
  gates the desktop panels; CSS `.sidepanel` is `position:fixed` at the viewport edges so it never affects the
  720px stage's centring/sizing. The **left panel `#side-left`** is a clickable feature toolbar mirroring the
  keyboard shortcuts (Home/Wordsmithy/Bestiary/Feats/Equipment/Help always-on; Shop/Mad Libris/Shelf are
  **contextual**, `refreshToolbar()` toggles a `.dim` class by proximity — `nearShop`/`nearLibraryBook`/
  `nearLibraryShelf`). **Dialog switching (button-only):** every panel-opener routes through `tbSwitch(key,
  open, canOpen)`, which **closes whatever dialog is already open first, then opens the clicked one** (and a
  click on the currently-open dialog's own button just closes it — toggle). `closeAnyDialog()` is the shared
  close-everything helper both `tbSwitch` and the touch (`tc-*`) handlers use. This switching is **buttons
  only** — the keyboard hotkeys are unchanged and never switch dialogs (so a letter key at the Wordsmithy
  still types into the word instead of jumping to another panel). The mobile `#tact` util buttons (`tc-*`)
  now share the same `tbSwitch`/`closeAnyDialog` path; the minimap move benefits both.
- **Library layout** (`#overlay`): the panel is a fixed-size flex column so it never resizes/jumps
  as content changes. The two columns (`.cols`) are a `1fr 1fr` grid where **`.cols>div` carries
  `min-width:0`** — this is the load-bearing fix: without it a long collection entry (word +
  `nowrap` definition) expands its grid track past 50%, squeezing the bench column until the
  letter chips overlap and a horizontal scrollbar appears. Bench-word chips are `flex:0 0 auto` so they
  never compress; only `.dex-list` scrolls (`flex:1;min-height:0`). Collection defs are single-line
  ellipsis; `openDefModal()` shows full text in `#defmodal`. Under `max-width:560px` the panel
  switches to a normal scrolling single column.
- **Collection: POS filter + A–Z tabs** (`renderDex` → `#dex-pos` + `#dex-tabs` + `#dex-list`): a **POS filter
  row** (`dexPos`: All / Nouns / Verbs / Adjectives / Adverbs — the home for browsing adjectives/adverbs, which
  lack rich WordNet categories; nouns→shelves and verbs→Feats-tab are the richer views) narrows the list, then
  it's split into per-letter tabs. `renderDex` filters `state.dex` by `dexPos`, groups by first
  letter and **only renders a tab for letters you actually own a word for** (no empty A–Z row). Each
  tab chip shows the letter + a count badge of how many words it holds (`.dex-tab b`); the active tab
  is inkblue. `dexTab` (module-level, an uppercase letter or `null`) tracks the selection and is kept
  valid each render (falls back to the first available letter). The `#dex-list` shows only the
  selected tab's words. The `#dex-count` next to the header still shows the **total** across all tabs.
  Spelling a **new** word sets `dexTab` to that word's first letter before `renderDex()`, so the
  collection jumps to where the word just landed. Genre/source tabs can layer on later.
  (`House_5_Wood_Red_Red.png` is now **wired in** as the Library entrance house on the home screen — see the
  Library room entry.)
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

**Dev-only debug:** `IS_DEV` (true on `localhost`/`127.0.0.1`/`file:`, false on the deployed GitHub Pages host)
gates a testing cheat — press **`` ` ``** (backtick) to `prompt()` for letters and grant them straight to the
satchel (bypassing the cap). A small **DEV** badge shows bottom-left when active. Never runs in production.

**Built and working:**

- **À La Modal (companion, base version)** — a Navi-style floating companion (an ice-cream-topped dialogue-box
  with two floating hands). A **large detailed speaking sprite** (chibi face, solid open mouth, speech bubble,
  real **YES/NO/×** buttons wired to callbacks) pops in when she has something to say; a **small in-world follow
  sprite** (bob + independent hand wiggle) trails the player **only after you say YES** (opt-in via
  `ALaModal.following`) — **NO** sends her off, **×** just closes. Press **M** / tap 💬 to bring her up (YES to
  follow / hint); her greeting-offer is **not** shown on open (it was intrusive) — it plays the **first** time
  you summon her each session (`_alaGreeted`). She talks in **modal verbs** (can/could/should/might).
  The ice-cream scoop has a **scalloped
  ruffle collar** flaring out where it's set on the box (drawn in `alaScoop`), and the **large speaking sprite is
  pixelated** (rendered through a downscaled offscreen buffer, then blitted back up with smoothing off) to match
  the game's pixel art. Base scaffold to iterate on.
- **Interactable obstacles (river mad-lib)** — an **L-shaped river** walls off a corner of the far corner
  screen, with a **rare letter sitting in the walled-off corner** (visible across the water as bait). Touch the
  river → a mad-lib ("I could ___ it") you fill with a **collected verb**: curated crossing verbs
  (swim/ford/wade…) make it **passable for the day** (then walk over to grab the corner letter); specific verbs
  (`jump`→"I'm not Spider-Man") and whole verb **categories** (`@consumption`, `@perception`…) get funny lines;
  anything else rotates "nope". **Resets daily**, and a crossing verb is **single-use forever**
  (`state.riverCrossed`) so you keep finding new ways over. Data-driven (`OBSTACLES`) — add entries for more.
- **Spilled-ink puddle (daily gag, non-blocking)** — each day a **pool of ink** appears on one random walkable
  square somewhere on the map (never the home base). It blocks nothing — walk up and touch it → a mad-lib
  ("I could ___ it") filled with a **collected verb**. The answer decides the gag: a **crossing verb**
  (swim/wade…) or a **`@competition`** verb → you barge through and turn **jet-black for the day** (+a little
  ink); a **`@motion`** verb → you tromp through and leave a **black footprint trail** for the day (+a little
  ink); a **`@consumption`** verb → **"Yuck!" and −1 heart** (don't drink ink); **`@communication`** → a friendly
  non-answer; anything else → a plain "nope". The three "through" answers clear the puddle for the day; the rest
  leave it so you can try another verb. All state (`inkClearedDay`/`inkedDay`/`printsDay`) is **day-scoped**.
- **Equipment (`G` / 🎒)** — a Stardew-lite gear screen. **Anatomical paper-doll slots** (hat above the head,
  boots below the feet, rings at the hands, accessory by the face, a **Weapon** slot) frame a **zoomed,
  static player sprite** (the sprite doesn't change yet — a paper-doll overlay can draw on it later). Gear
  is **crafted** (Craft tab) from **ink + the beast materials** you already collect (`state.resources`),
  and grants functional bonuses: **+max hearts**, **longer post-hit invulnerability** (guard), and — for
  weapons — **`attack`** (+dmg), **`reach`** (+px range), **`haste`** (−s off the swing cooldown; negative
  = slower). Owned gear lives in the **Bag** tab; click to equip (rings auto-fill the two ring slots), click
  a filled slot to take it off. Bonuses **stack additively** across slots. Every item has an **`effect` hook**
  (inert today) that names each signature weapon's **future special ability** so it can light up without a
  redesign; **tier** is an isolated, removable field. **Tiered upgrades are gated by a `requires` field**
  (e.g. Inkcap Hat II `requires:"inkcap-hat"`; the signature weapons `requires:"reed-pen"`): a recipe stays
  **hidden from the Craft tab until you own its predecessor** (`craftUnlocked`/`ownsGearItem` — "own" = ever
  crafted, since gear is never consumed), and `requires` chains for future III+.
  - **Weapons** — the Weapon slot is now live. A **generic ladder** (**Pencil** ✏️ → **Reed Pen** 🖋️, small
    +attack/reach) gates the **signature story weapons**, each `requires:"reed-pen"` and costing **premium ink
    + rare `red-ink`/`graphite`** (red-ink drops only from the very-rare Proofreaper → true end-game):
    **Vaporl Sword** 🗡️ (Apostrophantom's gas blade — long reach, slow; `effect:"possess"`), **Banana** 🍌
    ("surprisingly sharp…" — fast, short reach, highest raw attack), **Dooter** 🎺 and **Murmerer Mirror** 🪞
    (mirror also grants a little guard) — the last two are stat-only placeholders pending flavour/abilities.
  - All gear **persists forever** (`state.equip`/`state.gear`/`state.gearSeq`).
- **Garden — Braille crossword scaffold (`F` / 🌱, DEBUG-ONLY)** — a **debug-gated** modal (`IS_DEV`; buttons
  hidden + `openGarden` no-ops in prod) to validate the Braille-cell + crossword loop *before* the real garden
  (a walkable farm-sim map zone — see [`inklings-farming.md`](inklings-farming.md) §8). **Each bed IS a 2×3
  Braille cell** (dots 1-2-3 left / 4-5-6 right) on a small field (`GARDEN_COLS`×`GARDEN_ROWS`, default 5×4).
  Pick a crop from the 26-letter **palette**, then plant it into that letter's **dot pattern** (ghost guides
  show where; wrong plot = red, right pattern = the bed **grows** green) — forming the pattern *is* the lesson.
  Only **grown** beds count: **2+-bed rows/columns whose whole run is a real word** highlight (crossings gold),
  and **Harvest** yields +1 of each grown letter **plus each word paid by its POS** (noun→ink, adjective→potion,
  new words recorded; verbs advance Feats), **×1.5 on crossing words**. Persists
  (`state.garden = {cols,rows,cells:[[{letter,dots}]]}`). Seed economy/growth/seasons/walkable-zone are the real
  build (§8–9).
- **Verb stat ladders (Feats, `C`/`✦`)** — collecting distinct verbs levels you up per WordNet verb category
  along Korok-style milestones (1, then every **per-category step** — `VERB_STEP`, sized to each category's
  verb pool — with a **growing-gap repeat tail** + speed/heart caps so passive stats can't inflate with the
  huge verb pools); 5 categories populated (motion/competition/perception/
  possession/**body**) giving passive boosts + abilities (Slide, Finisher, Combo, Divine, Treasure Sense, Magnet,
  **Second Wind**). Data-driven from `data/verb-cats.json`; retroactive from the collection. See the code map
  (verb-category stat ladders) — remaining ~10 categories are meant to be filled into the same `VERB_LADDERS`
  table (candidate feats catalogued in [`inklings-grammar-systems.md`](inklings-grammar-systems.md) §5d).
- Outdoor home base (shop + the **house** that is your Library); bounded **daily map** of screens
  (`MAP_RADIUS`, currently 3×3; walls at the world edge), regenerated each real calendar day; walk-off-edge
  travel between screens with a smooth **screen-slide** transition; explored-area minimap (resets daily) — in the right desktop side panel / top mobile HUD band, with a
  translucent bottom-right on-canvas fallback on narrow desktop windows.
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
- Desk/Library: click-to-build word, **local WordNet** dictionary check with feedback states (new /
  known / invalid / "loading…" on the one-time bundle load). **Stable fixed-size panel** (`#overlay .book` is a
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
- Keyboard on desktop; **on-screen touch controls on mobile** (joystick bottom-left, action cluster
  bottom-right — movement under the left thumb, ATK under the right, matching the usual mobile/controller
  convention). See the Controls section + code map for details.
- **Background music** — two synthesized chiptune loops (`ChiptuneTheme`): a bouncy **field** tune outdoors
  and the cozy **Wordhoard** tune inside the library, crossfaded by `state.room`. Both fade to silence while
  any dialogue is open (resume seamlessly) and stop when muted / not started / tab hidden.
- **Sound effects** — synthesized chiptune blips (`SFX`, Web Audio, no asset files) on attack,
  capture, word results, unlock, and UI actions; mute toggle (`#sound-btn`, 🔊/🔇) persisted to
  `localStorage`.

**Stubbed / not yet done:**

- **Creature glyphs** — creatures render solely as their hand-drawn letter glyph from `Alpha.png`
  (the glyph sheet shared with Spin Nids) — no tile, eyes, or feet. Dedicated per-creature _art_
  (distinct bodies beyond the bare glyph) is still future work.
- **Dictionary** — validation + definitions + POS come from a **bundled local WordNet dataset**
  (`data/dictionary.json` + `data/inflections.json`; see code map). Works fully **offline**, no third-party
  API. ~63.8k dictionary entries (WordNet lemmas + ~130 curated **function words** WordNet lacks, so
  the/and/of/against validate with no reward) + ~29k inflected forms. Gaps: proper nouns, brand-new
  coinages, and some rare derivational forms.
- **Autosave (IndexedDB)** — progress persists automatically across reloads; Export/Import remain as
  manual backup/transfer; a **Reset** button (library footer, with confirm) wipes the save.
- **Library room (MVP)** — your home/study: entered via the **house** on the outdoor home (`nearHouse` →
  `enterLibrary`); holds the writing **desk** (spell words) + **book** lectern (mad-libs); `H`/faint/new-day
  return you to the desk; resting there heals. **Nouns wing:** the 26 shelf-levels map to WordNet noun
  categories and fill with per-hypernym **books** as you collect nouns (`data/noun-books.json`); walk to a
  shelf + `E`/**SHELF** → its books (`found/total`) → a book's roster with `?????` blanks for undiscovered
  words. See the code map + roadmap #4.
- Not started: genre books / procedural layouts, hero weapons, word effects, farming/ranching, town/trade.

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

**Keyboard (desktop):** Move `WASD` / arrows · Attack `Space` · Use bench when near it `E` · Open library `Tab` · Open bestiary `B` · Drink potion `1`/`2`/`3`
(size/speed/reveal) · Controls/help `?` · Close any panel `Esc`. (The `H` teleport-home hotkey and its
Home toolbar/touch buttons are currently disabled — the code and `teleportHome`/`goHome` are kept for a
future teleport item/power.)

**Touch (mobile):** On touch devices a DOM control overlay (`#touch`) appears over the canvas:

- **Joystick** bottom-left (`#joystick` + `#joy-thumb`, a fixed circular base) — drag the thumb; the
  clamped offset from centre becomes the movement vector (`joy.{active,x,y}`, `-1..1`, with a `JOY_DEAD`
  ~0.22 deadzone). Uses **pointer capture** so dragging past the base still tracks. In `update()` the
  joystick overrides the keyboard keys and the vector is normalized → **constant speed at any 360° angle**
  (replaced the old 4-way d-pad). Reset (thumb recentred) whenever the touch UI goes non-live.
- **Action cluster** bottom-right (`#tact`, `flex-direction:row-reverse` so **ATK** hugs the right edge
  under the thumb and the util grid sits inboard): a large **ATK** button (hold to keep swinging — `update()`
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
- **Title screen (`#startcard`)** — an NES-style title: full-viewport (`position:fixed`, `z-index:8` so it
  covers the side panels/pillars), a scanline + ink-gradient background, a big pixel **INKLINGS** logo
  (Press Start 2P with a black outline + red drop-shadow, gentle bob), tagline, a static player-sprite
  portrait (`#title-hero` canvas via `drawTitleHero`), faint drifting letters (`#title-fx`, `initTitleFx`),
  and a blinking **PRESS START**. `startGame()` (idempotent) begins on the button, **any key** (top of the
  keydown handler), or a **pointerdown** anywhere on the card; it hides the card and sets `state.started`
  (the À La Modal greeting no longer fires here — it waits for your first summon).
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
  bar is static at the bottom** (`order:1`, `flex-direction:row-reverse` → `#joystick` at the left end,
  `#tact` at the right end), and the
  **canvas is centered between them** (`justify-content:space-between`; `max-height:calc(100dvh - 230px)`
  with `width/height:auto` to preserve aspect and reserve room for both bars). Desktop is unchanged
  (HUD/controls stay absolute). When `#touch` isn't `.live` it's removed from the column (behind an
  overlay), which is fine because an overlay is covering the screen then.

---

## Roadmap (build order from here)

1. **Wire the spritesheet** — DONE: creatures draw their letter from `Alpha.png` via `SPRITESHEET`
   - `drawGlyph` (a–z = frames 0–25). Next sprite step is real per-creature _body_ art, not just glyphs.
2. **Dictionary** — DONE (local WordNet bundle): word validation + definitions + POS come from
   `data/dictionary.json` + `data/inflections.json`, generated offline by `build_dictionary.py`
   (WordNet/NLTK + lemminflect) + a curated function-word list (WordNet omits the/and/of/…). Fully offline;
   the Free Dictionary API was **removed**. The same script also emits **`data/noun-books.json`** (the Nouns
   wing index — noun → hypernym "book" + category, ~200 KB gzip; see roadmap #4) and **`data/verb-cats.json`**
   (verb → most-common-sense `verb.*` category, ~65 KB gzip; drives the verb stat ladders). Optional future polish: use
   the bundled `data/wordnet-relations.json` for new mechanics (see "Future mechanics (WordNet relationships)").
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
4. **Library room** — **Status: IN PROGRESS (MVP).** The Library is now your **home/study**: the writing
   **desk** (→ collection/bench) and **book lectern** (→ mad-libs) live inside it (they were removed from the
   outdoor home screen). **Display names** (code identifiers unchanged): the room = **The Wordhoard**
   (`state.room==="library"` / the `HOUSE`, labeled `WORDHOARD` / touch `HOARD`), the desk = **The Wordsmithy**
   (`desk` / `nearLibraryDesk` / `#overlay` title / touch `SMITHY`), the lectern = **Mad Libris**
   (`book` / `nearLibraryBook` / mad-libs / touch `LIBRIS`). You reach it from the outdoor home by the
   **house** (`House_5_Wood_Red_Red.png`, right of the shop; walk-up + `E`); the bottom entrance mat walks you back out beside the
   house. `H`/faint/new-day drop you **at the desk inside the library**, and resting there heals (the library
   is the rest point now). Laid out from `data/rooms/library.json` (30×24 grid, own non-square cells; solid
   objects block, floors/stairs/entrance walk). **Nouns wing (done):** the 13 shelves × 2 board-rows = 26
   **shelf-levels**, each mapped to one WordNet **noun category** (`noun.*` lexname) in a fixed order
   (`SHELF_ORDER` × `NOUN_BOOKS.categories`, concrete/common categories on the big top+mid shelves). A
   collected noun's **book** = the (immediate-ish) hypernym of its most-common concrete sense; the book
   appears as a plain spine on its category shelf-level once you own ≥1 of its words. Walk up to a shelf +
   `E` / touch **SHELF** → the shelf's two categories and their books (`found / total`); open a **book** →
   its full roster with discovered words clickable (→ `#defmodal`) and undiscovered ones as `?????` blanks.
   All derived from `data/noun-books.json` + `state.dex` (no new saved data). **Still ahead:** verb/adj/adverb
   wings on other floors, and swapping the placeholder pixel art for the staged tileset.
5. **Genre books + procedural layouts** — multiple book types with distinct tilesets and
   genre-weighted letter pools. Start with simple random scatter / room-and-corridor generation;
   do **not** build a clever dungeon generator first (classic time sink).
6. **Hero weapons** — convert the punctuation superheroes into implement upgrades with their
   dual-use bench powers (bow/wildcard, sword/contractions, belt/shout).
7. **Word effects (part-of-speech driven)** — **Status: partially DONE (nouns + adjectives).** POS now
   comes from the **bundled WordNet dictionary** — `localLookup` returns a `pos` array (for an inflected
   form, the resolved lemma's POS); new words cache it in their dex entry so re-spells need no lookup. **Nouns → ink** (currency,
   `inkForWord(word)` = word length). **Adjectives → a random potion** of `size`/`speed`/`reveal`
   (`POTION_TYPES`). Rewards are **repeatable** (re-spelling a noun/adj re-consumes its letters and
   pays again — the renewable loop); multi-POS words (noun+adjective) pay **both**. Potions are stored
   (`state.potions`), drunk on demand (HUD buttons / `1`/`2`/`3`) for a `POTION_DUR` (25 s) timed buff
   (`state.buffs`): size = bigger sprite + attack reach (`SIZE_MULT`), speed = faster move (`SPEED_MULT`),
   reveal = minimap shows the whole map + which screens still have letters (`screenRemaining`). `ink` +
   `potions` persist across days in the save (buffs are session-only). **Verbs → stat ladders** (see the
   next entry); adverbs/etc. still give no reward yet (collected to the dex). **Ink sink — the Stall:** a separate **shop building** on the home
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
   to `WOTD_FALLBACK` (the old built-in etaoinsr list). `2of12.txt` is a **local project-file fetch** (also
   used by the punctuators page) — used only to _pick_ the daily word, never for validation. Spelling it
   pays a one-per-day `WOTD_BONUS` (25) ink on top of any normal reward. `checkWord` computes
   `wotdUnclaimed` up front and (a) skips the "no reward, letters returned" early-out for the unclaimed
   WOTD, and (b) **honours the WOTD even if it isn't in WordNet** (accepts it with empty POS + generic def),
   since it came from our own 2of12 list — so the daily bonus is never blocked (e.g. a function word).
   `state.wotdDay` records the claim day (persisted; re-arms when the date rolls over). The desk overlay
   shows a `.wotd` banner (`updateWotd()`). The fuller vision below
   (adverbs→amplifiers, rarity tiers, choose-1-of-3) is still aspirational:
   every word does something, with zero per-word
   tagging, by keying effects off `partOfSpeech` (from the bundled WordNet data; see item 2).
- **Verb-category stat ladders** (`/* VERB-CATEGORY STAT LADDERS */`) — collecting **distinct verbs** levels
  the player up Korok-style. Each verb's category = its most-common-sense `verb.*` lexname, precomputed offline
  in **`data/verb-cats.json`** (`{word:category}`, `build_dictionary.py:build_verb_cats`, ~65 KB gzip; loaded
  into `VERB_CATS`). **Model:** `state.verbCounts` (distinct verbs per category; persisted, but **re-derived from
  `state.dex` × `VERB_CATS`** on load via `rederiveVerbCounts()` — retroactive + idempotent). Rewards are
  **derived** into `state.perks` by `computePerks()` (so nothing is a one-time increment); read through
  `moveSpeed()`, `attackDmg()` (incl. `comboBonus()`), `satchelCap()`, and boolean perks. A **new** distinct
  verb (in `commitSpell`) bumps its count → `onNewVerbWord` fires a **toast + `unlockbig` SFX** only on a
  milestone. **Thresholds:** `n===1`, then every **per-category `verbStep(cat)`** — `VERB_STEP` maps each
  category to a step sized to its verb pool (`data/verb-cats.json`): weather 3 · competition/consumption 6 ·
  the 500–899 tier (incl. body/perception/possession) 10 · social/motion 12 · contact/change/communication 15
  (default 5). Rung `at` values sit on that grid (up to a ladder's last explicit rung). Past that, milestones
  **repeat** `VERB_REPEAT[cat]` at a **growing gap** (step·1, step·2, step·3 … — positions `last+step·k(k+1)/2`)
  so passive stats grow **sub-linearly** and can't balloon with the huge verb pools; two stats also get an
  **absolute cap** (`MAX_MOVE_SPEED` 380 px/s for steerability, `MAX_HEARTS_CAP` 16 for the HUD heart-row).
  The grid math lives in `verbLast`/`isVerbMilestone`/`verbMilestonesUpTo`/`nextVerbMilestone`/
  `prevVerbMilestone`. Data table `VERB_LADDERS` ({at,type}); **tunable constants** grouped up top
  (`SPEED_STEP`,`MAX_MOVE_SPEED`,`ATTACK_STEP`,`SATCHEL_STEP`,`HEART_STEP`,`MAX_HEARTS_CAP`,`SECOND_WIND_SEC`,
  `SLIDE_*`,`FINISHER_*`,`COMBO_*`,`TREASURE_*`). **Populated now (5; ~10 more later via the same table) —
  regraded 2026-07 to the per-category steps:** *motion* 1→speed·12→**Slide**·24→speed·(then +12 speed at a
  growing gap); *competition* 1→attack·6→Finisher·12→attack·18→Combo·(+6 attack, growing gap); *perception*
  1→**Divine**·10→Treasure Sense·20→Keener; *possession* 1→+satchel·10→**Magnet**·20→+satchel; *body*
  1→**+1 heart**·10→**Second Wind**·20→+1 heart. **Abilities:** only **Slide** is active — `Shift`/`tc-slide`, `startSlide()`, a
  forward lunge using sprite **row 6** (`PR.slide`). Finisher/Combo apply in `doAttack` (`combo`
  counter/window/miss-reset). **Divine** = a daily letter peek in the book view (`useDivine`, `state.divine`/
  `divineDay`, day-scoped like WOTD). **Treasure Sense/Keener** draw a pulsing glint on pickups (`drawPickup`,
  scales with `perks.treasure`). **Magnet** gates the pre-existing pickup homing (contact-collect stays
  default) — *fixed 2026-07: `computePerks` never set `p.magnet`, so the perk was inert until now.* **Second
  Wind** (body) recovers a heart after `SECOND_WIND_SEC` (8 s) out of combat **in the field** (the timer
  `p.swT` counts up in the field update, resets on any hit; home/base still heal via `HEAL_SEC`).
  Speed/Attack/Satchel/**+max hearts** are passive via the getters (`maxHearts()` now adds `perks.hearts`).
  **Feats panel** (`#stats`, `state.statsOpen`, `C`/`✦` `tc-stats`, `renderStats`) has **Ladders / Words /
  Guide** tabs (`statsTab`, `#stats-tabs`): **Ladders** (the 5 populated ladders —
  rewards earned, verb count, progress bar) and **Words** (`renderVerbWords` — your collected verbs grouped by
  all 15 WordNet verb categories, populated-ladder cats first, chips → `#defmodal`). **Progress feedback:** *every* applicable verb pops the panel and CSS-animates that
  category's bar to its new fill (`showFeatProgress`/`featAnim`) — a **milestone** fills to 100%, shows the
  reward, and stays until dismissed; a **plain step** auto-dismisses after ~1.4 s. Milestone + letter-unlock on
  the same word are **staggered** via a small `celebrations` queue (`queueCelebration`/`nextCelebration`,
  `pendingFeat`): the Feats pop shows first, then the new-letter modal on its close. Persisted: `verbCounts`,
  `divineDay`,`divine`.
- **À La Modal companion** (`/* À LA MODAL */`) — a self-contained module drawn on canvas. `ALaModal`
  (`mode:"follow"|"speak"`, `x/y` lerp to hover up-right of the player, `bob`/`hl`/`hr` animation phases,
  `popT` speak scale-in, `hitRects` for buttons).
  `ALaModal.update(dt)` (called in `update`) trails the player + advances animation;
  `ALaModal.draw(ctx)` (called last in `render`, both branches) draws the large speak sprite whenever
  `mode==="speak"`, else the small follow sprite **only when `following`** (YES sets it, NO clears it — opt-in;
  `alaFollowOpts`). Drawing helpers: `drawModalSmall`/`drawModalLarge` (via shared `alaScoop` — now with a
  scalloped spreading ruffle at the scoop base — plus `alaHand`/`alaSet`), `drawModalSpeak` (docks
  bottom-left, pop-in, speech bubble via `alaWrap`). Her speech bubble is set in **Baloo 2** (a rounded, mobile-
  legible Google font, `500 19px`, system-sans fallback) rather than the pixel body font — since it's canvas-only,
  the load is kicked off explicitly with `document.fonts.load`. The large sprite goes through **`drawModalLargePixel`**: it
  renders `drawModalLarge` into a `1/PIX` offscreen buffer (`_alaBuf`) then blits it back up with
  `imageSmoothingEnabled=false` for a pixelated look; `drawModalLarge`'s box/button rects use `roundRectP(c,…)`
  (context-aware) so they draw into the buffer, and hit rects stay in screen space. Buttons are
  **canvas-drawn + hit-tested**: a `cv` `pointerdown` maps CSS→720×528 px and calls `ALaModal.hit` → `onYes`/
  `onNo`/dismiss (×). `ALaModal.speak(text,{onYes,onNo})` / `dismiss()`. `alaSummon` (key **M** /
  `tc-modal` 💬): the **first** summon each session plays her greeting/intro (`_alaGreeted`); after that it
  shows a placeholder hint from `ALA_HINTS` (modal-verb voice). No greeting fires on open anymore.
  **Ice-cream easter egg:** hovering the cursor over the follow-sprite's scoop (a `cv` `pointermove` →
  `ALaModal.overIce`, hit-tested against the last-drawn `_sx/_sy/_sS`) turns the cursor into an SVG **spoon**
  (`SPOON_CURSOR`) and makes her **frown** (`drawModalSmall` swaps to angry brows + inverted mouth when
  `m.iceHover`) with a scolding **"Don't eat my ice cream!"** bubble (`drawIceGuard`) + an `invalid` blip
  (`reactIce`); `pointerleave`/moving off restores the cursor. Only active while the small follow sprite shows.
- **Interactable obstacles** (`/* INTERACTABLE OBSTACLES */`) — data-driven **`OBSTACLES`** array (`{id, screen:[sx,sy],
  bands:[rect,…] (an L: mid-left arm + down arm), letter:{x,y}, title, prompt, accept:[verbs], success,
  jokes:{verb|@category:line}}`). `obstacleFor(sc)` matches by `sc.sx/sc.sy` (stored on each screen);
  `obstacleBlocks` adds every band to `canStand` (blocks until solved-today), `nudgeOutOfObstacle` snaps you to
  the near bank on entry, `drawObstacle` renders the water/banks + the glinting corner reward letter (no
  stepping-stones — once crossed you just walk over). The **field update** opens the mad-lib on touch
  (`openObstacle`, re-armed via `_obstacleArmed`) and, once passable, **collects the corner letter on contact**
  (`rewardLetter()` = today's rare letter, deterministic from `daySeed`; `state.obstacleGot[id]=today`). Modal
  `#obstacle` (`state.obstacle`): a picker of your collected verbs (`renderObstaclePicker`, greying spent ones) →
  **`resolveObstacle`** = curated `accept` → success (river passable: `obstacleDay[id]=today`, verb pushed to
  `riverCrossed`), specific/`@category` (via `VERB_CATS`) joke, else rotating `DEFAULT_NOPES`. **Resets daily**
  (`obstacleDay`/`obstacleGot` day-scoped); crossing verbs single-use forever (`riverCrossed`). All persisted.
- **Spilled-ink puddle** (`/* SPILLED-INK PUDDLE */`) — a non-blocking daily gag, separate from `OBSTACLES`.
  `inkScreenCoord()` picks the day's screen from `daySeed` (off home base); `inkPos(sc)` picks/snaps a walkable
  tile on it (cached in `_inkPos`/`_inkPosDay`). The **field update** touch-triggers `openInk` (re-armed via
  `_inkArmed`) and, while `inkPrints()`, drops footprints into `state.prints` (a rolling 44-entry trail, tagged
  by screen). `drawInk`/`drawPrints` render the blob + trail; `drawPlayer` tints the sprite via
  `ctx.filter="brightness(0)"` while `inkInked()`. Reuses modal `#obstacle` via `openInk`/`renderInkPicker`/
  **`resolveInk`** (crossing list or `@competition` → clear + jet-black + `INK_REWARD` ink; `@motion` → clear +
  footprints + ink; `@consumption` → −1 heart, no clear; `@communication` → gag, no clear; else `DEFAULT_NOPES`).
  Day-scoped state: `inkClearedDay`/`inkedDay`/`printsDay` (all persisted); reset in `startNewDay`.
- **Equipment** (`/* EQUIPMENT */`, `#equipment` overlay, `state.equipOpen`, opened with `G` / 🎒 `tc-gear`).
  Data: **`EQUIP_SLOTS`** (7 slots + locked `weapon`, each with anatomical `pos:{t,l}` percentages) and
  **`EQUIP_ITEMS`** (`{name, emoji, slot, tier, bonuses:{hearts,guard}, effect:null, recipe:{ink,mats}}`).
  State: `state.equip` (slot→gear uid), `state.gear` (`[{uid,item}]`), `state.gearSeq` — all persisted; loaded
  via `sanitizeEquip` (drops unknown items / dangling slots) then `player.hearts=maxHearts()`. **Bonuses stack**
  via `equipBonuses()`, surfaced through **`maxHearts()`** (= `PLAYER_MAX_HEARTS` + Σhearts) and
  **`hurtIframes()`** (= `HURT_IFRAMES` + Σguard) — these replaced the raw constants in the heart draw/heal/
  faint/hurt/potion paths, so bare behaviour is unchanged. `equipOwned`/`unequipSlot` adjust current hearts by
  the Δmax (`afterEquipChange`). `craftEquip` spends ink + `state.resources` mats (`canAffordRecipe`) and pushes
  a new instance. `renderEquip` draws the static sprite (`drawEquipDoll`, idle-down frame, pixelated) + slots +
  Bag/Craft panel (`_equipTab`) + a live bonus footer. `state.equipOpen` is in every overlay guard (movement,
  `canBeHurt`, hints, `musicDialogueOpen`). The `effect` hook + `weapon` slot are the seams for future
  punctuation-hero gear.

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
9. **Collection curation (the Wordhoard rewards layer)** — **reframed from the old "town / trade" idea.**
   Decision #4 keeps **no town**; instead a **librarian/curator NPC inside the Wordhoard** hands out
   **one-time grants** when you complete collection subgoals ("bundles"). Bundles **reuse the Nouns-wing
   `found/total`** (a book/category threshold), so there's no new content to author. Rewards are **placeable
   decorations** for the Wordhoard, dropped on the **tile you're facing** — a **placement primitive shared
   with farm planting** (build once). **Pure grant, nothing gated** (not a community center). See
   [`inklings-collections.md`](inklings-collections.md). **Status: steps 1–2 + 4 DONE** — the **curator**
   panel (`#curation`, per-category `found/total` progress), the **Claim + grant** milestone economy
   (category thresholds 5/15/30 → a one-time décor gift; `state.bundles`, `claimBundle`, snapshot `v:6`), and
   the **shared facing-tile décor placement** (the tray + `tileInFront` ghost place/pick-up in the Wordhoard).
   Remaining: the cozy square `(0,1)` as a second placement venue + the librarian's art/voice.
10. **Limit the starting letters** - start with only lowercase letters and the more common letters (not all).
    **Status: DONE (incl. capitals groundwork).** Lowercase unlock one at a time in frequency order; once all
    26 are unlocked, capital letters unlock the same way (`CAP_ORDER`/`capUnlockAt`) and spawn as rare
    capital inklings (glyphs = Alpha.png 26–51). Capitals are collectible + usable at the desk now
    (Shift/⇧, case-insensitive validation). **Still ahead:** make capitals *matter* — a geography level where
    country/capital-city **proper nouns** require the leading capital (a separate proper-noun validation
    source, since the bundled WordNet dictionary won't have most place names).
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

12. **Future mechanics (WordNet relationships)** — **Status: NOT STARTED (data bundled, unused).** The
    WordNet migration also ships `data/wordnet-relations.json` — a per-word relation graph
    (`hyper`/`hypo`/`mero`/`holo`/`tropo`/`entail`/`cause`/`ant`/`sim`/`attr`/`pert`/`deriv`, each resolved
    to single-word lemmas). Nothing loads it yet; it's bundled so these ideas can be *designed later, not
    built now* — the payoff of the migration, reusing the graph instead of hand-tagging content:
    - **Category hunts / collect-a-family** (`hypo`): "spell 4 kinds of BIRD" — auto-generate themed
      library shelves from the graph.
    - **Word ladders** (`hyper` chains): climb OAK → TREE → PLANT → ORGANISM, each rung verified.
    - **Part-assembly crafting** (`mero`): spell a thing's parts to build/restore it — natural fit with
      bookbinding (SPINE, PAGE, COVER, BINDING → bind a book).
    - **Guess-the-word-from-clues** (graph as hint engine): describe a mystery word via its relations
      ("a kind of ANIMAL, has a MANE, opposite of tame") and the player spells it.
    - **Antonym duels & synonym bridges** (`ant`/`sim`): "spell the opposite of BRAVE"; or step
      word-to-word through synonyms.
    - **Verb-manner play** (`tropo`/`entail`): refine a scene's verb (MOVED → TIPTOE, SPRINT).
    Note (data caveat): relations are aggregated at the **word level** (merged across all senses), so a
    word with rare senses carries some cross-sense noise — a real feature would likely filter by sense/POS.

---

## Conventions for working on this project

- Keep the game a single self-contained file with **no runtime third-party services** (fully offline),
  unless a feature truly requires one (say so and why). Current fetches are all **local project files**:
  the bundled WordNet dictionary (`data/dictionary.json` + `data/inflections.json`, from `build_dictionary.py`;
  `data/wordnet-relations.json` is bundled but dormant), `2of12.txt` (Word-of-the-Day picker only, not
  validation), the mad-libs chapter JSONs in `data/levels/`, `data/creatures.json`, and
  `data/rooms/library.json` (the Library room layout). The old Free Dictionary API was removed — no external
  API at runtime.
- Protect the MVP loop. New systems are layers on the working core, shipped one at a time, each
  independently testable.
- Maintain the ink-and-paper identity and the vocabulary above.
- Prefer the simplest thing that proves the fun (e.g. random scatter before procedural gen,
  list before library room, click before drag).
- Spend polish budget on the **word-collection moment** — the definition reveal is the emotional
  core; that half-second should always feel good.
- **Emoji are placeholders.** Where a system shows an emoji as content-art (a creature, an item, a
  décor piece — not a UI affordance like ⚙️/✖), treat it as a **stand-in for future sprite art** and
  render it through **one swap point** so real art lands with no scattered edits. The reference pattern
  is fishing's **`fishGlyph(ph)`** (the sound-fish creature) — every fishing + Phonicon view renders the
  emoji through that single function, so swapping to `sprites/` PNGs (like creatures already do via the
  `sprite`/`spriteSize` loader, §Creatures) is a one-function change. When you add a new emoji-fronted
  system, give it its own `xGlyph()` helper rather than inlining the emoji at each render site. (Existing
  inline-emoji spots — e.g. `EQUIP_ITEMS.emoji`, décor — pre-date this rule; centralize them opportunistically
  when touched, don't do a blanket retrofit.)

---

## Open questions

- **Spritesheet mapping.** RESOLVED for `Alpha.png`: it's a glyph sheet, not creature art — 7×8
  = 56 cells holding a–z (frames 0–25), A–Z (26–51), and a few punctuation glyphs (e.g. `!` at 54).
  We map a–z → 0–25 in `SPRITESHEET.letterToFrame`. Open question reframed: if dedicated creature
  _body_ art (multiple frames or alternate forms per letter) is ever added, it would be a separate
  sheet with its own `letterToFrame`/frame-animation scheme.
