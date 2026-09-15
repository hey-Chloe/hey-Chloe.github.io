#!/usr/bin/env python3
"""Render the VLM selection/evaluation figure from source-attributed data.

The script writes Chinese and English publication assets to ``public/images``:

* research-vlm-teaser[ -en].png      (1200 x 750)
* research-vlm-teaser[ -en]-2x.png   (2400 x 1500)
* research-vlm-teaser[ -en].svg      (editable text, 1200 x 750 root)
* research-vlm-teaser[ -en].pdf      (vector, embedded TrueType fonts)

No experiment is run. All displayed values come from ``data/vlm_figure_data.json``;
the only transformations are documented derived counts and proportion-to-percent
conversion.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
from typing import Any

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib import font_manager, ticker  # noqa: E402


ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = Path(__file__).resolve().parent / "data" / "vlm_figure_data.json"
OUTPUT = ROOT / "public" / "images"

INK = "#202522"
MUTED = "#5F6764"
RULE = "#C9CFCC"
GRID = "#E7EAE8"
RANDOM = "#59635F"
COINCIDE = "#1F6B5C"
SHARED = "#B7CEC6"
PAPER = "#FFFFFF"


ZH = {
    "a_title": "训练子集重叠",
    "b_title": "按种子配对",
    "c_title": "配对效应与错误审计",
    "random_only": "仅 Random",
    "shared": "两者共有",
    "coincide_only": "仅 COINCIDE",
    "items": "样本数",
    "overlap_note": "每组预算 1,000；重叠 133（13.3%）",
    "base": "未微调 Base",
    "mean": "均值",
    "exact_match": "Exact Match（%）",
    "random": "Random-1K",
    "coincide": "COINCIDE-1K",
    "paired_delta": "COINCIDE − Random（百分点）",
    "reported_ci": "报告的 95% CI",
    "improved": "改善",
    "harmed": "退化",
    "audit_count": "报告的配对样本数",
    "manual": "人工复核 6 个案例",
    "protocol": "Qwen2.5-VL-3B · ScienceQA · 每组 1K · 留出集 N=256 · 3 个配对种子",
}

EN = {
    "a_title": "Training-set overlap",
    "b_title": "Paired-seed exact match",
    "c_title": "Paired effect and error audit",
    "random_only": "Random only",
    "shared": "Shared",
    "coincide_only": "COINCIDE only",
    "items": "Selected samples",
    "overlap_note": "1,000 per method; overlap 133 (13.3%)",
    "base": "Untuned base",
    "mean": "Mean",
    "exact_match": "Exact match (%)",
    "random": "Random-1K",
    "coincide": "COINCIDE-1K",
    "paired_delta": "COINCIDE − Random (percentage points)",
    "reported_ci": "reported 95% CI",
    "improved": "Improved",
    "harmed": "Harmed",
    "audit_count": "Reported paired-sample count",
    "manual": "6 cases manually reviewed",
    "protocol": "Qwen2.5-VL-3B · ScienceQA · 1K per method · held-out N=256 · 3 paired seeds",
}


def load_data() -> dict[str, Any]:
    data = json.loads(DATA_PATH.read_text())
    protocol = data["protocol"]
    overlap = data["selection_overlap"]
    rows = data["paired_seed_results"]

    assert protocol["selection_budget_per_method"] == 1000
    assert protocol["paired_seeds"] == len(rows) == 3
    assert protocol["evaluation_samples"] == 256
    assert overlap["count"] == 133
    assert abs(overlap["fraction_of_each_budget"] - overlap["count"] / 1000) < 1e-12
    assert data["paired_error_audit"]["improved_samples"] == 20
    assert data["paired_error_audit"]["harmed_samples"] == 35
    assert data["paired_error_audit"]["manual_reviewed_samples"] == 6

    random_mean = sum(row["random_exact_match"] for row in rows) / len(rows)
    coincide_mean = sum(row["coincide_exact_match"] for row in rows) / len(rows)
    assert abs(random_mean - data["method_means"]["random_exact_match"]) < 1e-12
    assert abs(coincide_mean - data["method_means"]["coincide_exact_match"]) < 1e-12
    assert abs(coincide_mean - random_mean - data["paired_delta"]["mean"]) < 1e-12
    return data


def verify_source(snapshot_path: Path, data: dict[str, Any]) -> None:
    raw = snapshot_path.read_bytes()
    observed_sha = hashlib.sha256(raw).hexdigest()
    expected_sha = data["source"]["download_sha256"]
    if observed_sha != expected_sha:
        raise ValueError(f"Snapshot sha256 mismatch: expected {expected_sha}, observed {observed_sha}")

    snapshot = json.loads(raw)
    result = snapshot["research"]["result"]
    direct_pairs = [
        (data["base_exact_match"], result["base_exact_match"], "base_exact_match"),
        (data["protocol"]["evaluation_samples"], result["evaluation_samples"], "evaluation_samples"),
        (data["method_means"]["random_exact_match"], result["random_exact_match_mean"], "random_exact_match_mean"),
        (data["method_means"]["coincide_exact_match"], result["coincide_exact_match_mean"], "coincide_exact_match_mean"),
        (data["paired_delta"]["mean"], result["paired_delta_mean"], "paired_delta_mean"),
        (data["paired_delta"]["ci95_low"], result["paired_delta_ci95_low"], "paired_delta_ci95_low"),
        (data["paired_delta"]["ci95_high"], result["paired_delta_ci95_high"], "paired_delta_ci95_high"),
        (data["selection_overlap"], result["selection_overlap"], "selection_overlap"),
        (data["paired_error_audit"]["improved_samples"], result["improved_samples"], "improved_samples"),
        (data["paired_error_audit"]["harmed_samples"], result["harmed_samples"], "harmed_samples"),
        (data["paired_error_audit"]["manual_reviewed_samples"], result["manual_reviewed_samples"], "manual_reviewed_samples"),
        (data["paired_error_audit"]["source_artifact_path"], snapshot["evidence"]["error_analysis"], "evidence.error_analysis"),
    ]
    for copied, original, key in direct_pairs:
        if copied != original:
            raise ValueError(f"Copied value differs from snapshot for {key}: {copied!r} != {original!r}")

    source_rows = result["paired_seed_results"]
    copied_rows = data["paired_seed_results"]
    if len(source_rows) != len(copied_rows):
        raise ValueError("Paired-seed row count differs from snapshot")
    row_keys = ["seed", "random_exact_match", "coincide_exact_match", "random_loss", "coincide_loss"]
    for index, (copied, original) in enumerate(zip(copied_rows, source_rows)):
        for key in row_keys:
            if copied[key] != original[key]:
                raise ValueError(f"Copied value differs at paired_seed_results[{index}].{key}")
    print(f"Verified copied data against {snapshot_path} ({observed_sha})")


def configure_font(language: str) -> str:
    if language == "en":
        candidates = [
            os.environ.get("CHART_FONT_EN", ""),
            "/System/Library/Fonts/Supplemental/Arial.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        ]
    else:
        candidates = [
            os.environ.get("CHART_FONT", ""),
            "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
            "/System/Library/Fonts/PingFang.ttc",
            "/System/Library/Fonts/STHeiti Light.ttc",
            "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        ]
    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            font_manager.fontManager.addfont(candidate)
            properties = font_manager.FontProperties(fname=candidate)
            plt.rcParams["font.family"] = properties.get_name()
            return properties.get_name()
    if language == "zh":
        raise RuntimeError("A CJK-capable font is required; set CHART_FONT")
    plt.rcParams["font.family"] = "DejaVu Sans"
    return "DejaVu Sans"


def style(language: str) -> str:
    font_name = configure_font(language)
    plt.rcParams.update(
        {
            "font.size": 8.2,
            "font.weight": "regular",
            "text.color": INK,
            "axes.labelcolor": INK,
            "axes.edgecolor": RULE,
            "axes.linewidth": 0.7,
            "xtick.color": MUTED,
            "ytick.color": MUTED,
            "xtick.major.width": 0.65,
            "ytick.major.width": 0.65,
            "axes.unicode_minus": False,
            "svg.fonttype": "none",
            "svg.hashsalt": f"li-chenyue-vlm-paper-figure-{language}-v1",
            "pdf.fonttype": 42,
            "savefig.facecolor": PAPER,
            "hatch.linewidth": 0.45,
        }
    )
    return font_name


def clean_axis(axis, grid_axis: str = "x") -> None:
    axis.set_facecolor(PAPER)
    axis.spines[["top", "right"]].set_visible(False)
    axis.spines[["left", "bottom"]].set_color(RULE)
    axis.spines[["left", "bottom"]].set_linewidth(0.7)
    axis.tick_params(axis="both", labelsize=7.2, length=2.8, width=0.65, color=RULE, pad=3)
    axis.set_axisbelow(True)
    axis.grid(axis=grid_axis, color=GRID, linewidth=0.55)


def panel_title(axis, letter: str, title: str) -> None:
    axis.set_title(f"({letter})  {title}", loc="left", fontsize=9.0, fontweight="bold", pad=9)


def plot_selection(axis, data: dict[str, Any], labels: dict[str, str]) -> None:
    budget = data["protocol"]["selection_budget_per_method"]
    shared = data["selection_overlap"]["count"]
    counts = [budget - shared, shared, budget - shared]
    names = [labels["random_only"], labels["shared"], labels["coincide_only"]]
    colors = [RANDOM, SHARED, COINCIDE]
    hatches = ["", "////", "\\\\"]
    y = [2, 1, 0]
    bars = axis.barh(y, counts, height=0.48, color=colors, edgecolor=INK, linewidth=0.45)
    for bar, hatch, count in zip(bars, hatches, counts):
        bar.set_hatch(hatch)
        axis.text(count + 24, bar.get_y() + bar.get_height() / 2, f"{count:,}", va="center", fontsize=7.4)
    axis.set_yticks(y, names)
    axis.set_xlim(0, 1000)
    axis.xaxis.set_major_locator(ticker.MultipleLocator(500))
    axis.set_xlabel(labels["items"], fontsize=7.6, labelpad=4)
    axis.text(0.0, -0.34, labels["overlap_note"], transform=axis.transAxes, fontsize=7.0, color=MUTED)
    clean_axis(axis)
    panel_title(axis, "a", labels["a_title"])


def plot_paired(axis, data: dict[str, Any], labels: dict[str, str]) -> None:
    rows = data["paired_seed_results"]
    seeds = [str(row["seed"]) for row in rows] + [labels["mean"]]
    y = [3, 2, 1, 0]
    random_values = [100 * row["random_exact_match"] for row in rows]
    coincide_values = [100 * row["coincide_exact_match"] for row in rows]
    random_values.append(100 * data["method_means"]["random_exact_match"])
    coincide_values.append(100 * data["method_means"]["coincide_exact_match"])

    for index in range(4):
        width = 1.25 if index == 3 else 0.9
        axis.plot(
            [coincide_values[index], random_values[index]],
            [y[index], y[index]],
            color="#AEB8B4",
            linewidth=width,
            zorder=1,
        )
    axis.axhline(0.5, color=GRID, linewidth=0.65)
    axis.axvline(100 * data["base_exact_match"], color=MUTED, linestyle=(0, (3, 2)), linewidth=0.8, zorder=0)
    axis.scatter(random_values[:3], y[:3], s=31, marker="o", color=RANDOM, edgecolor="white", linewidth=0.55, zorder=3)
    axis.scatter(coincide_values[:3], y[:3], s=31, marker="D", color=COINCIDE, edgecolor="white", linewidth=0.55, zorder=3)
    axis.scatter(random_values[3], y[3], s=48, marker="o", color=RANDOM, edgecolor=INK, linewidth=0.5, zorder=3)
    axis.scatter(coincide_values[3], y[3], s=48, marker="D", color=COINCIDE, edgecolor=INK, linewidth=0.5, zorder=3)

    for x, yy in zip(random_values[:3], y[:3]):
        axis.annotate(f"{x:.2f}", (x, yy), xytext=(4, 0), textcoords="offset points", va="center", fontsize=6.5, color=RANDOM)
    for x, yy in zip(coincide_values[:3], y[:3]):
        axis.annotate(f"{x:.2f}", (x, yy), xytext=(-4, 0), textcoords="offset points", ha="right", va="center", fontsize=6.5, color=COINCIDE)
    axis.annotate(
        f"{labels['coincide']}  {coincide_values[3]:.2f}",
        (coincide_values[3], y[3]),
        xytext=(-5, 8),
        textcoords="offset points",
        ha="right",
        va="center",
        fontsize=6.3,
        color=COINCIDE,
    )
    axis.annotate(
        f"{labels['random']}  {random_values[3]:.2f}",
        (random_values[3], y[3]),
        xytext=(5, 8),
        textcoords="offset points",
        ha="left",
        va="center",
        fontsize=6.3,
        color=RANDOM,
    )

    axis.text(
        100 * data["base_exact_match"] + 0.18,
        0.58,
        f"{labels['base']}  {100 * data['base_exact_match']:.2f}",
        fontsize=6.5,
        color=MUTED,
        va="bottom",
        rotation=90,
    )
    axis.set_yticks(y, seeds)
    axis.set_xlim(72.5, 86.0)
    axis.xaxis.set_major_locator(ticker.MultipleLocator(5))
    axis.set_xlabel(labels["exact_match"], fontsize=7.6, labelpad=4)
    clean_axis(axis)
    panel_title(axis, "b", labels["b_title"])


def plot_effect_and_audit(figure, container, data: dict[str, Any], labels: dict[str, str]) -> None:
    grid = container.subgridspec(2, 1, height_ratios=[1.05, 1], hspace=0.62)
    effect = figure.add_subplot(grid[0])
    audit = figure.add_subplot(grid[1])

    mean = 100 * data["paired_delta"]["mean"]
    low = 100 * data["paired_delta"]["ci95_low"]
    high = 100 * data["paired_delta"]["ci95_high"]
    effect.axvline(0, color=MUTED, linestyle=(0, (3, 2)), linewidth=0.8)
    effect.errorbar(
        mean,
        0,
        xerr=[[mean - low], [high - mean]],
        fmt="D",
        color=COINCIDE,
        markeredgecolor=INK,
        markeredgewidth=0.45,
        markersize=5.2,
        elinewidth=1.25,
        capsize=3.2,
    )
    effect.set_xlim(-13, 4)
    effect.set_ylim(-0.7, 0.75)
    effect.set_yticks([])
    effect.xaxis.set_major_locator(ticker.MultipleLocator(5))
    effect.set_xlabel(labels["paired_delta"], fontsize=7.2, labelpad=4)
    effect.text(mean, 0.43, f"{mean:.2f}", ha="center", fontsize=7.7, fontweight="bold", color=COINCIDE)
    effect.text(0.0, -0.42, f"{labels['reported_ci']} [{low:.2f}, {high:+.2f}]", transform=effect.transAxes, fontsize=6.7, color=MUTED)
    clean_axis(effect)
    effect.spines["left"].set_visible(False)

    error = data["paired_error_audit"]
    names = [labels["improved"], labels["harmed"]]
    counts = [error["improved_samples"], error["harmed_samples"]]
    y = [1, 0]
    bars = audit.barh(y, counts, height=0.44, color=[COINCIDE, RANDOM], edgecolor=INK, linewidth=0.45)
    for bar, count in zip(bars, counts):
        audit.text(count + 1.0, bar.get_y() + bar.get_height() / 2, str(count), va="center", fontsize=7.2)
    audit.set_yticks(y, names)
    audit.set_xlim(0, 40)
    audit.xaxis.set_major_locator(ticker.MultipleLocator(20))
    audit.set_xlabel(labels["audit_count"], fontsize=7.2, labelpad=4)
    audit.text(0.0, -0.43, labels["manual"], transform=audit.transAxes, fontsize=6.7, color=MUTED)
    clean_axis(audit)
    panel_title(effect, "c", labels["c_title"])


def render(language: str, data: dict[str, Any]) -> None:
    labels = ZH if language == "zh" else EN
    font_name = style(language)
    figure = plt.figure(figsize=(8, 5), dpi=150, facecolor=PAPER)
    outer = figure.add_gridspec(
        1,
        3,
        width_ratios=[0.92, 1.36, 1.08],
        left=0.115,
        right=0.97,
        top=0.855,
        bottom=0.19,
        wspace=0.42,
    )

    selection = figure.add_subplot(outer[0])
    paired = figure.add_subplot(outer[1])
    plot_selection(selection, data, labels)
    plot_paired(paired, data, labels)
    plot_effect_and_audit(figure, outer[2], data, labels)
    figure.text(0.115, 0.945, labels["protocol"], fontsize=7.2, color=MUTED, alpha=0.86, va="center")

    OUTPUT.mkdir(parents=True, exist_ok=True)
    suffix = "-en" if language == "en" else ""
    stem = OUTPUT / f"research-vlm-teaser{suffix}"
    description = (
        f"Source: {data['source']['url']}; commit {data['source']['commit']}. "
        "Reported data; no experiment rerun."
    )
    figure.savefig(stem.with_suffix(".png"), dpi=150, facecolor=PAPER, metadata={"Description": description})
    figure.savefig(OUTPUT / f"research-vlm-teaser{suffix}-2x.png", dpi=300, facecolor=PAPER, metadata={"Description": description})
    figure.savefig(
        stem.with_suffix(".pdf"),
        facecolor=PAPER,
        metadata={"Title": "VLM data-selection evaluation", "Subject": description, "Creator": "Matplotlib", "CreationDate": None, "ModDate": None},
    )
    figure.savefig(stem.with_suffix(".svg"), facecolor=PAPER, metadata={"Description": description, "Date": None})

    svg = stem.with_suffix(".svg")
    svg_text = svg.read_text()
    expected = 'width="576pt" height="360pt"'
    if expected not in svg_text:
        raise RuntimeError(f"Unexpected SVG dimensions in {svg}")
    svg_text = svg_text.replace(expected, 'width="1200" height="750"', 1)
    if language == "zh":
        fallback = f"'{font_name}', 'PingFang SC', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif"
    else:
        fallback = f"'{font_name}', 'Arial', 'Helvetica', sans-serif"
    svg_text = svg_text.replace(f"'{font_name}'", fallback)
    svg.write_text("\n".join(line.rstrip() for line in svg_text.splitlines()) + "\n")
    plt.close(figure)

    for path in [stem.with_suffix(".png"), OUTPUT / f"research-vlm-teaser{suffix}-2x.png", stem.with_suffix(".pdf"), svg]:
        if not path.is_file() or path.stat().st_size < 1000:
            raise RuntimeError(f"Missing or empty output: {path}")
    print(f"Generated VLM paper figure ({language}); data sha256={hashlib.sha256(DATA_PATH.read_bytes()).hexdigest()}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--language", choices=["zh", "en", "all"], default="all")
    parser.add_argument(
        "--verify-source",
        type=Path,
        help="Optional local copy of the committed snapshot; verifies sha256 and every copied value before rendering.",
    )
    args = parser.parse_args()
    data = load_data()
    if args.verify_source:
        verify_source(args.verify_source, data)
    languages = ["zh", "en"] if args.language == "all" else [args.language]
    for language in languages:
        render(language, data)


if __name__ == "__main__":
    main()
