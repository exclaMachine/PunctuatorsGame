# Punctuators: The Game — working notes

**This is not the base doc yet.** The game itself is still undocumented; the only written anatomy of a
wordplay mode lives in [`punctuators-ladder.md` §1](punctuators-ladder.md) — a dropdown `<option>`, a
`wrap*` function that marks target words with a span carrying the hero's name as its `id`, and a branch in
`animate()`'s collision block. This file holds what a session needs to know *before* touching `index.js` /
`utils/utils.js`, until someone writes the real thing.

---

## Known issues — to fix later

### The hero switch recentres the incoming hero

**What happens.** Every Switch Character puts the new hero in the middle of the screen. Walk to the left
edge, switch, and you are back at centre — so a hero's position is thrown away on every switch, in both
directions.

**Wanted instead:** the incoming hero **takes the outgoing hero's position**. Not the old behaviour either
— per-hero position memory was worse, because switching teleported you to wherever *that* hero happened to
have been left.

**Where.** `switchToNextHero()` in `index.js`, the `slideOut` phase:

```js
player.position.x = canvas.width / 2 - player.width / 2;   // ← this line
```

**How it got here.** Commit `1e20911` (2026-06-26) added the slide-down/slide-up switch animation. Before
it, switching was a bare `player = <next>` with **no position write at all**, so each hero kept whatever
`position.x` it was left at — the per-hero memory described above. The recentring came in as part of the
animation, not as a decision about placement.

**The fix is one line**, but it has a fork worth deciding at the time:

| | |
| --- | --- |
| `player.position.x = current.position.x` | Carries the left edge. Simplest; a wide hero swapped for a narrow one visibly shifts, because their widths differ (Keen Arrow is 40 px, Betar 320). |
| `player.position.x = current.position.x + (current.width - player.width) / 2` | Carries the **centre**, so heroes of different widths stay put under the player's aim. Probably the one you want, since the projectile spawns off the hero's centre. |

Worth checking against `restingY()` at the same time — the `+ 20` there and the `projectileStartPositionX`
per hero are the two other places width is baked into placement.

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
