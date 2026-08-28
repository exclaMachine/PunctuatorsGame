# Punctuators: The Game — working notes

**This is not the base doc yet.** The game itself is still undocumented; the only written anatomy of a
wordplay mode lives in [`punctuators-ladder.md` §1](punctuators-ladder.md) — a dropdown `<option>`, a
`wrap*` function that marks target words with a span carrying the hero's name as its `id`, and a branch in
`animate()`'s collision block. This file holds what a session needs to know *before* touching `index.js` /
`utils/utils.js`, until someone writes the real thing.

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
un-anchored heroes had to stay bit-for-bit identical, and only the two ladder heroes are anchored so far.
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

And because everything in the collision walk is gated on `punctuationSymbol.id === player.targetId`, a shot
was only moved *and only collected* while a span belonging to the **selected** hero was on screen. Switching
characters therefore froze the outgoing hero's shots in the array, and the next switch resumed the whole
backlog on a single frame — a crowd of Semicolonels suddenly flying off at once. A **flight pass** after the
collision walk now finishes anything the walk didn't handle and retires it off the top of the screen.

`projectile.owner` (set at construction) is what makes that safe: a shot outlives its hero's turn on stage
now, so *"is one of my shots in the air?"* — the question the attack pose and Semicolonel's vanishing act
both ask — can only be answered by the projectile. Without it a stray shot would hold whichever hero you
switched to in its attack pose, or hide them.

### KNOWN BUG, not fixed: a shot hits the *selected* hero's targets, not its owner's

A projectile is hit-tested inside a loop gated on the **current** `player`, and the whole branch body reads
`player.characterColor`, `player.symbol`, `player.hitProjectileSound()` and so on. So a Semicolonel shot
still in the air when you press Switch Character will be tested against **Sergeant Colon's** spans, and can
reveal a colon in Sarge's colour with Sarge's hit sound.

This predates the 2026-08-28 work — it was simply invisible, because the old canvas wipe drew only the
newest shot, so you never saw a stray one land. Letting shots finish their flight made it reachable in
practice. Deliberately left unfixed 2026-08-28.

The fix is not a one-liner, which is why it was deferred: `projectile.owner` already records who fired, but
the gate and the *entire* collision body would have to read the owner instead of `player`, and every mode's
branch inside that body (ladder, ambigram, homophone, anagram, Betar, article, asterisk…) assumes the two
are the same hero. Doing it properly means threading the owner through the whole block, not swapping one
comparison.

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
