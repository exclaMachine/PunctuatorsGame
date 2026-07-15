# Inklings — Poetry (the Poetrees / the Forest) & phoneme engine

Planning doc. A poem-making mechanic where you **spend your collected vocabulary** to fill poem forms —
mad-libs style — with the game checking **rhyme, syllable count, and part of speech** for you. It is the
natural sink for the words the core loop produces, and it teaches poetic form the same way the rest of the
game teaches grammar: by embodying it, not lecturing it.

**The poetree reframe:** poetry lives in a **Forest** zone where each poem *form* is a **tree species** (a
"poetree"). **Composing** a poem *grows* its tree; **chopping it down to its meter** with an **axe** harvests
the tree's **wood**, which you spend on **cosmetic builds** (decorate the Wordhoard + other buildings). Felled
poetrees **regrow**, so wood is a renewable sink like ink. The axe is how **meter enters the game** — performed
in rhythm, not graded from stress data.

Status: **plan only — not implemented.** Reflects two 2026-07 planning sessions. Session 1 (three forks):
lives **inside Inklings**; rhyme/meter from a **bundled phoneme dataset**; ship **mad-libs fill first**,
free-compose later. Session 2 (the poetree reframe): forms are **trees in a Forest**, not lectern templates;
**compose = grow, chop-to-meter = harvest**; wood is **typed per tree**, **cosmetic-only**; trees **replace**
the human-pun poet cast; meter is **performed with the axe** (retires the deferred CMU-stress plan).

Cross-refs: [`inklings.md`](inklings.md) (the mad-libs module + Wordhoard room this reuses),
[`inklings-grammar-systems.md`](inklings-grammar-systems.md) (POS-anchored teaching + the word-guide cast this
extends), [`inklings-farming.md`](inklings-farming.md) §5 (the **parked "Sound Garden" IPA pass** — this doc
is the first real use of the bundled IPA data; the Forest is a **separate zone, not the farm**),
[`inklings-collections.md`](inklings-collections.md) (the grant/anthology reward pattern **and the shared
facing-tile placement primitive** the cosmetic builds reuse).

---

## 0. TL;DR

- Poetry lives in a **Forest** zone (its own authored area, **not** the farm). Each poem *form* is a **tree
  species** — a **poetree**. **Composing** a poem *grows* its tree; **chopping it to its meter** *harvests* the
  tree's wood. Felled poetrees **regrow** — renewable, like ink.
- **Composing** reuses the entire mad-libs module (registry → menu → blank-fill picker): you fill each poem's
  blanks from your **collected words** (the dex), filtered by the slot's constraints — **POS**, **syllable
  count**, **rhyme group**. Poems just add three **phoneme validators** on top. A fully-filled poem = a
  grown, choppable tree.
- **Chopping = meter, performed.** Each species has a signature **chopping rhythm = its form's meter** (an iamb
  is *tap*-**CHOP**, da-DUM). Clean timing → best wood; a **relaxed/auto-time mode** keeps it inclusive. The
  axe is the meter — this **retires** the deferred CMU-stress-data plan (§3.4).
