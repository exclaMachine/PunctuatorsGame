# Punctuators: The Game — working notes

**This is not the base doc yet.** The game itself is still undocumented; the only written anatomy of a
wordplay mode lives in [`punctuators-ladder.md` §1](punctuators-ladder.md) — a dropdown `<option>`, a
`wrap*` function that marks target words with a span carrying the hero's name as its `id`, and a branch in
`animate()`'s collision block. This file holds what a session needs to know *before* touching `index.js` /
`utils/utils.js`, until someone writes the real thing.

Per-mode planning docs live alongside this one:
[`punctuators-ladder.md`](punctuators-ladder.md) (General Ization & Keen Arrow, plus Restore the Phrase,
Word Race and the Tree of Kinds) and
[`punctuators-affixes.md`](punctuators-affixes.md) (The Grand Prefixer & Sufferix — **M1 the tables, M2 the
mark-up and M3 the four heroes built, dev-only; M4 is the feel**).

---

## Hero placement across a switch

**FIXED 2026-08-23.** The incoming hero now **takes over the outgoing hero's spot**, matched *centre to
centre* — `switchToNextHero()`'s `slideOut` phase reads `current.position.x + current.width / 2` and places
the new hero so its own centre lands there. Centres rather than left edges because hero widths differ
enormously (Keen Arrow 40 px, Betar 320) and the projectile spawns off the hero's centre, so it's the centre
that has to stay under your aim.

Both earlier behaviours were wrong and neither should come back:

- **Recentring** (what the fix replaced — `player.position.x = canvas.width / 2 - player.width / 2`, added
  by commit `1e20911` on 2026-06-26 as part of the slide-down/slide-up animation, not as a placement
  decision). Walk to the left edge, switch, and you were teleported back to the middle.
- **Per-hero position memory** (the behaviour before `1e20911`, when switching was a bare `player = <next>`
  with no position write at all). Worse: switching dropped you wherever *that* hero happened to have been
  left last time.

The new placement is clamped by **`clampHeroX()`**, which repeats the bounds the arrow keys enforce (a hero
may hang half its width off either edge), so a wide hero inheriting a narrow one's edge position can't land
somewhere the player could never have walked to.

`restingY()`'s `+ 20`, the per-hero `projectileStartPositionX` and the per-hero `projectileAnchor` are the
other places a hero's size is baked into placement — worth remembering if this area is touched again.

---

## Where a shot is born (`Hero.projectileSpawn`)

**FIXED 2026-08-27.** A projectile used to be positioned inline at four call sites (both shoot handlers,
twice each) plus a fifth rewrite inside `Projectile`'s `onload`, all spelling out
`player.position.y` — **the top of the hero's image frame**, which is only the hero's weapon if the art
fills its frame. Since `restingY()` bottom-anchors that frame, any empty pixels an artist leaves above the
figure become dead space the shot launches from: Keen Arrow's figure occupies `(232, 382)–(674, 1045)` of
an 800 × 1045 file, so her arrow started 211 px above her crossbow.

All five sites now call **`Hero.projectileSpawn()`**. A hero may set **`projectileAnchor = {x, y}`** — an
offset from the top-left of its own frame, measured off the art — and the spawn point becomes that;
otherwise the method returns exactly what each site computed before, **including the long-standing
disagreement between them** (`+ width - projectileStartPositionX` in the handlers vs
`+ projectileStartPositionX` in `onload`, which agree only at half the drawn width). That is deliberate:
un-anchored heroes had to stay bit-for-bit identical. Three heroes are anchored so far: the two ladder
heroes, and ApostroPharaoh (see *ApostroPharaoh eats the letters*), whose shot is her own body.
Anchoring a hero also retires that footgun for it, since both branches then compute the same point.

---

## Projectiles in flight (`animate()`'s projectile pass)

**FIXED 2026-08-28.** Three separate faults, one shared cause: the projectile loop was doing the hero's
drawing and the array's bookkeeping as well as its own job.

### A second shot erased the first

Each in-flight projectile ran this, per frame, inside the collision walk:

```js
if (player.secondHeroImage) {
  c.fillStyle = "white";
  c.fillRect(0, 0, canvas.width, canvas.height);   // the WHOLE canvas
  player.update2();
}
projectile.update();
```

With two shots up, the first drew itself and the second then blanked the canvas before drawing — so the
earlier shot vanished while still travelling and still able to hit. **Full Stop was immune only because it
passes no `secondHeroImage`**, which is why its laser was the one that always looked right; every hero with
a second frame had the bug.

The hero is now drawn **once per frame**, at the top of `animate()`, and the projectile branches only move
projectiles. Which pose is drawn comes from **`heroWasFiring`**, written at the end of the previous frame —
deliberately not `projectiles.length`, because a projectile whose target span has gone (an `id` cleared by a
solved Restore-the-Phrase word, say) is never flown and never collected, and would pin the pose forever.

### `secondHeroImage: "white"` is a sentinel, not an image

Semicolonel and Apostrophantom pass the string `"white"`. It never loads (`image2.src = "white"` 404s), so
`image2` stays undefined and `update2()` is a no-op — **their entire effect was the wipe with nothing
redrawn over it.** They don't fire a projectile so much as fire *themselves*, so while their shot is up the
correct hero drawing is **none at all**. The pose decision is three-way for that reason:

| state | drawn |
| ----- | ----- |
| not firing | `player.update()` |
| firing, `secondHeroImage === "white"` | nothing — he launched himself |
| firing, real `image2` | `player.update2()` |

The Hero constructor's `if (this.heroImage === "white")` branch tests the **wrong property** and is dead
code; the sentinel it was meant to catch is on `secondHeroImage`. Left alone — the sentinel is handled in
`animate()` now — but don't mistake that branch for the mechanism.

### Retirement is by identity; flight is not the selected hero's business

`projectiles.splice(index, 1)` on the index the collision walk was holding went stale as soon as anything
else retired in the same frame, and then removed an unrelated shot. All four sites now call
**`retireProjectile(projectile)`** — idempotent, `indexOf`-based, still deferred a frame (that `setTimeout`
is what stops a shot blinking out at the instant it lands).

And because everything in the collision walk is gated on the target id of a hero — `player`'s at the time, `shooter`'s since the fix below — a shot
was only moved *and only collected* while a span belonging to the **selected** hero was on screen. Switching
characters therefore froze the outgoing hero's shots in the array, and the next switch resumed the whole
backlog on a single frame — a crowd of Semicolonels suddenly flying off at once. A **flight pass** after the
collision walk now finishes anything the walk didn't handle and retires it off the top of the screen.

