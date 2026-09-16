# Asp-ostrophe — the snake that eats words and leaves beetles

Status: **SPECCED 2026-09-16. Nothing built.** Milestones are §12; open questions §13.

**The pitch:** you are ApostroPharaoh, the contraction hero from Punctuators, as an asp in a neon tomb.
Words lie on the floor inside cartouches. You **strike** down a lane and swallow whatever you cross. Two
words that contract — `do` + `not` — fuse inside you into `don't` and burn a **hole in your own body** you
can dash through. Two that don't, you eventually **poop out as a scarab**, a solid block that reshapes the
level. Below you, Apep is rising.

The character already fits: her Punctuators class is literally `AnacontractShine`, her whole move is eating
the letters out of the middle of a phrase, and her two unused art files (`Anacontractshine.png`,
`AnacontractshineEat.png` — 335 × 1630, a head on a long neck with the crown doubling as an open jaw) are a
snake sprite nobody ever built a snake for.

---

## 0. The three reframes

**Movement is Tomb of the Mask's, not Snake's.** You don't crawl a tile at a time under constant pressure.
You flick a direction and she **strikes** — sliding down the lane until something stops her, swallowing
every cartouche she crosses. An asp strikes; it doesn't shuffle. Her body trails the exact path behind her.

**Your own body is a wall you stop against, not a death.** This is the load-bearing change. Coiling is
normally how Snake kills you; here it's how you build stopping points, because in a slide-until-blocked game
the thing you desperately need is *something to stop against*. Death comes from traps and from Apep, never
from touching yourself.

**So a hole in your own body is the most valuable object in the game.** Everything stops your dash, which
means a segment your head can fly *through* is gold — and the only way to mint one is to get the grammar
right. In the earlier letter-based sketch of this game the apostrophe-gate was a nice touch. Here it's the
entire economy.

---

## 1. Decisions settled with the dev (2026-09-16)

| # | Decision | |
|---|---|---|
| 1 | **Whole words on the board, not letters** | You eat `do` and `not`, not `d`,`o`,`n`,`o`,`t`. Simpler to read at a glance, and it makes the unit of play a *grammar* decision rather than a spelling one. The letter version is parked as Hieroglyph mode (§13). |
| 2 | **The digestion queue** — a swallowed word travels down her body and falls out of the tail if unpaired | Chosen over a two-slot mouth with instant resolution. It makes body length mean something (§4), and it turns the failure state into something that merely *happens* rather than something you get told off for. |
| 3 | **A failed pair comes out as a pushable scarab** | The dev's idea, and it's the best mechanic here. §5. |
| 4 | **Endless vertical climb first; authored tomb levels later** | The climb needs no hand-drawn chambers to be fun, so it proves the movement before anything is authored. §7. |
| 5 | **Two currencies, one thing on each: everything internal runs on DISTANCE, Apep runs on TIME** | §3.3. This is the rule the whole economy balances on — stated once so nothing drifts. |
| 6 | **Standalone `asp-ostrophe.html`** | Different engine from Punctuators; there is no `wrap*` mode shape that fits a maze game. Repo convention (one self-contained file, vanilla, no build step). |
| 7 | **Neon-on-black chunky pixel, Tomb of the Mask's look** | §10. Her existing painted art goes through the repo's own `emoji-pixelizer.html` to get there. |
| 8 | **Procedural SFX, no audio assets** | Punctuators' `_tone`/`_noise` kit pattern, rebuilt in-file. Works from `file://`, matches the 8-bit look, and the repo's sample-quality bar (real recordings or nothing) means a borrowed clip would be the wrong call anyway. |
| 9 | **Easy mode = any two lumps may fuse; normal = adjacent only** | The one difficulty knob that changes the *thinking* rather than the speed. |
| 10 | **Name: Asp-ostrophe** | An asp is the Egyptian snake; one word carries snake + apostrophe + Egypt. ApostroPharaoh stays the character's name. Open (§13). |

---

## 2. The play loop

