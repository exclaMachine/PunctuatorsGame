# Inklings — The Scriptorium: letter tracing & typeface collecting

**Status: SPECCED 2026-09-11. M1 (the nib engine + the stroke scorer), M2 (the faces), M2.5 (the font
scorer) and M7 (the capitals) are BUILT in the standalone bench `inklings-trace.html`; **M3 — the fold-in —
is BUILT in `inklings.html` 2026-09-12, so THE LOOP IS CLOSED and the game plays differently**: inklings
are no longer hit, they are written. **M4 — the Scriptorium album, its plates and its milestones — is BUILT
2026-09-13 (§15), so the cells now have somewhere to be looked at.** See §12. M5 (the Tree of Faces) and M6
(italics & bold) remain.**

**First play, 2026-09-13 → §14 was the fix list, and ALL FOUR ARE NOW BUILT.** One bug fixed (the pad layer
was clipping at half height), and **three changes to what the feature does, two of them reversals**: the
`?` peek is **cut** (the whole letter simply shows), the pad gained a small **specimen of the target letter
in its face** (upper-right, replacing §5.4's cued stress tick), and the trace **opens on a SWING, not `E`**
(`E`, the touch WRITE button and the field prompt all still work). Read §14 before touching §5.4 or §9 —
both are now partly history.

**AMENDED 2026-09-12 (§5.7) and BUILT the same day as M2.5 in the bench: a trace is graded against the REAL
TYPEFACE, not against the shared skeleton.** Your `a` in Blackletter has to look like a blackletter `a`.
Nothing new is drawn and no new data file appears — the skeleton drops back to being the guide and the
stroke order, and the grade becomes a chamfer score of your ink against the face's own font. The nib stops
being a lookup and becomes the only way to pass (too thin and you can't fill the letter, too fat and your
ink spills outside it). **This inserts M2.5 — the font scorer, in the bench — ahead of M3.**

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

**§5.7 changed what the nib is FOR.** It was the thing that *produced* the face (trace one skeleton, stamp a
pen, get a Garalde). It is now the tool your ink has to be made with in order to *fill* the face's real
letterform — which is the same physics doing more work, and it is measured rather than asserted. Everything
below about how a nib stamps is unchanged.

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

### 5.2 Scoring (per stroke) — **the GRADE here is superseded by §5.7; the GATES survive**

Read this with §5.7 beside it. The per-stroke gates below are still what a trace has to pass, and §5.5's
direction fix is what feeds them. The *grade*, though, no longer comes from this comparison at all — it
comes from the real font. What follows is the skeleton half:

- Resample the player's stroke and the ideal stroke to **N points by arc length** (N ≈ 32).
- **Fidelity** = mean point-to-point distance, normalised by the em.
- Gates: start within `START_TOL` of the ideal start; overall travel direction agreeing in sign with the
  ideal's; strokes completed **in order**, none skipped.
- The letter's grade is the mean of its strokes' fidelities.

…and the last bullet is exactly the one §5.7 reverses: the letter's grade is now a whole-glyph chamfer
score against the face's own font, and the mean of stroke fidelities is not used for anything.

### 5.3 Feel (most of the work)

- **Snap — DROPPED by §5.7** (it pulled strokes toward the skeleton, which is no longer the target).
  Kept here because the reasoning still governs whatever replaces it. Originally: **partial, not Duolingo's
  hard snap** (settled building M1). Duolingo lands every accepted stroke
  exactly on the ideal, which is the right call when the glyph is a means to an end. Here it isn't: §7's album
  shows **your** traced glyph, so a hard snap would make every player's album byte-identical and the
  collection would be a tick-list wearing a drawing. The bench therefore blends the traced points toward the
  ideal by **snap × fidelity** — a clean stroke lands on the line, a scruffy one stays scruffy, and the jitter
  of a finger goes either way. Default 0.65, and it is the knob most worth arguing about on a phone.
- **Ghost hint.** After a failed stroke, animate the ideal stroke once, head to tail. Never show the
  animation before the first attempt — that is a demo, not a game.
- **One stroke at a time**, with the completed strokes staying inked, so the glyph builds.
- **In-world, not a modal.** The field already freezes creatures while a dialog is open; trace over the
  creature's own position. A full-screen overlay for a one-second gesture is churn. **Confirmed by the dev
  at M3 and BUILT that way**, over the alternative of a `.book` overlay like every other bench — even
  though M2/M2.5 had since added chrome this bullet didn't anticipate (the face name, the pen rack, the
  peek, the coverage read-out). All of it is drawn **on the game canvas**, in a parchment card centred on
  the creature and clamped to the screen, so the dim field and the inkling underneath stay part of the
  picture. The cost is that the pad has to be cheap to redraw at 60 fps — see §12's M3 on the cached
  layer, which is the only real complication the choice created.
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

**§5.7 sharpens all three rungs rather than changing them.** Because the pen is now what makes your ink
fit the letter, a wrong pick fails *visibly, while you are still drawing* — so rung 3 teaches by letting you
feel the mistake rather than by announcing it afterwards.

A **`?` peek** is always available and always costs the same thing: it names the pen and **forfeits the
face for that capture**. You still get the letter. (No ink price — the cost is already the interesting one.)
**CUT 2026-09-13 — see §14.2.** It was answering a question §5.7 had already answered: the face's own glyph
is ghosted under the pad, so the letterform is always on screen. Built in M3, removed in the next pass; the
consequence for this ladder's **cold** rung is recorded there.

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

