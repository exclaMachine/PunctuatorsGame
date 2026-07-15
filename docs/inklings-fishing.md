# Inklings — Phoneme Fishing (the Sound-Fish / the Phonicon)

Planning doc. A **fishing** mechanic where you cast into the game's existing **ponds** and reel up
**sounds**. A phoneme surfaces on your line and you **type its romanized spelling** to set the hook;
catches fill a **Phonicon** (the sound-collection). Fishing is the game's answer to a gap: right now
**letters** come from combat and **words** from the desk, but **sounds have no acquisition verb** — this
is it.

> **letters ← combat · words ← the desk · sounds ← fishing**

Status: **plan only — not implemented.** Reflects a 2026-07 planning session (three settled forks below).

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
{ ipa:"ʃ", roman:["sh"], accepts:["sh"], hintWord:"ship", tier:"common", depth:1 }
{ ipa:"θ", roman:["th"], accepts:["th"], hintWord:"thin", tier:"mid",    depth:2 }
{ ipa:"uː", roman:["oo"], accepts:["oo","u"], hintWord:"moon", tier:"common", depth:1 }
```

- `ipa` — the symbol shown on the line at shallow depth.
- `roman` / `accepts` — the **typed answer(s)**. Many phonemes have several common spellings (`/uː/` →
  "oo", "u", "ew"); `accepts` is the **lenient set** so the input isn't a memory-trap. The primary `roman`
  is what a hint reveals.
- `hintWord` — a keyword example (`/ʃ/` → "**sh**ip") shown at shallow depth to teach the sound→spelling map.
- `tier` — rarity (common / mid / rare), driving spawn weight and where a phoneme skews (rarer sounds bite
  in deeper / farther-from-home water, echoing the letter-unlock distance scaling).
- `depth` — the shallowest depth at which this phoneme appears (see §4.2).

This file is **hand-authored** (44 entries — trivial next to the Gutenberg/WordNet pipelines) and
**data-driven** so the romanization map and tiers tune without code. It is the **canonical sound→spelling
teaching table**, reusable by the Sound Garden later.

### 3.2 The Phonicon (the sound-dex)

- **New saved state `state.phonicon`** — which phonemes you've caught + a count/first-caught record, e.g.
  `{ "ʃ": {count, first}, "θ": {...} }`. Persists forever like `dex` / `resources` / `bestiary`.
- **A Phonicon view** — a grid of the 44 phonemes, caught ones revealed (symbol + romanization + hint word,
  clickable for a little sound-fact card), uncaught ones as locked `???` slots. Mirror the **bestiary**
  reveal pattern (`dexView`-style gating) and its overlay chrome. Opened from the toolbar / a touch button.
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

1. **The phoneme engine + `data/phonemes.json`** — the 44-entry inventory + romanization/`accepts` map +
   the runtime lookup. (Shared with poetry §11.1 — build once.) Parse-check known symbols; no UI yet.
2. **Cast interaction at water** — `tileInFront()` water detection + CAST prompt (`E`/touch/toolbar), the
   `#fishing` modal shell, overlay guards. Proves you can fish from the bank.
3. **Shallow + Mid loop** — cast→bite→type-the-romanization→catch, depth hiding the symbol, SFX +
   celebration-queue praise. The playable core.
4. **The Phonicon** — `state.phonicon` + the sound-dex view (bestiary-style reveal) + snapshot/version bump.
   Proves the collection + save.
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
- **Fish fiction** — whether catches are literally "sound-fish" creatures (art, names, a bestiary-style
  flavor) or abstract phoneme tokens. Cosmetic, open.

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
