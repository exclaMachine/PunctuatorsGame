/* How-to-Play copy, one card per dropdown mode.
 *
 * The modal used to hold one fixed two-player punctuation blurb, which is the wrong text for the
 * eleven wordplay modes sharing the same engine — a player who picks Homophones and opens How to
 * Play was told to shoot punctuation back into a sentence. Each mode now brings its own card, and
 * index.js's updateCharacterModal() swaps it in the moment the mode is picked in the dropdown (not
 * at Pow!), so the rules are readable while you are still deciding what to play.
 *
 * The copy lives here rather than in index.js because it is data, not logic, and it is long: every
 * mode is a `title` (written into the modal HEADER, which is why no card carries an <h2> of its own)
 * plus a `body` of HTML built from the .char-modal shapes in index.css — .lead, .example, .tips.
 *
 * Examples are real: every word pair below is one the mode's own data file actually contains.
 */

/* Appended to every card except removePunc, whose own text already says all three. These are the
 * rules that belong to the engine rather than to any one mode, and before this they lived only in
 * the punctuation blurb — so replacing that blurb would otherwise have lost them. */
const SHARED = `
  <p class="shared-rules">
    <strong>In every mode:</strong> the hint button in the upper left highlights whatever you
    haven't hit yet · <em>Switch Character</em> cycles through the heroes this sentence called up ·
    hit everything and you get a message and triumphant trumpets 🎺
  </p>
`;

/* The original two-player text, kept word for word — it is the game's front door and it works.
 * It is the one card with no shared footer, because it already covers the hint button and the win. */
const REMOVE_PUNC = `
  <div class="char-modal char-modal--plain">
    This game makes learning punctuation fun and can be a great tool in the classroom or at home! Currently the game is meant to be played between two people.
    <br>
    <br>
    <strong>To play:</strong>
    <br>
    <ul>
      <li>Player 1 will enter a sentence that includes one or more punctuation marks. No peeking, Player 2!</li>
      <li>Player 2 will control the given characters with the buttons on the bottom right to shoot the punctuation back into the sentence.</li>
      <li>If you get stuck, press the hint button in the upper left and the remaining punctuation locations will be highlighted.</li>
      <li>Once you find all the punctuation, a message will appear with triumphant trumpets sounding 🎺</li>
      <li>You can also choose some of the other options in the drop down to do some fun wordplay!</li>
    </ul>
  </div>
`;

/* Titles are the dropdown's own label plus the hero, which is how a player finds the card they want —
 * except the three ladder modes, whose two heroes are too long a name for a 500 px header and are
 * introduced by the lead sentence instead. */
