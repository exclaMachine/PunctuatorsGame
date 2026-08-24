#!/usr/bin/env python3
"""
build-ladders.py
----------------
Build the word-ladder parent map for Punctuators' General Ization / Keen Arrow mode
(docs/punctuators-ladder.md, M1). BUILD-TIME ONLY — the game just imports the generated
`ladderPOJO.js` and does plain map lookups.

Output:
  ladderPOJO.js   export const ladderDown = { dog: "poodle pug corgi …", mammal: "dog cat …", … }

Why one relation map and not full chains: storing `poodle,dog,mammal,animal` once per word repeats
every suffix. The map is the minimal form and a chain is just a walk over it; the up direction is
the map inverted at load — so General Ization can never desync from Keen Arrow (docs §3.3, which
planned to ship the up map; see write_js for why down is shipped instead).

Why Python and not JS: the rungs have to be SENSE-DISAMBIGUATED. `data/wordnet-relations.json`
flattens every sense of a word together, so it thinks tree→actor (Herbert Beerbohm Tree) and
dog→sausage. `_best_noun_sense` picks the one sense a player means, and we climb only that.
It started as build_dictionary.py's copy but had to be re-ordered — see the note on it below.

Also builds the PUZZLE corpus for the Restore the Phrase mode (docs §11.5):

  phrases-source.txt  ->  phrasePOJO.js   export const ladderPhrases = [ {show, say, fix…}, … ]

…and the ANSWER-CHECKING map for the Word Race mode (docs §12.2):

  ladderAltPOJO.js   export const ladderAlt = { tree: "oak maple birch …", … }

USAGE
  pip install nltk
  python3 build-ladders.py                  # downloads WordNet to a temp dir, writes ladderPOJO.js
  python3 build-ladders.py --check          # full pass + the spot-check report, but no write
  python3 build-ladders.py --spot [word …]  # ladders for the spot list (+ any extra words), in seconds
  python3 build-ladders.py --why dog        # one raw WordNet climb, with a verdict per candidate
  python3 build-ladders.py --phrases        # phrases-source.txt -> phrasePOJO.js (+ rewrites the #~ notes)
  python3 build-ladders.py --phrases --check   # same, reported but written nowhere
  python3 build-ladders.py --alt            # ladderPOJO.js -> ladderAltPOJO.js (needs WordNet)
  python3 build-ladders.py --alt --check    # same, reported but written nowhere
The tuning loop is --spot to iterate, --why when a word surprises you, then a bare run to ship.

--phrases needs NO WordNet: it reads the already-generated ladderPOJO.js, so a puzzle can never
assert a rung the game doesn't have, and the prune-then-rebuild loop costs a second, not a minute.
--alt reads that same shipped file for the same reason, but DOES need WordNet, because the whole
point of it is the senses the shipped map threw away.
"""

import json
import os
import re
import sys
import tempfile

OUT_FILE = "ladderPOJO.js"
PHRASE_SRC = "phrases-source.txt"
PHRASE_OUT = "phrasePOJO.js"
ALT_OUT = "ladderAltPOJO.js"

# The phrase build works off the shipped map (see the module docstring), so skip the WordNet
# download and the three corpora entirely — none of the code it reaches touches them.
PHRASES_ONLY = "--phrases" in sys.argv

if not PHRASES_ONLY:
    # --- WordNet to a TEMP location so we never commit the raw DB (same as build_dictionary.py) ---
    TMP_NLTK = os.path.join(tempfile.gettempdir(), "inklings_nltk_data")
    os.makedirs(TMP_NLTK, exist_ok=True)
    os.environ["NLTK_DATA"] = TMP_NLTK

    import nltk
    nltk.data.path.insert(0, TMP_NLTK)
    for pkg in ("wordnet", "omw-1.4"):
        try:
            nltk.download(pkg, download_dir=TMP_NLTK, quiet=True)
        except Exception as e:
            print(f"warn: could not download {pkg}: {e}")

    from nltk.corpus import wordnet as wn

# ----------------------------------------------------------------------------
# Tuning knobs (docs §3.2). All three were tuned against real output in M1.
# ----------------------------------------------------------------------------

MAX_CLIMB = 14          # raw WordNet hops to try before giving up on finding a qualifying rung
MAX_CHAIN = 6           # cap on rungs in one ladder (docs §3.2 step 4)
MIN_COUNT_RARE = 2      # SemCor lemma.count() a rung needs when it's NOT in 2of12.txt

# Familiar category words a ladder is allowed to END on, so every climb finishes somewhere a kid
# recognises instead of at `physical_entity`. Refinement on docs §3.2 step 3: reaching a TOP_STOP
# doesn't hard-stop the climb — it narrows it, so from there only ANOTHER top-stop can be a rung.
# That buys oak→tree→plant instead of stopping dead at the first one.
TOP_STOPS = set("""
animal plant tree flower bird fish insect food drink person body place
building vehicle machine tool clothing container furniture instrument toy
game weapon material liquid color shape number time feeling action idea
""".split())
# `thing` was on the docs' top-stop list and is deliberately NOT here: it is the one category word
# that teaches nothing ("a stream is a kind of thing"), and WordNet's thing.n.12 sits directly
# above several common branches, so it was swallowing them. It's in BANNED_RUNGS instead.

# Familiar MIDDLE categories. WordNet buries these under jargon, so the nearest-rung rule flies
# straight past them to a top-stop and the ladder loses a rung: dog's first presentable parent is
# `animal` (via domestic_animal), with `mammal` four hops away behind canine/carnivore/placental.
# A word from this set is preferred ONLY when the alternative is a top-stop — i.e. only when it
# buys a rung that would otherwise not exist. `poodle` still goes to `dog`, never to `mammal`.
MID_RUNGS = set("""
mammal reptile amphibian rodent fruit vegetable meat grain metal stone wood cloth water
boat ship aircraft train truck bug worm shellfish
footwear headgear garment utensil vessel publication tableware jewelry seat dish
""".split())

