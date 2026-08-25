import type { Metadata } from 'next';
import ArchiveDesk from '@/components/ArchiveDesk';
import ChloesArchiveWordmark from '@/components/ChloesArchiveWordmark';
import WorldNav from '@/components/WorldNav';
import XiaoyueMark from '@/components/XiaoyueMark';

export const metadata: Metadata = {
  title: '小悦的数字收藏室',
  description: '小悦的数字收藏室：个人档案、AI 作品与仍在生长的实验。',
  alternates: { canonical: '/' }
};

export default function HomePage() {
  return (
    <div className="xiaoyue-home xiaoyue-home--soft">
      <WorldNav />
      <main id="main-content">
        <section className="soft-home" aria-labelledby="soft-home-title">
          <header className="soft-home__intro">
            <div className="soft-home__eyebrow">
              <XiaoyueMark />
              <p>A PERSONAL DIGITAL ROOM / 2026</p>
            </div>
            <ChloesArchiveWordmark
              as="h1"
              id="soft-home-title"
              stacked
              ariaLabel="Chloe’s Archive，小悦的数字收藏室"
            />
            <div className="soft-home__copy">
              <p>小悦的数字收藏室。</p>
              <p>做过的、试过的，以及仍在生长的，都散在桌上。</p>
            </div>
          </header>

          <ArchiveDesk />
        </section>

      </main>

      <footer className="xiaoyue-footer xiaoyue-footer--soft">
        <XiaoyueMark label />
        <span>做过 / 试过 / 仍在生长</span>
        <span>© 2026 XIAOYUE</span>
      </footer>
    </div>
  );
}
