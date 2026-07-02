# The Prescriptivist's Gauntlet — Project Context

Entry file: `Prescriptivist.html`. A single-file browser game built with vanilla HTML/CSS/JS, deployable to GitHub Pages.
Concept: The player is shown a sentence tagged by part of speech and must transcribe it while obeying a set of active "laws" — each one stolen from a real human language. Laws stack over 12 rounds. Survive with 5 HP to win.
Mechanics:

Sentences are drawn from an 80-item corpus and tagged via Compromise.js (CDN), with a built-in fallback word-list tagger if the CDN is unavailable
Each word is displayed as a color-coded chip labeled by POS (noun, verb, article, pronoun, conjunction, preposition, adverb, adjective)
Chips whose POS is banned by an active rule get a red warning border
Violations are only revealed on submit, never while typing
A Show/Hide Rules toggle lets players attempt hard mode without seeing the active laws

The 12 rules (introduced one at a time, each with a real linguistics fact):

No letter "E" — French lipogram tradition
No a/an/the — Russian and 40%+ of languages
Words must end in vowels — Hawaiian open-syllable structure
No personal pronouns — Japanese/Mandarin pro-drop
Max 5 letters per word — Toki Pona
No 3+ consonant clusters — Maori vs. Georgian
No conjunctions — Classical Latin asyndeton
No prepositions — Latin/Finnish case endings
No -ly adverbs — Mandarin adverb system
No abstract nouns (-tion/-ness/-ity etc.) — Pirahã
No doubled consecutive letters — Turkish vowel harmony
No comparatives/superlatives — Mandarin/Yoruba invariant adjectives

Key files: prescriptivist.html (self-contained — all game logic, rules, corpus, and styles are inline)
Sprite hook: The villain character (Professor Prescripta) is intentionally absent from the current build. Sprite/animation integration is planned — the game UI leaves the left side of the main panel open for a character overlay.
