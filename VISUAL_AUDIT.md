# XIAOYUE Visual Audit

审计日期：2026-08-23  
审计对象：当前个人网站、GitHub Profile、两个仓库、两张随任务上传的截图，以及用户明确描述的 Apple / AI Creative Workflow 参考方向。

## Revision 0.2 — 用户纠偏

第一版实现虽然保留了 Archive 概念，却把真正有辨识度的玩法弱化成了硬质 Editorial 展示，并用说明文字解释交互。这是错误方向。以下结论覆盖本文件中任何相冲突的早期判断：

- **Signature Interaction 是叠纸 + 可拖动 + 可点击 + 层级遮挡。** 它是网站的核心记忆点，不是装饰，也不能被静态网格或说明段落替代。
- **圆角是基础形状语言。** 它属于纸张、容器、媒体窗口、实验材料与 hover / focus 状态；不等于把所有内容做成同款胶囊卡片。
- **首页与 Archive 必须有柔软物件感。** Moss、warm paper、Bloom、小花、手写 `Chloe's Archive`、轻复古和手工叠放都是个人身份资产。
- **中文 Sans 负责界面与叙事。** Mono 负责 Archive / evidence 标签，手写体只负责 Signature；Serif / 宋体仅用于 Notes、引用或极少量 Editorial Moment。
- **中文负责讲故事，英文负责技术标签。** 不使用巨型英文或进口设计工作室语气制造高级感。
- **三个世界的统一方式改变。** Work 是 Archive 纸张展开后的精致产品舞台；Lab 是小悦的实验桌。技术严肃性由真实作品、trace、指标与失败边界证明，而不是由尖角和黑白海报证明。

新的北极星：**Soft Archive × Playful Interaction × Apple-level Polish × Serious AI Work**。

## 0. 证据边界

- 网站仓库快照：`hey-Chloe/hey-Chloe.github.io`，main 分支提交 `d5a2bcc19a31b9c152b5b5c08488ec77a8c021e3`（2026-08-19）。
- Profile 仓库快照：`hey-Chloe/hey-Chloe`，main 分支提交 `50b1563ae65a58e2e90316177e919d199211d4e9`（2026-07-31）。
- 当前站点已在本地以 Next.js 16.2.10 运行；生产构建通过，20 个静态页面成功生成。
- 上传图片共 2 张，均已以原始分辨率检查：
  - Reference 01：2010 × 1652，GitHub Profile 页面截图。
  - Reference 02：3298 × 2201，深绿 Archive 首页视觉截图。
- `Enterprise Agentic RAG` 的 `10,368` 条评测问题和 `97.92%` 文档召回可在该项目 README 中找到对应的生成方式、抽样设置与报告路径；本次没有重新运行该评测，所以只能写成“仓库报告结果”，不能写成“本次实测”。
- 首页中其他具体数字若没有项目内报告、数据或可复现命令，不应继续展示为事实。
- 没有收到 Apple、Creative OS 或 Spectrix 的具体截图。它们在本审计中只作为用户描述的参考类别，而不是被假定为已经逐图审查的素材。

## 1. 当前网站：值得保留

### 1.1 真正有身份的部分

1. **Moss / Paper / Ink 三种材料关系**
   - 深苔绿色不是通用 AI 蓝紫色，已经形成明显的个人领地。
   - 黑色桌面让纸张成为真正的内容层，而不是普通白卡片。
   - 米白、灰绿、半透明雾绿之间存在“旧档案但仍在生长”的情绪。

2. **可拖动并持久化位置的 Archive Objects**
   - 纸张不是装饰图，而是可以抓取、置顶和移动的导航对象。
   - `localStorage` 保存摆放位置，让空间具有“这是我的桌面”的个人性。
   - 这是现有网站最值得继续发展、最不像模板的交互。

3. **花朵点击反馈**
   - 小型 lace-flower bloom 与 GitHub Profile 的 blooming identity 连贯。
   - 动画短、轻、非阻塞，属于可以长期复用的 identity mark。

