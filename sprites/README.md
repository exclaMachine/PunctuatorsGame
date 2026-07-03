# Creature sprites (Inklings)

Drop-in custom art for the non-letter creatures. **No code changes needed** — the game already looks for
these files and uses them if present, otherwise it falls back to the built-in pixel art.

## How it works

Each creature in [`../data/creatures.json`](../data/creatures.json) declares an optional `sprite` path
(and an optional `spriteSize` in px). At startup `inklings.html` tries to load that image; if it loads it's
drawn in place of the procedural art, if it's missing the drawn art is used instead.

So to add your own art: **save a PNG at the path below and reload.** That's it.

| Creature | File | Default draw size |
| --- | --- | --- |
| Writer's Block | `sprites/writers-block.png` | 42 |
| Bookworm | `sprites/bookworm.png` | 40 |
| Bindmoth | `sprites/bindmoth.png` | 40 |
| Silverfish | `sprites/silverfish.png` | 40 |
| The Kindle | `sprites/the-kindle.png` | 42 |
| The Overdue | `sprites/the-overdue.png` | 44 |
| The Erazor | `sprites/the-erazor.png` | 42 (currently **disabled** in the JSON) |

(The letter-creatures — inklings — are drawn from the shared `Alpha.png` glyph sheet, not from here.)

## Art guidelines

- **Format:** transparent PNG. Square canvas works best (it's drawn centered at `spriteSize`).
- **Recommended source size:** 32×32 or 48×48 (kept crisp — the canvas draws with
  `imageSmoothingEnabled = false`, so pixel art stays sharp when scaled).
- **Feet near the bottom:** the sprite is centered on the creature's position, so leave a little headroom
  and keep the "ground contact" near the lower third.
- Tune per-creature scale with `spriteSize` in `data/creatures.json`.

## Notes

- Until you add a file, the browser console shows a harmless `404` for that sprite path (the game just uses
  the built-in art). To silence it, delete that creature's `sprite` line in `data/creatures.json`.
- To shelf a creature entirely (no spawn, no bestiary entry), set `"enabled": false` on it — that's how
  **The Erazor** is currently held back.
