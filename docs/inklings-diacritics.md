# Inklings — Diacritics & Diacryptids

Planning doc. A system for teaching **diacritics** (the marks that modify letters — accents, tildes,
cedillas, umlauts…) through a rare creature class, the **diacryptids**, that drop consumable marks you
apply at the desk to spell borrowed/accented words.

Status: **plan only — not implemented.** Reflects decisions from the 2026-07 planning session.
Cross-refs: [`inklings.md`](inklings.md) (creatures/drops/bestiary, the bench ⇧ capital toggle, satchel),
[`inklings-grammar-systems.md`](inklings-grammar-systems.md) (§4b **World Atlas** — where accented place-names
were explicitly **deferred**; this system unlocks them), [`inklings-collections.md`](inklings-collections.md)
(the shelf/collection pattern the **Émigré wing** reuses).

---

## 0. Why this fits Inklings

- **Diacritics are the natural next tier after capitals.** Capitals are already the deliberate end-game
  (`CAP_ORDER`, rare + far-from-home; see [`inklings.md`](inklings.md) "Capital letters"). Diacritics extend
  the same "orthography you unlock late" arc — legendary-tier drops, skewed far from home.
- **The Atlas already parked them.** `inklings-grammar-systems.md §4b` ships place-names
  **accent-normalized** (Bogota, Espana) and calls diacritics "deferred." Diacryptid drops become the **key**
  that lights up the accented spellings — a concrete payoff for a currently-parked feature.
- **The mechanic reuses the ⇧ capital pattern.** The bench already has `benchShift` (a modifier toggle that
  appears once `hasUnlockedCapital()`); a diacritic modifier is the same shape of UI.
- **Teach through mechanics.** You learn what a cedilla *does* by spelling `façade`, not by reading a
  definition — consistent with the grammar-systems philosophy. Each mark carries a **fact card** (the parallel
  to the Atlas fact card / the WordNet gloss).

---

## 1. Decisions (2026-07)

- **Diacritics are a CONSUMABLE drop** (spent when applied at the desk), like letters — this keeps the
  very-rare diacryptids worth re-hunting.
- **Stored SEPARATELY from the satchel.** There are far fewer diacritical words than plain ones, and marks
  shouldn't crowd out letter-carrying capacity — so they go in a **dedicated store** that does **not** count
  toward `bagCap` / `satchelCount()` / `satchelFull()`.
- **The store persists across days** (like `ink` / `resources` / `potions`), it is **not** day-scoped like the
  satchel. Diacryptids are legendary-rare; a nightly wipe (the way `startNewDay()` empties the satchel) would
  be punishing. So the store is added to the saved state, and `startNewDay()` leaves it alone. _(This is the
  recommended reading of "consumable but stored elsewhere"; confirm on build.)_
- **Names are provisional** — the roster below is a first pass, subject to change.

---

## 2. The diacryptid roster (provisional)

The teachable trick: **map each mark's shape + linguistic job onto a real cryptid's features**, so the
creature *looks like* the mark it drops. Data-driven in `data/creatures.json` (same schema as every other
creature); legendary tier, `spawn.minDist` high so they skew far from home.