**Rewritten by §5.7** — every row below is now a *measurement*, not a lookup. There is no `nibVerdict`,
no `smudge` and no `angleTol`: the pen's effect on the grade is whatever the chamfer field says it is.

| | Letter | Face |
| --- | --- | --- |
| Right pen, ink fills the letter | ✅ | ✅ at grade |
| Right pen, ragged trace | ✅ | ✅ lower, or below `FACE_TH` nothing |
| Pen too thin for the face | ✅ | ❌ — coverage collapses, and you watch it fail as you draw |
| Pen too fat, or held at the wrong angle | ✅ | ❌ or a poor grade — ink outside the letter is measured |
| `?` peek taken | ✅ | ❌ — forfeit, unchanged |
| Abandoned mid-trace | ❌ (creature stays) | ❌ |

**The letter is earned at any grade** once the strokes are done. The economy must never stall on a
typography lesson.

---

### 5.7 AMENDED — the target is the real typeface, not the skeleton (dev's call, 2026-09-12)

The reversal in one sentence: **§5.2 scored your path against the shared skeleton; the grade now scores
your INK against the real font's glyph.** Your `a` in Blackletter has to look like a blackletter `a`, not
like the skeleton written with a steeper pen.

**Nothing new is drawn, and no new data file appears.** Decision #4 stands, the 52-glyph skeleton stands,
the ten nibs, the twelve faces, the album, the capitals and the milestones are all untouched. The only
thing that changes is what the number means.

**What the skeleton is for now.** Stroke order and direction — the one thing a font file cannot supply,
because fonts ship **outlines, not strokes**. It says how many strokes, where each one begins and which way
it runs. It is no longer the thing you are judged against, which is also why §5.5's direction fix stays
load-bearing: the gate it feeds is all that survives of skeleton-scoring.

**What the guide is now.** The face's own glyph, ghosted under the pad, with the skeleton's numbered start
dots on top. It costs nothing — the glyph is already being rasterized for the scorer — and it is what a real
tracing sheet looks like. It matters most for the three faces whose skeletons genuinely differ
(Blackletter's broken curves and straight-sided bowls, Uncial's round majuscule forms, Script's joined
single-storey letters); for the other nine the skeleton and the font agree closely enough that the ghost
just sharpens it.

**The scorer — Wordshape's chamfer field, which §5.2 explicitly ruled out.** That ruling was right about
tracing *needing* order and wrong about where the grade comes from; the chamfer field is exactly the tool
for *is this ink the right shape*, and it needs no stroke data for the target at all:

- Rasterize the face's glyph at the pad's em into a 256² mask; two-pass chamfer DT → `Dface`.
- Rasterize the player's **stamped ink** into the same grid — literally the pixels they can see, read back
  off an offscreen canvas, so the thing measured and the thing drawn cannot disagree.
- **Fidelity** = how much of your ink landed on the letter: mean `Dface` over your ink pixels.
- **Coverage** = how much of the letter you filled: the fraction of the font's ink within tolerance of yours.
- Combine as **F-beta with coverage outweighing fidelity 2:1** — Wordshape's own finding, and for the same
  reason: weight fidelity too highly and the optimal play is a small cautious mark. **That is β = √2, not
  F₂**; see the correction under M2.5 in §12, which is a real trap and not a rounding quibble.

**The property that makes this better than what it replaces.** The nib stops being a lookup and becomes the
only way through:

> **Fidelity punishes a pen that is too fat. Coverage punishes one that is too thin. A wrong angle fails
> both.**

A round monoline pen physically cannot fill a blackletter `a` — the ink is too thin and coverage collapses.
The fattest pen in the shop cannot brute-force it either, because ink outside the letter is measured. Only
the right pen at the right angle satisfies both at once, which turns §3's thesis — *stroke contrast is a
record of the tool* — from something the game asserts into something it measures.

So **§5.6's verdict table is retired**: no `nibVerdict` lookup, no `smudge` multiplier, no `angleTol`. It
also **answers §13's open questions 1 and 4** — a wrong pen tells you it is wrong by visibly failing to fill
the letter *while you are still drawing*, which is the "let the look be the feedback" that #4 already
leaned toward, and it never has to name the pen you should have picked.

**What has to be dropped: §5.3's snap.** It pulled an accepted stroke toward the *skeleton*, which under
this scheme drags your ink away from the shape being scored. Only `smoothPath` survives — it cleans pointer
jitter without moving the stroke toward anything. This is a real loss of feel, not a free simplification: a
scruffy stroke now stays scruffy, and whether anything replaces it is an open question below.

**What has to be loosened: §5.2's start gate.** It measured your start against the *skeleton's* start,
which for a divergent face is the wrong place to stand. Direction and order stay — they are the handwriting
lesson, and the direction check compares whole resampled paths, so it is tolerant of a stroke that bulges
somewhere the skeleton doesn't. The start-point gate becomes advisory rather than a refusal.

**And the grade decouples from stroke count.** The skeleton suggests a sequence and gates each stroke's
direction; the grade is the chamfer score of **all your ink together**, taken once the glyph is done. That
is precisely what lets one shared skeleton drive a face whose real stroke count is different, and it is the
reason this amendment does not quietly become the 572-drawing per-face-skeleton plan.