`projectile.owner` (set at construction) is what makes that safe: a shot outlives its hero's turn on stage
now, so *"is one of my shots in the air?"* — the question the attack pose and Semicolonel's vanishing act
both ask — can only be answered by the projectile. Without it a stray shot would hold whichever hero you
switched to in its attack pose, or hide them.

### A shot is hit-tested against its owner's targets

**FIXED 2026-08-28**, on top of the same day's projectile pass. A projectile was hit-tested inside a loop
gated on the **current** `player`, and the whole branch body read `player.characterColor`, `player.symbol`,
`player.hitProjectileSound()` and so on — so a Semicolonel shot still in the air when you pressed Switch
Character was tested against **Sergeant Colon's** spans, and revealed a colon in Sarge's colour with Sarge's
hit sound. It predates the flight pass; letting shots finish their flight is what made it reachable.

The whole block now reads **`shooter`** — one binding at the top of the projectile loop,
`projectile.owner ?? player` — instead of the global. That is the gate
(`punctuationSymbol.id === (shooter.targetId ?? shooter.symbol)`), the reveal colour, the hit sound, the
tongue's reach, the `symbol` tests the asterisk/article/contraction branches make, and the `hero` argument
handed to `climbLadder` / `pickRung` / `raceShootUp` / `raceShootDown`. Those four already took the hero as
a parameter and never touched the global, so the ladder modes came along for free — and a General shot
crossing a switch to Keen now still **broadens**, rather than opening a fan because the selected hero
changed direction underneath it.

Two consequences worth knowing:

- The collision walk now runs for shots whose owner is **not** selected, which is the point — those shots
  find their own spans. The flight pass is still needed, and still only finishes what the walk didn't (a
  shot whose target span has gone).
- `firingThisFrame` is the one place that deliberately still asks about `player`:
  `shooter === player && shooter.secondHeroImage`. The attack pose and Semicolonel's vanishing act belong to
  the hero on stage, so a stray shot from a departed hero must not hold the current one in a pose.

Two smaller cases of the same "the global `player` isn't who fired" mistake went with it:

- **`Projectile`'s `onload` re-placement.** It read `player` in an *async* callback, so on the first shot
  with an uncached image the load could land after a switch and re-place the shot at the **incoming**
  hero's muzzle, mid-flight. The constructor now captures `const owner = player` and the callback uses it.
- **Comma Chameleon's tongue on switch.** The comment said "All other projectiles will stay though", but
  the code tested `projectiles[0]` and then did `projectiles.length = 0` — emptying the array and killing
  every other hero's in-flight shot whenever a tongue happened to be first. It now splices out the
  `CommaTongue`s and leaves the rest alone.

---

## ApostroPharaoh eats the letters

**BUILT 2026-08-31.** She is the game's only contraction hero — shoot `not` in *did not* and it becomes
`didn't` — and she is wired through `addSpansAndIds`, the ordinary punctuation round, not through a
wordplay mode. So she has no `<option>`, no `modeHelp.js` card and no `modeArt.js` picture: her word is a
bonus target sitting in the sentence alongside the punctuation. The mark-up is
`wrapContractionWithSpan` in `utils/contractionFunc.js` (`<span id="ApostroPharaoh (Contraction)"
class="not">not</span>`, the class being the word itself); everything below is the same file.

### What it used to do

Nothing you could see. The whole effect was two statements in the same tick: the space span in front of
the word got `.shrink-space` (font-size to 0 over a flat, uneased **1 second**) and the word's
`outerHTML` was overwritten with the contracted spelling. The letters did not go anywhere — they were
simply not there on the next frame, the apostrophe arrived before the two words had started closing up,
and the gap then drifted shut on its own long after the shot was over.

Three separate faults sat underneath that, and all three read as the same complaint — *she just
disappears*:

- **She "hit" the word from the middle of the screen.** The shared vertical test is
  `projectile.position.y - projectile.height <= word.top`, which is only "the shot has reached the word"
  when the shot is small. Hers is her own body: an 800 × 2000 PNG at scale 0.2, so **400 px tall**, and
  the test therefore fired a full body-length early. She was retired, and vanished, nowhere near the
  sentence.
- **She launched from empty sky.** Her hero art has the figure at `y 1030–2000` of its 2000 px frame and
  `restingY` bottom-anchors that frame, so the top ~309 px (at scale 0.3) is air — and an un-anchored
  shot is born at the frame's top. She took off 277 px above her own head, and 78 px to the right of it.
  This is exactly the bug `projectileAnchor` was added for (see *Where a shot is born*), and it matters
  more for her than for anyone else, because `secondHeroImage: "white"` erases the hero while her shot is
  up: she is not firing a bullet, she **is** the bullet, so a shot in the wrong place is *she* teleported.
- **`will not` threw.** The `won't` special case wrote over the stem's text node and then set
  `node.outerHTML = "t"`, detaching the node — and fell straight through into the `switch`, whose `not`
  case immediately did `node.previousSibling.className = …` on a node that no longer had a
  `previousSibling`. A TypeError every time, out of `animate()`, on the one contraction with a joke in it.

### The rule the animation is built on

**The apostrophe stands exactly where the eaten letters were.** Every case is the same shape — a head
that survives, the run of letters she takes, a tail — which is why the mark can be put into the DOM at the
very start, collapsed to nothing, and simply *grown into the hole the letters leave*. No measuring, no
absolute positioning, no second pass to place it.

| word | head | eaten | tail |
| ---- | ---- | ----- | ---- |
| `have` | | **ha** | `'ve` |
| `would` | | **woul** | `'d` |
| `is` / `has` / `us` | | **i** / **ha** / **u** | `'s` |
| `shall` / `will` | | **sha** / **wi** | `'ll` |
| `not` | `n` | **o** | `'t` |
| `am` / `are` | | **a** | `'m` / `'re` |

That is `CONTRACTION_PLAN`, and it is the only place the spellings live now — the old `switch` of
`outerHTML` strings is gone. (It also carried one typo worth not reproducing: the `had`/`would` case
emitted a **left** curly quote `‘`, where every other case emitted a straight `'`.)

### How it runs

