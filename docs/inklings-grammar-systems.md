# Inklings — Grammar Systems & Educational Design

Planning doc. The game's long-term identity: a Stardew/Minecraft-breadth adventure whose systems **teach
real grammar/lexical concepts by embodying them** (not by lecturing). Every part of speech owns a mechanic
_and_ a word-guide character. Anchoring features to a part of speech / WordNet relation is how the game can
grow "a lot of features" without becoming an incoherent bag of systems.

Status: **plan only — not implemented.** Reflects decisions from the 2026-07 planning session.
Cross-refs: [`inklings.md`](inklings.md) (current systems), [`inklings-architecture.md`](inklings-architecture.md)
(maps/obstacles/portability).

---

## 0. Design philosophy

- **Teach through mechanics (emergent), with an optional codex.** You learn _antonymy_ by brewing opposing
  potions, not by reading a definition. Short explanatory blurbs live in an **opt-in grammar codex**,
  delivered by the guide characters on **discovery** moments. No forced lessons/quizzes.
- **One relation per system.** Each mechanic embodies exactly one lexical idea, so the concept is legible.
- **Persistence carries learning.** The daily map resets (Wordle-style), but the **collection, codex,
  potion recipes, and shelves persist forever** — that's the progression/curriculum.

---

## 1. The POS-anchored framework

| POS                | System(s)                                                                                                                                                 | Teaches                          | Guide                               |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----------------------------------- |
| **Noun**           | ink (economy) · **hypernym shelves** (taxonomy) · **attribute-flasks** (grow potion carry — bonus, not a gate) · **proper-noun atlases** (geography, §4b) | IS-A hierarchy; proper vs common | _(taxonomy guide — deferred)_       |
| **Verb**           | Feats ladders + abilities (existing) · "**action**" obstacle solutions                                                                                    | verb categories                  | _(future)_                          |
| **Adjective**      | **potions** — the WordNet "dumbbell" (self-buff / antonym-debuff _all beasts on screen_ / world) · "**state**" obstacle solutions                         | antonymy, similar-to, attribute  | **Antonym 🐜** + **Synonomouse 🐭** |
| **Adverb**         | potion **amplifiers** (adjective→adverb derivation) — later                                                                                               | derivation                       | _(future)_                          |
| **Modal verb**     | hints / possibility (existing À La Modal)                                                                                                                 | modality                         | **À La Modal**                      |
| **Function words** | scraps / combine mechanic — later                                                                                                                         | syntax                           | _(future)_                          |

---

## 2. The word-guide cast

A small "faculty" of anthropomorphic guides. They appear on **discovery**, deliver one line, and feed the
codex; a **single-at-a-time queue** (reuse the existing Feats/letter celebration queue) stops them clamoring.

- **À La Modal** _(exists)_ — modal verbs / possibility; the hedging hint companion.
- **Antonym the Ant 🐜** — teaches **antonymy**. Lives on the _bar_ of the dumbbell between two poles; pops
  in the first time you complete an opposing pair (e.g. own both Hot and Cold). Contrary — argues both sides.
- **Synonomouse the Mouse 🐭** — teaches **similar-to / synonymy**. Hoards near-synonyms like cheese;
  appears as you stack satellites on a pole ("swift, fleet, nimble — almost the same!").
- **Taxonomy guide — DEFERRED** (decided: just the ant & mouse for now). The hypernym shelves teach quietly
  via the codex until/unless we add a guide (candidate: a wise "sees-the-whole-tree" owl).

---

## 3. Adjective potions — the WordNet "dumbbell"