4. **中英混排的意图**
   - `About Chloe / 关于我`、编号、英文档案标签和中文正文有清晰的编辑潜力。
   - Mono 用于编号和标签，Serif 用于标题，中文字体用于叙事，基本逻辑已经出现。

5. **Archive 作为首页入口**
   - 首页不是传统 Resume Navigation。
   - Blog、Garden、Sketchbook、Projects 被理解为同一个人长期积累的不同档案，而不是五个孤立栏目。

### 1.2 工程上值得保留

- 静态导出，适合 GitHub Pages。
- 内容与页面结构清楚，Next.js App Router 足够承载后续世界切换。
- 已有键盘事件、`prefers-reduced-motion` 和基本响应式处理。
- 项目 Demo 组件说明“让作品自己展示能力”的方向已经出现，不必从零推翻。

## 2. 当前网站：显得普通、廉价或不可信的部分

### P0 — 真实性

1. **作品卡片把“项目存在”和“指标已验证”混在了一起。**
   - 一些项目名称能在公开 GitHub 仓库中对应到真实实现。
   - 但卡片中的所有数字没有统一证据标签，也没有链接到报告、commit、测试或截图。
   - `500 用户样例`、`5,000 Objectives`、Sharpe、收益、最大回撤等在当前站点仓库内没有证据。
   - 处理方式：每个指标必须附 `SOURCE / RUN / DATE / ENV`；否则改成 `Prototype`、`Repository reported` 或移除。

2. **项目 Demo 是视觉模拟，但目前容易被看成真实产品截图。**
   - CSS 终端、聊天窗口、图表的完成度不一致。
   - 它们应明确标为 `SYSTEM DIAGRAM`、`INTERFACE RECONSTRUCTION` 或 `PROTOTYPE VIEW`。

### P1 — 视觉身份

1. **手写 Logo 依赖不稳定的系统字体。**
   - 字体栈包含 `Segoe Script`、`Brush Script MT`、`Comic Sans MS`。
   - 在不同设备上会从精致签名变成廉价手账或卡通字体。
   - Logo 需要独立字标资产或经过许可的稳定字体，不应依赖随机 fallback。

2. **“档案”被简化成纸卡片外观，而不是完整编辑系统。**
   - 过多区域都使用圆角、浅色卡、阴影、轻微旋转。
   - 纸张材料缺少更细的版式差异：表格、索引、边注、折页、透明片、装订、图注和证据标签。
   - 结果容易落入 Pinterest collage template，而非成熟 Archive。

3. **背景质感覆盖一切。**
   - 全局 fog texture、vignette、radial gradient 在所有页面持续存在。
   - 它提供气氛，但让 Archive、Work、Lab 无法真正切换。
   - 背景应该成为 Archive 的材料，不是整个品牌的唯一皮肤。

4. **首页自我预览过于重复。**
   - Archive Desk 后又出现 LaptopPreview，里面再次展示同一个 Archive。
   - 它既不提供新证据，也没有产品叙事功能，拉长页面并稀释第一屏。

5. **Selected Works 仍是统一卡片墙。**
   - 8 个项目被压成相同尺寸、相同结构、相同交互。
   - Work 没有巨幅媒体、项目独立 Art Direction、Product Film 或 scroll storytelling。
   - Lab 也没有 dataset / trace / evaluation / failure cases 的研究表达。

6. **大量内容居中，信息层级依赖字号而非编辑关系。**
   - 顶部 Logo、桌面 Logo、Laptop Logo、Selected Works 标题都在重复争夺中心。
   - 缺少一个稳定的页面 spine、folio、caption 和 evidence rail。

### P2 — 字体与中文

- Georgia / Courier New / KaiTi 在原型中可用，但缺少可控字重、标点挤压、行距、英文数字对齐和跨平台一致性。
- 中文不是被硬塞进去，但目前只有“换成楷体”的层面，尚未建立正文宽度、段落节奏、注释、数据和标题之间的中文排版制度。
- Mono 被过度用于正文说明时显得像开发者模板；它应该只负责实验编号、证据、时间、参数和接口文本。

