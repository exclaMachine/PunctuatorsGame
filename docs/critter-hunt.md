# Critter Hunt — a Murdle-style real-data deduction game (MVP BUILT 2026-07-27)

> **Status: MVP BUILT** in `critter-hunt.html` (standalone, the repo's single-file pattern). A spinoff of the
> *Mujicians* M6 Timbre boss (Wormwood) and its
> [Murdle-style deduction variant](mujicians.md#variant--the-choir-line-up-a-murdle-style-deduction-layer-design-fork-not-the-locked-mvp).
> **Working title "Critter Hunt"** (placeholder — name doesn't matter). **Supersedes the earlier bird-only
> "Birdle" framing and the 2-axis animals-only cut.** The design below is the full vision; see
> **[MVP — what shipped](#mvp--what-shipped-2026-07-27)** for the current state vs. deferred.

## MVP — what shipped (2026-07-27)

A playable `critter-hunt.html`, **emoji visuals**, N=3 (Murdle-matching — `AXIS_N`; was N=4 through 2026-07-29,
dropped to 3 on 2026-07-30 to mirror Murdle's 3-per-category and ease the transition when the 4th axis lands),
synth instrument audio clues.

**AMENDED 2026-07-29 — wired into Mujicians as the M6 Timbre boss (forks #1 resolved: link-out + return).**
M6 Timbre is now a **capstone**: you first clear the normal timbre-blend lesson gig (Timbrewolf's tutor), which
sets `persist.progress.timbreStage="lesson"→"boss"` instead of unlocking M7; the Home Campaign button then
becomes **🐺 Boss — Unmask Wormwood** and **launches out to `critter-hunt.html?boss=mujicians`** (Mujicians links
to standalone pages by relative path, like `pitch-bird.html`; the boss costs no daily run). Critter Hunt detects
`?boss=mujicians` (`BOSS`), reframes its header as the M6 boss, and adds a **← Back to Mujicians** forfeit button
(returns with no advance, so the boss is retryable). On a **win**, the reward-pick (`claimReward`) still saves the
sound to Critter Hunt's own collection **and** hands it back: it writes `{result:"win",reward}` to
`localStorage["mujicians.boss"]` and navigates to `mujicians.html?boss=win`. Mujicians' `handleBossReturn()`
(run on load) reads + clears that key, **advances M6→M7**, and **grants the sound into the Sound Collective**
(`grantBossReward` maps a kept **instrument's `sample` folder → the matching sampled VOICE** — the 7 real
instruments map 1:1: `trumpet→realtrumpet`, `violin→realviolin`, `acoustic_guitar_nylon→realguitar`,
`tenor_sax→realsax`, `tubular_bells→realbell`, `banjo→realbanjo`, `flute→realflute` — added to `persist.sounds`).
A kept **animal cry** now also grants — a player-tuned `type:"animal"` voice (see the 2026-08-01 amendment); only a
**synth-only Drum/Conga** stays Critter-Hunt-local. See `docs/mujicians.md` → "M6 Timbre boss". Standalone
play is unchanged when there's no `?boss` param.

**AMENDED 2026-07-28 — unmasking Wormwood is now the mandatory endgoal (forks #4 + #6 resolved).** One
animal is Wormwood in disguise (`G.culprit`); a **final determining "THE UNMASKING" clue** (`buildUnmaskClue`)
always closes the Case File and pins the impostor **through the solved grid** — via a *unique* attribute of the
instrument they played or the biome they were found in (often the **timbre**, so it doubles as an audio clue,
on-theme for the timbre boss; falls back to naming the instrument). Win = **name the impostor** (🐺 Unmask
Wormwood → `judgeAccusation`), Murdle-style; the grid is now the scratchpad you decode that clue with, and the
old full-grid check (`readAssignment`/`accuse`) is retired.

**AMENDED 2026-07-28 (UI) — tabbed, enlarged category cards + a `CATEGORIES` registry.** The three card
categories now sit behind **tabs** (one shown at a time, Murdle-style) and the cards are **much bigger**
(150×200) so the fact backs no longer clip. All card rendering — tabs, flip-cards, win-modal field notes, and
the derived `ATTRS` — is driven off a single **`CATEGORIES`** list, so the card/presentation layer is now
**N-axis-ready**; the deduction engine (grid/solver/clues) stays 3-axis. Planned 4th axis = **Genre / musical
style** (real-data, keeps the teaching angle — *not* Murdle's flavour "motive"); see **Extending past 3 axes** below.

**AMENDED 2026-07-28 (audio) — all 10 animals now have real vocalisation samples.** The silent-placeholder
animals are gone: each animal carries a `snd` slug → `sounds/animals/<slug>.mp3`, a **hand-curated Wikimedia-Commons
recording** (CC0 / Public-domain / CC-BY-SA — none ND, so repitch-safe; provenance in `data/critter-credits.json`,
fetched + trimmed + loudness-normalised to mp3 by `fetch-animal-samples.sh`). A new `playAnimalSound(slug)`
(lazy-load + cache, one-shot, **no pitch-shift**) plays them, and the card ▶ is now driven by a per-category
**`hear(e)`** handler in the `CATEGORIES` registry (instruments → `playInstrument`, animals → `playAnimalSound`),
so **animal cards *and* the won collection are both ▶-playable** (the old "(silent placeholder)" is gone).
Left deliberately open (per dev): **which animals become Mujicians pitched voices vs percussion one-shots** — the
samples play as-is for now so that call can be made by ear. (Serve over http, like the instrument samples.)

**AMENDED 2026-07-31 — the 4th axis (Genre) is now BUILT: cases sometimes have 4 variables / 6 sub-grids.**
The deduction engine is no longer 3-axis-only. Each `New case` calls `rollAcats()`, which appends the optional
**`genre`** axis ~`FOUR_VAR_CHANCE`(0.35) of the time → a 4-variable case (`G.acats` = the active axes). The
engine was generalised to any axis count, anchored on **animal**: the hidden solution is `sol[catId]` = one
bijection animal→X per non-anchor axis, and every pairwise relation resolves *through the animal*
(`partner()`/`pairHolds()`), so anchor↔other and other↔other pairs are uniform. Concretely: `GENRES` pool (real
facts origin/era/feel; a `genre` `CATEGORIES` entry with `nameLabel`); `pairKey`/`ORD`/`PAIR_REL` (per-pair clue
phrasing); `buildCluePool`/`atomsFor`/`buildCompoundPool`/`buildUnmaskClue` all loop over active category **pairs**
(so genre gets its own clues, compounds and unmasking route); `allArrangements` = the cartesian product of one
permutation per non-anchor axis (uniqueness search space `(N!)^(K-1)`, 216 at N=3/K=4 — still trivial); `marks`
is now a matrix **per active pair** keyed by `pairKey`; `renderBoard` draws the **classic staircase generalised to
K categories** (columns = non-anchor cats; anchor top band + reversed lower rows `cats[K-1..2]`, fillers past the
diagonal) → the familiar upside-down-L at K=3, **6 sub-grids at K=4**; the card tabs iterate `activeCats()` so the
**Genre tab only appears in 4-var cases**. **Feasible/solvable:** unchanged guarantee — `generatePuzzle` only
returns after `survivors.length===1` (unique), with `TARGET_CLEAR` bumped 3→5 for K=4 (a couple more clear clues to
pin the extra bijection) and one compound as before. **Mobile fit:** grid cell/label sizes are CSS vars; a `.k4`
class shrinks them (26px cells) so all 9 columns fit ~284px, inside a `.gridscroll` (overflow-x) safety wrapper so
the page never scrolls sideways. `AXIS_N` (entities per category) stays **3**. Everything below that says
"3-axis engine / 4th axis not built" is superseded by this.

**AMENDED 2026-08-01 — animals are now 20 SPECIFIC species, each named for its actual call.** The pool grew
`ANIMALS` **10→20** and every entry is now a real species whose bundled clip is a recording *of that species*, so
the in-game name matches the sound: the six already-species-specific recordings were renamed to their species (Fox
→ **Red Fox**, Parrot → **Chestnut-fronted Macaw**, Snake → **Rattlesnake**, Owl → **Great Horned Owl**, Bat →
**Hoary Bat** — its `habitat` fixed `cave`→`forest` — Cricket → **Field Cricket**), and the four ex-generic clips
were **re-sourced** to a labelled species (Frog → **Banded Bullfrog**, Elephant → **African Elephant**, Turtle →
**American Alligator** 🐊, Dolphin → **Orca** 🐳 — turtle/dolphin had no reliably-labelled Commons recording, so
they became an equally iconic, provably-labelled species). Ten new species were added — **Gray Wolf, Humpback
Whale, Mallard, Indian Peafowl, Howler Monkey, Wild Turkey, Domestic Goat, Rooster, Cow, Sheep** (lion & seal were
tried but Commons audio for them is junk — pronunciation clips / name-collisions — so they were skipped). New attribute
value: **`omnivore`** (added to `GLOSS`). No engine change was needed — the bigger, more attribute-overlapping pool
is safe because `refsFor`'s uniqueness guard falls back to the always-unique animal name, and `generatePuzzle`
retries an unlucky cast. Provenance for all 20 (species + author + license, all non-ND) is in
`data/critter-credits.json` / `sounds/CREDITS.md`; fetched by `fetch-animal-samples.sh` (now sends a descriptive
User-Agent — Wikimedia 429s default curl UAs under load).

**AMENDED 2026-08-05 — pool grown 20→26 species.** Six more, each with a real Commons clip OF that species
(all non-ND — PD / CC-BY / CC-BY-SA; rows in `fetch-animal-samples.sh`, provenance in the credits manifest):
**Horse, Common Loon, Tokay Gecko, Honey Bee, Domestic Cat, African Penguin.** Picked for **distinct emoji**
(no reuse of an existing 🐺/🦗/🐸) and **class spread** (adds a reptile + an insect; loon/penguin use the
`piscivore` diet, previously unused). New attribute value **`habitat:"city"`** (Domestic Cat) — free-form clue
text only, no engine/GLOSS change. No sprites yet → they render as emoji. (Same no-engine-change safety as the
2026-08-01 batch.)

**AMENDED 2026-08-01 — a won animal cry now feeds Mujicians as a PLAYER-TUNED card (no dev per-animal authoring).**
The old plan had the dev decide pitched-vs-percussion + crop for each of the 20 (growing) animals by ear. Instead the
**player** does it — but **not** as a blocking win-flow dialog (the inline `showAnimalTuner` was **removed 2026-08-02**).
Keeping a won animal now **claims it immediately with a forgiving default** (`DEFAULT_CFG` — role guess + a wide **1.5 s**
window from `off:0`, so no clip is silent out of the box; boss mode carries it straight back to Mujicians, standalone
offers a link into the lab). The player then **tunes it whenever they like in `animal-sound-lab.html`** — the shared,
re-openable editor: a role toggle (🎵 Pitched / 🥁 One-shot) + note-length / anchor / start-offset sliders + a
keyboard/scale/melody/drum-loop **audition** surface + per-animal **Save**. The lab lists **only collected animals**
(union of `critterhunt.collection` animals + tuned-store keys; `?all=1` restores the full dev feel-test roster) and its
Save writes the config to the **shared store** `localStorage["critterhunt.animalVoices"]` =
`{slug:{nm,em,role,anchor,off,len}}` (starting role guessed by call type in `ROLE_GUESS`/`DEFAULT_CFG`, all retunable). **Mujicians** reads that store
at load (`registerAnimalVoices`) and builds, per animal: a **`type:"animal"` VOICE** (`renderAnimal` — one-file
`sounds/animals/<slug>.mp3`, cropped to the note + pitch-shifted; pitched repitches from anchor & holds the note length,
one-shot = fixed pitch (anchor vs C4) + fixed `len`), a **Free-Play `INSTRUMENTS` card**, and a **Sound-Collective**
entry; a boss-return animal reward grants the same via `grantBossReward`. This is decoupled from boss mode — *any*
won+tuned animal (standalone play too) surfaces in Mujicians Free Play. The collection ▶ here also honours the tuned
config. `animal-sound-lab.html` is now that shared editor — opened from the Critter Hunt **win modal** (🎚 Tune it in
the Sound Lab), the Sound Collection's **🎚 Tune sounds** button, and a Mujicians **Home 🐾 Tune Sounds** button (shown
once any animal is tuned) — reachable any time, `?from=` sets its ← Back target. **Still deferred:** routing one-shot
animals through the true `{drum}`/`DRUM_VOICES` lane (kept off the canonical MJ2 drum save-index for now — they play as
fixed-pitch VOICES); campaign decks stay curated (animals are Free-Play only).

> **REWORK DONE (2026-08-02):** the embedded `showAnimalTuner` dialog was removed in favour of
> **`animal-sound-lab.html` as the shared, saveable tuning surface** (its ▶ preview had overlapped several pitches at
> once; the lab's keyboard/scale/drum audition is clearer). Keeping an animal claims a default and the lab is opened
> from the win modal, the collection, and a Mujicians Home button — see the AMENDED-2026-08-01 paragraph above.

Except where the amendments above note, the rest below reflects the original ship:

- **Data pools** — 26 animals (see 2026-08-01 & 2026-08-05 amendments) / **34 instruments** / 8 biomes, each with real attribute **tags** (animal:
  class/diet/size/habitat · instrument: Hornbostel–Sachs family/material/play-method · location: climate).
  Emoji stand in for art. *(Each instrument also carries a real **`origin`** — place of origin, shown as a
  card-back fact + in the field notes, added 2026-07-30; display-only, not yet a clue attribute — universal
  instruments like drum/flute read "ancient, worldwide".)* *(The instrument pool grew 9→22 on 2026-07-29 with an obscure/world set — shamisen,
  koto, shakuhachi, sitar, shehnai, bagpipes, kalimba, marimba, glockenspiel, celesta, harpsichord, dulcimer,
  harp — then **22→34 on 2026-08-02** with an orchestral / world / chromatic-percussion set — piano, cello, trombone,
  tuba, clarinet, oboe, pan flute, accordion, xylophone, steel drums, timpani, taiko — all real FluidR3_GM samples,
  reusing the existing H-S-family / material / play-method attribute values (accordion adds a novel `play:"squeezed"`;
  Timpani/Taiko are the first **sampled + pitched** membranophones — only Drum/Conga stay synth/unpitched).)*
- **Procedural generator + brute-force solver** (`generatePuzzle`) — rolls a solution (two bijections
  `pi`/`sg`), builds the **true-clue pool** from templates, **selects to uniqueness** over all `(3!)²`=36
  arrangements (biased toward attribute/teaching clues, a required audio clue, penalising direct-name clues),
  then **prunes to a minimal set**. Retries on an unlucky cast.
- **The clue-template system** — a clue is `link(refX, refY)` where each **ref** is a `name` or a *uniquely
  discriminating* real-attribute descriptor (`refsFor` enforces uniqueness in the cast). Relations `plays`
  (A↔I) / `at` (A↔L) / `here` (I↔L, the derived grid) × polarity; the **audio** clue is an association clue
  whose instrument ref is expressed by *timbre* (family) instead of name. Each clue carries `test(arr)`
  (solver predicate), `text` (render), and `meta` (audio/direct/attrCount/teaches).
- **UI: classic logic-grid layout** (reworked 2026-07-27 from three separate grids). **Left = tabbed flip-cards** — one category shown at a time
  (Suspects/animals · **Instruments** · Scenes/biomes — the instrument tab is labelled *Instruments*, not Murdle's "Weapons",
  since these are instruments), **enlarged** so the backs don't clip: front = emoji + name, **back =
  the real facts in plain language** (`GLOSS` glosses jargon — "frugivore → eats fruit", "aerophone → wind"),
  so a new term is one tap away; instrument card fronts have a ▶. **Right = one upside-down-L combined grid**
  (Animals×Instruments + Animals×Locations across the top band, Locations×Instruments in the lower-left corner —
  the standard decades-old logic-grid shape, our own CSS, **not** Murdle's stylesheet). Cells cycle
  **blank→✗→✓→?** (the `?` = Murdle's "maybe" mark); a ✓ **auto-✗’s the rest of its row & column** (within-grid).
  Those auto-✗’s are **derived, not written** (`displayVal`), so — Murdle-style — clearing a ✓ (clicking it on to
  `?`) instantly removes its auto-✗’s, while any cell still forced by *another* ✓ in its row/column stays ✗, and an
  explicit user ✗/✓/? is never overwritten. **🐺 Unmask Wormwood** opens an accusation strip
  of the N animals; clicking one judges it against `G.culprit` (win, or a "not the impostor" nudge). "New case",
  dev "Reveal" (also names Wormwood).
- **Dev sound-test panel (`?dev=1`)** — `renderDevPanel()` appends a panel that ▶-plays **every** instrument,
  animal, biome and genre regardless of the current case (instruments at C4; biome/genre buttons disabled when no
  clip is bundled) — the fast way to audition newly-added sounds. Off by default (`DEV` URL flag; never shown to
  players). Requires http serving, like all sample playback.
- **Instrument audio** — the 32 pitched instruments play **real recorded samples** (`playInstrument`→`playSample`,
  anchor + pitch-shift); Drum/Conga fall back to the small vanilla Web-Audio synth (`playPreset`: aero/chord/
  membrane/idio presets). ▶ on each instrument card lets you compare timbres.
- **Animal audio (BUILT 2026-07-28; grown to 20 species 2026-08-01)** — all animals play **real hand-curated vocalisation samples**
  (`playAnimalSound`, one file each in `sounds/animals/`, one-shot, no pitch). ▶ on each animal card too.
- **Reward → collection** — solving offers a **field-notes** card (real facts on the culprit trio) and lets
  you **keep one sound**: the instrument (a playable timbre) or the animal (its real vocalisation). Stored in
  `localStorage` (`critterhunt.collection`); **both instrument and animal cards replay** with a card-flip.

**Deferred / stubbed in the MVP:** ~~real sound files~~ — **now real recordings on both axes:** the 32 pitched
**instruments** use anchor+pitch-shift samples (Data sources → Instrument sounds) and **all 20 animals** play
hand-curated vocalisations (Data sources → Animal sounds); only the Drum/Conga instruments stay synth. Still
deferred: wiring an **animal-cry audio clue** (audio clues key off the *instrument* — timbre or, since Phase 2, its assigned **note** — not the animal's cry); **cross-grid**
auto-inference (only within-grid auto-X); difficulty ramp (N fixed at 3 via `AXIS_N`) & daily-seeded mode; Mujicians
integration (`persist.sounds`/`VOICES`); the tentative extensions below.

**AMENDED 2026-07-28 (clues) — Murdle-style compound clues BUILT.** The old single-relation templates read a bit
**"one-note"**; the generator now also builds **four compound clue types**, all still *true under the solution* and
all expressed through the same `test(arr)` predicate the uniqueness solver already uses, so they slot in with zero
solver changes (`atomsFor` = positive single-relation "atoms" from a name/attribute ref; `buildCompoundPool`
composes them):
- **XOR** ⚖️ — *"Either P or Q, but not both."* (`test = P xor Q`) — the flagship Murdle disjunction (a true atom
  paired with a false one → exactly one holds), e.g. *"Either the 🦊 Red Fox played the 🎻 Violin or the desert critter
  was found in the City, but not both."*
- **Narrow-to-two** 🔀 — *"The X did either A or B."* (true partner + one decoy; `test = A or B`) over animal→instrument,
  animal→location, or instrument→location.
- **Conditional** ➡️ — *"If P, then Q."* (both true under the solution; `test = !P or Q`).
- **Comparative** 📏 — *"The critter that played [X] is bigger than the critter found in [Y]."* using the **real
  size ordering** (`SIZE_RANK` tiny→huge; two indirectly-named critters, distinct + differing size).

**Clue shape (per dev, tightened 2026-07-28): exactly ONE compound clue per puzzle.** A compound clue is treated as
the single **"unclear"** clue (it needs inference, doesn't resolve to one grid mark); *all four types share the one
slot* — multiple inferential clues stacked read too hard. Everything else is **"clear"** (a definite ✓/✗: direct /
negative / attribute / the audio timbre clue). The generator seeds one compound (protected from the minimal-prune),
**caps compounds at one** in the greedy fill (`c.compound && selected.some(x=>x.compound)` guard), and a guarantee
appends one if none was load-bearing. It then **best-of-samples ~90 casts** to hit the target shape **≈3 clear + 1
unclear + the closing UNMASKING clue** (`TARGET_CLEAR`; returns early on an exact hit, else keeps the candidate whose
minimal clear-count is nearest 3 — full-grid uniqueness sometimes needs 4). Compounds rendered with a per-type badge +
purple `.clue.compound` style.
Rendered with a per-type badge + a purple `.clue.compound` style. *(The **final "reveal" clue** + culprit-ID
win-mode that were also planned here are **BUILT** — see the earlier 2026-07-28 amendment.)* **Still deferred:**
register/pitch comparatives (needs an ordered instrument-register axis), and a difficulty selector (Easy/Standard/Hard).

## The pitch — a real-data Murdle with three axes

A **Murdle-style logic-deduction puzzle** with Murdle's exact three-category structure, remapped:

| Murdle | Critter Hunt | Real-world attributes each carries (the teaching) |
| --- | --- | --- |
| **Suspects** | **Animals** | class (mammal/bird/…), diet, real habitat, size, region |
| **Weapons** | **Instruments** | family (string/wind/brass/percussion), material, how it's played, culture/origin |
| **Locations** | **Locations / biomes** | biome, climate, continent |

You solve by cross-referencing clues in a **deduction grid** (mark ✗/✓, auto-eliminate) to recover *which
animal played which instrument in which location*, then unmask the impostor (Wormwood's disguise). Each entity can also
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
— *someone played the sour note / stole the melody / crashed the recital.* **Wormwood — the timbre-thief — is
disguised as one of the band, and unmasking him is always the endgoal** (maps exactly onto Murdle's "find the
one guilty suspect"): you solve the grid to work out who played what where, then the **final determining clue**
names the impostor. (Own detective character + art — not Murdle's.)

## Core loop (reuse Murdle's proven layout)

Murdle's UI is a known-good pattern and its mechanics/layout aren't protectable (own art/name — see IP):

1. **The case** — a prompt naming N animals, N instruments, N locations, and a short list of **clues**.
2. **The grid** — the three pairwise sub-grids (animal×instrument, animal×location, instrument×location) with
   **card-flip entities** and **auto-X'ing**: ✓ a cell → auto-✗ the rest of that row/column in the sub-grid and
   cross-infer across sub-grids. (This auto-elimination *is* the constraint propagation the generator uses.)
3. **Play the sounds** — ▶ any animal or instrument to hear it (verifies audio clues).
4. **The accusation** — read the **final determining clue**, then **name the impostor** (Wormwood's disguise)
   via 🐺 Unmask Wormwood. The grid deduction is the scratchpad that lets you decode that clue.

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

## Extending past 3 axes (the 4th axis: Genre / musical style)

**BUILT 2026-07-31** (see the 2026-07-31 amendment up top) — the plan below is the design that was realised;
the axis is **Genre / musical style**, surfacing in ~35% of cases as a 4-variable / 6-sub-grid puzzle. The
steps below describe how it was wired (a few names differ from the final code — the engine went fully
axis-generic rather than adding one hardcoded `sol.gn`).

Murdle runs up to 4 categories (suspect · weapon · location · **motive**), sometimes more. Critter Hunt is
built to grow the same way — but the 4th axis is **Genre / musical style** (jazz / classical / folk /
blues / …), *not* Murdle's flavour **motive**, so the new axis still carries **real facts** (style, era, origin)
and keeps the teaching angle that differentiates the game.

**Already N-ready — the card / presentation layer.** All card UI is data-driven off the **`CATEGORIES`** registry
(`{id, role, noun, tabEmoji, castKey, pool, attrs, playable, facts(e)}`). The tabs, flip-cards, the win-modal
field notes, and the derived `ATTRS` all iterate it, so **adding a category's cards = one registry entry**.
`castKey` points at where that cast list lives in `G.cast`; `facts(e)` feeds both the card back and the field
notes (one source, no duplication).

**Still 3-axis — the deduction engine.** To actually *play* a 4th axis, wire it through:

1. **Data pool** — a `GENRES` array with real-fact tags (e.g. `era`, `origin`, `feel`) + a `CATEGORIES` entry
   (`castKey:"Gn"`, its `attrs`, `facts`).
2. **`attrLabel` + `GLOSS`** — add clue-text label cases + glosses for the new attributes (the clue-text helpers
   are keyed by category id and aren't in the registry yet — a documented extension point).
3. **`sampleCast`** — draw N genres, return them in the cast (e.g. `cast.Gn`).
4. **Solution** — add a 3rd bijection (e.g. `sol.gn: animal→genre`) alongside `pi`/`sg`.
5. **Grid** — generalise the upside-down-L into a **4-category staircase**: every pairwise sub-grid
   (A×I, A×L, **A×G**, I×L, **I×G**, **L×G**) with marks + within-grid auto-X. `renderBoard`/`marks` are the main
   rewrite; a category-pair-driven grid builder is the clean version.
6. **Clues** — `buildCluePool` grows a loop for each new pair (A↔G, I↔G, L↔G) × polarity, reusing `refsFor`; the
   audio/attribute clue machinery is already generic.
7. **Uniqueness** — the brute-force filter grows from `(N!)²` to `(N!)³` arrangements (still trivial at N≤5).
8. **Unmasking clue** — `buildUnmaskClue` already routes through the culprit's instrument/biome; extend its ref
   pool to include the 4th axis so the impostor can also be pinned via genre.

Difficulty knob: the **number of active categories** (3 → 4 → …) becomes another generator dial, on top of N.

## Rewards → playable sound cards (the Mujicians feeder)

Win → the player **picks one** to keep as a playable card:

- **Instrument → a melodic timbre.** Instruments are *tonal and built to play notes*, so they **pitch cleanly**
  and drop straight into Mujicians' `VOICES` / `playVoice` as a real sampled (or synth-preset) instrument. This
  is the **easy half** — the earlier animal pitch-shifting worry doesn't apply; instruments come as chromatic
  samples or already exist as `VOICES` presets.
- **Animal → a player-tuned voice** (BUILT 2026-08-01, see the amendment up top) — the player picks **pitched**
  (repitches into a scale) or **one-shot** (fixed hit) + crop/anchor in the win-flow tuner; it becomes a
  `type:"animal"` VOICE + Free-Play card in Mujicians. (True `{drum}`/`DRUM_VOICES`-lane routing for one-shots
  stays deferred — see the amendment.)

Both register in the **Sound Collection** (`sounds` / `persist.sounds`) — Critter Hunt *is* the collection's
gameplay source. A post-solve **"field notes" card** shows each entity's real facts (reinforces learning +
doubles as the collectible art). *(Standalone-first: the reward can be a local collection, wired to Mujicians'
`persist.sounds` only if/when integrated — see forks.)*

## Data sources (all open / CC — bundle locally, no runtime API)

Repo convention: flat static, vanilla, **no runtime third-party API** (like Inklings' bundled `dictionary.json`).
Curate + download **once**, commit the data, play offline.

### Animal sounds & facts

**Sounds — BUILT 2026-07-28 (10 from Wikimedia Commons); grown to 20 SPECIFIC species 2026-08-01.** One curated clip
per species, each a recording *of that species* so the name matches the call; `fetch-animal-samples.sh`
downloads → trims to a short one-shot → mono → loudness-normalises → mp3 (species/licences/authors in
`data/critter-credits.json` + `sounds/CREDITS.md`). All **CC0 / Public-domain / CC-BY / CC-BY-SA** (none ND → repitch-safe).
*Curation gotchas for a re-fetch:* (1) Commons search buries real cries under name-collisions (a "Red Fox **Sparrow**",
an "Oriental **turtle dove**"), **spoken-word / Lingua-Libre pronunciation clips** (`En-us-…`, `LL-Q…` — someone
*saying* the animal's name), and songs/music — filter with **`filetype:audio`**, force the name into the *filename*
(`intitle:`), or use scientific names (`Vulpes vulpes`, `Bubo virginianus`, `Ara severus`); (2) some species (lion,
seal, a labelled bottlenose dolphin) have essentially no usable Commons cry — swap for an iconic species that does
(orca, wolf, whale); (3) Wikimedia **429s default curl User-Agents under load** → the script sends a descriptive UA.
- Other viable sources (not used here): **Freesound** (CC0/CC-BY, but needs an API key), **ESC-50/FSD50K**
  (CC-BY subset, but its animal classes barely overlap this cast), **iNaturalist Sounds** (CC), **Xeno-canto**
  (birds/amphibians/bats/insects — but its free v2 API is retired for a key-gated v3).
- **Facts:** **Wikidata/Wikipedia** (class, diet, habitat, size, region); optional per-class trait sets
  (AVONET birds, PanTHERIA/EltonTraits mammals, AmphiBIO amphibians).

### Instrument sounds & facts (NEW)

**Real instrument samples — BUILT in Critter Hunt (2026-07-28; grown to 20 on 2026-07-29; to 32 on 2026-08-02).** The pitched
instruments now play **real recordings** via an **anchor + pitch-shift sampler**: 13 mp3s per instrument (one every 3 semitones, C3–C6);
playback picks the nearest and shifts it ≤1.5 semitones with `playbackRate` (chosen over per-note sampling —
indistinguishable in testing, ~⅓ the files). Samples live in `sounds/instruments/<name>/<Note>.mp3` (FluidR3_GM
via gleitz/midi-js-soundfonts; `sounds/CREDITS.md`; refetch/add with `fetch-instrument-samples.sh` — black keys
are **flats**). Each `INSTRUMENTS` entry carries a `sample` folder; `playInstrument()`→`playSample()` uses it,
else the synth preset — **Drum/Conga stay synth** (unpitched). `instrument-sound-lab.html` is a standalone
preview that plays any of the 7 at any pitch through the same engine. Loads via fetch/decodeAudioData → **serve
over http**, not `file://`.

**Mujicians (BUILT 2026-07-28):** the same sampler + shared samples now power a **sampled-voice branch** in
Mujicians' `playVoice` (`type:"sample"` VOICES + a `renderSample`/`renderSynth` split) — the 7 real instruments
are **pitched cards** in Free Play and catalogue into the Sound Collective. See `docs/mujicians.md` → Sound Collective.

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
- **Cozy-retro pixel restyle (BUILT 2026-08-02).** The whole chrome is a simple pixel look: **hard 90° corners
  (`border-radius:0`), chunky dark-warm outlines (`--edge:#3f362a`), and offset BLOCK shadows with no blur**
  (`--shadow`/`--shadow-sm`; buttons "press in" on `:active`). Colours stay the original warm cream/green/rust
  palette (dev pick: keep the cozy hues, just pixel-ify the shapes). Typography is a **hybrid** so phone legibility
  never suffers: a bundled bitmap font, **Pixelify Sans** (SIL OFL 1.1 — `fonts/PixelifySans-latin.woff2`, variable
  400–700 latin subset, ~12 KB; licence in `fonts/PixelifySans-OFL.txt`; the repo's documented "bundle-locally"
  exception, no runtime API), is used for **chrome only** (`--pix`: title, tabs, buttons, section headers, entity
  names, clue numbers), while all dense text — clue sentences, card-back fact lists, the header instruction — stays
  a legible sans (`--sans`). Emoji faces are unchanged (chrome-only pass). Font loads via `@font-face` → needs http
  serving like the samples. *(Scope: Critter Hunt only; Mujicians keeps its current look.)*
- **Pixel-art sprites (BUILT 2026-08-02; extended to instruments + emoji-baked set 2026-08-02).** Entities can
  render as pixel-art PNGs instead of emoji. A single `faceHTML(e)` helper returns an `<img class="asprite">`
  when the entity has a `sprite`, else the emoji — a **per-entity migration** (unmigrated entities keep their
  emoji). `sprite` is resolved by **`spriteSrc()`**: a value **with a `/`** is a path under `sprites/`
  (e.g. `"instruments/bell.png"`); a **bare filename** is an animal sprite (`sprites/animals/…`, back-compat with
  the original animals-only set). Sprites show **everywhere** a face appears: flip cards, grid column heads + row
  labels, accusation buttons, win-modal field notes, and the kept-sound collection. `.asprite` is sized `1em` so
  it inherits each context's font-size (64px flip card → var(--em) 15–20px grid heads → 30px collection), scaled
  nearest-neighbour (`image-rendering:pixelated`).
  - **Animals — 13 wired.** The original **9** (fox, mallard, rooster, goat, orca, cricket, bullfrog,
    howler=monkey, peafowl) were cut from a 3×3 source sheet (`sprites/animals/_source-sheet-3x3.png`) via
    per-animal centered ffmpeg crops → 200×200 (mostly 280×280 squares; the wide orca uses 340×340; the slight
    dark glow background reads near-white at the tight crop). Plus **4 emoji-baked** (sheep, cow, wild-turkey,
    humpback-whale). The other 7 animals still show emoji.
  - **Instruments — 6 wired (emoji-baked):** trumpet, violin, drum, sax, bell, banjo (`sprites/instruments/`). The
    other 28 instruments, and all biomes/genres, still show emoji.
  - **Emoji-baked sprites** are produced by **`bake-emoji-sprites.py`** (one-off tool; Pillow renders the system
    emoji at the Apple Color Emoji 160px strike, premultiplies α → LANCZOS downscale to a **40² grid** → **8-level
    colour posterize** + a hard α edge → a tiny 40×40 PNG the game upscales nearest-neighbour). The recipe (grid
    40, posterize, 8 levels) is chosen interactively in **`emoji-pixelizer.html`** — a standalone dev tool (repo
    root, opened from Critter Hunt's `?dev=1` panel; warm cozy-retro pixel styling + the bundled Pixelify font).
    It's **dynamic**: type/paste any emoji *or* drag-and-drop your own image files, tune grid/posterize/levels,
    preview at real card sizes, and **download a game-ready PNG** (native S×S) per item to drop into
    `sprites/{instruments,animals}/`. Same pixelization math as `bake-emoji-sprites.py` (the batch renderer for
    doing many at once from the CLI). **Caveat:** an emoji-baked sprite is frozen at the *authoring* platform's
    emoji (Apple's), unlike runtime emoji which follow the player's device — the tradeoff for cross-platform
    consistency.
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

## Daily-game expansion (PLANNED 2026-08-02; Phases 1–5 BUILT 2026-08-02)

Critter Hunt becomes a **first-class daily game** in its own right (not only the M6 boss): a **strict
daily-only shared puzzle** (Wordle-model), an **audio-first evidence layer** (every axis identifiable by
ear), a new **note/pitch** clue mechanic (the strongest Mujicians tie-in), and a **shareable result**.
Decisions locked with the dev 2026-08-02; genre/biome audio is **real PD/CC0 recordings only — NO synth
fallback** (dev call: synth beds/riffs sounded bad; a sourceless axis just plays nothing).
**Phases 1–5 are all BUILT.**

**Phase 1 — Daily-only shared puzzle (BUILT 2026-08-02).**
- **Seeded PRNG.** A `mulberry32` PRNG + `hashStr` feed a module-level `RNG` that the *entire generation
  path* now draws from (`rnd`, `shuffle`, the clue-scoring jitter, `rollAcats`) → everyone gets the identical
  case that day. Non-generation randomness (the audio noise buffer) stays `Math.random`.
- **Seed = local date** (`todayStr()` → `YYYY-MM-DD`), Wordle-style "new puzzle at your midnight." `newGame()`
  reseeds `RNG = BOSS ? Math.random : mulberry32(hashStr("critterhunt:"+todayStr()))`. (UTC is the alternative.)
- **Daily lock.** `localStorage["critterhunt.daily"]` = `{date,solved}`; a correct standalone accusation calls
  `markDailySolved()`. `applyDailyLock()` (standalone only, on load + on win) **hides the "New case" button**
  (no re-roll — the real consequence of daily-only), adds a **📅 Daily Case · <date>** badge, and once solved
  disables 🐺 Unmask + shows a "come back tomorrow" banner.
- **Boss mode stays endless.** `?boss=mujicians` (`BOSS`) **bypasses** the seed + lock (`RNG = Math.random`,
  "New case" kept, no badge) so the M6 boss is still retryable. Important carve-out.

**Phase 2 — Note/pitch per instrument (BUILT 2026-08-02, the Mujicians tie-in).**
- `sampleCast` now **clones** the cast instruments per-case and stamps each **pitched** one (has a `sample`;
  Drum/Conga stay unpitched) with a distinct note from `PITCH_POOL = [48,55,62,69,76]` (**C3·G3·D4·A4·E5** —
  fifth/octave gaps, all naturals, so they're easy to tell apart by ear; `noteName(midi)` + `NOTE_NAMES` render
  the label). Sharps / a wider pool are a later difficulty knob.
- `playInstrument(inst)` passes `inst.pitch` into `playSample`, so a card's ▶ plays it **at its case note**;
  unpitched instruments fall through to the synth preset.
- **Pitch is a real audio clue ref**, parallel to the timbre (`fam`) clue: `refsFor` emits a `key:"pitch"` ref
  for pitched instruments (always uniquely discriminating); `clueText` renders *"…the instrument that plays the
  note E5…"*, flags it `audio`, and carries the reference `note` (threaded through `mk`). It flows through single
  clues, compounds (text form via `attrLabel`'s pitch case), and `buildUnmaskClue` (Wormwood can be pinned by
  note). In the Case File a pitch clue shows a **▶ the note** button that plays the target note on a **neutral
  triangle** (`playNote` — so timbre doesn't give it away); you then match it against the instrument cards — the
  accessibility payoff (a blind player hears the target note and compares).
- **"Sometimes," per the dev ask:** `pitchCluesOn` is drawn once per case from the seeded RNG
  (`PITCH_CLUE_CHANCE = 0.55`) so ~half of cases *offer* pitch clues (and the single audio slot may pick pitch or
  timbre); cards still play their notes regardless. Seeded → the daily is identical for everyone. Deferred harder
  variant: pitch as a non-name-identifying attribute you must cross-deduce; routing compounds through the note ▶.

**Phase 3 — Audio-first evidence layer (BUILT 2026-08-02, real recordings only).**
- **Real recordings only, no synth.** The first cut had synth genre riffs + climate-keyed biome beds as a
  fallback; the dev judged them bad and had them **removed**. `playGenre`/`playBiome` now play a curated
  **PD/CC0 recording** (`sounds/{biomes,genres}/<slug>.mp3`) or **nothing** — a sourceless axis is silent, and
  its card ▶ / clue-cue is **hidden** (never a dead button). Availability is probed once at load
  (`probeAmbience`/`hasClip`, a HEAD per slug) and the cards/clues re-render after.
- **Biome ▶ + genre ▶** — added `hear`/`soundPath` to the location & genre `CATEGORIES`; `biomePath`/`genrePath`
  derive the file from `slugify(nm)`.
- **Per-clue ▶ cue** — biome/genre-referencing clues (and the UNMASKING clue) carry a `cue {label,path,play}`
  (threaded through `buildCluePool`→`mk`), rendered as a `▶ the biome/style` button **only if `hasClip`**.
- **"🔊 Listen to the case" play-all** (`listenToCase`) — sequences every suspect cry → each instrument at its
  note → each biome → each genre (skipping any without a clip), announcing each in `#msg`; toggles ⏹ Stop.
- **Sourced clips (Wikimedia Commons, verified):** biomes = reef/forest/jungle/tundra/mountain/city/savanna
  (**desert silent** — no recognisable-desert PD/CC0 recording); genres = jazz/classical/folk
  (**blues silent** — a PD clip was auditioned + rejected as poor, awaiting a replacement; **rock/electronic/
  disco/pop silent** — no PD/CC0 example). Fetched by `fetch-biome-samples.sh` / `fetch-genre-samples.sh`
  (`SILENT` sentinel skips a slug); provenance in `data/critter-credits.json` + `sounds/CREDITS.md`.
- **Scope note:** this is the *evidence* half of accessibility. A fully blind-playable **grid** (keyboard +
  ARIA + audio mark confirmation) is deliberately **deferred** — a separate, larger effort.

**Phase 4 — Social (BUILT 2026-08-02, pure code).**
- **Shareable spoiler-free emoji result**, copy-to-clipboard — the daily's virality hook. Because the daily
  has **no fail state** (you accuse until right), the skill signal is **how many wrong guesses** it took: a
  `dailyMisses` counter (bumped on each wrong `judgeAccusation`, reset in `newGame`) renders as `❌…🟩`
  squares. `shareText()` is regenerated from the stored day-result + stats so it survives a reload, and names
  nothing (spoiler-free) — only the date, the guess squares, the streak, and the case's axis count
  (`🧩 3/4-var`). `copyShare()` uses `navigator.clipboard` with a hidden-textarea `execCommand` fallback.
- **Streak + stats** in `localStorage["critterhunt.stats"]` = `{played, streak, maxStreak, lastSolved, dist}`.
  `markDailySolved(misses,k)` now also stamps `misses`/`k` into `DAILY_KEY` and folds the result into
  `recordStats()` (consecutive-day streak off `yesterdayStr()`, idempotent via `lastSolved`, a guess-count
  histogram `dist`). Boss mode records nothing.
- **Where it surfaces:** a preview + `📋 Share result` + a `statsSummary()` line in the win modal (standalone
  only), and the same button + stats in the daily-locked "come back tomorrow" state (`applyDailyLock`).

**Phase 5 — Mujicians Home button (BUILT 2026-08-02).**
- A **🔍 Critter Hunt** ghost button on the Mujicians Home CTA row, next to 🥁 Beat Lab, opens
  `critter-hunt.html` (no `?boss` → today's standalone daily), parallel to how Beat Lab is reachable from Home
  (`b-critter` → `stopLoop()` + navigate). Distinct from the M6-boss launch (`launchBoss` → `?boss=mujicians`),
  which stays gated behind clearing the timbre lesson.

**Sequencing:** Phases 1, 2, 4, 5 are self-contained code and ship without new asset files; only the biome
ambient (and any sampled genre riffs) need sourcing + a fetch run over http (Live Server).

## Open forks (decide before building)

1. ~~**Standalone vs. Mujicians-integrated**~~ — **RESOLVED 2026-07-29: BOTH.** Standalone play is unchanged; when
   launched as the **Mujicians M6 boss** (`?boss=mujicians`) a win writes the kept instrument into
   `persist.sounds` (mapped to a sampled `VOICE`) and advances M6→M7. See the 2026-07-29 amendment above.
2. ~~**Daily seeded puzzle vs. endless generated**~~ — **RESOLVED 2026-08-02: strict daily-only** for standalone
   (seeded PRNG, one shared puzzle/day, endless "New case" hidden); **boss mode stays endless/retryable.** See
   the "Daily-game expansion" section above.
3. **Grid size / difficulty ramp** — N = 3→4→5; which clue types unlock when; audio-clue-required tiers.
4. ~~**Wormwood mandatory or optional**~~ — **RESOLVED 2026-07-28: always on.** Unmask-the-impostor is the
   permanent endgoal (a boss finale stays a possible future layer).
5. **Reward = player's choice vs. fixed** — pick instrument *or* animal, or the puzzle dictates which.
6. ~~**Accusation input**~~ — **RESOLVED 2026-07-28: name the impostor** (Murdle-style single-culprit pick),
   not the full triple-set.

## MVP scope

**MVP:** standalone `critter-hunt.html`; the **procedural generator + brute-force uniqueness solver** at N=3–4;
~20–30 animals + ~15 instruments + ~10 biomes seeded from Wikidata with real attribute tags; CC0/CC-BY sounds
(instruments from VSCO2/VCSL, animals from Freesound/ESC-50); the three-sub-grid deduction UI with card-flip +
auto-X; direct + negative + **attribute** + one **audio** clue type; unmask-the-impostor (name the culprit); a "field notes" reward
card granting one playable sound (instrument = a `VOICES`-ready sample, animal = a percussion one-shot) into a
local collection. Wormwood as the **mandatory impostor to unmask** — a final determining clue + name-the-culprit win.

**Deferred:** relational/positional clues (ordered axis); the **daily-only seeded mode + note/pitch clue +
audio-first evidence layer (real biome/genre recordings + listen-to-case) are BUILT** (Phases 1–3, 2026-08-02)
+ the shareable spoiler-free result & streak/stats (Phase 4) + the Mujicians Home button (Phase 5) are BUILT
(see "Daily-game expansion" above); N=5+ and richer
difficulty tuning, larger rosters + more biomes, animated art/detective, sustained **tonal-animal** timbres
(granular/Tone.js — still tentative; also the reason a kept **animal** cry can't yet grant a Mujicians voice),
and any mic/"imitate it" angle (out of scope — point-and-listen). **Mujicians integration is now BUILT** (the M6
Timbre boss — see the 2026-07-29 amendment); wiring **animals** into `VOICES` is **BUILT** (2026-08-01, below).
