# Punctuators — General Ization & Keen Arrow (the Word Ladder)

**Status: M1 (the data) BUILT 2026-08-22 — `build-ladders.py` + `ladderPOJO.js`. M2–M4 planned, no game code yet.**

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
- The sibling list Phase 3 (§12) and several §11 ideas need is now the **shipped** form, not the derived one.
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

---

## 10. Open question

**The dropdown label.** `General & Specific` is the recommendation (§2.1). Alternatives considered and
why they lost: `Word Ladder` (collides with the classic letter-swap puzzle, which is nearly what Betar
does), `Hypernyms` (accurate, but the sibling modes all use plain-language labels), `Zoom` (evocative but
says nothing about words). Easy to change any time before M4 — it's one `<option>` and one modal heading.

---

## 11. Other mechanics to explore

§§1–10 describe **free play** — climb any word, no goal, no win state (which is how every Punctuators
wordplay mode works today, see §1). That is the right shape for v1, but the ladder is unusual among the
modes in that it has an obvious **puzzle** shape too, and this section is the parking lot for that.
Nothing here is committed or scheduled.

### 11.1 Restore the famous phrase (dev's idea, 2026-08-22)

Show a well-known phrase with one or more words already **shifted along the ladder**, and the player has
to shoot it back:

> **A canine is a person's best friend.**
> → Keen Arrow on `canine` → `dog` · Keen Arrow on `person` → `man`
> → **A dog is a man's best friend.** ✔

Why this one is worth taking seriously:

- **It gives Punctuators its first wordplay mode with a real win state.** Every mode today is
  open-ended sandbox; here there is a correct answer, so the "triumphant trumpets" ending
  (`gameSfx.end`, `index.js:548`) finally applies outside the punctuation game.
- **It teaches the direction, not just the relation.** Free play lets you wander; this forces the player
  to notice that `canine` is *too broad* and needs narrowing — the actual skill.
- **It's a natural daily puzzle.** One phrase a day, shareable, in the shape of the daily games elsewhere
  in this repo.
- **It reuses the whole v1 engine.** Same span, same `data-ladder`, same two heroes. What's new is a
  phrase corpus, a target state to compare against, and a win check.

Open questions if it's ever picked up: where the phrases come from (hand-written list? the Inklings
snowclone/cliché frames in `data/excla-scenarios.json` and the Cliché Codex are adjacent prior art);
whether the scrambling is authored per phrase or generated by walking the ladder N steps; how many words
get shifted; whether a wrong rung is punished or just... not right yet.

### 11.2 Unfilled

Deliberately left open — the dev wants room to invent more here. Some directions the data already
supports for free, noted so they aren't re-derived later:

- **Odd one out.** Three words from one branch and one from another (`corgi, poodle, pug, salmon`) —
  shoot the intruder. `ladderDown[parent]` (§3.3) hands you the sibling sets.
- **Meet in the middle.** Two words, one ladder each; climb both until they land on the same rung
  (`poodle` and `salmon` meet at `animal`). Teaches that hierarchies converge.
- **Category speed round.** General Ization names a category, the player shoots words in the sentence
  that belong to it.

---

## 12. Deferred

- **Phase 2 — verbs.** `run → jog / sprint`, `walk → travel`. WordNet keeps these in a separate
  namespace (`vhyper` = broader action, `tropo` = troponyms, "a particular way of doing it") which
  `build_dictionary.py:122/127` already extracts, and `_best_verb_sense` (`build_dictionary.py:253`) already
  disambiguates. Same heroes, same mechanic, a second parent map. Held back so the noun mechanic ships clean.
- **Phase 3 — branching hyponyms.** `dog` has **33** children in the built data (`puppy hound terrier cur
  spaniel pug mutt pooch husky … poodle …`, commonness-ordered). Today Keen Arrow takes the first one.
  Later: repeated shots at the bottom rung **cycle the siblings** — and since §3.3 ships `ladderDown`
  directly, that list is already the raw data, no derivation needed. This is where Keen Arrow gets a real
  personality: the specificity hero who can always get *more* specific.
- **Adjectives.** WordNet has no adjective hierarchy (only `sim`/`ant`), so there is no ladder to climb.
  Out of scope, permanently.
- **A base `docs/punctuators.md`.** The game itself is undocumented; §1 here is a partial stand-in.