**The starter face needs no special case.** The skeleton face's "font" is the skeleton, so its target mask
is the skeleton stamped with the round nib — the same code path, one branch already present for it in the
bench's specimen cell.

**Cost, honestly.** The scorer itself is small (~50 lines; `wordshape.md` §M3 specced it and it was never
built, so this is where it finally gets written, and Wordshape inherits it). But every threshold in the
bench's `T` block is now measuring a different quantity, and the *feel* of a trace changes completely — so
it is built and tuned in `inklings-trace.html` before it goes anywhere near the game. That inserts **M2.5**
ahead of M3; see §12.

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
  **BUILT at M4** (§15.3): 15/35/80 ink per rung per case, and a **completed face** — every track at 100% —
  pays 200 ink **plus** the framed specimen. The group milestone stays M5, with the tree.
- **Nibs are bought at the Stall with ink** — the shop reused, a new ink sink, no new economy.
  **AMENDED 2026-09-12 (dev's call, building M3): a nib is not a GATE.** This bullet used to say a face
  whose nib you don't own is *uncatchable-as-a-face*; it isn't. Every face is traceable with any pen you
  own — the wrong pen simply cannot score well enough to fill the cell, because §5.7 already measures
  exactly that (too thin and coverage collapses, too fat and fidelity does). So the flag was doing, badly
  and invisibly, a job the grade does honestly and in front of you. The consequence is better than the
  rule it replaces: ink buys you a **higher ceiling**, not an unlocked door, and a player can always go
  and *see* what a better pen would buy them by trying the wrong one and watching it fail.

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
  prefetch the four neighbours, fall back to the `Alpha.png` stamp until it resolves. **BUILT exactly so**
  (`trPrefetchFaces`, on `goScreen` and at `startGame`).
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
  skeleton itself** — "the hand you already write in" — with the round nib owned from the start. v1's
  tracing *is* the tutorial; the collection opens later.
  **AS BUILT (M3), and this replaced the "faces unlock on a curve like `LOWER_DONE_AT`" line that used to
  end this bullet: there is no unlock curve, because two things the game already has make one unnecessary.**
  (a) The distance weighting above *is* the curve — near home 73% of screens wear one of the four monoline
  faces the free pen writes, falling to 50% at the frontier (measured). (b) §7's amendment means an unowned
  pen is a low grade, not a locked door, so a rare face met early is a letter you still catch and a cell you
  don't yet fill — which is the right kind of "come back for this". **Home (0,0) is hard-coded to the
  skeleton** so the one guaranteed home inkling is always the tutorial one.

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

**DONE — M3, 2026-09-12.** Every row below has moved; the table stands as the map of *where each one went*,
which is worth keeping because these are exactly the rows a later edit could quietly drop. `doAttack`'s
letter branch is now three lines of comment and a `swungAtInkling = true`, and the whole right-hand column
lives in `trGrantLetter` / `trFinishLetter`, except the satchel gate, which is the trace-**open** check.

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
  idiom, **not** a swing. It is the same gesture as every other "interact with this thing" in the game, and
  it retires the accidental-letter-kill case entirely. As built, `inklingInFront()` is checked **first** in
  `tryUseBench` — before the shop and the house — because it is the specific and far commoner interaction,
  and a swing at an inkling now does nothing but say so once.
  **REVERSED 2026-09-13 — see §14.4: a SWING opens the trace.** `E` was defending against the accidental
  letter-kill, and that case is already gone by construction once nothing can damage an inkling — so the
  worst a stray swing can now do is open a pad you leave with `Esc`, which costs nothing.
- `CREATURE_HP = 1` becomes cube/resource-only — **done**: it is vestigial for letters (kept only so the
  shared creature shape stays uniform), and the three comments that named it were rewritten.
- **The overlay guards**, the same ones the Sound Board had to join — a new `state.tracing` in all of them.
  This is the edit that gets half-done, so as built it was done by walking **every** guard list that names
  `state.soundboardOpen` — the field movement gate, `canBeHurt`, both `hintReady`s, `updateLibrary`'s
  movement gate, `syncTouchUI`, `phonHideSound` and `musicDialogueOpen` — plus its own early branch in the
  key handler and a line in `closeAnyDialog`. **Three of the matches were NOT guard lists** and were put
  back: two `if(!state.soundboardOpen) return;` inside Sound Board callbacks and its resize handler are the
  board asking *am I open?*, not a list of dialogs to stand clear of, and a blanket replace inverts them.
  Adding `state.tracing` to `canBeHurt` is what freezes the creatures while the pad is up, which §5.3
  assumed without saying.
- The `competition` stat ladder's attack rungs stop touching letter capture (they barely did — `CREATURE_HP`
  is 1). No migration, but the stats panel copy may need a word.
