# Mujicians — Beatbox Boxing (voice set-piece) · **TENTATIVE / designed-not-built**

**Status:** brainstorm captured 2026-07-30. **Nothing built.** A candidate voice-native set-piece for the
**M2 Rhythm / earth** movement. Split out of [`mujicians.md`](mujicians.md) to keep that doc small.

> **Design premise (dev, 2026-07-30):** the card-playing grid feels more like a *teaching tool* than a
> game; the more fun game may be **voice-only**. This is one of two voice set-pieces being explored — see
> also [`mujicians-voice-monkey.md`](mujicians-voice-monkey.md). The idea is to keep the grid as the
> **lesson/composer** and make *playing* each movement a mic mini-game, extending the pattern already
> started by the boss set-pieces (Scorch the Bones = fire/dynamics `scorch-bones.html`, Stepping Stones =
> water/pitch, The Devil's Forge = metal/harmony `forge-quench.html`).

## Concept

A **Punch-Out!!-style rhythm boxing match** where you **beatbox to fight**. Beatbox sounds *are* your
punches; the opponent throws telegraphed combos on the beat and you counter in the pocket. Percussion is
punchy, so **rhythm = earth (M2)** is the natural home — and the difficulty curve *is* the M2 curriculum
(grooves get rhythmically harder as the fight card escalates).

Puns write themselves: "throw down a beat," "one-two punch," "in the pocket," "combo."

## Why the tech works (this is the *reliable* end of the mic)

Unlike ASR (speech-to-text — the weak, laggy channel that needs actual words), beatbox detection is
**onset + spectral classification**, all cheap in-browser Web Audio (the same pipeline Pitch Bird uses):

- **Onset** = a sudden energy spike ("a hit happened"). Reliable, low-latency.
- **3-class sound ID** from band-energy ratios at each onset:
  - **kick** (voiced "b/puh") = low-frequency energy burst
  - **snare** ("k/pah") = broadband burst
  - **hat** ("ts") = high-frequency noise burst
- You will **not** reliably distinguish 20 sounds — but **kick / snare / hat (+ maybe one more)** is a
  well-trodden, achievable target. Design around 3–4 classes, not a full beatbox vocabulary.

## Core loop

**Beatbox on the beat = throw a punch.** Map the three classes to moves:

- **kick** = heavy body blow · **snare** = jab/hook · **hat** = quick dodge/weave

The opponent throws **telegraphed combos on the beat** (Punch-Out tells). You **beatbox the counter in the
pocket** — land the onset in the beat window = clean hit; off-beat = whiff. Timing tightness, not mashing,
is the whole game.

## Ideas / mechanics

1. **Call-the-Combo** — the opponent shows a rhythm (their attack); you beatbox it *back* to block, then
   get a window to throw your own. Simon-says boxing; grows into memory strings.
2. **The pocket = your health** — damage is a function of *timing accuracy*, not just landing a hit. Sloppy
   rhythm = you eat the punch.
3. **Breath = stamina** — hard beatboxing drains a breath meter (ties into the whole game's breath motif
   shared with Scorch/sustain ideas); rest in the gaps to recover, so **pacing your breathing is strategy**.
4. **Combo multiplier (Balatro juice)** — clean on-beat sounds build a multiplier → a **finisher** (a fast
   beatbox fill) lands a KO. On-brand with the deckbuilder's scoring feel.
5. **Rounds as escalating grooves** — early foes throw four-on-the-floor; later ones throw
   son-clave / shuffle / syncopation. The **difficulty curve is rhythmic complexity** = the M2 lesson in
   disguise (mirrors the shown→memory groove walk the Beat Lab already gestures at).

## Cast / element fit

- **Rhythm = earth = M2.** Current M2 hero is **Gaia** (City Gnome); the boxing framing could recast the
  fight card from the M2 cast.
- **Sandmar** (timing villain — the "Lullaby Duel" call-and-response drum-duel design in
  [`mujicians.md`](mujicians.md)) is the obvious first opponent: his whole thing is *messing with your
  timing/tempo*. A beatbox-boxing bout is a clean alternative framing for his encounter.

## Open questions

- Is a 4th class worth chasing (e.g. a rimshot / clap) or does 3 keep it legible?
- Dodging: is it its own sound (**hat**) or a separate gesture? Keep everything as beatbox sounds for
  purity, or allow a lean/pitch dodge?
- How much does this reuse the existing **Beat Lab** engine (`labCfg`, count-in, timing Perfect/Good/Miss,
  combo/accuracy) vs. a fresh standalone?
- Relationship to the shipped finger-drumming M2: alternative *way to play* M2, or a boss-only bout?

## Suggested build path

**Prototype first as a standalone `beatbox-boxing.html` feel-test** (the way `scorch-bones.html` and
`forge-quench.html` were isolated before porting): one opponent, three sounds, telegraphed combos, a breath
meter, on-beat scoring. Recommended as the **first** voice prototype — the tech is the reliable end
(onset + 3-class, no formant noise), the fun is immediate, and it proves the beatbox pipeline the monkey
game's rhythm bits would reuse. Deferred until it feels good: multiple opponents, finishers, campaign
wiring, art.
