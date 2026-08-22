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

USAGE
  pip install nltk
  python3 build-ladders.py                  # downloads WordNet to a temp dir, writes ladderPOJO.js
  python3 build-ladders.py --check          # full pass + the spot-check report, but no write
  python3 build-ladders.py --spot [word …]  # ladders for the spot list (+ any extra words), in seconds
  python3 build-ladders.py --why dog        # one raw WordNet climb, with a verdict per candidate
The tuning loop is --spot to iterate, --why when a word surprises you, then a bare run to ship.
"""

import json
import os
import sys
import tempfile

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

OUT_FILE = "ladderPOJO.js"

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
    syn = _best_noun_sense(word)
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
