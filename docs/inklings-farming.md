# Inklings — Farming & Scripts (cozy zone)

Planning doc. A peaceful, **persistent** "cozy layer" (roadmap item #8: *renewable letters*) that sits
**alongside** — not replacing — the hunt-and-spell core. First script: **Braille**, via a farm whose beds
echo the Braille 2×3 cell. IPA/phonetics is parked for a later pass (§5).

Status: **plan / exploring** — the core loop below is agreed; some details deliberately loose.
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
