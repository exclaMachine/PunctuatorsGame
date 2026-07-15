# Inklings — Phoneme Fishing (the Sound-Fish / Fish Phoneme)

> **Naming (2026-07-15):** the sound-collection is called **"Fish Phoneme"** in-game (the dev retired the
> coined word *Phonicon*). This doc still says "Phonicon" in places as the **internal codename** — the code
> identifiers stay `state.phonicon` / `openPhonicon` / `#phonicon` / `phoniconOpen` for **save
> compatibility** (save v5 persists `state.phonicon`). Only the **user-facing labels** are "Fish Phoneme".


Planning doc. A **fishing** mechanic where you cast into the game's existing **ponds** and reel up
**sounds**. A phoneme surfaces on your line and you **type its romanized spelling** to set the hook;
catches fill a **Phonicon** (the sound-collection). Fishing is the game's answer to a gap: right now
**letters** come from combat and **words** from the desk, but **sounds have no acquisition verb** — this
is it.

> **letters ← combat · words ← the desk · sounds ← fishing**

Status: **build steps 1–4 shipped; rest plan-only.** Reflects a 2026-07 planning session (three settled
forks below). **Step 1 done (2026-07-15):** the hand-authored inventory `data/phonemes.json` (40 GA phonemes)
+ the pure runtime lookup live in the `/* FISHING */` block of `inklings.html` (`PHONEMES`/`PHONEMES_BY_IPA`,
`pickPhoneme(castDepth,rand)` weighted by tier + depth-gated, `phonemeAccepts(ph,typed)` lenient match,
`normPhonemeAnswer`, `phonemeReveal(ph,castDepth)`). **Step 2 done (2026-07-15):** the cast interaction + the
`#fishing` modal **shell**. `nearWater()` (reuses `tileInFront()`, field-only) gates a **CAST prompt** — `E`
via `tryUseBench`, a dimmable `tb-fish` toolbar entry (lit only facing a pond, via `refreshToolbar`), and a
contextual touch `tc-fish` button (`syncTouchUI`). `openFishing`/`closeFishing`/`renderFishing` run a
self-contained overlay (transient `state.fishing`, added to every overlay guard: movement, `canBeHurt`, the
hints, `syncTouchUI`, `closeAnyDialog`, `musicDialogueOpen`). **Step 3 done (2026-07-15):** the playable
cast→bite→type→catch loop inside the modal — a `fish` state machine (`ready`→`casting`→`biting`→`caught`|
`slip`→`ready`) with a **shallow/deeper** cast choice (depth 1 shows symbol+hint word, depth 2 symbol only;
deep sound-only tier stays deferred), a snappy 0.5–1.6s nibble telegraph, `fishSetHook` grading the typed
romanization via `phonemeAccepts` (lenient/normalized), SFX per beat, and a serialized in-modal praise card
(both catch and miss reveal the sound→spelling, so a miss still teaches). **Step 4 done (2026-07-15):** the
**Phonicon** — persistent `state.phonicon` (`{ ipa: {count, first} }`), `recordPhonemeCatch` filling it on
each catch (returns new-vs-repeat), and a bestiary-style `#phonicon` sound-dex view
(`openPhonicon`/`closePhonicon`/`renderPhonicon`, its own `state.phoniconOpen` flag + guards, a non-contextual
`tb-phonicon`/`tc-phonicon` button) showing a `X/40 caught` grid — caught sounds revealed (symbol · spelling ·
hint word · ×count), uncaught locked `???`. Save bumped **v4→v5**, `phonicon` added to
`snapshot`/`applySnapshot` (additive; old saves default `{}`). A **first-catch flourish** is the louder
`unlockbig` SFX + an in-modal "✨ new sound" card; the polished field-level celebration-queue pop stays
step-5 tuning. **Fish fiction added (2026-07-15):** each phoneme is now a named **sound-fish** (`fish`/`emoji`/
`habitat` fields on `data/phonemes.json`) — the creature shows on the line while guessing (name hidden until
the catch), obscure non-hinting fish for rarer sounds, all rendered through the single swap point `fishGlyph()`
so emoji→sprite is a one-function change (§3.1, §7); `habitat` is a dormant open-vocab tag (pond/lake/river/
ocean) for future edge-water maps, all catchable in ponds now except the two ocean-only rares. **Renamed +
Guide tab added (2026-07-15):** the collection's **user-facing name is now "Fish Phoneme"** (the coined word
*Phonicon* was retired; code identifiers keep `state.phonicon`/`openPhonicon`/`#phonicon` for save compat).
The view gained a **Guide tab** (`data-phontab` "sounds"/"guide" via `phonShowTab`, mirroring the Curator /
Apothecary guide tabs) — a **phonetic-alphabet primer** (what IPA is, consonants/vowels/diphthongs, how to
read the symbols); Esc/Tab steps Guide→Sounds before closing. The word-level shared phoneme engine (`data/pronunciations.json` +
`rhymeKey`/`syllables`, poetry §11.1) stays **deliberately deferred** — fishing v1's typed loop doesn't
consume it; stand it up when poetry / the Sound Garden needs it.

