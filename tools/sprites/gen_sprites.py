"""
Lhenna sprite generator  (canvas 32 x 56, transparent PNG layers, flat file names)

Stack order (bottom -> top):
  hair-<style>-back  >  base  >  outfit-*  >  expr-*  >  hair-<style>  >  acc-*
Every sprite is 32x56 so layers line up with no positioning at all.
"""
from PIL import Image
import os, math

W, H = 32, 56
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "assets", "images", "sprites", "lhenna")


def C(h, a=255):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (a,)


# ------------------------------------------------------------------ palette
OL = C("#0a080e")                      # outline
SKIN, SKIN_SH = C("#efc0a0"), C("#d49b7e")
HAIR, HAIR_MID, HAIR_HL = C("#18161e"), C("#2e2c3c"), C("#5c5c76")
BROW = C("#2a1a20")
EYE, EYE2, SPARK = C("#1a1018"), C("#3a2224"), C("#ffffff")
BLUSH = C("#f28a9c", 190)
LIP, LIP_HL, MOUTH_IN = C("#c04458"), C("#f28a9c"), C("#8f1f33")


class Layer:
    def __init__(self):
        self.im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        self.p = self.im.load()

    def px(self, x, y, c):
        c = C(c) if isinstance(c, str) else c
        if 0 <= x < W and 0 <= y < H:
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

    def sym(self, x, y, c):          # draw (x,y) and its mirror (31-x,y)
        self.px(x, y, c)
        self.px(31 - x, y, c)

    def symrow(self, y, x0, x1, c):
        self.row(y, x0, x1, c)
        self.row(y, 31 - x1, 31 - x0, c)

    def clear(self, x, y):
        if 0 <= x < W and 0 <= y < H:
            self.p[x, y] = (0, 0, 0, 0)

    def torso(self, y0, y1, c):
        for y in range(y0, y1 + 1):
            self.row(y, T[y][0], T[y][1], c)

    def outline(self, skip=None, color=OL):
        sp = self.im.copy().load()
        for y in range(H):
            for x in range(W):
                if skip and skip[0] <= x <= skip[2] and skip[1] <= y <= skip[3]:
                    continue
                if sp[x, y][3] == 0:
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < W and 0 <= ny < H and sp[nx, ny][3] > 0:
                            self.p[x, y] = color
                            break

    def save(self, name):
        os.makedirs(OUT, exist_ok=True)
        self.im.save(os.path.join(OUT, name))


# ------------------------------------------------------------------ body shape
# torso rows (x0, x1): shoulders -> bust -> waist -> hips.  Hourglass.
T = {21: (10, 21)}
for y in range(22, 27): T[y] = (9, 22)      # bust
for y in (27, 28):      T[y] = (10, 21)     # under-bust
for y in (29, 30, 31):  T[y] = (11, 20)     # waist (10 wide)
for y in (32, 33):      T[y] = (10, 21)
for y in range(34, 41): T[y] = (9, 22)      # hips

HEAD = {5: (11, 20), 6: (10, 21), 7: (9, 22), 8: (9, 22), 9: (9, 22), 10: (9, 22),
        11: (9, 22), 12: (9, 22), 13: (9, 22), 14: (9, 22), 15: (9, 22),
        16: (10, 21), 17: (11, 20), 18: (13, 18)}

FACE = (10, 7, 21, 19)       # no hair-outline inside this box (forehead + eyes)


def wave(y, ph=0):
    """Big, loose S-curve (one wave every ~20 rows) that grows toward the tips.
    Used for the 'wavy' styles so they read as soft waves, not curls."""
    amp = min(2.0, max(0.0, (y - 11) / 8.0))
    return int(round(amp * math.sin((y + ph) * 2 * math.pi / 20)))


def flow(b, y0, y1, a_fn, z_fn):
    """Smooth strand lines that follow the wave instead of dotted noise."""
    for y in range(y0, y1 + 1):
        b.px(a_fn(y) + 3, y, HAIR_MID)
        b.px(z_fn(y) - 3, y, HAIR_MID)
        if y % 9 == 4:
            b.px(a_fn(y) + 4, y, HAIR_HL)
            b.px(z_fn(y) - 4, y, HAIR_HL)