- `data/wordshape-alphabet.json`, `data/nibs.json`, `data/typefaces.json` and the `fonts/` subsets are new
  fetches — all local files, consistent with the existing data-file exception. The three JSONs are fetched
  once at `startGame`; the fonts arrive one screen at a time. **If any of it fails, the letter is still
  caught** (`trPlainCatch`) — a missing file must never make the economy unplayable.

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
bench's letter picker**, because the album itself is M4; **as built (§15) the album inherited all three** —
the switch, the `faceCells()` fractions and the `unicase` flag — rather than inventing them.

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
- **The two fractions are computed, the milestones were M4.** `faceCells(f)` returns `{lo, up}` and the
  face list shows `7a·3A`. M4 had to read both and never their sum — §10.5's migration trap is a comment on
  that function, where the code that would get it wrong would be. **BUILT (§15.3): `trFaceTracks(f)` is the
  one place that decides how many tracks a face has, so the sum is never available to get wrong.**
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
    authored now and *positioned* at M4 (**done — §15.4 derives each anchor from the glyph's own geometry
    rather than authoring a coordinate per callout**). Faces keep their **real font names**: §4's pun-a-new-name advice
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
- **M2.5 — the font scorer, in the bench. BUILT 2026-09-12** (added by §5.7's amendment, and it had to land
  before M3 because it changes what every tuning number means). In `inklings-trace.html`:
  - **The chamfer distance transform** (`wordshape.md` §M3's, finally written — Wordshape inherits it):
    rasterize the face's glyph into a 256² mask, two-pass DT, cache per face × letter × pad size.
  - **The player's ink read back off an offscreen canvas**, stamped with the same nib at the same transform,
    so the thing measured and the thing drawn are the same pixels.
  - **Fidelity + coverage → F₂**, coverage weighted 2:1, graded on the whole glyph when the last stroke
    lands rather than per stroke.
  - **The guide becomes the ghosted font glyph** with the skeleton's numbered start dots on top.
  - **Deletions**: `nibVerdict`, `smudge`, `angleTol`, and §5.3's snap. The start-point gate goes advisory;
    the direction and order gates stay.
  - **New sliders** for whatever the F₂ weighting and the coverage tolerance turn out to want, because every
    existing number in `T` is now measuring a different quantity.
  - The four-cell specimen strip is the read-out that says whether this worked: cell 1 (the real face) is now
    literally the scoring target, so cell 3 either sits on top of it or visibly doesn't.

  **As built**, with the three things the build settled:

  (a) **The grade panel shows coverage and fidelity SEPARATELY, and that split is the pen advice.** A single
  combined number cannot tell you whether your pen was too thin or too fat, which is the only thing worth
  knowing when a face is refused — so `missReason()` reads the two against each other and says *the letter
  isn't filled — a wider pen?* or *your ink strays off the letter — a narrower pen, or a different angle?*.
  It never names the pen you should have picked, which is how **§13 #1 stays answered** rather than quietly
  reopened by the more helpful message.

  (b) **Specimen cell 3 draws your ink ON the target** — the letter underneath in pale ink, your strokes over
  it — because that is the one picture that makes both halves legible at a glance: pale showing through is
  missing coverage, dark spilling past the edge is missing fidelity. Two numbers can say it; only the
  drawing shows *where*.

  (c) **The β was wrong, and it opened a scribble exploit.** F-beta weights recall by **β²**, so "coverage
  outweighs fidelity 2:1" is **β = √2 ≈ 1.414**; writing it as **F₂ means β = 2, which is 4:1**. The error
  came from [`wordshape.md`](wordshape.md) §3, which says *F₂* and *2:1* in the same sentence, and §5.7
  above inherited it. Measured against the 0.72 face threshold:

  | | β = 2 (4:1) | β = √2 (2:1) |
  | --- | --- | --- |
  | clean trace (fid .90 / cov .90) | 0.90 ✅ | 0.90 ✅ |
  | too-thin pen (.95 / .35) | 0.40 ❌ | 0.45 ❌ |
  | too-fat pen (.45 / .95) | 0.78 ✅ **wrong** | 0.69 ❌ |
  | **scribble over the ghost** (.40 / 1.0) | **0.77 ✅ wrong** | 0.66 ❌ |

  So at 4:1 you can ignore the pen entirely, scrub ink across the ghosted letter and earn the face — which
  would have been the first thing anyone did, and it would have read as the whole amendment failing rather
  than as one wrong exponent. At 2:1 only the trace passes and both wrong pens are refused. **`wordshape.md`
  is corrected too**, since that scorer is the same one and it is not built there yet — the intent in its
  decision #7 ("filling the drawing counts about twice what staying on the lines does") was always right,
  only the β was wrong. The bench keeps the slider across 0.5–4 with the measured numbers written under it,
  because this is exactly the knob a play-test should be able to disprove.

  One hole closed while wiring it: `fontState` only records that the `FontFace` **resolved**, not that the
  `family` string in `typefaces.json` is the name the file actually registers — and a mismatch makes
  `ctx.font` fall back to **`serif` silently**. Under M2 that only made a specimen cell wrong; now it would
  score you against Times and label it Garamond. `document.fonts.check()` is the cheap authority, so the
  target consults it and the read-out distinguishes *font missing* from *family name doesn't match the file*.

  Also verified numerically rather than by eye: the 3-4 chamfer transform agrees with a brute-force
  euclidean distance to **1.6 px worst case on a 64² grid** (mean 0.43), which is the expected ~3% for those
  weights and far inside anything the grade can notice.
- **M3 — fold into `inklings.html`. BUILT 2026-09-12. THE LOOP IS CLOSED** — this is the milestone after
  which the game plays differently. One `/* THE SCRIPTORIUM */` block holds the whole ported engine (M1's
  nib + gates, M2's faces, M2.5's chamfer scorer), and the surface it touches outside that block is small:
  `doAttack`'s letter branch, `tryUseBench`, `drawCreature`, `render`, the guards, the shop and the save.
  - **`data/wordshape-alphabet.json` now exists**, emitted by a new repo-root **`build-wordshape-alphabet.js`**
    — the headless equivalent of the tool's own `⬇` button (same slice of `wordshape-draw.html`'s `GLYPHS`
    block, same `alphabetJSON()` shape, 52 glyphs / 38 KB). The bench can slice a dev tool live; the shipped
    game cannot, and a hand-copied table is exactly the drift that slice exists to prevent — so the file is
    **generated, never edited**, and re-running the script is one command after any glyph change.
  - **A swing passes THROUGH an inkling** (dev's call): no damage, no knockback, plus a one-time toast
    *"Inklings are caught, not fought — press E to write it."* Chosen over letting a swing open the pad,
    because the whole point of §1 is that a swing aimed at a beast can no longer cost you a letter, and
    over keeping the knockback, which would leave a swing meaning two things. `CREATURE_HP` is now
    vestigial for letters (comments updated at its declaration, at `equipBonuses` and at `ATTACK_STEP`).
    **REVERSED 2026-09-13 — §14.4: a swing OPENS the pad**, and the toast is gone with it. The knockback
    argument stands (a swing still means one thing, because the pad opens only when the swing connected
    with nothing else); what fell was the objection about costing you a letter, which §1 had already
    removed by construction.
  - **The pad is in-world, all on canvas** (§5.3, confirmed by the dev over a DOM overlay): the field dims,
    a parchment card is drawn **centred on the creature** — so you really do trace over the inkling's own
    position — carrying the face name, its branch of the tree, the pad, the pen rack and the status line.
    Pointer input is three capture-phase listeners on `#cv`; a tap outside the card leaves.
  - **The one thing the port could not do naively is redraw.** The bench redraws on demand; the game draws
    at 60 fps, and stamping a nib is a few hundred `fill`s per stroke. So the pad's **static ink** (the
    parchment, the metric lines, the ghosted face glyph, the dotted stroke order, every accepted stroke and
    the numbered start dot) is built once into an offscreen layer keyed on
    `face|letter|nib|strokes done|font state|size|drawing?` and blitted; **only the stroke in your hand is
    live**. That key rebuilds twice per stroke and never per frame.
  - **The face a screen wears** is `mulberry32(hash2(sx,sy) ^ daySeed ^ salt)` over §8's weighting, and
    **a face's rarity is its PEN'S PRICE** — `data/nibs.json` already ranks the pens and the ranking is the
    right one, so no second table was invented. Measured: near home **73%** of screens wear one of the four
    monoline faces (the free pen), falling to **50%** at the frontier, with blackletter 2.8% → 5.3%.
    **Home (0,0) is always the bare skeleton** — the guaranteed home inkling is the tutorial, and it should
    never be the day you meet Textura.
  - **Fonts load per screen** (`trPrefetchFaces` on `goScreen` + at `startGame`: this screen and its four
    neighbours), which is the whole reason §8 made the face a property of the screen. The field glyph draws
    in the real face once its woff2 resolves and falls back to the `Alpha.png` frame until then — and the
    skeleton face has no font, so the starter hand stays the hand-drawn sheet for good. Never tofu.
  - **§10.2 was already answered** by M7 landing first, so no `isUpper` fallback was ever written. The
    *satchel* gate does keep its `!isUpper(c.letter)`, moved verbatim onto the trace-**open** check (§10.8).
  - **A missing data file must never cost you a letter.** If any of the three JSONs fails to fetch, or a
    letter somehow has no skeleton, `trPlainCatch` grants it the way `doAttack` used to and says nothing
    about faces. One bad deploy cannot make the economy unplayable.
  - **Guards**: `state.tracing` joined every list that names `state.soundboardOpen` (nine of them, plus
    `closeAnyDialog`, `phonHideSound` and `syncTouchUI`) — which also freezes the creatures, since
    `canBeHurt` is what moves them. Touch gets a contextual **WRITE** button beside CAST.
  - **Save v12 → v13**: `state.faces` (the album), `state.nibs` (pens owned) and `state.nib` (equipped) join
    `snapshot`/`applySnapshot`, hence Export/Import. Old saves start where everyone does, with the round
    monoline, and `round-mono` is re-inserted if a save somehow lacks it — the free pen can't be lost.
  - **Played 2026-09-13, and it found four things — see §14, all four now BUILT.** One was a real bug (the
    cached pad layer clipped at half height, because a fresh canvas defaults to 300x150 and `TR_PAD_PX` is
    300, so testing the width alone passes); the other three changed the feature — the `?` peek cut, a
    specimen of the target letter added upper-right, and the trace opening on a SWING rather than `E`.
  - Left to M4, and deliberately not built here: the album view (**built the next day — §15**). The cells
    accumulate (grade + the 16-point
    strokes that earned them) with nothing yet to look at but a toast naming the face, the grade and the
    fraction — **the two fractions shown separately and never summed** (§10.5), which is `trFaceCells`
    earning its keep in M3 rather than waiting.
