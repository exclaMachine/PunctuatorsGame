#!/usr/bin/env python3
"""Build data/atlas-world.json for the Inklings World Atlas.  See docs/inklings-atlas.md (M1).

Rasterizes public-domain Natural Earth features onto a coarse equirectangular grid, so the Atlas board
can draw a chunky pixel-parchment world whose places sit in roughly real positions.  The coarse grid IS
the art style, not a compromise.

    python3 build_geo.py                 # download (cached) + build data/atlas-world.json
    python3 build_geo.py --report        # …and print the per-place diagnostic tables
    python3 build_geo.py --cols 360      # finer grid than the default 240 (rows follow the lat window)
    python3 build_geo.py --refresh       # re-download the Natural Earth sources

STDLIB ONLY — no pip installs.  GeoJSON is read with `json`; polygons are filled with a scanline
even-odd rasterizer written out below.  (Shapely/pyshp would be the usual tools; they're not worth a
dependency for one build script, especially a slow source build on this Mac.)

LAYERS.  The grid is not one-owner-per-cell: each layer owns its own grid, so a cell can be both "France"
and "Alps".  Physical features demand it — the Nile crosses six countries, the Sahara ten — and settling
it here means the M3 board renderer is written against the final shape instead of being retrofitted.

  political  countries          ne_50m_admin_0_countries + ne_50m_populated_places (capitals)
  marine     oceans/seas/gulfs  ne_50m_geography_marine_polys
  lakes      lakes              ne_50m_lakes            (min_zoom filtered to the well-known ones)
  peaks      named summits      ne_50m_geography_regions_elevation_points   (points, no grid)

Rivers and mountain RANGES are deliberately absent: rivers are line geometry and need a line rasterizer,
and ne_50m_geography_regions_polys carries no `featurecla`, so it mixes ranges and deserts together with
continents, whole countries and US states.  Both are drop-in later — that's what the layering buys.
"""

import argparse, json, math, os, re, sys, unicodedata, urllib.request
from collections import defaultdict, Counter

NE_BASE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/"
SOURCES = {
    "countries": "ne_50m_admin_0_countries.geojson",
    "places":    "ne_50m_populated_places.geojson",
    "marine":    "ne_50m_geography_marine_polys.geojson",
    "lakes":     "ne_50m_lakes.geojson",
    "peaks":     "ne_50m_geography_regions_elevation_points.geojson",
}
UA = "InklingsAtlasBuild/1.0 (+https://github.com/exclaMachine/PunctuatorsGame)"

LAKE_MAX_ZOOM = 2.0   # NE's own importance metric; <=2 keeps ~44 well-known lakes, not 300 reservoirs

# --- Roster policy -----------------------------------------------------------------------------
# Which features count as a spellable COUNTRY.  Natural Earth's TYPE field is the base rule:
# "Sovereign country" and "Sovereignty", plus "Country" entries that are their own sovereign (which is how
# NE models France, the UK, China, Denmark) — that last test also correctly excludes Jersey, Macao,
# Greenland, Aruba and Åland, which are TYPE="Country" but belong to another sovereign.
#
# NE then files a handful of widely-taught countries under TYPE="Disputed"/"Indeterminate".  Rather than
# let a shapefile's editorial choices decide a children's geography game, the overrides are explicit and
# listed here so they can be argued with in one place.  Everything not promoted stays on the map as
# unspellable terrain — drawn, never claimed.
SOVEREIGN_TYPES = {"Sovereign country", "Sovereignty"}   # "Sovereignty" is how NE files Cuba + Kazakhstan
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

