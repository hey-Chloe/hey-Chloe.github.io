/** Editorial copy is separate from claims about the owner's past work. */
export const siteCopy = {
  hero: {
    introduction: "近期的公开工作包括 MiniClaudeCode 的智能体运行与失败归因、KAI Offline RecSys Lab 的检索与重排评估，以及 Qwen2.5-VL 的数据选择与 LoRA 训练研究。",
    introductionChinese: "我关注大语言模型、多模态学习与智能体系统，尤其是评估协议、失败归因和可复现的实验。希望把研究问题落实为可以运行、分析和验证的系统。",
    interestsTitle: "研究方向",
    unavailableLink: "资料待补充",
    contactNote: "更多公开资料整理中。",
  },
  research: {
    eyebrow: "01 / RESEARCH",
    title: "学术研究",
    description: "围绕真实问题、实验方法与证据，整理公开的独立研究、工程探索与脱敏进展。",
    emptyTitle: "研究项目整理中",
    emptyDescription: "项目详情与支撑材料核实后将在此公开。",
  },
  experience: {
    eyebrow: "02 / EXPERIENCE",
    title: "研究与行业经历",
    description: "围绕问题、职责、方法与结果，记录研究和工程实践。",
    emptyTitle: "研究与行业经历",
    emptyDescription: "任职、团队与职责信息待补充。",
  },
  publications: {
    eyebrow: "03 / PUBLICATIONS",
    title: "论文发表",
    description: "按年份整理学术论文、相关代码和引用。",
    emptyTitle: "论文记录待补充",
    emptyDescription: "尚无已确认的公开论文记录。",
  },
  openSource: {
    eyebrow: "04 / OPEN SOURCE",
    title: "开源贡献",
    description: "开源贡献、维护的仓库，以及让研究更容易复现的基础设施。",
    emptyTitle: "可追溯的开源贡献",
    emptyDescription: "在此整理实际贡献、维护的仓库与研究基础设施。",
  },
  engineering: {
    eyebrow: "05 / ENGINEERING",
    title: "工程项目",
    description: "将研究想法落实为可运行的 AI 系统与全栈工具。",
    emptyTitle: "工程项目整理中",
    emptyDescription: "项目将附具体问题、个人职责、实现范围与成果。",
  },
  writing: {
    eyebrow: "06 / WRITING",
    title: "研究笔记",
    description: "记录模型、实验，以及构建 AI 系统过程中的思考。",
    emptyTitle: "记录问题、实验与思考",
    emptyDescription: "研究笔记与技术写作整理中。",
  },
  cv: {
    title: "个人简历",
    description: "教育背景、研究经历与代表工作。",
    emptyTitle: "简历文件整理中",
    emptyDescription: "确认后的 PDF 简历将在此提供下载。",
  },
} as const;

/** Interests only: these statements do not assert projects or measured results. */
export const researchInterests = [
  {
    id: "language-models",
    number: "01",
    title: "大语言模型",
    description: "大语言模型的推理、适配与行为分析。",
  },
  {
    id: "multimodal",
    number: "02",
    title: "多模态系统",
    description: "语言、视觉与多模态信息的联合理解。",
  },
  {
    id: "agents-evaluation",
    number: "03",
    title: "智能体与评估",
    description: "工具使用、可靠交互，以及超越单次回答的系统评估。",
  },
] as const;
