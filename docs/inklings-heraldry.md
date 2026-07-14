# Inklings — Heraldry & the Blazon Shield

Status: **MVP shipped DEV-only** (§10), **re-flavored to the combat vocabulary** (§12); **production plan
agreed — §13, not yet built.** The dev slice is live behind `IS_DEV` (localhost / `file://`). Everything below
§0 is the original 2026-07 plan; **§10/§12 record what's actually built**, §11 the explored duel, and **§13 is
the live plan to take it dev→production.** Read §13 (then §10/§12) before working on the code.

The game's long-term identity is a Stardew/Minecraft-breadth adventure whose systems **teach real
grammar/lexical concepts by embodying them.** Heraldry is a natural new subject: **blazon** (the formal
language for describing coats of arms) is a genuine _constrained grammar_ — strict word order plus the
**rule of tincture**, a colour/metal agreement rule. This mechanic lets a player **compose a valid blazon**
to build a **shield** that, when equipped, grants passive bonuses derived from what's on it.

Cross-refs: [`inklings.md`](inklings.md) (current systems, incl. the equipment paper-doll + drop/scroll
patterns), [`inklings-grammar-systems.md`](inklings-grammar-systems.md) (the POS-anchored framework this
extends), [`inklings-architecture.md`](inklings-architecture.md) (authored-obstacle `acceptedSolutions`, if
world-effects ever join).

---

## 0. The pitch — a "wearable sentence"

You **blazon a shield** by writing a valid heraldic phrase from a curated vocabulary of terms you collect as
rare drops. A legal blazon is **emblazoned as real pixel heraldry** and, when equipped, confers **passive
bonuses derived from its content** (meaning-driven, like the adjective potions). Re-blazon anytime;
composing/equipping consumes nothing (non-destructive, like mad-libs word reuse).

Teaches, through play: heraldic **vocabulary** (tinctures, ordinaries, charges, attitudes), a real
**word-order grammar**, and an **agreement rule** (rule of tincture) with authentic exceptions.

The core interaction is a **compose-a-sentence bench** — its own mini-Wordsmithy sitting in the Library
beside the desk/lectern. (Decided over the lighter "slot picker" / "mad-libs template" alternatives: the
sentence bench is where the grammar teaching lives.)

---

## 1. Why it fits / the anti-conflict spine

- **Separate curated vocabulary.** Blazon terms come from a finite `data/blazon.json` roster acquired via
  **rare drops**, _not_ the dex. So the shield never competes with the **potion system** for adjectives or
  the **shelves/atlases** for nouns. A clean namespace, mirroring how **fable-pages** and **binding
  materials** already work.
- **Passive lane only.** Bonuses ride the existing `equipBonuses()` sum (hearts/guard/attack/…) — **never
  the _timed_ buffs the potions own** (speed/size/reveal). Persistent stat badge, not a consumable.
- **Reuses the paper-doll equipment system.** A new **shield slot** in `EQUIP_SLOTS`, gear-style
  persistence, and the already-inert `effect` hook reserved for a future active-block.
- **Non-destructive.** Scrolls are a permanent unlocked vocabulary; composing/equipping spends nothing.

See §7 for the full conflict table.

---

## 2. The v1 grammar — "Medium ladder + counterchange + numbered charges"

Blazon is effectively infinite (recursive quartering, charges-on-charges, inescutcheons). **Fidelity ≠
completeness:** v1 implements a **correct proper _subset_** — everything it accepts is real, legal heraldry,
read in the real order, with the real rule of tincture. Structure it as a **layered production grammar** so
authentic layers (lines of partition, furs, per bend/quarterly, "on a…" nesting) bolt on later without a
redesign.

