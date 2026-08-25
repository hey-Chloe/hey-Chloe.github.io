'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { archiveActionLabels } from '@/components/ArchiveObjectLanguage';
import type { ArchiveDeskObject } from '@/components/ArchiveData';
import XiaoyueMark from '@/components/XiaoyueMark';

type Offset = { x: number; y: number };

export default function ArchiveObject({
  object,
  active,
  onHover,
  containerRef,
  zIndex,
  onBringToFront
}: {
  object: ArchiveDeskObject;
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
  const latestOffsetRef = useRef<Offset>({ x: 0, y: 0 });
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('chloe-archive-layout');
      if (!raw) return;
      const saved = JSON.parse(raw) as Record<string, Offset>;
      if (saved?.[object.id] && Number.isFinite(saved[object.id].x) && Number.isFinite(saved[object.id].y)) {
        latestOffsetRef.current = saved[object.id];
        setOffset(saved[object.id]);
      }
    } catch {
      // The desk remains usable when local storage is unavailable.
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
      startOffset: latestOffsetRef.current,
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

    const next = { x: drag.startOffset.x + dx, y: drag.startOffset.y + dy };
    latestOffsetRef.current = next;
    setOffset(next);
  };

  const finishDrag = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (!pointerRef.current || pointerRef.current.id !== event.pointerId) return;
    pointerRef.current = null;
    setDragging(false);
    persist(latestOffsetRef.current);
    try {
      itemRef.current?.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already have been released.
    }
  };

  const renderContents = () => {
    if (object.kind === 'dossier') {
      return (
        <div className="archive-artifact archive-artifact--dossier">
          <span className="archive-artifact__folio">{object.folio}</span>
          <span className="archive-artifact__binder" aria-hidden="true" />
          <p>{object.subtitle}</p>
          <h3>{object.title}</h3>
          <ol>{object.lines.map((line) => <li key={line}>{line}</li>)}</ol>
          <i>{archiveActionLabels[object.actionKind]} ↗</i>
        </div>
      );
    }

    if (object.kind === 'newspaper') {
      return (
        <div className="archive-artifact archive-artifact--newspaper">
          <div className="archive-newspaper__masthead">
            <span>{object.folio}</span><b>{object.title}</b><span>2026</span>
          </div>
          <p>{object.subtitle}</p>
          <h3>正在研究什么？</h3>
          <div className="archive-newspaper__columns">
            {object.lines.map((line) => <span key={line}>{line}</span>)}
          </div>
          <i>{archiveActionLabels[object.actionKind]} ↗</i>
        </div>
      );
    }

    if (object.kind === 'booklet') {
      return (
        <div className="archive-artifact archive-artifact--booklet">
          <span className="archive-booklet__spine" aria-hidden="true" />
          <p>{object.folio} / {object.subtitle}</p>
          <h3>{object.title}</h3>
          <div>{object.lines.map((line, index) => <span key={line}>{index + 1}. {line}</span>)}</div>
          <i>{archiveActionLabels[object.actionKind]} ↗</i>
        </div>
      );
    }

    if (object.kind === 'polaroid') {
      return (
        <div className="archive-artifact archive-artifact--polaroid">
          <div className="archive-polaroid__image">
            <img draggable={false} src="/images/green-photo.svg" alt="" />
          </div>
          <p>{object.subtitle}</p>
          <h3>{object.title}</h3>
        </div>
      );
    }

    return (
      <div className="archive-artifact archive-artifact--seeds">
        <span>{object.folio}</span>
        <XiaoyueMark />
        <p>{object.subtitle}</p>
        <h3>{object.title}</h3>
        <small>OPEN · PLANT · GROW</small>
      </div>
    );
  };

  return (
    <Link
      ref={itemRef}
      href={object.href}
      aria-label={`${object.label}：${object.description}`}
      className={`archive-object archive-object--${object.id} archive-object--kind-${object.kind} ${active ? 'active' : ''} ${dragging ? 'is-dragging' : ''} no-underline`}
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
      <div className="archive-object__inner">{renderContents()}</div>
    </Link>
  );
}
