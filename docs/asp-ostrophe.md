# ApostroPharaoh — the snake that eats letters and feeds the tide

*(File and codename stay `asp-ostrophe`. **Name settled 2026-09-17**, §13 #5.)*

Status: **SPECCED 2026-09-16. PIVOTED 2026-09-16** from whole-word contractions to loose letters (§1a).
**M1 — the strike — BUILT 2026-09-16** as `asp-ostrophe.html`, and it survives the pivot untouched: the
shaft, the dash, body-as-wall and Apep are the same game. **M2 — the rack — BUILT 2026-09-16**: letters in
the shaft, the rack on her body, capacity, overflow, the fall, the landed block and Apep eating it — the
debt half of the loop, playable and unwinnable on purpose. **M3 — the word — BUILT 2026-09-17, so THE LOOP
IS CLOSED**: `enable1.txt`, typing and tapping, §15's dim/lit/gold chips, the commit, the score and Apep
pushed back down — plus §4.1's standing change, `BASE_LEN` 4 → **1**, since **REVISED 2026-09-18 to a
FIXED body** (head + one slot per capacity point, empty slots drawn as sockets; §4.1). **The goal — §14, restore the
alphabet — is SPECCED TENTATIVE 2026-09-17**. Milestones §12; what M1 settled §12.1, M2 §12.2, M3 §12.3;
open questions §13.

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
| 2 | **Her body IS the rack** — a **fixed** length of head + one slot per capacity point, letters drawn on the slots, newest at the head, unfilled slots drawn as sockets | Keeps the best idea from the first draft (*her body is her inventory, drawn on the board*). It shipped as `base + held` so that holding also cost manoeuvrability; **revised 2026-09-18 (§4.1)** because body-as-wall is the load-bearing rule and the wall must not resize every time you eat or spell. |
| 3 | **Overflow drops the OLDEST letter**, out of the tail | FIFO, and physically right — it comes out the far end. It also makes the letter nearest your tail the one you most want to spend, which is a live decision every turn rather than a rule. |
| 4 | **A dropped letter falls until it lands, becomes a block, and Apep eats it when he reaches it** | §5. Deferred fuel: the punishment is certain (so it stays legible) but *when* it lands on him depends on where in the shaft you overflowed. Geometry matters without the feedback getting muddy. |
| 5 | **Capacity 7 to start, upgradeable toward 9** | **Measured** (§4.2): a frequency-weighted 7-rack can spell *something* 97.8% of the time and a 4+ letter word 94.9%. Below 5 it falls off a cliff. 7 is also the Scrabble rack, which is a free bit of legibility. |
| 6 | **The rack is a RACK, not a sequence** — letters may be used in any order | An anagram problem, not a queue-order problem. Queue order decides only *which letter you lose next*, never what you can spell. |
| 7 | **`enable1.txt` is the dictionary; minimum word length 3** | Repo standard — enable1 for eligibility, `2of12.txt` only ever as a commonness signal. Lazy-loaded (1.7 MB), so it needs http serving. |
| 8 | **A word pushes Apep back down** | The tide becomes a live readout of how well you're spelling: poop raises it, words lower it. Self-limiting with no artificial cap, because **letters only exist further up the shaft** — farming requires climbing. |
| 9 | **Arrows steer, letter keys type. WASD is retired.** | Unavoidable: you cannot bind `A`, `S` and `D` to steering in a game where you type. §6.3. |
| 10 | **Contractions become an easter egg that mints an apostrophe gate** | §7. It's the one idea from the first draft too good to lose, and it survives better as a reward than as the economy. |
| 11 | **The deliberate spit ships in M2**, not M3 — **PARKED 2026-09-18, §16.2** | §13 #2, settled. Without spelling there is otherwise no agency over the rack at all — you eat, you overflow, you die — and the spit is precisely what turns overflow from an accident into the *placement* decision §5 is built to teach. Costed slightly worse than overflowing, and visibly: Apep **lurches** up at once, on top of the same block he will eventually eat. |
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
5. **Spell a word** from the letters you're holding — type it, or tap them. The letters leave cleanly, the
   slots they were in empty, you score, and Apep is pushed back down.
6. Climb. The letters are only ever above you.

---

## 3. The strike — BUILT

A tile grid in a vertical shaft, 15 columns wide. A flick sends her sliding one tile at a time until the
next tile is blocked; her body trails the path exactly.

**Your own body is a wall you stop against, not a death.** This is the load-bearing rule of the whole game:
coiling is normally how snake kills you, and here it is how you build the stopping points a slide-until-
blocked game constantly needs. Death comes from Apep, never from touching yourself.

**AMENDED 2026-09-19 (§18): that rule is now the SOLID difficulty, and it has a sibling.** It had never
been tested on anyone but the dev, and it may simply be too much wall to navigate around — so **SPIRIT**
removes it (she passes straight through herself) and the two ship side by side to be played against each
other. Death still comes from Apep and only from Apep, in both.

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

**Her length is FIXED** at `BODY_LEN` = `BASE` + `CAP` = **8** — the head plus one **slot** per capacity
point — and the letters *fill* it rather than extending it. Each held letter is a slot with the letter
drawn on it, newest nearest the head, and as you eat more they march toward the tail — so the letter about
to drop is always the one furthest from your face, which is exactly where you can read it. A slot you have
not filled is drawn as an **empty socket**: darker than the body, unmistakably not a letter, so a row of
them reads as *room*. A full snake is therefore visibly full and the drop explains itself — **there is
nowhere left to put one** — without the body ever having to change size to say so.

**Why fixed, revised 2026-09-18 (dev's call).** The earlier rule (`BASE + held`, so 1 long empty and 8
long full) made holding cost manoeuvrability directly, but it put the cost on the wrong thing:
**body-as-wall (§3) is the rule the whole game stands on**, and under a growing body the wall you coil
against resized every time you ate or spelled a word. The opening of a run had no body at all to turn
against, and the one piece of level geometry the player authors moved under them at exactly the moments
they were thinking about something else. A constant body is a constant tool; the rack's cost lives where
it is legible — the sockets filling up, and the overflow.

**AMENDED 2026-09-19 (§18):** this argument rests entirely on body-as-wall, which is now the **SOLID**
difficulty rather than the whole game. It holds there and nowhere else — in SPIRIT a fixed length is just
the rack's display, since there is no wall to keep constant. Nothing needs undoing, but if SPIRIT wins the
friends test this reasoning should be rewritten rather than left standing as the justification for a rule
the game no longer has.

What this gives up, and is worth stating: spending a word no longer shortens her, so the wall geometry is
no longer a thing you can spend. The only length change left is the single over-capacity segment during
`OVERFLOW_GRACE` — which still puts the doomed letter on the literal tail tip, so the drop and the segment
it leaves from are the same tile.

The history, since it is the argument's other end: M2 shipped `BASE` 4 with the rack short of it, and
three blank *neck* segments read as spare room — the wrong thing for a body to show at the moment a letter
falls out of it. M3 cut `BASE` to 1 to fix that. The fixed body keeps the reading M3 bought (every unfilled
space is visibly a space waiting for a letter) while putting the neck padding back to work as capacity.

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

## 6. Spelling — BUILT (M3)

### 6.1 What counts

`enable1.txt`, lazy-loaded on first run, minimum three letters, letters usable in any order. `2of12.txt`
membership is a *commonness* signal only — it may colour the score or the celebration, never eligibility.

Score scales with length; rare letters (`j q x z`) pay extra, because they are the ones that clog a rack
and a player needs a reason to be pleased rather than annoyed to see one.

**As built: `sum of Scrabble letter values × word length`** — Scrabble's values to go with the Scrabble
distribution the letters are already drawn from (§12.2), so the two halves of the game read off one table
a player may already know. Length is by far the stronger term, which is what makes §15's mash-the-lit-chips
exploit survivable: `CAT` 15, `SNAKE` 45, `JINXED` 126, `ZIGZAG` 156.

### 6.2 What it does

The letters leave her body cleanly — no drop, no fuel — their slots empty, and **Apep is pushed back down** by
an amount that scales with the word. The tide's position is therefore a running scoreboard of how well you
have been spelling, readable at a glance without a single number.

**As built: `1.0 + 1.1 × (length − 3)` rows**, so a three-letter word buys 1 row and a seven-letter word
4.4. The push is **not uncapped, and nothing new was written to cap it**: `updateApep` already re-clamps
him to `height − MAX_LAG` on the same frame, so a shove only ever fully lands when he is close and is
partly clawed back when he is already far below. That is the honest answer to §13 #1 — a strong speller
holds him at arm's length and no further, and the reprieve is worth most at exactly the moment it is
needed most.

**The slots empty on the spot.** Since §4.1's fixed body she does not shorten at all — the only thing a
commit can trim is the single over-capacity segment, and it goes now rather than on her next step.

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
a commit button. Same everything else. **The commit button is a wide `ENTER` rectangle** — see §16, where
the first phone test found that a slot-sized `✓` reads as a letter chip rather than a control.

The overflow moment needs telegraphing in both: the tail letter pulses when the rack is full, with a beat
of grace before it goes. **As built there are two states, not one** — *full* (a warning pulse on the
oldest letter, on her body and in the rack bar) and *over* (that letter flashes hard for
`OVERFLOW_GRACE` = 300 ms and then leaves). The beat is deliberately long enough for M3 to be able to
snatch the letter back inside it by spelling with it.

**M2's spit was bound to `X`, and M3 moved it** — the moment letters mean *pick that letter out of the
rack*, no letter key is free — and then **§16 parked the spit altogether (2026-09-18)**, removing the ✕
button and the `Delete`/`-` bindings. `R` restarts **only while you are dead** (alive, it is the letter R);
`Enter` also restarts from the death screen.

**A typed letter takes the OLDEST unpicked copy of it.** `rack[length-1]` is the one about to fall, so
spelling with a doubled letter always spends the one you are closest to losing — which is what makes the
`OVERFLOW_GRACE` beat above genuinely long enough to snatch the doomed letter back.

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
| **M2** | **The rack** — **BUILT 2026-09-16** | Letter tiles in the shaft, eating, letters drawn on her body, capacity, overflow, the fall, the landed block, Apep eating it and speeding up, plus the deliberate spit (§1a #11 — parked out of the UI in §16.2) and the rack bar (§1a #12). **Still no spelling** — this milestone is the debt half of the loop on its own, and it should already be a tense (if unwinnable) game. §12.2. |
| **M3** | **The word** — **BUILT 2026-09-17** | `enable1.txt`, typing and tapping, the commit, scoring, Apep pushed back, and §15's dim/lit/gold chips off a prefix check. Typing never pauses anything. `BASE_LEN` 4 → 1 rode along (§4.1), since revised again to a fixed `BODY_LEN`. **The loop is closed.** §12.3. |
| **M4** | **The feel** — **audio BUILT 2026-09-18**, §17 | The procedural SFX kit is in: two palettes split down the loop's own seam (tomb below, arcade above), a pitch ladder on the swallow so a filling rack tightens audibly, a commit arpeggio that scales with **length**, and Apep's proximity drone — his first non-visual presence. **Still to do:** the pixel pass, her sprite through the pixelizer, neon/bloom/scanlines. |
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
  feels good — so if it plays flat, try that before changing `DASH_MS` (44) or Apep's ramp. **The kit is in
  as of 2026-09-18 (§17), so that advice is now live: the strike cue is the first thing to reach for.**

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
- **The rack rides `body[BASE_LEN + i]`**, and the last filled slot is where the drop physically comes
  out. Since the fixed-body change the only case where a letter has no segment yet is the over-capacity
  one, while she grows the extra segment for it — the rack bar has it the same frame, which is half of
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
- **Not in M2, on purpose:** audio (M4, BUILT 2026-09-18 — §17), and any scoring. M2 has no score because it has no win —
  `HEIGHT` and `APEP FED` are the whole readout, and the second one is the debt made into a number.
- **Found by playing it, not yet fixed:** the three blank neck segments should go — the letters should
  fill her whole length bar the head, so that a full snake *looks* full and the drop explains itself.
  Written up in §4.1.

---

### 12.3 What M3 settled

- **Two Sets, not a trie, and the second one is the feature.** `VALID` answers *is this a word*;
  `PREFIX` answers *could this still become one*, which is §15's whole lit/dim split. Keeping them apart
  is what keeps this a prefix check rather than a solver — it can refuse a dead end without ever naming
  the word on the other side of it.
- **The dictionary is filtered to words that fit a rack** (`length ≤ CAP`), because a word longer than
  your capacity can never be spelled and lighting a chip toward one would be a lie. Measured: enable1's
  172k words become **51,916** and the prefix set **91,290**, built in **55 ms** — so it is fetched in the
  background at boot rather than on first keypress, and it is long since in by the time you have letters.
  Words of 2 are kept in `VALID` but gated out at commit, so §14.4's tomb keys (`OX` claims A) need no
  second parse to exist.
- **All 26 letters are a live prefix**, verified, so nothing is dim before you have typed anything — dim
  only ever appears mid-word, which is exactly when it means something.
- **A picked letter is tracked by a stable ID, never by its rack index.** Eating unshifts onto the rack
  and would shift every index under a half-typed word — a bug that only shows up when you eat mid-spell,
  i.e. constantly. Which also makes the converse cheap: if the letter that drops was spoken for by the
  word you are building, the word loses it too, because a word holding a letter you no longer have is the
  one state the bar must never show.
- **A typed letter takes the OLDEST unpicked copy** (§6.3), so a doubled letter always spends the one
  nearest the tail. That is what makes `OVERFLOW_GRACE` a real window rather than a decoration.
- **The push needed no cap of its own.** `updateApep`'s existing `height − MAX_LAG` rubber band already
  clamps it on the same frame, which answers §13 #1 without a new number: a word is worth most when he is
  close and is partly clawed back when he is already far below.
- **Her body and the bar must never disagree**, so a letter claimed by the word wears the chrome colour
  (neon) on the segment *and* in the chip, distinct from gold (held) and orange (doomed). The rack is her
  body; two readouts of one thing that can contradict each other are worse than one.
- **The word lands on the canvas as well as in the bar.** You are watching the shaft, and a score that
  only ever appears under your thumbs is a score you never see.
- **Not in M3, on purpose:** audio (M4, BUILT 2026-09-18 — §17), `2of12.txt` (a commonness signal the score does not yet
  spend), and the easter egg (§7, M5).

---

## 13. Open questions

1. **Does a word push Apep down, or only slow him?** **Built as a push** (§6.2), and the worry answered
   itself: `MAX_LAG`'s rubber band already clamps him back to `height − 22` on the same frame, so a strong
   speller holds him at arm's length and no further — he can never be held *almost stationary*, and the
   reprieve is worth most when he is closest. What is left to decide by playing is only whether
   `PUSH_BASE`/`PUSH_PER` (1.0 / 1.1 rows) are generous enough to be worth the seconds they cost.
2. ~~**Is there a deliberate spit?**~~ **ANSWERED — it shipped in M2, and was PARKED 2026-09-18** (§16,
   dev's call). Its cost was paid *in front of you* — Apep lurches half a row the instant you press it, on
   top of the same block he will later eat — and what you bought was the placement, which is the decision
   §5 exists to teach. It came out because the *button* was the problem, not the mechanic: a slot-sized ✕
   in the letter row read as a letter, and was the control people pressed when they meant to commit a
   word. `spit()` is left standing in the file with no caller so reviving it is one button and one key
   branch. **If it comes back, the thing to watch is unchanged:** whether a strong speller can spit freely
   enough that the overflow punishment stops mattering.
3. ~~**Should a landed letter be re-eatable?**~~ **ANSWERED — yes, and the mechanism is free**: a block
   stops your strike, and being stopped by it is what takes the letter back (§12.2). The farming worry
   stands and is now testable: hovering above the tide to eat your own droppings is legal, and the spit
   made it easier rather than harder — one more reason its return is not free. **Still to watch now M3 is in**, since a word is what finally makes the
   droppings worth something.
4. **Does the rack refuse duplicates of a letter you already hold?** Almost certainly not, but doubled
   letters are where a 7-rack goes dead, and §4.2's 2% is the number to watch.
5. ~~**The name.**~~ **ANSWERED 2026-09-17 — the game is _ApostroPharaoh_.** It names the character
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


## 16. The first phone test — fixed 2026-09-18

Two findings, one a bug and one a design failure, both in the rack bar and both invisible on a desktop.

### 16.1 Tapping the chips zoomed the phone in, with no way back out

**Spelling is a burst of taps in one small region, which is exactly the shape of a double-tap** — so iOS
zoomed, and the player was stranded there. The cause was a gap and its own guard working against each
other:

- `#rackbar` and `.slot` declared **no `touch-action`**, so the browser kept double-tap-to-zoom over the
  one widget the game asks you to tap repeatedly. (`#commit`/`#spit` already carried `manipulation`; the
  chips are plain `div`s and were missed.)
- `body` carried **`touch-action:none`**, which killed the pinch that would have undone it. The zoom-in
  was reachable and the zoom-out was not.

The first pass set **`touch-action:manipulation` on `#rackbar`** and relaxed **`body` from `none` to
`manipulation`**, leaving **the canvas alone on `none`** — the only place it is load-bearing, since a
swipe on the shaft must be a strike and never a pan. `user-scalable=no` stays on the meta tag: Android
honours it and can no longer zoom at all; iOS has ignored it since iOS 10, so there a pinch outside the
shaft remains as the escape hatch.

**That was not enough, and the second pass is the one that fixed the phone.** `touch-action:manipulation`
is a **no-op before Safari 13 and unreliable on a non-interactive element even after it** — the chips are
plain `div`s — so the zoom survived, and picking two *adjacent* letters is two taps a few pixels and a few
hundred ms apart, which is a double-tap as far as the phone is concerned. The fix that does not depend on
the browser honouring anything: **the second tap of any pair inside the bar has its `touchend` default
cancelled** (`DBLTAP_MS` = 500), which is the event the zoom actually hangs off.

**It is free because every control in the bar already acts on `pointerdown`** — a tap has counted by the
time `touchend` arrives, and the click being suppressed was doing no work. The one control that *was* on
`click`, the commit button, **moved to `pointerdown`** to join them, keeping a `click` listener for
keyboard activation alone (a focused button answers Space with a click and no pointerdown in front of it)
that stands down when a pointer just did the job. The guard is scoped to the bar, so the pinch escape
hatch is untouched.

**Two general rules, one per pass.** `touch-action:none` on `<body>` is not a free safety net — it removes
the recovery gesture along with the unwanted one, so it belongs on the element that actually owns a
gesture. And **`touch-action:manipulation` is a hint, not a guarantee**: on a control you cannot afford to
have zoom out from under the player, cancel the second tap yourself and make sure nothing needs the click.

### 16.2 The ✓ read as decoration and the ✕ read as a letter

The report was *there is no way to confirm a word*, when there had been a commit button all along. Both
controls were the size and shape of a letter chip, which is what the eye had just been trained to read as
*a letter*:

- The **`✓` commit** was a `1.6`-slot square, dim until the word was real, sitting at the end of the word
  strip — so the one control that closes the loop looked like part of the frame.
- The **`✕` spit** was exactly one slot square, in dark colours, sitting in the letter row next to the
  chips — and empty slots are dark squares too, so it read as an empty slot. It was the button people
  pressed when they meant to commit.

**Fixed (dev's calls):** the commit became a **wide `ENTER` rectangle**, word-labelled rather than a glyph,
dim-but-readable when inactive and gold when the word is real; and **the spit was removed from the UI
entirely** (§13 #2), leaving the letter row nothing but letters. The word row is now a full slot tall, so
`ENTER` is a real tap target rather than a 24 px sliver.

**The label is `ENTER`, not `SPELL`.** It names the key, and the keyboard and the button then say the same
word — worth more here than naming the action, which the word strip beside it is already doing by lighting
up gold.

---

## 17. The sound — BUILT 2026-09-18 (M4's audio half)

Procedural WebAudio, no assets, in a `SFX` block near the top of the file — the repo's usual tone/noise
kit. It is the one part of the game that needs no data file, so it works on `file://` where the dictionary
does not.

### 17.1 Two palettes, and the split is the design

Everything that happens **below you** is **tomb**: sub bass and filtered noise, no pitch you could hum —
the strike's rush, the thunk, the letter falling out of your tail, Apep's gulp, the death. Everything you
**do with a letter** is **arcade**: square-wave blips on a minor pentatonic — the swallow, each pick, the
word, the record.

The reason is §2: the loop has two halves, debt and spelling, and they are the same tiles and the same
snake seen two ways. Splitting the palette down that line means **you can hear which half you are in**,
and a drop is the one event that crosses over — a gold pitched glide (yours) falling into tomb noise
(his).

One scale for the whole arcade half, a minor pentatonic, because three ladders (the swallow, the pick, the
word) have to agree with each other and a pentatonic has no interval that can come out wrong.

### 17.2 The cues

| Moment | Palette | What it is | Why it is that |
|---|---|---|---|
| Strike | tomb | 160 ms airy noise sweep; **up** sweeps up, **down** sweeps down, lateral flat | Fires more often than anything else, so it is short and quiet — and following the direction is what makes a *turn* audible rather than just a start |
| Strike ends | tomb | Sub thud + a dry low noise burst | Carries the same beat as `shake`; stone, because that is what stopped you |
| First strike of a run | tomb | A low 0.9 s gong with a slow noise swell | The tomb noticing. Replaces a title-screen cue, which there is no room for |
| Swallow | arcade | One blip, **pitched by how full the rack now is** | The mouth filling up becomes audible: the seventh letter is the highest note in the game, which is the drop warning you one beat early |
| Rack hits 7 | arcade | A souring two-note at the top of the ladder | The `warn` flash, as sound |
| Over capacity | arcade | Two rising ticks across `OVERFLOW_GRACE` | A 300 ms fuse; the drop lands on the third beat you are already expecting |
| Letter drops | tomb+ | A pitched glide **down**, 660 → 120 Hz, with a noise tail | The one cue that crosses palettes: your gold leaving you and heading for him |
| It lands | tomb | Dry click + a small thud | It is furniture now |
| Apep eats it | tomb | A swelling low-passed roar + two detuned sub saws | Deliberately the worst sound in the game short of dying: a fed letter is a permanent debt, not a fine |
| Re-eating a block | arcade | The ordinary swallow plus one bright ping | Taking a letter *back off the floor* should not sound the same as finding one |
| Pick a letter | arcade | A tick up the ladder by position in the word | A long word audibly climbs while you build it |
| Unpick | arcade | The tick, falling | — |
| The word goes gold | arcade | Two-note ping | §15's gold chip state, as a sound: *what you hold is a word now* |
| Commit | arcade | An ascending arpeggio **one note per letter**, then a downward sweep under it; 6+ letters add an octave flourish | The payoff scales with **length, not points**, because length is the stronger term in the score (§12.3) — a six-letter word has to sound better than two threes, or the audio teaches §15's mash-the-lit-chips exploit. The downward sweep is Apep being pushed back: the tide's own gesture, reversed |
| Refused | arcade | A dull descending pair | Not harsh — a refusal is information, and the dim chips already said it |
| Death | tomb | 1.2 s: two detuned saws falling to 30 Hz, a noise sweep down, a sub under it | The drone is cut on the same frame so the roar has the field |
| A new best | arcade | Three rising notes, 0.85 s in | Under the tail of the roar, and **arcade** — the record belongs to the spelling half |

### 17.3 Apep gets the only continuous voice

He is the game's one clock (§3, §8) and until now he was purely visual: you had to look down to know. So
he has a **drone** — two detuned sawtooths through a low-pass with a tremolo — whose gain, cutoff, pitch
and tremolo rate all follow **the gap between her head and him**, and it is silent beyond 12 rows.

Three details that matter:

- The gain is the **square** of nearness, so he is genuinely quiet until he is genuinely close. A bed you
  can always hear is a bed you stop hearing.
- It measures the gap to **her head, not to `height`** — so a dive back down the shaft to reclaim a
  dropped letter is audibly a dive toward him, which is exactly what §8's rubber band makes it.
- Every parameter moves through `setTargetAtTime`, so a word that shoves him six rows down fades rather
  than clicking. It is built once with the context and left running at gain 0, which is cheaper and
  smoother than starting and stopping oscillators as he closes.

### 17.4 What the build settled

- **A held arrow key would machine-gun the strike cue.** `keydown` auto-repeats, and `tryDir` re-arms a
  strike it is already running, so the cue is skipped when the direction is the one already going. The
  general shape: a cue on a function that input repeat can re-enter needs to know whether anything
  actually changed.
- **The mute button has no key binding, and cannot have one** — every letter key picks a rack letter
  (§15) and the arrows steer, which leaves nothing spare. It is a 🔊 in the HUD's top-right, the only
  control on the canvas side of the game, so it has to opt back into the pointer events `#hud` gives up.
  The flag rides the **existing** `aspostrophe.stats` record, no second key and no version bump.
- **A cue never creates the AudioContext.** Only one capture-phase listener per input route does, because
  autoplay policy refuses a context built anywhere else, and a kit that half-starts is worse than a silent
  one.
- **One compressor for the whole kit.** A strike, a swallow, a landing, a gulp and the drone can all land
  inside one frame, and with a sub-bass palette the clipped sum sounds like a broken speaker rather than
  like loud.

**Still M4:** the pixel pass — her sprite through `emoji-pixelizer.html`, the neon/bloom/scanline
treatment. Nothing in §17 depends on it or is depended on by it.

---

## 18. Two difficulties — BUILT 2026-09-19

**The finding (dev, 2026-09-19): her own body may simply be too much wall to navigate around.** §3 calls
body-as-wall the load-bearing rule of the whole game, and it has never been tested against anyone but the
dev. So rather than tune it by guess, it becomes **a toggle with two named modes**, shipped so friends can
play both and say which they prefer. The point of the feature is the answer it returns: if SPIRIT wins,
§3's central claim is wrong and the game is a different game.

### 18.1 The two modes

| | **SOLID** (today's rule) | **SPIRIT** (the easier one) |
| --- | --- | --- |
| Her body | a wall she stops against | not there at all |
| A turn into herself | refused, and silently queued | taken, like any open tile |
| A strike into herself | ends the strike (thunk) | passes straight through |
| What still stops her | stone, landed blocks, her body | stone, landed blocks |

Nothing else differs. Death still comes from Apep and only from Apep (§3), the rack, the drop, the tide and
spelling are untouched, and the shaft generates identically — so a SPIRIT run and a SOLID run of the same
seed are the same level.

**Names, recommended: SOLID / SPIRIT.** Thematic without needing a gloss — the Egyptian *ka*, the spirit
double that walks through what the body cannot, is exactly the mechanic, and a friend reads "SPIRIT: pass
through yourself" once and never again. (Plain HARD/EASY is the fallback if the flavour gets in the way of
the test; `KA` alone was rejected as unreadable to anyone who isn't already in the lore.)

### 18.2 Why the whole-wall version and not a half-measure

Two smaller versions were on the table and both were turned down for the same reason — **they would blur
the answer the test exists to get**:

- *Only the neck phases* (the 2–3 segments nearest the head) fixes the commonest frustration — turning
  back into the tile you just laid — while a coil you built on purpose stays solid. But the rule is
  invisible on screen unless those segments are drawn differently, and a friend who prefers it has told
  you nothing clean about §3.
- *Turns are never refused* (she may always aim into herself, and just stops on contact) fixes the
  unresponsive feel — today a turn into your own body does visibly nothing — without removing the wall.
  It is the smallest honest change, and it may simply be too small to answer the complaint.

Both stay available as a third mode later if SOLID and SPIRIT split the vote rather than settling it.

### 18.3 The seam is one predicate

`bodyAt(c, r)` is read in exactly **two** live places — `aimable` (`asp-ostrophe.html:922`, which decides
whether `tryDir` refuses a turn) and `step` (`:971`, which ends the strike). Both are the rule. So SPIRIT
is `bodyAt` returning `false`, and nothing else in the movement code is touched. (`blocked()` at `:921` is
the third reader and has **no callers** — it predates the aimable/blocked split of M2 and is dead. Leave
it consistent with the flag anyway, or the next person to call it gets a fourth behaviour.)

**Two knock-ons worth stating before they surprise someone:**

- **SPIRIT also fixes the opening**, which nobody diagnosed as the same bug. At `reset()` all eight
  segments are stacked on the start tile and she sheds one per step, so for the first seven moves she is
  dragging a pile she cannot turn into — the most boxed-in she is ever going to be is the moment before
  she has done anything. In SPIRIT that period does not exist.
- **She can overlap herself**, so a segment can carry a letter you cannot see and the head can sit on top
  of one. The renderer already draws tail-first with the head last (`drawSnake`), so this reads correctly
  with no change; `drawRackOnBody` will stack letters under her occasionally, which is honest — the bar
  is the authoritative readout of the rack and always has been.

### 18.4 Scores stay separate

**A best per mode.** An easy run must never overwrite a hard-mode record or the comparison is worthless
the first time a friend plays both. Stored as **flat suffixed keys on the existing
`aspostrophe.stats` record** — `best`/`bestScore` keep meaning SOLID, and `bestPhase`/`bestScorePhase`
are new — which means **an existing save needs no migration and no version bump**: every run played to
date was played solid, so the untouched keys already land on the correct mode. It is the same pattern the
mute flag used (§17.4): `loadBest` only ever asks for the fields it knows.

The HUD's `BEST` shows **the current mode's** best, and the mode is named beside it so a player mid-run
always knows which rules they are under. The death screen's best line names the mode too.

### 18.5 The toggle: between runs only

A two-chip segmented control on **the title screen and the death screen** — the two moments when no run is
in progress. Switching mid-run was rejected: a run's score would be a blend of both rules, which is
precisely what the test is trying to separate. Changing the mode re-runs `reset()`, so the mode you see is
always the mode you are about to play. The flag persists on the same record, so a friend sets it once.

In practice **the death screen's copy is the one that matters** — `reset()` hides `#ov-dead` but never
re-shows `#ov-start`, so after the first dive the title screen is gone for the session. That is correct
(nobody wants the rules re-explained every run) and it is why the toggle cannot live only on the title.

**The trap, and it is already written down in the file.** `.ov` carries `pointer-events:none` with the
comment *"No overlay here holds a control, and both of them invite a tap that has to reach the canvas
underneath"* — because restart is a `pointerdown` on **the canvas**, not on the overlay. This feature is
the first control inside an overlay, so:

- the chips opt back in with `pointer-events:auto` on the control alone, the mute button's exact pattern
  (`#hud` gives up pointer events; `#hud #mute` takes them back);
- that is also what stops a chip tap restarting the run, since the canvas never sees a pointerdown the
  chip absorbed — the rest of the death screen still restarts on a tap, as its own copy promises;
- **the `.ov` comment becomes a lie and must be amended in the same change**, or the next person reads it
  and removes the `pointer-events:auto` as redundant;
- the chips act on `pointerdown` like every other control in this game, and if they are ever moved into
  `#rackbar` they inherit §16.1's double-tap cancel for free. On an overlay they do not, so two quick
  mode-flips could zoom a phone — `touch-action:manipulation` on the chips, and watch it on an old Safari.

No key binding (§17.4's rule stands: every letter key picks a rack letter, the arrows steer, nothing is
spare). `R` is unaffected — it restarts only while dead, in whichever mode is set.

### 18.6 What to watch, and what the result means

- **The thing being measured is not "which is more fun" but which one people keep playing.** Height and
  score in SPIRIT will be higher by construction; that is not the signal. The signal is preference, and
  secondarily whether SPIRIT runs end in *Apep caught me* rather than *I got stuck*.
- **SPIRIT costs the game its only authored level geometry.** §4.1 fixed her body length precisely so the
  wall you coil against would not resize under you; if the wall is gone, that argument is spent and the
  fixed length is just a rack display. Nothing needs undoing — but if SPIRIT wins, §4.1's reasoning should
  be rewritten rather than left standing as a justification for a rule the game no longer has.
- **Longer strikes, so more letters crossed per strike.** A strike only ends on stone or a block, so SPIRIT
  eats faster, overflows sooner and feeds Apep more (§5) — it may be easier to steer and *harder* to
  survive, which would be the most interesting possible outcome and the one to look for first.
- **§13 #3's farming worry gets easier in SPIRIT**, since hovering over your own droppings no longer boxes
  you in. Worth a glance if anyone starts grinding.

### 18.7 As built (2026-09-19)

It came in at **one predicate and some chrome**, as specced — `phase`, an early `return false` in `bodyAt`,
and no other change anywhere in the movement code. Four things the build settled:

- **`saveBest` had to become read-modify-write.** It wrote a *fresh* `{best, bestScore, mute}` object, so
  the moment there are two modes it would drop the other mode's record on every death. It now reads the
  record, edits its own mode's keys and writes it back — which is also what makes the no-migration claim
  actually true rather than merely intended.
- **`best`/`bestScore` in memory always mean the CURRENT mode's**, so `applyBests()` re-reads them when
  the mode flips and `phase` joins `drawHUD`'s cache key — otherwise the HUD keeps showing the other
  mode's record until the score happens to change.
- **The chips get a `click` handler as well as `pointerdown`**, the commit button's precedent, because a
  focused button answers SPACE with a click and no pointerdown in front of it. **ENTER never reaches them
  at all** — the global keydown handler claims Enter for the word and `preventDefault`s it — which is
  worth knowing before someone "fixes" the chips by adding an Enter branch.
- **`.ov` is a flex column with `gap:10px`**, so the hint line needed a negative top margin or it sat as
  far from the chips it describes as the chips did from the paragraph above them.

**Verified by reading rather than by playing:** SPIRIT introduces no unbounded strike. Horizontal strikes
still end at the shaft's implicit side walls, downward ones at `BEDROCK` (which exists precisely so a
downward dash always lands), and upward ones at the next generated ledge — exactly as in SOLID, since
nothing of hers is ever *above* her on a fresh climb. The only case SPIRIT changes is striking back into a
coil, and that continues to the stone beyond it, which is bounded by all three.

**Left alone on purpose:** `drawSnake` already draws tail-first with the head last, so an overlapping body
reads correctly with no change, and `drawRackOnBody` will occasionally stack a letter under her — honest,
since the bar is and always has been the authoritative readout of the rack.

**Build unit:** the flag + `bodyAt` + the two bests, then the chips and the HUD tag. One sitting; nothing
here depends on M4's pixel pass or on §14.

## 19. The letter row was off the bottom of the screen — fixed 2026-09-20

**The rack bar measured itself a slot short at boot.** `sizeCanvas()` gives the canvas whatever the bar
does not need (§1a #12 stacks them, never overlays), and it measures the bar rather than predicting it —
but the slot divs are created by `renderBar()` on the *first frame*, so at boot `#slots` was an empty flex
row measuring **0**. The canvas got one slot's height too much, and in a fixed, `overflow:hidden` body
that pushed the letter row clean off the bottom, where it stayed until a window resize happened to
re-measure.

**Fix: the row RESERVES its height in CSS** (`#slots{height:var(--slot)}`) rather than deriving it from
children that do not exist yet. It never wraps (`.slot` shrinks instead), so one slot tall is its true
height whether it holds 0, 7 or the 8th doomed letter — which is what makes the reservation exact and not
a guess.

**The general rule:** a measured element must be measurable *before* the thing that fills it runs, or the
measurement is of a layout no player ever sees.

Also lowered `sizeCanvas`'s canvas-height floor from 300 to 160: the bar is not optional chrome — it is
where a word is built — so on a short window the shaft gives up height rather than the bar being pushed
out of a body that cannot scroll.