```ebnf
Blazon      := Field ["," Ordinary] ["," ChargeGroup]
Field       := Tincture
             | "party per" DivLine Tincture "and" Tincture     ; division — required for counterchange
DivLine     := "pale" | "fess"                                 ; v1: vertical / horizontal only
Ordinary    := OrdinaryName Tincture'                          ; chief | fess | pale | bend | chevron
ChargeGroup := Number Charge [Attitude] Tincture'              ; "three lions rampant Or"
Number      := "a" | "two" | "three"                           ; three → 2-and-1 arrangement (default)
Tincture'   := Tincture | "of the field" | "counterchanged"    ; anaphora + the exception
Tincture    := Metal | Colour | Fur
Metal       := "Or" | "Argent"
Colour      := "Gules" | "Azure" | "Sable" | "Vert" | "Purpure"
```

Example valid output: **“Party per pale Azure and Or, a chevron counterchanged, three mullets Or.”**

### Reading order (the syntax the bench enforces)

Field → (optional) ordinary + its tincture → (optional) number + charge + attitude + charge tincture. The
bench presents these as ordered slots and validates left-to-right.

### The rule of tincture (the agreement rule — **hard constraint**, decided)

Never **metal-on-metal** or **colour-on-colour**. Checked at every layer boundary:

- charge tincture vs the field (or the field-part it sits on),
- ordinary tincture vs field,
- charge-on-ordinary vs the ordinary.

An illegal blazon **cannot be equipped / grants no bonus** until fixed; the Herald names the violation.

**Authentic exemptions the checker must honour** (this is what makes it _blazon_, not a flat wall):

1. **Furs** are neutral — may sit on either metal or colour.
2. **Proper** (a charge in its natural colour) is exempt. _(v1 may omit `proper`; noted for fidelity.)_
3. **Counterchanged** elements are exempt — a charge straddling a division reversed into the two field
   tinctures legally lies "colour on colour." **This is the teaching payoff of counterchange:** the hard
   rule gains a real, learnable exception.
4. Charges wholly within one tincture-area of a divided field follow _that_ area's tincture.

### Counterchange (decided — it pulls divisions in)

Counterchange is _defined against a division line_, so requesting it requires simple field divisions (per
pale / per fess). This is the correct dependency, not scope creep. A counterchanged element is drawn twice,
each half clipped to one side of the division in the _opposite_ field tincture (see §5b).

---

## 3. Acquisition — rare blazon-term scrolls (generic pool)

Decided: a **generic weighted drop pool** (not themed-by-creature for v1), like fable pages but **rarer**.

- Fable pages drop at ~10% (`FABLE_DROP_CHANCE`); blazon scrolls target **~3–5%**, with **rarer terms
  weighted off rarer beasts**.
- A dropped scroll grants one heraldic term (tincture / ordinary / charge / attitude). Like fable pages,
  it's a special ground pickup handled in `collectPickup` — **not** stockpiled in `state.resources`; it
  unlocks the term in a saved `state.blazon` roster instead.
- Pacing: ensure a player can reach a first _complete_ blazon (≥1 tincture + ≥1 charge) reasonably; seed or
  weight early drops so the categories needed for a minimal legal blazon come first.

(Themed-by-creature drops — predators→attitudes, inklings→tinctures, cubes→ordinaries — are a **later**
flavor upgrade, §8.)

---

## 4. The Heraldic bench (compose-a-sentence UI)

A new interactable in the Library (a **Herald's desk/lectern**, sibling to the writing desk + mad-libs
lectern). Opens a modal with:

- **Ordered blazon slots** (Field → Ordinary → Charge group), each a picker limited to **terms you've
  unlocked** in that category. Numbers (a/two/three), attitude, and the `of the field`/`counterchanged`
  tincture options appear inline.
- **Live validation**: word-order is structural (slots), and the **rule of tincture** is checked at each
  layer with clear pass/fail; the Herald calls out violations (§2). Equip is disabled while illegal.
- **Emblazon preview**: the shield drawn live from the current blazon (§5b), plus the blazon rendered as
  its **canonical text string** ("Azure, a lion rampant Or") so the player reads the grammar they built.
- **Armory** (scope decision): **one equipped shield**, but you can **save named blazons** and reload them
  into the bench to swap. Only the equipped blazon grants bonuses. Saved blazons persist (`state.armory`).

