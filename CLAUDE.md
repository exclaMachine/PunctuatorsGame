# PunctuatorsGame — Repo Guide

This repo is a **single flat-hosted static website** (GitHub Pages): an `index.html` hub plus many
interlinked word-game and word-tool pages, shared CSS/JS (`nav.js`, `theme.css`, …), and shared data/art
assets. Several self-contained HTML games live here alongside the site's other tools.

## Read the right doc first

Per-game details live in `docs/`. **Before working on a game, read its doc**, and keep that doc current
in the _same_ change whenever you add/remove/modify a feature (the doc is part of the diff).

**This file is an index, not a changelog.** Each entry below is a one-line description, a one-line
status and the doc links. Design rationale, build history, measurements and footguns go in the game's
doc — never here. When a feature ships, update the status line; don't append a paragraph.

- **Inklings** — `inklings.html` — word-collecting adventure: inklings (letter-creatures) are **caught**
  by tracing them, beasts are **fought**; spell words at a desk, fill a library.
  Docs: [base](docs/inklings.md) · [architecture/maps](docs/inklings-architecture.md) ·
  [grammar systems](docs/inklings-grammar-systems.md) · [world atlas](docs/inklings-atlas.md) (M1–M6 built) ·
  [farming](docs/inklings-farming.md) · [collections/décor](docs/inklings-collections.md) ·
  [placement/cozy square](docs/inklings-placement.md) · [poetry](docs/inklings-poetry.md) ·
  [phoneme fishing](docs/inklings-fishing.md) (built) · [heraldry](docs/inklings-heraldry.md) ·
  [companions](docs/inklings-companions.md) ·
  [the Scriptorium — letter tracing & typefaces](docs/inklings-typography.md) (M1–M5 + M7 built, loop
  closed; M6 italics/bold remains; bench `inklings-trace.html`) ·
  tentative: [signal flags](docs/inklings-signal-flags.md), [ciphers](docs/inklings-ciphers.md),
  [shouts](docs/inklings-shouts.md), [diacritics](docs/inklings-diacritics.md)
- **IPA Scrabble / the Sound Board** — `ipa-scrabble.html` (engine bench) + folded into `inklings.html` —
  spell by sound with IPA phoneme tiles on an endless board; tiles are your fished Phonicon.
  M1–M4 built (fish → board → ink loop closed); M5 polish remains. [doc](docs/ipa-scrabble.md)
