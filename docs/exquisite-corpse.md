# Exquisite Corpse Project Context

Project guidance for working on this codebase. Read this before making changes.

## What this is

**Specimen Lab** is a Rummikub-style card game with an _Exquisite Corpse_ twist: players
collect monster parts (skull, claw, foot) and assemble them into complete monsters. It is a
single self-contained HTML file using `<canvas>` for the board — no build step, no
dependencies, no framework.

- **Entry point:** `exquisite-corpse-rummy.html` (open directly in a browser to run).
- **Status:** working prototype. Core loop, building, stealing, dig-deeper graveyard,
  last-turn trigger, and scoring are implemented. Placeholder art; basic AI.

## Running it

It is a static file, so just open it in a browser. In VS Code the smoothest loop is the
**Live Server** extension (right-click the HTML → "Open with Live Server") so edits reload
automatically. There is no compile/test/lint step yet.

## Architecture

Everything lives in one file, split into clearly commented sections inside the single
`<script>` block:

1. **Data model & constants** — suits, parts, names, colors, glyphs, deck builder.
2. **Game state** — the global `G` object and `newGame()`.
3. **Rules helpers** — `validateMonster`, `monsterSuit`, `canFormMonsterWith`, etc.
4. **Turn flow** — draw / build / steal / discard / round-end logic.
5. **Simple AI** — `findBestMonster`, `aiTurn`.
6. **Rendering (canvas)** — all `draw*` functions plus `render()`.
7. **Interaction** — canvas pointer events → hit-test against `regions[]`. A tap routes to
   `handleHit`. The action phase is **unified (no build/steal mode)**: tapping a hand card
   `selectHandCard` selects it (`selectedCard`), lighting up its build `stage-slot` and any
   stealable `wild` cells; tapping one of those commits (build or steal). Tapping a wild first
   arms it (`G.stealTarget`) and lights up matching hand cards. Drag still builds. Non-
   actionable hand cards are dimmed (`handCardActionable`); valid targets glow green.
8. **HUD / controls / log** — DOM status bar, buttons, message log.
9. **Setup UI** — seat selection and start/restart wiring.

The board (battlefield, lab, graveyard, hand) is drawn on the canvas. Buttons, status, and
the log are plain DOM elements styled with CSS variables at the top of `<style>`.

### Rendering model

`render()` is the single source of truth for what's on screen. It recomputes canvas height
from the current content, clears, redraws every section, and rebuilds the `regions[]`
array. Each interactive element pushes a hit-rect via `add(x, y, w, h, type, data)`. The
click handler walks `regions` **in reverse** so the topmost (last-drawn) element wins —
this is what makes the graveyard's top card take priority. (The graveyard fans out to the
**right**, each card rotated 90° CCW via `drawCardLandscapeCCW` so its banner stays visible;
the rightmost/newest card is on top and is the free draw, deeper cards expose only their
left banner strip.) Call `render()` after any state change; do not mutate the canvas outside
the `draw*` helpers.

### Sound effects

A tiny `SFX` module (IIFE near the top of the script) plays **subtle synthesized Web Audio
blips** — no asset files. Events: `select`, `place`, `build`, `steal`, `draw`, `discard`,
`invalid`, `win`; fire them with `SFX.play('build')`. Tone params live in `SFX.DEFS` (`freq`
can be a single note or a short arpeggio). **Easy to replace with real audio later**: set
`SFX.files.build = 'sounds/build.mp3'` (a URL string or a preloaded `<audio>` element) and the
file plays instead of the synth for that one event — swap them in one at a time. A `[🔊]`
top-bar button toggles mute (`SFX.setMuted`, persisted in `localStorage` as `sfxMuted`).
Browsers gate audio behind a gesture, so a `document` `pointerdown` calls `SFX.resume()`.

### Card move animations

Cards tween from their old spot to their new one (build → battlefield, hand → slot, steal
swaps, deck/graveyard → hand) with a playful arc + landing pop (`easeOutBack` + a `sin` bow).
Because `render()` is immediate-mode, every draw site records each card's on-screen transform
(`note(card, cx, cy, scale, rot)` → `cardRects[id]`) and **skips drawing any card in the
`flying` set**. A mutation that should animate: (1) captures the moving cards' current
transforms via `snapRect(card)` **before** mutating state, (2) mutates, (3) calls
`commit(specs)` where `specs = [{card, from}]`. `commit` marks them flying, renders once to
record their destinations, then runs an rAF loop (`animStep`) that re-renders the board
(flying cards hidden) and draws each card in-flight on top via `drawFlyingCard`. Input is
locked while `anims.length` (pointerdown bails); `render()` skips `updateHUD()` while
`animating`. `prefers-reduced-motion` (and any missing from/to) falls straight through to a
plain `render()`. `labRect` is the draw source for the LAB deck. AI builds are **not**
animated (the AI hand has no per-card rects). Hooked in: `drawFromLab`, `drawFromGraveyard`,
`placeInStage` (hand→slot, or all staged→battlefield when it builds), `doSteal`.

