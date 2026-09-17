# Asp-ostrophe — the snake that eats letters and feeds the tide

Status: **SPECCED 2026-09-16. PIVOTED 2026-09-16** from whole-word contractions to loose letters (§1a).
**M1 — the strike — BUILT 2026-09-16** as `asp-ostrophe.html`, and it survives the pivot untouched: the
shaft, the dash, body-as-wall and Apep are the same game. Milestones §12; what M1 settled §12.1; open
questions §13.

**The pitch:** you are ApostroPharaoh, the contraction hero from Punctuators, as an asp in a neon tomb.
Loose letters lie on the ledges. You **strike** down a lane and swallow what you cross — but you can only
hold so many, and the moment you go over, **the oldest falls out of your tail**, drops down the shaft and
feeds **Apep**, who is climbing after you and gets faster with every letter he eats.

The only clean way to empty your mouth is to **spell a word with it**.

> **Every letter you eat becomes either a word or fuel for the thing chasing you.**

So the run is one continuous trade: climbing is where the letters are, but every letter you grab is a debt
that comes due as speed unless you spend it. You are outrunning a tide you are personally feeding.

---

## 1. Why letters and not contractions

The first design had you eating whole words and pairing them into contractions (`do` + `not` → `don't`).
It was thrown out for one reason: **English has about sixty contractions.** That is a closed set you'd
exhaust in an evening, and a game whose entire vocabulary you can memorise in a week can't carry an
endless mode.

Spelling *any* word is bottomless, and the character survives intact — better, in fact, because the
contraction becomes **the easter egg** (§7) instead of the chore. ApostroPharaoh's actual trick was never
"pair two words"; it was **take the letters out and leave an apostrophe where they were.** §7 is that,
exactly, and it's now a rare treat rather than the whole economy.

The whole-word version is parked in §13 as a possible second mode, not deleted from the world.

### 1a. Decisions settled with the dev (2026-09-16)

| # | Decision | |
|---|---|---|
| 1 | **Letters on the board, not words** | §1. |
| 2 | **Her body IS the rack** — length = a base plus every letter held, letters drawn on the segments, newest at the head | Keeps the best idea from the first draft (*her body is her inventory, drawn on the board*) and gives holding letters a **driving** cost on top of the overflow risk. Spelling visibly shortens her, which changes your own wall geometry mid-route. |
| 3 | **Overflow drops the OLDEST letter**, out of the tail | FIFO, and physically right — it comes out the far end. It also makes the letter nearest your tail the one you most want to spend, which is a live decision every turn rather than a rule. |
| 4 | **A dropped letter falls until it lands, becomes a block, and Apep eats it when he reaches it** | §5. Deferred fuel: the punishment is certain (so it stays legible) but *when* it lands on him depends on where in the shaft you overflowed. Geometry matters without the feedback getting muddy. |
| 5 | **Capacity 7 to start, upgradeable toward 9** | **Measured** (§4.2): a frequency-weighted 7-rack can spell *something* 97.8% of the time and a 4+ letter word 94.9%. Below 5 it falls off a cliff. 7 is also the Scrabble rack, which is a free bit of legibility. |
| 6 | **The rack is a RACK, not a sequence** — letters may be used in any order | An anagram problem, not a queue-order problem. Queue order decides only *which letter you lose next*, never what you can spell. |
| 7 | **`enable1.txt` is the dictionary; minimum word length 3** | Repo standard — enable1 for eligibility, `2of12.txt` only ever as a commonness signal. Lazy-loaded (1.7 MB), so it needs http serving. |
| 8 | **A word pushes Apep back down** | The tide becomes a live readout of how well you're spelling: poop raises it, words lower it. Self-limiting with no artificial cap, because **letters only exist further up the shaft** — farming requires climbing. |
| 9 | **Arrows steer, letter keys type. WASD is retired.** | Unavoidable: you cannot bind `A`, `S` and `D` to steering in a game where you type. §6.3. |
| 10 | **Contractions become an easter egg that mints an apostrophe gate** | §7. It's the one idea from the first draft too good to lose, and it survives better as a reward than as the economy. |

---

