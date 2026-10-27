"""
gen_props.py  -  PROP sprites for the short animated "scenes" (same style as gen_sprites.py)

  HELD props  : 32 x 56, stacked ON TOP of every character layer, aligned to the body.
                They redraw the gripping hands (skin colours) so the prop reads as held.
  SIDE props  : 32 x 56, placed directly to the RIGHT of the character (scene = 64 x 56).
  Strips      : multi-frame props are ONE horizontal strip, every frame the full canvas size.

Body coordinates this relies on (from gen_sprites.py base()):
  arms   left x5-7 / right x24-26, y22-36      hands  left x6-7 / right x24-25, y37-38
  floor  y = 54                                 hoodie sleeves x4-7 / x24-27, cuffs y35-36

Run:  python gen_props.py
Writes the props into  ../../assets/images/sprites/props/   (never deletes anything)
and props-sheet.png next to this script (a 6x alignment check).
"""
from PIL import Image, ImageDraw
import os

W, H = 32, 56
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "..", "assets", "images", "sprites", "props")
LHENNA = os.path.join(HERE, "..", "..", "assets", "images", "sprites", "lhenna")


def C(h, a=255):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (a,)


# ------------------------------------------------------------------ palette (nothing else is allowed)
OL = C("#0a080e")
SKIN, SKIN_SH = C("#efc0a0"), C("#d49b7e")
PU4C, PU5B, PU6D, PU7C, PU8B, PUA7, PUC4 = (C(h) for h in
    ("#4c1d95", "#5b21b6", "#6d28d9", "#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd"))
PKBE, PKEC, PKF4, PKF9, PKFB = (C(h) for h in
    ("#be185d", "#ec4899", "#f472b6", "#f9a8d4", "#fbcfe8"))
YEF5, YEFC, YEFD, YEFE = (C(h) for h in ("#f59e0b", "#fcd34d", "#fde68a", "#fef3c7"))
BL4C, BL70, BL93, BLA9, BLDB = (C(h) for h in
    ("#4c6ea6", "#7096cc", "#93c5fd", "#a9cdf8", "#dbeafe"))
GY11, GY1F, GY37, GY6B, GY9C, GYCB, GYF1, GYF8 = (C(h) for h in
    ("#111827", "#1f2937", "#374151", "#6b7280", "#9ca3af", "#cbd5e1", "#f1f5f9", "#f8fafc"))
WOOD, WOOD_SH = C("#deb16e"), C("#c28f4e")                # from gen_stormi (easel only)

ALLOWED = {OL, SKIN, SKIN_SH, PU4C, PU5B, PU6D, PU7C, PU8B, PUA7, PUC4, PKBE, PKEC, PKF4, PKF9,
           PKFB, YEF5, YEFC, YEFD, YEFE, BL4C, BL70, BL93, BLA9, BLDB, GY11, GY1F, GY37, GY6B,
           GY9C, GYCB, GYF1, GYF8, WOOD, WOOD_SH}

# ------------------------------------------------------------------ body coordinates
HAND_L, HAND_R = (6, 37, 7, 38), (24, 37, 25, 38)          # x0, y0, x1, y1 (inclusive)
ARM_L, ARM_R = (5, 22, 7, 36), (24, 22, 26, 36)


