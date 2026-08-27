import type { Metadata } from 'next';
import ArchiveDesk from '@/components/ArchiveDesk';
import WorldNav from '@/components/WorldNav';

export const metadata: Metadata = {
  title: '小悦的数字收藏室',
  description: '小悦的数字收藏室：个人档案、AI 作品与仍在生长的实验。',
  alternates: { canonical: '/' }
};

export default function HomePage() {
  return (
    <div className="archive-world archive-world--soft archive-router">
      <WorldNav active="archive" />
      <main id="main-content"><ArchiveDesk /></main>
    </div>
  );
}
