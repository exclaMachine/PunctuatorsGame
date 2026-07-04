#!/usr/bin/env python3
"""
build_levels.py
---------------
Turn the plain-text "Aesop for Children" (Project Gutenberg #19994) into one
mad-libs level JSON per fable, in the game's level schema.

USAGE
    pip install spacy
    python -m spacy download en_core_web_sm
    python build_levels.py 19994.txt.utf-8            # -> data/levels/*.json
    python build_levels.py 19994.txt.utf-8 out/dir    # custom output folder

WHAT IT DOES
    1. Strips Gutenberg boilerplate and [Illustration] tags.
    2. Splits the book into fables on their ALL-CAPS titles (skipping the
       table of contents and front matter).
    3. Separates each fable's closing moral from its narrative.
    4. POS-tags the narrative with spaCy and chooses blanks under these rules:
         - only nouns / verbs / adjectives / adverbs (never proper nouns or
           auxiliaries like "was"/"had")
         - only words that appear ONCE in the fable (so a fill can't contradict
           the rest of the passage)
         - never the first word of a sentence (avoids capitalization mismatches)
         - **blanks kept spaced apart** (>= MIN_TOKEN_GAP tokens between them) so
           you never get two or three blanks bunched together
         - a density cap so short fables don't get overloaded
    5. Emits data/levels/NN-slug.json plus an index.json.

These are HEURISTICS. Skim a few outputs and tweak the knobs / title regex if a
particular fable comes out wrong — the parsing rules are the likeliest to need a
nudge for this edition's quirks.
"""

import json
import os
import re
import sys
from collections import Counter

import spacy

# ----------------------------------------------------------------------------
# Knobs
# ----------------------------------------------------------------------------
MIN_WORD_LEN    = 3     # don't blank words shorter than this
MIN_TOKEN_GAP   = 4     # THE SPACING RULE: min tokens between two blanks
MAX_BLANKS      = 12    # hard cap per fable
WORDS_PER_BLANK = 10    # density: ~1 blank per this many words (capped above)
MIN_BODY_CHARS  = 120   # ignore "fables" shorter than this (drops TOC entries)
WARN_MIN_BLANKS = 3     # warn if a fable yields fewer than this

POS_MAP = {"NOUN": "noun", "VERB": "verb", "ADJ": "adjective", "ADV": "adverb"}

# All-caps headings that are NOT fables
SKIP_TITLES = {
    "CONTENTS", "A LIST OF THE FABLES", "INTRODUCTION", "PREFACE",
    "THE END", "ILLUSTRATIONS", "LIST OF ILLUSTRATIONS", "AESOP FOR CHILDREN",
    "THE AESOP FOR CHILDREN",
}

BOOK_META = {
    "id": "aesop-for-children",
    "title": "The Aesop for Children",
    "source": ("Aesop, ill. Milo Winter (Rand McNally, 1919). "
               "Public domain in the USA. Text via Project Gutenberg #19994."),
    "genre": "fable",
    "letterPool": "balanced",
}

TITLE_RE = re.compile(r"^[A-Z][A-Z ,'’.\-]{2,58}$")


# ----------------------------------------------------------------------------
# Parsing the book into fables
# ----------------------------------------------------------------------------
def load_book(path: str) -> str:
    text = open(path, encoding="utf-8").read()
    start = re.search(r"\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG.*?\*\*\*",
                      text, re.S)
    if start:
        text = text[start.end():]
    end = re.search(r"\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG", text)
    if end:
        text = text[:end.start()]
    text = re.sub(r"\[Illustration[^\]]*\]", "", text)   # drop image tags
    return text


def is_title(line: str) -> bool:
    line = line.strip()
    if not TITLE_RE.match(line):
        return False
    if line in SKIP_TITLES:
        return False
    return any(c.isalpha() for c in line)


def split_fables(text: str):
    """Yield (title, body_text) for each fable."""
    lines = text.splitlines()
    title = None
    buf: list[str] = []
    for line in lines:
        if is_title(line):
            if title and "".join(buf).strip():
                yield title, "\n".join(buf)
            title = line.strip()
            buf = []
        elif title is not None:
            buf.append(line)
    if title and "".join(buf).strip():
        yield title, "\n".join(buf)


def split_paragraphs(body: str):
    paras = re.split(r"\n\s*\n", body)
    cleaned = []
    for p in paras:
        p = re.sub(r"\s+", " ", p).strip()
        if p:
            cleaned.append(p)
    return cleaned


