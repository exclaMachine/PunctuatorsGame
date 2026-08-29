# Punctuators — The Grand Prefixer & Sufferix (Affix Aliens)

**Status: SPECCED 2026-08-29. M1 (the tables) + M2 (the mode) + M3 (the four heroes) BUILT
2026-08-29 — IT IS PLAYABLE. DEV-ONLY** (`?dev=1`) — see §1.2. M4 (the feel) remains.

A wordplay mode where words keep their meaning but change their *pieces*. Two characters, four hero
entries, one span set. Inspired by the Swamp Thing "Pog" issue, whose aliens speak an English that has
drifted at the edges — recognisable words assembled from the wrong-but-equivalent morphemes.

> The unpossible hypolook was disgraceful, so we repeated it postheat.

Read [`punctuators.md`](punctuators.md) for the engine footguns and
[`punctuators-ladder.md` §1](punctuators-ladder.md) for the anatomy of a wordplay mode before touching
`index.js`.

---

## 1. What it is

Type a sentence. Words that carry a prefix or a suffix become targets. Shoot one and the affix is
replaced — with an **equal** affix (meaning survives, spelling goes alien) or an **opposite** one
(meaning inverts, spelling usually stays English).

```
unhappy      --equal-->    nonhappy / imhappy / dishappy      (alien, same meaning)
unhappy      --opposite--> happy                              (real, inverted)
hopeful      --equal-->    hopeous / hopesome                 (alien)
hopeful      --opposite--> hopeless                           (real, inverted)
preheat      --opposite--> postheat
employer     --opposite--> employee
bibliophile  --opposite--> bibliophobe
```

**No fail state, no puzzle, no daily.** Free play only, like Ambigrams and Anagrams. The win is the
sentence you end up with.

### 1.1 Why the false positives are the feature

Measured over `2of12.txt` (41,241 common words), only **43%** of prefix-shaped words have a stem that is
itself a real word. The other 57% are coincidences — `uncle`, `under`, `mission`, `preen`. The dev's call
(2026-08-29) is **fully loose**: swap them all, no gating, and add the real-word check later (§9, M5).

This is the right call because the misfires are the best output in the mode:

```
intone   -> atone      (a real word, reached by a wrong rule)
discuss  -> uncuss
uncle    -> noncle
income   -> outcome    (also real!)
disputer -> imputer
delight  -> relight    (see §3.3 — the de-/re- pair is full of these)
```

An alien over-applying a rule it half-understands is exactly the Pog premise. The mode is funnier for
being wrong, and every wrong answer is still parseable, which is what makes it read as a *language*
rather than as noise.

### 1.2 Dev-only until the dev says otherwise

The `<option>` ships carrying **`data-dev`** and is stripped from the dropdown unless the page is opened
with **`?dev=1`** — the same gate Word Race and Restore the Phrase sit behind while they are worked on.

The gating must happen in `punctuators.html`'s dropdown IIFE **before the custom dropdown is generated
from `sel.options`**. Hiding or disabling the `<option>` alone does not work: the custom dropdown is built
by walking `sel.options`, so a hidden option still produces a visible `.custom-select-option`. The
`<option>` has to be *removed from the DOM* ahead of that walk.

Removing the gate later is deleting one attribute and leaving the IIFE alone.

---

## 2. Measurements (run 2026-08-29, before any code)

Against the affix tables in §3, minimum stem length 3, minimum word length 5.

| | `enable1.txt` (172,790) | `2of12.txt` (41,241) |
| --- | --- | --- |
| prefix only | 44,504 (26%) | 7,960 (19%) |
| suffix only | 20,782 (12%) | 8,361 (20%) |
| **both** | 10,774 (6%) | **4,361 (11%)** |
| neither | 96,730 (56%) | 20,559 (50%) |

Three things follow:

1. **Half of all common words are targets.** Unlike Ambigrams (636 pairs) or Homophones, this mode never
   needs a "no matches in this sentence" guard — any typed sentence will have several targets. That guard
   should still exist, but it will essentially never fire.