**Status — build step 1 DONE (2026-07):** spelling an adjective now brews the potion for its **dumbbell
pole**, not a random one. `potionForAdj(word)` reads `data/adj-attrs.json` (`word → potionId`, built by
`build_adj_attrs.py`); unmapped adjectives fall back to a random self-buff so none is a dud. The three
existing potions are the **self-buff poles** (`speed`=Swift, `size`=Big, `reveal`=Bright — legacy ids kept
for save-compat + buff logic); their **antonym poles** (`slow`/`small`/`dark`) now brew and accumulate in
inventory (shown disabled in the HUD — not yet usable). **Step 2 DONE (2026-07): the Apothecary** — an
always-available window (`P` / ⚗️) with attribute racks + **per-pole flask capacity** (vials whose _size = #
uses_ grow with adjective breadth; attribute noun = bonus; no gating — §3.2). **Next up (step 3):** make the
antonym poles usable as a **drink-to-debuff-all-beasts-on-screen** effect (decided 2026-07 — _no throw/aim_;
that's a later enhancement, §3.3/§8). Deferred further: Antonym/Synonomouse guides + codex (a 2b pass),
throw/aim targeting, and world/obstacle potion effects.

**Original framing.** Before step 1, spelling any adjective brewed a _random_ potion from three fixed types
(`size`/`speed`/`reveal`); the word's meaning was ignored. **Target:** the adjective's **attribute + pole**
decides the potion — meaning-driven, and teachable.

### 3.1 The dumbbell (recap)

Descriptive adjectives cluster around an **attribute** (a noun). Two **antonym head** synsets = the poles
(the _bar_); each head's **"similar-to" satellites** = near-synonyms (the two _bells_). Also: attribute
(→ the noun), also-see, pertainyms (relational adjectives, outside the dumbbell).

### 3.2 Apothecary: attribute racks + flask capacity — **⟵ NEXT BUILD TARGET (2026-07)**

The immediate next milestone (build step 2). **No gating** (decided 2026-07): every pole can already brew;
the Apothecary adds the rack UI + the **flask** that gives potions a _carry economy_.

**The reward lanes — each mechanic owns ONE dial (this is the anti-conflict spine):**

| Source                                      | Grows                                                | Teaches                     |
| ------------------------------------------- | ---------------------------------------------------- | --------------------------- |
| **Adjective meaning** (which word)          | _which_ effect (the pole)                            | antonymy (the two poles)    |
| **Distinct adjectives on a pole** (breadth) | **flask size = # uses you can carry** (quantity)     | similar-to / synonymy       |
| **Attribute noun** (`speed`/`size`/`light`) | **bonus flask size** to _both_ poles of its dumbbell | attribute (the shared noun) |
| **Adverb** (later, §3.5)                    | **potency + duration** _per use_ (quality)           | derivation (quickly←quick)  |

So breadth = **quantity** (flasks) and adverbs = **quality** (potency/duration) — they never fight over the
same number. (This deliberately **re-homes the old "satellite tier → potency" idea**: synonymy now grows the
flask, not the strength.)

**The flask model (decided):**

- **Per-pole, and a flask is ONE vial whose _size_ = how many uses/doses it holds.** Not a stack of flask
  icons — picture a single vial that visibly **grows bigger** as you collect more of that pole's synonyms.
- **Brewing fills the flask** (spelling a matching adjective adds a dose, up to its size); **drinking spends a
  dose.** A **full flask blocks extra doses** — you drink to make room or spell a different pole. (Not a hard
  wall: you can always brew more later, "make another potion from your word list." The user's framing.)
- **Size grows, Feats-style:** +capacity per **distinct adjectives collected on that pole** (milestone ladder
  like verbs — e.g. base N, then every +K). Finding the **attribute noun** grants a **bonus size bump to both
  poles** of that dumbbell (the "aha", not a gate).
- **Layout:** one **dumbbell rack per attribute** (two vials + the antonymy bar between); each vial is a
  per-pole flask with its own size. So _rack = per-attribute (visual)_, _flask = per-pole (capacity)_.
- **State/data:** flask **capacity is fully derived from `state.dex`** — distinct-adjective-per-pole counts
  (via `data/adj-attrs.json`, re-derivable like `verbCounts`) + whether the attribute noun is in the dex.
  **No new saved state for capacity**; only the _current doses_ persist (`state.potions`, already saved).
  Full-flask rule: a **new** adjective still records to the dex (and may enlarge the flask) even when full —
  only the extra _dose_ is capped, never the collection.

### 3.3 The three reaches (decided: self + antonym + world; **antonym simplified — see note**)

Effects are **per-pole, defined in data** (not every pole needs all three):

- **Drink a self-buff pole → self-buff** in that direction (Swift/Big/Bright — shipped in step 1).
- **Drink an antonym pole → debuff ALL beasts on screen** (a screen-wide "reagent burst"). **Simplification
  (decided 2026-07):** the antonym potion is _drunk_, hitting every creature on the current screen at once —
  **no throw, no aim**. This removes the projectile/targeting system from the critical path while still making
  slow/small/dark meaningful. **Throw + aim at a single target is a later enhancement** (§8, §9), layered on
  the same enemy status states.
- **Some poles act on the world** → traversal/puzzle tools; wire into authored-obstacle `acceptedSolutions`
  (see §7.1). **Still deferred** (the dev's "defer only the world/obstacle effects" call).

### 3.4 Starter attribute set (re-slots the current 3 potions — shipped in step 1)

| Attribute (noun/flask) | Pole A (drink = self-buff)                | Pole B (drink = screen-wide debuff)    | World use _(deferred)_            |
| ---------------------- | ----------------------------------------- | -------------------------------------- | --------------------------------- |
| Speed                  | **Swift** — move fast _(=old speed)_      | **Slow** — slow all beasts on screen   | —                                 |
| Size                   | **Big** — reach/attack _(=old size)_      | **Small** — shrink all beasts (weaker) | shrink self / enter tiny passages |
| Light                  | **Bright** — reveal/light _(=old reveal)_ | **Dark** — blind all beasts on screen  | light dark screens                |

Later attributes (Temperature Hot/Cold, Weight Light/Heavy, Strength Strong/Weak — the fuller table) come
when we expand past the re-slotted three; their world uses (melt ice, press switches) ride the deferred
obstacle system.

### 3.5 Adverb amplifiers (later) — the **QUALITY** lane (complements flasks' **quantity**)

Adverbs derive from adjectives (quickly←quick). An adverb amplifies its matching potion (Swift + "quickly"
→ **stronger/longer _per use_**) — teaches the derivation. This is deliberately the **only** owner of
potency/duration, so it never collides with flask capacity (§3.2): **flasks = how many uses you carry,
adverbs = how good each use is.** Layer on after the core works.

---

## 4. Noun taxonomy — hypernym→hyponym shelves (decided: enhance existing shelves)

- The library **noun-books** already group nouns by category. Make each **book's category a hypernym**, and
  its slots the **hyponyms** (specific nouns under it): dog/cat/horse under **mammal**. The book **completes**
  as you collect its hyponyms → teaches IS-A through the library you already have.
- **Data change:** regenerate `noun-books.json` from WordNet's real **hypernym tree**, using **curated
  shallow slices** (animals, tools, foods, plants…) — the full tree gets abstract fast (entity→abstraction→…)
  — and **cap** each book's hyponym list so it's completable.
- Codex teaches hypernym (umbrella/up) vs hyponym (specific/down) quietly; a guide can front it later.

---

## 4b. Proper nouns → Atlases (geography first — the capital-letters payoff)

**The hook (already set up in code):** capitals are deliberately end-game — `CAP_ORDER` (frequency-ordered),
`weightedLetter` skews capitals "rare, end-game, far from home," and comments reserve them for
_"geography/proper-noun content — roadmap #10."_ `build_dictionary.py` **excludes** proper nouns (filters
`instance_hypernyms`). So proper nouns are a clean, separate namespace, and unlocking **capital letters
unlocks Capitals (capital cities)** — the payoff for a currently-rewardless gate.

**Proper nouns = a noun subtype:** common nouns → shelves/taxonomy; **proper nouns → fillable "atlases."**
Every atlas also teaches _proper vs common (why we capitalize)_.

### First atlas: the World (geography)

- **Content tier (decided):** countries + capitals only to start; **single-word, accent-normalized**
  (Paris, France, Bogota). Multiword (New York) and diacritics deferred.
- **Map style (decided): Hybrid** — pixel/parchment regions in roughly real-world positions, **authored in
  Tiled/LDtk**, so it **reuses the authored-map pipeline** in `inklings-architecture.md` (regions = entities).
  Teaches real layout/adjacency without a vector renderer.
- **Mechanic:** blank world → spell a country to fill its region; spell a capital to pin its dot; **pair
  capital↔country** to fully light it (teaches "capital of"). **Continents** are sub-goals with rewards (ink,
  cosmetics, unlock the next atlas). An **Atlas/Globe** object in the Library opens it.
- **Reward = fact card** — the proper-noun parallel to the WordNet definition reveal: spelling "France"
  shows capital/continent/flag facts (teaches geography) instead of a gloss.

### Data (offline, open-licensed — no runtime API)

- **Countries+capitals JSON** (~195 rows: country, capital, continent, ISO, lat/long, flag) from
  **Natural Earth** / **Wikidata** (public-domain / CC0).
- **Region shapes:** hand-authored in Tiled/LDtk for the Hybrid look — no GeoJSON needed for v1 (Natural
  Earth 1:110m is the fallback if we ever want real borders).
- **Cities (later):** **GeoNames** `cities15000` (CC-BY, needs a credit line), subset it.
- Build with a `build_geo.py` script (same pattern as `build_dictionary.py`).

### Conflicts / considerations

- **Separate validation.** Proper nouns aren't in WordNet/`2of12`. The Wordsmithy must check a **second
  dictionary** (the atlas data) and require a leading **capital**. Dual-dictionary logic is the core addition.
- **Reward routing.** Proper nouns → atlas fill + fact card (+maybe ink); **not** the common-noun taxonomy
  shelves (they're instances, not hypernyms).
- **Rare-capital gating.** Qatar needs Q, etc. — frequency-ordered capitals make some places genuinely
  end-game (fine as aspiration).
- **Multiword / diacritics.** Start single-word + normalized; add later.
- **Educational scope.** Adds **geography** as a new subject; the proper-vs-common tie keeps it coherent.

### Atlas family (deferred — geography first)

The shared "fillable board" system later powers ✨ **Star Atlas** (constellations/planets), 🏛 **Pantheon**
(myth), 📅 **Calendar** (days/months), 🗣 **nationalities/languages**. Spec the generic atlas framework when
a second atlas is greenlit.

## 5. The grammar codex

Opt-in menu (a "field guide"). Entries **unlock on discovery** and store the guide's blurb + a live example
from _your_ collection ("you found _frigid_ and _icy_ — both satellites of **cold**"). Concepts: antonym,
synonym/similar-to, attribute, hypernym, hyponym, (later) derivation, modality. Never gates play.

---

## 6. Data pipeline (new WordNet-derived files, via `build_dictionary.py`)

- **`data/adj-attrs.json`** — **built (step 1)** by `build_adj_attrs.py` from the bundled (previously dormant)
  `data/wordnet-relations.json` + `data/dictionary.json` — no NLTK needed. **Shipped schema is the compact
  runtime form `word → potionId`** (a plain map lookup like `verb-cats.json`), _not_ the fuller
  `{ attribute-noun, antonym, similar-to[] }` originally sketched here — the richer dumbbell metadata is
  deferred to when the Apothecary UI (§8.2) needs it. Classification = curated per-pole **seeds** + **one hop**
  of WordNet `sim`, kept precise by an **on-attribute filter** (a candidate is accepted only if it has no
  `attr` or its `attr` intersects the pole's attribute nouns — this kills sense-drift like bright→happy).
  ~360 adjectives mapped; the rest hit the random-self-buff fallback. **Later:** non-gradable/pertainym
  adjectives (wooden, musical) → a **crafting** bucket, not potions (see §7.6) — not built yet.
- **`data/noun-books.json`** — regenerated as **hypernym → capped hyponym set** (see §4), replacing the
  current category buckets.
- Follows the existing generator pattern (`build_dictionary.py`, `build_levels.py`); add a small script if
  needed. All content stays data-driven (good for the Godot-options-open goal).

---

## 7. Conflicts & how they resolve

1. **Obstacles become multi-POS.** A **verb acts** (swim the river), an **adjective changes state** (dry it,
   or freeze it into a bridge). The authored-obstacle schema in `inklings-architecture.md` needs an
   **`acceptedSolutions`** field (e.g. `{ verbs:[…], adjPoles:[…] }`). Thematically clean; note added there.
2. **Data pipeline grows** (§6) — two new/regenerated WordNet files.
3. **Potion UI overhaul.** `1`/`2`/`3` won't scale → the Apothecary (racks) + more hotkeys/slots for the
   antonym debuffs. New station/room or Equipment-style window. _(Throw/aim is **no longer** on the critical
   path — antonym potions are drunk for a screen-wide effect, §3.3; aim is a later enhancement.)_
4. **Companion traffic.** Multiple guides → discovery-gated, one-at-a-time via the existing celebration queue.
5. **Combat expansion.** Antonym debuffs add enemy **status states** (slowed, shrunk, blinded — later also
   rooted/frozen/weakened). **Applied screen-wide on drink** for now (no aim mechanic); a **throw/aim** single-
   target mode is a later enhancement on the same status-state system.
6. **Non-attribute adjectives.** Fallback bucket → crafting materials/tinctures, not potions.
7. **Story vs daily loop.** A heavy linear story fights the daily reset; the **graphic-novel-adjacent** plan
   sidesteps it. Keep in-game narrative light/environmental; persistent systems are the "progression story."
8. **Mad Libris word reuse.** Adjectives fill fable blanks _and_ brew potions — keep the collection a
   non-destructive record; brewing spends **letters**, not the word entry.

---

## 8. Build order (each a shippable milestone)

1. ✅ **DONE** — `adj-attrs.json` + **meaning-driven potions** (replaced random-3; re-slotted size/speed/reveal
   as the self-buff poles). Antonym poles (slow/small/dark) also brew now and accumulate in inventory
   (not yet usable), since the dev's call was to keep the debuffs and defer only the _world/obstacle_ effects.
2. ✅ **DONE (2026-07) — the Apothecary:** an always-available window (`P` / ⚗️ toolbar + touch button;
   `state.apothecaryOpen`, `openApothecary`/`renderApothecary`/`apVial`, modal `#apothecary`) with two tabs
   (Feats-style): **Flasks** shows one **dumbbell rack per attribute** (Speed/Size/Light) with two **per-pole
   flasks** — a vial whose _size = # uses_ that visibly **grows** with capacity; **Words** lists your collected
   adjectives grouped by pole (clickable → def modal) so you can see which synonyms fill each side of a dumbbell. `flaskCap(pole)` = `FLASK_BASE(5) + floor(breadth/FLASK_STEP(4))
   + (attribute noun in dex ? FLASK_NOUN_BONUS(2))`; breadth = distinct adjectives per pole, `state.adjCounts`
   re-derived from the dex like `verbCounts` (`rederiveAdjCounts`/`onNewAdjWord`) — **no new saved state**.
   `commitSpell` + farm-harvest now **brew up to cap** (a full flask declines the extra dose but still
   collects the word; a brand-new synonym grows the flask first, so it can make room). Collecting an
   attribute noun fires an "aha" toast. **No gating.** _(Antonym/Synonomouse guides + codex v1 NOT included —
   deferred to a 2b pass.)_
3. **Antonym debuffs — drink → affect ALL beasts on screen** + enemy **status states** (slowed/shrunk/blinded).
   Makes the already-brewing slow/small/dark potions usable. **No throw/aim** (decided 2026-07).
4. **Throw + aim** single-target mode for antonym potions — a later enhancement on the §3 status states.
5. **World/state** potion effects → authored-obstacle `acceptedSolutions`.
6. **Hypernym→hyponym shelves** (regenerated noun-books).
7. **Adverb amplifiers** — the **quality** lane (potency/duration per use), complement to flasks (§3.5).
8. **World Atlas** (proper nouns behind capital letters) — countries+capitals JSON, an authored Tiled/LDtk
   region map, dual-dictionary validation, fact-card reward. Fairly independent of the rest; gated by capitals.

---

## 9. Deferred / open

- **Throw + aim** for antonym potions — deferred (§8.4). v1 antonym effect is drink → all-beasts-on-screen;
  single-target throwing/aiming is a later enhancement layered on the same status states.
- **Flask capacity numbers** — base size per pole, the breadth milestone step (Feats-style: base N, then
  every +K distinct adjectives → +1 use), and how big the attribute-noun bonus bump is. Tune when building.
- **Full-flask UX** — brewing a _new_ adjective when full still collects it (may enlarge the flask); a
  _re-spell_ when full should decline the dose (return letters) with a clear "flask full" message. Confirm.
- **Retroactive capacity** — like Feats, re-derive per-pole flask size from the existing dex on load; existing
  self-buff potion counts (`state.potions`) may already exceed a freshly-derived cap → clamp on display, don't
  destroy earned doses. Decide clamp vs. grandfather when building.
- **Guides + codex timing** — bundle Antonym/Synonomouse + codex v1 into the Apothecary step (2) or split to 2b?
- Taxonomy guide character (owl?) — deferred.
- Verb / adverb / function-word guides — future.
- Exact starter attribute list & numbers — tune when building the Apothecary.
- Whether world-effects share the obstacle system or get their own interactables.
- Atlas family beyond geography (star/pantheon/calendar/languages, §4b) — deferred to a shared board system.
- Whether proper-noun spelling also grants ink, or only atlas fill + fact card. -**Other potions possibilities -
  | Temperature | **Hot** — fire resist / thaw | **Cold** — freeze/root enemy | melt ice / freeze water into a bridge |
  | Weight | **Light(wt)** — float, longer dash | **Heavy** — root enemy | press switches |
  | Strength | **Strong** — +attack | **Weak\*\* — weaken enemy | — |
