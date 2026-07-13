# Inklings — Story Companions (combat/bonus buddies)

Planning doc. A cast of **authored, named characters from the dev's own books** (Suede the jumping spider,
Swifty the Quetzal, Johnny the snake, …) that **follow the player and grant a bonus**. Inspired by the
companion/pet idea in *Minecraft Dungeons*, but deliberately distinct: these are specific story characters,
not generic pets, and they're **earned through the word-collection** rather than looted.

Status: **design agreed, nothing built yet** (see the decisions box). v1 scope is intentionally small — a
silent, passive-bonus follower — with the richer ideas explicitly parked (not cut) for later.

Cross-refs: [`inklings.md`](inklings.md) (the **Equipment** paper-doll slots this reuses; the **À La Modal**
follow-sprite scaffold this reuses), [`inklings-collections.md`](inklings-collections.md) (the **Wordhoard
curator grant** system that unlocks companions — companions are a second grant type alongside placeable
décor), [`inklings-grammar-systems.md`](inklings-grammar-systems.md) (the **grammar guide** cast — a
*separate* track from these story companions; see §1.1).

---

## 0. TL;DR
- A cast of **named story characters** trails the player, one at a time, each giving a **passive bonus**.
- **Silent** in v1 — pure visual + bonus, no dialogue (that keeps À La Modal the only talking companion).
- **One equipped at a time**, via a new **Companion slot in the existing Equipment window** (`G`).
- **Unlocked by completing a themed Wordhoard collection set** matched to the character — reuses the curator's
  one-time-grant machinery from [`inklings-collections.md`](inklings-collections.md).
- **Reuses À La Modal's in-world follow-sprite scaffold**; each character just supplies its own drop-in PNG.
- **Fixed stats now, built to grow:** the companion record reserves inert `attack`/`ability`/`scaling` fields
  (the way weapons reserve `effect`) so autonomous-fighter / triggered-ability / collection-fueled ideas slot
  in later without a rewrite.

---

## 1. Decisions (settled with the dev, 2026-07-13)
1. **Authored story characters, not letter-creatures.** The dev has specific characters from their books in
   mind (Suede the jumping spider, Swifty the Quetzal, Johnny the snake, …). Companions are **not** tamed
   inklings and **not** anchored to a part of speech.
2. **v1 = passive bonus, fixed stats.** Each companion grants one bonus while equipped. Combat roles
   (autonomous fighting, triggered abilities) are **kept open for later**, not built now.
3. **One equipped at a time.** A single **Companion slot** in the Equipment paper-doll — a real choice, only
   one bonus active, reuses the equipment UI. (Not all-follow, not a squad.)
4. **Silent buddies.** No dialogue in v1 — visual + bonus only.
5. **Unlocked by themed Wordhoard collection sets.** Completing a collection set thematically matched to the
   character grants that companion (reuses the curator grant system; see §3).
6. **Reuse À La Modal's follow-sprite + the creature sprite loader.** No new rendering system — swap art only.

### 1.1 Two companion tracks (don't conflate them)
- **Grammar guides** (`inklings-grammar-systems.md` §2): À La Modal, Antonym the Ant, Synonomouse the Mouse.
  They **teach** (POS-anchored, discovery-gated, one-liner + codex). À La Modal follows after you say YES.
- **Story companions** (this doc): the dev's book characters. They **tag along + buff**, silent, equipped one
  at a time. Not grammar teachers.
- They can coexist on screen (À La Modal following *and* a story companion equipped) — offset their follow
  positions so two sprites don't overlap (§5).

---

## 2. The cast (roster — to be authored by the dev)
Named characters from the dev's books. Each entry = a character, a **bonus** that reads as *them*, and the
**collection set** whose completion unlocks it. The table below is a **straw-man to react to**, not final —
the dev assigns the real bonuses and set pairings (they know the characters and stories).

| Companion | Nature | Straw-man bonus | Straw-man unlock set |
| --------- | ------ | --------------- | -------------------- |
| **Swifty** (Quetzal) | fast bird | `+move speed` | a bird / animal noun set |
| **Suede** (jumping spider) | leaps, spins webs | `+pickup-magnet radius` (webs reel loot in) | ? |
| **Johnny** (snake) | venomous | `+attack` (venom bite) | ? |
| … | | | |