2. **The two characters get equal work** (19% / 20%). The position split is balanced, which was not
   obvious in advance.
3. **11% of words carry both.** A word with two live ends is common, not an edge case — which is what
   forces §5's span decision.

Jackpot tiers, for M5 later: **991** prefix swaps land on a word in `enable1`; only **410** of those are
also in `2of12`. So "is it a word" and "is it a word the player will recognise" are genuinely different
questions and want different lists — matching the repo's standing rule (enable1 for eligibility, 2of12 as
a commonness signal, never as the only filter).

---

## 3. The data — `affixData.js`

**Hand-authored, no build step, no dictionary.** Prefix detection is `startsWith`; suffix detection is
`endsWith`. There is nothing to precompute while the mode is fully loose, so this ships as one small
module (~2 KB) rather than a generated POJO. This is a deliberate departure from `ladderPOJO.js` /
`ambigramPOJO.js` — those exist because their relation cannot be computed at runtime. This one can.

### 3.1 Prefix groups

Affixes inside a group are **equal** (interchangeable in meaning). Groups are paired for **opposite**.

| Group | Prefixes | Opposite group |
| --- | --- | --- |
| `NOT` | un non dis in a an im il ir | *(strip — see §3.3)* |
| `BEFORE` | pre ante fore pro | `AFTER` |
| `AFTER` | post | `BEFORE` |
| `AGAIN` | re | `UNDO` |
| `UNDO` | de | `AGAIN` |
| `AGAINST` | anti contra counter ob | `WITH` |
| `WITH` | co com con syn sym | `AGAINST` |
| `ACROSS` | trans dia per | — |
| `AROUND` | circum peri | — |
| `BEYOND` | super hyper supra over ultra | `BELOW` |
| `BELOW` | sub hypo under infra | `BEYOND` |
| `OUT` | ex exo out e | `INTO` |
| `INTO` | intra endo en em | `OUT` |
| `HALF` | semi hemi demi | `TWO` |
| `MANY` | multi poly | `ONE` |
| `ONE` | mono uni | `MANY` |
| `TWO` | bi di duo twi | `HALF` |
| `SMALL` | micro mini | `LARGE` |
| `LARGE` | macro mega maxi grand | `SMALL` |
| `SELF` | auto self | — |
| `BAD` | mal mis dys caco | `GOOD` |
| `GOOD` | bene eu | `BAD` |
| `ALL` | omni pan | — |

### 3.2 Suffix groups

| Group | Suffixes | Opposite group |
| --- | --- | --- |
| `AGENT` | er ist or ian eer ster ant ent ard | `PATIENT` |
| `PATIENT` | ee | `AGENT` |
| `QUALITY` | ness ity hood ship dom tude cy ance ence ism | — |
| `FULL_OF` | ful ous ose some ive | `WITHOUT` |
| `WITHOUT` | less free | `FULL_OF` |
| `ABLE` | able ible ile | — |
| `MAKE` | ize ify en ate | — |
| `LIKE` | ish like esque oid ly | — |
| `SMALL` | let ette ling kin cule | — |
| `PLACE` | ery arium orium ary | — |
| `STUDY` | ology ics graphy | — |
| `LOVER` | phile philia | `HATER` |
| `HATER` | phobe phobia | `LOVER` |

`FULL_OF ↔ WITHOUT` is the headline pair — `hopeful ↔ hopeless`, `careful ↔ careless`,
`useful ↔ useless` — and is the case most likely to be the player's first opposite shot. `AGENT ↔ PATIENT`
(`employer ↔ employee`, `trainer ↔ trainee`) is the one that teaches something a player probably could not
articulate before playing.

### 3.3 Strip is a legitimate opposite

`NOT` has no opposing affix because **removing it is the opposite**. `unhappy → happy` is the single
most legible move in the mode and needs no partner table. So the Opposite shot resolves as:

