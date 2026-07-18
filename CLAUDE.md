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
| **Inklings** — word-collecting adventure (hunt letter-creatures, spell words at a desk, fill a library) | `inklings.html` | [`docs/inklings.md`](docs/inklings.md) · [architecture/maps/portability](docs/inklings-architecture.md) · [grammar systems/edu design](docs/inklings-grammar-systems.md) · [farming/scripts](docs/inklings-farming.md) · [collections/curation/decoration](docs/inklings-collections.md) · [object placement/cozy square (0,1)](docs/inklings-placement.md) · [poetry/phoneme engine](docs/inklings-poetry.md) · [phoneme fishing (tentative)](docs/inklings-fishing.md) · [heraldry/blazon shield](docs/inklings-heraldry.md) · [story companions](docs/inklings-companions.md) · [signal flags/omen mast (tentative)](docs/inklings-signal-flags.md) · [cipher menagerie (tentative)](docs/inklings-ciphers.md) · [sound-effect minibosses/shouts (tentative)](docs/inklings-shouts.md) · [diacritics/diacryptids (tentative)](docs/inklings-diacritics.md) |
| **Kaimoju** — Rampage-style kaiju that destroys buildings by typing romaji for kana/kanji | `kaimoju.html` | [`docs/kaimoju.md`](docs/kaimoju.md) |
| **Specimen Lab** (Exquisite Corpse) — Rummikub-style monster-parts card game on canvas | `exquisite-corpse-rummy.html` | [`docs/exquisite-corpse.md`](docs/exquisite-corpse.md) |
| **Spin Nids** (Ambigram Word Game) — rotatable ambigram-tile word game | `SpinNidIndex.html` | [`docs/spin-nids.md`](docs/spin-nids.md) |
| **Write. Right!** — sentence-building card game with an exquisite-corpse drawing twist | `WriteRight.html` | [`docs/write-right.md`](docs/write-right.md) |
| **The Prescriptivist's Gauntlet** — transcribe sentences under stacking linguistic "laws" | `Prescriptivist.html` | [`docs/prescriptivist.md`](docs/prescriptivist.md) |
| **Pitch Bird** — sing-to-fly voice game; pitch controls the bird's height (Flappy pipes + UltraStar karaoke). *In development, not yet shipped* | `pitch-bird.html` | [`docs/pitch-bird.md`](docs/pitch-bird.md) |
| **Mujicians** — Balatro-style music-theory deckbuilder: cards are notes (ROYGBIV), "poker hands" are chords/scales, score = theory correctness, and every hand is played as audio. *v1 vertical slice built (deck→hand→score→sound; **gigs removed 2026-07-17** — a run is now **one continuous Mario-Paint-style performance in one fixed key** (C major, single applause threshold, one Muse drafted at the start) filling a single loop; daily cap; **Save-a-Song** = name/keep the **whole run's** song with a theory report card, replay/export from a Home Setlist); economy still to come. Demoted slice-1 note-grid preserved in `mujicians-compose.html`. **Notelings** letter-creature + Bestiary collection/story layer is designed but tentative/not built. A **7-movement progression campaign** (pitch→rhythm→dynamics→melody→harmony→timbre→structure, Codex-gated, today's game preserved as **Free Play**, daily-capped) has **Phases 0–2 + Phase 3 Stage 1 + Phase 4 core built** (MOVEMENTS registry; Campaign/Free-Play mode select; per-movement select-cap, scoring-term, deck-instrument & threshold gating; `persist.progress`; **the whole M1→M7 arc is playable** — every scoring term wired, M2 **per-note durations (♩/𝅗𝅥/𝅝) over a 4-beat sub-bar grid** (melody plays in pick order, each note its own length; superseded the earlier rhythm-figure picker), per-hand p/mf/f Dynamics, 3-card melodic sequences, harmony stacks, timbre blends, and **M7 Structure**: the loop accumulates per-run into one single-key song, **form scoring** rewards phrase-fingerprint restatement + an **A·B·A** return, and the **M7 gate** is `hasABA`; real per-mechanic advancement gates throughout); the remaining depth (Phase 3 later stages = draftable figures/syncopation/explicit rests; Phase 4 *polish* = boss constraints, mentor prose, AABA/verse-chorus detection; **key change → Melody M4** and **accidentals → Pitch M1** are planned) is not yet built — see the doc. **Balatro-style card animations built 2026-07-17** (deal-in from a deck pile, play→shrink/fly-to-note-cell + bloom, discard→pile, hand reflow, animated Sort — overlay-clone + FLIP layer, art-agnostic, reduced-motion aware; score-juice/reskin deferred).* | `mujicians.html` | [`docs/mujicians.md`](docs/mujicians.md) |

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
  the verb-category map for stat ladders (`data/verb-cats.json`), the adjective→potion dumbbell map
  (`data/adj-attrs.json`, built by `build_adj_attrs.py`), room layouts (`data/rooms/*.json`), the heraldry
  blazon roster for the DEV-only Blazon Shield (`data/blazon.json`), the WordNet relation graph that powers
  the Curator's per-word relatives page (`data/wordnet-relations.json`, lazy-loaded on first curator open),
  and `2of12.txt` — all local project files, no runtime third-party API).
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
