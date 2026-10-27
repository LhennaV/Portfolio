"""
Stormi sprite generator.  Every frame is 32x32, transparent PNG.
Output: horizontal frame strips in stormi/

  idle  6 frames  front-facing sit, breathing + blink + ear twitch + tail flick
  walk  6 frames  side view, facing right
  sit   4 frames  side-view sit, tail swish + blink
  purr  4 frames  front-facing sit, happy eyes, little vibration, floating hearts
  knead 4 frames  front sit, paws alternately pressing (biscuits), bottom 5px clear for a cloud
  play  4 frames  side view facing right, batting up toward a star at x24-31, y0-8
  sleep 4 frames  curled donut, 1px breathing, body inside y18-31 (lies on a moon)
  held  2 frames  picked up and dangling, surprised, sways 1px
  box   2 frames  [0] back of open box + flaps, [1] front wall only (Stormi goes between)
"""
from PIL import Image
import os, math

FW = FH = 32
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "assets", "images", "sprites", "stormi")


def C(h, a=255):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (a,)


# palette (taken from her pixel art)
OL = C("#0a080e")
B, BD, BL = C("#423c3a"), C("#332e2c"), C("#5a524f")      # coat, shade, highlight
O, OD = C("#deb16e"), C("#c28f4e")                          # tortie orange
EARIN, EARBR = C("#cead9a"), C("#674a3d")
PINK, PINK2 = C("#f7b6cb"), C("#ee8fb0")
GR, GRL, YEL = C("#374c21"), C("#8fb94a"), C("#e6d26f")
NOSE = C("#e3a898")
SHADOW = C("#76736f", 150)


class F:
    def __init__(self):
        self.im = Image.new("RGBA", (FW, FH), (0, 0, 0, 0))
        self.p = self.im.load()
        self.ox = 0
        self.oy = 0

    def px(self, x, y, c):
        x += self.ox; y += self.oy
        if 0 <= x < FW and 0 <= y < FH:
            self.p[x, y] = c

    def row(self, y, x0, x1, c):
        for x in range(x0, x1 + 1):
            self.px(x, y, c)

    def r(self, x, y, w, h, c):
        for j in range(y, y + h):
            self.row(j, x, x + w - 1, c)

    def pts(self, lst, c):
        for x, y in lst:
            self.px(x, y, c)

    def mirror_px(self, x, y, c):
        self.px(x, y, c)
        self.px(31 - x, y, c)

    def outline(self):
        sp = self.im.copy().load()
        for y in range(FH):
            for x in range(FW):
                if sp[x, y][3] == 0:
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < FW and 0 <= ny < FH and sp[nx, ny][3] > 0:
                            self.p[x, y] = OL
                            break


def with_shadow(f, cx=15.5, rx=12, y=29, wide=1.0):
    img = Image.new("RGBA", (FW, FH), (0, 0, 0, 0))
    sp = img.load()
    for dy, k in ((0, 1.0), (1, 0.72)):
        half = rx * k * wide
        for x in range(FW):
            if abs(x - cx) <= half:
                sp[x, y + dy] = SHADOW
    img.alpha_composite(f.im)
    return img


# ------------------------------------------------------------------ shared bits
def tail(f, path, orange_idx=(), width=2):
    for i, (x, y) in enumerate(path):
        c = O if i in orange_idx else B
        for k in range(width):
            f.px(x + k, y, c)


def heart(f, x, y, c=PINK, c2=PINK2):
    pat = [".X.X.", "XXXXX", ".XXX.", "..X.."]
    for j, row in enumerate(pat):
        for i, ch in enumerate(row):
            if ch == "X":
                f.px(x + i, y + j, c)
    f.px(x + 1, y + 1, C("#ffe3ee"))


