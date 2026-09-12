# Fonts bundled with this repo

Every face here is **SIL Open Font License 1.1**. The licence text ships beside each file as
`<Face>-OFL.txt`, which is the OFL's first obligation; the second is that a **Reserved Font Name is never
reused on a modified copy** — so a subset cut by `fetch-typeface-fonts.sh` keeps the name it arrived with
and is never renamed to look like a fresh release of the original.

## Chrome

| File | Face | Used by |
| --- | --- | --- |
| `PixelifySans-latin.woff2` | Pixelify Sans | Critter Hunt's pixel chrome; the Wordshape + Inklings dev benches |

## The Scriptorium's specimens

One face per pruned Vox-ATypI leaf (`docs/inklings-typography.md` §4.1, §6). These are **reference
specimens and field glyphs** — the letterform the player traces is always the shared skeleton in
`data/wordshape-alphabet.json`, stamped with a nib. Per-face metadata (group, date, origin, plate copy,
anatomy callouts) lives in `data/typefaces.json`, which also carries the `credit` line for each.

| File | Face | Authors | Leaf |
| --- | --- | --- | --- |
| `Cardo-latin.woff2` | Cardo | David J. Perry | Humanist (Venetian) |
| `EBGaramond-latin.woff2` | EB Garamond | Georg Duffner, Octavio Pardo | Garalde (Aldine) |
| `LibreBaskerville-latin.woff2` | Libre Baskerville | Pablo Impallari, Rodrigo Fuenzalida | Transitional (Réale) |
| `LibreBodoni-latin.woff2` | Libre Bodoni | Pablo Impallari, Rodrigo Fuenzalida, Danilo de Marco | Didone |
| `Bitter-latin.woff2` | Bitter | Sol Matas / Huerta Tipográfica | Mechanistic (slab) |
| `Archivo-latin.woff2` | Archivo | Omnibus-Type | Lineal — grotesque |
| `Jost-latin.woff2` | Jost* | Owen Earl / indestructible type* | Lineal — geometric |
| `OpenSans-latin.woff2` | Open Sans | Steve Matteson / Ascender | Lineal — humanist sans |
| `UnifrakturMaguntia-latin.woff2` | UnifrakturMaguntia | j. "mach" wust, Peter Wiegel | Blackletter (Textura) |
| `UncialAntiqua-latin.woff2` | Uncial Antiqua | Tom Murphy 7 | Uncial / Insular |
| `PinyonScript-latin.woff2` | Pinyon Script | Eben Sorkin / Sorkin Type | Script |

Fetched from Google Fonts' own latin subsets by `./fetch-typeface-fonts.sh` (which also pulls each family's
`OFL.txt` from `github.com/google/fonts`). The script cuts each face to the 52 Latin letters if `pyftsubset`
is on PATH; without it the latin subsets ship as they arrive, and nothing behaves differently.
