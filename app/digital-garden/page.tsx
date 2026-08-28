import type { Metadata } from 'next';
import Link from 'next/link';
import WorldNav from '@/components/WorldNav';
import XiaoyueMark from '@/components/XiaoyueMark';
import './garden.css';

export const metadata: Metadata = {
  title: '数字花园',
  description: '从模型与算法、产品与系统、近期笔记和早期记录进入小悦持续生长的知识档案。',
  alternates: { canonical: '/digital-garden/' }
};

const gardenPaths = [
  {
    id: 'garden-models', shortLabel: '模型与算法', folio: 'SEED 01 / LAB', title: '模型与算法',
    description: 'Agent、检索、排序、VLM 与评测。实验状态、失败和证据都留在桌上。',
    href: '/lab/', action: '查看实验', kind: 'specimen'
  },
  {
    id: 'garden-systems', shortLabel: '产品与系统', folio: 'SEED 02 / WORK', title: '产品与系统',
    description: '把能运行的系统、真实试用入口和项目边界整理成作品。',
    href: '/work/', action: '打开作品', kind: 'packet'
  },
  {
    id: 'garden-notes', shortLabel: '近期笔记', folio: 'SEED 03 / NOTES', title: '近期笔记',
    description: '项目记录、实验复现、安全实践，以及还在形成中的想法。',
    href: '/blog/', action: '阅读笔记', kind: 'ledger'
  },
  {
    id: 'garden-early', shortLabel: '早期记录', folio: 'SEED 04 / EARLY NOTES', title: '早期记录',
    description: 'Java、HTTP 与 Web 安全的基础学习痕迹，保留成长真正发生过的位置。',
    href: '/blog/#early-notes-title', action: '翻到早期记录', kind: 'field-note'
  }
] as const;

export default function DigitalGardenPage() {
  return (
    <div className="garden-world">
      <WorldNav />
      <main id="main-content" className="garden-main">
        <header className="garden-hero">
          <div className="garden-hero__copy">
            <p className="garden-folio"><XiaoyueMark /> G.01 / DIGITAL GARDEN</p>
            <h1>数字花园</h1>
            <p className="garden-lede">这里不是课程目录，而是一张持续生长的知识地图。选择今天想看的方向，或直接打开桌上的档案物。</p>
          </div>
          <nav className="garden-seed-picker" aria-label="选择一条知识路径">
            <p><span aria-hidden="true">✿</span> 先选一颗种子</p>
            <div>
              {gardenPaths.map((path, index) => (
                <a key={path.id} href={`#${path.id}`}>
                  <span>{String(index + 1).padStart(2, '0')}</span>{path.shortLabel}
                </a>
              ))}
            </div>
          </nav>
        </header>

        <section className="garden-table" aria-labelledby="garden-table-title">
          <div className="garden-table__heading">
            <p>FIELD INDEX / 2026</p>
            <h2 id="garden-table-title">从哪一页开始？</h2>
            <span>每件物品都可以直接打开。</span>
          </div>
          <div className="garden-objects">
            {gardenPaths.map((path) => (
              <article id={path.id} key={path.id} className={`garden-object garden-object--${path.kind}`}>
                <Link href={path.href} aria-label={`${path.action}：${path.title}`}>
                  <span className="garden-object__folio">{path.folio}</span>
                  <span className="garden-object__seed" aria-hidden="true" />
                  <h3>{path.title}</h3>
                  <p>{path.description}</p>
                  <span className="garden-object__action">{path.action}<b aria-hidden="true">↗</b></span>
                </Link>
              </article>
            ))}
          </div>
          <p className="garden-table__note"><span aria-hidden="true">✦</span> 旧内容不会被藏起来，只会回到它在成长路径里的位置。</p>
        </section>
      </main>
    </div>
  );
}
