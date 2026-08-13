# Inklings — The World Atlas (proper nouns, capital letters, flags)

Planning doc. **Read this before touching capital letters, proper-noun validation, or the Atlas board.**

Status: **M1 (data build) and M2 (the daily capital letter) are BUILT — 2026-08-13. M3–M5 are plan only.**
`build_geo.py` + `data/atlas-world.json` exist (§5), and capital letters now spawn daily and bank
persistently in `inklings.html` (§2, §3). **The Atlas board itself does not exist yet** — M2 deliberately
ships first so capitals accumulate before there's a place to spend them. The rest is the full spec for the
feature sketched in [`inklings-grammar-systems.md`](inklings-grammar-systems.md) §4b.

> **Terminology, kept strict throughout:** a **capital letter** is `A`–`Z`. A **capital city** is Paris,
> Tokyo, Lima. The feature runs on the pun, so the doc never lets the two words blur.

Cross-refs: [`inklings.md`](inklings.md) (core loop, letter-unlock curve, desk/bench, satchel) ·
[`inklings-grammar-systems.md`](inklings-grammar-systems.md) §4b (the origin sketch — this doc supersedes
its detail) · [`inklings-architecture.md`](inklings-architecture.md) (authored-map pipeline — **not** a
dependency, see §3) · [`inklings-placement.md`](inklings-placement.md) (where earned flags get flown) ·
[`inklings-collections.md`](inklings-collections.md) (milestone-grant pattern) ·
[`inklings-diacritics.md`](inklings-diacritics.md) (the accents this doc normalizes away) ·
[`inklings-farming.md`](inklings-farming.md) (`UPPER_DROP_CHANCE`, another early capital-letter path).

---

## 0. TL;DR — the decisions

1. **Every day, at least one capital letter appears in the world**, from day one — a letter-creature you
   hunt exactly like any other. It is **not** granted to your inventory; you go and catch it. This is what
   makes the Atlas playable long before the `CAP_ORDER` word gate.
2. **Which capital letter is a frequency-weighted day-seeded roll over all 26** (`FREQ` order), so the
   common ones (E, T, A, O, I, N, S, R) turn up far more often and rare ones (Q, X, Z) are an event.
3. **The Atlas is open-ended recall, not a daily puzzle.** There is no geography word-of-the-day and no
   target place. Spell *any* country or capital city you can think of, whenever you have the letters.
4. **Caught capital letters persist and are uncapped** — their own store, outside the 10-slot satchel,
   never wiped at rollover. Spelling a place consumes one as normal.
5. **The Atlas is a Library overlay board**, same pattern as the garden / Pig Pens / heraldry overlays.
   It does **not** wait on the unbuilt authored-map pipeline.
6. **Region shapes come from a build script**: `build_geo.py` rasterizes public-domain Natural Earth data
   into a coarse grid → `data/atlas-world.json`. Real positions and adjacency for free, all 196 countries,
   and the chunky grid *is* the pixel-parchment look.
7. **The board is layered, not just political.** Countries and capital cities, plus **seas & oceans, lakes
   and named mountain peaks** — 475 spellable names in all. Layers mean one cell can be both "France" and
   "Alps", which is what lets rivers and mountain ranges drop in later without a renderer rewrite (§5.1).
8. **Whole world open from the start**; the seven continents are completion sub-goals.
9. **Rewards:** ink for spelling a country *or* its capital city; **pairing both earns that country's flag**,
   flown on a placeable flagpole (one object, any earned flag assigned to it) in the Library or cozy square.
10. **The existing word-count capital gate stays.** Daily spawn = the trickle; `CAP_ORDER` at ~130 words =
    the floodgate.

---

## 1. Why this feature exists

`CAP_ORDER` / `capUnlockAt()` / `weightedLetter`'s `if(isUpper(l)) w*=(0.35+dist*0.5)` and the code comment
*"its distinct value comes later, via the geography/proper-noun content — roadmap #10"* have all been in
the game for a long time. **Capital letters are a gate with nothing behind them.** This is the thing behind
them.