**She flies through.** Her shot is never retired at the word; it carries on and off the top of the screen
and the flight pass at the end of `animate()` collects it. The letters go **while she is crossing them**,
which is why nothing in the eating is on a timer: `index.js`'s collision branch hands
`swallowContraction(span, passTop, passBottom, colour)` the top and bottom of her body every frame, and
how much of the word is gone is a pure function of how far she has crossed it — 0 when her leading edge
touches the word's bottom, 1 when her trailing edge clears its top, with the letters spread over the
first `EAT_WINDOW` (0.75) of that so the last one leaves with her still on top of the word rather than at
the instant she leaves it. The pass is ~46 frames, so a four-letter word like `woul` loses one letter
about every 140 ms.

Two beats, deliberately separate:

1. **The eating** — each doomed letter is wrapped in its own `<i class="cx-eat">`, coloured in her
   lightgreen at first contact so you can read what she is about to take, and goes to `opacity: 0` in
   turn. **Its box keeps its width.** Nothing moves yet.
2. **The contraction** — once she is clear, the eaten boxes collapse (`font-size: 0`) and the space span
   shrinks. The collapse is deferred one `requestAnimationFrame` after the letters are made transparent,
   or the word visibly shuffles sideways while you can still read it. This is *the squash*, below.

### The squash

Beat 1 is hers. Beat 2 belongs to the two words. The gap accelerates shut (`COLLAPSE_MS`, 260 ms, on a
hard ease-in, so the halves are still gaining speed when they meet) and then the finished word is
**squeezed**: the letters compress toward each other and stretch taller off the line (0.80 × 1.18 at
141 ms after the impact — fast in, because it is a collision), spring back **wider and shorter** than
they started (1.08 × 0.94), take a smaller counter-swing, and settle. `SNAP_MS` is 640 ms, and it is
long on purpose — a deformation the eye has to *read* needs about twice the time a mere impact needs to
register. Squash and stretch, and the pun made visible: a contraction contracts.

**All of it is one transform on one box.** The alternatives all deform the word through *layout* —
`letter-spacing`, margins, per-letter `font-size` — and every one of them changes the line's width;
`#output` centres **every line individually**, so any of them slides the whole sentence sideways on the
impact. A transform affects nothing outside the element it is on, so the problem cannot arise.

