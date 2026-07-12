# Inklings — Farming & Scripts (cozy zone)

Planning doc. A peaceful, **persistent** "cozy layer" (roadmap item #8: *renewable letters*) that sits
**alongside** — not replacing — the hunt-and-spell core. First script: **Braille**, via a farm whose beds
echo the Braille 2×3 cell. IPA/phonetics is parked for a later pass (§5).

Status: **plan / exploring** — the core loop below is agreed; some details deliberately loose. A **testable
Garden scaffold is built** (each letter is a 2×3 Braille cell you plant into; crossword scoring on top — see §9).
Cross-refs: [`inklings.md`](inklings.md), [`inklings-architecture.md`](inklings-architecture.md) (the farm
is an authored persistent area), [`inklings-grammar-systems.md`](inklings-grammar-systems.md) (teaching mission).

---

## 0. TL;DR
- A cozy **persistent** farming zone, separate from the daily-reset field **and** from combat.
- Beds are **2×3 Braille cells**. You buy **letter-seeds** at the Stall; each crop is tied to a letter and is
  planted in that letter's **Braille dot-pattern** — so planting *is* the Braille lesson.
- Harvest = a **renewable** supply of that letter.
- **Crossword-garden:** rows **and** columns of beds that spell real (dictionary-valid) words pay bonuses —
  you design your own crossword.
- Economy loop: **spell nouns → ink → buy seeds → grow letters → spell more/rarer words.**

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
- **Seeds (shop-bought, decided):** buy a letter's seed at the Stall with ink. Seeds **gate the harvest** —
  you can't just "draw" a letter's shape to get it; you must own its seed.
- **Crops tied to letters — the alphabet garden:** each crop is produce whose initial *is* its letter (teaches
  initial letters; great for younger learners). Full A–Z roster below.
- **Planting = the Braille lesson:** plant the crop in its letter's Braille pattern (A → dot 1; C → dots 1+4;
  L → dots 1+2+3). The almanac shows each letter's pattern; doing it grows the letter.
- **Harvest:** a renewable supply of that Latin letter for the satchel / Wordsmithy (plus word rewards, §3).

### Crop roster (emoji stand-ins → pixel crops later)
Data shape: `{ letter, name, emoji, brailleDots }`. Emoji are placeholders (swap for sprites later, like the
equipment items). `*` = weak/duplicate emoji, prioritize a custom sprite there.

| | Crop | | | Crop | |
| --- | --- | --- | --- | --- | --- |
| **A** | Apple | 🍎 | **N** | Nectarine | 🍑* |
| **B** | Banana | 🍌 | **O** | Orange | 🍊 |
| **C** | Carrot | 🥕 | **P** | Pineapple | 🍍 |
| **D** | Dill | 🌿 | **Q** | Quince | 🍐* |
| **E** | Eggplant | 🍆 | **R** | Rainier cherry | 🍒 |
| **F** | Fig | 🫐* | **S** | Strawberry | 🍓 |
| **G** | Grapes | 🍇 | **T** | Tomato | 🍅 |
| **H** | Honeydew | 🍈 | **U** | Ugli fruit | 🍊* |
| **I** | Iceberg lettuce | 🥬 | **V** | Vidalia onion | 🧅 |
| **J** | Jalapeño | 🌶️ | **W** | Watermelon | 🍉 |
| **K** | Kiwi | 🥝 | **X** | Xigua (melon) | 🍉* |
| **L** | Lemon | 🍋 | **Y** | Yam | 🍠 |
| **M** | Mango | 🥭 | **Z** | Zucchini | 🥒 |

(X = *Xigua*, R = *Rainier cherry* are the classic "impossible-letter" alphabet-book picks — real produce.)

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
  into spelling. Ink is the bridge; the Stall gains a **seed rack** (more for the existing shop to do).
- **Seasons are the throttle (desired direction).** A Stardew-style **season** mechanic rotates which crops
  grow / which words pay, so a single "perfect" crossword can't pay forever — players must **re-plan** each
  season. This is the main brake on the renewable word-reward loop.
- **Balance guard:** also pace via **seed cost, grow time, plot/zone limits**, and the reduced renewable rate
  for repeat words, so hunting and daily desk-spelling still matter.

