# Inklings — Poetry (the Versery) & phoneme engine

Planning doc. A poem-making mechanic where you **spend your collected vocabulary** to fill poem forms —
mad-libs style — with the game checking **rhyme, syllable count, and part of speech** for you. It is the
natural sink for the words the core loop produces, and it teaches poetic form the same way the rest of the
game teaches grammar: by embodying it, not lecturing it.

Status: **plan only — not implemented.** Reflects the 2026-07 planning session (three forks answered:
lives **inside Inklings** as a wing/lectern; rhyme/meter from a **bundled phoneme dataset**; ship
**mad-libs fill first**, free-compose later). Character names below are **candidates, not final.**

Cross-refs: [`inklings.md`](inklings.md) (the mad-libs module + Wordhoard room this reuses),
[`inklings-grammar-systems.md`](inklings-grammar-systems.md) (POS-anchored teaching + the word-guide cast this
extends), [`inklings-farming.md`](inklings-farming.md) §5 (the **parked "Sound Garden" IPA pass** — this doc
is the first real use of the bundled IPA data), [`inklings-collections.md`](inklings-collections.md) (the
grant/anthology reward pattern).

---

## 0. TL;DR

- A **second "book" lectern** in the Wordhoard — the **Versery** — runs **poem templates** instead of prose
  fables. It reuses the entire mad-libs module (registry → chapter menu → blank-fill picker); poems just add
  three **phoneme validators** on top.
- You fill each poem's blanks from your **collected words** (the dex), filtered by the slot's constraints:
  **POS** (already have it), **syllable count**, and **rhyme group**. Green-light a line when it all checks.
- The checker runs on a **bundled IPA phoneme dataset the repo already ships** (`IPA-fan-game/ipa_words.js`).
  Rhyme + syllables work today; **meter** is the one thing that wants stress marks (see §3.4).
- Poem **forms are taught by punny poet-NPCs** — meet one, learn its form as a reusable template (same grant
  pattern as fable recovery / the curator). Completed poems are recorded in an **Anthology** (the poetry dex).
- **Mad-libs fill ships first**; **free-compose** (write any line, validators grade it live) is the later
  mastery layer built on the same validators.

---

## 1. Decisions (settled with the dev)

1. **Lives inside Inklings**, not a standalone file. It spends the vocabulary the game already collects and
   reuses the mad-libs module, POS tags, the word-guide cast, and the grant/anthology reward pattern.