# Technical parents that are real words but teach nothing — the taxonomy jargon sitting between
# `dog` and `animal`. This is the list that does the real work; 2of12 membership happily admits
# `canine, carnivore, placental, vertebrate, chordate, angiosperm`, so it can't be the only gate.
BANNED_RUNGS = set("""
entity abstraction abstract whole object physical unit part portion component constituent
relation attribute property cognition content event act action_ state condition measure
magnitude quantity amount matter substance stuff item article commodity goods artifact artefact
instrumentality instrumentation implement device appliance equipment apparatus contrivance gadget
conveyance transport transportation
structure construction facility installation covering material_ medium
causal_agent agent organism being life form living creature entity_
group grouping collection aggregation assemblage arrangement set system
process phenomenon happening occurrence occurrent activity
psychological_feature natural_object body_part
organ tissue anatomical
vertebrate invertebrate chordate craniate
mammal_ placental eutherian metatherian prototherian
carnivore canine canid feline felid ungulate rodent primate marsupial cetacean
pinniped mustelid viverrine procyonid bovid cervid equine caniche
arthropod insect_ arachnid crustacean myriapod hexapod
passerine oscine ratite carinate raptor piciform galliform anseriform
salmonid teleost percoid osteichthyes elasmobranch cyprinid
mollusk mollusc gastropod bivalve cephalopod echinoderm coelenterate cnidarian
tracheophyte spermatophyte angiosperm gymnosperm magnoliopsid liliopsid dicot monocot
thallophyte cryptogam bryophyte pteridophyte protoctist protozoan prokaryote eukaryote
microorganism micro_organism
herb herbaceous woody vascular
compound chemical element_ mixture solution
worker skilled_worker professional adult grownup individual mortal somebody someone soul
sustenance nutrient nutriment nourishment aliment alimentation victuals
product production creation produce output
manse home housing dwelling abode domicile habitation lodging
elevation formation mechanism striker thing work solid foodstuff nutrition ware
municipality district drupe
""".split())

# WordNet failures that only a human can call. Each is a common word whose ladder is wrong or
# missing for a reason the filters above can't see; the value must itself be a valid rung.
#   water    — water.n.01 is filed as a binary COMPOUND, so the climb goes to `material`.
#   hammer   — hammer.n.01 is the part of a GUNLOCK that strikes the cap, and it outranks the
#              hand tool on count, so the climb goes hammer → striker → mechanism.
#   mountain — natural_elevation → geological_formation → object: nothing familiar on the branch.
#   pencil   — its only parent is `writing_implement`, which has no one-word lemma at all.
PARENT_OVERRIDE = {
    "water": "liquid",
    "hammer": "tool",
    "mountain": "place",
    "pencil": "tool",
}

# The two words where corpus frequency picks the wrong sense outright, pinned by synset. Both are
# cases where SemCor's most-counted reading is not what anyone typing the word into a game means.
#   plant — plant.n.01 "buildings for carrying on industrial labor" (count 63) beats the flora
#           (count 37), which would break every ladder meant to end at `plant`.
#   seal  — sealing_wax.n.01 (count 4) beats the animal (count 0).
SENSE_OVERRIDE = {
    "plant": "plant.n.02",
    "seal": "seal.n.09",
}


# ----------------------------------------------------------------------------
# Sense disambiguation — started from build_dictionary.py:231, then re-ordered (see below).
# ----------------------------------------------------------------------------
# Prefer a word's concrete "thing" sense over abstract ones — 'tiger' is an animal, not "an
# audacious person". Here this is only a TIEBREAK among senses with no corpus count at all, so the
# two edits to build_dictionary.py's table are small: `Tops` (WordNet's own top-level ontology
# category, and exactly where the capstone words live — animal, food, person) is promoted from the
# default 2 to 9, and `plant` drops to 8 so an untouched-by-SemCor food sense wins the tie against
# a tree of the same name (banana.n.02 the fruit over banana.n.01 the treelike herb).
_SENSE_RANK = {"animal": 9, "food": 9, "Tops": 9, "plant": 8, "artifact": 7, "body": 6, "object": 5,
               "substance": 5, "location": 4, "person": 4, "group": 3, "shape": 3, "phenomenon": 3}

_sense_cache = {}


def _best_noun_sense(w):
    """The sense a player most likely means.

    DELIBERATE DEVIATION from build_dictionary.py, which the ladder plan (docs §3.2) said to reuse
    verbatim. That version sorts by _SENSE_RANK FIRST and only breaks ties on corpus frequency,
    which is right for Inklings (it shelves a word under a category and wants the concrete reading)
    but wrong here, because a ladder ASSERTS the relation and a wrong sense states a falsehood:

        king → checker      (king.n.08, the draughts piece, is noun.artifact = rank 7)
        soldier → insect    (the soldier ANT is noun.animal = rank 9)
        drum → fish         (drum.n.06, the fish)
        jacket → peel       (jacket.n.04, the skin of a baked potato, is noun.food)

    Order it the other way — real corpus evidence first, rank only as a tiebreak among senses with
    NO evidence — and all four come right, plus `water` stops being a food and `book` becomes a
    publication (both of which had needed hand-overrides). Measured on a 24-word probe it won 8
    cases and lost 2, and those 2 are pinned in SENSE_OVERRIDE below.
    """
    if w in _sense_cache:
        return _sense_cache[w]
    if w in SENSE_OVERRIDE:
        _sense_cache[w] = wn.synset(SENSE_OVERRIDE[w])
        return _sense_cache[w]
    syns = wn.synsets(w, pos="n")
    if not syns:
        _sense_cache[w] = None
        return None

    def score(s):
        cnt = next((l.count() for l in s.lemmas() if l.name() == w), 0)
        return (cnt > 0, cnt, _SENSE_RANK.get(s.lexname().split(".")[-1], 2), -syns.index(s))
    _sense_cache[w] = max(syns, key=score)
    return _sense_cache[w]


def single_word(name):
    return name.isalpha() and name.islower()


# ----------------------------------------------------------------------------
# Load the corpora the repo already ships
# ----------------------------------------------------------------------------
def load_wordlist(path):
    with open(path, encoding="utf-8", errors="ignore") as f:
        return {ln.strip().lower() for ln in f if ln.strip()}


if not PHRASES_ONLY:
    print("loading dictionary.json / enable1.txt / 2of12.txt …")
    DICT = json.load(open("data/dictionary.json", encoding="utf-8"))
    ENABLE1 = load_wordlist("enable1.txt")
    COMMON = {w.split("%")[0] for w in load_wordlist("2of12.txt")}   # 2of12 tags some entries with %

    DICT_NOUNS = {w for w, e in DICT.items() if "noun" in (e.get("pos") or [])}