export const MODE_HELP = {
  removePunc: { title: "How to Play", body: REMOVE_PUNC },

  ambigrams: {
    title: "Ambigrams — Ambigrambador",
    body: `
    <div class="char-modal">
      <p class="lead">
        An ambigram reads as a word from both sides. Turn the page upside down and <code>bop</code>
        becomes <code>dog</code> — and a few words, like <code>mow</code> and <code>swims</code>,
        turn into themselves.
      </p>

      <div class="example">
        <div>Start</div><code>bop</code>
        <div>Half turn</div><code>dog</code><small>(read upside down)</small>
      </div>

      <ul class="tips">
        <li>Hitting the word spins it 180° and it lands reading as its partner.</li>
        <li>Every partner is a real dictionary word, not a scramble — that's what makes the pair rare.</li>
        <li>One spin per word.</li>
      </ul>
    </div>
  `,
  },

  anagrams: {
    title: "Anagrams — Parents of the Seas ( )",
    body: `
    <div class="char-modal">
      <p class="lead">
        An anagram uses <strong>every letter</strong> of a word, in a new order, to spell another
        word. Nothing is added and nothing is dropped.
      </p>

      <div class="example">
        <div>Start</div><code>listen</code>
        <div>Hit #1</div><code>silent</code>
        <div>Hit #2</div><code>tinsel</code>
        <div>Hit #3</div><code>enlist</code>
      </div>

      <ul class="tips">
        <li>The letters float loose and settle into the next anagram.</li>
        <li>Keep shooting to cycle through every anagram a word has, then back to the start.</li>
        <li>Count the letters before and after — they always match.</li>
      </ul>
    </div>
  `,
  },

  caret: {
    title: "Caret — Zana",
    body: `
    <div class="char-modal">
      <p class="lead">
        The caret <code>^</code> is a proofreader's mark meaning <em>insert here</em>. Zana slips
        <strong>one</strong> new letter into a word, and a different word appears.
      </p>

      <div class="example">
        <div>Start</div><code>abut</code>
        <div>Hit #1</div><code>about</code><small>(an <code>o</code> goes in)</small>
        <div>Also</div><code>able</code> → <code>cable</code>
      </div>

      <ul class="tips">
        <li>Exactly one letter goes in — nothing is removed and nothing moves.</li>
        <li>The new letter sits raised above the line, the way a proofreader writes it in.</li>
        <li>The opposite of White Out, where Sir Dele takes a letter away.</li>
      </ul>
    </div>
  `,
  },

  homophones: {
    title: "Homophones — Phonia",
    body: `
    <div class="char-modal">
      <p class="lead">
        Homophones sound exactly alike but are spelled differently and mean different things — which
        is why they are the easiest words in English to get wrong.
      </p>

      <div class="example">
        <div>Start</div><code>there</code>
        <div>Hit #1</div><code>their</code>
        <div>Hit #2</div><code>they're</code>
      </div>

      <ul class="tips">
        <li>The word shivers like a struck tuning fork, then settles into the next spelling.</li>
        <li>Keep shooting to see every spelling that sounds the same.</li>
        <li>Say the sentence out loud — it sounds identical however wrong it looks.</li>
      </ul>
    </div>
  `,
  },

  rounded: {
    title: "Rounded — Roundabout",
    body: `
    <div class="char-modal">
      <p class="lead">
        Bend a letter's straight strokes into curves and a different letter appears:
        <code>A</code>→<code>R</code>, <code>D</code>→<code>O</code>, <code>E</code>→<code>B</code>,
        <code>F</code>→<code>P</code>, <code>H</code>→<code>B</code>, <code>T</code>→<code>J</code>,
        <code>V</code>→<code>U</code>. Do it to a whole word and you get another word.
      </p>

      <div class="example">
        <div>Start</div><code>ADD</code>
        <div>Hit #1</div><code>ROD</code><small>(A→R, D→O)</small>
        <div>Also</div><code>BAA</code> → <code>BRR</code>
      </div>

      <ul class="tips">
        <li>Watch the strokes warp — the letter bends into its new shape rather than swapping.</li>
        <li>Only letters that <em>can</em> be rounded change; the rest stay exactly as they are.</li>
        <li>This is a change of shape, not of sound or of order.</li>
      </ul>
    </div>
  `,
  },

  split: {
    title: "Split — Space-el",
    body: `
    <div class="char-modal">
      <p class="lead">
        One word with two words hiding inside it. Space-el drops a space in and both come out.
      </p>

      <div class="example">
        <div>Start</div><code>zookeeper</code>
        <div>Hit #1</div><code>zoo keeper</code>
        <div>Also</div><code>zither</code> → <code>zit her</code>
      </div>

      <ul class="tips">
        <li>Nothing is added or removed — the only thing that changes is where the space is.</li>
        <li>One split per word.</li>
        <li>The two halves rarely have anything to do with the word they came from. That's the joke.</li>
      </ul>
    </div>
  `,
  },

  whiteOut: {
    title: "White Out — Sir Dele of Dallying",
    body: `
    <div class="char-modal">
      <p class="lead">
        <em>Dele</em> is the proofreader's mark for <em>take it out</em>. Sir Dele removes
        <strong>one</strong> letter and a real word is left standing.
      </p>

      <div class="example">
        <div>Start</div><code>aback</code>
        <div>Hit #1</div><code>back</code>
        <div>Also</div><code>abasement</code> → <code>basement</code>
      </div>

      <ul class="tips">
        <li>The doomed letter fades out of the word where it stood.</li>
        <li>The letters left behind keep their order — only one is missing.</li>
        <li>The opposite of Caret, where Zana puts a letter in.</li>
      </ul>
    </div>
  `,
  },

  alphabetNeighbors: {
    title: "Alphabet Slots — Betar",
    body: `
    <div class="char-modal">
      <p class="lead">
        An alphabet neighbor is the letter directly before or after a letter in the alphabet
        (with wrap-around: <code>a</code> ↔ <code>z</code>). Betar spins one letter to a neighbor
        to form a real word.
      </p>

      <div class="example">
        <div>Start</div><code>timer</code>
        <div>Hit #1</div><code>tiler</code><small>(m → l)</small>
      </div>

      <ul class="tips">
        <li>Only one letter changes per hit.</li>
        <li>Neighbors wrap: <code>a</code> ↔ <code>z</code>.</li>
        <li>Words alternate: original → neighbor → original → next neighbor…</li>
      </ul>
    </div>
  `,
  },

  // docs/punctuators-ladder.md §9 (M4). The load-bearing sentence is the first tip: since §2.5's
  // fan, shooting a word no longer moves it, which is the one rule a player cannot infer from
  // watching. Everything else here is a gloss on something already on screen — the rung strip, the
  // ▾, the fog count, the clank, the capstone.
  ladder: {
    title: "General & Specific",
    body: `
    <div class="char-modal">
      <p class="lead">
        Every naming word sits somewhere on a <strong>kind-of ladder</strong>: a <code>poodle</code>
        is a kind of <code>dog</code>, a dog is a kind of <code>mammal</code>, a mammal is a kind of
        <code>animal</code>. These two heroes move a word along that ladder, and
        <strong>Switch Character</strong> is what picks the direction.
      </p>

      <div class="example">
        <div>General</div>
        <div><code>dog</code> → <code>mammal</code><small>one shot, one rung broader</small></div>
        <div>Keen Arrow</div>
        <div><code>hound▾</code> <code>terrier▾</code> <code>corgi</code> …<small>fans out the kinds of dog</small></div>
        <div>Shoot one</div>
        <div><code>dog</code> → <code>terrier</code><small>one rung narrower</small></div>
      </div>

      <ul class="tips">
        <li><strong>Keen Arrow doesn't move the word.</strong> Hitting it fans the narrower kinds out
          underneath — walk under the one you want and shoot <em>it</em>. A <code>▾</code> means that
          kind has kinds of its own, so you can keep going down.</li>
        <li>The little strip under a word is the ladder itself: <code>▲</code> a rung broader,
          <code>●</code> you are here, <code>▼</code> a level of narrower kinds still below.</li>
        <li><code>+25 more</code> means the shelf is wider than the row. Play the word again and
          different kinds come up — that's how you work through a big family.</li>
        <li>A word with nothing narrower <strong>clanks</strong>. Broaden it with General Ization and
          narrow again: a word's neighbours are the other kinds on its parent's row.</li>
        <li>At the top of the ladder the word <strong>flares and stays</strong>.
          <code>animal</code> is the answer, not a miss.</li>
        <li><code>7/33 found</code> is your shelf: how many of that word's kinds you have ever landed
          on. Fill a quarter, a half, or all of it and it says so — and the shelf turns gold on the
          <strong>🌳 Tree of Kinds</strong>, where every word you land on lights up. The map explains
          itself when you open it; press <code>?</code> in there to read it again.</li>
      </ul>
    </div>
  `,
  },

  // docs/punctuators-ladder.md §12. Dev-only for now, so this card is only ever reachable with
  // ?dev=1 — the <option> is removed from the dropdown otherwise.
  wordRace: {
    title: "Word Race",
    body: `
    <div class="char-modal">
      <p class="lead">
        No sentence here: <strong>you are the word</strong>. Travel the kind-of ladder from the start
        word to the target in as few moves as you can. <code>Par</code> is the shortest route there
        is — nobody finishes under it, so everything above par is a detour.
      </p>

      <div class="example">
        <div>Route</div>
        <div><code>poodle</code> → <code>dog</code> → <code>mammal</code> → <code>animal</code>
          → <code>fish</code> → <code>salmon</code><small>par 5</small></div>
      </div>

      <ul class="tips">
        <li><strong>Up needs no typing.</strong> A word has only one rung above it, so General
          Ization shoots the word overhead and you broaden.</li>
        <li><strong>Keen Arrow asks the question.</strong> Shoot the word you are standing on and a
          box opens: name a kind of it. Type the word, press Enter, then shoot the word that appears.</li>
        <li>One rung at a time. At <code>animal</code> you can't type <code>salmon</code> — go
          through <code>fish</code>, which is the rung worth knowing.</li>
        <li>A "no" tells you which kind of no it is: wrong direction, not a kind of this word, or
          a real kind that is further down than one step.</li>
      </ul>
    </div>
  `,
  },

  // docs/punctuators-ladder.md §11. Also dev-only (?dev=1) while the phrase corpus is pruned.
  ladderPuzzle: {
    title: "Restore the Phrase",
    body: `
    <div class="char-modal">
      <p class="lead">
        A famous saying, with some of its words shifted along the kind-of ladder — too broad, too
        narrow, but never wrong. Shoot them back where they belong.
      </p>

      <div class="example">
        <div>Given</div><div><code>A canine is a person's best friend</code></div>
        <div>Restored</div><div><code>A dog is a man's best friend</code></div>
      </div>

      <ul class="tips">
        <li>Work out which words are out of place first — the saying will look almost right.</li>
        <li>General Ization broadens, Keen Arrow narrows, and <strong>Switch Character</strong>
          flips between them.</li>
        <li>A word snaps shut once it's home, so the hint only ever lights what's still wrong.</li>
        <li>Wasted <em>moves</em> are the score, not wasted shots — the extra shot that opens Keen's
          fan is free.</li>
      </ul>
    </div>
  `,
  },
};

/* The card for a mode, header title included. Unknown/absent mode falls back to the front-door
 * punctuation card, which is what the page ships with in its HTML. */
export function modeHelpFor(mode) {
  const entry = MODE_HELP[mode] ?? MODE_HELP.removePunc;
  return {
    title: entry.title,
    // removePunc's own text already covers the hint button and the win, so it takes no footer.
    body: entry === MODE_HELP.removePunc ? entry.body : entry.body + SHARED,
  };
}