1. If the group has an opposite group, swap to a member of it.
2. Else if the group is in `STRIPPABLE` (`NOT` alone) delete the affix.
3. Else clank (§6.3).

**`AGAIN` was strippable in the first draft and is not any more (dev's call, 2026-08-29):** the opposite of
`re-` is **`de-`**, not deletion — `reactivate ↔ deactivate`, `reconstruct ↔ deconstruct`,
`regenerate ↔ degenerate`, `recompose ↔ decompose`. That is a real and productive pair in English and it
teaches something, where `rewrite → write` only removes. `UNDO` is a one-member group existing purely to be
`AGAIN`'s partner, and the pairing runs both ways, so `deactivate → reactivate` works too. The cost is that
`rewrite → dewrite` now comes out alien rather than English, which is the mode's normal register anyway.

**`HALF` was strippable in the first draft and is not any more, and `TWO` gained a partner in the same
call (dev's, 2026-08-29):** the two groups are each other's opposite. Doubling and halving invert each
other, so the pair is honest where a strip was not — `semicircle → circle` reads as a deletion rather
than an inversion, and `bicycle` had no opposite shot at all and simply clanked. `NOT` is now the only
strippable group anywhere in the tables.

**Measured, and the payout is the same shape as `de-`/`re-`'s:** the calendar words swap clean across
in `2of12` in both directions — `biannual ↔ semiannual`, `bimonthly ↔ semimonthly`,
`biweekly ↔ semiweekly`, `biyearly ↔ semiyearly` — plus the one-way joke `seminary → binary`
(`binary` itself reads as `bin`+`ary` under §3.5's longest-affix rule, so it does not swap back).

**Measured, and it argues for the change:** `de-` is a heavy producer of §1.1's accidental real words,
because `de-` and `re-` both sit on Latin stems all over English. Every one of these lands in `2of12`:

```
delight -> relight     depress -> repress     detain  -> retain
deform  -> reform      defer   -> refer       deserve -> reserve
demand  -> remand      descend -> reascend
```

The meanings are comic but the constructions are etymologically real, which is the best version of this
mode's joke — the alien reaches for a wrong piece and produces something English already had.

### 3.4 Ambiguous affixes belong to exactly one group

`in-` is `NOT` in *inactive* and `INTO` in *inhale*. `dis-` is `NOT` and also *apart*. `a-` is `NOT` and
also *toward*. Under the fully-loose policy there is nothing to disambiguate with, so **each affix appears
in exactly one group** and the table picks the more common sense: `in-` → `NOT`, `dis-` → `NOT`, `a-` →
`NOT`, with `en-`/`em-`/`intra-`/`endo-` carrying `INTO`. `inhale → unhale` is a wrong answer that is also
a joke, which is the mode's whole posture.

`de-` is the same story — it is *undo* in `deactivate` and *down/off* in `descend`, `depress`, `deduct`.
It belongs to `UNDO` and nowhere else, so `descend → reascend`. Note also that `un-` and `dis-` are
genuinely reversative in `untie` and `disconnect` and could have joined `UNDO`, but they are already
spoken for by `NOT` and the one-group rule holds: the table stays unambiguous, and the wrong answers stay
funny.

### 3.5 Matching rules

- **Longest affix wins** — check `hyper` before `hy`, `ness` before `ess`. Sort each list by length
  descending once at module load. (Ties keep table order, which only ever decides between two
  different strings of the same length — never between two readings of the same one, since §3.4's
  one-group rule is enforced by `assertAffixTables()`.)
- **Order inside a group is the cycling order**, so the most legible member leads: `NOT` runs
  `un non dis in a an im il ir`, with the assimilated `im-`/`il-`/`ir-` last because they only ever
  attach before m/l/r and read as noise anywhere else. `unhappy` shot three times gives
  `nonhappy → dishappy → inhappy`.
- **Minimum stem 3 characters**, so `under` yields `der` (allowed) but `ends` does not yield `s`.
- **Minimum word length 5**, which keeps `use`, `over`, `into` out entirely.
- **A word carrying both ends must keep a stem between them.** `unless` reads as `un`+`less` with
  nothing in the middle, so when the two affixes leave fewer than 3 letters between them only the
  **longer** one survives, and a tie goes to the **prefix** — the Grand Prefixer arrives first, in
  the word and in the roster. (`unless → inless`, and `binary` keeps `-ary` over `bi-`.)
- The swap **never picks the affix already there**, and picks deterministically per shot from the group in
  order, cycling on repeat shots — so shooting `unhappy` three times walks `nonhappy → imhappy → dishappy`.
  This is the ladder's sibling-cycling idea, which was removed there but is right here: repetition is how
  the player discovers a group has several members.
- **Case is copied by shape**, not position — `Unhappy → Nonhappy`, `UNHAPPY → NONHAPPY`. Borrow the
  ladder's rule, not Betar's `matchCase`, since affixes differ in length.

---

## 4. The cast

Two characters, **four hero entries**, exactly the Full Stop pattern (`FullStop` with a laser and
`FullStopGrenade` with a grenade are one character in two loadouts, adjacent in `availableHeroArray`, and
Switch Character steps between them).

| Hero entry | Character | Shot | Effect |
| --- | --- | --- | --- |
| `prefixerEqual` | **The Grand Prefixer** | the **Equals bolt** — two parallel bars | prefix → equal prefix |
| `prefixerOpposite` | **The Grand Prefixer** | the **Reversal bolt** — a double-headed arrow | prefix → opposite prefix, or strip |
| `sufferixEqual` | **Sufferix** | Equals bolt, her colour | suffix → equal suffix |
| `sufferixOpposite` | **Sufferix** | Reversal bolt, her colour | suffix → opposite suffix, or strip |

All four are **adjacent in `availableHeroArray`**, in that order, so Switch Character walks
`Prefixer=` → `Prefixer↔` → `Sufferix=` → `Sufferix↔`. Same reasoning as the ladder pair and the
Excla/Markswoman ordering: adjacency is the interface.

### 4.1 The Grand Prefixer

Grand Prix, prefix, and a grand fixer of things. Prefixes come first, so **he is always out in front** —
a herald, a vanguard, marching ahead of the word he is about to change. Arrives early, announces
everything, gets there before the meaning does.

### 4.2 Sufferix

Suffix, suffragette, and suffering. **She brings up the rear** — the one at the end of everything,
cleaning up after the sentence has already happened, enduring. Where the Prefixer announces, she concludes.

### 4.3 Shot design

Legibility at ~27 px is the constraint (the same one that made General Ization's projectile a drawn
broadsword rather than a "spreading ring"). Two shapes, two colours:

- **Equals bolt** — two short parallel bars. Reads as `=` at any size. "Same meaning."
- **Reversal bolt** — one bar with an arrowhead at each end pointing outward. Reads as `↔`. "Opposite."

Character is carried by **colour**, operation by **shape**, so a player learns four shots from two facts.

**BUILT 2026-08-29** as `drawEqualsBoltSprite(color)` / `drawReversalBoltSprite(color)` — both drawn into
an offscreen canvas and handed to the `Hero` constructor as a **data URL**, the way
`drawBroadswordSprite()` does, so swapping in real art later is a one-string change. Four sprites, two
shapes × two colours. The Equals bolt is deliberately **two masses** where the Reversal bolt is **one**, so
at the 28 px they are actually drawn at the pair separates on *count* rather than on detail. `roundRect`
was wanted for the bars and is not used: it only landed in Safari 16.4, and the radius is invisible at
28 px anyway.

**The two characters are drawn the same way** (`drawAlienSprite({color, side, lean})` → the data URL
*and* the muzzle in source pixels). Placeholder art, but not `Generic.png` twice: the ladder shipped M3
with General and Keen wearing the same placeholder and they were indistinguishable on screen, and here
the whole interface is knowing which of four heroes is on stage. One figure, mirrored by `side` and
posture-shifted by `lean` — the Prefixer leaning into the sentence with his antenna swept forward, Sufferix
leaning away with hers trailing. Colours: **`#c2410c`** warm/forward for him, **`#4c1d95`** cool/trailing
for her.

Drawing the art is also what supplies the `projectileAnchor`. A hero with no anchor spawns its shot at the
top of its image **frame**, which is the weapon only when the figure fills that frame — the bug that had
Keen Arrow's bolt launching from empty sky. `drawAlienSprite` returns the muzzle it drew, so the anchor is
**measured, not guessed**: `muzzle × heroScale`, less half the bolt's drawn width on the x.

### 4.4 Bench (not being built, kept because they are good)

If the mode ever wants a squad instead of a pair, the affixes make excellent characters on their own:
**Hyper Bole**, **Hypo Critter**, **Pre Amble**, **Post Script**, **Auntie Dote**, **Re Peat**,
**Miss Fortune**, **Poly Ester**, **Mono Cle**, **Trans Parent**. Note that **Semi Colonel is already on
the roster** and is already a `semi-` pun, so the family exists. Parked, not scheduled.

---

## 5. The span — one id, four heroes

**Decision: every affixed word gets the same span `id="affix"`, and all four heroes set
`targetId = "affix"`.**

This is the ladder's §4 mechanism (`Hero.targetId`, which defaults to `symbol` so the other 23 heroes are
untouched) used as intended, and it needs no new machinery at all.

```html
<span id="affix" class="affix-word" data-word="unhelpful" data-stem="help"
      data-pre="un" data-pre-group="NOT" data-suf="ful" data-suf-group="FULL_OF"
      ><i class="afx afx-pre">un</i>help<i class="afx afx-suf">ful</i></span>
```

As built (`affixSpanHTML`): the data attributes are lowercase — the tables are — but the **display is
sliced out of the original token**, so `Unhappy` keeps its capital and only the lookup is normalised.
The whole span is a function of a bare token and nothing else, which is what lets a shot rebuild it after
a swap.

**As built (M3), that rebuild is `updateAffixSpan(span, token)`** rather than a second call to
`affixSpanHTML` — a shot has to rewrite a span that already exists, and re-creating the element would take
it out of `nodeArr` (the observer runs once and then disconnects, so a replaced node is a target that no
longer exists). The two share one `affixInnerHTML` builder, so the wrap-time span and the post-shot span
can never draw the same word differently. The data attributes are **recomputed, not patched**, because the
new spelling can carry a different affix at the other end or none at all.

**Why not separate ids per shape** (`affixPre` / `affixSuf` / `affixBoth`): a hero's `targetId` is a single
string, so answering to two ids would mean adding a `targetIds` set to `Hero` — new machinery for no gain.
With one id, `heroToTheRescue` fields all four heroes whenever any affixed word exists, and a hero with
nothing to do on a particular word simply clanks (§6.3), which is informative rather than annoying: the
clank *is* the lesson that `hopeful` has no prefix.

**Why not nested spans:** a wrapper or nested `<span>` inside `#output` is the third member of the engine's
footgun family — `waitForElement()` waits on `#output span` and `nodeArr` is filled once from the
observer's `addedNodes`, which lists only directly-inserted nodes. The inner affix markers are therefore
`<i>` elements, **never `<span>`**. Nested non-span elements inside a target span are already proven safe
(the ladder puts `.ladder-face` / `.ladder-ghost` inside one).

### 5.1 The affix is visible before you shoot

`.afx` gives the detected affix a hairline underline and a slight colour shift — `un`·helpful. This is the
affordance that makes the one-shared-id decision cost nothing: you can see at a glance which end is live,
so you know which character to switch to. It must be styled with **colour and border only, never anything
that changes metrics** (no padding, no font-size, no letter-spacing) or the span's hit rectangle moves
under the player's aim. Same constraint that made the ladder's rung strip an absolutely-positioned
`::after`.

---

## 6. Rules on a hit

Let `shooter` be `projectile.owner ?? player` — **never the global `player`**. This is the owner fix of
2026-08-28: a shot in the air across a Switch Character must still resolve as the hero that fired it,
which matters here more than anywhere, because all four heroes share one span id and switching mid-flight
is the normal way to play.

### 6.1 Equal shot
Read the shooter's end (`data-pre` for a Prefixer, `data-suf` for Sufferix). Look up its group, pick the
next member that is not the current affix, rewrite the word, re-run detection so the new affix is marked,
and animate (§7).

### 6.2 Opposite shot
Same, but resolve through §3.3's three-step ladder (opposite group → strip → clank).

### 6.3 The clank
A hero shooting a word with nothing on its end, or an affix whose group has no opposite and is not
strippable, plays a short flat cue and does nothing. Precedent: the ladder's capstone, which deliberately
does **not** sound like a buzzer — a word having no prefix is a fact, not a mistake.

### 6.4 Articles
`an unhappy man → a nonhappy man`. Changing a word's head changes the article in front of it, and the
ladder already built **`fixArticleBefore`** for exactly this (`a dog → an animal`). Reuse it verbatim.
This is a real reuse win and the main reason the Prefixer's swap is not just a `textContent` write.

### 6.5 Suppressions
**Foon (spoonerism) must be off in this mode.** He swaps word heads, which is the Grand Prefixer's entire
job, and he runs after the `protected*` pass so he would swap straight into an affix span. **Art the
Tickler must be off** too, since §6.4 takes over article handling. `utils.js` already has this exact
guard for the three ladder modes — the `ladderMode` flag becomes a broader `heroManagedWords` flag, or
gains `|| mode === "affixes"`. Rename in the same change; the comment block above it explains the
reasoning and must be updated with it.

### 6.6 No re-lock
A swapped word stays a target — its span keeps its id and its data attributes are recomputed from the new
spelling. `unhappy → nonhappy → imhappy` is the intended play. This is the opposite of Restore the
Phrase, where a solved word locks by clearing its id, and it is why the mode needs no win check.

---

## 7. Animation

**Reuse the ladder's swap outright.** `animateLadderSwap` already builds the exact shape this needs: an
in-flow `.ladder-face` holding the new text (and holding the box, so the sentence reflows once and never
again) plus an absolutely-positioned `.ladder-ghost` carrying the old text, free to move without pushing a
neighbour. Here the face/ghost pair is the affix rather than the whole word:

- **Equal swap** — the old affix slides off the end of the word and the new one slides in behind it, in
  the same direction the character faces (Prefixer's arrives from the left, Sufferix's from the right).
  The stem never moves. A bound morpheme detaching and another latching on.
- **Opposite swap** — the affix flips through 180° in place and lands as its opposite, borrowing
  Ambigrambador's `.ambi-spin` two-face rotation.
- **Strip** — the affix simply falls off and fades.

The ladder's `dataset.ladderSeq` token (which makes a superseded `settle()` a no-op when a second shot
lands mid-animation) is needed here too, and more urgently: four heroes on one span means overlapping
shots are routine, not an edge case.

---

## 8. Sound — PROVISIONAL

**Not load-bearing (dev, 2026-08-29): this is a sketch to build against and expected to be tuned in play,
not a spec to implement faithfully.** Nothing else in the doc depends on it.

**Four of the six BUILT 2026-08-29, pulled forward into M3 by the dev's call** — the two *outcome* pairs
(`_affixSwap`, which covers equal and opposite off one shape, plus `_affixStrip` and `_affixClank`) —
because a clank with no cue at all is literally nothing: the bolt lands, the word does not change, and the
mode reads as broken rather than as informative. The two **shoot** cues stay M4.

On the existing `_tone` / `_noise` kit — no new assets, matching every hero cue in the game.

The design encodes the linguistics, which is the point of the mode:

- **Equal** plays a melodic shape **transposed** — the same tune in a different key. *Same but different.*
- **Opposite** plays that same shape **inverted** — every rise becomes a fall. Melodic inversion for
  semantic inversion.
- **The Grand Prefixer's cue places its accent BEFORE the beat; Sufferix's AFTER it.** The character's
  position in the word becomes the character's position in time. This is the cheapest possible way to make
  four cues distinguishable, and it is free on the existing kit.
- **Strip** is a descending drop with nothing after it — the affix falling off.
- **Clank** is one flat, short, unloaded tick. Not a buzzer (§6.3).

Six cues total. Following the ladder's precedent, all four affix heroes **override
`hitProjectileSound()` to silence** (on the shared `AffixAlien` base) and `shootAffix` plays the outcome's
own cue, because one hit has four outcomes — equal, opposite, strip, clank — and the generic
one-hit-one-sound call site cannot express that.

---

## 9. Milestones

| | What | Notes |
| --- | --- | --- |
| **M1** | **BUILT 2026-08-29** — `affixData.js`: the two group tables, mirrored opposite pairs, `STRIPPABLE`, longest-first sorting, `detect(word)` and one `swapAffix(word, end, op, turn)` covering equal/opposite/strip (a clank is a `null`, not an error) | Pure data + pure functions. No wordlist, no build step, no DOM, no imports. `assertAffixTables()` ships with it — it catches the one edit that fails silently, the same string in two groups. |
| **M2** | **BUILT 2026-08-29** — the `affixes` `<option>` carrying `data-dev` (§1.2), `affixFunc.js` (`AFFIX_ID` / `hasAffixes` / `wrapAffixes` / `affixSpanHTML` / `applyAffixCase`), `protectedAffixes` in `SpanPlaceholder.js`, `case "affixes"` in `addSpansAndIdsForWordPlay`, §6.5's suppression (the `ladderMode` flag renamed `heroManagedWords`), the `.afx` marker CSS, and the no-matches guard in `index.js` | Sentence marks up; nothing shoots yet. With no hero answering to the `affix` id, `heroToTheRescue` returns an empty team and `doActionOnce` leaves the title-page hero on screen — which reads as broken, so the round says so in `#error-message`. **That one message is M3's to delete.** |
| **M3** | **BUILT 2026-08-29 — PLAYABLE.** The four heroes: one `AffixAlien` base + four thin subclasses, `targetId = AFFIX_ID` on all four, adjacent in `availableHeroArray`; **four drawn projectiles** (2 shapes × 2 colours) and **two drawn characters**, all data URLs (§4.3); `updateAffixSpan` in `affixFunc.js` (§5); `shootAffix` + `claimAffixShot` + `flashAffixClank` and the `AFFIX_ID` collision branch in `index.js`; four of §8's cues pulled forward; the `.affix-clank` flash in `index.css`; M2's placeholder message deleted | The turn counter that walks a group (§3.5) lives on the span as `data-afx-<end>-<op>` — **per end AND per operation**, so the equal bolt's cycle is not disturbed by a reversal shot at the same word in between. |
| **M4** | The feel — §7's animations, §8's two remaining (shoot) cues, `modeHelp.js` card, `modeArt.js` card, `fixArticleBefore` wiring (§6.4) | Shippable, still dev-only. |
| **M4.5** | Drop `data-dev` from the `<option>` | The dev's call, once they are happy with it. One attribute. |
| **M5** | *Deferred by the dev 2026-08-29* — the real-word layer: stem check against `enable1`, jackpot chime when a swap lands in `2of12`, a distinct fumble cue when the stem is not a word | The tiers exist in §2; the policy is fully loose until this lands. |
| **M6** | *Parked* — "Restore the alien message": the game shows a Pog-speak sentence and you shoot it back into English. Real win state, needs a validity checker and a puzzle source | Precedent is Restore the Phrase (§11 of the ladder doc). |

M1–M4 is the shipping unit.

---

## 10. Wiring checklist

- `punctuators.html` — **BUILT** — one `<option value="affixes" data-dev>Affix Aliens</option>`. The
  dropdown IIFE's `data-dev` strip is generic and already ran before the custom dropdown is built
  (§1.2), so the option needed no code there at all
- `affixData.js` — **BUILT** — the tables and the swap (§3, §6)
- `affixFunc.js` — **BUILT** — `AFFIX_ID` / `hasAffixes` / `wrapAffixes` / `affixSpanHTML`, plus
  `applyAffixCase`, which is the ladder's `applyLadderCase` re-exported rather than rewritten
- `SpanPlaceholder.js` — **BUILT** — `protectedAffixes`
- `utils/utils.js` — **BUILT** — `case "affixes"` in `addSpansAndIdsForWordPlay`; the Foon/Art
  suppression flag renamed `ladderMode` → `heroManagedWords` and its comment block extended (§6.5)
- `affixFunc.js` — **M3 BUILT** — `updateAffixSpan` (§5), sharing one `affixInnerHTML` builder with
  `affixSpanHTML`
- `index.js` — **M3 BUILT** — `drawEqualsBoltSprite` / `drawReversalBoltSprite` / `drawAlienSprite`,
  the `AffixAlien` base and its four subclasses, the four instances adjacent in
  `availableHeroArray`, the `AFFIX_ID` collision branch, `shootAffix` / `claimAffixShot` /
  `flashAffixClank`, and `_affixSwap` / `_affixStrip` / `_affixClank` on the `_tone` kit. The M2
  placeholder message is gone. Still M4: the two shoot cues, §7's animations, `fixArticleBefore`
- `index.css` — **M3 BUILT** — `.affix-clank` (drop-shadow, deliberately grey rather than the hero's
  colour, so a clank cannot read as a hit), on top of M2's `.affix-word` (inline-block, as
  `.word-ladder` is, so §7's animations can scale it) and the `.afx` markers (colour/border only,
  §5.1). Still M4: the swap animations
