"""Build the licensed webfont bundle from the user's desktop font library.

Run with: uv run --with 'fonttools[woff]' python scripts/prepare-fonts.py
Generated webfont subsets live in src/assets/fonts/custom.
The owner confirmed webfont rights before publication; desktop originals stay external.
"""

from concurrent.futures import ProcessPoolExecutor
from copy import deepcopy
from hashlib import sha256
from pathlib import Path
import argparse
import json
import logging
import re

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "src/assets/fonts/custom"
MARKER = ROOT / ".sage-cache/fonts/manifest.json"
FACES = [
    ("tsuku-sc-r", "Blog Tsuku SC", 400, "01-宋体与明朝/筑紫明朝/SC-方正FW/方正FW筑紫明朝 简 R.ttf", "normal"),
    ("tsuku-sc-m", "Blog Tsuku SC", 500, "01-宋体与明朝/筑紫明朝/SC-方正FW/方正FW筑紫明朝 简 M.ttf", "normal"),
    ("tsuku-sc-b", "Blog Tsuku SC", 700, "01-宋体与明朝/筑紫明朝/SC-方正FW/方正FW筑紫明朝 简 B.ttf", "normal"),
    ("tsuku-jp-r", "Blog Tsuku JP", 400, "01-宋体与明朝/筑紫明朝/JP-Fontworks Pro/FOT-TsukuMinPro-R.otf", "normal"),
    ("tsuku-jp-m", "Blog Tsuku JP", 500, "01-宋体与明朝/筑紫明朝/JP-Fontworks Pro/FOT-TsukuMinPro-M.otf", "normal"),
    ("tsuku-jp-b", "Blog Tsuku JP", 700, "01-宋体与明朝/筑紫明朝/JP-Fontworks Pro/FOT-TsukuMinPro-B.otf", "normal"),
    ("maple-regular", "Blog Maple Mono", 400, "04-等宽与数学/Maple Mono/MapleMono-Regular.ttf", "normal"),
    ("maple-italic", "Blog Maple Mono", 400, "04-等宽与数学/Maple Mono/MapleMono-Italic.ttf", "italic"),
    ("maple-bold", "Blog Maple Mono", 700, "04-等宽与数学/Maple Mono/MapleMono-Bold.ttf", "normal"),
    ("maple-bolditalic", "Blog Maple Mono", 700, "04-等宽与数学/Maple Mono/MapleMono-BoldItalic.ttf", "italic"),
]


def is_cjk(codepoint):
    return (0x2E80 <= codepoint <= 0x9FFF or 0xF900 <= codepoint <= 0xFAFF
            or 0xFE10 <= codepoint <= 0xFE6F or 0xFF00 <= codepoint <= 0xFFEF
            or 0x20000 <= codepoint <= 0x323AF)


def unicode_ranges(codepoints):
    ranges = []
    start = previous = codepoints[0]
    for cp in codepoints[1:]:
        if cp == previous + 1:
            previous = cp
            continue
        ranges.append((start, previous))
        start = previous = cp
    ranges.append((start, previous))
    return ",".join(f"U+{a:X}" if a == b else f"U+{a:X}-{b:X}" for a, b in ranges)


def build_face(task):
    library, face = task
    slug, family, weight, relative, style = face
    logging.getLogger("fontTools").setLevel(logging.ERROR)
    font = TTFont(Path(library) / relative)
    font.ensureDecompiled()
    groups = {}
    latin = slug.startswith("maple")
    for cp in sorted(font.getBestCmap()):
        if latin or is_cjk(cp):
            groups.setdefault(0 if latin else cp // 1024, []).append(cp)
    declarations = []
    for group, codepoints in groups.items():
        part = deepcopy(font)
        options = subset.Options()
        options.layout_features = ["*"]
        options.name_IDs = ["*"]  # Retain names and the source's license records.
        subsetter = subset.Subsetter(options=options)
        subsetter.populate(unicodes=codepoints)
        subsetter.subset(part)
        part.flavor = "woff2"
        filename = f"{slug}-{group:x}.woff2"
        part.save(OUTPUT / filename)
        declarations.append(
            f'@font-face {{ font-family: "{family}"; font-style: {style}; '
            f'font-weight: {weight}; font-display: swap; '
            f'src: url("./{filename}") format("woff2"); '
            f'unicode-range: {unicode_ranges(codepoints)}; }}'
        )
    return slug, declarations


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--library", type=Path, default=Path.home() / "Documents/fonts")
    args = parser.parse_args()
    digest = sha256(Path(__file__).read_bytes())
    for _, _, _, relative, _ in FACES:
        path = args.library / relative
        if not path.is_file():
            parser.error(f"Missing source font: {path}")
        digest.update(path.read_bytes())
    signature = digest.hexdigest()
    marker = MARKER
    if marker.exists() and (OUTPUT / "fonts.css").exists() and json.loads(marker.read_text()).get("signature") == signature:
        print("Webfont bundle is current.")
        return
    OUTPUT.mkdir(parents=True, exist_ok=True)
    css = []
    with ProcessPoolExecutor(max_workers=4) as workers:
        for slug, declarations in workers.map(build_face, [(args.library, f) for f in FACES]):
            print(f"Prepared {slug}: {len(declarations)} Unicode subsets", flush=True)
            css.extend(declarations)
    stylesheet = "\n".join(css) + "\n"
    (OUTPUT / "fonts.css").write_text(stylesheet)
    used = set(re.findall(r'url\("\./([^\"]+)"\)', stylesheet))
    for path in OUTPUT.glob("*.woff2"):
        if path.name not in used:
            path.unlink()
    marker.parent.mkdir(parents=True, exist_ok=True)
    marker.write_text(json.dumps({"signature": signature, "faces": FACES}, ensure_ascii=False, indent=2) + "\n")
    print(f"Webfonts prepared in {OUTPUT}")


if __name__ == "__main__":
    main()