# ================================================================== BASE
def base():
    l = Layer()
    for y, (a, b) in HEAD.items():
        l.row(y, a, b, SKIN)
    l.row(19, 14, 17, SKIN_SH)           # chin shadow on neck
    l.row(20, 14, 17, SKIN)
    l.row(21, 7, 24, SKIN)               # shoulders
    l.torso(22, 40, SKIN)
    # arms (a 1px gap at the waist so the hourglass reads)
    for x0 in (5, 24):
        l.r(x0, 22, 3, 15, SKIN)
        l.r(x0 + (1 if x0 == 5 else 0), 37, 2, 2, SKIN)   # hands
    l.r(8, 22, 1, 5, SKIN_SH)
    l.r(23, 22, 1, 5, SKIN_SH)
    l.r(7, 23, 1, 13, SKIN_SH)
    l.r(24, 23, 1, 13, SKIN_SH)
    # waist shading + navel
    l.pts([(11, 29), (11, 30), (11, 31), (20, 29), (20, 30), (20, 31)], SKIN_SH)
    l.px(16, 30, SKIN_SH)
    # legs
    l.row(41, 10, 15, SKIN); l.row(41, 16, 21, SKIN)
    for y in range(42, 52):
        a, b = (10, 14) if y < 47 else (11, 14)
        l.row(y, a, b, SKIN)
        l.row(y, 31 - b, 31 - a, SKIN)
    for y in range(43, 52):
        l.px(14, y, SKIN_SH); l.px(17, y, SKIN_SH)
    # sneakers
    for y, a in ((52, 10), (53, 9), (54, 9)):
        l.row(y, a, 14, C("#f8fafc")); l.row(y, 31 - 14, 31 - a, C("#f8fafc"))
    l.row(54, 9, 14, C("#cbd5e1")); l.row(54, 17, 22, C("#cbd5e1"))
    l.sym(11, 53, C("#a78bfa"))
    # sports bra
    bra, bra_d, bra_l = C("#a78bfa"), C("#7c3aed"), C("#c4b5fd")
    l.symrow(21, 11, 12, bra)
    l.symrow(22, 10, 14, bra)
    for y in range(23, 27): l.row(y, 9, 22, bra)
    l.row(27, 10, 21, bra_d)
    l.pts([(11, 23), (20, 23), (11, 24), (20, 24)], bra_l)
    l.r(15, 24, 2, 3, C("#8b5cf6"))
    # shorts (high waist)
    sh, sh_d, sh_hem = C("#5b21b6"), C("#7c3aed"), C("#4c1d95")
    l.row(33, 10, 21, sh_d)
    for y in range(34, 41): l.row(y, 9, 22, sh)
    l.row(41, 10, 15, sh_hem); l.row(41, 16, 21, sh_hem)
    l.r(15, 37, 2, 4, sh_hem)
    l.pts([(10, 35), (21, 35)], sh_d)
    l.outline()
    l.save("base.png")


# ================================================================== HAIR
BANG = {7: 14, 8: 13, 9: 11, 10: 10, 11: 9}       # left-bang right edge per row


def crown(f, volume=0):
    """Top of hair + curtain bangs (center part, swept out to both sides)."""
    f.row(3, 12, 19, HAIR); f.row(4, 10, 21, HAIR); f.row(5, 9, 22, HAIR)
    f.row(6, 8 - volume, 23 + volume, HAIR)
    for y, b in BANG.items():
        f.row(y, 8 - volume, b, HAIR)
        f.row(y, 31 - b, 23 + volume, HAIR)
    # soft highlight blocks like the reference
    f.pts([(13, 4), (14, 4), (17, 4), (18, 4), (11, 5), (12, 5), (19, 5), (20, 5)], HAIR_HL)
    f.pts([(9, 6), (10, 6), (21, 6), (22, 6), (11, 7), (12, 7), (19, 7), (20, 7),
           (10, 8), (21, 8)], HAIR_MID)


def locks(f, y0, y1, x_in=8, shift_y=19):
    """Face-framing side strands."""
    for y in range(y0, y1 + 1):
        a = x_in if y < shift_y else x_in - 1
        o = wave(y) if y > shift_y + 2 else 0
        f.row(y, a + o, a + 1 + o, HAIR)
        f.row(y, 30 - a + o, 31 - a + o, HAIR)
        if y % 5 == 0 and y > 13:
            f.px(a + o, y, HAIR_MID); f.px(31 - a + o, y, HAIR_MID)


def strand_tex(b, y0, y1):
    for y in range(y0, y1 + 1):
        for x in range(W):
            if b.p[x, y][3] and (x * 3 + y * 2) % 9 == 0:
                b.p[x, y] = HAIR_MID


EDGE = {}