---

## 5. Abilities — the blazon reads as a character sheet

Meaning-driven (decided, mirroring the potions). **Each grammar slot owns a _different kind_ of
contribution**, so a blazon _is_ a build and each slot teaches what that part does in heraldry. (Lanes are a
starting proposal — subject to change as the design settles.)

| Grammar slot        | Build role                        | Meaning-driven mapping (examples)                                                                                     |
| ------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Charge**          | **Class** — the primary ability   | Lion → +attack · Tower/Castle → +guard · Cross → +hearts · Eagle → wider magnet/vision · Stag → speed · Rose → regen · Key → +loot/ink |
| **Attitude**        | **Stance** — leans the charge     | Rampant → offense-weighted · Statant/Couchant → defense-weighted · Salient → burst/knockback · Guardant → perception/guard |
| **Number**          | **Rank** — magnitude              | a / two / three → ×1 / ×2 / ×3 on the charge's stat (**capped at ×3**)                                               |
| **Ordinary**        | **Armor band** — mostly defensive | Chief → +hearts · Fess → +guard · Chevron → +guard · Pale → +attack · Bordure → +guard                               |
| **Field tincture**  | **Temperament** — small flavor    | Gules → +attack · Azure → +hearts · Argent → +heal · Vert → +regen · Or → +ink · Sable → +guard · Purpure → +ink     |
| **Counterchange**   | **Mastery flourish**              | The charge banks **both** field tinctures' temperament stats (it _is_ both, reversed) — rewards the hard grammar     |