def semcor_count(word):
    """Highest SemCor frequency this word carries in any noun sense — our commonness proxy."""
    best = 0
    for s in wn.synsets(word, pos="n"):
        for l in s.lemmas():
            if l.name() == word:
                best = max(best, l.count())
    return best


def commonness(w):
    """How familiar a word is, best-effort from what the repo already ships. Used both to pick
    between same-depth rungs and to order the emitted file."""
    return (w in COMMON, semcor_count(w), -len(w))


# ----------------------------------------------------------------------------
# The rung filter (docs §3.2, "Commonness filter")
# ----------------------------------------------------------------------------
_rung_cache = {}


def rung_ok(word):
    """Can this word appear as a rung — i.e. may the game assert 'X is a kind of <word>'?
    Stricter than being allowed to TYPE a word, which is what the eligibility pass below tests."""
    if word in _rung_cache:
        return _rung_cache[word]
    ok = (
        len(word) >= 3
        and word in DICT_NOUNS
        and word in ENABLE1
        and word not in BANNED_RUNGS
        and (word in TOP_STOPS or word in COMMON or semcor_count(word) >= MIN_COUNT_RARE)
    )
    _rung_cache[word] = ok
    return ok


def rung_lemma(syn, exclude, relaxed=False):
    """The best word to call this synset by, or None if it has no presentable name.

    SENSE-COHERENCE is the load-bearing condition here. The shipped map is word→word, but a word
    carries its own best sense, and it is usually not the synset we just named it for:

        mountain → natural_elevation, whose lemma is `elevation`
        …but `elevation`'s own best sense is an architectural DRAWING,
        so the next rung up was `plan`, then `drawing`.
        mansion → lemma `hall`, whose own best sense is a CORRIDOR → passageway → passage.

    The chain derails exactly one rung after any such lemma. Requiring `_best_noun_sense(c) is syn`
    means every rung is a word that genuinely means the thing it was chosen for, so walking the map
    is walking a real hypernym path. It costs coverage — a word with no coherent parent gets no
    ladder — and that is the right trade: a missing ladder is invisible, a wrong one teaches a lie.

    `relaxed` buys some of that coverage back on the second pass (see build()), by waiving
    coherence for TOP_STOPS / MID_RUNGS only. Those can't derail a chain: a top-stop climbs solely
    to other top-stops, and MID_RUNGS is hand-checked. It is what rescues `guitar → instrument`,
    where the parent synset is musical_instrument.n.01 but the bare word `instrument` resolves to
    "a device that requires skill" — different synset, same thing to a player.
    """
    cands = [l.name() for l in syn.lemmas() if single_word(l.name())]
    cands = [c for c in cands if c not in exclude and rung_ok(c)
             and (_best_noun_sense(c) is syn
                  or (relaxed and (c in TOP_STOPS or c in MID_RUNGS)))]
    if not cands:
        return None
    return max(cands, key=lambda c: (c in TOP_STOPS, c in COMMON, semcor_count(c), -len(c)))


def parent_of(word, verbose=False, relaxed=False):
    """Climb from `word`'s best sense to its next rung. Returns that word, or None (capstone).

    BREADTH-FIRST over every hypernym branch, not `hypernyms()[0]`: WordNet routinely lists a dud
    branch first (`dog` → canine | domestic_animal, `wheeled_vehicle` → container | vehicle), so
    following one arm blindly either buries the good rung or lands on a silly one. Nearest rung
    wins; ties at the same depth go to the more common word, which is what picks `vehicle` over
    `container` for `car`.

    Two overrides on "nearest wins", both about not wasting a rung:
      - standing on a top-stop, only another top-stop counts (see TOP_STOPS);
      - if the nearest rung is a top-stop, a MID_RUNGS word deeper in still beats it (see MID_RUNGS).
    """
    if word in PARENT_OVERRIDE:
        return PARENT_OVERRIDE[word]
    return climb_from(word, _best_noun_sense(word), verbose=verbose, relaxed=relaxed)


def climb_from(word, syn, verbose=False, relaxed=False):
    """parent_of's climb, but from a GIVEN synset rather than the word's best sense.

    Split out for --alt (docs §12.2), which needs exactly this walk run against the senses the
    shipped map discarded. Everything about the climb — breadth-first, nearest-rung-wins, the two
    top-stop overrides — is described on parent_of, and lives here so there is only one copy of it.
    """
    if syn is None or syn.instance_hypernyms():
        return None
    at_top = word in TOP_STOPS
    seen = {word}
    found = []                                     # [(depth, name)], shallowest first
    frontier, visited = [syn], {syn}
    for depth in range(1, MAX_CLIMB + 1):
        nxt = []
        for s in frontier:
            for up in s.hypernyms():
                if up not in visited:
                    visited.add(up)
                    nxt.append(up)
        frontier = nxt
        if not frontier:
            break
        picks = []
        for s in frontier:
            name = rung_lemma(s, seen, relaxed)
            if verbose:
                raw = ",".join(l.name() for l in s.lemmas() if single_word(l.name())) or "—"
                tag = "TOP-ONLY skip" if (name and at_top and name not in TOP_STOPS) else \
                      (f"RUNG {name}" if name else "—")
                print(f"    d{depth} {s.name():28s} [{raw}] → {tag}")
            if name and not (at_top and name not in TOP_STOPS):
                picks.append(name)
        seen.update(l.name() for s in frontier for l in s.lemmas())
        if picks:
            found.append((depth, max(picks, key=commonness)))
            # A non-top rung is the answer outright; a top-stop only holds if nothing in MID_RUNGS
            # turns up further along, so keep climbing to look for one.
            if found[0][1] not in TOP_STOPS:
                break
            if found[-1][1] in MID_RUNGS:
                break
    if not found:
        return None
    if found[0][1] in TOP_STOPS:
        mid = next((n for _, n in found if n in MID_RUNGS), None)
        if mid:
            return mid
    return found[0][1]


# ----------------------------------------------------------------------------
# --why: explain one word's climb
# ----------------------------------------------------------------------------
if "--why" in sys.argv:
    w = sys.argv[sys.argv.index("--why") + 1]
    syn = _best_noun_sense(w)
    print(f"{w}: best sense = {syn.name() if syn else None}"
          + (f"  ({syn.definition()})" if syn else ""))
    if syn:
        print(f"  rung_ok({w}) = {rung_ok(w)}   in2of12={w in COMMON}  semcor={semcor_count(w)}")
        print("  climb:")
        print(f"  → parent = {parent_of(w, verbose=True)}")
    sys.exit(0)


