# Inklings — Collections, Curation & Decoration (the Wordhoard rewards layer)

Planning doc. A **reward layer over the collection** inspired by Stardew Valley's museum/community-center
*feel* (complete a set → get something nice) but **explicitly NOT a community center**: no town, no gated
content, no unlocking of new areas. It is a **pure grant** system that lives entirely inside **the
Wordhoard** (the library room) and pays out **placeable decorations** for that room.

Status: **build step 1 done** (read-only curation panel; see §8). The direction below is agreed (see the
decisions box); the balance/granularity details are deliberately loose. Rewards + placement are still ahead.

Cross-refs: [`inklings.md`](inklings.md) (the Nouns wing + Wordhoard room this builds on),
[`inklings-farming.md`](inklings-farming.md) (**shares the facing-tile placement primitive** — see §5),
[`inklings-grammar-systems.md`](inklings-grammar-systems.md) (the word-guide cast; the librarian is the
keeper of the hypernym→hyponym tree).

---

## 0. TL;DR
- A **human librarian / curator** NPC in the Wordhoard hands out **one-time rewards** when you complete
  collection **subgoals** ("bundles").
- The subgoals **reuse the Nouns-wing shelves** — a book/category's existing `found/total` *is* the bundle
  progress. No new content to author; the shelves already track it.
- The reward is a **placeable decoration** you set down in the Wordhoard on the **tile you're facing** (like
  Stardew furniture). That placement primitive is the **same one seed-planting needs** — build it once.
- **Pure grant, nothing gated.** No town, no community center, no locked areas. Purely additive on top of the
  renewable ink/potion/Feats loops.

---

