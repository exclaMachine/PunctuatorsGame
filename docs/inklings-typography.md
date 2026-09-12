# Inklings — The Scriptorium: letter tracing & typeface collecting

**Status: SPECCED 2026-09-11. M1 (the nib engine + the stroke scorer), M2 (the faces) and M7 (the capitals)
are BUILT in the standalone bench `inklings-trace.html` — see §12. Nothing is in `inklings.html` yet; the
capture verb is unchanged in game. The skeleton alphabet now covers all **52 letters** (M7, 2026-09-12), so
capitals are no longer a blocker on M3 — see §10.**

This doc covers two things that are really one thing:

1. **How you capture an inkling** — you stop hitting it and **write it**, tracing the letter stroke by
   stroke (the Duolingo kana/hanzi gesture).
2. **What you collect by doing that** — not just the letter but **the letter in a typeface**, which makes
   the capture verb the game's typography lesson.

It **amends the core loop** in [`inklings.md`](inklings.md) (`hunt letter-creatures, attack to make them
drop a letter`) and the hunting section's "Attack-based combat (no bump-to-collect)" line. Read §9 before
touching `doAttack`.

---

## 1. The reframe

> **Inklings are caught; beasts are fought.**

Attacking stays exactly as it is for resource-creatures (Mugwump, Plot Hole, The Proofreaper, Writer's
Block). They bite, they drop materials, and all of `ATTACK`/`attack`/`reach`/`haste`, the equipment ladder,
the combat stat rungs and the bestiary kill thresholds keep hanging off them. What changes is that the
**letter**-creature — the one class where "hit it until it pops" said nothing about letters — is captured by
drawing its glyph.

Two consequences make this worth doing on its own, before any collecting:

- The two creature classes finally **mean** different things. Today both are "swing at it"; `CREATURE_HP`
  is 1, so a letter is a one-frame formality.
- You can no longer lose a letter to a swing aimed at a beast.

And one sentence carries the whole collecting layer:

> **The inkling wears a typeface. The typeface tells you which pen it was written with. Pick that pen and
> you earn the face; pick any pen and you still earn the letter.**

That is how type historians actually read letterforms — infer the tool from the stroke — so the mechanic
*is* the lesson rather than a quiz bolted onto one.

---

## 2. Settled decisions (dev's calls, 2026-09-11)

1. **A face is collection only.** A traced `q` is plain `q` on the bench — same `state.inv` slot, same
   spelling, same dictionary. Faces are a second, orthogonal collection. (Rejected: faces as letter
   *variants* with bench effects — it multiplies inventory slots for no teaching.)
2. **Nib-only for v1.** One shared skeleton alphabet; a face is a **nib**, not a new set of 26 drawings.
   See §3 — this is the decision the whole plan hangs on.
3. **The player picks the nib, guided at first.** A three-rung fade from "the game names the pen" to "read
   the letterform yourself" (§5.4).
4. **We do not draw the faces.** Real public-domain / libre fonts supply the **specimens and the field
   glyphs**; the dev hand-draws nothing beyond the single skeleton alphabet that already exists (§4).
5. **Faces are grouped like WordNet groups words** — and the taxonomy already exists: a pruned
   **Vox-ATypI** tree, where every group *is* a pen (§6). The grouping is the teaching.
6. **Italics and bold are later** — and they are a **style axis**, not more faces, so §7's data shape
   leaves room for them now and §11 spends nothing on them yet.
7. **Failing a trace never costs you the day.** Retry freely. A daily no-respawn map makes permanent loss
   far too punishing, and letters are the economy.
8. **A cell keeps your personal best; there is no re-trace button.** The album stores the best grade ever
   scored on that letter in that face (and later, that style), so the collection records you **getting
   better at handwriting** rather than just owning a set. The way to beat your record is to meet another
   inkling of that letter in that face — which tomorrow's map supplies. (Rejected: paying ink to re-trace
   from the album. It makes the record a shop transaction, and §8.1 shows the free version is strictly
   better.)
9. **One face per screen, not per creature.** A screen reads as a *place with a hand* rather than a sampler,
   and the classification guess is made once when you walk in instead of once per creature — which is the
   right pace for §5.4's guidance ladder.

---

## 3. Why we don't draw the faces: one skeleton, many nibs

A typeface's stroke contrast is not decoration — it is a record of the tool. A broad nib held at a fixed
angle writes thick when it moves across its edge and thin when it moves along it; that single fact produces
the **angled stress** of Humanist and Garalde faces and, at a steeper angle, blackletter. A pointed flexible
nib spreads under pressure, which falls on the downstroke, producing the **vertical stress** of
Transitional and Didone faces. A round monoline nib has no contrast at all, which is the whole of
**Lineal** (sans).

So: **trace the shared skeleton, stamp a nib along the path, and the face falls out of the pen.** Three nib
types cover the entire classification spine:

| Nib type | Width rule | Stress it produces | Vox groups |
| --- | --- | --- | --- |
| `round` | constant, w == h | none (monoline) | Lineal (all), Mechanistic |
| `broad` | rect of `w`×`h` held at a **fixed absolute `angle`** | angled — thin where travel is parallel to the edge | Humanist, Garalde, Blackletter, Uncial |
| `pointed` | width scales with how vertical the travel is (pressure on the downstroke) | vertical — hairline horizontals | Transitional, Didone, Script |

Stamping is the cheap, physically honest renderer: sample the traced path, stamp the nib quad at each
sample at its **pen angle** (absolute, *not* tangent-relative — tangent-relative is the mistake that makes
every stroke the same width and erases the lesson).

**What a nib cannot express, and what we do about it.** Serifs are not a nib property — they are a finishing
gesture at the stroke end — so a traced Didone is a *skeleton in Didone's pen*, with the right stress and
the wrong terminals. That is fine, because:

- the **specimen page shows the real font** (§7), so the thing you are comparing against is genuine;
- the traced result is explicitly *your hand*, which is the more interesting artifact to collect;
- and a later `terminal:` knob can stamp a slab or bracketed serif at stroke ends — a short perpendicular
  stroke at each endpoint, which is the next cheapest thing after the nib. **Not v1.**

**Nib data shape** (`data/nibs.json`, hand-written, 10 entries as built):

```json
{ "id":"broad-30", "name":"Broad 30°", "type":"broad",
  "w":0.150, "h":0.032, "angle":30, "price":120, "groups":["humanist"] }
```

Widths are in **em units**, matching the skeleton alphabet's coordinate space (§5.1). `groups` is a **list**,
not the single string this section first sketched, because of one honest consequence: **`round-mono` writes
all three Lineal leaves.** A monoline has no stress to vary, so the sans branch is not a pen distinction at
all — grotesque, geometric and humanist sans are told apart by *proportion*, which the shared skeleton
cannot express either. The three faces are therefore one pick, and the album's difficulty there lives in the
letters rather than in the tool. That is the §3 engine being truthful rather than a gap to paper over, and
it is the reason the nib file names groups *and* the group file names nibs: the bench asserts the two agree
at boot (`indexFaces`), so an edit to one that forgets the other fails loudly instead of rendering a wrong
label. `price` is the §7 ink gate; a nib with an empty `groups` (`round-bold`) writes no face and is in the
file only so §11's *bold is a wider nib* claim is visible in the bench before the style axis exists.

