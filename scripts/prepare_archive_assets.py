#!/usr/bin/env python3
"""Prepare the verified Wanxiang Archive blanks for browser compositing.

The source renders contain a baked neutral checkerboard despite being requested
with transparency. This script removes only the edge-connected checkerboard,
keeps the generated material itself intact, and writes alpha WebP derivatives.
Readable text is never introduced here; it remains a DOM responsibility.
"""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


DESTINATION = Path(__file__).resolve().parents[1] / "public" / "archive" / "phase-1"

OBJECTS = {
    "work-dossier.webp": "WX-A01-work-folder-no-shadow.png",
    "lab-foldout.webp": "WX-A02-lab-foldout.png",
    "notes-notebook.webp": "WX-A03-notebook-cover.png",
    "garden-seed-packet.webp": "WX-A04-garden-seed-packet.png",
    "about-letter.webp": "WX-A05-about-letter.png",
}


def edge_connected_checkerboard(image: Image.Image) -> Image.Image:
    rgb = np.asarray(image.convert("RGB"), dtype=np.uint8)
    height, width, _ = rgb.shape
    high = rgb.max(axis=2)
    low = rgb.min(axis=2)

    # Wanxiang rendered the requested transparent background as two nearly
    # neutral white squares. Limit removal to those tones and only flood from
    # the outer edge so pale paper interiors cannot be punched out.
    removable = (low >= 232) & ((high - low) <= 7)
    outside = np.zeros((height, width), dtype=np.uint8)
    queue: deque[tuple[int, int]] = deque()

    def seed(x: int, y: int) -> None:
        if removable[y, x] and not outside[y, x]:
            outside[y, x] = 1
            queue.append((x, y))

    for x in range(width):
        seed(x, 0)
        seed(x, height - 1)
    for y in range(height):
        seed(0, y)
        seed(width - 1, y)

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height and removable[ny, nx] and not outside[ny, nx]:
                outside[ny, nx] = 1
                queue.append((nx, ny))

    alpha = Image.fromarray(((1 - outside) * 255).astype(np.uint8), mode="L")
    alpha = alpha.filter(ImageFilter.GaussianBlur(radius=0.7))

    result = image.convert("RGBA")
    result.putalpha(alpha)
    bbox = alpha.getbbox()
    if not bbox:
        raise RuntimeError("Background removal produced an empty object")

    margin = max(16, min(width, height) // 80)
    crop = (
        max(0, bbox[0] - margin),
        max(0, bbox[1] - margin),
        min(width, bbox[2] + margin),
        min(height, bbox[3] + margin),
    )
    return result.crop(crop)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source",
        type=Path,
        required=True,
        help="Directory containing the verified WX-A01—WX-A06 source renders.",
    )
    parser.add_argument("--destination", type=Path, default=DESTINATION)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    args.destination.mkdir(parents=True, exist_ok=True)

    for destination_name, source_name in OBJECTS.items():
        prepared = edge_connected_checkerboard(Image.open(args.source / source_name))
        prepared.save(args.destination / destination_name, "WEBP", quality=92, method=6)

    surface = Image.open(args.source / "WX-A06-archive-surface-2048.png").convert("RGB")
    surface.save(args.destination / "archive-surface.webp", "WEBP", quality=88, method=6)


if __name__ == "__main__":
    main()
