import type { OpenSourceContribution } from "./types";

/** Concrete public contributions; repository visibility is not a license grant. */
export const openSource: readonly OpenSourceContribution[] = [
  {
    id: "pyrit-api-key-scenario",
    title: "PyRIT：Garak API-key 场景与评分器",
    kind: "pull-request",
    repository: "microsoft/PyRIT",
    description: "外部贡献 PR #2538，为 Garak 场景增加 API-key 生成与补全探测。",
    contribution: "提交场景实现、固定语料、CredentialLeakScorer 扩展、测试和文档；区分凭据形态与公开标识，并排除请求回显与提供的测试片段。",
    result: "可查看实际代码 diff 与测试说明。当前为已提交、未合并状态，不以提交记录代替维护者认可或真实目标验证。",
    status: "已提交 · 未合并（2026-09-09）",
    links: {
      pullRequest: "https://github.com/microsoft/PyRIT/pull/2538",
      repository: "https://github.com/microsoft/PyRIT",
    },
  },
  {
    id: "miniclaudecode-runtime",
    title: "MiniClaudeCode：可观察的执行与评测基础设施",
    kind: "repository",
    repository: "hey-Chloe/MiniClaudeCode",
    description: "个人维护的 Coding Agent 参考实现，围绕执行边界、工具事件、检查点和评测展开。",
    contribution: "公开有界控制循环、工具注册与策略接口、会话持久化、轨迹归因及评测脚本；第三方训练框架单独注明来源。",
    result: "源码、受控报告与测试入口可查。离线 harness 验证不等于真实模型解题；仓库当前未授予额外开源许可证。",
    status: "个人仓库 · 源码公开",
    links: {
      repository: "https://github.com/hey-Chloe/MiniClaudeCode",
      docs: "https://github.com/hey-Chloe/MiniClaudeCode/blob/a060de35ad0b5ea42fd98c80c288c9a0bb639cdc/RESEARCH_CREDIT_ASSIGNMENT.md",
    },
  },
  {
    id: "recsys-evaluation-infrastructure",
    title: "KAI RecSys Lab：实验协议与报告工具",
    kind: "infrastructure",
    repository: "hey-Chloe/KAI-Offline-RecSys-Lab",
    description: "围绕公开数据搭建数据来源账本、冻结配置、评估报告与可移植实验展示。",
    contribution: "将召回、重排、校准和配对统计接入同一离线协议，提供合成路径复现、公开报告检查和静态 Playground。",
    result: "报告明确区分公开数据实验、合成集成检查、ANN 系统测量与本地服务演练，不将离线结果包装为线上业务收益。",
    status: "个人仓库 · 研究基础设施",
    links: {
      repository: "https://github.com/hey-Chloe/KAI-Offline-RecSys-Lab",
      docs: "https://github.com/hey-Chloe/KAI-Offline-RecSys-Lab/blob/9bfb5693414cdbeaea1df9d712cae3ba333ac73d/reports/amazon-end-to-end-v3.md",
    },
  },
];
