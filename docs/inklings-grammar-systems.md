# Inklings — Grammar Systems & Educational Design

Planning doc. The game's long-term identity: a Stardew/Minecraft-breadth adventure whose systems **teach
real grammar/lexical concepts by embodying them** (not by lecturing). Every part of speech owns a mechanic
*and* a word-guide character. Anchoring features to a part of speech / WordNet relation is how the game can
grow "a lot of features" without becoming an incoherent bag of systems.

Status: **plan only — not implemented.** Reflects decisions from the 2026-07 planning session.
Cross-refs: [`inklings.md`](inklings.md) (current systems), [`inklings-architecture.md`](inklings-architecture.md)
(maps/obstacles/portability).

---

## 0. Design philosophy

- **Teach through mechanics (emergent), with an optional codex.** You learn *antonymy* by brewing opposing
  potions, not by reading a definition. Short explanatory blurbs live in an **opt-in grammar codex**,
  delivered by the guide characters on **discovery** moments. No forced lessons/quizzes.
- **One relation per system.** Each mechanic embodies exactly one lexical idea, so the concept is legible.
- **Persistence carries learning.** The daily map resets (Wordle-style), but the **collection, codex,
  potion recipes, and shelves persist forever** — that's the progression/curriculum.

---

## 1. The POS-anchored framework

| POS | System(s) | Teaches | Guide |
| --- | --- | --- | --- |
| **Noun** | ink (economy) · **hypernym shelves** (taxonomy) · **attribute-flasks** (unlock potions) · **proper-noun atlases** (geography, §4b) | IS-A hierarchy; proper vs common | *(taxonomy guide — deferred)* |
| **Verb** | Feats ladders + abilities (existing) · "**action**" obstacle solutions | verb categories | *(future)* |
| **Adjective** | **potions** — the WordNet "dumbbell" (self-buff / antonym-throw / world) · "**state**" obstacle solutions | antonymy, similar-to, attribute | **Antonym 🐜** + **Synonomouse 🐭** |
| **Adverb** | potion **amplifiers** (adjective→adverb derivation) — later | derivation | *(future)* |
| **Modal verb** | hints / possibility (existing À La Modal) | modality | **À La Modal** |
| **Function words** | scraps / combine mechanic — later | syntax | *(future)* |

---

## 2. The word-guide cast

A small "faculty" of anthropomorphic guides. They appear on **discovery**, deliver one line, and feed the
codex; a **single-at-a-time queue** (reuse the existing Feats/letter celebration queue) stops them clamoring.

- **À La Modal** *(exists)* — modal verbs / possibility; the hedging hint companion.
- **Antonym the Ant 🐜** — teaches **antonymy**. Lives on the *bar* of the dumbbell between two poles; pops
  in the first time you complete an opposing pair (e.g. own both Hot and Cold). Contrary — argues both sides.
- **Synonomouse the Mouse 🐭** — teaches **similar-to / synonymy**. Hoards near-synonyms like cheese;
  appears as you stack satellites on a pole ("swift, fleet, nimble — almost the same!").
- **Taxonomy guide — DEFERRED** (decided: just the ant & mouse for now). The hypernym shelves teach quietly
  via the codex until/unless we add a guide (candidate: a wise "sees-the-whole-tree" owl).

---

## 3. Adjective potions — the WordNet "dumbbell"

**Today:** spelling any adjective brews a *random* potion from three fixed types (`size`/`speed`/`reveal`);
the word's meaning is ignored (`isAdj` branch in the spell handler; `POTION_TYPES`). **Target:** the
adjective's **attribute + pole** decides the potion — meaning-driven, and teachable.

### 3.1 The dumbbell (recap)
Descriptive adjectives cluster around an **attribute** (a noun). Two **antonym head** synsets = the poles
(the *bar*); each head's **"similar-to" satellites** = near-synonyms (the two *bells*). Also: attribute
(→ the noun), also-see, pertainyms (relational adjectives, outside the dumbbell).

### 3.2 Apothecary: attribute shelves + flask gating
- A brewing UI (station/room or a window like Equipment) shows one **dumbbell rack per attribute**: two
  opposing vials with the antonymy bar between them.
- **Flask gating (decided: yes):** collect the **attribute noun** (speed/weight/temperature) to *unlock*
  that shelf — the noun is the empty flask, adjectives are the essence. Essence collected before the flask
  **waits**, then unlocks on a satisfying "aha" when you find the noun.
- **Satellite tiers (synonymy):** more "similar-to" words on a pole → higher potion tier (potency/duration).
  Mirrors the verb Feats ladder.

