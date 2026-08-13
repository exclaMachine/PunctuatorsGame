# Inklings — The World Atlas (proper nouns, capital letters, flags)

Planning doc. **Read this before touching capital letters, proper-noun validation, or the Atlas board.**

Status: **plan only — nothing built.** This is the full spec for the feature sketched in
[`inklings-grammar-systems.md`](inklings-grammar-systems.md) §4b, plus the **daily capital letter** that
makes it playable from day one.

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
6. **Region shapes come from a build script**: `build_geo.py` rasterizes public-domain Natural Earth borders
   into a coarse grid → `data/atlas-world.json`. Real positions and adjacency for free, all ~195 countries,
   and the chunky grid *is* the pixel-parchment look.
7. **Whole world open from the start**; the seven continents are completion sub-goals.
8. **Rewards:** ink for spelling a country *or* its capital city; **pairing both earns that country's flag**,
   flown on a placeable flagpole (one object, any earned flag assigned to it) in the Library or cozy square.
9. **The existing word-count capital gate stays.** Daily spawn = the trickle; `CAP_ORDER` at ~130 words =
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

Day-seeded onto a walkable tile on one screen of the world. Biased **away from home** (`dist >= 1`),
matching the existing `weightedLetter` treatment of capitals as a thing worth travelling for, but always
reachable inside the 5×5 world and never behind an unsolved obstacle.

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

- **Uncapped.** No 10-slot limit — hold as many as you like.
- **Persistent.** Survives the nightly wipe that clears `state.inv`. Lowercase letters still reset daily.
- **Consumed on use.** Spelling a place spends one capital letter like any other letter; catching a letter
  is not a permanent unlock of it.

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

## 5. Data — `build_geo.py` → `data/atlas-world.json`

### 5.1 Sources (offline, open-licensed, no runtime dependency)

- **Natural Earth 1:110m Admin 0 – Countries** (public domain) — borders to rasterize.
- **Natural Earth 1:110m Populated Places** (public domain) — capital cities with lat/long.
- Wikidata (CC0) as the cross-check for capital-city ↔ country and continent assignment.

Build-time Python deps only (shapefile/GeoJSON reading + point-in-polygon). Nothing ships to the browser but
the JSON — same pattern as `build_dictionary.py` / `build_levels.py`.

### 5.2 Output shape

```jsonc
{
  "schemaVersion": 1,
  "grid": {
    "cols": 180, "rows": 90,        // equirectangular; ~2° cells. Tune for look vs file size.
    "proj": "equirect",
    "rows_rle": [[[0,-1],[12,"FRA"],...], ...]   // per-row run-length: [runLength, isoOrNull]
  },
  "places": {
    "FRA": {
      "country": "France", "capital": "Paris", "continent": "Europe",
      "country_accented": "France", "capital_accented": "Paris",
      "iso2": "FR", "flag": "🇫🇷",
      "capCell": [88, 29],           // grid cell of the capital city (pin position)
      "labelCell": [86, 31],         // largest-area cell, for the name label
      "spellable": { "country": true, "capital": true }   // false = multiword, deferred (§5.3)
    }
  }
}
```

RLE keeps 180×90 = 16,200 cells small. Loaded lazily on first Atlas open (the
`data/wordnet-relations.json` pattern), not at startup.

### 5.3 Build-time invariants

- **No country may be invisible.** A nation too small to win a cell by point-in-polygon (Singapore, Vatican,
  Malta, island microstates) is **forced** to own its capital city's cell. Guarantees every place in
  `places` is findable and fillable — a deterministic script rule, not a hand-authored override file.
- **Names are normalized:** ASCII-folded, accents stripped (Bogotá → Bogota), per §4b. Keep the accented
  form in the data — it's the hook [`inklings-diacritics.md`](inklings-diacritics.md) later lights up, and
  keeping it now means no rebuild then.
- **v1 spellability = single-word only.** Every country is **drawn**, but a name containing a space or hyphen
  gets `spellable:false` and shows as deferred:
  - single-word country + single-word capital city → fully completable (France/Paris, Japan/Tokyo, Chile/Santiago)
  - single-word country + multiword capital city → region fillable, pin deferred (Malaysia/Kuala Lumpur)
  - multiword country → fully deferred (New Zealand, United States, Costa Rica, Sri Lanka…)

  Roughly a quarter to a third of the world is deferred in v1. Accept it — the board still reads as a world,
  and multiword names are a well-scoped later increment (the bench would need a space tile).

### 5.4 Satchel length constraint

The capital letter comes from `state.caps`, so the satchel only carries the **tail**: a name of length *n*
needs *n−1* satchel slots. At the base `bagCap` of 10 that's names up to 11 characters (Afghanistan ✓,
Liechtenstein ✗). The shop's existing repeatable `+1 satchel` upgrade is the progression that opens the long
ones — no new system needed.

---

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

**Form (decided): one flagpole object that displays whichever earned flag you assign it.** *Not* ~195
distinct décor entries. Placing a flagpole opens a picker of the flags you've earned; the pole stores its
assignment on the placed instance:

```js
state.placed: [{ id:"flagpole", kind:"decor", where:"library", cx:8, cy:14, flag:"FRA" }]
```

One piece of art total, ~195 possible faces drawn from the emoji, no décor-inventory clutter, and it scales
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

All JSON-clean; folded into `snapshot()` / `applySnapshot()` with a save-version bump (currently `v:8`), and
all **persist-forever** — never touched by `startNewDay()`.

Note there is no `atlasStampDay`-style idempotence field any more: the daily capital letter is a world spawn
derived from `state.daySeed`, so it's inherently idempotent and stateless. Reloading regenerates the same
world with the same capital letter in the same place; capturing it uses the existing `state.captured` set.

---

## 8. Build phases

Each phase is shippable and leaves the game working.

- **M1 — Data.** `build_geo.py` + `data/atlas-world.json` + credits (Natural Earth is PD; credit it anyway).
  Verify the §5.3 invariants. No game change.
- **M2 — The daily capital letter.** `dailyCapital()`, the guaranteed spawn in world generation,
  `state.caps` (persistent + uncapped), the ⇧ tray reading it, the HUD display. **Ships on its own** — even
  before the Atlas exists, capital letters become catchable and bankable from day one, so players arrive at
  the board with a stock in hand.
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
3. **Grid resolution** (180×90 vs finer) — trades micro-nation legibility against file size and the
   chunkiness that makes it look hand-drawn. Decide by eye after M1.
4. **Multiword names** — a space tile at the bench, or auto-joined words? Deferred, but the answer shapes
   how §5.3's `spellable:false` places are presented.
5. **Atlas family** (Star Atlas, Pantheon, Calendar, languages — §4b) stays deferred until a second atlas is
   greenlit; generalize the board then, not now.