2. **Rhyme/meter from a bundled phoneme dataset** (offline, no runtime API — honours decision #9). The dev
   picked "CMU subset"; the repo **already ships an IPA set** (`ipa_words.js`) that covers rhyme + syllables,
   so **use that** and only add CMU/stress data **if/when strict meter is built** (§3.4). Flagged, not
   silently swapped.
3. **Mad-libs fill first, free-compose later.** Fill pre-blanked templates from inventory is the on-ramp;
   free-compose with live grading is the mastery layer on the same validators. Both modes, phased.
4. **Poem forms are characters.** Each form has a punny poet-NPC who teaches it; meeting/beating them grants
   the form. Names are **not final** — brainstormed candidates only (§6).
5. **Poems are a non-destructive use of the collection.** Filling a poem reads the dex; it does **not** lock
   words forever the way fables do (`usedWordSet`). You can rhyme "moon" in ten poems.
   There should be some type of limiting factor in place though. (Contrast note §4.4.)

---

## 2. Where it lives (architecture)

The mad-libs "book" (fables) is already a lectern in the Wordhoard that runs a **registry → chapter menu →
per-level fill UI**. Poetry is a **sibling lectern** using the same machinery:

- **New interactable:** a **Versery lectern** (an inkwell + scroll / a small writing stand) added to
  `data/rooms/library.json` (`type:"poetry"`, its own tile like the curator/book), exposed as
  `LIBRARY.versery`, gated by `nearLibraryVersery()`, drawn in `ensureLibraryBg`'s object loop. Walk up +
  `E` / touch **VERSE** / desktop toolbar **Versery** opens the `#poetry` modal.
- **Reuse the mad-libs pipeline:** a poem **form** is a `BOOKS`-style registry entry; a poem **template** is
  a level (blanked passage + slot specs). `openPoetry` → a **form menu** (which poets you've met → their
  forms) → `openPoem(form,template)` → `renderPoem` (same passage/needed/picker/completion structure as
  `renderMadlibs`), plus the phoneme validators. Keep it a **separate module** (`/* VERSERY */`) that calls
  shared helpers, so the prose mad-libs stays untouched.
- **Graduating to a room (later, optional):** if the Wordhoard gets crowded, the poets can move into their
  own **Verse Parlor** room (same room system as the Wordhoard). Start as one lectern; promote only if it
  earns it. (Mirrors how the library grew from a list into a room.)

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

### 3.4 Meter — the one gap (deferred / soft)

- `ipa_words.js` has **no stress markers**, so true **metrical feet** (iambic pentameter, anapestic
  limerick) can't be graded strictly from it. Three options, in order of cost:
  1. **Ship without strict meter.** Enforce **syllable counts + rhyme scheme** only; describe meter in
     flavor ("da-DUM da-DUM…") without grading it. Covers most forms well. **← recommended for v1.**
  2. **Soft meter** from syllable counts alone (right length, unstressed-agnostic) — good enough for the
     limerick's bounce as a _length_ pattern.
  3. **Add stress** later: fold **CMU Pronouncing Dictionary** stress digits (0/1/2) in via `build_*.py`,
     keyed to the same words — the one place CMU beats the bundled IPA. Only build this when a form (sonnet)
     truly needs graded meter. This is the dev's original "CMU subset," scoped down to _just meter_.

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

### 4.3 Completion & scoring

- A poem **completes** when every blank is filled and every rhyme group + length rule passes.
- **Score/stars** from the soft extras: perfect vs slant rhymes, alliteration/assonance hits, sensory-word
  bonus, exact syllable match vs range. Stars gate flavor (a poet's praise line), not access.
- The finished poem is **recorded in the Anthology** (§7) with your specific word choices, re-readable like a
  library entry.

### 4.4 Word reuse (decision #5, contrast with fables)

Fables **lock a used word forever** (`usedWordSet`) — a deliberate scarcity for that mode. Poetry is
**non-destructive**: it reads the dex without consuming or locking entries (spelling/brewing already spend
_letters_, not the word record — grammar-systems §7.8). Reusing "bright" across poems is fine and desirable.

---

## 5. The forms roster

Each form drills a specific skill; ship the cheap ones first (rhyme + syllables), defer meter-heavy ones.

| Form           | Structure                               | Drills                                    | Refrains?   | Tier    |
| -------------- | --------------------------------------- | ----------------------------------------- | ----------- | ------- |
| **Couplet**    | 2 lines, AA                             | rhyme (the tutorial)                      | no          | starter |
| **Haiku**      | 5-7-5 syllables                         | syllable count only (no rhyme)            | no          | starter |
| **Quatrain**   | 4 lines, ABAB / AABB / ABBA             | rhyme scheme choice                       | no          | early   |
| **Limerick**   | AABBA, bouncy                           | rhyme + line length (soft meter)          | no          | early   |
| **Tanka**      | 5-7-5-7-7 syllables                     | longer syllable control                   | no          | early   |
| **Cinquain**   | 2-4-6-8-2 syllables                     | graded syllable shaping                   | no          | mid     |
| **Acrostic**   | first letters spell a word              | **spelling** (ties to letter-collecting!) | no          | mid     |
| **Villanelle** | 19 lines, two refrain lines recur       | repetition + rhyme                        | **yes**     | late    |
| **Ghazal**     | couplets sharing a refrain word (radif) | refrain + rhyme                           | **yes**     | late    |
| **Sestina**    | 6 end-words rotate across stanzas       | end-word permutation puzzle               | word-rotate | late    |
| **Sonnet**     | 14 lines, iambic pentameter, volta      | meter (needs §3.4 stress)                 | no          | endgame |

Notes: refrain forms need the identity guard (§3.1) **relaxed** — a repeated line is the point. The
**acrostic** is a lovely bridge to the core loop: the hidden word is spelled by line-initial letters, so it
rewards the very letters you hunt. **Sonnet** is explicitly gated behind the meter upgrade — a good
"why we added stress data" capstone.

---

## 6. The character cast (poet-NPCs — names NOT final)

Design pattern: each poet = **a teacher + a validator persona**. Meeting one (a rare field encounter, or a
Wordhoard visitor) plays a short intro and **grants their form** as a Versery template — same one-time grant
as fable recovery / curator bundles / À La Modal's opt-in. They deliver form-specific praise/nudge lines
(reuse the single-at-a-time celebration queue so guides don't clamor — grammar-systems §2).

The phonetically-punny candidates (brainstorm — swap freely):

| Form       | Candidate        | The pun / vibe                                                |
| ---------- | ---------------- | ------------------------------------------------------------- |
| Ghazal     | **the Ghazelle** | sounds like _gazelle_ — a graceful antelope reciting couplets |
| Quatrain   | **Kat Rain**     | a cat conducting a **4-car train** (quat = four)              |
| Haiku      | **Hi-Coo**       | a zen dove that only coos in 5-7-5                            |
| Limerick   | **Lim Rick**     | a rowdy leprechaun bard, always a cheeky rhyme                |
| Sonnet     | **Sunny Sonnet** | a formal sun-faced court poet obsessed with meter             |
| Villanelle | **Vanilla Nell** | sweet; repeats herself (refrains)                             |
| Sestina    | **Sister Tina**  | a nun who obsessively rotates the same six words              |
| Couplet    | **the Cupplets** | twin teacups that finish each other's rhymes (tutorial)       |
| Acrostic   | **A. Crostic**   | first letters spell a hidden word; ties to letter-collecting  |
| Cinquain   | **Sink Wayne**   | a little guy in a sink, counts 2-4-6-8-2                      |
| Tanka      | **Tank-a**       | haiku's armored big sibling                                   |

These are **candidates only** (decision #4). Keep the roster data-driven so names/art swap without code.

---

## 7. Rewards & progression (the Anthology)

- **The Anthology** = poetry's dex: completed poems stored (form + your word choices + star score),
  re-readable, browsable by form. The poetry parallel to the word-library, matching decision #3 ("the
  collection made physical").
- **Renewable payout:** completing a poem grants **ink** (consistent with noun→ink), scaled by form
  difficulty + stars. Keep it additive; don't double-reward with potions/Feats (those are adj/verb homes —
  grammar-systems §7).
- **Form unlocks** come from meeting poets (§6), not from a tech tree — you _can_ fill a form the moment you
  learn it and own eligible words.
- **Optional décor tie-in:** completing a form's set (all its poet's templates) could grant a **placeable
  decoration** via the shared facing-tile primitive (collections §5) — a framed poem, a laurel. Reuses that
  system, doesn't invent a new one. Cosmetic; ship after the core.

---

## 8. Data pipeline (offline, existing-pattern)

- **`data/pronunciations.json`** — subset `IPA-fan-game/ipa_words.js` to just the words in
  `data/dictionary.json`, emit as fetchable JSON `{word:"ipa string"}` (the game fetches JSON like every
  other data file; it does **not** import an ES module at runtime). A small `build_phonemes.py` (or a step in
  `build_dictionary.py`) does the subset + logs **coverage** (% of dict words with a pronunciation) so §3.5
  fallbacks are quantified. Precompute rhyme keys + syllable counts here too if the runtime cost matters.
- **`data/poems.json`** — the form registry + templates: each form's structure, rhyme scheme, line/syllable
  rules, and its blanked passages with slot specs (§4.1). Hand-authored (poems are short — unlike the
  Gutenberg fable pipeline). Keep poet metadata (name/art/voice) here so §6 is data-driven.
- **(Deferred) stress data** — only if strict meter (§3.4 option 3) is built: fold CMUdict stress digits into
  the pronunciation file, keyed to the same words.

---

## 9. State & saves

- New saved state: **`state.poets`** (which forms are unlocked — one-time, like `state.fables`),
  **`state.anthology`** (completed poems: `{formId, fills, stars, ...}`, persists forever like `dex`).
  Optionally **`state.poemDecor`** folds into the shared `state.decorOwned` (collections §6) rather than a new
  key.
- **Bump the snapshot version** and add the keys to `snapshot()`/`applySnapshot()` + Export/Import (additive;
  old saves default empty). Form-unlock and score are stored; eligibility is re-derived from `state.dex` on
  load (retroactive, like Feats/curation).

---

## 10. Conflicts & considerations

1. **Phoneme coverage gap** (§3.5) — dex words missing from `ipa_words.js` can't fill rhyme/syllable slots.
   Mitigate: exclude them from those slots (still fill free-POS slots), quantify coverage at build time.
2. **No stress markers** (§3.4) — meter can't be graded strictly from the bundled IPA. v1 skips strict
   meter; CMU stress is the scoped upgrade. **This is the deviation from the dev's "CMU subset" answer —
   flagged, not silently taken.**
3. **Reuses the mad-libs module** — keep the Versery a separate module calling shared picker/menu helpers so
   the fable book is untouched (no regressions to a shipped system).
4. **Word reuse policy differs from fables** (§4.4) — poetry is non-destructive by decision; make sure the
   shared picker doesn't drag in `usedWordSet` locking.
5. **Companion/NPC traffic** — poet intros + praise route through the existing single-at-a-time celebration
   queue (grammar-systems §2, §4) so they don't clamor with À La Modal / Antonym / Synonomouse.
6. **Reward routing** — poems pay **ink** (+ optional décor); they don't touch potions/Feats, keeping each
   POS's reward home clean (grammar-systems §7).
7. **Room space** — the Versery is one more interactable in an already-busy Wordhoard (desk/book/shelves/
   curator). Confirm floor/placement; promote to its own Verse Parlor room if crowded (§2).
8. **Free-compose scope** (phase 2) — grading arbitrary typed lines needs the same validators plus a bench-
   style line editor and live feedback; keep the validator functions pure so both modes share them.

---

## 11. Build order (each a shippable milestone)

1. **Phoneme engine + data** — `build_phonemes.py` → `data/pronunciations.json`; runtime `rhymeKey(word)`,
   `rhymeStrength(a,b)`, `syllables(word)` with the IPA vowel set + cache. Unit-check a few known
   pairs/counts in the browser (parse-check, no harness). No UI yet.
2. **The Versery lectern + one starter form (Couplet or Haiku)** — new Wordhoard interactable, `#poetry`
   modal reusing the mad-libs menu/picker, constrained by the new validators. Proves the fill loop end-to-end.
3. **`data/poems.json` + the starter/early forms** (couplet, haiku, quatrain, limerick, tanka) + the
   **Anthology** record + ink payout. The playable core.
4. **Poet-NPCs** — form-granting encounters (`state.poets`), intro/praise voice via the celebration queue,
   data-driven roster. Turns forms into characters.
5. **Late forms** (acrostic, villanelle, ghazal, sestina) — refrain/rotation/spelling rules on top of the
   validators.
6. **Meter upgrade** (§3.4 option 3) + **Sonnet** — fold CMU stress into the pronunciation file; graded meter.
7. **Free-compose mode** — a line editor grading typed input with the same validators (mastery layer).
8. **(Optional) décor tie-in** — framed-poem decorations via the shared facing-tile primitive (collections).

---

## 12. Deferred / open

- **Strict meter / stress data** (CMU fold-in) — deferred to §11.6; needed only for sonnets.
- **Free-compose mode** — phase 2 (§11.7).
- **Poet names & art** — all §6 names are candidates; final naming + sprites open.
- **Own room vs one lectern** — start as a lectern; promote to a Verse Parlor only if the Wordhoard crowds.
- **Slant-rhyme tuning** — how lenient `rhymeStrength` should be per form (villanelles vs strict quatrains).
- **Poems as décor / gifting / sharing** — export a finished poem as an image? Deferred.
- **Non-noun collection homes** — poetry is a _use_ for all POS at the desk; confirm it doesn't step on the
  planned verb/adjective/adverb wings, just consumes their output.