def hair_long():
    b = Layer()
    for y in range(3, 44):
        if y == 3:    a, z = 11, 20
        elif y == 4:  a, z = 9, 22
        elif y == 5:  a, z = 8, 23
        elif y <= 18: a, z = 7, 24
        elif y <= 22: a, z = 6, 25
        elif y <= 38: a, z = 4, 27
        else:         k = y - 38; a, z = 4 + k, 27 - k
        w = wave(y)
        b.row(y, a + w, z + w, HAIR)
        EDGE[y] = (a + w, z + w)
    for y in range(42, 44):             # ragged tips
        for x in range(W):
            if (x + y) % 3 == 0: b.clear(x, y)
    flow(b, 16, 41, lambda y: EDGE[y][0], lambda y: EDGE[y][1])
    b.outline()
    b.save("hair-long-back.png")
    f = Layer()
    crown(f)
    locks(f, 12, 40)
    f.outline(skip=FACE)
    f.save("hair-long.png")


def hair_bob():
    b = Layer()
    for y in range(3, 24):
        if y == 3:    a, z = 11, 20
        elif y == 4:  a, z = 9, 22
        elif y == 5:  a, z = 8, 23
        elif y <= 18: a, z = 7, 24
        else:         a, z = 6, 25            # flips out at the ends
        w = wave(y)
        b.row(y, a + w, z + w, HAIR)
        EDGE[y] = (a + w, z + w)
    for x in range(W):
        if (x + 1) % 3 == 0: b.clear(x, 23)
    flow(b, 14, 21, lambda y: EDGE[y][0], lambda y: EDGE[y][1])
    b.outline()
    b.save("hair-bob-back.png")
    f = Layer()
    crown(f)
    for y in range(12, 23):
        o = 0 if y < 19 else -1
        f.row(y, 8 + o, 9, HAIR); f.row(y, 22, 23 - o, HAIR)
        if y % 5 == 0: f.px(8, y, HAIR_MID); f.px(23, y, HAIR_MID)
    f.outline(skip=FACE)
    f.save("hair-bob.png")


def hair_ponytail():
    b = Layer()
    for y in range(3, 12):                 # hair mass behind the head
        a, z = {3: (11, 20), 4: (9, 22), 5: (8, 23)}.get(y, (7, 24))
        b.row(y, a, z, HAIR)
    # high side-ponytail, swinging down the right
    for y in range(7, 38):
        w = 3 if y < 12 else (5 if y < 26 else (4 if y < 32 else 3))
        off = wave(y, 1)
        x0 = 24 + (0 if y < 12 else 1) + off
        b.row(y, x0, x0 + w - 1, HAIR)
        if y % 6 == 3: b.px(x0 + 1, y, HAIR_HL)
        if y % 5 == 0: b.px(x0 + w - 1, y, HAIR_MID)
    b.row(35, 26, 28, HAIR_MID)
    b.r(23, 5, 3, 3, C("#f472b6"))
    b.px(24, 5, C("#fbcfe8"))
    b.outline()
    b.save("hair-ponytail-back.png")
    f = Layer()
    crown(f)
    for y in range(12, 24):                # face-framing strands only
        o = 0 if y < 19 else -1
        f.row(y, 8 + o, 9, HAIR); f.row(y, 22, 23 - o, HAIR)
    f.pts([(8, 15), (23, 15)], HAIR_MID)
    f.outline(skip=FACE)
    f.save("hair-ponytail.png")


def hair_curly():
    b = Layer()
    for y in range(3, 33):
        if y == 3:    a, z = 10, 21
        elif y == 4:  a, z = 8, 23
        elif y == 5:  a, z = 6, 25
        elif y <= 22: a, z = 4, 27
        else:         k = (y - 22) // 2; a, z = 4 + k, 27 - k
        bump = (1, 2, 1, 0)[y % 4]
        b.row(y, a - bump + 1, z + bump - 1, HAIR)
    for x in range(W):
        if (x * 2) % 5 == 0: b.clear(x, 32)
    strand_tex(b, 6, 31)
    b.outline()
    b.save("hair-curly-back.png")
    f = Layer()
    crown(f, volume=1)
    f.pts([(11, 2), (12, 2), (19, 2), (20, 2)], HAIR)      # little curls on top
    for y in range(12, 30):
        bump = (1, 0, 1, 2)[y % 4]
        a = 7 if y < 19 else 5
        f.row(y, a - bump + (1 if y < 19 else 0), 9, HAIR)
        f.row(y, 22, 31 - a + bump - (1 if y < 19 else 0), HAIR)
        if y % 4 == 1 and y > 13:
            f.px(a + 1, y, HAIR_HL); f.px(30 - a, y, HAIR_HL)
    f.outline(skip=FACE)
    f.save("hair-curly.png")


