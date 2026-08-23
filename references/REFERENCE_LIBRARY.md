# XIAOYUE Reference Library

版本：0.2 / 2026-08-23

这不是 moodboard 清单。每条 Reference 都记录使用场景、可吸收原则、禁止复制内容、证据状态和未来素材需求。

## Routing

- 设计 Archive 时优先读 Reference 01、02、03。
- 设计 Work 时优先读 Reference 03、04、05。
- 设计 Lab 时优先读 Reference 03、05、06。
- 需要视频时不要直接复制本文件中的描述；调用 `xiaoyue-video-director` 先完成媒介判断与 Production Brief。

## Reference 01 — GitHub Bloom Identity

文件：[`assets/reference-01-github-profile.png`](assets/reference-01-github-profile.png)  
证据：用户上传原图，2010 × 1652。  
用途：GitHub Profile、Bloom identity、友好的技术分类。

### 吸收

- warm coral / peach / sage palette；
- blooming 作为持续学习与生长的身份隐喻；
- 花瓣、太阳、天气等小型 playful detail；
- Field Guide 分类法；
- 大留白与标签密度的对比。

### 不复制

- 精确花朵 SVG；
- 完整技术 chip wall；
- 纯居中页面；
- 依赖第三方服务的 stats 图片；
- 把当前技术栈固定成长期职业定义。

### 可转译组件

- BloomMark
- FieldGuideIndex
- SeasonalState
- EvidenceChip（只用于证据状态，不用于技能熟练度）

## Reference 02 — Archive World

文件：[`assets/reference-02-archive-world.png`](assets/reference-02-archive-world.png)  
证据：用户上传原图，3298 × 2201。  
用途：Archive identity、首页世界入口、材料与叠层。

### 吸收

- muted moss、near-black desk、warm paper 的材料三角；
- 稳定设备 / 桌面容器与不规则纸张的对照；
- `Chloe's Archive` 手写 signature + mono label + 中文 Sans；Serif 只作偶发时刻；
- 高密度中心与大面积安静空间；
- 圆角大框、圆角纸片、柔和 moss 与手工叠放；
- 叠纸 + 拖动 + 点击 + 遮挡构成玩法本身，是必须保留的 Signature Interaction。

### 不复制

- 精确 laptop frame；
- 相同纸张坐标、尺寸与 logo；
- 每一页都延续同一雾绿背景；
- 用半透明卡片替代真实内容；
- 大量 script 文本。
- 把叠纸变成带长篇教程和显眼 Reset 的工具界面。

### 可转译组件

- ArchiveDesk
- ObjectDrawer
- PhotoSleeve
- IndexTab
- WorldPortal

## Reference 03 — Current Repository Behavior

来源：`hey-Chloe.github.io` 当前源码和本地运行。  
用途：保留真实交互，不把视觉升级变成静态 mockup。

### 吸收

- draggable archive objects；
- local persistence of object layout；
- click-without-drag opens the file；
- grabbed object rises above the stack and settles back with soft physical feedback；
- flower click micro-feedback；
- bilingual labels；
- static export and reduced-motion fallback。

### 不复制

- system handwriting fallbacks；
- repeated laptop self-preview；
- one-style-for-all-worlds；
- generic rounded project grid；
- evidence-free metrics。
- 为了“高级”移除圆角、手写 Signature、花和物件感。

## Reference 04 — Apple Product Presentation

来源类别：Apple 当前产品页与产品发布叙事；本次没有用户上传的指定 Apple 截图。  
用途：Work 的质量标准、媒体尺度、节奏和产品中心。

### 吸收

- 一个 section 只讲一个命题；
- 真实媒体拥有最大面积；
- headline / media / evidence 的强层级；
- sticky chapter、mask reveal、media expansion；
- 指标、条件和脚注共存；
- 短而准确的文案。
- 精致的状态连续性、阻尼、mask 和 media expansion，可与 XIAOYUE 的圆角 Archive 共存。

### 不复制

- Apple 字体、Logo、设备页面模板；
- 精确布局、滚动曲线和摄影构图；
- 所有项目统一黑底产品页；
- 与个人项目内容无关的商业语气。

## Reference 05 — Creative OS / Infinite Canvas

来源类别：用户描述的 AI Creative OS / workflow / spatial UI，以及当前公开的 Infinity Canvas / node workflow 产品。  
用途：Work 中呈现 Agent、Media、Workflow、生成过程。

### 吸收

- Input、Agent、Tool、Media、Output 在同一个空间里可见；
- camera 从整体 pipeline 移动到局部证据；
- 中间产物可以被比较和回溯；
- 连接线表达真实数据流；
- 作品自己演示自己。

### 不复制

- 任一产品的精确 canvas、node、toolbar 或品牌；
- 为了“科技感”制造无意义连线；
- 所有 Case Study 都做成无限画布；
- 无真实 pipeline 时伪造复杂工作流。

### 素材缺口

用户提到 Spectrix，但本次没有对应截图或可确认 URL。需要精确吸收其视觉时，应发出 MEDIA REQUEST，请用户补充原图或链接后再归档。

## Reference 06 — Research / Lab Evidence

来源：当前公开项目的 README、benchmark 描述、trace / evaluation 结构。  
用途：Lab 的信息层级与真实性协议。

### 吸收

- run id、dataset、baseline、method、metric、environment、date；
- execution trace、tool calls、checkpoint、failure cases；
- repository-reported 与本次 verified 明确分开；
- 真实 plot / table 优先于装饰性 dashboard。

### 不复制

- 论文的精确版式；
- 没有数据的 chart；
- 只有成功结果；
- 把 README 声明直接改写成本次实测。

## Reference 07 — GitHub Profile Assets

来源：`hey-Chloe/hey-Chloe` 中的 `bloom.svg`、`sky.svg`、`sky-night.svg`、`garden-footer.svg` 和技术 chips。  
用途：长期身份资产、浅色 / 深色状态、季节感。

### 吸收

- coral `#F4795B` / warm red `#E2542F`；
- green `#7FA36B` 及其夜间变体；
- sky / night 状态；
- 花园 footer 中的生命感和小叙事。

### 不复制

- 把所有 SVG 原样搬到网站；
- 页面主要信息依赖超宽 banner；
- 每种技术都制作一个品牌 chip；
- 让动态天气成为主内容。

## Reference Card Template

后续新增参考必须使用以下字段：

```md
## Reference NN — Name

File / URL:
Evidence:
World:
Purpose:

### Typography
### Color
### Composition
### Spacing
### Texture / Material
### Density
### Motion potential
### Personality
### Information hierarchy

### Absorb
### Do not copy
### XIAOYUE translation
### Missing media / rights notes
```
