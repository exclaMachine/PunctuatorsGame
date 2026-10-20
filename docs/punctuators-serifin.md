# Punctuators — Serifin (Strokes)

**Status: M1 the table and M2 the mark-up BUILT 2026-10-18** — a sentence marks up and nothing
fields the shot yet. M3 the hero → M4 the feel remain (§10). **DEV-ONLY** (`?dev=1`) — see §1.3.

A wordplay mode where a word keeps its *letters' bones* and changes what they are. Serifin draws one
extra stroke onto a letter and it becomes a different letter — and because she only ever draws where
the result is a real word, the sentence stays English while every word in it quietly shifts.

```
i adopt a cat and a dog
     ↓                       one stroke down the right of the o
i adapt a cat and a dog
```

Read [`punctuators.md`](punctuators.md) for the engine footguns and
[`punctuators-ladder.md` §1](punctuators-ladder.md) for the anatomy of a wordplay mode before
touching `index.js`.

---

## 1. What it is

Type a sentence. Serifin marks every **letter** that becomes another letter when you add one stroke
*and* leaves a real word behind. Shoot the letter and the stroke is drawn on.

```
adopt   o → a   adapt          cut   c → o   out
adopt   o → e   adept          cut   u → o   cot
brown   o → a   brawn          sun   u → o   son
night   n → m   might          will  l → t   wilt
bottle  o → a   battle         will  l → d   wild
acorn   c → d   adorn          shore o → a   share
color   r → n   colon          art   r → n   ant
hand    h → b   band          eve   v → y   eye
```

