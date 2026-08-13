#!/usr/bin/env python3
"""Build data/atlas-world.json for the Inklings World Atlas.  See docs/inklings-atlas.md (M1).

Rasterizes public-domain Natural Earth borders onto a coarse equirectangular grid, so the Atlas board
can draw a chunky pixel-parchment world whose regions sit in roughly real positions.  The coarse grid
IS the art style, not a compromise.

    python3 build_geo.py                 # download (cached) + build data/atlas-world.json
    python3 build_geo.py --report        # …and print the per-country diagnostic table
    python3 build_geo.py --cols 360      # finer grid than the default 240 (rows follow the lat window)
    python3 build_geo.py --refresh       # re-download the Natural Earth sources

STDLIB ONLY — no pip installs.  GeoJSON is read with `json`; polygons are filled with a scanline
even-odd rasterizer written out below.  (Shapely/pyshp would be the usual tools; they're not worth a
dependency for one build script, especially a slow source build on this Mac.)

Sources (both public domain, Natural Earth via the nvkelso/natural-earth-vector mirror):
  * ne_50m_admin_0_countries    — borders.  50m, not 110m: 110m omits every microstate (Singapore,
                                  Vatican, Monaco, Malta…), which would make the "no country may be
                                  invisible" invariant below vacuous for exactly the countries that
                                  need it.
  * ne_50m_populated_places     — capital cities (ADM0CAP=1) with lat/long.
"""

import argparse, json, math, os, sys, unicodedata, urllib.request
from collections import defaultdict

NE_BASE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/"
SOURCES = {
    "countries": "ne_50m_admin_0_countries.geojson",
    "places":    "ne_50m_populated_places.geojson",
}
UA = "InklingsAtlasBuild/1.0 (+https://github.com/exclaMachine/PunctuatorsGame)"

# --- Roster policy -----------------------------------------------------------------------------
# Which features count as a spellable COUNTRY.  Natural Earth's TYPE field is the base rule:
# "Sovereign country", plus "Country" entries that are their own sovereign (which is how NE models
# France, the UK, China, Denmark…) — that test also correctly excludes Jersey, Macao, Greenland,
# Aruba and Åland, which are TYPE="Country" but belong to another sovereign.
#
# NE then files a handful of widely-taught countries under TYPE="Disputed"/"Indeterminate".  Rather
# than let a shapefile's editorial choices decide a children's geography game, the overrides are
# explicit and listed here so they can be argued with in one place.  Everything not promoted stays on
# the map as unspellable terrain — drawn, never claimed.
FORCE_COUNTRY = {
    "ISR",  # Israel — NE files as "Disputed"
    "KOS",  # Kosovo — NE files as "Disputed"
    "TWN",  # Taiwan — NE files as "Country" under sovereignty "Taiwan"; kept spellable
}
NEVER_COUNTRY = {
    "SAH",  # W. Sahara            — contested; drawn, not spellable
    "SOL",  # Somaliland           — contested
    "CYN",  # N. Cyprus            — contested
    "PSX",  # Palestine            — contested
    "KAS",  # Siachen Glacier      — contested
    "ATA",  # Antarctica           — a continent, not a country
    "ATF", "BJN", "CLP", "IOA", "SER", "USG",   # uninhabited / base territories
}

# Capitals Natural Earth's populated-places file doesn't flag as ADM0CAP for their country.
CAPITAL_OVERRIDES = {
    "SDS": ("Juba",  4.8517,  31.5825),   # South Sudan
    "NRU": ("Yaren", -0.5477, 166.9209),  # Nauru — no official capital; Yaren is the de-facto seat
}
# Countries with more than one capital: which one the Atlas teaches.
MULTI_CAPITAL = {"ZAF": "Pretoria"}       # South Africa also has Cape Town + Bloemfontein

# Names Natural Earth spells in a way that would read as a typo on a card.
NAME_FIXUPS = {"eSwatini": "Eswatini"}

