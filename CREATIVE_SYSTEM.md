# XIAOYUE Creative System

版本：0.3 / 2026-08-23  
定位：一个能够同时容纳 Products、Systems、Models、个人档案与研究过程的长期视觉与叙事系统。

## 1. North Star

**XIAOYUE is a living index of things made, tested, and learned.**

中文语义：小悦的数字世界不是一份简历，而是一套仍在生长的索引。它保存作品，也保存作品如何形成；保存结论，也保存实验边界。

审美北极星：**Soft Archive × Playful Interaction × Apple-level Polish × Serious AI Work**。

翻译为体验：看起来是小悦自己的数字收藏室；摸起来像真实物件一样好玩；动起来精致、克制、有物理连续性；点进去以后，作品和证据负责证明技术实力。严肃来自内容，不来自尖角、巨型英文或研究出版物姿态。

默认品牌行：

```text
小悦
XIAOYUE

PRODUCTS
SYSTEMS
MODELS
```

`®` 是视觉语气，不代表法律上的注册声明。若无真实注册，应改成 `XIAOYUE /` 或 `XIAOYUE INDEX`，避免误导。

## 2. 三个世界，一个身份

### WORLD A — ARCHIVE

负责“我是谁、我如何生长”。

- 内容：Home identity、About、Notes、Garden、Reading、Sketchbook、Personal experiments。
- 情绪：warm、tactile、soft、playful、personal；不是尖锐 Editorial。
- 材料：rounded paper、index tabs、transparent sleeves、photographs、annotations、botanical fragments。
- 构图：叠纸、层级遮挡、非对称、明显留白；对象可被拖动、重排、展开和点击进入。
- Signature Interaction：用户看到散落档案就应本能地拖动和打开；不依赖说明文字才能理解玩法。
- 禁止：建筑事务所式硬网格、儿童贴纸墙、同款胶囊卡片矩阵、每处都有花、占据主视觉的操作说明。

### WORLD B — WORK

负责“作品自己证明能力”。

- 内容：Product、Agent、AI application、generative media、interactive demo、case study。
- 情绪：focused、polished、confident、media-led，但仍保留小悦的柔和物件 DNA。
- 材料：从 Archive 纸张展开出的真实 UI、屏幕录制、产品输出、系统剖面、关键媒体。
- 构图：一个强视觉中心；项目可拥有独立 Art Direction。
- 叙事：中文负责讲清故事，英文只负责真实技术标签；Problem → Input → System → Process → Output → Evidence。
- 禁止：每个项目都套同一张卡、只有技术栈、没有真实输出、Apple clone。

### WORLD C — LAB

负责“方法、实验和边界”。

- 内容：LLM、Agent、RAG、Model、Training、Evaluation、Benchmark、Paper reproduction、Algorithm。
- 情绪：precise、legible、experimental、honest，但像“小悦的实验桌”而不是黑白学术海报。
- 材料：rounded experiment sheets、trace、terminal、dataset table、plot、Prompt、annotation、failure note。
- 构图：实验材料铺在桌面上；允许轻叠层和少量手写边注，但数据层必须严谨。
- 叙事：Question → Baseline → Method → Run → Metric → Failure → Next experiment。
- 禁止：普通 ML dashboard、无数据的科技线条、用图表形状冒充真实结果。

## 3. 统一身份锚点

三个世界至少共享以下七项中的四项；不得只靠 Logo 统一。

1. **Folio**
   - 格式：`A.01` Archive、`W.01` Work、`L.01` Lab。
   - 用于页码、实验号、作品号、导航状态和转场。

2. **Bloom mark**
   - 一朵由 6 个叶片 / 花瓣构成的小型标记。
   - Archive 可表现为印刷或手绘；Work 为极简切口；Lab 为六节点结构。
   - 一屏最多出现一次显著 Bloom。

3. **Index spine**
   - 桌面为左侧或顶部的稳定细线 / 标尺，移动端为顶部 folio rail。
   - 承载 world、section、year、evidence status。

4. **Editorial captions**
   - 所有媒体有名称、角色、状态和来源。
   - 示例：`OUTPUT 03 / RETRIEVAL EVALUATION / REPOSITORY REPORTED / 2026-08-14`。

