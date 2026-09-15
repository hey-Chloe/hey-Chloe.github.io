#!/usr/bin/env python3
"""Render publication-style research figures from source-attributed data.

Requires matplotlib. Run from any directory:
    python scripts/generate-research-figures.py

CHART_FONT may point to a CJK-capable font. Every figure is exported as a
1200 × 750 screen PNG and editable SVG. Homepage teasers also receive a
2400 × 1500 high-resolution PNG and vector PDF for paper use. SVG text remains
text and carries a cross-platform font fallback.
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
from matplotlib.lines import Line2D  # noqa: E402
from matplotlib.patches import FancyArrowPatch, Rectangle  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "content" / "figure-data.json").read_text())
OUTPUT = ROOT / "public" / "images"
LANGUAGE = os.environ.get("CHART_LANGUAGE", "zh")
if LANGUAGE not in {"zh", "en"}:
    raise ValueError("CHART_LANGUAGE must be zh or en")

INK = "#202826"
MUTED = "#5D6864"
ACCENT = "#246B60"
SECONDARY = "#8C9995"
RULE = "#C8D0CD"
GRID = "#E8ECEA"
PAPER = "#FFFFFF"
TEASER_PAPER = PAPER
SOFT = "#F1F5F3"


def configure_font() -> str:
    """Prefer a CJK sans face and keep a portable fallback for English."""
    if LANGUAGE == "en":
        plt.rcParams["font.family"] = "DejaVu Sans"
        return "DejaVu Sans"
    candidates = [
        os.environ.get("CHART_FONT", ""),
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/STHeiti Light.ttc",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    ]
    for filename in candidates:
        if filename and Path(filename).is_file():
            font_manager.fontManager.addfont(filename)
            font = font_manager.FontProperties(fname=filename)
            plt.rcParams["font.family"] = font.get_name()
            return font.get_name()
    plt.rcParams["font.family"] = "DejaVu Sans"
    return ""


FONT_NAME = configure_font()
CJK = LANGUAGE == "zh" and bool(FONT_NAME)
if LANGUAGE == "zh" and not FONT_NAME:
    raise RuntimeError("A CJK-capable CHART_FONT is required to generate Chinese figures")
EMPHASIS_WEIGHT = "normal" if CJK else "bold"
plt.rcParams.update(
    {
        "font.size": 11.5,
        "font.weight": "regular",
        "text.color": INK,
        "axes.labelcolor": INK,
        "axes.edgecolor": RULE,
        "axes.linewidth": 0.75,
        "xtick.color": MUTED,
        "ytick.color": MUTED,
        "xtick.major.width": 0.7,
        "ytick.major.width": 0.7,
        "axes.unicode_minus": False,
        "svg.fonttype": "none",
        "svg.hashsalt": "li-chenyue-research-figures-v2",
        "pdf.fonttype": 42,
        "savefig.facecolor": PAPER,
    }
)


def label(chinese: str, english: str) -> str:
    return chinese if LANGUAGE == "zh" and CJK else english


def paper_canvas(title: str, protocol: str, note: str):
    """Create a compact figure header and leave the data as the focal point."""
    figure = plt.figure(figsize=(8, 5), dpi=150, facecolor=PAPER)
    figure.text(0.085, 0.93, title, fontsize=15.6, weight=EMPHASIS_WEIGHT, va="center")
    figure.text(0.085, 0.875, protocol, fontsize=9.8, color=MUTED, va="center")
    figure.add_artist(Line2D([0.085, 0.95], [0.84, 0.84], transform=figure.transFigure, color=RULE, linewidth=0.65))
    figure.text(0.085, 0.045, note, fontsize=8.8, color=MUTED, va="center")
    return figure


def clean_axes(axes, grid_axis: str = "y"):
    axes.set_facecolor(PAPER)
    axes.spines[["top", "right"]].set_visible(False)
    axes.spines[["left", "bottom"]].set_color(RULE)
    axes.spines[["left", "bottom"]].set_linewidth(0.75)
    axes.tick_params(axis="both", labelsize=10.2, length=3.2, width=0.7, color=RULE, pad=6)
    axes.set_axisbelow(True)
    axes.grid(axis=grid_axis, color=GRID, linewidth=0.65)


def save(figure, name: str, source: dict, *, paper_assets: bool = False):
    OUTPUT.mkdir(parents=True, exist_ok=True)
    description = f"Source: {source['url']}; commit {source['commit']}. Reported data, not rerun experiments."
    suffix = "-en" if LANGUAGE == "en" else ""
    png = OUTPUT / f"research-{name}{suffix}.png"
    png_2x = OUTPUT / f"research-{name}{suffix}-2x.png"
    svg = OUTPUT / f"research-{name}{suffix}.svg"
    pdf = OUTPUT / f"research-{name}{suffix}.pdf"
    facecolor = figure.get_facecolor()
    figure.savefig(png, dpi=150, facecolor=facecolor, metadata={"Description": description})
    figure.savefig(svg, facecolor=facecolor, metadata={"Description": description, "Date": None})
    if paper_assets:
        figure.savefig(png_2x, dpi=300, facecolor=facecolor, metadata={"Description": description})
        figure.savefig(
            pdf,
            facecolor=facecolor,
            metadata={
                "Title": name,
                "Subject": description,
                "Creator": "Matplotlib",
                "CreationDate": None,
                "ModDate": None,
            },
        )
    svg_text = svg.read_text()
    original_size = 'width="576pt" height="360pt"'
    if original_size not in svg_text:
        raise RuntimeError(f"Unexpected SVG canvas size for {svg.name}")
    svg_text = svg_text.replace(original_size, 'width="1200" height="750"', 1)
    if LANGUAGE == "zh":
        fallback = f"'{FONT_NAME}', 'PingFang SC', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif"
    else:
        fallback = "'DejaVu Sans', 'Arial', 'Helvetica', sans-serif"
    svg_text = svg_text.replace(f"'{FONT_NAME}'", fallback)
    svg.write_text("\n".join(line.rstrip() for line in svg_text.splitlines()) + "\n")
    plt.close(figure)
    generated = [png, svg]
    if paper_assets:
        generated.extend([png_2x, pdf])
    print("Generated " + ", ".join(str(path.relative_to(ROOT)) for path in generated))


def teaser_canvas(title: str, protocol: str, note: str):
    """Create a compact three-panel canvas in a paper-figure visual grammar."""
    figure = plt.figure(figsize=(8, 5), dpi=150, facecolor=TEASER_PAPER)
    if LANGUAGE == "en":
        figure.text(0.06, 0.945, title, fontsize=12.0, weight=EMPHASIS_WEIGHT, va="center")
        figure.text(0.06, 0.89, protocol, fontsize=7.2, color=MUTED, va="center")
        rule_y = 0.85
    else:
        figure.text(0.06, 0.935, title, fontsize=13.2, weight=EMPHASIS_WEIGHT, va="center")
        figure.text(0.94, 0.935, protocol, fontsize=7.6, color=MUTED, va="center", ha="right")
        rule_y = 0.885
    figure.add_artist(Line2D([0.06, 0.94], [rule_y, rule_y], transform=figure.transFigure, color=RULE, linewidth=0.65))
    figure.text(0.06, 0.045, note, fontsize=7.8, color=MUTED, va="center")
    return figure


def panel_label(figure, x: float, letter: str, text: str):
    y = 0.805 if LANGUAGE == "en" else 0.835
    figure.text(x, y, f"({letter})", fontsize=8.4 if LANGUAGE == "en" else 8.8, color=INK, weight=EMPHASIS_WEIGHT, va="center")
    figure.text(x + 0.035, y, text, fontsize=7.4 if LANGUAGE == "en" else 8.4, color=MUTED, weight=EMPHASIS_WEIGHT, va="center", linespacing=1.15)


def divider(figure, x: float):
    top = 0.82 if LANGUAGE == "en" else 0.85
    figure.add_artist(Line2D([x, x], [0.13, top], transform=figure.transFigure, color=GRID, linewidth=0.75))


def node_box(
    figure,
    x: float,
    y: float,
    width: float,
    height: float,
    title: str,
    subtitle: str = "",
    *,
    accent: bool = False,
    muted: bool = False,
):
    edge = ACCENT if accent else RULE
    fill = SOFT if accent else TEASER_PAPER
    if muted:
        edge, fill = GRID, "#F8F9F8"
    patch = Rectangle(
        (x, y),
        width,
        height,
        transform=figure.transFigure,
        facecolor=fill,
        edgecolor=edge,
        linewidth=1.0 if accent else 0.75,
    )
    figure.add_artist(patch)
    color = SECONDARY if muted else INK
    title_size = 7.6 if LANGUAGE == "en" else 9.0
    figure.text(x + width / 2, y + height * (0.60 if subtitle else 0.50), title, fontsize=title_size, color=color, weight=EMPHASIS_WEIGHT, ha="center", va="center")
    if subtitle:
        subtitle_size = 6.4 if LANGUAGE == "en" else 7.2
        figure.text(x + width / 2, y + height * 0.28, subtitle, fontsize=subtitle_size, color=MUTED, ha="center", va="center")
    return patch


def flow_arrow(figure, start: tuple[float, float], end: tuple[float, float], *, muted: bool = False):
    arrow = FancyArrowPatch(
        start,
        end,
        transform=figure.transFigure,
        arrowstyle="-|>",
        mutation_scale=8,
        linewidth=0.9,
        color=RULE if muted else SECONDARY,
        shrinkA=2,
        shrinkB=2,
    )
    figure.add_artist(arrow)


def ranked_list(figure, x: float, y: float, title: str, items: list[str], *, accent: bool = False):
    """Draw a compact schematic ranking without implying item-level reported data."""
    figure.text(x, y + 0.055, title, fontsize=8.2, color=ACCENT if accent else INK, weight=EMPHASIS_WEIGHT)
    for index, item in enumerate(items, start=1):
        row_y = y - (index - 1) * 0.058
        figure.text(x, row_y, str(index), fontsize=6.7, color=MUTED, va="center")
        figure.add_artist(Rectangle((x + 0.022, row_y - 0.019), 0.09, 0.038, transform=figure.transFigure, facecolor=SOFT if accent else PAPER, edgecolor=ACCENT if accent else RULE, linewidth=0.7))
        figure.text(x + 0.067, row_y, item, fontsize=7.2, color=INK, ha="center", va="center")


def agent_teaser():
    data = DATA["agent"]
    rows = data["rows"]
    figure = teaser_canvas(
        label("受控协议下的前序约束归因", "Precedence-constrained attribution under a controlled protocol"),
        label("受控结构协议", "controlled structural protocol"),
        label("声明的依赖图 · 精确参考与均匀 Monte Carlo · 报告的 95% CI", "Declared dependencies · exact reference and uniform Monte Carlo · reported 95% CIs"),
    )
    panel_label(figure, 0.06, "a", label("声明的前序 DAG", "Declared precedence DAG"))
    panel_label(figure, 0.37, "b", label("有序 Shapley 估计", "Ordered-Shapley estimation"))
    panel_label(figure, 0.71, "c", label("RMSE 收敛", "RMSE convergence"))
    divider(figure, 0.34)
    divider(figure, 0.68)

    node_box(figure, 0.075, 0.54, 0.066, 0.078, label("读取", "Read"))
    node_box(figure, 0.174, 0.54, 0.066, 0.078, label("编辑", "Edit"), accent=True)
    node_box(figure, 0.174, 0.33, 0.066, 0.078, label("测试", "Test"))
    flow_arrow(figure, (0.144, 0.579), (0.171, 0.579))
    flow_arrow(figure, (0.207, 0.535), (0.207, 0.413))
    figure.text(0.075, 0.265, label("合法：读取 → 编辑 → 测试", "valid: Read -> Edit -> Test"), fontsize=7.4, color=ACCENT)
    figure.text(0.075, 0.205, label("排除：编辑 → 读取", "excluded: Edit -> Read"), fontsize=7.4, color=MUTED)
    figure.add_artist(Line2D([0.073, 0.245], [0.198, 0.236], transform=figure.transFigure, color=SECONDARY, linewidth=0.8))

    figure.text(0.382, 0.69, r"$\phi_i^P=\mathbb{E}_{\pi\in\mathcal{L}(P)}[v(S_i^\pi\cup\{i\})-v(S_i^\pi)]$", fontsize=9.2, color=INK)
    node_box(figure, 0.395, 0.55, 0.235, 0.072, label("合法线性扩展 L(P)", "Valid linear extensions L(P)"), accent=True)
    node_box(figure, 0.37, 0.39, 0.125, 0.085, label("精确枚举", "Exact reference"), label("参考值", "enumeration"))
    node_box(figure, 0.525, 0.39, 0.13, 0.085, label("均匀采样", "Uniform MC"), label("completion count", "completion-count"))
    node_box(figure, 0.44, 0.22, 0.145, 0.075, label("归因向量", "Credit vector"), accent=True)
    flow_arrow(figure, (0.455, 0.545), (0.44, 0.48))
    flow_arrow(figure, (0.57, 0.545), (0.585, 0.48))
    flow_arrow(figure, (0.438, 0.385), (0.485, 0.30))
    flow_arrow(figure, (0.585, 0.385), (0.54, 0.30))

    axes = figure.add_axes((0.72, 0.26, 0.21, 0.46), facecolor=TEASER_PAPER)
    x = [row["samples"] for row in rows]
    mean = [row["mean"] for row in rows]
    low = [value - row["ci95_low"] for value, row in zip(mean, rows)]
    high = [row["ci95_high"] - value for value, row in zip(mean, rows)]
    axes.errorbar(x, mean, yerr=[low, high], color=ACCENT, ecolor=SECONDARY, linewidth=1.45, elinewidth=0.75, capsize=2.2, marker="o", markersize=3.6, markerfacecolor=TEASER_PAPER, markeredgewidth=0.9)
    axes.set_xscale("log", base=2)
    axes.set_xlim(7, 590)
    axes.set_ylim(0, 0.087)
    axes.spines[["top", "right"]].set_visible(False)
    axes.spines[["left", "bottom"]].set_color(RULE)
    axes.tick_params(length=2.5, width=0.6, labelsize=7.1, colors=MUTED)
    axes.set_xticks([8, 512], ["8", "512"])
    axes.set_yticks([0, 0.04, 0.08], ["0", "0.04", "0.08"])
    axes.grid(axis="y", color=GRID, linewidth=0.6)
    axes.set_xlabel(label("采样预算", "Samples"), fontsize=7.5, labelpad=4)
    axes.set_ylabel("RMSE ↓", fontsize=7.5, labelpad=3)
    axes.text(512, mean[-1] + 0.008, f"{mean[-1]:.4f}", ha="right", fontsize=7.6, color=ACCENT)
    figure.text(0.72, 0.15, f"n = {rows[0]['seeds']} seeds", fontsize=6.9, color=MUTED)
    figure.text(0.72, 0.115, label("点为均值；误差棒为报告的 95% CI", "points: mean · bars: reported 95% CI"), fontsize=6.7, color=MUTED)
    save(figure, "agent-teaser", data["source"], paper_assets=True)


def recsys_teaser():
    data = DATA["recsys"]
    interval = data["paired_difference_interval"]
    figure = teaser_canvas(
        label("冻结协议下的召回—重排评估", "Retrieval-to-reranking under a frozen protocol"),
        f"Amazon V3 · N = {data['user_count']:,}",
        label("开发集选型 → 冻结清单 → 测试集用户级配对估计", "Dev selection → frozen manifest → user-paired test estimate"),
    )
    panel_label(figure, 0.06, "a", label("选择与冻结边界", "Selection / test boundary"))
    panel_label(figure, 0.365, "b", label("相同候选，重排前后", "Same candidates, before / after"))
    panel_label(figure, 0.71, "c", label("用户级配对差值", "User-paired difference"))
    divider(figure, 0.335)
    divider(figure, 0.68)

    node_box(figure, 0.065, 0.55, 0.115, 0.085, label("开发集选型", "Select on dev"), label("DIN + uniform", "DIN + uniform"))
    node_box(figure, 0.198, 0.55, 0.13, 0.085, label("冻结清单", "Frozen manifest"), accent=True)
    flow_arrow(figure, (0.183, 0.592), (0.195, 0.592))
    figure.add_artist(Line2D([0.188, 0.188], [0.21, 0.72], transform=figure.transFigure, color=SECONDARY, linewidth=0.75, linestyle=(0, (3, 3))))
    figure.text(0.075, 0.70, "DEV", fontsize=7.2, color=MUTED)
    figure.text(0.218, 0.70, "TEST", fontsize=7.2, color=ACCENT)
    node_box(figure, 0.205, 0.34, 0.115, 0.085, label("测试估计", "Test estimate"), label("paired users", "paired users"))
    flow_arrow(figure, (0.263, 0.545), (0.263, 0.43))
    figure.text(0.075, 0.24, label("测试统计不参与候选选择", "Test statistics do not select\nthe candidate"), fontsize=7.4, color=MUTED, linespacing=1.3)

    ranked_list(figure, 0.385, 0.60, "Exact Top-100", ["A", "B", "C", "D"])
    ranked_list(figure, 0.545, 0.60, "DIN reranking", ["C", "A", "D", "B"], accent=True)
    flow_arrow(figure, (0.505, 0.49), (0.532, 0.49))
    figure.text(0.517, 0.31, label("示意排序；候选集合固定", "Schematic ranks; candidate set fixed"), fontsize=7.1, color=MUTED, ha="center")
    figure.text(0.517, 0.23, f"NDCG@100  {data['baseline_mean']:.5f} → {data['candidate_mean']:.5f}", fontsize=8.5, color=ACCENT, ha="center", weight=EMPHASIS_WEIGHT)

    ci_axes = figure.add_axes((0.72, 0.31, 0.21, 0.28), facecolor=TEASER_PAPER)
    estimate = interval["mean_difference"]
    ci_axes.axvline(0, color=SECONDARY, linewidth=0.7, linestyle=(0, (3, 3)), zorder=1)
    ci_axes.errorbar([estimate], [0], xerr=[[estimate - interval["lower_bound"]], [interval["upper_bound"] - estimate]], fmt="o", color=ACCENT, markersize=5, capsize=3, linewidth=1.2, zorder=3)
    ci_axes.set_xlim(-0.0002, 0.0031)
    ci_axes.set_ylim(-0.55, 0.55)
    ci_axes.set_xticks([0, 0.0015, 0.003])
    ci_axes.xaxis.set_major_formatter(ticker.FormatStrFormatter("%.4f"))
    ci_axes.set_yticks([0], [label("DIN - Exact", "DIN - Exact")])
    ci_axes.tick_params(axis="both", length=2.5, width=0.6, labelsize=6.8, colors=MUTED)
    ci_axes.spines[["top", "right", "left"]].set_visible(False)
    ci_axes.spines["bottom"].set_color(RULE)
    ci_axes.grid(axis="x", color=GRID, linewidth=0.55)
    figure.text(0.72, 0.21, f"95% CI [{interval['lower_bound']:.5f}, {interval['upper_bound']:.5f}]", fontsize=7.4, color=MUTED)
    figure.text(0.72, 0.16, label(f"N = {data['user_count']:,} 配对用户", f"N = {data['user_count']:,} paired users"), fontsize=6.8, color=MUTED)
    figure.text(0.72, 0.125, label(f"百分位 bootstrap · 单位=用户 · B={interval['bootstrap_samples']:,}", f"percentile bootstrap · unit=user · B={interval['bootstrap_samples']:,}"), fontsize=6.6, color=MUTED)
    save(figure, "recsys-teaser", data["source"], paper_assets=True)


def vlm_teaser():
    data = DATA["vlm"]
    rows = data["rows"]
    random = [row["random_exact_match"] * 100 for row in rows]
    coincide = [row["coincide_exact_match"] * 100 for row in rows]
    mean_delta = sum(selected - control for selected, control in zip(coincide, random)) / len(rows)
    figure = teaser_canvas(
        label("多模态数据选择的配对评估", "Paired evaluation of multimodal data selection"),
        f"ScienceQA · Qwen2.5-VL-3B · 1K · held-out N = {data['evaluation_samples']}",
        label("同一基础检查点与训练配置 · 独立微调 · 配对种子与留出评估", "Shared base checkpoint and config · independent fine-tuning · paired seeds and held-out evaluation"),
    )
    panel_label(figure, 0.06, "a", label("配对实验设计", "Paired design"))
    panel_label(figure, 0.37, "b", label("三个种子的 exact match", "Exact match across three seeds"))
    panel_label(figure, 0.71, "c", label("均值差与不确定性", "Mean difference\nand uncertainty"))
    divider(figure, 0.34)
    divider(figure, 0.68)

    node_box(figure, 0.075, 0.61, 0.235, 0.075, "Qwen2.5-VL-3B", label("共享 base 与 LoRA / SFT 配置", "shared base + LoRA / SFT config"), accent=True)
    node_box(figure, 0.075, 0.42, 0.105, 0.082, "Random-1K", label("独立微调 · seed s", "run · seed s"))
    node_box(figure, 0.205, 0.42, 0.105, 0.082, "COINCIDE-1K", label("独立微调 · seed s", "run · seed s"))
    node_box(figure, 0.095, 0.22, 0.195, 0.085, label("配对留出评估", "Paired held-out evaluation"), f"ScienceQA · N = {data['evaluation_samples']}")
    flow_arrow(figure, (0.13, 0.605), (0.13, 0.507))
    flow_arrow(figure, (0.255, 0.605), (0.255, 0.507))
    flow_arrow(figure, (0.13, 0.415), (0.18, 0.31))
    flow_arrow(figure, (0.255, 0.415), (0.215, 0.31))

    paired = figure.add_axes((0.39, 0.22, 0.255, 0.49), facecolor=TEASER_PAPER)
    for y, selected, control in zip(range(3), coincide, random):
        paired.plot([selected, control], [y, y], color=RULE, linewidth=1.25)
    paired.scatter(coincide, range(3), s=38, facecolor=TEASER_PAPER, edgecolor=SECONDARY, linewidth=1.25, zorder=3)
    paired.scatter(random, range(3), s=38, facecolor=ACCENT, edgecolor=ACCENT, linewidth=1.0, zorder=4)
    paired.set_xlim(74, 85)
    paired.set_ylim(2.55, -0.55)
    paired.set_xticks([75, 80, 85])
    paired.set_yticks(range(3), [str(row["seed"]) for row in rows])
    paired.spines[["top", "right", "left"]].set_visible(False)
    paired.spines["bottom"].set_color(RULE)
    paired.tick_params(axis="both", length=0, labelsize=7.2, colors=MUTED)
    paired.grid(axis="x", color=GRID, linewidth=0.55)
    paired.legend(
        handles=[
            Line2D([], [], marker="o", linestyle="none", markersize=5, markerfacecolor=ACCENT, markeredgecolor=ACCENT, label="Random"),
            Line2D([], [], marker="o", linestyle="none", markersize=5, markerfacecolor=PAPER, markeredgecolor=SECONDARY, label="COINCIDE"),
        ],
        loc="lower center",
        bbox_to_anchor=(0.5, 1.01),
        ncol=2,
        frameon=False,
        fontsize=6.8,
        handletextpad=0.25,
        columnspacing=0.8,
    )
    figure.text(0.518, 0.125, "Exact match (%)", fontsize=7.3, color=MUTED, ha="center")

    figure.text(0.72, 0.64, "COINCIDE - Random", fontsize=7.8, color=MUTED, weight=EMPHASIS_WEIGHT)
    figure.text(0.72, 0.54, f"{mean_delta:.2f} pp", fontsize=16.0, color=ACCENT, weight=EMPHASIS_WEIGHT)
    summary = figure.add_axes((0.72, 0.34, 0.21, 0.12), facecolor=TEASER_PAPER)
    low, high = data["paired_delta_ci95_low"] * 100, data["paired_delta_ci95_high"] * 100
    summary.axvline(0, color=SECONDARY, linewidth=0.8, linestyle=(0, (3, 3)))
    summary.errorbar([mean_delta], [0], xerr=[[mean_delta - low], [high - mean_delta]], fmt="o", color=ACCENT, markersize=4.5, capsize=3, linewidth=1.2)
    summary.set_xlim(-14, 4)
    summary.set_ylim(-0.8, 0.8)
    summary.set_xticks([-12, -6, 0])
    summary.set_yticks([])
    summary.tick_params(axis="x", length=2.5, width=0.6, labelsize=6.8, colors=MUTED)
    summary.spines[["top", "right", "left"]].set_visible(False)
    summary.spines["bottom"].set_color(RULE)
    figure.text(0.72, 0.275, label(f"reported 95% CI [{low:.2f}, {high:+.2f}] pp", f"reported 95% CI [{low:.2f}, {high:+.2f}] pp"), fontsize=7.2, color=MUTED)
    figure.text(0.72, 0.20, label("区间跨过 0 · n = 3", "Interval crosses 0 · n = 3"), fontsize=8.2, color=INK, weight=EMPHASIS_WEIGHT)
    figure.text(0.72, 0.145, label("当前设置未观察到收益", "No gain observed in this setting"), fontsize=7.2, color=MUTED)
    save(figure, "vlm-teaser", data["source"], paper_assets=True)


def agent_figure():
    data = DATA["agent"]
    rows = data["rows"]
    assert len({row["seeds"] for row in rows}) == 1
    for row in rows:
        assert row["ci95_low"] <= row["mean"] <= row["ci95_high"]

    figure = paper_canvas(
        label("采样收敛", "Sampling convergence"),
        label(
            f"相对精确归因的 RMSE · {rows[0]['seeds']} 个随机种子",
            f"RMSE relative to exact attribution · {rows[0]['seeds']} random seeds",
        ),
        label("点为均值，误差棒为报告的 95% 置信区间；受控协议。", "Points show means; error bars show reported 95% CIs; controlled protocol."),
    )
    axes = figure.add_axes((0.13, 0.18, 0.82, 0.60))
    clean_axes(axes)
    x = [row["samples"] for row in rows]
    mean = [row["mean"] for row in rows]
    low = [value - row["ci95_low"] for value, row in zip(mean, rows)]
    high = [row["ci95_high"] - value for value, row in zip(mean, rows)]
    axes.set_xscale("log", base=2)
    axes.errorbar(
        x,
        mean,
        yerr=[low, high],
        color=ACCENT,
        linewidth=1.8,
        marker="o",
        markersize=5.4,
        markerfacecolor=PAPER,
        markeredgewidth=1.35,
        elinewidth=1.0,
        ecolor=SECONDARY,
        capsize=3.2,
        capthick=0.9,
        label=label("均值 ± 95% CI", "Mean ± 95% CI"),
        zorder=3,
    )
    axes.set_xlim(6.8, 600)
    axes.set_ylim(0, 0.086)
    axes.set_xticks([8, 32, 128, 512], ["8", "32", "128", "512"])
    axes.set_yticks([0, 0.02, 0.04, 0.06, 0.08])
    axes.yaxis.set_major_formatter(ticker.FormatStrFormatter("%.02f"))
    axes.set_xlabel(label(r"采样预算（$\log_2$ 刻度）", r"Sampling budget ($\log_2$ scale)"), fontsize=11.5, labelpad=9)
    axes.set_ylabel("RMSE ↓", fontsize=11.5, labelpad=10)
    axes.legend(loc="upper right", frameon=False, fontsize=9.4, handlelength=2.2)
    axes.annotate(
        f"{mean[-1]:.4f}",
        (x[-1], mean[-1]),
        xytext=(-4, 12),
        textcoords="offset points",
        ha="right",
        fontsize=10.2,
        color=ACCENT,
    )
    save(figure, "agent", data["source"])


def recsys_figure():
    data = DATA["recsys"]
    baseline = data["baseline_mean"]
    candidate = data["candidate_mean"]
    interval = data["paired_difference_interval"]
    assert 0 < baseline < candidate < 0.03
    assert interval["lower_bound"] <= interval["mean_difference"] <= interval["upper_bound"]

    figure = paper_canvas(
        label("冻结候选集上的离线重排", "Offline reranking on frozen candidates"),
        label(
            f"Amazon V3 · N = {data['user_count']:,} 用户 · {interval['bootstrap_samples']:,} 次配对 bootstrap",
            f"Amazon V3 · N = {data['user_count']:,} users · {interval['bootstrap_samples']:,} paired bootstrap samples",
        ),
        label("相同候选协议下的报告统计；不外推线上业务效果。", "Reported statistics under one candidate protocol; no online-gain claim."),
    )

    means = figure.add_axes((0.17, 0.22, 0.44, 0.50))
    clean_axes(means, grid_axis="x")
    means.spines["left"].set_visible(False)
    means.scatter([baseline], [1], s=62, facecolor=PAPER, edgecolor=SECONDARY, linewidth=1.5, zorder=3)
    means.scatter([candidate], [0], s=62, facecolor=ACCENT, edgecolor=ACCENT, linewidth=1.2, zorder=3)
    means.set_xlim(0.0204, 0.0241)
    means.set_ylim(-0.65, 1.65)
    means.set_xticks([0.021, 0.022, 0.023, 0.024])
    means.xaxis.set_major_formatter(ticker.FormatStrFormatter("%.3f"))
    means.set_yticks([1, 0], ["Exact retrieval", "DIN reranking"])
    means.tick_params(axis="y", length=0, pad=8)
    means.set_xlabel("Test NDCG@100 ↑", fontsize=11.5, labelpad=9)
    means.set_title(label("测试集均值", "Test-set means"), loc="left", fontsize=10.5, pad=11, weight=EMPHASIS_WEIGHT)
    means.annotate(f"{baseline:.5f}", (baseline, 1), xytext=(8, 0), textcoords="offset points", va="center", fontsize=9.5, color=MUTED)
    means.annotate(f"{candidate:.5f}", (candidate, 0), xytext=(-8, 0), textcoords="offset points", va="center", ha="right", fontsize=9.5, color=ACCENT)

    delta = figure.add_axes((0.70, 0.28, 0.25, 0.38))
    clean_axes(delta, grid_axis="x")
    delta.spines["left"].set_visible(False)
    delta.axvline(0, color=SECONDARY, linewidth=0.8, linestyle=(0, (3, 3)), zorder=1)
    estimate = interval["mean_difference"]
    delta.errorbar(
        [estimate],
        [0],
        xerr=[[estimate - interval["lower_bound"]], [interval["upper_bound"] - estimate]],
        fmt="o",
        color=ACCENT,
        markerfacecolor=ACCENT,
        markersize=6,
        elinewidth=1.3,
        capsize=4,
        capthick=1.0,
        zorder=3,
    )
    delta.set_xlim(-0.0002, 0.00315)
    delta.set_ylim(-0.8, 0.8)
    delta.set_xticks([0, 0.0015, 0.0030])
    delta.xaxis.set_major_formatter(ticker.FormatStrFormatter("%.4f"))
    delta.set_yticks([])
    delta.set_xlabel(label("NDCG 差值", "NDCG difference"), fontsize=10.2, labelpad=9)
    delta.set_title(label("配对差值（95% CI）", "Paired Δ (95% CI)"), loc="left", fontsize=10.5, pad=11, weight=EMPHASIS_WEIGHT)
    delta.text(estimate, 0.35, f"+{estimate:.5f}", ha="center", fontsize=9.5, color=ACCENT)
    save(figure, "recsys", data["source"])


def vlm_figure():
    data = DATA["vlm"]
    rows = data["rows"]
    assert len(rows) == 3
    assert data["paired_delta_ci95_low"] < 0 < data["paired_delta_ci95_high"]
    random = [row["random_exact_match"] * 100 for row in rows]
    coincide = [row["coincide_exact_match"] * 100 for row in rows]
    differences = [selected - control for selected, control in zip(coincide, random)]
    mean_delta = sum(differences) / len(differences)

    figure = paper_canvas(
        label("数据选择的配对种子评估", "Paired-seed evaluation of data selection"),
        f"{data['protocol']} · held-out N = {data['evaluation_samples']}",
        label("三组配对观察；COINCIDE - Random 的报告 95% 区间跨过 0。", "Three paired observations; reported 95% CI for COINCIDE - Random crosses zero."),
    )

    paired = figure.add_axes((0.13, 0.20, 0.52, 0.52))
    clean_axes(paired, grid_axis="x")
    paired.spines["left"].set_visible(False)
    for y, selected, control in zip(range(3), coincide, random):
        paired.plot([selected, control], [y, y], color=RULE, linewidth=1.35, zorder=2)
    paired.scatter(coincide, range(3), s=62, facecolor=PAPER, edgecolor=SECONDARY, linewidth=1.45, label="COINCIDE", zorder=3)
    paired.scatter(random, range(3), s=62, facecolor=ACCENT, edgecolor=ACCENT, linewidth=1.1, label="Random", zorder=4)
    paired.set_ylim(2.55, -0.55)
    paired.set_xlim(74, 85)
    paired.set_xticks([75, 77.5, 80, 82.5, 85])
    paired.xaxis.set_major_formatter(ticker.FormatStrFormatter("%g"))
    paired.set_yticks(range(3), [str(row["seed"]) for row in rows])
    paired.tick_params(axis="y", length=0, pad=8)
    paired.set_xlabel(label("Exact match（%）", "Exact match (%)"), fontsize=11.5, labelpad=9)
    paired.set_title(label("按种子配对", "Paired runs"), loc="left", fontsize=10.5, pad=11, weight=EMPHASIS_WEIGHT)
    handles, legend_labels = paired.get_legend_handles_labels()
    paired.legend(
        [handles[1], handles[0]],
        [legend_labels[1], legend_labels[0]],
        loc="lower center",
        bbox_to_anchor=(0.5, 1.02),
        ncol=2,
        frameon=False,
        fontsize=9.2,
        handletextpad=0.45,
        columnspacing=1.2,
    )

    summary = figure.add_axes((0.74, 0.28, 0.21, 0.38))
    clean_axes(summary, grid_axis="x")
    summary.spines["left"].set_visible(False)
    summary.axvline(0, color=SECONDARY, linewidth=0.8, linestyle=(0, (3, 3)), zorder=1)
    low = data["paired_delta_ci95_low"] * 100
    high = data["paired_delta_ci95_high"] * 100
    summary.errorbar(
        [mean_delta],
        [0],
        xerr=[[mean_delta - low], [high - mean_delta]],
        fmt="o",
        color=ACCENT,
        markerfacecolor=ACCENT,
        markersize=6,
        elinewidth=1.3,
        capsize=4,
        capthick=1.0,
        zorder=3,
    )
    summary.set_xlim(-14, 4)
    summary.set_ylim(-0.8, 0.8)
    summary.set_xticks([-12, -6, 0])
    summary.set_yticks([])
    summary.set_xlabel(label("差值（百分点）", "Difference (pp)"), fontsize=10.2, labelpad=9)
    summary.set_title(label("均值差（95% CI）", "Mean Δ (95% CI)"), loc="left", fontsize=10.5, pad=11, weight=EMPHASIS_WEIGHT)
    summary.text(mean_delta, 0.35, f"{mean_delta:.2f} pp", ha="center", fontsize=9.5, color=ACCENT)
    save(figure, "vlm", data["source"])


if __name__ == "__main__":
    agent_teaser()
    recsys_teaser()
    vlm_teaser()
    agent_figure()
    recsys_figure()
    vlm_figure()