1. You sit still in a neon shaft. Nothing moves until you do.
2. Flick a direction. She **strikes** down that lane, eating every word cartouche she crosses, until a wall,
   a stone, a scarab or her own body stops her.
3. Each word she swallows enters her head as a **lump** — a body segment with the word written on it.
4. Two lumps that contract **fuse**: the letters burn off, and where they were sits one **apostrophe gate**
   — a segment of her body that is not solid.
5. A lump that reaches her tail without a partner **drops out as a scarab** onto the tile the tail vacates.
6. Apep rises from the bottom of the shaft on a clock that does not care what you are doing.
7. You climb. The gates you minted are how you cut back through your own coil when the route demands it.

---

## 3. The strike

### 3.1 The grid

A tile grid, camera on the shaft. She occupies tiles; her body is the trail of tiles her head has visited,
`L` of them.

A flick (arrow keys / WASD / swipe) sets a direction. She advances one tile per dash-tick until the **next**
tile that way is blocked. Blocking: shaft walls, stone, scarabs, **her own body except at a gate**. Not
blocking: word cartouches (eaten and passed through), glyph dots (collected), hazards (they kill), gates
(passed through).

Between dashes **nothing moves** — not her body, not the digestion tract. Standing still is free. The only
thing that ever costs you is travelling.

### 3.2 The body follows

Standard snake trail: the head claims a tile, the tail vacates one, length held constant unless something
changed it. Length changes in exactly four places:

| Event | Δ length |
|---|---|
| Collect a glyph dot | **+1**, permanent |
| Swallow a word (a lump enters at the head) | **+1** while held |
| Two lumps fuse into a gate | **−1** (two lumps → one gate) |
| A lump drops out of the tail | **−1** (and a scarab appears) |

So **her body is her inventory, drawn on the board.** Her length at any moment reads as *how much am I
holding, and how much room do I have to hold more*.

### 3.3 Distance and time

Everything internal — digestion, gate expiry — advances **one step per tile travelled**. Apep advances
**per second**. Nothing else in the game runs on a clock.

That separation is the whole balance. Because internal state is on distance, you can stop and think, and a
long pointless dash is a real cost (it pushes your held words toward the tail and ages your gates). Because
Apep is on time, stopping to think is never free either. Two pressures that never collapse into each other.

---

## 4. The digestion tract — the core

### 4.1 Holding

A swallowed word is a lump sitting in her body at the position it entered. As she travels, the trail shifts
and the lump moves one step toward the tail per tile. Reach the tail and it's out (§5).

So **the length of her body is the length of her buffer**, in tiles of travel. Glyph dots are the only way
to grow it, which is what makes the dots a real decision rather than free points:

> **A longer snake plans better and drives worse.** More tract means more time to go find the partner for
> that `should` you grabbed on a whim. It also means more of you clogging the shaft — though more of you is
> also more wall to bounce off, so the cost is never simply bad.

### 4.2 Fusing

On normal difficulty, two **adjacent** lumps fuse when they form a valid contraction, in body order — which
is the order she ate them, head-most first. `do` then `not` gives `don't`; `not` then `do` gives nothing and
both will eventually drop.

Order coming out of the spatial layout for free is the nicest thing about this design: which end of a
corridor you enter from decides what you spell.

On easy, **any** two lumps in the tract may fuse regardless of position or order.

### 4.3 The gate

A fusion replaces the two lumps with one **apostrophe gate** — a body segment drawn as a bright notch, which
her head may pass straight through instead of stopping against.

A gate is a segment like any other, so it drifts toward the tail as she travels and **expires when it falls
off the end**. Same currency as digestion, same rule, no second timer: a gate lives as long as the tract
behind it, and collecting dots extends every gate you're carrying.

Risk flagged: a gate that moves with the body may be fiddly to aim a dash through. §13 #1 holds the fallback
(a spendable token instead), but the spatial version is the reason the movement model was chosen, so it
ships first and gets play-tested before anything is softened.

---

## 5. Scarabs — the droppings