The pedagogy is self-evident: you literally cannot spell a place without a capital letter, so the mechanic
*is* the rule. And because the desk resolves case, the homograph pairs teach it for free — **turkey** is a
bird, **Turkey** is a country; **china**, **chile**, **georgia**, **jordan**, **chad**, **guinea** all do
the same. Same letters, different case, different answer. That's the best teaching moment in the feature;
build the copy around it.

---

## 2. The daily capital letter

### 2.1 What it is

Once per day, the world generation guarantees **at least one capital letter-creature** somewhere in the
5×5 world, regardless of how many words you've collected. You find it and capture it like any other
letter-creature — same sprite treatment (already case-aware via `isUpper`/`colorFor`), same capture, same
drop. Nothing is handed to you.

### 2.2 Which letter — `dailyCapital()`

A **frequency-weighted roll over all 26**, day-seeded from `mulberry32((state.daySeed ^ 0xCA9174)>>>0)`
(a distinct offset so it doesn't correlate with the WOTD / snowclone / Excla dailies), cached per day like
`wordOfTheDay()`. Weights are the existing `FREQ` table, so E is ~12× as likely as Z.

Every capital letter is possible from day one — no ladder, no unlock order. Common-first happens naturally
through the weighting rather than through gating machinery.

### 2.3 Where it spawns

`dailyCapitalSpot()` — a day-seeded uniform pick over every screen that is **not home** and **carries no
obstacle**, so it's always worth a short trek (the same instinct as `weightedLetter`'s far-from-home skew
for capitals) and can never spawn inside the river's walled-off corner, unreachable until you've solved the
crossing. Within the screen it takes an ordinary walkable spawn.

**It is pinned at creature index 0** (`forcedLetters` puts it ahead of the WOTD letters). Creature ids are
positional — `sx,sy,i` — and `wotdGuaranteed()` returns nothing until `2of12.txt` finishes loading, so a
capital pinned *after* the word letters would shift index mid-session and break the "already caught today"
lookup. At index 0 its id is stable no matter what the loader is doing.

It is an ordinary member of the day's population, so it **counts toward `dayTotal()`** (decided) and
therefore toward the Wordle-style "all of today's letters collected → day done" rule. One consistent rule
for every letter on the map, and a completionist can never miss the capital.

**Signposting (decided): tell the player *that* it exists, never *where*.** A HUD line — "a capital **T** is
abroad today" — plus a note on the Atlas board, so nobody plays for a week without discovering that capital
letters appear at all. Finding it still means sweeping the world. Explicitly **not** minimap-marked; that
would delete the hunt.

### 2.4 What it is not

Two things I previously got wrong, recorded so they don't creep back in:

- **Not a grant.** Nothing appears in your bag at rollover. The day's capital letter is a spawn to hunt.
- **Not a daily target place.** There is no "today's country," no guaranteed-spellable selection, no
  geography word-of-the-day. The day's letter is a *pacing device*; what you do with it is entirely open.

---

## 3. Holding capital letters

```js
state.caps = {}    // "F" -> count. Persistent; NOT wiped by startNewDay(); NOT counted by satchelCount().
```

- **Uncapped.** No 10-slot limit — hold as many as you like. `capsCount()` is deliberately *not* part of
  `satchelCount()`.
- **Persistent.** Survives the nightly wipe that clears `state.inv`. Lowercase letters still reset daily.
- **Consumed on use.** Spelling a place spends one capital letter like any other letter; catching a letter
  is not a permanent unlock of it.
- **A full satchel never blocks a capital.** The capture path skips the `satchelFull()` guard for uppercase,
  because a capital doesn't go in the satchel — and it's the one letter you can't just come back for
  tomorrow.
- **Every source banks.** Caught creature, the garden's `UPPER_DROP_CHANCE`, and the dev letter-grant all
  route uppercase to `state.caps`. The Typo's swap is restricted to lowercase so a hostile creature can't
  mint a banked capital for you. The Erazor only reaches into `state.inv`, so banked capitals are safe
  from it.

