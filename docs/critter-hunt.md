# Critter Hunt — an animal-sound deduction game (DESIGNED 2026-07-27, not built)

> **Status: DESIGNED, not built.** A standalone spinoff of the *Mujicians* M6 Timbre boss (Wormwood)
> and its [Murdle-style deduction variant](mujicians.md#variant--the-choir-line-up-a-murdle-style-deduction-layer-design-fork-not-the-locked-mvp).
> **Working title "Critter Hunt"** (placeholder — name doesn't matter; picked because *Birdle* and the
> bird-only framing are already well-trodden, and generalizing to **all animals** is both more original and
> a better game — see below). No entry file yet; the eventual first cut is a self-contained
> `critter-hunt.html` (the repo's standalone-game pattern, e.g. `scorch-bones.html` / `forge-quench.html`).
> **Supersedes the earlier bird-only "Birdle" framing.**

## The pitch

A **Murdle-style logic-deduction puzzle where the evidence is sound.** A lineup of animals; clues (real
natural-history facts) plus each animal's **call/cry** let you cross-eliminate to the answer. It's a whodunit
where "whodunit" is decided partly by **listening** — which is what makes it distinct from a trivia quiz or a
pure logic grid.

**Why the deduction scaffold earns its place:** identifying an animal from sound alone is uneven (a lion is
obvious, two frog species are not). The clue grid makes it *fair* — you don't need to know a sound cold; the
facts narrow the suspects and the sound confirms. Facts corner the answer, the ear closes it. (Same principle
as the Mujicians choir variant: the grid records what you can only learn by ear, so listening is the
data-gathering and logic is the payoff, not a bypass.)

## Why "all animals" beats bird-only

The bird→animals generalization isn't just for originality; it makes the design stronger:

- **Richer deduction columns.** Birds share a lot; animals span the whole grid — **taxonomic class**
  (mammal / bird / amphibian / insect / fish / reptile) becomes a real variable, **habitat** now spans
  ocean / savanna / jungle / tundra / wetland / city, and **size** ranges from cricket to whale. More
  independent axes = a better Murdle grid.
- **More iconic, casual-friendly sounds.** A lion's roar or a frog's croak is instantly graspable, so casual
  players aren't stuck cold-IDing near-identical bird calls.
- **Tradeoff (handled):** cross-taxa sounds are *less subtle* than bird-call twins, so pure "name it" gets
  easier — but the **deduction layer + Wormwood-the-impostor** is what carries the challenge, plus a
  **within-group hard mode** (three big cats / three frogs) restores fine discrimination when wanted.
- **Birds are a subset, not lost** — a bird-only round/theme still works inside the general frame.

## The story hook — Wormwood, the impostor in the pack

Reuses the *Mujicians* villain as connective tissue (the dev likes the character; the game otherwise stands
alone). **Wormwood** — the busker who *bites* creatures so they sound like him — is **hiding among real
animals, mimicking one badly.** Every other candidate is a real animal sound; he is a **flattened, wooden
odd-one-out**. So the deduction narrows *which animal he's impersonating*, and your **ear catches the fake.**
This fuses the two skills instead of stacking them: **facts shrink the suspect list; timbre-discrimination
makes the arrest.** It's the "sus him out" framing directly, and it keeps *listening* as the payoff rather
than flavor. (Ship without Wormwood and the same structure works as plain "identify the animal" — the
impostor is an optional villain mode.)

## Core loop

1. **The lineup** — N animals (silhouetted/hooded or named), each with a **▶ sound** you can play (solo it).
2. **The clues** — a handful of constraints from real facts (below), some **fact-only** (readable) and some
   **ear-only** (you must play the sound to verify — e.g. "the culprit is nocturnal and lower-pitched than
   the wolf").
3. **The grid** — a Murdle-style deduction table (species × attribute) you mark with ✗/✓ as clues + sounds
   eliminate rows/cells.
4. **The accusation** — name the animal (and, in Wormwood mode, whether *this* one is the real animal or the
   fake).

## Deduction variables (the grid columns)

Animals come pre-loaded with several **independent, describable** attributes:

- **Taxonomic class** — mammal / bird / amphibian / insect / fish / reptile (the axis birds alone can't give).
- **Habitat / "location"** — ocean / wetland / forest / savanna / desert / tundra / mountain / city.
- **Diet** — herbivore / carnivore / insectivore / omnivore / filter-feeder.
- **Fourth axis** (pick per-puzzle for variety): **size class**, **continent/region**, **activity**
  (nocturnal vs. diurnal — pleasingly audio-adjacent), **locomotion** (flies / swims / walks / burrows), or
  **conservation status**.

## Clue types (each is both a constraint and a real fact)

- **Fact / eliminative:** *"No ocean animal in the lineup is an insectivore." · "The culprit is a mammal."*
- **Comparative-audio (ear-only):** *"The culprit's cry is lower-pitched than the wolf's." · "It chirps; it
  doesn't roar."*
- **Positional (Zebra/Einstein-puzzle):** *"The filter-feeder is directly left of the nocturnal one."*
- **Wormwood tell (impostor mode):** *"One voice here isn't an animal at all"* — the flat/wooden timbre among
  real cries; deduction says which species he's *failing* to imitate.

## Data sources (all open / CC — bundle locally, no runtime API)

Follows the repo convention (flat static, vanilla, **no runtime third-party API** — like Inklings shipping a
local `data/dictionary.json` instead of calling WordNet live). Download + curate **once**, commit the data,
game runs offline.

### Sounds

| Source | What it is | Fit |
| --- | --- | --- |
| **Freesound** (freesound.org) | Huge collaborative CC sound library; transparent per-clip licensing (CC0 / CC-BY / CC-BY-NC). | **Primary for a general MVP** — search CC0/CC-BY for lion / frog / cricket / whale / wolf / etc. |
| **ESC-50 / FSD50K** | Curated datasets built *from* Freesound. ESC-50 = 2,000 clips, 50 classes incl. an Animals category (dog, cat, cow, frog, hen, insects, birds…); the **ESC-10 subset is CC-BY**. | Clean, pre-labeled, one-zip download — great starter roster. |
| **iNaturalist Sounds** (iNatSounds) | ~230,000 audio files across 5,500+ species, real observations, CC-licensed (uploader's choice). | Broadest species coverage; filter to CC. |
| **Xeno-canto** | Was birds-only, now **expanding to all taxa** — land mammals, amphibians, bats, grasshoppers (added ultrasound WAV support). CC per-recording. | Best for birds + insects + bats; increasingly general. |
| **Watkins Marine Mammal DB / Tierstimmenarchiv (Berlin)** | Specialist archives (marine mammals; general animal sounds). | Fill ocean / exotic gaps. |
| **Macaulay Library** (Cornell) | World's largest animal-media archive (3.2M audio across birds, mammals, amphibians, fish, insects). | Highest quality but **restrictive reuse** — reference, don't redistribute. |

### Facts (the grid columns)

- **Wikidata / Wikipedia** — the **general** source across all taxa: class, habitat, diet, size, range,
  conservation status; CC-licensed and structured. Primary fact seed.
- **Per-class trait datasets (optional enrichment):** **AVONET** (birds — habitat/diet/morphology, the old
  bird-doc source), **PanTHERIA / EltonTraits** (mammal & bird diet/body traits), **AmphiBIO** (amphibians).
  Only worth it if a puzzle needs finer attributes than Wikidata gives.

### Licensing plan (the one real upfront cost)

The only non-trivial work is **curation + attribution** for the ~30–60 species of an MVP:

- **Filter licenses:** keep CC0 / CC-BY / CC-BY-NC. **Avoid CC-BY-ND if you clip/trim** the audio (playing a
  recording whole is fine under ND; editing it is not). Non-commercial (NC) is fine for a free educational game.
- **Attribution manifest:** a `data/critter-credits.json` (or a visible Credits page) listing per clip: author,
  source + ID, and license. Show it in-game (a "ⓘ recordings" screen).
- **Store locally:** `sounds/critters/*.mp3|ogg` + `data/critters.json` (facts) + the credits manifest, all
  committed; no live calls at play time.

## Originality / IP (informed the pivot; not legal advice)

- **Game mechanics/rules aren't protected by copyright** — copyright covers *expression* (art, text, code, the
  distinctive audiovisual look), not the system/idea. That's why Wordle/Murdle-likes proliferate legally.
- **Avoid copying the specific expression:** the **name** (trademark — use your own), art, exact UI/trade dress,
  and copy.
- **Patents on mechanics exist but are rare/hard** (the famous exceptions: WB's **Nemesis System**, Nintendo's
  **Palworld** patents). A generic "deduction grid + play a sound" is prior-art-saturated (Murdle, Guess Who,
  Mastermind), so not patent-exposed.
- **Net:** a free educational animal-sound deduction game with original name/art/copy carries essentially no IP
  risk. The real chore is the CC **attribution manifest** above.

## Tech / repo fit

- **Standalone `critter-hunt.html`** — one self-contained file (inline CSS + JS), the repo's standard game
  shape. No framework, no build step.
- **Data:** `data/critters.json` (species → {class, habitat, diet, size, region, activity, soundFile}), the
  credits manifest, and a `sounds/` folder. Mirrors the local-data precedent (WordNet, blazon, scenarios).
- **Audio:** plain `<audio>` / Web Audio playback of the bundled clips — no synthesis needed (these are real
  recordings, unlike Mujicians' `VOICES`).
- **If wired into Mujicians instead of standalone:** it becomes an M6-adjacent mode; then it *could* reuse the
  choir render surface and Sound Collective framing — but the data pipeline (real recordings + facts JSON) is
  the same either way. **This is the first open fork.**

## Open forks (decide before building)

1. **Standalone vs. Mujicians mode** — its own puzzle game (Wormwood = flavor) or an actual M6-adjacent mode
   reusing Mujicians' screens? Decides whether it starts clean or couples to `mujicians.html`.
2. **Daily puzzle vs. endless** — a Wordle/Murdle-style *one seeded puzzle per day* (fits the site's daily
   pattern, e.g. the Excla Machine) vs. an endless/generated grid.
3. **Grid size / difficulty ramp** — species count, attribute-column count, clue count; **within-group twins**
   (three big cats / three frogs) as the hard tier.
4. **Wormwood mandatory or optional** — impostor always present (every puzzle = "is one of these fake?"), a boss
   finale, or a toggle?
5. **How the answer is entered** — accuse a species by name (reading/spelling), pick from the lineup, or both.

## MVP scope

**MVP:** standalone `critter-hunt.html`; ~30–60 curated CC-BY/CC0 species **spanning several classes** (mammals,
birds, amphibians, insects) with one sound clip each + a `critters.json` of 3 attributes (class + habitat + diet)
seeded from Wikidata; a fixed deduction grid UI (play sound, mark ✗/✓, accuse); fact-only + one ear-only clue
type; a visible credits manifest. Wormwood as a single "find the impostor" mode.

**Smaller-lift alternative:** a **bird-only first cut** that's architected to expand to all animals (same schema,
just a filtered roster) — a smaller curation job, at the cost of the accessibility/originality wins above.

**Deferred:** the full daily-seeded generator, positional/Zebra clue logic, within-group twin difficulty tiers,
larger roster, animated art, the Mujicians integration (Sound Collective / `VOICES` reuse), and any
mic/"name it by imitating" angle (out of scope — this is point-and-listen, like the choir boss).
