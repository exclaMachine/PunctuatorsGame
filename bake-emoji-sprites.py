#!/usr/bin/env python3
"""One-off: bake selected emoji into pixel-art sprites for Critter Hunt.
Replicates the in-browser pixelizer at S=40, posterize 8 levels, hard alpha edge.
Renders Apple Color Emoji (160px strike) via Pillow, premultiplies alpha before the
downscale (avoids dark fringes), then quantizes colour to 8 levels/channel and hard-
thresholds alpha for a crisp blocky silhouette. Saves 40x40 PNGs; the game upscales
them nearest-neighbour via image-rendering:pixelated."""
import numpy as np
from PIL import Image, ImageFont, ImageDraw

FONT = "/System/Library/Fonts/Apple Color Emoji.ttc"
STRIKE = 160          # a real bitmap strike Pillow can load
S = 40                # pixel grid (matches the chosen preview setting)
LEVELS = 8            # colour levels per channel
ALPHA_CUT = 110       # hard alpha edge

font = ImageFont.truetype(FONT, STRIKE)
# 8-level colour LUT: round(v/255*(L-1))/(L-1)*255
cl = np.array([round(round(v/255*(LEVELS-1))/(LEVELS-1)*255) for v in range(256)], dtype=np.uint8)

def bake(emoji, out):
    # render big
    big = Image.new("RGBA", (STRIKE*2, STRIKE*2), (0,0,0,0))
    ImageDraw.Draw(big).text((STRIKE*0.4, STRIKE*0.2), emoji, font=font, embedded_color=True)
    bbox = big.getbbox()
    glyph = big.crop(bbox)
    w, h = glyph.size
    side = max(w, h)
    sq = Image.new("RGBA", (side, side), (0,0,0,0))
    sq.paste(glyph, ((side-w)//2, (side-h)//2))
    # premultiply -> resize -> unpremultiply (clean colours, no edge fringe)
    a = np.asarray(sq).astype(np.float32)
    rgb, al = a[...,:3], a[...,3:4]/255.0
    pm = np.concatenate([rgb*al, a[...,3:4]], axis=-1).astype(np.uint8)
    small = Image.fromarray(pm, "RGBA").resize((S, S), Image.LANCZOS)
    sa = np.asarray(small).astype(np.float32)
    al2 = np.clip(sa[...,3:4]/255.0, 1e-4, 1.0)
    un = np.clip(sa[...,:3]/al2, 0, 255)
    # posterize colour + hard alpha
    r = cl[un[...,0].astype(np.uint8)]
    g = cl[un[...,1].astype(np.uint8)]
    b = cl[un[...,2].astype(np.uint8)]
    aa = np.where(sa[...,3] < ALPHA_CUT, 0, 255).astype(np.uint8)
    res = np.dstack([r, g, b, aa]).astype(np.uint8)
    Image.fromarray(res, "RGBA").save(out)
    print("baked", out, "from", emoji, "(source bbox %dx%d)" % (w, h))

JOBS = [
    ("\U0001FA95", "sprites/instruments/banjo.png"),      # 🪕
    ("\U0001F514", "sprites/instruments/bell.png"),        # 🔔
    ("\U0001F3B7", "sprites/instruments/sax.png"),         # 🎷
    ("\U0001F941", "sprites/instruments/drum.png"),        # 🥁
    ("\U0001F3BB", "sprites/instruments/violin.png"),      # 🎻
    ("\U0001F3BA", "sprites/instruments/trumpet.png"),     # 🎺
    ("\U0001F411", "sprites/animals/sheep.png"),           # 🐑
    ("\U0001F404", "sprites/animals/cow.png"),             # 🐄
    ("\U0001F983", "sprites/animals/wild-turkey.png"),     # 🦃
    ("\U0001F40B", "sprites/animals/humpback-whale.png"),  # 🐋
]
for emo, out in JOBS:
    bake(emo, out)