**Power budget:** total shield bonus ≈ **one strong crafted-gear piece** (it's one slot). The **number**
dial is the main scaler, capped ×3.

**Fidelity honesty note:** tincture "meanings" (gules=warrior, azure=loyalty…) are a **post-medieval,
romanticized tradition** — heralds argue colours have no fixed meaning. Label them in-game as "traditional
lore," not hard heraldry. Everything else in the table is structural.

### 5b. Emblazonment — drawing real blazon from the grammar

**It's the historically correct relationship.** Describing arms in words = to **blazon**; depicting them = to
**emblazon** (formal inverses). A blazon→image renderer literally implements emblazonment.

**Why pixel art is _legitimately faithful_, not a compromise — "artistic license":** in heraldry the
**blazon is authoritative, not any single drawing.** Two artists given "Azure, a lion rampant Or" draw
different lions and both are correct — the blazon fixes _what_ (a gold rampant lion on blue) and its
arrangement, never the exact linework. So a pixel rendering that shows the right **charge identity,
attitude, tinctures, and arrangement** is as valid as any herald-painter's.

**The renderer maps 1:1 onto the grammar — a layered painter's algorithm, one pass per production:**

1. Clip to the **escutcheon** (shield) outline.
2. **Field**: fill one tincture, or split for a division (per pale = L/R, per fess = top/bottom).
3. **Ordinary**: draw the band (chief = top strip, fess = mid horizontal, pale = central vertical, bend =
   diagonal, chevron = ∧) in its tincture.
4. **Charges**: place N copies in the standard arrangement (three = **2-and-1**), each a charge sprite
   recoloured to its tincture, posed by attitude.
5. **Counterchange**: draw the element **twice**, each half clipped to one side of the division, in the
   _opposite_ field tincture — a simple canvas clip-and-swap (the render that best shows off fidelity).

**Easy & fully faithful in v1:** tinctures, per-pale/per-fess divisions, the ordinaries, geometric charges,
numbered arrangements, counterchange. **Later (cheap):** furs (ermine/vair patterns), lines of partition
(wavy/engrailed edges).

**The one real art cost:** the **charge sprites**. Heraldic charges are stylized/iconic by design, so pixel
glyphs suit them — and the existing **drop-in sprite pipeline** (`sprites/<id>.png` with a drawn/text
fallback) handles them exactly like creatures.

- **v1 charge roster (decided, classics that pixel well):** **lion, eagle, tower, cross, mullet (star),
  crescent, rose, martlet.** Add more later.
- **Attitudes in v1 (decided):** **one drawn pose per charge**; the attitude affects **stats + the text
  label** ("rampant" still reads and still leans the bonus). Real pose variants (rampant vs passant sprites)
  are added later via the same sprite fallback.

---

## 6. Equipment integration

- Add a **shield slot** to `EQUIP_SLOTS` (opposite the currently-locked weapon hand). It persists like other
  gear (`state.equip.shield`).
- Extend `equipBonuses()` / the bonus vocabulary beyond `{hearts, guard}` as the ability table needs
  (`attack`, `regen`, `magnet`, `ink`, …); wire each new stat where it applies (e.g. `attack` into `ATTACK`
  damage, `magnet` into `PICKUP_MAGNET`).
- Unlike crafted `EQUIP_ITEMS`, the shield is **not** built from materials — its "recipe" is a **valid
  blazon**. Represent the equipped shield as a gear instance whose bonuses are **computed from its blazon**
  (via `data/blazon.json`) rather than a static `bonuses` map.
- The inert `effect` hook stays reserved for a future **active block** (§8).

---

## 7. Conflicts & how they resolve

1. **Potions (adjectives).** No overlap — blazon terms are a separate drop-acquired roster, and shield
   bonuses are passive (potions are timed). Distinct vocab, distinct lane.
2. **Shelves/atlases (nouns).** Charges are a curated heraldic list, not dex nouns → no shelf competition.
3. **Equipment slots/bonuses.** Reuses the paper-doll system; adds a slot + extends the bonus vocabulary.
   Power-budgeted to ≈ one gear piece.
4. **Mad-libs / dex reuse.** Non-destructive: the shield unlocks/uses terms, spends nothing.
5. **Drop economy.** Adds one more special pickup (blazon scroll) alongside fable pages + materials;
   rarer than pages, weighted by term rarity. Watch total drop density when tuning.
6. **Combat.** v1 is passive only (no new combat verb). Active block is deferred to the `effect` hook.

---

## 8. Build order (each a shippable milestone)

1. **Data + core grammar.** `data/blazon.json` roster (terms, categories, metal/colour class, ability
   mapping) + a **blazon validator** (word-order via slots + rule-of-tincture with exemptions). Text-only.
2. **The bench UI.** Library interactable (Herald's desk) + ordered slot pickers + live validation + Herald
   feedback + the canonical text string. Unlocked terms gated by `state.blazon`.
3. **Emblazon renderer.** Layered painter's algorithm (§5b): escutcheon, field/divisions, ordinaries,
   charge sprites, counterchange clip. v1 charge roster + drawn/text fallback.
4. **Equip integration.** Shield slot + blazon→bonuses in `equipBonuses`; extend the passive stat
   vocabulary; power-budget pass.
5. **Acquisition.** Blazon-scroll drops (generic rare pool) + `collectPickup` handling + early-drop pacing.
6. **Armory.** Save/name/reload blazons; swap the equipped one.
7. **The Herald character.** Punny anthropomorphic guide (name/species TBD) delivering discovery lines +
   rule-of-tincture coaching, via the existing one-at-a-time celebration queue.

---

## 9. Open / deferred

- **Herald character** — name/species/home undecided (candidates: a pompous Lion/Eagle who _is_ a charge; a
  bird-of-prey pun "Harrier the Herald"; a fussy "Cri de Coeur" who faints at colour-on-colour).
- **Ability lanes** — the §5 mapping is a first proposal; the dev flagged it "subject to change."
- **Active block** — a "raise shield" combat verb on the reserved `effect` hook (deferred; v1 is passive).
- **Grammar layers up the ladder** — lines of partition (wavy/engrailed), furs (ermine/vair), per bend /
  quarterly divisions, `proper`, "on a…" nesting / charges-on-charges, quartering, inescutcheons.
- **More charges** beyond the v1 eight; **real attitude pose variants** (rampant vs passant sprites).
- **Themed drops** (creature type → term category) as a flavor upgrade over the generic pool.
- **World/obstacle effects** — if a shield ever solves authored obstacles, wire into `acceptedSolutions`
  (`inklings-architecture.md`).
- **Drop rate + power numbers** — exact scroll chance, early-drop pacing, per-term bonus magnitudes, ×N cap.
- **Tincture-symbolism labeling** — present color "meanings" as "traditional lore," not hard heraldry.

---

## 10. MVP — what shipped (DEV-only) & how it maps to the plan

A dev-gated vertical slice of build-steps **1–4** (§8). Open the **Herald's Bench** with **`Y`** (or the
dev-only 🛡️ toolbar / touch button). Everything is behind `IS_DEV`, so production is untouched: the bench
entry, the shield equip slot, and the bench itself only appear on `localhost` / `file://`.

**Data — `data/blazon.json`** (fetched into the `BLAZON` global; every engine fn no-ops until it loads).
Curated roster, a separate namespace from the dex/potions (the §1/§7 anti-conflict spine):
- **Tinctures**: metals Or/Argent, colours Gules/Azure/Sable/Vert/Purpure, **furs Ermine/Vair** (neutral).
  Each has a `hex` (for emblazoning) + a `temperament` bonus (§5 "Temperament" lane).
- **Divlines** per pale / per fess · **Ordinaries** chief/fess/pale/bend/chevron/bordure · **Charges** the v1
  eight (lion/eagle/tower/cross/mullet/crescent/rose/martlet) · **Attitudes** rampant/passant/statant/couchant/
  salient/guardant · **Numbers** a/two/three.
- Each charge carries `stat`+`unit` (its class ability), an `active` string (the **reserved** ability name),
  and a `role` label. A top-level `clamp` caps each stat to the ~one-gear-piece power budget.

**Engine (JS, `HERALDRY` section in `inklings.html`).**
- `blazonValidate(bl)` — structural word-order is enforced by the ordered slots; the fn checks the **rule of
  tincture** at each layer with the exemptions: **furs never clash**, **counterchanged is exempt** (and
  *requires* a division, else it errors). Returns `{valid, errors[]}` with Herald-voiced messages.
- `blazonText(bl)` — the canonical string ("Party per pale Azure and Or, a chevron counterchanged, three
  mullets Or.").
- `blazonBonuses(bl)` — **passive** stats mapped onto the FIVE already-wired equip stats
  `{hearts,guard,attack,reach,haste}` (so bonuses actually affect gameplay). Slot ownership matches §5:
  charge = class×number (×3 cap), attitude = stance lean, ordinary = armour band, field = temperament,
  **counterchange banks BOTH field temperaments**. Clamped by `BLAZON.clamp` (first-pass power budget —
  the §5 magnitudes are still "subject to change"). *Simplification vs §5:* the richer stat vocab
  (magnet/ink/regen/heal) is folded onto the five wired stats for now; add the new stats + rewire, then just
  edit `blazon.json`, no engine change.
- `blazonActive(bl)` — **RESERVED / INERT.** Computes the future active ability descriptor
  `{type, charge, name, stance}` from the charge's `active` (tuned by attitude/stance). **Nothing invokes
  it** — it only feeds the bench's "🛡 Ability (soon)" line. **This is the seam** the Zelda-style raise-shield
  guard and charge powers bolt onto (§8 active block, §5 attitude "Stance"). Guarding lands here later.

**Emblazon renderer** — `emblazon(ctx, bl, x,y,w,h)`, the §5b layered painter's algorithm: escutcheon clip →
field/division fill (furs drawn as a cheap ermine/vair pattern) → ordinary band → charges in the standard
arrangement (1 / 2 / 2-and-1) → **counterchange** as a per-region clip-and-swap. Charges are drawn glyphs
(geometric ones faithful; lion/eagle/martlet/tower as simple silhouettes) — the drop-in `sprites/<id>.png`
pipeline replaces them later exactly like creatures.

**Bench UI (`#herald` modal).** Two tabs (`hbSwitchTab`): **Bench** — ordered slot pickers (Field → Ordinary →
Charge group) as chip rows, live emblazon preview canvas + canonical text + pass/fail validation + the computed
passive bonuses + the reserved ability line; and **What's a blazon?** — a static plain-language primer (what
blazon is, the read order, the three tincture kinds, and the rule of tincture + counterchange) so a first-time
player gets the gist without outside knowledge. **Equip this shield** (disabled while illegal) writes
`state.blazonShield`; **Unequip** / **Reset**. In dev, **all terms are unlocked** (the real ~3–5% blazon-scroll
drops of §3 are deferred to production).

**Equip integration.** A `shield` slot (marked `dev:true`, hidden in prod) in `EQUIP_SLOTS`; `equipBonuses()`
folds `blazonBonuses(state.blazonShield)` onto the gear sum, so `maxHearts`/`hurtIframes`/`attackDmg`/reach/
haste all pick it up. The doll's shield slot shows the equipped state (tooltip = the blazon); clicking it
unequips, or (when empty) jumps to the bench. `state.blazonShield` persists via `snapshot`/`applySnapshot`
and is re-validated when `blazon.json` loads.

**Deferred to the production-readiness pass:** blazon-scroll drops + `state.blazon` roster gating (§3), the
armory / named saved blazons (§4), the Herald character (§8.7), the active-block combat verb (wire onto
`blazonActive`), and the richer stat vocab + tuned power numbers.

---

## 11. Combat vocabulary & the Red Queen duel (explored 2026-07, folded into the shield)

We prototyped a standalone **two-herald duel** (Red Queen boss) to test heraldry-as-combat. The reusable
idea set — kept because it's a strong, memorable framework:

- **Colours are elements in a counter-cycle:** **Gules** (fire) → **Vert** (vine) → **Sable** (stone) →
  **Purpure** (storm) → **Azure** (water) → Gules. Each beats the next (fire burns vine; vine cracks stone;
  stone grounds storm; storm churns water; water quenches fire).
- **Metals are polarity:** **Or** = *Strike* (offense/sun), **Argent** = *Ward* (defense/moon).
- **Attitudes are tempo** (a cost/intensity ladder, 1–8): dormant · couchant · sejant · statant · passant ·
  courant · salient · rampant. Higher = faster/stronger but pricier; *dormant* = the fold.
- **Charges are roles:** lion (reliable damage), boar (armour-breaker), eagle (initiative/vision), serpent
  (evasion), griffin (aggressor), martlet (cheap harass, "never lands").
- **Head** guardant/regardant as tactical reads; the **rule of tincture** (one metal + one colour) as the
  hard constraint.

**Verdict on the PvP duel:** as a competitive two-player game it played badly — too swingy (one-round kills,
blind simultaneous element RPS, no room for skill). **Not pursued now.** A future **single-player boss**
version — the *"Predictable Queen"* (Direction 1): she adapts **out loud** (telegraphs her next element as
"the one that beats your last move" + climbs a tempo rung), so the fight is a *deterministic read/sequencing*
puzzle (out-anticipate adaptation instead of racing it — literally the Red Queen Hypothesis). Attrition HP,
small clash swings. **Possible future**, noted here; not built.

**What we ARE doing now (Direction 4):** fold this vocabulary into the **equipped Blazon Shield's passive
buffs** so the worn shield speaks the same language — polarity (metal) → offense/defense lean, element
(colour) → a themed buff, charge → a role, attitude → tempo/intensity. The element counter-cycle itself is
**lore-only** on the passive shield (there's no opponent element to counter) — reserved live for the future
duel above. See §12.

---

## 12. Direction 4 — the shield re-flavored to the combat vocabulary (built, DEV-only)

The equipped Blazon Shield's **passive buffs now speak the puzzle's language**. This was a re-flavor of the
existing MVP (§10), not a rewrite — the grammar, bench, validator, renderer, and equip wiring are unchanged.
Decided via a design pass: **keep the full MVP grammar** (ordinaries/divisions/furs/number all stay) and
layer the combat meanings on top; make **attitude an intensity+speed slider**.

**`data/blazon.json` re-flavor (data-only; engine reads it):**
- **Metals = polarity** — `polarity`/`stance` + a `temperament` lean: **Or** (Strike) → `{attack}`, **Argent**
  (Ward) → `{guard}`.
- **Colours = elements** — `element` + `beats` (the counter-cycle, `elementCycle`) + a themed `temperament`:
  Gules/fire→attack, Vert/vine→reach, Sable/stone→guard, Purpure/storm→haste, Azure/water→hearts.
- **Attitudes = tempo** — each now carries a `tempo` rung (rampant 8 … couchant 2); the old flat `lean` is
  gone. A `tempo` config block (`pivot`, `hastePer`, `attackPer`, `guardPer`) drives the slider.
- **Charges = roles** — `role` labels refreshed (lion→damage, tower→bulwark, …); `stat`/`unit` kept.

**Engine (`blazonBonuses` rework + two helpers):**
- **Element + polarity** come from **both** the field AND the charge tinctures paying their `temperament`
  (so the colour banks its element buff and the metal banks its offense/defense lean, wherever each sits);
  counterchange still banks the 2nd field tincture.
- **Word order** (`blazonWordOrder`): figure (colour on charge) → +0.5 attack (burst); ground (colour on
  field) → +0.1 guard (sustained).
- **Charge role × number** (a/two/three, ×3 cap) — kept.
- **Attitude tempo** → `haste += tempo×hastePer`; above the pivot `+attack`, below `+guard` (aggressive ↔
  defensive slider). All clamped to ≈ one gear piece.
- `blazonProfile(bl)` returns the read-only {element, polarity, tempo, wordOrder} character sheet.

**Bench UI:** the **Guide & powers** tab (was "What's a blazon?") gained a **codex**: polarity, the element
wheel with each colour's buff, the tempo slider, word order, and the charge→role table — the visible legend
the playtest was missing. The bench's live readout now shows the current blazon's **element · polarity ·
tempo · word order** above the passive stats.

**Reconciled decision (flagged):** the two build answers slightly conflicted — "keep the full grammar" (which
includes the `a/two/three` **number** slot) vs "tempo replaces number." Resolved by **keeping number** (the
charge magnitude dial) AND layering **tempo** as an independent intensity+haste driver. Revisit if number
should be retired.

**Heraldic-accuracy note:** `guardant` still occupies the *attitude* slot (legacy) though it's really a
**head** modifier (the future duel, §11, models it correctly). Left as-is for now; a grammar fix would move
head-position out of the attitude ladder.

---

## 13. Production plan — dev → production (agreed 2026-07; not yet built)

Decisions this pass: **(a)** unlock terms via a **starter set + rare scroll drops**; **(b)** enter the bench
at a **Herald's desk in the Library**; **(c)** v1 also lands the **guardant head-position grammar fix**;
**(d)** I propose balance numbers now, tune from play. Herald NPC, armory, and active guard/block stay
**deferred**. Build in the order of §13.6; each step parse-checks + is browser-verified.

### 13.1 Acquisition — `state.blazon` roster + scroll drops
- **`state.blazon`** = unlocked-term sets per category (`tinctures`, `charges`, `ordinaries`, `attitudes`,
  `divlines`). Numbers (a/two/three) and head `none` are always available (structural, not earned).
- **Starter set** (guarantees a first legal shield + a little choice): tinctures **Or, Argent, Gules,
  Azure**; charges **lion, cross**; attitudes **statant, rampant**. → e.g. *"Gules, a lion rampant Or."*
- **Scroll drops:** new `BLAZON_SCROLL_CHANCE ≈ 0.04` in `collectPickup` (sibling to `FABLE_DROP_CHANCE`
  0.10). A dropped **blazon scroll** grants one still-locked term, **weighted so rarer terms come off rarer
  beasts** (beast rarity × term-rarity tier). Special ground pickup (like fable pages — NOT
  `state.resources`); unlock → celebration/toast via the one-at-a-time queue. Early drops weight toward
  filling gaps a player still needs for a legal shield.
- **Bench gating:** `renderHerald` pickers (`tinctureOptions`/`ordOpts`/`chOpts`/attitudes) filter to
  unlocked terms, with a per-category "*N locked — find blazon scrolls*" hint. Already-equipped shields are
  **not** retroactively invalidated by locked terms.
- **Persistence + migration:** `state.blazon` in `snapshot`/`applySnapshot`; on load, if absent, grant the
  starter set (covers existing saves).
- **Dev convenience:** keep an "unlock all terms" cheat in the bench (mirror the Garden dev bar) so testing
  stays trivial.

### 13.2 Entry — Herald's desk in the Library
- Add an interact object to **`data/rooms/library.json`**: `{ "id":"herald", "col":~23, "row":19, "w":2,
  "h":2 }` (a free floor spot — `desk` is col 7, `book` col 20, `curator` col 10; put the herald desk on the
  lower-right).
- Wire it the same way as the other stations: `LIBRARY.herald = interactPt("herald")`; **`nearLibraryHerald()`**;
  a branch in **`tryUseBench`** → `openHerald()`; the E-hint ("*Press E to blazon a shield*"); the contextual
  **touch button + desktop toolbar** entry; and draw it in the library render like `desk`/`book`/`curator`.
- **Ungate:** drop `IS_DEV` from the shield **equip slot** (`dev:true` → always shown) and from the bench
  entry. Keep the equip-doll shield-slot → bench jump (ungated). Retire the raw dev-only `Y` key (or keep an
  ungated shortcut).

### 13.3 Grammar fix — head-position slot
- Move **guardant/regardant out of the attitude slot** into a real `head` slot. Blazon shape becomes
  `bl.charge = { num, id, attitude, head, t }`, `head ∈ {none, guardant, regardant}`.
- `data/blazon.json`: remove `guardant` from `attitudes` (attitudes = pure tempo: rampant/salient/passant/
  statant/couchant — *optionally* add dormant/sejant/courant to complete the 1–8 ladder, flagged optional);
  add a `heads` block. On the **passive** shield the head is **flavor-only** (no stat) but grammatically
  correct — its live mechanics are reserved for the future duel (§11).
- `blazonText` renders head after attitude ("*a lion rampant guardant Or*"); `renderHerald` gains a **Head
  picker**; `blazonBonuses`/`blazonProfile` need only the attitude-set cleanup (renderer unchanged — one pose
  per charge). **Migration:** saved shields with `attitude:"guardant"` → `attitude:"statant"` + `head:"guardant"`.

### 13.4 Balance (proposed; tune from play — all constants)
- `BLAZON_SCROLL_CHANCE` = **0.04**, rarity-weighted.
- Power budget (shield ≈ one strong gear piece): tighten `clamp` to **{ hearts:2, guard:0.5, attack:3,
  reach:24, haste:0.12 }** (from {3, 0.6, 4, 40, 0.15}); keep the `tempo` config. Revisit after play.
- First-shield pacing: the starter set is an immediate legal shield; scroll weighting fills a player's
  missing metal/colour/charge first.

### 13.5 Not in v1 (still deferred)
Herald NPC (guide/coaching), armory (named saved blazons), **active guard/block** combat (`blazonActive`
stays inert — the seam remains for the §11 "Predictable Queen" duel or a Zelda-style raise-shield later).

### 13.6 Build order (shippable steps)
1. **Grammar fix** (head slot) — smallest; gives a clean tempo ladder before the rest.
2. **`state.blazon` roster** + starter grant + bench gating + persistence/migration.
3. **Scroll drops** in `collectPickup` + rarity/pacing weights + unlock celebration.
4. **Herald's desk** interactable + ungate the entry and the shield slot.
5. **Balance numbers** + playtest pass.
