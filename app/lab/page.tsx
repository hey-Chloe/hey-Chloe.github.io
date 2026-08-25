import type { Metadata } from 'next';
import EvidenceBadge from '@/components/EvidenceBadge';
import WorldNav from '@/components/WorldNav';
import {
  archiveActionLabels,
  archiveObjectKindNames,
  type ArchiveActionKind,
  type ArchiveObjectKind
} from '@/components/ArchiveObjectLanguage';
import { originalProjects } from '@/components/ProjectData';

export const metadata: Metadata = {
  title: 'Lab — 小悦的实验桌',
  description: '小悦正在研究的 Agent、检索、排序与训练实验；保留假设、边界、失败和可检查的材料。',
  alternates: { canonical: '/lab/' },
  openGraph: {
    type: 'website',
    url: '/lab/',
    siteName: 'Chloe’s Archive',
    title: 'Lab — 小悦的实验桌',
    description: '小悦正在研究的 Agent、检索、排序与训练实验；保留假设、边界、失败和可检查的材料。',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Lab — 小悦的实验桌' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lab — 小悦的实验桌',
    description: '小悦正在研究的 Agent、检索、排序与训练实验；保留假设、边界、失败和可检查的材料。',
    images: ['/og.jpg']
  }
};

const commit = '1790a0d2386eaa70801ded6dfd52249055b4c723';
const repositoryBase = 'https://github.com/hey-Chloe/MiniClaudeCode';

const mechanism = [
  { index: '01', label: '输入', name: '问题进入有界 Loop', artifact: 'AgentController', source: `${repositoryBase}/blob/${commit}/miniclaude/controller.py` },
  { index: '02', label: '模型', name: '提出下一步或 Tool Call', artifact: 'LLM Loop Driver', source: `${repositoryBase}/tree/${commit}/miniclaude/llm` },
  { index: '03', label: '策略', name: '先判断 ALLOW / ASK / DENY', artifact: 'Security policy', source: `${repositoryBase}/tree/${commit}/security` },
  { index: '04', label: '运行时', name: '校验并返回 Observation', artifact: 'ToolRegistry', source: `${repositoryBase}/blob/${commit}/miniclaude/tools.py` },
  { index: '05', label: '中断', name: '保存 Checkpoint', artifact: 'SessionCheckpoint', source: `${repositoryBase}/blob/${commit}/miniclaude/session.py` },
  { index: '06', label: '终止', name: '完成、失败或耗尽预算', artifact: 'AgentResult', source: `${repositoryBase}/blob/${commit}/miniclaude/controller.py` }
] as const;

const inspectionRows = [
  { mechanism: 'Bounded Agent Loop', artifact: 'Controller + turn budget', sourceLabel: 'miniclaude/controller.py', source: `${repositoryBase}/blob/${commit}/miniclaude/controller.py`, state: '仓库材料', boundary: '可以检查循环结构；本页没有运行新的 Agent task。' },
  { mechanism: 'Tool Policy', artifact: 'ALLOW / ASK / DENY', sourceLabel: 'security/', source: `${repositoryBase}/tree/${commit}/security`, state: '仓库材料', boundary: '可以检查策略表面；本页没有展示一次真实审批事件。' },
  { mechanism: 'Checkpoint / Resume', artifact: 'Persisted session state', sourceLabel: 'miniclaude/session.py', source: `${repositoryBase}/blob/${commit}/miniclaude/session.py`, state: '仓库材料', boundary: '能力归属 MiniClaudeCode；本轮没有复跑中断与恢复。' },
  { mechanism: 'Current Trace', artifact: 'No retained run artifact', sourceLabel: '尚未发布', source: '', state: '待验证', boundary: '没有 timestamps、token counts、tool output 或成功率可以展示。' }
] as const;

type ExperimentMaterial = {
  slug: string;
  href: string;
  prompt: string;
  objectKind: ArchiveObjectKind;
  actionKind: ArchiveActionKind;
};

