import ArchiveNav from '@/components/ArchiveNav';

export default function PageIntro({
  title,
  children
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="archive-page inner-page-stage">
      <ArchiveNav compact />
      <main className="inner-page-content mx-auto max-w-[980px] px-5 pb-24 pt-10">
        <h1 className="inner-page-title text-center text-[4.5rem] leading-[0.92] sm:text-[7rem]">{title}</h1>
        <div className="inner-page-body">{children}</div>
      </main>
    </div>
  );
}
