'use client';

import { Fragment, KeyboardEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';

type LabKey = 'compute' | 'budget' | 'rag' | 'vlm';

const labs: ReadonlyArray<{ key: LabKey; folio: string; title: string; kind: string }> = [
  { key: 'compute', folio: '01', title: 'Compute Intelligence', kind: '配置试配' },
  { key: 'budget', folio: '02', title: 'BudgetAgent', kind: '分支回放' },
  { key: 'rag', folio: '03', title: 'Enterprise RAG', kind: '检索与引用' },
  { key: 'vlm', folio: '04', title: 'VLM Data Selection', kind: '数据挑选' }
];

function MonoLabel({ children, tone = 'plain' }: { children: ReactNode; tone?: 'plain' | 'green' | 'bloom' }) {
  return <span className={`algorithm-label algorithm-label--${tone}`}>{children}</span>;
}

function EvidenceNote({ children }: { children: ReactNode }) {
  return (
    <aside className="algorithm-evidence-note">
      <MonoLabel tone="bloom">EVIDENCE BOUNDARY</MonoLabel>
      <p>{children}</p>
    </aside>
  );
}

type ComputeCandidate = {
  id: string;
  gpu: string;
  vram: number;
  priceTier: 1 | 2 | 3;
  reliability: 1 | 2 | 3;
  available: number;
};

const computeInventory: readonly ComputeCandidate[] = [
  { id: 'D-01', gpu: 'A10', vram: 24, priceTier: 1, reliability: 2, available: 4 },
  { id: 'D-02', gpu: 'RTX 4090', vram: 24, priceTier: 1, reliability: 1, available: 2 },
  { id: 'D-03', gpu: 'L40S', vram: 48, priceTier: 2, reliability: 3, available: 4 },
  { id: 'D-04', gpu: 'A100', vram: 80, priceTier: 2, reliability: 3, available: 2 },
  { id: 'D-05', gpu: 'H100', vram: 80, priceTier: 3, reliability: 3, available: 4 },
  { id: 'D-06', gpu: 'H20', vram: 96, priceTier: 3, reliability: 2, available: 2 }
];

const workloadWeights = {
  inference: { label: '在线推理', cost: 45, reliability: 20, memory: 20, supply: 15 },
  finetune: { label: '参数微调', cost: 30, reliability: 30, memory: 25, supply: 15 },
  training: { label: '训练实验', cost: 20, reliability: 35, memory: 25, supply: 20 }
} as const;

type Workload = keyof typeof workloadWeights;

function tierLabel(value: number) {
  return ['—', '低', '中', '高'][value] ?? '—';
}

function ComputeDesk() {
  const [workload, setWorkload] = useState<Workload>('inference');
  const [minimumVram, setMinimumVram] = useState(24);
  const [gpuCount, setGpuCount] = useState(1);
  const [budgetTier, setBudgetTier] = useState(2);

  const result = useMemo(() => {
    const weights = workloadWeights[workload];
    const eligible: Array<ComputeCandidate & { score: number; components: string[] }> = [];
    const rejected: Array<ComputeCandidate & { reasons: string[] }> = [];

    computeInventory.forEach((candidate) => {
      const reasons: string[] = [];
      if (candidate.vram < minimumVram) reasons.push(`显存低于 ${minimumVram}GB`);
      if (candidate.available < gpuCount) reasons.push(`仅有 ${candidate.available} 张可用`);
      if (candidate.priceTier > budgetTier) reasons.push(`成本档位超过「${tierLabel(budgetTier)}」`);

      if (reasons.length) {
        rejected.push({ ...candidate, reasons });
        return;
      }

      const costFit = ((budgetTier - candidate.priceTier + 1) / budgetTier) * weights.cost;
      const reliabilityFit = (candidate.reliability / 3) * weights.reliability;
      const memoryFit = Math.min(candidate.vram / Math.max(minimumVram * 2, 1), 1) * weights.memory;
      const supplyFit = Math.min(candidate.available / Math.max(gpuCount * 2, 1), 1) * weights.supply;
      const score = Math.round(costFit + reliabilityFit + memoryFit + supplyFit);

      eligible.push({
        ...candidate,
        score,
        components: [
          `成本 ${Math.round(costFit)}/${weights.cost}`,
          `稳定性 ${Math.round(reliabilityFit)}/${weights.reliability}`,
          `显存 ${Math.round(memoryFit)}/${weights.memory}`,
          `供给 ${Math.round(supplyFit)}/${weights.supply}`
        ]
      });
    });

    eligible.sort((a, b) => b.score - a.score || a.priceTier - b.priceTier || b.vram - a.vram);
    return { top: eligible.slice(0, 3), rejected };
  }, [budgetTier, gpuCount, minimumVram, workload]);

  const weights = workloadWeights[workload];

  return (
    <div className="algorithm-panel__content compute-desk">
      <section className="algorithm-control-sheet" aria-labelledby="compute-input-title">
        <div className="algorithm-section-heading">
          <MonoLabel>DEMO INPUT</MonoLabel>
          <h3 id="compute-input-title">先做硬约束，再排候选。</h3>
          <p>库存名称和数值都是站内 fixture，不连接真实供应、价格或订单。</p>
        </div>

        <div className="compute-controls">
          <label>
            <span>任务</span>
            <select value={workload} onChange={(event) => setWorkload(event.target.value as Workload)}>
              {Object.entries(workloadWeights).map(([key, value]) => (
                <option value={key} key={key}>{value.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>最低单卡显存</span>
            <select value={minimumVram} onChange={(event) => setMinimumVram(Number(event.target.value))}>
              <option value={24}>24 GB</option>
              <option value={48}>48 GB</option>
              <option value={80}>80 GB</option>
            </select>
          </label>
          <label>
            <span>需要卡数</span>
            <select value={gpuCount} onChange={(event) => setGpuCount(Number(event.target.value))}>
              <option value={1}>1 张</option>
              <option value={2}>2 张</option>
              <option value={4}>4 张</option>
            </select>
          </label>
          <label>
            <span>成本档位上限</span>
            <select value={budgetTier} onChange={(event) => setBudgetTier(Number(event.target.value))}>
              <option value={1}>低</option>
              <option value={2}>中</option>
              <option value={3}>高</option>
            </select>
          </label>
        </div>

        <div className="compute-rule" aria-label="当前启发式权重">
          <MonoLabel tone="green">DEMO RULE</MonoLabel>
          <p>
            {weights.label}：成本 {weights.cost} · 稳定性 {weights.reliability} · 显存余量 {weights.memory} · 可用量 {weights.supply}
          </p>
        </div>
      </section>

      <section className="algorithm-output-sheet" aria-labelledby="compute-output-title" aria-live="polite">
        <div className="algorithm-section-heading algorithm-section-heading--row">
          <div>
            <MonoLabel tone="green">HEURISTIC TOP 3</MonoLabel>
            <h3 id="compute-output-title">通过硬约束的候选</h3>
          </div>
          <span className="algorithm-count">{result.top.length} / 3</span>
        </div>

        {result.top.length ? (
          <ol className="compute-ranking">
            {result.top.map((candidate, index) => (
              <li key={candidate.id}>
                <span className="compute-ranking__rank">0{index + 1}</span>
                <div>
                  <h4>{candidate.gpu} <small>{candidate.vram}GB · {candidate.available} 张</small></h4>
                  <p>{candidate.components.join(' · ')}</p>
                </div>
                <strong>{candidate.score}<small>/100</small></strong>
              </li>
            ))}
          </ol>
        ) : (
          <p className="algorithm-empty">当前没有候选通过全部硬约束。降低卡数、显存或成本限制再试一次。</p>
        )}

        <details className="compute-rejections">
          <summary>查看硬约束拒绝项 <span>{result.rejected.length}</span></summary>
          <ul>
            {result.rejected.map((candidate) => (
              <li key={candidate.id}>
                <b>{candidate.gpu}</b>
                <span>{candidate.reasons.join('；')}</span>
              </li>
            ))}
          </ul>
        </details>
      </section>

      <EvidenceNote>
        当前页面运行的是公开可读的确定性 demo rule。仓库中的 LambdaRank V2 来自 synthetic/public 离线 benchmark，且算法 worktree 尚未提交；这里没有把它伪装成在线排序。
      </EvidenceNote>
    </div>
  );
}

type BudgetBranch = 'sham' | 'forced';

const budgetBranches = {
  sham: {
    label: 'Sham replay',
    caption: '不改变决策的重放对照',
    steps: ['冻结相同任务前缀', '重放 Sham 分支', '官方 AppWorld evaluator 评分'],
    facts: [
      { value: '15', label: 'replay pairs' },
      { value: '0', label: 'divergence' },
      { value: '0', label: 'failures' }
    ],
    conclusion: '重放链路一致；它验证实验管线，不证明 verifier 能改善结果。'
  },
  forced: {
    label: 'Forced Gold Repair',
    caption: '人为注入的正向控制',
    steps: ['冻结相同任务前缀', '注入 gold-oracle repair', '官方 AppWorld evaluator 评分'],
    facts: [
      { value: '5 / 5', label: 'positive tasks' },
      { value: '0.6895', label: 'mean' },
      { value: '0.7143', label: 'median' }
    ],
    conclusion: '强制修复均为正，但这是近乎按设计成立的 positive control。'
  }
} as const;

function BudgetDesk() {
  const [branch, setBranch] = useState<BudgetBranch>('sham');
  const selected = budgetBranches[branch];

  return (
    <div className="algorithm-panel__content budget-desk">
      <section className="budget-branch-picker" aria-labelledby="budget-branch-title">
        <div className="algorithm-section-heading">
          <MonoLabel>RECORDED BRANCH</MonoLabel>
          <h3 id="budget-branch-title">从同一冻结前缀分叉。</h3>
          <p>选择一条聚合轨迹。这里只回放仓库记录，不重新执行 Agent。</p>
        </div>
        <div className="budget-branch-buttons" aria-label="选择对照分支">
          {(Object.keys(budgetBranches) as BudgetBranch[]).map((key) => (
            <button
              type="button"
              key={key}
              onClick={() => setBranch(key)}
              aria-pressed={branch === key}
            >
              <span>{budgetBranches[key].label}</span>
              <small>{budgetBranches[key].caption}</small>
            </button>
          ))}
        </div>
        <div className="budget-warning">
          <MonoLabel tone="bloom">PRELIMINARY / 5 TASKS</MonoLabel>
          <p>Forced Gold Repair 是人为构造的正向控制，不等于自主 verifier，也不是部署效果。</p>
        </div>
      </section>

      <section className="budget-trace-sheet" aria-labelledby="budget-trace-title" aria-live="polite">
        <header>
          <div>
            <MonoLabel tone="green">REPOSITORY REPORTED</MonoLabel>
            <h3 id="budget-trace-title">{selected.label}</h3>
          </div>
          <span>AppWorld 0.1.3.post1</span>
        </header>

        <ol className="budget-trace">
          {selected.steps.map((step, index) => (
            <li key={step}>
              <span>0{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>

        <div className="budget-facts">
          {selected.facts.map((fact) => (
            <div key={fact.label}>
              <strong>{fact.value}</strong>
              <span>{fact.label}</span>
            </div>
          ))}
        </div>

        {branch === 'forced' && (
          <p className="budget-interval">描述性 seed-bootstrap 95% 区间：0.5429—0.8362</p>
        )}
        <p className="budget-conclusion">{selected.conclusion}</p>
      </section>

      <EvidenceNote>
        以上数字来自仓库汇总，本次网站构建未复跑。样本只有 5 个 outcome-blind dev tasks；当前研究主线状态为 PIVOT，paper-ready 计数为 0/3。
      </EvidenceNote>
    </div>
  );
}

type RagDocument = {
  id: string;
  title: string;
  excerpt: string;
  source: string;
};

const ragCorpus: readonly RagDocument[] = [
  {
    id: 'R-01',
    title: '语料构成',
    excerpt: '语料由 216 份确定性生成文档组成，覆盖 54 家虚构企业，每家 4 类文档。',
    source: 'README / dataset generator'
  },
  {
    id: 'R-02',
    title: '问题集合',
    excerpt: '仓库报告问题集合包含 10,368 条确定性生成问题；它不是人工标注的真实业务查询。',
    source: 'README / generator output'
  },
  {
    id: 'R-03',
    title: '混合召回',
    excerpt: '仓库系统结构使用 Dense bge-m3 与 BM25 生成候选，再交给后续融合步骤。',
    source: 'repository architecture'
  },
  {
    id: 'R-04',
    title: 'RRF 融合',
    excerpt: 'Reciprocal Rank Fusion（RRF）合并 Dense 与 BM25 的排序证据，避免直接比较异构分数。',
    source: 'repository architecture'
  },
  {
    id: 'R-05',
    title: '重排与输出',
    excerpt: 'bge-reranker-v2-m3 对融合候选重排，系统预期输出 top-5 证据集与带来源引用的回答。',
    source: 'repository architecture'
  },
  {
    id: 'R-06',
    title: 'Fusion 报告',
    excerpt: '240 条分层抽样、seed 7、CPU：Fusion top-10 文档召回 97.92%，页面召回 95%，证据命中 90.83%。',
    source: 'retrieval_20260814_133802.json'
  },
  {
    id: 'R-07',
    title: 'Rerank 报告',
    excerpt: '同一报告中，Rerank top-5 文档召回 97.92%，证据命中 83.75%，MRR 97.92%，NDCG 92.41%。',
    source: 'retrieval_20260814_133802.json'
  },
  {
    id: 'R-08',
    title: '验证字段',
    excerpt: '实际 benchmark metadata 记录 verified=0，因此这些结果不能描述为人工验证集表现。',
    source: 'benchmark metadata'
  },
  {
    id: 'R-09',
    title: '提交与复跑',
    excerpt: '报告文件位于 commit c1f5f1f，对应 benchmark code commit f5947c7；本次网站构建没有复跑评测。',
    source: 'repository inspection'
  },
  {
    id: 'R-10',
    title: '当前站内交互',
    excerpt: '这张材料盘只在浏览器里做 BM25-like 关键词检索和引用高亮，不连接 Milvus、bge embedding、reranker 或 LLM。',
    source: 'PROTOTYPE fixture'
  }
];

function tokensForSearch(value: string) {
  const normalized = value.toLowerCase().replace(/[（）()，。；：、/→]/g, ' ');
  const chunks = normalized.match(/[a-z0-9][a-z0-9._-]*|[\u3400-\u9fff]+/g) ?? [];
  const tokens: string[] = [];

  chunks.forEach((chunk) => {
    if (/^[\u3400-\u9fff]+$/.test(chunk)) {
      if (chunk.length <= 2) tokens.push(chunk);
      else {
        for (let index = 0; index < chunk.length - 1; index += 1) {
          tokens.push(chunk.slice(index, index + 2));
        }
      }
    } else {
      tokens.push(chunk);
    }
  });

  return tokens;
}

function countToken(tokens: readonly string[], target: string) {
  return tokens.reduce((count, token) => count + Number(token === target), 0);
}

function scoreCorpus(query: string) {
  const queryTokens = [...new Set(tokensForSearch(query))];
  if (!queryTokens.length) return [];

  const documents = ragCorpus.map((document) => ({
    ...document,
    tokens: tokensForSearch(`${document.title} ${document.excerpt} ${document.source}`)
  }));
  const averageLength = documents.reduce((sum, document) => sum + document.tokens.length, 0) / documents.length;

  return documents
    .map((document) => {
      const score = queryTokens.reduce((total, token) => {
        const termFrequency = countToken(document.tokens, token);
        if (!termFrequency) return total;
        const documentFrequency = documents.filter((candidate) => candidate.tokens.includes(token)).length;
        const inverseDocumentFrequency = Math.log(1 + (documents.length - documentFrequency + 0.5) / (documentFrequency + 0.5));
        const normalizedFrequency = (termFrequency * 2.2) /
          (termFrequency + 1.2 * (0.25 + 0.75 * (document.tokens.length / averageLength)));
        return total + inverseDocumentFrequency * normalizedFrequency;
      }, 0);

      return { ...document, score };
    })
    .filter((document) => document.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 3);
}

function highlightTerms(value: string, query: string) {
  const rawTerms = query
    .trim()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2)
    .sort((a, b) => b.length - a.length);

  if (!rawTerms.length) return value;
  const pattern = rawTerms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const pieces = value.split(new RegExp(`(${pattern})`, 'gi'));

  return pieces.map((piece, index) => (
    rawTerms.some((term) => piece.toLowerCase() === term.toLowerCase())
      ? <mark key={`${piece}-${index}`}>{piece}</mark>
      : <Fragment key={`${piece}-${index}`}>{piece}</Fragment>
  ));
}

function RagDesk() {
  const [draft, setDraft] = useState('引用 来源');
  const [query, setQuery] = useState('引用 来源');
  const results = useMemo(() => scoreCorpus(query), [query]);
  const presets = ['引用 来源', 'BM25 RRF', 'verified 数据'];

  function runQuery(value: string) {
    setDraft(value);
    setQuery(value);
  }

  return (
    <div className="algorithm-panel__content rag-desk">
      <section className="rag-query-sheet" aria-labelledby="rag-query-title">
        <div className="algorithm-section-heading">
          <MonoLabel>10-DOC PROTOTYPE CORPUS</MonoLabel>
          <h3 id="rag-query-title">在固定材料里找证据。</h3>
          <p>输入关键词，浏览器会运行一个小型 BM25-like 排序，并把命中的原文标出来。</p>
        </div>

        <form
          className="rag-search"
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(draft);
          }}
        >
          <label htmlFor="rag-query">检索词</label>
          <div>
            <input
              id="rag-query"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="例如：引用 来源"
              autoComplete="off"
            />
            <button type="submit">检索</button>
          </div>
        </form>

        <div className="rag-presets" aria-label="查询示例">
          <span>试试：</span>
          {presets.map((preset) => (
            <button type="button" key={preset} onClick={() => runQuery(preset)}>{preset}</button>
          ))}
        </div>

        <div className="rag-stack-note">
          <span>这里运行</span><b>关键词 → BM25-like → 引用高亮</b>
          <span>仓库结构</span><b>Dense + BM25 → RRF → Rerank → Citation</b>
        </div>
      </section>

      <section className="rag-results-sheet" aria-labelledby="rag-results-title" aria-live="polite">
        <div className="algorithm-section-heading algorithm-section-heading--row">
          <div>
            <MonoLabel tone="green">LOCAL SEARCH RESULT</MonoLabel>
            <h3 id="rag-results-title">引用片段</h3>
          </div>
          <span className="algorithm-count">{results.length} / 3</span>
        </div>

        {results.length ? (
          <ol className="rag-results">
            {results.map((document, index) => (
              <li key={document.id}>
                <header>
                  <span>[{index + 1}] {document.id}</span>
                  <b>{document.title}</b>
                </header>
                <p>{highlightTerms(document.excerpt, query)}</p>
                <cite>{document.source}</cite>
              </li>
            ))}
          </ol>
        ) : (
          <p className="algorithm-empty">固定语料中没有命中。试试「引用 来源」或「BM25 RRF」。</p>
        )}
      </section>

      <EvidenceNote>
        仓库报告基于 240 条确定性生成问题、seed 7、CPU，metadata 明确记录 verified=0。当前试用不是 Milvus、bge、reranker 或 LLM 在线服务，也不复现仓库 benchmark。
      </EvidenceNote>
    </div>
  );
}

type SelectionMode = 'random' | 'heuristic';

type VlmCard = {
  id: string;
  title: string;
  skill: string;
  quality: number;
  noisy: boolean;
};

const vlmCards: readonly VlmCard[] = [
  { id: 'S-01', title: '读图表后比较趋势', skill: 'chart', quality: 5, noisy: false },
  { id: 'S-02', title: '从票据中定位字段', skill: 'ocr', quality: 4, noisy: false },
  { id: 'S-03', title: '判断物体空间关系', skill: 'spatial', quality: 4, noisy: false },
  { id: 'S-04', title: '数出相同颜色图形', skill: 'counting', quality: 3, noisy: false },
  { id: 'S-05', title: '重复的图表问答', skill: 'chart', quality: 2, noisy: true },
  { id: 'S-06', title: '缺少关键图像信息', skill: 'grounding', quality: 1, noisy: true },
  { id: 'S-07', title: '多步物理示意推理', skill: 'reasoning', quality: 5, noisy: false },
  { id: 'S-08', title: '短事实型视觉问答', skill: 'knowledge', quality: 3, noisy: false }
];

const deterministicRandomOrder = ['S-04', 'S-01', 'S-08', 'S-02', 'S-06', 'S-07', 'S-03', 'S-05'];

function selectVlmCards(mode: SelectionMode, budget: number) {
  if (mode === 'random') {
    return deterministicRandomOrder
      .slice(0, budget)
      .map((id) => ({ card: vlmCards.find((candidate) => candidate.id === id)!, reason: 'fixed seed order' }));
  }

  const remaining = [...vlmCards];
  const selected: Array<{ card: VlmCard; reason: string }> = [];
  const coveredSkills = new Set<string>();

  while (selected.length < budget && remaining.length) {
    const scored = remaining.map((card) => {
      const diversityBonus = coveredSkills.has(card.skill) ? 0 : 3;
      const noisePenalty = card.noisy ? 4 : 0;
      return { card, score: card.quality * 2 + diversityBonus - noisePenalty, diversityBonus, noisePenalty };
    });
    scored.sort((a, b) => b.score - a.score || a.card.id.localeCompare(b.card.id));
    const winner = scored[0];
    selected.push({
      card: winner.card,
      reason: `质量 ${winner.card.quality}×2 + 新技能 ${winner.diversityBonus} − 噪声 ${winner.noisePenalty}`
    });
    coveredSkills.add(winner.card.skill);
    remaining.splice(remaining.findIndex((candidate) => candidate.id === winner.card.id), 1);
  }

  return selected;
}

function VlmDesk() {
  const [mode, setMode] = useState<SelectionMode>('heuristic');
  const [budget, setBudget] = useState(4);
  const selection = useMemo(() => selectVlmCards(mode, budget), [budget, mode]);
  const selectedIds = new Set(selection.map((item) => item.card.id));

  return (
    <div className="algorithm-panel__content vlm-desk">
      <section className="vlm-pool-sheet" aria-labelledby="vlm-pool-title">
        <div className="algorithm-section-heading">
          <MonoLabel>SYNTHETIC FIXTURE</MonoLabel>
          <h3 id="vlm-pool-title">从小样本池里挑一批材料。</h3>
          <p>这些卡片专门为交互构造，不来自 ScienceQA，也不是训练或评测结果。</p>
        </div>

        <div className="vlm-controls">
          <div className="vlm-mode-buttons" aria-label="选择挑选方法">
            <button type="button" onClick={() => setMode('random')} aria-pressed={mode === 'random'}>Fixed random</button>
            <button type="button" onClick={() => setMode('heuristic')} aria-pressed={mode === 'heuristic'}>透明 heuristic</button>
          </div>
          <label>
            <span>样本预算</span>
            <select value={budget} onChange={(event) => setBudget(Number(event.target.value))}>
              <option value={3}>3 张</option>
              <option value={4}>4 张</option>
              <option value={5}>5 张</option>
            </select>
          </label>
        </div>

        <ul className="vlm-card-pool" aria-label="合成样本池">
          {vlmCards.map((card) => (
            <li key={card.id} data-selected={selectedIds.has(card.id)} data-noisy={card.noisy}>
              <span>{card.id}</span>
              <h4>{card.title}</h4>
              <p>{card.skill} · quality {card.quality}{card.noisy ? ' · noisy' : ''}</p>
              {selectedIds.has(card.id) && <b>已选</b>}
            </li>
          ))}
        </ul>
      </section>

      <section className="vlm-selection-sheet" aria-labelledby="vlm-selection-title" aria-live="polite">
        <div className="algorithm-section-heading">
          <MonoLabel tone="green">{mode === 'random' ? 'FIXED RANDOM' : 'DEMO HEURISTIC'}</MonoLabel>
          <h3 id="vlm-selection-title">选中的 {selection.length} 张材料</h3>
        </div>

        <ol className="vlm-selection">
          {selection.map((item, index) => (
            <li key={item.card.id}>
              <span>0{index + 1}</span>
              <div>
                <b>{item.card.id} / {item.card.skill}</b>
                <p>{item.reason}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="vlm-receipts">
          <div><span>J02</span><p>128 samples / 16 steps / A10</p><b>USER-REPORTED RECEIPT</b></div>
          <div><span>P10</span><p>random1000 + held-out512 / PID overlap 0</p><b>REPOSITORY REPORTED</b></div>
          <div><span>J10</span><p>remote launch</p><b>PENDING</b></div>
        </div>
      </section>

      <EvidenceNote>
        <strong>NOT COINCIDE RESULT。</strong> 当前 heuristic 只是可解释的站内教学原型。仓库尚无 faithful COINCIDE benchmark、多 seed 选择优势或论文结论；J10 仍待远端启动。
      </EvidenceNote>
    </div>
  );
}

const panels: Record<LabKey, () => ReactNode> = {
  compute: () => <ComputeDesk />,
  budget: () => <BudgetDesk />,
  rag: () => <RagDesk />,
  vlm: () => <VlmDesk />
};

export default function AlgorithmLab() {
  const [active, setActive] = useState<LabKey>('compute');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const requestedTab = new URLSearchParams(window.location.search).get('tab');
    if (labs.some((lab) => lab.key === requestedTab)) setActive(requestedTab as LabKey);
  }, []);

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % labs.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + labs.length) % labs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = labs.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextLab = labs[nextIndex];
    setActive(nextLab.key);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <section className="algorithm-lab-desk" aria-label="算法实验桌">
      <div className="algorithm-lab-desk__back-sheet" aria-hidden="true" />
      <div className="algorithm-tabs" role="tablist" aria-label="选择实验材料">
        {labs.map((lab, index) => (
          <button
            type="button"
            role="tab"
            id={`algorithm-tab-${lab.key}`}
            aria-controls={`algorithm-panel-${lab.key}`}
            aria-selected={active === lab.key}
            tabIndex={active === lab.key ? 0 : -1}
            key={lab.key}
            ref={(node) => { tabRefs.current[index] = node; }}
            onClick={() => setActive(lab.key)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
          >
            <span>{lab.folio}</span>
            <b>{lab.title}</b>
            <small>{lab.kind}</small>
          </button>
        ))}
      </div>

      {labs.map((lab) => {
        const Panel = panels[lab.key];
        return (
          <article
            className="algorithm-panel"
            role="tabpanel"
            id={`algorithm-panel-${lab.key}`}
            aria-labelledby={`algorithm-tab-${lab.key}`}
            hidden={active !== lab.key}
            key={lab.key}
          >
            <header className="algorithm-panel__header">
              <span>FILE {lab.folio}</span>
              <p>{lab.title}</p>
              <b>LOCAL / DETERMINISTIC</b>
            </header>
            <Panel />
          </article>
        );
      })}
    </section>
  );
}
