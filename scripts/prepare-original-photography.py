from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

from PIL import Image, ImageFilter, ImageOps, ImageStat


def dhash(image: Image.Image, size: int = 16) -> int:
    sample = ImageOps.grayscale(image).resize((size + 1, size), Image.Resampling.LANCZOS)
    pixels = list(sample.getdata())
    value = 0
    for row in range(size):
        offset = row * (size + 1)
        for column in range(size):
            value = (value << 1) | (pixels[offset + column] > pixels[offset + column + 1])
    return value


def quality_score(image: Image.Image) -> float:
    gray = ImageOps.grayscale(image)
    entropy = gray.entropy()
    edge = ImageStat.Stat(gray.resize((320, 320), Image.Resampling.LANCZOS).filter(ImageFilter.FIND_EDGES))
    sharpness = math.sqrt(edge.var[0])
    pixels = image.width * image.height
    return entropy * 4 + sharpness + math.log2(max(pixels, 1))


def hamming(left: int, right: int) -> int:
    return (left ^ right).bit_count()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--root", type=Path, required=True)
    args = parser.parse_args()

    source_files = sorted(args.source.glob("original-photo-*.jpg"))
    candidates = []
    for path in source_files:
        with Image.open(path) as raw:
            image = ImageOps.exif_transpose(raw).convert("RGB")
            if min(image.size) < 600:
                continue
            candidates.append({
                "path": path,
                "hash": dhash(image),
                "score": quality_score(image),
                "width": image.width,
                "height": image.height,
            })

    candidates.sort(key=lambda item: item["score"], reverse=True)
    selected = []
    for candidate in candidates:
        if any(hamming(candidate["hash"], item["hash"]) <= 20 for item in selected):
            continue
        selected.append(candidate)
        if len(selected) == 72:
            break
    if len(selected) < 72:
        raise RuntimeError(f"Only {len(selected)} distinct originals survived de-duplication")

    homepage_full = args.root / "assets/photography/full"
    homepage_thumbs = args.root / "assets/photography/thumbs"
    archive = args.root / "projects/visual-archive/assets/photography/originals"
    audit = args.root / "qa-audit"
    for directory in (homepage_full, homepage_thumbs, archive, audit):
        directory.mkdir(parents=True, exist_ok=True)

    records = []
    contact_tiles = []
    for index, candidate in enumerate(selected, start=1):
        number = f"{index:02d}"
        with Image.open(candidate["path"]) as raw:
            image = ImageOps.exif_transpose(raw).convert("RGB")
            full = image.copy()
            full.thumbnail((2400, 2400), Image.Resampling.LANCZOS)
            full.save(archive / f"original-{number}.webp", "WEBP", quality=88, method=4)
            if index <= 24:
                full.save(homepage_full / f"original-{number}.webp", "WEBP", quality=88, method=4)
                thumb = ImageOps.fit(image, (480, 480), method=Image.Resampling.LANCZOS)
                thumb.save(homepage_thumbs / f"original-{number}.webp", "WEBP", quality=80, method=4)

            tile = ImageOps.contain(image, (180, 130), Image.Resampling.LANCZOS)
            frame = Image.new("RGB", (196, 158), "#111414")
            frame.paste(tile, ((196 - tile.width) // 2, 8))
            contact_tiles.append(frame)

        records.append({
            "id": f"original-{number}",
            "source": candidate["path"].name,
            "width": candidate["width"],
            "height": candidate["height"],
            "score": round(candidate["score"], 3),
        })

    sheet = Image.new("RGB", (196 * 8, 158 * 9), "#090b0b")
    for index, tile in enumerate(contact_tiles):
        sheet.paste(tile, ((index % 8) * 196, (index // 8) * 158))
    sheet.save(audit / "selected-originals-contact.jpg", quality=90)
    (audit / "selected-originals.json").write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Prepared {len(records)} complete original photographs from {len(candidates)} candidates.")


if __name__ == "__main__":
    main()
