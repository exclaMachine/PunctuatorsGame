# Inklings — The World Atlas (proper nouns, capital letters, flags)

Planning doc. **Read this before touching capital letters, proper-noun validation, or the Atlas board.**

Status: **M1–M5 are all BUILT — M1 (data), M2 (the daily capital letter), M3 (the board) and M4 (spelling) on
2026-08-13; M5 (flags & continents) on 2026-08-14.** `build_geo.py` + `data/atlas-world.json` exist (§5);
capital letters spawn daily and bank persistently; the Library globe opens a flat, layered world board (§4);
**places are spelled at the desk** — a Capitalized bench inks a region or drops a capital pin, un-redacts that
card, and pairing a country with its capital city earns its flag; and an earned flag now **flies from a
flagpole** you buy with ink and plant in the Wordhoard, while each continent pays out at 25 / 50 / 100% of its
own spellable names (§6.3). The rest is the full spec for the feature sketched in
[`inklings-grammar-systems.md`](inklings-grammar-systems.md) §4b.

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
8. **Whole world open from the start**; the six continent tabs are **proportional** sub-goals — 25 / 50 /
   100% of each continent's own spellable names, because the continents are wildly uneven (§6.3).
9. **Rewards:** ink for spelling a country *or* its capital city; **pairing both earns that country's flag**,
   flown from a placeable flagpole (one object, any earned flag assigned to it) — in the Wordhoard today,
   and in the cozy square once [`inklings-placement.md`](inklings-placement.md) step 2 opens `(0,1)`.
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
day-scoped and would be wiped tonight anyway, so that order is the player-friendly one. Since M4, ⇧ is
**momentary**: placing a letter releases it, because a place name is always one capital plus a lowercase
tail, which makes the whole Atlas flow ⇧ → letter → type the rest.

**HUD:** capital letters need their own visibly separate display from the satchel, since one store is wiped
nightly and the other isn't.

---

## 4. The Atlas board (a Library overlay)  ✅ BUILT 2026-08-13 (M3 read-only · M4 spelling)

- **Entry point:** a `globe` object in `data/rooms/library.json` at (24,19), 2×2, solid,
  `interact:"openAtlas"` — drawn and wired through the same room-object pipeline as `desk` / `book` /
  `curator` (`LIBRARY.globe`, `nearLibraryGlobe()`, `tryUseBench`, the E-hint, a **🌍 Atlas** toolbar button
  and an **ATLAS** touch button, both contextual). The furniture is a globe; **the board it opens is flat**
  (see below).
- **Overlay flag:** `state.atlasOpen`, in `state` and in every overlay enumeration that gates movement,
  damage, hints, the HUD and `closeAnyDialog`. Esc backs a framed continent out to the world before closing;
  Tab/E close outright.
- **Flat board, not a rendered globe (decided at build time).** The data *is* a 240×96 equirectangular
  raster, so projecting it onto a sphere recovers no accuracy — it would re-project the same coarse cells
  while hiding half the world, squashing everything near the limb, and turning click hit-testing into an
  inverse-projection problem. The globe stays the furniture; the board stays flat.
- **Render:** a 720×288 `<canvas>` (3 px/cell at world view, scaled up when a continent is framed), drawn
  from the decoded RLE rows. Cell states:

  | State | Look |
  | --- | --- |
  | Unfilled | parchment fill (two alternating tones so neighbours read apart), faint ink border |
  | Sea / lake | pale water wash · lakes a shade deeper |
  | Peak | a small ▲ at the summit cell |
  | Country spelled | inked gold region (`AT_INK`) |
  | Capital city spelled | a pin dot at that city's cell |
  | Both (paired) | region lights brighter gold (`AT_PAIR`) — and the flag is earned (§6.2) |
  | Not spellable in v1 (multiword) | greyed **and checkered**, so "deferred" reads as deliberate, not as a rendering bug (§5.3) |