Egypt's beetle rolls a ball across the sky, so what she leaves behind is a scarab, and a scarab **rolls**.

- A lump reaching the tail drops as a solid block on the tile the tail just vacated.
- **The two failed words stay written on it.** The level fills with a readable record of your mistakes,
  which is funny, and is also a grammar lesson lying on the floor where you have to walk around it.
- **Dash into one and it rolls a lane**, a tile at a time, until it hits something — she follows behind it.
- Which makes scarabs **tools, not just litter**: push one into place to build a stopping point exactly
  where the next dash needs one, plug a dart-trap hole, wall off a corridor. An expert will deliberately
  swallow a garbage pair to manufacture a block. The failure state is also the crafting system.
- **In the climb this matters double.** Going *up* a shaft, the thing you need is something above you to
  stop against. Your own bad grammar builds the staircase you climb. It also clutters the shaft you're
  climbing, and enough of them will seal you in — which is the sloppiness fail, entirely self-inflicted and
  entirely visible.

---

## 6. The word set

Tiles are common words; the pairs are the real contractions of English.

**Verb + `not`** — `do does did is are was were has have had can could would should will must` + `not`
(→ `don't doesn't didn't isn't aren't wasn't weren't hasn't haven't hadn't can't couldn't wouldn't
shouldn't won't mustn't`).

**Pronoun + verb** — `I you he she it we they` + `am is are have has had will would`
(→ `I'm you're he's she's it's we're they're I've you've we've they've I'll you'll she'll they'll I'd
you'd he'd she'd we'd they'd`).

**Openers** — `there here that what who` + `is` (→ `there's here's that's what's who's`).

**Modal + `have`** — `would should could must` + `have` (→ `would've should've could've must've`).

**The odd one out** — `let` + `us` → `let's`.

### 6.1 The cases worth building on purpose

| Tile pair | Why it's in |
|---|---|
| `will` + `not` → **`won't`** | The irregular — a letter actually *changes* rather than vanishing. Make it the golden pair, worth several times a regular one, with its own sound. |
| `can` + `not` → `can't`, **and a lone `cannot` tile** | Both are legitimate English. A decoy that is not actually a mistake. |
| `shall` + `not` → **`shan't`** | Two letters gone and a vowel shift. Rare, so score it high. |
| `am` + `not` → **`ain't`** | Scores huge, and then something disapproves. The repo has a Prescriptivist's Gauntlet; it would be rude not to. |
| **Decoy tiles: `its` `your` `their` `there` `whose` `lets`** | They pair with nothing and always poop. This is the single most-taught apostrophe rule in English — `it's` vs `its` — delivered as a beetle with your mistake written on it. |

The decoys are the whole pedagogy. Nothing is explained; you just learn which words are bait because bait
clutters your shaft.

---

## 7. The climb (built first)

A procedurally generated vertical shaft. Ledges, pillars and gaps give the dash things to stop against;
cartouches and glyph dots are strewn on the ledges; the camera follows her up and never back down.

**Apep**, the serpent of chaos who swallows the sun, rises from the bottom on a clock that accelerates. A
snake game whose doom is a bigger snake is too good to pass up, and he gives the mode its only real-time
pressure (§3.3). Touching him ends the run.

Run scoring: height climbed, contractions banked (weighted, `won't` and `shan't` paying most), and a **chain
multiplier** for fusions inside a few seconds of each other — `couldn't` → `wouldn't` → `shouldn't` is a real
run and should feel like one.

A run ends with a spoiler-free emoji share string in the repo's usual shape (Critter Hunt's `copyShare`
pattern), and stats in `localStorage["aspostrophe.stats"]`.

---

## 8. Masks

Tomb of the Mask's collectible, made Egyptian. Found in the shaft, one at a time, timed.

| Mask | Effect |
|---|---|
| **Anubis** | Pass through your own body *anywhere*, briefly — a universal apostrophe. |
| **Thoth**, the scribe | Lights up every pair currently on screen that actually contracts. Always on in easy mode. |
| **Bastet** | One free death. (Also: do not hit the cats.) |
| **Khepri** | Your next dropping is a bomb instead of a block — clears a 3 × 3. |
| **Sobek** | Chew through stone for a few seconds. |