# ----------------------------------------------------------------------------
# Build the map
# ----------------------------------------------------------------------------
def eligible_words():
    """Words a player may type and see light up: a noun in our dictionary, >=3 letters, in
    enable1.txt, and not a proper-noun instance (drops Bach, US state codes, …)."""
    out = []
    for w in sorted(DICT_NOUNS):
        if len(w) < 3 or w not in ENABLE1:
            continue
        syn = _best_noun_sense(w)
        if syn is None or syn.instance_hypernyms():
            continue
        out.append(w)
    return out


def build():
    words = eligible_words()
    print(f"eligible nouns: {len(words)}")

    up, rescued = {}, 0
    for i, w in enumerate(words):
        if i and i % 5000 == 0:
            print(f"  … {i}/{len(words)}")
        p = parent_of(w)
        if not p:                       # second pass: waive sense-coherence for familiar categories
            p = parent_of(w, relaxed=True)
            rescued += 1 if p else 0
        if p and p != w:
            up[w] = p
    print(f"  ({rescued} rescued by the relaxed second pass)")

    # Every rung a word points at must exist as a key so the walk can continue past it — give any
    # rung that isn't already in the map its own entry (a capstone is an explicit null).
    frontier = [p for p in up.values() if p not in up]
    while frontier:
        nxt = []
        for p in frontier:
            if p in up:
                continue
            up[p] = parent_of(p) or parent_of(p, relaxed=True)
            if up[p] and up[p] not in up:
                nxt.append(up[p])
        frontier = nxt

    # Cycle break. Lemma→lemma mapping can close a loop even though WordNet's synset graph can't
    # (two words can each be the chosen name for the other's parent). Break at whichever edge
    # closes the loop; leaving one in would hang the runtime walk.
    cycles = 0
    for w in list(up):
        seen, cur = [], w
        while cur and up.get(cur):
            nxt = up[cur]
            if nxt in seen or nxt == w:
                up[cur] = None
                cycles += 1
                break
            seen.append(cur)
            cur = nxt
    if cycles:
        print(f"broke {cycles} cycle(s)")

    # Drop words that ended up with no ladder in EITHER direction — nothing to climb, so nothing
    # for the mode to wrap.
    has_child = set(up.values())
    for w in [w for w, p in up.items() if p is None and w not in has_child]:
        del up[w]

    return up


def chain(up, w):
    out, cur, guard = [w], up.get(w), 0
    while cur and guard < 12:
        out.append(cur)
        cur = up.get(cur)
        guard += 1
    return out


def enforce_chain_cap(up):
    """Cap ladders at MAX_CHAIN rungs (docs §3.2 step 4).

    In a parent map a chain's length is a property of its SHARED TAIL, not of one word, so any cut
    shortens every word above it too — which is how a naive "cut at rung MAX_CHAIN" deleted
    `mammal → animal` and left `dog → mammal` dangling at a nonsense capstone. So: cut the HIGHEST
    edge that doesn't lead to a top-stop, i.e. spend the cut on jargon rather than on the familiar
    category word the whole ladder was climbing toward. If every remaining edge leads to a
    top-stop, the chain is all good rungs and is left long."""
    cuts = 0
    while True:
        worst = max(up, key=lambda w: len(chain(up, w)))
        c = chain(up, worst)
        if len(c) <= MAX_CHAIN:
            break
        victim = next((n for n in reversed(c) if up.get(n) and up[n] not in TOP_STOPS), None)
        if victim is None:
            break
        up[victim] = None
        cuts += 1
    if cuts:
        print(f"chain cap: cut {cuts} node(s) to hold ladders at <= {MAX_CHAIN} rungs")


def write_js(up):
    """Emit the DOWN map — parent -> its children, space-joined in one string.

    Docs §3.3 planned to ship `ladderUp` and invert it at load, and flagged file size as the one
    thing to decide at M1 on real output. Measured on this build:

        pretty ladderUp   694 KB raw / 223 KB gzipped
        minified ladderUp 571 KB     / 212 KB
        ladderDown joined 318 KB     / 145 KB      <-- shipped

    Down wins because the 30,545 edges collapse onto just 4,837 distinct parents, and a child then
    costs `len(word) + 1` inside a shared string instead of repeating its parent and the JSON
    punctuation on its own line. Everything §3.3 wanted still holds: the map is inverted once at
    load to get `ladderUp` (~30k entries, a few ms), the two directions remain exact inverses of
    each other by construction, and the sibling list Keen Arrow needs is now the SHIPPED form
    rather than the derived one. No word is lost — a capstone with children is a key, and a
    capstone without children had no ladder in either direction and was dropped in build().

    Both parents and the children inside each string are ordered MOST-COMMON-FIRST, so Keen Arrow's
    first pick down is the word a player would actually think of. Costs zero bytes.
    """
    down = {}
    for w, p in up.items():
        if p:
            down.setdefault(p, []).append(w)
    lines = ["// ladderPOJO.js — AUTO-GENERATED by build-ladders.py from WordNet. Do not hand-edit.",
             "// A kind of thing -> the narrower kinds of it, space-separated, most familiar first.",
             "//   dog: \"poodle pug corgi …\"   means poodle/pug/corgi are each A KIND OF dog.",
             "// Invert once at load for the up direction (General Ization); walk it as-is for down",
             "// (Keen Arrow). Sense-disambiguated and pruned of taxonomy jargon — docs/punctuators-ladder.md.",
             "export const ladderDown = {"]
    for p in sorted(down, key=lambda w: (commonness(w), w), reverse=True):
        kids = sorted(down[p], key=lambda w: (commonness(w), w), reverse=True)
        lines.append(f'  {p}: "{" ".join(kids)}",')
    lines.append("};")
    lines.append("")
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"wrote {OUT_FILE}: {len(down)} parents / {len(up)} words, "
          f"{os.path.getsize(OUT_FILE) / 1024:.0f} KB")


# ============================================================================
# --phrases: the Restore the Phrase corpus (docs §11.3–§11.5)
# ============================================================================
# phrases-source.txt is hand-authored; {braces} mark the words a puzzle may shift. This pass
# decides HOW each braced word shifts, bakes the result into phrasePOJO.js, and rewrites the `#~`
# annotation lines under every phrase so the dev's sense-check (docs §11.4) is a read.
#
# It reads the SHIPPED ladderPOJO.js rather than climbing WordNet again. That is the point: a
# puzzle asserts the same rungs the game will walk, so the two can't disagree, and re-running after
# a prune is instant.