Cross-refs: [`inklings.md`](inklings.md) (the water tiles this reuses; the dex/collection pattern the
Phonicon mirrors), [`inklings-poetry.md`](inklings-poetry.md) §3 (the **phoneme engine** — `rhymeKey`,
`syllables`, the IPA vowel set, `data/pronunciations.json` — fishing is the **first raw per-phoneme use** of
that data; poetry uses it at word granularity, fishing at phoneme granularity),
[`inklings-farming.md`](inklings-farming.md) §5 (the parked **Sound Garden** IPA pass — the Phonicon becomes
its **supply**), [`inklings-grammar-systems.md`](inklings-grammar-systems.md) §2 (the single-at-a-time
celebration queue new catches route through), [`inklings-ciphers.md`](inklings-ciphers.md) (Morse/semaphore
livestock — a later **rhythm-reel** could share their sound/rhythm framing).

---

## 0. TL;DR

- **Fish at existing water.** Field screens already grow `T_WATER` ponds (`genTiles`). Fishing is an
  **`E`-interaction at a water tile** (proximity check like `nearShop`/`nearBench`), **not** a new zone. No
  new terrain, no authored lake.
- **The catch = a phoneme; the input = typing its romanization.** A phoneme surfaces on the line; you type
  its **romanized spelling** (`/ʃ/ → "sh"`, `/uː/ → "oo"`, `/θ/ → "th"`) to set the hook. Fully offline,
  no new assets, on-theme (Inklings is already a typing game).
- **Depth = difficulty.** Shallow casts **show the IPA symbol + a hint word**; deeper casts **hide the
  symbol**; the deepest tier is **sound-only** — deferred until there's an audio source (§4.3, §7).
- **Reward = the Phonicon**, a **phoneme collection** (a sound-dex). It is the **supply** for the parked
  **Sound Garden** (farming §5) and a second, raw-phoneme consumer of the poetry phoneme engine. Fishing's
  reward home is **sounds** — it doesn't touch ink / potions / Feats / wood / décor (each POS's home stays
  clean).
- **Speak-the-phoneme is a desired future level, explicitly deferred** (§7). If/when speech recognition is
  good enough at isolated phonemes, add a **"speak the sound" tier**. This is allowed to be **online-only** —
  the game is web-served, so that tier may gate on connectivity — a **scoped, opt-in exception** to the
  offline rule (decision #9), flagged here rather than silently taken.

---

## 1. Decisions (settled with the dev)

1. **Reward = a phoneme/sound collection (the Phonicon).** Fishing fills the empty **"sounds"** niche:
   letters←combat, words←desk, **sounds←fishing**. The Phonicon is the **supply** for the parked Sound
   Garden (farming §5) and gives the poetry phoneme engine its first **raw-phoneme** use. It deliberately
   **does not** pay ink/potions/Feats/wood/décor — each of those is another system's home (grammar-systems
   §7, poetry §7).
