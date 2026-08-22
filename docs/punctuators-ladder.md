# Punctuators — General Ization & Keen Arrow (the Word Ladder)

**Status: PLANNED (2026-08-22). No code written yet.**

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

### 3.2 `build-ladders.py`

Python, not JS, because the sense disambiguation needs NLTK's WordNet — and **`build_dictionary.py`
already solves this exact problem** and its helper can be reused nearly verbatim:

- **`_best_noun_sense(w)`** (`build_dictionary.py:231`) picks the sense a player most likely means, by
  `_SENSE_RANK` (prefer concrete categories: animal/plant/food/artifact over abstract) then SemCor
  `lemma.count()` then WordNet's own sense order. This is what kills `tree → actor` and `dog → sausage`.
- Climb with `synset.hypernyms()[0]` from that one sense only — never the flattened multi-sense list.

Pipeline per word:

1. Candidate words = `data/dictionary.json` entries that are a **noun**, **≥3 letters**, present in
   **`enable1.txt`**, and whose best sense is **not a proper-noun instance**
   (`syn.instance_hypernyms()` — drops Bach, US state codes, …).

   **Why `enable1.txt` and not `2of12.txt`** (measured against the shipped data): enable1 yields
   **34,880** eligible nouns of which **32,302** have a rung, versus 2of12's **22,604 / 21,486** — about
   50% more of a typed sentence lights up. The cost is small and known: 2,181 words in 2of12 are absent
   from enable1 (it's a Scrabble list, so no hyphens/apostrophes/proper nouns), against ~12k gained.
   `2of12.txt` keeps a smaller job in the rung filter below.
2. Walk up from the best sense, keeping a rung only if it **passes the commonness filter** (below).
3. **Stop at a `TOP_STOPS` word** — a hand-written allowlist of familiar category words. This is what makes
   every ladder end somewhere a kid recognizes instead of at `physical_entity`:

   ```
   animal  plant  tree  flower  bird  fish  insect  food  drink  person  body  place
   building  vehicle  machine  tool  clothing  container  furniture  instrument  toy
   game  weapon  material  liquid  color  shape  number  time  feeling  action  idea  thing
   ```

   If no allowlisted top is reachable within the depth cap, use the last rung that passed the filter.
4. Cap total chain length at **6 rungs**.

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
  qualify. Both thresholds get tuned against real output in M1.

Target result: `poodle → dog → mammal → animal`, not `poodle → dog → canine → carnivore → placental →
mammal → vertebrate → chordate → animal → organism → living_thing → whole → object → physical_entity →
entity`.

### 3.3 Shipped format — one map, inverted at load

Coverage is not the constraint; quality is. Real numbers from the shipped data: **34,880** words are both
in `enable1.txt` and a ≥3-letter noun in `dictionary.json`, and **32,302** of those have at least one
hyper/hypo rung. After the §3.2 filters that will shrink, but there is plenty to work with.

Storing full chains per word is wasteful (~800 KB — `poodle,dog,mammal,animal` would be stored again for
`dog` and again for `mammal`). Ship **only the parent map** and rebuild the rest at load:

```js
// ladderPOJO.js — AUTO-GENERATED by build-ladders.py from WordNet. Do not hand-edit.
export const ladderUp = {
  poodle: "dog",
  dog: "mammal",
  mammal: "animal",
  animal: null,      // a TOP_STOPS capstone
  …
};
```

At module load, iterate `ladderUp` once (~22k entries, ~2 ms) to build the inverse index
`ladderDown = {parent: [children…]}`, ordered by the commonness the build script already computed. Then:

- **chain for a word** = walk `ladderUp` to the top, walk `ladderDown[word][0]` once for the rung below.
- **Round-trip is correct by construction** — down is literally the inverse of up, so
  `dog → mammal → dog` can never desync.
- The sibling list `ladderDown[parent]` comes free, which is what Phase 3 (§12) and several of the
  ideas in §11 need.

**A `.js` module at repo root, not `data/*.json`** — a deliberate deviation from the `data/` convention,
for two reasons: (a) every Punctuators data set already ships this way (`AmbigramPOJO.js` 67 KB,
`alphabeticalNeighbors.js` 51 KB, `anagrams.js` 97 KB) and (b) a `fetch` would force the currently-synchronous
`hasLadders`/`wrapLadders`/`removePuncButton` path to go async.

**Size is the open risk, and moving to `enable1.txt` made it worse.** At ~32k eligible words the raw
parent map lands around **400–500 KB** — right at the edge. Two things decide it at M1:

- The §3.2 rung filters remove words that never get a qualifying parent, so the real count will be lower
  than 32k. How much lower is not knowable until the script runs.
- GitHub Pages serves gzipped, and a map of short repeated English words compresses hard — expect the
  actual transfer to be roughly a third of the on-disk size.

**Decide at M1 on real output**, since the game already imports `anagrams.js` (97 KB) on every load and
this would be several times that. If the built file is uncomfortably large, fall back to
`data/ladders.json` fetched on mode select, with an `await` in the button handler — about five lines, and
it keeps the cost off every visitor who never picks this mode.

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
| `build-ladders.py` | **new** — the offline build (§3.2) |
| `ladderPOJO.js` | **new, generated** — `ladderUp` map (§3.3) |
| `ladderFunc.js` | **new** — `wrapLadders(sentence)` + `hasLadders(sentence)`, mirroring `AmbigramFunc.js:643/676` |
| `SpanPlaceholder.js` | `export const protectedLadders = withSpanPlaceholders(wrapLadders);` |
| `utils/utils.js` | `case "ladder":` in `addSpansAndIdsForWordPlay` (~:124); `targetId` in `heroToTheRescue` (:207) |
| `punctuators.html` | the `<option>` (~:71). *(The custom dropdown at :157 enumerates `sel.options` automatically — no extra work.)* |
| `index.js` | import `hasLadders`; guard branch in the `removePuncButton` handler (~:417); `GeneralIzation` + `KeenArrow` classes; instances + `availableHeroArray`; `targetId` in the collision gate (:1664); the ladder branch in the collision chain; SFX (§7); lift `matchCase` (:1843) to module scope |
| `index.css` | `.izo-widen`, `.keen-narrow`, `.ladder-capstone`, the rung strip (§6) |
| `CLAUDE.md` | the Punctuators row (added 2026-08-22, marked PLANNED) flips to **BUILT** per milestone |

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

**M1 — the data.** `build-ladders.py` + generated `ladderPOJO.js`. Iterate `BANNED_RUNGS` /
`TOP_STOPS` / the count threshold against real output until ladders read cleanly for a spot-check list of
~50 common nouns. Ships nothing playable. *Gate: eyeball `poodle`, `dog`, `tree`, `car`, `bird`, `chair`,
`pizza`, `river`, `shoe`, `teacher`.*

**M2 — the mode, headless.** `ladderFunc.js` (`wrapLadders` / `hasLadders`), `SpanPlaceholder` +
`utils.js` wiring, the `<option>`, the guard message. Words visibly mark up in the sentence. Nothing shoots
them yet.

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
- **Phase 3 — branching hyponyms.** `dog` has 18 children (poodle, pug, corgi, …). Today Keen Arrow takes
  the single canonical one. Later: repeated shots at the bottom rung **cycle the siblings**, which
  `ladderDown[parent]` (§3.3) already provides for free. This is where Keen Arrow gets a real personality —
  the specificity hero who can always get *more* specific.
- **Adjectives.** WordNet has no adjective hierarchy (only `sim`/`ant`), so there is no ladder to climb.
  Out of scope, permanently.
- **A base `docs/punctuators.md`.** The game itself is undocumented; §1 here is a partial stand-in.
