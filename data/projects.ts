import type { Project } from "./types";

/** Source-available personal projects; checked against public code and reports. */
export const projects: readonly Project[] = [
  {
    slug: "miniclaudecode-studio",
    title: "MiniClaudeCode Studio",
    description: "中文 Agent 工作台，将任务计划、工具调用、审批、代码差异、测试与检查点恢复放在同一条可追踪流程中。",
    problem: "让 Agent 的执行状态、文件修改和验证结果可以被观察与区分。",
    ownership: "个人仓库中的 Studio 适配器与界面复用 MiniClaudeCode 原生执行引擎；公开版仅回放录制，本地版连接实际运行时。",
    outcome: "公开本地工作台、静态回放与小样本在线测评，清晰区分执行结束、功能通过和最终验证；保留权限与解释器导致的失败记录。",
    year: 2026,
    tags: ["Agent UI", "Vue", "FastAPI", "SSE"],
    links: {
      code: "https://github.com/hey-Chloe/MiniClaudeCode-Studio",
      demo: "https://miniclaudecode-studio.itankg64.chatgpt.site",
      project: "https://github.com/hey-Chloe/MiniClaudeCode-Studio/blob/c2a8e2a12eab80b19cfddd47c865fc101b67da8c/docs/EVALUATION.md",
    },
  },
  {
    slug: "ruleforge-sast",
    title: "RuleForge-SAST",
    description: "面向 PHP、Python 与 Java 的静态分析工作流：规则扫描、漏洞解释、AI 修复建议、二次扫描与历史记录。",
    problem: "将 AI 的修复建议与规则扫描的实际结果分开，提供可检查的修复前后证据。",
    ownership: "个人仓库实现语言与规则选择、扫描记录、AI 建议和 Patch Verify 的前后端连接；检测能力基于 Semgrep 及已有规则。",
    outcome: "将扫描结果、AI 建议和修复复检连接成可追踪流程，提供演示视频与扫描历史。FIXED 表示当前规则不再命中，检测范围取决于所用规则。",
    year: 2026,
    tags: ["Static analysis", "Semgrep", "FastAPI", "Vue"],
    links: {
      code: "https://github.com/hey-Chloe/RuleForge-SAST",
      demo: "https://www.bilibili.com/video/BV1YC3Z6EEJC/",
    },
  },
];