- `affix-sprite-preview.html` — **M3, dev scratch** — renders the placeholder sprites at game size by
  fetching `index.js` and slicing the block between two markers, so it can never drift from what the
  game draws. Delete whenever
- `modeHelp.js` — **still M4** — a card keyed `affixes`; examples must be real output of the shipped
  tables. Until then the mode falls back to the punctuation card, as an unknown mode does
- `modeArt.js` — **still M4** — a card keyed `affixes`; glyph candidate `un-` over `-less`, or `=`
  over `↔`. Same fallback until then
- `CLAUDE.md` — **BUILT** — the Punctuators row
- `docs/punctuators.md` — **BUILT** — a pointer to this file

---

## 11. Open questions

1. **Mode name.** `Affix Aliens` is the working title. Alternatives: `Same But Different`, `Pog Speak`,
   `Prefixed & Suffixed`.
2. **Does the Prefixer shoot the front of the word and Sufferix the back?** Projectiles fly straight up
   and cannot be aimed, so a word's x-range is its whole hit box — sub-word aiming is not possible without
   splitting the word into two spans, which §5 rejected. Currently both heroes hit anywhere on the word
   and the *character* decides which end changes. Worth a play-test — **now possible, M3 is
   playable**: if it reads as arbitrary, the fix is the `.afx` marker being louder (M4 can tint the two
   markers in the two heroes' own colours), not a second span.
3. **Should repeated shots cycle the group, or pick at random?** §3.5 says cycle. Random would make the
   alien inconsistent, which is truer to the premise but harder to learn from.
4. **A "Lexicon of Pog"** — keeping every alien word you coin, the way the Word Hoard and the Tree of
   Kinds keep things. Nothing in M1–M4 forecloses it.
5. **The double-affix combo.** `unhelpful` hit by a Prefixer *and* Sufferix shot in flight together →
   `nonhelpless`, with its own cue. The Interrobang (2026-08-29) is the precedent and the machinery
   (`projectile.targetIds`, `consumeShot()`) already exists. Deliberately out of M1–M4.
