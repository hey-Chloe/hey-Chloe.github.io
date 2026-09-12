# 公开内容来源与主张边界

核对日期：2026-09-09。此文件记录主页内容的依据，便于更新与复查。仅使用已确认 `visibility: public` 的 GitHub 仓库、公开 PR 和公开展示入口；未读取或转载私有仓库内容。GitHub `hey-Chloe` 已由当前连接确认属于用户。

本次执行的是公开 README、选定源码、提交的报告与 PR 状态核对，没有重训模型、复跑数据集、调用真实模型、验证生产环境或对第三方研究作独立复现。正文将聚合实验结论称为「公开报告」或「公开汇总」。示意图重绘自公开方法流程，不是实验截图、性能曲线或新增结果。

## 个人资料公开来源

- 个人肖像取自本人原有公开网站的[照片资源](https://raw.githubusercontent.com/hey-Chloe/hey-Chloe.github.io/main/public/about/xiaoyue-portrait.jpg)，使用已有肖像，不生成或借用他人照片。
- 公开联系邮箱 `xiaoyue0227@yeah.net` 见个人公开仓库的 [About 组件](https://github.com/hey-Chloe/xiaoyue-ai-portfolio/blob/main/src/components/about/index.jsx)。仅引用该页面明确公布的邮箱，不从提交记录或私有配置提取联系方式。

正文保留研究本身的证据边界；「本次核对了哪些文件、没有重跑哪些实验」等交付过程说明集中记录在本文件，不混入面向访客的项目介绍。

## Selected Research

### MiniClaudeCode：有序轨迹归因与 Agent 评测

固定版本：`a060de35ad0b5ea42fd98c80c288c9a0bb639cdc`。

- [研究问题、方法与有效性边界](https://github.com/hey-Chloe/MiniClaudeCode/blob/a060de35ad0b5ea42fd98c80c288c9a0bb639cdc/RESEARCH_CREDIT_ASSIGNMENT.md)：前序 DAG、合法线性扩展、精确枚举与均匀采样；明确不是 Agentic RL 成果。
- [估计器代码](https://github.com/hey-Chloe/MiniClaudeCode/blob/a060de35ad0b5ea42fd98c80c288c9a0bb639cdc/miniclaude/ordered_credit.py)：动态规划计算后续完成数，并据此采样合法顺序。
- [受控研究生成器](https://github.com/hey-Chloe/MiniClaudeCode/blob/a060de35ad0b5ea42fd98c80c288c9a0bb639cdc/evaluation/trajectory_credit_study.py)：五种固定结构、每种八个变体，使用声明的效用函数与前缀参考。
- [提交的研究报告](https://github.com/hey-Chloe/MiniClaudeCode/blob/a060de35ad0b5ea42fd98c80c288c9a0bb639cdc/reports/trajectory_credit_study_20260829.json)：估计器比较、采样收敛与重放有效性检查。
- [README](https://github.com/hey-Chloe/MiniClaudeCode/blob/a060de35ad0b5ea42fd98c80c288c9a0bb639cdc/README.md)：运行时、工具策略、会话与评测接口，以及第三方代码和许可说明。

保留边界：四十个合成结构实例不等于四十个独立真实编码任务；前缀参考不是通用因果真值；公开 live trace 缺少逐动作工作区快照。没有将第三方训练代码计为本人原创或已完成策略训练。主页不发布该项目的生产可靠性或通用任务成功率主张。

### KAI Offline RecSys Lab：从召回到重排的评估协议

固定版本：`9bfb5693414cdbeaea1df9d712cae3ba333ac73d`。

- [README 与 truth boundary](https://github.com/hey-Chloe/KAI-Offline-RecSys-Lab/blob/9bfb5693414cdbeaea1df9d712cae3ba333ac73d/README.md)：个人公开数据实验、数据协议、目录与共同测试人群、系统扩展和复现入口。
- [Amazon V3 报告](https://github.com/hey-Chloe/KAI-Offline-RecSys-Lab/blob/9bfb5693414cdbeaea1df9d712cae3ba333ac73d/reports/amazon-end-to-end-v3.md)：冻结实验、选型、配对统计、特征置零、HNSW 与冷启动支持边界。
- [对应 JSON 报告](https://github.com/hey-Chloe/KAI-Offline-RecSys-Lab/blob/9bfb5693414cdbeaea1df9d712cae3ba333ac73d/reports/amazon-end-to-end-v3-results.json)：配置、候选比较、来源和限制，与文字报告交叉核对。
- [开发集选型代码](https://github.com/hey-Chloe/KAI-Offline-RecSys-Lab/blob/9bfb5693414cdbeaea1df9d712cae3ba333ac73d/src/kai_recsys_lab/pipelines/amazon_end_to_end_v3.py)：冻结快照、候选训练、按 dev NDCG@100 选型和证据清单。
- [公开 Playground](https://hey-chloe.github.io/KAI-Offline-RecSys-Lab/)：README 提供的静态报告入口。

保留边界：25,754 为主质量实验目录规模，50,653 为共同测试用户数；百万商品扩展是另一条 ANN 系统测量路径。输入置零不是逐变体重训消融。零支持冷启动人群不产生性能主张。公开聚合结果检查不等于重新获取原始数据与模型进行独立重训，离线指标不代表线上 CTR、CVR、收入或 SLA。

### Qwen2.5-VL：小预算数据选择与微调研究

公开证据仓库版本：`397c4501d5796256a312f8d1d92261491f9d47ba`；公开网站版本：`c34131be71937ad6071ad60730384a54663e7f82`。

- [公开研究摘要](https://github.com/hey-Chloe/ai-research-evidence/blob/397c4501d5796256a312f8d1d92261491f9d47ba/README.md)：Qwen2.5-VL-3B、LoRA / SFT、Random-1K 与 faithful COINCIDE-1K、三种子及源码未公开边界。
- [静态结果 snapshot](https://github.com/hey-Chloe/hey-Chloe.github.io/blob/c34131be71937ad6071ad60730384a54663e7f82/public/demos/vlm-training/data/snapshot.json)：公开配对结果、held-out-256、种子、跨零区间、训练样例回放和未运行的规模曲线。
- [公开证据查看器](https://hey-chloe.github.io/demos/vlm-training/index.html)：静态读取结果，不执行训练或在线推理。

保留边界：完整训练源码及留出逐样本预测不在公开证据内，不提供假的 Code 或 Paper 链接。网页中的 128 条训练样例与少量预测回放不能代替留出集评估。当前三个种子上的负结果不证明方法普遍无效；选择失配分析不作为已经证明的机制。未将拟投计划填成正式论文、在审或录用记录。

## Engineering

### MiniClaudeCode Studio

固定版本：`c2a8e2a12eab80b19cfddd47c865fc101b67da8c`，提交日期 2026-09-08。

- [README](https://github.com/hey-Chloe/MiniClaudeCode-Studio/blob/c2a8e2a12eab80b19cfddd47c865fc101b67da8c/README.md)：公开回放与本地执行的区分、原引擎复用、检查点、差异与审批界面。
- [适配器入口](https://github.com/hey-Chloe/MiniClaudeCode-Studio/blob/c2a8e2a12eab80b19cfddd47c865fc101b67da8c/backend/app.py)：本地 FastAPI 服务、原生 Agent 导入、控制接口与事件流。
- [在线微任务报告](https://github.com/hey-Chloe/MiniClaudeCode-Studio/blob/c2a8e2a12eab80b19cfddd47c865fc101b67da8c/docs/EVALUATION.md) 与 [汇总 JSON](https://github.com/hey-Chloe/MiniClaudeCode-Studio/blob/c2a8e2a12eab80b19cfddd47c865fc101b67da8c/data/evaluation/summary.json)：保留权限、解释器与 completed 状态不等于任务成功的失败案例。
- [公开回放](https://miniclaudecode-studio.itankg64.chatgpt.site)：README 中公布的地址。

保留边界：本地开发原型与静态回放，不是云端代码执行平台；原生执行引擎不是 Studio 重新原创。小样本单次测评不用于通用能力或竞品排名。本次未再次运行在线测评。

### RuleForge-SAST

固定版本：`6f0c3ab5ae3f289d0f47dbd6c9ef94527e4647a0`，提交日期 2026-08-02。

- [README](https://github.com/hey-Chloe/RuleForge-SAST/blob/6f0c3ab5ae3f289d0f47dbd6c9ef94527e4647a0/README.md)：PHP / Python / Java、扫描、AI 建议、历史记录和 Patch 验证的说明。
- [后端接口](https://github.com/hey-Chloe/RuleForge-SAST/blob/6f0c3ab5ae3f289d0f47dbd6c9ef94527e4647a0/backend/api.py)：规则选择、AI 建议接口、扫描历史及语言映射。
- [修复前后扫描代码](https://github.com/hey-Chloe/RuleForge-SAST/blob/6f0c3ab5ae3f289d0f47dbd6c9ef94527e4647a0/backend/analyzer/patch_verify.py)：比较修改前后扫描结果。
- [项目演示视频](https://www.bilibili.com/video/BV1YC3Z6EEJC/)：README 提供的 Bilibili 链接。

保留边界：检测复用 Semgrep 与规则，不将第三方检测能力说成原创算法；当前规则不再命中不代表绝对安全。本次仅检查公开源码与说明，没有重跑扫描或调用 AI。

## 实际外部贡献

[microsoft/PyRIT PR #2538](https://github.com/microsoft/PyRIT/pull/2538)，标题 `FEAT: Add Garak API key elicitation scenario`，作者 `hey-Chloe`。

核对时状态：`open`、`merged: false`、`draft: false`；head commit 为 `3037d4167bc65b412147d8dd79d8bec9586ae092`。实际 diff 包含 ApiKey 场景、固定语料、CredentialLeakScorer 扩展、测试、文档和第三方来源声明。主页只写已提交、未合并，不宣称维护者认可。PR 中的测试结果是提交者报告，本次没有重跑 PyRIT 测试，也没有对真实目标或凭据提供商进行验证。

## 维护约定

- 修改结果或状态时，同时更新对应数据项、这份来源记录与可访问链接；PR 合并状态需要重新查询。
- 论文和行业经历不从仓库名、README 技术定位、拟投计划或账号活动推断。
- 「个人仓库维护」表示账号公开维护的交付，不等于所有代码均为本人独立构思；复用部分保留来源说明。
- 公开源码与开源许可证不是同一件事。MiniClaudeCode / Studio 当前说明未额外授予许可，不宣称许可证完备。
- 不把未核实的账号流量、奖项、融资或线上业务指标添加到主页。

## 教育与个人简介

个人公开证据仓库 [README](https://github.com/hey-Chloe/ai-research-evidence/blob/397c4501d5796256a312f8d1d92261491f9d47ba/README.md) 明确标注「李晨悦 | 江南大学 2028 届本科」。原有公开网站的 [About 页面源文件](https://github.com/hey-Chloe/hey-Chloe.github.io/blob/c34131be71937ad6071ad60730384a54663e7f82/app/about/page.tsx) 可交叉核对在读与预计毕业年份。主页据此表述「江南大学本科在读，预计 2028 年毕业」，不推断未公开的专业、入学时间、成绩、奖项或公司任职。个人简介中的过往工作只概括本文件已列明的公开项目。

## 研究图片

研究列表缩略图采用 visual abstract：方法流程只重绘本文件所引用的公开协议，右侧证据只使用 [figure-data.json](figure-data.json) 的真实公开报告数值。研究详情 Results 继续使用完整统计图。该数据文件保留固定提交、原始路径、下载 SHA256、精确 JSON 字段及全精度数据；绘图脚本为 `scripts/generate-research-figures.py`，teaser 与完整图的 PNG、SVG 源文件均为 1200×750。列表实际加载由 `npm run figures:optimize` 生成的 800×500 WebP，以减少移动端传输和解码开销；没有重新训练、生成新实验结果或借用仓库 third-party 目录中的论文图。

- Agent：受控协议中 12 个种子的采样收敛及报告的 95% 区间，不能解释为真实任务收益。
- RecSys：同一冻结测试协议的 Exact 召回与 DIN 重排均值，纵轴从零开始。
- VLM：固定 1K 预算、256 条留出评估下三个种子的配对 exact match；保留负结果与均值差区间跨零的限制。