def display_name(props):
    """Pick the name a player should read on a card.

    NE's NAME field is abbreviated for map labels ("Dem. Rep. Congo", "Bosnia and Herz.",
    "St. Vin. and Gren.") — unusable as something to spell or read.  NAME_LONG/ADMIN/NAME_EN are
    unabbreviated but sometimes formal ("Republic of Cabo Verde").  So: drop any candidate containing
    an abbreviating period, then take the SHORTEST survivor.  Shortest is what keeps the everyday
    name — Congo over "Republic of the Congo", Czechia over "Czech Republic", United States over
    "United States of America" — which is both what a player would type and what's teachable.
    """
    cands = [props.get(k) for k in ("NAME", "NAME_LONG", "ADMIN", "NAME_EN")]
    cands = [c for c in cands if c and "." not in c]
    if not cands:
        return props.get("NAME") or props.get("ADM0_A3")
    return min(cands, key=len)          # min() is stable: ties keep NAME > NAME_LONG > ADMIN order

# --- Text -------------------------------------------------------------------------------------
# The Atlas normalizes accents away for v1 (Bogotá -> Bogota); the accented form is kept in the data
# so docs/inklings-diacritics.md can light it up later without a rebuild.
_TRANSLIT = {"ø": "o", "Ø": "O", "æ": "ae", "Æ": "AE", "œ": "oe", "Œ": "OE",
             "ß": "ss", "đ": "d", "Đ": "D", "ł": "l", "Ł": "L", "þ": "th", "Þ": "Th", "ð": "d", "Ð": "D"}

def tidy(s):
    """Collapse the stray whitespace NE ships in a few names ("Washington,  D.C.")."""
    return " ".join(s.split()) if s else s

def deaccent(s):
    """Fold to plain ASCII letters: Bogotá -> Bogota, Åland -> Aland, Curaçao -> Curacao."""
    s = "".join(_TRANSLIT.get(c, c) for c in s)
    return "".join(c for c in unicodedata.normalize("NFD", s) if not unicodedata.combining(c))

def is_single_word(s):
    """v1 spellability: one word of plain letters.  Spaces, hyphens and periods are deferred —
    the desk has no space tile yet (docs/inklings-atlas.md §5.3)."""
    return bool(s) and s.isalpha() and s.isascii()

def flag_emoji(iso2):
    """ISO-3166 alpha-2 -> regional-indicator pair.  No asset needed; platforms without flag glyphs
    fall back to showing the two letters, which is a fine card."""
    if not iso2 or len(iso2) != 2 or not iso2.isalpha():
        return None
    return "".join(chr(0x1F1E6 + ord(c) - ord("A")) for c in iso2.upper())

# --- Fetch ------------------------------------------------------------------------------------
def fetch(cache_dir, name, refresh=False):
    path = os.path.join(cache_dir, name)
    if os.path.exists(path) and not refresh:
        return path
    os.makedirs(cache_dir, exist_ok=True)
    url = NE_BASE + name
    print("  downloading %s …" % name, flush=True)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=180) as r, open(path, "wb") as f:
        f.write(r.read())
    return path

# --- Rasterizer -------------------------------------------------------------------------------
class Grid:
    """Equirectangular cell grid.  Latitude is windowed (default -60..84) because a full -90..90
    globe spends ~17% of its rows on Antarctica and empty polar ocean; rows default to whatever
    keeps cells square in degrees."""

    def __init__(self, cols, rows, lat_min, lat_max):
        self.cols, self.rows = cols, rows
        self.lat_min, self.lat_max = lat_min, lat_max
        self.cw = 360.0 / cols                      # cell width  in degrees of longitude
        self.ch = (lat_max - lat_min) / rows        # cell height in degrees of latitude

    def cell_lon(self, col):  return -180.0 + (col + 0.5) * self.cw
    def cell_lat(self, row):  return self.lat_max - (row + 0.5) * self.ch     # row 0 = north

    def col_of(self, lon):
        c = int(math.floor((lon + 180.0) / self.cw))
        return min(max(c, 0), self.cols - 1)

    def row_of(self, lat):
        r = int(math.floor((self.lat_max - lat) / self.ch))
        return min(max(r, 0), self.rows - 1)

