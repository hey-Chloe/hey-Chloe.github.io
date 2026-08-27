import type { Metadata } from 'next';
import ArchiveDesk from '@/components/ArchiveDesk';
import WorldNav from '@/components/WorldNav';

export const metadata: Metadata = {
  title: '私人档案',
  description: '小悦的个人档案：可以移动、打开，也会继续生长。',
  alternates: { canonical: '/archive/' }
};

export default function ArchivePage() {
  return (
    <div className="archive-world archive-world--soft archive-router">
      <WorldNav active="archive" />
      <main id="main-content"><ArchiveDesk /></main>
    </div>
  );
}