# ================================================================== FRONT (idle / purr)
FRONT_TAILS = {
    # centre-line (x,y); drawn 2 px wide.  A = straight up, B = tip curls out, C = tip flicks in
    "A": [(24, 27), (24, 26), (24, 25), (25, 24), (25, 23), (25, 22), (25, 21), (26, 20), (26, 19),
          (26, 18), (26, 17), (26, 16), (26, 15), (27, 14), (27, 13)],
    "B": [(24, 27), (24, 26), (24, 25), (25, 24), (25, 23), (25, 22), (25, 21), (26, 20), (26, 19),
          (26, 18), (26, 17), (27, 16), (28, 15), (28, 14), (28, 13)],
    "C": [(24, 27), (24, 26), (24, 25), (25, 24), (25, 23), (25, 22), (25, 21), (26, 20), (26, 19),
          (26, 18), (26, 17), (26, 16), (25, 15), (25, 14), (24, 14)],
}


EAR_ROWS = {1: [(9, EARBR)],
            2: [(9, EARBR), (10, EARIN)],
            3: [(8, EARBR), (9, EARBR), (10, EARIN), (11, EARIN)],
            4: [(8, EARBR), (9, EARIN), (10, EARIN), (11, EARIN), (12, B)],
            5: [(8, B), (9, B), (10, EARIN), (11, B), (12, B)]}


def front_head(f, head_dy=0, eyes="open", ear_l=(0, 0), blush_a=200, mouth="smile"):
    """Front-facing head. Draws relative to f.oy, shifted by head_dy."""
    base = f.oy
    f.oy = base + head_dy
    heads = {5: (11, 20), 6: (9, 22), 16: (9, 22), 17: (11, 20)}
    for y in range(5, 18):
        a, b = heads.get(y, (8, 23))
        f.row(y, a, b, B)
    f.pts([(12, 6), (13, 6), (18, 6), (19, 6), (9, 9), (22, 9)], BL)
    for y, lst in EAR_ROWS.items():                    # left ear (can twitch)
        for x, c in lst:
            f.px(x + ear_l[0], y + ear_l[1], c)
    for y, lst in EAR_ROWS.items():                    # right ear (mirror)
        for x, c in lst:
            f.px(31 - x, y, c)
    f.pts([(12, 7), (11, 8), (19, 7), (20, 8)], O)     # forehead tortie marks
    for ex in (10, 18):
        if eyes == "open":
            f.r(ex, 9, 4, 4, YEL)
            f.r(ex + 1, 10, 2, 2, GR)
            f.px(ex + 1 if ex == 10 else ex + 2, 10, GRL)
        elif eyes == "surprised":                      # big round eyes, tall pupils
            f.r(ex, 8, 4, 5, YEL)
            f.r(ex + 1, 9, 2, 3, GR)
            f.px(ex + 1 if ex == 10 else ex + 2, 9, GRL)
        elif eyes == "blink":
            f.r(ex, 9, 4, 4, B)
            f.row(11, ex, ex + 3, OL)
        elif eyes == "happy":
            f.r(ex, 9, 4, 4, B)
            if ex == 10:
                f.pts([(11, 11), (12, 11), (10, 12), (13, 12)], OL)
            else:
                f.pts([(19, 11), (20, 11), (18, 12), (21, 12)], OL)
    bl = (PINK[0], PINK[1], PINK[2], blush_a)
    f.r(9, 13, 3, 2, bl); f.r(20, 13, 3, 2, bl)
    f.pts([(15, 13), (16, 13)], NOSE)
    if mouth == "o":
        f.pts([(15, 14), (16, 14), (15, 15), (16, 15)], OL)
    else:
        f.pts([(13, 14), (12, 15)], O)
        f.pts([(15, 14), (16, 14), (14, 15), (17, 15)], OL)
    f.oy = base