def polygons_of(geom):
    """GeoJSON geometry -> list of polygons, each a list of rings (outer first, then holes)."""
    t = geom.get("type")
    if t == "Polygon":
        return [geom["coordinates"]]
    if t == "MultiPolygon":
        return list(geom["coordinates"])
    return []

def fill_polygon(grid, rings, emit):
    """Scanline even-odd fill.  For each grid row, intersect the row's centre latitude with every
    edge of every ring of this polygon, sort the crossings, and fill the alternating spans.  Even-odd
    across all rings of one polygon is exactly GeoJSON's outer/hole semantics, so holes come out free.

    O(edges) per row rather than O(cells x edges) per polygon — the difference between a script that
    takes seconds and one that takes minutes on Russia.

    Note this is run on the SUB-sample grid, not the output grid (see rasterize): one sample per
    output cell would drop any country narrower than a cell no matter how fine the grid got.
    """
    lat_lo = min(min(p[1] for p in ring) for ring in rings)
    lat_hi = max(max(p[1] for p in ring) for ring in rings)
    r0 = max(0, grid.row_of(min(lat_hi, grid.lat_max)))
    r1 = min(grid.rows - 1, grid.row_of(max(lat_lo, grid.lat_min)))
    if r1 < r0:
        return

    for row in range(r0, r1 + 1):
        y = grid.cell_lat(row)
        xs = []
        for ring in rings:
            n = len(ring)
            for i in range(n):
                x1, y1 = ring[i][0], ring[i][1]
                x2, y2 = ring[(i + 1) % n][0], ring[(i + 1) % n][1]
                if (y1 <= y < y2) or (y2 <= y < y1):        # half-open: no double-count at vertices
                    xs.append(x1 + (y - y1) / (y2 - y1) * (x2 - x1))
        if len(xs) < 2:
            continue
        xs.sort()
        for i in range(0, len(xs) - 1, 2):
            xa, xb = xs[i], xs[i + 1]
            # cells whose CENTRE falls inside the span
            ca = int(math.ceil((xa + 180.0) / grid.cw - 0.5))
            cb = int(math.floor((xb + 180.0) / grid.cw - 0.5))
            for col in range(max(ca, 0), min(cb, grid.cols - 1) + 1):
                emit(col, row)

# --- Build ------------------------------------------------------------------------------------
def classify(props):
    """-> 'country' (spellable roster) | 'dependency' | 'other'.  Non-countries are still drawn."""
    a3 = props.get("ADM0_A3")
    if a3 in FORCE_COUNTRY:
        return "country"
    if a3 in NEVER_COUNTRY:
        return "other"
    t = props.get("TYPE")
    if t == "Sovereign country":
        return "country"
    if t == "Country":
        return "country" if props.get("SOVEREIGNT") == props.get("ADMIN") else "dependency"
    if t == "Dependency":
        return "dependency"
    return "other"

def pick_iso2(props):
    for k in ("ISO_A2", "ISO_A2_EH", "WB_A2"):
        v = props.get(k)
        if v and v != "-99" and len(v) == 2 and v.isalpha():
            return v
    return None

