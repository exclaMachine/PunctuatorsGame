// build-serifin-pojo.js — offline generator for Serifin's stroke table.
// Design: docs/punctuators-serifin.md §3. Usage: node build-serifin-pojo.js
//
// The runtime question is "does this word, with ONE letter changed, exist?" and the only wordlists
// available are files (2of12.txt 389 KB, enable1.txt 1.7 MB). Pre-computing the answer is both
// smaller than shipping a lexicon and the house pattern — Zana, Roundabout, Betar, the ladder and
// the race all ship a generated POJO beside a hand-kept source of truth. Here the source of truth
// is the ADD table below: ~25 lines, no build input, and the whole of the mode — plus the
// BLOCK set beside it, which is the only thing in here that is about taste rather than letterforms.
//
// Writes serifinPOJO.js and prints the §2 measurements, which must reproduce.

const fs = require("fs");

/* ── The stroke table (§3.1) ─────────────────────────────────────────────────
   The rule for membership is ONE UNBROKEN MOTION OF THE PEN — the hand does not lift — added to
   the glyph as drawn in the mode's own face: Jost* (§7), a Futura line with a single-storey `a`, a
   single-storey `g`, a plain tail-less `l`, a circular `o`, monoline arches on `n m r`, a `u` open
   at the top with a straight full-height right stem, and an `i` with no foot serif. Every row below
   is literally true in that face and several of them are false in Palanquin, which is why the mode
   changes the typeface rather than the table.

   THE RULE IS THE PEN, NOT THE SEGMENT (§13 #7, settled 2026-11-07). A row may cost two segments
   so long as it is one continuous motion with no lift: `v → w` is one zigzag, `r → m` is how a
   hand writes an `m`, `l → k` touches the stem once on the way through. All three were cut by the
   first pass on a SEGMENT count and are readmitted here — see §3.2, which now reads against this
   rule rather than against the one it was written under.

   §3.2 records what stays CUT and why it matters that it does: `n → h` and `r → p` EXTEND existing
   ink rather than adding to it, `t → f` MODIFIES a stroke (it curves the stem's top and adds
   nothing), and `e → g` is not a stroke relation at all. The payoff is §8: every mapping that
   survives has a stroke that can be DRAWN, so the animation shows the pen doing exactly what this
   table says.

   `o → g` is the one row kept on a judgement call: it is one descending stroke only in a
   SINGLE-STOREY g, which Jost* has. If the mode's face ever changes to one with a two-storey g,
   that row is a second bowl and must go.

   CANDIDATE ORDER IS DATA, NOT FORMATTING (§8.3). The game reads a stroke's `from` off the glyph
   ON SCREEN, so consecutive candidates that are themselves one stroke apart draw a chain for free:
   `u: ["o", "a"]` is what makes `bout → boot → boat` play as two drawn shots, and reversing those
   two hands the player the strokes in the wrong order. */
const ADD = {
  c: ["o", "a", "d", "e"],                // close the ring · right stem (x-height / ascending) · crossbar
  h: ["b", "k"],                          // close the foot · the upper arm, out of the shoulder's junction
  i: ["j", "l"],                          // add the tail · join the stem to the tittle, absorbing it
  l: ["t", "b", "d", "h", "k"],           // crossbar · bowl right · bowl left · arch · arm in, leg out
  n: ["m"],                               // one more arch
  o: ["a", "b", "d", "e", "p", "q", "g"], // stem · ascender · descender · crossbar · below the line
  r: ["n", "m"],                          // carry the shoulder down · and on over a second arch
  u: ["o", "a"],                          // close the top — ORDER IS LOAD-BEARING, see above
  v: ["y", "w"],                          // add the tail · carry the zigzag on
};

