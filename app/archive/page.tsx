import type { Metadata } from 'next';
import ArchiveDesk from '@/components/ArchiveDesk';
import ChloesArchiveWordmark from '@/components/ChloesArchiveWordmark';
import WorldNav from '@/components/WorldNav';
import XiaoyueMark from '@/components/XiaoyueMark';

export const metadata: Metadata = {
  title: '私人档案',
  description: '小悦的个人档案：可以移动、打开，也会继续生长。',
  alternates: { canonical: '/archive/' }
};

export default function ArchivePage() {
  return (
    <div className="archive-world archive-world--soft">
      <WorldNav active="archive" />
      <main id="main-content">
        <header className="archive-soft-intro">
          <div className="archive-soft-intro__meta">
            <XiaoyueMark />
            <p>A.01 / PERSONAL ARCHIVE / 2026</p>
          </div>
          <ChloesArchiveWordmark as="h1" stacked />
          <div className="archive-soft-intro__copy">
            <p>私人档案</p>
            <p>作品、实验、笔记和仍在发芽的好奇心，都留在这张桌上。</p>
          </div>
        </header>

        <ArchiveDesk />
      </main>
      <footer className="archive-world__footer archive-world__footer--soft">
        <span>CHLOE’S ARCHIVE</span>
        <span>还会继续长大 / STILL GROWING</span>
      </footer>
    </div>
  );
}
