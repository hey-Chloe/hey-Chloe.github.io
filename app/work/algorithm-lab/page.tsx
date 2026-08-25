import type { Metadata } from 'next';
import AlgorithmLab from '@/components/AlgorithmLab';
import WorldNav from '@/components/WorldNav';
import '../../work-soft.css';
import '../../algorithm-lab.css';

export const metadata: Metadata = {
  title: '算法控制台 — Work',
  description: '在浏览器里检查四个确定性算法原型，以及它们各自的证据边界。',
  alternates: { canonical: '/work/algorithm-lab/' },
  openGraph: {
    title: '算法控制台 — Chloe’s Archive',
    description: 'Compute、Agent、Retrieval 与 Data Selection 的四个可操作实验模块。',
    url: '/work/algorithm-lab/'
  },
  twitter: {
    card: 'summary_large_image',
    title: '算法控制台 — Chloe’s Archive',
    description: '四个在浏览器中运行的确定性算法原型。'
  }
};

export default function AlgorithmLabPage() {
  return (
    <div className="work-world work-soft-world algorithm-lab-world">
      <WorldNav active="work" />

      <main className="algorithm-lab-main">
        <header className="algorithm-lab-intro" aria-labelledby="work-title">
          <div className="algorithm-lab-intro__row">
            <div>
              <span className="algorithm-lab-intro__eyebrow">WORK / ALGORITHM LAB</span>
              <h1 id="work-title">算法控制台</h1>
              <p>
                四个可直接操作的实验模块。页面交互在浏览器本地运行；仓库数字只按原报告引用，不伪装成在线模型或本次复跑结果。
              </p>
            </div>
            <a href="/work/" className="algorithm-lab-back">
              <span aria-hidden="true">←</span> 返回 Work
            </a>
          </div>
        </header>

        <AlgorithmLab />

        <footer className="algorithm-lab-footer">
          <span>EVIDENCE NOTE</span>
          <p>
            <b>PROTOTYPE</b> 是为站内试用构造的确定性交互；<b>REPOSITORY REPORTED</b> 是仓库里已有、但本次没有重新运行的结果。每个模块都单独标注证据边界。
          </p>
        </footer>
      </main>
    </div>
  );
}
