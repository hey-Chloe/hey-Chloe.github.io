#!/usr/bin/env python3
"""Render publication-style research figures from source-attributed data.

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
from matplotlib.lines import Line2D  # noqa: E402
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch  # noqa: E402

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
TEASER_PAPER = "#FCFCFA"
SOFT = "#F1F5F3"


def configure_font() -> bool:
    """Prefer a CJK sans face and keep a portable fallback for English."""
    if LANGUAGE == "en":
        plt.rcParams["font.family"] = "DejaVu Sans"
        return False
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
            return True
    plt.rcParams["font.family"] = "DejaVu Sans"
    return False


CJK = configure_font()
if LANGUAGE == "zh" and not CJK:
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
        "svg.fonttype": "path",
        "svg.hashsalt": "li-chenyue-research-figures-v2",
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


def save(figure, name: str, source: dict):
    OUTPUT.mkdir(parents=True, exist_ok=True)
    description = f"Source: {source['url']}; commit {source['commit']}. Reported data, not rerun experiments."
    suffix = "-en" if LANGUAGE == "en" else ""
    png = OUTPUT / f"research-{name}{suffix}.png"
    svg = OUTPUT / f"research-{name}{suffix}.svg"
    facecolor = figure.get_facecolor()
    figure.savefig(png, dpi=150, facecolor=facecolor, metadata={"Description": description})
    figure.savefig(svg, facecolor=facecolor, metadata={"Description": description, "Date": None})
    svg_text = svg.read_text()
    original_size = 'width="576pt" height="360pt"'
    if original_size not in svg_text:
        raise RuntimeError(f"Unexpected SVG canvas size for {svg.name}")
    svg_text = svg_text.replace(original_size, 'width="1200" height="750"', 1)
    svg.write_text("\n".join(line.rstrip() for line in svg_text.splitlines()) + "\n")
    plt.close(figure)
    print(f"Generated {png.relative_to(ROOT)} and {svg.relative_to(ROOT)}")


def teaser_canvas(kicker: str, title: str, note: str):
    """Create a visual-abstract canvas for research-list thumbnails."""
    figure = plt.figure(figsize=(8, 5), dpi=150, facecolor=TEASER_PAPER)
    figure.text(0.065, 0.925, kicker, fontsize=8.5, color=ACCENT, weight=EMPHASIS_WEIGHT, va="center")
    figure.text(0.065, 0.865, title, fontsize=17.2, weight=EMPHASIS_WEIGHT, va="center")
    figure.add_artist(Line2D([0.065, 0.95], [0.805, 0.805], transform=figure.transFigure, color=RULE, linewidth=0.65))
    figure.text(0.065, 0.045, note, fontsize=8.5, color=MUTED, va="center")
    return figure


def panel_label(figure, x: float, number: str, text: str):
    figure.text(x, 0.755, number, fontsize=8.2, color=ACCENT, weight=EMPHASIS_WEIGHT, va="center")
    figure.text(x + 0.035, 0.755, text, fontsize=8.2, color=MUTED, weight=EMPHASIS_WEIGHT, va="center")


def divider(figure, x: float):
    figure.add_artist(Line2D([x, x], [0.14, 0.76], transform=figure.transFigure, color=GRID, linewidth=0.8))


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
    patch = FancyBboxPatch(
        (x, y),
        width,
        height,
        boxstyle="round,pad=0.006,rounding_size=0.004",
        transform=figure.transFigure,
        facecolor=fill,
        edgecolor=edge,
        linewidth=1.0 if accent else 0.8,
    )
    figure.add_artist(patch)
    color = SECONDARY if muted else INK
    figure.text(x + width / 2, y + height * (0.60 if subtitle else 0.50), title, fontsize=9.0, color=color, weight=EMPHASIS_WEIGHT, ha="center", va="center")
    if subtitle:
        figure.text(x + width / 2, y + height * 0.28, subtitle, fontsize=7.2, color=MUTED, ha="center", va="center")
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


def agent_teaser():
    data = DATA["agent"]
    rows = data["rows"]
    figure = teaser_canvas(
        label("VISUAL ABSTRACT · AGENT EVALUATION", "VISUAL ABSTRACT · AGENT EVALUATION"),
        label("从依赖轨迹到有效归因", "From dependent traces to valid attribution"),
        label("受控结构协议 · 公开报告数值 · 不代表真实编码任务收益", "Controlled structural protocol · reported values · no real-task gain claim"),
    )
    panel_label(figure, 0.065, "01", label("前序依赖", "DEPENDENCIES"))
    panel_label(figure, 0.385, "02", label("有效顺序归因", "VALID-ORDER ATTRIBUTION"))
    panel_label(figure, 0.725, "03", label("收敛证据", "CONVERGENCE EVIDENCE"))
    divider(figure, 0.355)
    divider(figure, 0.695)

    node_box(figure, 0.075, 0.54, 0.075, 0.085, label("读取", "Read"))
    node_box(figure, 0.19, 0.54, 0.075, 0.085, label("编辑", "Edit"), accent=True)
    node_box(figure, 0.19, 0.35, 0.075, 0.085, label("测试", "Test"))
    flow_arrow(figure, (0.153, 0.582), (0.187, 0.582))
    flow_arrow(figure, (0.228, 0.535), (0.228, 0.44))
    node_box(figure, 0.075, 0.20, 0.19, 0.075, label("仅编辑的 coalition", "Edit-only coalition"), muted=True)
    figure.add_artist(Line2D([0.085, 0.255], [0.21, 0.265], transform=figure.transFigure, color=SECONDARY, linewidth=1.1))
    figure.text(0.075, 0.315, label("声明的 DAG 保留可执行顺序", "Declared DAG preserves\nexecutable order"), fontsize=7.4, color=MUTED, linespacing=1.25)

    node_box(figure, 0.405, 0.56, 0.25, 0.085, label("前序 DAG", "Precedence DAG"), label("合法线性扩展", "valid linear extensions"), accent=True)
    node_box(figure, 0.405, 0.36, 0.112, 0.09, label("精确枚举", "Exact"), label("小规模", "small sets"))
    node_box(figure, 0.543, 0.36, 0.112, 0.09, label("均匀采样", "Uniform"), label("大规模", "larger sets"))
    node_box(figure, 0.455, 0.18, 0.15, 0.08, label("归因向量", "Credit vector"), accent=True)
    flow_arrow(figure, (0.47, 0.555), (0.465, 0.455))
    flow_arrow(figure, (0.59, 0.555), (0.60, 0.455))
    flow_arrow(figure, (0.465, 0.355), (0.50, 0.265))
    flow_arrow(figure, (0.60, 0.355), (0.56, 0.265))

    axes = figure.add_axes((0.735, 0.25, 0.205, 0.38), facecolor=TEASER_PAPER)
    x = [row["samples"] for row in rows]
    mean = [row["mean"] for row in rows]
    axes.plot(x, mean, color=ACCENT, linewidth=1.8, marker="o", markersize=3.8, markerfacecolor=TEASER_PAPER, markeredgewidth=1.0)
    axes.set_xscale("log", base=2)
    axes.set_xlim(7, 590)
    axes.set_ylim(0, 0.072)
    axes.spines[["top", "right"]].set_visible(False)
    axes.spines[["left", "bottom"]].set_color(RULE)
    axes.tick_params(length=0, labelsize=7.2, colors=MUTED)
    axes.set_xticks([8, 512], ["8", "512"])
    axes.set_yticks([0, 0.06], ["0", "0.06"])
    axes.grid(axis="y", color=GRID, linewidth=0.6)
    axes.text(512, mean[-1] + 0.008, "0.0058", ha="right", fontsize=8.2, color=ACCENT, weight=EMPHASIS_WEIGHT)
    figure.text(0.735, 0.18, label("12 个种子 · 均值", "12 seeds · mean"), fontsize=7.6, color=MUTED)
    save(figure, "agent-teaser", data["source"])


def recsys_teaser():
    data = DATA["recsys"]
    interval = data["paired_difference_interval"]
    figure = teaser_canvas(
        label("VISUAL ABSTRACT · RECOMMENDER EVALUATION", "VISUAL ABSTRACT · RECOMMENDER EVALUATION"),
        label("冻结协议下的召回—重排评估", "Retrieval-to-reranking under a frozen protocol"),
        label("公开数据离线实验 · 相同候选协议 · 不外推线上业务效果", "Public-data offline study · same candidate protocol · no online-gain claim"),
    )
    panel_label(figure, 0.065, "01", label("冻结契约", "FROZEN CONTRACT"))
    panel_label(figure, 0.345, "02", label("召回到重排", "RETRIEVAL → RERANKING"))
    panel_label(figure, 0.725, "03", label("配对证据", "PAIRED EVIDENCE"))
    divider(figure, 0.315)
    divider(figure, 0.695)

    for y, title, subtitle in [
        (0.56, label("相同用户", "Same users"), f"N = {data['user_count']:,}"),
        (0.405, label("相同候选集", "Same candidates"), "Exact Top-100"),
        (0.25, label("冻结测试集", "Frozen test"), label("开发集先选型", "dev selection first")),
    ]:
        node_box(figure, 0.075, y, 0.20, 0.09, title, subtitle, accent=y == 0.25)

    node_box(figure, 0.365, 0.55, 0.12, 0.09, label("召回快照", "Retrieval"), "Exact Top-100")
    node_box(figure, 0.535, 0.55, 0.12, 0.09, label("DIN 重排", "DIN reranker"), label("均匀负采样", "uniform negatives"), accent=True)
    node_box(figure, 0.45, 0.30, 0.12, 0.09, label("用户级配对", "Paired users"), label("bootstrap", "bootstrap"))
    flow_arrow(figure, (0.488, 0.595), (0.532, 0.595))
    flow_arrow(figure, (0.595, 0.545), (0.52, 0.395))
    figure.text(0.365, 0.20, label("候选不变，比较排序增益", "Candidates stay fixed; ranking changes"), fontsize=7.7, color=MUTED)

    figure.text(0.735, 0.59, f"{data['baseline_mean']:.5f}", fontsize=14.5, color=MUTED, weight=EMPHASIS_WEIGHT)
    flow_arrow(figure, (0.84, 0.61), (0.875, 0.61))
    figure.text(0.885, 0.59, f"{data['candidate_mean']:.5f}", fontsize=14.5, color=ACCENT, weight=EMPHASIS_WEIGHT)
    figure.text(0.735, 0.535, "Exact", fontsize=7.3, color=MUTED)
    figure.text(0.885, 0.535, "DIN", fontsize=7.3, color=MUTED)
    figure.text(0.735, 0.43, f"Δ  +{interval['mean_difference']:.5f}", fontsize=12.0, color=ACCENT, weight=EMPHASIS_WEIGHT)
    ci_axes = figure.add_axes((0.735, 0.27, 0.205, 0.10), facecolor=TEASER_PAPER)
    estimate = interval["mean_difference"]
    ci_axes.axvline(0, color=SECONDARY, linewidth=0.7, linestyle=(0, (3, 3)))
    ci_axes.errorbar([estimate], [0], xerr=[[estimate - interval["lower_bound"]], [interval["upper_bound"] - estimate]], fmt="o", color=ACCENT, markersize=4.5, capsize=3, linewidth=1.2)
    ci_axes.set_xlim(-0.0002, 0.0031)
    ci_axes.set_ylim(-0.8, 0.8)
    ci_axes.axis("off")
    figure.add_artist(Line2D([0.735, 0.94], [0.32, 0.32], transform=figure.transFigure, color=RULE, linewidth=0.65))
    figure.text(0.735, 0.20, label("95% CI [0.00228, 0.00268]", "95% CI [0.00228, 0.00268]"), fontsize=7.6, color=MUTED)
    figure.text(0.735, 0.155, "Test NDCG@100 ↑", fontsize=7.6, color=MUTED)
    save(figure, "recsys-teaser", data["source"])


def vlm_teaser():
    data = DATA["vlm"]
    rows = data["rows"]
    random = [row["random_exact_match"] * 100 for row in rows]
    coincide = [row["coincide_exact_match"] * 100 for row in rows]
    mean_delta = sum(selected - control for selected, control in zip(coincide, random)) / len(rows)
    figure = teaser_canvas(
        label("VISUAL ABSTRACT · MULTIMODAL DATA SELECTION", "VISUAL ABSTRACT · MULTIMODAL DATA SELECTION"),
        label("同预算、同设置、配对种子", "Same budget, same setup, paired seeds"),
        label("ScienceQA · 公开摘要 · n = 3，置信区间跨零", "ScienceQA · public summary · n = 3; confidence interval crosses zero"),
    )
    panel_label(figure, 0.065, "01", label("配对设计", "PAIRED DESIGN"))
    panel_label(figure, 0.405, "02", label("三组种子", "THREE SEEDS"))
    panel_label(figure, 0.735, "03", label("不确定的负结果", "UNCERTAIN NEGATIVE"))
    divider(figure, 0.375)
    divider(figure, 0.705)

    node_box(figure, 0.085, 0.57, 0.22, 0.085, "ScienceQA · 1K", label("同一训练预算", "same budget"), accent=True)
    node_box(figure, 0.075, 0.37, 0.105, 0.085, "Random", "1K")
    node_box(figure, 0.21, 0.37, 0.115, 0.085, "COINCIDE", "faithful · 1K")
    node_box(figure, 0.095, 0.18, 0.21, 0.09, "Qwen2.5-VL-3B", "LoRA / SFT · held-out 256", accent=True)
    flow_arrow(figure, (0.15, 0.565), (0.13, 0.46))
    flow_arrow(figure, (0.24, 0.565), (0.265, 0.46))
    flow_arrow(figure, (0.13, 0.365), (0.17, 0.275))
    flow_arrow(figure, (0.265, 0.365), (0.235, 0.275))

    paired = figure.add_axes((0.425, 0.22, 0.245, 0.43), facecolor=TEASER_PAPER)
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
    figure.text(0.425, 0.175, label("● Random   ○ COINCIDE", "● Random   ○ COINCIDE"), fontsize=7.6, color=MUTED)
    figure.text(0.548, 0.135, "Exact match (%)", fontsize=7.6, color=MUTED, ha="center")

    figure.text(0.745, 0.60, "COINCIDE − Random", fontsize=8.0, color=MUTED, weight=EMPHASIS_WEIGHT)
    figure.text(0.745, 0.49, f"{mean_delta:.2f} pp", fontsize=18.0, color=ACCENT, weight=EMPHASIS_WEIGHT)
    summary = figure.add_axes((0.745, 0.31, 0.19, 0.10), facecolor=TEASER_PAPER)
    low, high = data["paired_delta_ci95_low"] * 100, data["paired_delta_ci95_high"] * 100
    summary.axvline(0, color=SECONDARY, linewidth=0.8, linestyle=(0, (3, 3)))
    summary.errorbar([mean_delta], [0], xerr=[[mean_delta - low], [high - mean_delta]], fmt="o", color=ACCENT, markersize=4.5, capsize=3, linewidth=1.2)
    summary.set_xlim(-14, 4)
    summary.set_ylim(-0.8, 0.8)
    summary.axis("off")
    figure.add_artist(Line2D([0.745, 0.935], [0.36, 0.36], transform=figure.transFigure, color=RULE, linewidth=0.65))
    figure.text(0.745, 0.255, label("95% CI [−11.68, +2.31] pp", "95% CI [−11.68, +2.31] pp"), fontsize=7.6, color=MUTED)
    figure.text(0.745, 0.19, label("当前未观察到收益 · n = 3", "No observed gain · n = 3"), fontsize=8.3, color=INK, weight=EMPHASIS_WEIGHT)
    save(figure, "vlm-teaser", data["source"])


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
        label("三组配对观察；COINCIDE − Random 的报告 95% 区间跨过 0。", "Three paired observations; reported 95% CI for COINCIDE − Random crosses zero."),
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
