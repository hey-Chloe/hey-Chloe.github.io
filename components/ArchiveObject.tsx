'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type Obj = {
  id: string;
  label: string;
  href: string;
  type: string;
  x: string;
  y: string;
  w: string;
  rotate: string;
  z: number;
  title: string;
  subtitle: string;
  lines: string[];
};

type Offset = { x: number; y: number };

export default function ArchiveObject({
  object,
  active,
  onHover,
  containerRef,
  zIndex,
  onBringToFront
}: {
  object: Obj;
  active: boolean;
  onHover: (id: string | null) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  zIndex: number;
  onBringToFront: (id: string) => void;
}) {
  const itemRef = useRef<HTMLAnchorElement>(null);
  const pointerRef = useRef<{
    id: number;
    startX: number;
    startY: number;
    startOffset: Offset;
    startRect: DOMRect;
    containerRect: DOMRect;
  } | null>(null);
  const movedRef = useRef(false);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('chloe-archive-layout');
      if (!raw) return;
      const saved = JSON.parse(raw) as Record<string, Offset>;
      if (saved?.[object.id] && Number.isFinite(saved[object.id].x) && Number.isFinite(saved[object.id].y)) {
        setOffset(saved[object.id]);
      }
    } catch {
      // Ignore malformed or unavailable storage.
    }
  }, [object.id]);

  const persist = (next: Offset) => {
    try {
      const raw = localStorage.getItem('chloe-archive-layout');
      const saved = raw ? (JSON.parse(raw) as Record<string, Offset>) : {};
      saved[object.id] = next;
      localStorage.setItem('chloe-archive-layout', JSON.stringify(saved));
    } catch {
      // The interaction should still work when storage is unavailable.
    }
  };

  const onPointerDown = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const item = itemRef.current;
    const container = containerRef.current;
    if (!item || !container) return;

    movedRef.current = false;
    pointerRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: offset,
      startRect: item.getBoundingClientRect(),
      containerRect: container.getBoundingClientRect()
    };
    item.setPointerCapture(event.pointerId);
    onBringToFront(object.id);
    setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    const drag = pointerRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    let dx = event.clientX - drag.startX;
    let dy = event.clientY - drag.startY;
    if (Math.hypot(dx, dy) > 6) movedRef.current = true;

    const minDx = drag.containerRect.left - drag.startRect.left;
    const maxDx = drag.containerRect.right - drag.startRect.right;
    const minDy = drag.containerRect.top - drag.startRect.top;
    const maxDy = drag.containerRect.bottom - drag.startRect.bottom;
    dx = Math.min(maxDx, Math.max(minDx, dx));
    dy = Math.min(maxDy, Math.max(minDy, dy));

    setOffset({ x: drag.startOffset.x + dx, y: drag.startOffset.y + dy });
  };

  const finishDrag = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (!pointerRef.current || pointerRef.current.id !== event.pointerId) return;
    pointerRef.current = null;
    setDragging(false);
    persist(offset);
    try {
      itemRef.current?.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already have been released.
    }
  };

  const baseClass =
    object.type === 'folder'
      ? 'folder'
      : object.type === 'photo'
        ? 'photo'
        : object.type === 'glass'
          ? 'glass-card'
          : 'paper';

  return (
    <Link
      ref={itemRef}
      href={object.href}
      aria-label={object.label}
      className={`archive-object archive-object--${object.id} ${baseClass} ${active ? 'active' : ''} ${dragging ? 'is-dragging' : ''} no-underline`}
      style={{
        left: object.x,
        top: object.y,
        width: object.w,
        '--base-rotate': object.rotate,
        '--drag-x': `${offset.x}px`,
        '--drag-y': `${offset.y}px`,
        zIndex
      } as React.CSSProperties}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onClick={(event) => {
        if (movedRef.current) {
          event.preventDefault();
          event.stopPropagation();
          movedRef.current = false;
        }
      }}
      onDragStart={(event) => event.preventDefault()}
      onMouseEnter={() => onHover(object.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(object.id)}
      onBlur={() => onHover(null)}
    >
      <div className="archive-object__inner p-[7%]">
        {object.type === 'photo' ? (
          <div className="aspect-[3/4] overflow-hidden bg-moss">
            <img draggable={false} src="/images/green-photo.svg" alt="" className="h-full w-full object-cover opacity-80 mix-blend-screen" />
          </div>
        ) : object.type === 'folder' ? (
          <div>
            <div className="mb-8 flex justify-end">
              <div className="h-10 w-10 rounded-full bg-[#3d241d] shadow-inner" />
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.18em]">{object.subtitle}</p>
            <h3 className="mt-8 text-[clamp(1.2rem,2.2vw,2.2rem)] font-normal uppercase leading-none tracking-[0.08em] text-[#5a6949]">
              {object.title}
            </h3>
          </div>
        ) : (
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] opacity-70">{object.subtitle}</p>
            <h3 className="paper-title mt-4 text-[clamp(1rem,2vw,2rem)] font-semibold leading-tight">{object.title}</h3>
            <div className="paper-lines mt-5 space-y-1.5 text-[clamp(.5rem,.72vw,.8rem)] leading-relaxed opacity-80">
              {object.lines.map((line, index) => (
                <p key={line}>
                  <span className="mr-2 opacity-60">{String(index + 1).padStart(2, '0')}</span>
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