## 1. Decisions (settled with the dev)
1. **Not a community center.** The example was Stardew, but we want *only* the library/Wordhoard — **no town**
   (honours decision #4 "No home town" in `inklings.md`) and **no content gating**.
2. **Pure grant.** Completing a subgoal *gives* a reward; it never *unlocks* a required area/book/mechanic.
   One-time milestone payouts, layered on the existing renewable rewards (doesn't replace or double-dip them).
3. **Reuse the Nouns-wing shelves as the subgoal tracker.** The shelf view already shows `found/total` per
   book and per category (a pure view over `state.dex`). A "bundle" is just a completion threshold on that
   existing progress — the first *reward* attached to the shelves.
4. **Host = a human librarian / curator NPC.** Name open; the dev floated a hyper-/hypo-nym pun ("Hyper
   Hippo"). Thematically the librarian keeps the **hypernym→hyponym tree** the shelves already encode (books
   = hypernyms, the words on them = hyponyms), so she's the natural teacher for that grammar concept.
5. **Reward = placeable decorations.** You earn décor and **place it yourself** in the Wordhoard, Stardew-
   style: face an empty square, drop it there. (Doesn't have to ship in the first pass, but it's the target.)
6. **The placement system is shared with farming.** Placing décor and planting a seed are the same verb —
   "act on the tile in front of you if it's valid." Build one generic primitive; both features use it.

---

## 2. The subgoals (what a "bundle" is)
Reuse the existing Nouns-wing data (`data/noun-books.json` → `NOUN_BOOKS`, `WORDBOOK`, and
`LIBRARY.activeByCat`; see the **Nouns wing** entry in `inklings.md`). Candidate granularities, cheapest first:

- **Book completion** — collect **every** child word of a book (e.g. all the words filed under one hypernym).
  Small books are satisfying capstones. **Risk:** many books contain rare words → full completion is often
  unreachable. Best reserved for hand-picked *starter* books, or paired with milestone rewards below.
- **Category milestones (recommended default)** — museum-style thresholds on a whole noun category (e.g.
  "5 / 15 / 30 birds collected"), so every category pays out incrementally without demanding 100%. Avoids
  dead-ends and matches how Stardew's museum drips rewards as you donate.
- **Curated cross-book sets (optional, later)** — hand-authored themed bundles ("spell 4 kinds of TREE")
  using the bundled WordNet `hypo` relations (`data/wordnet-relations.json`, roadmap #12). More surprising,
  more authoring; a later layer, not the MVP.

**Recommendation:** start with **category milestones** (robust, no impossible sets) plus a handful of
**completable starter books** as showcase capstones. Keep the *definition of a bundle* data-driven so the mix
can be tuned without code changes.

**Note on other wings:** the Nouns wing is the only collection wing built today (verb/adj/adverb wings are
"still ahead" in roadmap #4). So bundles begin **nouns-only**; verbs already feed the **Feats ladders** and
adjectives feed **potions**, so keep bundles from double-rewarding those — the collection-set bundle is the
*nouns'* progression home, mirroring how Feats is the verbs' home. Extend to other wings when they exist.

---

## 3. The curator flow (UI)
- A new **interactable in the Wordhoard**: the librarian (or her **curator's desk**), placed on the room's
  authored layout (`data/rooms/library.json`) next to the shelves. Walk up + `E` / touch button →
  a **Curation panel** (`#curation`, same retro-pixel modal style as the shelf view / shop / mad-libs menu).
- The panel lists bundles with **progress bars** (`found/total` or `n/threshold`), a **Claim** button on any
  completed-but-unclaimed bundle, and a **claimed** state once taken. Reads straight from `state.dex` +
  `NOUN_BOOKS`; the only new saved state is which bundles have been **claimed** (§6).
- The librarian delivers short flavor lines (À-La-Modal style, canvas or DOM), teaching hypernym/hyponym as
  she describes each set ("a *fish* is a **kind of** animal…"). Personality/voice is open.

---

## 4. The rewards (decorations)
- A **decoration catalog** `DECOR = { id: { name, emoji|sprite, solid, size } }` — placeholder emoji/pixel art
  first, swappable for real sprites later (same drop-in pattern as equipment items and farm crops).
- Earning a décor adds it to an **owned-but-unplaced inventory** (`state.decorOwned` or similar). Placing it
  (§5) moves it into the room (`state.decor`). Both persist forever like `dex`.
- **Flavor fit:** trophies/curios that read as a scholar's study — a globe, a brass reading lamp, a potted
  fern, framed pressed-flowers, a bust, a rug, a terrarium. Tie some thematically to the bundle that granted
  them ("complete the *birds* set → a stuffed-owl trophy").
- **Cosmetic vs functional (open):** MVP is purely cosmetic (the reward is the *look* + the collection
  milestone). A later option: some décor gives a small ambient perk (a comfy chair heals faster; a lamp
  brightens the room) — Stardew-lite. Keep the catalog schema ready for a `perk` field but ship cosmetic.
- **Companions are a second grant type.** Completing a **themed** set can also award a **story companion** (a
  named character from the dev's books that follows the player and grants a bonus) instead of / alongside
  décor. Same one-time-grant trigger, different payout. See [`inklings-companions.md`](inklings-companions.md);
  the Claim+grant step (§8.2) is the shared substrate.

---

## 5. The placement system (shared with farming) — the load-bearing shared build
Placing décor and planting a seed are the **same interaction**, so implement **one** generic primitive:

- **`tileInFront()` / facing-tile helper** — from `p.x/p.y` + `p.face` (cardinal), compute the grid cell
  directly ahead in the current room's tile space (the Wordhoard uses non-square cells `cw/ch`; the future
  farm zone uses its own grid — the helper reads the active screen's cell size, as `blockedAt` already does).
- **A place/act mode** — the player selects an item (a décor from the owned inventory, or a seed in the
  farm), a **ghost preview** draws on the facing tile, and a confirm places it **iff** the tile is empty,
  in-bounds, walkable/tillable, and not overlapping a solid object. A **pick-up/remove** mode reverses it.
- **Rendering:** `drawLibraryRoom` draws placed décor from `state.decor` after the baked room bg; farm draws
  crops the same way. **Collision:** décor may be `solid` (blocks like a shelf) or walkable (a rug) — feeds
  `blockedAt`/`canStand` via the same `overlapsSolid`-style check the desk/shop already use.
- **Where it lives:** the Wordhoard is authored 30×24 with a fixed layout and limited open floor — confirm
  there's enough clear floor to place things (may need to widen the room or reserve a "display" zone). The
  farm zone is a separate authored area (farming §8).

**MVP shortcut (optional):** if the placement UI slips, decorations can **auto-appear in fixed display slots**
in the room first (cheap, no placement mode), then graduate to free placement. But since farming needs free
placement anyway, building the shared primitive up front is the efficient path.

---

## 6. State & saves
- New saved state: **`state.bundles`** (a set/map of claimed bundle ids — one-time), **`state.decorOwned`**
  (earned-unplaced décor), **`state.decor`** (`[{id, room, cx, cy}]` placed items). All persist forever like
  `dex`/`resources` (not day-scoped).
- **Bump the snapshot version** (currently `v:3`) and add the three keys to `snapshot()`/`applySnapshot()` +
  the Export/Import backup. Re-derive claimable state from `state.dex` × `NOUN_BOOKS` on load (like
  `rederiveVerbCounts` does for Feats) so progress is retroactive; only the *claimed* flag needs storing.
- The shelf view stays a "pure view, no new saved state"; the curation layer adds the first saved shelf-side
  state (`bundles`). Keep them separate modules so the shelf view is unaffected.

---

## 7. Conflicts & considerations (what this touches)
- **Renewable vs one-time:** bundle grants are **one-time milestones**; they don't touch the renewable
  noun→ink / adjective→potion / verb→Feats loops. Purely additive — no conflict.
- **Nouns-only start:** verbs (Feats) and adjectives (potions) already have reward homes. Keep bundles as the
  **nouns' collection home** so nothing double-rewards; extend to other wings only when those wings exist.
- **Impossible sets (the main balance risk):** whole-book/whole-category completion can be unreachable (rare
  words). Prefer **milestone thresholds**; reserve 100% for curated small sets. This is the top open question.
- **Shared placement primitive:** the biggest new system, but it's **needed by farming regardless** (§5) —
  so building it here pays for both. Design it generic from the start; don't hardcode "Wordhoard décor".
- **Room floor space:** the Wordhoard's authored layout may not have room to place much — plan clear floor
  or a display zone.
- **Art:** décor sprites (and the librarian) — placeholder emoji/pixel first, real art via the existing
  drop-in `sprites/` pattern. No new dependency.
- **Save schema bump** (v:3 → v:4) — additive keys, old saves load fine (missing keys default empty).
- **Decision #3 alignment:** "the library is the dex made physical / the collection and 'decorate a space'
  are the same feature." This feature *is* that decision cashed in — it should feel native, not bolted on.

---

## 8. Build order (each step independently testable)
1. **Curation panel (read-only)** — **DONE.** A **curator** interactable (a librarian behind a desk) sits in
   the Wordhoard at `data/rooms/library.json` (`type:"curator"`, col 10 row 14; `LIBRARY.curator` +
   `nearLibraryCurator()`, walk-up + `E` / touch **CURATE** / desktop toolbar **Curator**). It opens the
   `#curation` modal (`openCuration`/`renderCuration`/`renderCurationCat`/`renderCurationBook`/`closeCuration`,
   `state.curation`, styled like the shelf view). **Bundles = the 26 noun categories**, browsed in **three
   pages** (nav tracked by `cuCat`/`cuBook`; the `← ` back button + Esc step back one page at a time):
   - **Page 1** — each category as a set with a `found/total` progress bar + a ✓ COMPLETE badge.
   - **Page 2** — that category's books, each with its own bar.
   - **Page 3** — a book's actual words: collected ones as clickable chips (→ `#defmodal`), undiscovered ones
     as `?????` blanks (reuses the shelf view's `.nb-chip` styling).
   **Ordering:** anything with ≥1 collected word floats to the top (categories keep shelf order within a group;
   books keep alphabetical within a group) so progress is easy to spot. All read live from `state.dex` ×
   `NOUN_BOOKS` via `curationCats()` — **no new saved state, no rewards yet** (a note in the panel says rewards
   are coming). Proves the UI + the bundle definitions.
2. **Claim + grant** — add `state.bundles`; a completed bundle shows **Claim** → grants a placeholder reward
   (a décor token or ink) once. One-time, persisted. Proves the milestone economy.
3. **Décor catalog + auto-slot** — define `DECOR`; earned décor **auto-appears** in fixed Wordhoard slots
   (no placement UI). Proves the reward reads well in the room.
4. **Shared facing-tile placement** — the generic `tileInFront()` + place/pick-up mode; free placement of
   décor (and the same primitive wired for farm planting). Replaces the auto-slots.
5. **The librarian** — character art + flavor voice (hypernym/hyponym teaching); polish pass.

---

## 9. Open questions
- **Granularity/balance:** book-completion vs category-milestones vs curated sets — and the exact thresholds
  (the impossible-set problem). Leaning category-milestones + a few completable starter books.
- **Librarian identity:** name (the hyper-/hypo-nym pun), human vs the "Hyper Hippo" animal pun, art, voice.
- **Décor: cosmetic only, or a few functional pieces?** (Schema ready for a `perk`, ship cosmetic.)
- **Placement depth:** free-place-anywhere vs fixed display slots for MVP; décor collision (solid vs walkable);
  rotation/removal UX.
- **Room space:** does the Wordhoard need widening / a dedicated display area to hold decorations?
- **Later wings:** do verb/adjective/adverb collections get their own bundle sets once those wings exist, or
  stay with Feats/potions?
