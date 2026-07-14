# Inklings — Signal Flags & the Omen Mast

Status: **TENTATIVE / exploratory — no MVP yet.** This is a captured brainstorm, not an agreed build. Nothing
here is implemented; the design is still being thought through before committing to an MVP. Treat every
mapping below as a first-draft proposal, not a spec. **Do not build from this without a fresh "let's build it"
decision** — when that happens, this doc becomes the plan and gets a real status/build-order section.

The hook: the author learned of the **naval flag alphabet** (the International Code of Signals — the 26
coloured maritime signal flags) and wanted a fun, non-conflicting way to bring it into Inklings.

Cross-refs: [`inklings.md`](inklings.md) (core loop, daily-seeded map, equipment, drops),
[`inklings-heraldry.md`](inklings-heraldry.md) (the Blazon Shield — **this system shares its grammar and
renderer**, see §2), [`inklings-companions.md`](inklings-companions.md) (companion bonus hook),
[`inklings-grammar-systems.md`](inklings-grammar-systems.md) (adjective/dumbbell potions hook),
[`inklings-farming.md`](inklings-farming.md) (garden/harvest hook).

---

## 0. The pitch — a daily "omen" you read off a flag mast

A **Signal Mast** stands at home base (or a small coastal screen). Because the Inklings map is already
**daily-seeded** (Wordle-style: same all day, fresh tomorrow), the mast can fly **today's flag(s)** and have
each flag state a *true fact about today's world*. Reading the mast rewards the player who learns the flags —
and, because a signal flag *is* a tiny blazon, it quietly drills the same tincture/division vocabulary the
Blazon Shield needs (§2).

The whole point is a **communication / omen** layer that is *orthogonal* to the core hunt→spell→library loop.
It is **not** "spell a word out of flag pictures" — that is just the writing desk reskinned. The novelty must
come from the naval **verbs** (read-at-distance, omens, and the deferred substitute-pennant / decode / trade
ideas in §5), not from spelling.

---

## 1. Is the naval flag alphabet "based on" blazon? (the research)

**Verdict: cousins, not parent-and-child.** The International Code of Signals was a practical 19th-century
invention, not descended from a specific coat of arms — but it was deliberately designed on **heraldic
principles**, and nearly every flag can be written as an exact blazon.

- A 1936 US Naval Institute *Proceedings* article is literally titled *"Heraldry and Our International Signal
  Flags."*
- The flags use heraldic **tinctures** (Or/yellow, Argent/white, Gules/red, Azure/blue, Sable/black — they
  drop Vert/green and Purpure/purple for sea visibility), heraldic **partition lines** (*per pale, per fess,
  per bend, quarterly, per saltire*), and **ordinaries** (*cross, saltire, pale, fess*).
- They obey the **rule of tincture** (no colour-on-colour): *all but two of the 26 conform*, the exceptions
  being **E** and **Z**. This is the same deep principle as heraldry — **maximize contrast for legibility** —
  which is *why* both systems avoid colour-on-colour. That shared principle is a genuine, teachable bridge.

