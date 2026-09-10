#!/usr/bin/env python3
"""Render research figures from the committed, source-attributed figure data.

Requires matplotlib. Run from any directory:
    python scripts/generate-research-figures.py

CHART_FONT may point to a CJK-capable font. Output is exactly 1200 × 750 px;
SVG text is embedded as paths so the figures do not require visitor fonts.
CHART_LANGUAGE=zh (default) or en selects labels; English files use an -en suffix.
No experiment is run and no external resource is fetched by this script.
"""

from __future__ import annotations

import json
import os
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib import font_manager, ticker  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "content" / "figure-data.json").read_text())
OUTPUT = ROOT / "public" / "images"
LANGUAGE = os.environ.get("CHART_LANGUAGE", "zh")
if LANGUAGE not in {"zh", "en"}:
    raise ValueError("CHART_LANGUAGE must be zh or en")
INK = "#273331"
MUTED = "#63706D"
TEAL = "#346F65"
GRAY = "#ACB8B4"
GRID = "#E8EDEA"
PAPER = "#FFFFFF"


def configure_font() -> bool:
    """Prefer a known CJK font, falling back to portable English figure labels."""
    candidates = [
        os.environ.get("CHART_FONT", ""),
        "/System/Library/Fonts/STHeiti Light.ttc",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    ]
    for filename in candidates:
        if filename and Path(filename).is_file():
            font_manager.fontManager.addfont(filename)
            font = font_manager.FontProperties(fname=filename)
            plt.rcParams["font.family"] = font.get_name()
            return True
    plt.rcParams["font.family"] = "DejaVu Sans"
    return False


CJK = configure_font()
plt.rcParams.update({
    "font.size": 16,
    "text.color": INK,
    "axes.labelcolor": INK,
    "xtick.color": MUTED,
    "ytick.color": MUTED,
    "axes.unicode_minus": False,
    "svg.fonttype": "path",
    "svg.hashsalt": "li-chenyue-research-figures-v1",
    "savefig.facecolor": PAPER,
})


def label(chinese: str, english: str) -> str:
    return chinese if LANGUAGE == "zh" and CJK else english


def canvas(title: str, subtitle: str, footer: str):
    figure = plt.figure(figsize=(8, 5), dpi=150, facecolor=PAPER)
    figure.text(0.12, 0.923, title, fontsize=22, color=INK, va="center")
    figure.text(0.12, 0.856, subtitle, fontsize=12.2, color=MUTED, va="center")
    figure.text(0.12, 0.052, footer, fontsize=11.2, color=MUTED, va="center")
    return figure


def clean_axes(axes, grid_axis="y"):
    axes.set_facecolor(PAPER)
    axes.spines[["top", "right"]].set_visible(False)
    for edge in ("left", "bottom"):
        axes.spines[edge].set_color("#AFBCB7")
        axes.spines[edge].set_linewidth(0.8)
    axes.tick_params(axis="both", labelsize=15, length=0, pad=10)
    axes.set_axisbelow(True)
    axes.grid(axis=grid_axis, color=GRID, linewidth=0.8)


def save(figure, name: str, source: dict):
    OUTPUT.mkdir(parents=True, exist_ok=True)
    description = f"Source: {source['url']}; commit {source['commit']}. Reported data, not rerun experiments."
    suffix = "-en" if LANGUAGE == "en" else ""
    png = OUTPUT / f"research-{name}{suffix}.png"
    svg = OUTPUT / f"research-{name}{suffix}.svg"
    figure.savefig(png, dpi=150, metadata={"Description": description})
    figure.savefig(svg, metadata={"Description": description, "Date": None})
    # Keep the SVG's natural CSS size aligned with the 1200 × 750 PNG.
    svg.write_text(svg.read_text().replace('width="576pt" height="360pt"', 'width="1200" height="750"', 1))
    plt.close(figure)
    print(f"Generated {png.relative_to(ROOT)} and {svg.relative_to(ROOT)}")