# Capitals Natural Earth gets wrong or doesn't flag.  NE's populated-places file is not maintained as a
# capitals register: it lags renames and prefers the largest city over the official seat.  Every entry
# below is a fact a player would be taught by a fact card, so each is corrected explicitly.
CAPITAL_OVERRIDES = {
    "SDS": ("Juba",       4.8517,  31.5825),   # South Sudan — not flagged ADM0CAP at all
    "NRU": ("Yaren",     -0.5477, 166.9209),   # Nauru — no official capital; Yaren is the de-facto seat
    "BDI": ("Gitega",    -3.4271,  29.9246),   # Burundi — moved from Bujumbura in 2019
    "BEN": ("Porto-Novo", 6.4969,   2.6289),   # Benin — Cotonou is the seat of government, not the capital
    "PLW": ("Ngerulmud",  7.5006, 134.6242),   # Palau — moved from Melekeok in 2006
    "TZA": ("Dodoma",    -6.1630,  35.7516),   # Tanzania — Dar es Salaam is the largest city
    "KAZ": ("Astana",    51.1605,  71.4704),   # Kazakhstan — Nur-Sultan was renamed back in 2022
    "LKA": ("Sri Jayawardenepura Kotte", 6.8890, 79.9186),  # Sri Lanka — Colombo is the commercial capital
}
# Countries with more than one capital: which one the Atlas teaches.  Without this the tiebreak is
# population, which picks the seat of government over the official capital.
MULTI_CAPITAL = {
    "ZAF": "Pretoria",       # also Cape Town (legislative) + Bloemfontein (judicial)
    "CIV": "Yamoussoukro",   # NE would pick Abidjan, the largest city
    "BOL": "Sucre",          # NE would pick La Paz, the seat of government
}

# Names Natural Earth spells in a way that would read as a typo on a card.
NAME_FIXUPS = {"eSwatini": "Eswatini"}

def display_name(props):
    """Pick the name a player should read on a card.

    NE's NAME field is abbreviated for map labels ("Dem. Rep. Congo", "St. Vin. and Gren.") — unusable as
    something to spell or read.  NAME_LONG/ADMIN/NAME_EN are unabbreviated but sometimes formal ("Republic
    of Cabo Verde").  So: drop any candidate containing an abbreviating period, then take the SHORTEST
    survivor.  Shortest is what keeps the everyday name — Congo over "Republic of the Congo", Czechia over
    "Czech Republic", United States over "United States of America".
    """
    cands = [props.get(k) for k in ("NAME", "NAME_LONG", "ADMIN", "NAME_EN")]
    cands = [c for c in cands if c and "." not in c]
    if not cands:
        return props.get("NAME") or props.get("ADM0_A3")
    return min(cands, key=len)          # min() is stable: ties keep NAME > NAME_LONG > ADMIN order

# --- Text -------------------------------------------------------------------------------------
_TRANSLIT = {"ø": "o", "Ø": "O", "æ": "ae", "Æ": "AE", "œ": "oe", "Œ": "OE",
             "ß": "ss", "đ": "d", "Đ": "D", "ł": "l", "Ł": "L", "þ": "th", "Þ": "Th", "ð": "d", "Ð": "D"}

def tidy(s):
    """Collapse the stray whitespace NE ships in a few names ("Washington,  D.C.")."""
    return " ".join(s.split()) if s else s

def deaccent(s):
    """Fold to plain ASCII letters: Bogotá -> Bogota, Åland -> Aland, Curaçao -> Curacao."""
    if not s:
        return s
    s = "".join(_TRANSLIT.get(c, c) for c in s)
    return "".join(c for c in unicodedata.normalize("NFD", s) if not unicodedata.combining(c))

# The generic half of a physical feature's name.  "Pacific Ocean" is spelled **Pacific**, "Mount Everest"
# is **Everest**, "Lake Baikal" is **Baikal** — which is both how people actually say them and the only
# way these layers are spellable at all, since almost every raw name is two words.
_GENERIC = (r"ocean|seas?|gulf|bay|strait|channel|sound|reef|lagoon|lakes?|reservoir|mounts?|mt\.?|"
            r"mountains?|massif|range|peaks?|desert|peninsula|plateau|basin|isles?|islands?|island|"
            r"river|cape|valley|plains?|depression|pass")