## 2. The play loop

1. Nothing in the shaft moves until you do.
2. Flick a direction. She **strikes** down that lane until a wall, a block or her own body stops her,
   swallowing every letter she crosses.
3. Swallowed letters ride her body, newest behind the head, oldest at the tail. Her body grows by one per
   letter held.
4. Hold more than your capacity and **the oldest drops out of the tail**, falls down the shaft, and lands
   as a block. Apep eats it when he gets there and climbs faster for it.
5. **Spell a word** from the letters you're holding — type it, or tap them. The letters leave cleanly, she
   shortens, you score, and Apep is pushed back down.
6. Climb. The letters are only ever above you.

---

## 3. The strike — BUILT

A tile grid in a vertical shaft, 15 columns wide. A flick sends her sliding one tile at a time until the
next tile is blocked; her body trails the path exactly.

**Your own body is a wall you stop against, not a death.** This is the load-bearing rule of the whole game:
coiling is normally how snake kills you, and here it is how you build the stopping points a slide-until-
blocked game constantly needs. Death comes from Apep, never from touching yourself.

**She cannot stop — she can only turn.** A direction pressed mid-strike takes effect immediately if that
way is open, and queues for the end of the strike if it isn't. Full commitment with the control kept.

**Two currencies, one thing on each: everything internal runs on DISTANCE travelled; Apep alone runs on
TIME.** That separation is what makes §6 possible at all — you can stop and stand still to spell a word,
and it costs you nothing but the seconds Apep spends climbing while you do it. *That* is the balance the
game is made of.

---

## 4. The rack

### 4.1 Holding

Her length is `BASE + held`. Each held letter is a body segment with the letter drawn on it, newest nearest
the head, and as you eat more they march toward the tail — so the letter about to drop is always the one
furthest from your face, which is exactly where you can read it.

Holding is never free: more letters means a longer snake, and a longer snake is harder to drive through a
shaft and blocks more of its own lanes. It is also more wall to stop against, so the cost is never simply
bad.

### 4.2 Why capacity 7

Measured against `enable1.txt`, over frequency-weighted random racks — the share that can spell **any** word
at each minimum length:

| rack | ≥3 letters | ≥4 | ≥5 |
|---|---|---|---|
| 4 | 79.9% | 41.2% | 0.0% |
| 5 | 90.9% | 73.8% | 23.5% |
| 6 | 95.9% | 88.5% | 57.5% |
| **7** | **97.8%** | **94.9%** | 80.7% |
| 8 | 99.3% | 97.7% | 91.1% |
| 9 | 99.8% | 99.0% | 96.4% |

So a full rack is unspellable about **2% of the time** — rare enough to need no special handling, which is
worth stating next to the Sound Board's opposite finding (74.7% of stocks dead at *its* threshold, which is
why that game needed `sbStockCanSpell`). Here the honest answer to a dead rack is that you overflow, the
tide rises, and you carry on. That is the game working, not the game failing.

The cliff below 5 is the reason capacity **starts** at 7 rather than starting small and upgrading up to it:
a starting rack of 4 would fail to make even a three-letter word one time in five, which reads as a broken
game rather than a hard one.

---

## 5. The drop, and the tide

An overflowed letter falls out of her tail, down the shaft, until it hits a ledge, a block or Apep himself.
Where it stops, it becomes a **solid block** — the scarab from the first draft, kept, because a game about
stopping against things wants more things to stop against.

- **Apep eats it when he reaches it**, and climbs faster for good. So a letter dropped high in an open
  shaft is a debt that falls due almost immediately; one dropped onto a ledge far above him is a debt you
  have bought time on. **Where you overflow matters as much as whether you overflow.**
- Until then it is furniture — a block in your way, or a stopping point you can use.
- **You can re-eat it** if you get there before he does. Diving back down the shaft toward the tide to
  reclaim a letter you fumbled is the riskiest move in the game and should pay like it.
- Enough of them and you wall yourself in, which is a death entirely of your own making and entirely
  visible on the way to happening.

---

## 6. Spelling

### 6.1 What counts

