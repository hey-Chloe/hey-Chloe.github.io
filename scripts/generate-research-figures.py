#!/usr/bin/env python3
"""Generate the three source-attributed publication figures.

Each research project owns a separate figure grammar and immutable data extract
under ``scripts/paper_figures``. This entry point only orchestrates those
renderers; it never runs an experiment or downloads data.
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]
FIGURE_DIR = ROOT / "scripts" / "paper_figures"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--language",
        choices=("zh", "en", "all"),
        default=os.environ.get("CHART_LANGUAGE", "all"),
        help="Generate Chinese, English, or both language variants.",
    )
    return parser.parse_args()


def run_renderer(filename: str, language: str) -> None:
    renderer_language = (
        "both" if filename == "agent_figure.py" and language == "all" else language
    )
    subprocess.run(
        [sys.executable, str(FIGURE_DIR / filename), "--language", renderer_language],
        cwd=ROOT,
        check=True,
    )


def main() -> None:
    args = parse_args()
    for renderer in ("agent_figure.py", "recsys_figure.py", "vlm_figure.py"):
        run_renderer(renderer, args.language)


if __name__ == "__main__":
    main()