def front(tail_v="A", head_dy=0, dx=0, eyes="open", ear_l=(0, 0), blush_a=200, hearts=(),
          body_dy=0, short=0, paws=None, shadow=True):
    """paws: None = default paw bottoms, or (left, right) lift in px (0 = pressed down)."""
    f = F()
    f.ox = dx
    f.oy = body_dy
    bot = 28 - short
    tail(f, [p for p in FRONT_TAILS[tail_v] if p[1] <= bot - 1 or not short], orange_idx=(4, 5, 10))
    keep = lambda lst: [(x, y) for x, y in lst if y <= bot]
    for y in (17, 18): f.row(y, 10, 21, B)
    for y in range(19, 26 - short): f.row(y, 9, 22, B)
    for y in range(26 - short, bot + 1): f.row(y, 8, 23, B)
    f.r(15, 22, 2, bot - 21, BD)                       # gap between front legs
    f.pts(keep([(13, 19), (14, 19), (17, 19), (18, 19), (11, 21), (20, 21), (10, 24), (21, 24)]), BL)
    f.pts(keep([(13, 22), (14, 22), (13, 23), (19, 24), (20, 24), (20, 25),     # tortie blotches
                (9, 24), (10, 24), (22, 21), (22, 22), (11, 27), (12, 27), (20, 27)]), O)
    f.pts(keep([(13, 24), (19, 26)]), OD)
    if paws is None:
        f.row(bot, 11, 14, BD); f.row(bot, 17, 20, BD)  # paw bottoms
    else:
        for (x0, lift) in ((11, paws[0]), (17, paws[1])):
            f.row(bot - lift - 1, x0, x0 + 3, BL)       # paw top catches light
            f.row(bot - lift, x0, x0 + 3, BD)           # toes
            if lift:
                f.pts([(x0 + 1, bot - lift), (x0 + 2, bot - lift)], PINK2)        # pads show on the raised paw
                f.row(bot - lift + 1, x0, x0 + 3, BD)                             # shadow under it
    f.oy = body_dy
    front_head(f, head_dy, eyes, ear_l, blush_a)
    f.oy = 0
    for (hx, hy, kind) in hearts:
        heart(f, hx, hy)
    f.outline()
    return with_shadow(f) if shadow else f.im


# ================================================================== SIDE SIT (facing right)
SIT_TAIL = [(6, 27), (5, 26), (4, 25), (4, 24), (3, 23), (3, 22), (3, 21), (3, 20), (3, 19),
            (4, 18), (4, 17), (5, 16), (6, 16)]


def side_head(f, x0, y0, eyes="open", ear_dy=0):
    """Big chibi profile head, top-left at (x0, y0). Faces right. 14 wide x 11 tall."""
    f.ox, f.oy = x0, y0
    rows = {0: (4, 9), 1: (2, 11), 2: (0, 13), 3: (0, 13), 4: (0, 13), 5: (0, 13),
            6: (0, 13), 7: (0, 13), 8: (0, 13), 9: (1, 12), 10: (3, 10)}
    for y, (a, b) in rows.items():
        f.row(y, a, b, B)
    d = ear_dy                                        # near ear can twitch
    for y, xs in {-3: [4], -2: [4, 5], -1: [3, 4, 5, 6]}.items():
        for x in xs: f.px(x, y + d, B)
    f.pts([(4, -3 + d)], EARBR); f.pts([(5, -2 + d), (4, -1 + d), (5, -1 + d)], EARIN)
    f.pts([(3, -1 + d)], EARBR)
    for y, xs in {-3: [11], -2: [10, 11], -1: [9, 10, 11, 12]}.items():
        for x in xs: f.px(x, y, B)
    f.pts([(11, -3), (12, -1)], EARBR); f.pts([(10, -1), (11, -1), (11, -2)], EARIN)
    f.pts([(5, 1), (6, 1), (10, 1), (1, 4)], BL)
    f.pts([(6, 1), (7, 2), (8, 1)], O)                 # tortie forehead marks
    f.pts([(1, 6), (2, 6), (1, 7)], O)
    if eyes == "open":
        f.r(8, 3, 4, 4, YEL); f.r(9, 4, 2, 2, GR); f.px(9, 4, GRL)
    elif eyes == "wide":                              # round and startled, tall pupil
        f.r(8, 3, 4, 4, YEL); f.r(9, 3, 2, 4, GR); f.px(9, 3, GRL)
    elif eyes == "blink":
        f.r(8, 3, 4, 4, B); f.row(5, 8, 11, OL)
    f.pts([(14, 6), (14, 7)], NOSE)                   # nose pokes out the front
    f.pts([(12, 8), (13, 8), (11, 9)], OL)            # little mouth
    f.r(5, 7, 3, 2, (PINK[0], PINK[1], PINK[2], 215)) # blush
    f.ox, f.oy = 0, 0


