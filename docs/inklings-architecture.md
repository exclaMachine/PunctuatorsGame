# Inklings — Architecture, Maps & Portability

Planning doc. **Read this before touching the map layer or starting an engine port.** It captures the
agreed direction (authored geography + daily contents), the engine-neutral data schema that Tiled/LDtk
exports will target, a phased refactor plan to get there, and notes for a possible future Godot port.

Status: **plan only — not yet implemented.** The game today still generates the whole overworld
procedurally (`genScreen`/`genTiles`). Nothing here is built; it's the target.

---

## 0. TL;DR

- **Direction (confirmed): hybrid.** The *map* (terrain, landmarks, where you can walk/cross) is
  **hand-authored in Tiled or LDtk and fixed** — same geography every day. What *spawns onto* the map
  (letter-creatures, monsters, ink puddle, Word-of-the-Day letters) is **rolled fresh each day from the
  date seed**. The Wordle rule stays: collect all of today's letters → done for the day.
- **Godot: options-open only.** Not a near-term plan. A port is a *rewrite* regardless (no JS runs in
  Godot). We keep it cheap by staying **data-driven** and keeping a **neutral design/data spec** — this
  doc — current. We do **not** add JS "engine-abstraction" indirection for it.
- **Next build step:** the map-seam refactor in §6, which is what actually lets your Tiled/LDtk maps drop
  in. Do it in phases so nothing breaks.

---

## 1. Jargon (plain-language glossary)

- **Tile layer / terrain layer** — the grid of ground tiles for a screen (grass, path, water, rock).
  Today this is a 30×22 array of ints (`tiles[row][col]`), made by `genTiles`. In LDtk this is an
  **IntGrid** layer; in Tiled it's a **tile layer**.
- **Entity / object** — a *thing placed on* the map that isn't terrain: the shop, the library door, the
  river obstacle, a spawn zone, a letter-creature. In LDtk/Tiled these live on **entity/object layers**.
- **Authored** — made by hand in an editor (Tiled/LDtk), saved to a file, the same every day.
- **Runtime / procedural** — created by code at play time. Here, seeded by the day so it's the same for
  everyone that calendar day but different tomorrow (`state.daySeed`, `mulberry32`/`hash2`).