**Thematic pairing is the point:** an animal character → the **animal** noun category set feels native. Keep
the roster **data-driven** (a `COMPANIONS` registry) so characters, bonuses, and set pairings tune without
code changes.

---

## 3. Unlock hook — themed Wordhoard collection sets
Reuses the **curator grant** system (`inklings-collections.md` §8 step 2): completing a collection bundle
fires a one-time grant. Today the grant is a placeholder reward / décor token; a companion is simply a
**different grant type** on the same trigger.

- The 26 Wordhoard sets are the WordNet **noun categories** (`data/noun-books.json`; the curation panel
  already tracks each set's `found/total`). A companion's `unlock` names the set (or category-milestone
  threshold) that awards it.
- **Retroactive:** like all shelf-derived progress, re-derive "is this unlockable" from `state.dex` ×
  `NOUN_BOOKS` on load; only the *unlocked* flag needs saving (§6).
- **On unlock:** add to `state.companions`, fire the celebration (reuse the Feats/letter celebration queue),
  and — since these are silent — a **toast** ("Swifty joined you!") rather than a spoken line. Do **not**
  auto-equip; the player chooses in the Equipment window.
- **Balance risk (shared with collections):** whole-set 100% completion can be unreachable for rare-word
  sets. Prefer pairing companions to **category-milestone thresholds** (e.g. "20 animals") over full
  completion, or hand-pick completable starter sets. Mirror whatever the collections layer settles on.

*(Alternative hooks — word-count or bestiary milestones — were considered and set aside; collection sets won
for the strongest theme tie. Noted in case a character has no fitting noun set.)*

---

## 4. How it helps — v1 bonus, and the growth path
**v1 (build now): passive bonus while equipped.** Draw the bonus from the existing effective-stat knobs so it
plugs into combat/economy already in place:

| Bonus | Existing hook |
| ----- | ------------- |
| `hearts` / `guard` | already summed in `equipBonuses()` |
| `attack` / `reach` / `haste` | already summed in `equipBonuses()` → `attackDmg`/`doAttack` |
| `speed` (move) | player movement speed (new knob — wire into the movement step) |
| `magnet` (pickup radius) | `PICKUP_MAGNET` (new knob — add to the magnet check) |
| `satchel` (+cap) | `state.bagCap` (the Stall already raises it) |
| `letterDrop` (drop bonus) | letter/creature drop rolls (new knob) |

The first three rows are **free** (companion bonuses fold straight into `equipBonuses()`). The rest need a
small new hook each — add only the ones the roster actually uses.

**Growth path (parked, not cut — keep the schema ready):**
- **Autonomous fighter** — the companion attacks nearby enemies on its own. The creature AI is already
  data-driven (`chaser`/`stalker` in `data/creatures.json`); point a behavior at *enemies* instead of the
  player. Reserve an `attack`/`behavior` field on the companion record.
- **Triggered ability** — spend a letter / ink / a spelled word → a big move (screen-clear, stun, shield).
  Ties combat back to the spelling loop. Reserve an `ability` field.
- **Collection-fueled scaling** — a companion's power scales with your dex, or it "eats" letters to act.
  Reserve a `scaling` field.
- **"Name it with a word"** — assign a word whose POS/meaning drives behavior (a VERB makes it act). Longest-
  term; grammar-as-power.

Reserve these fields inert from the start (exactly how `EQUIP_ITEMS` carries an inert `effect` for signature
weapons) so none of the above forces a redesign.

---

## 5. Reuse — the follow-sprite + the equipment slot
**Follow-sprite (reuse À La Modal).** The in-world follower already exists: `ALaModal.update(dt)` lerps a
sprite toward the player with a gentle bob (`drawModalSmall`). A story companion is the **same behavior** with
different art:
- A `Companion` object mirroring À La Modal's `update`/`draw` (or a shared helper): lerp toward the player,
  bob, draw. Offset its follow anchor from À La Modal's so both can trail without overlapping (À La Modal sits
  upper-right of the player; put the companion lower/left, say).
- **Art via the creature sprite loader** — the drop-in `sprites/<id>.png` pattern (`loadCreatureSprite`/
  `drawCreatureSprite`) already loads + blits a PNG with a procedural fallback. Reuse it so **placeholder art
  is fine** until real character PNGs land; dropping `sprites/swifty.png` in is the only change to get real art.
- Only the **equipped** companion draws (unlike À La Modal, no YES gate — equipping *is* the opt-in).