# Plurals whose rung form the naive rule would get wrong. Only rungs matter here (the source word
# is looked up through data/inflections.json), so this list stays short.
IRREGULAR_PLURAL = {
    "person": "people", "man": "men", "woman": "women", "child": "children",
    "mouse": "mice", "goose": "geese", "foot": "feet", "tooth": "teeth", "ox": "oxen",
}


class PhraseError(Exception):
    """A fault the dev has to fix in phrases-source.txt. Fatal — see docs §11.5."""


def load_ladder_js(path=OUT_FILE):
    """Parse the generated ladderPOJO.js back into (up, down). We generate the file, so its shape
    is known exactly: one `  parent: "child child …",` line per entry."""
    if not os.path.exists(path):
        raise PhraseError(f"{path} not found — run a bare `python3 build-ladders.py` first")
    down, up = {}, {}
    for line in open(path, encoding="utf-8"):
        m = re.match(r'\s*([a-z_]+): "(.*)",\s*$', line)
        if not m:
            continue
        parent, kids = m.group(1), m.group(2).split()
        down[parent] = kids
        for k in kids:
            up.setdefault(k, parent)
    if not down:
        raise PhraseError(f"parsed no entries out of {path} — has its format changed?")
    return up, down


def load_inflections():
    with open("data/inflections.json", encoding="utf-8") as f:
        return json.load(f)


def lemma_of(word, up, down, infl):
    """The ladder key for a written word, plus whether it was written plural."""
    w = word.lower()
    if w in up or w in down:
        return w, False                      # `eggs` and `cards` are keys in their own right
    base = infl.get(w)
    if base and (base in up or base in down):
        return base, True
    for suffix, repl in (("ies", "y"), ("es", ""), ("s", "")):
        if w.endswith(suffix):
            cand = w[: -len(suffix)] + repl
            if cand in up or cand in down:
                return cand, True
    return w, False


def pluralize(word):
    if word in IRREGULAR_PLURAL:
        return IRREGULAR_PLURAL[word]
    if word.endswith(("s", "x", "z", "ch", "sh")):
        return word + "es"
    if word.endswith("y") and word[-2:-1] not in "aeiou":
        return word[:-1] + "ies"
    return word + "s"


def match_case(src, word):
    return word[:1].upper() + word[1:] if src[:1].isupper() else word


def surface(rung, mark):
    """Render a rung the way the phrase wrote its word: plural if it was, capitalised if it was."""
    return match_case(mark["written"], pluralize(rung) if mark["plural"] else rung)


def bare(token):
    """The word inside a token, minus punctuation and any possessive — for collision checks."""
    return re.sub(r"[^a-z]", "", token.lower().replace("'s", ""))


def fix_article(tokens, i):
    """a/an agreement for the token before index i. Done here at build time AND live in-game after
    every rung change (docs §11.6) — `A dog` has to become `An animal` and back."""
    if i == 0:
        return
    prev = tokens[i - 1]
    if prev.lower() not in ("a", "an"):
        return
    word = re.sub(r"^[^A-Za-z]*", "", tokens[i])
    art = "an" if word[:1].lower() in "aeiou" else "a"
    tokens[i - 1] = match_case(prev, art)


def climb_up(word, up, n):
    out, cur = [], word
    for _ in range(n):
        cur = up.get(cur)
        if not cur:
            break
        out.append(cur)
    return out


def pick_child(word, down, pin=None):
    """The narrower rung to use in a puzzle — the pinned one if the author named it.

    ladderPOJO orders children most-common-first, but `commonness()` scores the WORD, not its noun
    sense, so one that is common as something else floats to the front: basket → `frail`,
    worm → `annelid`, mouth → `yap`. Harmless in free play, where the player chose to climb down and
    any true hyponym is a fair answer; wrong in a puzzle, where the shown word IS the clue.

    2of12.txt can't fix this — it admits frail, annelid, yap and ocelot alike, being a word list
    rather than a sense list. Nothing available at build time can, which is the same wall §11.4 hit.
    So the author pins it: `{basket>hamper}` picks the child, exactly as braces pick the word."""
    kids = down.get(word) or []
    if pin:
        return pin if pin in kids else None
    return kids[0] if kids else None


def climb_down(word, down, n, pin=None):
    """n rungs narrower, taking the pinned (first step only) or most familiar child each step."""
    out, cur = [], word
    for step in range(n):
        cur = pick_child(cur, down, pin if step == 0 else None)
        if not cur:
            break
        out.append(cur)
    return out


def full_up_chain(word, up):
    return [word] + climb_up(word, up, 12)