def agent_figure():
    data = DATA["agent"]
    rows = data["rows"]
    assert len({row["seeds"] for row in rows}) == 1
    for row in rows:
        assert row["ci95_low"] <= row["mean"] <= row["ci95_high"]
    figure = canvas(
        label("采样预算与归因估计误差", "Sampling budget and attribution error"),
        label("受控协议 · 12 个种子 · 报告的 95% 区间", "Controlled protocol · 12 seeds · reported 95% interval"),
        label("相对于精确参考的 RMSE；不表示真实编码任务收益", "RMSE against an exact reference; no real-task gain claim"),
    )
    axes = figure.add_axes((0.145, 0.235, 0.805, 0.525))
    clean_axes(axes)
    x = [row["samples"] for row in rows]
    mean = [row["mean"] for row in rows]
    axes.set_xscale("log", base=2)
    axes.fill_between(x, [row["ci95_low"] for row in rows], [row["ci95_high"] for row in rows], color=TEAL, alpha=0.13, linewidth=0)
    axes.plot(x, mean, color=TEAL, linewidth=2.4, marker="o", markersize=6.6, markerfacecolor=PAPER, markeredgewidth=1.8)
    axes.set_xlim(6.8, 600)
    axes.set_ylim(0, 0.09)
    axes.set_xticks([8, 32, 128, 512], ["8", "32", "128", "512"])
    axes.set_yticks([0, 0.02, 0.04, 0.06, 0.08])
    axes.yaxis.set_major_formatter(ticker.FormatStrFormatter("%.02f"))
    axes.set_xlabel(label(r"采样预算（$\log_2$）", r"Sample budget ($\log_2$)"), fontsize=16, labelpad=12)
    axes.text(0, 1.055, "Reference RMSE", transform=axes.transAxes, color=MUTED, fontsize=13)
    axes.annotate(f"{mean[-1]:.4f}", (x[-1], mean[-1]), xytext=(-1, 13), textcoords="offset points", ha="right", fontsize=16, color=TEAL)
    save(figure, "agent", data["source"])


def recsys_figure():
    data = DATA["recsys"]
    values = [data["baseline_mean"], data["candidate_mean"]]
    assert all(0 < value < 0.03 for value in values)
    figure = canvas(
        label("冻结测试集上的排序表现", "Ranking on a frozen test set"),
        label(f"Amazon V3 · {data['user_count']:,} 位测试用户 · 离线协议", f"Amazon V3 · {data['user_count']:,} test users · offline protocol"),
        label("同一候选协议下的均值；不外推线上业务效果", "Means under the same candidate protocol; no online-gain claim"),
    )
    axes = figure.add_axes((0.145, 0.23, 0.805, 0.525))
    clean_axes(axes)
    axes.bar([0, 1], values, color=[GRAY, TEAL], width=0.43, zorder=3)
    axes.set_xlim(-0.6, 1.6)
    axes.set_ylim(0, 0.029)
    axes.set_yticks([0, 0.01, 0.02])
    axes.yaxis.set_major_formatter(ticker.FormatStrFormatter("%.02f"))
    axes.set_xticks([0, 1], ["Exact retrieval", "DIN reranking"], fontsize=16)
    axes.text(0, 1.055, "Test NDCG@100", transform=axes.transAxes, color=MUTED, fontsize=13)
    for index, value in enumerate(values):
        axes.text(index, value + 0.00105, f"{value:.5f}", ha="center", va="bottom", fontsize=19, color=INK if index == 0 else TEAL)
    save(figure, "recsys", data["source"])


def vlm_figure():
    data = DATA["vlm"]
    rows = data["rows"]
    assert len(rows) == 3
    assert data["paired_delta_ci95_low"] < 0 < data["paired_delta_ci95_high"]
    figure = canvas(
        label("数据选择：配对种子比较", "Data selection across paired seeds"),
        "ScienceQA · Qwen2.5-VL-3B · 1K / held-out 256",
        label("三组配对观察；差值的报告区间跨过 0", "Three paired observations; reported difference interval crosses 0"),
    )
    axes = figure.add_axes((0.19, 0.235, 0.76, 0.48))
    clean_axes(axes, grid_axis="x")
    axes.spines["left"].set_visible(False)
    random = [row["random_exact_match"] * 100 for row in rows]
    coincide = [row["coincide_exact_match"] * 100 for row in rows]
    assert all(70 <= point <= 90 for point in random + coincide)
    for y, left, right in zip(range(3), coincide, random):
        axes.plot([left, right], [y, y], color="#CBD4D0", linewidth=2.4, zorder=2)
    axes.scatter(coincide, range(3), s=140, facecolor=PAPER, edgecolor=MUTED, linewidth=1.8, label="COINCIDE", zorder=3)
    axes.scatter(random, range(3), s=150, facecolor=TEAL, edgecolor=PAPER, linewidth=1, label="Random", zorder=4)
    axes.set_ylim(2.5, -0.6)
    axes.set_xlim(70, 90)
    axes.set_xticks([70, 75, 80, 85, 90], ["70", "75", "80", "85", "90"])
    axes.set_yticks(range(3), [str(row["seed"]) for row in rows], fontsize=15)
    axes.set_xlabel(label("Exact match（%）", "Exact match (%)"), fontsize=16, labelpad=12)
    axes.text(-0.015, 1.05, "Seed", transform=axes.transAxes, color=MUTED, fontsize=12, ha="right")
    handles, labels = axes.get_legend_handles_labels()
    figure.legend([handles[1], handles[0]], [labels[1], labels[0]], loc="center", bbox_to_anchor=(0.66, 0.777), ncol=2, frameon=False, fontsize=13.5, handletextpad=0.4, columnspacing=1.2)
    save(figure, "vlm", data["source"])


if __name__ == "__main__":
    agent_figure()
    recsys_figure()
    vlm_figure()