def side_sit(sway=0, head_dy=0, eyes="open", ear_dy=0):
    f = F()
    path = [(x + (sway if i >= 7 else 0), y) for i, (x, y) in enumerate(SIT_TAIL)]
    tail(f, path, orange_idx=(3, 8, 11))
    rows = {13: (13, 20), 14: (12, 20), 15: (10, 21), 16: (9, 21), 17: (8, 21)}
    for y, (a, b) in rows.items(): f.row(y, a, b, B)
    for y in range(18, 29): f.row(y, 7, 21, B)
    f.pts([(10, 19), (11, 19), (12, 20), (13, 21), (13, 22), (13, 23), (12, 24), (11, 25), (10, 25), (9, 24)], BD)
    f.r(17, 22, 1, 6, BD)
    f.row(28, 8, 15, BD); f.row(28, 18, 22, BD)
    f.pts([(19, 19), (19, 20), (20, 21), (12, 17), (9, 21)], BL)
    f.pts([(11, 17), (12, 17), (8, 22), (8, 23), (19, 24), (20, 24), (20, 25), (14, 27), (15, 27),
           (21, 20), (21, 21), (10, 27)], O)
    side_head(f, 13, 4 + head_dy, eyes=eyes, ear_dy=ear_dy)
    f.outline()
    return with_shadow(f, cx=14.5, rx=10.5)


# ================================================================== SIDE WALK (facing right)
def walk_frame(i):
    th = 2 * math.pi * i / 6
    bob = 1 if i % 3 == 1 else 0
    f = F()

    def leg(hx, theta, color, orange=False):
        shift = round(3 * math.sin(theta))
        swing = math.cos(theta) > 0.25
        bottom = 27 if swing else 28
        top = 19 + bob
        for y in range(top, bottom + 1):
            t = (y - top) / max(1, bottom - top)
            x = hx + round(shift * t)
            f.row(y, x, x + 1, color)
        xe = hx + shift
        f.row(bottom, xe, xe + 2, color)                     # paw reaches forward
        if orange: f.px(xe + 1, bottom - 2, O)

    # far legs first (darker)
    leg(10, th + math.pi, BD)
    leg(20, th, BD)
    # tail
    sway = round(math.sin(th + 1))
    tpath = [(6, 13), (5, 12), (4, 11), (4, 10), (3, 9), (3, 8), (3, 7), (4, 6), (5, 6), (6, 6)]
    tpath = [(x + (sway if k >= 4 else 0), y + bob) for k, (x, y) in enumerate(tpath)]
    tail(f, tpath, orange_idx=(2, 6))
    # torso
    f.oy = bob
    torso = {11: (8, 20), 12: (6, 21), 13: (6, 21), 14: (6, 21), 15: (6, 21), 16: (6, 21),
             17: (6, 21), 18: (7, 20), 19: (8, 19)}
    for y, (a, b) in torso.items(): f.row(y, a, b, B)
    f.pts([(9, 12), (10, 12), (15, 12), (16, 12), (12, 18)], BL)
    f.pts([(8, 14), (9, 14), (9, 15), (13, 16), (14, 16), (14, 17), (18, 13), (19, 13), (7, 17), (17, 18)], O)
    f.pts([(11, 15), (12, 14)], OD)
    # head
    side_head(f, 17, 6, eyes="open", ear_dy=0)
    f.oy = 0
    # near legs
    leg(8, th, B, orange=True)
    leg(18, th + math.pi, B)
    f.outline()
    return with_shadow(f, cx=15.5, rx=12)


# ================================================================== KNEAD (front, biscuits)
def knead_frame(left, right, head_dy):
    return front("A", head_dy=head_dy, eyes="happy", blush_a=235, body_dy=-1, short=2,
                 paws=(left, right), shadow=False)


# ================================================================== PLAY (side, batting up-right)
def _line(x0, y0, x1, y1):
    n = max(abs(x1 - x0), abs(y1 - y0))
    return [(round(x0 + (x1 - x0) * i / n), round(y0 + (y1 - y0) * i / n)) for i in range(n + 1)]


