# Sprites

Pixel art for the FINAL BOSS character customizer.

## Rules
- **Transparent PNG**, drawn at **1x** (1 pixel = 1 pixel). The site scales them up crisply.
- **Every layer uses the same canvas size** (**32x56** for `lhenna/`, **32x32** per frame for `stormi/`) with the character in the same spot,
  so the layers stack perfectly on top of each other.
- File names must match exactly (lowercase), since the code looks them up by name.

## lhenna/ — layers, stacked bottom to top
| Layer | Files |
|-------|-------|
| base body (skin + sports bra and shorts, shown when no outfit is picked) | `base.png` |
| back hair (optional, for hair that goes behind the body) | `hair-long-back.png`, `hair-bob-back.png`, `hair-ponytail-back.png`, `hair-curly-back.png` |
| outfit | `outfit-gym.png`, `outfit-hoodie.png`, `outfit-dress.png`, `outfit-pajamas.png`, `outfit-casual.png` |
| face | `expr-blank.png`, `expr-happy.png`, `expr-sleepy.png`, `expr-focused.png` |
| hair | `hair-long.png`, `hair-bob.png`, `hair-ponytail.png`, `hair-curly.png` |
| accessory (none = no file) | `acc-star.png`, `acc-headphones.png`, `acc-glasses.png` |

## Animations (sprite sheets)
Frames side by side in one horizontal strip, every frame the same size.
Example: 4 frames of 32x32 → one 128x32 PNG.

| Folder | Files |
|--------|-------|
| `lhenna/` | `pet.png` (petting arm), plus any scene sheets later (e.g. `sleep.png`) |
| `stormi/` | `idle.png` (6), `walk.png` (6), `sit.png` (4), `purr.png` (4) |

Send the frame size and frame count for each sheet if they differ from the rest.

## Tools
Generators and previews live in `tools/sprites/` (outside `assets/`, so they are not part of the site).
`gen_sprites.py` deletes and rewrites `lhenna/`, and `gen_stormi.py` writes `stormi/`, so never keep anything else in those two folders.