### P3 — Motion

- 拖动纸张和点击花朵有意义，值得保留。
- 其余 Motion 主要是 hover translate、fade/arrive 和 scale，缺少跨区域的叙事语法。
- Work 需要 camera / mask / media expansion；Lab 需要 trace / execution / evaluation progression；Archive 需要 page / drawer / index unfolding。

### P4 — 体验与性能

- 桌面 Archive Desk 采用绝对定位，移动端通过大量 `!important` 重排，能用但不够稳健。
- 全局 pointer bloom 在每次点击都创建 DOM 节点，当前量级可接受，但需要在复杂 Work/Lab 页中限制。
- `body::before` / `body::after` 的 fixed full-screen texture 对长页面和截图拼接不友好，也增加持续绘制成本。
- GitHub Profile 的外部 streak stats 在上传截图中显示为破图；外部不可控资产不应位于品牌主路径。

## 3. GitHub Profile：值得继承的视觉身份

### 保留

- **Blooming motif**：花朵不是装饰性 emoji，而是“持续学习 / 生长 / 开花”的身份隐喻。
- **Warm coral + green**：暖珊瑚色提供亲近感，绿作为生长与系统感的桥梁。
- **小型手工细节**：飘落花瓣、太阳、天气语句、花园 footer 让 Profile 有“一个人在维护”的感觉。
- **Field Guide taxonomy**：技术不是一堵 logo wall，而是按 LLMs / Agents / Inference / Data / Ops 组织的认知地图。
- **可随时间变化的场景**：sky / night / garden 暗示品牌可以有状态和时间感。

### 不保留或降级

- 技术 chip 太多时会把身份重新锁成“技能清单”。首页只保留少数与作品证据相连的能力标签。
- 全部居中会让长内容缺少阅读节奏。
- 外部 stats 图片是脆弱依赖；如果不能稳定生成，应改成仓库内静态、带日期的证据快照，或直接移除。
- 花朵不应在每个按钮、分隔符和边框上重复出现。它是 signature，不是装饰纹样。

## 4. Reference 01 — GitHub Profile screenshot

用途：GitHub identity / Bloom system / 友好的技术分类。

### 逐项分析

- **Typography**：主标题是粗体 sans，副标题灰色 sans；技术 chip 采用较重 sans；大写分类标签通过字距建立秩序。
- **Color**：视觉上以大面积白色留白为主；主色为 coral / peach / warm red，辅以 sage green、灰蓝和少量金黄。
- **Composition**：横向花朵 banner 建立身份；下方按五条水平轨道排列能力分类。
- **Spacing**：大留白与密集 chip 形成明确的松紧对比。
- **Texture / Material**：几乎无物理纹理，靠矢量半透明花瓣和轮廓线获得轻盈感。
- **Density**：首屏低密度，下半部分高密度；可扫读但易变成工具 inventory。
- **Motion potential**：花瓣漂落、天气变化、花朵生长、chip hover 展开 field guide。
- **Personality**：明亮、友好、认真、带一点可爱，但不幼稚。
- **Hierarchy**：人名 → 生长宣言 → 分类能力；破图会打断这个秩序。

### “这是我的网站”的信号

- 花朵与 blooming 语义绑定。
- 暖色而非典型 AI 冷色。
- 分类标签像一份个人 field guide，而非招聘网站 skill bars。

### 吸收

- Bloom mark、coral accent、field-guide 命名、天气 / 时间状态、小尺寸 playful details。

### 不复制

- 完整 chip wall、精确花朵形状、全页面居中、所有工具 logo、破图的第三方统计卡。

## 5. Reference 02 — Archive world screenshot

用途：Archive identity / 首页世界入口 / Material composition。

### 逐项分析