- **M4 — the Scriptorium. BUILT 2026-09-13** — the album, the per-face plate with anatomy callouts, the
  25/50/100% milestones paying ink + décor, and the framed-specimen décor item. Full build notes in
  **§15**; the short version is that the album is **one canvas strip per face** rather than 312 cells, the
  callout anchors are **derived from the glyph's own geometry** rather than authored per callout, and an
  empty cell shows **the face's own letter, ghosted**, so the grid is a specimen sheet before it is a
  checklist.
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

Sound is **provisional** and nothing depends on it. **M3 shipped two of the three** on the game's existing
`tone`/`seq` kit, no assets: a **pen-lift tick** on each accepted stroke, and a **`facewon` chime** that
deliberately *climbs* where `capture` falls — the letter and the face are two different wins and must not
sound like one. The per-stroke scratch whose pitch tracks stroke length is still unbuilt.

---

## 13. Open questions

1. ~~**Does a wrong-nib capture tell you so?**~~ **Answered by §5.7**: it tells you *while you draw*, by
   visibly failing to fill the letter, and it never names the pen you should have picked.
2. ~~**Uncial's font** (§4.1) is the one leaf without a clear candidate.~~ **Answered by M2: Uncial
   Antiqua** (OFL). Junicode was the lead but isn't on Google Fonts, so it has no ready latin subset.