### 3.3 The three reaches (decided: self + antonym + world)
Effects are **per-pole, defined in data** (not every pole needs all three):
- **Drink a pole → self-buff** in that direction.
- **Throw the antonym → debuff** enemies (or the world).
- **Some poles act on the world** → traversal/puzzle tools; wire into authored-obstacle `acceptedSolutions`
  (see §7.1).

### 3.4 Starter attribute set (proposal — re-slots the current 3 potions)

| Attribute (noun/flask) | Pole A (drink = self) | Pole B (throw = debuff) | World use |
| --- | --- | --- | --- |
| Speed | **Swift** — move fast *(=old speed)* | **Slow** — enemy slowed | — |
| Size | **Big** — reach/attack *(=old size)* | **Small** — fit gaps (self) | shrink/enter tiny passages |
| Light | **Bright** — reveal/light *(=old reveal)* | **Dark** — blind enemies | light dark screens |
| Temperature | **Hot** — fire resist / thaw | **Cold** — freeze/root enemy | melt ice / freeze water into a bridge |
| Weight | **Light(wt)** — float, longer dash | **Heavy** — root enemy | press switches |
| Strength | **Strong** — +attack | **Weak** — weaken enemy | — |

### 3.5 Adverb amplifiers (later)
Adverbs derive from adjectives (quickly←quick). An adverb amplifies its matching potion (Swift + "quickly"
→ longer/stronger) — teaches the derivation. Layer on after the core works.

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
*"geography/proper-noun content — roadmap #10."* `build_dictionary.py` **excludes** proper nouns (filters
`instance_hypernyms`). So proper nouns are a clean, separate namespace, and unlocking **capital letters
unlocks Capitals (capital cities)** — the payoff for a currently-rewardless gate.

**Proper nouns = a noun subtype:** common nouns → shelves/taxonomy; **proper nouns → fillable "atlases."**
Every atlas also teaches *proper vs common (why we capitalize)*.

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
from *your* collection ("you found *frigid* and *icy* — both satellites of **cold**"). Concepts: antonym,
synonym/similar-to, attribute, hypernym, hyponym, (later) derivation, modality. Never gates play.

---

## 6. Data pipeline (new WordNet-derived files, via `build_dictionary.py`)

- **`data/adj-attrs.json`** — adjective → { attribute-noun, antonym, similar-to[] }. Powers the dumbbell.
  Curate the attribute→friendly-noun mapping. **Fallback:** non-gradable/pertainym adjectives (wooden,
  musical) with no attribute/antonym → a bucket that feeds **crafting**, not potions (see §7.6).
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
3. **Potion UI overhaul.** `1`/`2`/`3` won't scale → the Apothecary (racks) + a **throw/aim** action for
   antonym debuffs. New station/room or Equipment-style window.
4. **Companion traffic.** Multiple guides → discovery-gated, one-at-a-time via the existing celebration queue.
5. **Combat expansion.** Thrown-potion debuffs add an aim mechanic + enemy **status states** (slowed, rooted,
   weakened, frozen, blinded).
6. **Non-attribute adjectives.** Fallback bucket → crafting materials/tinctures, not potions.
7. **Story vs daily loop.** A heavy linear story fights the daily reset; the **graphic-novel-adjacent** plan
   sidesteps it. Keep in-game narrative light/environmental; persistent systems are the "progression story."
8. **Mad Libris word reuse.** Adjectives fill fable blanks *and* brew potions — keep the collection a
   non-destructive record; brewing spends **letters**, not the word entry.

---

## 8. Build order (each a shippable milestone)

1. `adj-attrs.json` + **meaning-driven self-buff potions** (replace random-3; re-slot size/speed/reveal).
2. **Flask gating** + **Apothecary UI** + **Antonym & Synonomouse** on discovery + **codex** v1.
3. **Antonym-throw** debuffs (combat + status states).
4. **World/state** potion effects → authored-obstacle `acceptedSolutions`.
5. **Hypernym→hyponym shelves** (regenerated noun-books).
6. **Adverb amplifiers.**
7. **World Atlas** (proper nouns behind capital letters) — countries+capitals JSON, an authored Tiled/LDtk
   region map, dual-dictionary validation, fact-card reward. Fairly independent of 1–6; gated by capitals.

---

## 9. Deferred / open

- Taxonomy guide character (owl?) — deferred.
- Verb / adverb / function-word guides — future.
- Exact starter attribute list & numbers — tune when building §8.1.
- Whether world-effects share the obstacle system or get their own interactables.
- Atlas family beyond geography (star/pantheon/calendar/languages, §4b) — deferred to a shared board system.
- Whether proper-noun spelling also grants ink, or only atlas fill + fact card.
