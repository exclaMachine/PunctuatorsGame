# Punctuators — General Ization & Keen Arrow (the Word Ladder)

**Status: free play is PLAYABLE. M1 (the data) BUILT 2026-08-22 — `build-ladders.py` + `ladderPOJO.js`.
**M2 (the mode) + M3 (the heroes) BUILT 2026-08-23** — `ladderFunc.js`, the `General & Specific` option,
both heroes sharing one span via `targetId`, up/down movement, capstone/clank, and §2.4's rung strip
(pulled forward from M4). **M12's fill landed with them**, so the Tree of Kinds fills as you play.
**§2.5's shelf fan BUILT 2026-08-23** — Keen Arrow draws the word's narrower kinds as a row of shootable
words and you pick one by walking under it, so the descent stops reading as random. He **goes down or
not at all**: the leaf sidestep the fan replaced was removed the same day (§13.7).
**The How-to-Play copy BUILT 2026-08-23** — a `ladder` template in `updateCharacterModal`, whose first
tip is the rule the fan made unguessable: shooting a word no longer moves it.
**§6's two landing animations BUILT 2026-08-23** — General's camera pull-back and Keen's lens snap,
plus the picked child flying out of the row into the word, and a drawn broadsword for General's
projectile. **§7's six SFX BUILT 2026-08-23** too, and **§8's hero art BUILT 2026-08-25** —
`Ization.png` / `KeenArrow.png`, with no attack frame yet, so **M4 is complete** bar that second pose.
Phase 2 — Restore the Phrase (§11) specced 2026-08-22, four decisions locked; **its M5 data layer BUILT
the same day** — `phrases-source.txt` (108 drafted sayings, awaiting the dev's sense-prune),
`build-ladders.py --phrases`, and the generated `phrasePOJO.js` (108 puzzles). **M6 (the mode) BUILT
2026-08-24 and PLAYABLE, dev-only behind `?dev=1`** — `ladderPhrase.js`, the `ladderPuzzle` `<option>`,
and goal/lock/win over the free-play span. M7 (the daily) and M8 (the feel) remain.
Phase 3 — Word Race (§12) specced 2026-08-22, **M9 (the engine) BUILT 2026-08-24, DEV-ONLY while it is
worked on**: `ladderRace.js`, the `--alt` build pass and its `ladderAltPOJO.js`, type-to-summon +
shoot-to-travel against a hardcoded pair (`poodle ⟶ salmon`, par 5). Its `<option>` needs `?dev=1`, and
**the next work is §12.8's play-test fix list, not M10** — the first play found the mode never tells the
player where they are going. **Notes 1 and 2 of that list are BUILT 2026-08-24**: picking Word Race now
replaces the sentence box with the route itself (`poodle ⟶ salmon`, the never-visible `#race-banner`
retired), and the box comes back beneath it only when **Keen Arrow shoots the word you're standing on** —
his shot on the current word is the ask for a narrower one, so a descent is two shots with the typing
between them and the box is never open with nothing to type. Its Deep Dive companion (§12.4) is tentative.
Phase 4 — the Tree of Kinds progress map (§13) specced 2026-08-22, **M12 BUILT 2026-08-23** across two
sessions (`ladderMap.js` + the overlay, then the fill). **M13 (the fill) BUILT 2026-08-23** — the shelf
is now a first-class number on both sides: a gold arc + counter on the map, `7/33 found` in the fan's
caption, and 25/50/100% milestones announced **in play**, where they are earned. **M14 — the feel —
BUILT 2026-08-23 (§13.13)**: two of its four items turned out to be blocked on dailies that do not exist,
so it shipped the ancestry breadcrumb, the spoiler-free share string, the map's own help card and a
**dormant** daily-run guard (`ladderMapLock`/`ladderMapUnlock`, no caller, `?maplock=` to exercise it),
and the post-game route overlay moved out to §12's M11. **The Tree of Kinds is complete.** One fog leak
found in play and **FIXED 2026-08-24**: §13.5's rule named every *internal* word, which handed over
`kinsman 0/4`'s `brother`, `nephew` and `uncle` — **skeleton now means two or more kinds**, and the
breadcrumb's "can never be redacted" property went with it (§13.5, §13.13.1).

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
  the placeholder flare of the day was the same for up, down and across. The one move that isn't "more specific"
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
| `index.js` | **BUILT** — `await loadLadders()` + the guard in the `removePuncButton` handler (now `async`); `GeneralIzation` + `KeenArrow`; instances adjacent in `availableHeroArray`; `targetId` in the `Hero` constructor and the collision gate; `climbLadder`/`landOnRung`/`flashLadder` and the ladder branch in the collision chain. **§2.5's fan BUILT** — `openShelfFan`/`closeShelfFan`/`pickRung`/`drawShelfFanLines`/`shelfFanWidth`, the `data-ladder-child` split in the ladder branch, the `nodeArr` push/splice, and two guards at the top of the collision walk (`isConnected`, `projectile.ladderDone`); closed on hero switch, new sentence and resize. **The `ladder` How-to-Play template BUILT** in `updateCharacterModal`, which now writes into `.modal--body` so the modal keeps its `×`. **§6's animations BUILT** — `animateLadderSwap` + `ladderPullBack`/`ladderLensSnap`/`flyPickedChild`, the `pulse` parameter on `openShelfFan`, and `drawBroadswordSprite()`/`GENERAL_PROJECTILE`. **§7's SFX BUILT** — `_izoShoot`/`_izoHit`/`_keenShoot`/`_keenHit`/`_keenFan`/`_ladderCapstone` beside the other heroes' synth pairs, played from the ladder branch rather than from the generic hit call site (both heroes' `hitProjectileSound()` is silent), and the borrowed mp3s dropped from both constructors. **§8's hero art BUILT 2026-08-25** — `Ization.png` / `KeenArrow.png` in both hero slots of each constructor (no attack frame yet), with `heroScale` and `projectileStartPositionX` re-derived from the new files. **Still to do (M4):** nothing but a second (attack) frame per hero |
| `index.css` | **BUILT** — `.word-ladder`, the `data-rung-strip` `::after`, `.ladder-capstone`, and §2.5's `.shelf-fan` / `.shelf-fan-row` / `.shelf-child` / `.shelf-fan-caption` / `.shelf-fan-lines` (with the reduced-motion case that clears `stroke-dashoffset` rather than only killing the animation, or the lines would stay invisible), plus `.modal--body > .char-modal` for the How-to-Play copy. **§6 BUILT** — the placeholder `.ladder-move` is gone, replaced by `.ladder-face` / `.ladder-ghost` (the two boxes a swap is built from; the keyframes themselves are WAAPI, in `index.js`), `.ladder-aperture` (the fan-open flicker) and `.shelf-child-picked` (the clone that flies into the word). `.ladder-capstone` stayed but went from `text-shadow` to `drop-shadow`, which stops it blanking the word's black outline for the length of the flare |
| `CLAUDE.md` | the Punctuators row flips to **BUILT** per milestone — done for M1–M3 + M12, still to do for M4 |

**Guard message**, matching the existing three at `index.js:403–423`:

> `No ladder words found in your sentence — try naming some things!`

---

## 6. Animation — BUILT 2026-08-23

Both animations leave the span as **plain text at the new rung** when they finish — the same
`settle()` discipline as `animateAnagramSwirl` — because the word has to be hittable again
immediately.

**The shared shape.** A swap rebuilds the span as two boxes and tears them down again:

- **`.ladder-face`** — the new rung, **in flow**. It holds the span's box, so the sentence reflows
  once (when the word's length changes) and never again for the length of the animation; everything
  the face then does is `transform`/`filter`/`opacity`, which cost no layout.
- **`.ladder-ghost`** — the rung being left behind, **absolutely positioned** and centred on the
  span, so it can swell to 1.9× or shrink to a point without moving a single neighbouring word.

`animateLadderSwap` branches on `hero.ladderDirection` and hands the pair to one of two keyframe
functions. Keyframes are WAAPI (`element.animate`), as `animateAnagramSwirl` uses; `index.css` only
sets the two boxes up.

**General Ization — the camera pulls back** (`ladderPullBack`). The word you shot shrinks away to a
point (ghost, 1 → 0.4, 380 ms) while the broader one fades in oversized behind it and settles at
normal size (face, 1.75 → 1, 560 ms). You are not looking at a different word; you are standing
further back from the same thing.

**Keen Arrow — the lens snaps in** (`ladderLensSnap`). The broader word swells and goes soft, as if
the focal plane were sliding off it (ghost, 1 → 1.9 with `blur(0 → 6px)`, 320 ms), and the narrower
one drops into focus a beat later with a hair of overshoot (face, 0.6 → 1.08 → 1 with
`blur(7px → 0)`, 420 ms after a 110 ms delay). `fill: "backwards"` holds the face hidden through
that beat; its last keyframe is the span's own resting state, so nothing needs holding afterwards.

With §2.5 the two halves of Keen's sentence split across two moments, which turned out to be an
improvement rather than a complication: **the branch lines draw outward** from the word when the fan
opens ("here are the many"), and **the lens snap plays when you shoot a child** ("you picked one").
`flyPickedChild` carries the pick between them — the child you hit flies out of the row and into the
word, scaling up as it fades. It flies as a **fixed-position clone**, not as the real child: by then
`closeShelfFan` has spliced the real one out of `nodeArr` (§2.5 note 2) and a second hit on it must
be impossible.

**Capstone / clank, and the fan opening.** The two moments where the word does *not* move get a glow
rather than a movement: `.ladder-capstone` at either end of the chain (a *good* moment, not a
failure — `animal` is the answer) and `.ladder-aperture`, a quicker flicker, when the fan opens on a
word that stays put. Both are **`drop-shadow`, not `text-shadow`** — `landOnRung` writes the black
outline as an inline style, and a `text-shadow` keyframe overrides it outright, blanking the outline
for the length of the flare. A filter composes over it instead. It also keeps the aperture off
`transform`, which a lens snap may already be using on the face underneath: `pickRung` re-opens the
fan on the new rung in the same frame it lands on it, so it passes `openShelfFan(…, pulse = false)`
and lets the snap be the shot's only mark on the word.

**The stale-settle trap.** A second shot can land while the first swap is still in flight, and the
first animation's `settle()` would then write its own (now old) word back over the new one. A
sequence token on the span (`dataset.ladderSeq`) makes a superseded settle a no-op. For the same
reason `landOnRung` reads what is on screen off `.ladder-face` when one exists, since mid-swap the
span's own `textContent` is face and ghost run together.

Reduced motion: a straight swap, as `animateAnagramSwirl` already does, and no flying clone.

---

## 7. Sound — BUILT 2026-08-23

Built on the existing Web Audio kit (`_tone` / `_noise`) — no new assets, consistent with every other
hero's `_xxxShoot` / `_xxxHit` pair.

| | |
| --- | --- |
| `_izoShoot` | a bugle-ish rising third — a general's call. G4→B4 in `square` over an octave-down `triangle` body; the harmonic series is most of why a bugle call reads as military |
| `_izoHit` | a **descending, widening** low pad — the pull-back. Two voices start together and pull *apart* as they fall, so the interval widens on the way down: the same gesture `ladderPullBack` makes with the word. A 2 Hz detune leaves a slow beat under it, which keeps a low pad from sounding like one flat organ note |
| `_keenShoot` | `_noise` bow-thrum + a fast rising blip — the loosed arrow. A high-Q band down at 220 Hz thrums rather than hisses |
| `_keenHit` | a sharp high tick — the arrow landing on one thing. 45 ms, the shortest cue in the game |
| `_keenFan` | §2.5's fan opening — a flutter of ticks, one per child drawn, so the row's *size* is audible before you read it: a three-word shelf and a seven-word shelf are different sounds. Pitch climbs across the row the way the eye travels it. Takes a `delay`, used when the fan re-opens straight after a landing so `_keenHit` speaks first |
| `_ladderCapstone` | a short `★` chime — a bright major triad, shared by both ends of the ladder. It must not sound like a buzzer: `animal` IS the answer, and a leaf having no kinds is a fact about the word rather than a miss |

**Six cues, not the usual two, and that changed where they are played from.** Every other hero's hit
means one thing, so the generic `player.hitProjectileSound()` call site works. A ladder hit means one
of four — a rung climbed, a shelf fanned open, or either end of the chain reached — and *which* is
only known inside the handler. So both hero classes override `hitProjectileSound()` to **silence**,
and the ladder branch plays the outcome's own cue: `landOnRung` picks `_izoHit`/`_keenHit` off
`ladderDirection`, `openShelfFan` plays `_keenFan(children.length)`, and `climbLadder` plays
`_ladderCapstone` at both dead ends. `shootProjectileSound()` stays conventional. The borrowed
`whoosh.mp3` / `featherSwish.mp3` were dropped from both constructors, matching how every other
synth hero (Ambigrambador, Sergeant Colon, …) passes `undefined` there.

`openShelfFan`'s `pulse` flag turned out to carry the audio timing too: it is false exactly when a
landing just happened, which is exactly when the flutter should wait a beat for the hit tick.

**A seventh cue arrived with M13**, and it is the only one that isn't the hero's: `_shelfMilestone(tier)`
belongs to the **map** (§13.6), so it deliberately sits clear of the six above — a bell rather than a
bugle or a bowstring, and it **climbs** where the others fall. Three rising notes for a quarter, four for
a half, and at 100% the same run under a sustained low voice and a high cap, so a finished shelf is
different *in kind* rather than one note longer than a half. It takes a `delay` for the same reason
`_keenFan` does: the landing cue is playing on the same shot and should speak first.

---

## 8. Art

**Hero art BUILT 2026-08-25.** `images/Ization.png` (a black silhouette of an armoured figure, broadsword
raised — the projectile's joke drawn into the hero) and `images/KeenArrow.png` (a purple archer, braid and
crossbow) replace the placeholders the mode shipped on: `Generic.png` for General and, for Keen, Question
Markswoman's own `qm.png`/`QM2.png`, which made the two heroes identical on screen.

**No attack frame yet**, so `secondHeroImage` is the same file as `heroImage` for both — the hero just
doesn't change pose while a shot is in flight. Dropping a second frame in later is a one-string change per
hero; nothing else knows the two slots hold the same picture.

Two numbers in the constructors are derived from the art and have to be re-derived if it is replaced:

| Number | General | Keen | Why |
| ------ | ------- | ---- | --- |
| `heroScale` | `0.45` | `0.45` | Tuned on screen by the dev, and shared — but note the two are **not** the same size on the canvas, because the files are: both are 800 × 1045 frames, and the **figure inside** is 798 × 875 for General against 442 × 663 for Keen, so the same scale draws ~359 × 394 and ~199 × 298. Keen being the smaller of the pair is the choice; equalising them would mean giving each hero its own scale. Both figures are bottom-anchored in their frame, which is what `restingY()`'s `canvas.height - height + 20` assumes |
| `projectileStartPositionX` | `180` | `180` | **Half the drawn width, and it has to be** — so it moves whenever `heroScale` does (this pair went 120/160 → 180/180 when the scales were tuned to 0.45, before the mode was ever played with the new art). The shoot handlers spawn at `position.x + width - projectileStartPositionX`, while the `Projectile`'s own `onload` rewrites it to `position.x + projectileStartPositionX` — the two agree at the midpoint and nowhere else, so any other value makes the shot jump sideways the instant the image loads. Free here: both figures are centred on the frame's midline anyway — General by his bounding box, Keen by his **crossbow** (his bbox leans right because of the skirt and quiver, but the bow the bolt actually leaves from is centred at x ≈ 399 of 800) |

Still open, following the two-frame convention every hero uses (`heroImage` + `secondHeroImage`, shown
while a projectile is in flight — `index.js:1718`):

| Asset | Notes |
| ----- | ----- |
| General's attack frame | second pose, e.g. the sword swung down |
| Keen's attack frame | second pose, e.g. the crossbow loosed |
| General's projectile | **BUILT 2026-08-23 — a drawn broadsword.** The joke is already in the name: the *broad* blade for the hero who broadens, which beat the spec's earlier "spreading ring or cone" on legibility at 27px. `drawBroadswordSprite()` paints it once into an offscreen canvas and hands the Hero constructor a data URL, so it takes the same `Image()` path as every other projectile and **swapping it for real art is one string** — replace `GENERAL_PROJECTILE` with a filename. Drawn point-up (projectiles are never rotated) and sized so the unchanged 0.2 scale lands at ~27 px wide, the width the borrowed `Ectoplasm.png` had, which is what `projectileStartPositionX` (90) was centred against |
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
the collision branch, up/down movement, capstone/clank. Shipped playable on placeholder art
(`Generic.png` for General, Question Markswoman's `qm.png` for Keen — real art replaced both on
2026-08-25, §8) and borrowed SFX. **§2.4's rung strip came along**, because without it the mode reads as
random word-swapping. **§13.7's sibling cycling came along too**, and was then **removed the same day**
once §2.5's fan made it redundant — see §13.7.

**M4 — the feel. COMPLETE. §2.5's shelf fan, §6's animations and §7's SFX all BUILT 2026-08-23; the hero
art BUILT 2026-08-25 (§8), leaving only a second attack frame per hero, which is art the mode can ship
without.** The fan was added to this
milestone because playing M3 showed polish alone does not fix what it was for — Keen's descent still
read as random, and the sideways sibling step was invisible. Being a mechanic rather than polish, it
was the bulk of M4's work, and it is in: `shelfFor` in `ladderFunc.js`, the fan block in `index.js`
(`openShelfFan`/`closeShelfFan`/`pickRung`/`landOnRung`), `.shelf-fan` in `index.css`. The typed-answer
hard mode stayed out, in §12 (see §2.5.4).

**The How-to-Play copy — BUILT 2026-08-23.** A `ladder` entry in `updateCharacterModal`'s `templates`,
following Betar's pattern (lead → worked example → tips), shown on the existing **How to Play** button,
which stays on screen through a round. It leads with the one rule the fan made unguessable — *Keen
Arrow doesn't move the word* — and then glosses only things already on screen: the `▾` branch marker,
§2.4's rung strip, the `+N more` fog count and why replaying changes the row, the clank and the route
out of it, the capstone, and the 🌳 map. Two things came with it:

- **It writes into `.modal--body`, not the whole `#modal`.** The original replaced the modal's entire
  `innerHTML`, taking the header and its `×` with it — so Betar's modal was closable only by clicking
  the overlay. Fixed for both modes; `.modal--body > .char-modal` drops the now-doubled padding.
- The `modal` identifier the function used was never declared — it resolved through the DOM's
  named-access-on-`window` for `id="modal"`. Now an explicit `getElementById`.

**§6's animations — BUILT 2026-08-23.** The camera pull-back and the lens snap, the picked child
flying out of the row into the word, and the fan-open/capstone glows that replaced the shared
`.ladder-move` placeholder. General's projectile came with them: a **drawn broadsword** (§8) rather
than the spec's spreading ring, painted into an offscreen canvas and passed to the Hero constructor
as a data URL, so real art is a one-string swap later. The one thing the build had to invent was the
stale-settle guard — §2.5 lets a second shot land while the first swap is still in flight, which the
spec never had to think about because the placeholder was a single class with a timer.

**§7's SFX — BUILT 2026-08-23.** All six, on the existing `_tone`/`_noise` kit. The one thing the
build had to decide was *where they play from*: six cues across four outcomes don't fit the generic
one-hit-one-sound call site every other hero uses, so both ladder heroes' `hitProjectileSound()` is
silent and the handlers own the audio (§7).

**§8's hero art — BUILT 2026-08-25.** `Ization.png` / `KeenArrow.png`, no attack frame yet (both slots
hold the same file). The scale and `projectileStartPositionX` numbers each hero now carries are derived
from the art, not chosen — see the table in §8 before swapping either file.

**Still outstanding in M4:** a second (attack) frame per hero, and nothing else.

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
harmless here and fatal in the puzzle mode — which is why the puzzle's shiftable words are hand-marked
rather than found, not something free play has to fix.

**M5–M8 — Restore the Phrase**, the puzzle mode. Specced separately in §11.9; it builds on M4, so nothing
there started before free play was playable. **M5 and M6 are BUILT** (2026-08-22 / 2026-08-24).

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

**Specced 2026-08-22. M5 (the corpus + build) BUILT 2026-08-22; M6 (the mode) BUILT 2026-08-24, dev-only
behind `?dev=1` while it is played in. M7 (the daily) and M8 (the feel) remain.** It reuses free play's
engine whole — the same span, the same two heroes, the same shelf fan and landing animations.

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
- **The span** is *literally* the free-play span (`data-ladder`, `data-rung`, `data-ladder-word`,
  `data-ladder-orig`) plus two attributes: **`data-phrase-slot`** (which shifted word this is) and
  **`data-phrase-goal`** (where it belongs). That is what lets `climbLadder`, the shelf fan and both
  §6 animations drive the puzzle with **no second path through the collision block** — the whole mode
  hangs off two hooks in the existing one, a pin for the fan and a scorer on the landing.
- ~~**A hit moves ±1 rung along the authored chain.**~~ **AMENDED 2026-08-24 — Keen Arrow fans, as he does
  in free play** (dev's call, on the understanding that it reverts to the fixed chain if it plays too hard).
  This bullet was written before §2.5 shipped and assumed the chain was a rail: because it was fixed data,
  Keen would never have to choose among `dog`'s 33 children. With the fan he shows the word's **real**
  children and the player can pick one that walks **off** the authored chain — so the chain became a
  **score-keeper, not a rail**: distance to the goal is measured on the live hierarchy (`rungsBetween` =
  the LCA path, borrowed from §12's `parFor`), and General broadening back up is the way home. A wander
  costs moves and is never a dead end.
  - **The fan must be able to show the answer**, or narrowing can't solve the puzzle at all: shelves run far
    wider than the row — `food` has 239 children and `eggs` is the **164th** — and **MEASURED: 77 of the 97
    narrowing steps in the 108 puzzles pass through a shelf wider than a 7-slot fan**. So `shelfFor` gained a
    **`pin`** (free play passes none and is untouched): the next rung toward the goal displaces the row's
    last word and the row is re-sorted into the corpus's own familiarity order, so the answer never sits in
    a tell-tale slot.
  - **A finding for the play-test, not a bug:** with the row in familiarity order the answer is the row's
    **first word 48% of the time** (47 of 97 steps; last 21%). That is the data, not the pin — sayings use
    the most familiar kind of a thing, and that word is exactly what the corpus sorts to the front.
- **Landing on the goal locks the word**: green ✔ flare, a lock chime (`_phraseLock`, the eighth ladder cue
  — a latch, distinct from the capstone, which means an *end* rather than an answer), and the span's `id` is
  cleared so neither hero targets it again. A stray shot can't knock a solved word loose, the remaining
  targets stay obvious, and the Hint button lights only what's left, for free.
- **Chain ends** behave as free play (capstone / clank, §2.3) — you can overshoot past the goal but never
  off the ladder.
- **After every rung change**, re-apply case and the plural rule (§3.4) — both already handled by free play's
  `renderRung`, since `data-ladder-orig`/`data-ladder-plural` carry the build's `cap`/`plu` — and
  `fixArticleBefore(span)`, which is a **text-node edit**: with Art suppressed the articles are plain text, so
  `A dog` → `An animal` is rewriting the word in front of the span. Spelling, not phonetics (`an hour` would
  come out wrong) — the same trade the build makes, and no corpus phrase shifts a word into one.
- ~~**Wasted shot** = one that does not reduce `|rung − goal|`.~~ **AMENDED with the fan: a wasted MOVE** — a
  *landing* that doesn't close the distance. The fan makes a descent two shots (open the row, then pick from
  it), and §12.8 already settled that the extra shot is free: moves are the score, not shots. Same skill
  signal either way.
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
| `ladderPhrase.js` | **new — BUILT 2026-08-24.** §11.8 originally put `wrapPhrase` in `ladderFunc.js`; the puzzle needs a lazy corpus load, a phrase pick, the goal arithmetic and a run object as well, which is `ladderRace.js`'s shape, so it got `ladderRace.js`'s treatment: its own module. Exports `loadPhrases`/`pickPhrase`/`wrapPhrase`/`createPuzzle`/`nextRungToward`/`phraseSurface` |
| `ladderFunc.js` | **BUILT** — `shelfFor` gained an optional **`pin`** (§11.6). Free play passes none |
| `utils/utils.js` | **BUILT** — `case "ladderPuzzle":` in `addSpansAndIdsForWordPlay` (a no-op: `wrapPhrase` needs the whole puzzle, not a bare string, so it runs in `index.js` first, as Word Race's field does); `protectedArticles` + `spoonerism` suppressed via the shared `preMarked` flag |
| `punctuators.html` | **BUILT** — `<option value="ladderPuzzle" data-dev>Restore the Phrase</option>`, dev-gated exactly as Word Race is (§12.8). The puzzle card that replaces the text box is M8 |
| `index.js` | **M6 BUILT** — the `ladderPuzzle` branch in the `removePuncButton` handler, `NO_SENTENCE_MODES` (the box is hidden for this mode and Word Race alike), the run state + `phrasePinFor`/`notePhraseLanding`/`lockPhraseWord`/`phraseWin`/`fixArticleBefore`, `_phraseLock`, and the two hooks in the free-play path (`openShelfFan`'s pin, `landOnRung`'s scorer). **Still M7/M8:** win card, daily + stats + share, `PRACTICE_ENABLED`, the late hint, give-up, `updateCharacterModal("ladderPuzzle")`. **Plus one line each way for the map (§13.8/§13.13.3): `ladderMapLock("finish today's puzzle to open the map")` on daily start, `ladderMapUnlock()` on finish — M7, since there is no daily to lock against yet. Practice never locks.** |
| `index.css` | **BUILT** — `.phrase-word` (the dotted mark), `.ladder-locked` + its ✔ flare, `#output.phrase-mode`/`.phrase-solved`. The puzzle card and the win/share card are M8 |
| `CLAUDE.md` | the Punctuators row per milestone |

### 11.9 Milestones

**M5 — the corpus + build. BUILT 2026-08-22**, bar the prune. `phrases-source.txt` drafted (108 phrases,
149 braced words), `build-ladders.py --phrases` written with its checks (§11.5), `phrasePOJO.js` generated
(108 puzzles, 24 KB — 97 words broadened, 52 narrowed, 39 puzzles needing both heroes). **Open:** the dev's
sense-prune, reading the `#~ =` line under each phrase, and the `BANNED_RUNGS` cleanup from §11.4. Gate:
every surviving puzzle reads right *in the sense the saying means*. Ships nothing playable.

**M6 — the mode. BUILT 2026-08-24, DEV-ONLY** (`data-dev` on the `<option>`, the gate Word Race already
uses) while it is played in. The `<option>`, `ladderPhrase.js`, article/Foon suppression, goal + lock + win
check. Playable, and it **deals a different puzzle every Pow!** rather than the hardcoded one this milestone
originally planned — M6 *is* the practice path (§11.2), and sweeping the corpus at random is how the phrases
still wanting the sense-prune get found. No daily, no stats, no share, no card.

Three things settled by building it, all recorded above: **Keen fans** rather than walking the authored
chain, which turns the chain into a score-keeper and forces `shelfFor`'s **pin** (§11.6); a **wasted move**,
not a wasted shot, is the score; and the mode reuses the free-play span outright, so there is **no second
ladder path through `animate()`** — two hooks in the existing one carry the whole puzzle.

Verified against the shipped pair before any of it ran in a browser: all **149** braced words wrap, all
**108** puzzles solve by landing every goal, every narrowing step's answer survives into a 7-slot fan, and
the live-hierarchy distance agrees with the authored chain distance on every fix.

**M7 — the daily.** Selection, the lock, stats/streak, the share string, the practice flag.

**M8 — the feel.** Win card with the saying + origin, the ✔ lock flare, the late hint, give-up, the
How-to-Play modal copy (`updateCharacterModal`, `index.js:458`).

### 11.10 Open questions

- ~~Who writes the 100 phrases?~~ **Settled 2026-08-22** — drafted for the dev to prune (§11.3).
- ~~Does a solved word lock?~~ **Settled 2026-08-24 — yes, built that way** (§11.6): the `id` is cleared, so
  a stray shot can't undo progress and the Hint button lights only what's left.
- **Does the fan stay?** Open until M6 has been played. It went in on the dev's call ("try the fan, and if
  it's too difficult go to the fixed data"). What to watch for: a wide shelf where the answer is one of seven
  plausible siblings is a *guess* rather than a judgment, which would be the wrong skill — §11.1's lesson is
  noticing the **direction**, not identifying the exact kind. Reverting means dropping the pin and having
  Keen call `landOnRung` with `nextRungToward` directly; nothing else in the mode depends on it.
- ~~**Label.**~~ **Settled 2026-08-24 — shipped as `Restore the Phrase`.** `The Saying Machine` and `Say It
  Again` were also considered; both hide the mechanic.
- **Does the win card teach the origin?** Costs one authored field per phrase and makes the mode
  incidentally educational about the sayings themselves. Recommending yes, since it's free at authoring time.

---

## 12. Phase 3 — Word Race (the traversal daily) & Deep Dive

**Word Race specced 2026-08-22. M9 (the engine) BUILT 2026-08-24; the `<option>` is DEV-ONLY behind
`?dev=1` while it is worked on. Development is ACTIVE, but the next work is §12.8's fix list — the dev's
play-test notes, of which **Notes 1 (the goal display) and 2 (the move box behind Keen's shot) are BUILT
2026-08-24** — not M10. Deep Dive (§12.4) still tentative. Both assume M2–M4 (free play) have shipped
— they reuse the two heroes and the rung animations whole.**

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
| **Going down** | **Keen Arrow shoots the word you're standing on** and that opens the box (§12.8 Note 2); type a candidate; if it's valid it spawns as a floating span and **Keen shoots that** to travel. |
| **Input box** | The existing sentence box at the top of `punctuators.html` is **repurposed** as the move box rather than hidden (§11.6 hides it). Almost no new UI. Since §12.8 Note 2 it is on screen only between Keen's two shots. |
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

#### `ladderAlt` — measured, then built. BUILT 2026-08-24 (M9)

§12.7 said *measure before committing*, so it was measured before a line of engine code was written.
Emitted in `ladderDown`'s own parent→children shape, the first cut came to **158 KB raw / 65 KB gzipped**
— 47% of `ladderDown`'s size, well under the "if it lands anywhere near 337 KB the answer changes"
threshold. It fixed **5 of the 9** probe guesses that the main map currently rejects (`oak` `maple`
`birch` at `tree`, `chicken` at `bird`, `tuna` at `fish`), leaving 22 that already worked.

**The prune §12.7 floated as the cheaper alternative was measured and rejected.** Keeping only edges
with *both ends in `2of12.txt`* — the same familiarity floor §12.3 puts on the daily pool — saved just
**9%** (143 KB) while losing coverage. Alt edges are already overwhelmingly between familiar words, so
the second concept bought nothing.

**What the measurement did change is the content, and it is the part worth remembering.** The first cut
was half junk, because WordNet files two very different things under "another sense":

```
a second view of the SAME thing   oak.n.01 the tree (c=3) / oak.n.02 the wood (c=1)      KEEP
                                  chicken the bird (c=16) / chicken the meat (c=10)      KEEP
a metaphor, or a slur             dog.n.01 the animal (c=42) / frump.n.01 a person (c=0) DROP
                                  plant (c=63) / a person planted in an audience (c=0)   DROP
```

Unfiltered, the map cheerfully asserted that a **dog, a cow, a snake and a plant are all kinds of
PERSON**, and `action` (389 children), `person` (219) and `knowledge` (185) were the widest shelves on
it — every one an obscure or figurative reading nobody types. The discriminator is that the junk pairs a
*dominant* best sense with a **zero-evidence** alt sense, while the real ones keep a real share of the
word's corpus count. So an alt sense must carry **≥20% of the word's best-sense count**
(`ALT_MIN_SHARE`), a share rather than a floor because the pair is what matters: 0.2 keeps every good
probe (lowest, `orange`, is 0.25) and drops every bad one (highest, `way`→`action`, is 0.10). A word
whose senses *all* have zero evidence keeps its edges — there's no reason to prefer its main sense
either, which is how `_best_noun_sense` already treats that case.

Filtered: **98 KB raw / 41 KB gzipped, 5,827 words / 7,538 edges** — 38% smaller than the first cut,
with **identical acceptance on all 31 probes** and the lies gone.

**It ships as its own file, `ladderAltPOJO.js`, not folded into `ladderPOJO.js`** — a deliberate
departure from §12.5's wiring table. Free play, Restore the Phrase and the Tree of Kinds all read the
main corpus and none of them want this, so only the race pays the 98 KB, and it is already behind a
lazy import.

#### The four `ladderAlt` cannot fix — a second, harder class. FOUND 2026-08-24

Diagnosing the probes alt *didn't* fix turned up a failure this section had folded into the sense trap
but which is a different thing entirely, and **unfixable by any amount of alt data**: some relations a
player is certain of **do not exist anywhere in WordNet, in any sense**.

```
tulip   → plant  (bulbous_plant → liliaceous_plant)   `flower` is NOWHERE above it
rose    → shrub                                        `flower` is NOWHERE above it
redwood → wood   (also sequoia → cypress)              `tree`   is NOWHERE above it
racer   → animal | car | snake | driver                every sense is a real thing, none is a person
```

A tulip is not a kind of flower in WordNet — it is a bulbous plant, and `flower.n.01` sits on a different
branch. So `oak`-at-`tree` (fixed by alt: a real second sense exists) and `tulip`-at-`flower` (unfixable:
no sense of tulip is under flower) look identical to the player and are completely different to the data.

This does **not** block the mode, and needs no new data — it lands in the existing **"not a kind of it"**
rejection, which is honest as far as the corpus goes. It matters for two things downstream:
**§12.3's pair selection must never sit a target one hop from a hole like this** (a race whose last move
is "type a kind of flower" is unwinnable for a player who reaches for `tulip` or `rose` first), and it is
the strongest argument for **easy mode's decoy field** being more than a concession to younger players —
a field of real children can't be argued with. If it ever needs a real fix, the shape is a small hand
table (`FLOWER_ALSO = tulip rose …`), not a generated map; nothing was authored now because the size of
the problem is unmeasured beyond these four.

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
| `build-ladders.py` | **`--alt` BUILT 2026-08-24** — emits `ladderAltPOJO.js` (§12.2). Reads the shipped `ladderPOJO.js` like `--phrases` (so an alt edge can never name a rung the game lacks) but *does* need WordNet, since the point of it is the senses the main map threw away. `climb_from` was split out of `parent_of` so both passes share one copy of the BFS climb. |
| `ladderAltPOJO.js` | **new, generated — BUILT 2026-08-24**, 98 KB / 41 KB gzipped. **Its own file, not folded into `ladderPOJO.js`** as this table originally planned — only the race wants it (§12.2). |
| `racePOJO.js` | **new, generated** — the frozen daily pair list (§12.3). **M10.** |
| `ladderRace.js` | **new — BUILT 2026-08-24 (M9)** — the traversal engine: `ancestorsOf`/`rootOf`/`depthOf`/`sameTree`, `lowestCommonAncestor`, `parFor`, `descentFrom` (main + one alt hop), `classifyGuess` → the five `GUESS` classes, `canDescend` (§12.8 Note 2 — main children *or* an alt child, from the parents-only `Set` built beside `ALT`), `decoysFor`, `raceFieldHTML` (the bottom slot starts empty/`hidden`/id-less and `RACE_DOWN_ID` starts on the middle word), and `createRace()` holding the run. Borrows `ladderFunc.js`'s already-loaded corpus rather than parsing a second copy; `Map`/`Set` throughout. |
| `utils/utils.js` | **BUILT** — `case "wordRace":` (the field arrives pre-marked, so nothing to wrap); `protectedArticles` and `spoonerism` both suppressed, as §11.6 does. |
| `punctuators.html` | **BUILT, DEV-ONLY** — the `<option value="wordRace" data-dev>` (stripped from the dropdown unless `?dev=1`, see M9) and `#race-goal` inside `#input-container` (§12.8 Note 1; it replaced `#race-banner`, which was never visible). The move box is the existing sentence input, hidden when the mode is picked and, since §12.8 Note 2, kept hidden until Keen Arrow asks for a word. The win card is M11. |
| `index.js` | **BUILT (M9)** — the race block (field binding, the move box, the three rejections, `raceTravel`, `raceShootUp`/`raceShootDown`), `GeneralIzationRace`/`KeenArrowRace`, two collision branches, the race branch in the `removePuncButton` handler, the goal display (`drawRaceGoal`/`previewRaceGoal`/`paintRaceGoal`/`clearRaceGoal` + the `wordPlayOptions` `change` listener that swaps box for goal, §12.8 Note 1), and Keen's two-meaning shot (`raceArmed`, `aimKeenAt`, `paintMoveBox`, `raceAskForKind`, §12.8 Note 2). **Still M10/M11:** daily + stats + share, the hint ladder's chrome, and one line each way for the map (§13.8/§13.13.3): `ladderMapLock("finish today's race to open the map")` on daily start, `ladderMapUnlock()` on finish — the map is a routing atlas and this is the mode it would solve. |
| `index.css` | **BUILT** — `#output.race-mode`, the three `.race-word` spans, `.race-word[hidden]` (§12.8 Note 2), `#race-goal` + `#input-container.race-on` (§12.8 Note 1). The win/share card is M11. |
| `CLAUDE.md` | the Punctuators row per milestone |

### 12.6 Milestones

**M9 — the engine. BUILT 2026-08-24, and DEV-ONLY from the same day.** The `<option>` carries `data-dev`
and is stripped from the dropdown unless the page is opened with `?dev=1` (the gate is in
`punctuators.html`'s dropdown IIFE, and has to run *before* the custom dropdown is generated from
`sel.options` — hiding the `<option>` with CSS would leave its generated `.custom-select-option` on
screen). The gate is a work-in-progress guard, not a shelving: **the next work on this phase is §12.8's
fix list**, which came out of the first play of M9 and starts with the fact that the mode never told the
player where they were going — **its Notes 1 and 2 are BUILT 2026-08-24** (the goal display replacing the
edit box; the edit box then returning only when Keen Arrow shoots the word you stand on), and more notes
are expected.

`--alt` in the build → `ladderAltPOJO.js`, `ladderRace.js`,
type-to-summon + shoot-to-travel, the three rejections, descendant jumps. Playable against the hardcoded
`poodle ⟶ salmon` (par 5), no daily, no chrome. **Verified against this doc's own numbers:** all six
sample pairs in §12.3 compute the par printed there (5·5·6·4·2·2), and the guess classes behave —
`beagle`@`dog` = 2 rungs via main, `oak`@`tree` = 1 rung via alt, `mammal`@`dog` = broader,
`cat`@`dog` = unrelated, `chihuahua`@`dog` = unknown.

Five things came out differently from the spec:

- **`ladderAlt` ships as its own file and gained a quality filter** — measured first, as §12.7 demanded.
  See §12.2's `ladderAlt` subsection: 98 KB, the both-ends-in-`2of12` prune rejected, `ALT_MIN_SHARE`
  added because the unfiltered map asserted that dogs and cows are kinds of person.
- **The heroes are two extra instances, not two new classes.** `GeneralIzationRace`/`KeenArrowRace`
  subclass the free-play pair and change only `targetId`, so art, colours, the broadsword and all six
  SFX come along untouched.
- **The race splits the heroes across TWO span ids** (`RACE_UP_ID`/`RACE_DOWN_ID`) where free play has
  them share one (§4). A race puts two different words on the field at once and each hero must reach
  only its own; the existing `id === (targetId ?? symbol)` gate then does the separation for free, with
  no new collision code. In free play both heroes act on the same word, which is why sharing is right
  there and wrong here.
- **The field needed no `nodeArr` bookkeeping at all**, unlike §2.5's fan. Three spans rendered once
  through the normal path and thereafter only *rewritten* (textContent + dataset) are never detached, so
  there is nothing to push, nothing to splice, and no all-zero-rect phantom to guard against.
- **A fifth rejection class was needed:** `GUESS.SAME`, for typing the word you are standing on. §12.2's
  three are about words that are elsewhere; this one is about a word that is nowhere to go.

**The footgun this milestone hit — a wrapper span empties the team.** The field was first written as
three spans inside one `.race-field` container, for the column layout. That is the same white-screen
failure as the two footguns already on record: **a `MutationRecord`'s `addedNodes` lists only the nodes
inserted *directly* into the observed parent**, never the descendants of an added node, so `nodeArr`
would have received the wrapper alone — the two shootable words invisible to collision,
`heroToTheRescue` returning an empty team, `player` undefined, `animate()` throwing every frame. The
three spans are now **top-level siblings** and the column lives on `#output.race-mode`. Caught before
the browser saw it, and now commented at `raceFieldHTML`.

**One fix that reaches every mode:** the global `keydown` handler that walks and fires the hero had **no
target check**, which was harmless only because every other mode sends the input box away when a round
starts. Word Race keeps it (it *is* the move box), so `a`, `d` and the arrows would have driven the hero
while the player typed. It now ignores events from an `input`/`textarea`/`contenteditable`. §12.8 Note 2
is the other half of the same problem: the guard stops typing from *moving* the hero, and blurring the
box after a summon stops the focused box from *swallowing* the shot.

**M10 — the daily.** `racePOJO.js`, selection, lock, stats/streak, share, give-up, the hint ladder.

**M11 — the feel.** Race card, target banner, the travel animation reusing M4's, easy mode's decoy field,
the How-to-Play copy — **and the post-game route overlay** (§13.8, moved here from M14 on 2026-08-23: the
route is this mode's artifact, so it cannot be built before the mode is).

**Deep Dive is unscheduled** (§12.4) — it needs M9 only, so it can be prototyped any time after it.

### 12.7 Open questions

- ~~**Is `ladderAlt` worth its bytes?**~~ **CLOSED 2026-08-24 — yes, at 98 KB in its own file.** Measured
  before any engine code (§12.2's `ladderAlt` subsection): 47% of `ladderDown` at first cut, 29% after the
  `ALT_MIN_SHARE` filter, fixing 5 of 9 lying rejections. The curated accept-list alternative wasn't needed;
  the both-ends-in-`2of12` prune was measured and rejected at 9% savings.
- ~~**Does the field layout work?**~~ **CLOSED 2026-08-24.** A traversal screen turned out to be *easier*
  than the sentence, not harder: three fixed spans, rewritten in place, no absolute positioning and no
  `nodeArr` bookkeeping (see M9's notes). The one trap was the wrapper span, also recorded there.
- ~~**Typed input vs. the shooter's own keyboard.**~~ **CLOSED 2026-08-24** — Enter summons from the box,
  and the movement handler now ignores keystrokes aimed at an input. The predicted "Space/Enter fires" rule
  wasn't needed: ↑ still fires, because the box no longer competes for the arrows.
- **New, from M9 (§12.2): the relations WordNet simply lacks.** `tulip`/`rose` are not under `flower`,
  `redwood` is not under `tree`, in any sense — so no alt data can fix them. It doesn't block the mode
  (they land in "not a kind of it"), but **§12.3's pair selection must not put a target one hop from a
  hole like this**, and the size of the problem beyond those four is unmeasured.
- **One `<option>` or two?** Word Race and Deep Dive are one engine and two goals. Recommending two
  options, matching §11.2's "its own `<option>`, no branching inside another mode".

---

### 12.8 Play-test notes — the fix list

**Opened 2026-08-24 after the first play of M9.** The dev's notes from playing it. **Notes 1 and 2 are
BUILT (2026-08-24)**; more notes are expected. M9 stays **dev-only** (`?dev=1`) while the list is worked
through.

#### The finding that opened it: the goal is never communicated

The dev played M9 and reported it as *not the game they thought we were making* — they expected "get from
one word to another in the fewest moves", **which is exactly what §12.3 specs and what M9 built**. Nothing
about the mechanic was wrong. **The player was simply never told to head for `salmon`.** That is the whole
gap, and it is worth stating plainly because the same symptom would otherwise read as a design failure and
send the mode back to the drawing board: *a traversal game whose destination isn't on screen is
indistinguishable from aimless word-climbing.*

**Root cause, found in the markup rather than the logic.** `#race-banner` — which carried
`poodle ⟶ salmon · Par 5` — was painted correctly by `paintRaceBanner()` on every move. It was just **the
only in-flow element among out-of-flow siblings**: `#sentence-container` is `position: absolute`,
`#input-container` is `position: fixed`, and the title `.shine` is `position: fixed; top: 80px`. So the
banner landed in normal document flow at the top of `<body>` — *underneath the fixed title* — and was
effectively invisible. It was never seen, so the goal was never seen. It was **not** fixed in place,
because the dev's first note supersedes it entirely:

#### Note 1 — replace the edit box with the start and target words. BUILT 2026-08-24

> *"When the Word Race is selected the edit box should be replaced with the word start and ending word."*

**As built:** picking Word Race in the dropdown hides the sentence box and paints `#race-goal` in its
place — the route (`poodle ⟶ salmon`, each word in its hero's colour) over a second line carrying the
rule. Pressing *Pow!* switches the second line to `Par 5 · 2 moves · …`, and the box comes back beneath
the display as the move box. **`#race-banner` is retired**, its markup, CSS and `paintRaceBanner()` gone.
*(Note 2, below, then narrowed "comes back" to "comes back when Keen Arrow asks for a word" — the display
itself is unchanged and still holds the box's old place for the whole run.)*

Why this shape, and worth keeping:

- **It puts the goal where the player is already looking.** `#input-container` is `position: fixed` and is
  the last thing the player interacted with — they clicked *Pow!* there a moment ago. It is the one region
  of the screen guaranteed to be in view, which is precisely what `#race-banner` was not.
- **It gives the box's space a job at the only moment the box has none.** M9 repurposes the sentence input
  as the move box (§12.2), but that is a *mid-run* role; at the moment the race starts there is nothing to
  type yet, and an empty text field reads as "type your sentence here" — the exact wrong instruction.
- **The two coexist once the run starts** — the open question in this note, settled the way it leaned: the
  display above, the box below. The destination is worth keeping on screen for the whole run, since its
  absence is what caused this note. So the display absorbs par, moves and detours and the banner goes;
  two places showing race state would have been one too many.

**The one thing that isn't a one-liner:** the display is a full-width flex item inside a flex *row*, so it
needs `flex-wrap`, and the wrap is switched on by a `.race-on` class rather than living on
`#input-container` unconditionally — on a narrowish desktop the row is already a hair wider than its 70%
container, so wrapping by default would drop the *Pow!* button onto a second line **in every mode**.
`#race-goal:empty { display: none }` keeps it out of the flow the rest of the time.

**The swap fires on the `change` event**, which covers both the native `<select>` and the custom dropdown
that hides it (the dropdown dispatches `change` after setting `sel.value`), and it is guarded by
`raceActive()` — mid-run the dropdown is hidden, so there is nothing to swap.

#### Note 2 — the move box appears only when Keen Arrow asks for a word. BUILT 2026-08-24

> *"The edit box should only appear after Keen Arrow has hit a word and the more specific word needs to
> be typed."*

**The ambiguity was put to the dev and settled: Keen's shot on the word you are STANDING on is the ask.**
So a descent is now two of his shots and a word between them, and the box exists only for the middle
step. The full move set:

| Where you are | What you do | What happens |
| ---- | ---- | ---- |
| standing on `dog`, box hidden | General shoots the rung above | you travel to `mammal` |
| standing on `dog`, box hidden | **Keen shoots `dog` itself** | the box opens, focused: *a kind of dog?* |
| box open | type `beagle`, Enter | `beagle` spawns below; **focus leaves the box** |
| word summoned | Keen shoots `beagle` | you travel — box closes, slot empties and hides |

**Why this and not "the box appears when Keen is the selected hero"** (the reading §12.8 originally
guessed at): a box that appears on Switch Character appears because of a *menu*, and the player still has
to work out that it wants a kind of the word they're on. A box that appears because a shot landed on the
word says which word it is asking about, in the only vocabulary this game has. It also gives Keen
something to *do* on a field where, until you have typed, he has no target at all — which is what made
reading 2 of the original note circular.

**What that costs and why it's affordable:** a descent now takes two shots instead of one. Shots are not
the score — **moves** are (§12.3) — so the extra shot buys the box its trigger for free. It does mean
Keen's shot means two different things in sequence, which §2.5 explicitly refused for *free play* ("one
hero's one action must not mean two things"). The difference is that free play's two meanings were
**indistinguishable once drawn** — narrow, or sidestep, on identical-looking words. Here they are
distinguished by the field itself: with nothing summoned there is exactly one thing to shoot at, and it
is the word you're standing on.

Three things in the build worth keeping:

- **Keen's span id MOVES**; it is not on both spans at once (`aimKeenAt` in `index.js`). The bottom slot
  starts empty, id-less and `hidden`, and `RACE_DOWN_ID` starts on the middle word instead — which it
  must, because `heroToTheRescue` builds the team once from the ids present, so an id that only appears
  later leaves **Keen Arrow out of the race entirely**. Same family as the wrapper-span footgun: the
  team is assembled from the DOM at one instant, and anything not there at that instant does not exist.
- **The summon blurs the box.** The global movement handler ignores keystrokes aimed at an input (M9's
  one fix that reached every mode), so leaving focus in the box after Enter means `↑` cannot fire the
  shot the message has just asked for. This was already true in M9 — the box was focused on *Pow!* and
  the player had to click away before their first shot — and it is only visible now because focus is
  something this note deliberately moves.
- **`canDescend()` is asked before the box opens.** A word with nothing under it clanks (capstone flash
  + `_ladderCapstone`, "nothing is a kind of X — go broader") rather than opening a box for an answer
  that cannot exist. It has to consult the **alt** map as well as the main one, since a word can be a
  main-map leaf and still be alt-descendable (`tree` reaches `oak` only by an alt edge) — hence the
  parents-only `Set` built alongside `ALT` in `loadRace`.

**The placeholder §12.2 wanted is gone with it.** The faint `type a narrower kind` was there so an empty
slot would hold its place and stop the field shifting under the player's aim; hiding it turned out to
cost nothing, because it is the **last item of a top-anchored column**, so removing it moves nothing
above it. `.race-word[hidden]` needs its `display: none` spelled out — `.race-word` sets
`inline-block`, which outranks the UA rule for `[hidden]`.

**One line replaces it.** With the box gone at the start of a run there was nothing on screen saying how
to move at all, so the status line opens the race by naming both directions: *"General Ization shoots the
word above to broaden — Keen Arrow shoots your own word to narrow it."* Every message after that one is
written by play.

#### Still to come

The dev has more notes. Nothing in this section is scheduled against M10 or M11 yet; when the list is
complete it should be triaged into them, and this section pruned to whatever rationale is still load-bearing
(per the repo's lean-docs rule — git holds the history).

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
| **< 3 px** | **One dot, coloured by the subtree's lit fraction** — or gold outright if its shelf is filled (§13.6). Children are not drawn at all. |
| **3–20 px** | The circle, its shelf arc, and its children as dots. Internal nodes get a label only if it fits. |
| **> 20 px** | Circle, arc, label, children, and the written shelf counter (`dog 7/33`). |

**M13 note:** the **arc** (added to every circle, both middle tiers) carries the shelf metric, not the
written counter — most of the map is spent between 3 and 20 px, where `7/33` does not fit and a ring
still reads.

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
- **Skeleton nodes are always named.** They are the coastline; without them the map is unnavigable and the
  fog is just a blank page. **Skeleton means a word with two or more kinds** — not merely "internal", which
  is what this said until 2026-08-24 and which leaked answers; see below.
- **Leaves are anonymous buds** until visited. A shelf shows its lit children by name and its dark ones as
  plain dots, with the remainder as a count (`+26`).
- **A visited word lights permanently** and keeps its name. Visiting is landing on a rung in any mode —
  including the rungs you pass *through* on a §12.2 descendant jump, which cross real rungs and should pay
  for all of them.

#### Skeleton means TWO OR MORE KINDS — found in play and FIXED 2026-08-24

**Reported from play:** open `kinsman 0/4` and the map has already told you three of the four answers.
Its children are `brother, nephew, uncle, brethren` — and `brother 0/1`, `nephew 0/1` and `uncle 0/1` are
all **named**, because each happens to have exactly one child of its own and the rule above names every
internal word. Only `brethren`, the true leaf, is fogged. You can read the shelf off the picture and go
shoot it.

The rule was chosen on the theory that internal words are the **coastline** — the named skeleton you
navigate by. That holds for `animal` or `dog`. It does not hold for a word whose entire "branch" is one
child: that is a leaf with a tail, and naming it is just printing an answer.

**Measured, and the number is one we already know:** **1,623 of the 4,837 internal words (33.6%) have
exactly one child** — the very same third that forced M13's `SHELF_MILESTONE_MIN` floor (§13.6). Across the
map, **3,835 child names are readable** off unvisited shelves, and **1,367 of those (36%) are single-child
parents**; **1,459 shelves leak at least one name** this way.

**The rule, as fixed:** **skeleton means two or more kinds.** A word with exactly one kind draws its
circle and its shelf arc like anything else but carries **no name and no counter** until you land on it —
it is fogged exactly like a bud. Verified after the change: `kinsman 0/4` fogs all four children, and the
readable-name count drops **3,835 → 2,468**. The 2,468 that remain are multi-child parents; those are
§13.2's trade, not a bug.

**It is one predicate now**, `isNamed(i) = isSkeleton(i) || visited`, used by every place that can print a
word — the canvas labels, the hover readout, the breadcrumb and the share string. It used to be spelled
inline as `KIDS[i] || visited` in two of those places, which is how the hole stayed invisible.

Four things the fix had to settle:

- **The breadcrumb's best property was that it can never need redacting** (§13.13.1) — every ancestor has a
  child, so every ancestor was internal, so every ancestor was named. This takes that away, and
  `kinsman › brother › an unvisited kind` would hand over the exact name the map just stopped printing. So
  a fogged ancestor is fogged in the breadcrumb too, drawn as a dim `•` that keeps its place in the chain
  — **unless the hovered word's own name is on screen**, in which case you can type that word and broaden
  from it, so everything above it is at most one General Ization shot away. Naming a chain you can already
  walk is not a spoiler. Measured: **1,829 of the 30,545 words** now have a hidden rung in their
  breadcrumb, and it reappears the moment you reach the word below it.
- **Only the name hides, never the circle.** Containment *is* the layout; a word that stopped being drawn
  would take its children with it. The shelf arc still turns on a fogged word — an arc spells nothing.
- **It costs a third of the coastline** (1,623 of 4,837 named nodes), and **256 of the 1,002 roots go
  anonymous** — but every one of those is a shrub: the largest is 13 nodes, and the largest fogged word
  anywhere is `specie` at 19. So no navigable region loses its label. This overlaps the shrub-trees
  question below; whether the rim now reads as clutter is the thing to look at.
- **The share string was already safe, and is now safe by construction.** It names only roots, and
  **0 of the 88 roots in its ≥50-node pool are single-child parents** — but `bestTree()` gained an
  `isNamed()` guard anyway, so a corpus rebuild cannot make the share print a word the map is fogging.

### 13.6 Shelves — BUILT 2026-08-23 (M13)

- A shelf is `ladderDown[parent]` and its progress is `lit / total`, derived from the visited set at render
  time. **Nothing about shelves is stored** — the visited set is the only state. On the map both counts fall
  out of one post-order pass in `relight()`: `LIT` (whole subtree, which colours the heat map) and the new
  **`KLIT`** (this word's own children — the shelf). `SELFLIT` exists because `LIT` cannot be asked whether
  one particular word is lit; it is a total, so a parent with lit descendants and a dark name reads
  identically to one with a lit name. Post-order means the shelf count costs **one Set lookup per node**.
- **Milestones at 25 / 50 / 100%**, matching the Atlas continent milestones (`docs/inklings-atlas.md`) and
  keyed off fractions for the reason in §13.3 (a third of the corpus is effectively untypeable).
- **A shelf needs ≥5 children to announce a milestone** (`SHELF_MILESTONE_MIN`). This is the one thing the
  build had to add, and it is a measurement, not a taste call: **1,623 of the 4,837 shelves (33.6%) hold
  exactly one child** and 70.7% hold four or fewer, so the unguarded rule fires *"every kind!"* on a single
  arrow for a third of the map, which devalues the gold everywhere else. The floor is derived rather than
  picked — a milestone one shot can reach is not a milestone, so require `1/total < 0.25`, giving **5**.
  1,416 shelves can announce; the rest still count, still turn gold, and simply don't interrupt play.
  Each qualifying shelf fires **at most three times ever** (`dog`'s 33 at the 9th, 17th and 33rd).
- **A completed shelf turns gold** and its parent stays gold when zoomed past, so a filled region is
  visible from orbit — at tier 1 a done shelf takes the top of the existing ramp, so "done" costs a bucket
  index rather than a colour and the 33-`fill()` batching is untouched.
- **The arc is the part that carries the metric**, not the counter. Most of the map lives between 3 and
  20 px, where there is no room to write `7/33` but plenty to read a ring: each parent's own stroke gets a
  gold arc from twelve o'clock covering `KLIT/children`, so a full ring reads as a finished shelf from
  across the forest. The written counter joins it at label zoom, along with a line in the hover readout and
  a second headline number in the panel bar (`… · 42 of 4,837 shelves filled`).
- **What a milestone pays stayed cosmetic (§13.12), but *where* it is announced changed.** The plan had
  the milestone as a thing you discover next time you open the panel; a milestone nobody sees at the moment
  they earn it is barely a milestone, so it is announced **in play** — a gold banner above the word
  (`★ 9 of 33 kinds of dog · a quarter of them`) plus a seventh SFX (§7). The map is where it is *recorded*,
  and the fan's caption carries the running count (`kinds of dog · 7/33 found · +26 more`) so the number is
  in front of you while you play rather than only in the panel.
- **The banner goes ABOVE the word** because §2.5's fan owns the space below, and the two are on screen
  together constantly: the shot that fills a shelf is usually the same shot that opens the next one.
- **Nothing can fire twice.** `ladderMapVisit()` already returns true only the first time a word lights, so
  the milestone check hangs off that return value and re-shooting a lit word is silent.

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

**Amended 2026-08-23 (§13.13):** these two halves were scheduled together in M14 and have been split. The
**lock is map-side** and ships dormant with M14 — `ladderMapLock(reason)`/`ladderMapUnlock()`, so a daily
adds one line rather than a feature. The **route overlay is not map-side**: a route is the racing mode's
own artifact, and with no §12 engine there is nothing to draw, so it leaves M14 and goes to whichever
daily ships first (§12 recommended — a restore has no path, only a shot count).

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
| `ladderMap.js` | **new — BUILT 2026-08-23** — `buildForest()`/`packForest()` (one pass on first open), the LOD draw, pan/zoom/hit-test, the visited set + storage, and the `ladderMapVisit()` seam. No new data file. **M13 BUILT** — `SELFLIT`/`KLIT` + `shelfDone()` in `relight()`, the gold arc in `drawNode`, the `7/33` counter in `drawLabels`, the done-shelf gold at tier 1, the shelf line in `readout()` and the shelves-filled number in `paintStat()`. **M14 BUILT** — the ancestry breadcrumb, the share string, the help card and the dormant daily-run guard; see §13.13.5 |
| `ladderFunc.js` | **M13 BUILT** — `shelfProgress()` (lit/total against a passed-in `seen`, same independence-from-the-map discipline as `shelfFor`), `SHELF_MILESTONES` and `shelfMilestoneCrossed()` with its measured `SHELF_MILESTONE_MIN = 5` floor (§13.6) |
| `index.js` | **BUILT:** `initLadderMap()` + the button wiring; **and as of M3**, `ladderMapVisit()` on every rung landed on (including the one you were standing on, so the word you typed lights the first time you shoot it). The `ladderMapHas()` read-back that steers the game (§13.7) now lives in `ladderFunc.js`'s `shelfFor`, where it orders the shelf fan's row. **M13 BUILT** — `noteShelfProgress()` (hung off `ladderMapVisit`'s newly-lit return in both `landOnRung` and `climbLadder`), `showShelfMilestone()`/`clearShelfMilestone()`, the `7/33 found` term in the fan caption, `_shelfMilestone()` (§7) and the How-to-Play tip. **Still to do:** the daily-run guard (§13.8) — M14; passed-through rungs on a §12.2 jump — needs Word Race |
| `punctuators.html` | **BUILT** — the 🌳 button + the overlay markup. *Not* a `.modal`: that pattern is capped at 500 px and centred by transform, and a map wants the whole window. **M13** added the `.tree-map__key` legend line under the controls hint |
| `index.css` | **BUILT** — the panel, the bar, the canvas, the hover readout. **M13 BUILT** — `.shelf-milestone` (+ `.complete`) and its two keyframes, `.shelf-fan-caption.done`, `.tree-map__key`, and the phone + reduced-motion cases for the banner |
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

**M13 — the fill. BUILT 2026-08-23.** Shelf counters, the 25/50/100% milestones and the gold state. (Fog
rules and storage landed in M12.) Two things came out differently from the plan, both recorded in §13.6:

- **The milestone is announced in play, not on the map.** The plan's cosmetic v1 was the gold ring, a
  counter in the panel header and a line in the share string — all of which are things you find later. A
  milestone nobody sees at the moment they earn it is barely a milestone, so it fires where the shot lands:
  a gold banner above the word plus §7's seventh cue. The map still records it; it is no longer the only
  place it exists. The fan's caption carries the running `7/33 found` for the same reason.
- **Milestones needed a floor, and the corpus set it at five.** 33.6% of shelves hold exactly one child,
  so the unguarded rule congratulates you on completing a "shelf" on a third of all first shots. Requiring
  that one arrival cannot already cross 25% derives the floor rather than picking it.

The **arc** turned out to be the load-bearing half of the display and the written counter the secondary
one, which is the reverse of how §13.4's LOD tiers describe it: the counter only exists above 20 px, and
most of the map is spent below that.

**M14 — the feel. BUILT 2026-08-23, see §13.13.** Two of its four items turned out to be blocked on
dailies that do not exist, so M14 shipped the half that isn't: the breadcrumb, the share string, the map's
own help card, and the daily-run guard **built dormant** with no caller. The post-game route overlay moved
out of M14 entirely — a route is the racing mode's artifact, so it belongs to whichever daily ships first
(§12's M11). Two things the build corrected in this plan, both from checking against the shipped corpus:
the worked example used a `canine` rung that `MID_RUNGS` collapses away (`dog`'s real parent is `mammal`,
and that collapsing is *why* a path is six words at worst), and the share string needed pluralising —
`1 shelves` is what a share string must never say.

M12 needed M3 (the heroes) only — it did **not** wait on §11 or §12, and shipping it alongside free play is
what gives free play a reason to be replayed.

### 13.12 Open questions

- **The name.** `The Tree of Kinds` is the recommendation — it echoes the "is a kind of" phrasing used
  throughout this doc and is kid-legible. `The Kindsmap`, `The Great Chain` (accurate, and a real historical
  joke, but obscure) and `The Atlas of Kinds` (collides with Inklings' Atlas) were the alternatives.
- ~~**What a shelf milestone pays.**~~ **Settled 2026-08-23 with M13 — cosmetic, but announced in play**
  (§13.6): a gold banner, a chime, a gold arc and a counter. Nothing is spent or earned. The alternative —
  that this is where Punctuators finally gets a light meta-layer — is still open, and is a much bigger
  conversation than a map; nothing built for M13 forecloses it.
- ~~**Single-child parents are named, and that leaks answers.**~~ **FIXED 2026-08-24 — skeleton now means
  two or more kinds** (§13.5). Worth re-reading next to the shrub question below: it also took the names
  off 256 of the 1,002 roots, all of them shrubs.
- **Are the 810 shrub trees drawn?** They are 8% of the words and half the visual clutter of the forest
  view. Options: draw them all (honest), pack them into a labelled "scrubland" at the rim, or hide trees
  under 5 nodes behind a toggle. Recommending draw-them-all until it's seen on screen.
- **Does it belong in Inklings too?** §14.2's **Kindred Tree** décor is the same idea as a physical object
  in the cozy square, and §14.2's Specificity Range would fill it. Shared `localStorage` across two games on
  one origin is possible but has never been done here — worth a deliberate decision rather than a drift.

### 13.13 M14 — the feel. BUILT 2026-08-23

M14 was written as four items. Two of them are **blocked, not deferred by choice**: §13.8's daily-run guard
and post-game route overlay both assume a **daily**, and neither §11 (Restore the Phrase) nor §12 (Word
Race) has one — both now have game code, but their daily layers are M7 and M10 respectively. So M14 split:

| Item | M14 |
| ---- | --- |
| The breadcrumb (§13.13.1) | **BUILT.** Free play needs it as much as a daily does. |
| The share string (§13.13.2) | **BUILT.** The numbers already existed; only the sentence was missing. |
| The map's help card (§13.13.4) | **BUILT.** The map had no help of its own — one tip inside the *hero* modal was all there was. |
| The daily-run guard (§13.13.3) | **BUILT DORMANT.** The lock is map-side work, and writing it now means §11/§12 add one line rather than a feature. Exercised by `?maplock=`. |
| The post-game route overlay | **Out of M14.** A route is the racing mode's artifact and there is nothing to draw. It went to §12's M11 — an amendment to §13.8, recorded there. |

Nothing here touches the layout, the pack, the LOD tiers or the storage format, so nothing in M14 can move
a circle or lose a lit word.

#### 13.13.1 The breadcrumb — the whole path, not just the parent

Today the readout under the pointer names one hop: `dog — a kind of mammal · lit · 7/33 kinds`. One hop is
the least useful hop, because it is the one the picture already shows — `dog` is drawn *inside* `mammal`.
What the picture cannot show at a readable zoom is where the pointer sits in the whole hierarchy, which is
the thing the mode is about.

**The breadcrumb is the full chain to the root, broad → narrow**, in the readout, replacing the `a kind
of …` clause:

```
animal › mammal › dog   · lit · 7/33 kinds
```

(That is the real chain: `build-ladders.py`'s `MID_RUNGS` collapses WordNet's `chordate`/`vertebrate`/
`carnivore`/`canine` away, which is why a path is six words at worst rather than a dozen.)

- **Broad-first**, because that is the direction the ladder reads in play: General walks left, Keen walks
  right. The specific word — the one that changes as you move the pointer — lands at the end.
- ~~**It can never be redacted.**~~ **Superseded 2026-08-24.** The claim was that every ancestor has a
  child, so every ancestor is internal, so §13.5 names all of them — true of the fog rule as M14 found it,
  and false the moment that rule was tightened to exclude single-child parents (§13.5). A fogged ancestor
  now renders as a dim `•` holding its place, unless the hovered word's own name is on screen. A fogged
  bud still reads `animal › mammal › dog › an unvisited kind`.
- **Measured, so the box has to change.** Depth caps at 5, so a path is at most **6 words** — no truncation
  logic is needed. But the longest real one is **92 characters** (`immorality › unrighteousness ›
  dishonesty › untruthfulness › insincerity › sanctimoniousness`) and the readout is today a single
  `white-space` default line pinned bottom-left. It gets a `max-width` and is allowed to **wrap to two
  lines**; the ancestors render dimmer than the word itself so the line still resolves at a glance.
- It is a DOM node, not canvas, so this is spans and CSS — no change to `drawLabels`.
- **As built, it needed a memo.** `readout()` fires on every `pointermove`, and M14 turned it from one
  `textContent` write into a built HTML string. A `readShown` index guard — the same trick `paintStat()`
  already uses for its 30k-node sweep — rebuilds only when the hovered node actually changes. `relight()`
  resets it, since a word lighting changes the numbers on the line under the pointer.

**"Labels polish" resolves to this and nothing else.** The canvas labels were reviewed and left alone: the
name-plus-`7/33` pair at tier 3 is already what §13.6 wanted, and the tier below it is deliberately mute.

#### 13.13.2 The share string

§13.9 sketched `🌳 Tree of Kinds · 1,204 words · 42 shelves · ANIMAL 31%`. Two of those three numbers are
already computed every time `paintStat()` runs. The third needs a decision.

**Which tree gets named?** Not the one with the most lit words: `person` is **4,415 nodes, 14% of the whole
corpus**, so it would win for nearly every player and the term would neither move as you play nor differ
between two people — which is the entire job of a share stat. Instead: **the best-filled tree of real
size** — the highest lit *fraction* among the **88 roots holding ≥50 nodes**, tie-broken by lit count. The
≥50 floor is what stops a two-node shrub at 100% from taking the slot (465 roots have fewer than 5 nodes).
The term is omitted entirely until something is lit.

- **Spoiler-free by construction, and this was verified rather than assumed.** It names exactly one root;
  a root is a word with no parent, which means it appears in `ladderDown` only as a *key*, which means it
  has children — **measured: 0 of the 1,002 roots are leaves**. So §13.5's fog rule cannot be broken by it.
- **Where:** a `📋` button in the map bar, between ⌖ and ×. Clipboard API with the textarea fallback, the
  same shape as Critter Hunt's `copyShare` (`critter-hunt.html:1092`); the button confirms by swapping its
  own label for a beat.
- **Cost:** the 30,545-node shelf sweep already runs in `paintStat()`, and the root scan is 1,002 entries.
  Both happen on click. Nothing is added to the draw path.

#### 13.13.3 The daily-run guard — built dormant, one caller away

`ladderMapLock(reason)` / `ladderMapUnlock()` out of `ladderMap.js`. While locked:

- `openLadderMap()` refuses, and **a map already open closes** — a lock can arrive mid-session.
- The 🌳 button goes `aria-disabled`, dims, takes a 🔒, and carries the reason as its `title`. Clicking it
  **says why** rather than doing nothing: the label swaps to the reason for a couple of seconds. §13.8 asks
  for "disabled, and says why", and a dead button says nothing.
- Free play never calls it (§13.8).

**Verifiable today without a daily:** `?maplock=<reason>` locks it at load, which is enough to see the
button state, the refusal and the close-on-lock. The production callers are one line each — §11 M7 and §12
M10, on daily start and daily finish — and both wiring tables now say so.

Building it dormant is a deliberate exception to not shipping unused code, on the grounds that it is
*map-side* work: it belongs to the file M14 is already in, and leaving it out means the first daily has to
learn the map's internals to add it.

#### 13.13.4 The map's own How-to-Play

The map has no help. `index.js`'s `ladder` template ends with one sentence about it, which is the right
place to *mention* it and the wrong place to explain it, since you read that modal before you have ever
opened the panel.

**A first-open card over the canvas**, dismissed by a button, plus a `?` in the bar to bring it back. Four
things, all of them things you cannot infer from looking:

1. Every word the two heroes know is on this map, drawn once and never rearranged. A circle holds its own
   kinds inside it.
2. The named circles are the words that have kinds of their own. The nameless buds are the far ends of the
   ladder — one lights **and takes its name** the first time you land on it.
3. The gold ring is that word's shelf: how many of its kinds you have found. A full ring is a filled shelf.
4. Nothing here is spent or unlocked. It fills as you play, and it keeps filling across every ladder mode.

Plus the controls, which already live in the hint line and stay there.

**Storage costs nothing:** `loadSeen()` reads only `rec.seen`, so a `help:1` field can be added to the
existing `{v:1, seen:[…]}` record with **no version bump and no migration** in either direction — an older
build ignores it, and this one treats a missing field as "not seen yet".

#### 13.13.5 Wiring

| File | Change |
| ---- | ------ |
| `ladderMap.js` | **BUILT** — `ancestry(i)` + the rewritten `readout()` (now HTML, so a `readShown` memo keeps it off every pointermove — the guard `paintStat()` already used); `shareText()`/`bestTree()`/`copyShare()` + `countShelves()` extracted so the panel headline and the share string can never disagree; `ladderMapLock()`/`ladderMapUnlock()`/`isLadderMapLocked()` + the refusal in `openLadderMap()`; `showHelp()`/`dismissHelp()` and the `help` flag in `loadSeen`/`saveSeen`; `?maplock=` alongside `?mapseed=`/`?map=`; `Esc` backs out a layer at a time and `?` toggles the card. **Fog fix 2026-08-24** — `SKELETON_MIN_KINDS`/`isSkeleton()`/`isNamed()` as the single fog predicate, applied at the label queue, the readout, the breadcrumb's per-ancestor branch and `bestTree()` |
| `punctuators.html` | **BUILT** — the `📋` and `?` buttons in `.tree-map__bar`, the help-card markup, `? help` added to the hint line |
| `index.css` | **BUILT** — `.tree-map__readout` gets a `max-width` and wraps (measured: 92 chars); `.tree-map__crumb`/`__here`/`__meta` for the dim-vs-gold split, plus `__fog` for a redacted rung (2026-08-24); `.tree-map__help` + `.tree-map__helpok`; `.tree-map__btn.ok` for the copy confirm; `.tree-btn.locked`; a phone case for the now four-button bar |
| `index.js` | **nothing** — the guard has no caller until §11/§12, which is the point |
| §11.8, §12.5 | **BUILT (as doc)** — the one-line `ladderMapLock()` call each daily owes on start/finish is recorded in both wiring tables |
| `CLAUDE.md` | **BUILT** — the Punctuators row |

#### 13.13.6 Open

- **Does the share carry a link?** Every other share string in the repo (Critter Hunt) is bare text. Left
  bare here too, on the same reasoning, but a URL is the obvious thing a first share request will want.
- **The route overlay's home.** Recommended: §12 (Word Race), because a race *is* a route and §11's
  restore has no path to draw — only a count of shots. That would make §11's finish open the map plain.

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
