# Inklings — Object Placement & the Cozy Square (0,1)

Planning doc. **Read this before touching object placement, the farm zone, or décor.** It specs the **one
shared facing-tile placement primitive** that both farming (plant a seed / pen an animal) and the Wordhoard
collection reward (place a decoration) were always meant to share — the "build it once" system flagged in
[`inklings-farming.md`](inklings-farming.md) §8 and [`inklings-collections.md`](inklings-collections.md) §5 —
plus the **new persistent cozy square** that hosts the walkable farm.

Status: **plan only — not yet implemented.** Direction settled with the dev (§1). Build order in §6.

Cross-refs: [`inklings.md`](inklings.md) · [`inklings-architecture.md`](inklings-architecture.md) (the farm is
an authored persistent zone; this special-cases one overworld screen until the Tiled/LDtk pipeline lands) ·
[`inklings-farming.md`](inklings-farming.md) (garden beds — the throwaway modal graduates to *this* zone) ·
[`inklings-collections.md`](inklings-collections.md) (décor = category-milestone gifts) ·
[`inklings-ciphers.md`](inklings-ciphers.md) (the pens live here too).

---

## 0. TL;DR
- **The cozy square = screen `(0,1)`** — one down from home. A **persistent, hazard-free** zone: **no
  creatures, no water, no rock** spawn there, and the objects you place **persist forever** (not day-scoped).
  Keeps the crowded home square `(0,0)` (shop + Wordhoard) clear.
- **One shared placement primitive** — `tileInFront()` + a **ghost-preview place / pick-up mode**. Selecting an
  item draws a translucent ghost on the tile you're facing; **E** drops it iff the tile is valid; a pick-up mode
  reverses it. **Planting a seed, penning an animal, and setting down décor are the same verb.**
- **Décor is placeable in *both* venues** — the Wordhoard room *and* the cozy square. Same primitive, per-venue
  collision, one `where` key on each placed object.
- **Décor comes as gifts** for **category milestones** in the Wordhoard (5 / 15 / 30 of a noun category — the
  [`inklings-collections.md`](inklings-collections.md) default). Pure grant, no gating.
- **Built by special-casing `genScreen` for now**, kept seam-clean so the dev's future **Tiled/LDtk** map
  ([`inklings-architecture.md`](inklings-architecture.md)) can author `(0,1)` and replace the special case.

---

## 1. Decisions (settled with the dev)
1. **Cozy square is `(0,1)`.** Garden beds, cipher pens, and décor all live one square below home. It never
   spawns beasts/water/rock, and placed objects there persist.
2. **Décor places in *both*** the Wordhoard and the cozy square (the dev picked "Both"). The primitive is
   venue-agnostic; a `where` field on each placed object records which venue it's in.
3. **Ghost-preview place / pick-up** is the interaction (not auto-slots). It's the real primitive farming needs
   anyway, so build it up front.
4. **Décor gifts = category milestones.** Museum-style thresholds on a noun category; no impossible-set
   dead-ends. (See [`inklings-collections.md`](inklings-collections.md) §2.)
5. **Special-case the generator now; author later.** The dev intends to rebuild most of the map in Tiled/LDtk
   eventually — so keep `(0,1)` data-describable and don't bake assumptions that the importer can't reproduce.

---

## 2. The cozy square `(0,1)` — persistent & hazard-free
The overworld is a **daily-reset, procedural** 5×5 grid (`genScreen(sx,sy)`; home is `(0,0)`, `sy` increases
downward). `(0,1)` becomes a **special case**:

- **Terrain:** all **grass/path**, no `T_WATER`/`T_ROCK`. Either pass a flag to `genTiles(sx,sy,isBase,isFarm)`
  so it skips the water/rock passes, or hand it a flat all-grass grid. (A little authored path/fence dressing is
  fine and cheap.)
- **Population:** **empty** — skip the `!isBase` letter-scatter and the `RESOURCE_POOL` roll. Tag the struct
  `isFarm:true` next to `isBase` so render/collision/interact can branch on it.
- **Persistence:** unlike every other overworld screen (regenerated from the date, never saved), `(0,1)`'s
  **placed objects come from saved state** (§5), not the day seed. The *terrain* can still regenerate (it's
  deterministic and hazard-free); only the **placed layer** persists.
- **Entry:** reached by walking **down** off the home screen's bottom gate — no door/modal. It's a real
  overworld screen, so movement/transitions already work; it just won't try to kill you.

**Seam note (for the future Tiled/LDtk port):** this is exactly an **authored persistent screen** in
[`inklings-architecture.md`](inklings-architecture.md) §3–§4 (geography authored, population empty). When the
map pipeline lands, `(0,1)` becomes a `data/maps/0,1.json` and the special case retires. Keep the placed-layer
data engine-neutral (plain JSON) so it survives the swap.

---

## 3. The shared placement primitive
One generic system, reused by décor, seed-planting, and pen-placing. **Don't implement these separately.**

### 3a. `tileInFront(sc, p)` — the facing tile
- Read the **active venue's cell size** (`sc.cw||TS`, `sc.ch||TS`) — the library uses non-square `cw/ch`, the
  cozy square uses `TS` — exactly as `blockedAt` already does.
- Snap `p.face` to a **cardinal** (dominant axis, like the attack/sprite code's
  `horiz=Math.abs(p.face.x)>=Math.abs(p.face.y)`), so diagonal facing still targets one clean cell.
- Foot cell = `((p.x)/cw|0, (p.y+FOOT_DY)/ch|0)`; **facing cell = foot cell + cardinal offset**. Return
  `{cx, cy}` (or null if out of bounds).