That box is `.cx-union`, and it exists only for the length of beat 2. The first of the two words is plain
text with no element of its own, so `wrapUnion` walks back from the space to the previous space (which is
also what picks up the separate `W` span of `Will` when Full Stop's capital has taken it) and moves
everything from there to the eaten span inside one `inline-block` `<i>`, whose `transform-origin` is its
bottom so the letters stretch **up** off the line rather than in both directions. `finish` takes it apart
again and `normalize()`s the parent: Master Asterisk reads the word in front of him with
`previousSibling.data`, which an element answers with `undefined` and a half-merged text node answers
with half a word — the same reason the `will` stem holder goes back to being text.

**It is wrapped before anything is asked to move.** Wrapping means taking the nodes out of the line and
putting them back, which resets any transition running on them; the eaten letters' fade is long finished
by the time `close` runs, but the collapse has not started yet and must not be reset.

The apostrophe is not there at all until the halves collide — it is what they knock loose, popping out
past full size and settling back (`MARK_FRAMES`). Its **width**, though, grows over the approach on the
same curve as everything else that is closing, so the box has stopped resizing before the squash starts:
a box still changing size while it is being deformed reads as a glitch. So what you see is a `scale`, not
the font-size — it sits *inside* the squashing box and must not change that box's width. Its animation
carries `fill: "backwards"` because `.cx-show` (its resting state, which it must be left in when the
animation ends) goes on up front; without it, the class landing early would flash a full-size apostrophe
before the collision.

### The cartouche

A cartouche is the ring Egyptian writing draws around a name, which is exactly the claim this beat has to
make: **these two words are one word now.** `sealCartouche` hangs off the squash's `onfinish` — the seal
follows the union, and measuring there keeps the ring off mid-deformation geometry — and
draws a gold pill around the finished word (stroke-dash, so it draws *itself*, both ends meeting at the
top centre), lays the tie bar across its right end a beat later the way a seal is pressed after the ring,
holds, fades, and removes itself.

It measures the `.cx-union` box, which is exactly the two words and is still in the sentence at that
moment (`finish` unwraps 40 ms later). **Where it sits:** it is absolutely positioned inside `#output` and never joins the
line box (the ladder rung strip's rule), so it cannot reflow the sentence it is drawn on; `#output` is
`position: fixed` with no border or padding, so it *is* the containing block and its client rect is the
origin — which also means the ring dies with the sentence the moment `#output` is rewritten. A
contraction that wrapped across two lines gets no ring.

### `will not` → `won't`

The one irregular: the stem changes as well, so she takes letters out of the word **before** the one you
shot, and its `i` **turns into an `o`** rather than being eaten (`w` · *i→o* · ~~ll~~ + `n` · ~~o~~ ·
`'` · `t`). Every letter involved sits in the single text node in front of the space — `"will"`, or just
`"ill"` when the W has already been taken by Full Stop's capital span, so **`Will not` works too** — which
makes the whole case one node swap into an `<i class="cx-stem">` holder. The `i` is the only letter that
is transformed rather than collapsed, so it is the only one that is `inline-block`; its text is swapped at
the halfway point of a 0.3 s `rotateX` flip, where it is edge-on and there is nothing to see. The flip
carries an `animation-delay` that lands that halfway point **on the impact**: `will` does not lose its i,
it turns over into the o of `won't` at the moment the two halves meet.

The holder is turned **back into a plain text node** when the animation finishes, because Master Asterisk
finds the word in front of him with `previousSibling.data`, which an element answers with `undefined`.

### Six things not to undo

- **The eaten span stays in the sentence, keeping its id.** It is not replaced by text the way the old
  code replaced it. The collision branch has to keep matching it for the rest of her flight, because that
  branch is what sets `firingThisFrame` — lose the target mid-flight and the hero is drawn at the bottom
  of the screen again while her body is still climbing past the sentence, i.e. **two of her**.
- **Its `class` is cleared at first contact** (to `cx-eaten`), because the hint button underlines any span
  whose class is still one of the contractable words, and an eaten word has nothing left to point at.
- **The letters stay `inline`.** A `font-size` transition collapses an inline box perfectly well — that is
  all `.shrink-space` has ever done — whereas `inline-block` re-spaces the whole word the instant the
  letters are wrapped, before anything has been eaten.
- **Inner markers are `<i>`, never a nested `<span>`**, the affix mode's rule.
- **Beat 2 deforms by transform, never by layout.** The moment the squeeze is expressed as width —
  `letter-spacing`, margins, font-size — it changes the line's width, and a centred line that changes
  width drags the whole sentence sideways on the impact.
- **`projectileAnchor: { x: 28, y: 277 }` is measured, not guessed.** Both PNGs are 800 × 2000 with the
  figure drawn in part of the frame (hero `y 1030–2000, x 6–782`; shot `y 159–1931, x 121–782`), which at
  scales 0.3 and 0.2 puts her standing centre 118 px into her frame against the flying body's 90 px, and
  her standing shoulders 309 px down against the shot's 32 px.

### Still to do

- **The apostrophe as a shed fang.** The third idea from beat 2's original list, and the one not taken:
  the mark dropping in point-down like a fang she has shed into the gap. It fights the rule the whole
  animation is built on — the mark stands exactly where the eaten letters were — so it would have to
  arrive *at* that spot rather than travel to it.
- **Her unused art.** `images/Anacontractshine.png` (her crowned head, standing) and
  `images/AnacontractshineEat.png` (**the head on a long 335 × 1630 neck, the crown doubling as an open
  jaw**) are referenced nowhere. They were drawn for a strike where the head leaves the body — which is
  what `Eat2` and `Eat3`, both **headless** torsos, are the other half of. Her shot could become the head
  with the neck drawn as a canvas Bézier back down to the body, and a swallowed bulge could travel down
  it with the eaten letter drawn inside.
- **A second attack pose.** She has none; `secondHeroImage` is the `"white"` sentinel.

---

## The sentence is centred on screen

**BUILT 2026-08-25**, CSS only (`#output` in `index.css`), and it applies to **every** mode. `#output` is
`position: fixed` with `margin: 50px` and had no `left`/`right`, so the box **shrink-wrapped its text** and
always began ~50 px from the left edge: a two-word sentence sat in the far-left corner and the hero had to
walk the whole width to reach it. `left: 0; right: 0` stretch the box across the viewport (the side margins
still hold the text clear of the edges, so the readable width is unchanged) and `text-align: center` does
the rest.

Three things about it that were decisions, not defaults:

- **Every line centres individually**, not the block as a unit — a short wrapped last line stays under the
  middle instead of being stranded at the left margin. Aiming is per-word, so it's each line that has to
  be near the centre, not the paragraph.
- **Horizontal only.** `top: 110px` stays: the gap between the sentence and the hero at the bottom *is* the
  projectile's flight time, and it's also the room the shelf fan hangs in.
- **The phone override needs its own `max-width`.** The 480 px rule drops the side margins to 10 px, and a
  stretched `left/right: 0` box with a `max-width` *narrower* than its margins allow is over-constrained —
  the browser discards `right`, which would leave the box (and the centred text in it) 40 px left of the
  screen's middle. Both numbers have to move together.

Nothing in JS reads `#output`'s geometry, and everything that draws off the sentence — the shelf fan, the
rung strips, the swap ghosts, the Foon's swoop direction — measures live `getBoundingClientRect()`s, so all
of it followed the text without a change.

---

## The win cue is synth, not a sample (`_victoryTune`)

**BUILT 2026-08-28.** `gameSfx.end` was a `Howl` over `sounds/success-fanfare-trumpets.mp3` — a stock
trumpet sample, the only borrowed sound left at the game's biggest moment, while every hero cue is
synthesised in-file on the `_tone`/`_noise` kit. It is now `_victoryTune()`, written on that same kit, so
the win sounds like the rest of the game and loads nothing.

- **The `.play()` shape is kept** (`end: { play: () => _victoryTune() }`), so all three call sites —
  the punctuation win's two branches in `animate()` and `phraseWin()` — are untouched.
- **The mp3 stays in `sounds/`**: `IPA-fan-game/ipaFan.js` still plays it.
- **Four gestures in C major, ~2.3 s**: a three-note pickup up the tonic triad, an ARRIVAL on the octave
  with the chord and a C3 bass opening underneath (plus a short noise swell, the nearest this kit gets to
  a cymbal), a scalar lift G–A–B, then a final octave landing left ringing under two sparkles. It resolves
  onto the tonic at *both* landings — that is what makes it read as finished rather than as one more event.
  It is the longest cue in the file and the only one with sustained harmony, which is how it stays clearly
  above the eight ladder cues and every hero hit.

---

## The win bubble's tail points at the hero (`aimSpeechTail`)

**FIXED 2026-08-28.** The win message is styled as a speech bubble (`changeTextToSpeechBubble` adds
`.speech-bubble` to `#ending_message_1`) and its `::after` is a triangle meant to hang off the bottom
edge and point at the mouth of the hero who won. It never did. Three independent faults stacked:

- **The custom property was set without a unit.**
  `root.style.setProperty("--speech-bubble-triangle", projectile.position.x)` stores a bare number, so
  `left: var(--speech-bubble-triangle)` substituted to `left: 412` — **invalid at computed-value time**,
  which resolves `left` to `auto` with no warning. The `:root` fallback of `20px` never applied either:
  the variable *is* set, just to garbage. With `left` and `right` both `auto` the absolutely-positioned
  pseudo-element fell back to its **static position** — the end of the last line of message text — which
  is why the tail appeared to wander with the wording and the window width rather than sit anywhere in
  particular. It had been that way since the bubble was added.
- **`bottom: -20` in the CSS was unitless too**, and unitless lengths are dropped at *parse* time, so
  `bottom` was `auto` as well. The tail therefore sat **inside** the bubble on the last text line, where,
  being `border-top: 20px solid var(--color)` — the bubble's own background colour — it was all but
  invisible bar its 1px black edge.
- **The value was in the wrong coordinate space.** `left` on the `::after` is measured from
  `.speech-bubble`'s padding box, but `projectile.position.x` is a canvas x, and
  `#ending-message-container` is `position:absolute; margin:10%`, so the bubble's left edge sits a tenth
  of the viewport in. Even a correct `px` value would have been off by that much.

`aimSpeechTail()` replaces the two `setProperty` calls in `animate()`'s two punctuation-win branches and
is then called **once per frame** while `ENDING_REACHED`. Four things about it are load-bearing:

- **It re-aims every frame** because nothing freezes the game at the win — `ENDING_REACHED` only gates
  the message, so the player is free to keep walking and a tail pinned once would detach immediately.
- **It follows the hero who fired the winning shot**, not whoever is on stage now, because the bubble is
  painted in that hero's colour (`shooter.characterColor`) and a tail pointing at a different-coloured
  hero is worse than a stale one. A later Switch Character moves the outgoing hero only in `y`, so their
  `x` — all the tail reads — stays put.
- **It aims at the hero's centre, not the muzzle.** The old code used the projectile's x, which is the
  weapon; for the anchored ladder heroes that is General's raised sword tip and Keen's crossbow, neither
  of which is where a voice comes from.
- **It clamps to the bubble.** The bubble is shrink-to-fit and centred, so a hero near either screen edge
  is outside its span entirely and an unclamped `left` would float the triangle off the box it belongs
  to — the second way to get a detached tail. Clamped, it slides to the edge and stops, still pointing
  the right way.

Hero x is only a page x after shifting by the canvas box (`getBoundingClientRect().left + clientLeft` —
the canvas carries a 2px border) and scaling by `clientWidth / canvas.width`.

`phraseWin()` is unaffected: Restore the Phrase writes its win line to `errorMessage` via `phraseSay`,
not to the bubble.

---

## The How-to-Play modal is per-mode (`modeHelp.js`)

**BUILT 2026-08-28.** The single **How to Play** button opens one modal (`#modal` in
`punctuators.html`), and until now it held one fixed two-player *shoot the punctuation back in* blurb —
the right text for exactly one of the twelve dropdown modes. `updateCharacterModal()` existed but was
called only at Pow! and only for `alphabetNeighbors` and `ladder`, so a player who picked Homophones was
told to shoot punctuation.

Every mode now has a card. The copy is **data, not logic**, so it lives in its own module
`modeHelp.js` (`MODE_HELP`, keyed by the `<option>` value, plus `modeHelpFor(mode)`); `index.js` keeps
only the wiring. Four things about it were decisions:

- **It swaps on selection, not at Pow!** — the dropdown's `change` handler calls
  `updateCharacterModal(mode)`, so the rules are readable while you are still choosing what to play.
  That handler covers both the native `<select>` and the custom dropdown (which dispatches a `change`
  after setting `sel.value`). The Pow! path still calls it unconditionally as a backstop, and there is
  one call at load for the case where a browser restores a non-default selection on reload.
- **The mode's name goes in the modal *header*** (`.modal__title`), which is why no card carries an
  `<h2>` of its own — the two cards that predate this (Betar, the ladder) had theirs removed rather
  than print the name twice.
- **A shared footer** (`.shared-rules`) is appended to every card except the punctuation one: the hint
  button, Switch Character, and the win. Those rules belong to the engine rather than to any one mode,
  and before this they lived *only* in the punctuation blurb — so replacing that blurb would have lost
  them.
- **The punctuation card keeps its original text verbatim** and is the fallback for an unknown mode. It
  takes no footer, because its own list already says all three things.

Still writing into `.modal--body`, never the whole `#modal` — the header carries the `×`, and replacing
it leaves the modal closable only by clicking the overlay.

Examples in the cards are **real**: each pair is one the mode's own data file actually contains
(`bop`→`dog` from `AmbigramFunc.js`, `abut`→`about` from `oneMoreCharacterWordsWithSpan.js`, `ADD`→`ROD`
from `roundedLetterPairs`, `zookeeper`→`zoo keeper`, `aback`→`back`, …). If a data file is regenerated
and an example word disappears from it, the card is stale.

---

## The mode picture (`modeArt.js`)

**BUILT 2026-08-29, placeholder art.** Picking a mode in the dropdown changed nothing you could *see*
until you pressed Pow! — the same white field whatever you chose, with the mode's identity readable
only inside the How-to-Play modal. `#mode-art` is the picture that answers *what did I just pick?*: a
card in the empty band under the sentence box, swapped on selection and cleared when the round starts.

Same shape as `modeHelp.js`, deliberately: the content is **data, not logic**, so it lives in its own
module (`MODE_ART` keyed by the `<option>` value, `modeArtFor(mode)`, `renderModeArt(mode)`), and
`index.js` keeps the wiring only — `paintModeArt()` beside `updateCharacterModal()` in the dropdown's
`change` handler and at load, `hideModeArt()` at Pow!. An unknown mode falls back to the punctuation
card, same as `modeHelpFor`.

Four things worth knowing:

- **The glyphs are placeholders with a one-line exit.** Every entry is a big typographic mark standing
  in for a sprite (`!?`, `^`, `≈`, `␣`, `▲●▼`, …). When the art arrives, an entry grows
  `sprite: "./images/Foo.png"` and `renderModeArt` prefers it and drops the glyph — that is the whole
  migration, one line per mode, and modes can go over **one at a time**. `.mode-art__figure` is a fixed
  height so every card is the same size whatever its glyph, which is also the box a sprite fills.
- **It must be positioned, not in flow.** `#sentence-container` and `#input-container` are both out of
  flow, so an in-flow element between them paints *under* the fixed title and is never seen — exactly
  what happened to Word Race's `#race-banner` (`docs/punctuators-ladder.md` §12.8). It is `position:
  fixed`, which also gets it above the canvas for free: the canvas is a **static** element, so any
  positioned box paints over it. It stays below the modal (`z-index: 10`) and the overlay, both of
  which must cover it, and takes `pointer-events: none` so it can't eat a click.
- **It has to be ranked against `#input-container`, and that container is where the fix goes.** As
  shipped both were on `z-index: auto` and the card is later in the DOM, so it painted over the open
  dropdown and you couldn't choose another mode. Raising `.custom-select-dropdown` does **not** fix
  it — it already carries `z-index: 2000`, but `#input-container` is `position: fixed`, which creates
  a stacking context of its own in Chrome and Safari, so that 2000 is confined inside the row and only
  the row's own rank counts against the card. `#input-container` is now `z-index: 1` and `.mode-art`
  an explicit `z-index: 0`. Deliberately small numbers: the modal (10) and the Tree of Kinds (5000)
  must still cover the input row.
- **It hides at Pow!, and only after every validation branch has had its say.** The heroes and their
  shots are drawn on the canvas *beneath* this element, so anything left here paints on top of the
  game — but `hideModeArt()` sits after the "field cannot be blank" / "no anagrams found" / corpus-load
  returns, so a rejected sentence leaves the picture up. The card stays in the DOM (the CSS fades it),
  and `paintModeArt()` clears `is-gone` as **insurance, not a live path** — Pow! hides the dropdown
  along with the picture, so today the only route back to a mode change is a reload. If the dropdown
  ever survives a round, repainting a card that is still faded out is the bug that would follow.
- **Only Ambigrambador flips.** `flip: true` draws a second, 180°-rotated copy of the glyph beneath it
  (`bop` over `dog`), because that mode's symbol *is* a rotation. Nothing else uses it.

Examples in the cards are **real**, same rule and same staleness risk as `modeHelp.js` above.

---

## Art the Tickler & the Foon have their own mode, and every mode has a guard

**BUILT 2026-08-30.** Two changes that only make sense together.

### What was wrong

`addSpansAndIdsForWordPlay` used to wrap **articles** and run the **spoonerism** pass in *every* wordplay
mode, on top of whatever the mode itself had marked. That was never a design decision — it was insurance.
Most modes find their targets by looking words up in a shipped dictionary, and a sentence
whose words aren't in that dictionary produces **no spans at all** — which is not a graceful failure but
the empty-team white screen (see *Shared-engine footguns*, below: no spans → no team → `player` undefined →
`animate()` throws every frame). Art the Tickler and the Foon were the floor under that: almost any English
sentence has an article, or two words whose heads can trade, so *something* was always shootable.

The price was that two heroes turned up in a mode that had nothing to do with them and rewrote the same
words the mode was trying to teach about. It also aged badly: the three ladder modes and Affix Aliens each
had to opt *out* by name, through a growing flag (`preMarked` → `ladderMode` → `heroManagedWords`), and the
newest of them opted out because the Foon was swapping word-heads straight into the Grand Prefixer's affix
spans.

### What replaced it

- **`utils/utils.js`** now runs `protectedArticles` and `spoonerism` for exactly one mode value,
  `articlesSpoonerisms`. The opt-out flag is gone — there is nothing left to opt out of. The two passes
  still **bracket** the mode switch rather than sitting inside it, in their historical order: articles wrap
  first so the Foon's own placeholder pass hides them from him.
- **`index.js`'s `WORDPLAY_GUARDS`** is the insurance now. One table, keyed by `<option>` value, holding a
  `has()` predicate and the sentence to print when it says no. The Pow! handler consults it once, and a
  mode with nothing to shoot **refuses to start** and says what to type instead.

Four modes already had a hand-written guard (Anagrams, Homophones, Ambigrams, Affix Aliens); those moved
into the table verbatim. **Five had none** — Caret, Rounded, Split, White Out, Alphabet Slots — which is
precisely the set that was relying on the floor.

Not in the table, on purpose: `removePunc` (guarded by `PUNC_REGEX`, a character-class test rather than a
dictionary one), the three ladder modes (their guards must `await` a fetched corpus first, so they stay
inline below the table), and `abjads` (commented out of the dropdown).

### The new mode

One `<option>`, `articlesSpoonerisms` — **"Articles & Spoonerisms"** — fielding both heroes, with
*Switch Character* stepping between them. It takes both heroes rather than one each because neither is a
whole mode on its own, and because they are the same idea twice: change the **small** parts of a sentence.
Its guard passes if **either** hero has work, and the team is built from the spans that reach the field, so
a sentence with articles and no swappable pair simply fields Art alone.

`hasSpoonerisms` requires **two** wrapped word-heads, not one. A spoonerism is a trade, so a lone cluster is
a span you can hit that has nothing to swap with — the mode would start and then do nothing.

It gets a `modeHelp.js` card and a `modeArt.js` picture like every other mode. Both use the same worked
example, `the big dog → a dig bog`, which is real on both halves: `the` sees a consonant next so it toggles
to `a`, and `big`/`dog` hand over their `b` and `d`.

### Where each `has()` lives, and the trap that came with them

Each predicate is exported **beside the wrapper it speaks for** — `hasCaretWords`/`hasRoundedWords` in
`CaretFunc.js`, `hasSplitWords` in `splitWords.js`, `hasWiteOutWords` in `DeleFunc.js`,
`hasAlphabetNeighbors` in `alphabeticalNeighbors.js`, `hasArticles` in `articleFunc.js`, `hasSpoonerisms` in
`spoonerismFunc.js` — so a dictionary rebuild moves the wrapper and its guard together. A guard that splits
on a different boundary, or folds case differently, would let a round start with nothing to shoot, which is
the exact failure it exists to prevent. (`wrapAlphabetNeighbors` is the only one that lower-cases, and its
guard lower-cases too.)

Writing them surfaced a **live bug in four of the five wrappers**: they looked up `dict[word]` on a plain
object, so `dict["constructor"]` answered with `Object`'s own constructor — a truthy *function* — for any
dictionary that didn't happen to own that key. `constructor` is an ordinary English word, and typing it
would have spliced the function's source code into the sentence. This is the **same trap the Tree of Kinds
hit from the other side** and answered with `Map`/`Set` ([`punctuators-ladder.md` §13](punctuators-ladder.md));
here the dictionaries are generated files, so all five wrappers and all five guards now go through a local
`entryFor(dict, word)` that tests own-property first. (`splitWords` was safe by luck: `constructor` is a real
key in it — `construct or`.)

`hasSpoonerisms` is the one guard that doesn't re-implement its wrapper's rules: it **runs** `spoonerism()`
and counts the spans, because the eligibility rules (banned substrings, the `q` and `the` exclusions, the
consonant-cluster walk) are exactly the kind that go stale in a copy. It is asked of the *raw* sentence
while the game spoonerises the article-wrapped one, which is the same answer by construction — the only
words `protectedArticles` hides are `a`, `an` and `the`, all three of which the Foon already refuses.

---

## Shared-engine footguns

Both were live bugs on 2026-08-23, both fail **silently**, and both are easy to reintroduce.

### `waitForElement()` must wait on `#output span`, never a bare `span`

`waitForElement` (`utils/utils.js`) resolves the moment its selector matches *anything* — and the only
thing that ever fills `nodeArr` is the `MutationObserver` it installs on the way past. So a selector that
matches markup already on the page resolves at load with `nodeArr` empty, which empties the team, makes
`player` undefined, and leaves `animate()` throwing on every frame in **every** mode.

That is not hypothetical: commit `3941ac8` (2026-08-21) wrapped the banner's "The Game" in a
`<span class="title-tail">` — the first real span in the static markup — and broke the whole game for two
days with one console line to show for it. `#output` is empty until a round starts, so scoping the wait to
it keeps the wait honest.

### Its observer must read **every** mutation record, not `mutations[0]`

Records batch per microtask checkpoint. Any second DOM write in the same task — an error message being
cleared, a dropdown label being set — takes slot 0, and the sentence's own spans are dropped on the floor.
This was latent from the start and went live the moment a second writer appeared on that path.

### Two guards now keep either failure from white-screening the game

`doActionOnce()` refuses to spend `bRightAfterSentenceIsLoaded` on an empty team (it retries on the next
input instead, since `player = undefined` is unrecoverable), and `animate()` skips a frame with no
`player` rather than taking the canvas down with it. Leave both in place.

A side effect worth knowing: with those guards the first hero now appears on your **second** click or
keypress, as the code always intended. Before `3941ac8` that assignment threw a temporal-dead-zone
`ReferenceError`, and you had to press **Switch Character** to see anyone — which is presumably why the
name tag still says to.

---

## The Interrobang — a hidden two-hero combo

**BUILT 2026-08-29.**

An easter egg, not a mode: it needs no `<option>`, no data file and no `wrap*` function. It exists only in
the ordinary punctuation round, and only when the typed sentence contains **both a `!` and a `?`**.

**The trick.** Excla Machine throws his belt. Before it clears the top of the screen, Question Markswoman
threads an **arrow through the hoop**. The two shots fuse into a single interrobang projectile, which
lands on the next `!` or `?` it reaches and resolves **both** marks at once.

### Why it works with almost no new machinery

Four properties of the existing engine do most of the job, and none of them were built for this:

- **Same column is free.** `switchToNextHero()`'s `slideOut` already carries the outgoing hero's *centre*
  to the incoming one (`index.js:4016`, and the section above). Throw the belt → Switch → shoot, and the
  arrow launches up the exact column the belt is climbing. That matters because projectiles fly straight up
  (`velocity {x: 0, y: -10}`) and cannot be aimed — without the centre-carry rule the combo would be
  unhittable, and with it the *only* skill is timing.
- **The belt already ignores question marks.** Collision is gated on
  `punctuationSymbol.id === shooter.targetId` (`index.js:3340`), so Excla's belt flies straight past a `?`
  span and keeps climbing. Nothing has to be suppressed to let it travel over the target.
- **The art is already right.** `EM_Belt.png` is literally a **hoop** (194 × 111, drawn at scale 0.5 →
  97 × 55) and `Arrow.png` is an arrow (57 × 331 at 0.2 → 11 × 66). An arrow threaded through a thrown ring
  is a composite of two sprites the game already ships. **No new art.**
- **The mode needs no gate.** `!` and `?` spans only exist in the punctuation round, so every other mode is
  untouched by construction.

### The four decisions (settled 2026-08-29)

1. **Two birds, one shot.** The fused projectile hits whichever mark it reaches first and counts **both**
   the `?` and the `!` as hit. The trick genuinely saves a shot, and it works in either column rather than
   only over the `?`.
2. **The speed change is permanent, for both heroes.** Excla's belt becomes a slow lob, Markswoman's arrow
   a fast snap, in every sentence. The alternative — changing speed only when both marks are present —
   makes a hero feel different depending on the sentence, which reads as a bug. See *Tuning* below; this is
   the biggest gameplay change in the feature and the one most worth vetoing on review.
3. **The mark is drawn as stacked spans, not `‽`.** The game's font is **Palanquin**, which almost
   certainly has no U+203D glyph — the browser would silently fall back to a system font and the mark would
   sit in the sentence in the wrong typeface. Instead a blue `?` and a yellow `!` are superimposed in the
   game's own font, each in its hero's colour. It renders everywhere, matches the line, and the joke is
   *visible*: the two heroes' marks literally on top of each other.
4. **Sound and sprite only.** A fused cue, the arrow-through-hoop sprite, a glow on the landing. No burst,
   no banner, no `localStorage`, no How-to-Play mention. Discovered, never explained.

### Hero order

`availableHeroArray` (`index.js:3163`) currently reads `… semicolon, question, exclamation, …`. Swap the
two so **Excla comes first**: Switch Character then steps Excla → Markswoman, which is the order the combo
is performed in. Ordering also decides the starting hero (`player = chosenHeroArray[0]`), so a sentence
with a `!` and no earlier-ordered mark now opens on Excla instead of Markswoman — the only side effect, and
a harmless one.

### Projectile speed

Speed is hardcoded as `y: -10` at **four** sites — both shoot handlers, twice each (`index.js:3931`,
`3941`, `4142`, `4152`). Add **`Hero.projectileSpeed`**, defaulting to `10`, and have all four read
`player.projectileSpeed`. Every hero but these two is then bit-for-bit unchanged, `CommaTongue` included
(it derives its growth from the same `velocity.y`, and comma/hashtag keep the default).

**Tuning: belt 4, arrow 26.** What matters is neither number but the **closing speed**
(`ARROW_SPEED - BELT_SPEED`) — that is what decides how long the player has to press shoot, and it has to
survive the ~17 frames the Switch animation costs before they can even press it. On a 1440 × 800 desktop
(`canvas.height = innerHeight - 50 = 750`), with the sentence's first line at y ≈ 160:

| | height | `restingY` | shot spawns at |
| --- | --- | --- | --- |
| Excla Machine (0.6 × 447) | 268 | 502 | y = 502 |
| Question Markswoman (0.7 × 447) | 313 | 457 | y = 457 |

The arrow starts **45 px above** where the belt started, a small free head start. Solving for the frame `F`
at which the arrow must be fired for the two to meet *before* the belt reaches the sentence:

- **belt 4 / arrow 26 → closing 22 px/frame → ≈ 1.6 s** to press shoot once the Switch animation
  (`SWITCH_SLIDE_SPEED = 32`) is paid for. Shipped: generous enough that the combo lands even if you
  hesitate over the Switch.
- belt 4 / arrow 18 → closing 14 → ≈ 0.92 s. Shipped first, and **played tighter than it measured** —
  widened on the first play-test.
- belt 5 / arrow 18 → closing 13 → ≈ 0.62 s. Tight enough that the egg would go unfound.
- belt 6 / arrow 16 (the first guess) → the fusion happens level with the sentence, leaving no room for
  the fused shot to travel at all. Rejected.

Widening the gap is nearly free on Markswoman's side — an arrow reading as fast is *in character* — and
expensive on Excla's, whose belt has to stay slow enough to catch but quick enough that an ordinary round
isn't a wait. So the arrow is the knob to turn.

The cost is that Excla's ordinary shot slows from ≈ 0.57 s to ≈ 1.4 s to reach the sentence. He throws a
belt, so a lob reads honestly — and `whoosh.mp3` already suits it — but it is a real change to a core hero.
Both numbers live as named constants so this is one edit to re-tune.

### Detecting the thread

A small pass in `animate()`, **before** the collision walk, scanning `projectiles` for one live belt
(`owner === exclamation`) and one live arrow (`owner === question`). O(n²) over a handful of shots.

Fuse on the first frame where **the arrow's tip has entered the hoop and the arrow's centre is inside it**:

```
arrow.position.y            <= belt.position.y + belt.height   // tip has reached the ring
arrow.position.y + height   >= belt.position.y                 // and hasn't already passed it
arrowCentreX within [belt.position.x, belt.position.x + belt.width]
```

Centre-in-hoop rather than a plain rect overlap, so the shot has to go *through* the ring rather than graze
it. The window is still forgiving — the hoop is 97 px wide and the arrow 11 — and vertically it cannot be
stepped over at any sane tuning: the two overlap for `belt height + arrow height` ≈ 121 px of **relative**
travel, five frames' worth even at the current 22 px/frame of closing speed.

Both shots then `retireProjectile()` and one **`InterrobangShot`** is pushed in their place, at the belt's
position, travelling at the arrow's speed.

### The fused shot

A small class of its own rather than flags on `Projectile`, because its `draw()` is bespoke:

- **Sprite.** Draw the arrow, then the belt over it, then re-draw *just the arrow's top slice* (a
  source-cropped `drawImage`) above the ring. Three calls, and the shaft genuinely reads as passing through
  the hole with the tip poking out the top.
- **Hit box.** The belt's width (97) and the arrow's height, fed through the **same** collision expression
  every other shot uses — including its historical `position.y - height` quirk, which registers a hit a
  shot's height early. The belt is what the player aimed, so the belt's width is what catches the mark.
- **Two targets.** The collision gate takes an optional **`projectile.targetIds`** (a `Set`); when present
  it is consulted instead of the owner's single `targetId`. One line, and every other shot is unaffected:

  ```js
  const wants = projectile.targetIds;
  if (wants ? wants.has(span.id) : span.id === (shooter.targetId ?? shooter.symbol)) { … }
  ```

### The landing

A new branch at the **top** of the collision chain (before the `capitalize` test), guarded by a
`data-interrobang` attribute so it can only fire once per span:

1. **The struck span** becomes the stacked mark — a `.ib-stack` wrapper holding a `.ib-q` (`?`, in
   `question.characterColor`) and a `.ib-e` (`!`, in `exclamation.characterColor`) positioned on top of each
   other, both carrying the game's existing black outline (`1px 0 0 #000, …`). CSS goes in `index.css`.
2. **The partner mark** — the nearest *unhit* span of the other id, by horizontal distance from the shot —
   is revealed in **its own hero's colour** with a short absorbed-pulse, and added to `allPunctuationHit`.
   It reveals as its ordinary `!` or `?` rather than a second stacked mark: decision 1 was "two birds, one
   shot", not "both spans transform". If no unhit partner is left the fusion still lands and simply
   resolves its own span.
3. **`allPunctuationHit`** therefore gains both spans before the shared win check that follows the chain,
   so a sentence finished by the combo wins normally and the bubble takes the fused shot's colour.
4. **`_interrobang()`**, an eighth-of-its-kind cue on the existing `_tone`/`_noise` kit — Excla's bell ding
   (`_exclaHit`: 1047 + 1319 Hz sine) and Markswoman's thwack (`_questionHit`: a 750 Hz noise burst + a
   falling 170 Hz triangle) sounded *together*, the thwack landing a beat first so the bell reads as the
   ring being struck. No new assets, matching every other hero cue in the file.