---

## 4. Licensing, and why the safe answer is the better answer

The dev asked about Papyrus specifically. Short version: **you can't ship Papyrus, and the blocker is the
file and the name, not the letterforms.**

- **Letterform designs**: not copyrightable in the US (37 CFR §202.1(e); *Eltra v. Ringer*). The UK's
  25-year typeface design right on a 1982 face has long lapsed.
- **The font file**: copyrighted software with a EULA. Never ship it.
- **The name**: a trademark ("Papyrus" is Monotype's). This is the live risk and the cheapest to avoid.

So the standard industry route is open — redraw/rename, the way Arial is to Helvetica — and it is
*especially* clean for Papyrus, which is itself an imitation of reed-pen-on-papyrus writing that has been
public domain for three thousand years. **You want the referent, not the 1982 interpretation**, and in a
repo this pun-happy an in-game name is better anyway (*Reedmarsh*, not *Papyrus*). Not legal advice, but
hand-drawn-and-renamed is well-trodden.

**The upside, and the reason this improves the feature:** the faces that are unambiguously free are also
the ones that *teach*. Every pre-1900 face is a lesson in the classification spine (§6) — Garamond's angled
stress, Baskerville's turn toward the vertical, Bodoni's hairlines, Clarendon's slab, Akzidenz's first
sans. Papyrus and Comic Sans teach nothing but their own overexposure.

**This also answers Wordshape's open licence question** ([`wordshape.md`](wordshape.md) §6 route A): the
**Hershey fonts are public domain** (Allen V. Hershey, US Naval Weapons Laboratory; the NIST distribution
asks only that you credit Hershey and note modifications). They ship Simplex, Script and **Gothic-English
(blackletter)** as *stroke polylines* — so Hershey is both a free specimen source and, later, a second
skeleton source. One caveat: Duplex/Complex/Triplex fake weight with parallel strokes, so they are fine as
looks and useless as skeletons.

### 4.1 The faces, as shipped (M2, 2026-09-12)

One face per classification leaf, every one OFL, fetched by **`./fetch-typeface-fonts.sh`** into `fonts/`
beside its licence text. The two leaves the spec left open are closed:

| Leaf | Face | File | Bytes |
| --- | --- | --- | --- |
| Humanist (Venetian) | Cardo | `fonts/Cardo-latin.woff2` | 15.5 KB |
| Garalde | EB Garamond | `EBGaramond-latin.woff2` | 23.8 KB |
| Transitional | Libre Baskerville | `LibreBaskerville-latin.woff2` | 20.1 KB |
| Didone | Libre Bodoni | `LibreBodoni-latin.woff2` | 15.7 KB |
| Mechanistic (slab) | Bitter | `Bitter-latin.woff2` | 18.5 KB |
| Grotesque | Archivo | `Archivo-latin.woff2` | 14.6 KB |
| Geometric | Jost* | `Jost-latin.woff2` | 9.4 KB |
| Humanist sans | Open Sans | `OpenSans-latin.woff2` | 13.5 KB |
| Blackletter (Textura) | UnifrakturMaguntia | `UnifrakturMaguntia-latin.woff2` | 22.4 KB |
| Uncial / Insular | **Uncial Antiqua** | `UncialAntiqua-latin.woff2` | 19.6 KB |
| Script | **Pinyon Script** | `PinyonScript-latin.woff2` | 28.1 KB |

- **Uncial Antiqua** (Tom Murphy 7) answers §13's open question 2 — Junicode was the lead but isn't on
  Google Fonts, so it has no ready latin subset, and Uncial Antiqua is a truer uncial anyway: round
  majuscules from a near-flat pen, and no case distinction, which is a lesson of its own.
- **Pinyon Script** replaces §4's "Hershey Script" for the *specimen* slot. Hershey is still the right
  answer for a second **skeleton** (it is polylines, which is what a skeleton must be), but a specimen has
  to be a real font file, and a 19th-century engraved roundhand shows the pointed pen's swell-and-release
  far better than Hershey's monoline script does.
- **Weight, as built: 201 KB for all eleven** — Google's own latin subsets, which is the zero-tooling path.
  The script cuts each to the 52 Latin letters (the doc's ~5 KB/face, ~70 KB total) **if `pyftsubset` is on
  PATH**, so `pip install fonttools brotli` then a re-run shrinks them with no script change. Nothing in
  the game behaves differently either way.

**Conventions to follow** (the repo already does this): the woff2 plus its licence text side by side in
`fonts/`, as `fonts/PixelifySans-latin.woff2` + `fonts/PixelifySans-OFL.txt` already do, and a credits
entry alongside `sounds/CREDITS.md`. OFL adds two obligations worth stating in the doc: keep the licence
file, and **don't reuse a Reserved Font Name on a modified copy**.

**Weight:** subset each face to the 52 Latin letters — a few KB of woff2 each, so eleven faces is smaller
than one animal sample. Load them with the **FontFace API, not CSS**, and only the faces today's map
actually spawns (plus whatever the Scriptorium is showing), because `inklings.html` is already 748 KB and
the field needs its faces *before* the first frame draws. Until a face resolves, the existing `Alpha.png`
stamp is the fallback — so a missing or slow font degrades to today's art rather than to tofu.

---

## 5. The tracing mechanic

### 5.1 The data already exists

Duolingo-style tracing needs per-glyph **ordered strokes with direction** — that is all KanjiVG is. The
Wordshape drawing tool already stores exactly that (`wordshape-draw.html:271`):

```js
out.set(ch, { w, strokes, len, cx, cy })   // strokes = ordered array of ordered polylines
```

…and the authored comment on `e` reads *"one stroke: the bar left-to-right, then up and over and round —
**the way a hand draws it**."* Stroke order was authored by hand, for handwriting reasons, before anything
needed it. The hard data problem is already solved for the one skeleton set v1 needs.

**Shared, not copied:** the tool already exports `wordshape-alphabet.json`, so that file lands in `data/`
and **both games load it**. One alphabet, one stroke order, one place to fix a glyph. (The alternative —
Inklings keeping its own copy so the two can drift — buys nothing; they want the same letters.)

### 5.2 Scoring (per stroke, which is *not* Wordshape's scorer)

Wordshape's chamfer field asks "is ink near the lines" and is order-blind by design. Tracing needs order,
direction and start point, and is the simpler check of the two:

- Resample the player's stroke and the ideal stroke to **N points by arc length** (N ≈ 32).
- **Fidelity** = mean point-to-point distance, normalised by the em.
- Gates: start within `START_TOL` of the ideal start; overall travel direction agreeing in sign with the
  ideal's; strokes completed **in order**, none skipped.
- The letter's grade is the mean of its strokes' fidelities.

Wordshape's field stays useful as an optional whole-glyph check at the end, and for nothing else.

### 5.3 Feel (most of the work)

- **Snap — partial, not Duolingo's hard snap** (settled building M1). Duolingo lands every accepted stroke
  exactly on the ideal, which is the right call when the glyph is a means to an end. Here it isn't: §7's album
  shows **your** traced glyph, so a hard snap would make every player's album byte-identical and the
  collection would be a tick-list wearing a drawing. The bench therefore blends the traced points toward the
  ideal by **snap × fidelity** — a clean stroke lands on the line, a scruffy one stays scruffy, and the jitter
  of a finger goes either way. Default 0.65, and it is the knob most worth arguing about on a phone.
- **Ghost hint.** After a failed stroke, animate the ideal stroke once, head to tail. Never show the
  animation before the first attempt — that is a demo, not a game.
- **One stroke at a time**, with the completed strokes staying inked, so the glyph builds.
- **In-world, not a modal.** The field already freezes creatures while a dialog is open; trace over the
  creature's own position. A full-screen overlay for a one-second gesture is churn.
- **Touch is the better input** (a finger drag is the real gesture); on desktop the player is standing
  still, so a mouse drag on the canvas is free.
- Budget: a `l` is a flick, a `g` is two strokes and a real motion. **Sub-two-seconds for common letters**
  is the bar, because this fires 20+ times a day.

### 5.4 The nib pick, and the guidance ladder

The inkling is drawn **in its face** (§8), so the stress is visible before you commit. The dev's call is
that the player picks the pen, guided at first — three rungs, gated on **faces collected** (the
subsystem's own curve, not word count):

1. **Named.** The game selects the right nib and says so ("broad quill, 30°"). Pure tracing; no
   classification yet.
2. **Cued.** The nib is yours to pick, but the creature carries a small **stress mark** — the thick/thin
   axis drawn as an angle tick — so the tool is inferable from a visual cue.
3. **Cold.** The letterform only. The Scriptorium (§7) is the reference you go and consult.

A **`?` peek** is always available and always costs the same thing: it names the pen and **forfeits the
face for that capture**. You still get the letter. (No ink price — the cost is already the interesting one.)

**Built in the bench at M2**, all three rungs reachable by button so each can be looked at, with the rung
the album *would* put you on shown beside them (`< 2 faces → named`, `< 5 → cued`, else cold). The cued
rung's stress mark is drawn from the nib and nothing else: a broad pen's own edge angle, a pointed pen's
horizontal (the direction it writes thin), and for a round pen **no tick at all** — the absence is the cue,
and it says *sans* as loudly as an angle says *blackletter*.

### 5.5 FIXED — the authored stroke directions were backwards (found playing M1, fixed 2026-09-11)

**Fixed the same day, in `wordshape-draw.html`'s `raw` table. Data only — no engine change, since the
scorer reads direction off the polyline.** The bench worked; the alphabet it traced was wrong, in two
separate ways, and the bench is what made them visible.

**(a) Every closed bowl started at 3 o'clock and ran clockwise.** Seven glyphs shared one expression —
`a b d g o p q` all used `A(0.30,0.48,0.24, 0, 360)`, which begins at `(0.54, 0.48)` (the rightmost point)
and **increases**, i.e. sweeps clockwise on screen and travels *down* first. No hand writes an `o` that way.
The give-away that it was an oversight rather than a choice: **`c` and `e` were already correct**
(`A(…,-55,-305)` and `A(…,0,-305)` — decreasing, so counter-clockwise). The open curves went the natural way
and the closed bowls went the other, which no deliberate scheme would do.

**(b) `f` was mirrored.** `f: J([[0.44,0.72],[0.44,0.21]], A(0.25,0.21,0.19, 0, -135))` — the arc's centre
(`x 0.25`) sat to the **left** of the stem (`x 0.44`), so the hook swept out to `x 0.116`: the top curve
pointed left, where an `f`'s hook must point right. The same stroke also ran **baseline → ascender**
(`0.72 → 0.21`), where an `f` is written from the top of the hook downward.

**Why it mattered more than it looked.** Direction is not decoration here — §5.2's gate *refuses* a stroke
that runs against the ideal. So as it stood the bench **rejected the natural motion and rewarded the
unnatural one**, and a game shipped on that data would actively teach the wrong hand.

**Why nothing caught it earlier:** Wordshape's scorer is an order-blind chamfer field (§5.2) — stroke
direction is *invisible* to it, and the glyphs score identically either way. Tracing is the first consumer
that can see direction at all, so M1 was always going to be where this surfaced.

**As fixed.** The convention is now written into the table above the glyphs, because it is the one property
of this data that nothing in Wordshape can check:

- **A bowl that meets a stem starts and ends AT the stem** — angle `0` for the right-stemmed `a`/`d`/`g`/`q`,
  `180` for the left-stemmed `b`/`p`. A free `o` starts at 2 o'clock (`-55`), like `c`. This is what the note
  meant by wanting a per-letter start angle rather than one shared edit.
- **Bowls run counter-clockwise** (`0,-360`) — **except `b` and `p`** (`180,540`, clockwise). Their bowl is
  drawn *after* the stem, and the hand leaves the stem at 9 o'clock and pushes right and over. That
  asymmetry is the real reason the seven letters could not share one expression: the direction of a bowl
  follows which side of it the stem is on.
- **`a` keeps the dev's reading** — a single-storey `a` does begin near the right, and angle `0` *is* the
  right. It simply turns counter-clockwise from there now.
- **`f` is one stroke from the hook's tip down into the stem** — `A(0.43,0.21,0.15, 315,180)` then the stem
  `0.21 → 0.72` — hook to the right, with the stem moved to `x 0.28` and the crossbar to `0.06 → 0.50` so
  the mirrored hook still sits inside the glyph's `0.62` advance.
- **The `i`/`j` dots turned counter-clockwise too**, so nothing in the alphabet runs clockwise except those
  two stem-attached bowls.

**Re-reading the rest of the table with the same eye found nothing else wrong**, which was the other half
of the job: the `h`/`m`/`n`/`r` shoulders correctly run left→over→right (clockwise, `180,360`), `u`
correctly runs left→under→right (`180,0`), `e` starts at its bar and sweeps counter-clockwise from it, `k`
draws its arm inward and its leg outward, `s` starts at the top right, and every stem, diagonal and
descender already ran top-down. `g`'s and `j`'s tails already hooked the right way.

**The fix reaches the bench for free**: `data/wordshape-alphabet.json` does not exist yet, so
`inklings-trace.html` slices the `GLYPHS` block live out of `wordshape-draw.html` (§12) and picks the
corrected table up on reload. Re-export the JSON only after the dev's shape-tuning pass, or it will pin a
stale alphabet.

### 5.6 Outcomes

| | Letter | Face |
| --- | --- | --- |
| Right nib, clean trace | ✅ | ✅ at grade |
| Right nib, sloppy trace | ✅ | ✅ at a lower grade, or below `FACE_TH` nothing |
| Wrong nib type | ✅ | ❌ — the look is wrong |
| Right type, angle off by > `ANGLE_TOL` | ✅ | smudged grade |
| Abandoned mid-trace | ❌ (creature stays) | ❌ |

**The letter is earned at any grade** once the strokes are done. The economy must never stall on a
typography lesson.

---

## 6. The classification tree (the WordNet analogue)

The dev asked whether faces can be grouped the way WordNet groups words. They can, and the taxonomy is
already standard teaching material: **Vox-ATypI** (Maximilien Vox, 1954; adopted by ATypI 1962). It is a
tree, it is prior art rather than invention, and — crucially — **every group is a pen**, so §3's nib and
§6's classification are the same information seen twice.

```
Classical
  Humanist (Venetian)    broad nib ~25–30°   heavy angled stress, slanted e-bar
  Garalde (Aldine)       broad nib ~20–25°   angled stress
  Transitional (Réale)   pointed nib         stress turning vertical
  Didone                 pointed nib         vertical stress, hairlines
Mechanistic (slab)       round nib           monoline + slab terminals
Lineal (sans)
  Grotesque              round nib           monoline, slight contrast
  Geometric              round nib           compass forms
  Humanist sans          round nib           calligraphic proportions
Calligraphic
  Blackletter (Textura)  broad nib ~40–45°   steep, broken curves
  Uncial / Insular       broad nib ~10–15°   flat pen, round forms
  Script                 pointed flexible    joined
```

Eleven leaves × 26 letters = **286 cells** — a real but finishable album, in the same order of magnitude
as the atlas's 475 spellable names.

**Pruned on purpose:** Vox's *Glyphic* and *Graphic* are grab-bags, and *Gaelic* / *Non-Latin* are a tail
this game can't teach with a Latin skeleton; ATypI itself deprecated the scheme in 2021, partly for that
Latin-centrism. The doc should keep saying out loud that this is a **teaching simplification**, the same
way the ladder corpus's rungs are.

**The UI is already built twice.** A branch-by-branch tree of circles is
[`punctuators-ladder.md`](punctuators-ladder.md) §13's Tree of Kinds, and fraction-keyed milestones at
25/50/100% of a branch are [`inklings-atlas.md`](inklings-atlas.md)'s continent milestones. The Tree of
Faces is the third use of one pattern, which is why it is M5 and not a risk.

---

## 7. The collection: the Scriptorium

`state.dex` collects words. This is a second, orthogonal grid — **26 letters × 11 faces** — and the right
artifact for it is the thing the trade already has: a **type specimen sheet**.

- **The album.** A letter × face grid; a filled cell shows *your* traced glyph, not the font's.
- **The plate.** A page per face: date, origin, classification, the real font set large — and the
  **anatomy terms called out on the letterforms you personally traced** (stress axis, bracket, terminal,
  x-height, aperture). This is where the typography is actually taught; the capture is just the reason
  you're here.
- **Grades are personal bests.** A cell holds the best grade ever scored there, shown as a percentage, with
  the delta called out when you beat it (`best 82% → 91%`). So the album is a record of your hand improving,
  not just a set you own — which is the whole argument for grading a trace at all.
- **Milestones** at 25/50/100% of a face's 26 letters, and a bigger one per completed **group**, paying
  **ink + décor** exactly like the atlas's continents. The décor writes itself: a **framed specimen sheet**
  for the Wordhoard, through the existing placement primitive
  ([`inklings-placement.md`](inklings-placement.md)). **Capitals get their own fraction, not a bigger
  denominator** — see §10.5, where folding them in would silently un-fire a milestone that has already paid.
- **Nibs are the progression gate.** You buy or craft a nib at the Stall with ink, and a face whose nib you
  don't own is uncatchable-as-a-face (the letter is always catchable). That reuses the shop and gives ink a
  new sink without inventing an economy.

**Save shape** (`state` additions; the Sound Board took v12, so this is **v12 → v13**):

```js
state.faces = { "<faceId>": { "<letter>": { g: grade, s: strokes } } }
state.nibs  = ["round-mono", "broad-30", …]           // owned
state.nib   = "broad-30"                              // equipped
```

Faces are persistent and uncapped, like `state.caps` — never day-scoped. The letter key is a **character**,
so `"A"` and `"a"` are already separate cells and capitals (§10) need no migration.

**A cell keeps the PATH, not only the grade** — amended while building M2, and it follows from this
section's own first bullet: *a filled cell shows your traced glyph, not the font's*, which is impossible if
all a cell holds is a number. So the album stores the accepted strokes, **resampled to 16 points per stroke
and rounded to 3 dp**, which is all a 150 px album cell can resolve; raw pointer paths are ~5× the bytes for
a picture that size. Budget: ~320 bytes a cell, so a hypothetical complete 26×11 album is **~92 KB** — real,
but the same order as the atlas, and it is the only version of the album that is worth owning. It also
interacts with decision #8 exactly as it should: beating a cell's best **replaces the drawing**, so the
album is a record of your hand and not a list of scores.

---

## 8. How a face reaches the world

- **The face is a property of the screen.** Every inkling on a screen wears the same face, rolled from the
  day's per-screen RNG the way its creatures and letters already are — so it is deterministic, needs no
  stored state, and costs the day-total math nothing.
- **Which face a screen wears = which book you're in.** Genre books already exist in the roadmap to weight
  *letters* (a sci-fi book is rich in Q/X/Z). Now a sci-fi book's screens are Geometric and a history book's
  are Blackletter — which finally gives books the "reason to choose one over another" that
  [`inklings.md`](inklings.md) decision #5 is after. Until books exist, weight the face by **distance from
  home** the way rarity already is.
- **It makes the map matter.** "I need `k` in Didone" becomes a place to walk to rather than a die to re-roll,
  and it lets the screen wear its hand in its own chrome (a specimen mark in the corner, or the paper stock)
  — optional, and easy to overdo.
- **Font loading gets easy.** One face per screen means one subset per screen: load on screen entry,
  prefetch the four neighbours, fall back to the `Alpha.png` stamp until it resolves.
- **Rarity multiplies for free.** A `q` in blackletter is rare twice over, with no new tuning table.
- **The field glyph is drawn with the real font** — `ctx.font` with the loaded face, falling back to the
  `Alpha.png` frame (`SPRITESHEET.letterToFrame`, `drawGlyphTo`) until it resolves. The creature shows you
  the face; the skeleton you trace is shared. That division is what makes nib-only v1 honest.
- **Capitals** keep their own rules verbatim — they bank in `state.caps`, uncapped, bypassing the satchel —
  and they are the natural home for the faces whose **capitals are the lesson** (Roman inscriptional
  capitals, blackletter's ornate majuscules). **The skeleton covers them since M7 (§10), so M3 inherits a
  trace pad that works for all 52 letters** — but the satchel gate still keeps its `!isUpper(c.letter)`,
  which is load-bearing for its own reason (§10.8).
- **A starter face.** Early game must not demand classification, so the first face is **the bare monoline
  skeleton itself** — "the hand you already write in" — with the round nib owned from the start. Faces then
  unlock on a curve, the way capitals do at `LOWER_DONE_AT`. v1's tracing *is* the tutorial; the collection
  opens later.

---

### 8.1 Why personal bests solve the duplicate problem

Once you own `e` in Garalde, an `e`-in-Garalde inkling would otherwise be collection-dead — you'd catch it
for the letter and the typography layer would have nothing to say. A personal best gives **every duplicate a
reason to exist**, for free and forever: the commonest letters in the commonest faces, which is most of what
a day's map holds, are exactly where you get enough repetitions to visibly improve. That is also the honest
way to teach a motor skill — you don't learn a hand by writing each letter once.

It also means the **one-face-per-screen** rule doesn't starve the album: a screen you've "finished" still
offers practice, so the pressure to re-roll the map away from a face you already own never appears.

## 9. What this changes in the existing code

The letter branch of `doAttack` (`inklings.html:3813`–`3830`) is the whole surface. Everything it does
moves to the trace's success path — and it is easy to move one of these and forget another:

| Today, in `doAttack` | After |
| --- | --- |
| `if(full && !isUpper(c.letter))` satchel block | moves to the **trace-open** check, capital bypass verbatim — and the same check carries §10.2's `isUpper` fallback until the capital skeleton exists |
| `state.caps` / `state.inv` grant | trace success |
| `state.fx.push({text:"+"+letter})` | trace success |
| `state.bonus` filter (an unlocked bonus letter) | trace success |
| `state.captured.add(c.id)` | trace success — **this is what makes the day's map honest** |
| `recordBestiary("inkling")` | trace success |
| `SFX.play("capture")` | trace success, plus new cues (§12) |
| `maybeNotifyCleared()` | trace success — the all-cleared banner/chime hangs off this call site |

Also:

- **Opening the trace**: the action key near the creature, reusing the `E`-to-use-bench / `tileInFront`
  idiom, **not** a swing. Recommended over a swing because it is the same gesture as every other "interact
  with this thing" in the game, and it retires the accidental-letter-kill case entirely.
- `CREATURE_HP = 1` becomes cube/resource-only; the comments at `inklings.html:1889` and the `ATTACK_STEP`
  comment at `:2609` both name it and go stale.
- **Six overlay guards**, the same six the Sound Board had to join (`:3537`'s key handler, `:3955`, `:4041`
  `canBeHurt`, `:4090` `hintReady`, `:4112`, plus `closeAnyDialog`) — a new `state.tracing` must be added to
  all of them. This is the edit that gets half-done.
- The `competition` stat ladder's attack rungs stop touching letter capture (they barely did — `CREATURE_HP`
  is 1). No migration, but the stats panel copy may need a word.
- `data/wordshape-alphabet.json`, `data/nibs.json`, `data/typefaces.json` and the `fonts/` subsets are new
  fetches — all local files, consistent with the existing data-file exception.

---

## 10. Capitals: the second alphabet

**Status: BUILT 2026-09-12 as M7** — the skeleton, the metric line, the case layer in the bench, the
second fraction and the plate copy. Everything below stands as specced; what the build changed or settled
is recorded in **§10.10**. M3 no longer owes the fallback in §10.2, because the capitals landed first.

### 10.1 The finding

**We do not have capitals.** The skeleton is 26 glyphs, `a`–`z` (`wordshape-draw.html`'s `GLYPHS`, the
table §5.5 fixed the directions of, exported as `data/wordshape-alphabet.json`). A capital inkling has
nothing to trace.

Everything *around* the skeleton already handles them, which is why this is a small milestone rather than a
second feature:

- **The specimens already carry capitals.** `fetch-typeface-fonts.sh` subsets each face to
  `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz` — all **52** letters, on purpose — so the plate,
  the four-cell specimen strip and the field glyph can already draw `A` in all eleven faces today. No font
  work, no refetch.
- **The save shape already holds them.** §7's `state.faces[faceId][letter]` is keyed by *character*, so
  `"A"` and `"a"` are already different cells. Capitals cost **no save migration and no version bump** —
  they are keys that have never been written.
- **The glyph table is a `Map`**, keyed by character in both games, so `"A"` is a free key there too.

The whole missing artifact is **26 capital skeletons**.

### 10.2 Why M3 can't ship without a decision here

Capitals are not a hypothetical letter class — they are live game content:

| Today, in `inklings.html` | |
| --- | --- |
| `isUpper(l)` (`:1902`) | the class exists at the type level |
| `state.caps[C]++`, uncapped, **bypassing the satchel** (`:3813`–`3819`) | a full satchel never blocks one |
| `capUnlockAt(i)` after `LOWER_DONE_AT` (`:1917`–`:1925`) | they unlock one at a time, deep into the game |
| `w *= (0.35 + dist*0.5)` (`:2915`) | rare, and skewed far from home |
| the hoe's `UPPER_DROP_CHANCE` bank (`:7455`) | a second source |
| the Atlas's **daily capital letter** ([`inklings-atlas.md`](inklings-atlas.md)) | a capital you go and *hunt* |

§9 moves the entire letter branch of `doAttack` onto the trace's success path. So on the day M3 ships, a
capital inkling opens a trace pad with **no glyph in it**, and the atlas's daily hunt dead-ends. That is not
a polish item; it is the feature removing content the game already has.

**M3's obligation, whichever way the rest of this section is built:** either the capital skeleton exists by
then, or **capitals keep the old verb — hit to catch — until it does.** Recommended: the interim, written as
one explicit `isUpper` branch on the *trace-open* check (not scattered through the success path), so the
fallback is a single condition and deleting it is most of this milestone's wiring.

**RESOLVED 2026-09-12: the skeleton exists, so M3 owes nothing.** M7 shipped ahead of M3, which is the
better order — the fallback branch never has to be written, and therefore never has to be found and
deleted later.

### 10.3 Why capitals are the best content in the feature, not a chore

Minuscules are **Carolingian** — a pen, on parchment, 9th century. Capitals are **Roman inscriptional** —
a flat brush, then a chisel, on stone, 1st century. Eight hundred years and a different tool apart, which is
*why* a capital is not a big lowercase. That is this feature's own thesis — **the tool makes the
letterform** — told a second time at a scale the player can't miss, because the two alphabets sit next to
each other inside every single word.

Two things fall out that a player can feel while tracing and cannot read off a page:

- **A Roman capital's serifs are the brush's entry and exit**, not decoration added afterwards.
- **Classical capitals are a width system.** O/Q are circles, H/N/A/V are near-square, E/F/L/S/B are narrow,
  M/W are wide. Trajan's alphabet is that system; minuscules are far more uniform in width. Tracing is the
  one interface that teaches proportion by making you *travel* it.

### 10.4 The skeleton (the build unit)

- **One capital skeleton, 26 glyphs, authored in the Wordshape drawing tool** exactly as the lowercase were,
  exported into **the same `data/wordshape-alphabet.json`** under upper-case keys. One alphabet file, both
  games, one place to fix a glyph — §5.1's rule, unchanged.
- **It is a cheaper pass than the lowercase one, and countably so.** Fifteen capitals are *straight lines
  only* — `A E F H I K L M N T V W X Y Z` — against eleven that carry an arc (`B C D G J O P Q R S U`), and
  the arcs are mostly one shape reused: `B P R` share an upper bowl, `C G O Q` share a ring, `D` is that
  ring's right half, `U` a half-ring, `J` a hook. Only `S` is unique. Compare `a`–`z`, where nearly every
  letter carries a curve of its own.
- **A new metric line: cap height.** The em already names ascender `0.02`, x-height top `0.24`, baseline
  `0.72`, descender `0.96`. A capital stands on the baseline and reaches **cap height, which sits *below*
  the ascender in virtually every real face** (≈0.70 em against ≈0.75). Against this alphabet's 0.70
  ascender reach that is ≈0.65, i.e. **y ≈ 0.07** — so `l` visibly overshoots `L`, as it should. The bench's
  metrics overlay gains a fifth line — **built**, and the `cap` line is drawn between `asc` and `x`.
  **This is the most visible possible thing to get wrong**: capitals drawn up to the ascender make every
  face look broken in the four-cell specimen, because the real font beside them has a true cap height.
- **Direction is data here too** (§5.5). The same rule, applied: stems run top→bottom; `O` runs
  counter-clockwise from 2 o'clock like `o`; `A` is left diagonal, right diagonal, then the bar; `E` is the
  stem then three bars top→bottom. Authoring capitals without the direction rule in hand would repeat
  exactly the defect §5.5 had to go back and fix.

### 10.5 What a capital cell is

- **The album gains a case toggle, not a doubled grid.** The view stays 26×11; an `Aa` switch flips which
  alphabet you are looking at. A 52-row grid would be unreadable on a phone and would misstate the goal —
  these are two collections, not one long one.
- **Milestones get their own track, and this is the migration trap.** Fold capitals into §7's *25/50/100% of
  a face's 26 letters* and a player who has already 100%'d Garalde **drops to 50% the moment the update
  lands**, un-firing a milestone that has already paid out ink and décor. So a face carries **two
  fractions** — 26 minuscules, 26 majuscules — plus a third, larger **completed face** milestone at both.
  The same rule then applies upward to §6's group milestones.
- **The plate shows both.** Anatomy callouts are per-letter already (`{term,letter,note}` in
  `data/typefaces.json`), so a capital-only term — *the inscriptional serif*, *cap height*, the width
  classes — is a new callout row and nothing more.

### 10.6 The faces, honestly

Three of the eleven have no clean Roman-capital story, and saying so *is* the teaching:

- **Uncial has no case at all.** `data/typefaces.json`'s plate already says this, and §4.1 chose Uncial
  Antiqua partly for it. Its "capitals" **are** its letterforms: trace the same skeleton, and the album shows
  `A` and `a` as the same drawing. Don't special-case Uncial *out* — special-case it *in*, with the plate
  naming the result. It is the cheapest option and the correct one.
- **Blackletter capitals are a different alphabet.** Textura majuscules are ornate, built from bowed strokes
  and hairline flourishes; they are not the Roman skeleton under a 45° pen, and under nib-only v1 they come
  out Lombardic-ish rather than correct. **Ship them on the shared skeleton and say so on the plate**, and
  park a true blackletter majuscule skeleton next to §11's true italic — it is the same category of thing: a
  second skeleton, which is the lesson.
- **Script capitals** are swash and joined. The pointed nib does most of the work and the shared skeleton is
  a fair approximation — lower risk than blackletter, and worth a plate line either way.

### 10.7 The nib, and what capitals add to the shop

- **Capitals need no new nib to ship.** Roman capitals were laid out with a flat brush at a **shallow angle**
  (≈0–15°), which is why their stress is near-vertical and their serifs are entry and exit marks — that is
  `broad-10` / `broad-20` territory, nibs the uncial and garalde faces already use.
- **But they are the natural home of one.** A **flat pen at 0°** — the signwriter's brush — is a one-line
  addition to `data/nibs.json` that produces a visibly Trajan-ish capital and a visibly *wrong* minuscule.
  That pairing is the cleanest demonstration in the whole feature that a tool and an alphabet belong to each
  other, and it costs a row of data.
- **No new stamper.** The chisel is not a pen, and modelling one would break nib-only v1 for the sake of one
  alphabet. Parked.

### 10.8 How a capital reaches the world — unchanged

Capitals already roll rare, skew far from home and unlock one at a time late in the game. So capital tracing
is **end-game content with no new gating** — §8's "faces unlock on a curve" is already in the code, for
capitals specifically. Two consequences worth naming:

- Because `state.caps` bypasses the satchel, a capital trace can **never** be blocked by a full satchel, so
  §9's gate keeps its `!isUpper(c.letter)` verbatim — the table row that is easiest to "tidy away" is
  load-bearing.
- §8's line that capitals *"are the natural home for the faces whose capitals are the lesson"* is now
  concrete: the Roman-capital faces and the inscriptional plate copy are where a capital hunt pays off.

### 10.9 What it costs

| | |
| --- | --- |
| 26 glyphs in the Wordshape tool | the dev's hand; the 15 straight-only ones are quick |
| One metric line + one constant | cap height, in the alphabet and the bench overlay |
| A case toggle in the album | one control, no new view |
| A second fraction per face | the milestone code, and the migration trap in §10.5 |
| New fetches | **none** |
| Save version bump | **none** |
| Font work | **none** — all 52 letters already ship |

### 10.10 As built (2026-09-12)

Everything in §10.9's cost table came in at the estimate: no new fetches, no save bump, no font work. Two
notes on scope before the findings. The 26 glyphs were **authored directly into the `GLYPHS` table** in the
same arc-and-point style as a–z rather than mouse-drawn — the table *is* the tool's output format, and the
shapes stay the dev's to tune in `wordshape-draw.html` afterwards. And §10.5's `Aa` toggle landed on **the
bench's letter picker**, because the album itself is M4; when the album is built it inherits the switch, the
`faceCells()` fractions and the `unicase` flag rather than inventing them.

What the build found or settled:

- **The 52 glyphs live in one table, and the capitals needed a tool the minuscules didn't.** An x-height
  bowl is near-circular, so `A()` (a circular arc) was enough for a–z. A capital bowl is half a cap height
  tall and *wider* than that, so **`EL()`, an elliptical arc, was added beside it** and B D P R U are drawn
  with two radii. `C G O Q` stayed true circles, which is the width system's own claim.
- **The direction rule generalised without amendment.** Stems top→bottom, bars left→right, the free ring
  (`C G O Q`) counter-clockwise from 2 o'clock like `o`, and **`B D P R` clockwise** — the capital form of
  §5.5's `b`/`p` exception, and for the identical reason: the bowl is drawn *after* the stem, so the hand
  leaves the stem and pushes right and over. Verified by signed area on all 26, not by eye.
- **The sweep direction is a live trap, and it bit.** `A(…,270,90)` reads as "top to bottom round the
  right", but the helper interpolates from `a0` to `a1`, and 90 is *less* than 270 — so the first four
  bowls swept counter-clockwise out through **negative x**, i.e. off the left of the glyph. The rule is the
  one the minuscules already followed (`b` is `180,540`): **to sweep clockwise you must count upward**, so
  it is `270,450`. Caught by a bounds check, which is why one exists.
- **Cap height verified as a number, not a look.** All 26 start at exactly `y 0.07` and land on `0.72`, and
  `Q`'s tail is the only thing below the baseline. Rendered against the metric lines, `l` visibly overshoots
  `L` — which is §10.4's whole point and the thing the four-cell specimen would have exposed.
- **The widths came out as a system, and it is legible as a list**: `I` 0.24 · `J` 0.46 · `F` 0.50 ·
  `E L` 0.52 · `B P S` 0.53 · `Z` 0.58 · `R Y T` 0.62 · `A H K V X` 0.64 · `N U` 0.66 · `D` 0.70 ·
  `M` 0.76 · `C G O Q` 0.77 · `W` 0.86. Against a–z, which sits between 0.22 and 0.84 with most letters at
  0.60, that spread *is* the lesson.
- **The alphabet preview had to change to show any of this.** `renderAlphabet()` centred each glyph on its
  own ink, which hides exactly the two things capitals exist to teach; it now draws a row on **one baseline
  at each glyph's own advance width**, so cap height and the width system are visible in the one place the
  shapes get judged.
- **§13 #5 answered: the flat 0° signwriter nib ships.** One row in `data/nibs.json`, `groups: []` (the
  `round-bold` precedent — a nib with no face, present because the point it makes should be visible before
  the thing it argues for is built), inserted *before* `round-bold` so the `1`–`9` keys still reach the nine
  face-bearing pens. Rendered, it does what §10.7 promised: fat stems, hairline bars that read as the
  entry-and-exit marks a Roman serif *is*, and a visibly wrong minuscule with the same pen.
- **`unicase` is a face flag, not a special case in the code.** Uncial gets `"unicase": true` and one
  helper, `faceChar(ch)`, folds `A` onto `a` for the glyph, the album cell **and** the per-nib best — so
  §10.6's "A and a are the same drawing" is true of the save shape and not just the plate. Its face row
  shows one fraction of 26; every other face shows two.
- **The two fractions are computed, the milestones are still M4.** `faceCells(f)` returns `{lo, up}` and the
  face list shows `7a·3A`. M4 must read both and never their sum — §10.5's migration trap is a comment on
  that function, where the code that would get it wrong will be.
- **The capitals copy is a paragraph on the existing plate**, shown while an uppercase letter is selected
  (always, for a unicase face), plus six capital-only anatomy callouts. Callouts were already keyed by
  character, so `{term:"cap height", letter:"H"}` needed no new shape — exactly as §10.5 predicted.

---

## 11. Italics and bold (designed for, not built)

The dev wants these "down the road". They are cheap *if* §7's data shape leaves room now, so:

- **They are a style axis, not more faces.** In type terms a family has styles; a cell is therefore
  `letter × face × style`, with `style` defaulting to `roman`. Leaving the axis out of the save shape is
  what would force a migration later — so the key is `"<faceId>"` + style, not a flattened face-per-row.
- **Bold is a wider nib.** Same skeleton, same angle, larger `w`. Nearly free in the §3 engine.
- **Oblique is a shear** on the skeleton. Also nearly free.
- **A true italic is a different skeleton** — single-storey `a`, cursive entry and exit strokes, narrower
  forms. That is a second drawing pass in the Wordshape tool, and it is **the lesson**: *sloped roman is
  not an italic*. Teaching that distinction by making the player trace both is the best argument for ever
  building this, and it's the reason the axis is worth reserving today.

---

## 12. Milestones

- **M1 — the nib engine + the per-stroke scorer, in a bench. BUILT 2026-09-11** — `inklings-trace.html`
  (the `ipa-scrabble.html` → Sound Board pattern, and Wordshape's own), styled off `wordshape-draw.html` so
  the two dev tools read as a pair. What's in it:
  - **The nib (§3)** — `stampStroke` walks the path every `STAMP_STEP` (0.006 em) and stamps the pen:
    `round` a circle, `broad` a **rotated rect at an absolute pen angle** (negated, since canvas y grows
    down, so a positive angle tilts the edge up-right as a calligrapher writes it), `pointed` a circle whose
    radius follows `|dy|^pow` so the weight lands on downstrokes. The contrast is never drawn on — it falls
    out of the shape, which is the claim. Ten nibs across the three types, **inline at M1 and lifted to
    `data/nibs.json` by M2**.
  - **The scorer (§5.2)** — `resample` to 32 points by arc length, mean point-to-point error in em, a soft
    `1 - err/falloff` fidelity, and the two gates: start within `startTol` of the numbered dot, and a
    direction check that compares forward against the reversed ideal (a near-closed bowl has almost no net
    travel vector, so comparing whole resampled paths is the version that works). A refused stroke costs
    nothing and plays the ghost.
  - **Two specimen strips that test the design, not the code** — the current letter in *every* nib (does
    `broad-45` read as blackletter and `pointed-dido` as a didone, from the pen alone?) and the whole a–z in
    the equipped nib. Both are ideal strokes with no input involved, so they're the cheapest possible answer
    to "is §3 true".
  - **Personal bests** (decision #8) per `letter|nib` in `localStorage`, with the `was 82%` delta, so the
    hi-score feel is playable now rather than at M4.
  - The tuning sliders (start tolerance, falloff, snap, face threshold, nib weight, path smoothing, and the
    direction gate as a toggle), the metrics overlay drawing the alphabet's own ascender/x-height/baseline/
    descender lines, and the stroke-order readout (the next stroke's start, numbered).
  - **Glyphs: `data/wordshape-alphabet.json` if present, else the `GLYPHS` block sliced live out of
    `wordshape-draw.html`** and run — the `affix-sprite-preview.html` trick, so the bench can't trace a stale
    copy of the alphabet. Verified: the slice yields all 26. The bench therefore needs **http serving**
    (Live Server), like every other fetching page here.
  - Deliberately absent at M1: fonts, faces, the album and §5.4's ladder — **all four arrived with M2**,
    below, except the album's milestones and plates, which stay M4.
  - **Playing it immediately found a data defect, not a code one** — the authored alphabet's closed bowls all
    ran clockwise from 3 o'clock and `f` was mirrored. **Fixed 2026-09-11** in `wordshape-draw.html`; see
    **§5.5**. The bench needs no change — it slices the table live.
- **M2 — the faces. BUILT 2026-09-12.** Four data artifacts and the bench layer that proves they work:
  - **`data/nibs.json`** — the ten nibs lifted out of the bench, **with no inline fallback left behind**. A
    second copy is exactly the drift the live glyph slice exists to prevent, and the bench already needs
    http serving, so a missing file is an error panel rather than a silently stale table.
  - **`data/typefaces.json`** — the pruned Vox-ATypI tree (15 group rows, 12 leaves) plus **12 faces**: the
    eleven §4.1 leaves and the **starter skeleton face** (§8), which is the one face whose specimen is not a
    font. Each face carries group, nib, date, origin, font file, CSS family, licence, credit, a **plate**
    paragraph and **anatomy callouts** (`{term, letter, note}`) — the teaching copy §7's plate needs,
    authored now and *positioned* at M4. Faces keep their **real font names**: §4's pun-a-new-name advice
    applies only to a face we would have to redraw to ship, and "Garamond" is the teaching payload.
  - **`fonts/` + `fetch-typeface-fonts.sh`** — eleven OFL faces and their licence texts (§4.1, as shipped).
  - **The nib↔group mapping**, stated from both ends and **asserted at boot** — see §3's `groups` note and
    the Lineal consequence it records.
  - **In the bench:** a face picker grouped by the tree, §5.4's **named / cued / cold** ladder with the `?`
    peek (`0`), and the payoff — **four specimen cells at one em on one baseline**: the real font, the
    skeleton in that face's own nib, your hand in the pen you equipped, and the album cell if you have ever
    earned one. That is §3's claim laid out to be judged rather than argued about. §5.6's verdict table is
    live with it (right pen / right pen mis-set / wrong type), and the plate's anatomy list is clickable —
    each callout jumps the pad to the letter that shows the term.
  - **Two things the build settled.** The real font is drawn at the skeleton's own em with its baseline on
    the skeleton's baseline (0.72 em), so it is a **true overlay** and the x-height differences you see
    between two faces are the faces' — that is also exactly the call M3's field glyph makes. And §5.6's
    **smudge multiplier must stay high enough that a clean trace with a mis-set pen can still clear
    `faceTh`**: the first number tried (0.7 against a 0.72 threshold) made "smudged grade" mean *no face at
    all*, which is a second silent refusal rather than the worse grade the table promises. Default 0.85.
- **M3 — fold into `inklings.html`.** The trace overlay replaces the letter branch of `doAttack` (§9), field
  glyphs draw in their face with the `Alpha.png` fallback, the six guards, save v12 → v13, the starter face
  and the nib shop entries. **The loop closes here** — this is the milestone after which the game plays
  differently. **§10.2 is already answered**: M7 landed first, so the skeleton covers all 52 letters and
  M3 needs no `isUpper` fallback on the trace-open check. It still needs `!isUpper(c.letter)` on the
  *satchel* gate (§10.8) — that row is load-bearing for a different reason.
- **M4 — the Scriptorium.** The album, the per-face plate with anatomy callouts, the 25/50/100% milestones
  paying ink + décor, the framed-specimen décor item.
- **M5 — the Tree of Faces.** The classification map (Tree-of-Kinds pattern) + group milestones.
- **M6 — italics & bold** (§11).
- **M7 — capitals** (§10). **BUILT 2026-09-12 — and it landed BEFORE M3, which cancels the fallback M3
  owed it.** As built: **26 capital skeletons** in `wordshape-draw.html`'s shared `GLYPHS` table (52 glyphs
  now, exported by the same `⬇ wordshape-alphabet.json` button and sliced live by the bench, so both games
  still read one alphabet), a new **elliptical-arc helper** the minuscules never needed, the **cap-height
  metric line at 0.07** in the alphabet's units string and as the bench's fifth overlay line, an **`Aa`
  case layer** in the bench (a–z / A–Z chips, `[` `]` walking the case you are in, shift+key crossing, the
  nib strip and the whole-alphabet strip following), **two fractions per face** via `faceCells()`, a
  **`caps` plate paragraph plus six capital anatomy callouts** in `data/typefaces.json`, **`unicase: true`**
  on Uncial Antiqua folding its `A` onto its `a` for glyph, cell and best alike, and the **flat 0°
  signwriter nib** (§13 #5, answered: it ships). No new fetches, no save bump, no font work — the fonts
  already subset all 52. Full build notes in **§10.10**.

Sound is **provisional** and nothing depends on it: a nib scratch per stroke whose pitch tracks stroke
length, a pen-lift tick between strokes, and a distinct chime for *face earned* that must not sound like
the existing `capture` (the letter and the face are two different wins).

---

## 13. Open questions

1. **Does a wrong-nib capture tell you so?** Naming the right pen after the fact teaches fastest but
   removes the reason to look. Leaning: say only *that* it was the wrong pen, never which.
2. ~~**Uncial's font** (§4.1) is the one leaf without a clear candidate.~~ **Answered by M2: Uncial
   Antiqua** (OFL). Junicode was the lead but isn't on Google Fonts, so it has no ready latin subset.
3. **Does the Wordshape bench grow a stroke-order readout + nib preview**, so one tool authors both games'
   glyphs? Cheap, and it is where the skeletons live.
4. **Does a mis-set pen of the RIGHT type deserve its own verdict at all?** §5.6 gives a broad nib an
   angle tolerance, which is measurable; for round and pointed nibs there is no second unit, so M2 grades
   "right kind of pen, wrong flex" as the same smudge. It may be truer to accept any pointed nib for a
   pointed face and let the *look* be the feedback — the didone and the script nibs produce visibly
   different pages, which is the lesson either way.
5. ~~**Does the flat 0° "signwriter" nib ship with the capitals** (§10.7), or stay parked?~~ **Answered by
   M7: it ships** (`broad-flat`, `groups: []`). It makes one of the two alphabets look wrong on purpose,
   and that is the demonstration, not a defect.
6. **Does a true blackletter majuscule skeleton ever get drawn** (§10.6), alongside the true italic, or do
   the plates simply tell the truth about the approximation? Both are "a second skeleton", which §11 argues
   is the lesson rather than the cost.
7. **Is a personal best worth showing anywhere but the album?** A tiny `new best` float on the capture is
   nearly free; a per-face average on the plate edges toward a report card.