/* ── The blocklist (§13 #6, settled 2026-11-07) ──────────────────────────────────────
   The dictionary gate guarantees a real word, not a word you want on screen — and here the result
   is the PAYOFF, read out loud, in a game whose own How to Play pitches it for a classroom. So a
   result on this list is simply not generated, and nothing at play time has to know.

   RESULT WORDS, not pairs: a word on this list can never be a payoff however it was reached, which
   is why `rope → rape`, `roper → raper` and `ropes → rapes` all go on one entry. The two worst
   finds were on rows that have been SHIPPED since M1 — `curt → cunt` on `r → n` and the three
   `rope` swaps on `o → a`, the biggest row in the table — so this was overdue before M5 proposed
   anything. The line is the dev's (2026-11-07) and it is deliberately short: the merely coarse and
   the merely grim stay in play, because blocking `deal → dead` or `late → hate` would remove
   ordinary English for tone. */
const BLOCK = new Set([
  "bitch", "boner", "cunt", "dick", "dike", "fag", "fanny", "hooker", "rape", "raper", "rapes",
]);

/* §3.5 rule 2: a two-letter minimum. `a → o` and `i → j` as whole words are noise. */
const MIN_LEN = 2;

const readList = (file) =>
  fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((w) => w.trim().toLowerCase())
    // Plain lowercase a–z only: both files carry hyphenated and apostrophe'd entries
    // (`able-bodied`, `can't`), and a stroke added to a letter inside one of those is a target the
    // sentence tokenizer (/\b/) would never hand to the wrapper in one piece.
    .filter((w) => /^[a-z]+$/.test(w));

const common = readList("2of12.txt"); // the SOURCES, and the recognisability tier for results
const COMMON = new Set(common);
const VALID = new Set(readList("enable1.txt")); // the eligibility gate for results

/* Every stroke-add on one word: [{ i, to, obscure }], in table order.
   `obscure` marks a result that is a legal enable1 word but not a common one (§3.4) — `over → oyer`,
   `the → tho`, `long → hong`. Memory's rule is "enable1 for eligibility, 2of12 as a commonness
   signal only", but here the result is READ OUT LOUD by the player as the payoff, so eligibility is
   not the whole question. Both tiers are emitted and marked; the mode lights one of them. */
const blocked = new Set(); // word>result pairs the BLOCK set refused, counted in the print-out

function swapsFor(word) {
  const out = [];
  if (word.length < MIN_LEN) return out;
  const chars = word.split("");
  for (let i = 0; i < chars.length; i++) {
    const candidates = ADD[chars[i]];
    if (!candidates) continue;
    for (const to of candidates) {
      if (to === chars[i]) continue;
      const result = word.slice(0, i) + to + word.slice(i + 1);
      if (!VALID.has(result)) continue;
      if (BLOCK.has(result)) {
        blocked.add(`${word}>${result}`);
        continue;
      }
      out.push({ i, to, obscure: !COMMON.has(result) });
    }
  }
  return out;
}

const table = new Map(); // word -> "2a 2e 0o*"   (an obscure result is starred)
let total = 0;
let recognisable = 0;
const perMapping = new Map();

for (const word of common) {
  const swaps = swapsFor(word);
  if (!swaps.length) continue;
  table.set(word, swaps.map((s) => `${s.i}${s.to}${s.obscure ? "*" : ""}`).join(" "));
  total += swaps.length;
  for (const s of swaps) {
    if (!s.obscure) recognisable++;
    const key = `${word[s.i]}→${s.to}`;
    perMapping.set(key, (perMapping.get(key) || 0) + 1);
  }
}

/* ── Emit ───────────────────────────────────────────────────────────────────────────────────────
   One entry per source word; the value is a space-joined list of <index><letter> swaps, starred
   when the result is enable1-only. Compact on purpose: the alternative — one array of objects per
   word — triples the file for nothing, since serifinFunc.js parses it into a Map at load either
   way (and a Map is what it must be: `constructor` and `prototype` are both real words here). */