- **Interaction:** fit-to-view by default; hover highlights, click selects → the fact card; a continent tab
  row frames and dims off-continent land; four layer toggles (Countries · Seas · Lakes · Peaks). No pan/zoom
  rig beyond continent framing. Hit-testing goes topmost-first: peak → lake → country → sea.
- **Continent frames are authored in degrees (`AT_FRAMES`), not derived.** Deriving a bounding box from the
  countries in a continent fails twice over: Natural Earth files **Russia as Europe**, so "Europe" boxes the
  whole northern hemisphere at ×2 zoom; and **Oceania straddles the antimeridian** (Fiji +178, Tonga −175),
  so its box is the full width of the grid. A window may therefore run *past* the right edge — the draw and
  pick paths map screen column → grid column through `colAt`/`kOf` and wrap.
- **Fact card, redacted (§10 Q2, decided).** An unspelled place gives up its **kind, its continent/layer and
  its letter count** — one ruled blank per letter, a wider gap between words — and nothing else. A board that
  printed 475 names would turn open-ended recall into copy-typing. Solved places un-redact in place (and show
  their `full` name when it differs — you spell *Pacific*, the card then reads "in full: Pacific Ocean").
  **The redaction is one-way per half:** spelling a country does **not** reveal its capital city and spelling
  a capital does not reveal its country — on the board *or* in the desk's result panel — so one half is never
  a free answer to the other. **The flag needs no asset** — an ISO-3166 alpha-2 code maps to regional-indicator
  code points (`FR` → 🇫🇷). Platforms that don't render flag emoji show the letter pair.
- **Progress is counted in names, not slots:** `Object.keys(index).length` = **475**, which already collapses
  the 4 remaining collisions (§6.1). Counting per-place slots reads 479 and disagrees with every other number
  here.

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
| `marine` | `geography_marine_polys` — oceans, seas, gulfs, straits | 100 | 80 |
| `lakes` | `lakes`, filtered to `min_zoom ≤ 2` | 38 | 28 |
| `peaks` | `geography_regions_elevation_points` (points, no grid) | 72 | 43 |

(Spellable counts are *after* the collision promotion in §5.1a — 14 features gave their bare word back to a
country and became multiword-deferred.)

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
  **Everest**, "Lake Baikal" is **Baikal**. This is both how people actually say them and the only way
  these layers are spellable at all — raw, the marine file contains **zero** single-word names. NE's
  `name_en` already does half the job for lakes ("Lake Ladoga" → Ladoga) and reunites features it splits
  geographically (North + South Pacific → one Pacific).
