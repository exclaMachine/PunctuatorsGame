# Critter Hunt — a Murdle-style real-data deduction game (MVP BUILT 2026-07-27)

> **Status: MVP BUILT** in `critter-hunt.html` (standalone, the repo's single-file pattern). A spinoff of the
> *Mujicians* M6 Timbre boss (Wormwood) and its
> [Murdle-style deduction variant](mujicians.md#variant--the-choir-line-up-a-murdle-style-deduction-layer-design-fork-not-the-locked-mvp).
> **Working title "Critter Hunt"** (placeholder — name doesn't matter). **Supersedes the earlier bird-only
> "Birdle" framing and the 2-axis animals-only cut.** The design below is the full vision; see
> **[MVP — what shipped](#mvp--what-shipped-2026-07-27)** for the current state vs. deferred.

## MVP — what shipped (2026-07-27)

A playable `critter-hunt.html`, **emoji visuals**, the three locked forks (full-grid solve · N=4 · synth
instrument audio clues):

- **Data pools** — 10 animals / 9 instruments / 8 biomes, each with real attribute **tags** (animal:
  class/diet/size/habitat · instrument: Hornbostel–Sachs family/material/play-method · location: climate).
  Emoji stand in for art.
- **Procedural generator + brute-force solver** (`generatePuzzle`) — rolls a solution (two bijections
  `pi`/`sg`), builds the **true-clue pool** from templates, **selects to uniqueness** over all `(4!)²`=576
  arrangements (biased toward attribute/teaching clues, a required audio clue, penalising direct-name clues),
  then **prunes to a minimal set**. Retries on an unlucky cast.
- **The clue-template system** — a clue is `link(refX, refY)` where each **ref** is a `name` or a *uniquely
  discriminating* real-attribute descriptor (`refsFor` enforces uniqueness in the cast). Relations `plays`
  (A↔I) / `at` (A↔L) / `here` (I↔L, the derived grid) × polarity; the **audio** clue is an association clue
  whose instrument ref is expressed by *timbre* (family) instead of name. Each clue carries `test(arr)`
  (solver predicate), `text` (render), and `meta` (audio/direct/attrCount/teaches).
- **Three-grid deduction board** — Animals×Instruments, Animals×Locations, Instruments×Locations; cells cycle
  blank→✗→✓; a ✓ **auto-✗’s the rest of its row & column** (within-grid). Accuse reads the ✓ assignment and
  judges against the solution (reports instruments/locations correct count on a miss). "New case", dev "Reveal".
- **Synth instrument audio** (`playPreset`) — a small vanilla Web-Audio synth (aero/chord/membrane/idio
  presets: filtered saw/bowed/plucked, noise+thump drum, inharmonic bell) so the **audio clue is real now**;
  ▶ on each instrument lets you compare timbres.
- **Reward → collection** — solving offers a **field-notes** card (real facts on the culprit trio) and lets
  you **keep one sound**: the instrument (a playable synth timbre) or the animal (a percussion slot). Stored in
  `localStorage` (`critterhunt.collection`); instrument cards replay, with a card-flip.

**Deferred / stubbed in the MVP:** real sound files (animals are a **silent placeholder**; only synth
instruments sound — so an audio clue is currently somewhat redundant with the visible emoji, meaningful once
art/samples abstract the instrument); **cross-grid** auto-inference (only within-grid auto-X); relational/set
clue types; difficulty ramp (N fixed at 4) & daily-seeded mode; Mujicians integration (`persist.sounds`/
`VOICES`); Wormwood impostor skin; the tentative extensions below. See the design sections for the full plan.

## The pitch — a real-data Murdle with three axes

A **Murdle-style logic-deduction puzzle** with Murdle's exact three-category structure, remapped:

| Murdle | Critter Hunt | Real-world attributes each carries (the teaching) |
| --- | --- | --- |
| **Suspects** | **Animals** | class (mammal/bird/…), diet, real habitat, size, region |
| **Weapons** | **Instruments** | family (string/wind/brass/percussion), material, how it's played, culture/origin |
| **Locations** | **Locations / biomes** | biome, climate, continent |

You solve by cross-referencing clues in a **deduction grid** (mark ✗/✓, auto-eliminate) to recover *which
animal played which instrument in which location*, then make the accusation (the triple). Each entity can also
**play its sound**, so at least one clue type is **audio** — the timbre-discrimination DNA this whole idea grew
out of, and the tie back to Mujicians.

**Design decision — location is an independent axis (LOCKED 2026-07-27).** The location is **where the entity
was *found* for this case**, *not* the animal's natural habitat — so it stays a free, randomizable third axis
(Murdle-style). Each animal's **real habitat is instead a clue attribute** (e.g. "the animal native to the
desert wasn't in the tundra"), which keeps the full 3-axis puzzle *and* still teaches habitats. (Rejected
alternative: location = the animal's real habitat — that fixes animal→location by real data and collapses the
puzzle to a thin 2-axis matching. If a free third axis is ever wanted *without* the found-vs-home framing, swap
in the **instrument's country/culture of origin** as the independent axis.)

## What makes it *not* just a Murdle clone

1. **Real-world data is the content.** The clues are (mostly) **true facts** — real animal habitats, real
   instrument families/materials, real biomes — so solving *teaches*. "The carnivore wasn't found in the
   wetland," "the brass instrument's player lives somewhere cold," "the animal native to the rainforest played
   something wooden." Each clue is simultaneously a logic constraint and a factlet. That's the differentiator
   (mechanics aren't ownable — see IP — but this content angle is genuinely distinct).
2. **Sound is evidence.** Instruments and animals are audible; an **audio clue type** keeps ear-training in the
   loop (Murdle is silent).
3. **It feeds a second game.** Winning grants a **playable sound card** (below) that flows into Mujicians' Sound
   Collection — Critter Hunt becomes a *feeder*, not a detached spinoff.

## The story framing

A **light music-mystery**, not murder: N animals each played an instrument somewhere, and something went wrong
— *someone played the sour note / stole the melody / crashed the recital.* Solve who, with what, where.
**Wormwood is an optional villain skin:** the culprit is "the one he bit" — the impostor hiding in the band —
which maps exactly onto Murdle's "find the one guilty suspect." Ship without him and it's a neutral "solve the
case." (Own detective character + art — not Murdle's.)

## Core loop (reuse Murdle's proven layout)

Murdle's UI is a known-good pattern and its mechanics/layout aren't protectable (own art/name — see IP):

1. **The case** — a prompt naming N animals, N instruments, N locations, and a short list of **clues**.
2. **The grid** — the three pairwise sub-grids (animal×instrument, animal×location, instrument×location) with
   **card-flip entities** and **auto-X'ing**: ✓ a cell → auto-✗ the rest of that row/column in the sub-grid and
   cross-infer across sub-grids. (This auto-elimination *is* the constraint propagation the generator uses.)
3. **Play the sounds** — ▶ any animal or instrument to hear it (verifies audio clues).
4. **The accusation** — commit the full triple set (or just name the culprit triple in Wormwood mode).

## Procedural level generation (the core algorithm)

The dev requirement: **levels are generated, not hand-authored.** This is a standard constraint-puzzle
(Zebra/Einstein) generation problem, and at these grid sizes it's trivial compute — brute-force uniqueness
checking is fine. The pipeline:

1. **Pick N** (grid size / difficulty — 3 easy, 4 standard, 5 hard).
2. **Sample the cast** — draw N animals, N instruments, N locations from the datasets, biased so their **real
   attribute tags are diverse enough** that discriminating clues exist (e.g. not all N animals are mammals).
3. **Roll the solution** — two random bijections `π: animal→instrument` and `σ: animal→location`. That's the
   hidden answer (N triples, each element used once).
4. **Build the true-clue pool** — enumerate every clue that is **true under the solution**, from templated
   types (below). Attribute clues pull the entity's real tags, so they're accurate factlets.
5. **Select to uniqueness** — start with all `(N!)²` candidate arrangements (≤14,400 for N≤5 — brute-forceable);
   add clues one at a time (biased by difficulty/type), re-filtering the candidate set after each, until
   **exactly one arrangement remains**. Guarantees *solvable & unique*.
6. **Prune to minimal** — try removing each clue; if the puzzle stays unique without it, drop it. Yields an
   elegant, no-redundancy clue set that forces real deduction.
7. **Difficulty knobs** — N; which clue types are allowed (ban direct-positive links for hard mode); target
   clue count; the ratio of **indirect attribute clues** (more = more learning *and* harder); whether an
   **audio clue is required**.

**Clue types (all templated, all verified true under the solution):**
- **Direct link** — "the [koala] played the [flute]" (easy; reveals a cell).
- **Negative** — "the [tuba] was not in the [reef]."
- **Attribute (the educational engine)** — references a real tag to identify an entity indirectly:
  "the **carnivore** played something made of **brass**," "the animal native to the **desert** wasn't in the
  **tundra**." (Generator only uses a tag value that's **unique among the N chosen entities**, so it names
  exactly one.)
- **Audio** — "the culprit's instrument sounds **reedy**," "the guilty animal's cry is **low-pitched**"
  (verified by ear; keeps the listening skill load-bearing).
- **Relational (optional)** — needs an ordered axis (a lineup, or size order): "the string player stood left
  of the amphibian."

**Seeded daily mode** falls out for free: seed the RNG with the date → everyone gets the same puzzle (Wordle-
style shareable), consistent with the site's daily-puzzle pattern (Excla Machine).

## Rewards → playable sound cards (the Mujicians feeder)

Win → the player **picks one** to keep as a playable card:

- **Instrument → a melodic timbre.** Instruments are *tonal and built to play notes*, so they **pitch cleanly**
  and drop straight into Mujicians' `VOICES` / `playVoice` as a real sampled (or synth-preset) instrument. This
  is the **easy half** — the earlier animal pitch-shifting worry doesn't apply; instruments come as chromatic
  samples or already exist as `VOICES` presets.
- **Animal → a percussion one-shot** (barks/stomps/chirps), dropped into the `{drum}` event path / `DRUM_VOICES`
  — **no pitch-shifting needed** (the deferred tonal-animal work stays deferred). Rarer/harder puzzles → rarer
  sounds.

Both register in the **Sound Collection** (`sounds` / `persist.sounds`) — Critter Hunt *is* the collection's
gameplay source. A post-solve **"field notes" card** shows each entity's real facts (reinforces learning +
doubles as the collectible art). *(Standalone-first: the reward can be a local collection, wired to Mujicians'
`persist.sounds` only if/when integrated — see forks.)*

## Data sources (all open / CC — bundle locally, no runtime API)

Repo convention: flat static, vanilla, **no runtime third-party API** (like Inklings' bundled `dictionary.json`).
Curate + download **once**, commit the data, play offline.

### Animal sounds & facts
- **Sounds:** **Freesound** (CC0/CC-BY, primary), **ESC-50/FSD50K** (curated, ESC-10 subset CC-BY),
  **iNaturalist Sounds** (~230k files, CC), **Xeno-canto** (birds + now mammals/amphibians/bats/insects).
- **Facts:** **Wikidata/Wikipedia** (class, diet, habitat, size, region); optional per-class trait sets
  (AVONET birds, PanTHERIA/EltonTraits mammals, AmphiBIO amphibians).

### Instrument sounds & facts (NEW)
- **Sounds:** **VSCO2 Community Edition** (**CC0**), **VCSL — Versilian Community Sample Library** (**CC0**),
  **University of Iowa MIS** (free, no restrictions), **Philharmonia** (free; quality varies),
  **Sonatina Symphonic Orchestra** (free) — all offer **individual chromatic notes**, ideal for a web sampler.
  Many "instruments" can also just **reuse existing Mujicians `VOICES` synth presets** (no samples needed).
- **Facts:** **Wikidata** (Hornbostel–Sachs family, material, playing method, country/culture of origin).

### Locations / biomes
- A small **curated list** (~8–12 biomes: rainforest, wetland, savanna, desert, tundra, coral reef, mountain,
  temperate forest, coast, city…) with `{climate, continent}` tags. Curated by hand — small and stable.

### Licensing plan
- **Filter to CC0 / CC-BY / CC-BY-NC.** Instruments are the *easy* half (VSCO2/VCSL are CC0). For animals,
  **avoid CC-BY-ND for anything you pitch/loop/trim** — using a clip as a playable instrument is a derivative
  work (whole-clip playback in the puzzle is fine under ND, repitching is not).
- **Attribution manifest** — `data/critter-credits.json` (author, source+ID, license per clip) + an in-game
  "ⓘ credits" screen.
- **Store locally** — `sounds/{animals,instruments}/*.mp3|ogg` + `data/critters.json` + credits, all committed.

## Originality / IP (not legal advice)

- **Game mechanics/rules/layout aren't protected by copyright** — copyright covers *expression* (art, text,
  code, distinctive audiovisual look), not the system. Reusing Murdle's grid + card-flip + auto-X *structure*
  is fine; the **real-data content** is our own and is the distinctive part.
- **Avoid copying specific expression:** the **name** (trademark — use our own), Murdle's art/characters
  ("Deductive Logico" etc.), exact copy, and trade dress. Own detective, own styling.
- **Patents on mechanics are rare/hard** (exceptions: WB's Nemesis System, Nintendo's Palworld patents); a
  generic deduction grid is prior-art-saturated (Murdle, Guess Who, Mastermind).
- **Net:** a free educational game with original name/art/copy carries essentially no IP risk. The real chore
  is the CC **attribution manifest**.

## Tech / repo fit

- **Standalone `critter-hunt.html`** — one self-contained file (inline CSS + JS), no framework, no build step.
- **Data:** `data/critters.json` (animals + instruments + biomes with attribute tags + sound-file refs), credits
  manifest, `sounds/` folder. Mirrors the local-data precedent (WordNet, blazon, scenarios).
- **Generator + solver:** pure JS (brute-force arrangement filter — trivial at N≤5). No dependency.
- **Audio:** `<audio>` / Web Audio playback of bundled clips; instrument repitch (if melodic play is wanted
  later) is `playbackRate` for now — the granular/Tone.js question only arises for *sustained tonal* play and
  stays **tentative/deferred** (instruments pitch far better than animals, so it may never be needed).
- **If wired into Mujicians:** rewards write to `persist.sounds`; instruments join `VOICES`, animals join the
  drum voices. The data pipeline is identical whether standalone or integrated. **First open fork.**

## Tentative extensions (nice-to-haves, not locked)

- **"Found far from home" twist** — a clue like *"the animal was found in a biome it doesn't naturally live in"*
  is both a deduction hook and a pure habitat lesson (leans directly into the independent-location decision).
- **Themed case packs** — constrain a puzzle's cast to one ecosystem ("The Reef Recital," "Tundra Trio") so each
  case teaches a coherent unit — and makes it usable as a **classroom tool** (a real angle for an educational
  game).
- **Hornbostel–Sachs instrument axis** — use the real instrument-family taxonomy
  (chordophone / aerophone / idiophone / membranophone) for clues; quietly teaches musicology and maps onto
  Mujicians' timbre families.
- **Learn-mode vs. Expert toggle** — Learn shows fact tooltips inline and keeps a direct-link clue or two;
  Expert hides facts and bans direct links (forces indirect attribute chains). Same generator, different knobs.
- **Guarantee one un-skippable audio clue** — the generator *requires* an audio clue in every puzzle, so the
  listening skill (the origin of this whole idea) is always load-bearing and never bypassed by pure text logic.
- **Spoiler-free share grid** — Wordle-style emoji summary of the solve path for the daily puzzle; cheap virality.
- **Collection completion → Mujicians payoff** — filling the "Menagerie" (percussion) and "Instrument Case"
  (timbres) unlocks a fuller Free-Play palette / a "full orchestra" loadout, closing the feeder loop.

## Open forks (decide before building)

1. **Standalone vs. Mujicians-integrated** — own collection, or write rewards into `persist.sounds` / `VOICES`?
2. **Daily seeded puzzle vs. endless generated** — (both are cheap given the generator; could ship both).
3. **Grid size / difficulty ramp** — N = 3→4→5; which clue types unlock when; audio-clue-required tiers.
4. **Wormwood mandatory or optional** — impostor-culprit theme always on, a boss finale, or a neutral-case toggle.
5. **Reward = player's choice vs. fixed** — pick instrument *or* animal, or the puzzle dictates which.
6. **Accusation input** — full triple-set vs. just the culprit triple (Wormwood mode).

## MVP scope

**MVP:** standalone `critter-hunt.html`; the **procedural generator + brute-force uniqueness solver** at N=3–4;
~20–30 animals + ~15 instruments + ~10 biomes seeded from Wikidata with real attribute tags; CC0/CC-BY sounds
(instruments from VSCO2/VCSL, animals from Freesound/ESC-50); the three-sub-grid deduction UI with card-flip +
auto-X; direct + negative + **attribute** + one **audio** clue type; accuse-the-triple; a "field notes" reward
card granting one playable sound (instrument = a `VOICES`-ready sample, animal = a percussion one-shot) into a
local collection. Wormwood as an optional impostor skin.

**Deferred:** relational/positional clues (ordered axis), the daily-seeded shareable mode, N=5+ and richer
difficulty tuning, larger rosters + more biomes, animated art/detective, **Mujicians integration**
(`persist.sounds`/`VOICES` wiring), sustained **tonal-animal** timbres (granular/Tone.js — still tentative), and
any mic/"imitate it" angle (out of scope — point-and-listen).