2. **Fish at existing pond water tiles — no new zone.** Reuse the `T_WATER` tiles `genTiles` already
   generates on field screens. Fishing is an **`E`/touch interaction** when the tile you're facing is water
   (§2). Zero new terrain, no authored lake to build. (Contrast poetry's authored Forest — fishing is
   deliberately lighter-weight.)
3. **Type the sound (v1). No microphone.** Input is **typing the phoneme's romanization** — robust, offline,
   asset-free, and native to a typing game. **No humming / pitch / mic** in v1 (the dev explicitly doesn't
   want a hum mode). Difficulty comes from **depth** hiding the symbol, not from input modality.

**Deferred-but-desired (documented, not built):**

4. **A "speak the phoneme" level is wanted** once speech recognition can reliably grade **isolated
   phonemes** (today it can't — see §4.4). That tier may be **online-only** and is an accepted **scoped
   exception** to the offline rule (decision #9), because the game itself is served online; it would be an
   **opt-in level that only unlocks when the player is online**, never a gate on the rest of fishing.

---

## 2. Where it lives (architecture) — the ponds you already have

Fishing needs **no new room**. It rides the field screens' existing water:

- **Interaction:** when the player faces a `T_WATER` tile (reuse the `tileInFront()` / `blockedAt` sampling
  the movement code already does), surface a **CAST** prompt — `E` on desktop, a contextual touch button in
  the `#tact` util row, and a `#side-left` toolbar entry (dim unless near water, exactly like
  `refreshToolbar()` dims Shop/Shelf by proximity). No approach onto the tile (water blocks movement via
  `walkType`); you fish **from the bank**, like walking up to the desk/stall.
- **The cast → bite → set-hook loop** runs in a **self-contained `#fishing` modal** (`state.fishing`,
  styled off the other retro-pixel overlays), added to every overlay guard (movement, `canBeHurt`, hint,
  `syncTouchUI`) the way `state.bestiaryOpen` / `state.apothecaryOpen` are. It does **not** need canvas
  integration in v1 — it's a dialog, like the desk/shop — though a later polish pass could animate a bobber
  on the world canvas.
- **Separate `/* FISHING */` module.** Keep it its own block calling the shared SFX / celebration-queue /
  modal helpers, so nothing in combat or the desk is touched.

**Daily-map interaction:** water layout is **deterministic per day** (`daySeed`), so which ponds exist is
stable all day and fresh tomorrow — same Wordle rhythm as everything else. Whether a given pond is
"fished out" for the day (a soft daily cap, like creature captures) is an **open tuning question** (§8).

---

## 3. The catch: phonemes & the Phonicon

### 3.1 The phoneme inventory (authored data)

`data/phonemes.json` — the ~44 English phonemes, each with:

```
{ ipa:"ʃ", roman:"sh", accepts:["sh"], hintWord:"ship", tier:"mid", depth:2, fish:"Shad", emoji:"🐡", habitat:["pond","river"] }
{ ipa:"ð", roman:"th", accepts:["th"], hintWord:"this", tier:"rare", depth:3, fish:"Coelacanth", emoji:"🦈", habitat:["ocean"] }
{ ipa:"u", roman:"oo", accepts:["oo","u","ew"], hintWord:"moon", tier:"common", depth:1, fish:"Moonfish", emoji:"🐟", habitat:["pond","ocean"] }
```

- `ipa` — the symbol shown on the line at shallow depth.
- `roman` / `accepts` — the **typed answer(s)**. Many phonemes have several common spellings (`/u/` →
  "oo", "u", "ew"); `accepts` is the **lenient set** so the input isn't a memory-trap. The primary `roman`
  is what a hint reveals.
- `hintWord` — a keyword example (`/ʃ/` → "**sh**ip") shown at shallow depth to teach the sound→spelling map.
- `tier` — rarity (common / mid / rare), driving spawn weight and where a phoneme skews (rarer sounds bite
  in deeper / farther-from-home water, echoing the letter-unlock distance scaling).
- `depth` — the shallowest depth at which this phoneme appears (see §4.2).
- `fish` — the **sound-fish's display name** (the "Fish fiction" of §7, now built). Revealed **only on the
  catch/reveal**, never while the player is still guessing, and deliberately **obscure for rarer sounds** so
  the name can't give the answer away (e.g. `/ʒ/` → "Mirage eel", `/ð/` → "Coelacanth"). Non-hinting is the
  point — the fish is flavor, not a crib.
- `emoji` — a **placeholder glyph** for the creature, rendered through the single swap point **`fishGlyph(ph)`**
  in `inklings.html` (per docs/inklings.md "Emoji are placeholders"). Real sprite art = edit that one function;
  the emoji repeats across entries because the fish *name* carries the identity until art exists. `fishGlyph`
  also supports a `silhouette` mask (used for uncaught Phonicon slots — a generic mystery fish — and available
  to hide the creature's shape while guessing).
- `habitat` — a **dormant, open-vocabulary tag array** (`pond` | `lake` | `river` | `ocean` | …, extensible)
  for the future edge-water maps (§0). **Not yet used to gate spawns** — `pickPhoneme` ignores it — but
  authored ahead so the feature needs no data pass later. Every fish includes `pond` (so all 40 are catchable
  now) **except** the two rare deep-sea fish (`/ð/` Coelacanth, `/ʒ/` Mirage eel), which are `["ocean"]`-only
  to seed the "certain fish live only in the ocean" idea. When ocean water and habitat gating both exist, those
  two become ocean-exclusive; until then nothing is stranded.

This file is **hand-authored** (44 entries — trivial next to the Gutenberg/WordNet pipelines) and
**data-driven** so the romanization map and tiers tune without code. It is the **canonical sound→spelling
teaching table**, reusable by the Sound Garden later.

### 3.2 Fish Phoneme (the sound-dex — internal codename "the Phonicon")

- **New saved state `state.phonicon`** — which phonemes you've caught + a count/first-caught record, e.g.
  `{ "ʃ": {count, first}, "θ": {...} }`. Persists forever like `dex` / `resources` / `bestiary`.
- **A Fish Phoneme view** — a grid of the phonemes, caught ones revealed (sound-fish glyph + symbol + name +
  romanization + hint word), uncaught ones as locked `???` slots. Mirror the **bestiary** reveal pattern
  (`dexView`-style gating) and its overlay chrome. Opened from the toolbar / a touch button. **Two tabs**
  (mirroring the Curator / Apothecary guide tabs): **Sounds** (the reveal grid) and **Guide** — a
  phonetic-alphabet primer teaching what IPA is (one symbol = one sound), consonants / vowels / diphthongs,
  and how to read the symbols. Esc/Tab steps back from Guide → Sounds before closing.
- **Coverage-honest:** the Phonicon's target is the **fixed 44-phoneme inventory**, not the whole
  dictionary, so "100%" is a real, reachable goal (unlike the open-ended word dex).

### 3.3 What the Phonicon feeds (the sink)

Caught sounds are a **supply**, not a dead collection:

- **Sound Garden (farming §5, parked):** the IPA-articulation-chart garden harvests **phonemes into words**.
  The Phonicon is its **seed stock** — you fish a `/ʃ/`, then plant/spend it in the Sound Garden. This gives
  the parked pass a concrete acquisition front end.
- **Poetry phoneme engine (poetry §3):** poetry consumes phonemes at **word** granularity (rhyme keys,
  syllable counts). Fishing is the **raw-phoneme** counterpart — the same `data/pronunciations.json` /
  IPA-vowel-set machinery, one level lower. Building the phoneme engine once serves both.
- **(Open) a fishing-native use** — whether the Phonicon *also* powers something fishing-only (a sound-based
  cosmetic, a "perfect rhyme lure", etc.) is a §8 open question. v1's job is just to **fill the Phonicon**.

---

## 4. The fishing loop (v1)

### 4.1 Cast → bite → set the hook

1. **Cast** at a water tile (§2). A short wait / nibble telegraph (a bob animation + SFX), tuned so it's
   snappy, not idle-timer boring.
2. **A phoneme surfaces on the line** — rendered per the current **depth tier** (§4.2): the IPA symbol +
   hint word (shallow), symbol only, or nothing yet (deep).
3. **Set the hook = type the romanization.** The player types the sound's spelling; a match against the
   phoneme's `accepts` set **lands the catch**. A miss lets it slip (no penalty beyond the lost cast — keep
   it low-stakes and re-castable, matching the game's cozy tone).
4. **On a catch:** SFX + a **single-at-a-time celebration** (grammar-systems §2 queue, so fishing praise
   doesn't clamor with À La Modal / Antonym / Synonomouse), record to `state.phonicon`, and (if new) a
   first-catch flourish like a new-word/new-letter unlock.

### 4.2 Depth = difficulty (the core knob)

Depth is the difficulty dial, chosen at cast (e.g. a shallow vs deep cast, or which pond — bigger/farther
ponds run deeper). Each tier **hides more**:

| Depth | Shows | Skill it drills | Notes |
| ----- | ----- | --------------- | ----- |
| **Shallow** | IPA symbol **+ hint word** (`/ʃ/`, "ship") | learn the symbol→sound→spelling map | the tutorial tier |
| **Mid** | IPA symbol **only** (`/ʃ/`) | recall the sound from the symbol alone | the staple tier |
| **Deep** | **nothing visual** — sound-only | pure ear ID | **deferred** — needs an audio source (§4.3) |

Rarer phonemes (`tier`) skew to deeper/farther water, so depth also paces **what** you can catch, not just
**how hard** it is — reusing the letter-unlock "rare skews far from home" instinct.

### 4.3 The deep (sound-only) tier needs audio you don't have yet

Deep fishing "on sound alone" requires **playing the phoneme** so the player IDs it by ear. **The
`IPA-fan-game/IPAaudio/` folder is empty** — there is no bundled per-phoneme audio today. Options, none free:

- **Bundled recorded phoneme clips** (`sounds/phonemes/ʃ.mp3` …) — cleanest result, but real recording work
  (~44 clips); they'd be assets like `Alpha.png`, not a runtime service, so **offline-safe**.
- **OS `speechSynthesis`** — local + offline, but the voice is robotic and **word-oriented**; coaxing it to
  utter a bare IPA phoneme is unreliable. Usable as a stopgap for `hintWord` playback, not clean phoneme ID.

**v1 ships Shallow + Mid (visual, typed) only.** Deep/sound-only is **deferred behind an audio source**
(§7). Flag before it becomes load-bearing.

### 4.4 Microphone / "speak the phoneme" — deferred, and why (decision #4)

The dev wants a **speak-the-sound** level eventually. Recording the honest state so it isn't attempted
prematurely:

- **Cloud `SpeechRecognition` (`webkitSpeechRecognition`)** — in Chrome this **streams mic audio to Google's
  servers** (not on-device), is Chrome-mostly, needs a network, and is **tuned for words, not isolated
  phonemes** (it flails on a bare `/ʃ/`). So it's both **unreliable for the task** and a **third-party
  service**.
- **The offline-rule exception (accepted, scoped):** because Inklings is itself **web-served**, the dev has
  OK'd making a future speak-the-phoneme tier **online-only** — an **opt-in level that only unlocks when the
  player is online**, a **deliberate, narrow exception** to decision #9 (fully-offline, no third-party
  service). It **never** gates the rest of fishing, and the offline visual/typed tiers remain the spine. This
  is documented (not silently swapped) so the exception is a **conscious** one, unlocked **only if/when
  recognition can actually grade isolated phonemes**.
- **Not the offline-mic fuzzy path:** `getUserMedia` + `AnalyserNode` can do loudness/pitch/rough vowel
  formants **locally**, but **cannot** reliably distinguish consonants or fine phonemes — and the dev
  explicitly doesn't want a hum/pitch mode. So the *offline* mic is **not** the route to speak-the-phoneme;
  the route is real recognition, accepted as online-only when it's ready.

---

## 5. Data & state

- **`data/phonemes.json`** — the 44-phoneme inventory (§3.1): symbol, romanizations/`accepts`, hint word,
  tier, depth. Hand-authored, data-driven.
- **`data/pronunciations.json` / the phoneme engine** — **shared with poetry** (poetry §8). If poetry ships
  first, fishing reuses it; if fishing ships first, it stands up the same `build_phonemes.py` subset + the
  IPA-vowel-set runtime. Either way, **build the phoneme engine once**.
- **`state.phonicon`** — the caught-sound record (§3.2), persistent like `dex`. **Bump the snapshot
  version**; add to `snapshot()`/`applySnapshot()` + Export/Import (additive; old saves default empty).
- **No new terrain/room state** — fishing rides existing `T_WATER` tiles (decision #2). Any per-day
  "fished-out" flag (if added, §8) is **day-scoped/transient** like `state.captured`, not a durable record.

---

## 6. Build order (each a shippable milestone)

1. **The phoneme engine + `data/phonemes.json`** — the ~44-entry inventory + romanization/`accepts` map +
   the runtime lookup. Parse-check known symbols; no UI yet. **✓ Shipped 2026-07-15** (40 GA phonemes;
   `/* FISHING */` block in `inklings.html`). Scope note: only the **fishing-native** inventory+lookup was
   built; the **word-level** phoneme engine (`data/pronunciations.json`, poetry §11.1) — the "build once"
   shared piece — was **deferred** since fishing v1's typed loop doesn't consume it (poetry/Sound Garden
   will stand it up).
2. **Cast interaction at water** — `tileInFront()` water detection + CAST prompt (`E`/touch/toolbar), the
   `#fishing` modal shell, overlay guards. Proves you can fish from the bank. **✓ Shipped 2026-07-15**
   (`nearWater()`, `tb-fish`/`tc-fish` proximity buttons, `openFishing`/`closeFishing` overlay + guards;
   modal body is a step-2 placeholder pending the step-3 loop).
3. **Shallow + Mid loop** — cast→bite→type-the-romanization→catch, depth hiding the symbol, SFX +
   celebration-queue praise. The playable core. **✓ Shipped 2026-07-15** (`fish` state machine +
   `fishCast`/`fishSetHook`/`renderFishing`; shallow/deeper cast choice, nibble telegraph, lenient typed
   grading, in-modal praise that reveals the sound→spelling on both catch and miss). Praise is serialized
   in-modal for now; the global celebration-queue **first-catch** flourish lands with step 4 (needs
   `state.phonicon` to know a catch is new). Catches are **not persisted yet** — that's step 4.
4. **The Phonicon** — `state.phonicon` + the sound-dex view (bestiary-style reveal) + snapshot/version bump.
   Proves the collection + save. **✓ Shipped 2026-07-15** (`recordPhonemeCatch` fills `state.phonicon` on
   catch; `#phonicon` reveal grid `X/40 caught` via `tb-phonicon`/`tc-phonicon`; save v4→v5, additive
   restore). First-catch flourish is minimal here (louder SFX + in-modal ✨ card) — the field-level
   celebration-queue pop is step-5 tuning.
5. **Tuning pass** — rarity/depth skew, cast feel, any daily "fished-out" cap, first-catch flourish.
6. **(Later) Sound Garden hookup** — the Phonicon becomes the Sound Garden's supply (farming §5).
7. **(Deferred) Deep sound-only tier** — once bundled phoneme audio exists (§4.3).
8. **(Deferred, desired) Speak-the-phoneme tier** — online-only, opt-in, once recognition can grade isolated
   phonemes (§4.4).

---

## 7. Deferred / open

- **Deep sound-only tier** — blocked on an **audio source** (bundled phoneme clips vs `speechSynthesis`,
  §4.3).
- **Speak-the-phoneme tier** — desired; **online-only, opt-in**, blocked on **speech recognition** being
  good enough at isolated phonemes (§4.4). Accepted scoped exception to the offline rule.
- **Fished-out / daily cap** — whether ponds have a soft daily catch limit (like creature captures) or are
  freely re-castable. Tuning.
- **Depth selection UX** — how the player picks depth (a shallow/deep cast toggle? pond size/distance? a
  reel/line-length mechanic?).
- **A fishing-native sink** — does the Phonicon *also* power something fishing-only, or is its whole job to
  feed the Sound Garden + poetry? (v1: just fill it.)
- **Rhythm-reel variant** — an optional reeling minigame reusing the poetry axe-chop timing primitive and/or
  the cipher menagerie's Morse/semaphore framing (fish taps its sound in rhythm). Brainstormed, not planned.
- **Canvas bobber polish** — animating the cast/bite on the world canvas instead of a pure dialog.
- **Fish fiction — DECIDED & BUILT (2026-07-15):** catches are literally **sound-fish creatures** — each
  phoneme has a `fish` name + `emoji` placeholder glyph in `data/phonemes.json` (§3.1). The creature shows
  on the line while guessing (name hidden), the name reveals on catch, and the Phonicon shows caught fish
  (uncaught = generic silhouette). Rarer sounds get obscure, non-hinting fish. Emoji render through the
  single swap point `fishGlyph(ph)` so sprite art is a one-function change (docs/inklings.md "Emoji are
  placeholders"). Open sub-items: real per-fish **sprite art**, and the **ocean-only habitat** gating once
  edge-water maps exist (habitat tags are authored but dormant, §3.1). Silhouette-while-guessing (dim the
  creature so its shape also can't hint) is wired in `fishGlyph` but not yet toggled on.

---

## 8. Conflicts & considerations

1. **Reward routing** — fishing pays **sounds** (Phonicon), the currently-unowned niche; it must **not** drift
   into paying ink/potions/Feats/wood/décor (each another system's home — grammar-systems §7, poetry §7).
2. **Phoneme engine is shared** — don't build a fishing-only phoneme lookup; it's the same engine poetry
   needs (poetry §3/§8). Whichever ships first stands it up; the other reuses it.
3. **Romanization leniency** — many phonemes have several plausible spellings; the `accepts` set must be
   **generous** (§3.1) so typing is a teaching aid, not a spelling-bee trap. Tune per phoneme.
4. **Offline rule** — v1 is **fully offline** (typed input, no mic, no audio). The **only** sanctioned
   exception is the **deferred, opt-in, online-only speak-the-phoneme tier** (§4.4), documented so it stays a
   conscious choice.
5. **Overlay traffic** — the `#fishing` modal joins the overlay-guard set (`state.fishing`) and its praise
   routes through the single-at-a-time celebration queue (grammar-systems §2), so it doesn't clamor with the
   companions/guides.
6. **No new terrain** — fishing must stay a light interaction on existing `T_WATER` (decision #2); resist
   growing it into an authored lake zone unless play clearly demands it (that's the Forest's job for poetry).
7. **Daily determinism** — water is `daySeed`-deterministic, so the fishing map is stable-all-day / fresh-
   tomorrow like everything else; keep any fished-out state day-scoped, not durable.
