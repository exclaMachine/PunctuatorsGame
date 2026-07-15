# Inklings — Object Placement & the Cozy Square (0,1)

Planning doc. **Read this before touching object placement, the farm zone, or décor.** It specs the **one
shared facing-tile placement primitive** that both farming (plant a seed / pen an animal) and the Wordhoard
collection reward (place a decoration) were always meant to share — the "build it once" system flagged in
[`inklings-farming.md`](inklings-farming.md) §8 and [`inklings-collections.md`](inklings-collections.md) §5 —
plus the **new persistent cozy square** that hosts the walkable farm.

Status: **step 1 built** (the shared primitive + décor place/pick-up inside the Wordhoard; see §6). Steps
2–5 (the cozy square, gift economy, planting, polish) are still ahead. Direction settled with the dev (§1).

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
One generic system, reused by décor, seed-planting, and pen-placing. **The load-bearing layers — validity,
`state.placed`, place/swap/pick-up, collision, render, save — are shared, and so is the *cell selector*:**

- **Targeting is the tile IN FRONT of the character** (`tileInFront`) for **both** décor and (later) farm tools —
  the Stardew *tools* model. The dev chose faced-tile over click-anywhere: placing wherever the cursor points
  "felt less realistic." A tray still picks *what* you hold; your **facing** picks *where* it goes.

### 3a. Cell selector — `tileInFront(sc, p)`
- Read the venue's cell size (`sc.cw||TS`, `sc.ch||TS`); snap `p.face` to a cardinal (dominant axis); return
  foot-cell + offset, or null off-grid. One selector for décor now and the farm's till/plant/water later.

### 3b. Validity — can I place here? (`placeValidAt`)
- **in-bounds** and terrain **walkable** (`walkType` — grass/path), i.e. tillable for seeds;
- **not the exit mat** (Wordhoard entrance — would trap the player); fixed interactables are already `T_ROCK`
  (desk/shelves), so `walkType` excludes them;
- **not a solid piece on the player's own tile** (would trap them). Non-solid (rug/lamp) may sit under the player.
- **Occupancy is NOT a blocker** — dropping on an occupied cell **swaps** (see 3c).

### 3c. The tray + face-and-place (built — Stardew tools model)
- A docked **décor tray** (`#decorbar`, `renderDecorBar`) shows **every owned piece at once** + a leading
  **✋ pick-up slot**. Click a slot to **hold** that piece (or the empty hand); the held slot highlights.
- A translucent green/red **ghost** (`drawPlaceUI`) always sits on the **tile you're facing** as you walk.
- **Confirm with Space** (`placeFront` → `placeAtCell`) or the tray's **Place** button (touch/mouse): holding a
  piece → **place** it; on an occupied faced tile → **swap** (old piece returns to the tray); holding the
  **✋ hand** → **pick up** the faced piece.
- **Few hotkeys (dev ask):** only `O` (open/close), `Esc`, and `Space` (place). Entry also via a **🖼️ Decorate**
  button on the desktop toolbar (`tb-decor`) and touch util bar (`tc-decor`); **Place**/**Done** buttons live in
  the tray so touch needs no keyboard.

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
1. **Placement primitive + décor tray in the Wordhoard — BUILT (Stardew-tools UI).** In `inklings.html`:
   `DECOR` placeholder catalog (emoji), `state.decorOwned`/`state.placed` (persisted; snapshot `v:4`),
   `tileInFront`/`placeValidAt`/`placedSolidBlocks` (fed into `canStand`), and the tray
   (`#decorbar`, `renderDecorBar`/`placeFront`/`placeAtCell`/`drawPlacedDecor`/`drawPlaceUI`). **Flow:** open with
   `O` or the **🖼️ Decorate** button (desktop `tb-decor` / touch `tc-decor`) → the tray shows **all owned pieces at
   once** + a **✋ pick-up slot**; a green/red **ghost tracks the tile in front of the character**; **Space** (or the
   tray's **Place** button) drops it, **swaps** on an occupied faced tile, or **picks up** with the hand.
   `Esc`/`O`/Done exits. Décor draws on top of the baked `LIBRARY.bg`; solid pieces block movement. **Test grant:**
   in DEV, opening the tray with nothing owned grants one of each; in prod it says "earn them from the curator"
   (real source = step 3). Placement is Wordhoard-only until step 2 opens `(0,1)`.
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
