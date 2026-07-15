# Inklings — Sound-Effect Minibosses & Shouts (the Onomatopoeia heroes)

Status: **TENTATIVE / exploratory — no MVP yet.** This is a captured brainstorm, not an agreed build.
Nothing here is implemented; the design is still being thought through before committing to an MVP. Every
name, power, and mapping below is a **first-draft proposal**, not a spec — and the names/powers are
explicitly flagged **tentative** by the dev. **Do not build from this without a fresh "let's build it"
decision** — when that happens, this doc becomes the plan and gets a real status/build-order section.

The hook: the dev designs **superhero/supervillain characters based on Japanese onomatopoeia & manga sound
effects**, each with a **two-aspect power** — one **word-based** (manipulates letters/text) and one
**physical-based** (a real-world effect) — usually with a **pun name**. (Author examples of the character
style: *Roundabout* — rounds letters L→C **and** orbits objects; *Excla Machine*; *Semicolonel*.) This doc
captures how that character line could become an Inklings feature: the characters are **minibosses** you
defeat to **absorb their sound**, which grants a **"shout"** power (Skyrim-Thu'um-style). Tentatively, the
power could instead live in an **equippable object** rather than the character/shout directly (§4.1).

Cross-refs: [`inklings.md`](inklings.md) (core loop, daily-seeded map, combat, bestiary, Equipment slots),
[`inklings-fishing.md`](inklings-fishing.md) (**the deferred "speak-the-phoneme" voice tier this shares tech
with** — §3; the sound-fish acquisition pattern — §5),
[`inklings-companions.md`](inklings-companions.md) (the equipped-buddy / passive-bonus slot pattern this could
reuse or sit beside), [`inklings-poetry.md`](inklings-poetry.md) §3.4 (the axe-chop **rhythm** primitive a
shout-timing variant could borrow), [`inklings-ciphers.md`](inklings-ciphers.md) (Morse/rhythm framing).

---

## 0. The pitch — defeat a sound, learn its shout

Each **onomatopoeia character** is a **field miniboss** whose attacks *are* its sound effect (the katakana
SFX flashes on-screen, manga-style, when it strikes). Beating it **absorbs the sound** → you **learn its
shout**. From then on, the shout is a power you can invoke. This is the "absorb the dragon soul → unlock the
Thu'um" beat from Skyrim, mapped onto Inklings' existing **defeat → bestiary → reward** flow.

Two things make this fit Inklings specifically rather than being a generic power system:

1. **It fills a verb the game has flagged but not spent — voice.** Fishing's doc already reserves a
   **speak-the-sound tier** (online-only, opt-in) and correctly notes recognizers *flail on bare phonemes*.
   Onomatopoeia are **full syllabic words** (`pika-pika`, `goro-goro`, `dokan`), which are exactly what
   speech recognizers *are* tuned for — so a **spoken-shout** feature is the **easier** voice feature, not the
   harder one (§3). Voice stays an **opt-in online enhancement**; a **typed/button** invocation is always the
   offline spine.
2. **The dev's two-aspect character design already matches Inklings' two verbs.** Every character has a
   **word power** and a **physical power**; Inklings already has a **desk** (word) verb and a **field**
   (combat/traversal) verb. So each shout naturally splits (§2):

   > **Speak/invoke the sound in the field = the physical aspect. Type the same sound at the desk = the word
   > aspect. Voice to fight, text to craft.**

This layer is **orthogonal** to the core hunt→spell→library loop — it's a power/traversal system layered on
top, not a replacement for spelling.

---

## 1. The roster (TENTATIVE names + powers)

Names are puns that **bury a doubled onomatopoeia inside a recognizable English word or proper noun** (the
dev's preferred pun style). Powers are split **word aspect / physical aspect**. All of this is a first draft
to react to — swap freely.

| Character | Sound (meaning) | Buried in | Word aspect (desk) | Physical aspect (field / shout) |
| --------- | --------------- | --------- | ------------------ | ------------------------------- |
| **Shiin-obi** | シーン *shiin* (silence) | shinobi | silences a letter (silent-e / delete it from a word) | a **silence field** that freezes noisy creatures + cancels enemy effects |
| **Goro-illa** | ゴロゴロ *goro-goro* (rolling thunder) | gorilla | **rolls/tumbles** a word (reverse or anagram-scramble) | barrels through as a boulder + thunderclap knockback (AoE) |
| **Cham-Pyon** | ぴょんぴょん *pyon-pyon* (hopping) | champion | — | a **dash/leap** (traversal — hop water/gaps), rabbit-boxer strikes |
| **Tsun-ami** | つんつん *tsun-tsun* (aloof/poking) | tsunami | — | a **tidal wave** — sweeps creatures, floods a lane |
| **Kura-ken** | くらくら *kura-kura* (dizzy) | kraken | scrambles a bench slot's letter | a **dizzy/confuse** pulse — creatures wander/miss |
| **Gura-vity** | ぐらぐら *gura-gura* (wobbling) | gravity | — | **wobble/drop** — stuns, shakes loot loose |
| **Kasa-nova** | カサカサ *kasa-kasa* (dry rustle) | Casanova | — | paper-rustle charm; wind that scatters light foes |
| **Poi-son** | ポイ *poi* (toss/discard) | poison | **discard** a bench letter, draw a fresh one | lobs ink-globs that weaken a beast over time |
| **Katapult** | カタカタ *kata-kata* (clatter/typing) | catapult | types/launches letters faster | **catapults** a typed letter as a projectile |
| **Mofu-sa** | モフモフ *mofu-mofu* (fluffy) | Mufasa | — | a fluffy guard-lion; soaks a hit (tank/shield) |
| **Uki-lele** | ウキウキ *uki-uki* (cheerful) | ukulele | — | a cheer aura — haste / morale buff |
| **Fura-oh** | フラフラ *fura-fura* (staggering) | pharaoh | — | a woozy curse — creatures stagger |
| **Waku-nda** | ワクワク *waku-waku* (thrilled) | Wakanda | — | hype burst — crit/adrenaline window |
| **Poka-Dot** | ぽかぽか *poka-poka* (warm/sunny) | polka dot | — | warm sun — heals, ripens crops (farm tie-in) |
| **Bat-tan** | バタン *batan* (door slam) | Batman | — | a concussive **slam** — short-range blast |
| **Gobo-lin** | ゴボゴボ *gobo-gobo* (gurgling) | goblin | — | swamp-gurgle — slows/mires foes on a tile |
| **Pistachi-o** | パチパチ *pachi-pachi* (crackle/clap) | pistachio | — | crackling sparks — chained small hits |
| **Puni-sher** | ぷにぷに *puni-puni* (squishy) | Punisher | — | a squishy bounce — reflects/absorbs a hit |
| **Jime-ny** | ジメジメ *jime-jime* (damp) | Jiminy (Cricket) | — | a clammy debuff aura (dampens enemy buffs) |

**Shorthand for the field shouts** (the "words of power" you'd yell / type): `PIKA!` flash-stun + reveal ·
`GORO!` roll-knockback · `DON!`/`BAN!` concussive blast · `SHIIN!` silence-freeze · `MERA!` fire cone · `ZAA!`
downpour (waters farm / douses The Kindle) · `PYON!` leap · `FUWA!` levitate/slow-fall. These map onto the
roster above (and to more sounds than there are named characters yet — the shout vocabulary can outgrow the
miniboss cast).

---

## 2. The two-aspect split (word ↔ physical, desk ↔ field)

The load-bearing design idea. A learned sound is **one power with two faces**, invoked in two places:

- **Field (physical):** invoking the shout does the world-effect — knockback, silence, fire, a leap. This is
  where the **voice option** lives (§3): *say the sound to trigger it.*
- **Desk (word):** the **same sound typed at the writing desk** applies its letter-manipulation — `SHIIN`
  silences a letter, `GORO` tumbles a word, `POI` discards-and-redraws. This reuses the desk/bench as a
  **spellcasting console**, not a new UI.

This mirrors weapons being **dual-use** (core decision #6: an implement is *how you fight* **and** *a verb at
the desk*). A shout is the same contract, one layer up: **a sound is how you fight and a verb at the desk.**

---

## 3. The voice-shout mechanic (Skyrim-Thu'um-style) — feasible, online, opt-in

The dev's spark: a **spoken-shout** power like Skyrim's Thu'um (which players drove with the Kinect mic) —
**each onomatopoeia yells a different effect.**

- **Why it's more viable than the deferred phoneme-speech tier.** Fishing §4.4 defers speaking *isolated
  phonemes* because recognizers are **word-tuned and flail on a bare `/ʃ/`**. Onomatopoeia dodge that exact
  wall: `pika-pika`, `dokan`, `goro` are **whole words** — the thing recognizers do best. So the shout system
  is the **first practical use** of the voice idea, ahead of phoneme-speech.
- **Tech:** browser `SpeechRecognition` / `webkitSpeechRecognition` (Chrome streams to Google's servers →
  **online, third-party, opt-in**). A tight **grammar of ~10–20 shout words** makes matching far more reliable
  than open dictation. No mic → the feature is simply off; nothing breaks.
- **Accessibility & the offline rule (hard requirement).** Voice is the **opt-in online enhancement, never a
  gate.** Every shout must have a **typed/button** invocation as the offline spine — you can always *type*
  `SHIIN` (or tap a shout button) to fire it. This is the same **scoped, documented exception** to the
  fully-offline rule that fishing §4.4 already sanctions — flagged here so it stays a conscious choice, not a
  silent dependency.
- **Feel:** on a recognized shout, flash the **katakana SFX** on the canvas (manga style) + a chiptune cue,
  then apply the effect. A **rhythm/charge** variant could borrow poetry's axe-chop timing (§ poetry 3.4) —
  yell/type in rhythm for a stronger effect — but that's a later flourish, not v1.

---

## 4. Acquisition & where the power lives

- **Learn by defeating the miniboss (primary).** Each onomatopoeia character spawns as a rare field miniboss
  (its attacks *are* its SFX). Defeat → **absorb the sound** → the shout unlocks (bestiary logs it; a
  `state.shouts` set records which are learned, like `state.fables`). Very Skyrim: kill the source, gain the
  word of power.
- **Or fish it up (secondary, ties to the sound niche).** Because *sounds ← fishing* is the established niche
  ([`inklings-fishing.md`](inklings-fishing.md)), an onomatopoeia could instead be a **legendary "SFX
  leviathan"** reeled from a rare deep fish-spot — catching it teaches the shout. Keeps rewards in the
  **sounds** lane (doesn't pay ink/potions/wood/décor — each another system's home).

### 4.1 TENTATIVE: the power tied to an object

**Flagged tentative by the dev, parked as an option, not a decision.** Instead of the shout being an innate
learned ability, the power could live in an **equippable object** — a charm/relic/instrument you slot in an
**Equipment slot** (reusing the companion/weapon equip pattern). Implications to weigh if this route is taken:

- **Pro:** makes powers **swappable** (equip one shout-object at a time, like companions), gives a **loot
  target** (the object drops from the miniboss), and sidesteps "a growing always-on spellbook" balance.
- **Con / open:** does the **object** enable *both* the field shout and the desk word-verb, or just one? Does
  it need to be equipped to *type* the sound at the desk too? How does it interact with the weapon/companion
  slots (a third slot, or shared)? These are unresolved — see §6.
- **Middle path:** the object could be the **key that unlocks** the shout permanently (consume/attune once),
  after which the ability is innate — combining the loot hook with an always-available power.

---

## 5. State & data (sketch, when built)

- **`data/shouts.json`** (or fold into `data/creatures.json`) — the roster: id, pun name, the sound/SFX
  string, katakana, the **word aspect** (desk effect) and **physical aspect** (field effect), acquisition
  (miniboss vs sound-fish), and (if §4.1) the object. Data-driven so names/powers/art swap without code
  (they're all tentative).
- **`state.shouts`** — learned-shout set (durable, like `state.fables`). If §4.1, instead/also a
  `state.shoutObjects` owned/equipped record folding into the Equipment save.
- **Voice config** — an opt-in toggle persisted in `localStorage` (mic off by default); recognition grammar
  built from the learned-shout list.
- **Bump the snapshot version**, add keys to `snapshot()`/`applySnapshot()` + Export/Import (additive; old
  saves default empty).

---

## 6. Deferred / open

- **Innate shout vs object-bound (§4.1)** — the central undecided fork. Object gives loot + swappability;
  innate is simpler. Middle path = object attunes the shout once.
- **One shout at a time vs a spellbook** — equip-one (weapon/companion style) or a growing freely-drawn set.
- **Combat-only vs traversal/utility** — should shouts also solve the world (PYON to cross water, ZAA to
  farm), BotW-style, or stay combat powers?
- **Voice reliability & scope** — how big the shout grammar can grow before recognition degrades; offline
  fallback UX; whether a **rhythm/charge** timing layer (poetry §3.4) is worth it.
- **Roster & puns are all tentative** — names, powers, which sounds become characters vs just shouts; whether
  villains (antagonist minibosses) and heroes both appear.
- **Japanese literalness** — full **katakana** on-screen (a Kaimoju kana↔romaji bridge) vs romaji-only flavor.
- **Slot economy** — if object-bound, how it shares/adds to the existing Weapon/Companion Equipment slots.

---

## 7. Conflicts & considerations

1. **Reward routing** — learning shouts pays the **sounds/power** niche; keep it out of ink/potions/Feats/
   wood/décor (each another system's home). If fished, it's a legendary sound-fish, not a new currency.
2. **Offline rule (§3)** — voice is **opt-in, online, never a gate**; the typed/button invocation is the
   offline spine. Same sanctioned exception as fishing §4.4 — documented, not silent.
3. **Overlay/celebration traffic** — learning a shout + shout feedback route through the single-at-a-time
   celebration queue (grammar-systems §2) so they don't clamor with companions/guides.
4. **Slot pressure** — if object-bound (§4.1), coordinate with the Weapon + Companion Equipment slots so
   powers don't balloon the equip UI or trivialize combat.
5. **Scope discipline** — this is a **layer on top** of hunt→spell→library, not a new core loop. It must serve
   the core loop (new verbs/traversal/power), not distract from it (core-loop rule).
6. **Shared tech, built once** — the voice-recognition + katakana-SFX pieces should be built so fishing's
   deferred speak tier can reuse them (and vice versa) — don't fork two speech paths.
</content>
</invoke>