# ================================================================== OUTFITS
def neckline(l, rows):
    """Paint skin into a neckline cut-out so the bra underneath doesn't peek out."""
    for y, (a, b) in rows.items():
        l.row(y, a, b, SKIN)


def outfit_gym():
    l = Layer()
    p, pd, pl = C("#ec4899"), C("#be185d"), C("#f9a8d4")
    # crop tank
    l.symrow(21, 11, 12, p)
    for y in range(22, 27): l.row(y, 9, 22, p)
    for y in (27, 28):      l.row(y, 10, 21, p)
    l.row(29, 11, 20, p); l.row(30, 11, 20, pd)
    neckline(l, {22: (14, 17), 23: (15, 16)})
    l.pts([(11, 23), (20, 23), (11, 24), (20, 24)], pl)
    l.pts([(10, 27), (21, 27)], pd)
    # high-waist leggings + side stripes
    g, gl = C("#1f2937"), C("#374151")
    l.row(32, 10, 21, p)
    l.row(33, 10, 21, g)
    for y in range(34, 41): l.row(y, 9, 22, g)
    l.row(41, 10, 15, g); l.row(41, 16, 21, g)
    for y in range(42, 52):
        a, b = (10, 14) if y < 47 else (11, 14)
        l.row(y, a, b, g); l.row(y, 31 - b, 31 - a, g)
    for y in range(34, 41): l.sym(9, y, p)
    l.sym(10, 41, p)
    for y in range(42, 47): l.sym(10, y, p)
    for y in range(47, 52): l.sym(11, y, p)
    l.pts([(14, 36), (17, 36)], gl)
    l.r(15, 37, 2, 4, C("#111827"))
    l.outline()
    l.save("outfit-gym.png")


def outfit_hoodie():
    l = Layer()
    c, sh, hi = C("#8b5cf6"), C("#6d28d9"), C("#a78bfa")
    # fitted cropped hoodie
    l.row(19, 13, 18, sh)
    l.row(20, 11, 20, sh); l.row(20, 13, 18, hi)
    l.row(21, 10, 21, c)
    for y in range(22, 27): l.row(y, 9, 22, c)
    for y in (27, 28):      l.row(y, 10, 21, c)
    for y in (29, 30, 31):  l.row(y, 11, 20, c)
    l.row(32, 10, 21, sh)                   # rib hem
    l.sym(9, 24, hi); l.sym(10, 23, hi)
    l.r(14, 22, 1, 5, C("#f1f5f9")); l.r(17, 22, 1, 5, C("#f1f5f9"))   # drawstrings
    l.pts([(14, 27), (17, 27)], C("#c4b5fd"))
    l.row(22, 14, 17, sh)
    # sleeves
    for x0 in (4, 24):
        l.r(x0, 22, 4, 15, c)
        l.r(x0, 35, 4, 2, sh)
    l.sym(5, 24, hi); l.sym(5, 25, hi)
    # joggers
    g, gs = C("#9ca3af"), C("#6b7280")
    l.row(33, 10, 21, gs)
    for y in range(34, 41): l.row(y, 9, 22, g)
    l.row(41, 10, 15, g); l.row(41, 16, 21, g)
    for y in range(42, 51):
        a, b = (10, 14) if y < 47 else (11, 14)
        l.row(y, a, b, g); l.row(y, 31 - b, 31 - a, g)
    l.row(50, 11, 14, gs); l.row(51, 11, 14, gs)
    l.row(50, 17, 20, gs); l.row(51, 17, 20, gs)
    for y in range(35, 41): l.sym(10, y, gs)
    l.r(15, 37, 2, 4, gs)
    l.outline()
    l.save("outfit-hoodie.png")