## 5. IPA / phonetics — parked for later
- Braille is **orthographic** (letters). A later **"Sound Garden"** pass could teach **IPA/phonetics** — e.g.
  a field laid out like the **IPA articulation chart** (place × manner) where *where* you plant grows *that
  sound*, harvesting phonemes into words.
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
- Seed sourcing beyond the shop (hunt-drops? quests?) — **shop-bought** for now.
- Whether the Braille pattern is **required** or merely a **bonus** (plant freely vs plant-in-shape).
- **Seasons** (rotate crops / word-values so layouts must change) — **desired direction**, the throttle on the
  renewable loop (§4); not built yet.
- Other cozy-sim depth: zone layout, tools, watering/growth timers.
- The Sound Garden / IPA pass (§5).
- Other scripts as future cozy variants (Cyrillic "heirloom varieties", Ogham plant-aesthetics, Morse rhythm) —
  from the brainstorm; not planned.

## 8. Target: the real garden (walkable farm-sim)
**The garden is NOT a dialogue — it's a walkable zone on the map** (a persistent authored area behind home,
per §6) with the **full farm-sim loop**, Stardew/Harvest Moon style: **till** a plot → **plant** a seed →
**water** → **wait** (growth stages/days) → **harvest** manually → **repeat**. Plus the cozy-sim depth in §7
(tools, watering can, growth timers, seasons). The modal below is only a throwaway test rig for the crossword
scoring; it gets replaced by the walkable zone, it does not become it.

**Shared placement primitive:** "plant a seed on the tile in front of you" is the **same interaction** as
"place a decoration on the tile you're facing" from the Wordhoard curation reward
([`inklings-collections.md`](inklings-collections.md) §5). Build **one** generic facing-tile place/act helper
(`tileInFront()` + a ghost-preview place/pick-up mode) and reuse it for both — don't implement planting and
décor placement separately.

## 9. Test scaffold (built — DEBUG ONLY)
A quick modal to validate the **Braille-cell + crossword scoring** before building the walkable zone.
**Debug-gated** (`IS_DEV`: localhost/`file://` only; the 🌱/toolbar buttons are hidden and `openGarden` no-ops
in prod). Open with **F**, the 🌱 touch button, or the desktop toolbar (in dev).

**The core mechanic (rebuilt — each letter IS a 2×3 Braille cell):**
- The field is a small grid of **beds** (`GARDEN_COLS`×`GARDEN_ROWS`, default **5×4**; the real walkable garden
  targets ~**12×7** cells ≈ a 28×22 single-square map grid). **Each bed = one Braille cell = a 2×3 grid of
  plots** (dots 1-2-3 down the left column, 4-5-6 down the right — rendered via `BRAILLE_DOTS`).
- **Planting = forming the pattern (the lesson).** Pick a **crop-seed** from the 26-letter palette (`CROPS`);
  a **legend** (`braillePreview`) shows that letter's Braille pattern (the almanac line). Click the bed's plots
  to plant the crop in the dots. A bed holds **one crop**; clicking with a different seed **replants** it;
  lifting the last dot leaves it **fallow**.
- **Instant feedback / validation (decided):** the correct plots glow as **ghost** guides; a plot filled in the
  **right** dot shows the crop (green bed once complete), a plot in the **wrong** dot turns **red**; a planted
  but not-yet-correct bed is **amber** ("growing"). A bed only **grows** — i.e. counts as its letter
  (`cellGrown`, `effLetter`) — when its dots **exactly** match the seed's pattern. No weeds, no penalty; a wrong
  pattern just doesn't count until fixed.
- Data: `state.garden = { cols, rows, cells:[[{letter, dots}]] }`, persisted (`snapshot`/`applySnapshot`;
  `gardenInit` re-validates shape and discards mismatched/old saves).

**Crossword scoring (kept from the prior scaffold):**
- **Live word scan** (`gardenScan`) reads only **grown** beds: every **2+-bed** row/column run whose **whole
  unbroken run** is a real word (via `state.dex` or `localLookup`) lights up green; **crossing** beds (in a
  row-word *and* a column-word) turn gold. A side list previews each word, its POS, and reward. (Crossword-correct:
  an extra adjacent letter breaks a run — "CAT"+"x" → "catx", invalid.)
- **Harvest** (`harvestGarden`): +1 of each **grown** letter, **plus each word paid by POS** (noun → ink,
  adjective → potion; new words recorded, `onNewVerbWord` for verbs); **crossings ×1.5**. Summary toast.

**Stubbed / intentionally missing (it's a scaffold, not the game):** planting is **free** (no seed economy),
beds grow **instantly** (no till/water/grow/season loop; harvest keeps the layout, repeatable), no walkable
zone, and the ghost guide is always on (a later "hard mode" could hide it). Those are the real build (§8),
tackled once the Braille + crossword rules feel right.