3. **Does the Wordshape bench grow a stroke-order readout + nib preview**, so one tool authors both games'
   glyphs? Cheap, and it is where the skeletons live.
4. ~~**Does a mis-set pen of the RIGHT type deserve its own verdict at all?**~~ **Answered by §5.7**, the
   way this question was already leaning: there are no verdicts left. The look *is* the feedback, and a
   pen that is close but not right scores close but not right, with no second unit invented for it.
5. ~~**Does the flat 0° "signwriter" nib ship with the capitals** (§10.7), or stay parked?~~ **Answered by
   M7: it ships** (`broad-flat`, `groups: []`). It makes one of the two alphabets look wrong on purpose,
   and that is the demonstration, not a defect.
6. **Does a true blackletter majuscule skeleton ever get drawn** (§10.6), alongside the true italic, or do
   the plates simply tell the truth about the approximation? Both are "a second skeleton", which §11 argues
   is the lesson rather than the cost.
7. ~~**Is a personal best worth showing anywhere but the album?**~~ **Answered by building M3, the way this
   leaned**: the capture floats the face and the grade over the creature and toasts `(was 82%)` when you beat
   a cell, plus the face's own fraction. It cost nothing and it is the only feedback the album gives until
   M4. A per-face *average* on the plate is still the thing to resist — that is a report card.
8. **Does anything replace §5.3's snap?** §5.7 had to drop it (it pulled toward the skeleton), so a scruffy
   stroke now stays scruffy. A light pull toward the font's own medial axis is the obvious candidate and is
   probably more machinery than the feel is worth. **Decide on the bench at M2.5, with the slider at 0.**
9. **Is the ghosted font glyph too generous a guide?** It is the right default — tracing needs something to
   trace — but *hiding it* is suddenly the cheapest difficulty rung the feature has, and it lines up exactly
   with §5.4's cold rung. Parked until the ladder is played.
10. **Do the three divergent faces (Blackletter, Uncial, Script) eventually earn their own skeleton?** This
   is #6 asked from the other side, and §5.7 makes it visible rather than urgent: the ghost carries the
   shape, so the only thing the shared skeleton gets wrong for them is the suggested stroke *order*.

---

## 14. M3 play-test fix list (opened 2026-09-13, after the first play)

Four findings from playing M3. **All four are now BUILT (2026-09-13).** Three of them are changes to what
the feature *does*, not polish — two reverse decisions this doc argued for, which is the point of playing
it.

### 14.1 FIXED — only the top half of the letter was visible

Not a geometry bug and not the data: the skeleton occupies y 34.8→260.4 in a 300 px pad, and the real font
at the same em reaches y ≈ 22.8 at its tallest, so everything was comfortably inside. The cause was §12's own
cached pad layer: **a fresh `<canvas>` defaults to 300 × 150**, `TR_PAD_PX` is **300**, and the guard tested
`_trPadCv.width !== px` — which is **false on the very first call**, so the height was never assigned and
stayed 150. The layer clipped at exactly half the pad, which is why the symptom was so clean. Fixed by
testing both dimensions. Worth remembering as a general trap: *any* size check against a fresh canvas must
not test width alone, because 300 is a value a layout can legitimately want.

### 14.2 BUILT — the `?` peek is CUT; the whole letter simply shows (dev's call)

The dev's words: *"I don't even want a peek anyway, I just want the whole letter to show."* And he is right
that the peek was answering a question the ghost had already answered — §5.7 put the face's own glyph under
the pad, so the letterform is *always* on screen; the peek was a holdover from the M1 world where the target
was the shared skeleton and the face was a guess you made blind.

Deleted: `trPeek`, `trace.peeked`, the `0` key, the header's `0 = ? peek` / `PEEKED` label, the
forfeit branch in `trFinishLetter`, the `peeked` arm of `trMissReason`, and the Controls-panel key row that
described it. **What this costs, decided rather than discovered:** §5.4's three-rung ladder loses its
escape hatch, so on the
**cold** rung a player facing a face they can't classify has no way out but to guess and re-meet the
inkling. That is probably fine — a wrong pen still earns the letter, and §8.1 says duplicates are the point
— but it means the ladder's top rung is now genuinely cold, and §13 #9's "is the ghost too generous a guide"
becomes the *only* remaining difficulty knob.

