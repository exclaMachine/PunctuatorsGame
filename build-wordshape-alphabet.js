#!/usr/bin/env node
/* build-wordshape-alphabet.js — emit data/wordshape-alphabet.json from the ONE authored alphabet.
 *
 * The 52 skeleton glyphs (a–z Carolingian + A–Z Roman, with their handwriting stroke ORDER and
 * DIRECTION) live in wordshape-draw.html's `GLYPHS` table, which is the drawing tool's own output
 * format. Wordshape reads them from there directly; Inklings' trace bench slices that block live out
 * of the HTML at load (the affix-sprite-preview.html trick) so it can never trace a stale copy.
 *
 * The shipped game can't do that — it can't fetch and eval a dev tool — so it reads data/wordshape-
 * alphabet.json instead. This script is the headless equivalent of the tool's own ⬇ button: same
 * slice, same alphabetJSON() shape, no browser. Re-run it after editing a glyph:
 *
 *     node build-wordshape-alphabet.js
 */
const fs = require("fs");
const path = require("path");
const SRC = path.join(__dirname, "wordshape-draw.html");
const OUT = path.join(__dirname, "data", "wordshape-alphabet.json");

const src = fs.readFileSync(SRC, "utf8");
const m = /const GLYPHS\s*=\s*(\(\(\)\s*=>\s*\{[\s\S]*?\n\}\)\(\);)/.exec(src);
if (!m) { console.error("couldn't find the GLYPHS block in wordshape-draw.html"); process.exit(1); }
const GLYPHS = new Function("return " + m[1].replace(/;\s*$/, ""))();

/* The tool's own units string and SIZES, sliced from the same file so the two can't drift. */
const unitsM = /units:\s*"([^"]+)"/.exec(src);
const sizesM = /const SIZES\s*=\s*(\[[^\]]*\]);/.exec(src);
const SIZES = sizesM ? JSON.parse(sizesM[1]) : [0.22, 0.32, 0.46];

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";
const ALL = ALPHABET + ALPHABET.toUpperCase();
const r = v => Math.round(v * 1e4) / 1e4;
const glyphs = {};
for (const ch of ALL) {
  const g = GLYPHS.get(ch);
  if (!g) { console.error("missing glyph: " + ch); process.exit(1); }
  glyphs[ch] = { w: g.w, len: +g.len.toFixed(3), strokes: g.strokes.map(st => st.map(q => [r(q[0]), r(q[1])])) };
}
const out = { v: 1, units: unitsM ? unitsM[1] : "em, y down", sizes: SIZES, glyphs };
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log("wrote " + OUT + " — " + Object.keys(glyphs).length + " glyphs, " + kb + " KB");
