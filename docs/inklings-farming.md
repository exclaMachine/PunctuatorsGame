# Inklings — Farming & Scripts (cozy zone)

Planning doc. A peaceful, **persistent** "cozy layer" (roadmap item #8: *renewable letters*) that sits
**alongside** — not replacing — the hunt-and-spell core. First script: **Braille**, via a farm whose beds
echo the Braille 2×3 cell. IPA/phonetics is parked for a later pass (§5).

Status: **Stages 1–2 shipped to production for testing** (was a debug-only scaffold). The Garden modal now runs a
real economy: **real-calendar seasons**, **season-locked consumable seeds** sown **one per Braille dot**, a Stall
**seed rack**, **overnight maturation + once-per-day harvest**, starter/milestone seed grants, **rarity-scaled
bonus-seed yield**, a rare **uppercase-letter drop** (early path past the word-gate), and a **quiz/hard mode** that
hides the Braille pattern. Still a **dialogue** (the walkable §8 zone is the remaining future work). See §9.
Cross-refs: [`inklings.md`](inklings.md), [`inklings-architecture.md`](inklings-architecture.md) (the farm
is an authored persistent area), [`inklings-grammar-systems.md`](inklings-grammar-systems.md) (teaching mission).

---

## 0. TL;DR
- A cozy **persistent** farming zone, separate from the daily-reset field **and** from combat.
- Beds are **2×3 Braille cells**. Seeds are **consumable and season-locked**: you sow **one seed per Braille dot**,
  so forming a letter spends seeds equal to its dot-count — the deliberate placement *is* the Braille lesson.
- **Real-calendar seasons** (Northern-hemisphere meteorological): each of the four seasons has its own **authored
  26-crop roster** (**104 crops** total — see §2's table; emoji still placeholder pending pixel sprites).
  A season's seed only grows that season; standing crops **wither** at the season's turn and must be replanted.
- **Overnight maturation, then harvest once per real day** all season (per-crop timing is configurable for
  real-plant accuracy later). Harvest = a **renewable** supply of that letter + the crossword-word POS payouts.
- **Crossword-garden:** rows **and** columns of mature beds that spell real (dictionary-valid) words pay bonuses —
  you design your own crossword.
- Economy loop: **spell nouns → ink → buy this season's seeds → sow letters → grow/spell more → re-plan each season.**

## 1. Why / how it fits
- Already on the roadmap ("Farming/ranching — renewable letters, the cozy layer").
- **Coexists with combat** (Stardew-style): hunting = active; farming = calm/renewable. Decided: farming is a
  **cozy zone**, self-contained.
- **Fixes rare-letter scarcity:** buy a Q/X/Z seed and farming makes those scarce letters renewable.

## 2. Core loop — Braille beds + letter-seeds
- **Bed = a Braille cell:** a 2×3 grid of plots. Braille dots are numbered 1-2-3 down the left column, 4-5-6
  down the right:
  ```
  (1) (4)
  (2) (5)
  (3) (6)
  ```
- **Seeds (consumable, season-locked, decided):** buy the **current season's** seeds at the Stall with ink
  (**buy any quantity**; price scales with letter rarity via `SEED_PRICE_TIER` × `tierOf`). You sow **one seed
  per Braille dot** (`gardenPlant` spends/refunds per dot); lifting a dot refunds its seed until the crop matures.
  A seed only grows in **its own season** — off-season seeds wait in your bag until that season returns. Seeds are
  keyed `"season:letter"` in `state.seeds`. Starter + early word-milestone **seed packets** (`SEED_GRANTS`: start
  with an A packet, earn T/E/S packets at 3/8/15 words) bootstrap a fresh player.
- **Crops tied to letters — the alphabet garden:** each crop is produce whose initial *is* its letter (teaches
  initial letters; great for younger learners). Full **104-crop** roster (26 × 4 seasons) below.
- **Planting = the Braille lesson:** plant the crop in its letter's Braille pattern (A → dot 1; C → dots 1+4;
  L → dots 1+2+3). The almanac shows each letter's pattern; doing it grows the letter.
- **Harvest:** a renewable supply of that Latin letter for the satchel / Wordsmithy (plus word rewards, §3).

### Crop roster — the 104 (authored; emoji stand-ins → pixel crops later)
One real plant per letter per season (`CROPS_BY_SEASON[season][letter] = [name, emoji]` in `inklings.html`),
placed by **Northern-hemisphere** seasonality across flower/fruit/veg/root/leaf/herb/nut/melon/squash/citrus/
bark-resin/spice/medicinal/mushroom. `BRAILLE[letter]` is global (season-invariant lesson). Emoji are
**placeholders** — many reuse generics (🌸/🌼/💐 flowers, 🌿 greens/herbs, 🌰 nut/bark/spice, 🫘 legumes,
🍠/🥕/🥔 roots) and should be replaced by pixel sprites.

| | 🌱 Spring | ☀️ Summer | 🍂 Autumn | ❄️ Winter |
| --- | --- | --- | --- | --- |
| **A** | Asparagus 🌿 | Apricot 🍑 | Apple 🍎 | Amaryllis 🌺 |
| **B** | Bluebell 🌸 | Blueberry 🫐 | Beet 🍠 | Brussels sprout 🥦 |
| **C** | Chives 🌿 | Cucumber 🥒 | Cranberry 🍒 | Cinnamon 🌰 |
| **D** | Daffodil 🌼 | Dill 🌿 | Date 🌰 | Daikon 🥕 |
| **E** | Elderflower 💐 | Eggplant 🍆 | Elderberry 🫐 | Endive 🥬 |
| **F** | Fiddlehead 🌿 | Fig 🫐 | Fennel 🌿 | Frankincense 🌰 |
| **G** | Grape hyacinth 🌸 | Green bean 🫘 | Grape 🍇 | Ginger 🌿 |
| **H** | Hyacinth 🌸 | Honeydew 🍈 | Hazelnut 🌰 | Horseradish 🥕 |
| **I** | Iceberg lettuce 🥬 | Indigo 🌸 | Indian gooseberry 🍏 | Iris 🌸 |
| **J** | Jonquil 🌼 | Jalapeño 🌶️ | Jujube 🍒 | Juniper 🫐 |
| **K** | Kohlrabi 🥬 | Kiwano 🍈 | Kabocha 🎃 | Kumquat 🍊 |
| **L** | Lettuce 🥬 | Lavender 🌸 | Leek 🧅 | Lemon 🍋 |
| **M** | Morel 🍄 | Mango 🥭 | Marigold 🌼 | Mandarin 🍊 |
| **N** | Nettle 🌿 | Nectarine 🍑 | Nutmeg 🌰 | Napa cabbage 🥬 |
| **O** | Orange blossom 🌸 | Okra 🌿 | Olive 🫒 | Orange 🍊 |
| **P** | Pea 🫘 | Peach 🍑 | Pumpkin 🎃 | Parsnip 🥕 |
| **Q** | Quamash 🌸 | Queen Anne's lace 💐 | Quince 🍐 | Quinine bark 🌰 |
| **R** | Rhubarb 🌿 | Raspberry 🍓 | Rosehip 🌹 | Rutabaga 🥔 |
| **S** | Strawberry 🍓 | Sunflower 🌻 | Saffron 🌸 | Snowdrop 🌸 |
| **T** | Tulip 🌷 | Tomato 🍅 | Turnip 🥔 | Tangerine 🍊 |
| **U** | Upland cress 🌿 | Urad bean 🫘 | Ube 🍠 | Ugli fruit 🍊 |
| **V** | Violet 🌸 | Vidalia onion 🧅 | Verbena 🌿 | Valerian 🌿 |
| **W** | Wisteria 🌸 | Watermelon 🍉 | Walnut 🌰 | Witch hazel 🌼 |
| **X** | Xanthoceras 🌼 | Xigua 🍉 | Ximenia 🍑 | Xylopia 🌰 |
| **Y** | Yarrow 💐 | Youngberry 🍇 | Yam 🍠 | Yuzu 🍋 |
| **Z** | Zizia 🌼 | Zucchini 🥒 | Zante currant 🍇 | Zedoary 🌿 |

Nice seasonal arcs the same plant makes across the table: **Elderflower** (spring) → **Elderberry** (autumn),
and **Orange blossom** (spring) → **Orange** (winter). Hard letters lean on real-but-obscure plants (X:
Xanthoceras/Ximenia/Xylopia; Q: Quamash/Quinine bark; Z: Zizia/Zedoary) — all genuine, all swappable.

## 3. The crossword-garden (the hook + scoring)
- **Garden = a grid of bed-cells** (start ~6×6). Each planted, mature bed = one letter (its crop), shown as its
  Braille pattern. Read a **row** left-to-right or a **column** top-to-bottom → a **Braille word**.
- **Base harvest (always on):** every mature bed yields **+1 of its letter** — the renewable letter supply.
- **Word scan:** every run of **≥3 adjacent beds** across a row or down a column whose letters form a **valid
  dictionary word** (reuse the game's existing word check) scores. (2-letter valid words = optional token trickle.)
- **Words pay by their part of speech (the key unifier, decided).** Harvesting a garden word *spells* it, so it
  pays through the **normal word pipeline** — **noun → ink, adjective → potion, verb → Feats, proper noun →
  atlas**, etc. No special-case rewards: the garden is just a peaceful, renewable way to spell words, and every
  word type pays *something*. Payout = base letters **+** each word's POS reward.
- **Renewable loop:** pays **every harvest** (decided), so a good crossword pays each cycle. Re-harvesting
  *known* words gives the **renewable** reward (ink/potion) but not new collection entries; a **first-time**
  word also registers in your collection — matches the "renewable currency loop" in `inklings-grammar-systems.md`.
- **Crossing bonus:** any bed in **both** a row-word and a column-word applies **×1.5** to each — interlocking
  layouts compound (the reason to think in 2-D).
- Reinforces Braille (*read your plots as words*), rewards vocabulary + planning, ties the farm to the core.

## 4. Economy & balance
- **Input = ink** (earned by spelling nouns); **output = renewable letters + POS word-rewards** → feeds back
  into spelling. Ink is the bridge; the Stall now has a **seed rack** (`updateShopSeeds`/`buySeeds`).
- **Seasons are the throttle (built).** Seasons are **real-calendar** (`currentSeason` from the date; dev can
  force one). Because seeds are **season-locked** and standing crops **wither** at the turn (`gardenSeasonSync`),
  a single "perfect" crossword can't pay forever — players must **re-plan and re-buy** each season.
- **Once-per-day harvest (built).** A bed matures overnight (`cellMature`, `matureDays` default 1) then yields
  **once per real calendar day** (`cell.lastHarvest`); word POS-payouts are likewise **once per day per word**
  (`state.garden.paid`, day-scoped) — so you can't instant-re-harvest to mint infinite ink/seeds.
- **Renewable seed loop (built).** Harvesting a mature bed has a **rarity-scaled** chance (`BONUS_SEED_CHANCE` ×
  `tierOf`: common 0.6 → legend 0) to yield a **bonus seed** of that same season-crop, so commons self-propagate
  while rare **Q/X/Z stay buy-only**. A rare **uppercase drop** (`UPPER_DROP_CHANCE` ≈ 0.05) also drops that
  letter's **capital** into the satchel — an **early path** to capitals ahead of the ~118-word gate.
- **Balance guard:** also pace via **rarity-scaled seed cost**, **per-dot** seed cost (complex letters cost more
  seeds), and plot limits, so hunting and daily desk-spelling still matter.

## 5. IPA / phonetics — parked for later
- Braille is **orthographic** (letters). A later **"Sound Garden"** pass could teach **IPA/phonetics** — e.g.
  a field laid out like the **IPA articulation chart** (place × manner) where *where* you plant grows *that
  sound*, harvesting phonemes into words. **Its seed supply is [phoneme fishing](inklings-fishing.md)** — the
  **Phonicon** (sounds fished from ponds) is where the phonemes you plant here come from (*sounds←fishing*).
- **Reusable assets** (from the standalone `IPA-fan-game/`): **`ipa_words.js`** (English word → IPA phoneme
  sequences) and **`text-to-ipa-master`** (any word → IPA). Reuse the **data + design**, reimplement in
  Inklings' vanilla style — the fan depends on Howler/GSAP CDN libs; Inklings is dependency-free.

## 6. Conflicts / considerations
- **Persistent vs daily reset:** the farm is a **persistent** built-up zone (like the library/collection),
  **not** part of the daily-reset field — an **authored area behind home**, fits the Tiled/LDtk map pipeline.
- **Grade 1 first:** one cell = one letter; **Braille contractions** (whole-word cells) are a later layer.
- **Art:** alphabet-crop sprites (up to 26) — start with a handful; Braille dots are trivial to draw.
- **Scope:** adds **Braille** (a tactile writing system) to the teaching remit; the IPA pass later widens it to
  phonetics.

## 7. Open / deferred
- **Seasons — DECIDED & BUILT:** real-calendar (Northern-hemisphere meteorological), season-locked seeds, wither
  at the turn. Per-crop timing (`CROP_CFG`, `matureDays`/`regrow`) is a framework with defaults — tune per crop
  (some persist, some take longer) as the real 104-crop rosters get authored (flowers welcome).
- **Stage 2 — BUILT:** rarity-scaled **bonus-seed yield** on harvest (`bonusSeedChance`; commons self-propagate,
  rare stay buy-only), the rare **uppercase-letter drop** (`UPPER_DROP_CHANCE`, an *early path* past the ~118-word
  capital gate), and a **quiz/hard mode** toggle (`state.gardenQuiz`) that hides the Braille pattern + per-dot
  right/wrong colour for self-testing.
- Seed sourcing beyond the shop + starter/milestone packets (hunt-drops? quests?) — shop + grants for now.
- Braille pattern is **required** (must match to grow) — decided; quiz mode hides the hint.
- Remaining future work: the **walkable §8 zone** (tools, watering, richer growth stages, the shared
  `tileInFront()` placement primitive).
- **Per-plant harvest timing (future):** `CROP_CFG` is uniform (`matureDays:1`) for now. May later give each of the
  104 crops a **more realistic relative maturation time** (fast greens vs. slow tree fruit/nuts) instead of a flat
  overnight ripen — the framework already supports per-season/letter overrides.
- **Fuller growth cycle (future):** the current visual is two-stage (🌱 sprout → fruit → sprout after reaping). May
  later expand to a **seed → sprout → fruit** cycle (a distinct just-sown "seed" stage before the sprout) for more
  Stardew-like progression.
- The Sound Garden / IPA pass (§5).
- Other scripts as future cozy variants (Cyrillic "heirloom varieties", Ogham plant-aesthetics, Morse rhythm) —
  from the brainstorm; not planned.

## 8. Target: the real garden (walkable farm-sim)
**The garden is NOT a dialogue — it's a walkable zone on the map.** Decided (see
[`inklings-placement.md`](inklings-placement.md)): **the walkable zone is the cozy square `(0,1)`** — one
screen down from home — a **persistent, hazard-free** overworld screen (no beasts/water/rock) it shares with
the cipher **pens** and Wordhoard **décor**. The full farm-sim loop, Stardew/Harvest Moon style: **till** a
plot → **plant** a seed → **water** → **wait** (growth stages/days) → **harvest** manually → **repeat**. Plus
the cozy-sim depth in §7 (tools, watering can, growth timers, seasons). The modal below is only a throwaway
test rig for the crossword scoring; it gets replaced by the walkable zone, it does not become it.

**Shared placement primitive:** "plant a seed on the tile in front of you" is the **same interaction** as
"place a decoration on the tile you're facing" from the Wordhoard curation reward. Build **one** generic
facing-tile place/act helper (`tileInFront()` + a ghost-preview place/pick-up mode) and reuse it for planting,
pen-placing, **and** décor — don't implement them separately. **Full spec, the cozy square `(0,1)`, and the
build order live in [`inklings-placement.md`](inklings-placement.md)**; planted beds become `kind:"crop"`
entries in that doc's `state.placed`.

## 9. The Garden modal — SHIPPED (Stages 1–2)
The modal that validates the **Braille-cell + crossword** mechanic is **now in production** (no longer debug-gated)
so players can test the real seed/season economy while the walkable §8 zone is still future. Open with **F**, the
🌱 touch button, or the desktop toolbar. In dev only, a **cheat bar** inside the modal (`gardenDevBarHTML`/
`wireGardenDevBar`) forces any season (`_devSeason`) and grants seeds.

**Seasons (`SEASONS`, `currentSeason`, `seasonForDate`):** real-calendar, Northern-hemisphere meteorological
(Mar–May / Jun–Aug / Sep–Nov / Dec–Feb). `state.season` is checked on load, on daily rollover (`startNewDay`),
and on open; `gardenSeasonSync` withers beds whose `cell.season` ≠ the current season. Crop rosters are the
**authored 104** in `CROPS_BY_SEASON[season][letter]` (one real plant per letter per season — see §2's table;
emoji are still placeholders pending pixel sprites). `BRAILLE[letter]` stays global.

**Seeds — consumable, season-locked, per-dot** (`state.seeds` keyed `"season:letter"`):
- Pick a crop from the **current season's** palette (`cropsFor`); the badge shows how many seeds you own. The
  **legend** (`braillePreview`) shows that letter's Braille pattern + your stock.
- **Sow one seed per dot** (`gardenPlant`): each correct/incorrect dot placement spends a seed; **lifting a dot
  refunds** it (until the crop matures). Replanting a bed with a different crop refunds the old, unspent seeds.
  A bed holds **one crop**; you can't sow a letter you have no seeds for (prompts to buy at the Stall).
- **Buy at the Stall** (`updateShopSeeds`/`buySeeds`): the Seed Rack sells the **current season's** seeds,
  **any quantity**, rarity-priced (`seedPrice` = `SEED_PRICE_TIER[tierOf(L)]`). Starter + milestone packets via
  `SEED_GRANTS`/`checkSeedGrants` (start with A; T/E/S at 3/8/15 words).

**Growth & harvest cadence:**
- **Instant feedback / validation:** correct plots glow as **ghost** guides; a right dot shows a 🌱 **sprout**, a
  wrong dot turns **red**; an incomplete bed is **amber** ("growing"). A bed **grows** (`cellGrown`/`effLetter`,
  reads as its letter) only when its dots **exactly** match the pattern.
- **Stardew-style crop stages (visual):** a planted dot shows a generic 🌱 **sprout** while sowing / growing /
  maturing overnight (and again once **reaped today**); the crop's actual **fruit emoji** (`cropInfo(...)[1]`)
  appears **only when the bed is ripe** — mature and not yet reaped (`mature && !reaped` in `renderGarden`). So the
  garden reads as sprouts that turn into fruit at harvest and revert to sprouts after reaping.
- **Overnight maturation** (`cellMature`, `CROP_CFG.matureDays` default 1): a grown bed matures the next real day
  (`cell.plantedDay` stamped when it grows), then is harvestable. Cell labels show `…` ripening / `⛏` ready / `✓`
  reaped-today; immature beds/words render dimmed.
- **Once per real day** (`cell.lastHarvest`; word payouts via day-scoped `state.garden.paid`): `harvestGarden`
  gives +1 of each **mature** letter and pays each **fully-mature** word by POS (noun → ink, adjective → potion,
  new verbs → feats; **crossings ×1.5**), each at most once per day (renewable tomorrow).

**Stage 2 — harvest bonuses & quiz mode (built):**
- **Bonus seeds** (`bonusSeedChance` = `BONUS_SEED_CHANCE[tierOf]`, common 0.6 → legend 0): each harvested mature
  bed may drop a **bonus seed** of that season-crop, so commons self-propagate and rare seeds stay buy-only.
- **Uppercase drop** (`UPPER_DROP_CHANCE` ≈ 0.05): a harvested crop may also drop its **CAPITAL** into `state.inv`
  — usable at the desk immediately, an *early path* past the ~118-word capital-unlock gate.
- **Quiz/hard mode** (`state.gardenQuiz`, toggled by `#gd-quiz`, persisted): hides the legend's Braille pattern
  and every bed's ghost guide **and** per-dot right/wrong colour — you find out only when the whole bed grows.
- Data: `state.garden = { v, cols, rows, cells:[[{letter,dots,season,plantedDay,lastHarvest}]], paid }`, persisted
  (`snapshot`/`applySnapshot`; `gardenInit` re-validates + versions the shape via `GARDEN_V`, resetting old saves
  to fallow). `state.seeds`/`state.season`/`state.seedGrants` also persist.

**Crossword scan (unchanged):** `gardenScan` reads **grown** beds; every **2+-bed** row/column run whose whole
unbroken run is a real word (via `state.dex`/`localLookup`) lights up, crossings gold. (An extra adjacent letter
breaks a run — "CAT"+"x" → "catx", invalid.)

**Remaining future work:** the walkable §8 zone (till/water/growth-stage depth) with the shared `tileInFront()`
placement primitive. Per-crop timing lives in `CROP_CFG` (defaults only) awaiting the authored 104-crop rosters.