### 14.3 BUILT — the END GOAL on the pad: the letter as it should look, in its face

The dev asks for the target rendered small, **upper-right corner** suggested: *"if letter is a b in
blackletter then show that in a smaller screen."* This is the bench's four-cell specimen strip finally
reaching the game, cut down to the one cell that matters while you are drawing — and it is nearly free,
because `trDrawFaceGlyph` already draws exactly this and the raster already exists as the scoring target.

Two things to get right. It must be drawn by **the same `trDrawFaceGlyph` call as the ghost and the mask**,
or the game acquires a third shape that can disagree with the other two. And it should sit where the
**cued-rung stress mark** currently sits, so those two need a layout decision between them — the thumbnail
arguably *replaces* the stress tick, since a small true specimen shows the thick/thin axis better than an
angle mark does.

**As built:** a 52 px bordered cell at the pad's upper-right (`trace.x + trace.px - 52 - 6, trace.y + 6`),
drawn by `trSpecimen()` through the same `trDrawFaceGlyph`, with the `useFont` flag taken straight off
`trTargetFor()` so the specimen and the scoring mask fall back to the pen together. It **does replace the
stress tick** — that whole `trace.rung === "cued"` drawing branch is gone, and the cued rung's opening line
now says *read the specimen's thick/thin* rather than *read the stress mark*. Two decisions the build
settled: it is **cached in its own tiny offscreen canvas** keyed `face|char|font state` and blitted, because
without a woff2 `trDrawFaceGlyph` stamps the pen — hundreds of fills, the exact thing §12's pad layer exists
to keep off the 60 fps path; and it is blitted **after** the live stroke, so your own ink can never cover
the thing you are aiming at.

### 14.4 BUILT — a SWING opens the trace, not `E`; reversing §9 and the M3 build

The dev's words: *"I do want this screen to just activate on a swing rather than pressing the 'e' key.
Pressing 'e' is just not intuitive."* This reverses both §9's recommendation and the fork answered while
building M3 (where a swing was made to pass through with a one-time toast). Take it as settled.

The reason §9 wanted `E` was to retire the accidental-letter-kill case, and that reason is **already gone by
construction**: a swing can no longer kill an inkling, because nothing damages one any more. So the worst a
stray swing at a beast standing beside an inkling can now do is *open a pad you can leave with `Esc`* —
which costs nothing, since a trace is free to abandon and the creature stays. That is a much smaller
objection than the one `E` was defending against, and the dev's is the better read: swinging at the thing is
what the game has trained you to do.

**As built:** `doAttack`'s letter branch records the first inkling the swing passed through and
`openTrace`s it **after the walk** (opening mid-loop would close dialogs and freeze the field while the
collision walk is still running); the one-time *"inklings are caught, not fought"* toast and
`_inklingHintShown` are gone; `inklingInFront()` stays, so `E`, the touch **WRITE** button and the field
prompt (now *"Swing (or E) to write this letter"*) all still work. The swing still plays its cue and still
spends its cooldown, so a whiff is a whiff, and the satchel gate is untouched in `openTrace`.

One decision the build made that the note left open: **a swing does one thing at a time.** The pad opens
only if the swing connected with *nothing else* (`swungAtInkling && !hitAny`) — if it hit a beast it was a
fight. That is strictly better than the note's "the worst it can do is open a pad you leave with `Esc`":
mid-combat swings never interrupt themselves, and the inkling standing beside a beast is still reachable
with `E` or by finishing the beast first.

---

## 15. M4 — the Scriptorium album (BUILT 2026-09-13)

The album, the plate and the milestones. Everything below is in `inklings.html` under
`/* ==================== M4 — THE SCRIPTORIUM ====================` plus the `#album` panel and its CSS;
nothing else in the feature moved, and the trace itself is untouched apart from **one new field on a
cell** (§15.1) and **one call** on its success path.

### 15.1 What a cell holds now

`state.faces[faceId][letter] = { g, s, n }` — the grade, the 16-point strokes (M2's call), and **`n`, the
nib that earned it**, added here. The album redraws your hand with the pen that actually made it rather
than with the face's own; a cell written before M4 has no `n` and falls back to `f.nib`, which is the pen
it was almost certainly drawn with anyway. One field, no migration, and it is the difference between the
album showing *your* trace and showing an idealised one.

### 15.2 The grid: one canvas per face, not 312 cells

Twelve **strips**, 26 cells each, one `<canvas>` per face, with a sticky `a–z` ruler above them. The
alternative — a cell per element — is 312 nodes, 312 layout boxes, and a row that squeezes on a phone; a
strip is one `clientWidth` read and one redraw when a late woff2 lands (`alRefreshFace`, which redraws that
face alone rather than rebuilding the panel under your scroll position).

- **A filled cell draws your strokes**, stamped with the cell's nib, plus a **gold bar along the bottom
  whose length is the grade** — a percentage is unreadable at 20 px and a length is not, and §7's whole
  argument for grading is that the album records a hand improving.
- **An empty cell draws the face's own glyph, ghosted** (the dev's call). It costs nothing — `trDrawFaceGlyph`
  already draws exactly this — and it makes the grid a **specimen sheet before it is a checklist**: you can
  see what you are hunting, in the hand you will have to hunt it in.