(Checked against the shipped table, which is where the last two rows came from: `i → j` has only
**two** entries in the whole corpus — `fiord → fjord` and `iamb → jamb` — and `v → y` five. The
mode's weight really is on `o l c n r u`. `colour` is not a source word at all: it is absent from
`2of12.txt`, which is the first of §2.1's two holes.)

**No fail state, no puzzle, no daily.** Free play, like Ambigrams and Anagrams. The win is the
sentence you end up with.

### 1.1 The target is a LETTER, and that is the whole design

Every other wordplay mode in the game shoots a **word**. Serifin shoots a **letter**, and that one
change is what makes her mode play differently from all of them.

Projectiles in Punctuators fly straight up and cannot be aimed — a shot's **x-position is the only
selector the game has**. With word targets that means "pick a word"; with letter targets it means
you walk Serifin along under the sentence and stop beneath *the `o` in `adopt`*. The mode uses the
engine's oldest constraint as its interface rather than working around it.

It is also the only honest reading of the power. "Add a stroke to a letter" aimed at a word would
have to pick the letter for you, and then the player's single decision — which letter — is made by
a lookup table.

Single-letter spans are already proven: `addSpansAndIds` wraps every capital as its own one-character
span (`capital-black-hole`) and has since the game shipped. §5 covers what is *not* free.

### 1.2 Why the dictionary gate, when Affix Aliens went loose

The Affix Aliens ship fully loose — `uncle → noncle` — because an alien over-applying a half-learnt
rule is the joke, and a wrong answer is still parseable as language.

Serifin is the opposite case, and the difference is **density**. An affix lives at a word's end, so a
loose affix mode marks at most two targets per word. A loose *letter* mode marks every `c i l n o r
u v` in the sentence — measured at **25 of 27 letters** in a typical line (§2). The sentence becomes
a wall of underlines, and `brown → brqwn` teaches a letterform and nothing else.

Gated on real words, the same sentence marks three or four letters, each one worth walking to, and
the payoff is a word you can read out loud. The measurement that made this safe is §2: real typed
sentences nearly always contain one.

### 1.3 Dev-only until the dev says otherwise

The `<option>` ships carrying **`data-dev`** and is stripped from the dropdown unless the page is
opened with `?dev=1`. The gate must run in `punctuators.html`'s dropdown IIFE **before** the custom
dropdown is generated from `sel.options` — hiding the `<option>` alone leaves its generated
`.custom-select-option` visible (the trap Word Race and Affix Aliens both hit).

---

## 2. Measurements (run 2026-10-18, before any code)

Against `2of12.txt` (39,584 common words) as the source and `enable1.txt` as the result gate, using
the final table in §3.1:

| | |
| --- | --- |
| common words with ≥1 stroke-add into a real word | **2,995 (7.6%)** |
| total transformations | **3,948** |
| …whose result is also in `2of12` (recognisable) | **2,349** |
| real sentences with something to shoot | **12 of 12** |
| letters a *loose* mode would mark | **25 of 27** in a typical line |

**The 7.6% is the number that nearly killed the mode, and it is the wrong number to read.** Sampled
over random common words, a six-word sentence finds a target only a third of the time. Sampled over
sentences people actually type it is 12/12, because real English is carried by short frequent words
and those are made almost entirely of `o l c n r u` — `the`, `dog`, `cat`, `on`, `all`, `over`,
`put`, `cut`, `sun`, `will`, `long`, `night`. The guard (§11) exists for the real misses, not as a
routine occurrence.

**All four numbers reproduced exactly on the build (2026-10-18)** — `build-serifin-pojo.js` prints
them, so the table's tuning surface is checkable rather than asserted — bar the sentence sample,
whose twelve sentences were never written down. The script now carries twelve of its own and scores
**9 of 12** on the recognisable tier (10 of 12 with `SERIFIN_OBSCURE` on, which is what that flag
buys: one sentence in twelve and 7 more marked words). Two of the three misses are §2.1, not the
table. So the guard (§11) is for a real and not especially rare miss, which is why it names words.

Per mapping, over the whole corpus:

```
o→a 769   o→e 506   r→n 409   l→t 376   l→d 310   u→o 302   l→h 230
c→d 204   l→b 195   h→b 168   n→m 167   c→a  83   c→e  51   c→o  42
o→p  41   o→d  27   o→g  23   o→b  21   v→y  18   i→j   4   o→q   2
```

`o→a` and `o→e` carry a fifth of the mode between them, which is why §7's font decision is not
cosmetic: if `o → a` does not read as one stroke on screen, the mode's best row is a lie.

### 2.1 `2of12.txt` is a LEMMA list, and it costs the mode at both ends

Found building M1, and it is the one thing about the data worth knowing. 2of12 holds **39,584 plain
a–z words and only 3,794 of them end in `s`** — `dogs`, `cats`, `cups`, `jumps`, `walked` are all
absent, while `lines` and `runs` are in because they are listed in their own right. The §2
measurements were taken against exactly this, so nothing above is wrong; but the list being lemmas
bites in both directions:

- **As the source list**, an inflected word in a typed sentence is usually not a key at all, so
  `the cats sat on the mats` marks nothing even though `cats → oats` is a real swap into a real
  word. The ladder hit the equivalent hole and answered it with naive `singularize`/`pluralize`
  rules — **and that does not transfer here**, because re-pluralizing the *result* needs a fresh
  validity check the POJO cannot answer (it holds results only for its own keys). The honest fix is
  to generate from `enable1` as the source side too, trading file size for coverage.
- **As the result tier**, `limes`, `tines` and `dines` are ordinary English words marked obscure and
  hidden, because 2of12 lacks the plural. §3.4's "recognisable" tier is therefore conservative in a
  lopsided way: it hides good plural results rather than bad words.

Left exactly as specced for now — the tier rule is what §2 measured, and changing either end changes
what the mode does. It is the first thing to revisit if free play reads as too thin.

---

## 3. The data

### 3.1 The stroke table

Hand-written, ~20 lines, no build input. The rule for membership is **one continuous stroke of a
pen, added to the glyph as drawn in the mode's own face** (§7):

```js
const ADD = {
  c: ["o", "a", "d", "e"],              // close the ring · add a right stem (x-height / ascending) · crossbar
  h: ["b"],                             // close the foot
  i: ["j"],                             // add the tail
  l: ["t", "b", "d", "h"],              // crossbar · bowl right · bowl left · arch
  n: ["m"],                             // one more arch
  o: ["a", "b", "d", "e", "p", "q", "g"], // stem · ascender · descender · crossbar
  r: ["n"],                             // carry the shoulder down to the baseline
  u: ["o"],                             // close the top
  v: ["y"],                             // add the tail
};
```

Nine source letters. The table is the whole mode — everything else is a lookup or a drawing.

### 3.2 What was cut, and why it matters that it was

The first draft of the table was bigger and scored better. These rows were removed because they are
not *one stroke*, and a mode that teaches letter anatomy cannot be approximately right about it:

| cut | swaps lost | why |
| --- | --- | --- |
| `n → h` | 112 | lengthens the left stem — that is extending a stroke, not adding one |
| `r → p` | 223 | needs the stem extended *and* the bowl closed: two |
| `t → f` | 231 | curves the top of the stem; nothing is added |
| `l → k` | 153 | two diagonals |
| `v → w` | 51 | a second `v` is two more strokes |
| `e → g` | 108 | not a stroke relation at all |

That is **878 transformations given up, ~18% of the mode**, to keep the claim true. The payoff is
§8: every mapping that survives has a *drawable* stroke, so the animation can show the pen doing
exactly what the table says.

`o → g` is the one row kept on a judgement call — it is one descending stroke only in a **single-
storey** `g`, which the mode's face has (§7). In a two-storey `g` it is a second bowl and the row
must go. Flagged in the build script.

### 3.3 The generated table — `build-serifin-pojo.js` → `serifinPOJO.js`

The runtime question is *"does this word with one letter changed exist?"*, and the only wordlists
available are files (`2of12.txt` 389 KB, `enable1.txt` 1.7 MB). Pre-computing is both smaller and
the house pattern (Zana, Roundabout and Betar all ship a generated POJO):

```js
// serifinPOJO.js — generated, never hand-edited
export default { "adopt": "2a 2e", "cat": "0o 0e", "cut": "0o 1o", … };
```

One entry per source word; the value is a space-joined list of `<index><letter>` swaps, starred when
the result is `enable1`-only (§3.4). **Measured as built: 2,995 entries, 56 KB raw / 14 KB gzipped**
(the 42/12 above was the pre-build estimate). Lazy `import()` on first use, the pattern
`ladderPOJO.js` set.

`build-serifin-pojo.js` runs offline (`node build-serifin-pojo.js`), reads `2of12.txt` for sources
and `enable1.txt` for results, and holds the §3.1 table as its only tuning surface. It is the whole
data layer: no NLTK, no corpus download, ~1 s.

### 3.4 Two tiers of result, one flag apart

Memory's rule is *enable1 for eligibility, 2of12 as a commonness signal only* — but here the result
is **read out loud by the player as the payoff**, so eligibility is not the whole question.
`over → oyer`, `dog → dag`, `the → tho`, `long → hong` are all legal `enable1` words and all of them
land as a dud.

So the build emits **both tiers** and marks them (`*` = `enable1` only), and the mode lights only
the `2of12` tier in v1 (`SERIFIN_OBSCURE = false`). That is 2,349 of the 3,948 swaps — still 12/12
on the sentence sample. Flipping the flag opens the long tail without a rebuild, and the dev can
promote individual words in the source table the way `race-pairs-source.txt` is pruned.

### 3.5 Matching rules

1. **Lowercase only.** The table is a table of lowercase letterforms. A capital is never a target —
   `Dog` offers its `o` and `g`, not its `D`. Capitals are their own alphabet and their own table
   (§12.3), and in wordplay modes a typed capital stays capital (only the punctuation round
   lowercases them).
2. **Minimum word length 2.** `a → o` and `i → j` as whole words are noise.
3. **Never `dict[word]`.** `constructor` is an ordinary English word — verified present in both
   `2of12.txt` and `enable1.txt` — and a bare lookup on a plain object answers it with `Object`'s
   constructor, a truthy function. **As built the table is a `Map`** (the Tree of Kinds' answer)
   rather than `CaretFunc.js`'s own-property `entryFor` as this rule originally said: the compact
   POJO strings are parsed into a structure at load time anyway, so the Map costs nothing and the
   guarantee does not depend on every future lookup remembering.
4. **The candidate list is fixed at wrap time** and read from the word as typed — see §6.1.

---

## 4. The cast

### 4.1 Serifin

A graffitist of letterforms, working in **proofreader's red** (`#be123c`) — the colour of a mark-up
pen, which is what she is doing to your sentence. She is a villain in the Affix Aliens' sense: she
is playable, the sentence is hers to deface, and the damage is the fun. §12.1 is where she becomes
an actual antagonist.

Her name is the joke and the lesson together: a **serif** *is* an added stroke — the mark a broad
pen leaves entering and leaving a letter. She is what happens when that habit gets out of hand.

### 4.2 Shot design

Her projectile **is the stroke**: a short tapered bar, thick in the middle and drawn to a point at
both ends, the shape a pen makes in one pass. Drawn into an offscreen canvas and handed to the Hero
constructor as a **data URL** — `drawBroadswordSprite()`'s and the Affix Aliens' trick, so the
placeholder takes the identical `Image()` path real art will, and swapping in a PNG later is one
string.

Her own sprite is drawn the same way (`drawSerifinSprite()`), holding a nib pen. The function
**returns the muzzle it drew**, in source pixels, and that becomes her `projectileAnchor` — measured,
never guessed. Keen Arrow's bolt launching from 211 px of empty sky is the bug this prevents, and it
only stays prevented if the sprite function keeps owning the number.

One hero, one bolt, one span id, so no `targetId` override is needed: `Hero.targetId` already
defaults to `symbol`, and `symbol` is the span id. **`"Serifin ✎"`.**

### 4.3 Parked: the one who takes a stroke away

The inverse map is free — invert §3.1 and `adorn → acorn`, `night → right`, `adapt → adopt`,
`the → tho`. Measured, it is slightly *richer* than the add map (7.8% of common words vs 7.6%), and
a second character would make Switch Character meaningful in the mode (the General & Keen and
Prefixer & Sufferix pattern).

**Not in v1.** Serifin adds strokes; taking them away is somebody else's job, and the mode is
complete without them. When it is wanted, the shape is settled: a second character (**Sans**, the
sans-serif villain — she scrapes serifs off), adjacent in `availableHeroArray`, reading the same
table backwards, with Switch Character flipping the direction. §12.2.

---

## 5. The span — one letter, one id

A target word is rendered as:

```html
<i class="sf-word" data-sf-word="adopt">ad<span id="Serifin ✎" class="sf-letter"
   data-sf="a e" data-sf-from="o" data-sf-turn="0">o</span>pt</i>
```

Three things about that markup are load-bearing.

### 5.1 The letter spans must be pushed into `nodeArr` by hand

`waitForElement()`'s observer reports a mutation's **`addedNodes`**, which lists only *directly*
inserted nodes — never their descendants. `#output.innerHTML = …` therefore puts only the
**top-level** children of `#output` into `nodeArr`. A `<span>` inside the `<i class="sf-word">`
wrapper is invisible to it, and a team built from an empty `nodeArr` leaves `player` undefined and
`animate()` throwing on every frame — the white-screen footgun, hit three times already (the title
banner, Word Race's field wrapper, the shelf fan's children).

The shelf fan's remedy applies unchanged: **push them in by hand.** One seam in `index.js`, after
`await waitForElement("#output span")` resolves and **before** `heroToTheRescue(nodeArr, …)` builds
the team:

```js
// index.js, at the bottom, straight after `elm = await waitForElement("#output span");`
if (dropDownSelection === "serifin")
  nodeArr.push(...out1.querySelectorAll(".sf-letter"));
```

The collision walk's existing `isConnected` guard covers the rest.

**Why a wrapper at all, when top-level spans would need no push:** `white-space: nowrap`. Each
letter span is an `inline-block` (§5.2) and inline-level boxes can break between them, so without a
nowrap container a long word would split mid-word on a narrow window — including on desktop, where
words move whole today. One `<i>` fixes it, and `<i>` inside a target span is already proven safe
(the ladder's `.ladder-face`, the affix markers). **Never a nested `<span>`.**

### 5.2 The letter's box is frozen, so a swap cannot reflow the line

`#output` is `position: fixed` with `left/right: 0` and `text-align: center`, which centres **every
line individually**. Any width change anywhere in a line slides the whole line sideways — the exact
problem ApostroPharaoh's squash was built around ("every way of deforming a word through *layout*
changes the line's width").

`l` and `t` are not the same width. So each `.sf-letter` is `display:inline-block; text-align:center`
with its **width frozen at wrap time to the widest glyph it can ever show** — the max over
`[original, ...candidates]`, measured once per round with one offscreen canvas `measureText` in the
mode's face at the output size. A swap then repaints inside a box that never changes, the word's
width is constant, and the line never moves.

It also gives a 5 px hit margin a stable target, which matters more here than anywhere: a letter at
300% is ~30 px wide where a word is 150.

### 5.3 The target is visible before you shoot

A live letter carries a **thin red underline** in Serifin's own colour (`.sf-letter` with a
`border-bottom`, not `text-decoration`, so it sits clear of the glyph's descenders). You can see
which letters she can reach before walking to one, and dead letters in a target word are plain text.
The underline is the mode's whole affordance — there is nothing else on screen that says *this `o`,
not that one*.

---

## 6. Rules on a hit

### 6.1 The swap, and the cycle

A letter's candidate list is `[original, ...candidatesOf(original)]`, **computed once at wrap time
from the word as typed**. Each hit advances `data-sf-turn` by one and wraps round, so `adopt`'s `o`
walks `o → a → e → o → a …`.

**Why cycling rather than chaining.** The alternative is to recompute from the letter now on screen,
which gives chains (`cut → out → gut`) — and costs the player every candidate they did not get
first. `adopt`'s `o` makes both `adapt` and `adept`; under chaining you are handed one of them by
list order and the other is gone, because `a` adds no stroke to anything. Cycling guarantees every
candidate is reachable, keeps the live-letter set and the frozen boxes static for the whole round
(§5.2), and is the rule **Betar's Alphabet Slots already uses** — including its return to the
original — so it is a rule the player has met. Chaining is §13 #1.

### 6.2 The clank

A letter with a single candidate that is already showing, or a shot landing on a letter whose list
has run out, **clanks**: a grey `drop-shadow` flash (never her own colour — her colour is what a
landed stroke writes, so a clank borrowing it would read as a hit) and a dull tick. `.sf-clank`,
modelled on `.affix-clank`, `drop-shadow` rather than `text-shadow` for the ladder's reason — it
layers over the glyph's black outline instead of blanking it for the length of the flare.

In practice the clank is rare: dead letters are not targets at all, and the shot simply passes
through them.

### 6.3 One action per shot

The latch `claimSerifinShot(projectile)`, exactly `claimAffixShot`/`claimLadderShot`: a projectile is
not spliced out of `projectiles` until a `setTimeout(…, 0)`, and **adjacent letters are far closer
together than adjacent words** — at 300% two neighbouring letter boxes are ~30 px apart and the hit
margin is 5 px. Without the latch one stroke could land on two letters.

### 6.4 Articles

`a cat → a oat` is wrong, and `an apple → am apple` is right (and funny). Reuse the ladder's
**`fixArticleBefore`** on the word's wrapper after each swap — it already solves `a dog → an animal`
and the affix mode's `an unhappy → a nonhappy`. It needs the word's new spelling, which is
`data-sf-word` rebuilt from the wrapper's `textContent`, not the letter span alone.

### 6.5 Suppressions

**None needed.** Art the Tickler and the Foon run in `articlesSpoonerisms` only, so the
`heroManagedWords` flag in `utils/utils.js` is untouched by this mode. Worth stating because every
ladder-family mode has had to join that flag and this one does not.

---

## 7. The font — the mode wears Jost\*, and that is already in the repo

The sentence is set in **Palanquin**, whose `a` is **double-storey**: a bowl, a stem *and* an arched
top. `o → a` in Palanquin is two strokes, not one — and `o → a` is 769 swaps, the single biggest row
in the table (§2). Shipping the mode in Palanquin would make its best row a lie on screen.

So **the mode changes the typeface**, which is the most on-theme possible fix: a typographic villain
turns up and the sentence is suddenly set in something else. One rule, scoped to the mode the way
Word Race's `.race-mode` is:

```css
#output.serifin-mode { font-family: "Jost", "Palanquin", sans-serif; }
```

Precedent for a mode owning its face already exists — Betar's Alphabet Slots sets
`font-family: monospace` inline on every span it wraps.

**The face is `fonts/Jost-latin.woff2`, already in the repo** — fetched for Inklings' Scriptorium as
its *geometric* Vox leaf, OFL, credited in `fonts/Jost-OFL.txt` and `data/typefaces.json`
("a sans built out of the compass and the ruler"). Nothing new is downloaded and no licence question
is reopened. Jost\* is a Futura line: single-storey `a`, single-storey `g`, a plain `l` with no tail,
a circular `o`, monoline arches on `n m r`, `u` open at the top. Every row of §3.1 is literally true
in it.

Two details:

- The file is **Google's full latin subset (9.4 KB), not the Scriptorium's 52-letter cut**, so it
  carries the space, comma and full stop the sentence needs. If `fetch-typeface-fonts.sh` is ever
  re-run with `pyftsubset` on PATH it will shrink to letters only and this mode's punctuation will
  silently fall back to Palanquin mid-line. The fix is a second `GLYPHS` entry in that script, not a
  second copy of the font.
- The `@font-face` is declared once in `index.css` with `font-display: swap`, and §5.2's width
  measurement **must run after `document.fonts.ready`** or every box is frozen to a Palanquin
  metric.

---

## 8. Animation — the stroke is drawn on

The payoff of the whole mode is watching a pen add the stroke. This is where the §3.2 prune pays:
every surviving mapping has a stroke that can be *drawn*, so there is a path to animate.

A small hand-authored table of **SVG paths in the letter box's own em units** — one per mapping,
~22 entries, keyed `"o>a"`, `"l>t"`, `"c>o"` — laid over the glyph:

```js
const STROKE = {
  "l>t": "M .08 .46 H .92",            // the crossbar
  "o>a": "M .86 .28 V .78",            // the stem down the right side
  "o>e": "M .12 .50 H .88",            // the bar across
  "c>o": "M .80 .26 A .34 .34 0 0 1 .80 .74", // close the ring
  "u>o": "M .14 .30 A .36 .30 0 0 1 .86 .30", // close the top
  …
};
```

The beat, ~420 ms total:

1. The bolt lands. An **absolutely positioned SVG inside `#output`**, sized and placed over the
   letter's (frozen, therefore known) box — the cartouche's rule: *never join the line box*, so it
   can neither reflow the sentence nor be clipped by it, and it dies when `#output` is rewritten.
2. The stroke **draws on** in her red over ~220 ms, `stroke-dasharray` from 0 to its own length —
   the Tree of Kinds' and the cartouche's technique.
3. The glyph **swaps** under it, and the drawn stroke fades from red into the sentence's ink over
   ~200 ms, so the new letter absorbs the mark that made it.

Degrades honestly: with no entry in `STROKE` the letter swaps with a red flash and no drawn stroke —
never a wrong stroke. That is also the M3 build (§10): the mode is playable before a single path is
authored.

**Later, not now:** the shared Scriptorium alphabet (`data/wordshape-alphabet.json`) defines all 52
glyphs as actual polyline strokes, so `t` minus `l` *is* the crossbar, computable rather than
authored. That retires the hand table and makes the claim verifiable — but it means drawing the hit
letter as canvas polylines rather than type for the length of the animation, which is a different
and much larger piece of work. §12.4.

---

## 9. Sound — PROVISIONAL

Three cues on the existing `_tone`/`_noise` kit, no new assets, matching how every synth hero in the
game is scored. Nothing depends on these being right.

- **`_serifinShoot()`** — a short filtered-noise swish with a pitch drop: a nib leaving paper.
- **`_serifinDraw()`** — the one that matters, and it must *last as long as the stroke does* (~220 ms)
  rather than being an impact: a band-passed noise scrape rising slightly in cutoff, landing on a
  bright two-note tick as the glyph swaps. The sound of the stroke being drawn, not of a hit.
- **`_serifinClank()`** — a 45 ms dull tick, deliberately the shortest cue in her set.

Serifin **overrides `hitProjectileSound()` to silence**, for the ladder's and the aliens' reason: one
hit has three outcomes and the generic one-hit-one-sound call site cannot say which.

---

## 10. Milestones

| | |
| --- | --- |
| **M1 — the table** | ✅ **BUILT 2026-10-18.** `build-serifin-pojo.js` + `serifinPOJO.js`. Offline and verifiable on its own: the §2 numbers reproduce. |
| **M2 — the mode** | ✅ **BUILT 2026-10-18.** `serifinFunc.js`, `protectedSerifin`, the `<option>`, the guard, the `nodeArr` push, the frozen boxes, **and the font**. Nothing to shoot yet. |
| **M3 — the hero** | `Serifin` + her two drawn sprites, the collision branch, the swap, the cycle, the clank, `fixArticleBefore`. **Playable.** The glyph swaps with a flash; no drawn stroke yet. |
| **M4 — the feel** | §8's `STROKE` path table and the draw-on animation, §9's three cues, the `modeHelp.js` card and the `modeArt.js` picture. |

M3 is the line worth holding: everything through it is mechanism, everything in M4 is the thing the
mode is *for*. Do not reorder them — a drawn stroke over a mode that does not yet cycle correctly
teaches the wrong rule beautifully.

### 10.1 As built (M1 + M2)

Four things the build settled or departed from, and nothing else is worth repeating out of the diff.

**The table is a `Map`, not `entryFor`.** §3.5 rule 3 asked for `CaretFunc.js`'s own-property test
on the grounds that this is a generated file like the others. It is a `Map` instead — the ladder's
answer to the same trap — because the compact POJO strings have to be parsed into a structure at
load time anyway, so the Map is free and the guarantee is stronger than a discipline every future
lookup has to remember. The trap is real and was verified, not assumed: **`constructor` and
`prototype` are both entries in `2of12.txt` and in `enable1.txt`.**

**The guard loads the corpus, which no other `WORDPLAY_GUARDS` entry does.** `hasSerifinWords`
answers "no" to everything until the table has landed, and the generic guard check in the Pow!
handler runs *before* the ladder's own `await`. So `loadSerifin()` is awaited at the top of that
`else` branch, ahead of the table lookup — the ladder solves the same problem the other way round
(an inline check after its await) because its guard was never a table entry. §11's row stands.

**M2 lands with no hero, deliberately.** Nothing answers to `SERIFIN_ID` until M3, so the team comes
back empty and the title-page hero stays on screen. That is survivable rather than fatal because
`doActionOnce()` returns early on an empty team instead of leaving `player` undefined and `animate()`
throwing every frame — the Affix Aliens shipped their own M2 this way. One placeholder line in
`#error-message` says so, written *after* the handler's own clear, and M3 deletes it.

**The cards are still M4, so picking the mode shows the punctuation card.** `modeHelpFor` and
`renderModeArt` both fall back to it for an unknown mode — the exact complaint those modules were
built to fix — but the mode is behind `?dev=1`, so only the dev sees the wrong card, and the Affix
Aliens have been in that state since August.

---

## 11. Wiring checklist

| file | change |
| --- | --- |
| `build-serifin-pojo.js` | ✅ **new.** Offline generator; holds the §3.1 table, the §3.4 tier flag and the §2 checks. |
| `serifinPOJO.js` | ✅ **new, generated.** 2,995 entries, 56 KB. Never hand-edited. |
| `serifinFunc.js` | ✅ **new.** `SERIFIN_ID`, `SERIFIN_OBSCURE`, `loadSerifin`, `serifinReady`, `hasSerifinWords`, `wrapSerifin`, `serifinCandidates`, `serifinCycle`, `serifinSwap`, `serifinWordNow`, `freezeLetterBoxes`. Lazy-imports the POJO. |
| `SpanPlaceholder.js` | ✅ `export const protectedSerifin = withSpanPlaceholders(wrapSerifin);` |
| `utils/utils.js` | ✅ `case "serifin":` in `addSpansAndIdsForWordPlay`'s switch. **No `heroManagedWords` change** (§6.5). |
| `punctuators.html` | ✅ `<option value="serifin" data-dev>Serifin's Strokes</option>`, stripped in the dropdown IIFE **before** the custom dropdown is generated (§1.3). |
| `index.js` | ✅ the `WORDPLAY_GUARDS` entry + the `loadSerifin()` await in front of it (§10.1); the `serifin-mode` class and the `freezeLetterBoxes` call at Pow!; the `nodeArr` push after `waitForElement` and before `heroToTheRescue` (§5.1). **M3:** `drawStrokeBoltSprite`/`drawSerifinSprite`; `class Serifin`; the instance + its place in `availableHeroArray`; the collision branch; `shootSerifin`; `claimSerifinShot`; `flashSerifinClank`; the three SFX. |
| `index.css` | ✅ `@font-face` for Jost; `#output.serifin-mode`; `.sf-word`; `.sf-letter`; `.sf-clank`; `.sf-stroke` (the SVG overlay, waiting on M4's paths). |
| `modeHelp.js` | the card (M4). Its worked example must be real in the shipped POJO — regenerating the table can leave it stale. |
| `modeArt.js` | the card (M4). Glyph: an `l` with its crossbar arriving. |
| `docs/punctuators.md` | a line in the cast, once it is playable. |
| `CLAUDE.md` | ✅ the Punctuators row's doc list. |

The guard:

```js
serifin: {
  has: hasSerifinWords,
  nope: "No letter here grows by one stroke — try `adopt`, `cut` or `night`!",
},
```

Named words in the message, not a shrug: §2 says the misses are real but uncommon, and the three
named words are each a different source letter.

---

## 12. Parked

### 12.1 "Serifin Was Here" — the restore puzzle

She defaces a famous line *before* you see it (`the quick brawn fox`) and the player shoots the
vandalised letters back to true. Punctuators' second mode with a right answer, after Restore the
Phrase — and it inherits that mode's whole shape: a generated-then-frozen daily, no fail state,
wasted shots as the score and the share stat.

The reason it is parked rather than built first is that it needs the inverse character (§4.2/§12.2)
to be the one shooting, and it needs free play to have swept the table for duds. Restore the Phrase
needed its corpus pruned by being played; this will too.

### 12.2 Sans — the one who takes a stroke away

§4.3. The table inverted, a second character, Switch Character flipping the direction. The data cost
is zero; the build is a sprite, a bolt and a collision branch that reads the same POJO backwards.

### 12.3 Capitals

A capital is never a target in v1 (§3.5). The capital table is its own small hand-written thing
(`F → E`, `P → B`, `P → R`, `C → G`, `C → O`, `O → Q`, `I → T`, `L → E`…) and worth having, because
capitals are a different tool eight centuries older — the Roman chisel, where the lowercase is the
Carolingian pen. The Scriptorium makes exactly this argument in Inklings
([`inklings-typography.md` §10](inklings-typography.md)); Serifin is the place it could be *played*
rather than read.

### 12.4 Strokes from the shared skeleton

§8's last paragraph. `data/wordshape-alphabet.json` already holds 52 glyphs as polyline strokes in
authored handwriting order, shared by Wordshape and Inklings' Scriptorium. The difference between
two glyphs is then a real polyline, not an authored guess — and Serifin becomes a third consumer of
the repo's one alphabet.

---

## 13. Open questions

1. **Cycling or chaining?** §6.1 ships cycling (Betar's rule) because it makes every candidate
   reachable and keeps the round's geometry static. Chaining (`cut → out → gut`) is the more
   surprising mode and the more alive one. It could be a later toggle — but it would unfreeze the
   live-letter set mid-round, which §5.1's hand-pushed `nodeArr` and §5.2's frozen boxes both assume
   is static. Not a small change; a deliberate one.
2. **The mode's name.** `Serifin's Strokes` matches `Affix Aliens` in naming the character. `Strokes`
   alone matches `Caret`, `Rounded`, `Split`. The dropdown is currently split between the two
   conventions.
3. **Should a dud be shootable?** §3.4 hides `enable1`-only results entirely. The alternative is to
   mark them differently — a dotted underline — so `over → oyer` is available and labelled as the
   obscure word it is. That is a vocabulary feature hiding inside a letterform mode; probably no.
4. **Her colour.** Proofreader's red (`#be123c`) is the argument in §4.1, and red is the one colour
   in this game that can read as *error*. Wet-ink teal is the alternative.
5. **Does a shot through a dead letter deserve a cue?** §6.2 says the shot passes through in silence.
   Letters are narrow; a near miss and a pass-through will feel identical, and silence may read as
   the mode being broken — the same complaint that pulled three of the Affix Aliens' cues forward out
   of M4.
6. **Does the table want a blocklist?** Found scanning the built POJO (2026-10-18) and **not acted
   on**, because it changes what the mode does. The dictionary gate (§1.2) guarantees a real word,
   not a word you want on screen: `hitch → bitch`, `lick → dick`, `rope → rape`, `fog → fag`,
   `sox → sex`, `slab → stab`, `lie → die`, `lead → dead`. **22 results** land in a modest scan of
   the obvious set, four or five of them genuinely unpleasant. It matters more here than in any
   other mode for two reasons: the result is the *payoff*, read out loud, and Punctuators' own How
   to Play pitches the game as a classroom tool. The fix is cheap and belongs in the build, not the
   runtime — a `BLOCK` set beside `ADD` in `build-serifin-pojo.js`, so the shipped table simply has
   no such entry and nothing at play time has to know. The question is only whose list it is.