- The checker runs on a **bundled IPA phoneme dataset the repo already ships** (`IPA-fan-game/ipa_words.js`)
  for **rhyme + syllables**. Meter no longer needs it (it's chopped, not graded).
- Poem **forms are the trees themselves** — each poetree species is the teacher/character; meeting/felling one
  grants the form (same one-time grant pattern as fable recovery / the curator). This **replaces** the
  human-pun poet cast. Completed poems are recorded in an **Anthology** (the poetry dex).
- **Wood is typed per tree** (cherry, oak, pine, cypress…) and spent **only on cosmetic builds** — decorate the
  Wordhoard and other buildings you add later, via the **shared facing-tile placement primitive**
  (collections §5). No content gating, no town.
- **Mad-libs fill ships first**; **free-compose** (write any line, validators grade it live) is the later
  mastery layer built on the same validators.

---

## 1. Decisions (settled with the dev)

1. **Lives inside Inklings**, not a standalone file. It spends the vocabulary the game already collects and
   reuses the mad-libs module, POS tags, and the grant/anthology reward pattern.
2. **Rhyme + syllables from a bundled phoneme dataset** (offline, no runtime API — honours decision #9). The
   repo **already ships an IPA set** (`ipa_words.js`) covering rhyme + syllables, so **use that**. **Meter is
   no longer graded from phonemes** — it's *performed by chopping* (decision #8), so the CMU/stress-data build
   is **retired**, not merely deferred. Flagged, not silently swapped.
3. **Mad-libs fill first, free-compose later.** Fill pre-blanked templates from inventory is the on-ramp;
   free-compose with live grading is the mastery layer on the same validators. Both modes, phased.
4. **Poem forms are characters — and the characters are trees.** Each form is a **poetree species** that
   teaches/embodies it; meeting/felling one grants the form. This **replaces** the human-pun poet cast (the
   Ghazelle, Kat Rain, Sink Wayne…); a couple fold in as fauna (the Ghazelle browses the Acacia). Species/art
   are **candidates** (§6).
5. **Poems are a non-destructive use of the collection.** Filling a poem reads the dex; it does **not** lock
   words forever the way fables do (`usedWordSet`). You can rhyme "moon" in ten poems. (Contrast note §4.4.)

**Session 2 additions (the poetree reframe):**

6. **Poetry is a Forest, not the farm.** A **separate authored zone** you enter; poetrees are **not** farm
   crops and don't use the seed/soil loop. (You *do* reuse the collections **placement primitive** for the
   cosmetic builds — §5 there — but growing a poem-tree is composing, not planting.)
7. **Compose = grow, chop-to-meter = harvest.** Filling a form's blanks **grows** the poetree; **chopping it
   down in its meter** yields the wood. Two beats of one loop, both at the tree.
8. **Meter is performed with the axe, not graded.** Each species' **chopping rhythm is its meter**; strict
   timing gives the best wood, with a **relaxed/auto-time mode** so rhythm is a *bonus, never a gate*. This is
   the gameplay-native answer to the §3.4 meter gap and **retires** the stress-data plan.
9. **Wood is typed per tree; cosmetic-only.** Each poetree drops its own wood (harder meter → harder wood).
   Wood buys **only decoration** — expand/decorate the Wordhoard and **other buildings added later** — never
   gated/required content (honours the collections "no gating / no town" rule).
10. **Poetrees regrow.** Felling isn't permanent; a poetree regrows (day-cycle / timer) so wood stays a
    **renewable** sink, matching ink. (Contrast fables' permanent word-lock.)

---

## 2. Where it lives (architecture) — the Forest

Poetry is a **separate authored zone** — the **Forest of Poetrees** — reached from the map like the Wordhoard
is its own room (**not** an interactable inside the library, and **not** the farm zone). Inside, individual
**poetrees** are the interactables. It still **reuses the mad-libs machinery** for the composing step:

- **New zone:** a **Forest** area with its own tile grid (uses the active-screen cell size the way
  `blockedAt`/`tileInFront()` already do), authored as `data/rooms/forest.json`. Poetrees are placed objects
  (`type:"poetree"`, one per available form) drawn in the bg object loop, each gated by a `nearPoetree()`
  proximity check. Walk up + `E` / touch **CHOP** / desktop toolbar opens the tree's `#poetry` flow.
- **Two beats at the tree (decision #7):**
  1. **Grow = compose.** Opening an ungrown poetree runs the **fill UI**: a poem **form** is a `BOOKS`-style
     registry entry, a **template** is a blanked passage + slot specs. `openPoetree(form,template)` →
     `renderPoem` (same passage/needed/picker/completion structure as `renderMadlibs`) + the phoneme
     validators. Completing every blank + rhyme/length rule **grows the tree** (visual: sapling → full).
  2. **Harvest = chop.** A grown poetree can be **felled** in a short **meter minigame** (§3.4): swings on the
     stressed beats, telegraphed by a **metronome bough**. A clean fell drops the tree's **typed wood** and
     records the poem in the Anthology; the tree then **regrows** (decision #10).
- **Separate module.** Keep it a **`/* FOREST */` module** that calls the shared picker/menu helpers so the
  prose mad-libs book stays untouched; the chop minigame is its own self-contained function taking the form's
  meter pattern.
- **The Versery is retired as a lectern.** The old plan put a writing stand in the Wordhoard; the reframe moves
  composing into the Forest instead. (The Wordhoard stays the *collection* room — desk, shelves, curator — and
  is a **destination for the wood** you harvest, §7.)

---

## 3. The phoneme engine (the load-bearing new system)

One dataset unlocks three checks. `ipa_words.js` maps a word to a **space-separated IPA string**
(`moon → "m u n"`, `abacus → "æ b ə k ə s"`).

### 3.1 Rhyme

- **Rhyme key** = the phoneme substring **from the last vowel nucleus to the end** of the word
  (`spoon "s p u n"` and `moon "m u n"` → both `u n` → rhyme). Compute once per word, cache it.
- **Perfect rhyme** = equal rhyme keys. **Slant/near rhyme** = keys share the final vowel **or** the final
  consonant cluster but not both (for softer forms / partial credit). Expose a `rhymeStrength(a,b)` →
  `perfect | slant | none`.
- **Rhyme groups in a template** are labels (`A`, `B`, `C`): every end-word tagged the same letter must
  rhyme. The validator picks the group's already-filled end-words as the target and grades new fills against
  them. **Identity guard:** a word doesn't "rhyme with itself" — reject an end-word identical to another slot
  in the same group unless the form allows refrains (villanelle/ghazal do; see §5).

### 3.2 Syllable count

- **Count the vowel phonemes** in the IPA string. Maintain an IPA **vowel set** (monophthongs `i ɪ ɛ æ ə ɑ ɔ
ʊ u ʌ ɝ` + diphthongs `eɪ aɪ ɔɪ oʊ aʊ` as single nuclei). `syllables(word)` = number of vowel nuclei.
- Powers **haiku 5-7-5**, tanka, cinquain, and any per-line length rule. A slot can require an exact count or
  a range; a whole line can require a target sum with a live running tally in the UI.

### 3.3 Alliteration & sound bonuses (cheap wins)

- **Onset match** = first consonant phoneme(s) equal → alliteration bonus (`"silent sea"`). Assonance =
  shared stressed vowel. These are **bonus scoring**, never required, and they make sound _audible_ as a
  mechanic — the point of using phonemes at all.

### 3.4 Meter — performed with the axe (the chop minigame)

**The reframe's key move:** meter is no longer *graded from the words* — it's **performed by chopping the
poetree**. This sidesteps the stress-data problem entirely (`ipa_words.js` has no stress markers, so grading
iambic pentameter from it was impossible without a CMU fold-in; that build is now **retired**, not deferred).

- **Each species' chopping rhythm *is* its form's meter.** The axe swings land on the **stressed** beats; the
  gaps are the unstressed syllables. An **iamb** is *tap*-**CHOP** (da-DUM); an **anapest** (the limerick's
  bounce) is *tap-tap*-**CHOP** (da-da-DUM); a **sonnet** is five iambs, 5× *da-DUM*, the hardest fell.
- **The metronome bough** telegraphs the beat: a swaying branch / falling markers give the player the pulse to
  swing against (a rhythm-game lane, but themed as a tree). Hitting the stressed beats cleanly = a clean fell.
- **Scoring → wood quality.** Clean timing yields **full, best-grade wood**; sloppy timing yields **splintered,
  less wood** (never *zero* — you always get *some*, so a bad sense of rhythm slows you, it doesn't lock a
  form's wood away). Difficulty of the rhythm scales with the form → harder meter drops **harder wood** (§7).
- **Relaxed / auto-time mode (decision #8, accessibility).** A setting **auto-times the swings** — the player
  still chooses to chop, the game snaps each swing onto the beat — so no one is excluded by reflex/timing.
  Rhythm is a **skill bonus, not a gate**. (Same spirit as the game's other difficulty accommodations.)
- **Data:** each form carries a **meter pattern** in `data/poems.json` (e.g. `meter:"0101010101"` for iambic
  pentameter, `0` = unstressed gap, `1` = stressed swing), consumed by the chop minigame. No per-word stress
  needed — the *form* owns the rhythm, the player performs it.

**Haiku's exception:** haiku has no strict stress meter, so its poetree (the **Japanese Maple**, §6) chops on a
calm **5-7-5 pulse** — a length rhythm, not a stress pattern. Forms without a metrical foot chop on their
syllable count instead.

### 3.5 Coverage & fallback

- A word may be in the dex but **not** in `ipa_words.js`. Fallback: an orthographic syllable estimate
  (vowel-group counting) + spelling-suffix rhyme, clearly marked as approximate; or simply **exclude
  un-pronounced words** from rhyme/syllable slots (they still fill free POS slots). Prefer excluding for
  correctness; log coverage against the shipped dictionary when building the subset (§8).

---

## 4. The fill mechanic (mad-libs mode, v1)

### 4.1 Template shape

A poem template = passage text with **typed blanks**. Each blank spec extends the existing mad-libs blank
with poetry constraints:

```
{ pos:"NOUN", syll:2, rhyme:"A", end:true }   // 2-syllable noun, ends the line, rhyme-group A
{ pos:"ADJ", syllRange:[1,2] }                // any 1–2 syllable adjective, mid-line
```

- `pos` — reuse the dex's cached WordNet POS (nouns/verbs/adjectives/adverbs). Function words can be fixed
  scaffold text so the poem still reads.
- `syll` / `syllRange` — from §3.2.
- `rhyme` — group label; `end:true` marks line-final slots that carry the scheme.

### 4.2 The picker

Same picker UI as fables (`pickerHTML`/`wirePicker`), but **filtered live** by the active slot's constraints:
POS, then syllable match, then — for a rhyme slot — words whose rhyme key matches the group's target.
Show _why_ a word is eligible (a small "2σ · rhymes -oon" tag) so the phonetics are legible. **Empty-set
guard:** if the player owns no word satisfying a rhyme+syllable slot, offer a relaxed filter (drop to slant
rhyme, or ±1 syllable) rather than dead-ending — surfacing "you need more -oon words" is good teaching.

### 4.3 Completion & scoring (composing grows the tree)

- The **compose** step **completes** when every blank is filled and every rhyme group + length rule passes —
  this **grows the poetree** (sapling → full), making it choppable. The tree isn't harvested yet.
- **Score/stars** come from two places: the **fill** soft-extras (perfect vs slant rhymes,
  alliteration/assonance, sensory-word bonus, exact vs range syllables) **plus the chop** (clean-meter timing,
  §3.4). Together they set **wood quality/quantity** and the tree's praise line. Stars gate flavor, not access.
- On a clean **fell**, the finished poem is **recorded in the Anthology** (§7) with your specific word choices,
  re-readable like a library entry, and the tree drops its **typed wood** before regrowing.

### 4.4 Word reuse (decision #5, contrast with fables)

Fables **lock a used word forever** (`usedWordSet`) — a deliberate scarcity for that mode. Poetry is
**non-destructive**: it reads the dex without consuming or locking entries (spelling/brewing already spend
_letters_, not the word record — grammar-systems §7.8). Reusing "bright" across poems is fine and desirable.

---

## 5. The forms roster

Each form drills a specific skill; ship the cheap ones first (rhyme + syllables), defer meter-heavy ones.

| Form           | Poetree            | Structure                               | Drills                                    | Tier    |
| -------------- | ------------------ | --------------------------------------- | ----------------------------------------- | ------- |
| **Couplet**    | **Pear** (softwood)| 2 lines, AA                             | rhyme (the tutorial)                      | starter |
| **Haiku**      | **Japanese Maple** | 5-7-5 syllables                         | syllable count only (no rhyme)            | starter |
| **Quatrain**   | **Oak** (hardwood) | 4 lines, ABAB / AABB / ABBA             | rhyme scheme choice                       | early   |
| **Limerick**   | **Lime**           | AABBA, bouncy anapest                   | rhyme + anapestic chop                    | early   |
| **Tanka**      | **Cherry**         | 5-7-5-7-7 syllables                     | longer syllable control                   | early   |
| **Cinquain**   | **White Pine**     | 2-4-6-8-2 syllables                     | graded syllable shaping                   | mid     |
| **Acrostic**   | **Birch**          | first letters spell a word              | **spelling** (ties to letter-collecting!) | mid     |
| **Villanelle** | **Vanilla vine**   | 19 lines, two refrain lines recur       | repetition + rhyme                        | late    |
| **Ghazal**     | **Acacia**         | couplets sharing a refrain word (radif) | refrain + rhyme                           | late    |
| **Sestina**    | **Sassafras**      | 6 end-words rotate across stanzas       | end-word permutation puzzle               | late    |
| **Sonnet**     | **Cypress**        | 14 lines, iambic pentameter, volta      | strict meter (the hardest chop)           | endgame |

Notes: refrain forms (villanelle/ghazal) need the identity guard (§3.1) **relaxed** — a repeated line is the
point; their trees chop on a **recurring refrain beat**. The **acrostic**/**Birch** is a lovely bridge to the
core loop: the hidden word is spelled by line-initial letters (you *carve it down the pale trunk*), rewarding
the very letters you hunt. **Sonnet**/**Cypress** is the **endgame chop** — strict iambic pentameter performed
cleanly, the hardest fell for the best wood (no longer gated behind a stress-data build; §3.4). **Wood
hardness tracks form difficulty** → the harder the meter, the better the wood (§7). Full species rationale and
per-tree wood in §6.

---

## 6. The cast: the poetrees (species — candidates, not final)

Design pattern (decision #4): each form's teacher/character **is a tree species** — a **poetree**. The tree
should pun the form's *name* **or** embody its *rule*, ideally both. First encountering a species (a new tree
appears in the Forest, or a scripted intro) **grants its form**; from then on that poetree can be grown +
felled at will. This **replaces** the old human-pun poet NPCs — a couple survive as **fauna** that live in the
tree (the Ghazelle browses the Acacia). Praise/nudge lines still route through the **single-at-a-time
celebration queue** (grammar-systems §2) so trees don't clamor.

**Each poetree yields its own typed wood (decision #9), harder meter → harder wood:**

| Form       | Poetree            | Why it fits (pun + rule)                                              | Wood → cosmetic build              |
| ---------- | ------------------ | -------------------------------------------------------------------- | ---------------------------------- |
| Couplet    | **Pear**           | pear = "**pair**" — two lines rhyming as a pair; partridge charm (tutorial) | soft trim, **poem frames**  |
| Haiku      | **Japanese Maple** | Japanese; its **seasonal turn** ties to haiku's required season-word (*kigo*) | light seasonal panels      |
| Tanka      | **Cherry**         | the maple's lineage grown longer — 5-7-5-7-7                          | planks, shelving                   |
| Quatrain   | **Oak** (four boughs) | steady four-line frame; "**Quatr**-oak"; the reliable workhorse    | **structural beams** — walls/widening |
| Limerick   | **Lime**           | "**lime**" hides in *limerick*; cheeky, springy, bouncy citrus       | springy softwood, comedic décor    |
| Cinquain   | **White Pine**     | **five** needles per bundle = the form's five lines (2-4-6-8-2)      | flooring/panels                    |
| Acrostic   | **Birch**          | pale bark you **carve a vertical word into** — ties to letter-hunting | signage/labels                    |
| Villanelle | **Vanilla vine**   | "**villa**-" → vanilla; a sweet climber whose **refrains** return    | ornamental repeating trim/wallpaper|
| Ghazal     | **Acacia**         | the savanna tree the **Ghazelle** browses; couplets + *radif* refrain | exotic hardwood accents           |
| Sestina    | **Sassafras**      | grows **three different leaf shapes on one tree** = end-word rotation | specialty puzzle-wood              |
| Sonnet     | **Cypress**        | tall, formal Italian tree = the Petrarchan sonnet; stately endgame   | **premium hardwood** — centerpieces|

These are **candidates only.** Keep the roster **data-driven** (`data/poems.json`, §8) so species/art/wood swap
without code. **No Bonsai** — it was a nice haiku fit but you can't axe a potted tree, so haiku is the
**Japanese Maple** (choppable, and its seasonal turn maps to haiku's *kigo*).

---

## 7. Rewards & progression (wood, builds, the Anthology)

- **The Anthology** = poetry's dex: completed poems stored (form + your word choices + star score),
  re-readable, browsable by form. The poetry parallel to the word-library, matching decision #3 ("the
  collection made physical"). Recorded on the **fell**, not the compose.
- **Renewable payout = typed wood (decision #9).** Felling a poetree grants **that species' wood**, in an
  amount/quality scaled by **form difficulty + fill stars + chop cleanliness** (§3.4, §4.3). Poetrees **regrow**
  (decision #10), so wood is a **renewable** sink like ink — **but it replaces ink as poetry's payout** (poetry
  no longer prints ink; noun→ink stays the noun loop's home). Don't double-reward with potions/Feats (adj/verb
  homes — grammar-systems §7); **wood is the poem's reward home.**
- **Wood spends on cosmetic builds only (decision #9).** Wood buys **decoration and space** — never gated or
  required content. Two build sinks:
  - **Decorate the Wordhoard** (and **other buildings you add later**) — placed via the **shared facing-tile
    placement primitive** (collections §5): frames, shelving, trim, structural widening. Each build has a
    **wood recipe** (typed amounts), so you're nudged to grow a **variety of forms** to afford the fancier
    pieces (hard builds want Oak beams / Cypress centerpieces).
  - Some décor ties thematically to its tree (a **framed poem** from Pear wood, a **carved sign** from Birch).
- **Form unlocks** come from first encountering a poetree species (§6), not a tech tree — you _can_ grow a
  form the moment you learn it and own eligible words.

---

## 8. Data pipeline (offline, existing-pattern)

- **`data/pronunciations.json`** — subset `IPA-fan-game/ipa_words.js` to just the words in
  `data/dictionary.json`, emit as fetchable JSON `{word:"ipa string"}` (the game fetches JSON like every
  other data file; it does **not** import an ES module at runtime). A small `build_phonemes.py` (or a step in
  `build_dictionary.py`) does the subset + logs **coverage** (% of dict words with a pronunciation) so §3.5
  fallbacks are quantified. Precompute rhyme keys + syllable counts here too if the runtime cost matters.
- **`data/poems.json`** — the form registry + templates: each form's structure, rhyme scheme, line/syllable
  rules, and its blanked passages with slot specs (§4.1). Hand-authored (poems are short — unlike the
  Gutenberg fable pipeline). Now also carries, per form: the **poetree species metadata** (name/art/fauna),
  the **meter pattern** the chop minigame performs (`meter:"0101010101"`, §3.4), and the **wood type** it
  drops (§6/§7) — so the whole roster stays data-driven.
- **`data/rooms/forest.json`** — the Forest zone layout (tile grid + poetree object placements), authored like
  `library.json`. One placed `type:"poetree"` per available form.
- **Build recipes** — the wood cost of each cosmetic build (`{buildId → {woodType: qty}}`), kept with the décor
  catalog (`DECOR`, collections §4) so poetry's wood plugs into the existing placement system.
- **No stress data.** The CMUdict stress fold-in is **retired** — meter is performed by chopping (§3.4), not
  graded, so the pronunciation file needs only rhyme + syllables.

---

## 9. State & saves

- New saved state: **`state.poetrees`** (which form/species are unlocked — one-time, like `state.fables`),
  **`state.anthology`** (completed poems: `{formId, fills, stars, ...}`, persists forever like `dex`), and
  **`state.wood`** (typed wood counts, `{oak: n, cherry: n, …}` — a renewable resource like `state.resources`
  ink). Placed cosmetic builds fold into the shared **`state.decorOwned`/`state.decor`** (collections §6)
  rather than a new key.
- **Forest/grow state** is lightweight: which poetrees are currently **grown vs regrowing** can be day-scoped /
  transient (like farm regrowth) — a regrow timestamp per tree, not a permanent record. The *unlock*, the
  *Anthology entry*, and *wood earned* are the durable parts.
- **Bump the snapshot version** and add the keys to `snapshot()`/`applySnapshot()` + Export/Import (additive;
  old saves default empty). Form-unlock, wood, and scores are stored; word-eligibility is re-derived from
  `state.dex` on load (retroactive, like Feats/curation).

---

## 10. Conflicts & considerations

1. **Phoneme coverage gap** (§3.5) — dex words missing from `ipa_words.js` can't fill rhyme/syllable slots.
   Mitigate: exclude them from those slots (still fill free-POS slots), quantify coverage at build time.
2. **Meter is performed, not graded** (§3.4) — the chop minigame **replaces** the deferred CMU-stress build.
   Watch that the **relaxed/auto-time mode** genuinely unlocks every form's wood so rhythm never gates content.
3. **Reuses the mad-libs module** — keep the Forest a separate `/* FOREST */` module calling shared
   picker/menu helpers so the fable book is untouched (no regressions to a shipped system).
4. **Word reuse policy differs from fables** (§4.4) — poetry is non-destructive by decision; make sure the
   shared picker doesn't drag in `usedWordSet` locking.
5. **Companion/NPC traffic** — poetree intros + praise route through the existing single-at-a-time celebration
   queue (grammar-systems §2, §4) so they don't clamor with À La Modal / Antonym / Synonomouse.
6. **Reward routing** — poems pay **typed wood** (→ cosmetic builds), **replacing** poetry's old ink payout;
   they don't touch noun→ink / potions / Feats, keeping each POS's reward home clean (grammar-systems §7).
7. **New zone, not a lectern** — the Forest is a **separate authored area** (`data/rooms/forest.json`), so it
   doesn't crowd the Wordhoard. But the Wordhoard (and later buildings) must have **clear floor** to place the
   wood-built décor — coordinate with the collections placement/room-space open question (collections §7).
8. **Shared placement primitive** — the cosmetic builds ride on collections §5's facing-tile placement; build
   it once, both features use it. Don't invent a poetry-only placement path.
9. **Free-compose scope** (phase 2) — grading arbitrary typed lines needs the same validators plus a bench-
   style line editor and live feedback; keep the validator functions pure so both modes share them.

---

## 11. Build order (each a shippable milestone)

1. **Phoneme engine + data** — `build_phonemes.py` → `data/pronunciations.json`; runtime `rhymeKey(word)`,
   `rhymeStrength(a,b)`, `syllables(word)` with the IPA vowel set + cache. Unit-check a few known
   pairs/counts in the browser (parse-check, no harness). No UI yet.
2. **The Forest zone + one starter poetree (Pear/Couplet or Maple/Haiku)** — new authored area
   (`data/rooms/forest.json`), a `type:"poetree"` interactable, the **compose** flow (`#poetry` modal reusing
   the mad-libs menu/picker + validators) that **grows** the tree. Proves the fill loop end-to-end.
3. **The chop minigame** — the meter-performance fell (metronome bough, swing timing, relaxed/auto mode) that
   turns a grown tree into **typed wood**. Proves grow→harvest.
4. **`data/poems.json` + starter/early poetrees** (Pear, Maple, Oak, Lime, Cherry) + the **Anthology** record +
   **wood payout** + **regrow**. The playable core loop.
5. **Cosmetic builds** — wire wood → the shared facing-tile placement (collections §5): a first buildable/décor
   set with wood recipes, placed in the Wordhoard. Proves the sink.
6. **The poetree cast** — species art/fauna, form-granting first-encounters (`state.poetrees`), intro/praise via
   the celebration queue, data-driven roster (§6). Turns forms into characters.
7. **Late poetrees** (Birch/acrostic, Vanilla/villanelle, Acacia/ghazal, Sassafras/sestina) — refrain/rotation/
   spelling rules + their special chop rhythms.
8. **Cypress/Sonnet** — the endgame strict-iambic-pentameter chop (no stress-data build needed).
9. **Free-compose mode** — a line editor grading typed input with the same validators (mastery layer).

---

## 12. Deferred / open

- **Free-compose mode** — phase 2 (§11.9).
- **Poetree species & art** — all §6 species are candidates; final naming + sprites (and per-tree chop VFX)
  open.
- **Forest layout & regrow tuning** — grove size, whether felled trees regrow on a day-cycle vs timer, how many
  poetrees are visible at once, how the map connects to the Forest (§9 keeps regrow state light).
- **Chop feel** — swing count per tree, how the metronome bough telegraphs the beat, difficulty curve, and the
  exact wood-quality → recipe economy (§7).
- **The build catalog** — the concrete list of cosmetic builds (Wordhoard widening, frames, shelving, and the
  "other buildings added later") and their typed-wood recipes.
- **Slant-rhyme tuning** — how lenient `rhymeStrength` should be per form (villanelles vs strict quatrains).
- **Poems as décor / gifting / sharing** — export a finished poem as an image? Deferred.
- **Non-noun collection homes** — poetry is a _use_ for all POS; confirm it doesn't step on the planned
  verb/adjective/adverb wings, just consumes their output.
