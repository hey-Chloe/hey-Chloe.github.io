import type { Metadata } from 'next';
import EvidenceBadge from '@/components/EvidenceBadge';
import ChloesArchiveWordmark from '@/components/ChloesArchiveWordmark';
import WorldNav from '@/components/WorldNav';
import '../../work-soft.css';

export const metadata: Metadata = {
  title: '企业级 RAG — Work',
  description: '从 216 份文档到可追溯回答：Enterprise Agentic RAG 的证据型作品入口。',
  alternates: { canonical: '/work/enterprise-agentic-rag/' },
  openGraph: {
    title: '企业级可追溯 RAG — Chloe’s Archive',
    description: '从 216 份文档到带引用回答，逐段检查检索、融合、重排与证据边界。',
    url: '/work/enterprise-agentic-rag/'
  },
  twitter: {
    card: 'summary_large_image',
    title: '企业级可追溯 RAG — Chloe’s Archive',
    description: '从 216 份文档到带引用回答，逐段检查检索、融合、重排与证据边界。'
  }
};

const source = 'https://github.com/hey-Chloe/enterprise-agentic-rag';
const reportCommit = 'c1f5f1ff1737b7deb9baf8345735d39b42635219';
const benchmarkCodeCommit = 'f5947c7';
const retrievalReport = `${source}/blob/${reportCommit}/benchmarks/retrieval_20260814_133802.json`;

const pipeline = [
  {
    index: '01',
    label: '文档进入',
    primary: '216 份文档',
    detail: '54 家虚构企业 × 4 类文档',
    note: '仓库报告语料'
  },
  {
    index: '02',
    label: 'Retrieval',
    primary: 'Dense + BM25',
    detail: 'Milvus 混合候选召回',
    note: '仓库结构'
  },
  {
    index: '03',
    label: '融合',
    primary: 'RRF',
    detail: '合并多路排序证据',
    note: '仓库结构'
  },
  {
    index: '04',
    label: '重排',
    primary: 'CrossEncoder',
    detail: '选取 top-5 证据集',
    note: '仓库结构'
  },
  {
    index: '05',
    label: '回答',
    primary: 'Citation',
    detail: '携带来源与页码引用',
    note: '预期输出结构'
  }
];

const metrics = [
  {
    value: '10,368',
    name: '生成的检索问题',
    direction: '描述性数据集规模',
    sample: '完整确定性合成问题集；不是基准抽样数量',
    method: '语料生成器 / seed 42',
    source: 'README 数据集生成输出'
  },
  {
    value: '97.92%',
    name: '文档召回率',
    direction: '越高越好',
    sample: '240 条确定性生成问题分层抽样 / seed 7；verified=0',
    method: 'Fusion top-10 / CPU benchmark',
    source: '报告文件 commit c1f5f1f / benchmark code f5947c7'
  },
  {
    value: '90.83%',
    name: '证据命中率',
    direction: '越高越好',
    sample: '240 条确定性生成问题分层抽样 / seed 7；verified=0',
    method: 'Fusion top-10 / CPU benchmark',
    source: '报告文件 commit c1f5f1f / benchmark code f5947c7'
  }
];