5. **Transition phrase**
   - Archive：`OPEN FILE`
   - Work：`ENTER PRODUCT`
   - Lab：`INSPECT RUN`
   - 语言不同，但语法统一为动词 + 对象。

6. **Soft curve**
   - 圆角是基础形状语言，用于纸张、媒体窗口、实验材料和 hover / focus 状态。
   - 圆角表达柔软物件感，不等于把所有内容做成同款胶囊卡片。

7. **Archive signature**
   - `Chloe's Archive` 手写 Signature、叠纸、拖拽与层级遮挡是长期品牌资产。
   - Work 可把纸张展开成产品舞台；Lab 可把纸张转译成实验材料，但不能彻底抹除这套 DNA。

## 4. Typography System

### 4.1 角色而不是单一字体

```text
Modern Sans    — 主界面、中文标题、中文叙事、产品界面
Display Serif  — Notes 文章标题、研究引用、偶发 Editorial Moment
Mono           — folio、参数、trace、证据、实验编号
Handwritten    — Chloe's Archive 品牌签名与极少量边注
```

### 4.2 建议字体栈

原型可使用系统字体；发布版本应选择有稳定 Web 字体文件和许可的组合。

```css
--font-serif: "Newsreader", "Iowan Old Style", "Noto Serif SC", "Songti SC", serif;
--font-sans: "Inter", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
--font-mono: "IBM Plex Mono", "SFMono-Regular", "Cascadia Code", monospace;
--font-signature: "Kaushan Script", cursive;
```

- 正式发布使用 `Kaushan Script Regular 400` 的 Google Fonts 官方 v19 Latin WOFF2，站内自托管，不再依赖系统手写字体栈。
- 授权为 SIL Open Font License 1.1；字体文件旁保留 `OFL.txt` 与 `METADATA.pb`，仓库根目录保留 `THIRD_PARTY_NOTICES.md`。
- `Kaushan Script` 是 Reserved Font Name。当前 WOFF2 未修改；不得在本地 subset、重建或改绘后继续沿用该字体名。
- Canonical wordmark 固定写作 `Chloe’s Archive`（U+2019 弯引号），统一通过 `ChloesArchiveWordmark` 组件使用。
- 这是明确授权的品牌字标实现，不宣称字体归 Chloe 所有。字体只用于英文 Signature；中文界面继续使用现代 Sans。
- 中文界面标题与正文默认柔和现代 Sans，字重避免过黑；Archive 长文或 Notes 标题才可偶发 Serif。
- 不用“宋体高级”作为默认判断，不让巨型宋体统治 Home / Archive / Work / Lab。
- 中英标题可以同一基线混排，不把中文缩成英文的附属翻译。

### 4.3 Type scale

```text
Display XL  clamp(4.5rem, 12vw, 10rem)  / 0.88–0.96
Display L   clamp(3rem, 7vw, 6.5rem)    / 0.94–1.02
Heading M   clamp(2rem, 4vw, 3.75rem)   / 1.02–1.12
Body L      clamp(1.125rem, 1.4vw, 1.35rem) / 1.65–1.85
Body        1rem–1.125rem / 1.7–1.9 for Chinese
Label       0.68rem–0.78rem / 1.25, Mono, letter-spacing 0.08–0.14em
```

## 5. Color System

### Core identity

```text
Ink          #101512  near-black, warmer than pure black
Paper        #F1EBDD  warm archive paper
Paper Cool   #D9DDCF  transparent sleeves / quiet panels
Moss         #244A31  primary archive field
Moss Light   #76906F  living secondary
Bloom        #F06F52  identity accent from GitHub Profile
Bloom Soft   #F4B69F  subtle annotation
Signal Lime  #C9F36A  Lab execution only, never decorative
```

### Usage ratios

- Archive：Moss / Paper 80%，Bloom 5–8%，其他为图像与墨色。
- Work：项目媒体决定主色；Core identity 只出现在 folio、caption 或转场。
- Lab：Ink / Paper Cool 85%，Signal Lime 只标执行状态，Bloom 只标人的注释。
- 不使用蓝紫 AI 渐变作为默认状态。

### Contrast

- 正文与背景至少满足 WCAG AA。
- Signal Lime 不承担大段文字。
- 半透明纸张下仍必须有独立可读底色；不能靠 backdrop blur 保证对比。