def side_play(tip, sway, eyes="wide", head_dy=0, ear_dy=0):
    f = F()
    dx = -1                                           # whole cat nudged left, star sits top-right
    path = [(x + dx + (sway if i >= 7 else 0), y) for i, (x, y) in enumerate(SIT_TAIL)]
    tail(f, path, orange_idx=(3, 8, 11))
    f.ox = dx
    rows = {13: (13, 20), 14: (12, 20), 15: (10, 21), 16: (9, 21), 17: (8, 21)}
    for y, (a, b) in rows.items(): f.row(y, a, b, B)
    for y in range(18, 29): f.row(y, 7, 21, B)
    f.pts([(10, 19), (11, 19), (12, 20), (13, 21), (13, 22), (13, 23), (12, 24), (11, 25), (10, 25), (9, 24)], BD)
    f.r(17, 22, 1, 6, BD)
    f.row(28, 8, 15, BD); f.row(28, 18, 22, BD)
    f.pts([(19, 19), (19, 20), (20, 21), (12, 17), (9, 21)], BL)
    f.pts([(11, 17), (12, 17), (8, 22), (8, 23), (19, 24), (20, 24), (20, 25), (14, 27), (15, 27),
           (21, 20), (21, 21), (10, 27)], O)
    side_head(f, 13 + dx, 4 + head_dy, eyes=eyes, ear_dy=ear_dy)
    # swatting arm: shoulder -> paw
    sx, sy = 19, 20
    tx, ty = tip
    for (x, y) in _line(sx, sy, tx, ty):
        f.px(x, y, B); f.px(x + 1, y, B); f.px(x, y + 1, BD)
    for j in range(-1, 2):
        f.row(ty + j, tx - 1, tx + 1, B)
    f.pts([(tx - 1, ty - 1), (tx, ty - 1)], BL)
    f.pts([(tx + 1, ty), (tx + 1, ty - 1)], PINK2)    # pad faces the star
    f.pts([(tx, ty + 1), (tx - 1, ty + 1)], BD)
    f.outline()
    return with_shadow(f, cx=14.5, rx=10.5)


# ================================================================== SLEEP (donut loaf)
def sleep_frame(b):
    """b = 0 / 1 : breathing, body rises 1px. Everything lives in y 18..31."""
    f = F()
    top, bot = 22 - b, 30
    n = bot - top + 1
    cy, ry, rx = (top + bot) / 2, n / 2 + 0.9, 13.3
    for y in range(top, bot + 1):
        half = rx * math.sqrt(max(0.0, 1 - ((y - cy) / ry) ** 2))
        if y >= bot - 1: half = max(half, 11.0 - (bot - y) * 1.5)
        f.row(y, math.ceil(15.5 - half), math.floor(15.5 + half), B)
    f.pts([(8, top + 1), (9, top + 1), (13, top), (14, top), (19, top + 1), (5, top + 3), (4, top + 4)], BL)
    f.pts([(6, top + 3), (7, top + 3), (7, top + 4), (11, top + 2), (12, top + 2), (24, top + 3),
           (25, top + 4), (4, top + 6)], O)
    f.pts([(9, top + 5), (10, top + 5)], OD)
    # tail wrapped round the front of the body, orange tip tucked under her chin
    for y in (29, 30):
        f.row(y, 4 + (y - 29), 15, BD)
    f.pts([(3, 28), (4, 28), (3, 27), (4, 29)], BD)
    f.row(29, 12, 15, O); f.row(30, 12, 15, OD)
    f.pts([(5, 29), (6, 29), (9, 29)], BL)
    # head resting on her paws, moves with the breath
    f.oy = -b
    hr = {22: (16, 25), 23: (14, 27), 24: (14, 27), 25: (14, 27), 26: (14, 27), 27: (14, 27),
          28: (14, 27), 29: (14, 27), 30: (16, 25)}
    for y, (a, c) in hr.items(): f.row(y, a, c, B)
    f.pts([(16, 20), (15, 21), (16, 21), (17, 21), (25, 20), (26, 21), (25, 21), (24, 21), (16, 22), (25, 22)], B)
    f.pts([(16, 20), (15, 21), (25, 20), (26, 21)], EARBR)
    f.pts([(16, 21), (17, 21), (25, 21), (24, 21)], EARIN)
    f.pts([(17, 23), (18, 22), (22, 22), (23, 22)], BL)
    f.pts([(18, 23), (19, 23), (19, 24), (22, 24)], O)
    f.pts([(17, 26), (18, 27), (19, 26), (22, 26), (23, 27), (24, 26)], OL)    # closed eyes
    f.pts([(20, 28), (21, 28)], NOSE)
    f.pts([(20, 29), (21, 29)], OL)
    bl = (PINK[0], PINK[1], PINK[2], 225)
    f.pts([(15, 28), (16, 28), (25, 28), (26, 28)], bl)
    f.oy = 0
    f.outline()
    return f.im


