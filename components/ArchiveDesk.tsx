'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import ArchiveObject from '@/components/ArchiveObject';
import ChloesArchiveWordmark from '@/components/ChloesArchiveWordmark';
import { archiveObjects, menuItems } from '@/components/ArchiveData';

export default function ArchiveDesk() {
  const deskRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const [zMap, setZMap] = useState<Record<string, number>>(() =>
    Object.fromEntries(archiveObjects.map((item) => [item.id, item.z]))
  );

  const bringToFront = (id: string) => {
    setActive(id);
    setZMap((current) => {
      const next = Math.max(...Object.values(current), 20) + 1;
      return { ...current, [id]: next };
    });
  };

  const resetLayout = () => {
    try {
      localStorage.removeItem('chloe-archive-layout');
    } catch {
      // The desk remains usable when local storage is unavailable.
    }
    setZMap(Object.fromEntries(archiveObjects.map((item) => [item.id, item.z])));
    setActive(null);
    setLayoutVersion((current) => current + 1);
  };

  return (
    <section className="archive-desk-section" aria-labelledby="archive-desk-title">
      <h2 id="archive-desk-title" className="archive-desk-section__title">打开一份档案</h2>

      <div className="archive-desk-frame">
        <div ref={deskRef} className="black-desk archive-felt-desk">
          <div className="archive-desk__bar">
            <Link href="/" className="archive-desk__signature" aria-label="返回小悦首页">
              <ChloesArchiveWordmark decorative />
            </Link>
            <nav aria-label="档案快捷入口">
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href}>{item.label}</Link>
              ))}
            </nav>
            <details className="archive-desk__more">
              <summary aria-label="档案桌设置"><span aria-hidden="true">···</span></summary>
              <div>
                <Link href="/media-diary">阅读与观看</Link>
                <Link href="/sketchbook">草图本</Link>
                <button type="button" onClick={resetLayout}>恢复桌面位置</button>
              </div>
            </details>
          </div>

          {archiveObjects.map((object) => (
            <ArchiveObject
              key={`${layoutVersion}-${object.id}`}
              object={object}
              active={active === object.id}
              onHover={setActive}
              containerRef={deskRef}
              zIndex={zMap[object.id] ?? object.z}
              onBringToFront={bringToFront}
            />
          ))}

          <div className="archive-desk__baseline" aria-hidden="true">
            <span>WORK / LAB / NOTES / ABOUT / GARDEN</span>
            <span>CHLOE’S ARCHIVE · 2026</span>
          </div>
        </div>
      </div>
    </section>
  );
}