## Data model

```js
card    = { id, suit, part, name, owner }   // owner = player index, or null in deck/graveyard
monster = { id, owner, cards: [...] }        // cards ordered skull, claws..., foot
```

`G` (global game state):

```js
G = {
  players: [{ name, type: "human" | "cpu", hand: [card] }],
  monsters: [monster],
  lab: [card], // draw pile; top = last element
  graveyard: [card], // discard pile; top = last element
  current, // index of player whose turn it is
  phase: "draw" | "action" | "discard", // no build/steal sub-mode — the action phase is unified
  stage: { skull, claws: [card], foot }, // cards placed into the assembly slots
  stealTarget, // { monsterId, cardIdx } of an armed wild (steal); also `selectedCard` (module var) = armed hand card
  builtThisTurnIds: Set,
  mustUseIds: Set, // dug cards that MUST be built this turn
  drewThisTurn,
  lastTurn,
  lastTurnRemaining,
  roundOver,
  log,
};
```

## Game rules (the domain logic)

- **Setup:** 2–6 players, 10 cards each. Remaining deck is the face-down **LAB**. One card
  flipped to start the **graveyard**.
- **Turn:** Draw → Action (build &/or steal, freely interleaved) → Discard. There is **no
  build/steal mode toggle** — the action phase is unified: clicking a hand card highlights
  both the build slot it fits and any wilds it can steal, and the next click commits.
- **Draw:** take the top LAB card, the top graveyard card (free), or dig deeper in the
  graveyard. Digging is only legal if that card can complete a monster this turn
  (`canFormMonsterWith`), and you must sweep every card above it into your hand. The dug
  card is recorded in `mustUseIds` and the turn cannot end until it is built.
- **Build:** a monster is exactly **one skull + one foot + any number of claws**, all
  sharing one suit. The `wild` suit substitutes for any suit. Build as many as you like.
  Building uses **labeled slots** (`G.stage` = `{skull, claws:[], foot}`): the on-canvas
  Assembly row (always shown during the action phase) has a **HEAD** slot, one **BODY** slot
  per claw plus one always-open BODY slot, and a **FOOT** slot — portrait cards in the same
  orientation as the hand. To build: **click** a hand card (`selectHandCard`) → its matching
  slot lights up → **click that slot** (`stage-slot` region → `placeInStage`); or **drag** the
  card onto the row (auto-routes by part). A second skull/foot is rejected. When a head **and**
  a foot are both staged the monster **auto-builds** (`tryStageBuild`) — add claws first. Suit
  clash blocks with a warning. Click a staged card (or "Clear staging") to return it.
- **Steal:** swap a real card (matching the monster's suit and the wild's part) into another
  monster, taking the displaced wild. **Bidirectional and toggle-free**: click a hand card →
  the wilds it can replace light up (`validStealTargets`), then click one; OR click a wild →
  it arms (`attemptSteal` sets `G.stealTarget`) and your matching hand cards light up, then
  click one. Always an explicit two-click (no auto-complete). Clicking the armed thing again
  cancels; clicking a different card/wild re-targets. The swap is `doSteal(card, monsterId,
cardIdx)`, gated by the side-effect-free predicate `canStealWith`. The same `selectedCard`
  that drives building also drives card-first stealing — one selection lights up both its
  build slot and its stealable wilds, and whichever target you click decides the action.
- **Discard:** send one card to the graveyard to end the turn. An empty hand may end the
  turn without discarding.
- **Round end:** emptying your hand triggers the **last turn**; every other player gets one
  more turn. Score = **+1 per card you played into a monster, −1 per card left in hand**.
  Discarded cards are neutral.

## Where to find things (code map)

| Task                            | Look at                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Deck size / wild frequency      | `COPIES_COLORED`, `COPIES_WILD`, `buildDeck()`                                                         |
| Suit/part names, colors, glyphs | `SUITS`, `NAMES`, `SUIT_COLOR`, `SUIT_GLYPH`, `PART_GLYPH`                                             |
| Is a monster legal?             | `validateMonster()`, `monsterSuit()`                                                                   |
| Dig-deeper legality             | `canFormMonsterWith()` + `drawFromGraveyard()`                                                         |
| Building                        | click/drag → `placeInStage()` → `tryStageBuild()` (human), `findBestMonster()` (AI)                    |
| Click-to-select / highlight     | `selectHandCard()`, `selectedCard`, `handCardActionable()`                                             |
| Drag-and-drop / slots           | `pointerdown/move/up`, `dragState`, `stageLayout()`, `drawStage()`, `stageZoneRect`                    |
| Stealing                        | `canStealWith()` / `validStealTargets()` → `doSteal()`; `attemptSteal()` arms a wild (`G.stealTarget`) |
| Turn advance / last turn        | `finalizeTurn()`                                                                                       |
| Scoring                         | `endRound()`                                                                                           |
| AI behavior                     | `aiTurn()`                                                                                             |
| Card visuals / connectors       | `drawCard()`, `drawPartArt()`                                                                          |
| Card move animations            | `commit()`, `animStep()`, `note()`/`snapRect()`, `cardRects`, `flying`, `drawFlyingCard()`             |
| Sound effects                   | `SFX` module — `SFX.play(name)`, `SFX.DEFS` (tones), `SFX.files` (file override), mute `[🔊]`          |
| Click/drag routing              | canvas `pointerdown/move/up` + `handleHit()`                                                           |