def load_capitals(path):
    """ADM0_A3 -> {name, name_accented, lat, lon}, one per country."""
    with open(path, encoding="utf-8") as f:
        feats = json.load(f)["features"]
    best = {}
    for feat in feats:
        p = feat["properties"]
        if p.get("ADM0CAP") != 1:
            continue
        a3 = p.get("ADM0_A3")
        if not a3:
            continue
        # Prefer the English exonym: NE's NAME is the local form (København, and a plain wrong
        # "Andorra" for Andorra la Vella).  Skip NAME_EN when it abbreviates ("St. George's").
        cands = [tidy(p.get(k)) for k in ("NAME_EN", "NAME", "NAMEASCII")]
        name = next((c for c in cands if c and "." not in c), None) or tidy(p.get("NAME"))
        name = NAME_FIXUPS.get(name, name)
        rec = {"name": deaccent(name), "name_accented": name,
               "lat": float(p["LATITUDE"]), "lon": float(p["LONGITUDE"]),
               "pop": p.get("POP_MAX") or 0}
        prev = best.get(a3)
        if prev is None:
            best[a3] = rec
        else:                                   # multi-capital country: explicit choice, else biggest
            want = MULTI_CAPITAL.get(a3)
            if want and rec["name"] == want:
                best[a3] = rec
            elif not (want and prev["name"] == want) and rec["pop"] > prev["pop"]:
                best[a3] = rec
    for a3, (name, lat, lon) in CAPITAL_OVERRIDES.items():
        best.setdefault(a3, {"name": name, "name_accented": name, "lat": lat, "lon": lon, "pop": 0})
    return best