- **Typography**：超大白色 script 形成签名；小型 mono nav 与纸张上的 serif / mono / handwritten 形成层级对照。
- **Color**：核心为 `#264730` 附近的深 moss、接近黑色的 desk、`#F4EEE0` 纸白、灰绿透明片。
- **Composition**：大背景中放置一台黑色“展示设备”；纸张从中间向外溢出，形成可进入的立体档案。
- **Spacing**：顶部留有巨大呼吸区；中心物体密度高；底部导航再次稳定落地。
- **Texture**：雾、织物/植物般的阴影、纸张、半透明塑料片、屏幕玻璃。
- **Material**：黑屏、纸、照片边框、文件夹、透明片的对照比单一卡片更成熟。
- **Density**：视觉中心密集，但页面其余区域克制。
- **Motion potential**：纸张抽出、叠层视差、屏幕 camera push-in、选中文件展开成页面。
- **Personality**：安静、私密、成熟、像个人档案室；可爱被压低成小幅不规则与手写。
- **Hierarchy**：签名 → 设备 / 档案桌 → 被选对象 → 四个主入口。

### “这是我的网站”的信号

- 深绿与纸张已经和 Chloe's Archive 绑定。
- 可进入的个人空间，而不是展示一组通用项目卡。
- 英文档案标签与中文引导共存。

### 吸收

- 黑 / 纸 / moss 的材料三角、受控叠层、签名与 index 的对照、可进入的 Archive 入口。

### 不复制

- 精确的 laptop frame、相同纸张坐标、每页都使用深绿雾背景、过度放大的 script、以卡片几何代替真实内容。

## 6. Apple 产品发布参考：吸收与边界

### 吸收

- 产品或作品是最大视觉中心。
- 一屏只讲一个命题；文字为媒体服务。
- 大面积留白、少量强层级、节奏清楚的 sticky chapter。
- 状态变化通过真实产品 UI、摄影、屏幕录制或高质量 motion 证明，而不是靠宣传文案。
- 指标旁同时给出使用条件、上下文和脚注。

### 不复制

- Apple 字体、品牌语言、黑白产品页模板、精确滚动曲线和设备 mockup。
- 所有项目都做成同一套“黑底大标题 + 设备图”。
- 没有真实媒体时用渐变和假 3D 填充。

## 7. AI Creative / Workflow / Spectrix-like 参考：吸收与边界

本次没有收到可归档的 Spectrix 原图，因此以下只来自用户描述和当前公开 Creative OS / workflow 产品类别。

### 吸收

- 媒体、Agent、模型、输入、输出和评价同处一个可理解的空间。
- 让过程可见：source → transform → output → compare。
- Camera movement 用于建立“全局工作流”和“局部证据”之间的尺度关系。
- 每个 node 有明确数据角色，不用 node graph 作为科技装饰。

### 不复制

- 精确产品 UI、同款 node、同款 infinite canvas、同款 toolbar。
- 无真实流程时伪造复杂连线。
- 把所有 Case Study 都强制改成 node canvas。

## 8. 所有参考真正共同的审美底层

不是 Apple 风、Digital Garden 风或 AI 科技风，而是以下六个共同原则：

1. **Living Index**：内容会生长，但每一项都有位置、编号、时间和关系。
2. **One clear protagonist**：每一屏只有一个主角——一个人、一件作品、一次实验或一个证据。
3. **Material contrast**：温暖的纸 / 花 / 手写痕迹，对照精确的屏幕 / 网格 /数据。
4. **Controlled asymmetry**：不规则用于产生个人性，网格用于保持成熟度。
5. **Visible process**：不只给结果，也展示系统如何工作。
6. **Restraint with a signature**：大部分界面克制；Bloom、folio、边注和小幅不规则在关键处出现。

## 9. 审计结论

最应该保留的不是“绿色风格”，而是：**可进入、可移动、会生长、能留下个人痕迹的 Archive**。

最应该修复的不是某个颜色，而是：

- 将 Archive、Work、Lab 从同一套卡片皮肤中释放出来；
- 用稳定的 Typography 与命名规则把三个世界重新连成一个人；
- 删除或标记无证据数字；
- 用真实媒体和真实运行证据取代通用 mockup；
- 让花朵成为签名，让作品与实验成为主角。