---

## 9. Hazards

All lane-based, so they read instantly in a game about lanes: dart holes firing across corridors on a
telegraphed beat, timed spike tiles, patrolling mummies, swinging blades across a gap. Sacred cats that
wander and must not be touched.

---

## 10. Art

Neon-on-black chunky pixel with bloom and scanlines — Tomb of the Mask's look, which is very achievable in
canvas and makes hieroglyphs glow for free.

**Word tiles are drawn as cartouches.** Egyptian writing genuinely ringed royal names in an oval with a tie
bar; a word in a capsule is historically right rather than just a UI box, and it's the same gold ring the
Punctuators version already draws around a finished contraction.

Her four existing PNGs are painted, not pixel, so they'll fight the look. The repo already has the fix:
**`emoji-pixelizer.html`** (Critter Hunt's dev tool, repo root) takes dropped image files as well as emoji
and bakes a posterized pixel sprite at a chosen grid. Run `Anacontractshine.png` (the crowned head) and
`AnacontractshineEat.png` (the long neck, jaw open) through it and she's in style with a pipeline that
already exists.

---

## 11. Stars (for the later level mode)

Three per chamber, and they should be about *how* you played rather than whether you finished:

- **Clear the wall** — an inscription along the top has gaps where contractions belong; fill every one.
- **Clean tomb** — finish having dropped zero scarabs.
- **Chain** — three fusions inside the chain window.

---

## 12. Milestones

| | | |
|---|---|---|
| **M1** | **The shaft and the strike** | Grid, dash-until-blocked, the trailing body, body-as-wall, procedural shaft, Apep rising, death and restart. **No words at all.** The point is to prove the movement is fun before anything grammatical exists — if the dash doesn't feel good, nothing above it saves it. |
| **M2** | **The tract** | Word cartouches, swallowing, the digestion queue, fusion, the apostrophe gate, scarab drops and pushing, glyph dots. This is the game. |
| **M3** | **The feel** | The pixel pass, her sprite through the pixelizer, the neon/bloom/scanline treatment, the procedural SFX kit, screen shake, the fusion and the poop both needing their own cue. |
| **M4** | **Masks and hazards** | §8 and §9. |
| **M5** | **The run** | Chain multiplier, scoring weights, stats, the share string. |
| **M6** | *(parked)* Authored tomb levels + the star goals (§11). |
| **M7** | *(parked)* **Hieroglyph mode** — the same tomb with words spelled out letter by letter, eaten as runs, where approach direction decides whether you swallow `not` or `ton`. The original sketch for this game, set aside as a second mode rather than lost. |

---

## 13. Open questions

1. **Is the gate a body segment or a spendable token?** Shipping as a segment (§4.3) because the spatial
   version is why the movement model was chosen. If aiming a dash through a moving notch turns out to be
   miserable in M2, the fallback is a token: contract, then your next dash ignores your own body entirely.
   Easier to use, much less interesting. Decide with hands on it, not before.
2. **Does she cling to walls?** Tomb of the Mask lets you stick to and travel along them, and she's a snake,
   so it's in character and it would let her stop mid-lane. It's also a second movement verb on top of an
   already-novel one. Parked for M1's play-test.
3. **Is there a cap on lumps held**, or is it purely however many fit in the tract? Purely length-driven is
   the cleaner rule and the one §4 assumes.
4. **Does an expiring gate shed as a fang?** The one unbuilt ApostroPharaoh idea in `punctuators.md` is the
   apostrophe as a shed fang. A gate falling off the tail could drop as a pickup that re-mints a gate at the
   head. Charming, and it softens gate expiry — possibly too much.
5. **The name.** *Asp-ostrophe* is the recommendation. *The Serpent's Cartouche* and *Apostropharaoh* are
   the alternatives.