def extract_moral(paras: list[str]):
    """Return (narrative_paras, moral_or_None)."""
    if not paras:
        return paras, None
    last = paras[-1]
    stripped = last.strip("_").strip()
    looks_italic = last.startswith("_") and last.endswith("_")
    short_maxim = len(stripped) <= 140 and stripped.count(".") <= 1
    if looks_italic or short_maxim:
        return paras[:-1], stripped
    return paras, None


def slugify(title: str) -> str:
    s = title.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    s = re.sub(r"^the-", "", s)      # match your existing ids (fox-and-grapes)
    return s


# ----------------------------------------------------------------------------
# Blank selection + segment building
# ----------------------------------------------------------------------------
def choose_blanks(doc, max_blanks: int):
    # single-occurrence check on surface forms
    counts = Counter(t.text.lower() for t in doc if t.is_alpha)

    def eligible(tok):
        return (
            tok.pos_ in POS_MAP
            and tok.is_alpha
            and len(tok.text) >= MIN_WORD_LEN
            and not tok.is_sent_start                 # not sentence-initial
            and counts[tok.text.lower()] == 1         # appears once
        )

    selected = []
    last_i = -10_000
    for tok in doc:
        if len(selected) >= max_blanks:
            break
        if eligible(tok) and (tok.i - last_i) >= MIN_TOKEN_GAP:   # spacing rule
            selected.append(tok.i)
            last_i = tok.i
    return set(selected)


def build_segments(doc, blank_ids: set):
    segments = []
    buf = ""
    n = 0
    counts = {"noun": 0, "verb": 0, "adjective": 0, "adverb": 0}
    for tok in doc:
        if tok.i in blank_ids:
            if buf:
                segments.append({"type": "text", "value": buf})
            n += 1
            pos = POS_MAP[tok.pos_]
            counts[pos] += 1
            blank = {"type": "blank", "id": f"b{n}", "pos": pos, "answer": tok.text}
            if pos == "verb":
                blank["lemma"] = tok.lemma_.lower()
            segments.append(blank)
            buf = tok.whitespace_          # trailing space starts the next run
        else:
            buf += tok.text_with_ws
    if buf.strip():
        segments.append({"type": "text", "value": buf})
    return segments, counts


# ----------------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------------
def main():
    if len(sys.argv) < 2:
        sys.exit("usage: python build_levels.py <gutenberg_text_file> [out_dir]")
    src = sys.argv[1]
    out_dir = sys.argv[2] if len(sys.argv) > 2 else "data/levels"
    os.makedirs(out_dir, exist_ok=True)

    nlp = spacy.load("en_core_web_sm")
    text = load_book(src)

    index = []
    order = 0
    for title, body in split_fables(text):
        paras = split_paragraphs(body)
        if sum(len(p) for p in paras) < MIN_BODY_CHARS:
            continue                                   # skip TOC / stubs
        narrative_paras, moral = extract_moral(paras)
        narrative = "\n\n".join(narrative_paras).replace("_", "")
        if not narrative.strip():
            continue

        doc = nlp(narrative)
        word_tokens = sum(1 for t in doc if t.is_alpha)
        max_blanks = min(MAX_BLANKS, max(1, word_tokens // WORDS_PER_BLANK))
        blank_ids = choose_blanks(doc, max_blanks)
        segments, counts = build_segments(doc, blank_ids)

        order += 1
        slug = slugify(title)
        level = {
            "schemaVersion": 1,
            "book": BOOK_META,
            "level": {
                "id": slug,
                "title": title.title(),
                "order": order,
                "moral": moral or "",
                "blankCounts": counts,
                "segments": segments,
            },
        }

        fname = f"{order:02d}-{slug}.json"
        with open(os.path.join(out_dir, fname), "w", encoding="utf-8") as fh:
            json.dump(level, fh, ensure_ascii=False, indent=2)
        index.append({"id": slug, "title": level["level"]["title"],
                      "order": order, "file": fname})

        total = sum(counts.values())
        flag = "  <-- few blanks" if total < WARN_MIN_BLANKS else ""
        moral_flag = "" if moral else "  <-- no moral found"
        print(f"{order:02d} {title.title():<38} {total:2d} blanks{flag}{moral_flag}")

    with open(os.path.join(out_dir, "index.json"), "w", encoding="utf-8") as fh:
        json.dump(index, fh, ensure_ascii=False, indent=2)
    print(f"\nWrote {len(index)} levels + index.json to {out_dir}/")


if __name__ == "__main__":
    main()