class Layer:
    """Same API as gen_sprites.Layer (px/row/r/pts/sym/clear/outline); size is optional here."""

    def __init__(self, w=W, h=H):
        self.w, self.h = w, h
        self.im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        self.p = self.im.load()

    def px(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.p[x, y] = c

    def pts(self, lst, c):
        for x, y in lst:
            self.px(x, y, c)

    def row(self, y, x0, x1, c):
        for x in range(x0, x1 + 1):
            self.px(x, y, c)

    def r(self, x, y, w, h, c):
        for j in range(y, y + h):
            self.row(j, x, x + w - 1, c)

    def sym(self, x, y, c):                    # mirror around the middle of the canvas
        self.px(x, y, c)
        self.px(self.w - 1 - x, y, c)

    def clear(self, x, y):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.p[x, y] = (0, 0, 0, 0)

    def outline(self, skip=None, color=OL):
        """1px outline on transparent neighbours. skip = one (x0,y0,x1,y1) rect or a list of them."""
        if skip and isinstance(skip[0], int):
            skip = [skip]
        sp = self.im.copy().load()
        for y in range(self.h):
            for x in range(self.w):
                if skip and any(a <= x <= c and b <= y <= d for a, b, c, d in skip):
                    continue
                if sp[x, y][3] == 0:
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < self.w and 0 <= ny < self.h and sp[nx, ny][3] > 0:
                            self.p[x, y] = color
                            break


# ------------------------------------------------------------------ small shared pieces
def fist(l, box):
    """A gripping fist on the hand box: knuckles on top, curled fingers in shade underneath."""
    x0, y0, x1, y1 = box
    l.row(y0, x0, x1, SKIN)
    l.row(y1, x0, x1, SKIN_SH)


def fingertips(l, side):
    """Two fingers reaching one pixel past the fist toward the body (side 'L' or 'R')."""
    x = 8 if side == "L" else 23
    l.px(x, 37, SKIN); l.px(x, 38, SKIN_SH)


def plate(l, x, y):
    """Dumbbell plate: 2 wide x 5 tall, highlight top-left, shade bottom-right."""
    l.pts([(x, y), (x, y + 1)], PU8B)
    l.pts([(x, y + 2), (x, y + 3), (x + 1, y), (x + 1, y + 1), (x + 1, y + 2)], PU7C)
    l.pts([(x, y + 4), (x + 1, y + 3), (x + 1, y + 4)], PU5B)


def wood_block(l, x0, y0, x1, y1):
    """Easel timber: highlight on the top row, shade on the bottom row."""
    l.r(x0, y0, x1 - x0 + 1, y1 - y0 + 1, WOOD)
    l.row(y0, x0, x1, C("#fde68a"))
    l.row(y1, x0, x1, WOOD_SH)


# ================================================================== A) HELD PROPS
def prop_dumbbells():
    """GRIND MODE. One small dumbbell in each hand, hanging at her sides."""
    l = Layer()
    for hx in (HAND_L[0], HAND_R[0]):                  # 6 and 24  -> hand covers hx .. hx+1
        left = hx - 3                                  # plate x, handle x = hx-1 .. hx+2
        plate(l, left, 36)
        plate(l, left + 6, 36)
        l.row(37, hx - 1, hx + 2, GY9C)                # handle, top row
        l.row(38, hx - 1, hx + 2, GY6B)                # handle, shade row
        l.px(hx - 1, 37, GYCB)                         # highlight
    l.outline(skip=[ARM_L, ARM_R])                     # no black line across the wrists
    fist(l, HAND_L); fist(l, HAND_R)
    return [l.im]


def prop_desk():
    """DEV MODE. Standing desk in front of her lower body, laptop seen from behind. 2 frames."""
    frames = []
    holes = [(4, 36, 8, 38), (23, 36, 27, 38)]         # arms + hoodie cuffs + hands stay visible
    for led_on in (True, False):
        l = Layer()

        def slab(y, c):
            for x in range(1, 31):
                if not any(a <= x <= cc and b <= y <= d for a, b, cc, d in holes):
                    l.px(x, y, c)

        slab(36, GYF1)                                 # desk top: highlight edge (y36 = top of desk)
        slab(37, GYCB); slab(38, GYCB); slab(39, GYCB)
        slab(40, GY9C); slab(41, GY6B)                 # front edge, shaded underneath
        # legs + feet
        for x0 in (3, 27):
            l.r(x0, 42, 1, 11, GY9C); l.r(x0 + 1, 42, 1, 11, GY6B)
        for x0 in (1, 25):
            l.row(53, x0, x0 + 5, GY6B); l.row(54, x0, x0 + 5, GY37)
        # laptop base (back edge) on the desk
        l.row(36, 9, 22, GY9C); l.row(37, 9, 22, GY6B)
        # lid: lavender, highlight top edge, shade bottom + right edge
        l.r(9, 26, 14, 10, PUC4)
        l.row(26, 9, 22, GYF1)
        l.row(35, 9, 22, PUA7); l.r(22, 27, 1, 8, PUA7)
        # yellow star sticker (plus shape, 1 highlight, 1 shade)
        l.pts([(14, 29), (13, 30), (14, 30), (15, 30), (14, 31)], YEFC)
        l.px(14, 29, YEFE); l.px(14, 31, YEF5)
        # power LED
        l.px(20, 28, PKEC if led_on else PUA7)
        l.outline(skip=holes)
        # hands rest on the desk next to the laptop
        fist(l, HAND_L); fist(l, HAND_R)
        fingertips(l, "L"); fingertips(l, "R")
        frames.append(l.im)
    return frames


def prop_brush():
    """DESIGNER MODE. Paintbrush in the RIGHT hand, tip pointing toward the easel."""
    l = Layer()
    for t in range(10):
        x = 22 + t
        y = 40 - round(t * 6 / 9)
        if t <= 6:
            top, bot = PU8B, PU6D                      # purple handle
        elif t == 7:
            top, bot = GYCB, GY9C                      # silver ferrule
        else:
            top, bot = PKF9, PKF9                      # bristles
        l.px(x, y, top); l.px(x, y + 1, bot)
    l.px(22, 40, PUA7)                                 # handle highlight at the butt end
    l.pts([(31, 34), (31, 35)], PKEC)                  # tip loaded with pink paint
    l.px(30, 35, PKFB)                                 # bristle highlight
    l.outline(skip=[ARM_R])
    fist(l, HAND_R)
    l.px(26, 38, SKIN)                                 # thumb pressing on the handle
    return [l.im]


def prop_console():
    """EVERYDAY ME. Switch-style handheld held with both hands at waist height. 2 frames."""
    frames = []
    for f in (0, 1):
        l = Layer()
        # left joy-con (pink) / right joy-con (lavender)
        for (x0, x1, hi, mid, sh, flip) in ((4, 9, PKFB, PKF4, PKEC, False),
                                            (22, 27, GYF1, PUC4, PUA7, True)):
            for y in range(34, 41):
                a, b = x0, x1
                if y == 34: a, b = (x0 + 1, x1) if not flip else (x0, x1 - 1)
                if y == 40: a, b = (x0 + 1, x1) if not flip else (x0, x1 - 1)
                l.row(y, a, b, mid)
            l.row(34, x0 + (1 if not flip else 0), x1 - (1 if flip else 0), hi)
            l.row(40, x0 + (1 if not flip else 0), x1 - (1 if flip else 0), sh)
            l.r(x1 if not flip else x0, 35, 1, 5, sh)          # inner edge in shade
        # left stick, right buttons
        l.r(6, 35, 2, 2, GY37); l.px(6, 35, GY6B)
        l.pts([(25, 35), (24, 36), (26, 36)], GY37)
        # tablet body + bezel
        l.r(10, 34, 12, 6, GY37)
        l.row(34, 10, 21, GY6B); l.row(39, 10, 21, GY1F)
        # screen
        l.r(11, 35, 10, 4, GY11)
        l.row(38, 11, 20, BL4C)                                  # floor
        if f == 0:
            l.px(13, 36, PKFB); l.px(13, 37, PKEC)               # player standing
            l.px(17, 36, YEFC)                                   # coin
            l.px(19, 37, PU7C)                                   # block
        else:
            l.px(14, 35, PKFB); l.px(14, 36, PKEC)               # player jumping
            l.px(17, 35, YEFE)                                   # coin bobs
            l.px(18, 37, PU7C)                                   # block scrolls
        l.outline(skip=[ARM_L, ARM_R])
        fist(l, HAND_L); fist(l, HAND_R)
        frames.append(l.im)
    return frames


def prop_pillow():
    """SLEEPY MODE. Lavender star pillow hugged against her torso, hands wrapped round the sides."""
    l = Layer()
    rows = {24: (9, 22), 25: (8, 23), 38: (8, 23), 39: (9, 22)}
    for y in range(24, 40):
        a, b = rows.get(y, (7, 24))
        l.row(y, a, b, PUC4)
    # highlight top-left, shade bottom-right
    l.row(24, 9, 18, GYF1); l.row(25, 8, 12, GYF1); l.r(7, 26, 1, 8, GYF1)
    l.row(39, 9, 22, PUA7); l.row(38, 12, 23, PUA7); l.r(24, 30, 1, 8, PUA7)
    # star dots (two little sparkles + dots)
    for (cx, cy) in ((12, 29), (20, 33)):
        l.pts([(cx, cy - 1), (cx - 1, cy), (cx, cy), (cx + 1, cy), (cx, cy + 1)], YEFC)
        l.px(cx, cy - 1, YEFE); l.px(cx, cy + 1, YEF5)
    l.pts([(16, 27), (21, 26), (10, 34), (15, 36), (22, 29), (18, 31), (11, 25)], YEFC)
    l.outline()
    # hands: fists on the sides, fingers curl onto the pillow front
    fist(l, HAND_L); fist(l, HAND_R)
    fingertips(l, "L"); fingertips(l, "R")
    l.px(6, 36, SKIN); l.px(25, 36, SKIN)              # thumbs over the pillow edge
    return [l.im]


# ================================================================== B) SIDE PROP: easel (4 frames)
HEART = ["..X.X..".replace(".", " ")]  # placeholder, real pattern below
HEART_PIX = []                                         # (x, y, tone)  filled just below


def _heart():
    pat = [".XX.XX.",
           "XXXXXXX",
           "XXXXXXX",
           ".XXXXX.",
           "..XXX..",
           "...X..."]
    pix = []
    for y, row in enumerate(pat):
        for x, ch in enumerate(row):
            if ch == "X":
                tone = PKF4
                if (x, y) in ((1, 1), (2, 1), (1, 0)): tone = PKFB          # highlight top-left
                if x >= 5 and y >= 1 or y >= 4 or (x >= 4 and y >= 3): tone = PKEC   # shade bottom-right
                pix.append((x, y, tone))
    return pix


def prop_easel():
    frames = []
    heart = _heart()
    stroke_of = lambda x: 0 if x <= 2 else (1 if x == 3 else (2 if x <= 5 else 3))   # left -> right sweeps
    for f in range(4):
        l = Layer()
        xl = lambda y: 6 - round(4 * (y - 12) / 42)
        xr = lambda y: 15 + round(4 * (y - 12) / 42)
        # rear leg first (it sits behind the front legs)
        l.r(10, 32, 2, 23, WOOD_SH)
        l.r(10, 32, 1, 23, C("#c28f4e"))
        # front legs: left column main, right column shade
        for y in range(12, 55):
            a, b = xl(y), xr(y)
            l.px(a, y, WOOD); l.px(a + 1, y, WOOD_SH)
            l.px(b, y, WOOD); l.px(b + 1, y, WOOD_SH)
        # cross brace
        wood_block(l, xl(42) + 2, 42, xr(42) - 1, 43)
        # canvas
        l.r(5, 13, 12, 16, GYF1)
        l.row(13, 5, 16, GYF8); l.r(5, 14, 1, 14, GYF8)           # highlight top / left
        l.row(28, 5, 16, GYCB); l.r(16, 14, 1, 14, GYCB)          # shade bottom / right
        # timber: top clamp + ledge
        wood_block(l, 4, 10, 17, 12)
        wood_block(l, 3, 29, 18, 31)
        # the heart being painted, stroke by stroke
        for (x, y, tone) in heart:
            if stroke_of(x) <= f:
                l.px(7 + x, 17 + y, tone)
        l.outline()
        frames.append(l.im)
    return frames


# ================================================================== fx.png (6 icons, 8x8, own outline)
def _icon(rows, colour_of):
    l = Layer(8, 8)
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch != ".":
                l.px(x + 1, y + 1, colour_of[ch])
    l.outline()
    return l.im


def fx_strip():
    drop = _icon(["..M...", "..M...", ".MMM..", "MMMMM.", "MMMSS.", ".SSS.."],
                 {"M": BL93, "S": BL70}); d = drop.load(); d[3, 4] = BLDB
    note = _icon(["..MMM.", "..MMMM", "..M.SM", "..M...", ".SM...", ".SS..."],
                 {"M": PU8B, "S": PU6D}); n = note.load(); n[3, 1] = PUC4
    spark = _icon(["..M...", ".MMM..", "MMMMM.", ".MMS..", "..S..."],
                  {"M": YEFC, "S": YEF5}); s = spark.load(); s[3, 3] = YEFE
    heart = _icon([".MM.MM", "MMMMMM", "MMMMSS", ".MSSS.", "..SS.."],
                  {"M": PKF4, "S": PKEC}); h = heart.load(); h[2, 2] = PKFB
    zed = _icon(["MMMMM", "..MM.", ".MM..", "MM...", "SSSSS"],
                {"M": PUC4, "S": PUA7}); z = zed.load(); z[2, 1] = GYF1
    code = _code_icon()
    strip = Image.new("RGBA", (48, 8), (0, 0, 0, 0))
    for i, icon in enumerate((drop, note, spark, heart, zed, code)):
        strip.alpha_composite(icon, (i * 8, 0))
    return strip


def _code_icon():
    """'</>' in purple: chevrons (purple) around a lighter slash, 5 rows tall."""
    l = Layer(8, 8)
    l.pts([(2, 2), (1, 3), (2, 4)], PU8B); l.px(2, 4, PU6D); l.px(1, 3, PU7C)      # <
    l.pts([(6, 2), (7, 3), (6, 4)], PU8B); l.px(6, 4, PU6D); l.px(7, 3, PU6D)      # >
    l.pts([(5, 1), (4, 2), (4, 3), (3, 4), (3, 5)], PUC4)                          # /
    l.px(3, 5, PUA7)
    l.outline()
    return l.im


# ================================================================== output + checks
def check_flat(img, name):
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            c = px[x, y]
            if c[3] == 0:
                continue
            if c not in ALLOWED:
                raise ValueError(f"{name}: pixel ({x},{y}) = {c} is off-palette or semi-transparent")


def check_grip(name, frames, boxes):
    """Every hand box must be fully covered by skin pixels in every frame (held props only)."""
    for i, fr in enumerate(frames):
        px = fr.load()
        for (x0, y0, x1, y1) in boxes:
            for y in range(y0, y1 + 1):
                for x in range(x0, x1 + 1):
                    if px[x, y] not in (SKIN, SKIN_SH):
                        raise AssertionError(f"{name} frame {i}: hand pixel ({x},{y}) is not skin")


def strip_of(frames):
    img = Image.new("RGBA", (W * len(frames), H), (0, 0, 0, 0))
    for i, fr in enumerate(frames):
        img.alpha_composite(fr, (i * W, 0))
    return img


def save(img, name):
    check_flat(img, name)
    os.makedirs(OUT, exist_ok=True)
    img.save(os.path.join(OUT, name))
    return img


def build():
    props = {}
    both = [HAND_L, HAND_R]
    held = {"prop-dumbbells.png": (prop_dumbbells(), both),
            "prop-desk.png": (prop_desk(), both),
            "prop-brush.png": (prop_brush(), [HAND_R]),
            "prop-console.png": (prop_console(), both),
            "prop-pillow.png": (prop_pillow(), both)}
    for name, (frames, boxes) in held.items():
        check_grip(name, frames, boxes)
        props[name] = save(strip_of(frames), name)
    props["prop-easel.png"] = save(strip_of(prop_easel()), "prop-easel.png")
    props["fx.png"] = save(fx_strip(), "fx.png")
    return props


# ================================================================== props-sheet.png (6x alignment check)
SCENES = [("GRIND MODE  (gym)", "gym", ["prop-dumbbells.png"], None),
          ("DEV MODE  (hoodie)", "hoodie", ["prop-desk.png"], None),
          ("DESIGNER MODE  (dress)", "dress", ["prop-brush.png"], "prop-easel.png"),
          ("EVERYDAY ME  (casual)", "casual", ["prop-console.png"], None),
          ("SLEEPY MODE  (pajamas)", "pajamas", ["prop-pillow.png"], None)]


def frame_of(strip, i):
    n = strip.width // W
    i %= n
    return strip.crop((i * W, 0, (i + 1) * W, H))


def sheet(props):
    S = 6
    bg = (0xED, 0xE9, 0xFE, 255)
    L = lambda n: Image.open(os.path.join(LHENNA, n)).convert("RGBA")
    cols = 4
    cell_w, cell_h = 64 * S, H * S
    label_h = 22
    fx = props["fx.png"]
    img_w = cols * cell_w + (cols + 1) * 12
    img_h = len(SCENES) * (cell_h + label_h + 10) + fx.height * S + 60
    out = Image.new("RGBA", (img_w, img_h), bg)
    d = ImageDraw.Draw(out)
    y = 8
    for title, outfit, held, side in SCENES:
        d.text((12, y + 4), title, fill=(0x4C, 0x1D, 0x95, 255))
        y += label_h
        frames = max([props[h].width // W for h in held] + ([props[side].width // W] if side else [1]))
        for i in range(frames):
            cell = Image.new("RGBA", (64, H), (0, 0, 0, 0))
            for n in ("hair-long-back.png", "base.png", f"outfit-{outfit}.png", "expr-blank.png", "hair-long.png"):
                cell.alpha_composite(L(n), (0, 0))
            for h in held:
                cell.alpha_composite(frame_of(props[h], i), (0, 0))
            if side:
                cell.alpha_composite(frame_of(props[side], i), (32, 0))
            big = cell.resize((64 * S, H * S), Image.NEAREST)
            out.alpha_composite(big, (12 + i * (cell_w + 12), y))
        y += cell_h + 10
    d.text((12, y + 2), "FX  (6 icons, 8x8)", fill=(0x4C, 0x1D, 0x95, 255))
    out.alpha_composite(fx.resize((fx.width * S, fx.height * S), Image.NEAREST), (12, y + 18))
    out.convert("RGB").save(os.path.join(HERE, "props-sheet.png"))


if __name__ == "__main__":
    p = build()
    for n, im in p.items():
        print(f"{n:20s} {im.width}x{im.height}  ({im.width // (W if n != 'fx.png' else 8)} frame(s))")
    try:
        sheet(p)
        print("props-sheet.png written next to the script")
    except FileNotFoundError as e:
        print("skipped props-sheet.png, missing sprite:", e.filename)