## Conventions & constraints

- **Ask clarifying questions before coding.** For any non-trivial change to this game,
  surface clarifying questions and get answers before writing code. (Standing requirement —
  the user should not have to ask for this each time.)
- **Vanilla JS only.** Keep it a single dependency-free file unless there's a strong reason
  to split it. If splitting, extract `<script>` into `game.js` and `<style>` into
  `style.css` and link them.
- **Always re-`render()` after state changes** rather than patching the canvas directly.
- **Colors come from CSS variables** (`:root`) for DOM, and from `SUIT_COLOR` for canvas.
- Wrap AI turns in try/catch (already done in `startTurn`) so a logic bug can't freeze the
  game.
- No persistent storage is used. (As a local file in a browser, `localStorage` would work
  if you later want to save settings — it was only avoided for the original artifact host.)

## Adding real artwork

### Full-card art (current, hand-off friendly)

Each card can be a **single full-bleed image** — the whole card is the artist's art, with the
card name and any symbols baked into the picture (no game-drawn banner). Cards render at
**standard trading-card proportions** (`CARD_W=164, CARD_H=230` ≈ 2.5:3.5); artists design at
**750×1050px**. Authoring needs **no code edits**:

- Drop `cards/suit_part_name.png` into the `cards/` folder (e.g. `bug_skull_horned.png`;
  `_xN` before the extension sets copies) and list the filename in `cards/cards.txt`
  (one per line, `#` comments). `cards/README.txt` is the full guide for collaborators.
- `loadCardArt()` fetches the manifest, parses `suit_part_name[_xN]` from each filename, and
  loads each image into `CARD_ART['suit_part_name']`. `part` must be skull/claw/foot.
- `drawCard()` checks `hasArt(card)`: if an image is loaded it draws it full-bleed (rounded
  clip) and skips the placeholder/banner entirely; selection/steal/dim outlines still draw on
  top (interaction state, not card content). A name matching an existing card **re-skins** it;
  a new name **adds** a card via `buildDeck()` folding in `ART_ENTRIES`.
- `PLACEHOLDER_DECK = true` (top of script) keeps the original generated deck so un-arted
  cards keep placeholder faces and art can replace them one at a time; set it to `false` to
  build the deck only from `cards.txt`. The game must be served over http (the manifest fetch
  fails on `file://`). Note: full-card art monsters just stack (no spine band) — continuity is
  the artist's call.

### Legacy part-slot hook

`PART_IMAGES['skull_horned'] = img` still fills only the **art slot** of a _placeholder_ card
via `drawPartArt()` (spine band at ~52% height so monsters link). Superseded by `CARD_ART`
for real artwork. `NAMES` holds the per-part names (`insectoid/horned/bloodshot` skulls, etc.).

## Open design decisions (confirm before building on these)

These were judgment calls during the prototype — flag in commit messages if you change them:

1. **Assembly direction** on the battlefield is vertical (skull on top → claws → foot on
   bottom). Each monster card is the normal portrait `drawCard` rotated 90° CW by
   `drawCardLandscape` (banner ends up on the right edge; art + spine rotate with it).
   Hand/lab/graveyard still use upright portrait cards.
2. **Build + Steal are one unified action phase with no mode toggle.** A single click-to-
   select model drives both (a selected hand card lights up its build slot and its stealable
   wilds; click the target to decide). Could be split back into a moded/sequential flow.
3. **One suit circle + one part circle per card.** (The earlier redundant second suit
   circle was removed.) If a card is ever meant to carry two _different_ suits,
   building/matching logic changes significantly.
4. **AI does not steal** and does not dig the graveyard — kept simple for reliability.

## Suggested roadmap / TODO

- [ ] Replace placeholder art via `PART_IMAGES`; finalize the connecting-edge alignment.
- [ ] Add AI stealing and smarter discard/draw evaluation.
- [ ] Pass-and-play polish for all-human tables (a "hand off the device" interstitial so a
      player's hand isn't revealed to the next).
- [ ] Multi-round match play with a target score.
- [ ] Touch/mobile hit-testing pass (clicks already scale; verify tap targets).
- [ ] Optional: split into `index.html` + `game.js` + `style.css` once the file grows.
- [ ] Decide and lock the open design questions above.