def plan_phrase(text, origin, up, down, infl):
    """Turn one authored line into a puzzle entry. Raises PhraseError on anything the dev must fix.

    Direction mix (docs §11.5): a phrase with two or more braced words shifts at least one word up
    and one down whenever the words allow it, so the player has to use both heroes and Switch
    Character. That requirement IS the lesson — a puzzle solvable with one hero teaches half of it.
    """
    tokens, marks = [], []
    for i, tok in enumerate(text.split(" ")):
        m = re.search(r"\{(\{?)([A-Za-z']+)(?:>([a-z]+))?([\^+]*)\}?\}", tok)
        if m:
            marks.append({"i": i, "written": m.group(2), "rungs": 2 if m.group(1) else 1,
                          "pin": m.group(3), "force": "up" if "^" in m.group(4) else None,
                          "plus": "+" in m.group(4)})
            tok = tok.replace(m.group(0), m.group(2))
        tokens.append(tok)
    if not marks:
        raise PhraseError("no {braced} word — brace one or delete the line")

    for mk in marks:
        word, plural = lemma_of(mk["written"], up, down, infl)
        # `+` is for nouns that don't change in the plural, where nothing in the writing says which
        # one is meant: "plenty of {fish+}" is plural but "a {fish} out of water" is not, and the
        # rungs have to follow ("plenty of sharks", "a shark out of water").
        plural = plural or mk["plus"]
        mk.update(word=word, plural=plural,
                  can_up=len(climb_up(word, up, mk["rungs"])) == mk["rungs"],
                  can_down=len(climb_down(word, down, mk["rungs"], mk["pin"])) == mk["rungs"])
        if mk["pin"] and not mk["can_down"]:
            kids = " ".join((down.get(word) or [])[:12]) or "(none)"
            raise PhraseError(f'"{word}>{mk["pin"]}" — {mk["pin"]} is not a kind of {word}. '
                              f"Pick from: {kids}")
        if mk["force"] == "up" and not mk["can_up"]:
            raise PhraseError(f'"{mk["written"]}^" can\'t broaden — it has no rung above it')
        if not (mk["can_up"] or mk["can_down"]):
            raise PhraseError(f'"{mk["written"]}" has no ladder {mk["rungs"]} rung(s) either way '
                              f"— drop its braces")

    # Assign directions: an author's pin or ^ settles it, then words with only one available
    # direction take it, then the flexible ones fill in whichever side is still missing.
    for mk in marks:
        mk["dir"] = ("down" if mk["pin"] else mk["force"] or
                     ("up" if not mk["can_down"] else "down" if not mk["can_up"] else None))
    for mk in [m for m in marks if m["dir"] is None]:
        used = [m["dir"] for m in marks if m["dir"]]
        mk["dir"] = ("up" if "up" not in used else
                     "down" if "down" not in used else
                     "up" if used.count("up") <= used.count("down") else "down")

    def shifted(mk, direction):
        path = (climb_up(mk["word"], up, mk["rungs"]) if direction == "up"
                else climb_down(mk["word"], down, mk["rungs"], mk["pin"]))
        return path[-1] if len(path) == mk["rungs"] else None

    # Collisions: the shown word must not already appear in the phrase, and two shifted words must
    # not land on the same thing. `The {pot} calling the kettle black` broadens instead of narrowing
    # for exactly this reason — pot's first child IS kettle.
    taken = {bare(t) for j, t in enumerate(tokens) if j not in [m["i"] for m in marks]}
    taken |= {mk["word"] for mk in marks}
    notes = []
    for mk in marks:
        # An author's pin or ^ is not second-guessed: it gets its one direction and nothing else.
        tries = ((mk["dir"],) if (mk["pin"] or mk["force"])
                 else (mk["dir"], "down" if mk["dir"] == "up" else "up"))
        for direction in tries:
            if not mk["can_up" if direction == "up" else "can_down"]:
                continue
            word = shifted(mk, direction)
            if word and word not in taken:
                mk["dir"], mk["shown"] = direction, word
                taken.add(word)
                break
        else:
            mk["shown"] = None
            notes.append(f'"{mk["written"]}" left unshifted — every shift collided with a word '
                         f"already in the phrase")
    marks = [mk for mk in marks if mk["shown"]]
    if not marks:
        raise PhraseError("every braced word collided — brace a different word or delete the line")

    say = " ".join(tokens)
    show_tokens = list(tokens)
    fix = []
    for mk in marks:
        show_tokens[mk["i"]] = tokens[mk["i"]].replace(mk["written"], surface(mk["shown"], mk))
        fix_article(show_tokens, mk["i"])
        if mk["dir"] == "up":
            chain = full_up_chain(mk["word"], up)
            at, goal = mk["rungs"], 0
        else:
            kids = climb_down(mk["word"], down, mk["rungs"], mk["pin"])
            chain = list(reversed(kids)) + full_up_chain(mk["word"], up)
            at, goal = 0, mk["rungs"]
        entry = {"i": mk["i"], "at": at, "goal": goal, "chain": chain}
        if mk["plural"]:
            entry["plu"] = True
        if mk["written"][:1].isupper():
            entry["cap"] = True
        fix.append(entry)

    show = " ".join(show_tokens)
    return {"show": show, "say": say, "origin": origin, "fix": fix,
            "_marks": marks, "_notes": notes}


def verify_phrase(p, up, down):
    """The build-time checks of docs §11.5. All fatal — a bad puzzle must never reach a player."""
    for f, mk in zip(p["fix"], p["_marks"]):
        chain = f["chain"]
        if not (0 <= f["at"] < len(chain) and 0 <= f["goal"] < len(chain)):
            raise PhraseError(f"rung index out of range for {mk['written']}")
        if chain[f["goal"]] != mk["word"]:
            raise PhraseError(f"round-trip failed: chain[{f['goal']}] is "
                              f"{chain[f['goal']]}, not {mk['word']}")
        if chain[f["at"]] != mk["shown"]:
            raise PhraseError(f"shown rung mismatch for {mk['written']}")
        for a, b in zip(chain, chain[1:]):          # every edge must exist in the shipped map
            if up.get(a) != b:
                raise PhraseError(f"chain edge {a} → {b} is not in {OUT_FILE}")
        if surface(mk["shown"], mk) not in p["show"].split(" ")[f["i"]]:
            raise PhraseError(f"token {f['i']} doesn't hold the shifted word for {mk['written']}")
    shown = [surface(mk["shown"], mk).lower() for mk in p["_marks"]]
    if len(set(shown)) != len(shown):
        raise PhraseError(f"two braced words both became {shown}")
    if p["show"] == p["say"]:
        raise PhraseError("nothing actually shifted — the puzzle would start solved")


def read_phrase_source(path=PHRASE_SRC):
    """Split the source into the dev's lines and ours. `#~` lines are ours and are regenerated, so
    they're dropped on read (with the blank line that follows a phrase block)."""
    if not os.path.exists(path):
        raise PhraseError(f"{path} not found")
    items, prev_ours = [], False
    for line in open(path, encoding="utf-8"):
        line = line.rstrip("\n")
        if line.startswith("#~"):
            prev_ours = True
            continue
        if not line.strip() and prev_ours:
            continue
        prev_ours = False
        if line.strip() and not line.lstrip().startswith("#"):
            text, _, origin = line.partition("|")
            items.append(("phrase", text.strip(), origin.strip()))
            prev_ours = True
        else:
            items.append(("raw", line, None))
    return items


