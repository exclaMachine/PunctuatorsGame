# Mujicians — Vowel Monkey (voice set-piece) · **TENTATIVE / designed-not-built**

**Status:** brainstorm captured 2026-07-30. **Nothing built.** A candidate voice-native set-piece for the
**M6 Timbre / wood** movement. Split out of [`mujicians.md`](mujicians.md) to keep that doc small.

> **Design premise (dev, 2026-07-30):** the card grid feels like a *teaching tool*; the more fun game may
> be **voice-only**. This is one of two voice set-pieces being explored — see also
> [`mujicians-voice-boxing.md`](mujicians-voice-boxing.md). The idea: keep the grid as the lesson/composer,
> make *playing* each movement a mic mini-game, extending the boss-set-piece pattern (Scorch, Stepping
> Stones, The Devil's Forge).

## Concept

A game built on **vowel/formant control**, framed as **teaming up with a monkey** — the dev hears vowel
sounds ("ooh / ah / eee") as the hoots chimps and monkeys make. The co-op split is the charm: **you're the
voice, the monkey is the hands** — you can't climb, it can't talk. You *sing the world into motion* while
your ape ally does the physical work.

## Why this belongs to Timbre (M6 / wood)

**Formants are literally timbre** — the resonant peaks of your vocal tract that change the *color* of a
sound while the pitch stays the same. Vowels are the most intuitive demonstration of the M6 Timbre lesson
(same pitch, different timbre) that exists. And a **jungle canopy is wood** (the Timbre element). It fits
the curriculum *and* the element cleanly.

## Why the tech works — and its hard constraint

**Your mouth becomes a 2D joystick** via the first two formants:

- **F1** tracks jaw openness: **ee / oo** (closed) → low F1; **ah** (open) → high F1.
- **F2** tracks tongue front/back: **ee** (front) → high F2; **oo** (back) → low F2.
- Together F1×F2 = the classic **vowel trapezoid**.

**Constraint (important):** rough formant tracking (spectral centroid / LPC peak-picking) is **noisy**.
**Do not design for continuous pixel-precise control.** Quantize the vowel space into **4–5 zones** — the
corners **ee / oo / ah**, plus maybe **eh / er** — that you *slide between*. That's plenty of expressive
range for a monkey, and the continuous-vs-quantized call is exactly the thing a feel-test must settle.

## Ideas / mechanics

1. **Canopy Swing** — vowel space *is* the joystick. "Ooh" (low F1) swings the monkey low; "eee/ah" lift it
   to high vines; F2 (front/back) picks left/right branches. Glide "oo→ah→ee" to Tarzan across a gap. A
   rhythm-platformer where the level is a *melody of vowels*.
2. **Pant-Hoot Call (recruit the troop)** — each monkey has a signature vowel-melody ("oo-oo-AH-ah"); mimic
   it back to befriend it → it joins your team and **unlocks a Sound Collective voice**. Call-and-response
   where the instrument is your face; collection layer built in.
3. **Speak Monkey (puzzle doors)** — a gate opens only to the right hoot; shape the vowel your ally shows
   you. Wrong vowel = wrong "word." Teaches vowel = timbre without ever saying "formant."
4. **The Odd Ape** — a recast of **Wormwood's** find-the-odd-voice: a troop hoots in unison, one has the
   wrong *vowel color*; you hum/probe along and point out the impostor. Direct M6 timbre-discrimination.
5. **Two-Ape Harmony** — you hold one vowel, your monkey holds another; blend them to hit a target
   *combined* timbre. Literally mixing formants = mixing timbre, as a duet.

## Cast / element fit

- **Timbre = wood = M6.** Current M6 hero is **Timbrewolf**; the monkey could be a wood-element **companion**
  (you the voice, it the hands) or Timbrewolf's counterpart.
- Ties to the existing **Wormwood** timbre-boss designs (find-the-odd-voice / choir line-up) — "The Odd Ape"
  is the same deduction recast in the monkey world, and the M6 boss is already BUILT as **Critter Hunt**
  (link-out), so this would be the M6 *lesson/traversal* layer rather than the boss.

## Open questions

- **Quantized zones vs. continuous** formant control — settle by ear in a prototype; noise may force zones.
- How many vowel zones read reliably across different voices/mic setups (3 corners? 5?)?
- Is pitch a *second* axis (pitch = another dimension of movement) or is this purely a timbre/formant game
  to keep it distinct from Pitch Bird / Stepping Stones?
- Does the monkey collection feed the **Sound Collective** (each recruited troop-member = a voice), tying it
  back to the M6 timbre-variety goal?

## Suggested build path

Prototype as a standalone feel-test (e.g. `vowel-monkey.html`) **after** Beatbox Boxing — formant tracking
genuinely needs a "does this feel good / is it too noisy" gut-check before design commits to it. Start with
just the **vowel-zone joystick** driving a single monkey across a couple of gaps; decide quantized-vs-
continuous, then layer on recruitment/collection. Reuses the Web Audio analysis pipeline; the beatbox
onset work from Boxing would help any rhythmic bits.