# ================================================================== HELD (picked up, dangling)
def held_frame(dx, leg_dx):
    f = F()
    f.oy = 0
    # tail hangs straight down behind her, tip swings with the legs
    f.ox = dx
    for i, y in enumerate(range(20, 30)):
        x = 23 + (leg_dx if y > 24 else 0) + (1 if y > 27 else 0)
        f.px(x, y, O if y >= 28 else B); f.px(x + 1, y, O if y >= 28 else B)
    # stretched torso + belly
    for y in range(18, 27): f.row(y, 11, 20, B)
    for y in range(27, 30): f.row(y, 12, 19, B)
    f.pts([(12, 19), (13, 19), (18, 19), (11, 21), (12, 21)], BL)
    f.pts([(13, 22), (14, 22), (14, 23), (18, 24), (19, 24), (13, 27), (14, 27)], O)
    f.pts([(16, 25), (15, 26)], OD)
    f.r(15, 22, 2, 5, BD)                             # fur crease down the middle
    # limp legs: front pair at her sides, back pair hanging lower and swinging
    f.ox = dx
    for (x0, ph) in ((8, 0), (21, 0)):
        f.r(x0 + ph, 19, 3, 8, B)
        f.pts([(x0 + ph, 19), (x0 + ph, 20)], BL)
        f.row(26, x0 + ph, x0 + ph + 2, BD)
        f.row(27, x0 + ph, x0 + ph + 2, PINK2)
    f.ox = dx + leg_dx
    for x0 in (11, 18):
        f.r(x0, 28, 3, 3, B)
        f.row(30, x0, x0 + 2, BD)
        f.px(x0 + 1, 29, O)
    f.ox = dx
    f.oy = 0
    front_head(f, head_dy=1, eyes="surprised", blush_a=170, mouth="o")
    f.outline()
    return f.im


# ================================================================== BOX (two layers)
CB_D = C("#9a6b34")                                   # darker cardboard shade


def box_back():
    f = F()
    # back flap, opened upward and tilted away
    for y, (a, b) in {7: (8, 23), 8: (7, 24), 9: (6, 25), 10: (5, 26), 11: (4, 27)}.items():
        f.row(y, a, b, OD)
    f.row(7, 8, 23, O)
    # side flaps spread out
    for y, (a, b) in {12: (0, 3), 13: (0, 4), 14: (1, 4), 15: (1, 4)}.items():
        f.row(y, a, b, OD); f.row(y, 31 - b, 31 - a, CB_D)
    f.row(12, 0, 3, O)
    # back wall seen from inside: light top, deeper shadow towards the floor
    for y in range(12, 32):
        shade = O if y < 15 else (OD if y < 21 else CB_D)
        f.row(y, 4, 27, shade)
    f.r(4, 12, 1, 20, OD); f.r(27, 12, 1, 20, CB_D)   # inner side walls
    f.row(12, 5, 26, O)
    f.outline()
    return f.im