def annotate(p, up, down):
    """The `#~` block under one phrase: what the ladder holds for each braced word, and what the
    build decided to show. The `=` line is the one the dev prunes against — it is the puzzle."""
    out = []
    for mk in p["_marks"]:
        arrow = "↕" if mk["can_up"] and mk["can_down"] else "↑" if mk["can_up"] else "↓"
        ups = climb_up(mk["word"], up, 12)
        kids = down.get(mk["word"], [])
        shown_kids = " ".join(kids[:6]) + (f" …+{len(kids) - 6}" if len(kids) > 6 else "")
        out.append(f'#~ {arrow} {mk["written"]:<9} broader: {" → ".join(ups) or "—":<34} '
                   f'narrower: {shown_kids or "—"}')
    moves = ", ".join(f'{mk["written"]} {"←broader" if mk["dir"] == "up" else "→narrower"}'
                      for mk in p["_marks"])
    out.append(f'#~ = {p["show"]}   [{moves}]')
    for n in p["_notes"]:
        out.append(f"#~ ! {n}")
    return out


def js_str(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def write_phrase_js(phrases):
    lines = [
        "// phrasePOJO.js — AUTO-GENERATED by `build-ladders.py --phrases`. Do not hand-edit.",
        "// Edit phrases-source.txt and re-run. Design: docs/punctuators-ladder.md §11.",
        "//   show  what the player is given, with words already shifted along the ladder",
        "//   say   the saying restored — what winning looks like",
        "//   fix   one per shifted word: i = index into show.split(' '), chain = the rungs it may",
        "//         walk (most specific first), at = where it starts, goal = where it belongs.",
        "//         plu/cap mean re-pluralise / re-capitalise a rung when the word moves.",
        "export const ladderPhrases = [",
    ]
    for p in phrases:
        fixes = ", ".join(
            "{ i: %d, at: %d, goal: %d, chain: [%s]%s%s }" % (
                f["i"], f["at"], f["goal"], ", ".join(js_str(c) for c in f["chain"]),
                ", plu: true" if f.get("plu") else "", ", cap: true" if f.get("cap") else "")
            for f in p["fix"])
        lines.append("  { show: %s," % js_str(p["show"]))
        lines.append("    say:  %s," % js_str(p["say"]))
        lines.append("    origin: %s," % js_str(p["origin"]))
        lines.append("    fix: [%s] }," % fixes)
    lines += ["];", ""]
    with open(PHRASE_OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"wrote {PHRASE_OUT}: {len(phrases)} puzzles, "
          f"{os.path.getsize(PHRASE_OUT) / 1024:.0f} KB")


def build_phrases(write=True):
    up, down = load_ladder_js()
    infl = load_inflections()
    items = read_phrase_source()
    out_lines, phrases, errors = [], [], []

    for kind, text, origin in items:
        if kind == "raw":
            out_lines.append(text)
            continue
        try:
            p = plan_phrase(text, origin, up, down, infl)
            verify_phrase(p, up, down)
        except PhraseError as e:
            errors.append(f"  {text}\n      -> {e}")
            out_lines += [f"{text} | {origin}" if origin else text, f"#~ ✗ {e}", ""]
            continue
        phrases.append(p)
        out_lines += [f"{text} | {origin}" if origin else text, *annotate(p, up, down), ""]

    if errors:
        print(f"\n{len(errors)} phrase(s) need fixing in {PHRASE_SRC}:")
        print("\n".join(errors))

    notes = sum(len(p["_notes"]) for p in phrases)
    moved = sum(len(p["fix"]) for p in phrases)
    ups = sum(1 for p in phrases for f in p["fix"] if f["goal"] == 0)
    mixed = sum(1 for p in phrases
                if len({f["goal"] == 0 for f in p["fix"]}) > 1)
    print(f"\n{len(phrases)} puzzles · {moved} shifted words "
          f"({ups} broadened, {moved - ups} narrowed) · "
          f"{mixed} need both heroes · {notes} collision note(s)")
    print("\nsample:")
    for p in phrases[:8]:
        print(f'  {p["show"]}\n      -> {p["say"]}')

    if write:
        with open(PHRASE_SRC, "w", encoding="utf-8") as f:
            f.write("\n".join(out_lines).rstrip("\n") + "\n")
        print(f"\nrewrote {PHRASE_SRC} annotations")
        write_phrase_js(phrases)
    else:
        print(f"\n--check: nothing written")
    return 1 if errors else 0


# ============================================================================
# --alt: the Word Race answer-checking map (docs §12.2, §12.7)
# ============================================================================
# A ladder follows ONE sense, which is what keeps a climb truthful — but a player typing a word
# brings their own sense with them, and the two diverge in both directions:
#
#     oak maple birch -> wood -> material     (typed at `tree`: rejected, and the rejection is a lie)
#     chicken -> meat        tuna -> food        rose -> bush
#
# So: every word's OTHER surviving parents, from its OTHER senses. Used ONLY to check a typed
# answer — the climb itself never touches it, so ladders stay single-sensed and unambiguous, and
# the game can even say "yes — and an oak is also a kind of wood."
#
# It ships as its OWN FILE rather than joining ladderPOJO.js (a departure from docs §12.5, decided
# on the measurement below): free play, Restore the Phrase and the Tree of Kinds all read the main
# corpus and none of them want this, so only the race pays for it.
#
# MEASURED on the built corpus: 8,480 words carry an alt edge (27.8%), 14,152 edges, 158 KB raw /
# 65 KB gzipped — 47% of ladderDown's size. Pruning it to "both ends in 2of12.txt", the curated cut
# §12.7 floated as the cheaper alternative, saves only 9% and loses coverage, so it isn't worth the
# second concept: alt edges are already overwhelmingly between familiar words.

# How much of a word's corpus evidence an ALTERNATE sense has to carry before the game will accept
# an answer through it. This is the filter that separates the two things WordNet files together:
#
#   a second view of the SAME thing   oak.n.01 the tree (c=3) / oak.n.02 the wood (c=1)      KEEP
#                                     chicken the bird (c=16) / chicken the meat (c=10)      KEEP
#   a metaphor or a slur              dog.n.01 the animal (c=42) / frump.n.01 a person (c=0) DROP
#                                     plant (c=63) / a person planted in an audience (c=0)   DROP
#
# Without it the map cheerfully asserts that a dog, a cow, a snake and a plant are all kinds of
# PERSON, and `action`, `knowledge` and `quality` become the widest shelves on it — every one of
# them an obscure or figurative reading no player means when they type the word.
#
# A share rather than a floor, because the pair is what matters, not the absolute number: 0.2 keeps
# every probe in the good column above (lowest, orange, is 0.25) and drops every one in the bad
# column (highest, `way`→action, is 0.10). A word whose senses ALL have zero evidence keeps its alt
# edges — there is no reason to prefer its main sense either, which is exactly how
# _best_noun_sense already treats that case.
ALT_MIN_SHARE = 0.2


def _lemma_count(syn, word):
    return next((l.count() for l in syn.lemmas() if l.name() == word), 0)


def alt_parents_of(word, up, words):
    """`word`'s parents from senses other than its best one — minus anything already reachable.

    Five filters, each of which would otherwise put a lie or a loop in the map:
      - the word must really be a lemma of the sense (WordNet lists synsets a word only relates to);
      - the sense must carry its share of the word's corpus evidence (see ALT_MIN_SHARE);
      - a rung already on the main up-chain adds nothing, since the walk finds it anyway;
      - a rung the shipped map has no node for is unreachable, so it could never be the position
        a player is standing on;
      - an edge whose target sits BELOW the word in the main map would close a cycle.
    """
    best = _best_noun_sense(word)
    if best is None:
        return []
    best_count = _lemma_count(best, word)

    def chain_from(w):
        out, cur, guard = [], up.get(w), 0
        while cur and guard < 12:
            out.append(cur)
            cur = up.get(cur)
            guard += 1
        return out

    known = set(chain_from(word)) | {word}
    out = []
    for syn in wn.synsets(word, pos="n"):
        if syn is best or syn.instance_hypernyms():
            continue
        if not any(l.name() == word for l in syn.lemmas()):
            continue
        if best_count and _lemma_count(syn, word) / best_count < ALT_MIN_SHARE:
            continue
        p = climb_from(word, syn) or climb_from(word, syn, relaxed=True)
        if not p or p == word or p in known or p in out or p not in words:
            continue
        if word in chain_from(p):
            continue
        out.append(p)
    return sorted(out, key=commonness, reverse=True)


def build_alt(write=True):
    up, down = load_ladder_js()
    words = set(up) | set(down)
    print(f"read {OUT_FILE}: {len(down)} parents / {len(words)} words")

    alt = {}
    for i, w in enumerate(sorted(words)):
        if i and i % 5000 == 0:
            print(f"  … {i}/{len(words)}")
        ps = alt_parents_of(w, up, words)
        if ps:
            alt[w] = ps
    edges = sum(len(v) for v in alt.values())
    print(f"alt: {len(alt)} words carry an alt edge ({len(alt) / len(words) * 100:.1f}%), "
          f"{edges} edges")

    # Emitted in ladderDown's own shape — parent -> its children — for the same reason ladderDown
    # is: the edges collapse onto far fewer parents, so a child costs len(word)+1 inside a shared
    # string. The game inverts it at load, exactly as it does the main map.
    altdown = {}
    for w, ps in alt.items():
        for p in ps:
            altdown.setdefault(p, []).append(w)
    lines = [
        "// ladderAltPOJO.js — AUTO-GENERATED by build-ladders.py --alt from WordNet. Do not hand-edit.",
        "// ANSWER-CHECKING ONLY (docs/punctuators-ladder.md §12.2). A kind of thing -> the narrower",
        "// kinds of it that the MAIN ladder sends somewhere else, because their everyday sense and",
        "// their best sense differ:  tree: \"oak maple birch …\"  while ladderDown puts those under wood.",
        "// Word Race accepts a typed word that reaches its target through ladderDown OR through one",
        "// of these edges. The climb itself must never read this file — ladders stay single-sensed.",
        "export const ladderAlt = {",
    ]
    for p in sorted(altdown, key=lambda w: (commonness(w), w), reverse=True):
        kids = sorted(altdown[p], key=lambda w: (commonness(w), w), reverse=True)
        lines.append(f'  {p}: "{" ".join(kids)}",')
    lines.append("};")
    lines.append("")
    blob = "\n".join(lines)

    if not write:
        print(f"--check: {len(altdown)} parents, {len(blob) / 1024:.0f} KB, nothing written")
        return 0
    with open(ALT_OUT, "w", encoding="utf-8") as f:
        f.write(blob)
    print(f"wrote {ALT_OUT}: {len(altdown)} parents / {edges} edges, "
          f"{os.path.getsize(ALT_OUT) / 1024:.0f} KB")
    return 0


SPOT_CHECK = ["poodle", "dog", "tree", "car", "bird", "chair", "pizza", "river", "shoe", "teacher",
              "cat", "salmon", "rose", "hammer", "guitar", "castle", "sandwich", "bee", "shirt",
              "mountain", "doctor", "hat", "spoon", "truck", "wolf", "apple", "book", "cheese"]


def report(up):
    caps, lens = 0, {}
    for w in up:
        c = chain(up, w)
        lens[len(c)] = lens.get(len(c), 0) + 1
        if up[w] is None:
            caps += 1
    print(f"\n{len(up)} words · {caps} capstones · chain lengths "
          + " ".join(f"{k}:{v}" for k, v in sorted(lens.items())))
    print("\nspot check:")
    for w in SPOT_CHECK:
        c = chain(up, w)
        print(f"  {w:10s} {' → '.join(c) if len(c) > 1 else '(no ladder)'}")


def spot_only():
    """Build ladders for SPOT_CHECK alone — seconds instead of the full ~70 s pass, so the
    BANNED_RUNGS / TOP_STOPS / threshold tuning loop stays tight."""
    up, frontier = {}, list(SPOT_CHECK) + sys.argv[sys.argv.index("--spot") + 1:]
    while frontier:
        w = frontier.pop()
        if w in up:
            continue
        up[w] = parent_of(w) or parent_of(w, relaxed=True)
        if up[w]:
            frontier.append(up[w])
    return up


if __name__ == "__main__":
    if PHRASES_ONLY:
        try:
            sys.exit(build_phrases(write="--check" not in sys.argv))
        except PhraseError as e:
            print(f"error: {e}")
            sys.exit(1)
    if "--alt" in sys.argv:
        try:
            sys.exit(build_alt(write="--check" not in sys.argv))
        except PhraseError as e:
            print(f"error: {e}")
            sys.exit(1)
    if "--spot" in sys.argv:
        up = spot_only()
        for w in SPOT_CHECK + sys.argv[sys.argv.index("--spot") + 1:]:
            c = chain(up, w)
            print(f"  {w:10s} {' → '.join(c) if len(c) > 1 else '(no ladder)'}")
        sys.exit(0)
    ladder = build()
    enforce_chain_cap(ladder)
    report(ladder)
    if "--check" not in sys.argv:
        write_js(ladder)
