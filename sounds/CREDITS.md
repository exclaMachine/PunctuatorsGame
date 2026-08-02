# Bundled instrument sample credits

The instrument samples in `sounds/instruments/<name>/<Note>.mp3` come from the **FluidR3_GM**
General-MIDI soundfont (by Frank Wen), sliced into per-note mp3s by the
**gleitz/midi-js-soundfonts** project.

- Source: https://github.com/gleitz/midi-js-soundfonts (FluidR3_GM branch)
- License: FluidR3_GM is a free, widely-redistributed GM soundfont; the midi-js-soundfonts
  packaging is MIT. Fine for a free educational game with this attribution.
- Format: one mp3 per note, ~25 KB each. **Black keys are named with FLATS** (Eb, Gb, etc.),
  not sharps. MIDI 60 = `C4`, A4 = 440 Hz.

**Anchor set (what's bundled):** one sample every 3 semitones across C3–C6 — 13 notes:
`C3 Eb3 Gb3 A3 C4 Eb4 Gb4 A4 C5 Eb5 Gb5 A5 C6`. At playback the nearest anchor is pitch-shifted
≤1.5 semitones (`playbackRate`) — indistinguishable from per-note sampling in testing, ~⅓ the files.

**Instruments bundled (32 pitched, → GM folder):**
- *Core:* trumpet · violin · Guitar=`acoustic_guitar_nylon` · Sax=`tenor_sax` · flute · Bell=`tubular_bells` · banjo.
- *Obscure / world set (added 2026-07-29):* shamisen · koto · shakuhachi · sitar · Shehnai=`shanai` · bagpipe ·
  kalimba · marimba · glockenspiel · celesta · harpsichord · dulcimer · Harp=`orchestral_harp`.
- *Orchestral / world / chromatic-percussion set (added 2026-08-02):* Piano=`acoustic_grand_piano` · cello ·
  trombone · tuba · clarinet · oboe · `pan_flute` · accordion · xylophone · `steel_drums` · timpani · Taiko=`taiko_drum`.

(Drum/Conga percussion stay on the synth for now — unpitched. Timpani/Taiko above ARE sampled + pitched.)

Re-fetch / add instruments with `fetch-instrument-samples.sh` in the repo root.

If strict CC0 is required later, swap to **VSCO2 Community Edition** or **VCSL** (both CC0) — the
loader and folder layout stay identical.

---

# Bundled animal sample credits

The animal vocalisations in `sounds/animals/<slug>.mp3` are **hand-curated from Wikimedia Commons**
(one clip per species), then trimmed to a short one-shot, downmixed to mono, loudness-normalised, and
re-encoded to mp3 by `fetch-animal-samples.sh`. **20 species** — each clip is a recording OF the named
species, so the in-game name matches the actual call. Used by **Critter Hunt** (▶ each animal) and
available to feed **Mujicians'** Sound Collection.

Full machine-readable manifest (species + author + source page + license per clip): **`data/critter-credits.json`**.
All sources are **CC0 / Public-domain / CC-BY / CC-BY-SA** — none are ND, so they're safe to re-pitch/loop.

| Animal | Species | Author | License |
| --- | --- | --- | --- |
| Red Fox | *Vulpes vulpes* | Alexander Kurthy | CC BY-SA 4.0 |
| Chestnut-fronted Macaw | *Ara severus* | Oliver Komar | CC BY-SA 4.0 |
| Rattlesnake | *Crotalus sp.* | (public domain) | Public domain |
| Great Horned Owl | *Bubo virginianus* | Michael & Katie LaTour | CC BY-SA 4.0 |
| Hoary Bat | *Lasiurus cinereus* | Kaldari | CC0 |
| Field Cricket | *Gryllus pennsylvanicus* | Thatcher | CC BY-SA 3.0 |
| Banded Bullfrog | *Kaloula pulchra* | Inspector | CC BY-SA 3.0 |
| African Elephant | *Loxodonta africana* | King L, Soltis J, et al. (PLOS ONE) | CC BY 2.5 |
| American Alligator | *Alligator mississippiensis* | (public domain) | Public domain |
| Orca | *Orcinus orca* | (public domain) | Public domain |
| Gray Wolf | *Canis lupus* | (public domain) | Public domain |
| Humpback Whale | *Megaptera novaeangliae* | Spyrogumas | CC0 |
| Mallard | *Anas platyrhynchos* | Jonathon Jongsma | CC BY-SA 3.0 |
| Indian Peafowl | *Pavo cristatus* | Ke4roh | Public domain |
| Mantled Howler Monkey | *Alouatta palliata* | Wikimedia Commons contributor | CC BY 4.0 |
| Wild Turkey | *Meleagris gallopavo* | Jonathon Jongsma | CC BY-SA 3.0 |
| Domestic Goat | *Capra hircus* | stephan | Public domain |
| Rooster | *Gallus gallus domesticus* | Filo gèn' | CC BY-SA 4.0 |
| Cow | *Bos taurus* | MichaeltheFox8621 | CC BY-SA 4.0 |
| Sheep | *Ovis aries* | earthcalling | Public domain |

Re-fetch / re-trim with `fetch-animal-samples.sh` (edit a row's start/dur to change the window).

---

# Bundled biome ambience credits

Environmental beds in `sounds/biomes/<slug>.mp3` make Critter Hunt's **location** axis ear-identifiable
(Phase 3). All from **Wikimedia Commons**, each a distinct real recording (none ND → trim-safe). Fetched /
trimmed / normalised by `fetch-biome-samples.sh`. **`desert` intentionally has no clip** — no recognisably
desert PD/CC0 recording exists on Commons — so it plays nothing. Full provenance: `data/critter-credits.json`.

| Biome | Recording | Author | License |
| --- | --- | --- | --- |
| Reef | ocean waves on shore | Luftrum | CC BY 3.0 |
| Forest | Fontainebleau birdsong (wrens) | Barracuda1983 | Public domain |
| Jungle | Costa Rica rainforest (birds/insects) | nille | Public domain |
| Tundra | howling wind | Tvabutzku1234 | CC0 |
| Mountain | strong wind in Swedish pines (25 m/s) | W.carter | CC BY-SA 4.0 |
| City | urban street traffic | cori | Public domain |
| Savanna | cricket chorus | Serg Childed | CC BY-SA 4.0 |
| Desert | — (no clip; silent) | — | — |

# Bundled genre style-clip credits

Style riffs in `sounds/genres/<slug>.mp3` make the **genre** axis ear-identifiable. **Shipped: jazz,
classical, folk** (pre-1926 / released-to-PD). **Silent (no clip):** **blues** (a PD Bessie Smith clip was
auditioned and rejected as poor — awaiting a suitable replacement) and the four modern styles (**rock,
electronic, disco, pop** — no recognisable PD/CC0 example). A missing clip plays nothing by design (dev
preference over a bad or synth riff). Fetched by `fetch-genre-samples.sh`. Provenance: `data/critter-credits.json`.

| Genre | Recording | Performer | License |
| --- | --- | --- | --- |
| Jazz | "Livery Stable Blues" (1917, first jazz record) | Original Dixieland Jass Band | Public domain (US, pre-1926) |
| Classical | Beethoven Symphony No. 5, mvt I | Skidmore College orchestra | Public domain (released) |
| Folk | "Cripple Creek" (old-time fiddle/banjo) | Gid Tanner and his Skillet Lickers | Public domain (US, pre-1926) |
| Blues / Rock / Electronic / Disco / Pop | — (no clip; silent) | — | — |
