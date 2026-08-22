# Punctuators — General Ization & Keen Arrow (the Word Ladder)

**Status: M1 (the data) BUILT 2026-08-22 — `build-ladders.py` + `ladderPOJO.js`. M2–M4 (free play) planned,
no game code yet. Phase 2 — Restore the Phrase (§11) specced 2026-08-22, four decisions locked; **its M5
data layer BUILT the same day** — `phrases-source.txt` (108 drafted sayings, awaiting the dev's sense-prune),
`build-ladders.py --phrases`, and the generated `phrasePOJO.js` (108 puzzles). M6–M8 are the game code.
Phase 3 — Word Race (§12) specced 2026-08-22, nothing built; its Deep Dive companion (§12.4) is tentative.**

Two new heroes for `punctuators.html` / `index.js` who climb the **is-a-kind-of** hierarchy of a word:

| Hero | Power | Direction | Example |
| ---- | ----- | --------- | ------- |
| **General Ization** | **hypernym** — a broader kind | climbs **up** | `poodle` → `dog` → `mammal` → `animal` |
| **Keen Arrow** | **hyponym** — a narrower kind | climbs **down** | `animal` → `mammal` → `dog` → `poodle` |

They are a **pair sharing one mode and one set of target words**. That is the design's whole point: the
sentence lights up once, and **Switch Character** is what flips broaden ↔ narrow. Shooting the same word
with each of them in turn walks it up and down a ladder the player can feel.

The rungs come from **WordNet**, the same corpus that already backs Inklings (`data/dictionary.json`,
`data/wordnet-relations.json`, built by `build_dictionary.py`).

---

## 1. How a Punctuators wordplay mode works today

There is no base `docs/punctuators.md` yet, so here is the anatomy the ladder has to fit into. Every
existing wordplay mode (Ambigrams, Anagrams, Homophones, Alphabet Slots, …) is exactly three pieces:

**1. A dropdown option** in `punctuators.html` (~line 71):

```html
<option value="alphabetNeighbors">Alphabet Slots</option>
```

**2. A `wrap*` function** that marks target words with a span carrying the hero's name as its `id` and the
payload as `data-*`. Wired through `SpanPlaceholder.js` (which protects already-wrapped spans) and
dispatched from `addSpansAndIdsForWordPlay()` in `utils/utils.js:102`:

```js
// alphabeticalNeighbors.js:2390
`<span id="Betar (Alphabet Slots)" data-alphabetical-neighbors="${alternatives.join(",")}" class="word-0">…</span>`
```

**3. A branch in the collision block** of `animate()` (`index.js:1649`) that reads the payload and animates
the reveal — `index.js:1746` (ambigram spin), `1763` (homophone shiver), `1784` (anagram swirl),
`1801` (Betar's slot reel).

The **team** is assembled once at `index.js:2442` by `heroToTheRescue(nodeArr, availableHeroArray)`
(`utils/utils.js:198`), which keeps a hero when **`hero.symbol === span.id`**. `switchToNextHero()`
(`index.js:2263`) cycles that array.

Two more things that are true of wordplay modes and matter here:

- **Wordplay modes have no win state.** `numberOfPunctuationArray` (`utils/utils.js:177`) only collects
  `hidden-punc` / `capital-black-hole` / contraction spans, so the "you found them all" ending never fires
  in a wordplay mode. Free play, no scoring — which is exactly why a *repeatable, climbable* ladder fits.
- **`protectedArticles` is always applied first, and `spoonerism()` last** (`utils/utils.js:99` and `:136`).
  So Art the Tickler and The Foon may join the team alongside the ladder heroes. `spoonerism()` does its own
  span-protection pass internally (`spoonerismFunc.js:10`), so it **skips words already wrapped** — ladder
  spans are safe from Foon. No suppression needed; this is the same coexistence every other mode has.

---

## 2. The mode

### 2.1 Dropdown

```html
<option value="ladder">General &amp; Specific</option>
```

Label reasoning: `Word Ladder` is taken by the classic cat→cot→cog puzzle (and Betar's Alphabet Slots is
already the closest thing to it), so it would mislead. `General & Specific` names the mechanic in
kid-language and echoes General Ization's name. **See §10 — the label is the one thing worth a second
opinion before M1.**

### 2.2 The span

One span shape serves both heroes:

```html
<span id="Ization Ladder" data-ladder="poodle,dog,mammal,animal" data-rung="1" class="word-1">dog</span>
```

- `data-ladder` — the full chain, **most specific → most general**, left to right.
- `data-rung` — the index currently shown. Set at wrap time to the position of the player's own word.
- The player's word is normally **mid-chain**, so both heroes have somewhere to go from the first shot.
  A chain always tries to include **one rung below** the typed word for exactly this reason (§3.3).

### 2.3 Rules on a hit

| | |
| --- | --- |
| **General Ization hits** | `rung + 1` (right, broader) |
| **Keen Arrow hits** | `rung − 1` (left, narrower) |
| **Repeatable** | A word never locks. Climb up, climb back down, climb up again. |
| **At the top rung** | No move. **Capstone flourish**: the word flares, a `★` beat plays, the ladder holds. |
| **At the bottom rung** | Same, mirrored (a "clank" — the arrow can't cut finer). |
| **Case** | The typed word's capitalization is re-applied to each rung (rungs are stored lowercase). Reuse Betar's `matchCase` helper (`index.js:1843`) — lift it to module scope. |
| **Plurals** | If the typed word was a plural (`dogs`), the chain is built from the lemma and each rung is re-pluralized. v1 uses a naive `+s`/`+es` rule and only for regular plurals; irregulars (`mice`) are wrapped at the lemma and displayed as-is. See §3.4. |

### 2.4 Rung indicator (recommended)

On first hit, a small rung strip appears under the word — `▲ ● ▼ ▼` — showing where you are and how far
the ladder runs in each direction. This is the piece that makes it *read* as a hierarchy rather than as
random word-swapping, which is the whole educational payload. Styled in `index.css` next to the existing
`.reel` / `span[data-hint]` rules.

---

## 3. The data

### 3.1 Why a prebuilt file, and why not the raw relation graph

`data/wordnet-relations.json` (7.2 MB) already has `hyper`/`hypo` per lemma, but its lists are **flattened
across every sense of the word**, so raw use teaches the wrong thing:

```
tree → hyper: ["actor","histrion","player","thespian"]   ← Herbert Beerbohm Tree
dog  → hyper: ["canine","canid","chap","fellow","villain","scoundrel","sausage",…]
cat  → hyper: ["feline","felid","man","woman","gossip","gossipmonger",…]
```

So the ladder ships as a **prebuilt, sense-disambiguated file** produced by a re-runnable offline script —
the same pattern as `build-ambigram-pojo.js` → `AmbigramPOJO.js`.

### 3.2 `build-ladders.py` — BUILT

Python, not JS, because the sense disambiguation needs NLTK's WordNet, and **`build_dictionary.py`
already solves the neighbouring problem**. Its `_best_noun_sense(w)` (`build_dictionary.py:231`) was the
starting point; two of its three ideas survived contact with real output, and one had to be inverted.

**Sense scoring is count-first, not rank-first — a deliberate deviation from the plan.**
`build_dictionary.py` sorts by `_SENSE_RANK` (concrete categories over abstract) and breaks ties on SemCor
`lemma.count()`. That's right for Inklings, which *shelves* a word under a category. A ladder **asserts**
the relation, so a wrong sense states a falsehood, and rank-first produced four of them immediately:

```
king → checker      (king.n.08, the draughts piece, is noun.artifact = rank 7)
soldier → insect    (the soldier ANT is noun.animal = rank 9)
drum → fish         (drum.n.06, the fish)
jacket → peel       (jacket.n.04, the skin of a baked potato, is noun.food)
```

Ordering it the other way — real corpus evidence first, `_SENSE_RANK` only as a tiebreak among senses with
**no** evidence — fixed all four and, as a bonus, removed two hand-overrides the plan would have needed
(`water` stopped being a food, `book` became a publication). Measured on a 24-word probe it won 8 cases and
lost 2 (`plant` → the factory, `seal` → sealing wax), both pinned in a two-entry **`SENSE_OVERRIDE`**.

**Climb breadth-first over every hypernym branch, not `hypernyms()[0]`.** WordNet routinely lists a dud
branch first, so following one arm blindly either buries the good rung or lands on a silly one:

```
dog             → [canine, domestic_animal]   → [0] hides `mammal` four hops down the canine arm
wheeled_vehicle → [container, vehicle]        → [0] gives "a car is a kind of container"
```

Nearest qualifying rung wins; ties at the same depth go to the more common word, which is exactly what
picks `vehicle` over `container`.

Pipeline per word:

1. Candidate words = `data/dictionary.json` entries that are a **noun**, **≥3 letters**, present in
   **`enable1.txt`**, and whose best sense is **not a proper-noun instance**
   (`syn.instance_hypernyms()` — drops Bach, US state codes, …).

   **Why `enable1.txt` and not `2of12.txt`** (measured before the rung filters, on raw WordNet
   hyper/hypo): enable1 yields **~34.9k** eligible nouns of which **~32.3k** have a rung, versus 2of12's
   **22,604 / 21,486** — about 50% more of a typed sentence lights up. The cost is small and known: 2,181
   words in 2of12 are absent from enable1 (it's a Scrabble list, so no hyphens/apostrophes/proper nouns),
   against ~12k gained. `2of12.txt` keeps a smaller job in the rung filter below.

   *As actually built, after every filter in this section:* **34,673** eligible, **30,545** with a ladder
   (§3.3).
2. Walk up from the best sense, keeping a rung only if it **passes the commonness filter** (below) *and*
   is **sense-coherent** (next bullet block).
3. **Stop at a `TOP_STOPS` word** — a hand-written allowlist of familiar category words. This is what makes
   every ladder end somewhere a kid recognizes instead of at `physical_entity`:

   ```
   animal  plant  tree  flower  bird  fish  insect  food  drink  person  body  place
   building  vehicle  machine  tool  clothing  container  furniture  instrument  toy
   game  weapon  material  liquid  color  shape  number  time  feeling  action  idea
   ```

   Two changes from the plan, both from real output:

   - **`thing` was dropped.** It is the one entry that teaches nothing ("a stream is a kind of thing"), and
     WordNet's `thing.n.12` sits directly above several common branches, so it was swallowing them.
   - **Reaching a top-stop narrows the climb rather than ending it** — from there, only *another* top-stop
     can be a rung. That buys `oak → tree → plant` instead of stopping dead at `tree`.

   A second small list, **`MID_RUNGS`**, holds familiar *middle* categories (`mammal`, `fruit`, `garment`,
   `footwear`, …) that WordNet buries under jargon. One of these beats a top-stop **only** when it would
   otherwise not appear at all — which is precisely what recovers `dog → mammal → animal` from `dog →
   animal`, without ever making `poodle` skip `dog`.
4. Cap total chain length at **6 rungs** — but cut the **highest edge that doesn't lead to a top-stop**.
   In a parent map a chain's length is a property of its *shared tail*, so a naive "cut at rung 6" deletes
   `mammal → animal` for everyone and leaves `dog → mammal` dangling at a nonsense capstone. Spending the
   cut on jargon instead cost 22 nodes on the real build.

**Commonness filter** — a *separate, stricter* gate than eligibility. Being allowed to *type* a word (step
1) is not the same as being allowed to *appear as a rung*, because rungs are what the game asserts a word
"is a kind of". This is what prunes the taxonomy jargon between `dog` and `animal` (`canine, carnivore,
placental, vertebrate, chordate, craniate`). A rung qualifies when it is:

- a noun in `dictionary.json`, **and**
- **not** in a hand-written **`BANNED_RUNGS`** set of technical parents — seed it from the odd placements
  `build_dictionary.py:277` already documents (`passerine`, `salmonid`, …) plus the mammal/bird/plant
  taxonomy chains. Expect to grow this by eyeballing output; budget an hour for it in M1, **and**
- past a SemCor `lemma.count()` threshold, where **`2of12.txt` membership lowers the bar**. 2of12 is a
  curated common-word list already bundled for Inklings, so it is a free commonness proxy — it excludes
  `eutherian, craniate, passerine, salmonid, ratite, carinate, tracheophyte` outright. But it is only a
  signal, not a gate: it happily admits `canine, carnivore, placental, vertebrate, chordate, angiosperm`,
  so `BANNED_RUNGS` and the count threshold do the real work. A rung outside 2of12 needs a higher count to
  qualify (`MIN_COUNT_RARE = 2`; a 2of12 word or a top-stop needs none).

**Sense coherence — the condition that turned out to be load-bearing, and wasn't in the plan.** The shipped
map is word→word, but a *word* carries its own best sense, and it is usually not the synset it was just
named for. The chain then derails exactly one rung later:

```
mountain → natural_elevation, whose lemma is `elevation`
          …but `elevation`'s own best sense is an architectural DRAWING
          → mountain → elevation → plan → drawing
mansion  → lemma `hall`, whose own best sense is a CORRIDOR
          → castle → hall → corridor → passageway → passage
```

So a rung must be a word whose **own** best sense *is* the synset it was chosen for. Then walking the map
is walking a real hypernym path. It costs coverage, and that is the right trade: **a missing ladder is
invisible, a wrong one teaches a lie.** A relaxed second pass buys some coverage back for words left with
nothing, waiving coherence for `TOP_STOPS`/`MID_RUNGS` only — those can't derail a chain, and it is what
rescues `guitar → instrument` (parent synset `musical_instrument.n.01`, but the bare word `instrument`
resolves to "a device that requires skill" — different synset, same thing to a player). It fired 551 times.

Last, a four-entry **`PARENT_OVERRIDE`** for WordNet failures no filter can see: `water → liquid`
(`water.n.01` is filed as a binary *compound*), `hammer → tool` (`hammer.n.01` is the part of a *gunlock*),
`mountain → place`, `pencil → tool` (its only parent is `writing_implement`, which has no one-word lemma).

Target result reached: **`poodle → dog → mammal → animal`**, not `poodle → dog → canine → carnivore →
placental → mammal → vertebrate → chordate → animal → organism → living_thing → whole → object →
physical_entity → entity`.

**M1 gate — the spot-check list, as built:**

```
poodle → dog → mammal → animal      chair → furniture           king   → sovereign → ruler → person
dog    → mammal → animal            pizza → food                jacket → coat → garment → clothing
tree   → plant                      river → stream → water → liquid
car    → vehicle                    shoe  → footwear → clothing  apple  → fruit
bird   → animal                     teacher → educator → person  book   → publication
castle → mansion → house → building shirt → garment → clothing   cheese → food
```

### 3.3 Shipped format — the DOWN map, inverted at load

Coverage is not the constraint; quality is. As built: **34,673** words are eligible to be typed (§3.2 step
1) and **30,545** of them ended up with a ladder in at least one direction, across **4,837** distinct
parents. Chain lengths: 1 rung 1,002 · 2 rungs 11,017 · 3 rungs 11,180 · 4 rungs 5,523 · 5 rungs 1,613 ·
6 rungs 210.

Storing full chains per word is wasteful (`poodle,dog,mammal,animal` would be stored again for `dog` and
again for `mammal`). Ship **one relation map** and rebuild the other direction at load. The plan said ship
`ladderUp` and derive down; **the build ships `ladderDown` and derives up**, because the sizes are not close:

| encoding | raw | gzipped |
| -------- | --- | ------- |
| pretty `ladderUp`, one entry per line | 694 KB | 223 KB |
| minified `ladderUp` | 571 KB | 212 KB |
| **`ladderDown`, children space-joined** | **337 KB** | **145 KB** |

Down wins because 30,545 edges collapse onto 4,837 parents, so a child costs `len(word) + 1` inside a
shared string instead of repeating its parent plus JSON punctuation on its own line.

```js
// ladderPOJO.js — AUTO-GENERATED by build-ladders.py from WordNet. Do not hand-edit.
export const ladderDown = {
  dog: "puppy hound terrier cur spaniel pug mutt pooch husky corgi poodle …",
  mammal: "dog cat horse …",
  …
};
```

At module load, iterate it once (~30k children, a few ms) to build `ladderUp = {child: parent}`. Then:

- **chain for a word** = walk `ladderUp` to the top; the rung below is `ladderDown[word].split(" ")[0]`.
- **Round-trip is correct by construction** — up is literally the inverse of down, so `dog → mammal → dog`
  can never desync. *(Verified on the built file: 0 mismatches, 0 cycles, longest chain 6.)*
- The sibling list branching hyponyms (§14) and several §12–13 ideas need is now the **shipped** form, not
  the derived one.
- Nothing is lost by shipping down: a capstone with children is a key, and a capstone *without* children had
  no ladder in either direction and was dropped at build time.
- Both parents and the children inside each string are ordered **most-common-first**, so Keen Arrow's first
  pick down is the word a player would actually think of. Costs zero bytes.

**A `.js` module at repo root, not `data/*.json`** — a deliberate deviation from the `data/` convention,
for two reasons: (a) every Punctuators data set already ships this way (`AmbigramPOJO.js` 67 KB,
`alphabeticalNeighbors.js` 51 KB, `anagrams.js` 97 KB) and (b) a `fetch` would force the currently-synchronous
`hasLadders`/`wrapLadders`/`removePuncButton` path to go async.

**Size — the plan's open risk, now decided.** 337 KB raw / ~145 KB over the wire, against the 400–500 KB the
plan feared. That is ~3.5× `anagrams.js`, which the game already imports on every load. **Verdict: ship it
as a static import**, and revisit only if load time is felt in practice. The escape hatch the plan named is
still there and still cheap — move it to `data/ladders.json`, fetch on mode select, `await` in the button
handler — but it buys ~145 KB at the cost of making three synchronous functions async, so it isn't worth
taking pre-emptively.

### 3.4 Inflections

`data/inflections.json` (28,953 entries, already built) maps `dogs → dog`, `mice → mouse`, `ran → run`.
The ladder wrapper consults it so a typed plural still lights up. Rungs are re-pluralized with a naive
`+s`/`+es`; irregular plurals fall back to lemma display (`mice` wraps, shows `mouse` on the first climb).
Not perfect, cheap, and the failure mode is a correct word rather than a broken one.

---

## 4. The engine change: one span, two heroes

**This is the only structural change to existing code**, and it is small.

Today a span can belong to exactly one hero — `heroToTheRescue` keeps heroes by
`hero.symbol === span.id` (`utils/utils.js:207`) and the collision block gates on
`punctuationSymbol.id === player.symbol` (`index.js:1664`). The ladder needs *two* heroes to answer to
*one* span id.

Split the hero's **display name** from its **target id**:

1. **`Hero` constructor** (`index.js:866`) — add one line to the body, no new positional parameter (it
   already takes 13):
   ```js
   this.targetId = symbol;   // which span id this hero hits; heroes may share one
   ```
2. **Subclasses override it** after `super(...)`:
   ```js
   class GeneralIzation extends Hero {
     constructor() { super(…, "General Ization (Hypernym)", …); this.targetId = "Ization Ladder"; }
   }
   class KeenArrow extends Hero {
     constructor() { super(…, "Keen Arrow (Hyponym)", …); this.targetId = "Ization Ladder"; }
   }
   ```
3. **`heroToTheRescue`** (`utils/utils.js:207`): `value.symbol === …id` → `(value.targetId ?? value.symbol) === …id`
4. **`animate()`** (`index.js:1664`): `punctuationSymbol.id === player.symbol` → `punctuationSymbol.id === (player.targetId ?? player.symbol)`

Backward compatible: `targetId` defaults to `symbol`, so all 23 existing heroes behave identically.
The name tag (`index.js:2298`) keeps showing `player.symbol`, so the two heroes stay distinguishable
on screen.

**Team order.** Place `general, keen` **adjacent** in `availableHeroArray` (`index.js:1619`) so Switch
Character flips directly between them.

---

## 5. Wiring checklist

| File | Change |
| ---- | ------ |
| `build-ladders.py` | **new — BUILT** — the offline build (§3.2). `--spot [words…]` rebuilds only the check list in seconds; `--why <word>` prints one raw WordNet climb with a verdict per candidate; `--check` does the full pass without writing |
| `ladderPOJO.js` | **new, generated — BUILT** — `ladderDown` map, 337 KB (§3.3) |
| `ladderFunc.js` | **new** — `wrapLadders(sentence)` + `hasLadders(sentence)`, mirroring `AmbigramFunc.js:643/676` |
| `SpanPlaceholder.js` | `export const protectedLadders = withSpanPlaceholders(wrapLadders);` |
| `utils/utils.js` | `case "ladder":` in `addSpansAndIdsForWordPlay` (~:124); `targetId` in `heroToTheRescue` (:207) |
| `punctuators.html` | the `<option>` (~:71). *(The custom dropdown at :157 enumerates `sel.options` automatically — no extra work.)* |
| `index.js` | import `hasLadders`; guard branch in the `removePuncButton` handler (~:417); `GeneralIzation` + `KeenArrow` classes; instances + `availableHeroArray`; `targetId` in the collision gate (:1664); the ladder branch in the collision chain; SFX (§7); lift `matchCase` (:1843) to module scope |
| `index.css` | `.izo-widen`, `.keen-narrow`, `.ladder-capstone`, the rung strip (§6) |
| `CLAUDE.md` | the Punctuators row flips to **BUILT** per milestone — done for M1, still to do for M2–M4 |

**Guard message**, matching the existing three at `index.js:403–423`:

> `No ladder words found in your sentence — try naming some things!`

---

## 6. Animation

Both animations must leave the span as **plain text at the new rung** when they finish — the same
`settle()` discipline as `animateAnagramSwirl` (`index.js:119`) — because the word has to be hittable
again immediately.

**General Ization — the camera pulls back.** The current word scales down and fades while the broader
word fades in *larger* behind it, settling at normal size. Reads as zooming out to see the whole category.

**Keen Arrow — the lens snaps in.** The current word scales up and blurs briefly, then the narrower word
snaps into focus at normal size. Reads as picking one out of many.

**Capstone / clank.** At either end of the chain, no swap: the word flares in the hero's
`characterColor` and settles. This is a *good* moment, not a failure — `animal` is the answer.

Reduced motion: honor `prefers-reduced-motion` with a straight swap, as `animateAnagramSwirl`
(`index.js:127`) already does.

---

## 7. Sound

Use the existing Web Audio kit (`_tone` / `_noise`, `index.js:566/583`) — no new assets, consistent with
every other hero's `_xxxShoot` / `_xxxHit` pair.

| | |
| --- | --- |
| `_izoShoot` | a bugle-ish rising third — a general's call |
| `_izoHit` | a **descending, widening** low pad — the pull-back |
| `_keenShoot` | `_noise` bow-thrum + a fast rising blip — the loosed arrow |
| `_keenHit` | a sharp high tick — the arrow landing on one thing |
| capstone | a short `★` chime, shared by both ends of the ladder |

---

## 8. Art

Two existing assets look ready to press into service:

- **`images/Arrow.png`** — a blue arrow. Reads immediately as **Keen Arrow's projectile**.
- **`images/Generic.png`** — a black silhouette of a figure, hands on hips. Whether it's a leftover
  placeholder or not, "generic" is literally the joke — usable as **General Ization** as-is, or as the
  base for a proper drawing.

Still needed, following the two-frame convention every hero uses (`heroImage` + `secondHeroImage`, shown
while a projectile is in flight — `index.js:1718`):

| Asset | Notes |
| ----- | ----- |
| `General_1.png` / `General_2.png` | hero frames — military bearing, broad/wide silhouette |
| `Keen_1.png` / `Keen_2.png` | hero frames — lean, archer's stance |
| General's projectile | something that *widens* — a spreading ring or a cone |
| Keen's projectile | `images/Arrow.png` ✔ |

`characterColor` drives the name tag and speech bubble: suggest **`darkolivegreen`** for General and
**`crimson`** for Keen — distinct from every existing hero and from each other, so the switch reads at a
glance.

---

## 9. Milestones

**M1 — the data. BUILT 2026-08-22.** `build-ladders.py` + generated `ladderPOJO.js` (30,545 words,
4,837 parents, 337 KB). Gate met — all ten check words read cleanly, plus ~40 more (§3.2). Ships nothing
playable. The tuning knobs that did the work: `BANNED_RUNGS`, `TOP_STOPS`, `MID_RUNGS`, `MIN_COUNT_RARE`,
and the two hand tables `PARENT_OVERRIDE` (4 entries) / `SENSE_OVERRIDE` (2). Re-run the script after
touching any of them.

**M2 — the mode, headless.** `ladderFunc.js` (`wrapLadders` / `hasLadders`), `SpanPlaceholder` +
`utils.js` wiring, the `<option>`, the guard message. Words visibly mark up in the sentence. Nothing shoots
them yet. **Start here:** invert `ladderDown` to `ladderUp` once at module load (§3.3), then `data-ladder`
is a walk over the two maps.

**M3 — the heroes.** The `targetId` split (§4), both hero classes, `availableHeroArray`, the collision
branch, up/down movement, capstone behavior. Playable with placeholder art and no polish.

**M4 — the feel.** Animations, SFX, the rung strip, final art, the How-to-Play / character modal copy
(`updateCharacterModal`, `index.js:458`, already has a per-mode template pattern to follow).

**M5–M8 — Restore the Phrase**, the puzzle mode. Specced separately in §11.9; it builds on M4, so nothing
there starts before free play is playable.

---

## 10. Open question

**The dropdown label.** `General & Specific` is the recommendation (§2.1). Alternatives considered and
why they lost: `Word Ladder` (collides with the classic letter-swap puzzle, which is nearly what Betar
does), `Hypernyms` (accurate, but the sibling modes all use plain-language labels), `Zoom` (evocative but
says nothing about words). Easy to change any time before M4 — it's one `<option>` and one modal heading.

---

## 11. Phase 2 — Restore the Phrase (the puzzle mode)

**Specced 2026-08-22. Not built. Assumes M2–M4 (free play) have shipped — it reuses that engine whole.**

§§1–10 describe **free play**: climb any word, no goal, no win state, which is how every Punctuators
wordplay mode works today (§1). The ladder is unusual among the modes in that it also has an obvious
**puzzle** shape, and this is it.

### 11.1 What it is

Show a well-known saying with one or more words already **shifted along the ladder**. Shoot it back:

> **A canine is a person's best friend.**
> → Keen Arrow on `canine` → `dog` · Keen Arrow on `person` → `man`
> → **A dog is a man's best friend.** ✔

Why it earns its keep:

- **Punctuators' first wordplay mode with a real win state.** Every mode today is an open-ended sandbox,
  so the "triumphant trumpets" ending (`gameSfx.end`, fired at `index.js:1698`) has never applied outside
  the punctuation game. Here there is a correct answer.
- **It teaches the direction, not just the relation.** Free play lets you wander. Here you must notice
  that `canine` is *too broad* and needs narrowing — that judgment is the actual skill.
- **It reuses the whole v1 engine.** Same span, same `data-ladder`, same two heroes, same animations.
  What's new: a phrase corpus, a goal rung to compare against, a win check, and the daily chrome.

### 11.2 The four decisions (locked 2026-08-22)

| Fork | Decision |
| ---- | -------- |
| **Corpus** | **Authored phrase list, generated-then-frozen shifts.** A human marks which words may shift; `build-ladders.py --phrases` computes the shift and bakes `phrasePOJO.js`. Nothing is generated at runtime, so no ugly puzzle ever reaches a player. |
| **Framing** | **Daily headline + endless practice**, with practice behind a single `PRACTICE_ENABLED` constant. The destination is **daily-only**; practice exists so the dev can playtest without waiting a day. Route *every* practice affordance through that flag so switching it off is a one-line change, not a refactor. |
| **Fail state** | **None.** Climb freely in both directions until it's right. **Wasted shots are the score** and the share stat — the same skill signal Critter Hunt uses (`dailyMisses`). |
| **Entry** | **Its own `<option>`** — `Restore the Phrase`, next to `General & Specific`. Picking it hides the text box and shows the puzzle card. No branching inside free play. |

### 11.3 The corpus

`phrases-source.txt` at repo root — the only file that ever needs editing to add puzzles.
**Drafted 2026-08-22: 108 phrases, 149 braced words. Awaiting the dev's prune.**

```
A {dog} is a {man}'s best friend. | English proverb, 1789
#~ ↕ dog       broader: mammal → animal    narrower: puppy hound terrier cur spaniel pug …+27
#~ ↕ man       broader: person             narrower: guy sir gentleman stiff bachelor beau …+29
```

- **Braces mark the words that may shift.** The script never picks targets on its own — see §11.4 for why
  that is not optional. Four optional flags, each answering something the build provably cannot work out:

  | Written | Means |
  | ------- | ----- |
  | `{word}` | the build picks the direction and the rung |
  | `{word>child}` | narrow to **this** child — the fix for an obscure automatic pick (§11.5). A child that isn't real is a fatal error listing the ones that are |
  | `{word^}` | broaden; never narrow this one |
  | `{word+}` | the word is plural although it doesn't look it, so shift it plural — *plenty of `{fish+}`* → sharks, but *a `{fish}` out of water* → shark |
  | `{{word}}` | shift 2 rungs instead of 1 (a harder day) |
- **`#~` lines are machine-written and regenerated by every `--phrases` run.** Humans edit the phrase line;
  the build rewrites the annotation beneath it. This is what turns the sense-check (§11.4) from research
  into a read: the evidence sits under the phrase. One line per braced word (`↕` shifts both ways · `↑`
  broader only · `↓` narrower only), then a **`#~ =` line carrying the puzzle the build actually made** —
  that is the line to prune against, since it is what a player sees. `#~ !` flags something the build had
  to work around, `#~ ✗` a fatal fault on that line.
- **Public-domain sayings only.** Proverbs, idioms, fables, scripture, Shakespeare. No song lyrics, no
  modern quotations, no ad slogans.
- **Append-only.** New phrases go at the bottom; the daily index is positional (§11.7).
- **Distribution in the draft:** 109 braced words shift both ways, 17 are broader-only, 23 narrower-only.
  Words with only one direction still make fine puzzles — they just constrain which hero solves them, which
  is why the direction-mix rule (§11.5) is per-phrase and not per-word.

### 11.4 The sense trap — vetting is the real work

Probed against the built `ladderPOJO.js` on 65 idiom nouns. The ladders are good, **but a word's ladder
follows its own globally-best sense, which is often not the sense the saying uses**:

| In the saying | What the ladder says | Damage |
| ------------- | -------------------- | ------ |
| `chicken` (don't count your ~s) | `chicken → meat → food` | the *meat* sense — the puzzle would broaden a live bird into lunch |
| `needle` (~ in a haystack) | `needle → leaf` | the *pine* needle |
| `iceberg` (tip of the ~) | `iceberg → lettuce → greens → vegetable` | yes, really |
| `heart` (a ~ of gold) | `heart → suspicion → notion → idea` | the organ isn't the best sense |
| `court` (the ball is in your ~) | `court → gathering` | the court of *law* |
| `cake` (piece of ~) | `cake → block` | technically right, reads as nonsense |
| `evil` (root of all ~) | `evil → transgression` | the countable-act sense |

So: **a phrase word is shiftable only when its ladder sense is the sense the phrase uses**, and no
automated check can tell. That is the whole reason for braces in §11.3 — the human eyeballs the chain and
marks the survivors. `build-ladders.py --phrases` regenerates the `#~` annotation under every phrase so the
eyeballing is a read, not a lookup.

All seven of the above were caught by drafting the corpus against the real data and are **already excluded**
from `phrases-source.txt` — five of them by dropping the whole saying, since the trapped word *was* the
saying's best target.

**A free-play finding fell out of the same probe.** Some taxonomy jargon still slips through
`BANNED_RUNGS`: `cow → cattle → bovine → ruminant`, `elephant → pachyderm → mammal`, `smoke → aerosol →
cloud`, `barrel → tube → conduit`. Harmless-ish in free play, glaring in a puzzle where the rung is the
answer. Add these to `BANNED_RUNGS` and re-run — cheap, and it improves M2–M4 too.

### 11.5 The build step — `build-ladders.py --phrases` — BUILT 2026-08-22

`--phrases` reads `phrases-source.txt`, emits `phrasePOJO.js` (a `.js` module at repo root for the same
reason as `ladderPOJO.js`, §3.3), and rewrites the source's `#~` annotations in place. `--phrases --check`
reports without writing anything.

**It reads the shipped `ladderPOJO.js` rather than climbing WordNet again**, which is why the whole
NLTK setup and the three corpora are skipped when the flag is present. Two payoffs: a puzzle can never
assert a rung the game doesn't have, and prune → rebuild is a second instead of ~70.

```js
// phrasePOJO.js — AUTO-GENERATED by `build-ladders.py --phrases`. Do not hand-edit.
export const ladderPhrases = [
  { show: "A mammal is a guy's best friend.",
    say:  "A dog is a man's best friend.",
    origin: "English proverb, 1789",
    fix: [{ i: 1, at: 1, goal: 0, chain: ["dog", "mammal", "animal"] },
          { i: 4, at: 0, goal: 1, chain: ["guy", "man", "person"] }] },
];
```

- `i` = index into `show.split(" ")`, so the wrapper marks exactly those tokens and leaves the rest alone.
  Punctuation and possessives ride along inside the token (`{man}'s` → token `guy's`).
- `chain` is **most specific → most general** (§2.2), `at` the shown rung, `goal` the answer. A narrowing
  shift puts the shown word at index 0, so the chain never runs below the answer and the player can't
  wander further down than the puzzle intends.
- `plu` / `cap` tell the game to re-pluralise / re-capitalise a rung as the word moves.
- **Direction mix.** A pin or `^` settles a word outright; then words with only one available direction
  take it; then the flexible ones fill whichever side is still missing, so a phrase with ≥2 shiftable words
  needs **both heroes and Switch Character** whenever its words allow. That requirement *is* the lesson.
  **39 of the 108 drafted puzzles need both heroes**; the rest have words that only climb one way.
- **Collisions** are resolved by flipping direction, and only then by leaving the word unshifted with a
  `#~ !` note. This is what saves *The `{pot}` calling the kettle black* — `pot`'s first child **is**
  `kettle`, so it broadens to `cookware` instead.
- **Build-time fixups** to `show`: `a`↔`an` agreement (`A dog` → **An** `animal` — done here *and* live
  in-game, §11.6), plural re-inflection (§3.4, with a small irregular table for rungs like `person`→`people`),
  and case.
- **Verification, all fatal**: rung indices in range; the chain round-trips (`chain[goal]` is the original
  word, `chain[at]` the shown one); **every chain edge exists in `ladderPOJO.js`**; the token really holds
  the shifted word; no two braced words land on the same surface form; and `show != say`, which catches a
  puzzle that would start solved. A faulty line is reported with its own `#~ ✗` note and skipped — the other
  107 still build, and the exit code is non-zero.

**The one thing the build cannot judge — which is the same wall as §11.4.** `ladderPOJO.js` orders children
most-common-first, but `commonness()` scores the *word*, not its noun sense, so a word that is common as
something else floats to the front: `basket → frail`, `worm → annelid`, `mouth → yap`. Harmless in free
play, where the player *chose* to climb down and any true hyponym is a fair answer — wrong in a puzzle,
where the shown word is the clue. **2of12.txt cannot fix it** (measured: it admits `frail`, `annelid`,
`yap` and `ocelot` alike, being a word list rather than a sense list). So the author pins the child with
`{basket>breadbasket}`, exactly as braces pick the word.

### 11.6 In-game rules

- **The team is exactly General + Keen.** `protectedArticles` and `spoonerism()` are both **suppressed** in
  this mode (`utils/utils.js:99` and `:136` — the latter already has an `anagrams` exclusion to copy). Art
  and Foon rewriting the phrase the player is trying to match would be actively confusing, and plain-text
  articles are what makes the live `a`/`an` fix trivial (`articleFunc.js` swallows the following character
  into its span).
- **The span** is the free-play span plus a goal: `data-ladder`, `data-rung`, **`data-goal`**.
- **A hit moves ±1 rung along the authored chain.** No ambiguity in either direction — because the chain is
  fixed data, Keen Arrow never has to choose among `dog`'s 33 children (contrast §14, branching hyponyms).
- **Landing on the goal locks the word**: green ✔ flare, a lock chime, and the span's `id` is cleared so
  neither hero targets it again. A stray shot can't knock a solved word loose, and the remaining targets
  stay obvious.
- **Chain ends** behave as free play (capstone / clank, §2.3) — you can overshoot past the goal but never
  off the ladder.
- **After every rung change**, re-apply `matchCase`, the plural rule (§3.4), and `fixArticleBefore(span)`.
- **Wasted shot** = one that does not reduce `|rung − goal|`. That is the score.
- **Hint, late and quiet:** after **3 wasted shots on the same word**, that word's rung strip (§2.4) shows
  an arrow toward its goal. Nothing before that.
- **🔎 Give up** reveals the saying and closes the day with a ❌ result (streak breaks). A daily lock with
  no exit for a stuck player is worse than a recorded loss.
- **Win** = every word locked. The phrase settles to plain text, `gameSfx.end` plays, and the win card shows
  the saying, its `origin`, the result, and the share button.

### 11.7 Daily, storage, share

- **Selection is positional, not seeded.** `dayIndex = daysSince(EPOCH)`, phrase = `ladderPhrases[dayIndex %
  N]`. Since the corpus is append-only (§11.3), yesterday's puzzle never changes, and there's no RNG to keep
  in sync — simpler than Critter Hunt's `mulberry32` path, which needs seeding only because it *generates*.
- `localStorage["punctuators.ladderDaily"]` = `{date, solved, shots, wasted, gaveUp}` (the lock);
  `localStorage["punctuators.ladderStats"]` = `{played, streak, maxStreak, lastSolved, dist}`. Field names
  deliberately mirror `critterhunt.stats` so the stat/streak code reads the same in both games.
- **Share** — spoiler-free, names no word, one group per shifted word, `❌` per wasted shot then `🟩`:

  ```
  🪜 Punctuators — Restore the Phrase 2026-08-22
  Par 3 · 5 shots
  🟩 · ❌🟩 · ❌🟩
  🔥 Streak 4
  ```

  Clipboard API with a textarea fallback, as `copyShare()` in `critter-hunt.html`.
- **Practice records nothing** — no stats, no lock, no share (the rule Critter Hunt's boss mode already uses).

### 11.8 Wiring checklist

| File | Change |
| ---- | ------ |
| `phrases-source.txt` | **new — DRAFTED 2026-08-22**, awaiting the prune — the authored corpus (§11.3) |
| `build-ladders.py` | **`--phrases` BUILT 2026-08-22** — the planner, the checks, the `#~` rewrite (§11.5) |
| `phrasePOJO.js` | **new, generated — BUILT 2026-08-22** — `ladderPhrases`, 108 puzzles / 24 KB (§11.5) |
| `ladderFunc.js` | `wrapPhrase(entry)` — wraps only the `fix` token indices; reuses the free-play span builder |
| `utils/utils.js` | `case "ladderPuzzle":` in `addSpansAndIdsForWordPlay`; **suppress** `protectedArticles` + `spoonerism` for it |
| `punctuators.html` | the `<option value="ladderPuzzle">`; the puzzle card markup that replaces the text box |
| `index.js` | puzzle branch in the `removePuncButton` handler (~:386, which today hard-requires `initialTypedSentence.value`); goal/lock check in the collision block; win card; daily + stats + share; `PRACTICE_ENABLED` |
| `index.css` | `.ladder-locked` ✔ flare, the puzzle card, the win/share card |
| `CLAUDE.md` | the Punctuators row per milestone |

### 11.9 Milestones

**M5 — the corpus + build. BUILT 2026-08-22**, bar the prune. `phrases-source.txt` drafted (108 phrases,
149 braced words), `build-ladders.py --phrases` written with its checks (§11.5), `phrasePOJO.js` generated
(108 puzzles, 24 KB — 97 words broadened, 52 narrowed, 39 puzzles needing both heroes). **Open:** the dev's
sense-prune, reading the `#~ =` line under each phrase, and the `BANNED_RUNGS` cleanup from §11.4. Gate:
every surviving puzzle reads right *in the sense the saying means*. Ships nothing playable.

**M6 — the mode, headless-ish.** The `<option>`, `wrapPhrase`, article/Foon suppression, goal + lock + win
check. Playable against a hardcoded phrase, no daily, no share, no card.

**M7 — the daily.** Selection, the lock, stats/streak, the share string, the practice flag.

**M8 — the feel.** Win card with the saying + origin, the ✔ lock flare, the late hint, give-up, the
How-to-Play modal copy (`updateCharacterModal`, `index.js:458`).

### 11.10 Open questions

- ~~Who writes the 100 phrases?~~ **Settled 2026-08-22** — drafted for the dev to prune (§11.3).
- **Does a solved word lock?** Recommending yes (§11.6). The alternative — stays climbable — is more
  sandbox-consistent but lets a stray shot undo progress with no upside.
- **Label.** `Restore the Phrase` is the recommendation. `The Saying Machine` and `Say It Again` were also
  considered; both hide the mechanic.
- **Does the win card teach the origin?** Costs one authored field per phrase and makes the mode
  incidentally educational about the sayings themselves. Recommending yes, since it's free at authoring time.

---

## 12. Phase 3 — Word Race (the traversal daily) & Deep Dive

**Word Race specced 2026-08-22, not built. Deep Dive (§12.4) tentative. Both assume M2–M4 (free play) have
shipped — they reuse the two heroes and the rung animations whole.**

§11 shifts words inside an authored sentence. This phase throws the sentence away: **the player *is* a
word**, and play is travelling the hierarchy itself. Two modes share one engine — a daily route-finding
race (**committed**, §12.3) and a 60-second specificity sprint (**tentative**, §12.4).

### 12.1 What the shipped data forces

Four measurements taken against the built `ladderPOJO.js` *before* designing anything. Each one closes off
an option that looks obvious on paper.

**It is a forest of 1,003 trees, not a graph.** Every word has at most one parent, so the map is disjoint:
`poodle → hammer` has no route at all, and neither does `tulip → oak` (`tulip > plant`, but
`oak > wood > material` — the §11.4 sense trap, still biting). **Any A-to-B mode must draw both endpoints
from one tree.** The 12 largest hold most of the usable mass:

```
person 4,407 · animal 1,597 · material 1,102 · action 1,016 · quality 962 · knowledge 921
plant 898 · food 873 · location 543 · trait 532 · feeling 449 · clothing 417
```

**Depth caps at 5.** Rungs from the root: 1,002 · 11,017 · 11,180 · 5,523 · 1,613 · **210**. Only **32 of
the 1,003 trees are even five tall**. So "how deep can you get" is a five-move ceiling, and a deep-dive
mode cannot be one long descent — it has to be *repeated* short ones (§12.4).

**84% of words are leaves** (25,708 of 30,545). A random start word is a dead end downward, and 1,002 of
them are dead ends upward. The usable start pool is the **3,835 words with both a parent and a child** —
**1,715** if you want ≥3 children to choose from.

**Branching is too wide to draw.** Median 2 children, but `person` has 805, `fish` 221, `animal` 170,
`bird` 125. A "shoot one of the children shown" UI can only ever show a subset — and if that subset is
guaranteed to contain the route to the target, the UI is telegraphing the answer. **This is why typing is
the primary input here rather than a preference**, and it is the one place this phase departs from
§13.1's "typing isn't what Punctuators does". The shootable field survives as *easy mode* (§12.2).

### 12.2 The shared traversal engine

**Type to summon, shoot to travel.** The word you occupy sits centre screen. Typing is how you *name* a
destination; shooting is still how you *go* there, so the game stays a shooter and both heroes keep a job:

| | |
| --- | --- |
| **Going up** | One parent, always. No typing — General Ization shoots the word floating above you. |
| **Going down** | Type a candidate. If it's valid it spawns as a floating span; **Keen Arrow shoots it** and you travel. |
| **Input box** | The existing sentence box at the top of `punctuators.html` is **repurposed** as the move box rather than hidden (§11.6 hides it). Almost no new UI. |
| **A move** | = one shot. Shots are the score in §12.3, rungs are the score in §12.4. |

**Descendants count, and they jump.** A player at `dog` types `beagle`, which is not one of `dog`'s 33
children — it's a grandchild through `hound`. Rejecting that would be both infuriating and *false*.
So **any true descendant is accepted, and you travel straight to it**, crossing every rung in between.
Measured on the obvious guesses:

| Typed at | Result |
| -------- | ------ |
| `dog` | `dachshund` `bulldog` `retriever` are children · `beagle > hound` `greyhound > hound` `collie > sheepdog` are grandchildren |
| `bird` | `ostrich` `toucan` are children · `robin > thrush` `penguin > seabird` `duck > waterfowl` `canary > finch` `flamingo > wader` are grandchildren |

Without descendant acceptance, seven of those ten sensible answers get rejected. With it, they all work
**and** knowing the deeper word is rewarded — typing `beagle` from `dog` is worth two rungs for one shot.
That is the expert lane, and it costs nothing to build (`isDescendant` is a walk up the parent map).

**Three kinds of "no", and they must sound different.** Lumping them together is what makes a typing game
feel broken:

| Rejection | Example | Feedback |
| --------- | ------- | -------- |
| **Wrong direction** | `mammal` typed at `dog` | "that's *broader* — switch to General" (teaches the mechanic) |
| **Not a kind of it** | `cat` typed at `dog` | the buzz + a clank |
| **Not in my book** | `labrador`, `chihuahua`, `pit bull`, `SUV`, `palm` | a *distinct*, apologetic note — the word is real, the data just lacks it. Never costs the player anything. |

That third row is not hypothetical: five of the thirty guesses probed were absent from the data entirely.
It must never read as "you were wrong".

**The sense trap again — and the one data change this phase wants.** §11.4 killed phrase words whose
ladder follows the wrong sense. Free-typed input drags the same problem in through the front door, because
the player's sense and the data's sense diverge in *both* directions:

```
oak maple birch redwood → wood → material     (typed at `tree`: rejected, and the rejection is a lie)
rose → bush              chicken → meat        boxer → fighter → person       racer → animal
```

A player who types `oak` under `tree` is right, and the game says no. The fix is a build-time addition:
**`build-ladders.py` emits a second, answer-checking-only map** — call it `ladderAlt` — holding each word's
*other* surviving parents from its *other* senses (`oak: tree wood`, `rose: flower bush`,
`chicken: bird meat`). A typed answer is accepted if it reaches the current word through the main map **or**
through an alt edge; the climb itself never uses it, so ladders stay single-sensed and unambiguous.
Generous *and* truthful — the game can even say "yes — and an oak is also a kind of wood."
**This is the one prerequisite in this phase that is data work, not game code**, and it is a prerequisite
for typing, not for §11. See §12.7.

**Easy mode = the decoy field.** Instead of typing, eight words float below you: some true children, some
decoys pulled from a sibling branch (`corgi husky pug mackerel`). Shoot a true one to travel, a decoy to
lose time. Same engine, menu instead of recall — the version that works for a young player, and the one
that keeps the mode playable if typing coverage disappoints.

### 12.3 Word Race — the daily

> **Today: `poodle` ⟶ `salmon`. Par 5.**
> `poodle` →(General) `dog` → `mammal` → `animal` →(Keen, type "fish") `fish` → type "salmon" ✔

Get from the start word to the target word in as few moves as possible. It is WikiRace for taxonomy, and
the route *is* the lesson: you cannot reach `salmon` from `poodle` without noticing that the only thing
they share is being animals, and that how far up you must climb is exactly how unrelated two things are.

- **Par = the single-rung path through the lowest common ancestor**, computed at load from the up-map.
  Across all 6.4M familiar same-tree pairs the par distribution peaks right where a daily wants it —
  1:6.7k · 2:294k · 3:972k · **4:1.63M · 5:1.70M · 6:1.15M** · 7:490k · 8:121k · 9:15k · 10:704.
  Beating par is possible via a descendant jump; par is a target, not a floor.
- **Pair selection is positional, not seeded** — same reasoning as §11.7. A generated-then-frozen
  `racePairs` array in `phrasePOJO.js`'s sibling file, indexed `daysSince(EPOCH) % N`, so yesterday's race
  never changes and there is no RNG to keep in sync.
- **The pool** is words in `2of12.txt` with depth ≥1 and no underscore — **18,863** of them, since a daily
  must never open on `frail` or `annelid`. Both endpoints in the same tree, par 4–6 on weekdays, 7+ on
  Sunday. Sample pairs from the real data: `poodle→salmon` 5 · `taxi→canoe` 5 · `sandal→bonnet` 6 ·
  `owl→shark` 4 · `cottage→villa` 2 · `hammer→shovel` 2.
- **No fail state and no clock** (§11.2's decision, applied again). Moves are the score. A **detour** — a
  move that doesn't reduce distance-to-target — is the share stat, exactly as §11.6's wasted shot.
- **Hints, late and taxonomic.** After 3 detours, reveal the target's **root** ("you're heading for
  something in ANIMAL"). After 3 more, reveal the **lowest common ancestor**. Both are real information
  about the hierarchy, so the hint teaches rather than just rescuing.
- **🔎 Give up** reveals the shortest route and closes the day with ❌ (§11.6).
- **Storage** mirrors §11.7 field-for-field: `punctuators.raceDaily` = `{date, solved, moves, detours,
  gaveUp}`, `punctuators.raceStats` = `{played, streak, maxStreak, lastSolved, dist}`.
- **Share.** Unlike §11.7 this one **names the endpoints** — they're given to every player at the start,
  so they aren't the spoiler. The *route* is the answer, and the squares don't reveal it:

  ```
  🪜 Punctuators — Word Race 2026-08-22
  poodle ⟶ salmon · Par 5
  🟩🟩🟩🟥🟩🟩
  6 moves · 🔥 Streak 4
  ```

### 12.4 Deep Dive — 60 seconds (tentative)

Keen Arrow's solo mode: start at a root (`animal`), type your way down as fast as you can, 60 seconds.

**The depth ceiling shapes it.** With a maximum of five rungs below any root, one dive is over in five
moves — so the score cannot be "how deep did you get". It is **total rungs descended**, and reaching a leaf
**banks the dive and drops you on a fresh root**. The game is how many clean dives you can chain, and a
multi-rung jump (`animal` → type `beagle` = 3 rungs, one shot) is how an expert goes fast. Recall depth
converts directly into score.

**General Ization is probably absent here** — no up, no Switch Character, which is precisely what §14 wants
for Keen's personality: the specificity hero, alone, in the one mode that only goes down. Tentative because
that also throws away half the pair, which may be the wrong trade for a two-hero mode.

Open, if it graduates: whether the 60s is one clock or per-dive; whether a leaf pays a bonus; whether easy
mode (§12.2) is the whole mode for younger players.

### 12.5 Wiring checklist

| File | Change |
| ---- | ------ |
| `build-ladders.py` | `--alt` — emit `ladderAlt`, the answer-checking-only alternate-sense map (§12.2). **Data prerequisite for typing.** |
| `ladderPOJO.js` | gains `ladderAlt` alongside `ladderDown` (size impact unmeasured — see §12.7) |
| `racePOJO.js` | **new, generated** — the frozen daily pair list (§12.3) |
| `ladderRace.js` | **new** — the traversal engine: position, `isDescendant`, `parFor` (LCA), the three rejection classes, the decoy generator |
| `utils/utils.js` | `case "wordRace":`; suppress `protectedArticles` + `spoonerism` as §11.6 does |
| `punctuators.html` | the `<option value="wordRace">`; the race card; the move box repurposing the sentence input |
| `index.js` | race branch in the `removePuncButton` handler; travel on collision; daily + stats + share; the hint ladder |
| `index.css` | the race card, the target banner, the summoned-word span, the win/share card |
| `CLAUDE.md` | the Punctuators row per milestone |

### 12.6 Milestones

**M9 — the engine.** `ladderAlt` in the build, `ladderRace.js`, type-to-summon + shoot-to-travel, the three
rejections, descendant jumps. Playable against a hardcoded pair, no daily, no chrome.

**M10 — the daily.** `racePOJO.js`, selection, lock, stats/streak, share, give-up, the hint ladder.

**M11 — the feel.** Race card, target banner, the travel animation reusing M4's, easy mode's decoy field,
the How-to-Play copy.

**Deep Dive is unscheduled** (§12.4) — it needs M9 only, so it can be prototyped any time after it.

### 12.7 Open questions

- **Is `ladderAlt` worth its bytes?** Unmeasured. It is a prerequisite for typing feeling fair (§12.2), but
  if it lands anywhere near `ladderDown`'s 337 KB the answer changes to a curated accept-list for the few
  hundred words a daily can actually reach. **Measure before committing.**
- **Does the field layout work?** Free play positions spans as a rendered *sentence*. A traversal screen
  wants a parent above / summoned word below arrangement, and how `index.js` lays out and hit-tests spans
  hasn't been read yet. This is the main code-side unknown in the phase, and it applies to §11 too.
- **Typed input vs. the shooter's own keyboard.** The game already reads keys for movement. The move box
  needs focus rules that don't fight it — probably "typing focuses the box, Space/Enter fires".
- **One `<option>` or two?** Word Race and Deep Dive are one engine and two goals. Recommending two
  options, matching §11.2's "its own `<option>`, no branching inside another mode".

---

## 13. Other mechanics for these two

A parking lot. **Nothing here is committed or scheduled**, and none of it needs new data — every idea below
runs on `ladderPOJO.js` as built. ★ marks the three worth building first. *(The traversal ideas that used to
sit here were promoted to §12 on 2026-08-22 and now have a spec; three of the survivors below —
Ladder Golf, Kinship, Category speed round — would reuse §12.2's engine and §12.3's LCA `parFor` outright.)*

### 13.1 In Punctuators

**★ The Bureaucrat's Draft.** The inversion of §11, and the one with a real writing lesson in it. The player
types their own vivid sentence; **General Ization is the villain**, climbing it into corporate mush —
*The cop drove a squad car* → *A person operated a vehicle*. A **specificity meter** falls as it climbs, and
Keen Arrow's job is to sharpen it back down. Teaches "prefer the concrete noun" better than any rule ever
written, and it needs no corpus at all: any sentence works. Cheap after M2–M4 (a meter + a reversed goal).

**★ Ladder Golf — make two words meet.** Two words in the sentence, one hero each, and the goal is to land
them on the same rung in the fewest shots: `poodle` and `salmon` meet at `animal`; `poodle` and `terrier`
meet one rung up at `dog`. Teaches that hierarchies *converge*, and that how far up you must go is exactly
how unrelated two things are. Par = the lowest common ancestor depth, computable at load from the up-map.

**Category speed round.** General names a category (`animal`), and the player shoots every word in the
sentence that is a kind of it, against a clock. `isKindOf(word, cat)` is a walk up the parent map — a
five-line function. The most arcade-native idea here; the shooter already is a timing game.

**Odd one out.** Four words from `ladderDown[parent]` with one intruder from another branch (`corgi, poodle,
pug, salmon`) — shoot the intruder. The sibling sets ship as the raw data (§3.3), so the generator is a
one-liner. Works as a quickfire round inside another mode rather than a mode of its own.

**The Hydra of Generality.** Arcade survival: words in the sentence **drift upward on a timer**, one rung
every few seconds, and if one reaches its capstone it "vanishes into abstraction" and is lost. Keen Arrow
shoots them back down; General is unusable, which makes it the one mode where Switch Character is a mistake.
Pure tension, no corpus, and it makes the ladder legible as a *slope*.

**Redacted sayings.** §11 with the words removed instead of shifted: *A ___ (animal) is a ___ (person)'s
best friend.* The player types the answer rather than shooting it. Worth noting mostly to say it's a
**worse** version of §11 for this game — typing isn't what Punctuators does — but it's the right shape if
the sayings corpus ever wants a non-shooter home.

### 13.2 In Inklings

**★ The Specificity Range.** General and Keen as a **two-NPC bench** in the world, running a call-and-response
drill on the desk that already exists: General says *"name me something broader than `poodle`"*, Keen says
*"name me a kind of `bird`"*, and you **spell the answer at the spelling desk** using letters you've hunted.
The answer check is one lookup in `ladderUp` / `ladderDown` — and because Keen accepts *any* of a parent's
children, the puzzle is generous by construction (`bird` has dozens of right answers). Pays ink. This is the
cheapest way to get the two characters into Inklings: no combat, no new UI pattern, one prompt generator over
a file that already exists.

**Shelving the Nouns wing.** The Wordhoard's Nouns wing is already category-organised
(`data/noun-books.json`), but the ladder gives it a *true* is-a hierarchy: a collected word could be shelved
under its parent, and completing a parent's shelf (`dog`: 33 children) becomes a real collection goal in the
existing librarian-grant pattern (`docs/inklings-collections.md`). Note the risk: 4,837 parents is a lot of
shelves, so this needs a curated subset, not the whole map.

**The Kindred Tree.** A placeable piece of décor (`docs/inklings-placement.md`) that grows a visible branch
per word you've laddered — the taxonomy as a physical thing in the cozy square. Pure cosmetic payoff for the
Range drill above; the Poetrees forest (`docs/inklings-poetry.md`) already establishes tree-as-progress art.

**"A kind of" hunts.** The daily-quest shape Inklings already uses for the Atlas capital letter: today's hunt
is *bring me a kind of `tool`*, and any valid hyponym you can spell counts. Same lookup as the Range, wrapped
in the daily pattern.

### 13.3 Cross-game, cheap

**A Critter Hunt clue atom.** Critter Hunt's clues are real facts, and *"the culprit is a kind of mammal"* is
a real fact the ladder already knows. It slots into `atomsFor` as a new ref type alongside habitat and
Hornbostel–Sachs family, and it deduces exactly like the others. Smallest possible use of this data in a
shipped game.

**Snowclone slot constraints.** Mad Libris' snowclone frames could constrain a slot to *a kind of animal*
rather than any noun (`docs/inklings-snowclones.md`), which is a one-function change (`isKindOf`) and makes
coined sayings land far more often.

**Kinship — a standalone daily.** Guess the mystery word; each guess reports **how far up you must climb
before your guess and the target share a rung**. `salmon` vs `poodle` → 2 (both `animal`); `terrier` vs
`poodle` → 1. It's Contexto with a real hierarchy instead of an embedding, so the feedback is *explainable* —
you can always see why. The strongest pure-daily idea here, and the one least like the rest of the site,
which cuts both ways: it wants its own page, not a Punctuators mode.

---

## 14. Deferred

- **Verbs.** `run → jog / sprint`, `walk → travel`. WordNet keeps these in a separate
  namespace (`vhyper` = broader action, `tropo` = troponyms, "a particular way of doing it") which
  `build_dictionary.py:122/127` already extracts, and `_best_verb_sense` (`build_dictionary.py:253`) already
  disambiguates. Same heroes, same mechanic, a second parent map. Held back so the noun mechanic ships clean.
- **Branching hyponyms.** `dog` has **33** children in the built data (`puppy hound terrier cur
  spaniel pug mutt pooch husky … poodle …`, commonness-ordered). Today Keen Arrow takes the first one.
  Later: repeated shots at the bottom rung **cycle the siblings** — and since §3.3 ships `ladderDown`
  directly, that list is already the raw data, no derivation needed. This is where Keen Arrow gets a real
  personality: the specificity hero who can always get *more* specific.
- **Adjectives.** WordNet has no adjective hierarchy (only `sim`/`ant`), so there is no ladder to climb.
  Out of scope, permanently.
- **A base `docs/punctuators.md`.** The game itself is undocumented; §1 here is a partial stand-in.
