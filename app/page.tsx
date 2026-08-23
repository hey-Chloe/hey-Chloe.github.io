import type { Metadata } from 'next';
import Link from 'next/link';
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
              <p>把做过、试过，以及仍在生长的东西，留在这里。</p>
            </div>
          </header>

          <ArchiveDesk />
        </section>

        <section className="soft-worlds" aria-labelledby="soft-worlds-title">
          <div className="soft-worlds__heading">
            <p className="world-folio">W / L — FROM THE ARCHIVE</p>
            <h2 id="soft-worlds-title">纸张打开以后，<br />作品和实验自己说话。</h2>
          </div>
          <div className="soft-worlds__sheets">
            <Link href="/work" className="soft-world-sheet soft-world-sheet--work">
              <span>01 / WORK</span>
              <h3>作品</h3>
              <p>产品、系统与真实输出。中文讲故事，技术标签保留原名。</p>
              <i>打开作品 ↗</i>
            </Link>
            <Link href="/lab" className="soft-world-sheet soft-world-sheet--lab">
              <span>02 / LAB</span>
              <h3>实验桌</h3>
              <p>模型、Prompt、评测与失败材料，一份份摊开检查。</p>
              <i>查看实验 ↗</i>
            </Link>
          </div>
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
