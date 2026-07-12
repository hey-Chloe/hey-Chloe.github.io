'use client';

import { useRef, useState } from 'react';
import ArchiveObject from '@/components/ArchiveObject';
import Logo from '@/components/Logo';
import { archiveObjects, menuItems } from '@/components/ArchiveData';
import Link from 'next/link';

export default function ArchiveDesk() {
  const deskRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>('about');
  const [zMap, setZMap] = useState<Record<string, number>>(() =>
    Object.fromEntries(archiveObjects.map((item) => [item.id, item.z]))
  );
  const selected = archiveObjects.find((item) => item.id === active) ?? archiveObjects[0];

  const bringToFront = (id: string) => {
    setActive(id);
    setZMap((current) => {
      const next = Math.max(...Object.values(current), 20) + 1;
      return { ...current, [id]: next };
    });
  };

  return (
    <section className="mx-auto max-w-[1320px] px-4 sm:px-6">
      <div ref={deskRef} className="black-desk mx-auto aspect-[16/10] w-full max-w-[1080px] rounded-[28px] sm:rounded-[38px]">
        <div className="absolute left-6 top-5 z-30">
          <button className="menu-link text-xs">Menu</button>
        </div>
        <div className="absolute left-1/2 top-5 z-30 -translate-x-1/2">
          <Logo small />
        </div>
        <nav className="absolute right-5 top-5 z-30 hidden gap-4 text-xs md:flex">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="menu-link">
              {item.label}
            </Link>
          ))}
        </nav>

        {archiveObjects.map((object) => (
          <ArchiveObject
            key={object.id}
            object={object}
            active={active === object.id}
            onHover={setActive}
            containerRef={deskRef}
            zIndex={zMap[object.id] ?? object.z}
            onBringToFront={bringToFront}
          />
        ))}

        <div className="absolute inset-x-0 bottom-0 z-30 h-10 bg-paper/90" />
      </div>

      <div className="mx-auto mt-7 max-w-[1080px] text-center">
        <p className="green-caption text-lg sm:text-2xl">
          <span className="green-caption__en">{selected.label}</span>
          <span className="green-caption__divider" aria-hidden="true">✿</span>
          <span className="green-caption__zh">点击纸张进入对应页面</span>
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-[1080px] grid-cols-2 gap-3 sm:grid-cols-4">
        {archiveObjects.slice(0, 4).map((item) => (
          <Link key={item.id} href={item.href} className="cta-button text-center no-underline">
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