const experimentMaterials: readonly ExperimentMaterial[] = [
  { slug: 'compute-intelligence', href: '/work/algorithm-lab/?tab=compute', prompt: '硬约束之后，排序为什么换个分布就会掉？', objectKind: 'lab-sheet', actionKind: 'view-experiment' },
  { slug: 'budgetagent', href: '/work/algorithm-lab/?tab=budget', prompt: '长程 Agent 什么时候值得花一次验证预算？', objectKind: 'receipt', actionKind: 'view-experiment' },
  { slug: 'enterprise-agentic-rag', href: '/work/algorithm-lab/?tab=rag', prompt: '检索、融合、重排和引用，哪一段真的改善了回答？', objectKind: 'dossier', actionKind: 'view-experiment' },
  { slug: 'vlm-data-selection', href: '/work/algorithm-lab/?tab=vlm', prompt: '训练开始以前，先把数据选择与评测协议冻结。', objectKind: 'letter', actionKind: 'read-research' }
] as const;

const experimentProjects = experimentMaterials.map((material) => {
  const project = originalProjects.find((candidate) => candidate.slug === material.slug);
  if (!project) throw new Error(`Missing Lab project material: ${material.slug}`);
  return { ...material, project };
});

export default function LabPage() {
  return (
    <div className="lab-world lab-soft-world">
      <WorldNav active="lab" />
      <main className="lab-soft-main">
        <section className="lab-desk-hero" aria-labelledby="lab-title">
          <header className="lab-desk-heading">
            <div>
              <p className="lab-desk-kicker">L / EXPERIMENT</p>
              <h1 id="lab-title">小悦的实验桌</h1>
            </div>
            <div className="lab-desk-heading__note">
              <p>这里放正在研究的问题。允许没有结论，也会留下失败、边界和下一次怎么验证。</p>
              <small>WORK 做成东西 · LAB 做实验 · NOTES 留下理解</small>
            </div>
          </header>

          <div className="lab-object-scene" aria-label="Agent Runtime 实验材料桌">
            <article className="lab-newspaper" data-object-kind="newspaper">
              <header><span>THE XIAOYUE LAB</span><small>研究报纸 · AUG 2026</small></header>
              <div className="lab-newspaper__rule" aria-hidden="true" />
              <p className="lab-newspaper__section">AGENT RUNTIME / FIELD QUESTION</p>
              <h2>Agent 的边界，<br />应该画在哪里？</h2>
              <p className="lab-newspaper__deck">模型可以提出下一步，但 Tool Policy、参数校验、Checkpoint 和终止条件需要由运行时守住。</p>
              <div className="lab-newspaper__columns">
                <p>这一页沿着 MiniClaudeCode 的固定代码版本，拆开一次 Agent 运行。这里展示的是仓库里可以检查的机制，不是刚刚跑出来的 Live Trace。</p>
                <dl>
                  <div><dt>方法</dt><dd>Repository inspection</dd></div>
                  <div><dt>证据</dt><dd>REPOSITORY REPORTED</dd></div>
                  <div><dt>版本</dt><dd>{commit.slice(0, 7)}</dd></div>
                </dl>
              </div>
              <a href={`${repositoryBase}/tree/${commit}`} target="_blank" rel="noreferrer">阅读固定版本 <span aria-hidden="true">↗</span></a>
            </article>

            <article className="lab-question-sheet" data-object-kind="lab-sheet">
              <span className="lab-object-label">{archiveObjectKindNames['lab-sheet']} / E.01</span>
              <p className="lab-question-sheet__prompt">一次 Agent 运行，到底由谁控制？</p>
              <dl>
                <div><dt>假设</dt><dd>模型负责选择；确定性 Runtime 负责约束。</dd></div>
                <div><dt>方法</dt><dd>沿 Controller、Policy、Tools 与 Session 做静态检查。</dd></div>
                <div><dt>当前状态</dt><dd>本页未重新执行。</dd></div>
              </dl>
              <EvidenceBadge state="REPOSITORY REPORTED" detail="本轮未复跑" />
            </article>

            <aside className="lab-failure-sticky" data-object-kind="sticky-note">
              <span>{archiveObjectKindNames['sticky-note']} / FAILURE</span>
              <p>没有 retained trace，<br />就不画“运行成功”。</p>
            </aside>

            <article className="lab-terminal-receipt" data-object-kind="receipt">
              <header><span>{archiveObjectKindNames.receipt}</span><b>STATIC / NOT A RUN</b></header>
              <ol>
                {mechanism.map((step) => <li key={step.index}><span>{step.index}</span><code>{step.label}</code><b>{step.name}</b></li>)}
              </ol>
              <p>只有机制索引。没有伪造时间戳、token、延迟或成功率。</p>
            </article>

            <article className="lab-system-blueprint" data-object-kind="blueprint">
              <header><span>{archiveObjectKindNames.blueprint} / CONTROL SURFACE</span><small>同一固定 commit</small></header>
              <ol>
                {mechanism.map((step) => (
                  <li key={step.index}>
                    <a href={step.source} target="_blank" rel="noreferrer"><span>{step.index}</span><strong>{step.label}</strong><small>{step.artifact}</small></a>
                  </li>
                ))}
              </ol>
            </article>

            <article className="lab-next-letter" data-object-kind="letter">
              <span className="lab-object-label">{archiveObjectKindNames.letter} / NEXT</span>
              <h2>下一次，真的跑一遍。</h2>
              <ol>
                <li>执行一个有边界的 repository-inspection task。</li>
                <li>保留 Policy decision、Tool result 和 Checkpoint。</li>
                <li>中断后 Resume，并发布失败条件与完整路径。</li>
              </ol>
              <small>等待真实运行产物，不预填结果。</small>
            </article>
          </div>
        </section>

        <section className="lab-evidence-spread" aria-labelledby="lab-evidence-title">
          <article className="lab-evidence-dossier" data-object-kind="dossier">
            <header>
              <div><p>L.01 / EVIDENCE FILE</p><h2 id="lab-evidence-title">现在能检查到什么</h2></div>
              <span>REPOSITORY REPORTED</span>
            </header>
            <div className="lab-evidence-dossier__rows">
              {inspectionRows.map((row, index) => (
                <article key={row.mechanism}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div><h3>{row.mechanism}</h3><p>{row.artifact}</p></div>
                  <div><small>{row.state}</small>{row.source ? <a href={row.source} target="_blank" rel="noreferrer">{row.sourceLabel} ↗</a> : <p>{row.sourceLabel}</p>}</div>
                  <p>{row.boundary}</p>
                </article>
              ))}
            </div>
            <footer>SOURCE / MiniClaudeCode / COMMIT {commit}</footer>
          </article>

          <aside className="lab-evidence-note" data-object-kind="sticky-note">
            <span>证据边界</span>
            <p>仓库里写着能做，和这一轮真的跑过，是两件事。</p>
            <strong>所以这里没有“成功率”。</strong>
          </aside>
        </section>

        <section className="lab-open-experiments" aria-labelledby="open-experiments-title">
          <header>
            <p>L / OPEN DRAWER</p>
            <h2 id="open-experiments-title">别的实验，也摊在桌上。</h2>
            <span>每份材料保留当前证据状态；入口只打开已有实验或研究记录。</span>
          </header>
          <div className="lab-experiment-materials">
            {experimentProjects.map(({ project, href, prompt, objectKind, actionKind }) => (
              <a className={`lab-experiment-object lab-experiment-object--${objectKind}`} data-object-kind={objectKind} href={href} key={project.slug}>
                <span className="lab-experiment-object__kind">{archiveObjectKindNames[objectKind]}</span>
                <small>{project.folio} / {project.evidenceState}</small>
                <h3>{prompt}</h3>
                <p>{project.titleZh}</p>
                <em>{archiveActionLabels[actionKind]} <span aria-hidden="true">→</span></em>
              </a>
            ))}
          </div>
          <footer className="lab-related-materials">
            <span>相关材料</span>
            <a href={repositoryBase} target="_blank" rel="noreferrer">MiniClaudeCode 源码 ↗</a>
            <a href="https://github.com/hey-Chloe/mini-runtime-agent" target="_blank" rel="noreferrer">mini-runtime-agent 本地实验 ↗</a>
            <a href="/work/enterprise-agentic-rag/">RAG 项目档案 →</a>
          </footer>
        </section>
      </main>
    </div>
  );
}
