import type { Profile } from "./types";

/** Only the identity and positioning supplied by the owner are published. */
export const profile: Profile = {
  name: "李晨悦",
  chineseName: "李晨悦",
  role: "Research Engineer / AI Engineer",
  topics: ["LLM", "Multimodal", "Agent", "Evaluation"],
  description:
    "李晨悦，江南大学本科在读，预计 2028 年毕业。围绕大语言模型、多模态与智能体开展研究与工程实践。",
  biography: {
    zh: "江南大学本科在读，预计 2028 年毕业。过往项目覆盖智能体运行与失败归因、推荐系统评估，以及多模态数据选择与微调，关注如何让 AI 系统更可靠、实验更可复现。",
    en: "I am an undergraduate at Jiangnan University, expected to graduate in 2028. My projects span agent execution and failure attribution, recommender evaluation, and multimodal data selection and fine-tuning, with a focus on reliable AI systems and reproducible experiments.",
  },
  education: {
    institution: "江南大学", institutionEn: "Jiangnan University", degree: "本科在读", degreeEn: "Undergraduate", expectedGraduation: "2028",
    source: "https://github.com/hey-Chloe/ai-research-evidence/blob/397c4501d5796256a312f8d1d92261491f9d47ba/README.md",
  },
  github: "https://github.com/hey-Chloe",
  email: "xiaoyue0227@yeah.net",
  portrait: { src: "/images/portrait.webp", alt: "李晨悦的生活照片", width: 420, height: 560 },
  // Public GitHub, photograph and email are traceable in content/CONTENT-SOURCES.md.
  // Scholar and CV remain unset until verified.
};