export default function WorkPage() {
  return (
    <div className="work-world work-soft-world">
      <WorldNav active="work" />

      <main className="work-main">
        <section className="work-hero" aria-labelledby="work-title">
          <div className="work-hero__copy">
            <div className="work-hero__meta">
              <p>W.01 / RAG / CASE FILE</p>
              <EvidenceBadge state="REPOSITORY REPORTED" detail="本次未复跑" />
            </div>

            <div className="work-hero__title-wrap">
              <span className="work-hero__tab" aria-hidden="true">FROM ARCHIVE</span>
              <h1 id="work-title">
                从 216 份文档，
                <span>到可追溯的回答。</span>
              </h1>
            </div>

            <p className="work-hero__lede">
              多格式文档经过层级切块、混合检索、融合与重排，最后把答案重新连回来源。这里不做一张想象中的产品截图，而是打开系统，让每一步都能被检查。
            </p>

            <div className="work-hero__actions">
              <a href={source} target="_blank" rel="noreferrer" className="work-source">
                查看源代码 <span aria-hidden="true">↗</span>
              </a>
              <p><b>证据边界</b>系统结构与数字来自固定仓库材料；本次网站构建没有重新运行评测。</p>
            </div>
          </div>

          <figure className="product-stage" aria-labelledby="rag-flow-title">
            <div className="product-stage__paper" aria-hidden="true">
              <span>W.01</span>
            </div>

            <figcaption className="product-stage__caption">
              <span>系统剖面 / STATIC CUTAWAY</span>
              <strong>REPOSITORY-LED RECONSTRUCTION</strong>
              <em>NOT PRODUCT UI</em>
            </figcaption>

            <div className="product-stage__screen">
              <header>
                <div>
                  <span>enterprise-agentic-rag</span>
                  <small>检索链路 / 静态视图</small>
                </div>
                <span className="product-stage__state">来源已连接</span>
              </header>

              <div className="product-stage__title">
                <p>输入 → 系统 → 输出</p>
                <h2 id="rag-flow-title">一次查询，经过五段可检查链路。</h2>
              </div>

              <ol className="rag-flow">
                {pipeline.map((stage) => (
                  <li key={stage.index}>
                    <div className="rag-flow__index"><span>{stage.index}</span><i aria-hidden="true" /></div>
                    <p>{stage.label}</p>
                    <b>{stage.primary}</b>
                    <small>{stage.detail}</small>
                    <em>{stage.note}</em>
                  </li>
                ))}
              </ol>

              <footer>
                <span>输出结构</span>
                <b>top-5 证据集 → 带引用回答</b>
                <small>只展示仓库结构，不虚构查询或回答。</small>
              </footer>
            </div>

            <ChloesArchiveWordmark
              as="p"
              className="product-stage__signature"
              prefix="from"
              decorative
            />
          </figure>
        </section>

        <section className="work-evidence" aria-labelledby="work-evidence-title">
          <header className="work-section-heading">
            <p>02 / EVALUATION</p>
            <h2 id="work-evidence-title">数字不离开它的上下文。</h2>
            <span>仓库报告 / 2026-08-14 13:38:02 / report c1f5f1f / code {benchmarkCodeCommit}</span>
          </header>

          <div className="work-metrics">
            {metrics.map((metric, index) => (
              <article className="metric-proof" key={metric.name}>
                <header>
                  <span>指标 {String(index + 1).padStart(2, '0')}</span>
                  <EvidenceBadge state="REPOSITORY REPORTED" detail="本次未复跑" />
                </header>
                <strong>{metric.value}</strong>
                <h3>{metric.name}</h3>
                <dl>
                  <div><dt>方向</dt><dd>{metric.direction}</dd></div>
                  <div><dt>数据 / 样本</dt><dd>{metric.sample}</dd></div>
                  <div><dt>方法 / 环境</dt><dd>{metric.method}</dd></div>
                  <div><dt>来源材料</dt><dd>{metric.source}</dd></div>
                  <div><dt>复跑状态</dt><dd>本次网站构建未复跑</dd></div>
                </dl>
              </article>
            ))}
          </div>

          <p className="work-evidence__note">
            <b>证据边界。</b>以上数值原样呈现为 <span>REPOSITORY REPORTED</span>，不是本次新运行或独立验证的结果。
            两个百分比来自 10,368 条确定性生成问题中的 240 条分层抽样；报告记录 <code>verified=0</code>，不作为人工验证集结果。{' '}
            <a href={retrievalReport} target="_blank" rel="noreferrer">查看固定报告 ↗</a>
          </p>
        </section>

        <section className="work-media-request" aria-labelledby="work-media-title">
          <div>
            <p>03 / MEDIA REQUEST</p>
            <h2 id="work-media-title">下一份证明，应该来自真实交互。</h2>
          </div>
          <dl>
            <div><dt>素材</dt><dd>真实产品屏幕录制</dd></div>
            <div><dt>过程</dt><dd>Query → retrieval trace → cited answer</dd></div>
            <div><dt>位置</dt><dd>完整案例中替换当前静态系统剖面</dd></div>
            <div><dt>验收</dt><dd>引用可读、界面稳定，不把预置或虚构输出伪装成实时结果</dd></div>
          </dl>
          <p>素材到位以前，这里保持为 evidence-led 作品入口，不生成假的产品电影。</p>
          <a className="work-back-file" href="/archive/">
            <span>收回档案</span>
            <b>A.00 / ARCHIVE</b>
          </a>
        </section>
      </main>
    </div>
  );
}
