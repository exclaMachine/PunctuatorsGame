#!/usr/bin/env python3
"""
build_dictionary.py
-------------------
Bundle a LOCAL, offline dictionary for Inklings from WordNet (via NLTK), so the game
needs no third-party dictionary API at runtime. Everything here is BUILD-TIME only —
the shipped game just fetches the generated JSON and does plain map lookups.

Outputs (into data/):
  dictionary.json        {word: {pos, def, syn}}   validation core (all single-word lemmas)
  inflections.json       {inflectedForm: lemma}     so plurals/tenses/etc. validate (no JS lemmatizer)
  wordnet-relations.json {word: {hyper,hypo,mero,holo,tropo,entail,cause,ant,sim,attr,pert,deriv}}
                         the relation graph — DORMANT (no runtime feature yet; ready for future mechanics)

Example sentences are the ONLY thing WordNet offers that we drop.

USAGE
  pip install nltk lemminflect
  python build_dictionary.py            # downloads WordNet to a temp dir, writes data/, cleans up
"""

import gzip
import json
import os
import tempfile

# Closed-class "function words" WordNet omits entirely (it only has noun/verb/adjective/adverb). Common
# enough that a player will spell them, so we add any that WordNet lacks with empty POS (no reward — just
# collected) + a generic def. Real WordNet entries are never overwritten (see merge below).
FUNCTION_WORDS = set("""
an the and but or nor for yet so because although though while whereas unless until since whether if than as
that when where why how once
of to in on at by with about against between into through during before after above below under over up down
off out onto upon within without along among amongst around behind beside besides beyond near toward towards
underneath amid amidst per via versus aboard across past plus unto till despite concerning regarding throughout
beneath inside outside opposite
me my mine myself we us our ours ourselves you your yours yourself yourselves he him his himself she her hers
herself it its itself they them their theirs themselves who whom whose which what whoever whomever whatever
whichever someone somebody something somewhere anyone anybody anything anywhere everyone everybody everything
everywhere nobody nothing nowhere none oneself
am is are was were be been being do does did done doing have has had having will would shall should can could
may might must ought need dare
not no yes too very just only also even still then now here there thus hence therefore however moreover
otherwise instead indeed perhaps maybe rather quite almost already always never ever often sometimes usually
again twice soon later ago away back forth
oh ah aha oops ouch hey hi hello hmm huh wow yay ugh eh um uh yeah yep nope nah ok okay alas bravo hooray
hurray phew psst shh whoa yikes gee golly gosh darn dang aw aww etc
""".split())

# --- WordNet to a TEMP location so we never commit the raw DB -------------------
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
import lemminflect

OUT_DIR = "data"
os.makedirs(OUT_DIR, exist_ok=True)

POS_MAP = {"n": "noun", "v": "verb", "a": "adjective", "s": "adjective", "r": "adverb"}


def single_word(name: str) -> bool:
    # single alphabetic lowercase token — no '_' (multiword), '-', digits, or capitals (proper nouns)
    return name.isalpha() and name.islower()


def lemma_names(synsets):
    """Deduped single-word lowercase lemma names across a list of synsets (order-stable)."""
    out, seen = [], set()
    for s in synsets:
        for l in s.lemmas():
            n = l.name()
            if single_word(n) and n not in seen:
                seen.add(n); out.append(n)
    return out


# ----------------------------------------------------------------------------
# 1) dictionary + 2) relations
# ----------------------------------------------------------------------------
def build_dictionary_and_relations():
    words = set()
    for syn in wn.all_synsets():
        for l in syn.lemmas():
            if single_word(l.name()):
                words.add(l.name())

    dictionary, relations = {}, {}
    for word in sorted(words):
        synsets = wn.synsets(word)
        if not synsets:
            continue

        pos = []
        for s in synsets:
            p = POS_MAP.get(s.pos())
            if p and p not in pos:
                pos.append(p)

        definition = synsets[0].definition()          # gloss of the most common sense (examples excluded)
        syn = [n for n in lemma_names(synsets) if n != word]
        dictionary[word] = {"pos": pos, "def": definition, "syn": syn}

        # --- relation graph (direct pointers only; resolved to single-word lemmas) ---
        hyper = hypo = mero = holo = tropo = entail = cause = sim = attr = None
        hyper = lemma_names([x for s in synsets for x in s.hypernyms() + s.instance_hypernyms()])
        hypo  = lemma_names([x for s in synsets for x in s.hyponyms() + s.instance_hyponyms()])
        mero  = lemma_names([x for s in synsets for x in s.part_meronyms() + s.member_meronyms() + s.substance_meronyms()])
        holo  = lemma_names([x for s in synsets for x in s.part_holonyms() + s.member_holonyms() + s.substance_holonyms()])
        tropo = lemma_names([x for s in synsets if s.pos() == "v" for x in s.hyponyms()])  # verb hyponyms = troponyms
        entail = lemma_names([x for s in synsets for x in s.entailments()])
        cause  = lemma_names([x for s in synsets for x in s.causes()])
        sim    = lemma_names([x for s in synsets for x in s.similar_tos()])
        attr   = lemma_names([x for s in synsets for x in s.attributes()])

        # lemma-level pointers (antonyms / pertainyms / derivationally-related), for this word's lemma objects
        ant, pert, deriv, seen_a, seen_p, seen_d = [], [], [], set(), set(), set()
        for s in synsets:
            for l in s.lemmas():
                if l.name() != word:
                    continue
                for a in l.antonyms():
                    if single_word(a.name()) and a.name() not in seen_a:
                        seen_a.add(a.name()); ant.append(a.name())
                for p in l.pertainyms():
                    if single_word(p.name()) and p.name() not in seen_p:
                        seen_p.add(p.name()); pert.append(p.name())
                for d in l.derivationally_related_forms():
                    if single_word(d.name()) and d.name() not in seen_d:
                        seen_d.add(d.name()); deriv.append(d.name())

        rel = {}
        for key, val in (("hyper", hyper), ("hypo", hypo), ("mero", mero), ("holo", holo),
                         ("tropo", tropo), ("entail", entail), ("cause", cause), ("ant", ant),
                         ("sim", sim), ("attr", attr), ("pert", pert), ("deriv", deriv)):
            val = [v for v in val if v != word]
            if val:
                rel[key] = val
        if rel:
            relations[word] = rel

    return dictionary, relations


