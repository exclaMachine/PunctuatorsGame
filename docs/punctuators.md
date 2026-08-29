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