def strip_generic(name):
    """"Gulf of Mexico" -> "Mexico";  "Sahara Desert" -> "Sahara";  "Mount Everest" -> "Everest"."""
    s = deaccent(tidy(name)) or ""
    s = re.sub(r"^(?:%s)\s+(?:of\s+the\s+|of\s+)?" % _GENERIC, "", s, flags=re.I)
    s = re.sub(r"\s+(?:%s)$" % _GENERIC, "", s, flags=re.I)
    return s.strip()

def is_single_word(s):
    """v1 spellability: one word of plain letters.  Spaces, hyphens and periods are deferred — the desk
    has no space tile yet (docs/inklings-atlas.md §5.3)."""
    return bool(s) and s.isalpha() and s.isascii()

def flag_emoji(iso2):
    """ISO-3166 alpha-2 -> regional-indicator pair.  No asset needed; platforms without flag glyphs fall
    back to showing the two letters, which is a fine card."""
    if not iso2 or len(iso2) != 2 or not iso2.isalpha():
        return None
    return "".join(chr(0x1F1E6 + ord(c) - ord("A")) for c in iso2.upper())

def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", deaccent(s).lower()).strip("-")

# --- Fetch ------------------------------------------------------------------------------------
def fetch(cache_dir, name, refresh=False):
    """Download to <name>.part and os.replace() on success, so an interrupted fetch can't poison the
    cache with a truncated file that then fails as a baffling JSONDecodeError on every later run."""
    path = os.path.join(cache_dir, name)
    if os.path.exists(path) and not refresh:
        return path
    os.makedirs(cache_dir, exist_ok=True)
    tmp = path + ".part"
    print("  downloading %s …" % name, flush=True)
    req = urllib.request.Request(NE_BASE + name, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=300) as r, open(tmp, "wb") as f:
            f.write(r.read())
        os.replace(tmp, path)
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)
    return path

def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

# --- Grid / rasterizer ------------------------------------------------------------------------
class Grid:
    """Equirectangular cell grid.  Latitude is windowed (default -60..84) because a full -90..90 globe
    spends ~17% of its rows on Antarctica and empty polar ocean; rows default to whatever keeps cells
    square in degrees."""

    def __init__(self, cols, rows, lat_min, lat_max):
        self.cols, self.rows = cols, rows
        self.lat_min, self.lat_max = lat_min, lat_max
        self.cw = 360.0 / cols
        self.ch = (lat_max - lat_min) / rows

    def cell_lon(self, col):  return -180.0 + (col + 0.5) * self.cw
    def cell_lat(self, row):  return self.lat_max - (row + 0.5) * self.ch     # row 0 = north

    def col_of(self, lon):
        return min(max(int(math.floor((lon + 180.0) / self.cw)), 0), self.cols - 1)

    def row_of(self, lat):
        return min(max(int(math.floor((self.lat_max - lat) / self.ch)), 0), self.rows - 1)

def polygons_of(geom):
    """GeoJSON geometry -> list of polygons, each a list of rings (outer first, then holes)."""
    t = geom.get("type")
    if t == "Polygon":
        return [geom["coordinates"]]
    if t == "MultiPolygon":
        return list(geom["coordinates"])
    return []

def fill_polygon(grid, rings, emit):
    """Scanline even-odd fill.  For each grid row, intersect the row's centre latitude with every edge of
    every ring of this polygon, sort the crossings, and fill the alternating spans.  Even-odd across all
    rings of one polygon is exactly GeoJSON's outer/hole semantics, so holes come out free.

    O(edges) per row rather than O(cells x edges) per polygon — the difference between a script that takes
    seconds and one that takes minutes on Russia.  Run on the SUB-sample grid, not the output grid.
    """
    lat_lo = min(min(p[1] for p in ring) for ring in rings)
    lat_hi = max(max(p[1] for p in ring) for ring in rings)
    r0 = max(0, grid.row_of(min(lat_hi, grid.lat_max)))
    r1 = min(grid.rows - 1, grid.row_of(max(lat_lo, grid.lat_min)))
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
            ca = int(math.ceil((xs[i] + 180.0) / grid.cw - 0.5))
            cb = int(math.floor((xs[i + 1] + 180.0) / grid.cw - 0.5))
            for col in range(max(ca, 0), min(cb, grid.cols - 1) + 1):
                emit(col, row)

