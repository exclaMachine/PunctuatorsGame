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

`restingY()`'s `+ 20` and the per-hero `projectileStartPositionX` are the two other places a hero's size is
baked into placement — worth remembering if this area is touched again.

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
