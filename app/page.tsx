import ArchiveDesk from '@/components/ArchiveDesk';
import LaptopPreview from '@/components/LaptopPreview';
import Logo from '@/components/Logo';

export default function HomePage() {
  return (
    <div className="archive-page">
      <main className="pb-20 pt-10 sm:pt-14">
        <Logo />
        <div className="mt-10 sm:mt-12">
          <ArchiveDesk />
        </div>
        <LaptopPreview />
      </main>
    </div>
  );
}