`enable1.txt`, lazy-loaded on first run, minimum three letters, letters usable in any order. `2of12.txt`
membership is a *commonness* signal only — it may colour the score or the celebration, never eligibility.

Score scales with length; rare letters (`j q x z`) should pay extra, because they are the ones that clog a
rack and a player needs a reason to be pleased rather than annoyed to see one.

### 6.2 What it does

The letters leave her body cleanly — no drop, no fuel — she shortens, and **Apep is pushed back down** by
an amount that scales with the word. The tide's position is therefore a running scoreboard of how well you
have been spelling, readable at a glance without a single number.

There is no farming exploit to design around: letters exist only further up the shaft, so more spelling
requires more climbing.

### 6.3 Input

**Desktop.** Arrows steer. Letter keys pick that letter out of the rack (greying it as it's used), `Enter`
commits, `Backspace` un-picks the last, `Esc` clears. The word forms in front of you and lights up when
it's real. **WASD is gone** — you cannot bind `A`/`S`/`D` to steering in a game where you type, and `R` can
only stay the restart key because it's read while you're dead.

**Touch.** Swipe to steer; tap letters on her body (or on a rack strip along the bottom) to pick them, tap
a ✓ to commit. Same everything else.

The overflow moment needs telegraphing in both: the tail letter pulses when the rack is full, with a beat
of grace before it goes.

---

## 7. The easter egg — she supplies the apostrophe

You never hold an apostrophe. You don't need to: **spell the letters of a contraction without it and she
puts it back where it belongs.** `dont` → `don't`. `wont` → `won't`. `cant`, `isnt`, `youre`, `theyre`,
`ive`, `couldnt`.

This is ApostroPharaoh's actual move — take the letters out, stand an apostrophe exactly where they were —
and it is the reason the character is in this game at all.

**The joke is that half of them are already real words.** `well`, `shell`, `hell`, `cant`, `wont`, `its`,
`were`, `ill` all score as ordinary words *and* trip the egg. So the payoff can fire on a word you spelled
completely by accident, which is the best possible way for an easter egg to announce itself.

**It pays an apostrophe gate.** The gate is a body segment that is **not solid** — the one place your own
head can dash straight *through* yourself. In a game where everything stops your strike, a hole in the wall
is the most valuable object there is, and it expires by drifting to the tail and falling off. It was the
centre of the first design; it is much better as a rare reward you can't plan around.

Plus the gold cartouche flourish from Punctuators, and a sound nothing else makes.

---

## 8. Apep

He rises on a clock that accelerates with your height, **plus** everything he has eaten. He is
rubber-banded to your **best** height, not your current row (22 rows), so out-climbing him never shakes him
off and diving back down is diving toward him.

A snake game whose doom is a bigger snake was too good to pass up: Apep is the serpent of chaos who
swallows the sun, which makes him the right shape and the right appetite.

---

## 9. Masks

Tomb of the Mask's collectible, made Egyptian. Timed, one at a time, found in the shaft.

| Mask | Effect |
|---|---|
| **Anubis** | Pass through your own body anywhere — a universal apostrophe. |
| **Thoth**, the scribe | Names a word your current rack can spell. |
| **Bastet** | One free death. (Also: do not hit the cats.) |
| **Khepri** | Overflow costs nothing while it lasts — drops vanish instead of landing. |
| **Sobek** | Chew through stone. |

## 10. Hazards

Lane-based, so they read instantly in a game about lanes: dart holes firing across corridors on a
telegraphed beat, timed spike tiles, patrolling mummies, swinging blades. Sacred cats that must not be hit.

## 11. Art

Neon-on-black chunky pixel with bloom and scanlines — Tomb of the Mask's look, achievable in canvas and
free glow for hieroglyphs. Letter tiles are drawn as **cartouches**: Egyptian writing genuinely ringed
names in an oval with a tie bar, so a letter in a capsule is historically right rather than a UI box, and
it's the same gold ring the Punctuators version draws around a finished contraction.

Her four existing PNGs are painted, not pixel, and will fight the look. The repo already has the fix:
**`emoji-pixelizer.html`** (Critter Hunt's dev tool) takes dropped image files as well as emoji and bakes a
posterized pixel sprite. Run `Anacontractshine.png` and `AnacontractshineEat.png` through it.

---

## 12. Milestones

| | | |
|---|---|---|
| **M1** | **The shaft and the strike** — **BUILT 2026-09-16** | Grid, dash-until-blocked, the trailing body, body-as-wall, procedural shaft, Apep rising, death, restart. No letters at all. Prove the movement before anything else is built on it. §12.1. |
| **M2** | **The rack** | Letter tiles in the shaft, eating, letters drawn on her body, capacity, overflow, the fall, the landed block, Apep eating it and speeding up. **Still no spelling** — this milestone is the debt half of the loop on its own, and it should already be a tense (if unwinnable) game. |
| **M3** | **The word** | `enable1.txt`, typing and tapping, the commit, scoring, Apep pushed back. **This closes the loop.** |
| **M4** | **The feel** | Pixel pass, her sprite through the pixelizer, neon/bloom/scanlines, the procedural SFX kit, and the three moments that need their own cue: the swallow, the drop, the word. |
| **M5** | **The easter egg** | §7 — contraction spellings, the cartouche, the apostrophe gate and passing through yourself. |
| **M6** | **Masks and hazards** | §9, §10. |
| **M7** | **The run** | Capacity upgrades, stats, the spoiler-free share string (Critter Hunt's `copyShare` shape). |
| — | *(parked)* Authored tomb levels with star goals; **the whole-word contraction game** (§1) as a separate mode if it ever wants to exist. |

### 12.1 What M1 settled

- **She cannot stop — she can only turn.** The one real feel question. Committing to a slide until a wall
  stops you is the Tomb of the Mask rule, but with no mid-strike turn the deliberate coiling §3 depends on
  is impossible to perform. Turning-but-never-halting keeps the commitment and buys back the control.
- **Apep is rubber-banded to your BEST height, not your current row** (22 rows). Without it a good climb
  leaves him behind permanently and there is no clock; with it, a dive back down the shaft is a dive back
  toward him — which §5 now depends on, since reclaiming a dropped letter is exactly that dive.
- **Length is a bench knob in M1** (`[` / `]`), not a mechanic. M2 replaces it with the rack, which is what
  the knob exists to let you feel in advance: body-as-wall at length 4 versus length 30.
- **Climbability is guaranteed at the row, not by a solver.** Every generated feature leaves a gap by
  construction, plus a sweep that reopens any row that came out solid. Much cheaper to make a dead shaft
  impossible than to detect one.
- **Two traps worth not re-hitting.** `roundRect` is Safari 16.4+ and the dev machine is Monterey, so
  everything rounded is a plain `fillRect`. And the overlays need `pointer-events: none` — they are
  full-size divs over the canvas, so the death screen was swallowing the very tap its own copy asked for.
- **Not in M1, on purpose:** audio. The kit is M4, and a strike cue is a real part of whether movement
  feels good — so if it plays flat, try that before changing `DASH_MS` (44) or Apep's ramp.

---

## 13. Open questions

1. **Does a word push Apep down, or only slow him?** Pushing him down (§6.2) makes the tide a readable
   scoreboard and feels great. It also means a strong speller can hold him almost stationary, which may be
   the correct reward or may be the bug. Decide by playing M3.
2. **Is there a deliberate spit?** A key that ejects the oldest letter on purpose, at the same cost as
   overflowing. It's agency — dumping a `q` to make room — but it also softens the one punishment the game
   has. Leaning yes, at a slightly worse rate than overflow.
3. **Should a landed letter be re-eatable?** §5 says yes and it's the best risk in the design. Watch that
   it doesn't turn into the dominant strategy (hover above the tide, farm your own droppings).
4. **Does the rack refuse duplicates of a letter you already hold?** Almost certainly not, but doubled
   letters are where a 7-rack goes dead, and §4.2's 2% is the number to watch.
5. **The name.** *Asp-ostrophe* still fits — she is an asp, and §7 is where the apostrophe lives. But the
   apostrophe is no longer the economy, so *The Tomb of the Asp* and *Apostropharaoh* are back on the table.