- **26 columns never wrap.** A line of a–z *is* the specimen sheet's own unit. On a narrow phone the cells
  get small (≈11 px) rather than wrapping to two rows, because a wrapped row would need a second ruler and
  the plate (13 columns, so double-size cells) is where you go for detail anyway.
- **No CSS border on a strip** — the frame is stroked inside the canvas, last, after the cells. With
  `box-sizing:border-box` a CSS border eats into `clientHeight`, so the bitmap and the box would disagree
  and every cell would be squashed by a couple of pixels for no visible reason.

### 15.3 Milestones

Auto-granted like the Atlas's continents (`claimContinents` is the model, down to the shape of the toast),
because the trigger is a trace and the reward should land in the same breath as the letter:

| rung | per track | pays |
| --- | --- | --- |
| 25% | 7 of 26 | 15 ink |
| 50% | 13 of 26 | 35 ink |
| 100% | 26 of 26 | 80 ink |
| **the face** | every track at 100% | **200 ink + a Framed Specimen** |

Three decisions worth keeping:

- **The décor lands on the completed FACE, not on every 100%.** A rung per case would mint up to 24 framed
  specimens; the ink carries the smaller rungs and the trophy stays a trophy.
- **The two cases are two tracks and are never summed**, here as everywhere (§10.5). `trFaceTracks(f)`
  is the single place that decides how many tracks a face has — and it is also where **Uncial's unicase
  rule pays for itself**: one track, not two, or the face would be paid twice for the same 26 traces.
- **`claimAlbumMilestones()` runs on album OPEN as well as on a trace.** A save made before M4 has filled
  cells that crossed rungs nobody was ever paid for; settling them on first open is what the Atlas does for
  imported saves, and the toast says how many and how much rather than firing twelve in a row.

Save **v13 → v14**: `state.faceMiles` (`"garalde:lo:50"` → the day it paid) joins `snapshot`/
`applySnapshot`, hence Export/Import. The **Framed Specimen** is one generic `DECOR.specimen`, *not* a
per-face id — `applySnapshot` filters `state.placed` through `DECOR[o.id]` at load, long before the lazy
`typefaces.json` has landed, so a generated per-face entry would be dropped as unknown on every single
load. The flagpole's "one object, N faces, assignment on the placed instance" pattern is the right later
refinement and is recorded as such.

### 15.4 The plate, and where the callout anchors come from

A face's plate is its group path, date, origin, pen, both fractions with their milestone rungs, a
double-size sheet (13 columns), the authored `plate` and `caps` paragraphs, the anatomy callouts, and the
font credit. The callouts are the part that needed a decision, because §4.1 authored them as
`{term, letter, note}` and left *positioning* to M4.

**The anchors are derived from the glyph's own geometry, not authored per callout.** Thirty-one hand-placed
coordinates would be a second thing to keep true of every new face and every skeleton edit, and the skeleton
already knows where its bowl, its stems, its stroke ends and its metric lines are. `trCalloutAnchor(term, g)`
reads the term for what it is asking about:

| the term mentions | the anchor |
| --- | --- |
| x-height / cap height | that metric line, at the glyph's mid-x |
| aperture | the midpoint between the two ends of the longest stroke — literally the gap |
| bar | a little way along the first stroke (the `e`-bar is where the hand starts) |
| stress, contrast, hairline, monoline, flat-pen, *varying* widths | the glyph's left extreme at mid-height, where thick and thin are furthest apart |
| serif, terminal, entry/exit, swell/release | the **lowest stroke end** — where a pen enters and leaves the line |
| bowl, round, curve, circular, width | the glyph's right extreme at mid-height |

Order matters in exactly one place: **stroke-width terms are tested before letter-width terms**, or
*varying widths* reads as a claim about the letter's width rather than the pen's. A term with no rule gets
its caption and **no leader line** — it never gets a wrong one. The leader exits toward the nearer side, so
it points *at* the feature rather than across the letter, and the drawing under it is **your traced glyph
over the face's own, ghosted** when you own the cell, and the face's own in full when you don't (captioned
honestly: *shown in the face's own hand — you haven't traced this letter yet*).

### 15.5 Where it opens from

A **toolbar button (📜 Scriptorium)** and its touch twin, non-contextual — the Sound Board's own precedent,
and a **library desk is a later launcher-only change** (the dev's call: toolbar now, desk later). The album
is a reference you want mid-hunt — *do I already own `k` in Didone?* — which is an argument the Atlas's
globe-only rule doesn't have to answer.

`state.albumOpen` joined every guard list that names `state.soundboardOpen`/`state.tracing` (both movement
gates, `canBeHurt`, both `hintReady`s, `syncTouchUI`, `phonHideSound`, `musicDialogueOpen`), plus
`closeAnyDialog` and its own key-handler branch: **`A`** swaps case, **`[`/`]`** step faces from a plate,
**`Esc`** backs a plate out to the grid and then closes.

### 15.6 What M4 deliberately did not do

- **No per-face average on a plate.** §13 #7's answer stands: that is a report card, and the personal best
  per cell is the honest version.
- **No re-trace button.** §8.1 is the whole design — you beat a cell by meeting that letter in that face
  again, which is what makes a duplicate worth catching.
- **The Tree of Faces is still M5.** The plate names its branch (`trGroupPath`) and the group milestone is
  reserved; the map itself is the next milestone's work.