Example blazons (from DrawShield's rendering of the set): M = *Azure, a saltire argent*; V = *Argent, a
saltire gules*; O = *Per bend gules and or*; N = *Chequy azure and argent*; Z = *Per saltire or, sable,
gules and azure*.

Sources: [Heraldry and Our International Signal Flags — USNI Proceedings 1936](https://www.usni.org/magazines/proceedings/1936/september/heraldry-and-our-international-signal-flags)
· [International maritime signal flags — Wikipedia](https://en.wikipedia.org/wiki/International_maritime_signal_flags)
· [International Code of Signals — Wikipedia](https://en.wikipedia.org/wiki/International_Code_of_Signals)
· [DrawShield — signal flags as blazons](https://drawshield.net/gallery/0101/gallery-010146.html)

---

## 2. Why this rides on the Blazon Shield tech (the synergy)

Because a signal flag **is** a simple blazon (usually field + one division/ordinary, two tinctures, no
charges/attitudes), the **existing emblazon renderer already speaks flag.** Consequences:

- **Rendering is cheap.** Author ~26 tiny blazons and draw them on flag-shaped fields instead of shield-shaped
  ones, reusing the layered renderer + the tincture-rule validator already built for the shield.
- **Signal flags are the on-ramp to the shield.** They are the *simplest possible* blazons, so reading/building
  them teaches tinctures + divisions + ordinaries **before** the player faces the full shield grammar
  (charges, attitudes, counterchange). Naval mast = "beginner blazon"; heraldry bench = "advanced blazon."
- **One vocabulary, reinforced twice.** The omen layer drills the exact terms the shield needs.

**The trap (stated plainly):** because flags *are* blazons and the game already has a blazon composer, a naval
feature risks becoming "the shield bench, flag-shaped." The shared grammar is **engineering synergy** (near-free
rendering, one validator, a teaching on-ramp) — the *novelty* still has to come from the naval verbs.

### Renderer feasibility

- **Clean today** (single division/ordinary the shield renderer likely already draws): E (*per fess*), H/K
  (*per pale*), M/V (*a saltire*), O (*per bend*), R/X (*a cross*), N (*chequy*), Z (*per saltire*), L/U
  (*quarterly*), P (*a square/plate*), F (*a lozenge*).
- **Needs one new primitive — stripes** (*barry / paly*): C, D, G, Y (and W).
- **Needs one new primitive — swallowtail / pennant / burgee outlines**: A, B (and the numeral pennants, if
  ever used).

So a first pass can start entirely with the "clean" flags at near-zero rendering cost.

---

## 3. The omen system — three kinds

So the mast isn't purely passive flavour, omens fall into three functional buckets:

- **Ambient** — passive info about today's world (which creatures are out, a hazard, the map's shape). No
  action required; it rewards the player who *reads*.
- **Event** — something to respond to for a reward (a rescue, an ailing inkling).
- **Signal** — a token the player raises to *act*, or that launches the read/decode puzzle (§5).

Delivery: the **omen-of-the-day** is just another value derived from `dayHash()` — the same machinery as the
daily map. Open question in §6: single omen vs. a small hoist of 2–3 flags per day.

---

## 4. The A–Z omen table (first-draft proposal)

Real meanings are the canonical International Code of Signals **single-flag** meanings (flown alone). The
in-game column is a *proposed* analogue translated into the ink/word/hunt world — **all tentative.**

| Flag | Real-world single-flag signal | Proposed in-game omen | Kind |
|---|---|---|---|
| **A** Alfa | Diver down — keep clear, slow speed | A **shy/submerged inkling** is about; dashing scares it off — approach slowly to catch | Ambient |
| **B** Bravo | Carrying dangerous goods | A **volatile inkling** roams — striking it splatters an ink-blot (minor hazard) for a bigger drop | Ambient |
| **C** Charlie | Affirmative — "Yes" | The **"yes" token** — confirms today's daily word *is* makeable; the affirmative in decode | Signal |
| **D** Delta | Keep clear — maneuvering with difficulty | A big **lumbering inkling** blunders across a screen; give it room or it knocks letters loose | Ambient |
| **E** Echo | Altering course to **starboard** | The map **opened a new book to the east** today (navigation omen) | Ambient |
| **F** Foxtrot | Disabled — communicate with me | A **stranded inkling** can't move — reach it and spell to it to free it for a reward | Event |
| **G** Golf | Require a pilot *(fishing: hauling nets)* | A **guide is needed** to reach today's deep screen — or a garden **harvest is ready to haul** | Ambient |
| **H** Hotel | Pilot on board | Your **equipped companion earns a nav bonus** today (pairs with G) | Ambient |
| **I** India | Altering course to **port** | The map **opened a new book to the west** (mirror of E) | Ambient |
| **J** Juliett | On fire + dangerous cargo — keep well clear | A screen is **"ablaze"** today — a hazard field; brave it for rare drops or steer clear | Event |
| **K** Kilo | I wish to communicate with you | A **conversation/quest opens** — an NPC or creature wants a word from you | Event |
| **L** Lima | Stop immediately *(harbor: quarantine)* | A book is **sealed shut** today (quarantined) — cannot enter | Ambient |
| **M** Mike | Stopped, making no way | **Calm day** — spawns dormant/reduced; a safe, low-yield rest day | Ambient |
| **N** November | Negative — "No" | The **"no" token** — today's bonus set/word is *absent*; the negation in decode (pairs with C) | Signal |
| **O** Oscar | **Man overboard** | **Signature rescue event:** a letter-creature fell into the ink-sea — reach/spell it in time to save it for a prize | Event |
| **P** Papa | Blue Peter — about to sail, all aboard | **Last call:** today's map + daily goals reset at midnight — a refresh warning | Ambient |
| **Q** Quebec | Request free pratique — healthy, request entry | A normally-gated area is **open and welcoming** today (opposite of L) | Ambient |
| **R** Romeo | *(no official single meaning)* | Free design space → **safe passage / a shortcut opened** between two books today | Ambient |
| **S** Sierra | Operating astern propulsion (reverse) | **Second chance:** a rare creature you missed recently **reappears** today | Event |
| **T** Tango | Keep clear — pair trawling | A **linked pair** hunts together — a digraph duo (TH, CH…); catch them as a set | Event |
| **U** Uniform | You are running into danger | **Danger ahead** — a hazard lies on your current path (warns, doesn't block, unlike L) | Ambient |
| **V** Victor | Require assistance | A **fellow scholar needs a word** — an aid event for a reward | Event |
| **W** Whiskey | Require medical assistance | An **ailing inkling** — heal it with an adjective **potion** (ties to the dumbbell system) | Event |
| **X** X-ray | Stop — watch for my signals | **Launches the decode puzzle** — an incoming flag-hoist to read (the reverse-skill minigame) | Signal |
| **Y** Yankee | Dragging anchor | An **escapee adrift** — a creature broke loose and drifts off-screen; catch it before it's gone | Event |
| **Z** Zulu | Require a tug *(fishing: shooting nets)* | **Sowing omen** — a garden planting bonus today; or a heavy haul that needs help to bring in | Ambient |

### Cross-system hooks the table leans on

W → adjective potions · H → companions · X → the decode minigame (§5) · O → a signature timed event ·
P → the daily reset already running · Z/G → the garden. These are existing homes, not new systems.

---

## 5. Deferred / adjacent naval ideas (not omens, parked here so they aren't lost)

The omen mast is one of several naval directions explored. The others are **not** part of the tentative omen
plan but are recorded so the design space stays visible:

- **Signal Mast — hoist words with the substitute-pennant twist.** A ship carries *one* of each flag, so a
  doubled letter (BO**O**K, LE**TT**ER) forces a **substitute pennant** ("repeat the flag above"). That single
  real rule is a genuine puzzle no other Inklings system has — and it keeps hoisting from being desk-with-flags.
- **The Lighthouse — decode incoming signals (the reverse skill).** Every other system makes the player
  *produce* letters; here a ship on the horizon flies a hoist and the player **reads** it (flags → letters →
  word). Recognition, not recall. Fits the daily-seed pattern as a "signal from the sea." Flag **X** in §4 is
  the trigger hook for this.
- **Semaphore rhythm minigame** — the *other* naval system (two handheld flags, letters = arm angles): a
  timing/pose reading minigame. Freshest modality, highest art cost. Later flavour.
- **Dress ship / bunting** — completing a flag set lets the player string signal **bunting** as décor (leans on
  the existing collections/decoration track). A freebie bonus, not a headline.
- **Trade with ships** — signal a passing ship → it brings goods from a distant port. A commerce loop that is
  cleanly orthogonal to hunt→spell→library.

---

## 6. Open questions (resolve before an MVP)

1. **Where does the mast live?** Home base (always visible, low friction) vs. a new coastal/harbor screen
   (more atmosphere, more map work). Leaning home base for v1.
2. **One omen/day or a small hoist of 2–3?** A hoist is more flavourful and teaches reading order, but stacks
   effects and complicates the daily-seed logic.
3. **Starter set (don't ship all 26).** Proposed ~6 that (a) render cleanly today and (b) each touch a
   *different* system: **O** (rescue), **P** (daily-reset last-call), **Q/L** (area open/sealed), **X**
   (launches decode), **W** (heal→potion), **H** (companion bonus). Spans Ambient+Event+Signal, teaches ~5
   divisions, leaves 20 as a clean expansion path.
4. **Read-only or actionable?** Do omens ever *require* a response, or are Events always optional bonuses?
   (Leaning optional — never punish a player for not visiting the mast.)
5. **Relationship to the heraldry bench.** Explicit on-ramp (mast unlocks first, teaches tinctures, then points
   the player to the bench) or independent siblings? See §2.
6. **DEV-gate like the shield?** The Blazon Shield shipped DEV-only first; this would likely follow the same
   `IS_DEV` pattern for a first slice.