- **…except where the short name is already taken, where the full name is required instead** (decided
  2026-08-13). A feature whose stripped name collides with a country or capital city is **promoted back to
  its full form**: the gulf is **Gulf of Mexico**, not Mexico; the mountain is **Mount Kenya**; the lake is
  **Lake Malawi**. The country keeps the bare word and the two stop fighting over it. See §6.1 — this is
  what replaced the old "one word claims several places" reading, and it costs nothing in spellable names
  (the promoted names were only ever *sharing* a key). The promoted form is multiword, so those 14 features
  are drawn-and-redacted until the bench grows a space tile (§10 Q3), where they'll light up as the honest
  names people actually use.
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
| **Spellable names, total** | **475** — 162 countries · 166 capitals · 80 marine · 28 lakes · 43 peaks |
| Fully completable country+capital pairs | **142** |
| Colliding names | **4** — down from 18; see §5.1a and §6.1 |
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
- **No two places may answer to the same word** — except the four that genuinely *are* the same place
  (§5.3's country-is-its-own-capital list). A physical feature colliding with a country or capital is
  promoted to its full name (§5.1a); the pass runs after the layers are built and before the `index`, warns
  loudly if it can't find a generic word for a kind, and reports every promotion under `--report`. **NE's
  lakes carry no generic word at all** (`name_en` is a plain "Malawi"), so for those the generic half is
  synthesized from the feature's kind — this is the one place the build *adds* a word rather than stripping
  one.
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

## 6. Spelling a place, and what it pays  ✅ BUILT 2026-08-13 (M4)

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

**`atlasLookup` reads the prebuilt `index`.** The value is a *list* of claims, so `spellPlace` takes a list —
but after the §5.1a promotion pass **only four names claim two slots**, and all four are one place that is
its own capital city: **Djibouti · Luxembourg · Monaco · Singapore**. One submission fills the country, the
capital city *and* the pairing flag.

**Why the collisions were removed rather than embraced (decided 2026-08-13).** The earlier reading was that
one submission should fill *every* place with that name — spell "Mexico", get the country and the Gulf of
Mexico. The better answer is that **the gulf's name is not "Mexico."** Requiring the full name gives each
place its real name back, removes 14 of the 18 collisions structurally, and needs no picker modal and no
"which did you mean?" ambiguity anywhere in the flow. It costs nothing in the count of spellable names — the
promoted features were only ever *sharing* a key with the country — and it turns a fudge into a teaching
moment: the board says the gulf's name is more than one word, and one day you'll be able to spell it.

The alternative considered and rejected was adopting full names for **every** physical feature at once
(Lake Baikal, Pacific Ocean, Mount Everest). That is the honest long-term rule and is where §10 Q3 should
land — but doing it before the bench has a space tile would send the entire physical layer dark, cutting v1
from 475 spellable names to ~336.

`spellPlace(raw, claims)`:

1. Spends the bench letters (`state.inv` first, then `state.caps` — §3).
2. Records into `state.atlas` — **not** `state.dex`, so noun shelves, verb Feats, adjective flasks and the
   POS ladders are all untouched. Proper nouns are their own namespace, as §4b requires.
3. Fills the region (country) or drops the pin (capital city); if both are now spelled, lights the pairing
   and records the flag in `state.atlasFlags`.
4. Pays ink via the existing `inkForWord()` — **once per submission**, even when it fills two slots.
5. Shows the **fact card** in place of the definition panel.
6. Fires `claimContinents()` — any continent rung this name just carried over pays out here (§6.3).

**The atlas is fetched at the desk, not just at the board.** `openOverlay()` kicks off `loadAtlas()` (a local
135 KB file, once a session) and `checkWord` awaits it before judging a capitalized bench — a player can
perfectly well try to spell a place having never opened the globe.

**The case discriminator is the whole lesson.** `Turkey` → country; `turkey` → the bird via the normal
WordNet path, no special-casing. Spelling a lowercase homograph adds a one-line nudge to the result panel
(`atlasNudge`) — "…and with a capital T, **Turkey** is a country" — the cheapest, best-placed grammar
teaching in the game, and in practice the thing that tells players the Atlas is spellable at all. It stays
silent once that place is inked; a landed lesson shouldn't nag.

Re-spelling an already-filled place: no reward, letters returned (mirroring the existing `msg-known` path).
A capitalized word that is neither a place nor a dictionary word says so explicitly ("…and no place on the
Atlas goes by that name"), so a failed place attempt never reads as a broken dictionary.

### 6.2 Rewards

| Event | Reward |
| --- | --- |
| Country spelled ✅ | region fills · fact card · ink (`inkForWord`) |
| Capital city spelled ✅ | pin drops · fact card · ink (`inkForWord`) |
| **Pair completed** (country + its capital city) ✅ | region lights brighter gold · the "capital of" line + the flag on the fact card · **the flag is earned** (`state.atlasFlags`, toast + fanfare) and can be flown from a flagpole |
| Continent milestone ✅ | 25 / 50 / 100% of that continent's names → ink lump (+ a flagpole at 50%, a Framed Map at 100%) — see §6.3 |

**The earn and the display are split** (decided at M4): pairing *records* the flag, so M5 only had to build
the flagpole, the picker and the shop row — nobody who paired countries before M5 shipped needed a migration
pass to be granted flags retroactively.

**The flag as décor** is the headline reward: a shelf of completed countries becomes a visible row of flags
in the world rather than a number on a screen. It grants through the existing décor/placement systems
([`inklings-placement.md`](inklings-placement.md)) — flyable in the Wordhoard today, and in the cozy square at
(0,1) the moment placement step 2 opens that venue (poles need no extra work for it: `placeAtCell` is the
only library-only guard).

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

**Poles are a shop item, bought with ink, unlimited.** A fourth `.shop-item` row alongside *Bigger Satchel* /
*Bind a Fable Page* / *Seed Rack*, repeatable at a flat **`POLE_COST` = 25 ink**, adding to
`state.decorOwned.flagpole`. This splits the reward cleanly: **spelling earns the flag** (the achievement,
unbuyable), **ink buys the pole** (the display surface). Wanting to fly more of your collection becomes an ink
sink, which also gives the ink paid by Atlas solves somewhere of its own to go. **The row is always visible
but disabled until the first flag is earned** (decided at M5) — it reads "Pair a country with its capital city
to earn a flag first", which advertises the reward without letting ink buy a pole with nothing to fly.

**Raising a flag: place the pole, then face it and press E** (decided at M5). Poles go up bare; walking up to
one and pressing **E** — the same verb as the desk, the lectern and the globe — opens the picker, a grid of
every flag you've earned plus a *bare pole* option, and the picker also opens automatically the moment you
place a pole. The alternative (a tray slot per flag: 🇫🇷 pole, 🇯🇵 pole, …) was rejected because the tray
shows every owned piece at once and would grow by one slot per country you pair. Consequences of the chosen
model, both intended: re-flagging is free and instant, and **picking a pole back up drops its assignment**
(it returns to the tray as a generic pole, since `state.decorOwned` counts ids, not instances).

The picker (`openFlagPicker`/`renderFlagPick`/`flyFlag`, `state.flagpickOpen`, `fpTarget` = the index in
`state.placed`) is a modal like any other dialog, so it appears in every overlay enumeration and dismisses the
décor tray on open. `flyFlag` re-checks `state.atlasFlags` before assigning — the authority is the earn
ledger, never the DOM. A placed pole draws through `decorFace()`, which falls back to the bare 🏳️ until the
atlas is loaded; `atlasHold()` kicks off that fetch on entering the Wordhoard whenever a flagged pole stands
there, so the fallback is only ever momentary.

No grammar-codex entry in v1 — the fact card plus the case discriminator carry the proper-vs-common lesson.

### 6.3 Continent milestones  ✅ BUILT 2026-08-14

**Three rungs per continent, measured against that continent's own spellable names** (its countries + their
capital cities), not a flat global number:

| Rung | Reward |
| --- | --- |
| 25% of the continent's names | +25 ink |
| 50% | +60 ink · a **Flagpole** |
| 100% | +150 ink · a **Framed Map** (`DECOR.atlasmap`) |

**Why a share and not "complete the continent"** (decided 2026-08-14): the continents are wildly uneven —
Africa carries **89** spellable names, Europe 83, Asia 81, but Oceania only 20 and South America 23. A single
all-or-nothing goal would be a shrug for South America and an unlit marathon for Africa. A proportional ladder
gives every continent the same three-rung shape, hands the long tail the structure §9 asks for, and makes the
first rung reachable on any continent the player happens to like.

- **Auto-granted, not claimed at a counter** (unlike [`inklings-collections.md`](inklings-collections.md)'s
  bundles, which have the curator as a natural claim surface): the trigger is a submission at the desk, so the
  payout lands in the same breath as the word — a line in the result panel, a toast, and `unlockbig`. A
  continent milestone outranks a flag for the single toast slot.
- `claimContinents()` re-derives from `state.atlas` every time it runs and writes one-time keys into
  `state.atlasContinents`, so it is **idempotent**. It runs on every place spelled *and* once when
  `loadAtlas()` resolves — which is what pays a save (or an import) made before M5 existed, with no migration.
- **Only the six continent tabs have goals.** The 151 marine/lake/peak names carry no continent, and neither
  do the five Natural Earth files under "Seven seas (open ocean)" (Maldives, Seychelles, Mauritius) — all of
  them count toward the world total only. The sum of the six continent totals is therefore *less* than 475,
  by design.
- **On the board:** framing a continent switches the header count to that continent (`21/83 Europe names
  inked`), puts the three rungs in the layer row as lit/unlit pips, and — with nothing selected — fills the
  card with the ladder: a progress bar, each rung's threshold in names, and what it pays.

---

## 7. State & save

```js
state.caps        = {}     // capital letter -> count (persistent, uncapped, outside satchelCap(); §3)
state.atlas       = {}     // placeId -> { c: dayString|null, k: dayString|null }  country/feature · capital city
state.atlasFlags  = {}     // ISO3 -> dayString earned (the pairing reward; the flagpole picker reads it)
state.atlasContinents = {} // "Europe:50" -> dayString paid (one-time continent milestones; §6.3)
state.placed[i].flag       // on a placed flagpole: the place id whose flag it flies (or absent = bare)
```

All JSON-clean and **persist-forever** — never touched by `startNewDay()`. `state.caps` shipped with M2;
`atlas` + `atlasFlags` shipped with M4 at `snapshot()` **`v:10`**; `atlasContinents` shipped with M5 at
**`v:11`**. `applySnapshot()` restores them *outside* the same-day guard that gates the satchel, which is what
makes them survive rollover. The milestone ledger is keyed **per rung** (`continent:tier`), not per continent
— the shape `bundleId()` uses — because a continent pays out three times.
The key of `state.atlas` is the **place id**, not always an ISO3 — `"FRA"` for a country but `"sea:baltic"`,
`"lake:baikal"`, `"peak:everest"` for the physical layers, which have no country code.

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
- **M3 — Board, read-only. ✅ BUILT 2026-08-13.** The `globe` object + `openAtlas`/`closeAtlas`,
  `state.atlasOpen` through every overlay enumeration, lazy `loadAtlas()`/`atDecode()` of the RLE rows, a
  wrap-aware canvas render of all four layers, authored continent frames (`AT_FRAMES`), layer toggles, the
  day's capital-letter signpost repeated on the board, hover/click hit-testing and the **redacted** fact
  card. No save-format change. Everything is unfilled by construction — `atlasSolved()` has nothing to
  read until M4.
- **M4 — Spelling. ✅ BUILT 2026-08-13.** Case-preserving `checkWord` (`raw` vs `word`) with the proper-noun
  branch ahead of WordNet, `atlasLookup`/`atlasPaired`/`spellPlace`/`showPlaceResult`, `state.atlas` +
  `state.atlasFlags` at save `v:10`, region fill + capital pin + `AT_PAIR` pair lighting, the un-redacting
  fact card on both the board and the desk, ink, the flag earned on pairing, the `atlasNudge` homograph line,
  and a promise-based `loadAtlas()` the desk awaits. Shipped alongside `build_geo.py`'s collision-promotion
  pass (§5.1a). **The feature is real here.**
- **M5 — Flags & continents. ✅ BUILT 2026-08-14.** `DECOR.flagpole` (+ `DECOR.atlasmap`, the 100% trophy)
  with the flag assignment on the **placed instance** (`decorFace`/`atlasHold`), the face-it-and-press-E
  picker (`poleInFront`/`openFlagPicker`/`flyFlag`, `state.flagpickOpen`, an E-hint and a touch 🏳️ button),
  the Stall's fourth row (`POLE_COST` = 25 ink, disabled until the first flag), continent milestones
  (`AT_CONT_TIERS`/`atContStats`/`claimContinents` at 25/50/100%, auto-granted and idempotent) with
  `state.atlasContinents` at save **`v:11`**, the board's per-continent count + rung pips + ladder card, and
  the existing SFX palette (`unlock` on raising a flag, `unlockbig` on a milestone).

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
- **Bench reads were audited at M4** — the only case-sensitive ones are inside `checkWord` (the submission
  and the "bench changed while the dictionary loaded" guard, which now compares `raw`). Everything else
  reads `bench` per-letter, so `spendLetter` and the tray were already case-correct.
- **Open-ended recall has no difficulty curve of its own.** The only pacing is letter availability, so a
  player who knows a lot of geography will burn through the easy countries fast and then stall on the ones
  they can't name. The continent tabs, the flag wall and (since M5) the 25/50/100% rungs are what give the
  long tail a shape; watch whether that's enough now that the whole thing is playable.
- **Deferred multiword names** need a visible, non-frustrating treatment on the board, or players will read
  a greyed United States as a bug. Handled by the grey + checker fill and the card's "its name is more than
  one word" line — and the §5.1a promotions (Gulf of Mexico, Mount Kenya) joined that set, so it now covers
  a few places whose *short* name a player may well try first.
- **Uncapped persistent capitals** mean a long-absent player returns to a healthy stack. That's intended
  (banking is the point), but it does mean the Atlas can be played in bursts rather than daily — fine for a
  side collection, worth noticing if it ever cannibalizes the daily loop.

---

## 10. Open questions

1. **More than one per day, ever?** "At least one" is spec'd as exactly one. Should clearing a day, or
   completing continents, raise it?
2. ~~**Locked fact cards**~~ — **decided at M3: a redacted card** (kind · continent · one ruled blank per
   letter · the letter count), so the board can never be read as an answer key. See §4.
3. **Multiword names** — a space tile at the bench, or auto-joined words? Still deferred, and now the
   biggest single unlock left in the feature: it would open **48 deferred countries** (United States, South
   Korea, Costa Rica…), **31 deferred capitals** (Buenos Aires, New Delhi, Mexico City…) *and* the 14
   features promoted in §5.1a (Gulf of Mexico, Mount Kenya, Lake Malawi). Satchel math already works —
   most full names need 8–10 slots against the base `bagCap` of 10, since each capital comes from the bank.
4. **Atlas family** (Star Atlas, Pantheon, Calendar, languages — §4b) stays deferred until a second atlas is
   greenlit; generalize the board then, not now.
5. **Roster edge calls** — `FORCE_COUNTRY` promotes Israel, Kosovo and Taiwan out of Natural Earth's
   "Disputed" bucket; `NEVER_COUNTRY` leaves W. Sahara, Somaliland, N. Cyprus, Palestine and Antarctica
   drawn-but-unclaimable. Both lists are one edit away in `build_geo.py` if you'd rather draw those lines
   differently.
6. **Sri Lanka's capital** is set to the official **Sri Jayawardenepura Kotte**, which is multiword and so
   unspellable, rather than the commonly-taught **Colombo** (the commercial capital). Factually defensible,
   but it costs a well-known name — one line in `CAPITAL_OVERRIDES` to flip.
7. ~~**Colliding names**~~ — **decided at M4: neither.** A feature whose short name collides is promoted to
   its full name, so the collision stops existing (§5.1a / §6.1). The four remaining collisions are places
   that are their own capital city, where one submission fills both by design.
8. **Rivers and mountain ranges** are the obvious next layers. Rivers need a line rasterizer (~25 lines);
   ranges/deserts need curation, because `geography_regions_polys` has no `featurecla` at 50m and mixes in
   continents, whole countries and US states. Neither needs a schema change — that's what §5.1 bought.
