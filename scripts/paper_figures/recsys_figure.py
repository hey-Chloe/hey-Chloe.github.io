#!/usr/bin/env python3
"""Render the frozen RecSys experiment as a publication figure.

The script reads only ``data/recsys_figure.json``.  That file records the
committed report, commit, checksum, and exact JSON keys used by every panel.
No metric is recomputed from raw predictions here.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import re
from pathlib import Path
from typing import Any

import matplotlib as mpl
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.font_manager import FontProperties, fontManager
from matplotlib.patches import Rectangle


HERE = Path(__file__).resolve().parent
DATA_PATH = HERE / "data" / "recsys_figure.json"
REPO_ROOT = HERE.parents[1]
OUTPUT_DIR = REPO_ROOT / "public" / "images"

INK = "#17201e"
MUTED = "#596461"
GRID = "#d9dfdd"
LIGHT = "#eef1f0"
ACCENT = "#176c61"
ACCENT_LIGHT = "#bcd7d1"
LOSS = "#7f8986"
REGULAR_WEIGHT = 400
EMPHASIS_WEIGHT = 700


TEXT = {
    "en": {
        "a_title": "Protocol: select on development, evaluate once on test",
        "dev_pool": "5 candidate\nrerankers",
        "dev_select": "Select by dev\nNDCG@100",
        "freeze": "Freeze model +\nmanifest",
        "test_candidates": "Exact Top-100\ncandidates",
        "test_rerank": "DIN reranking\n3 seeds",
        "paired": "Per-user paired\ndifferences",
        "train_only": "calibration: train only",
        "test_closed": "test unopened",
        "same_queries": "fixed users + candidates",
        "bootstrap": "B = 2,000",
        "b_title": "Development-set selection over five candidates",
        "c_title": "Frozen-test NDCG at three cutoffs",
        "d_title": "User-level paired evidence at K=100",
        "selected": "selected on dev",
        "exact": "Exact retrieval",
        "din_mean": "DIN mean (3 seeds)",
        "din_seed": "DIN seed",
        "ndcg": "NDCG@K",
        "cutoff": "Evaluation cutoff K",
        "delta_axis": "paired NDCG difference (DIN - Exact)",
        "ci_label": "mean and 95% paired bootstrap CI",
        "outcomes": "per-user outcomes after seed averaging",
        "win": "win",
        "tie": "tie",
        "loss": "loss",
        "descriptive": "K=20/50 deltas are descriptive; primary inference is K=100.",
        "candidate_labels": {
            "exact-din-hard-64-32": "Exact / DIN / hard",
            "exact-dcn-hard-64-32": "Exact / DCN / hard",
            "exact-din-uniform-64-32": "Exact / DIN / uniform",
            "exact-din-inbatch-64-32": "Exact / DIN / in-batch",
            "hnsw-din-hard-64-32": "HNSW / DIN / hard",
        },
    },
    "zh": {
        "a_title": "实验协议：开发集选型，冻结后一次性测试",
        "dev_pool": "5 个候选\n重排器",
        "dev_select": "按开发集\nNDCG@100 选型",
        "freeze": "冻结模型与\n证据清单",
        "test_candidates": "Exact Top-100\n候选集",
        "test_rerank": "DIN 重排\n3 个种子",
        "paired": "用户级配对\n差值",
        "train_only": "校准仅使用训练集",
        "test_closed": "测试集保持未开启",
        "same_queries": "固定用户与候选集合",
        "bootstrap": "B = 2,000",
        "b_title": "五个候选在开发集上的选型结果",
        "c_title": "冻结测试集上的三个截断位置",
        "d_title": "K=100 的用户级配对证据",
        "selected": "由开发集选中",
        "exact": "Exact 召回排序",
        "din_mean": "DIN 均值（3 个种子）",
        "din_seed": "DIN 种子",
        "ndcg": "NDCG@K",
        "cutoff": "评估截断位置 K",
        "delta_axis": "配对 NDCG 差值（DIN - Exact）",
        "ci_label": "均值与 95% 配对 bootstrap 区间",
        "outcomes": "种子均值后的用户级结果",
        "win": "提升",
        "tie": "持平",
        "loss": "下降",
        "descriptive": "K=20/50 仅作描述；主要推断预先指定为 K=100。",
        "candidate_labels": {
            "exact-din-hard-64-32": "Exact / DIN / hard",
            "exact-dcn-hard-64-32": "Exact / DCN / hard",
            "exact-din-uniform-64-32": "Exact / DIN / uniform",
            "exact-din-inbatch-64-32": "Exact / DIN / in-batch",
            "hnsw-din-hard-64-32": "HNSW / DIN / hard",
        },
    },
}


def configure_matplotlib(language: str) -> FontProperties:
    global REGULAR_WEIGHT, EMPHASIS_WEIGHT
    # Keep named weights: Matplotlib's SVG backend does not accept numeric
    # values returned by every macOS CJK collection.
    REGULAR_WEIGHT, EMPHASIS_WEIGHT = (
        ("light", "semibold") if language == "zh" else ("normal", "bold")
    )
    logging.getLogger("matplotlib.font_manager").setLevel(logging.ERROR)
    mpl.rcParams.update(
        {
            "figure.facecolor": "white",
            "axes.facecolor": "white",
            "axes.edgecolor": INK,
            "axes.labelcolor": INK,
            "text.color": INK,
            "xtick.color": MUTED,
            "ytick.color": MUTED,
            "axes.linewidth": 0.75,
            "font.size": 7.5,
            "axes.titlesize": 8.2,
            "font.weight": REGULAR_WEIGHT,
            "axes.titleweight": EMPHASIS_WEIGHT,
            "axes.labelsize": 7.4,
            "xtick.labelsize": 6.8,
            "ytick.labelsize": 6.8,
            "legend.fontsize": 6.3,
            "svg.fonttype": "none",
            "svg.hashsalt": "recsys-frozen-protocol-paper-v1",
            "pdf.fonttype": 42,
            "savefig.facecolor": "white",
            "savefig.bbox": None,
        }
    )

    if language == "zh":
        candidates = [
            os.environ.get("CHART_FONT"),
            "/System/Library/Fonts/PingFang.ttc",
            "/System/Library/Fonts/Hiragino Sans GB.ttc",
            "/System/Library/Fonts/Supplemental/Songti.ttc",
        ]
        for candidate in candidates:
            if candidate and Path(candidate).exists():
                fontManager.addfont(candidate)
                prop = FontProperties(fname=candidate)
                mpl.rcParams["font.family"] = prop.get_name()
                mpl.rcParams["axes.unicode_minus"] = False
                return prop

    arial = Path("/System/Library/Fonts/Supplemental/Arial.ttf")
    if arial.exists():
        fontManager.addfont(arial)
        prop = FontProperties(fname=arial)
        mpl.rcParams["font.family"] = prop.get_name()
        return prop
    mpl.rcParams["font.family"] = "DejaVu Sans"
    return FontProperties(family="DejaVu Sans")


def load_data() -> dict[str, Any]:
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    assert data["schema_version"] == 1
    assert data["selected_candidate"] == "exact-din-uniform-64-32"
    assert data["protocol"]["ks"] == [20, 50, 100]
    assert len(data["dev_candidates"]) == 5
    assert len(data["protocol"]["seeds"]) == 3
    assert data["protocol"]["test_opened_after_selection_frozen"] is True
    assert data["protocol"]["test_tuning_forbidden"] is True
    assert data["provenance"]["source_sha256"] == (
        "192f13250a48a6e6e847585d867f91f7466d07a5d46d3fabc735c16f03ebdb69"
    )
    ci = data["test"]["paired_ndcg"]["100"]["confidence_interval"]
    assert ci["lower_bound"] > 0
    assert ci["lower_bound"] < ci["mean_difference"] < ci["upper_bound"]
    return data


def panel_title(ax: plt.Axes, letter: str, title: str) -> None:
    ax.set_title(f"({letter})  {title}", loc="left", pad=7)


def protocol_panel(ax: plt.Axes, strings: dict[str, Any]) -> None:
    panel_title(ax, "a", strings["a_title"])
    ax.set_axis_off()
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)

    def box(x: float, y: float, w: float, h: float, text: str, *, accent: bool = False) -> None:
        ax.add_patch(
            Rectangle(
                (x, y), w, h,
                facecolor=ACCENT_LIGHT if accent else "white",
                edgecolor=ACCENT if accent else "#8f9996",
                linewidth=0.9,
                zorder=2,
            )
        )
        ax.text(x + w / 2, y + h / 2, text, ha="center", va="center", fontsize=6.7,
                weight=EMPHASIS_WEIGHT if accent else REGULAR_WEIGHT, linespacing=1.15, zorder=3)

    def arrow(x1: float, y1: float, x2: float, y2: float) -> None:
        ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="-|>", color=MUTED, lw=0.8, mutation_scale=7))

    w, h = 0.205, 0.19
    xs = [0.01, 0.29, 0.57]
    y_top, y_bottom = 0.60, 0.14
    box(xs[0], y_top, w, h, strings["dev_pool"])
    box(xs[1], y_top, w, h, strings["dev_select"])
    box(xs[2], y_top, w, h, strings["freeze"], accent=True)
    arrow(xs[0] + w, y_top + h / 2, xs[1], y_top + h / 2)
    arrow(xs[1] + w, y_top + h / 2, xs[2], y_top + h / 2)
    ax.text(0.01, 0.88, "DEV", color=ACCENT, fontsize=6.5, weight=EMPHASIS_WEIGHT)
    ax.text(0.01, 0.51, strings["train_only"], color=MUTED, fontsize=6.0)
    ax.text(0.98, 0.51, strings["test_closed"], color=MUTED, fontsize=6.0, ha="right")
    ax.plot([0.0, 1.0], [0.48, 0.48], color=GRID, lw=0.9, ls=(0, (2, 2)))

    bottom_xs = [0.01, 0.29, 0.57]
    box(bottom_xs[0], y_bottom, w, h, strings["test_candidates"])
    box(bottom_xs[1], y_bottom, w, h, strings["test_rerank"], accent=True)
    box(bottom_xs[2], y_bottom, w, h, strings["paired"])
    arrow(bottom_xs[0] + w, y_bottom + h / 2, bottom_xs[1], y_bottom + h / 2)
    arrow(bottom_xs[1] + w, y_bottom + h / 2, bottom_xs[2], y_bottom + h / 2)
    ax.annotate("", xy=(bottom_xs[0] + w / 2, y_bottom + h),
                xytext=(xs[2] + w / 2, y_top),
                arrowprops=dict(arrowstyle="-|>", color=MUTED, lw=0.8, mutation_scale=7,
                                connectionstyle="angle3,angleA=-90,angleB=180"))
    ax.text(0.01, 0.40, "TEST", color=INK, fontsize=6.5, weight=EMPHASIS_WEIGHT)
    ax.text(bottom_xs[1] + w / 2, 0.06, strings["same_queries"], color=MUTED,
            fontsize=6.0, ha="center")
    ax.text(bottom_xs[2] + w / 2, 0.06, strings["bootstrap"], color=MUTED,
            fontsize=6.0, ha="center")


def dev_selection_panel(ax: plt.Axes, data: dict[str, Any], strings: dict[str, Any]) -> None:
    panel_title(ax, "b", strings["b_title"])
    ks = data["protocol"]["ks"]
    selected = data["selected_candidate"]
    styles = ["-", "--", "-.", ":", (0, (5, 2))]
    markers = ["o", "s", "^", "D", "v"]

    for idx, candidate in enumerate(data["dev_candidates"]):
        cid = candidate["id"]
        values = [candidate["ndcg"][str(k)] for k in ks]
        is_selected = cid == selected
        ax.plot(
            ks, values,
            color=ACCENT if is_selected else LOSS,
            lw=1.8 if is_selected else 0.9,
            ls="-" if is_selected else styles[idx],
            marker=markers[idx],
            ms=4.2 if is_selected else 3.1,
            markerfacecolor="white" if not is_selected else ACCENT,
            markeredgewidth=0.75,
            label=strings["candidate_labels"][cid],
            zorder=5 if is_selected else 2,
        )

    chosen = next(c for c in data["dev_candidates"] if c["id"] == selected)
    y = chosen["ndcg"]["100"]
    ax.annotate(strings["selected"], xy=(100, y), xytext=(84, y - 0.0021),
                color=ACCENT, fontsize=6.2, ha="right",
                arrowprops=dict(arrowstyle="->", lw=0.7, color=ACCENT))
    ax.set_xticks(ks)
    ax.set_xlim(15, 105)
    ax.set_ylim(0, 0.031)
    ax.set_xlabel(strings["cutoff"])
    ax.set_ylabel(strings["ndcg"])
    ax.grid(axis="y", color=GRID, lw=0.6)
    ax.spines[["top", "right"]].set_visible(False)
    ax.legend(loc="upper left", frameon=False, ncol=2, columnspacing=0.8,
              handlelength=2.1, borderaxespad=0.2)


def frozen_test_panel(ax: plt.Axes, data: dict[str, Any], strings: dict[str, Any]) -> None:
    panel_title(ax, "c", strings["c_title"])
    ks = data["protocol"]["ks"]
    exact = [data["test"]["exact_retrieval"][str(k)] for k in ks]
    means = [data["test"]["din_reranking_summary"][str(k)]["mean"] for k in ks]

    ax.plot(ks, exact, color=INK, lw=1.2, marker="s", ms=4.0, markerfacecolor="white",
            label=strings["exact"], zorder=4)
    for idx, seed in enumerate(data["protocol"]["seeds"]):
        values = [data["test"]["din_reranking_per_seed"][str(seed)][str(k)] for k in ks]
        ax.plot(ks, values, color=ACCENT_LIGHT, lw=0.65, marker="o", ms=2.4,
                label=strings["din_seed"] if idx == 0 else None, zorder=2)
    ax.plot(ks, means, color=ACCENT, lw=1.8, marker="o", ms=4.5,
            label=strings["din_mean"], zorder=5)

    for k, base, mean in zip(ks, exact, means):
        delta = mean - base
        x = 21.5 if k == 20 else k
        align = "left" if k == 20 else "center"
        ax.text(x, (base + mean) / 2, rf"$\Delta$={delta:.4f}", fontsize=6.0, color=ACCENT,
                ha=align, va="center", bbox=dict(facecolor="white", edgecolor="none", pad=0.8))

    ax.set_xticks(ks)
    ax.set_xlim(15, 105)
    ax.set_ylim(0.009, 0.026)
    ax.set_xlabel(strings["cutoff"])
    ax.set_ylabel(strings["ndcg"])
    ax.grid(axis="y", color=GRID, lw=0.6)
    ax.spines[["top", "right"]].set_visible(False)
    ax.legend(loc="upper left", frameon=False, ncol=1, borderaxespad=0.2)


def paired_evidence_panel(ax: plt.Axes, data: dict[str, Any], strings: dict[str, Any]) -> None:
    panel_title(ax, "d", strings["d_title"])
    record = data["test"]["paired_ndcg"]["100"]
    ci = record["confidence_interval"]
    mean = ci["mean_difference"]
    low = ci["lower_bound"]
    high = ci["upper_bound"]

    ax.axvline(0, color=INK, lw=0.8, zorder=1)
    ax.errorbar(mean, 0.76, xerr=[[mean - low], [high - mean]], fmt="o", ms=5.0,
                color=ACCENT, ecolor=ACCENT, elinewidth=1.5, capsize=3, zorder=5)
    ax.text(mean, 0.91, f"{mean:.5f}  [{low:.5f}, {high:.5f}]", color=ACCENT,
            fontsize=6.6, ha="center", weight=EMPHASIS_WEIGHT)
    ax.text(-0.00005, 0.64, strings["ci_label"], color=MUTED, fontsize=6.1, ha="left")
    ax.text(-0.00005, 0.53, strings["descriptive"], fontsize=5.7, color=MUTED)

    total = record["query_count"]
    segments = [
        (strings["win"], record["wins"], ACCENT, None),
        (strings["tie"], record["ties"], LIGHT, ".."),
        (strings["loss"], record["losses"], LOSS, "////"),
    ]
    outcomes = ax.inset_axes([0.02, 0.06, 0.96, 0.27])
    outcomes.set_facecolor("white")
    outcomes.patch.set_alpha(1)
    outcomes.set_xlim(0, 1)
    outcomes.set_ylim(0, 1)
    outcomes.set_axis_off()
    cursor = 0.0
    for label, count, color, hatch in segments:
        width = count / total
        bar = Rectangle((cursor, 0.40), width, 0.28, facecolor=color,
                        edgecolor="white" if hatch is None else LOSS, linewidth=0.45,
                        hatch=hatch)
        outcomes.add_patch(bar)
        if width > 0.08:
            outcomes.text(cursor + width / 2, 0.54, f"{width:.1%}",
                    ha="center", va="center", fontsize=5.8,
                    color=INK if color == LIGHT else "white", linespacing=1.05)
        cursor += width
    outcomes.text(0, 0.90, strings["outcomes"], fontsize=6.1, color=MUTED, ha="left")
    outcomes.text(
        0, 0.08,
        f"{strings['win']} {record['wins']:,} ({record['wins'] / total:.1%})   |   "
        f"{strings['tie']} {record['ties']:,} ({record['ties'] / total:.1%})   |   "
        f"{strings['loss']} {record['losses']:,} ({record['losses'] / total:.1%})",
        fontsize=5.45, color=MUTED, ha="left",
    )

    ax.set_xlim(-0.00015, 0.00325)
    ax.set_ylim(0, 1.02)
    ax.set_yticks([])
    ax.set_xlabel(strings["delta_axis"])
    ax.ticklabel_format(axis="x", style="plain", useOffset=False)
    ax.spines[["top", "right", "left"]].set_visible(False)
    ax.grid(axis="x", color=GRID, lw=0.6, zorder=0)


def render(language: str, output_dir: Path) -> list[Path]:
    font = configure_matplotlib(language)
    strings = TEXT[language]
    data = load_data()

    figure = plt.figure(figsize=(8.0, 5.0), dpi=150)
    grid = figure.add_gridspec(2, 2, width_ratios=[1.05, 1.25], height_ratios=[1, 1],
                              left=0.065, right=0.985, top=0.955, bottom=0.125,
                              wspace=0.27, hspace=0.39)
    protocol_panel(figure.add_subplot(grid[0, 0]), strings)
    dev_selection_panel(figure.add_subplot(grid[0, 1]), data, strings)
    frozen_test_panel(figure.add_subplot(grid[1, 0]), data, strings)
    paired_evidence_panel(figure.add_subplot(grid[1, 1]), data, strings)

    output_dir.mkdir(parents=True, exist_ok=True)
    suffix = "-en" if language == "en" else ""
    stem = output_dir / f"research-recsys-teaser{suffix}"
    png = stem.with_suffix(".png")
    png_2x = output_dir / f"research-recsys-teaser{suffix}-2x.png"
    pdf = stem.with_suffix(".pdf")
    svg = stem.with_suffix(".svg")
    figure.savefig(png, dpi=150)
    figure.savefig(png_2x, dpi=300)
    figure.savefig(pdf, metadata={
        "Title": "Frozen offline recommendation protocol and paired evaluation",
        "Subject": data["scope"],
        "Creator": "scripts/paper_figures/recsys_figure.py",
        "CreationDate": None,
        "ModDate": None,
    })
    figure.savefig(svg, metadata={
        "Title": "Frozen offline recommendation protocol and paired evaluation",
        "Description": data["scope"],
        "Creator": "scripts/paper_figures/recsys_figure.py",
        "Date": None,
    })
    plt.close(figure)

    svg_text = svg.read_text(encoding="utf-8")
    svg_text = re.sub(r'width="[^"]+" height="[^"]+"', 'width="1200" height="750"', svg_text, count=1)
    font_name = font.get_name()
    fallback = (
        f"'{font_name}', 'PingFang SC', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif"
        if language == "zh"
        else f"'{font_name}', 'Arial', 'Helvetica', sans-serif"
    )
    svg_text = svg_text.replace(f"'{font_name}'", fallback)
    svg_text = "\n".join(line.rstrip() for line in svg_text.splitlines()) + "\n"
    svg.write_text(svg_text, encoding="utf-8")
    return [svg, pdf, png, png_2x]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--language", choices=("zh", "en", "all"), default="all")
    parser.add_argument("--output-dir", type=Path, default=OUTPUT_DIR)
    args = parser.parse_args()
    languages = ("zh", "en") if args.language == "all" else (args.language,)
    for language in languages:
        outputs = render(language, args.output_dir)
        for output in outputs:
            try:
                print(output.relative_to(REPO_ROOT))
            except ValueError:
                print(output)


if __name__ == "__main__":
    main()