**Equipment slot (reuse the paper-doll).** Add a **Companion slot** to the Equipment window:
- Add `{ id:"companion", label:"Companion", emoji:"🐾", pos:{…} }` to `EQ_SLOTS` and a `companion:null` key to
  `state.equip` (or keep a dedicated `state.companion` id — see §6).
- The slot's picker lists **unlocked** companions (`state.companions`) rather than craftable gear — the
  Equipment panel already separates slots from the owned/craft list, so companions are an "owned, not crafted"
  source feeding the same slot UI.
- **Bonus math:** fold the equipped companion's `bonus` into the effective-stat pipeline. For
  `hearts`/`guard`/`attack`/`reach`/`haste` that's literally `equipBonuses()`; for new knobs
  (`speed`/`magnet`/…), add a parallel `companionBonus(key)` read at each new hook.

---

## 6. State & saves
- **`state.companions`** — the set of **unlocked** companion ids (persists forever like `dex`/`resources`).
- **`state.companion`** — the currently **equipped** companion id (or reuse `state.equip.companion`; a
  dedicated key keeps companions decoupled from the gear `uid` model, since companions aren't crafted gear
  instances). Persists.
- Re-derive **unlockable** state from `state.dex` × `NOUN_BOOKS` on load (retroactive); only the *unlocked*
  set + the *equipped* id need storing.
- **Bump the snapshot version** and add the keys to `snapshot()`/`applySnapshot()` + the Export/Import backup.
  Additive keys — old saves load fine (missing → empty set / none equipped). Coordinate the version bump with
  the collections layer if both land close together.

---

## 7. Conflicts & considerations
- **Two followers on screen** — À La Modal (if following) + an equipped companion. Offset anchors so they
  don't overlap; both freeze while a dialog is open (À La Modal already does).
- **Bonus stacking** — one companion at a time means one bonus; it stacks on gear/perks via the same additive
  math. Watch totals so a companion + gear don't trivialize combat (tune bonus magnitudes small).
- **New bonus knobs** — `speed`/`magnet`/`letterDrop` don't exist in `equipBonuses()` yet; each needs a small
  wire-in. Only add the ones the roster uses; don't build unused knobs.
- **Silent by design** — no writing burden in v1, and it avoids competing with À La Modal's voice. A future
  pass could add unlock/idle lines (reusing her speak bubble) if desired.
- **Art** — character PNGs via the drop-in `sprites/` pattern; placeholder procedural body first. No new
  dependency, no build step.
- **Collections coupling** — companions ride the curator grant trigger. Build the collections **Claim + grant**
  step (collections §8.2) first, or in tandem, since companions are a grant type on it.

---

## 8. Build order (each step independently testable)
1. **Registry + equipment slot (no bonus yet)** — define `COMPANIONS`; add the Companion slot to `EQ_SLOTS` +
   `state.companions`/`state.companion`; equip/unequip from the panel; the equipped companion draws as a
   placeholder follow-sprite (reuse À La Modal's follower). Proves the slot + follower.
2. **Passive bonus** — fold the equipped companion's `bonus` into the stat pipeline (start with the free
   `equipBonuses()` knobs). Proves a companion changes play.
3. **Unlock via collection sets** — wire `unlock` to the curator grant (collections §8.2): completing the set
   adds the companion to `state.companions` + a toast. Proves earning them. *(Needs collections Claim+grant.)*
4. **Real art + roster** — drop in character PNGs; finalize the roster's bonuses + set pairings (dev authors).
5. **(Later) growth** — activate a reserved field for one companion (autonomous attack *or* triggered ability)
   as a vertical slice, if/when the dev wants combat companions.

---

## 9. Open questions
- **Roster pairings** — the character → bonus → collection-set table (§2). The one thing needing the dev's
  authoring; everything else is structural.
- **Unlock threshold** — full set completion vs a category-milestone threshold (the impossible-set risk from
  collections §7). Lean milestone.
- **Bonus magnitudes** — keep small so companion + gear doesn't trivialize combat; exact numbers TBD in play.
- **Equipped-state key** — reuse `state.equip.companion` (unifies with gear) vs a dedicated `state.companion`
  (decouples from the craft/`uid` model). Leaning dedicated.
- **When to add voice / abilities** — v1 is silent + passive; revisit once the roster + collections land.