- **Seam** — the boundary between two parts of the code. The seam we care about: *map data* on one side,
  *renderer + collision* on the other. If the renderer only ever reads a clean map struct (never the
  generator's internals), you can swap the *source* of that struct (procedural → authored file) without
  touching the renderer.
- **Spawn zone** — an authored rectangle/region that tells the daily spawner "letters/monsters may appear
  here," optionally with a weight/difficulty. Lets you author *where* things spawn without authoring
  *what* (the what is daily/random).
- **Gate** — an opening in a screen edge where you can cross to the neighbouring screen (vs. a walled
  edge). Today gates are *seeded daily* (`vGateRow`/`hGateCol`); in the hybrid model they become
  **authored & fixed** (part of the geography).

---

## 2. Current architecture (what's clean, what's coupled)

**Screen model (today).** The world is a bounded grid of screens, `MAP_RADIUS = 2` → **5×5** screens
(home at `(0,0)`; `sx,sy ∈ [-2,2]`). Each screen is **30×22 tiles** at `TS = 24 px` → the 720×528 canvas.
Tile types: `T_GRASS 0, T_PATH 1, T_WATER 2, T_ROCK 3`; `walkType(t)` = grass or path. Tiles are drawn
**procedurally** by `bakeTile` (per-tile pixel art, seeded variation) — **there is no tileset image.**

**`genScreen(sx,sy)`** returns a screen struct:
`{ creatures, tiles, pickups, slicks, seed, bg, waterTiles, generated, isBase, dist, sx, sy }`.

- ✅ **Clean seam already:** the renderer (`renderWorld` → `ensureBg`/`bakeTile`) and collision
  (`canStand`/`walkType`) read `tiles` (2D int grid) and `creatures` (array). Swapping the *source* of
  `tiles` is the main lever.
- ⚠️ **Out-of-band (not in the struct)** — these must move into per-screen authored data for a fully
  data-describable screen:
  - **Obstacles** — the `OBSTACLES` global array (the river), matched to a screen by coords.
  - **Structures** — the shop `STALL` and the `HOUSE` (library door), hardcoded onto the base screen.
  - **Gates** — edge openings from `vGateRow`/`hGateCol` (currently daily-seeded).
  - **Spawn rules** — letter counts / resource-creature rolls live inside `genScreen`, keyed off
    `isBase`/`dist`, not off authored zones.
- ✅ **Rooms already prove the authored pattern:** `data/rooms/library.json` (schema: `cols, rows,
  floors[], entrance{leadsTo}, objects[]`) is loaded by `buildLibrary` — this is the template the
  overworld schema below copies.

**Browser coupling (matters for Godot, not for Tiled maps):** ~191 DOM refs (modals/HUD), ~168 canvas
`ctx` calls, IndexedDB save, Web-Audio synth music, `document.fonts`. All replaceable in Godot, all a
rewrite.

---

## 3. Target: neutral screen/map data schema

One screen = terrain + entities + gates, fully described by data. Editor-agnostic (a thin importer maps
a Tiled or LDtk export → this shape). Models the library-room schema.

```jsonc
{
  "schemaVersion": 1,
  "screen": {
    "sx": 0, "sy": 0,               // grid coords in the world
    "cols": 30, "rows": 22, "tileSize": 24,
    "tiles": [[0,0,1,2, ...], ...],  // AUTHORED terrain (grass/path/water/rock or richer set)
    "gates": {                       // AUTHORED edges: opening span, or omitted = walled
      "left":  { "row": 10, "h": 2 },
      "right": { "row": 10, "h": 2 },
      "top":   null,
      "bottom":{ "col": 14, "w": 2 }
    },
    "entities": [                    // AUTHORED objects placed on the map
      { "type": "structure", "id": "shop",    "col": 3,  "row": 8, "w": 4, "h": 3, "interact": "openShop" },
      { "type": "door",      "id": "library", "col": 12, "row": 6, "w": 2, "h": 2, "leadsTo": "library" },
      { "type": "obstacle",  "id": "river",   "kind": "madlib", "region": [/*rects*/], "promptId": "river" },
      { "type": "spawnZone", "region": { "col": 6, "row": 4, "w": 18, "h": 14 },
                             "spawns": ["letter","monster"], "weight": 1.0 }
    ]
  }
}
```

**Runtime layer (NOT in the file — rolled each day):** the daily spawner reads `spawnZone`s + walkable
tiles + `daySeed` and places today's letter-creatures, monsters, ink puddle, and pinned WOTD letters.
The daily letter total still drives the Wordle "all collected → done."

A **world index** ties the screens together, e.g. `data/maps/index.json` →
`{ mapRadius, tileSize, screens: { "0,0": "home.json", "1,0": "east.json", ... } }`.

---

## 4. Authored vs runtime — who owns what

| Concern | Authored (Tiled/LDtk, fixed) | Runtime (daily seed) |
| --- | --- | --- |
| Terrain (grass/water/rock/path) | ✅ | |
| Landmarks (shop, library, river, bridges) | ✅ | |
| Screen-edge gates / room doors | ✅ | |
| Obstacle placement + which kind | ✅ | (its daily *state*, e.g. solved-today, stays runtime) |
| Spawn zones (where things may appear) | ✅ | |
| Which letters / how many, monster mix | | ✅ seeded by `daySeed` |
| Ink puddle location | | ✅ seeded |
| WOTD pinned letters | | ✅ seeded |
| "All letters collected → day done" | | ✅ (unchanged Wordle rule) |

Rule of thumb: **geography = authored; population = daily.**

---

## 5. Tiled vs LDtk — pick either; here's the fit

Both work; the schema in §3 is the target and we write a thin importer for whichever you choose.

- **LDtk** — fits this game *slightly* more naturally: **IntGrid** layer = our terrain, **Entity** layers
  = structures/doors/obstacles/spawn-zones, and its **World** view is literally a grid of levels =
  our screen grid (GridVania). Clean JSON, entity fields map 1:1 to our `entities`.
- **Tiled** — more general-purpose: a **tile layer** for terrain + **object layers** for entities. Just
  as doable; you hand-place objects with custom properties.

Recommendation: **LDtk** if you like the grid-of-levels + IntGrid + typed entities workflow; **Tiled** if
you prefer its broader tooling. Decide before we write the importer — it only affects the importer, not
the neutral schema or the game code.

---

## 6. Seam-tightening refactor plan (phased — this is what lands your maps)

Goal: make a screen **fully data-describable**, then let the source be an authored file. Each phase is
shippable on its own and keeps today's procedural game working.

- **Phase 1 — Unify the struct (no behavior change).** Fold the out-of-band pieces (§2) into the screen
  struct: `genScreen` also emits `gates`, `structures`, `obstacles`, `spawnZones` (derived from today's
  code). Point the renderer/collision at the struct's fields instead of the globals. *Result:* the game
  looks identical, but everything a screen needs is now in one object.
- **Phase 2 — Split source from population.** Refactor into `buildScreenGeography(sx,sy)` (terrain +
  entities) and `populateScreen(screen, daySeed)` (spawn creatures/ink/WOTD onto it). Today geography is
  still procedural, but the split mirrors §4.
- **Phase 3 — Authored loader.** Add `loadMapScreen(sx,sy)` that reads `data/maps/*.json` (our neutral
  schema) for geography, with the procedural generator kept as a fallback. Add the Tiled/LDtk → neutral
  importer (a small build script, like `build_levels.py`).
- **Phase 4 — Author the real maps.** You build the 5×5 (or larger) world in Tiled/LDtk; export → import
  → `data/maps/`. `populateScreen` fills it daily. Retire the procedural terrain (keep it behind a flag
  for a bit).

Notes / gotchas surfaced along the way:
- **Gates become fixed.** Today edges move daily (`vGateRow`/`hGateCol`); authored gates are fixed
  geography. Expected and desired for landmarks.
- **The reward-letter-on-water bug** (a fixed-coord obstacle reward can land on non-walkable tile) goes
  away once rewards are authored/snapped — fold the fix into Phase 1.
- **Map size** (`MAP_RADIUS`) becomes whatever you author; the world index declares it.

---

## 7. Save format & content data inventory

- **Save:** IndexedDB (`inklings_save`), `snapshot()`/`applySnapshot()`. Persist-forever vs day-scoped is
  documented in `docs/inklings.md`. For a port, this is a plain JSON blob → any key/value store
  (Godot `user://`). Keep the snapshot JSON-clean (already is).
- **Content data (all transfer directly to any engine):** `data/dictionary.json`, `data/inflections.json`,
  `data/creatures.json`, `data/rooms/*.json`, `data/noun-books.json`, `data/verb-cats.json`,
  `data/levels/*.json`, `2of12.txt`. Future: `data/maps/*.json` (this doc). Generators:
  `build_dictionary.py`, `build_levels.py` (add a `build_maps.py` importer in Phase 3).

---

## 8. Godot portability (options-open level)

A Godot version is a rewrite; the value we preserve is design + content + rules, not code.

- **Transfers directly:** every `data/*.json`; the deterministic algorithms (seeded RNG, generation
  rules, word validation) reimplemented 1:1; this doc + `docs/inklings.md` as the spec.
- **Re-authored (straightforward):** procedural `bakeTile` art → a Godot **TileSet** (and once maps are
  authored, a Godot `TileMap` can consume the same Tiled/LDtk source — LDtk has a Godot importer);
  DOM UI → `Control` nodes; IndexedDB → `user://` `FileAccess`; Web-Audio synth → `AudioStream`.
- **Discipline to keep now (cheap):** keep new content in data files; keep game *rules* separable from
  *drawing* where it's natural (don't compute state inside draw calls); keep the save JSON-clean; keep
  this doc current. That's it — no runtime abstraction layer.

---

## 9. Open decisions

1. **Tiled or LDtk?** (Only affects the Phase-3 importer.)
2. **World size** once authored (stay 5×5, or grow?).
3. **Richer terrain set?** Authored maps make more tile types cheap (sand, floor, cliff, bridge…) — decide
   the palette when authoring.
4. **Do gates stay per-edge openings, or move to explicit door/path entities?** (Either fits the schema.)
