#!/usr/bin/env python3
"""Render the paper-style Agent trajectory-credit figure.

This module is intentionally independent from ``generate-research-figures.py``.
It reads a source-attributed, immutable data extract and performs no experiment.

Outputs (default: ``public/images``):
  - research-agent-teaser.{svg,pdf,png} and 2x PNG (Chinese)
  - research-agent-teaser-en.{svg,pdf,png} and 2x PNG (English)
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from matplotlib import font_manager  # noqa: E402
from matplotlib.lines import Line2D  # noqa: E402
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch  # noqa: E402


SCRIPT_DIR = Path(__file__).resolve().parent
HOMEPAGE_ROOT = SCRIPT_DIR.parents[1]
DEFAULT_DATA = SCRIPT_DIR / "data" / "agent_credit.json"
DEFAULT_OUTPUT = HOMEPAGE_ROOT / "public" / "images"

INK = "#17211F"
MUTED = "#64706D"
RULE = "#CFD7D4"
GRID = "#E8ECEA"
ACCENT = "#146C60"
ACCENT_LIGHT = "#DCEBE7"
BASELINE = "#C15A32"
BLUE = "#3B6F9B"
PAPER = "#FFFFFF"

METHOD_ORDER = [
    "precedence_shapley",
    "position",
    "vanilla_shapley",
    "uniform",
    "cost",
    "leave_one_out",
]
METHOD_LABELS = {
    "precedence_shapley": "Precedence Shapley",
    "position": "Position",
    "vanilla_shapley": "Vanilla Shapley",
    "uniform": "Uniform",
    "cost": "Cost",
    "leave_one_out": "Leave-one-out",
}


def load_data(path: Path) -> dict:
    data = json.loads(path.read_text())
    assert data["schema_version"] == 1
    assert data["case_count"] == 40
    assert len(data["families"]) == 5
    assert set(data["method_aggregate"]) == set(METHOD_ORDER)
    assert data["invalid_coalitions"]["mean_impossible_coalition_rate"] == 0.71875
    assert [row["samples"] for row in data["sampling_convergence"]] == [8, 16, 32, 64, 128, 256, 512]
    case = data["representative_case"]
    assert len(case["actions"]) == 6
    assert len(case["prefix_sequential_reference"]) == 6
    return data


def configure_style(language: str) -> str:
    if language == "zh":
        candidates = [
            os.environ.get("CHART_FONT", ""),
            "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
            "/System/Library/Fonts/PingFang.ttc",
            "/System/Library/Fonts/STHeiti Light.ttc",
            "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        ]
        for candidate in candidates:
            if Path(candidate).is_file():
                font_manager.fontManager.addfont(candidate)
                font_name = font_manager.FontProperties(fname=candidate).get_name()
                plt.rcParams["font.family"] = font_name
                break
        else:
            raise RuntimeError("A CJK font is required to render the Chinese figure")
    else:
        font_name = "DejaVu Sans"
        plt.rcParams["font.family"] = font_name
    plt.rcParams.update(
        {
            "font.size": 7.0,
            "axes.titlesize": 7.6,
            "axes.labelsize": 6.8,
            "axes.edgecolor": RULE,
            "axes.labelcolor": INK,
            "axes.linewidth": 0.7,
            "xtick.color": MUTED,
            "ytick.color": MUTED,
            "xtick.labelsize": 6.2,
            "ytick.labelsize": 6.2,
            "text.color": INK,
            "svg.fonttype": "none",
            "svg.hashsalt": "agent-credit-paper-v1",
            "pdf.fonttype": 42,
            "axes.unicode_minus": False,
        }
    )
    return font_name


def tr(language: str, chinese: str, english: str) -> str:
    return chinese if language == "zh" else english


def panel_title(ax: plt.Axes, letter: str, title: str, subtitle: str = "") -> None:
    ax.text(-0.02, 1.08, f"({letter})", transform=ax.transAxes, fontsize=8.0, weight="bold", va="bottom")
    ax.text(0.07, 1.08, title, transform=ax.transAxes, fontsize=7.6, weight="bold", va="bottom")
    if subtitle:
        ax.text(0.07, 1.015, subtitle, transform=ax.transAxes, fontsize=5.6, color=MUTED, va="bottom")


def draw_dag(ax: plt.Axes, data: dict, language: str) -> None:
    case = data["representative_case"]
    panel_title(
        ax,
        "a",
        tr(language, "声明的六节点前序图", "Declared six-action precedence graph"),
        tr(language, f"代表性协议：{case['case_id']}", f"Representative protocol: {case['case_id']}"),
    )
    ax.set_xlim(-0.7, 5.7)
    ax.set_ylim(-1.0, 1.0)
    ax.axis("off")

    positions = {
        0: (0.0, 0.22),
        1: (1.2, 0.22),
        # Keep the independent action visibly detached from the causal chain,
        # while reserving a separate lower band for the aggregate audit note.
        2: (2.5, -0.38),
        3: (2.5, 0.22),
        4: (3.8, 0.22),
        5: (5.0, 0.22),
    }
    display = {
        "wrong_search": tr(language, "错误检索", "wrong\nsearch"),
        "diagnose": tr(language, "诊断", "diagnose"),
        "noise_0_a": tr(language, "无关动作", "irrelevant\naction"),
        "retry": tr(language, "重试", "retry"),
        "edit": tr(language, "编辑", "edit"),
        "test": tr(language, "测试", "test"),
    }

    for child_text, parents in case["predecessors"].items():
        child = int(child_text)
        for parent in parents:
            start = positions[parent]
            end = positions[child]
            ax.add_patch(
                FancyArrowPatch(
                    (start[0] + 0.38, start[1]),
                    (end[0] - 0.38, end[1]),
                    arrowstyle="-|>",
                    mutation_scale=8,
                    linewidth=1.1,
                    color=INK,
                    shrinkA=2,
                    shrinkB=2,
                )
            )

    for index, action in enumerate(case["actions"]):
        x, y = positions[index]
        independent = index == 2
        box = FancyBboxPatch(
            (x - 0.38, y - 0.18),
            0.76,
            0.36,
            boxstyle="round,pad=0.015,rounding_size=0.025",
            facecolor=PAPER if independent else ACCENT_LIGHT,
            edgecolor=MUTED if independent else ACCENT,
            linestyle="--" if independent else "-",
            linewidth=0.9,
        )
        ax.add_patch(box)
        ax.text(x, y, display[action], ha="center", va="center", fontsize=7.1, color=INK)
        ax.text(x, y + 0.29, f"a{index + 1}", ha="center", fontsize=6.7, color=MUTED)

    rate = 100 * data["invalid_coalitions"]["mean_impossible_coalition_rate"]
    ax.text(
        0.0,
        -0.94,
        f"{rate:.3f}%",
        fontsize=10.5,
        color=BASELINE,
        weight="bold",
        va="bottom",
    )
    ax.text(
        1.85,
        -0.85,
        tr(language, "无约束反事实子集中的\n平均不可能联盟率（40 个案例）", "mean impossible-coalition rate under\nunconstrained counterfactual subsets (40 cases)"),
        fontsize=5.7,
        color=MUTED,
        va="center",
    )


def draw_case_credit(ax: plt.Axes, data: dict, language: str) -> None:
    case = data["representative_case"]
    panel_title(
        ax,
        "b",
        tr(language, "恢复轨迹上的动作信用", "Action credit on a recovery trajectory"),
        tr(language, "声明的前缀参考 vs. 精确 Shapley 变体", "Declared prefix reference vs. exact Shapley variants"),
    )
    actions = [
        tr(language, "错误\n检索", "wrong\nsearch"),
        tr(language, "诊断", "diagnose"),
        tr(language, "无关\n动作", "irrelevant\naction"),
        tr(language, "重试", "retry"),
        tr(language, "编辑", "edit"),
        tr(language, "测试", "test"),
    ]
    x = np.arange(len(actions))
    reference = np.asarray(case["prefix_sequential_reference"])
    vanilla = np.asarray(case["methods"]["vanilla_shapley"]["credit_vector"])
    precedence = np.asarray(case["methods"]["precedence_shapley"]["credit_vector"])

    ax.axhline(0, color=RULE, linewidth=0.8, zorder=0)
    ax.vlines(x, 0, reference, color=INK, linewidth=2.8, alpha=0.30, zorder=1)
    ax.scatter(x, reference, s=18, facecolor=PAPER, edgecolor=INK, linewidth=1.0, marker="o", label=tr(language, "前缀顺序参考", "Prefix sequential reference"), zorder=4)
    ax.plot(x, vanilla, color=BASELINE, linewidth=1.0, linestyle="--", marker="x", markersize=4.2, label=tr(language, "普通 Shapley", "Vanilla Shapley"), zorder=3)
    ax.scatter(x, precedence, s=23, facecolor=ACCENT, edgecolor=PAPER, linewidth=0.6, marker="D", label=tr(language, "前序 Shapley", "Precedence Shapley"), zorder=5)
    ax.set_xticks(x, actions)
    ax.set_ylabel(tr(language, "信用", "Credit"))
    ax.set_ylim(-0.34, 1.14)
    ax.set_yticks([-0.2, 0.0, 0.2, 0.6, 1.0])
    ax.grid(axis="y", color=GRID, linewidth=0.65)
    ax.spines[["top", "right"]].set_visible(False)
    ax.legend(frameon=False, fontsize=5.5, ncol=1, loc="upper left", handlelength=2.2)
    ax.text(
        0.99,
        0.04,
        tr(
            language,
            f"普通：{case['methods']['vanilla_shapley']['evaluations']} 个联盟  |  前序：{case['methods']['precedence_shapley']['linear_extensions']} 个合法次序",
            f"Vanilla: {case['methods']['vanilla_shapley']['evaluations']} coalitions  |  Precedence: {case['methods']['precedence_shapley']['linear_extensions']} valid orders",
        ),
        transform=ax.transAxes,
        ha="right",
        fontsize=5.4,
        color=MUTED,
    )


def draw_method_table(ax: plt.Axes, data: dict, language: str) -> None:
    panel_title(
        ax,
        "c",
        tr(language, "聚合估计器比较", "Aggregate estimator comparison"),
        tr(language, "40 个受控案例，覆盖 5 类协议", "40 controlled cases across five protocol families"),
    )
    ax.axis("off")
    aggregate = data["method_aggregate"]
    column_labels = [
        tr(language, "估计器", "Estimator"),
        tr(language, "相对前缀\n参考 MAE", "MAE to\nprefix ref."),
        tr(language, "|效率\n残差|", "|efficiency\nresid.|"),
        tr(language, "|无关动作\n信用|", "|dummy\ncredit|"),
        tr(language, "Top-1\n匹配", "Top-action\nmatch"),
    ]
    method_labels_zh = {
        "precedence_shapley": "前序\nShapley",
        "position": "位置",
        "vanilla_shapley": "普通\nShapley",
        "uniform": "均匀分配",
        "cost": "成本",
        "leave_one_out": "留一法",
    }
    rows = []
    for method in METHOD_ORDER:
        metrics = aggregate[method]
        rows.append(
            [
                method_labels_zh[method]
                if language == "zh"
                else METHOD_LABELS[method].replace("Precedence ", "Precedence\n").replace("Vanilla ", "Vanilla\n"),
                f"{metrics['mae_to_prefix_sequential_reference']:.4f}",
                f"{metrics['mean_abs_efficiency_residual']:.3f}",
                f"{metrics['mean_abs_dummy_credit']:.3f}",
                f"{100 * metrics['top_action_match_rate']:.1f}%",
            ]
        )
    table = ax.table(
        cellText=rows,
        colLabels=column_labels,
        colLoc="center",
        cellLoc="center",
        colWidths=[0.29, 0.19, 0.18, 0.16, 0.18],
        bbox=[0.0, 0.02, 1.0, 0.88],
    )
    table.auto_set_font_size(False)
    table.set_fontsize(5.0)
    for (row, col), cell in table.get_celld().items():
        cell.set_linewidth(0.55)
        cell.set_edgecolor(RULE)
        if row == 0:
            cell.set_facecolor("#F3F5F4")
            cell.set_text_props(weight="bold", color=INK)
        elif row == 1:
            cell.set_facecolor(ACCENT_LIGHT)
            cell.set_text_props(weight="bold" if col in {0, 1, 4} else "normal", color=INK)
        else:
            cell.set_facecolor(PAPER)
        if col == 0 and row > 0:
            cell._loc = "left"  # Matplotlib table alignment; stable for the exported vector output.
            cell.PAD = 0.04
            cell.get_text().set_ha("left")


def draw_convergence(ax: plt.Axes, data: dict, language: str) -> None:
    panel_title(
        ax,
        "d",
        tr(language, "Monte Carlo 收敛到精确参考", "Convergence to the exact reference"),
        tr(language, "在合法线性扩展上均匀采样；12 个种子的 95% CI", "Uniform samples over valid linear extensions; 95% CI across 12 seeds"),
    )
    rows = data["sampling_convergence"]
    samples = np.asarray([row["samples"] for row in rows])
    mean = np.asarray([row["rmse"]["mean"] for row in rows])
    low = np.asarray([row["rmse"]["ci95_low"] for row in rows])
    high = np.asarray([row["rmse"]["ci95_high"] for row in rows])

    ax.fill_between(samples, low, high, color=ACCENT, alpha=0.17, linewidth=0, label="95% CI")
    ax.plot(samples, mean, color=ACCENT, linewidth=1.6, marker="o", markersize=4.2, markerfacecolor=PAPER, markeredgewidth=1.1, label="Mean RMSE")
    ax.set_xscale("log", base=2)
    ax.set_xticks(samples, [str(value) for value in samples])
    ax.set_xlabel(tr(language, "采样预算", "Sample budget"))
    ax.set_ylabel(tr(language, "相对精确前序参考的 RMSE", "RMSE to exact precedence reference"))
    ax.set_ylim(0, 0.086)
    ax.grid(axis="y", color=GRID, linewidth=0.65)
    ax.spines[["top", "right"]].set_visible(False)
    ax.legend(
        [Line2D([0], [0], color=ACCENT, marker="o", markerfacecolor=PAPER, linewidth=1.3), Line2D([0], [0], color=ACCENT, linewidth=5, alpha=0.17)],
        [tr(language, "平均 RMSE", "Mean RMSE"), "95% CI"],
        frameon=False,
        fontsize=5.6,
        loc="upper right",
    )
    ax.annotate(
        f"{mean[0]:.4f}",
        xy=(samples[0], mean[0]),
        xytext=(11, 8),
        textcoords="offset points",
        fontsize=5.7,
        color=MUTED,
    )
    ax.annotate(
        f"{mean[-1]:.4f}",
        xy=(samples[-1], mean[-1]),
        xytext=(-4, 10),
        textcoords="offset points",
        ha="right",
        fontsize=5.7,
        color=ACCENT,
        weight="bold",
    )


def render(data: dict, output_dir: Path, language: str) -> list[Path]:
    font_name = configure_style(language)
    # 178 mm two-column width with a 1200:750 screen aspect ratio.
    figure = plt.figure(figsize=(7.0, 4.375), facecolor=PAPER)
    grid = figure.add_gridspec(
        2,
        2,
        left=0.065,
        right=0.985,
        top=0.91,
        bottom=0.085,
        width_ratios=[1.0, 1.08],
        height_ratios=[1.0, 1.04],
        hspace=0.52,
        wspace=0.30,
    )
    ax_a = figure.add_subplot(grid[0, 0])
    ax_b = figure.add_subplot(grid[0, 1])
    ax_c = figure.add_subplot(grid[1, 0])
    ax_d = figure.add_subplot(grid[1, 1])

    draw_dag(ax_a, data, language)
    draw_case_credit(ax_b, data, language)
    draw_method_table(ax_c, data, language)
    draw_convergence(ax_d, data, language)

    source = data["source"]

    output_dir.mkdir(parents=True, exist_ok=True)
    suffix = "-en" if language == "en" else ""
    stem = output_dir / f"research-agent-teaser{suffix}"
    metadata_description = f"Reported data from {source['url']}; source keys recorded in {DEFAULT_DATA.relative_to(HOMEPAGE_ROOT)}."
    png = stem.with_suffix(".png")
    png_2x = output_dir / f"research-agent-teaser{suffix}-2x.png"
    paths = [stem.with_suffix(".svg"), stem.with_suffix(".pdf"), png, png_2x]
    figure.savefig(paths[0], facecolor=PAPER, metadata={"Description": metadata_description, "Date": None})
    figure.savefig(
        paths[1],
        facecolor=PAPER,
        metadata={"Title": "Precedence-aware agent trajectory credit", "Subject": metadata_description, "Creator": "Matplotlib", "CreationDate": None, "ModDate": None},
    )
    figure.savefig(png, facecolor=PAPER, dpi=1200 / 7, metadata={"Description": metadata_description})
    figure.savefig(png_2x, facecolor=PAPER, dpi=2400 / 7, metadata={"Description": metadata_description})
    svg_text = paths[0].read_text()
    svg_text = svg_text.replace('width="504pt" height="315pt"', 'width="1200" height="750"', 1)
    fallback = (
        f"'{font_name}', 'PingFang SC', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif"
        if language == "zh"
        else f"'{font_name}', 'Arial', 'Helvetica', sans-serif"
    )
    svg_text = svg_text.replace(f"'{font_name}'", fallback)
    svg_text = "\n".join(line.rstrip() for line in svg_text.splitlines()) + "\n"
    paths[0].write_text(svg_text)
    plt.close(figure)
    return paths


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", type=Path, default=DEFAULT_DATA)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--language", choices=["zh", "en", "both"], default="both")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    data = load_data(args.data)
    languages = ["zh", "en"] if args.language == "both" else [args.language]
    for language in languages:
        paths = render(data, args.output_dir, language)
        for path in paths:
            try:
                print(path.relative_to(HOMEPAGE_ROOT))
            except ValueError:
                print(path)


if __name__ == "__main__":
    main()