| Diacryptid (provisional) | Mark | Shape / behavior logic | Fact-card teaches |
| ------------------------ | ---- | ---------------------- | ----------------- |
| **The Ñessie** | tilde `~` (ñ/ã) | Water-serpent on `T_WATER` pond tiles; the tilde is its wavy body/wake | Spanish "ny" (piñata, jalapeño, señor); Portuguese nasal ã |
| **The Diaeresquatch** (Bigföot) | diaeresis / umlaut `¨` | Forest ape; two glowing dot-**eyes** = the two dots | umlaut (über) *changes* a sound vs. diaeresis (naïve, Noël, Zoë) *separates* two vowels |
| **The Yêti** | circumflex `^` (ê) | Mountain creature; the `^` is a snow **peak** / pointed hood | the "ghost S": forêt=forest, île=isle, hôpital=hospital |
| **Chupacédra** | cedilla `¸` (ç) | Chupacabra; the cedilla **hangs below** like a barbed tail | soft-c "s" sound (façade, garçon) |
| **The Mothgrave** | grave `` ` `` (è) | A mournful, downcast Mothman; grave leans low-left = "low/serious" | English's own -èd (belovèd, learnèd) marks a pronounced syllable |
| **The Acuté Jackalope** | acute `´` (é) | Sharp antlers, rightward leap; acute rises right = "sharp/high" | loanword stress (café, résumé, exposé) |
| **The Ringwraith / Nøkk** | ring `°` (å) | A halo-orbed Nordic troll / "foo fighter" orb | Scandinavian "aw/o" (Ångström) |
| **The Håček Hodag** | caron / háček `ˇ` | The Hodag's **spined back** = the little v; *háček* is itself Czech | "sh/ch" sounds (Dvořák, Czech) |
| **The Macron Mokèlé** | macron `¯` | Mokele-mbembe's **long** flat neck lying horizontal | long-vowel bar (the mark dictionaries use) |
| **The Squonk** | breve `˘` | Tiny, cupped, weeping cryptid; breve = "short" | short-vowel cup (dictionary counterpart to the macron) |

**Launch roster = the ~7 marks that actually appear in English loanwords** — acute, grave, circumflex,
diaeresis, tilde, cedilla, ring. Caron / macron / breve are **ultra-rare bonuses** (they mostly show up in
dictionary pronunciation guides and a few names), added after the core seven work.

**Fun-fact creature (optional):** the **tittle** — the dot on *i*/*j* is a diacritic-descended mark. A small
"Tittle" harasser that steals the dots off carried i's fits the existing letter-messing specials (cf. The
Typo's `swapCarried` in [`inklings.md`](inklings.md)). Tentative.

---

## 3. The drop → use loop

### 3.1 Drop
A diacryptid on defeat scatters a **mark pickup** (a new drop kind, alongside the existing special-cased
`page` / `blank-tile`). `collectPickup` special-cases it → `state.marks[markId]++` (the dedicated store),
**not** `state.inv` (letters) and **not** `state.resources` (materials). Draw a distinct `ICON_DRAW.mark`
(the glyph of the mark itself) so it reads on the ground and in any tally.

### 3.2 Store (separate from satchel)
- **`state.marks`** — `{ markId: count }` (e.g. `{ acute: 2, tilde: 1 }`). Saved (bump the save snapshot
  version). Persists across days; `startNewDay()` does **not** clear it.
- **Excluded from satchel math** — `satchelCount()` / `satchelFull()` / `bagCap` ignore it, so marks never
  block letter capture and letters never block marks.
- **Surfaced** in a small **"accent case"** — either a compact HUD tally or a strip in the bench/collection
  UI (decide on build). Not in the satchel counter.

### 3.3 Use — the bench diacritic modifier (reuse ⇧)
Mirror `benchShift`: a **diacritic tray** appears at the desk once you own ≥1 mark. Select a mark, then a
compatible base letter → composes the accented glyph (`é`, `ñ`, `ç`, `ü`…). **Applying spends one mark**
from `state.marks` (the consumable rule). Rendering: the bench letter chip / canvas float shows the composed
glyph (the case-aware chip code already distinguishes `a`/`A`; extend it to accented forms).

Only **valid mark×letter** combos compose (´ goes on vowels + c/n/s per language; ç is c-only; ñ is n-only;
å is a-only…). A small `MARK_TARGETS` map gates the tray so you can't build nonsense like `q̈`.

### 3.4 Validation — a second dictionary (the Atlas dual-dict pattern)
`dictionary.json` is **accent-normalized** (`build_dictionary.py` strips marks), so accented spellings won't
validate against it as-is. Add a **`data/loanwords.json`** (built offline, same generator pattern) mapping
the accented form → its gloss/etymology (café, naïve, piñata, façade, jalapeño, résumé, doppelgänger,
exposé, …). `checkWord` gains a loanword branch: if the bench word carries a mark, check `loanwords.json`
(and/or its accent-stripped form against `DICT`). This is the **same dual-dictionary addition** the Atlas
already needs (`inklings-grammar-systems.md §4b`) — build once, share.

---

## 4. Reward lanes (what marks are *for*)

1. **The Émigré wing — a loanword collection.** A library sub-shelf of **borrowed words that need marks**
   (café, naïve, piñata, façade…), collected by spelling them. Parallels the Nouns-wing shelves + Wordhoard
   curation ([`inklings-collections.md`](inklings-collections.md)) and teaches that English *borrows* accented
   words. This is the persistent reward/curriculum.
2. **Unlock the Atlas's deferred diacritics.** Owning a mark lights up accented place-names in the World
   Atlas (Bogotá, España, São Paulo) — turns a parked feature on.
3. **Minimal pairs (the mark *matters*).** A puzzle/codex beat where the same letters spell **different
   words** by mark: resume→résumé, pate→pâté, expose→exposé, rose→rosé, naive→naïve. The "aha" that the mark
   is not decoration.
4. **Fact card per mark** — the diacryptid parallel to the Atlas fact card / the WordNet gloss: applying a
   mark (or defeating its diacryptid the first time) reveals what it does (§2's right column).

---

## 5. Educational payoff

Diacritics read as "foreign," but several are English's own — worth surfacing so the system teaches, not just
decorates:

- **grave -èd** (belovèd, learnèd, agèd) marks a syllable that's *pronounced* — native English poetics.
- **diaeresis** (naïve, coöperate, Zoë, Brontë) — English uses it to split two vowels.
- **macron / breve** are the **dictionary pronunciation** marks (māˈtir / ă) — readers meet them every time
  they check a pronunciation.
- **umlaut vs diaeresis** — same two dots, *different jobs* (sound-change vs vowel-split); a clean contrast
  for the codex, carried by the Diaeresquatch.

---

## 6. Build order (each a shippable slice)

1. **Store + drop plumbing** — `state.marks` (saved, day-persistent, satchel-excluded), a `mark` pickup kind
   special-cased in `collectPickup`, one diacryptid entry in `creatures.json` with a mark drop. No spelling
   yet — just catch + hold a mark, show it in an accent-case tally + the bestiary.
2. **Bench diacritic modifier** — the ⇧-style tray, `MARK_TARGETS` gating, consume-on-apply, accented chip
   rendering.
3. **`loanwords.json` + validation** — the second dictionary; `checkWord` loanword branch; **the Émigré
   collection** as the reward.
4. **Full launch roster (7)** + fact cards + the umlaut/diaeresis codex beat.
5. **Atlas hook** — accented place-names light up once you own the relevant mark (coordinate with the Atlas
   build, `inklings-grammar-systems.md §8` item 8).
6. **Minimal-pairs beat** + caron/macron/breve ultra-rares + the (tentative) Tittle harasser.

---

## 7. Deferred / open

- **Names** — the whole §2 roster is provisional.
- **Accent-case surface** — HUD tally vs. a bench/collection strip; where marks are shown.
- **Store persistence detail** — confirmed persistent + consumable here; re-confirm no nightly wipe on build.
- **`MARK_TARGETS`** — the exact legal mark×letter combos (per-language scope: start with the loanwords we
  actually ship, widen later).
- **Loanword source** — which offline word list seeds `loanwords.json` (candidate: a curated set of
  established English loanwords; keep it single-file/offline like `2of12.txt`).
- **Do marks also grant ink**, or only Émigré-fill + fact card? (Mirror the open Atlas question.)
- **Speak/hear the sound** — a pronunciation tier (what each mark *sounds* like) is desirable but mic-gated;
  defer like the fishing speak-the-phoneme tier.
