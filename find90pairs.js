// Find words where every letter maps at 90°CW (or 270°CW) to another valid word
const fs = require('fs');

const AM = {
  'a': ['a', null, 'e', null],  'e': ['e', null, 'a', null],
  'b': ['b', null, 'q', null],  'q': ['q', null, 'b', null],
  'c': ['c', 'n',  null, 'u'],  'u': ['u', 'c',  'n', 'D'],
  'd': ['d', null, 'p', null],  'p': ['p', null, 'd', null],
  'g': ['g', null, 'g', null],
  'h': ['h', null, 'y', null],  'y': ['y', null, 'R', null],
  'i': ['i', null, 'i', null],
  'j': ['j', 'L',  'r', null],  'r': ['r', null, 'j', 'L'],
  'l': ['l', null, 'l', null],
  'm': ['m', null, 'w', 'E'],   'w': ['w', 'E',  'm', 'B'],
  'n': ['n', 's',  'u', 's'],   's': ['s', 'n', 's', 'n'],
  'o': ['o', 'o',  'o', 'o'],
  't': ['t', 't',  't', 't'],   'x': ['x', 'x',  'x', 'x'],
  'z': ['z', null, 'z', null],
  'A': ['A', null, 'V', null],  'V': ['V', null, 'A', null],
  'B': ['B', 'w',  null, null],
  'C': ['C', null, 'D', null],  'D': ['D', null, 'C', null],
  'E': ['E', 'm',  null, 'w'],
  'H': ['H', 'I',  'H',  'I'],  'I': ['I', 'H', 'I', 'H'],
  'L': ['L', 'r',  'T', null],  'T': ['T', null, 'L', null],
  'M': ['M', null, 'W', null],  'W': ['W', null, 'M', null],
  'N': ['N', 'Z',  'N', 'Z'],   'Z': ['Z', 'N',  'Z',  'N'],
  'O': ['O', 'O', 'O', 'O'],
  'R': ['R', null, 'y', null],
  'Y': ['Y', 'Y',  null, 'Y'],
};

const ROT_90  = 1;
const ROT_270 = 3;

function rotate(word, rotIdx) {
  let result = '';
  for (const ch of word) {
    const entry = AM[ch];
    if (!entry) return null;
    const mapped = entry[rotIdx];
    if (!mapped) return null;
    result += mapped.toLowerCase();
  }
  return result;
}

const raw = fs.readFileSync('./2of12.txt', 'utf8');
const WORDS = new Set(raw.split(/\r?\n/).map(w => w.trim().toLowerCase()).filter(Boolean));

const pairs90  = [];
const pairs270 = [];

for (const word of WORDS) {
  if (word.length < 2) continue;

  const r90 = rotate(word, ROT_90);
  if (r90 && r90 !== word && WORDS.has(r90)) {
    // avoid duplicates (both directions will appear)
    if (word < r90) pairs90.push([word, r90]);
  }

  const r270 = rotate(word, ROT_270);
  if (r270 && r270 !== word && WORDS.has(r270)) {
    if (word < r270) pairs270.push([word, r270]);
  }
}

console.log(`\n=== 90° CW pairs (${pairs90.length} found) ===`);
pairs90.slice(0, 40).forEach(([a, b]) => console.log(`  ${a} → ${b}`));

console.log(`\n=== 270° CW pairs (${pairs270.length} found) ===`);
pairs270.slice(0, 40).forEach(([a, b]) => console.log(`  ${a} → ${b}`));
