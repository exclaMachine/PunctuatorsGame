/* The centre-of-screen showpiece, one card per dropdown mode.
 *
 * Picking a mode used to change nothing you could see until you pressed Pow! — the same white field
 * whatever you chose. This is the picture that answers "what did I just pick?": it sits in the empty
 * band under the sentence box while you decide, and clears the field the moment the round starts
 * (index.js's hideModeArt(), called only after Pow!'s validation passes, so a rejected sentence
 * leaves the picture up).
 *
 * PLACEHOLDER ART, BY DESIGN. Every entry below is a `glyph` — one big typographic mark standing in
 * for the sprite that will replace it. When the art arrives, add `sprite: "./images/Foo.png"` to the
 * entry and nothing else changes: renderModeArt() prefers the sprite and drops the glyph. That is
 * the whole migration, one line per mode, and modes can go over one at a time.
 *
 * The copy lives here rather than in index.js for the same reason modeHelp.js does — it is data, and
 * index.js keeps only the wiring. Unlike modeHelp.js the strings are short, so the shapes are:
 *
 *   glyph   the placeholder mark, plain text (or a couple of spans; see `flip` below)
 *   sprite  optional image path — when present it wins and the glyph is never drawn
 *   name    the caption band's heading. The dropdown's own label plus the hero who owns the mode,
 *           so the picture and the How-to-Play card name the same thing.
 *   tease   one line, present tense, describing what the hero does to a word.
 *   example optional worked example under the glyph, in the mode's own data (a real pair, same as
 *           modeHelp.js's cards — regenerating a data file can leave one stale).
 *   accent  optional CSS colour for the glyph and the frame. Defaults to the site's blueviolet.
 *   flip    optional: draw a second, 180°-rotated copy of the glyph beneath it. Only Ambigrambador
 *           wants it, and it is the one mode whose symbol IS a rotation.
 */

const VIOLET = "blueviolet"; // the site's own --color; the default for anything not listed below
const GOLD = "#D4720A"; // the dropdown's selected-option orange — the ladder's colour elsewhere too

export const MODE_ART = {
  removePunc: {
    glyph: "!?",
    name: "Remove Punctuation",
    tease: "The marks are gone. Shoot them back where they belong.",
    example: "Hi there, friend!",
  },

  ambigrams: {
    glyph: "bop",
    flip: true, // reads "dog" the other way up — the mode in one picture
    name: "Ambigrams — Ambigrambador",
    tease: "Turn the word upside down and a different word reads back.",
    example: "bop → dog",
    accent: "#2E86AB",
  },

  anagrams: {
    glyph: "⇄",
    name: "Anagrams — Parents of the Seas",
    tease: "Every letter kept, every letter moved.",
    example: "listen → silent",
    accent: "#2E86AB",
  },

  // The glyph is the article toggle because it is the half you can draw; the caption carries the
  // Foon. The example runs both heroes over the same three words, exactly as the How-to-Play card
  // does — and it is real: `the` sees a consonant next and becomes `a`, and big/dog trade heads.
  articlesSpoonerisms: {
    glyph: "a/the",
    name: "Articles & Spoonerisms — Art the Tickler & the Foon",
    tease: "Tickle the little words. Trade the heads off the big ones.",
    example: "the big dog → a dig bog",
    accent: "#2E7D32",
  },

  caret: {
    glyph: "^",
    name: "Caret — Zana",
    tease: "One letter slipped in, and a new word appears.",
    example: "abut → about",
    accent: "#C2185B",
  },

  homophones: {
    glyph: "≈",
    name: "Homophones — Phonia",
    tease: "Same sound, different spelling, different meaning.",
    example: "there → their",
    accent: "#00838F",
  },

  rounded: {
    glyph: "⌒",
    name: "Rounded — Roundabout",
    tease: "Bend the straight strokes into curves and read what's left.",
    example: "ADD → ROD",
    accent: "#6D4C41",
  },

  split: {
    glyph: "␣",
    name: "Split — Space-el",
    tease: "One word with two words hiding inside it.",
    example: "zookeeper → zoo keeper",
    accent: "#00695C",
  },

  whiteOut: {
    glyph: "⌫",
    name: "White Out — Sir Dele of Dallying",
    tease: "One letter taken out, and a real word is left standing.",
    example: "aback → back",
    accent: "#455A64",
  },

  alphabetNeighbors: {
    glyph: "🎰",
    name: "Alphabet Slots — Betar",
    tease: "Spin a letter to its alphabet neighbour.",
    example: "timer → tiler",
    accent: "#B8860B",
  },

  // The three ladder modes share the gold of the Tree of Kinds (docs/punctuators-ladder.md §13) —
  // they are one hierarchy played three ways, and the picture should say so before the words do.
  ladder: {
    glyph: "▲●▼",
    name: "General & Specific",
    tease: "Climb the kind-of ladder. Switch Character flips the direction.",
    example: "poodle → dog → animal",
    accent: GOLD,
  },

  wordRace: {
    glyph: "⟶",
    name: "Word Race",
    tease: "You are the word. Cross the ladder in as few moves as you can.",
    example: "poodle ⟶ salmon",
    accent: GOLD,
  },

  ladderPuzzle: {
    glyph: "❝❞",
    name: "Restore the Phrase",
    tease: "A famous saying, shifted along the ladder. Put it back.",
    example: "A canine is a person's best friend",
    accent: GOLD,
  },
};

/* The card for a mode. An unknown mode falls back to the front door, the same way modeHelpFor does —
   a dropdown value with no card is a mode someone added without a picture, and the punctuation card
   is never wrong about what the game is. */
export function modeArtFor(mode) {
  return MODE_ART[mode] ?? MODE_ART.removePunc;
}

/* The card as HTML, for whatever element index.js hands it. Kept beside the data because the shape
   of the markup and the shape of the entry are one decision: `sprite` beats `glyph`, `flip` draws
   the glyph twice, and `example` is optional. Classes are styled in index.css (.mode-art*). */
export function renderModeArt(mode) {
  const art = modeArtFor(mode);
  const accent = art.accent ?? VIOLET;

  const figure = art.sprite
    ? `<img class="mode-art__sprite" src="${art.sprite}" alt="">`
    : `<div class="mode-art__glyph">${art.glyph}</div>` +
      (art.flip
        ? `<div class="mode-art__glyph mode-art__glyph--flip" aria-hidden="true">${art.glyph}</div>`
        : "");

  return `
    <div class="mode-art__card" style="--mode-accent:${accent}">
      <div class="mode-art__figure">${figure}</div>
      <div class="mode-art__band">
        <div class="mode-art__name">${art.name}</div>
        ${art.example ? `<div class="mode-art__example">${art.example}</div>` : ""}
        <div class="mode-art__tease">${art.tease}</div>
      </div>
    </div>
  `;
}