# ----------------------------------------------------------------------------
# 3) inflection map  { inflectedForm: lemma }
#    forward via lemminflect (handles irregulars) + reverse via WordNet morphy over 2of12
# ----------------------------------------------------------------------------
def deriv_candidates(w):
    """Light derivational fallbacks (adverb -ly, noun -ness) — WordNet often lacks these as lemmas even
    though the base adjective is present. Used only after the real inflection sources miss."""
    c = []
    if w.endswith("ily") and len(w) > 4:   c.append(w[:-3] + "y")   # happily -> happy, easily -> easy
    if w.endswith("ly") and len(w) > 3:    c.append(w[:-2])         # quickly -> quick, abashedly -> abashed
    if w.endswith("iness") and len(w) > 6: c.append(w[:-5] + "y")   # happiness -> happy
    if w.endswith("ness") and len(w) > 5:  c.append(w[:-4])         # abjectness -> abject
    return c


def build_inflections(dict_words):
    infl = {}

    # (a) forward: generate every inflected form for each dictionary lemma
    for lemma in dict_words:
        try:
            allforms = lemminflect.getAllInflections(lemma)     # {PennTag: (form, ...)}
        except Exception:
            allforms = {}
        for forms in allforms.values():
            for f in forms:
                if single_word(f) and f != lemma and f not in dict_words:
                    infl.setdefault(f, lemma)                    # keep first (most common) lemma on collision

    # (b) reverse over 2of12: morphy to a base lemma, else a derivational fallback to a bundled base
    if os.path.exists("2of12.txt"):
        for line in open("2of12.txt", encoding="utf-8"):
            w = line.strip().lower()
            if not single_word(w) or w in dict_words or w in infl:
                continue
            lem = None
            for pos in ("n", "v", "a", "r"):                    # inflectional (proper source): morphy
                m = wn.morphy(w, pos)
                if m and m in dict_words and m != w:
                    lem = m; break
            if not lem:                                         # derivational fallback (-ly / -ness)
                for cand in deriv_candidates(w):
                    if cand in dict_words and cand != w:
                        lem = cand; break
            if lem:
                infl[w] = lem
    return infl


# ----------------------------------------------------------------------------
def write_json(name, obj):
    path = os.path.join(OUT_DIR, name)
    raw = json.dumps(obj, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    with open(path, "wb") as fh:
        fh.write(raw)
    gz = len(gzip.compress(raw))
    mb = lambda n: n / 1024 / 1024
    print(f"  {name:<26} {len(obj):>7,} entries   {mb(len(raw)):6.2f} MB raw   {mb(gz):6.2f} MB gzip")
    return len(raw), gz


def main():
    print("Building dictionary + relations from WordNet…")
    dictionary, relations = build_dictionary_and_relations()
    # add closed-class function words WordNet lacks (never overwrite a real entry)
    added = 0
    for w in FUNCTION_WORDS:
        if w.isalpha() and w.islower() and w not in dictionary:
            dictionary[w] = {"pos": [], "def": "A common function word.", "syn": []}
            added += 1
    print(f"Added {added} function words (of {len(FUNCTION_WORDS)}) not already in WordNet.")

    print("Building inflection map…")
    inflections = build_inflections(set(dictionary.keys()))

    print("\nWrote:")
    write_json("dictionary.json", dictionary)
    write_json("inflections.json", inflections)
    write_json("wordnet-relations.json", relations)

    # --- coverage report against 2of12 (proxy for words a player might spell) ---
    if os.path.exists("2of12.txt"):
        words2 = [w.strip().lower() for w in open("2of12.txt", encoding="utf-8")
                  if single_word(w.strip().lower())]
        covered = [w for w in words2 if w in dictionary or w in inflections]
        misses = [w for w in words2 if w not in dictionary and w not in inflections]
        print(f"\nCoverage vs 2of12 ({len(words2):,} words): "
              f"{len(covered):,} covered ({100*len(covered)/len(words2):.1f}%), {len(misses):,} miss")
        print("  sample misses:", ", ".join(misses[:25]) or "(none)")
    print(f"\nValidatable total = {len(dictionary):,} lemmas + {len(inflections):,} inflected forms "
          f"= {len(dictionary)+len(inflections):,} surface forms")


if __name__ == "__main__":
    main()