def box_front():
    f = F()
    f.r(2, 19, 28, 13, O)                              # front wall
    f.r(2, 19, 28, 3, O)
    f.row(19, 2, 29, C("#deb16e"))
    f.row(21, 2, 29, OD)                               # fold line of the front flap
    f.r(2, 29, 28, 3, OD)                              # shaded bottom
    f.r(28, 22, 2, 7, OD)                              # right edge in shade
    f.r(14, 22, 4, 7, OD); f.r(15, 22, 2, 7, CB_D)     # packing tape
    f.pts([(5, 24), (6, 24), (7, 24), (5, 26), (6, 26)], OD)           # little label scribble
    f.outline()
    return f.im


# ================================================================== STRIPS
def strip(frames, name):
    os.makedirs(OUT, exist_ok=True)
    img = Image.new("RGBA", (FW * len(frames), FH), (0, 0, 0, 0))
    for i, fr in enumerate(frames):
        img.alpha_composite(fr, (i * FW, 0))
    img.save(os.path.join(OUT, name))
    return img


def build():
    idle = [
        front("A"),
        front("B"),
        front("B", head_dy=1),
        front("A", head_dy=1, eyes="blink"),
        front("C", ear_l=(-1, 1)),
        front("A"),
    ]
    walk = [walk_frame(i) for i in range(6)]
    sit = [
        side_sit(sway=0),
        side_sit(sway=1, ear_dy=1),
        side_sit(sway=1, eyes="blink", head_dy=1),
        side_sit(sway=0),
    ]
    purr = [
        front("A", eyes="happy", dx=0, blush_a=235, hearts=[(25, 5, 0)]),
        front("B", eyes="happy", dx=1, blush_a=235, hearts=[(26, 3, 0)]),
        front("A", eyes="happy", dx=0, head_dy=1, blush_a=235, hearts=[(25, 2, 0), (1, 7, 0)]),
        front("B", eyes="happy", dx=-1, blush_a=235, hearts=[(1, 4, 0)]),
    ]
    knead = [knead_frame(0, 3, 0), knead_frame(2, 2, 1), knead_frame(3, 0, 0), knead_frame(2, 2, 1)]
    play = [side_play((26, 14), 0), side_play((28, 10), -1, head_dy=0),
            side_play((27, 12), 0, ear_dy=1), side_play((25, 15), 1)]
    sleep = [sleep_frame(0), sleep_frame(1), sleep_frame(1), sleep_frame(0)]
    held = [held_frame(-1, 1), held_frame(1, -1)]
    box = [box_back(), box_front()]
    return {"idle.png": idle, "walk.png": walk, "sit.png": sit, "purr.png": purr,
            "knead.png": knead, "play.png": play, "sleep.png": sleep, "held.png": held, "box.png": box}


def sheet(strips, scale=6):
    """stormi-sheet.png: every strip on lavender, plus the box with Stormi sitting between its layers."""
    from PIL import ImageDraw
    bg = (0xED, 0xE9, 0xFE, 255)
    order = ["idle", "walk", "sit", "purr", "knead", "play", "sleep", "held", "box"]
    rows = [(n, strips[n + ".png"]) for n in order]
    box = strips["box.png"]
    comp = Image.new("RGBA", (FW, FH), (0, 0, 0, 0))
    comp.alpha_composite(box[0]); comp.alpha_composite(strips["idle.png"][0], (0, 3)); comp.alpha_composite(box[1])
    rows.append(("box + stormi", [comp]))
    pad, lab = 10, 14
    W = max(len(fr) for _, fr in rows) * (FW * scale + pad) + pad
    H = sum(FH * scale + lab + pad for _ in rows) + pad
    out = Image.new("RGBA", (W, H), bg)
    d = ImageDraw.Draw(out)
    y = pad
    for name, frames in rows:
        d.text((pad, y), name.upper(), fill=(0x4C, 0x1D, 0x95, 255))
        y += lab
        for i, fr in enumerate(frames):
            out.alpha_composite(fr.resize((FW * scale, FH * scale), Image.NEAREST), (pad + i * (FW * scale + pad), y))
        y += FH * scale + pad
    out.convert("RGB").save(os.path.join(os.path.dirname(OUT), "stormi-sheet.png"))


if __name__ == "__main__":
    built = build()
    for name, frames in built.items():
        strip(frames, name)
        print(name, len(frames), "frames")
    sheet(built)
