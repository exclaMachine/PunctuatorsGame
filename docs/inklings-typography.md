# Inklings — The Scriptorium: letter tracing & typeface collecting

**Status: SPECCED 2026-09-11. M1 (the nib engine + the stroke scorer) is BUILT in the standalone bench
`inklings-trace.html` — see §11. Nothing is in `inklings.html` yet; the capture verb is unchanged in game.**

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
   leaves room for them now and §10 spends nothing on them yet.
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

**Nib data shape** (`data/nibs.json`, hand-written, ~12 entries):

```json
{ "id":"broad-30", "name":"Broad quill", "type":"broad",
  "w":0.16, "h":0.035, "angle":30, "group":"garalde" }
```

Widths are in **em units**, matching the skeleton alphabet's coordinate space (§5.1).

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

### 4.1 Font shortlist (each needs a licence check + the dev's eye before it ships)

One font per classification leaf, all PD or OFL:

| Leaf | Candidate | Licence |
| --- | --- | --- |
| Humanist (Venetian) | Cardo / Junicode | OFL |
| Garalde | EB Garamond | OFL |
| Transitional | Libre Baskerville | OFL |
| Didone | Libre Bodoni / Cormorant | OFL |
| Mechanistic (slab) | Bitter / Zilla Slab | OFL |
| Grotesque | Archivo / URW Nimbus Sans | OFL / AGPL+exception |
| Geometric | Jost* (a Futura revival) | OFL |
| Humanist sans | Source Sans / Open Sans | OFL |
| Blackletter (Textura) | UnifrakturMaguntia | OFL |
| Uncial / Insular | TBD — Junicode's medieval set is the lead | OFL |
| Script | Hershey Script | PD |

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

### 5.5 KNOWN DEFECT — the authored stroke directions are backwards (found playing M1, 2026-09-11)

**Not yet fixed, deliberately. Fix before M3 folds the overlay into the game.** The bench works; the
alphabet it traces is wrong, in two separate ways, and the bench is what made them visible.

**(a) Every closed bowl starts at 3 o'clock and runs clockwise.** Seven glyphs share one expression in
`wordshape-draw.html`'s `raw` table — `a b d g o p q` all use `A(0.30,0.48,0.24, 0, 360)`, which begins at
`(0.54, 0.48)` (the rightmost point) and **increases**, i.e. sweeps clockwise on screen and travels *down*
first. No hand writes an `o` that way: the natural motion starts up near 12–1 o'clock and goes
**counter-clockwise**. The dev's reading of `a` is the exception worth preserving — a single-storey `a` *does*
begin near the right — but it still has to turn counter-clockwise from there.

The give-away that this is an oversight rather than a choice: **`c` and `e` are already correct**
(`A(…,-55,-305)` and `A(…,0,-305)` — decreasing, so counter-clockwise). The open curves go the natural way
and the closed bowls go the other, which no deliberate scheme would do.

**(b) `f` is mirrored.** `f: J([[0.44,0.72],[0.44,0.21]], A(0.25,0.21,0.19, 0, -135))` — the arc's centre
(`x 0.25`) sits to the **left** of the stem (`x 0.44`), so the hook sweeps from `x 0.44` out to `x 0.116`:
the top curve points left, where an `f`'s hook must point right. The fix is a centre at about
`stem x + r` with the sweep mirrored. The same stroke also runs **baseline → ascender** (`0.72 → 0.21`),
i.e. bottom-to-top, where an `f` is written from the top of the hook downward.

**Why it matters more than it looks.** Direction is not decoration here — §5.2's gate *refuses* a stroke
that runs against the ideal. So as it stands the bench **rejects the natural motion and rewards the
unnatural one**, and a game shipped on this data would actively teach the wrong hand. That is the one thing
this feature must not do.

**Why nothing caught it earlier:** Wordshape's scorer is an order-blind chamfer field (§5.2) — stroke
direction is *invisible* to it, and the glyphs score identically either way. Tracing is the first consumer
that can see direction at all, so M1 was always going to be where this surfaced.

**Scope when it is fixed:** the bowl expression is shared by seven letters, so one edit moves all of them,
but the **start angle wants a per-letter pass** — `b`/`d`/`p`/`q` bowls attach to a stem and should begin
where the hand leaves it, not at a uniform clock position. Expect to re-read the whole `raw` table with the
same eye rather than patching these nine; `g`'s bowl and `p`'s were not on the dev's list but carry the
identical defect, which is a fair warning about the rest. The fix is **data only** — no engine change, since
the scorer reads direction off the polyline — and it belongs in `wordshape-draw.html`, the alphabet's home
(see [`wordshape.md`](wordshape.md) §12).

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
  ([`inklings-placement.md`](inklings-placement.md)).
