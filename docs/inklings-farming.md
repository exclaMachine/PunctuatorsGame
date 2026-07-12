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
- **Crops tied to letters — the alphabet garden:** each crop is produce whose initial *is* its letter —
  **A**pple, **B**ean, **C**arrot, **D**aikon, **E**ggplant, **F**ig, **G**rape, **K**ale, **O**nion,
  **P**ea, **R**adish, **T**urnip, **Y**am… (teaches initial letters; great for younger learners).
- **Planting = the Braille lesson:** plant the crop in its letter's Braille pattern (A → dot 1; C → dots 1+4;
  L → dots 1+2+3). The almanac shows each letter's pattern; doing it grows the letter.
- **Harvest:** a renewable supply of that Latin letter for the satchel / Wordsmithy.

## 3. The crossword-garden (the hook)
- The farm is a **field of beds**; read a **row** left-to-right or a **column** top-to-bottom, and each bed is
  a letter → a **Braille word**.
- Any row **or** column that spells a **real word** (validated against the game dictionary) pays a **bonus**
  (extra yield / ink / a special crop).
- **Intersections** — a bed shared by a row-word and a column-word — can pay extra, so you plan a
  word-square/crossword to stack bonuses (Scrabble-garden energy).
- Rewards vocabulary + planning, ties the cozy farm straight back to the game's core (*words*), and reinforces
  Braille by having you *read your plots as words*.

## 4. Economy & balance
- **Input = ink** (earned by spelling nouns); **output = renewable letters** → feeds back into spelling. Ink
  is the bridge; the Stall gains a **seed rack** (more for the existing shop to do).
- **Balance guard:** renewable letters could undercut hunt/spell scarcity — pace via **seed cost, grow time,
  and plot/zone limits** so hunting and daily spelling still matter.

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
- Cozy-sim depth: zone layout, tools, watering/growth timers, seasons.
- The Sound Garden / IPA pass (§5).
- Other scripts as future cozy variants (Cyrillic "heirloom varieties", Ogham plant-aesthetics, Morse rhythm) —
  from the brainstorm; not planned.
