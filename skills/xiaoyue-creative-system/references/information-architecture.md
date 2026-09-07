# XIAOYUE 信息架构

版本：0.3 / 2026-09-07

状态：第 5–9 节保留为 2026-08-23 第一阶段的历史实施快照，不是永久路线图。每次用于生产前必须重新读取当前仓库、路由、已发布项目与用户最新选择；不得机械沿用其中的项目名、年份、导航文案或“第一阶段”范围。

## 1. 核心原则

首页不是职业标签，也不是一层层堆叠的简历章节。它首先是小悦可玩的数字收藏室：叠纸、拖拽、点击和遮挡构成入口；真实作品与实验在打开纸张后证明能力。

## 2. 主要站点地图

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

## 3. 首页

### 首屏

```text
A.00 / XIAOYUE INDEX / 2026

小悦的数字收藏室
Chloe’s Archive

[层叠的 WORK / LAB / NOTES / ABOUT 纸张]
```

- 保留 Archive 材料感、Bloom 标记、手写字标和叠纸标志性交互。
- 不出现“你好，我是…”、“热爱 AI”或职业锁定文案。
- 用户应能直接拖动纸张，并在点击而非拖动时打开；无需阅读说明才能理解。
- 中文负责叙事，英文只承担品牌字标或技术标签。

### 精选作品

- 只展示 3 个有真实证据的入口。
- 每个入口采用不同结构：产品 / 系统 / 模型或 Lab。
- 证据标签必须可见。

### 世界入口

- `WORK / Products & Systems`
- `LAB / Models & Experiments`
- `ARCHIVE / Notes & Personal Index`

### 个人动态痕迹

- 最近一篇 Note、最近一次 Run、最近更新的 Work。
- 它们证明空间“正在生长”，不显示虚假的活动流。

## 4. Archive 入口

- 保留 4–5 个可拖动、可点击、相互遮挡的圆角纸张对象；这是品牌标志性交互，不是装饰。
- 拖动时对象升层，释放后保留位置；点击打开。最多使用轻量 `DRAG / OPEN` 提示。
- 重置功能藏入小型 `···` 溢出菜单，不占据主视觉，也不显示教程段落。
- 移除笔记本电脑自预览。
- `About` 不再列职业标签，表达当前兴趣、学习状态与开放方向。
- Notes / Garden / Sketchbook 可沿用现有内容，后续渐进迁移。

## 5. Work 入口

第一阶段只建立一个入口，不完整重写所有项目。

推荐首个项目：`Enterprise Agentic RAG`。

理由：

- 有公开仓库；
- 有明确系统链路；
- README 提供数据集、评测设置和报告路径；
- 能同时展示产品 UI、系统、过程、输出和证据。

入口章节：

```text
W.01 / ENTERPRISE AGENTIC RAG
REPOSITORY REPORTED / 本次未复跑

从 216 份文档到可追溯的回答
混合检索 → 融合 → 重排 → 引用
Dense + BM25 / RRF / CrossEncoder / Citation
```

在获得真实 UI 截图或屏幕录制前，首版只做以证据为核心的入口，不伪造完整产品电影。
叙事中文优先；技术名词和证据状态枚举保留英文。项目从一张 Archive 纸张展开为柔和圆角的产品舞台。

## 6. Lab 入口

第一阶段只建立一个 Lab 入口：`Runtime Trace / Agent Evaluation`。

可以从 `MiniClaudeCode` 或 `mini-runtime-agent` 的公开结构中抽取：

```text
L.01 / 小悦的 AGENT RUNTIME 实验桌

Question / 研究问题
Bounded loop / 有界循环
Tool policy / 工具策略
Checkpoint / resume / 检查点与恢复
Trace artifact / 追踪产物
Known limitations / 已知局限
```

- 只呈现公开仓库中可以定位的机制。
- 若没有本次运行追踪记录，标记为 `REPOSITORY REPORTED`。
- 不使用假的实时执行动画。
- 机制、Prompt、结果和失败案例像实验材料铺在桌面上；不做黑白学术海报或普通仪表盘。

## 7. 导航

桌面：

```text
XIAOYUE INDEX        ARCHIVE  WORK  LAB  NOTES        2026 / INDEXED
```

移动端：

```text
A.00  XIAOYUE                         MENU
```

导航状态通过档案编号（folio）和世界名称表达，不使用传统的 Home / About / Skills / Contact。

## 8. URL 迁移

现有 URL 应先保留，避免破坏 GitHub Pages 链接：

- `/blog` → 未来 `/notes`，先保留兼容入口。
- `/digital-garden` → 未来 `/garden`，先保留兼容入口。
- `/projects` → 未来 `/work`，先保留并增加新入口。
- `/about`、`/sketchbook`、`/friends` 继续存在。

第一阶段新增 `/work` 与 `/lab`，不删除任何现有页面。

## 9. 第一阶段实施边界

本轮只实现：

1. 新首页；
2. Archive 入口；
3. 一个 Work 入口；
4. 一个 Lab 入口；
5. 统一导航、证据标签和 reduced-motion 降级方案。

不在本轮实现：

- 所有项目的完整案例研究；
- AI 生成的首屏视频；
- 真实产品屏幕录制（素材尚未提供）；
- 全站内容迁移；
- 需要伪造数据才能成立的图表。