### 3b. Validity — can I place here?
The facing cell must be:
- **in-bounds** and its terrain **walkable** (`walkType` — grass/path), i.e. **tillable** for seeds;
- **not overlapping a solid** placed object (reuse the `overlapsSolid` box test over this venue's placed list);
- **not on** a fixed interactable (Wordhoard desk/book/curator/shelf/entrance; the cozy square's future stall);
- **not on the player** themselves.
Seeds add one rule (must be bare tillable soil); décor may sit on any valid open tile.

### 3c. Place / pick-up mode (the ghost)
- Enter placement mode by **selecting an owned item** (a décor from inventory, a seed/animal in the farm) from a
  small picker. A **translucent ghost** of that item draws on the facing tile each frame — **green tint = valid,
  red = blocked** (drives off §3b).
- **E** (or a dedicated touch/toolbar button) **confirms** — moves the item from owned → placed.
- A **pick-up/remove** mode faces a placed item and lifts it back into owned inventory (reverses the confirm).
  Facing an empty tile in pick-up mode does nothing.
- Esc / toggle exits the mode.

### 3d. Rendering & collision
- **Render:** placed objects draw as a **pass on top of the venue's baked background** — after `LIBRARY.bg` in
  `drawLibraryRoom`, and as a new draw pass for `(0,1)` in `renderWorld`. Crops/pens draw the same way.
- **Collision:** a placed object may be **`solid`** (blocks like a shelf/fence) or **walkable** (a rug). Solid
  placed objects feed `canStand` via the same `overlapsSolid`-style scan the desk/shop/stall already use —
  add a "blocked by a placed solid in this venue" check alongside the existing ones.

---

## 4. Décor — the gift, the catalog, the flow
- **Source:** completing a **category milestone** in the Wordhoard (via the curator, per
  [`inklings-collections.md`](inklings-collections.md) §3/§8.2) grants a décor item **once**.
- **Catalog:** `DECOR = { id: { name, emoji|sprite, solid, size } }` — placeholder emoji first, swappable for
  pixel sprites later (same drop-in pattern as equipment/crops).
- **Flow:** earning adds to an **owned-but-unplaced** inventory → placement (§3) moves it into the venue's
  **placed** list. Both persist forever like `dex`.
- **Fit:** scholar's-study curios (globe, brass lamp, potted fern, terrarium, bust, rug); some tied to the set
  that granted them ("birds set → stuffed-owl trophy"). MVP **cosmetic**; keep a `perk` field spare for later.
- **Second grant type:** a themed set can grant a **story companion** instead of / alongside décor — same
  one-time trigger, see [`inklings-companions.md`](inklings-companions.md).

---

## 5. State & saves
- **`state.decorOwned`** — earned, unplaced décor (ids + counts).
- **`state.placed`** — every placed object: `[{ id, kind, where, cx, cy }]`, where `kind ∈ {decor, crop, pen}`
  and **`where ∈ {"library", "0,1"}`** (the venue). Décor can appear under either `where`; crops/pens only under
  `"0,1"`. Renderers/collision filter by the current venue.
- **`state.bundles`** — claimed category-milestone ids (one-time), from [`inklings-collections.md`](inklings-collections.md) §6.
- All persist forever (not day-scoped). **Bump the snapshot version** and add the keys to
  `snapshot()`/`applySnapshot()` + Export/Import. Re-derive *claimable* milestones from `state.dex × NOUN_BOOKS`
  on load (only the *claimed* flag needs storing); placed objects load verbatim.
- **Keep it JSON-clean** so a future Tiled/LDtk world and/or a Godot port consume it unchanged (§2 seam note).
- **Note:** farming's `state.garden` (the Braille-bed modal economy) stays as-is for now; when the walkable farm
  in §6 replaces the modal, its beds become `kind:"crop"` entries in `state.placed`.

---

## 6. Build order (each step independently testable)
1. **`tileInFront()` + ghost place/pick-up in the Wordhoard.** Wire the primitive against the existing library
   grid + collision. Test by placing a hardcoded placeholder décor (no gift economy yet). Proves the primitive.
2. **Cozy square `(0,1)`.** Special-case `genScreen`/`genTiles` (hazard-free, empty, `isFarm:true`); render the
   placed pass; let the same primitive place décor there. Proves the venue + `where` key.
3. **Décor gifts.** `DECOR` catalog + `state.decorOwned`; the curator grants a décor on a claimed category
   milestone ([`inklings-collections.md`](inklings-collections.md) §8.2). Proves the reward → place loop.
4. **Farm planting on `(0,1)`.** Reuse the primitive to plant seeds (and pen animals) as `kind:"crop"`/`"pen"`;
   graduate the Braille-bed **modal** into this walkable zone (farming §8). Retire the modal test rig.
5. **Polish.** Rotation/removal UX, solid-vs-walkable tuning, sprite art, and (later) the Tiled/LDtk authoring of
   `(0,1)` that retires the §2 special case.

---

## 7. Open / deferred
- **Cozy-square dressing & size:** how much authored path/fence/pond-edge to add, and whether `(0,1)` stays
  30×22 or wants a bigger authored footprint (decide when the Tiled/LDtk map is built).
- **Rotation & multi-tile furniture:** MVP is 1-cell, axis-aligned. Bigger/rotatable pieces are later.
- **Perks on décor:** schema-ready (`perk` field), ship cosmetic.
- **Placement outside these venues:** décor is intentionally **rooms + cozy-square only** — not the daily-reset
  field (it would vanish nightly). Revisit only if a second persistent outdoor zone is ever authored.
- **Interplay with pens:** the cipher menagerie's pens ([`inklings-ciphers.md`](inklings-ciphers.md)) are placed
  objects too — confirm pen footprints/collision share the `kind:"pen"` path here rather than a bespoke system.
