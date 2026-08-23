import type { Metadata } from 'next';
import EvidenceBadge from '@/components/EvidenceBadge';
import WorldNav from '@/components/WorldNav';

export const metadata: Metadata = {
  title: 'Lab — 小悦的 Agent Runtime 实验桌',
  description: '在小悦的实验桌上拆开 Agent Runtime：模型决策、工具策略、checkpoint 与证据边界。',
  alternates: { canonical: '/lab/' }
};

const commit = '1790a0d2386eaa70801ded6dfd52249055b4c723';
const repositoryBase = 'https://github.com/hey-Chloe/MiniClaudeCode';

const mechanism = [
  { index: '01', label: 'INPUT', name: '问题进入 Loop', detail: '任务和 turn budget 一起进入有界循环，不允许无限继续。', artifact: 'AgentController', source: `${repositoryBase}/blob/${commit}/miniclaude/controller.py` },
  { index: '02', label: 'MODEL', name: '模型提出下一步', detail: '模型可以计划或发起 Tool Call；它是这条路径里的概率来源。', artifact: 'LLM Loop Driver', source: `${repositoryBase}/tree/${commit}/miniclaude/llm` },
  { index: '03', label: 'TOOL POLICY', name: '策略先做判断', detail: '每次工具调用先经过 ALLOW / ASK / DENY，再决定是否执行。', artifact: 'Security policy', source: `${repositoryBase}/tree/${commit}/security` },
  { index: '04', label: 'RUNTIME', name: '工具返回 Observation', detail: '参数校验、策略结果和工具输出回到上下文，供下一轮继续判断。', artifact: 'ToolRegistry', source: `${repositoryBase}/blob/${commit}/miniclaude/tools.py` },
  { index: '05', label: 'CHECKPOINT', name: '中断状态被保存', detail: '未完成的运行可保存 checkpoint，并在另一个进程里恢复。', artifact: 'SessionCheckpoint', source: `${repositoryBase}/blob/${commit}/miniclaude/session.py` },
  { index: '06', label: 'OUTPUT', name: '结果带着边界离开', detail: '完成、失败或耗尽 turn budget 都是明确的终止状态。', artifact: 'AgentResult', source: `${repositoryBase}/blob/${commit}/miniclaude/controller.py` }
];

const inspectionRows = [
  { mechanism: 'Bounded Agent Loop', artifact: 'Controller + turn budget', sourceLabel: 'miniclaude/controller.py', source: `${repositoryBase}/blob/${commit}/miniclaude/controller.py`, state: 'REPOSITORY REPORTED', boundary: '可以检查循环结构；本页没有运行新的 Agent task。' },
  { mechanism: 'Tool Policy', artifact: 'ALLOW / ASK / DENY', sourceLabel: 'security/', source: `${repositoryBase}/tree/${commit}/security`, state: 'REPOSITORY REPORTED', boundary: '可以检查策略表面；本页没有展示一次真实审批事件。' },
  { mechanism: 'Checkpoint / Resume', artifact: 'Persisted session state', sourceLabel: 'miniclaude/session.py', source: `${repositoryBase}/blob/${commit}/miniclaude/session.py`, state: 'REPOSITORY REPORTED', boundary: '能力归属 MiniClaudeCode；本轮没有复跑中断与恢复。' },
  { mechanism: 'Current Trace', artifact: 'No retained run artifact', sourceLabel: '尚未发布', source: '', state: 'WIP', boundary: '没有 timestamps、token counts、tool output 或成功率可以展示。' }
] as const;

