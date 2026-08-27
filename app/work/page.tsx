import type { Metadata } from 'next';
import ChloesArchiveWordmark from '@/components/ChloesArchiveWordmark';
import {
  learningForks,
  productProjects,
  researchProjects,
  systemProjects
} from '@/components/ProjectData';
import ProjectDesk from '@/components/ProjectDesk';
import ReminderCatDemo from '@/components/ReminderCatDemo';
import WorldNav from '@/components/WorldNav';
import XiaoyueMark from '@/components/XiaoyueMark';
import '../work-soft.css';
import '../work-index-compact.css';
import '../project-desk.css';

const projectDeskGroups = [
  {
    id: 'product',
    label: '产品',
    projects: productProjects
  },
  {
    id: 'research',
    label: '算法与研究',
    projects: researchProjects
  },
  {
    id: 'systems',
    label: '系统、早期作品与学习分支',
    projects: [...systemProjects, ...learningForks]
  }
] as const;

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
            <p>W.00 / 作品与实验 / 2026</p>
          </div>
          <div className="work-index-masthead__title-row">
            <h1 id="work-title">作品收藏</h1>
            <ChloesArchiveWordmark as="p" className="work-index-masthead__signature" prefix="from" decorative />
          </div>
          <p className="work-index-masthead__note">做成的产品、系统和研究原型，按真实状态留在桌面上。</p>
        </section>

        <ProjectDesk groups={projectDeskGroups} />

        <div id="remindercat-demo" className="work-index-live-demo">
          <ReminderCatDemo />
        </div>
      </main>
    </div>
  );
}
