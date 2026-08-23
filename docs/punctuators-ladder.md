# Punctuators — General Ization & Keen Arrow (the Word Ladder)

**Status: free play is PLAYABLE. M1 (the data) BUILT 2026-08-22 — `build-ladders.py` + `ladderPOJO.js`.
**M2 (the mode) + M3 (the heroes) BUILT 2026-08-23** — `ladderFunc.js`, the `General & Specific` option,
both heroes sharing one span via `targetId`, up/down movement, capstone/clank, and §2.4's rung strip
(pulled forward from M4). **M12's fill landed with them**, so the Tree of Kinds fills as you play.
**§2.5's shelf fan BUILT 2026-08-23** — Keen Arrow draws the word's narrower kinds as a row of shootable
words and you pick one by walking under it, so the descent stops reading as random. He **goes down or
not at all**: the leaf sidestep the fan replaced was removed the same day (§13.7).
**What's left of M4** is §6's two animations, §7's SFX, final art and the modal copy.
Phase 2 — Restore the Phrase (§11) specced 2026-08-22, four decisions locked; **its M5 data layer BUILT
the same day** — `phrases-source.txt` (108 drafted sayings, awaiting the dev's sense-prune),
`build-ladders.py --phrases`, and the generated `phrasePOJO.js` (108 puzzles). M6–M8 are the game code.
Phase 3 — Word Race (§12) specced 2026-08-22, nothing built; its Deep Dive companion (§12.4) is tentative.
Phase 4 — the Tree of Kinds progress map (§13) specced 2026-08-22, **M12 BUILT 2026-08-23** across two
sessions (`ladderMap.js` + the overlay, then the fill). M13 (shelf counters + milestones) is next.**

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
kid-language and echoes General Ization's name. **Confirmed and shipped 2026-08-23** (§10 closed).

### 2.2 The span

One span shape serves both heroes:

```html
<span id="Ization Ladder" class="word-ladder"
      data-ladder="poodle,dog,mammal,animal" data-rung="1"
      data-ladder-word="dog" data-ladder-orig="Dogs" data-ladder-plural="1">Dogs</span>
```

- `data-ladder` — the full chain, **most specific → most general**, left to right.
- `data-rung` — the index currently shown. Set at wrap time to the position of the player's own word.
- The player's word is normally **mid-chain**, so both heroes have somewhere to go from the first shot.
  A chain always tries to include **one rung below** the typed word for exactly this reason (§3.3).
- **`data-ladder-word` is the authoritative state, added in M2** — the lowercase rung actually shown.
  Sibling cycling (§13.7) means the path down is decided shot by shot, so `data-ladder`/`data-rung`
  are *recomputed on every landing* rather than walked as a fixed strip; frozen at wrap time they would
  start lying the moment Keen Arrow steps sideways. `data-ladder-orig` keeps the typed token (case and
  plural are re-applied from it, never from the previous rung, so errors can't accumulate).

### 2.3 Rules on a hit

| | |
| --- | --- |
| **General Ization hits** | `rung + 1` (right, broader) |
| **Keen Arrow hits** | Opens the word's shelf (§2.5) rather than moving it. The word moves to `rung − 1` when you shoot one of the fanned words. **Down or not at all** — he never steps sideways; see §13.7. |
| **Repeatable** | A word never locks. Climb up, climb back down, climb up again. |
| **At the top rung** | No move. **Capstone flourish**: the word flares, a `★` beat plays, the ladder holds. |
| **At the bottom rung** | Same, mirrored (a "clank" — the arrow can't cut finer). Since §2.5 this means exactly one thing: the word has no narrower kinds. To reach its neighbours, broaden to the parent with General and narrow again — the parent's row *is* the sibling list. |
| **Case** | The typed word's capitalization is re-applied to each rung (rungs are stored lowercase). **Not** Betar's `matchCase`, as planned: that copies capitals *position by position*, which only works because an alphabet neighbour is the same length as its word. `applyLadderCase` copies the **shape** instead — ALL CAPS stays all caps, Leading cap stays leading. |
| **Plurals** | If the typed word was a plural (`dogs`), the chain is built from the lemma and each rung is re-pluralized. v1 uses a naive `+s`/`+es` rule and only for regular plurals; irregulars (`mice`) are wrapped at the lemma and displayed as-is. See §3.4. |

### 2.4 Rung indicator — BUILT (pulled forward from M4)

On first hit, a small rung strip appears under the word — `▲▲●▼` — showing where you are and how far
the ladder runs in each direction (`▲` per rung above · `●` here · `▼` per level of narrower kinds
below). This is the piece that makes it *read* as a hierarchy rather than as random word-swapping,
which is the whole educational payload, so it shipped with M3 rather than waiting for polish.

It is `content: attr(data-rung-strip)` on an **absolutely positioned `::after`**, which is what keeps it
out of the line box: the sentence never reflows, and the span's hit rectangle — the thing the projectile
is tested against — stays the word itself. `.word-ladder` is `inline-block` for the same reason the
strip needs a positioned parent, and because an inline box cannot be scaled, so the move flare would
otherwise be a silent no-op.

### 2.5 The shelf fan — BUILT 2026-08-23

**The problem.** Keen Arrow's descent was fully deterministic — first unvisited child, then a sideways
sweep of unvisited siblings (§13.7) — but it *played* as random word-swapping, which is the one thing
§2.4 was supposed to prevent. Three reasons, measured against the built corpus:

- **The sideways step was invisible.** At a leaf, `bloodhound → beagle` is not a narrowing at all, it is
  a lateral hop along a shelf. The rung strip is *identical* for two siblings (`▲▲▲●` both), and
  `.ladder-move` is the same flare for up, down and across. The one move that isn't "more specific"
  looked exactly like the ones that are. **The sidestep has since been removed outright** (§13.7) —
  drawing the row made it clear the move was buying nothing that the parent's own row doesn't.
- **Unvisited-first makes replays diverge.** Shooting `dog` gives `puppy` today and `terrier` tomorrow.
  That is deliberate and load-bearing, but from the player's chair it is an unexplained change.
- **No agency.** Which of `dog`'s 33 children you get is chosen *for* you; the only input is "shoot".

**The fix: make the shelf visible and let the player pick by aiming.** Keen's hit fans the word's
narrower kinds out as a row of shootable words beneath it, joined by branch lines. You walk under the
one you want and shoot it.

```
       The  dog  chased the cat
            ╱╱│╲╲
 hound terrier spaniel corgi pointer
   ▲      ▲      ▲      ▲      ▲
        · · · +25 more kinds · · ·
                 🏹
```

**Why a horizontal row, and not a tree or an arc.** Projectiles fly **straight up with no aiming**
(`velocity: {x: 0, y: -10}`, `index.js:2438`); the hero walks left/right and fires vertically. So a
word's **x-range is its selectability** — a horizontal row is the only layout where "pick that one" is
expressible in the verbs the game already has. A vertical stack or an arc cannot be aimed at: you hit
whatever is lowest, which is the current problem with extra steps.

#### 2.5.1 What goes in the row

Shelf widths are wildly uneven, and the words people actually type sit in the bad tail:

| | |
| --- | --- |
| Median shelf | **2 children**; 71% of parents have ≤4, 80% ≤6, 91% ≤12 |
| The tail | 65 parents hold >50. `cat` 17 · `car` 24 · `dog` 33 · `flower` 63 · `tree` 107 · `bird` 125 · `fish` 221 · `food` 239 · `person` 805 |
| Branch vs bud | Only **13%** of children (3,835 of 29,543) are themselves parents. Keeping just those: `dog` 33→8 · `tree` 107→5 · `fish` 221→8 · `flower` 63→7 · `tool` 67→6 · `car` 24→2 |

The branch/bud cut is the one that makes wide shelves drawable, but it **cannot be the whole rule**:
**69.8% of parents (3,378) have zero branch-children**, including 134 of the 719 shelves wider than 8.
So the row is filled in tiers:

1. **Shelf fits the row** (the common case, ~80% of parents) — show every child. No filtering, no fog.
2. **Shelf overflows** — take **branch-children first**, in the shipped familiarity order, unvisited
   first among equals (`nextUnvisitedRung`'s existing rule, generalised to pick N instead of 1).
3. **Top up with buds** if the branches don't fill the row — which is the 134-shelf case above, and
   also every shelf whose branch list is short.
4. **Fog the remainder** as `+N more kinds` — a label, not a target. This is §13.5's fog rule reused:
   you always see how much shelf is left, but leaf names are never printed where they could be read as
   an answer.

**Reachability — the rotating bud slot.** Rules 2–4 alone would make 25 of `dog`'s 33 children
permanently unreachable in free play, which re-breaks exactly what §13.7 fixed. So **the last slot in
the row is always a bud**, drawn unvisited-first. Over repeated plays the whole shelf comes through,
and replaying keeps the value §13.7 gave it. (Branch lists exceed the row width only 56 times in the
whole corpus — `person`:176, `action`:79, `quality`:77 — so branch rotation is the rare path, but it
uses the same unvisited-first draw.)

**At a leaf there is no row — that is a clank.** `shelfFor` returns children or nothing; it never falls
back to siblings, because **Keen Arrow goes down or not at all** (§2.3). A sibling row would make one
hero's one action mean two different things, narrow or shuffle sideways, and once drawn the two are
indistinguishable. The sideways move is still reachable and now reads as what it is: broaden to the
parent with General, then narrow again, where the parent's row *is* the sibling list. See §13.7 for why
this does not re-open the unfillable-map problem that sibling cycling was built to solve.

**Row capacity is measured, not constant.** At the desktop `#output` size (300%, ~48px) a child at
`0.45em` averages ~85px plus gap, so ~11 fit across a 1200px viewport; on a phone (`#output` 30px)
it's ~5. Compute the fit from the container width at draw time — as `sbLayout` does in Inklings —
**capped at 7 and floored at 3**, because a row wider than 7 stops reading as a set at a glance and
one narrower than 3 isn't a choice.

#### 2.5.2 Interaction rules

| | |
| --- | --- |
| **Opens** | Keen Arrow hits a word that has narrower kinds. A leaf has none, so it clanks instead. |
| **The word is behind the fan** | The row hangs below the word, i.e. *in the flight path*. While the fan is open the children are what you can hit; the parent is shielded. This falls out of the geometry rather than needing a rule. |
| **Shots through the gaps** | Pass between children and carry on upward to whatever word is above — which may be the parent (re-fans, harmless) or a neighbouring sentence word. Collision is per-span rect, so this is free and correct. |
| **Closes** | A child is shot (the word becomes that child and the fan re-opens on the new rung, if it has one); or Switch Character; or the round ends. |
| **General Ization** | Broadening has no shelf to show, so **he never fans**. Switching to him closes an open fan — a row of narrower kinds is noise when the goal is to zoom out. |
| **Landing** | Shooting a child is a landing: `ladderMapVisit`, rung strip, hero-colour recolour, and §6's Keen animation, exactly as `climbLadder` does today. |
| **Reduced motion** | The fan appears without the branch-line draw-on, per `prefers-reduced-motion`, same as `animateAnagramSwirl`. |

#### 2.5.3 Three footguns this will hit

1. **`nodeArr` is filled once and the observer then disconnects** (`utils/utils.js:170`). Spans created
   after the sentence renders — which is every fan child — **never become targets**. They must be
   pushed into `nodeArr` explicitly. It is an exported array, so `nodeArr.push()` from `index.js`
   works; the binding is read-only, the array is not.
2. **They must be spliced back out when the fan closes.** A removed node's
   `getBoundingClientRect()` returns all zeros, so a stale entry becomes a phantom hit-box pinned to
   the top-left corner that swallows shots for the rest of the round.
3. **The fan must not join the line box.** Same discipline as §2.4's rung strip: absolutely positioned
   off the `.word-ladder` span, so the sentence never reflows and the parent's hit rectangle stays the
   word itself. A fan that reflows the sentence moves every *other* word's target box on the first hit.

Route the children through the collision branch that already exists rather than a second one: give
them `id = LADDER_ID` so `punctuationSymbol.id === (player.targetId ?? player.symbol)` matches, and
branch inside on a `data-ladder-child` attribute — `climbLadder` for the word, a new `pickRung` for a
child.

#### 2.5.4 Scope

**Easy mode only.** The typed-answer hard mode discussed alongside this is **not** in scope here: it
is the same input model as §12.2's Word Race (*type to summon, shoot to travel*, any true descendant
accepted), and building it means writing that traversal engine early. Deferred deliberately so the fan
ships as feel work rather than as a new engine. The two are compatible by design — type-to-filter over
an open fan is the natural bridge when M9 arrives.

#### 2.5.5 The three open questions, as settled while building

- **The fog count stays a label.** The rotating bud slot already guarantees every child is reachable
  by replaying, so a shootable `+25` would be a second way to do the same thing — and it would put a
  control that isn't a word into a row whose whole point is that everything in it is a word.
- **The fan re-draws on each landing.** `pickRung` closes the row, moves the word, and immediately
  opens the new word's shelf, so a run of shots reads as one continuous descent.
- **Branch and bud do look different**, but barely: a branch carries a small `▾`. The rung strip says
  the same thing in full once you land, so this only has to survive a glance.

#### 2.5.6 Two things the build found that the spec did not

1. **A detached node's rect reads as a hit box in the top-left corner**, and §2.5.3's splice is not
   enough on its own, because the removal and the collision walk can interleave. `animate()` now skips
   any `nodeArr` entry failing `isConnected` before hit-testing it. That guard protects every mode,
   not just this one — it was simply unreachable until the fan started adding and removing targets
   mid-round.
2. **One ladder action per shot has to be latched at the collision loop, not inside the handlers.**
   `pickRung` closes the row and opens the next one *inside the same call*, and `forEach` walks to the
   length it captured at the start — so the replacement children land on indices it is still going to
   visit, in that same frame. The handler-level guard stopped the second *pick*, but the shot still
   fell through to `allPunctuationHit.add()` and spliced itself out of `projectiles` twice, taking an
   unrelated shot with it. The latch (`projectile.ladderDone`) now sits at the top of the walk, and it
   replaces the old per-span `ladderHits` Set, which only ever covered the repeat-frame case.

Also worth recording: **`nextUnvisitedRung` is gone.** Its unvisited-first rule was not dropped — it
moved into `shelfFor`, where it chooses the row's *contents* instead of choosing the player's move.
That is the whole change in one sentence.

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
- The sibling list branching hyponyms (§15) and several §12–14 ideas need is now the **shipped** form, not
  the derived one.
- Nothing is lost by shipping down: a capstone with children is a key, and a capstone *without* children had
  no ladder in either direction and was dropped at build time.
- Both parents and the children inside each string are ordered **most-common-first**, so Keen Arrow's first
  pick down is the word a player would actually think of. Costs zero bytes.

**A `.js` module at repo root, not `data/*.json`** — a deliberate deviation from the `data/` convention,
because every Punctuators data set already ships this way (`AmbigramPOJO.js` 67 KB,
`alphabeticalNeighbors.js` 51 KB, `anagrams.js` 97 KB).

**Size — 337 KB raw / ~145 KB over the wire**, against the 400–500 KB the plan feared. That is ~3.5×
`anagrams.js`, which the game already imports on every load.

**Loaded lazily, not statically — reversed at M2 (2026-08-23).** The static-import decision existed only
to keep `hasLadders`/`wrapLadders` synchronous, but M12 had already made the point moot from the other
side: `ladderMap.js` defers the same file to a dynamic `import()` on first open, so a static import here
would have made *every* visitor to `punctuators.html` pay 337 KB whether or not they ever picked the mode.
`loadLadders()` now does the `import()` and the one `removePuncButton` handler `await`s it before starting
a ladder round. Both callers share one cached module instance, so the file is fetched at most once.
The three wrapper functions **stayed synchronous** — the `await` moved out to the click handler, which is
the only place that ever needed it.

### 3.4 Inflections

**As built, `data/inflections.json` is not used.** The plan had the wrapper consult it (28,953 entries,
`dogs → dog`, `mice → mouse`) so a typed plural still lights up — but it is a `fetch`, and the whole point
of §3.3's lazy-import decision is that the mode carries exactly one data file. Two rules replace it,
both synchronous and both in `ladderFunc.js`: `singularize` (`-ies → y`, `-sses/-shes/-ches/-xes/-zes`,
bare `-s`) to find the lemma, and `pluralizeRung` to put each new rung back into the plural.

Irregulars (`mice`, `geese`, `children`) simply don't match, so those words never light up. That is the
right failure: **a word that doesn't light is invisible, a word displayed wrong is a lie** — the same
trade §3.2 makes for sense coherence. Revisit only if a real sentence feels dead because of it.

---

## 4. The engine change: one span, two heroes — BUILT 2026-08-23

**This is the only structural change to existing code**, and it is small. It went in exactly as specced:
four one-line edits, `ladderDirection` the only addition, and all 23 existing heroes behave identically.

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
     constructor() { super(…, "General Ization (Broader)", …); this.targetId = LADDER_ID;
                     this.ladderDirection = "up"; }
   }
   class KeenArrow extends Hero {
     constructor() { super(…, "Keen Arrow (Narrower)", …); this.targetId = LADDER_ID;
                     this.ladderDirection = "down"; }
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
| `ladderFunc.js` | **new — BUILT** — `loadLadders()` (the lazy `import()`, §3.3), `hasLadders`/`wrapLadders`, the rung lookups (`ladderParentOf`/`ladderChildrenOf`/`ladderChainFor`/`ladderDepthBelow`/`ladderRungStrip`), case/plural (`applyLadderCase`/`renderRung`, §3.4), and **`shelfFor` (§2.5.1)** — the tiered row, which is where the unvisited-first rule now lives. **Maps and Sets only** — `constructor` and `prototype` are real words in the corpus, so a plain-object lookup would invent edges (same trap as `ladderMap.js`) |
| `SpanPlaceholder.js` | **BUILT** — `export const protectedLadders = withSpanPlaceholders(wrapLadders);` |
| `utils/utils.js` | **BUILT** — `case "ladder":` in `addSpansAndIdsForWordPlay`; `targetId` in `heroToTheRescue` |
| `punctuators.html` | **BUILT** — the `<option>`. *(The custom dropdown enumerates `sel.options` automatically — no extra work, as predicted.)* |
| `index.js` | **BUILT** — `await loadLadders()` + the guard in the `removePuncButton` handler (now `async`); `GeneralIzation` + `KeenArrow`; instances adjacent in `availableHeroArray`; `targetId` in the `Hero` constructor and the collision gate; `climbLadder`/`landOnRung`/`flashLadder` and the ladder branch in the collision chain. **§2.5's fan BUILT** — `openShelfFan`/`closeShelfFan`/`pickRung`/`drawShelfFanLines`/`shelfFanWidth`, the `data-ladder-child` split in the ladder branch, the `nodeArr` push/splice, and two guards at the top of the collision walk (`isConnected`, `projectile.ladderDone`); closed on hero switch, new sentence and resize. **Still to do (M4):** §7's SFX — both heroes borrow existing mp3s for now |
| `index.css` | **BUILT** — `.word-ladder`, the `data-rung-strip` `::after`, `.ladder-move`, `.ladder-capstone`, and §2.5's `.shelf-fan` / `.shelf-fan-row` / `.shelf-child` / `.shelf-fan-caption` / `.shelf-fan-lines` (with the reduced-motion case that clears `stroke-dashoffset` rather than only killing the animation, or the lines would stay invisible). §6's `.izo-widen` / `.keen-narrow` are M4; `.ladder-move` is the one placeholder flare standing in for all of it |
| `CLAUDE.md` | the Punctuators row flips to **BUILT** per milestone — done for M1–M3 + M12, still to do for M4 |

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

With §2.5 the two halves of that sentence split across two moments, which is an improvement rather than
a complication: **the branch lines draw outward** from the word when the fan opens ("here are the many"),
and **the lens snap plays on the child you shoot** ("you picked one"). The word then takes the child's
place and the fan re-opens on the new rung. Honour `prefers-reduced-motion` by showing the row without
the line draw-on.

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
| `_keenFan` | §2.5's fan opening — a quick fanned-out flutter of ticks, one per child drawn, so the row's *size* is audible before you read it |
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

**M2 — the mode, headless. BUILT 2026-08-23.** `ladderFunc.js`, the `SpanPlaceholder` + `utils.js`
wiring, the `<option>`, the guard message. `ladderDown` is inverted to `ladderUp` once at load, as
planned. Two things came out differently: the corpus is **lazy-loaded** (§3.3, reversed) and
**`data/inflections.json` is not used** (§3.4, replaced by two regular-plural rules).

**M3 — the heroes. BUILT 2026-08-23.** The `targetId` split (§4) went in exactly as specced — four
one-line changes, all 23 existing heroes untouched. Both hero classes, adjacent in `availableHeroArray`,
the collision branch, up/down movement, capstone/clank. Playable with placeholder art (`Generic.png` /
`Arrow.png`, §8) and borrowed SFX. **§2.4's rung strip came along**, because without it the mode reads as
random word-swapping. **§13.7's sibling cycling came along too**, and was then **removed the same day**
once §2.5's fan made it redundant — see §13.7.

**M4 — the feel. §2.5's shelf fan BUILT 2026-08-23; the rest outstanding.** The fan was added to this
milestone because playing M3 showed polish alone does not fix what it was for — Keen's descent still
read as random, and the sideways sibling step was invisible. Being a mechanic rather than polish, it
was the bulk of M4's work, and it is in: `shelfFor` in `ladderFunc.js`, the fan block in `index.js`
(`openShelfFan`/`closeShelfFan`/`pickRung`/`landOnRung`), `.shelf-fan` in `index.css`. The typed-answer
hard mode stayed out, in §12 (see §2.5.4).

**Still outstanding in M4:** §6's two animations (the fan currently reuses `.ladder-move`'s placeholder
pulse), §7's five SFX including the new `_keenFan`, final art, and the How-to-Play / character modal
copy (`updateCharacterModal`, already has a per-mode template pattern to follow) — which now has to
explain the fan, since shooting a word no longer moves it.

**What playing it shows, now that the fan is in (measured on the built corpus).** A hit on `dog` opens
`hound▾ terrier▾ cur▾ spaniel▾ corgi▾ pointer▾ puppy · kinds of dog · +26 more` — six branches and the
one rotating bud slot. Play it again with those lit and the row re-draws as
`watchdog▾ sheepdog▾ hound▾ terrier▾ cur▾ spaniel▾ pug`, and again for `mutt`: the shelf comes through a
few words at a time, so **replaying is still what fills a wide shelf**, exactly as §13.7 intended — the
difference is that you can now see it happening and choose within it.

A leaf clanks, because Keen Arrow goes **down or not at all** (§13.7). The round trip is the point:
`bloodhound` clanks, General broadens it to `hound`, and `hound`'s row is
`wolfhound▾ greyhound▾ bloodhound beagle basset harrier foxhound · +7 more` — the siblings, reached by
a route that shows why they are siblings.

**The sense trap reaches free play too, mildly.** `The poodle chased a cat` lights `chased`, which is a
real WordNet noun (`chased → victim → person`, "the chased"). §11.4 already catalogues this and rules it
harmless here and fatal in the puzzle mode — worth remembering when M6 starts, not worth fixing now.

**M5–M8 — Restore the Phrase**, the puzzle mode. Specced separately in §11.9; it builds on M4, so nothing
there starts before free play is playable.

---

## 10. Open question — CLOSED 2026-08-23

**The dropdown label** is **`General & Specific`**, confirmed and shipped with M2. Alternatives and why
they lost: `Word Ladder` (collides with the classic letter-swap puzzle, which is nearly what Betar does),
`Hypernyms` (accurate, but the sibling modes all use plain-language labels), `Zoom` (evocative but says
nothing about words), `Kind of a Kind`, `Broader & Narrower`.

The **name tags** follow the same plain-language rule: `General Ization (Broader)` and
`Keen Arrow (Narrower)`, not §4's illustrative `(Hypernym)`/`(Hyponym)` — the tag is player-facing text
sitting above the controls, and it should read the way the dropdown does.

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
  fixed data, Keen Arrow never has to choose among `dog`'s 33 children (contrast §15, branching hyponyms).
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

**It is a forest of 1,002 trees, not a graph.** Every word has at most one parent, so the map is disjoint:
`poodle → hammer` has no route at all, and neither does `tulip → oak` (`tulip > plant`, but
`oak > wood > material` — the §11.4 sense trap, still biting). **Any A-to-B mode must draw both endpoints
from one tree.** The 12 largest hold most of the usable mass:

```
person 4,407 · animal 1,597 · material 1,102 · action 1,016 · quality 962 · knowledge 921
plant 898 · food 873 · location 543 · trait 532 · feeling 449 · clothing 417
```

**Depth caps at 5.** Rungs from the root: 1,002 · 11,017 · 11,180 · 5,523 · 1,613 · **210**. Only **32 of
the 1,002 trees are even five tall**. So "how deep can you get" is a five-move ceiling, and a deep-dive
mode cannot be one long descent — it has to be *repeated* short ones (§12.4).

**84% of words are leaves** (25,708 of 30,545). A random start word is a dead end downward, and 1,002 of
them are dead ends upward. The usable start pool is the **3,835 words with both a parent and a child** —
**1,715** if you want ≥3 children to choose from.

**Branching is too wide to draw.** Median 2 children, but `person` has 805, `fish` 221, `animal` 170,
`bird` 125. A "shoot one of the children shown" UI can only ever show a subset — and if that subset is
guaranteed to contain the route to the target, the UI is telegraphing the answer. **This is why typing is
the primary input here rather than a preference**, and it is the one place this phase departs from
§14.1's "typing isn't what Punctuators does". The shootable field survives as *easy mode* (§12.2).

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

**General Ization is probably absent here** — no up, no Switch Character, which is precisely what §15 wants
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

## 13. Phase 4 — The Tree of Kinds (the progress map)

**Specced 2026-08-22, not built.** Unlike §§11–12 this is not a mode — it is a **viewer** that sits over
whichever mode you're playing, and it is the first thing in this family that spans all of them.

### 13.1 What it is

One panel over the game showing **the whole hierarchy at once, drawn as nested circles**: 1,002 trees in a
field, each holding its children, five levels deep. Every word you have ever landed on — in free play, in
Restore the Phrase, in Word Race — is **lit**. Everything else is drawn but dark. You pan and zoom it like a
map, and zooming out far enough turns your progress into a picture.

It is the Inklings Wordhoard's job (a place where collected words accumulate and *look* like something)
done against a structure the Wordhoard doesn't have: a true is-a hierarchy. Filling it in is the reward
loop free play has never had — §1 notes wordplay modes have no win state, and this doesn't add one; it adds
something better suited to a sandbox, which is **an accumulating record**.

### 13.2 The three decisions (locked 2026-08-22)

| Fork | Decision |
| ---- | -------- |
| **Fog** | **Skeleton visible, fringe fogged.** The 4,837 **internal** words (anything with children) are always drawn *and named* — they are the map's coastline. The 25,708 **leaves** are drawn as anonymous buds with a count on their cluster (`dog +33`) until you land on one. You can always see how much is left and where, and you can never read an answer off it. |
| **Completion** | **Per-parent shelves.** Each parent is a set: `dog 7/33`, `bird 12/125`. Mirrors the Nouns-wing shelf pattern (`docs/inklings-collections.md`) and gives ~4,800 small goals instead of one impossible one. |
| **Home** | **An overlay in `punctuators.html`**, openable from every ladder mode, filled by all of them, one shared `localStorage` record. The map is the spine that ties §§2–12 together rather than a side feature. |

### 13.3 What the shipped data forces

Measured against the built `ladderPOJO.js` before designing anything, the same discipline as §12.1.

| Measurement | Consequence |
| ----------- | ----------- |
| **It is a forest, not a graph** — 1,002 trees, one parent per word | **No edge crossings are possible.** A containment layout is exact rather than an approximation, and there is no force simulation, no relayout, no settling. *(Re-verified at build time with a `Map`: exactly 0 words have two parents.)* |
| **`constructor` and `prototype` are real words in the corpus** (children of `person` and `concept`) | **Nothing keyed by word may be a plain object.** A `{}` lookup reports a parent for words that have none, which silently invents a multi-parent edge and corrupts every subtree size downstream — it is what made the first measurement pass claim a multi-parent collision that does not exist. `ladderMap.js` uses `Map`/`Set` throughout; **`ladderFunc.js` and `ladderRace.js` will need the same care.** |
| **Depth caps at 5** (1,002 · 11,017 · 11,180 · 5,523 · 1,613 · 210) | Nesting is **at most 5 deep**. No recursion guard, no infinite drill-down, and a fixed, tiny LOD ladder. |
| **4,837 internal nodes vs 25,708 leaves** (84% leaves) | The internal/leaf split *is* the fog rule (§13.2) — it isn't an invented threshold, it's the shape of the data. The named skeleton is 4,837 labels, of which **4,809 are in `2of12.txt`**, so the coastline is almost entirely familiar words. |
| **89% of shelves hold ≤10 children**; median 2, mean 6.1; only **65** hold >50 | Shelf completion is genuinely reachable. Distribution: 1,449 shelves of 2–3 · 595 of 4–5 · 641 of 6–10 · 302 of 11–20 · 162 of 21–50 · 65 of 51+. |
| **The widest ring is `person`'s 1,529 nodes at depth 2** (`animal` 728, `material` 596, `plant` 474) | A layout that gives each node **equal angle** dies here — 0.24° per node. Area must follow **subtree size**, which containment gives for free (§13.4). |
| **19,861 of 30,545 words are in `2of12.txt`** | ~10,700 nodes are obscure enough that a player will realistically never type them (`frail`, `annelid`, and the rest of §11.5's problem children). **Shelf milestones must key off fractions, not perfection** — a 100%-only reward would be unwinnable on exactly the shelves that are most interesting. |
| **Children ship commonness-ordered** (§3.3) | The layout is a **pure function of the shipped file**. Same coordinates on every machine, every session, forever — no layout data to generate, ship, or version. Zero new bytes. |

### 13.4 The layout — nested circles, static, pure pan/zoom

**One virtual coordinate space, computed once on first open, never recomputed.** A circle per word; a
node's children are packed inside it; the 1,002 roots are packed into the field. Radius follows
`√(subtree size)`, so `person` (4,415 words) is physically the biggest thing on the map and a shrub tree is
a speck — which is true, and is the thing a hierarchy diagram usually fails to say.

**Packing — the plan's golden-angle spiral was built, measured, and replaced.** The spiral was chosen here
on the grounds that "optimal packing would look ~15% tighter and is not worth a dependency". Built, that
estimate was wrong by an order of magnitude, because looseness **compounds through five levels of
nesting**: ~47% fill in the root field × 36–51% on the mid-size shelves × again at every level below left
the whole forest at radius **811** with only **4.65%** of the field covered by leaf area. At a 900 px
viewport that is **0.54 px per leaf** — and §13.4's actual payoff, the zoomed-out heat map, was an
invisible haze rather than legible texture.

So the shipped pack is **front-chain placement** (Wang et al., the algorithm behind d3's pack layout),
reimplemented inline in `ladderMap.js` — an *algorithm*, not a dependency, so the repo's vanilla/no-build
rule is untouched, and fully deterministic, so §13.3's "same coordinates on every machine, forever" still
holds with still no layout file to ship. Enclosing circles come from Badoiu–Clarkson rather than exact
Welzl: four times less code to save a rounding error. Measured, both at `PAD` 1.02:

| | golden-angle spiral | front-chain |
| --- | --- | --- |
| forest radius | 811 | **271** |
| leaf area fill | 4.65% | **41.5%** |
| leaf at a 900 px viewport | 0.54 px | **1.61 px** |
| root-field fill | 47% | **78%** |

Verified alongside: **0 sibling overlaps and 0 children escaping their parent** across all 30,545 nodes,
and **0 coordinate drift** on a rebuild. Build cost 0.1–0.3 s, paid once on first open.

**`PAD` is the other knob and it was tuned, not guessed.** The median shelf holds 2 children, so the ring
of air between a parent's hull and its outermost child binds on half the map: 1.05 → 34.1% fill, 1.02 →
41.5%, 1.01 → 43.9% but with no visible gap left between a parent's stroke and its contents. Shipped at
**1.02**. Each parent also rotates its whole arrangement by a hash of its own name, so shelves don't all
point the same way and the field reads as flowers rather than moiré — free, and still pure.

**Pure pan/zoom — one transform, no wedge remapping.** Because area already follows subtree size, zooming
*is* drilling down; there is no separate "enter this node" mode and nothing animates into a new layout. The
viewport model is the one Inklings' Sound Board already uses for its endless board (`sbView` + `sbClampView`
+ drag-to-pan + a recentre key) and should be lifted from it rather than reinvented.

**LOD, three tiers, and the zoomed-out view is the payoff:**

| Screen radius | Drawn as |
| ------------- | -------- |
| **< 3 px** | **One dot, coloured by the subtree's lit fraction.** Children are not drawn at all. |
| **3–20 px** | The circle plus its children as dots. Internal nodes get a label only if it fits. |
| **> 20 px** | Circle, label, children, and the shelf counter (`dog 7/33`). |

That first tier is the feature, not a compromise: zoomed all the way out, the map is a **heat map of your
own progress** — a branch you've worked reads warm, an untouched one stays dark, and you can see at a
glance that you've explored `clothing` and never touched `knowledge`. At a 1000 px viewport the whole
forest gives **~3.6 px of diameter per leaf** (1.79 px radius, measured), so 30,545 nodes really do fit on
one screen as legible texture — which is exactly the number the front-chain pack above had to buy.

**Draw cost is bounded at both ends of the zoom, but by two different things — and the plan only had one
of them.** Zoomed *in*, viewport culling plus the < 3 px tier (which collapses a subtree to a dot and stops
recursing) keep a frame small, as planned. Zoomed all the way *out* they do not: the pack is now tight
enough that a leaf is ~1.6 px while its parent is well above the threshold, so a fit-scale frame really
does visit **28,976 of the 30,545 nodes** — the plan's "a few thousand shapes, not 30,545" is wrong in
exactly the case it was written for. What makes that frame cheap instead is **batching**: every dot is
queued by ramp colour and flushed as at most **33 `fill()` calls**, not 29,000. Hit-testing walks the same
static tree top-down — no spatial index needed, since containment means one child can hold the point — and
it stops where the *draw* stops, so a collapsed subtree reads out as itself rather than as whichever
invisible leaf the pixel covers.

**Fallback if the packing reads badly:** a radial node-link tree with wedge-zoom (click a node, its wedge
becomes the full circle). Better at showing *lineage*, worse at showing *proportion*, and it gives up pure
pan/zoom. Try circles first.

### 13.5 Fog rules

- **The layout is static and complete from the first launch.** Nothing appears or moves as you play; what
  changes is **lit vs dark** and **named vs anonymous**. That is what makes the map worth revisiting — the
  same picture, further filled — and it removes an entire class of bug (positions can never drift).
- **Internal nodes are always named.** They are the coastline; without them the map is unnavigable and the
  fog is just a blank page.
- **Leaves are anonymous buds** until visited. A shelf shows its lit children by name and its dark ones as
  plain dots, with the remainder as a count (`+26`).
- **A visited word lights permanently** and keeps its name. Visiting is landing on a rung in any mode —
  including the rungs you pass *through* on a §12.2 descendant jump, which cross real rungs and should pay
  for all of them.

### 13.6 Shelves

- A shelf is `ladderDown[parent]` and its progress is `lit / total`, derived from the visited set at render
  time. **Nothing about shelves is stored** — the visited set is the only state.
- **Milestones at 25 / 50 / 100%**, matching the Atlas continent milestones (`docs/inklings-atlas.md`) and
  keyed off fractions for the reason in §13.3 (a third of the corpus is effectively untypeable).
- **A completed shelf turns gold** and its parent stays gold when zoomed past, so a filled region is
  visible from orbit.
- **What a milestone pays is an open question (§13.12)** — Punctuators has no currency, and inventing one
  for this is scope creep. The honest v1 is cosmetic: the gold ring, a shelf counter in the panel header,
  and a line in the share string.

### 13.7 The prerequisite — free play alone cannot fill a shelf. BUILT 2026-08-23

This is the finding that changed the build order. **Keen Arrow taking the first child of a parent** (§15,
Deferred: branching hyponyms) means `dog`'s shelf can never read better than **1/33** no matter how many
times you climb it — the map would be structurally unfillable in the mode most people play.

Three ways in, and the map needs at least one:

| Source | Fills shelves? |
| ------ | -------------- |
| **Free play with a first-child-only Keen Arrow** | **No** — every shelf caps at 1. |
| ~~**Sibling cycling**~~ (built with M3, **removed 2026-08-23** — see below) | Yes, but it is no longer how this happens. |
| **§2.5's shelf fan** (the answer as it stands) | **Yes** — the row *is* the shelf, so a parent's whole child list is reachable by picking from it, and the rotating bud slot brings the rest through on replays. |
| **Word Race** (§12.2) | **Yes** — typing summons any descendant, so the Race fills shelves as a side effect of being played. |

**The unvisited-first rule is what survives, and it is the part that matters.** Keen Arrow's row is
drawn **unvisited first**, and "unvisited" reads `ladderMapHas()`, the map's own record. **That makes
the Tree of Kinds an input to the game and not only a scoreboard** — it steers the row toward what you
have not seen, and it is why replaying a sentence is worth anything. The two features are not merely
ordered (M3 before M12's fill) but genuinely coupled.

**Sibling cycling — the leaf sidestep — was removed on 2026-08-23, and the fan is why it could be.**
It was built to solve this section's problem back when Keen had to move *somewhere* or do nothing, and
it did so by giving one hero's one action two meanings: narrow, or shuffle along the shelf you are
already standing on. Once the row is drawn, those two are indistinguishable on screen, and shelves fill
from the **parent's** row anyway — so the sidestep was buying nothing and costing clarity. Keen Arrow
now **goes down or not at all**.

The sideways move still exists; it just costs the honest route. `bloodhound` clanks, General Ization
broadens it to `hound`, and `hound`'s own row **is** the sibling list — `wolfhound▾ greyhound▾
bloodhound beagle basset harrier foxhound · +7 more`. Two deliberate shots instead of one ambiguous
one, and the up-then-down shape is the hierarchy teaching itself.

The bottom-rung clank is now simply "this word has no narrower kinds", which is 84% of the corpus by
count but far less in practice, since the words people type are usually mid-chain. `borzoi` still
clanks for the same reason it always did.

### 13.8 Dailies and spoilers

The fog rule keeps leaf *names* hidden, but the named skeleton is a routing atlas, and **Word Race is a
routing game** (§12.3). A player with the map open is reading the answer rather than recalling it.

- **The map button is disabled while a daily run is in progress** (Restore the Phrase and Word Race alike),
  and says why. This is the same instinct as §11.6's "hint, late and quiet".
- **Finishing a daily opens it, and draws your route on it** — the path you actually took, detours and all,
  overlaid on the path you could have taken. That turns the lock into a reward and makes the post-game
  screen teach the thing the mode is about: how far up two words make you climb.
- Free play never locks the map.

### 13.9 Storage and share

- `localStorage["punctuators.ladderMap"]` = `{v:1, seen:[…]}` — a flat array of visited words, nothing
  derived. At a realistic few hundred to few thousand words that is **5–54 KB**; even the absurd case of
  visiting all 30,545 is **~335 KB**, comfortably inside the quota, so no bitset or index encoding is
  needed. Plain words also stay debuggable and survive a corpus rebuild that renumbers nothing.
- **A corpus rebuild is safe by construction**: a word dropped from `ladderPOJO.js` simply stops being
  drawn, and a word added arrives dark. No migration.
- **Share** (optional, §13.12): spoiler-free by nature, since it names no word —
  `🌳 Tree of Kinds · 1,204 words · 42 shelves · ANIMAL 31%`.

### 13.10 Wiring checklist

| File | Change |
| ---- | ------ |
| `ladderMap.js` | **new — BUILT 2026-08-23** — `buildForest()`/`packForest()` (one pass on first open), the LOD draw, pan/zoom/hit-test, the visited set + storage, and the `ladderMapVisit()` seam. No new data file. Shelf math is M13. |
| `index.js` | **BUILT:** `initLadderMap()` + the button wiring; **and as of M3**, `ladderMapVisit()` on every rung landed on (including the one you were standing on, so the word you typed lights the first time you shoot it). The `ladderMapHas()` read-back that steers the game (§13.7) now lives in `ladderFunc.js`'s `shelfFor`, where it orders the shelf fan's row. **Still to do:** the daily-run guard (§13.8) — M14; passed-through rungs on a §12.2 jump — needs Word Race |
| `punctuators.html` | **BUILT** — the 🌳 button + the overlay markup. *Not* a `.modal`: that pattern is capped at 500 px and centred by transform, and a map wants the whole window |
| `index.css` | **BUILT** — the panel, the bar, the canvas, the hover readout. The gold shelf state is M13 |
| `CLAUDE.md` | the Punctuators row per milestone |

### 13.11 Milestones

**M12 — the map. BUILT 2026-08-23**, across two sessions: the viewer, then the fill.

**Built:** `ladderMap.js` — the forest build, the front-chain pack (§13.4), the three-tier LOD draw,
pan/zoom/hit-test, the visited set and its `localStorage` record, and the `ladderMapVisit(word)` /
`ladderMapVisitAll(words)` seam. Plus the 🌳 button, the overlay markup and its CSS, and the one
`initLadderMap()` call in `index.js`. It opens, draws all 30,545 words, and lights whatever is in the
visited set. Three deviations from the spec, each with its reason recorded above or below:

- **The pack is front-chain, not the golden-angle spiral** — §13.4, measured and replaced.
- **`ladderPOJO.js` is loaded by a dynamic `import()` on first open, not statically.** §3.3 settled on a
  static import so that `hasLadders`/`wrapLadders` could stay synchronous; nothing on the map's path is
  synchronous, so the map defers all 337 KB until the panel is actually opened. §3.3's decision still
  stands for M2's wrapper functions.
- **The fog rule (§13.5) is in already**, though it was scheduled for M13 — it is `if (internal ||
  visited)` around the label, and shipping an intermediate that prints every leaf name would spoil
  answers that M13 would then have to take back.

**M12's other half — the fill — BUILT 2026-08-23, with M3.** It was blocked on there being a ladder
collision branch at all; once M3 wrote one, the seam was three calls: `ladderMapVisit()` on both the rung
you were standing on and the rung you land on, and `ladderMapHas()` back out to order what Keen offers
next (§13.7 — that read-back is the part the plan didn't anticipate; it shipped as sibling cycling, and
survived that mechanic's removal by moving into `shelfFor`'s row ordering). The map now fills from free
play. `?mapseed=N` still lights a deterministic, session-only sample (never written to storage) for
checking the drawing, and `?map=1` opens the panel on load.

**M13 — the fill.** Shelf counters and the 25/50/100% milestones, the gold state. (Fog rules and storage
landed in M12.)

**M14 — the feel.** The daily-run guard and the post-game route overlay (§13.8), the share string, labels
and breadcrumb polish, the How-to-Play copy.

M12 needed M3 (the heroes) only — it did **not** wait on §11 or §12, and shipping it alongside free play is
what gives free play a reason to be replayed.

### 13.12 Open questions

- **The name.** `The Tree of Kinds` is the recommendation — it echoes the "is a kind of" phrasing used
  throughout this doc and is kid-legible. `The Kindsmap`, `The Great Chain` (accurate, and a real historical
  joke, but obscure) and `The Atlas of Kinds` (collides with Inklings' Atlas) were the alternatives.
- **What a shelf milestone pays.** Cosmetic-only is the honest v1 (§13.6). The alternative is that this is
  where Punctuators finally gets a light meta-layer, which is a much bigger conversation than a map.
- **Are the 810 shrub trees drawn?** They are 8% of the words and half the visual clutter of the forest
  view. Options: draw them all (honest), pack them into a labelled "scrubland" at the rim, or hide trees
  under 5 nodes behind a toggle. Recommending draw-them-all until it's seen on screen.
- **Does it belong in Inklings too?** §14.2's **Kindred Tree** décor is the same idea as a physical object
  in the cozy square, and §14.2's Specificity Range would fill it. Shared `localStorage` across two games on
  one origin is possible but has never been done here — worth a deliberate decision rather than a drift.

---

## 14. Other mechanics for these two

A parking lot. **Nothing here is committed or scheduled**, and none of it needs new data — every idea below
runs on `ladderPOJO.js` as built. ★ marks the three worth building first. *(The traversal ideas that used to
sit here were promoted to §12 on 2026-08-22 and now have a spec; three of the survivors below —
Ladder Golf, Kinship, Category speed round — would reuse §12.2's engine and §12.3's LCA `parFor` outright.)*

### 14.1 In Punctuators

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

### 14.2 In Inklings

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

### 14.3 Cross-game, cheap

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

## 15. Deferred

- **Verbs.** `run → jog / sprint`, `walk → travel`. WordNet keeps these in a separate
  namespace (`vhyper` = broader action, `tropo` = troponyms, "a particular way of doing it") which
  `build_dictionary.py:122/127` already extracts, and `_best_verb_sense` (`build_dictionary.py:253`) already
  disambiguates. Same heroes, same mechanic, a second parent map. Held back so the noun mechanic ships clean.
- ~~**Branching hyponyms.**~~ **Promoted and BUILT 2026-08-23 with M3 — see §13.7.** `dog` has **33**
  children in the built data, and Keen Arrow now walks them instead of taking the first forever.
- **Adjectives.** WordNet has no adjective hierarchy (only `sim`/`ant`), so there is no ladder to climb.
  Out of scope, permanently.
- **A base `docs/punctuators.md`.** The game itself is undocumented; §1 here is a partial stand-in.
  A **stub** now exists at [`docs/punctuators.md`](punctuators.md) holding the base game's known issues and
  its shared-engine footguns — it is not the doc this entry is asking for, just somewhere for them to live.
