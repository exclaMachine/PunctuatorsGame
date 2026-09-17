# Apostropharaoh — the snake that eats letters and feeds the tide

*(File and codename stay `asp-ostrophe`. **Name settled 2026-09-17**, §13 #5.)*

Status: **SPECCED 2026-09-16. PIVOTED 2026-09-16** from whole-word contractions to loose letters (§1a).
**M1 — the strike — BUILT 2026-09-16** as `asp-ostrophe.html`, and it survives the pivot untouched: the
shaft, the dash, body-as-wall and Apep are the same game. **M2 — the rack — BUILT 2026-09-16**: letters in
the shaft, the rack on her body, capacity, overflow, the fall, the landed block and Apep eating it — the
debt half of the loop, playable and unwinnable on purpose. **The goal — §14, restore the alphabet — is
SPECCED TENTATIVE 2026-09-17**, and **M3's input model is SETTLED with it at §15**. Milestones §12; what M1
settled §12.1, what M2 settled §12.2; open questions §13.

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
| 11 | **The deliberate spit ships in M2**, not M3 | §13 #2, settled. Without spelling there is otherwise no agency over the rack at all — you eat, you overflow, you die — and the spit is precisely what turns overflow from an accident into the *placement* decision §5 is built to teach. Costed slightly worse than overflowing, and visibly: Apep **lurches** up at once, on top of the same block he will eventually eat. |
| 12 | **A rack bar under the shaft, as well as letters on her body** | Her body is still the rack (§4.1) — but a segment is ~24 px on a phone, and the bar is where the count and the about-to-drop warning are actually legible. It is also exactly where M3's tap-to-spell has to live, so M3 adds behaviour to a widget that already exists rather than inventing one. **Stacked below the canvas, never overlaid** — Apep arrives from the bottom of the shaft, so a strip floating over it would hide the one thing you most need to see. |
| 13 | **Letters rest ON LEDGES** — the empty tile directly above stone — with a minority floating | §1's "loose letters lie on the ledges", taken literally. It makes a ledge a *destination* rather than scenery, and pairs every letter with a natural stopping point, which a slide-until-blocked game constantly needs. A few float in open air so a long vertical strike can still pay. |

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
TIME.** That separation is what makes §6 possible at all: spelling costs you nothing but the seconds Apep
spends climbing while you do it. *That* is the balance the game is made of.

**AMENDED 2026-09-17 (§15): spelling is not a pause.** This paragraph originally read *you can stop and
stand still to spell a word* — but she cannot stop (above), and a game that halts for a word puzzle is two
games glued together. You type while climbing; Apep never waits.

---

## 4. The rack — BUILT (M2)

### 4.1 Holding

Her length is `BASE + held`. Each held letter is a body segment with the letter drawn on it, newest nearest
the head, and as you eat more they march toward the tail — so the letter about to drop is always the one
furthest from your face, which is exactly where you can read it.

Holding is never free: more letters means a longer snake, and a longer snake is harder to drive through a
shaft and blocks more of its own lanes. It is also more wall to stop against, so the cost is never simply
bad.

As built, `BASE` is **4** — a head and three of neck — so she is 4 long empty and **11 long with a full
rack**, which is a big enough swing that you can feel the geometry change as you eat. The rack occupies
the segments from the neck back, ending at the tail tip, so the letter about to drop really is the one on
the end that falls off.

**TO CHANGE (dev's note, 2026-09-17): the letters should fill her ENTIRE length except the head.** Playing
M2, the three blank neck segments read as spare room — and spare room is exactly the wrong thing for a
body to be showing at the moment a letter falls out of it. If every segment behind the head is a letter,
then a full snake is *visibly* a full snake, and the drop explains itself: **there is nowhere left to put
one.** That makes the body the honest readout §4.1 claims it is, rather than a rack with padding on the
front of it.

Mechanically that is `BASE` 1 — head only — so she is **1 long empty and 8 long with a full rack**. Two
knock-ons to settle when it is built:

- **She gets very short when empty**, and body-as-wall (§3) is the rule the whole game stands on: a
  one-tile snake has no body to coil against, so the early game loses its stopping points until the
  first few letters arrive. That may be correct — you are *meant* to want letters — but it is the thing
  to watch first, and the fallback if it plays badly is `BASE` 2 (head plus one), which keeps the reading
  ("every segment you can see a letter on is a letter") while leaving her something to turn against.
- **The overflow beat gets shorter to read.** At `BASE` 4 the doomed letter is the 8th of 11 segments; at
  `BASE` 1 it is the 8th of 8, i.e. the literal tail tip. That is better for legibility and it means the
  drop animation and the segment it leaves from are the same tile, which they currently only nearly are.

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

## 5. The drop, and the tide — BUILT (M2)

An overflowed letter falls out of her tail, down the shaft, until it hits a ledge, a block or Apep himself.
Where it stops, it becomes a **solid block** — the scarab from the first draft, kept, because a game about
stopping against things wants more things to stop against.

- **Apep eats it when he reaches it**, and climbs faster for good. So a letter dropped high in an open
  shaft is a debt that falls due almost immediately; one dropped onto a ledge far above him is a debt you
  have bought time on. **Where you overflow matters as much as whether you overflow.**
- Until then it is furniture — a block in your way, or a stopping point you can use.
- **You can re-eat it** if you get there before he does. Diving back down the shaft toward the tide to
  reclaim a letter you fumbled is the riskiest move in the game and should pay like it. **As built, the
  block being solid IS how you re-eat it**: a strike into one stops there and takes the letter back — one
  move, two outcomes, no extra verb (§12.2).
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

**Settled in full at §15 (2026-09-17)** — typing never pauses the game, touch spells in the rack bar, and
the chips carry a dim / lit / ringed-gold prefix state. What follows is the shape §15 builds on.

**Desktop.** Arrows steer. Letter keys pick that letter out of the rack (greying it as it's used), `Enter`
commits, `Backspace` un-picks the last, `Esc` clears. The word forms in front of you and lights up when
it's real. **WASD is gone** — you cannot bind `A`/`S`/`D` to steering in a game where you type, and `R` can
only stay the restart key because it's read while you're dead.

**Touch.** Swipe to steer; tap letters on her body (or on a rack strip along the bottom) to pick them, tap
a ✓ to commit. Same everything else.

The overflow moment needs telegraphing in both: the tail letter pulses when the rack is full, with a beat
of grace before it goes. **As built there are two states, not one** — *full* (a warning pulse on the
oldest letter, on her body and in the rack bar) and *over* (that letter flashes hard for
`OVERFLOW_GRACE` = 300 ms and then leaves). The beat is deliberately long enough for M3 to be able to
snatch the letter back inside it by spelling with it.

**M2's spit is bound to `X`, which M3 must move.** It is the only free letter key today and it will not be
free the moment letters mean *pick that letter out of the rack* — so when M3 lands, the spit becomes the
✕ button plus something that isn't a letter (the touch path already works and needs no change).

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
| **M2** | **The rack** — **BUILT 2026-09-16** | Letter tiles in the shaft, eating, letters drawn on her body, capacity, overflow, the fall, the landed block, Apep eating it and speeding up, plus the deliberate spit (§1a #11) and the rack bar (§1a #12). **Still no spelling** — this milestone is the debt half of the loop on its own, and it should already be a tense (if unwinnable) game. §12.2. |
| **M3** | **The word** | `enable1.txt`, typing and tapping, the commit, scoring, Apep pushed back. Input model settled at **§15** — typing never pauses, touch spells in M2's rack bar, chips run dim/lit/gold off a prefix check. **This closes the loop.** |
| **M4** | **The feel** | Pixel pass, her sprite through the pixelizer, neon/bloom/scanlines, the procedural SFX kit, and the three moments that need their own cue: the swallow, the drop, the word. |
| **M5** | **The easter egg** | §7 — contraction spellings, the cartouche, the apostrophe gate and passing through yourself. |
| **M6** | **Masks and hazards** | §9, §10. |
| **M7** | **The run** | Capacity upgrades, stats, the spoiler-free share string (Critter Hunt's `copyShare` shape). **This is the fallback meta-layer**: if §14 ships, capacity 7→8→9 moves to its alphabet milestones (§14.6) and is not earned twice. |
| **M8+** | **The 26 tombs** — *tentative*, §14 | The alphabet's own origins as the goal: a tomb per letter, claimed by spelling its ancestor word (`OX` → A, `WATER` → M), the Wall as hub and collection, décor plus four milestone upgrades. **Not a prerequisite for anything above** — if it is dropped, M1–M4 and §7 are still a complete game. |
| — | *(parked)* **The whole-word contraction game** (§1) as a separate mode if it ever wants to exist. |

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

### 12.2 What M2 settled

- **A landed block is solid, and being stopped by it is how you take it back.** §13 #3 asked whether a
  dropped letter should be re-eatable; the answer is yes, and it needed no new verb — the strike that
  stops against it consumes it. One consequence worth keeping: you therefore cannot wall yourself in with
  blocks you are *willing to eat*, so "walled in" now means *surrounded by letters you can't afford*,
  which is a better version of the same death.
- **"Blocked" and "aimable" are two different questions**, and conflating them makes a landed letter
  unreachable — the strike must stop against a block but you must still be allowed to point at one.
  `blocked()` (stone + body + blocks) governs stopping; `aimable()` (stone + body only) governs turning.
- **The rack rides `body[BASE_LEN + i]`**, so it ends at the tail tip, which is where the drop physically
  comes out. The cost is that while she is growing, `body.length` is a step short of `BASE_LEN + held`
  and the letter she just ate has no segment yet — the rack bar has it the same frame, which is half of
  why the bar exists.
- **The landing row is computed once, at drop time, not tested per frame.** Testing as it falls lets a
  letter sink half into a ledge before the test fires; scanning down the column at the moment it leaves
  her costs nothing, because the shaft below is already generated.
- **The rack bar's height is measured, not predicted.** It carries a safe-area inset at the bottom of a
  phone, and guessing that number puts Apep's arrival under the home indicator.
- **Steering fires on `pointermove`, not `pointerup`.** At 44 ms a tile you are usually mid-strike when
  you decide to turn, so requiring a lift loses the corner; once a swipe registers its origin resets, so
  one finger can chain a second direction without leaving the glass. That is what makes §3's deliberate
  coiling performable on a phone at all.
- **The spit's cost is visible or it is not a cost.** The doc's "slightly worse rate than overflow" was
  first drafted as Apep gaining extra speed from a spat block — invisible, and therefore indistinguishable
  from free. As built he **lurches** half a row immediately, on top of the same deferred block: you can
  see the price, you pay it anyway, and what you buy is choosing *where* the letter lands.
- **Letters use Scrabble's distribution**, which is English frequency already weighted and already
  legible: a player who has seen a Scrabble rack knows what a `Q` costs before this game tells them.
- **Density measures at 0.336 letters per row** (`P_LEDGE_1` 0.85 / `P_LEDGE_2` 0.40 / `P_FLOAT` 0.09,
  over 80,000 generated rows) — about **8** on a desktop screen and **10** on a phone. You only eat what
  is in the lane you strike down, so a full rack is roughly a screen and a half of climbing if you are
  taking them and considerably longer if you are dodging. Those three constants are the tuning knob if
  M3 shows the tide rising too fast or too slow.
- **Not in M2, on purpose:** audio (still M4), and any scoring. M2 has no score because it has no win —
  `HEIGHT` and `APEP FED` are the whole readout, and the second one is the debt made into a number.
- **Found by playing it, not yet fixed:** the three blank neck segments should go — the letters should
  fill her whole length bar the head, so that a full snake *looks* full and the drop explains itself.
  Written up in §4.1.

---

## 13. Open questions

1. **Does a word push Apep down, or only slow him?** Pushing him down (§6.2) makes the tide a readable
   scoreboard and feels great. It also means a strong speller can hold him almost stationary, which may be
   the correct reward or may be the bug. Decide by playing M3.
2. ~~**Is there a deliberate spit?**~~ **ANSWERED — yes, and it shipped in M2** (§1a #11). It softens
   nothing, because its cost is paid *in front of you*: Apep lurches half a row the instant you press it,
   on top of the same block he will later eat. What you buy is the placement, which is the decision §5
   exists to teach. Still to watch in M3: whether a strong speller can spit freely enough that the
   overflow punishment stops mattering.
3. ~~**Should a landed letter be re-eatable?**~~ **ANSWERED — yes, and the mechanism is free**: a block
   stops your strike, and being stopped by it is what takes the letter back (§12.2). The farming worry
   stands and is now testable: hovering above the tide to eat your own droppings is legal, and M2's spit
   makes it easier, not harder. Watch it in M3, when a word finally makes the droppings worth something.
4. **Does the rack refuse duplicates of a letter you already hold?** Almost certainly not, but doubled
   letters are where a 7-rack goes dead, and §4.2's 2% is the number to watch.
5. ~~**The name.**~~ **ANSWERED 2026-09-17 — the game is _Apostropharaoh_.** It names the character
   rather than the mechanic, which is the right call once §14 makes the alphabet the point: the apostrophe
   is an easter egg (§7) and the asp is a costume, but *she* is the draw and she is the one restoring the
   alphabet. The file, the codename and this doc's filename stay `asp-ostrophe` — renaming a shipped path
   buys nothing and the repo is served flat.

---

## 14. The goal — restore the alphabet (TENTATIVE, 2026-09-17)

**Status: tentative by the dev's call.** This is the shape the game is aiming at, not a commitment. M3
still closes the loop on its own and nothing below is a prerequisite for it. If §14 is dropped, M1–M4 plus
§7 remain a complete arcade game and §12's M7 is still the fallback meta-layer.

### 14.1 The problem it answers

After M3 the game is a complete arcade loop with **no reason to play it twice**: the entire meta-game is
one integer in `localStorage` called `best`. Every other game in this repo has an answer to *what am I
doing across sessions* — Inklings has the dex and the collections, Critter Hunt has the daily and the
streak, Mujicians has the campaign, Punctuators has the Tree of Kinds. This has a high score.

There is a second gap under it. Every game here teaches something specific, and this one currently teaches
**anagramming under time pressure** — which is real, but it is the Sound Board's payload already, it is a
side effect of the mechanic rather than a subject, and it leaves the Egyptian setting doing no work at all.
The tomb is a skin.

### 14.2 The payload

**The letters we use descend from Egyptian hieroglyphs**, by way of proto-Sinaitic and Phoenician, and most
of them are still recognisable pictures of the thing they were named after. That is a real, bounded (26),
genuinely surprising body of knowledge that runs straight through the setting this game already has.

| | ancestor | | ancestor |
|---|---|---|---|
| **A** | *aleph*, an ox head — rotate `A` 180° and it is still one | **M** | *mem*, water |
| **B** | *beth*, a house | **N** | *nun*, **a snake** |
| **D** | *daleth*, a door | **O** | *ayin*, an eye |
| **H** | *heth*, a fence | **P** | *pe*, a mouth |
| **K** | *kaph*, a palm | **R** | *resh*, a head |
| **L** | *lamed*, a goad | **S** | *shin*, a tooth |

The player is a snake and **N *is* a snake.** That is the alphabet's own biography, not a pun we invented.

**It does not overlap Inklings' Scriptorium.** That feature is about *the tool that made the shape* — nibs,
stroke contrast, typefaces. This is about *the origin of the shape* — pictograms. Siblings, not duplicates,
and worth keeping visibly distinct if both ship.

**Some etymologies are contested** (*gimel* camel vs throwing stick; *samekh*, *qoph*, *sadhe* are all
argued). The repo's standard is real data, so a contested letter must say so in its own words rather than
assert one version as fact — and where there is a choice, take the reading that is most drawable and most
spellable.

### 14.3 The structure

**26 letter-tombs.** A tomb is a shaft — the thing M1 and M2 already built — so this costs almost nothing
structurally. What a tomb adds is a top and a key.

- **You PASS a tomb by escaping it** (reaching the top, ahead of Apep).
- **You EARN the letter by spelling its ancestor word** on the way: `OX` claims A, `EYE` claims O,
  `MOUTH` claims P, `WATER` claims M, `SNAKE` claims N. **The picture on the wall is the password** — which
  turns the fact into a verb instead of a codex entry, and is discoverable by a player who is paying
  attention rather than being told.
- **Passing without the key is not a failure.** You escaped; you just did not claim the letter. The tomb is
  replayable, so a tomb is never a hard block and the alphabet is never gated behind one bad rack.
- **A tomb is themed to its own ancestor.** The tomb of M floods. The tomb of N is thick with snakes. The
  tomb of O is watched.

**The endless shaft survives unchanged** as the arcade layer — same code, no top, no key — and stays the
default so the game still opens into something playable in five seconds.

### 14.4 The feasibility problem, and the fix

**Spelling a SPECIFIC word is far harder than spelling ANY word**, and it would be easy to build this
without noticing. §4.2's 97.8% is *can this rack make something*; holding `W A T E R` in seven slots at
once is a different and much rarer event. Unfixed, most tombs would be unclaimable and the feature would
read as broken.

**The tomb seeds its own shaft toward its key word.** The tomb of M drops `W A T E R` tiles well above
their Scrabble weight. Two things fall out of that, both good:

- It is also the **teaching mechanism** — you keep finding the same five letters and start to guess why,
  which is the moment the feature is built for.
- Holding five of your seven slots on the key means you will be **one letter short and overflow-dropping
  the `R`**, which is precisely the drama §5 exists to create. The key word and the core tension are the
  same event.

**The key word is exempt from §1a #7's three-letter minimum**, or `OX` cannot be the key for A. It is not
an ordinary scoring word; it is the tomb's lock.

### 14.5 The Wall — hub, collection and reward in one screen

One screen showing all 26 letters. A dark letter is a tomb you have not claimed; a claimed one shows its
pictogram and its descent (hieroglyph → proto-Sinaitic → Phoenician → Greek → Latin). That single artifact
is the **tomb select**, the **collection**, and the place restored décor is displayed — so the reward for a
tomb is visible in the same screen you choose the next one from.

**Tombs are freely chosen, not gated** — you can enter any of the 26 from the start. The tomb of **N** is
the natural opener (she is a snake, in the snake's own tomb) but nothing enforces it.

### 14.6 What a restored letter pays

The dev's call: **cosmetic, plus upgrades kept very small.** 26 stacking upgrades would make the endgame
play nothing like the opening and leave the last tombs trivial, so the weight is split:

- **Per letter (×26, tiny):** the pictogram becomes a **placeable decoration** on the Wall (Inklings' décor
  pattern), and **that letter scores double when spelled**. A restored letter is a letter that works
  properly again, which is the theme paying the mechanic. It is self-scaling — restoring `E` matters more
  than restoring `Q` because you hold more `E`s — and no single one is felt on its own.
- **Per milestone (×4, real):** at **25 / 50 / 75 / 100%** of the alphabet — the repo's own milestone
  pattern, used by the Atlas's continents and the Scriptorium's album. Capacity 7 → 8 → 9 lives here
  (§4.2 caps it at 9), and 100% is the completion payoff. Four real upgrades across a whole alphabet is
  slow enough that a tomb never becomes free.

### 14.7 Open details

- **Six letters have no Egyptian ancestor.** `J U V W Y` are Latin/Greek additions and `C`/`G` both split
  from *gimel*. That is a fact worth teaching rather than a hole to paper over — those are **newer tombs**
  and should say so. What their key word is (`W` = the double `U`?) is unsolved.
- **Which word claims a contested letter**, given 14.2's honesty rule.
- **Whether the tomb's seeded letters are visible as such** — a player who notices the bias is being taught;
  one who does not just finds the tomb generous.
- **Whether the endless shaft and the tombs share the `best` record** or keep separate ones.

---

## 15. M3's input model — settled 2026-09-17

**Typing does not pause anything.** Apep keeps climbing, the strike keeps striking, you type mid-climb and
commit on `Enter`. The alternative — standing still to spell, as §3 describes — was rejected as the thing
most likely to make this read as *an action game that stops for a word puzzle*; Tomb of the Mask never asks
you to stop, and one game beats two glued together.

**On touch, spelling lives in the rack bar** — which is why §1a #12 put it under the canvas in M2 rather
than overlaid. Steering is a swipe **on the canvas**; spelling is a tap **on the bar**. Two regions, two
thumbs, no gesture conflict, and the bar M2 already built gains behaviour instead of a new widget being
invented for it.

**The chips carry three states, and the middle one is the whole design:**

| state | meaning |
|---|---|
| **dim** | this letter cannot extend what you have typed into any real word |
| **lit** | it keeps you on a live prefix |
| **ringed gold** | committing right now makes a word |

The gold ring is a signal §6.3 already required (*"lights up when it's real"*); it has simply moved onto the
chips. The lit/dim split is a **prefix check against `enable1`, not a solver** — it refuses dead ends
without ever naming the word, which is the line this has to walk. **Desktop gets the identical affordance**
(impossible keys grey out), so the two platforms teach the same thing rather than diverging.

**The known exploit, and why it is acceptable:** you can tap only lit chips and stumble into short words
without solving anything. Score and Apep-push scale with **length**, so mashing survives and never wins —
and in a real-time game where the pressure is supposed to come from Apep rather than from the dictionary,
forgiving input is the right failure.