**Why banking matters** (and it isn't what I first assumed): you only ever need **one** capital letter per
place — the initial. You bank them because on the day you catch a `G` you may not be able to *think* of a
country or capital city starting with G, or you may not have the lowercase letters to finish one. The bank
lets a letter wait until the idea or the tail arrives. It is not a savings account for long names.

**At the desk:** the bench already has `benchShift`, a ⇧ toggle that flips the tray to capitals once
`hasUnlockedCapital()`. It now also appears whenever `state.caps` is non-empty, and the capital tray shows
`state.inv[C] + state.caps[C]`, spending **`state.inv` first, `state.caps` second** — the satchel copy is
day-scoped and would be wiped tonight anyway, so that order is the player-friendly one.

**HUD:** capital letters need their own visibly separate display from the satchel, since one store is wiped
nightly and the other isn't.

---

## 4. The Atlas board (a Library overlay)

- **Entry point:** a new object in `data/rooms/library.json` —
  `{ "type":"globe", "id":"globe", "col":24, "row":19, "w":2, "h":2, "solid":true, "interact":"openAtlas" }`
  — drawn and wired through the same room-object pipeline as `desk` / `book` / `curator`.
- **Overlay flag:** `state.atlasOpen`, added to `state` and to the overlay lists that gate movement, damage,
  hints and HUD hiding. **This is the known chore:** those enumerations appear in ~7 places (movement gate,
  `canBeHurt`, two hint-ready checks, the HUD `hide` expression, `ppHideSound()`, the key handler). Grep
  `state.pigpensOpen` and add alongside every hit.
- **Render:** a `<canvas>` drawing `atlas-world.json` cells at ~4–6 px. Cell states:

  | State | Look |
  | --- | --- |
  | Unfilled | parchment fill, faint ink border |
  | Country spelled | inked/tinted region, name label at its anchor cell |
  | Capital city spelled | a pin dot at that city's cell |
  | Both (paired) | region lights gold — and the flag is earned (§6.2) |
  | Not spellable in v1 (multiword) | greyed with a small "later" marker (§5.3) |

- **Interaction:** fit-to-view by default; click a region → its fact card; a continent tab row filters and
  frames. No pan/zoom rig in v1 beyond continent framing.
- **Fact card:** country, capital city, continent, flag. **The flag needs no asset** — an ISO-3166 alpha-2
  code maps to regional-indicator code points (`FR` → 🇫🇷). Platforms that don't render flag emoji show the
  letter pair, a fine fallback.

**Why an overlay, not walkable terrain:** the walkable version needs the whole Phase 1–4 map-seam refactor
in [`inklings-architecture.md`](inklings-architecture.md), and it fights the daily-rerolled overworld. The
board data is authored in a neutral schema anyway, so a future walkable version can consume the same file.

---

## 5. Data — `build_geo.py` → `data/atlas-world.json`  ✅ BUILT 2026-08-13

`python3 build_geo.py` (add `--report` for the diagnostic tables). Runs in ~2 s, deterministic, and writes
a **135 KB** `data/atlas-world.json`. **Stdlib only, no pip installs** — GeoJSON via `json`, polygons via a
scanline rasterizer in the script. Downloads cache in `build-cache/` (gitignored); `--refresh` re-fetches.

### 5.1 Layers — why the grid is not one-owner-per-cell

The board carries **four layers**, each with its own grid, so one cell can be both "France" and "Alps".
Physical features force this: the Nile crosses six countries, the Andes seven, the Sahara ten — none of
them can *own* a political cell. Settling it in the data now means the M3 renderer is written against the
final shape instead of being retrofitted after the fact.

| Layer | Source (all Natural Earth 1:50m, public domain) | Drawn | Spellable |
| --- | --- | --- | --- |
| `political` | `admin_0_countries` + `populated_places` (capitals) | 210 | 162 countries · 166 capitals |
| `marine` | `geography_marine_polys` — oceans, seas, gulfs, straits | 100 | 90 |
| `lakes` | `lakes`, filtered to `min_zoom ≤ 2` | 38 | 30 |
| `peaks` | `geography_regions_elevation_points` (points, no grid) | 72 | 45 |

**Not included, and both are drop-ins later — which is the point of layering:** *rivers* are line geometry
and need a line rasterizer (~25 lines the polygon filler can't do); *mountain ranges and deserts*
(`geography_regions_polys`) carry **no `featurecla` at the 50m scale**, so that file mixes ranges and
deserts together with continents, whole countries and US states, and needs curation before it is safe.

**50m, not the 110m originally specced:** 110m omits *every* microstate (Singapore, Vatican, Monaco,
Malta, San Marino…), which would make the "no country may be invisible" invariant vacuous for exactly the
countries that need it.

### 5.1a Naming rules

- **Countries** take the *shortest* of `NAME`/`NAME_LONG`/`ADMIN`/`NAME_EN` containing no abbreviating
  period. NE's `NAME` is abbreviated for map labels ("Dem. Rep. Congo", "St. Vin. and Gren.") and unusable
  as something to spell; shortest-without-a-period lands on the everyday name (Congo, Czechia, United
  States).
- **Capital cities** prefer `NAME_EN`, since `NAME` is the local form — that's what turns København into
  **Copenhagen** and NE's plain-wrong "Andorra" into **Andorra la Vella**.
- **Physical features drop the generic word.** "Pacific Ocean" is spelled **Pacific**, "Mount Everest" is
  **Everest**, "Lake Baikal" is **Baikal**, "Gulf of Mexico" is **Mexico**. This is both how people
  actually say them and the only way these layers are spellable at all — raw, the marine file contains
  **zero** single-word names. NE's `name_en` already does half the job for lakes ("Lake Ladoga" → Ladoga)
  and reunites features it splits geographically (North + South Pacific → one Pacific).
- **Roster policy is explicit, not inherited.** `SOVEREIGN_TYPES` covers NE's "Sovereign country" *and*
  "Sovereignty" (which is how it files **Cuba and Kazakhstan** — missing that quietly demoted two UN member
  states to unspellable terrain). "Country" entries count only when self-sovereign, which correctly keeps
  Jersey, Macao, Greenland, Aruba and Åland as dependencies. `FORCE_COUNTRY` / `NEVER_COUNTRY` then name
  the promotions and exclusions in one editable place rather than letting a shapefile's editorial choices
  decide a children's geography game. Everything off the roster is still **drawn** — never claimable.
- **Capitals are corrected, not trusted.** NE's populated-places file is not maintained as a capitals
  register: it lags renames and prefers the largest city over the official seat. `CAPITAL_OVERRIDES` fixes
  Burundi (Gitega, not Bujumbura), Benin (Porto-Novo), Palau (Ngerulmud), Tanzania (Dodoma), Kazakhstan
  (Astana, renamed back in 2022) and Sri Lanka; `MULTI_CAPITAL` picks the official capital over the seat of
  government for South Africa (Pretoria), Ivory Coast (Yamoussoukro) and Bolivia (Sucre). Every one of
  these is a fact a player would be *taught* by a fact card, so none is left to the source.

### 5.2 Output shape (actual, `schemaVersion: 2`)

```jsonc
{
  "schemaVersion": 2,
  "source": "Natural Earth 1:50m (public domain) via nvkelso/natural-earth-vector",
  "grid": { "cols": 240, "rows": 96, "proj": "equirect",
            "lonMin": -180, "lonMax": 180, "latMin": -60, "latMax": 84 },
  "layers": {
    "political": { "label": "Countries",
                   "rows_rle": [[[33,null],[6,"CAN"],...], ...] },   // per row: [runLength, id|null]
    "marine":    { "label": "Seas & oceans", "rows_rle": [...] },
    "lakes":     { "label": "Lakes",         "rows_rle": [...] },
    "peaks":     { "label": "Mountains",     "points": true }        // points only — no grid
  },
  "places": {
    "FRA":          { "layer": "political", "kind": "country", "name": "France",
                      "continent": "Europe", "iso2": "FR", "flag": "🇫🇷",
                      "cells": 45, "labelCell": [120,23],
                      "capital": "Paris", "capCell": [121,23],
                      "spellable": { "country": true, "capital": true } },
    "sea:pacific":  { "layer": "marine", "kind": "ocean", "name": "Pacific",
                      "full": "Pacific Ocean", "cells": 900, "labelCell": [...],
                      "spellable": { "name": true } },
    "lake:baikal":  { "layer": "lakes", "kind": "lake", "name": "Baikal", "full": "Lake Baikal", ... },
    "peak:everest": { "layer": "peaks", "kind": "mountain", "name": "Everest",
                      "full": "Mount Everest", "cell": [204,26], "elevation": 8848,
                      "note": "Worlds highest point", "summit": true,
                      "spellable": { "name": true } }
  },
  "index": { "Mexico": [["MEX","country"], ["sea:mexico","name"]], ... }   // see §6.1
}
```

`*_accented` fields appear **only when they differ** from the folded form (Curaçao, Bogotá) — the hook
[`inklings-diacritics.md`](inklings-diacritics.md) later lights up. Load lazily on first Atlas open (the
`data/wordnet-relations.json` pattern), not at startup.

### 5.2a What the build produced

| | |
| --- | --- |
| Grid | 240×96, 1.5° cells, latitude windowed to −60..84, 3×3 supersampled |
| Land cells | 7,952 of 23,040 (35%) |
| Places | **420** across four layers |
| Countries | **196** (+ 9 dependencies, 5 other) |
| **Spellable names, total** | **475** — 162 countries · 166 capitals · 90 marine · 30 lakes · 45 peaks |
| Fully completable country+capital pairs | **142** |
| Colliding names | 18 (see §6.1) |
| Placed by hand | 25 microstates — 10 borrowed from a neighbour, 15 in open water (all genuine island nations) |
| Capital pins snapped inside their country | 24 |

**Grid resolution was measured, not eyeballed.** 240×96 renders at exactly **720 px wide at 3 px/cell** —
the width of the game canvas — and is fine enough that every non-microstate wins cells honestly. The
earlier justification for it ("no country has to steal a cell from a neighbour") was **wrong reasoning**:
the steal branch never fired because the placement fallback searched for *unowned* cells, and unowned means
ocean, so it always found sea first. The honest metric is §5.3's — where hand-placed countries end up — and
on that metric the 15 open-water placements are exactly the 15 island nations, which is correct.

**Cells are supersampled 3×3 and assigned by vote** (`--subsample`). Sampling once per cell centre silently
drops every feature narrower than a cell — and raising resolution does *not* fix that, it only changes
which features fall through. Voting also puts borders where the land actually is.

### 5.3 Build-time invariants

- **No country may be invisible.** A nation too small to win a cell (Singapore, Vatican, Malta, island
  microstates) is placed by hand near where it really is. Order matters, and the first version got it
  backwards: it looked for a *free* cell, and free means unowned, which means **ocean** — so it dropped
  every landlocked microstate into the sea (Liechtenstein into the Adriatic, Luxembourg into the North
  Sea, Vatican into the Tyrrhenian). `force_onto_grid` now walks outward from the true position and, within
  each ring, **prefers borrowing a cell from a large neighbour over open water** — so Liechtenstein takes a
  cell from Switzerland and lands between Switzerland and Austria, while genuine island nations, whose own
  cell *is* ocean at radius 0, stay exactly where they belong. If even that fails the build **warns loudly**
  rather than silently shipping a missing nation.
- **A capital pin must sit inside its own country.** `capCell` comes from lat/long, and at 1.5° a coastal
  or border capital lands in a neighbour or in open water — Kinshasa drew inside Congo-Brazzaville,
  Copenhagen inside Sweden, Brussels and Bern inside France, and Baku, Praia, Suva and Kingston in the sea.
  Every pin is now snapped to its country's own nearest cell (24 of them needed it).
- **Names are normalized:** ASCII-folded, accents stripped (Bogotá → Bogota). The accented form is kept in
  the data, so [`inklings-diacritics.md`](inklings-diacritics.md) needs no rebuild.
- **v1 spellability = single-word only.** Everything is **drawn**; a name with a space or hyphen gets
  `spellable:false`. **A capital city is judged on its own merits** — it used to require a spellable
  *country* too, which deferred London, Seoul, Riyadh, Pyongyang, Wellington, Kinshasa and Pretoria purely
  because "United Kingdom" and "South Korea" have spaces.
- **Four places are their own capital city and spellable** — Djibouti, Luxembourg, Monaco, Singapore. One
  submission must award the country, the capital *and* the pairing flag (§6.1). (San Marino is a fifth
  such case, currently deferred for being multiword.) This list is generated from the data, not
  hand-written — an earlier hand-written version named Andorra, which had stopped being true two fixes
  earlier.

### 5.4 Satchel length constraint

The capital letter comes from `state.caps`, so the satchel only carries the **tail**: a name of length *n*
needs *n−1* satchel slots. At the base `bagCap` of 10 that's names up to 11 characters (Afghanistan ✓,
Liechtenstein ✗). The shop's existing repeatable `+1 satchel` upgrade is the progression that opens the
long ones — no new system needed.

## 6. Spelling a place, and what it pays

### 6.1 The dual dictionary at the desk

`checkWord()` currently does `const word = bench.join("").toLowerCase()`, discarding the case that carries
all the meaning here. The change:

```js
const raw  = bench.join("");          // case preserved
const word = raw.toLowerCase();       // everything downstream is unchanged
```

Then, **before** the WordNet lookup, a proper-noun branch:

```
if (/^[A-Z][a-z]+$/.test(raw) && atlasLookup(raw))  →  spellPlace(raw)
```

**`atlasLookup` reads the prebuilt `index`, and one word can claim several places.** The build emits
`index: { "Mexico": [["MEX","country"], ["sea:mexico","name"]] }` — 475 names, **18 of them colliding**,
and the collisions are some of the best teaching in the whole feature:

| Word | Claims |
| --- | --- |
| Mexico · Japan · Oman · Panama · Guinea · Honduras · Thailand · Taiwan · Finland · Mozambique | the country **and** the sea/gulf named after it |
| Kenya · Washington | the country/capital **and** the mountain |
| Malawi · Nicaragua | the country **and** the lake |
| Djibouti · Luxembourg · Monaco · Singapore | its own capital city (§5.3) |

So `spellPlace` takes a *list* of claims, not one. The natural reading — and the one that matches the
turkey/Turkey lesson — is that one submission fills **every** place with that name and the fact card shows
them together ("Mexico: the country, and the Gulf of Mexico"). That is an M4 decision, but the data is
already shaped for it.

`spellPlace(raw)`:

1. Spends the bench letters (`state.inv` first, then `state.caps` — §3).
2. Records into `state.atlas` — **not** `state.dex`, so noun shelves, verb Feats, adjective flasks and the
   POS ladders are all untouched. Proper nouns are their own namespace, as §4b requires.
3. Fills the region (country) or drops the pin (capital city); if both are now spelled, lights the pairing
   and awards the flag.
4. Pays ink via the existing `inkForWord()`.
5. Shows the **fact card** in place of the definition panel.
6. Fires the continent-completion check.

**The case discriminator is the whole lesson.** `Turkey` → country; `turkey` → the bird via the normal
WordNet path, no special-casing. When a player spells a lowercase homograph, the result panel can add a
one-line nudge ("…and with a capital T, it's a country") — the cheapest, best-placed grammar teaching in the
game.

Re-spelling an already-filled place: no reward, letters returned (mirroring the existing `msg-known` path).

### 6.2 Rewards

| Event | Reward |
| --- | --- |
| Country spelled | region fills · fact card · ink (`inkForWord`) |
| Capital city spelled | pin drops · fact card · ink (`inkForWord`) |
| **Pair completed** (country + its capital city) | region lights gold · **the country's flag, as a placeable décor** · the "capital of" line on the fact card |
| Continent completed | one-time ink lump + a larger décor grant, through the existing [`inklings-collections.md`](inklings-collections.md) milestone-grant path |

**The flag as décor** is the headline reward: a shelf of completed countries becomes a visible row of flags
in the world rather than a number on a screen. It grants through the existing décor/placement systems
([`inklings-placement.md`](inklings-placement.md)) — flyable in the Library or the cozy square at (0,1).

**Form (decided): one flagpole object that displays whichever earned flag you assign it.** *Not* 194
distinct décor entries. Placing a flagpole opens a picker of the flags you've earned; the pole stores its
assignment on the placed instance:

```js
state.placed: [{ id:"flagpole", kind:"decor", where:"library", cx:8, cy:14, flag:"FRA" }]
```

One piece of art total, 196 possible faces drawn from the emoji, no décor-inventory clutter, and it scales
to any future atlas ([`inklings-grammar-systems.md`](inklings-grammar-systems.md) §4b's Star Atlas /
Pantheon) without new objects. The only addition to the placement pipeline is a per-instance field and the
picker — `state.atlasFlags` is the authority on which flags a pole may display.

**Poles are a shop item, bought with ink, unlimited (decided).** A fourth row in the shop alongside
*Bigger Satchel* / *Bind a Fable Page* / *Seed Rack* (they're hardcoded `.shop-item` rows in the markup, so
this is one more), repeatable at a flat cost, adding to `state.decorOwned.flagpole`. This splits the reward
cleanly: **spelling earns the flag** (the achievement, unbuyable), **ink buys the pole** (the display
surface). Wanting to fly more of your collection becomes an ink sink, which also gives the ink paid by
Atlas solves somewhere of its own to go. A pole with no flags earned yet is buyable but empty — acceptable,
or gate the shop row behind the first earned flag (minor call, decide at build time).

No grammar-codex entry in v1 — the fact card plus the case discriminator carry the proper-vs-common lesson.

---

## 7. State & save

```js
state.caps        = {}     // capital letter -> count (persistent, uncapped, outside satchelCap(); §3)
state.atlas       = {}     // ISO3 -> { c: dayString|null, k: dayString|null }   country / capital city
state.atlasFlags  = {}     // ISO3 -> dayString earned (the pairing reward; feeds decorOwned)
state.atlasContinents = {} // "Europe" -> dayString claimed (one-time continent rewards)
```

All JSON-clean and **persist-forever** — never touched by `startNewDay()`. `state.caps` shipped with M2:
`snapshot()` is now **`v:9`**, and `applySnapshot()` restores `caps` *outside* the same-day guard that
gates the satchel, which is what makes the bank survive rollover. The M4 fields are not added yet.

Note there is no `atlasStampDay`-style idempotence field any more: the daily capital letter is a world spawn
derived from `state.daySeed`, so it's inherently idempotent and stateless. Reloading regenerates the same
world with the same capital letter in the same place; capturing it uses the existing `state.captured` set.

---

## 8. Build phases

Each phase is shippable and leaves the game working.

- **M1 — Data. ✅ BUILT 2026-08-13, revised the same day after review.** `build_geo.py` +
  `data/atlas-world.json` (135 KB, `schemaVersion:2`, 240×96, four layers, 420 places, **475 spellable
  names**). Stdlib-only, ~2 s, deterministic, sources cached in gitignored `build-cache/`. §5.3 invariants
  verified; raster spot-checked by rendering it back as ASCII. No game change.
  The revision fixed a batch of real defects found by code review — Cuba and Kazakhstan silently demoted to
  unspellable terrain, seven landlocked microstates placed **in the ocean**, 32 capital pins drawn inside
  the wrong country, six stale or wrong capital cities, and capitals needlessly gated on their country's
  spellability — and added the marine/lakes/peaks layers. See §5.
- **M2 — The daily capital letter. ✅ BUILT 2026-08-13.** `dailyCapital()` (FREQ-weighted day-seeded roll),
  `dailyCapitalSpot()`, `forcedLetters()` (one shared function feeding *both* `genScreen` and
  `screenCreatureCount`, so the world and the daily total can never disagree), `state.caps` +
  `capsCount()`/`letterAvail()`/`spendLetter()`, capture banking, the ⇧ tray and keyboard reading the bank,
  a separate HUD panel with the "abroad" signpost chip, the rollover toast, and save `v:9`. Ships on its
  own — capital letters are now catchable and bankable from day one, so players will arrive at the board
  with a stock in hand.
- **M3 — Board, read-only.** Globe object, `state.atlasOpen` + the ~7 overlay-list additions, canvas render
  with everything unfilled, continent tabs, click → fact card.
- **M4 — Spelling.** Case-preserving `checkWord`, `atlasLookup`, `spellPlace`, `state.atlas`, region fill +
  pin + pair lighting, fact card, ink. **The feature is real here.**
- **M5 — Flags & continents.** Pairing → flag décor grant + placement, continent rewards, the homograph
  nudge copy, sounds.

M2 deliberately precedes the board: it's small, it's the part you asked for, and banked capitals make the
board's arrival feel earned rather than empty.

---

## 9. Conflicts & considerations

- **Three sources of capital letters, and that's fine.** The daily spawn (from day one), the garden's rare
  `UPPER_DROP_CHANCE`, and the `CAP_ORDER` ladder at ~130 words that opens the general spawn pool. They
  layer: trickle → occasional bonus → floodgate. Reaching the word gate now means "I can hunt any capital
  letter I want" rather than "capital letters finally exist."
- **Proper nouns must not leak into the common-noun systems.** `state.dex` drives the library shelves, the
  Curator, mad-libs POS fills, and `wordsCollected()` — which paces the entire letter-unlock curve. Place
  names landing in `state.dex` would silently accelerate letter unlocks. Keeping the namespaces separate is
  the single most important implementation constraint in this doc.
- **`bench.join("").toLowerCase()` appears in more than one place.** Audit every bench read before changing
  the case handling.
- **Open-ended recall has no difficulty curve of its own.** The only pacing is letter availability, so a
  player who knows a lot of geography will burn through the easy countries fast and then stall on the ones
  they can't name. The continent tabs and the flag wall are what give the long tail a shape; watch for
  whether that's enough once M4 is playable.
- **Deferred multiword names** need a visible, non-frustrating treatment on the board, or players will read
  a greyed United States as a bug.
- **Uncapped persistent capitals** mean a long-absent player returns to a healthy stack. That's intended
  (banking is the point), but it does mean the Atlas can be played in bursts rather than daily — fine for a
  side collection, worth noticing if it ever cannibalizes the daily loop.

---

## 10. Open questions

1. **More than one per day, ever?** "At least one" is spec'd as exactly one. Should clearing a day, or
   completing continents, raise it?
2. **Locked fact cards** — before you've spelled a place, does clicking its region show nothing, its shape
   only, or a redacted card with the letter count?
3. **Multiword names** — a space tile at the bench, or auto-joined words? Deferred, but the answer shapes
   how §5.3's `spellable:false` places are presented.
4. **Atlas family** (Star Atlas, Pantheon, Calendar, languages — §4b) stays deferred until a second atlas is
   greenlit; generalize the board then, not now.
5. **Roster edge calls** — `FORCE_COUNTRY` promotes Israel, Kosovo and Taiwan out of Natural Earth's
   "Disputed" bucket; `NEVER_COUNTRY` leaves W. Sahara, Somaliland, N. Cyprus, Palestine and Antarctica
   drawn-but-unclaimable. Both lists are one edit away in `build_geo.py` if you'd rather draw those lines
   differently.
6. **Sri Lanka's capital** is set to the official **Sri Jayawardenepura Kotte**, which is multiword and so
   unspellable, rather than the commonly-taught **Colombo** (the commercial capital). Factually defensible,
   but it costs a well-known name — one line in `CAPITAL_OVERRIDES` to flip.
7. **Colliding names** (§6.1) — does one submission fill every place with that name, or does the player
   pick? The data supports either; the fill-everything reading is the one that matches turkey/Turkey.
8. **Rivers and mountain ranges** are the obvious next layers. Rivers need a line rasterizer (~25 lines);
   ranges/deserts need curation, because `geography_regions_polys` has no `featurecla` at 50m and mixes in
   continents, whole countries and US states. Neither needs a schema change — that's what §5.1 bought.