- **Nibs are the progression gate.** You buy or craft a nib at the Stall with ink, and a face whose nib you
  don't own is uncatchable-as-a-face (the letter is always catchable). That reuses the shop and gives ink a
  new sink without inventing an economy.

**Save shape** (`state` additions; the Sound Board took v12, so this is **v12 → v13**):

```js
state.faces = { "<faceId>": { "<letter>": grade } }   // best grade per cell
state.nibs  = ["round-mono", "broad-30", …]           // owned
state.nib   = "broad-30"                              // equipped
```

Faces are persistent and uncapped, like `state.caps` — never day-scoped.

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
  capitals, blackletter's ornate majuscules).
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
| `if(full && !isUpper(c.letter))` satchel block | moves to the **trace-open** check, capital bypass verbatim |
| `state.caps` / `state.inv` grant | trace success |
| `state.fx.push({text:"+"+letter})` | trace success |
| `state.bonus` filter (an unlocked bonus letter) | trace success |
| `state.captured.add(c.id)` | trace success — **this is what makes the day's map honest** |
| `recordBestiary("inkling")` | trace success |
| `SFX.play("capture")` | trace success, plus new cues (§11) |
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

## 10. Italics and bold (designed for, not built)

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

## 11. Milestones

- **M1 — the nib engine + the per-stroke scorer, in a bench. BUILT 2026-09-11** — `inklings-trace.html`
  (the `ipa-scrabble.html` → Sound Board pattern, and Wordshape's own), styled off `wordshape-draw.html` so
  the two dev tools read as a pair. What's in it:
  - **The nib (§3)** — `stampStroke` walks the path every `STAMP_STEP` (0.006 em) and stamps the pen:
    `round` a circle, `broad` a **rotated rect at an absolute pen angle** (negated, since canvas y grows
    down, so a positive angle tilts the edge up-right as a calligrapher writes it), `pointed` a circle whose
    radius follows `|dy|^pow` so the weight lands on downstrokes. The contrast is never drawn on — it falls
    out of the shape, which is the claim. Ten nibs inline across the three types (M2 lifts them to
    `data/nibs.json`).
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
  - Deliberately absent: fonts, faces and the album (M2/M4), and §5.4's guidance ladder, which is game-side
    and has nothing to stand on until M3.
  - **Playing it immediately found a data defect, not a code one** — the authored alphabet's closed bowls all
    run clockwise from 3 o'clock and `f` is mirrored. See **§5.5**; it is noted and *not* fixed, and it must be
    fixed before M3.
- **M2 — the faces.** `data/typefaces.json` (group, date, origin, nib, font file, plate notes),
  `data/nibs.json`, the §4.1 shortlist licence-checked and subset into `fonts/` with its licence texts, and
  the nib↔group mapping that makes §5.4's guidance possible.
- **M3 — fold into `inklings.html`.** The trace overlay replaces the letter branch of `doAttack` (§9), field
  glyphs draw in their face with the `Alpha.png` fallback, the six guards, save v12 → v13, the starter face
  and the nib shop entries. **The loop closes here** — this is the milestone after which the game plays
  differently.
- **M4 — the Scriptorium.** The album, the per-face plate with anatomy callouts, the 25/50/100% milestones
  paying ink + décor, the framed-specimen décor item.
- **M5 — the Tree of Faces.** The classification map (Tree-of-Kinds pattern) + group milestones.
- **M6 — italics & bold** (§10).

Sound is **provisional** and nothing depends on it: a nib scratch per stroke whose pitch tracks stroke
length, a pen-lift tick between strokes, and a distinct chime for *face earned* that must not sound like
the existing `capture` (the letter and the face are two different wins).

---

## 12. Open questions

1. **Does a wrong-nib capture tell you so?** Naming the right pen after the fact teaches fastest but
   removes the reason to look. Leaning: say only *that* it was the wrong pen, never which.
2. **Uncial's font** (§4.1) is the one leaf without a clear candidate.
3. **Does the Wordshape bench grow a stroke-order readout + nib preview**, so one tool authors both games'
   glyphs? Cheap, and it is where the skeletons live.
4. **Is a personal best worth showing anywhere but the album?** A tiny `new best` float on the capture is
   nearly free; a per-face average on the plate edges toward a report card.
