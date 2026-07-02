# Write. Right! — Project Context

## What This Is

A single-file HTML card game (`WriteRight.html`) built with vanilla HTML/CSS/JS — no frameworks, no build tools. Hosted on GitHub Pages as a static file.

## Game Rules Summary

- Players take turns playing cards to build sentences with the structure: **Noun + Verb + Preposition + Noun**
- Cards can be played to **any open matching position** in any sentence — there is no required order
- There are always **one active sentence slot per player** on the board at all times
- When a sentence is completed, the player who finished it draws it on the in-browser canvas while others guess
- The player who completed the sentence earns points equal to the sum of all cards played in that sentence
- A completed slot is immediately replaced with a fresh empty slot
- Game ends when the deck runs out and all hands are empty

## Card Types

| Type | Positions                          | Points |
| ---- | ---------------------------------- | ------ |
| Noun | NOUN 1 or NOUN 2 (first available) | 2      |
| Verb | VERB                               | 3      |
| Prep | PREP                               | 1      |
| Wild | Any open position, any word        | 4      |

## File Structure

Everything lives in `WriteRight.html` — styles, game logic, and canvas drawing are all inline. There are no external dependencies except two Google Fonts (`Bangers`, `Patrick Hand`).

## Key State Objects

- `G` — global game state (players, deck, slots, phase, timer)
- `DS` — drawing state (color, size, tool, undo history); kept separate so timer ticks don't wipe the canvas
- `SS` — setup screen state (player count, names)

## Game Phases

`game` → `word-choice` or `wild-choice` → (sentence completes) → `drawing` → `score-reveal` → back to `game`

## Rendering

The app uses a manual `render()` function that tears down and rebuilds `#app` innerHTML each call. The drawing overlay (`.draw-ov`) is appended directly to `<body>` and removed on `endDrawing()` or `resetGame()` to avoid losing canvas content during timer re-renders. Timer ticks use `tickTimer()` to patch only the DOM nodes that change, not a full re-render.

**Card-play animation:** because `render()` rebuilds the DOM, played cards are animated with a fly-a-clone (FLIP-style) trick instead of CSS transitions. `commit()` snapshots the played `.card`'s `getBoundingClientRect()` + a `cloneNode` **before** the rebuild (cards carry `data-c`, filled slot cells carry `data-slot`/`data-pos`), then after `render()` calls `flyCardToSlot(node, srcRect, destEl)` which fixed-positions the clone at the source and uses the Web Animations API (`element.animate`) to arc it to the slot with a scale-down/pop, hiding the destination cell until it lands. Skipped on `prefers-reduced-motion` (`PREFERS_REDUCED`) and when the play completes a sentence (the drawing overlay takes over). This mirrors the canvas card-move animation in the exquisite-corpse game.

## Things to Keep in Mind

- Do not add a framework — keep it vanilla JS, single file
- Canvas sizing happens in `initCanvas()` via `requestAnimationFrame` after the overlay renders
- `x()` is the HTML escape helper — always use it when rendering user-supplied strings
- Slot positions are keyed as `n1`, `v`, `p`, `n2` internally
- The deck is 18 cards: 2× each of 9 card definitions (4 noun types, 2 verb types, 2 prep types, 1 wild)
