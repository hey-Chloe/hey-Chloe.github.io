import Logo from '@/components/Logo';

export default function LaptopPreview() {
  return (
    <section className="mx-auto max-w-[1180px] px-5 pb-12 pt-20">
      <Logo small />
      <div className="relative mx-auto mt-12 max-w-[980px]">
        <div className="rounded-t-2xl border-[14px] border-[#151b2a] bg-[#050605] p-6 shadow-object">
          <div className="relative aspect-[16/9] overflow-hidden border border-white/25 bg-black">
            <div className="absolute left-4 top-4 z-10">
              <span className="menu-link text-xs">Menu</span>
            </div>
            <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 scale-75">
              <Logo small />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-8 bg-paper/90" />
            <img src="/images/laptop-collage.svg" alt="项目档案桌预览" className="h-full w-full object-cover opacity-90" />
          </div>
        </div>
        <div className="mx-auto h-7 w-[106%] -translate-x-[3%] rounded-b-[50%] bg-gradient-to-r from-[#111827] via-[#aeb6bb] to-[#111827] shadow-object" />
      </div>
    </section>
  );
}
