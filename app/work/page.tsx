import type { Metadata } from 'next';
import ChloesArchiveWordmark from '@/components/ChloesArchiveWordmark';
import {
  learningForks,
  productProjects,
  researchProjects,
  systemProjects
} from '@/components/ProjectData';
import ProjectTrialIndex from '@/components/ProjectTrialIndex';
import ReminderCatDemo from '@/components/ReminderCatDemo';
import WorldNav from '@/components/WorldNav';
import XiaoyueMark from '@/components/XiaoyueMark';
import '../work-soft.css';
import '../project-trial-index.css';
import '../work-index-compact.css';

export const metadata: Metadata = {
  title: 'Work — 项目与实验',
  description: '小悦的产品、系统、算法与研究项目档案。',
  alternates: { canonical: '/work/' },
  openGraph: {
    title: 'Work — 小悦的项目与实验',
    description: '小悦的产品、系统、算法与研究项目档案。',
    url: '/work/'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Work — 小悦的项目与实验',
    description: '小悦的产品、系统、算法与研究项目档案。'
  }
};

export default function WorkIndexPage() {
  return (
    <div className="work-world work-soft-world work-index-world">
      <WorldNav active="work" />

      <main className="work-index-main">
        <section className="work-index-masthead" aria-labelledby="work-title">
          <div className="work-index-masthead__meta">
            <XiaoyueMark />
            <p>W.00 / WORK / 2026</p>
          </div>
          <div className="work-index-masthead__title-row">
            <h1 id="work-title">小悦的作品桌</h1>
            <ChloesArchiveWordmark as="p" className="work-index-masthead__signature" prefix="from" decorative />
          </div>
          <p className="work-index-masthead__note">一些在做、在用，也在继续长大的东西。</p>
        </section>

        <div id="remindercat-demo" className="work-index-live-demo">
          <ReminderCatDemo />
        </div>

        <div id="project-trials">
          <ProjectTrialIndex
            projects={productProjects}
            heading="产品"
            intro="移动端、后台、创作者平台、电商与小游戏。"
          />
          <ProjectTrialIndex
            projects={researchProjects}
            heading="算法与研究"
            intro="排序、量化、Agent 评估、RAG、VLM 与论文预研。"
          />
          <ProjectTrialIndex
            projects={systemProjects}
            heading="系统与早期作品"
            intro="工程工具、Agent Runtime、安全实验和浏览器作品。"
          />
        </div>

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
