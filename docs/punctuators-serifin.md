# Punctuators — Serifin (Strokes)

**Status: M1 the table, M2 the mark-up BUILT 2026-10-18; M3 the hero BUILT 2026-10-20; M4 the feel
BUILT 2026-10-22 — THE MODE IS COMPLETE.** Shoot a letter and a pen draws the one stroke on, in her
red, and the glyph becomes the other letter under it (§8, §10.3). The How-to-Play card and the mode
picture landed with it. **DEV-ONLY** (`?dev=1`) — see §1.3.

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

(The mode sets its own typeface for the first row's sake: `o → a` is one stroke only in a face with
a **single-storey `a`**, which Palanquin's is not — see §7 and the rule in §7.1. Checked against the
shipped table, which is where the last two rows came from: `i → j` has only
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
string. **Its canvas is 80 × 140, not square, and that is an aiming decision** — see §10.2.

Her own sprite was specced to be drawn the same way (`drawSerifinSprite()`), holding a nib pen, with
the function **returning the muzzle it drew** so that `projectileAnchor` was measured and never
guessed — Keen Arrow's bolt launching from 211 px of empty sky being the bug that prevents. **The
dev's art landed before M3 did**, so the function was never written and the rule applies to the
PNGs instead: the nib is measured off the art's own alpha (§10.2), not estimated by eye.

**AS BUILT:** `images/Serifin_Start.png` (resting, the brush raised) and `images/Serifin_2.png`
(attack, the brush swept down through the stroke), both 800 × 1045 — the ladder pair's frame, hence
the same `heroScale 0.45`.

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
not that one*. It is therefore also how §6.2 says *not this one, for now*: a live letter in a word
that has already moved loses the underline (`.sf-dead`) until the moved letter cycles home, so it
looks exactly like what it then is — not a target.

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

### 6.2 One stroke per word at a time

**The dev's call, 2026-10-20, and it exists to keep §1's premise true.** She only ever draws where
a real word is left — so the sentence has to stay English.

**9.2% of the table's common-tier source words carry two live letters.** `car` offers both its `c`
and its `r`, and each is a real word on its own (`oar`, `can`). But §6.1's cycle is computed from
the word *as typed*, so nothing in a letter's own state knows the word has moved underneath it, and
shooting both gives `oan`. **Measured across all 171 such words: of the 262 reachable two-letter
combinations, 52.7% are not words.** It is reachable rather than theoretical, because adjacent live
letters are exactly what a player is tempted to shoot in sequence.

So a letter that has walked off its original **deadens its siblings** in that word — `id` removed,
so the collision gate skips them and a shot passes straight through exactly as it does over a letter
that was never a target — and **cycling it home brings them back**. A multi-letter word becomes a
choice instead of a pile-up.

Two details. The siblings are deadened by `.sf-dead`, which turns the underline **transparent**
rather than removing the border: `border-bottom` is part of the box, so dropping it would shorten
the letter and move the line (§5.2's whole rule). And restoring the `id` is a constant, not a stash,
because every live letter shares one id (§4.2).

The alternative that fixes this by construction is **chaining** (§13 #1) — recompute candidates from
the glyph now on screen and the word is always real — but it unfreezes the live-letter set mid-round,
which §5.1's hand-pushed `nodeArr` and §5.2's frozen boxes both assume is static.

### 6.3 The clank

A letter with a single candidate that is already showing, or a shot landing on a letter whose list
has run out, **clanks**: a grey `drop-shadow` flash (never her own colour — her colour is what a
landed stroke writes, so a clank borrowing it would read as a hit) and a dull tick. `.sf-clank`,
modelled on `.affix-clank`, `drop-shadow` rather than `text-shadow` for the ladder's reason — it
layers over the glyph's black outline instead of blanking it for the length of the flare.

In practice the clank is rare: dead letters are not targets at all, and the shot simply passes
through them.

### 6.4 One action per shot

The latch `claimSerifinShot(projectile)`, exactly `claimAffixShot`/`claimLadderShot`: a projectile is
not spliced out of `projectiles` until a `setTimeout(…, 0)`, and **adjacent letters are far closer
together than adjacent words** — at 300% two neighbouring letter boxes are ~30 px apart and the hit
margin is 5 px. Without the latch one stroke could land on two letters.

### 6.5 Articles

`a cat → a oat` is wrong, and `an apple → am apple` is right (and funny). Reuse the ladder's
**`fixArticleBefore`** on the word's wrapper after each swap — it already solves `a dog → an animal`
and the affix mode's `an unhappy → a nonhappy`. It needs the word's new spelling, which is
`data-sf-word` rebuilt from the wrapper's `textContent`, not the letter span alone.

### 6.6 Suppressions

**None needed.** Art the Tickler and the Foon run in `articlesSpoonerisms` only, so the
`heroManagedWords` flag in `utils/utils.js` is untouched by this mode. Worth stating because every
ladder-family mode has had to join that flag and this one does not.

---

## 7. The font — the mode wears Jost\*, and that is already in the repo

> **The rule, if you read nothing else here: the face must have a SINGLE-STOREY `a`** — a bowl with
> a straight stem on its right, so that `o → a` really is *one line added on the right*. Any
> replacement face has to pass that test. §7.1.

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

### 7.1 THE RULE ANY FACE THIS MODE WEARS MUST PASS: a SINGLE-STOREY `a`

Stated separately because it is a **standing constraint on every future change to this rule**, not a
one-off reason for picking Jost\*. If the face is ever swapped — for a nicer sans, for a webfont
that loads faster, for a face that matches the rest of the site — **the replacement must have a
single-storey `a`, or the mode breaks.**

A single-storey `a` is a bowl with a stem down its right side — an **`o` with one line added on the
right**. That is literally the mode's biggest claim: `o → a` is **769 swaps, more than any other row
in the table** (§2), and the animation M4 draws for it is one vertical stroke. In a double-storey
`a` — Palanquin's, Helvetica's, Times' — the bowl is smaller, the stem curves over into an arched
hood above it, and the shape is at best two strokes and a redrawn bowl. Shoot the `o` in `adopt`
under a double-storey face and what you watch is not the thing the mode says is happening.

The quick test on any candidate face: **set `o` and `a` next to each other and see whether you can
get from one to the other by adding a single stroke and changing nothing else.** If you can't, the
face is wrong for this mode however good it looks. The same check applies to `l → t` (the crossbar
needs a plain, tail-less `l`), `u → o` (the `u` must be open at the top, not a bowl with a stem) and
`c → o` (a circular `c`, so closing it gives a circular `o`); `a` is the one that carries a fifth of
the corpus, so it is the one worth naming in a heading.

Jost\* passes all four, which is why it is the face — not because it was already in `fonts/`, which
is only what made it free.

---

## 8. Animation — the stroke is drawn on

**BUILT 2026-10-22 as M4** (§10.3). The payoff of the whole mode is watching a pen add the stroke.
This is where the §3.2 prune pays: every surviving mapping has a stroke that can be *drawn*, so
there is a path to animate.

One table of **21 strokes, one per surviving row of §3.1**, keyed `"o>a"`, `"l>t"`, `"c>o"`, laid
over the glyph.

**As specced, the table held SVG path STRINGS in the letter box's own em units**
(`"o>a": "M .86 .28 V .78"`). **As built it holds FUNCTIONS of the measured glyph**, and the reason
is the mode's own claim: the stroke has to land exactly where the letterform grows, and a fixed
0–1 em path cannot be right for both a 0.07 em `l` stem and a 0.52 em `o` bowl in a face whose
metrics the table does not know. An authored constant would also quietly become a lie the moment
§7's face is swapped — which §7.1 permits, provided the `a` stays single-storey. So the geometry is
**measured**, the rule that gave `projectileAnchor` its number and `freezeLetterBoxes` its widths,
and each entry reads as a sentence about the letterform rather than as four magic numbers:

```js
"o>a": (g) => vline(g.to.r - g.sw / 2, g.xh, g.base),   // the stem down the right side
"l>t": (g) => hline(g.xh, g.to.l, g.to.r),              // the crossbar, at the x-height line
"l>b": (g) => bowl(g.from.c, g.xh, g.base, g.to.r - g.sw / 2 - g.from.c),
"n>m": (g) => arch(g.from.r - g.sw / 2, g.to.r - g.sw / 2, g),
"i>j": (g) => tail(g.from.c, g.base, g),
```

What `g` carries, all in CSS px inside the letter's own box: `base` and `xh` (the baseline and the
x-height line, the baseline **measured** off a zero-sized `vertical-align: baseline` probe rather
than derived from the font's ascent and half-leading), `band`/`mid`, `asc`/`desc` (the **result's**
own ink top and bottom, so `o → a` never reaches for an ascender it hasn't got and `o → e` never
dips below the baseline), `from`/`to` as `{l, r, c}` ink boxes, and **`sw`, the pen's weight,
measured as the ink width of an `l`** — the face's own stem, so the drawn stroke is as heavy as the
letter it joins. Five helpers (`vline`, `hline`, `bowl`, `arch`, `tail`) carry the shapes that
repeat.

### 8.1 Which end of a stroke is allowed to be wrong

One of them has to be, and this is the one thing in M4 worth knowing before changing it.

Both glyphs are centred in the **same frozen box** (§5.2), so a narrow original in a box sized for a
wide result does not sit where the result's corresponding part will: an `l` centred in a box as wide
as `b` has its stem ~0.2 em right of where the `b`'s stem lands, and an `n` in an `m`-wide box the
same. Measured on the shipped geometry, that is a ~10 px error at the sentence's 300% play size.

So each stroke meets the ink that is **on screen now** at one end and the **result's own ink** at
the other, and the far end is the one anchored on the result — a bowl's outer edge, an arch's second
leg, the end of a tail: the parts standing in empty space, where the eye has nothing to compare them
against and a misplacement would be the only thing visible. The near end sits on the original's ink,
so it is right for the whole time it is being drawn and shifts only when the glyph swaps under it —
which happens as the mark is already fading, the one window in the beat where a hair of mismatch
reads as the mark dissolving rather than as a misdraw.

The other way round — anchoring both ends on the original — draws a correct-width bowl ending 11 px
outside the glyph that replaces it, which is the same error moved to the half of the stroke that is
on its own against white.

### 8.2 The beat, ~420 ms total

1. The bolt lands. An **absolutely positioned SVG inside `#output`**, sized and placed over the
   letter's (frozen, therefore known) box — the cartouche's rule: *never join the line box*, so it
   can neither reflow the sentence nor be clipped by it, and it dies when `#output` is rewritten.
2. The stroke **draws on** in her red over ~220 ms, `stroke-dasharray` from 0 to its own length —
   the Tree of Kinds' and the cartouche's technique.
3. The glyph **swaps** under it, and the drawn stroke fades from red into the sentence's ink over
   ~200 ms, so the new letter absorbs the mark that made it.

`drawSerifinStroke` returns **true when it has taken responsibility for the swap** and false when
there is nothing to draw — no path for this mapping, no `TextMetrics.actual*` to measure with,
`prefers-reduced-motion` — in which case the caller swaps immediately and the mode behaves exactly
as M3 shipped. There is no third outcome and **never a wrong stroke**: M3 *was* the degrade, so it
was shipping and tested long before a path existed.

**The swap is the one beat that must not be allowed to fail.** An animation can be cancelled — a
reflow, a tab going to sleep — and a stroke that never finishes would otherwise leave the letter
permanently unchanged against a shot that hit it. So a timer at `SF_DRAW_MS + 90` sits under
`onfinish` as a floor, and a `swapped` latch makes whichever arrives first the only one that counts.

Also: **one stroke in the air per letter.** Shots land ~1.4 s apart so a second bolt mid-draw is a
guard rather than a live path, but two marks on one glyph read as a glitch, so a new stroke removes
the previous one (a `WeakMap`, since `#output` is rewritten wholesale on a new sentence and these
nodes go with it).

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
  **As built it takes one argument, `wrapped`** — the cycle coming home (§6.1), where the second note
  falls to the first's octave below instead of rising off it. A return to the letter you typed is a
  fact about the letter, not a failure (Betar's rule, which the player has met), so it is a different
  ending and never a buzzer. Three staggered `_noise` bands make the travel; one is only a scrape.
- **`_serifinClank()`** — a 45 ms dull tick, deliberately the shortest cue in her set.

Serifin **overrides `hitProjectileSound()` to silence**, for the ladder's and the aliens' reason: one
hit has three outcomes and the generic one-hit-one-sound call site cannot say which.

**M4 moved `_serifinDraw`'s call site, and it was always wrong where M3 put it.** The cue is three
staggered noise bands making ~220 ms of travel with its two-note tick scheduled at **+0.20 s** —
i.e. it was authored for this animation's timing all along — and M3 played it *after* the swap,
which put the tick a whole beat late and made the travel read as a tail on the hit rather than as
the stroke being drawn. It now fires when the stroke **starts**, which is what §9 asked for in the
first place ("it must last as long as the stroke does rather than being an impact") and needed no
change to the cue itself. Worth keeping because the general shape recurs: **a cue written for an
animation that does not exist yet will sound wrong in a way that looks like the cue's fault.**

---

## 10. Milestones

| | |
| --- | --- |
| **M1 — the table** | ✅ **BUILT 2026-10-18.** `build-serifin-pojo.js` + `serifinPOJO.js`. Offline and verifiable on its own: the §2 numbers reproduce. |
| **M2 — the mode** | ✅ **BUILT 2026-10-18.** `serifinFunc.js`, `protectedSerifin`, the `<option>`, the guard, the `nodeArr` push, the frozen boxes, **and the font**. Nothing to shoot yet. |
| **M3 — the hero** | ✅ **BUILT 2026-10-20.** `Serifin` on the dev's own art, her drawn bolt, the collision branch, the swap, the cycle, §6.2's one-stroke-per-word rule, the clank, `fixArticleBefore`, three cues. **Playable.** The glyph swaps with a red flash; no drawn stroke yet. |
| **M4 — the feel** | ✅ **BUILT 2026-10-22.** §8's 21 strokes and the draw-on animation, §9's cue moved to the start of the draw, the `modeHelp.js` card and the `modeArt.js` picture. §9's three cues themselves had already come forward into M3. **The mode is complete.** |

M3 was the line worth holding: everything through it is mechanism, everything in M4 is the thing the
mode is *for*. They were not reordered — a drawn stroke over a mode that does not yet cycle
correctly teaches the wrong rule beautifully — and the payoff was that M3's bare swap turned out to
be M4's own degrade path (§8.2), so the fallback was in play for two days before the thing it falls
back from existed.

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

**M2 landed with no hero, deliberately**, and the engine fact that made that safe is worth keeping
now that M3 has filled the hole: a mode whose span id no hero answers to builds an **empty team**,
and that is survivable rather than fatal only because `doActionOnce()` returns early on an empty
team instead of leaving `player` undefined and `animate()` throwing every frame. The Affix Aliens
shipped their own M2 the same way. M2's placeholder line in `#error-message` is gone; what replaced
it is the one line naming the red underline, still written *after* the handler's own clear, which
would otherwise wipe it.

**The cards were still M4, so picking the mode showed the punctuation card.** `modeHelpFor` and
`renderModeArt` both fall back to it for an unknown mode — the exact complaint those modules were
built to fix — but the mode is behind `?dev=1`, so only the dev saw the wrong card. **Fixed in M4**
(§10.3); the Affix Aliens have been in that state since August and still are.

### 10.2 As built (M3)

**She is not a drawn placeholder.** The dev supplied `images/Serifin_Start.png` and
`images/Serifin_2.png` — the same 800 × 1045 frame as the ladder pair, so `heroScale 0.45` — which
retires §4.2's `drawSerifinSprite()` before it was ever written. Only the **bolt** is drawn
(`drawStrokeBoltSprite`), and §4.2's rule about the sprite function owning the muzzle number
transfers to the art: the raised brush's nib in the resting frame tips out at source **(632, 94)**,
measured off the alpha, and that × 0.45 less half the bolt's drawn width *is* the
`projectileAnchor`. The two frames are resting / attack in the ordinary way — `secondHeroImage`,
drawn while a shot is up.

**The bolt canvas is 80 × 140, not square, and that is an aiming decision.** Every other drawn
sprite here uses 140 × 140 at `projectileScale 0.2` → a 28 px shot. But a projectile's hit box **is
its drawn frame**, and this mode's targets are single letters ~30 px wide with a 5 px margin either
side — so a 28 px bolt overlaps two adjacent live letters at once and always resolves to the
left-hand one, and `cut` offers both its `c` and its `u`, so that is not a corner case. 80 × 140
keeps a **16 px** frame: narrow enough to pick a letter, and the right shape for a pen stroke
anyway. The outline is `lineWidth 5` rather than the aliens' 8 because at 7 the round join blunted
the two points the whole shape is about.

**`projectile.serifinDone` joins the collision walk's early-outs**, beside `ladderDone` and
`interrobangDone`. `claimSerifinShot` inside the handler already refuses the second swap (§6.4) —
this stops the *second* letter being marked hit and retired against a shot that never changed it,
and it is the same 30 px-against-5 px margin that makes the latch necessary in the first place.

**The swap flash takes its colour from the SHOOTER, not the stylesheet.** `--sf-ink` is written onto
the span by `flashSerifinSwap` and read by the `sf-swap` keyframes (with the same red as the
`var()` fallback). It is her red either way today; Sans (§4.3) is the planned second character on
this same span, and a hard-coded red in the keyframes would be one more place to find.

**The letter is NOT left coloured**, which is where this mode parts company with the Affix Aliens
and the ladder — both of which paint the changed word in the hero's colour and leave it there. §8
step 3 already said so (the drawn mark fades *into* the ink), and the reason is §1: the joke is that
the sentence stays ordinary English, and a permanently red letter is the game pointing at its own
punchline. The red underline says which letters are live; it never said which ones have moved.

**The clank is effectively unreachable, and that is correct.** `serifinSwap` returns `null` only
when the cycle holds fewer than two entries, and `wrapSerifin` never emits a span with no
candidates — so §6.3's flash and cue are a guard, not a routine outcome, exactly as that section
predicted. §13 #5 (a cue for a shot through a *dead* letter) is the live version of the same
question and is untouched.

### 10.3 As built (M4)

Five things the build settled, and §8.1 is the one to read first.

**The `STROKE` table is functions, not path strings** — §8's own reasoning, recorded there rather
than here because it changes what the section specifies.

**The pen's weight is measured, not chosen.** `sw` is the ink width of an `l` in the face that is
actually rendering, which *is* the stem of the letter the stroke is joining — so the mark reads as
the same pen, and a heavier or lighter face needs no constant found and changed. Clamped to
0.04–0.16 em against a face with no `l` worth measuring.

**The baseline is measured too, off a probe rather than off the font's metrics.** A zero-sized
`inline-block` on `vertical-align: baseline` has its bottom margin edge *on* the baseline (it has no
line boxes of its own, so that is the rule), which makes its top the baseline to the pixel. The
alternative was half-leading arithmetic over `fontBoundingBoxAscent/Descent` and the span's content
height, which is three numbers that can each be wrong instead of one DOM read. The probe adds no
width and no height, so the line box and the centred glyph are untouched, and it is gone again
before anything else reads the span.

**The ink cache is keyed on the face's LOAD STATE.** Jost\* arrives on `font-display: swap`, so a
measurement taken before the woff2 lands is a Palanquin metric — and a cache that could not tell the
two apart would go on drawing every stroke of the round against the fallback. The Scriptorium's font
scorer hit exactly this and answered it the same way
([`inklings-typography.md`](inklings-typography.md) M2.5).

**`.sf-stroke` needs `overflow: visible`, and it is load-bearing rather than tidiness.** An SVG root
clips to its viewBox, and the box here is the *letter's* box — so an ascender (`o → b`), a descender
(`o → p`, `i → j`) or the extra arch of a wider result (`n → m`) is drawn outside it and would be
cut off at exactly the end a stroke is most readable from. The rule was already in the stylesheet
from M2, written blind; this is what it was for.

**The cards:** the `modeArt.js` entry needed **one new optional field, `face`**, and it is not a
style preference. The mode plays in Jost\* because `o → a` is one stroke only in a face with a
single-storey `a` (§7.1) — so a card showing `l→t` and `adopt → adapt` in Palanquin would make the
*picture of the mode* a lie about the mode, which is the one thing a mode picture cannot be. It
arrives as `--mode-face` on the card and `.mode-art__glyph` / `.mode-art__example` read it; every
other mode is untouched. The How-to-Play card leads with the rule no other card in that file has
ever had to state — **you shoot a letter, not a word** — because a player arriving from any other
mode aims at the middle of a word and hits whatever happens to be there.

---

## 11. Wiring checklist

| file | change |
| --- | --- |
| `build-serifin-pojo.js` | ✅ **new.** Offline generator; holds the §3.1 table, the §3.4 tier flag and the §2 checks. |
| `serifinPOJO.js` | ✅ **new, generated.** 2,995 entries, 56 KB. Never hand-edited. |
| `serifinFunc.js` | ✅ **new.** `SERIFIN_ID`, `SERIFIN_OBSCURE`, `loadSerifin`, `serifinReady`, `hasSerifinWords`, `wrapSerifin`, `serifinCandidates`, `serifinCycle`, `serifinSwap`, `serifinWordNow`, `freezeLetterBoxes`. Lazy-imports the POJO. ✅ **M4:** the `STROKE` table of 21 strokes + its five shape helpers, `glyphInk`/`baselineY`/`strokeGeometry` (the measuring), and `drawSerifinStroke` + `SF_DRAW_MS`/`SF_FADE_MS`. The stroke lives here and not in `index.js` because it is sentence-side work — letterforms and measurement, the same job as `freezeLetterBoxes`, sharing its offscreen canvas. |
| `SpanPlaceholder.js` | ✅ `export const protectedSerifin = withSpanPlaceholders(wrapSerifin);` |
| `utils/utils.js` | ✅ `case "serifin":` in `addSpansAndIdsForWordPlay`'s switch. **No `heroManagedWords` change** (§6.6). |
| `punctuators.html` | ✅ `<option value="serifin" data-dev>Serifin's Strokes</option>`, stripped in the dropdown IIFE **before** the custom dropdown is generated (§1.3). |
| `index.js` | ✅ the `WORDPLAY_GUARDS` entry + the `loadSerifin()` await in front of it (§10.1); the `serifin-mode` class and the `freezeLetterBoxes` call at Pow!; the `nodeArr` push after `waitForElement` and before `heroToTheRescue` (§5.1). ✅ **M3:** `drawStrokeBoltSprite`; `class Serifin` + the instance + its place in `availableHeroArray`; the collision branch + `projectile.serifinDone`'s early-out; `shootSerifin`; `claimSerifinShot`; `lockSerifinSiblings`; `flashSerifinClank`/`flashSerifinSwap`; the three SFX. `drawSerifinSprite` was never written — the dev's art landed first (§10.2). ✅ **M4:** `shootSerifin` splits its DOM writes into a `land()` the animation calls, reads the on-screen glyph as `from` before `serifinSwap` moves the state, and plays `_serifinDraw` at the START of the draw rather than after the swap (§9). |
| `images/Serifin_Start.png`, `images/Serifin_2.png` | ✅ **new (the dev's).** Resting and attack, 800 × 1045 like the ladder pair. |
| `index.css` | ✅ `@font-face` for Jost; `#output.serifin-mode`; `.sf-word`; `.sf-letter`; `.sf-clank`; ✅ **M3:** `.sf-swap` (+ `--sf-ink`), `.sf-dead`. ✅ **M4:** `.sf-stroke` is in use at last (it shipped with M2, written blind — its `overflow: visible` is what lets an ascender or a descender out of the letter's box, §10.3); `--mode-face` read by `.mode-art__glyph` and `.mode-art__example`. |
| `modeHelp.js` | ✅ **M4.** The card. Leads with *you shoot a letter, not a word* — the one rule no other card in the file has had to state. Every pair in it is real in the shipped POJO (`adopt` o→a/o→e, `cut` c→o, `night` n→m, `will` l→t); regenerating the table can leave them stale. |
| `modeArt.js` | ✅ **M4.** The card, glyph `l→t` — an `l` with its crossbar arriving, which is the mode's smallest true claim. Plus the one new optional field, **`face`**, so the picture is set in the typeface the mode actually plays in (§10.3) — Serifin is its only user. |
| `docs/punctuators.md` | ✅ the line in the cast. |
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
   **M3 took the pressure off it.** The one thing cycling got *wrong* rather than merely less lively
   was the two-live-letter word (`car → oan`), which chaining fixes by construction — and §6.2 now
   fixes it without touching the frozen set, by deadening the siblings instead. What is left for
   chaining is only the thing it was always wanted for, which is reach.
2. **The mode's name.** `Serifin's Strokes` matches `Affix Aliens` in naming the character. `Strokes`
   alone matches `Caret`, `Rounded`, `Split`. The dropdown is currently split between the two
   conventions.
3. **Should a dud be shootable?** §3.4 hides `enable1`-only results entirely. The alternative is to
   mark them differently — a dotted underline — so `over → oyer` is available and labelled as the
   obscure word it is. That is a vocabulary feature hiding inside a letterform mode; probably no.
4. **Her colour.** Proofreader's red (`#be123c`) is the argument in §4.1, and red is the one colour
   in this game that can read as *error*. Wet-ink teal is the alternative. **Cheap to change since
   M3:** the hero's `characterColor` is the only source — the swap flash reads it through `--sf-ink`
   (§10.2), the bolt is drawn from it and M4's drawn stroke is painted in it — leaving three
   literals: `.sf-letter`'s underline, the `sf-swap` keyframes' `var()` fallback, and the
   `modeArt.js` entry's `accent`.
5. **Does a shot through a dead letter deserve a cue?** §6.3 says the shot passes through in silence.
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
