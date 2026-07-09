# PunctuatorsGame — Repo Guide

This repo is a **single flat-hosted static website** (GitHub Pages): an `index.html` hub plus many
interlinked word-game and word-tool pages, shared CSS/JS (`nav.js`, `theme.css`, …), and shared data/art
assets. Several self-contained HTML games live here alongside the site's other tools.

## Read the right doc first

Per-game details live in `docs/` so this root file stays small and every session loads only what's
relevant. **Before working on a game, read its doc.** Keep that doc current in the *same* change whenever
you add/remove/modify a feature (treat the doc as part of the diff, not an afterthought).

| Game | Entry file | Doc |
| ---- | ---------- | --- |
| **Inklings** — word-collecting adventure (hunt letter-creatures, spell words at a desk, fill a library) | `inklings.html` | [`docs/inklings.md`](docs/inklings.md) |
| **Kaimoju** — Rampage-style kaiju that destroys buildings by typing romaji for kana/kanji | `kaimoju.html` | [`docs/kaimoju.md`](docs/kaimoju.md) |
| **Specimen Lab** (Exquisite Corpse) — Rummikub-style monster-parts card game on canvas | `exquisite-corpse-rummy.html` | [`docs/exquisite-corpse.md`](docs/exquisite-corpse.md) |
| **Spin Nids** (Ambigram Word Game) — rotatable ambigram-tile word game | `SpinNidIndex.html` | [`docs/spin-nids.md`](docs/spin-nids.md) |
| **Write. Right!** — sentence-building card game with an exquisite-corpse drawing twist | `WriteRight.html` | [`docs/write-right.md`](docs/write-right.md) |
| **The Prescriptivist's Gauntlet** — transcribe sentences under stacking linguistic "laws" | `Prescriptivist.html` | [`docs/prescriptivist.md`](docs/prescriptivist.md) |

The repo also holds many undocumented tools/pages (ambigram generators, anagram/palindrome builders, an
IPA game, `typing.html`, `punctuators.html`, etc.). Those have no `docs/` entry yet — read the file
before changing it.

## Shared conventions (apply to all of the above)

- **"ship it"** — When the user says "ship it", immediately `git add .`, then `git commit -m '<concise,
  accurate message reflecting what actually changed>'`, then `git push`. No confirmation needed — just do
  it. (End commit messages with the `Co-Authored-By` line per the harness instructions.)
- **Vanilla, single-file, no build step.** Each game is one self-contained HTML file (inline CSS + JS),
  no frameworks, no bundler. Don't add dependencies unless a feature truly requires it (say so and why).
  Intentional exceptions are documented per-game (e.g. Inklings fetches a bundled local WordNet dictionary
  (`data/dictionary.json` + `data/inflections.json`), the Nouns-wing shelf index (`data/noun-books.json`),
  the verb-category map for stat ladders (`data/verb-cats.json`), room layouts (`data/rooms/*.json`), and
  `2of12.txt` — all local project files, no runtime third-party API).
- **Ask clarifying questions before non-trivial work.** For any meaningful change, surface the genuine
  design forks and get answers before writing code. Prefer a recommendation over an exhaustive survey.
- **Parse-check, don't build a test harness.** These are browser games with no test rig; sanity-check
  that the inline `<script>` parses and let the user verify behavior in the browser. Don't run headless
  node/vm harnesses for game logic.
- **Don't reorganize the file layout.** The site is served flat and pages are interlinked; game HTML
  files reference **shared assets by relative path**, so moving them breaks URLs, navigation, and asset
  loading. Notable shared assets: `Alpha.png` (Spin Nids + Inklings glyph sheet), `2of12.txt` (punctuators
  + Inklings), `Lumberjack_Jack.png` (Inklings player). Keep game files and assets where they are.

## Notes

- The git remote reports it moved to `github.com/exclaMachine/PunctuatorsGame.git` (origin still points at
  the old `CanvasPunctuatorsGame` URL; pushes redirect fine).
- A persistent memory store at `~/.claude/projects/.../memory/` holds cross-session feedback/preferences;
  its `MEMORY.md` index is loaded each session.