def rasterize(grid, sub_n, items):
    """items = [(id, geometry), …] -> (owner {cell: id}, cells {id: [cells]}).

    Each output cell is sampled sub_n x sub_n times and goes to whichever feature covers the most of it.
    Sampling once per cell (at its centre) would silently drop every feature narrower than a cell — and
    raising the grid resolution does NOT fix that, it only changes which ones fall through.  Voting also
    puts borders where the land actually is, instead of wherever a single sample point happened to land.
    """
    sub = Grid(grid.cols * sub_n, grid.rows * sub_n, grid.lat_min, grid.lat_max)
    votes = defaultdict(lambda: defaultdict(int))
    for fid, geom in items:
        def emit(scol, srow, _f=fid):
            votes[(scol // sub_n, srow // sub_n)][_f] += 1
        for rings in polygons_of(geom):
            fill_polygon(sub, rings, emit)
    owner, cells = {}, defaultdict(list)
    for cell, tally in votes.items():
        owner[cell] = min(sorted(tally), key=lambda a: -tally[a])   # id breaks ties -> deterministic
    for cell, fid in owner.items():
        cells[fid].append(cell)
    for fid in cells:
        cells[fid].sort()
    return owner, cells

def label_cell(pts):
    """The cell in the widest horizontal run — where a name label has room to sit."""
    if not pts:
        return None
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
            if prev - run_start + 1 > best_len:
                best_len, best = prev - run_start + 1, ((run_start + prev) // 2, r)
            if c is not None:
                run_start = prev = c
    return best

def rle_rows(grid, owner):
    rows = []
    for r in range(grid.rows):
        row, run, run_id = [], 0, owner.get((0, r))
        for c in range(grid.cols):
            fid = owner.get((c, r))
            if fid == run_id:
                run += 1
            else:
                row.append([run, run_id]); run, run_id = 1, fid
        row.append([run, run_id])
        rows.append(row)
    return rows

# --- Political layer --------------------------------------------------------------------------
def classify(props):
    """-> 'country' (spellable roster) | 'dependency' | 'other'.  Non-countries are still drawn."""
    a3 = props.get("ADM0_A3")
    if a3 in FORCE_COUNTRY:
        return "country"
    if a3 in NEVER_COUNTRY:
        return "other"
    t = props.get("TYPE")
    if t in SOVEREIGN_TYPES:
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
    best = {}
    for feat in load_json(path)["features"]:
        p = feat["properties"]
        if p.get("ADM0CAP") != 1:
            continue
        a3 = p.get("ADM0_A3")
        if not a3:
            continue
        # Prefer the English exonym: NE's NAME is the local form (København, and a plain wrong "Andorra"
        # for Andorra la Vella).  Skip a candidate that abbreviates ("St. George's").
        cands = [tidy(p.get(k)) for k in ("NAME_EN", "NAME", "NAMEASCII")]
        name = next((c for c in cands if c and "." not in c), None)
        if not name:
            name = next((c for c in cands if c), None)      # everything abbreviates — take what exists
        if not name:
            continue                                        # nameless row: nothing to teach, skip it
        name = NAME_FIXUPS.get(name, name)
        rec = {"name": deaccent(name), "name_accented": name,
               "lat": float(p["LATITUDE"]), "lon": float(p["LONGITUDE"]), "pop": p.get("POP_MAX") or 0}
        prev, want = best.get(a3), MULTI_CAPITAL.get(a3)
        if prev is None:
            best[a3] = rec
        elif want and rec["name"] == want:
            best[a3] = rec
        elif not (want and prev["name"] == want) and rec["pop"] > prev["pop"]:
            best[a3] = rec
    for a3, (name, lat, lon) in CAPITAL_OVERRIDES.items():
        best[a3] = {"name": deaccent(name), "name_accented": name, "lat": lat, "lon": lon, "pop": 0}
    return best

def force_onto_grid(grid, owner, cells, a3, target, warn):
    """The §5.3 invariant: no country may be invisible.  A nation smaller than a cell wins nothing, so it
    is placed by hand near where it actually is.

    Order matters, and an earlier version got it backwards.  "Free cell" means UNOWNED, and unowned means
    OCEAN — so searching for a free cell first dropped every landlocked microstate into the sea
    (Liechtenstein in the Adriatic, Luxembourg in the North Sea).  Borrowing a cell from a large neighbour
    is the better answer for a map that teaches where places are: Liechtenstein takes a cell from
    Switzerland and lands where Liechtenstein is.  So within each ring, prefer land, then water; and take
    the smallest ring first, which keeps genuine island nations (whose own cell is ocean) exactly where
    they belong.
    """
    c0, r0 = target
    for radius in range(0, 5):
        ring = [(c0 + dc, r0 + dr)
                for dr in range(-radius, radius + 1) for dc in range(-radius, radius + 1)
                if max(abs(dr), abs(dc)) == radius
                and 0 <= c0 + dc < grid.cols and 0 <= r0 + dr < grid.rows]
        ring.sort(key=lambda cr: (cr[0] - c0) ** 2 + (cr[1] - r0) ** 2)     # nearest first, not north-first
        for cell in ring:                                   # 1st choice: borrow from a neighbour (land)
            victim = owner.get(cell)
            if victim and victim != a3 and len(cells[victim]) > 1:
                cells[victim].remove(cell); owner[cell] = a3; cells[a3].append(cell)
                return "borrowed from " + victim
        for cell in ring:                                   # 2nd choice: open water (correct for islands)
            if cell not in owner:
                owner[cell] = a3; cells[a3].append(cell)
                return "open water"
    warn.append(a3)
    return None

# --- Build ------------------------------------------------------------------------------------
def build(args):
    print("Inklings World Atlas — building %s" % args.out)
    cache = {k: fetch(args.cache, v, args.refresh) for k, v in SOURCES.items()}
    print("  reading Natural Earth …", flush=True)

    rows = args.rows or max(1, int(round(args.cols * (args.lat_max - args.lat_min) / 360.0)))
    grid = Grid(args.cols, rows, args.lat_min, args.lat_max)
    print("  grid %dx%d  (%.2f° x %.2f° cells, lat %g..%g, %dx%d supersample)"
          % (grid.cols, grid.rows, grid.cw, grid.ch, grid.lat_min, grid.lat_max, args.subsample, args.subsample))

    places, layers, stats, notes = {}, {}, Counter(), {}

    # ---------- political ----------
    features = load_json(cache["countries"])["features"]
    capitals = load_capitals(cache["places"])
    meta = {}
    for feat in features:
        p = feat["properties"]
        a3 = p.get("ADM0_A3")
        if not a3 or a3 in meta:
            continue
        raw = NAME_FIXUPS.get(tidy(display_name(p)), tidy(display_name(p)))
        meta[a3] = {"geom": feat["geometry"], "kind": classify(p), "name": deaccent(raw),
                    "name_accented": raw, "continent": p.get("CONTINENT"), "iso2": pick_iso2(p)}
    order = sorted(meta)
    print("  rasterizing political (%d features) …" % len(order), flush=True)
    owner, cells = rasterize(grid, args.subsample, [(a3, meta[a3]["geom"]) for a3 in order])

    forced, dropped = [], []
    for a3 in order:
        if meta[a3]["kind"] != "country" or cells[a3]:
            continue
        cap = capitals.get(a3)
        if cap:
            target = (grid.col_of(cap["lon"]), grid.row_of(cap["lat"]))
        else:
            pts = [pt for rings in polygons_of(meta[a3]["geom"]) for pt in rings[0]]
            if not pts:
                continue
            target = (grid.col_of(sum(p[0] for p in pts) / len(pts)),
                      grid.row_of(sum(p[1] for p in pts) / len(pts)))
        how = force_onto_grid(grid, owner, cells, a3, target, dropped)
        if how:
            forced.append((a3, meta[a3]["name"], how))

    # The capital pin must sit INSIDE its own country.  capCell is derived from lat/long, and at 1.5° a
    # coastal or border capital lands in a neighbour or in open water — Kinshasa drew inside Congo-
    # Brazzaville, Copenhagen inside Sweden.  Snap it to the country's own nearest cell.
    snapped = []
    for a3 in order:
        cap = capitals.get(a3)
        if not cap or not cells[a3]:
            continue
        want = (grid.col_of(cap["lon"]), grid.row_of(cap["lat"]))
        if owner.get(want) == a3:
            cap["cell"] = list(want)
            continue
        near = min(cells[a3], key=lambda cr: (cr[0] - want[0]) ** 2 + (cr[1] - want[1]) ** 2)
        cap["cell"] = list(near)
        snapped.append((a3, cap["name"]))

    for a3 in order:
        m, pts = meta[a3], cells[a3]
        if not pts:
            continue
        cap = capitals.get(a3)
        spell_country = m["kind"] == "country" and is_single_word(m["name"])
        # A capital is spellable on its own merits.  It used to require a spellable COUNTRY too, which
        # silently deferred London, Seoul, Riyadh, Wellington and Pyongyang purely because "United
        # Kingdom" and "South Korea" have spaces — losing some of the most-taught capitals in the game.
        spell_capital = bool(cap) and m["kind"] == "country" and is_single_word(cap["name"])
        anchor = label_cell(pts)
        rec = {"layer": "political", "kind": m["kind"], "name": m["name"], "continent": m["continent"],
               "cells": len(pts), "labelCell": list(anchor) if anchor else None,
               "spellable": {"country": spell_country, "capital": spell_capital}}
        if m["name_accented"] != m["name"]:
            rec["name_accented"] = m["name_accented"]
        if cap:
            rec["capital"] = cap["name"]
            rec["capCell"] = cap.get("cell")
            if cap["name_accented"] != cap["name"]:
                rec["capital_accented"] = cap["name_accented"]
        if m["iso2"]:
            rec["iso2"] = m["iso2"]
            f = flag_emoji(m["iso2"])
            if f:
                rec["flag"] = f
        places[a3] = rec
        stats[m["kind"]] += 1
        stats["spellable_country"] += bool(spell_country)
        stats["spellable_capital"] += bool(spell_capital)
        stats["pairs"] += bool(spell_country and spell_capital)
    layers["political"] = {"label": "Countries", "rows_rle": rle_rows(grid, owner)}

    # ---------- polygon feature layers (marine, lakes) ----------
    def polygon_layer(key, label, feats, kind_of, id_prefix, name_of, keep=None):
        items, info = [], {}
        for feat in feats:
            p = feat["properties"]
            if keep and not keep(p):
                continue
            full = tidy(p.get("name_en") or p.get("name"))
            if not full:
                continue
            spell = strip_generic(full)
            fid = id_prefix + slug(spell or full)
            if fid in info:                    # NE splits Atlantic/Pacific into North+South; name_en
                items.append((fid, feat["geometry"]))    # reunites them, so merge into one place
                continue
            info[fid] = {"full": deaccent(full), "full_accented": full, "spell": spell,
                         "kind": (kind_of(p) or key)}
            items.append((fid, feat["geometry"]))
        print("  rasterizing %s (%d features) …" % (key, len(items)), flush=True)
        own, cel = rasterize(grid, args.subsample, items)
        n = 0
        for fid, meta_ in sorted(info.items()):
            pts = cel.get(fid) or []
            if not pts:
                continue                       # too small to draw at this resolution — leave it out
            anchor = label_cell(pts)
            rec = {"layer": key, "kind": meta_["kind"], "name": meta_["spell"] or meta_["full"],
                   "full": meta_["full"], "cells": len(pts),
                   "labelCell": list(anchor) if anchor else None,
                   "spellable": {"name": is_single_word(meta_["spell"])}}
            if meta_["full_accented"] != meta_["full"]:
                rec["full_accented"] = meta_["full_accented"]
            places[fid] = rec
            n += 1
            stats[key] += 1
            stats["spellable_" + key] += bool(rec["spellable"]["name"])
        layers[key] = {"label": label, "rows_rle": rle_rows(grid, own)}
        return n

    polygon_layer("marine", "Seas & oceans", load_json(cache["marine"])["features"],
                  lambda p: p.get("featurecla"), "sea:", None)
    polygon_layer("lakes", "Lakes", load_json(cache["lakes"])["features"],
                  lambda p: "lake", "lake:", None,
                  keep=lambda p: (p.get("min_zoom") if p.get("min_zoom") is not None else 9) <= LAKE_MAX_ZOOM)

    # ---------- peaks (points, no grid of their own) ----------
    peaks = 0
    for feat in load_json(cache["peaks"])["features"]:
        p = feat["properties"]
        if p.get("featurecla") != "mountain":
            continue                                   # skip depressions + the one mountain pass
        full = tidy(p.get("name_en") or p.get("name"))
        if not full:
            continue
        spell = strip_generic(full)
        lon, lat = (p.get("long_x"), p.get("lat_y"))
        if lon is None or lat is None:
            coords = feat["geometry"].get("coordinates") or [None, None]
            lon, lat = coords[0], coords[1]
        if lon is None or lat is None or not (grid.lat_min <= lat <= grid.lat_max):
            continue
        fid = "peak:" + slug(spell or full)
        rec = {"layer": "peaks", "kind": "mountain", "name": spell or deaccent(full),
               "full": deaccent(full), "cell": [grid.col_of(lon), grid.row_of(lat)],
               "spellable": {"name": is_single_word(spell)}}
        if p.get("elevation"):
            rec["elevation"] = int(p["elevation"])
        note = tidy(p.get("comment") or "")
        if note:
            rec["note"] = deaccent(note)
            if note.lower().startswith(("highest point", "worlds highest")):
                rec["summit"] = True               # the Seven Summits, self-identifying — a ready collection set
        places[fid] = rec
        peaks += 1
        stats["peaks"] += 1
        stats["spellable_peaks"] += bool(rec["spellable"]["name"])
    layers["peaks"] = {"label": "Mountains", "points": True}

    # ---------- name index (one spelled word -> every place it claims) ----------
    # M4's atlasLookup reads this.  Collisions are real and expected — Congo is a country and a river,
    # Victoria is a lake and Seychelles' capital, Mexico is a country and a gulf — so the value is a LIST.
    index = defaultdict(list)
    for pid, rec in places.items():
        for slot, ok in rec["spellable"].items():
            if not ok:
                continue
            word = rec["capital"] if slot == "capital" else rec["name"]
            index[word].append([pid, slot])
    index = {k: sorted(v) for k, v in sorted(index.items())}
    collisions = {k: v for k, v in index.items() if len(v) > 1}

    out = {"schemaVersion": 2,
           "source": "Natural Earth 1:50m (public domain) via nvkelso/natural-earth-vector",
           "grid": {"cols": grid.cols, "rows": grid.rows, "proj": "equirect",
                    "lonMin": -180.0, "lonMax": 180.0,
                    "latMin": grid.lat_min, "latMax": grid.lat_max},
           "layers": layers, "places": places, "index": index}
    os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"), sort_keys=True)

    # ---------- report ----------
    land = len(owner)
    print("\n  political   %d countries, %d dependencies, %d other" % (stats["country"], stats["dependency"], stats["other"]))
    print("              %d land cells of %d (%.0f%%)  ·  %d spellable countries, %d spellable capitals, %d full pairs"
          % (land, grid.cols * grid.rows, 100.0 * land / (grid.cols * grid.rows),
             stats["spellable_country"], stats["spellable_capital"], stats["pairs"]))
    print("  marine      %d drawn, %d spellable" % (stats["marine"], stats["spellable_marine"]))
    print("  lakes       %d drawn, %d spellable" % (stats["lakes"], stats["spellable_lakes"]))
    print("  peaks       %d drawn, %d spellable" % (stats["peaks"], stats["spellable_peaks"]))
    print("  TOTAL       %d places, %d spellable names, %d colliding names"
          % (len(places), len(index), len(collisions)))
    borrowed = sum(1 for _, _, how in forced if how.startswith("borrowed"))
    print("  placement   %d microstates placed by hand (%d borrowed from a neighbour, %d in open water)"
          % (len(forced), borrowed, len(forced) - borrowed))
    print("              %d capital pins snapped back inside their own country" % len(snapped))
    if dropped:
        print("  WARNING: %d countries could NOT be placed and are missing: %s" % (len(dropped), ", ".join(dropped)))
    print("  wrote       %s  (%.0f KB)" % (args.out, os.path.getsize(args.out) / 1024.0))

    if args.report:
        print("\n  microstates placed by hand:")
        for a3, name, how in forced:
            print("    %-4s %-24s %s" % (a3, name, how))
        print("\n  capital pins snapped inside their country: " + ", ".join("%s(%s)" % (a, n) for a, n in snapped))
        print("\n  colliding names (one word, several places — M4's atlasLookup must handle these):")
        for w, v in sorted(collisions.items()):
            print("    %-18s %s" % (w, ", ".join("%s:%s" % (pid, slot) for pid, slot in v)))
        print("\n  the Seven Summits:")
        for pid, r in sorted(places.items()):
            if r.get("summit"):
                print("    %-18s %-14s %sm  — %s" % (pid, r["name"], r.get("elevation", "?"), r.get("note", "")))
        print("\n  countries drawn but NOT spellable in v1 (multiword / hyphenated name):")
        for pid in sorted(places):
            r = places[pid]
            if r["layer"] == "political" and r["kind"] == "country" and not r["spellable"]["country"]:
                print("    %-4s %-32s capital: %s%s" % (pid, r["name"], r.get("capital", "—"),
                                                        "  (capital IS spellable)" if r["spellable"]["capital"] else ""))
    return 0

def main():
    ap = argparse.ArgumentParser(description="Build data/atlas-world.json for the Inklings World Atlas.")
    # 240x96 (1.5° cells) is the tuned default: it renders at exactly 720px wide at 3px/cell — the width
    # of the game canvas — and is fine enough that most real countries win cells honestly, leaving only
    # genuine microstates to force_onto_grid.  Finer buys little but file size.
    ap.add_argument("--cols", type=int, default=240, help="grid columns (default 240 = 1.5° cells)")
    ap.add_argument("--rows", type=int, default=0, help="grid rows (default: keeps cells square)")
    ap.add_argument("--subsample", type=int, default=3, help="samples per cell edge (default 3 = 9/cell)")
    ap.add_argument("--lat-min", type=float, default=-60.0, dest="lat_min")
    ap.add_argument("--lat-max", type=float, default=84.0, dest="lat_max")
    ap.add_argument("--out", default="data/atlas-world.json")
    ap.add_argument("--cache", default="build-cache", help="where Natural Earth downloads are kept")
    ap.add_argument("--refresh", action="store_true", help="re-download the sources")
    ap.add_argument("--report", action="store_true", help="print the per-place diagnostic tables")
    return build(ap.parse_args())

if __name__ == "__main__":
    sys.exit(main())
