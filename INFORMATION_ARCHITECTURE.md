# XIAOYUE Information Architecture

版本：0.2 / 2026-08-23

## 1. Principle

首页不是职业标签，也不是 Resume section stack。它首先是小悦可玩的数字收藏室：叠纸、拖拽、点击和遮挡构成入口；真实作品与实验在打开纸张后证明能力。

## 2. Primary map

```text
/
├── /archive
│   ├── /about
│   ├── /notes
│   ├── /garden
│   ├── /reading
│   └── /sketchbook
├── /work
│   └── /work/[slug]
├── /lab
│   └── /lab/[slug]
└── /index
```

`/index` 是无动画、可搜索、面向回访者与可访问性的全量索引。

## 3. Homepage

### First viewport

```text
A.00 / XIAOYUE INDEX / 2026

小悦的数字收藏室
Chloe's Archive

[层叠的 WORK / LAB / NOTES / ABOUT 纸张]
```

- 保留 Archive 材料感、Bloom mark、手写 Signature 和叠纸 Signature Interaction。
- 不出现“你好，我是…”、“热爱 AI”或职业锁定文案。
- 用户应能直接拖动纸张，并在点击而非拖动时打开；无需阅读说明才能理解。
- 中文负责叙事，英文只承担品牌 Signature 或技术标签。

### Selected works

- 只展示 3 个有真实证据的入口。
- 每个入口采用不同结构：Product / System / Model 或 Lab。
- Evidence label 必须可见。

### World portals

- `WORK / Products & Systems`
- `LAB / Models & Experiments`
- `ARCHIVE / Notes & Personal Index`

### Personal trace

- 最近一篇 Note、最近一次 Run、最近更新的 Work。
- 它们证明空间“正在生长”，不显示虚假的 activity stream。

## 4. Archive entrance

- 保留 4–5 个可拖动、可点击、相互遮挡的圆角纸张对象；这是品牌 Signature Interaction，不是装饰。
- 拖动时对象升层，释放后保留位置；点击打开。最多使用轻量 `DRAG / OPEN` 提示。
- Reset 藏入小型 `···` overflow control，不占据主视觉，也不显示教程段落。
- 移除 laptop self-preview。
- `About` 不再列职业标签，表达当前兴趣、学习状态与开放方向。
- Notes / Garden / Sketchbook 可沿用现有内容，后续渐进迁移。

## 5. Work entrance

第一阶段只建立一个入口，不完整重写所有项目。

推荐首个项目：`Enterprise Agentic RAG`。

理由：

- 有公开仓库；
- 有明确系统链路；
- README 提供 dataset、评测设置和报告路径；
- 能同时展示 Product UI、System、Process、Output、Evidence。

入口章节：

```text
W.01 / ENTERPRISE AGENTIC RAG
Repository reported / not rerun here

从 216 份文档到可追溯的回答
混合检索 → 融合 → 重排 → 引用
Dense + BM25 / RRF / CrossEncoder / Citation
```

在获得真实 UI 截图或 screen recording 前，首版只做 evidence-led entrance，不伪造完整产品电影。
叙事中文优先；技术名词和 evidence label 保留英文。项目从一张 Archive 纸张展开为柔和圆角的产品舞台。

## 6. Lab entrance

第一阶段只建立一个 Lab 入口：`Runtime Trace / Agent Evaluation`。

可以从 `MiniClaudeCode` 或 `mini-runtime-agent` 的公开结构中抽取：

```text
L.01 / 小悦的 AGENT RUNTIME 实验桌

Question
Bounded loop
Tool policy
Checkpoint / resume
Trace artifact
Known limitations
```

- 只呈现公开仓库中可以定位的机制。
- 若没有本次运行 trace，标记为 `REPOSITORY REPORTED`。
- 不使用假的实时执行动画。
- 机制、Prompt、结果和失败案例像实验材料铺在桌面上；不做黑白学术海报或普通 dashboard。

## 7. Navigation

桌面：

```text
XIAOYUE INDEX        ARCHIVE  WORK  LAB  NOTES        2026 / INDEXED
```

移动端：

```text
A.00  XIAOYUE                         MENU
```

导航状态通过 folio 和 world 名称表达，不使用传统 Home / About / Skills / Contact。

## 8. URL migration

现有 URL 应先保留，避免破坏 GitHub Pages 链接：

- `/blog` → 未来 `/notes`，先保留兼容入口。
- `/digital-garden` → 未来 `/garden`，先保留兼容入口。
- `/projects` → 未来 `/work`，先保留并增加新入口。
- `/about`、`/sketchbook`、`/friends` 继续存在。

第一阶段新增 `/work` 与 `/lab`，不删除任何现有页面。

## 9. Phase 1 build boundary

本轮只实现：

1. 新首页；
2. Archive entrance；
3. 一个 Work entrance；
4. 一个 Lab entrance；
5. 统一 navigation、evidence labels 和 reduced-motion。

不在本轮实现：

- 所有项目完整 Case Study；
- AI-generated hero video；
- 真实产品 screen recording（素材尚未提供）；
- 全站内容迁移；
- 需要伪造数据才能成立的图表。