def build(args):
    print("Inklings World Atlas — building %s" % args.out)
    cache = {k: fetch(args.cache, v, args.refresh) for k, v in SOURCES.items()}

    print("  reading Natural Earth …", flush=True)
    with open(cache["countries"], encoding="utf-8") as f:
        features = json.load(f)["features"]
    capitals = load_capitals(cache["places"])

    rows = args.rows or max(1, int(round(args.cols * (args.lat_max - args.lat_min) / 360.0)))
    grid = Grid(args.cols, rows, args.lat_min, args.lat_max)
    print("  grid %dx%d  (%.2f° x %.2f° cells, lat %g..%g)"
          % (grid.cols, grid.rows, grid.cw, grid.ch, grid.lat_min, grid.lat_max))

    # --- meta, keyed by ADM0_A3 and sorted so the whole build is deterministic
    meta = {}
    for feat in features:
        p = feat["properties"]
        a3 = p.get("ADM0_A3")
        if not a3 or a3 in meta:
            continue
        raw = tidy(display_name(p))
        raw = NAME_FIXUPS.get(raw, raw)
        meta[a3] = {"feature": feat, "props": p, "kind": classify(p),
                    "name": deaccent(raw), "name_accented": raw,
                    "continent": p.get("CONTINENT"), "iso2": pick_iso2(p)}
    order = sorted(meta)

    # --- rasterize, by supersampled vote
    # Each output cell is sampled S x S times and goes to whichever country covers the most of it.
    # Sampling once per cell (at its centre) would silently drop every country narrower than a cell —
    # Slovenia, Kuwait, Lebanon, Rwanda — and raising the grid resolution does NOT fix that, it just
    # moves which countries fall through.  Voting also puts borders where the land actually is,
    # instead of wherever a single sample point happened to land.
    s = args.subsample
    sub = Grid(grid.cols * s, grid.rows * s, grid.lat_min, grid.lat_max)
    print("  rasterizing %d features (%dx%d supersample) …" % (len(order), s, s), flush=True)
    votes = defaultdict(lambda: defaultdict(int))          # (col,row) -> {a3: samples}
    for a3 in order:
        def emit(scol, srow, _a3=a3):
            votes[(scol // s, srow // s)][_a3] += 1
        for rings in polygons_of(meta[a3]["feature"]["geometry"]):
            fill_polygon(sub, rings, emit)

    owner = {}                                   # (col,row) -> a3
    cells = defaultdict(list)                    # a3 -> [(col,row), …]
    for cell, tally in votes.items():
        # most samples wins; ISO code breaks ties so the build is deterministic
        owner[cell] = min(sorted(tally), key=lambda a: -tally[a])
    for cell, a3 in owner.items():
        cells[a3].append(cell)
    for a3 in cells:
        cells[a3].sort()

    # --- invariant: no country may be invisible (docs/inklings-atlas.md §5.3)
    # A microstate can be smaller than a cell and win nothing.  Give it its capital's cell; if that's
    # taken, spiral out for a free one; as a last resort take a cell from the largest neighbour that
    # can spare it.  Without this, Singapore/Monaco/Vatican are in `places` but unreachable on the board.
    forced = []
    for a3 in order:
        m = meta[a3]
        if m["kind"] != "country" or cells[a3]:
            continue
        cap = capitals.get(a3)
        if cap:
            c0, r0 = grid.col_of(cap["lon"]), grid.row_of(cap["lat"])
        else:
            pts = [pt for rings in polygons_of(m["feature"]["geometry"]) for pt in rings[0]]
            if not pts:
                continue
            c0 = grid.col_of(sum(p[0] for p in pts) / len(pts))
            r0 = grid.row_of(sum(p[1] for p in pts) / len(pts))
        placed = None
        for radius in range(0, 4):               # free cell near the capital?
            for dr in range(-radius, radius + 1):
                for dc in range(-radius, radius + 1):
                    if max(abs(dr), abs(dc)) != radius:
                        continue
                    c, r = c0 + dc, r0 + dr
                    if 0 <= c < grid.cols and 0 <= r < grid.rows and (c, r) not in owner:
                        placed = (c, r); break
                if placed: break
            if placed: break
        how = "empty cell"
        if placed is None:                       # landlocked by neighbours — take one from the biggest
            victim = max((owner.get((c0 + dc, r0 + dr)) for dr in (-1, 0, 1) for dc in (-1, 0, 1)
                          if owner.get((c0 + dc, r0 + dr))),
                         key=lambda v: len(cells[v]), default=None)
            if victim and len(cells[victim]) > 1:
                for dr in (0, -1, 1):
                    for dc in (0, -1, 1):
                        c, r = c0 + dc, r0 + dr
                        if owner.get((c, r)) == victim:
                            cells[victim].remove((c, r)); placed = (c, r); how = "taken from " + victim
                            break
                    if placed: break
        if placed:
            owner[placed] = a3
            cells[a3].append(placed)
            forced.append((a3, m["name"], how))

    # --- per-country cells -> label anchor
    def label_cell(pts):
        """The cell in the widest horizontal run — where a name label has room to sit."""
        by_row = defaultdict(list)
        for c, r in pts:
            by_row[r].append(c)
        best, best_len = None, -1
        for r in sorted(by_row):
            cs = sorted(by_row[r])
            run_start = prev = cs[0]
            for c in cs[1:] + [None]:
                if c is not None and c == prev + 1:
                    prev = c; continue
                run_len = prev - run_start + 1
                if run_len > best_len:
                    best_len, best = run_len, ((run_start + prev) // 2, r)
                if c is not None:
                    run_start = prev = c
        return best

    # --- places
    places, stats = {}, defaultdict(int)
    for a3 in order:
        m = meta[a3]
        pts = cells[a3]
        if not pts:
            continue                             # drew nothing and couldn't be forced on: drop it
        cap = capitals.get(a3)
        cap_cell = None
        if cap:
            cc, cr = grid.col_of(cap["lon"]), grid.row_of(cap["lat"])
            cap_cell = [cc, cr]
        spell_country = m["kind"] == "country" and is_single_word(m["name"])
        spell_capital = bool(cap) and spell_country and is_single_word(cap["name"])
        anchor = label_cell(pts)
        rec = {
            "country": m["name"], "continent": m["continent"], "kind": m["kind"],
            "cells": len(pts),
            "labelCell": list(anchor) if anchor else None,
            "spellable": {"country": spell_country, "capital": spell_capital},
        }
        if m["name_accented"] != m["name"]:
            rec["country_accented"] = m["name_accented"]
        if cap:
            rec["capital"] = cap["name"]
            rec["capCell"] = cap_cell
            if cap["name_accented"] != cap["name"]:
                rec["capital_accented"] = cap["name_accented"]
        if m["iso2"]:
            rec["iso2"] = m["iso2"]
            f = flag_emoji(m["iso2"])
            if f:
                rec["flag"] = f
        places[a3] = rec
        stats[m["kind"]] += 1
        if spell_country: stats["spellable_country"] += 1
        if spell_capital: stats["spellable_pair"] += 1

    # --- run-length encode the grid, row by row: [runLength, iso|null]
    rows_rle = []
    for r in range(grid.rows):
        row, run, run_iso = [], 0, owner.get((0, r))
        for c in range(grid.cols):
            iso = owner.get((c, r))
            if iso == run_iso:
                run += 1
            else:
                row.append([run, run_iso]); run, run_iso = 1, iso
        row.append([run, run_iso])
        rows_rle.append(row)

    out = {
        "schemaVersion": 1,
        "source": "Natural Earth 1:50m (public domain) via nvkelso/natural-earth-vector",
        "grid": {"cols": grid.cols, "rows": grid.rows, "proj": "equirect",
                 "lonMin": -180.0, "lonMax": 180.0,
                 "latMin": grid.lat_min, "latMax": grid.lat_max,
                 "rows_rle": rows_rle},
        "places": places,
    }
    os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"), sort_keys=True)

    # --- report
    land = len(owner)
    size = os.path.getsize(args.out)
    print("\n  cells        %d land of %d (%.0f%% land)"
          % (land, grid.cols * grid.rows, 100.0 * land / (grid.cols * grid.rows)))
    print("  places       %d  (%d countries, %d dependencies, %d other)"
          % (len(places), stats["country"], stats["dependency"], stats["other"]))
    print("  spellable    %d countries, %d of those with a spellable capital city"
          % (stats["spellable_country"], stats["spellable_pair"]))
    print("  forced cells %d microstate%s (see --report)" % (len(forced), "" if len(forced) == 1 else "s"))
    print("  wrote        %s  (%.0f KB)" % (args.out, size / 1024.0))

    missing_cap = [a3 for a3 in order if meta[a3]["kind"] == "country" and a3 not in capitals]
    if missing_cap:
        print("  NOTE: %d countries have no capital in the source: %s"
              % (len(missing_cap), ", ".join(missing_cap)))

    if args.report:
        print("\n  forced onto the grid (too small to win a cell):")
        for a3, name, how in forced:
            print("    %-4s %-24s %s" % (a3, name, how))
        print("\n  countries drawn but NOT spellable in v1 (multiword / hyphenated name):")
        for a3 in order:
            p = places.get(a3)
            if p and p["kind"] == "country" and not p["spellable"]["country"]:
                print("    %-4s %s" % (a3, p["country"]))
        print("\n  spellable countries whose capital city is deferred (multiword):")
        for a3 in order:
            p = places.get(a3)
            if p and p["spellable"]["country"] and not p["spellable"]["capital"]:
                print("    %-4s %-20s %s" % (a3, p["country"], p.get("capital", "(no capital in source)")))
    return 0

def main():
    ap = argparse.ArgumentParser(description="Build data/atlas-world.json for the Inklings World Atlas.")
    # 240x96 (1.5° cells) is the tuned default, chosen by measuring the §5.3 invariant rather than by
    # eye: it is the coarsest grid on which NO country has to take a cell from a neighbour, and it
    # renders at exactly 720px wide at 3px/cell — the width of the game canvas.  Coarser (180) forces
    # Rwanda, Burundi, Qatar and Slovenia to steal from COD/SAU/ITA; finer buys little but file size.
    ap.add_argument("--cols", type=int, default=240, help="grid columns (default 240 = 1.5° cells)")
    ap.add_argument("--rows", type=int, default=0, help="grid rows (default: keeps cells square)")
    ap.add_argument("--subsample", type=int, default=3, help="samples per cell edge (default 3 = 9/cell)")
    ap.add_argument("--lat-min", type=float, default=-60.0, dest="lat_min")
    ap.add_argument("--lat-max", type=float, default=84.0, dest="lat_max")
    ap.add_argument("--out", default="data/atlas-world.json")
    ap.add_argument("--cache", default="build-cache", help="where Natural Earth downloads are kept")
    ap.add_argument("--refresh", action="store_true", help="re-download the sources")
    ap.add_argument("--report", action="store_true", help="print the per-country diagnostic tables")
    return build(ap.parse_args())

if __name__ == "__main__":
    sys.exit(main())
