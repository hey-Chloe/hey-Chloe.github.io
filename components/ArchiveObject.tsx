'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject
} from 'react';
import type { ArchiveDeskObject, ArchiveObjectId } from '@/components/ArchiveData';
import AboutLetterFace from './AboutLetterFace';
import styles from './ArchiveDesk.module.css';

type Offset = { x: number; y: number };
type InteractionPhase = 'idle' | 'pressing' | 'dragging' | 'settling';

type StoredLayout = {
  version: 1;
  positions: Partial<Record<ArchiveObjectId, Offset>>;
};

type PointerSession = {
  id: number;
  startX: number;
  startY: number;
  startOffset: Offset;
  startRect: DOMRect;
  containerRect: DOMRect;
  threshold: number;
};

export const ARCHIVE_LAYOUT_STORAGE_KEY = 'xiaoyue-archive-layout:v1:desktop';

const DESKTOP_QUERY = '(min-width: 721px)';
const SETTLE_DURATION_MS = 240;
const ZERO_OFFSET: Offset = { x: 0, y: 0 };

function isOffset(value: unknown): value is Offset {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Offset;
  return Number.isFinite(candidate.x) && Number.isFinite(candidate.y);
}

function readStoredOffset(id: ArchiveObjectId): Offset | null {
  try {
    const raw = localStorage.getItem(ARCHIVE_LAYOUT_STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as StoredLayout;
    if (saved?.version !== 1) return null;
    const position = saved.positions?.[id];
    return isOffset(position) ? position : null;
  } catch {
    return null;
  }
}

function writeStoredOffset(id: ArchiveObjectId, next: Offset) {
  try {
    const raw = localStorage.getItem(ARCHIVE_LAYOUT_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as StoredLayout) : null;
    const positions = parsed?.version === 1 && parsed.positions ? parsed.positions : {};
    const saved: StoredLayout = {
      version: 1,
      positions: { ...positions, [id]: next }
    };
    localStorage.setItem(ARCHIVE_LAYOUT_STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Direct manipulation still works when storage is blocked or malformed.
  }
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export default function ArchiveObject({
  object,
  containerRef,
  zIndex,
  onBringToFront
}: {
  object: ArchiveDeskObject;
  containerRef: RefObject<HTMLDivElement | null>;
  zIndex: number;
  onBringToFront: (id: ArchiveObjectId) => void;
}) {
  const itemRef = useRef<HTMLAnchorElement | HTMLDivElement>(null);
  const pointerRef = useRef<PointerSession | null>(null);
  const latestOffsetRef = useRef<Offset>(ZERO_OFFSET);
  const draggedThisGestureRef = useRef(false);
  const suppressClickRef = useRef(false);
  const desktopRef = useRef(false);
  const settleTimerRef = useRef<number | null>(null);
  const reclampFrameRef = useRef<number | null>(null);
  const [offset, setOffset] = useState<Offset>(ZERO_OFFSET);
  const [phase, setPhase] = useState<InteractionPhase>('idle');
  const [dragEnabled, setDragEnabled] = useState(false);
  const [assetMissing, setAssetMissing] = useState(false);

  const applyOffset = useCallback((next: Offset) => {
    latestOffsetRef.current = next;
    setOffset(next);
  }, []);

  const reclamp = useCallback((persistCorrection = true) => {
    if (!desktopRef.current || pointerRef.current) return;
    const item = itemRef.current;
    const container = containerRef.current;
    if (!item || !container) return;

    const itemRect = item.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    let correctionX = 0;
    let correctionY = 0;

    if (itemRect.left < containerRect.left) correctionX = containerRect.left - itemRect.left;
    else if (itemRect.right > containerRect.right) correctionX = containerRect.right - itemRect.right;

    if (itemRect.top < containerRect.top) correctionY = containerRect.top - itemRect.top;
    else if (itemRect.bottom > containerRect.bottom) correctionY = containerRect.bottom - itemRect.bottom;

    if (Math.abs(correctionX) < .5 && Math.abs(correctionY) < .5) return;
    const current = latestOffsetRef.current;
    const next = { x: current.x + correctionX, y: current.y + correctionY };
    applyOffset(next);
    if (persistCorrection) writeStoredOffset(object.id, next);
  }, [applyOffset, containerRef, object.id]);

  const scheduleReclamp = useCallback((persistCorrection = true) => {
    if (reclampFrameRef.current !== null) cancelAnimationFrame(reclampFrameRef.current);
    reclampFrameRef.current = requestAnimationFrame(() => {
      reclampFrameRef.current = null;
      reclamp(persistCorrection);
    });
  }, [reclamp]);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);

    const applyViewportMode = () => {
      desktopRef.current = media.matches;
      setDragEnabled(media.matches);

      if (!media.matches) {
        const pointer = pointerRef.current;
        if (pointer) {
          try {
            itemRef.current?.releasePointerCapture(pointer.id);
          } catch {
            // The active capture may already have been released.
          }
        }
        applyOffset(ZERO_OFFSET);
        setPhase('idle');
        pointerRef.current = null;
        draggedThisGestureRef.current = false;
        return;
      }

      applyOffset(readStoredOffset(object.id) ?? ZERO_OFFSET);
      scheduleReclamp(true);
    };

    applyViewportMode();
    media.addEventListener?.('change', applyViewportMode);
    return () => media.removeEventListener?.('change', applyViewportMode);
  }, [applyOffset, object.id, scheduleReclamp]);

  useEffect(() => {
    const item = itemRef.current;
    const container = containerRef.current;
    if (!item || !container) return;

    const onResize = () => scheduleReclamp(true);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(onResize);
    observer?.observe(item);
    observer?.observe(container);
    window.addEventListener('resize', onResize);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [containerRef, scheduleReclamp]);

  useEffect(() => () => {
    if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current);
    if (reclampFrameRef.current !== null) cancelAnimationFrame(reclampFrameRef.current);
  }, []);

  const beginSettling = () => {
    if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current);
    setPhase('settling');
    settleTimerRef.current = window.setTimeout(() => {
      settleTimerRef.current = null;
      setPhase('idle');
      scheduleReclamp(true);
    }, SETTLE_DURATION_MS);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (!desktopRef.current) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const item = itemRef.current;
    const container = containerRef.current;
    if (!item || !container) return;

    if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current);
    draggedThisGestureRef.current = false;
    suppressClickRef.current = false;
    pointerRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: latestOffsetRef.current,
      startRect: item.getBoundingClientRect(),
      containerRect: container.getBoundingClientRect(),
      threshold: event.pointerType === 'touch' ? 10 : 6
    };

    item.setPointerCapture(event.pointerId);
    onBringToFront(object.id);
    setPhase('pressing');
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = pointerRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    let dx = event.clientX - drag.startX;
    let dy = event.clientY - drag.startY;
    const distance = Math.hypot(dx, dy);

    if (!draggedThisGestureRef.current && distance < drag.threshold) return;
    if (!draggedThisGestureRef.current) {
      draggedThisGestureRef.current = true;
      setPhase('dragging');
    }
    event.preventDefault();

    const minDx = drag.containerRect.left - drag.startRect.left;
    const maxDx = drag.containerRect.right - drag.startRect.right;
    const minDy = drag.containerRect.top - drag.startRect.top;
    const maxDy = drag.containerRect.bottom - drag.startRect.bottom;
    dx = Math.min(maxDx, Math.max(minDx, dx));
    dy = Math.min(maxDy, Math.max(minDy, dy));

    applyOffset({ x: drag.startOffset.x + dx, y: drag.startOffset.y + dy });
  };

  const finishInteraction = (event: ReactPointerEvent<HTMLElement>, releaseCapture: boolean) => {
    const drag = pointerRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    const didDrag = draggedThisGestureRef.current;
    pointerRef.current = null;
    suppressClickRef.current = didDrag;

    if (didDrag) {
      writeStoredOffset(object.id, latestOffsetRef.current);
      beginSettling();
    } else {
      setPhase('idle');
    }

    if (releaseCapture) {
      try {
        itemRef.current?.releasePointerCapture(event.pointerId);
      } catch {
        // Pointer capture can already be gone after cancellation.
      }
    }

    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  };

  const isActive = phase === 'pressing' || phase === 'dragging';
  const isDragging = phase === 'dragging';
  const objectClass = styles[object.id];
  const style = {
    '--x': object.x,
    '--y': object.y,
    '--w': object.w,
    '--rotate': object.rotate,
    '--drag-x': `${offset.x}px`,
    '--drag-y': `${offset.y}px`,
    '--z': zIndex,
    '--aspect-ratio': object.aspectRatio
  } as CSSProperties;

  const objectClassName = classNames(
    styles.object,
    objectClass,
    assetMissing && styles.assetMissing,
    isDragging && styles.dragged,
    isActive && styles.active
  );
  const setItemRef = (node: HTMLAnchorElement | HTMLDivElement | null) => {
    itemRef.current = node;
  };
  const featuredByIndex = object.featuredProjects
    ? new Map(object.featuredProjects.map((project) => [project.index, project]))
    : null;
  const renderFeaturedProject = (index: string) => {
    const project = featuredByIndex?.get(index);
    if (!project) return null;

    return (
      <Link
        className={styles.featuredProject}
        href={project.href}
        aria-label={`打开${project.title}`}
        draggable={false}
        style={{ pointerEvents: 'auto', color: 'inherit', textDecoration: 'none' }}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        onDragStart={(event) => event.preventDefault()}
      >
        <span className={styles.featuredIndex}>{project.index}</span>
        <span className={styles.featuredCopy}>
          <span className={styles.featuredProjectTitle}>{project.title}</span>
          <span className={styles.featuredEvidence}>{project.evidence}</span>
        </span>
        <span className={styles.featuredDescriptor}>{project.descriptor}</span>
      </Link>
    );
  };
  const objectContents = (
    <>
      <img
        className={styles.asset}
        src={object.assetSrc}
        alt=""
        aria-hidden="true"
        draggable={false}
        onLoad={() => {
          setAssetMissing(false);
          scheduleReclamp(true);
        }}
        onError={() => setAssetMissing(true)}
      />
      {object.decorations?.map((decoration) => (
        <img
          key={decoration.id}
          className={classNames(
            styles.decoration,
            styles[decoration.layer],
            styles[decoration.id]
          )}
          src={decoration.assetSrc}
          alt=""
          aria-hidden="true"
          draggable={false}
          data-decoration={decoration.id}
          data-mobile={decoration.mobile}
        />
      ))}
      {object.id === 'about' ? (
        <AboutLetterFace folio={object.folio} subtitle={object.subtitle} lines={object.lines} />
      ) : <span className={styles.textLayer}>
        {object.featuredProjects ? (
          <span className={styles.foldoutPages}>
            <span className={classNames(styles.foldoutPanel, styles.foldoutCenter)}>
              <span className={styles.featuredHeading}>
                <span className={styles.featuredKicker}>{object.folio} · {object.subtitle}</span>
                <span className={styles.featuredTitle}>{object.title}</span>
              </span>
              {renderFeaturedProject('01')}
            </span>
            <span className={classNames(styles.foldoutPanel, styles.foldoutLeft)}>
              {renderFeaturedProject('02')}
            </span>
            <span className={classNames(styles.foldoutPanel, styles.foldoutRight)}>
              {renderFeaturedProject('03')}
            </span>
          </span>
        ) : (
          <>
            <span className={styles.meta}>
              <span>{object.folio}</span>
              <span>{object.lines.join(' / ')}</span>
            </span>
            <span className={styles.subtitle}>{object.subtitle}</span>
            <span className={styles.title}>
              {(object.titleLines ?? [object.title]).map((line) => (
                <span key={line}>{line}</span>
              ))}
            </span>
          </>
        )}
        <span className={styles.action}>{object.actionLabel} ↗</span>
      </span>}
    </>
  );
  const interactionProps = {
    'aria-label': `${object.actionLabel}：${object.title}。${object.description}`,
    className: objectClassName,
    style,
    'data-object': object.id,
    'data-active': isActive ? 'true' : 'false',
    'data-dragging': isDragging ? 'true' : 'false',
    'data-phase': phase,
    'data-draggable': dragEnabled ? 'true' : 'false',
    'data-asset-status': assetMissing ? 'missing' : 'ready',
    onPointerDown,
    onPointerMove,
    onPointerUp: (event: ReactPointerEvent<HTMLElement>) => finishInteraction(event, true),
    onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => finishInteraction(event, true),
    onLostPointerCapture: (event: ReactPointerEvent<HTMLElement>) => finishInteraction(event, false),
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter') onBringToFront(object.id);
    },
    onFocus: () => onBringToFront(object.id),
    onDragStart: (event: React.DragEvent<HTMLElement>) => event.preventDefault()
  };

  if (object.featuredProjects) {
    return (
      <div
        ref={setItemRef}
        role="group"
        {...interactionProps}
      >
        {objectContents}
      </div>
    );
  }

  return (
    <Link
      ref={setItemRef}
      href={object.href}
      {...interactionProps}
      className={classNames(
        objectClassName
      )}
      onClick={(event) => {
        if (!suppressClickRef.current) return;
        event.preventDefault();
        event.stopPropagation();
        suppressClickRef.current = false;
      }}
    >
      {objectContents}
    </Link>
  );
}
