============================================================
SPECIMEN LAB — HOW TO ADD CARD ART
============================================================

You can replace the placeholder cards with your own artwork WITHOUT
editing any game code. Each card is a single full image — the entire
card is your art, including the card's name and any symbols. Draw them
right into the picture.

------------------------------------------------------------
THE 3 STEPS TO ADD OR REPLACE A CARD
------------------------------------------------------------
1. Draw the card image.
     - Recommended size: 750 x 1050 pixels
       (that's standard trading-card proportions — like a poker or
        Pokémon card. Any size with the same 2.5 : 3.5 shape is fine.)
     - The whole rectangle is the card. Put the card's name and any
       icons INTO the art. Corners are rounded automatically by the game.
     - PNG or JPG.

2. Name the file:   suit_part_name.png
     suit  = bug  fungus  fire  sea  robot  electric  fang   (or  wild )
     part  = skull   claw   foot         <- must be one of these three
     name  = any single word (lowercase, no spaces)
   Examples:
       bug_skull_horned.png
       fire_foot_runner.png
       wild_claw_mutant.png
   Need more than one copy of a card in the deck? Add _xN:
       fire_foot_runner_x2.png     (two copies)
   Save the file into this  cards/  folder.

3. Open  cards.txt  (in this folder) and add the filename on its own
   line. Save. Reload the game — the card now shows your art.

------------------------------------------------------------
REPLACE vs. ADD
------------------------------------------------------------
- If  name  matches one of the game's existing cards, your art simply
  REPLACES that card's placeholder face (deck size unchanged).
  Existing names:
      skull: insectoid  horned  bloodshot
      claw : mutant  clutching  warty
      foot : mermaid  runner  dandy
- If  name  is a new word, a brand-new card is ADDED to the deck
  (2 copies for a colored suit, 1 for wild — or use _xN to choose).

------------------------------------------------------------
TURNING OFF THE PLACEHOLDER CARDS
------------------------------------------------------------
Un-arted cards keep their placeholder look, so you can replace the deck
gradually. When every card has art and you want ONLY your cards, open
exquisite-corpse-rummy.html, find this line near the top of the script:

      const PLACEHOLDER_DECK = true;

and change it to:

      const PLACEHOLDER_DECK = false;

Now the deck is built only from the cards listed in cards.txt.

------------------------------------------------------------
NOTES
------------------------------------------------------------
- The game must be opened through a web server (e.g. VS Code "Live
  Server") or the live site — not by double-clicking the .html file —
  because browsers block reading cards.txt from a file:// path.
- A filename in cards.txt that has no matching image just won't show
  (the card keeps its placeholder). No harm done.
- Brand-new SUITS (beyond the 7 listed) also need a color + icon added
  in the game's SUIT_COLOR / SUIT_GLYPH / SUITS lists — ask your
  developer. New names and new art for the existing suits need no code.