def outfit_dress():
    l = Layer()
    c, d, lt, dot = C("#f9a8d4"), C("#ec4899"), C("#fbcfe8"), C("#ffffff")
    l.symrow(21, 11, 12, c)
    for y in range(22, 27): l.row(y, 9, 22, c)
    for y in (27, 28):      l.row(y, 10, 21, c)
    for y in (29, 30):      l.row(y, 11, 20, c)
    l.row(31, 11, 20, d)                      # waist seam
    neckline(l, {22: (14, 17), 23: (15, 16)})
    l.pts([(11, 23), (20, 23), (11, 24), (20, 24)], lt)
    skirt = {32: (10, 21), 33: (10, 21), 34: (9, 22), 35: (9, 22), 36: (8, 23),
             37: (8, 23), 38: (7, 24), 39: (7, 24), 40: (7, 24), 41: (6, 25),
             42: (6, 25), 43: (6, 25), 44: (5, 26)}
    for y, (a, b) in skirt.items():
        l.row(y, a, b, c)
    l.row(44, 5, 26, d)
    for x in range(5, 27, 2): l.clear(x, 44)
    for x in (12, 15, 16, 19):
        for y in range(36, 44): l.px(x, y, C("#f472b6"))
    l.pts([(11, 34), (18, 35), (13, 38), (20, 39), (9, 41), (16, 42), (22, 42),
           (13, 33), (7, 43), (24, 40)], dot)
    l.outline()
    l.save("outfit-dress.png")


def outfit_pajamas():
    l = Layer()
    c, sh, star = C("#dbeafe"), C("#93c5fd"), C("#fde68a")
    # fitted button-up, short sleeves
    l.row(21, 10, 21, c)
    for y in range(22, 27): l.row(y, 9, 22, c)
    for y in (27, 28):      l.row(y, 10, 21, c)
    for y in (29, 30, 31):  l.row(y, 11, 20, c)
    l.row(32, 10, 21, sh)
    for x0 in (4, 24):
        l.r(x0, 22, 4, 6, c)
        l.r(x0, 27, 4, 1, sh)
    l.row(21, 13, 18, C("#ffffff")); l.pts([(13, 22), (18, 22)], C("#ffffff"))
    l.r(15, 22, 2, 10, sh)
    l.pts([(15, 24), (15, 27), (15, 30)], C("#ffffff"))
    # shorts
    l.row(33, 10, 21, sh)
    sc = C("#a9cdf8")
    for y in range(34, 41): l.row(y, 9, 22, sc)
    l.row(41, 10, 15, sc); l.row(41, 16, 21, sc)
    for y in range(42, 45):
        l.row(y, 10, 14, sc); l.row(y, 17, 21, sc)
    l.row(44, 10, 14, sh); l.row(44, 17, 21, sh)
    l.r(15, 37, 2, 4, sh)
    l.pts([(12, 24), (19, 25), (12, 29), (19, 28), (5, 24), (26, 25),
           (11, 36), (19, 37), (12, 40), (20, 41), (12, 43), (19, 42)], star)
    l.outline()
    l.save("outfit-pajamas.png")


def outfit_casual():
    """The red cami + denim mini from the photo."""
    l = Layer()
    dn, dd, dl = C("#7096cc"), C("#4c6ea6"), C("#9bb7e0")
    rd, rs, rl = C("#d82638"), C("#961424"), C("#ef5b6c")
    # denim mini
    l.row(33, 10, 21, dd)
    for y in range(34, 41): l.row(y, 9, 22, dn)
    l.row(41, 9, 22, dd)
    l.pts([(11, 36), (11, 37), (20, 36), (20, 37)], dl)
    l.r(15, 35, 2, 5, dd)
    l.sym(10, 34, dl)
    # cami (slightly loose below the bust, like the photo)
    l.symrow(21, 11, 12, rd)
    for y in range(22, 27): l.row(y, 9, 22, rd)
    for y in (27, 28):      l.row(y, 10, 21, rd)
    for y in (29, 30, 31):  l.row(y, 10, 21, rd)
    l.row(32, 9, 22, rd); l.row(33, 9, 22, rs)
    neckline(l, {22: (13, 18), 23: (14, 17), 24: (15, 16)})
    l.pts([(15, 25), (16, 26), (15, 27), (16, 28)], rs)         # ruched center
    l.pts([(12, 23), (19, 23), (11, 25), (20, 25)], rl)
    l.pts([(12, 29), (19, 29), (13, 31), (18, 31)], rs)
    l.outline()
    l.save("outfit-casual.png")


# ================================================================== EXPRESSIONS
def brows(l, dy=0):
    l.sym(12, 10 + dy, BROW); l.sym(13, 10 + dy, BROW)


def blush(l, strong=False):
    c = C("#f28a9c", 230 if strong else 190)
    l.sym(10, 14, c); l.sym(11, 14, c)


def eyes_open(l, spark=True):
    for x in (12, 13):
        l.sym(x, 12, EYE); l.sym(x, 13, EYE if x == 12 else EYE2)
    if spark:
        l.sym(13, 12, SPARK)
    l.sym(11, 11, EYE)                   # lash flick on the outer corner