### What the build added to the spec

- **Two cues, not one.** `_interrobangFuse()` fires the instant the arrow threads the hoop — a short bright
  ring — and `_interrobang()` fires on the landing. The spec had only the landing, but the fuse is the
  *only* signal the trick came off, and it happens a beat before anything else confirms it.
- **`consumeShot()` rather than `retireProjectile()`** for the two shots being fused. Retirement defers its
  splice by a frame so a landing shot doesn't visibly blink out; nothing blinks here, because the fused
  shot takes both their places in the same frame — and deferring would leave a just-consumed belt in the
  array to still register a hit further down the same collision walk.
- **A `silentHit` flag** read at the shared `shooter.hitProjectileSound()` call site. The ladder heroes
  solve the same problem by overriding `hitProjectileSound()` to silence, which a fused interrobang can't:
  its owner is Markswoman, and her ordinary hits must still thwack.
- **`.ib-land` sits on the inner `.ib-stack`**, not on the punctuation span. That span is `inline`, and
  `transform` does nothing to an inline box; `.ib-stack` is already `inline-block` for the superimposing.

### The pre-existing bug this uncovered: a shot moved once per matching span

The collision walk is `projectiles × nodeArr`, and the "just move it" branch sat inside the span loop — so
a projectile was moved **once for every span that matched it**. A sentence with two commas moved Comma
Chameleon's tongue at double speed, three question marks tripled Markswoman's arrow, and so on. It has been
there all along and reads as *"shots are faster in busy sentences"*, which is why nobody chased it.

It surfaced here because a fused interrobang answers to **two whole marks at once**, so the measured belt/
arrow speeds above would have been meaningless. Both flight sites now guard on `flownThisFrame` (already
reset at the top of every frame, and already the flag the post-walk flight pass reads) before moving:

```js
if (!projectile.flownThisFrame) {
  projectile.flownThisFrame = true;
  projectile.update();
}
```

**This changes existing play**: shots in punctuation-heavy sentences now travel at their honest speed rather
than a multiple of it. That is the fix, but it is a visible one and worth knowing about if a round suddenly
feels slower than it used to.

### Still open

- **Whether the hoop should spin as it lobs.** Cheap (a `rotate` around the sprite's centre in
  `InterrobangShot.draw()` and in the belt's own flight), sells the throw, and would make threading it feel
  like a skill shot. Deliberately left out — polish, and easier to judge once the combo has been played.
- **What the partner mark does.** Shipped as specced: revealed in its own hero's colour, absorbed-pulse,
  counted as hit. The alternative — removing it from the sentence outright, since an interrobang genuinely
  *is* both marks — is more correct typographically but risks reading as a bug when a character vanishes.