## 6. Spacing Philosophy

以 `4px` 为最小单位，但不做平均网格。

```text
4 / 8     micro details
12 / 16   label, control, caption
24 / 32   component interior
48 / 64   chapter rhythm
96 / 128  world transition
160+      cinematic breathing room
```

规则：

- 信息密度来自内容关系，不来自把所有东西缩小。
- 每个高密度区域前后必须有低密度缓冲。
- 叠层最多 3 个主要平面；更多层只允许作为短暂 motion state。
- 中文正文行宽约 28–42 个汉字；研究表格例外。

### Soft shape language

- 基础曲率按对象尺寸分级：小标签 8–12px，纸张与实验材料 18–28px，大型媒体窗口 28–48px。
- 纸张可有不完全一致的曲率、轻微旋转、阴影和遮挡；不要复制一套统一 SaaS Card。
- Hover / focus 表现为轻抬、露出页边、层级前移或边缘发光，不用夸张弹跳。
- 尖角只保留给真实数据表、终端或需要精确对齐的技术区域，并作为局部对比而非全站语言。

## 7. Composition Language

### Archive

- 桌面是可玩的档案场：叠纸 + 可拖动 + 可点击 + 层级遮挡。
- 纸张不是卡片矩阵：使用圆角、页边、装订、透明套、索引耳和边注制造材料差异。
- 同一屏只有一件主档案处于激活状态；被拖动对象自然升到顶层。
- 最多在首次靠近时出现极轻的 `DRAG / OPEN`；Reset 藏在小型 overflow control，不占主视觉。

### Work

- 纸张展开为项目舞台；Hero 媒体占首屏 55–85%，标题不压住关键 UI。
- 中文先说明项目价值，英文只标注真实技术组件。
- 交替使用 full bleed、split proof、sticky media，不重复同一结构超过两章。
- 一项真实输出优先于四张抽象系统图。

### Lab

- 实验材料铺在柔和桌面上，可使用局部对齐线但不让 12 列硬网格统治视觉。
- 数据、方法、结论分层；图表不使用装饰轴。
- Failure cases 与成功指标同等级展示。

## 8. Component Grammar

### 全局组件

- `WorldRail`：world、folio、year、当前 chapter。
- `BloomMark`：身份签名。
- `EvidenceLabel`：`VERIFIED / REPOSITORY REPORTED / PROTOTYPE / WIP`。
- `MediaCaption`：类型、来源、时间、版权 / 生成说明。
- `WorldPortal`：从 Archive 进入 Work / Lab 的过渡对象。

### Archive 组件

- `ArchiveDesk`、`ArchiveSheet`、`IndexTab`、`PhotoSleeve`、`Marginalia`、`ObjectDrawer`、`OverflowReset`。

### Work 组件

- `ProductStage`、`ScreenFilm`、`OutputCompare`、`StickyChapter`、`SystemCutaway`。

### Lab 组件

- `ExperimentDesk`、`ExperimentSheet`、`RunTrace`、`MetricTable`、`FailureNote`、`DatasetCard`、`AblationPlot`。

任何组件只有在真实内容需要它时才出现；组件名不是强制页面模板。

## 9. Motion Language

### 统一物理感

- 进入：内容由“被收纳”变成“可检查”。
- 离开：对象回到其 world 的容器，而非任意淡出。
- 默认 easing：`cubic-bezier(.2,.72,.2,1)`；micro interaction 160–260ms，chapter 500–900ms。
- 所有主要 motion 都必须有 reduced-motion 替代。

### Archive motion

- 拖动纸张时抬升层级、保留抓取偏移、释放时柔和落桌；点击未发生拖动时才打开。
- 抽卡、翻页、展开折页、移动透明片、扫描线短暂经过。
- 不用大段说明代替 affordance；优先通过露出的页边、光标和层级反馈让玩法自解释。
- 视差幅度小于 24px；不做漂浮贴纸。

### Work motion

- media expansion、mask reveal、camera push、UI → output transition、scroll-scrub film。
- Motion 负责解释输入、系统和输出之间的关系。

### Lab motion

- trace 节点按真实顺序激活；指标更新显示 run id 和状态。
- 图线绘制必须对应真实数据，不为装饰循环。