def mouth_small(l, c=LIP):
    l.px(15, 16, c); l.px(16, 16, c)


def expr_blank():
    l = Layer()
    brows(l); eyes_open(l); blush(l); mouth_small(l)
    l.save("expr-blank.png")


def expr_happy():
    l = Layer()
    brows(l, -0)
    for x in (12, 13): l.sym(x, 12, EYE)
    l.sym(11, 13, EYE)                    # ^ ^ eyes
    l.sym(14, 13, EYE)
    blush(l, True)
    l.row(16, 14, 17, MOUTH_IN)
    l.row(17, 15, 16, LIP_HL)
    l.save("expr-happy.png")


def expr_sleepy():
    l = Layer()
    brows(l)
    for x in (12, 13): l.sym(x, 13, EYE)  # closed lids
    l.sym(11, 12, EYE)                    # drooping lash
    blush(l)
    mouth_small(l, C("#d8546a"))
    z = C("#a78bfa")
    for (x, y) in [(25, 3), (26, 3), (27, 3), (27, 4), (26, 5), (25, 6), (25, 7), (26, 7), (27, 7)]:
        l.px(x, y, z)
    for (x, y) in [(29, 0), (30, 0), (30, 1), (29, 2), (29, 2), (30, 2)]:
        l.px(x, y, z)
    l.save("expr-sleepy.png")


def expr_focused():
    """Serious look: straight brows pushed slightly down in the middle, no sparkle."""
    l = Layer()
    for x in (12, 13): l.sym(x, 10, BROW)
    l.sym(14, 11, BROW)
    for x in (12, 13):
        l.sym(x, 12, EYE); l.sym(x, 13, EYE)
    blush(l)
    mouth_small(l, C("#b0304a"))
    l.save("expr-focused.png")


# ================================================================== ACCESSORIES
def acc_star():
    l = Layer()
    Y, Yd = C("#fcd34d"), C("#f59e0b")
    pat = ["..X..", ".XXX.", "XXXXX", ".XXX.", ".X.X."]
    for j, row in enumerate(pat):
        for i, ch in enumerate(row):
            if ch == "X":
                l.px(9 + i, 3 + j, Y)
    l.px(11, 4, C("#fef3c7")); l.pts([(10, 6), (12, 6)], Yd)
    l.outline(color=C("#7c2d12"))
    l.save("acc-star.png")


def acc_headphones():
    l = Layer()
    band, bl = C("#374151"), C("#6b7280")
    cup, pad = C("#f472b6"), C("#be185d")
    l.row(1, 11, 20, band); l.row(2, 9, 22, band)
    l.symrow(3, 7, 8, band)
    for y in range(4, 10): l.symrow(y, 6, 7, band)
    l.row(1, 13, 16, bl)
    for x0 in (3, 25):
        l.r(x0, 9, 4, 8, cup)
        l.r(x0 if x0 == 3 else x0 + 3, 9, 1, 8, pad)
        l.r(x0 + 1, 10, 1, 2, C("#fbcfe8"))
    l.outline()
    l.save("acc-headphones.png")


def acc_glasses():
    """Clear gold cat-eye frames, like the real ones."""
    l = Layer()
    G, Gd = C("#e0bc6e"), C("#b8924a")
    lens = C("#f3e3f5", 28)
    for x0 in (10, 17):
        l.r(x0 + 1, 12, 3, 2, lens)
        l.row(11, x0, x0 + 4, G)                 # top bar
        l.px(x0, 12, G); l.px(x0, 13, G)         # sides
        l.px(x0 + 4, 12, G); l.px(x0 + 4, 13, G)
        l.row(14, x0 + 1, x0 + 3, Gd)            # rounded bottom
    l.sym(9, 11, G)                              # upswept cat-eye tips
    l.sym(9, 10, Gd)
    l.row(12, 15, 16, G)                         # bridge
    l.save("acc-glasses.png")


if __name__ == "__main__":
    import shutil
    shutil.rmtree(OUT, ignore_errors=True)
    base()
    hair_long(); hair_bob(); hair_ponytail(); hair_curly()
    outfit_gym(); outfit_hoodie(); outfit_dress(); outfit_pajamas(); outfit_casual()
    expr_blank(); expr_happy(); expr_sleepy(); expr_focused()
    acc_star(); acc_headphones(); acc_glasses()
    print(sorted(os.listdir(OUT)))