export default function LabPage() {
  return (
    <div className="lab-world lab-soft-world">
      <WorldNav active="lab" />
      <main className="lab-soft-main">
        <section className="lab-soft-hero" aria-labelledby="lab-title">
          <header className="lab-soft-intro">
            <div className="lab-soft-intro__meta">
              <span>L.01 / AGENT RUNTIME</span>
              <EvidenceBadge state="REPOSITORY REPORTED" detail="本轮未复跑" />
            </div>
            <p className="lab-soft-signature" aria-hidden="true">LAB NOTES / CHLOE</p>
            <h1 id="lab-title">模型负责选择，<br />运行时守住边界。</h1>
            <p className="lab-soft-intro__lede">一个 Agent 的能力不只来自模型。把 Loop、Tool Policy、Checkpoint 和结果拆开以后，才能看清哪些行为允许有概率，哪些边界必须确定。</p>
            <a className="lab-soft-source-link" href={`${repositoryBase}/tree/${commit}`} target="_blank" rel="noreferrer">
              查看固定版本 <span aria-hidden="true">↗</span>
              <small>MiniClaudeCode / {commit.slice(0, 7)}</small>
            </a>
          </header>

          <div className="lab-soft-desk" aria-label="Agent Runtime 静态实验材料">
            <div className="lab-soft-desk__mat" aria-hidden="true" />
            <article className="lab-soft-question-sheet">
              <span className="lab-soft-tab">QUESTION / Q.01</span>
              <p className="lab-soft-paper-no">LAB MATERIAL · 01</p>
              <h2>一次 Agent 运行，<br />到底由谁控制？</h2>
              <p>沿着代码路径区分 Model decision 与 deterministic runtime。</p>
              <dl>
                <div><dt>对象</dt><dd>Agent Runtime</dd></div>
                <div><dt>方法</dt><dd>Repository inspection</dd></div>
                <div><dt>状态</dt><dd>Not executed here</dd></div>
              </dl>
            </article>
            <article className="lab-soft-policy-slip">
              <span>TOOL POLICY</span>
              <ol aria-label="工具策略结果">
                <li><i className="is-allow" />ALLOW</li>
                <li><i className="is-ask" />ASK</li>
                <li><i className="is-deny" />DENY</li>
              </ol>
              <p>模型提出操作，Runtime 决定它能否发生。</p>
            </article>
            <article className="lab-soft-trace-slip">
              <header><span>TRACE SCHEMA</span><b>STATIC / NOT A RUN</b></header>
              <ol>
                <li><span>01</span><code>plan</code></li>
                <li><span>02</span><code>tool_call</code></li>
                <li><span>03</span><code>policy_decision</code></li>
                <li><span>04</span><code>tool_result</code></li>
                <li><span>05</span><code>checkpoint</code></li>
              </ol>
              <p>只是机制索引，没有伪造时间戳或输出。</p>
            </article>
            <aside className="lab-soft-pin-note">
              <span>边界贴纸</span>
              <p>没有 retained trace，<br />就不画“运行成功”。</p>
            </aside>
          </div>
        </section>

        <section className="lab-soft-mechanism" aria-labelledby="mechanism-title">
          <header className="lab-soft-section-heading">
            <div><p>L.01.1 / MECHANISM MAP</p><h2 id="mechanism-title">把一次运行拆开放在桌上</h2></div>
            <aside><strong>静态机制图，不是 Live Trace。</strong><span>每张材料都指向 MiniClaudeCode 的同一固定 commit。</span></aside>
          </header>
          <ol className="lab-soft-materials">
            {mechanism.map((step) => (
              <li key={step.index}>
                <article>
                  <header><span>{step.index}</span><p>{step.label}</p></header>
                  <h3>{step.name}</h3><p>{step.detail}</p>
                  <a href={step.source} target="_blank" rel="noreferrer">{step.artifact} <span aria-hidden="true">↗</span></a>
                </article>
              </li>
            ))}
          </ol>
        </section>

        <section className="lab-soft-evidence" aria-labelledby="lab-evidence-title">
          <header className="lab-soft-section-heading lab-soft-section-heading--evidence">
            <div><p>L.01.2 / EVIDENCE TRAY</p><h2 id="lab-evidence-title">现在能检查到什么</h2></div>
            <p>功能描述只作为仓库报告，不升级成本次验证。缺少的运行产物直接留白。</p>
          </header>
          <div className="lab-soft-table-shell" tabIndex={0} role="region" aria-label="证据材料表，可横向滚动">
            <div className="lab-soft-table-tab" aria-hidden="true">INSPECTION / 04 MATERIALS</div>
            <table>
              <thead><tr><th scope="col">机制</th><th scope="col">可检查材料</th><th scope="col">固定来源</th><th scope="col">证据状态</th><th scope="col">本页边界</th></tr></thead>
              <tbody>
                {inspectionRows.map((row) => (
                  <tr key={row.mechanism}>
                    <th scope="row">{row.mechanism}</th><td>{row.artifact}</td>
                    <td>{row.source ? <a href={row.source} target="_blank" rel="noreferrer">{row.sourceLabel} <span aria-hidden="true">↗</span></a> : <span>{row.sourceLabel}</span>}</td>
                    <td><span className="lab-soft-table-state" data-state={row.state}>{row.state}</span></td><td>{row.boundary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="lab-soft-table-caption">SOURCE / MiniClaudeCode / COMMIT {commit} / REPOSITORY REPORTED</p>
        </section>

        <section className="lab-soft-boundary" aria-labelledby="lab-boundary-title">
          <article className="lab-soft-failure-note">
            <header><span>L.01.3 / FAILURE NOTE</span><i aria-hidden="true" /></header>
            <h2 id="lab-boundary-title">这张桌上，<br />还没有“成功率”。</h2>
            <p>当前没有保留在站点里的 live trace、恢复演示或评测产物。因此这里不展示虚构的事件、延迟、token 或成功指标。</p>
            <strong>没有证据的地方，空着比补图更诚实。</strong>
          </article>
          <article className="lab-soft-next-sheet">
            <header><span>NEXT EXPERIMENT / E.01</span><EvidenceBadge state="WIP" detail="等待真实产物" /></header>
            <h2>下一次，真的跑一遍。</h2>
            <ol>
              <li><span>01</span><p>执行一个有边界的 repository-inspection task。</p></li>
              <li><span>02</span><p>保留 Policy decision、Tool result 和 Checkpoint。</p></li>
              <li><span>03</span><p>中断后 Resume，并把失败条件与完整路径一起发布。</p></li>
            </ol>
          </article>
          <aside className="lab-soft-repo-card">
            <span>RELATED MATERIAL</span>
            <a href={repositoryBase} target="_blank" rel="noreferrer"><strong>MiniClaudeCode</strong><small>本页全部机制证据来源</small><i aria-hidden="true">↗</i></a>
            <a href="https://github.com/hey-Chloe/mini-runtime-agent" target="_blank" rel="noreferrer"><strong>mini-runtime-agent</strong><small>另一条 Runtime 实验；不作为 Checkpoint 证据</small><i aria-hidden="true">↗</i></a>
          </aside>
        </section>
      </main>
    </div>
  );
}