const keys = [...table.keys()].sort();
const body = keys.map((k) => `  ${JSON.stringify(k)}: "${table.get(k)}",`).join("\n");
const out =
  `// serifinPOJO.js — AUTO-GENERATED by build-serifin-pojo.js. Do not hand-edit.\n` +
  `// Edit the ADD table in that script and re-run (node build-serifin-pojo.js).\n` +
  `// Design: docs/punctuators-serifin.md §3.3.\n` +
  `//\n` +
  `//   word: "<index><letter> …"   — add one stroke to the letter at <index>, get <letter>,\n` +
  `//                                and the word that leaves is real. A trailing * marks a\n` +
  `//                                result that is in enable1 but not in 2of12 (§3.4): legal,\n` +
  `//                                but not a word anyone would recognise as the payoff.\n` +
  `//\n` +
  `// ${keys.length} source words · ${total} transformations · ${recognisable} of them recognisable.\n` +
  `export default {\n${body}\n};\n`;

fs.writeFileSync("serifinPOJO.js", out);

/* ── The §2 measurements, which this script exists to reproduce ─────────────────────────────── */
const pct = (n, d) => `${((100 * n) / d).toFixed(1)}%`;

console.log(`wrote serifinPOJO.js  (${(out.length / 1024).toFixed(1)} KB raw)`);
console.log(`\ncommon words (2of12, plain a-z):            ${common.length}`);
console.log(`eligible results (enable1, plain a-z):     ${VALID.size}`);
console.log(`words with >=1 stroke-add into a real word: ${keys.length} (${pct(keys.length, common.length)})`);
console.log(`total transformations:                      ${total}`);
console.log(`  ...whose result is also in 2of12:         ${recognisable}`);
console.log(`  ...enable1 only (starred, hidden in v1):  ${total - recognisable}`);
console.log(`refused by the BLOCK set (§13 #6):          ${blocked.size}`);

console.log("\nper mapping, over the whole corpus:");
const ranked = [...perMapping.entries()].sort((a, b) => b[1] - a[1]);
for (let i = 0; i < ranked.length; i += 7) {
  console.log(
    "  " + ranked.slice(i, i + 7).map(([k, n]) => `${k} ${String(n).padStart(3)}`).join("   "),
  );
}

/* The 7.6% above is the number that nearly killed the mode, and it is the wrong number to read:
   sampled over random common words a six-word sentence finds a target only a third of the time,
   but sampled over sentences people actually TYPE it is 12 of 12, because real English is carried
   by short frequent words and those are made almost entirely of o l c n r u. This is that sample,
   kept here so the claim is checkable rather than asserted — and it is also what says the §11
   guard is for real misses rather than a routine occurrence. */
const SENTENCES = [
  "i adopt a cat and a dog",
  "the quick brown fox jumps over the lazy dog",
  "put the cup on the table",
  "she will cut the long rope",
  "my brother plays guitar in a band",
  "we walked to the shore at night",
  "all the children ran home",
  "there is a bottle under the sink",
  "can you hear the sun come up",
  "he left his coat in the car",
  "please colour inside the lines",
  "nobody knows what happens next",
];

console.log("\nsentences with something to shoot (recognisable tier only):");
let hits = 0;
for (const s of SENTENCES) {
  const marked = s
    .split(/\b/)
    .filter((t) => {
      const e = table.get(t);
      return e && e.split(" ").some((sw) => !sw.endsWith("*"));
    });
  if (marked.length) hits++;
  console.log(
    `  ${marked.length ? String(marked.length).padStart(2) : " -"}  ${s}` +
      (marked.length ? `   [${marked.join(" ")}]` : ""),
  );
}
console.log(`\n  ${hits} of ${SENTENCES.length}`);

console.log("\nthe doc's worked examples:");
for (const w of ["adopt", "cut", "brown", "night", "will", "bottle", "acorn", "color", "shore", "sun"]) {
  const e = table.get(w);
  console.log(
    `  ${w.padEnd(8)} ${
      e
        ? e
            .split(" ")
            .map((sw) => {
              const m = /^(\d+)([a-z])(\*?)$/.exec(sw);
              const res = w.slice(0, +m[1]) + m[2] + w.slice(+m[1] + 1);
              return `${w[+m[1]]}>${m[2]} ${res}${m[3]}`;
            })
            .join(" · ")
        : "(no swaps)"
    }`,
  );
}
