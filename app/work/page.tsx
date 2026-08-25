import type { Metadata } from 'next';
import ChloesArchiveWordmark from '@/components/ChloesArchiveWordmark';
import { learningForks, originalProjects } from '@/components/ProjectData';
import ProjectTrialIndex from '@/components/ProjectTrialIndex';
import WorldNav from '@/components/WorldNav';
import XiaoyueMark from '@/components/XiaoyueMark';
import '../work-soft.css';
import '../project-trial-index.css';

export const metadata: Metadata = {
  title: 'Work — 项目试用索引',
  description: '打开小悦的真实项目：在线页面、演示视频、本地运行说明、源码与证据边界。',
  alternates: { canonical: '/work/' },
  openGraph: {
    title: 'Work — 小悦的项目试用索引',
    description: '在线页面、真实演示、本地运行说明和源码，各自标清边界。',
    url: '/work/'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Work — 小悦的项目试用索引',
    description: '在线页面、真实演示、本地运行说明和源码，各自标清边界。'
  }
};

export default function WorkIndexPage() {
  return (
    <div className="work-world work-soft-world work-index-world">
      <WorldNav active="work" />

      <main className="work-index-main">
        <section className="work-index-hero" aria-labelledby="work-title">
          <header className="work-index-hero__copy">
            <div className="work-index-hero__meta">
              <XiaoyueMark />
              <p>W.00 / PROJECT TRIAL SHELF / 2026</p>
            </div>
            <h1 id="work-title">项目不只陈列，<br /><span>打开就能继续。</span></h1>
            <p className="work-index-hero__lede">
              能在网页里直接操作的，就标成在线试用；有真实录屏的，就打开视频；需要环境和凭据的项目，把本地运行说明与源码放在一起。
            </p>
            <a className="work-index-hero__jump" href="#project-trials">
              打开项目索引 <span aria-hidden="true">↓</span>
            </a>
          </header>

          <aside className="work-index-hero__folder" aria-label="项目入口分类">
            <span className="work-index-hero__tab">OPEN / TRY / INSPECT</span>
            <div className="work-index-hero__folder-sheet">
              <p>真实入口分成四种</p>
              <ol>
                <li><b>LIVE</b><span>直接打开网页</span></li>
                <li><b>VIDEO</b><span>观看真实演示</span></li>
                <li><b>LOCAL</b><span>按说明本地运行</span></li>
                <li><b>SOURCE</b><span>检查源码与材料</span></li>
              </ol>
              <small>Fork 与学习材料会单独披露上游，不混进原创项目。</small>
            </div>
            <ChloesArchiveWordmark as="p" className="work-index-hero__signature" prefix="from" decorative />
          </aside>
        </section>

        <div id="project-trials">
          <ProjectTrialIndex
            projects={originalProjects}
            heading="九份公开项目材料。"
            intro="每张纸都可以打开。入口状态来自 2026-08-25 的仓库与 HTTP 核验；没有公开服务的项目不会被写成在线 Demo。"
          />
        </div>

        <section className="work-index-featured" aria-labelledby="featured-case-title">
          <div>
            <p>FEATURED CASE / W.01</p>
            <h2 id="featured-case-title">想看完整证据链，<br />从企业级 RAG 开始。</h2>
          </div>
          <div>
            <p>从 216 份文档、混合检索与重排，到带引用的回答。指标保留运行上下文，报告文件与 Benchmark code commit 分开标注。</p>
            <a href="/work/enterprise-agentic-rag/">打开完整案例 <span aria-hidden="true">→</span></a>
          </div>
        </section>

        <details className="work-index-forks">
          <summary>
            <span>F.01—F.03 / LEARNING FORKS</span>
            <strong>查看学习、镜像与模板改造</strong>
            <i aria-hidden="true">＋</i>
          </summary>
          <ProjectTrialIndex
            projects={learningForks}
            heading="这些不是原创 Work。"
            intro="保留它们是为了记录学习路径。每项都写明上游、个人改动与真实归属。"
          />
        </details>
      </main>
    </div>
  );
}