- **Punctuators: The Game** — `punctuators.html` + `index.js` (+ `utils/utils.js`, per-mode modules) —
  type a sentence, shoot its punctuation back in with punctuation heroes; a dropdown swaps in wordplay
  modes (each = an `<option>` + a `wrap*` function + a `has*` guard + a branch in `animate()`).
  Docs: [known issues + engine footguns](docs/punctuators.md) (read first; not a full base doc) ·
  [Word Ladder / Tree of Kinds](docs/punctuators-ladder.md) (free play + map complete; Restore the
  Phrase and Word Race playable but dev-only behind `?dev=1`) ·
  [Affix Aliens](docs/punctuators-affixes.md) (M1–M3 built, dev-only; M4 the feel remains) ·
  [Serifin — Strokes](docs/punctuators-serifin.md) (M1–M5 built, live; `serifinPOJO.js` not yet
  regenerated, so M5's six rows are inert until `node build-serifin-pojo.js` runs)
- **ApostroPharaoh** — `asp-ostrophe.html` — Tomb-of-the-Mask-style snake: eat letters, spell words or
  they become fuel for Apep. M1–M3 + M4 audio built, SOLID/SPIRIT modes; M4 pixel pass, M5 easter egg
  and the alphabet-restoring goal remain. [doc](docs/asp-ostrophe.md)
- **Wordshape** — `wordshape.html` _(not yet created)_; dev tool `wordshape-draw.html` — draw a word's
  picture using only its own letters. M1 drawing tool + 52-glyph alphabet built; targets, scorer and
  bench remain. [doc](docs/wordshape.md)
- **Mujicians** — `mujicians.html` — Balatro-style music-theory deckbuilder; a run is one continuous
  performance. 7-movement campaign + Free Play built; mentor/villain cast, bosses and shop designed only.
  Docs: [base](docs/mujicians.md) · tentative voice set-pieces: [Beatbox Boxing](docs/mujicians-voice-boxing.md),
  [Vowel Monkey](docs/mujicians-voice-monkey.md)
- **Critter Hunt** — `critter-hunt.html` — Murdle-style daily deduction game on real animal/instrument/
  biome data; also the Mujicians M6 boss (`?boss=mujicians`). Daily phases 1–5 built. [doc](docs/critter-hunt.md)
- **Augminotaur** — `augminotaur.html` — voice-controlled first-person horror; escape via a beatbox
  fight. In development: raycaster, voice input, beat clock, Movement 1 and enrolled verb templates
  built. [doc](docs/augminotaur.md)
- **Pitch Bird** — `pitch-bird.html` — sing-to-fly voice game. In development, not shipped.
  [doc](docs/pitch-bird.md)
- **Kaimoju** — `kaimoju.html` — kaiju that destroys buildings by typing romaji. [doc](docs/kaimoju.md)
- **Specimen Lab** (Exquisite Corpse) — `exquisite-corpse-rummy.html` — Rummikub-style monster-parts
  card game. [doc](docs/exquisite-corpse.md)
- **Spin Nids** — `SpinNidIndex.html` — rotatable ambigram-tile word game. [doc](docs/spin-nids.md)
- **Write. Right!** — `WriteRight.html` — sentence-building card game. [doc](docs/write-right.md)
- **The Prescriptivist's Gauntlet** — `Prescriptivist.html` — transcribe sentences under stacking
  linguistic "laws". [doc](docs/prescriptivist.md)

The repo also holds many undocumented tools/pages (ambigram generators, anagram/palindrome builders, an
IPA game, `typing.html`, etc.). Those have no `docs/` entry — read the file before changing it.

## Shared conventions

- **"ship it"** — first run a consistency pass (skip it for trivial/mechanical commits), then
  `git add .`, `git commit -m '<concise, accurate message>'`, `git push`. No confirmation needed.
  - **Consistency pass:** review this session's changes for stale/contradictory code comments in
    changed files, `docs/*.md` that describe the changed code (e.g. BUILT/not-built markers), and
    `CLAUDE.md` + the `~/.claude` memory files. Auto-fix the obvious in the same commit; pause and ask
    only when a fix is a judgment call. Scope is the changed surface.
- **Vanilla, no build step.** Each game is a self-contained HTML file (inline CSS + JS), no frameworks,
  no bundler. Don't add dependencies unless a feature truly requires it (say so and why). Games may
  fetch **local** project data (`data/*.json`, `fonts/`, wordlists) — never a runtime third-party API.
  Generated data files are rebuilt by their `build-*` script at the repo root, never hand-edited.
- **Needs http serving.** Anything using `fetch`/`decodeAudioData` (most games) won't run from `file://`.
- **Ask clarifying questions before non-trivial work.** Surface the genuine design forks first; prefer
  a recommendation over an exhaustive survey.
- **Parse-check, don't build a test harness.** Sanity-check that the script parses and let the user
  verify behavior in the browser. No headless node/vm harnesses for game logic.
- **Don't reorganize the file layout.** The site is served flat and pages reference shared assets by
  relative path (`Alpha.png`, `2of12.txt`, `Lumberjack_Jack.png`, …); moving files breaks URLs and loading.
- **Word data:** `enable1.txt` decides eligibility; `2of12.txt` is a commonness signal only.
- **Lookups keyed by a word use `Map`/`Set`**, never a plain object — `constructor` and `prototype` are
  real dictionary words.

## Notes

- The git remote moved to `github.com/exclaMachine/PunctuatorsGame.git`; origin still points at the old
  `CanvasPunctuatorsGame` URL and pushes redirect fine.
- **Ambigrambador (Punctuators).** `ambigramPOJO` in `AmbigramFunc.js` is generated by
  `build-ambigram-pojo.js` from `enable1.txt` using Spin Nids' 180° map (636 pairs). Only 180° rotation
  is ported; 90°/270° and mirrors are a possible follow-up.
- **Real audio samples.** `sounds/instruments/<name>/<Note>.mp3` (32 instruments, anchor + pitch-shift,
  `fetch-instrument-samples.sh`) and `sounds/animals/<slug>.mp3` (26 species, one clip each,
  `fetch-animal-samples.sh`, needs ffmpeg) are shared by Critter Hunt and Mujicians; credits in
  `sounds/CREDITS.md` + `data/critter-credits.json`. Player-tuned animal voices live in
  `localStorage["critterhunt.animalVoices"]`, edited in `animal-sound-lab.html`. Details in the Critter
  Hunt and Mujicians docs.
- **Phonetic wordplay data.** `build-phonetic-wordplay.js` emits `data/ipa-palindromes.json`,
  `ipa-semordnilaps-{exact,loose}.json` and `ipa-anagrams-{exact,loose}.json` (anagram sets are stacked
  by sound: one entry per distinct phoneme sequence, kept only when a set holds ≥2). The Sound Board
  detects palindromes/semordnilaps live; the anagram files are not wired into any game yet.