### 禁止

- 全站统一 `fadeIn + translateY`。
- 光标尾迹、粒子、随机磁吸成为主要视觉。
- 自动播放有声视频。

## 10. Evidence & Authenticity Protocol

每个作品或实验声明属于以下一类：

```text
VERIFIED             本次或当前发布流程实际运行并保留产物
REPOSITORY REPORTED  仓库内有报告 / 命令 / 数据，但本次未复跑
PROTOTYPE            可交互原型或视觉重建，不代表生产数据
WIP                  尚未完成或尚未评估
```

任何数字旁至少包含：

- metric 名称与方向；
- dataset / sample；
- run date；
- environment；
- source artifact；
- 是否由本次复跑。

不允许只有“大数字 + 百分号”。

## 11. Media Request Protocol

如果没有真实媒体就无法达到质量门槛，停止该区域的视觉定稿，并输出：

```text
MEDIA REQUEST
Type:
Purpose:
Placement:
Aspect ratio:
Recommended size:
Required source / reference:
Capture or generation method:
Acceptance criteria:
```

优先顺序：

1. 真实产品截图 / 屏幕录制；
2. 真实模型输出 / 数据可视化；
3. Web Motion；
4. Motion Graphics；
5. AI-generated media；
6. 不使用随机 stock 或廉价 gradient 代替缺失证据。

## 12. Video Decision Rule

视频不是默认高级感。

- UI interaction 可重现：优先真实 screen recording。
- 几何 / 数据 / node transition：优先 Web Motion。
- 需要材质、摄影、不可实时生成的镜头：考虑 Motion Graphics 或 AI Video。
- AI Video 需要稳定主体或产品 UI 时，必须先要 reference image / first frame / last frame。
- 所有网页视频提供 poster、mobile fallback、reduced-motion fallback，并遵守性能预算。

详细生产流程由 `xiaoyue-video-director` Skill 负责。

## 13. Responsive System

- 移动端不是桌面叠层的缩小版。
- Archive 由自由摆放转为纵向 index tray；保留轻微重叠但保证触控和阅读。
- Work 取消复杂横向 camera move，保留媒体与章节关系。
- Lab 表格允许横向滚动，但结论、run 状态和 failure 不能被藏在 hover 中。
- 最小触控目标 44 × 44px；焦点状态不可只靠颜色。

## 14. Performance Budget

目标而非虚假保证：

- 首屏关键媒体只加载 1 个。
- 初始视频 poster 优先，视频在进入邻近 viewport 时加载。
- 单个 WebM hero 建议控制在 4–6 MB 内；移动端使用更低码率或静态 fallback。
- 不让 decoration 成为 LCP。
- 避免 fixed full-screen texture 持续重绘。
- 页面 motion 在中端移动设备上保持流畅；复杂效果必须可降级。

## 15. Naming System

```text
XIAOYUE INDEX      全站
ARCHIVE A.01       个人与知识档案
WORK W.01          产品与系统作品
LAB L.01           模型、算法与实验
NOTE N.001         长文 / 学习记录
RUN R.20260823.01  实验或评测运行
OUTPUT O.01        可检查的结果媒体
```

标题写具体对象，不写空洞宣言。例如：

- 好：`A coding agent that can stop, ask, and resume.`
- 好：`10,368 retrieval questions, with the run attached.`
- 差：`Building the future with AI.`

## 16. Quality Gate

每次发布前回答：

1. 删除 XIAOYUE 名字后，Bloom / folio / material / evidence 是否仍可辨认？
2. 页面是否像 Vercel、Framer 或 AI SaaS 模板？若是，继续修改。
3. 作品是否通过真实 UI、输出、trace 或报告证明，而非自我描述？
4. 缺失媒体是否触发了 Media Request，而不是被假素材掩盖？
5. 中文是否具有独立的字重、行距、换行和标点处理？
6. Motion 是否解释关系？关闭 motion 后内容是否仍完整？
7. 桌面与移动端是否都可用？
8. 所有数字是否有证据状态？
9. Archive 的叠纸、拖拽、点击和遮挡是否仍然是首要记忆点，而不是被说明文字取代？
10. 页面是否在用尖角、巨型英文或大宋体模拟高级感？若是，回到柔和物件与中文叙事。
