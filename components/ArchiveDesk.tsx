'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import ArchiveObject, { ARCHIVE_LAYOUT_STORAGE_KEY } from '@/components/ArchiveObject';
import { archiveObjects, type ArchiveObjectId } from '@/components/ArchiveData';
import ChloesArchiveWordmark from '@/components/ChloesArchiveWordmark';
import styles from './ArchiveDesk.module.css';

const OBJECT_Z_MIN = 10;
const MAGNETIC_CURSOR_QUERY =
  '(min-width: 721px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
const CURSOR_LAG_MS = 96;
const CURSOR_GRAB_LAG_MS = 72;
const PORTAL_PROXIMITY_PX = 48;

type Point = { x: number; y: number };

const initialZMap = () =>
  Object.fromEntries(archiveObjects.map((item) => [item.id, item.z])) as Record<ArchiveObjectId, number>;

function promoteWithinObjectLayer(
  current: Record<ArchiveObjectId, number>,
  selected: ArchiveObjectId
) {
  const ordered = archiveObjects
    .map((item) => item.id)
    .sort((a, b) => (current[a] ?? OBJECT_Z_MIN) - (current[b] ?? OBJECT_Z_MIN));
  const nextOrder = [...ordered.filter((id) => id !== selected), selected];

  return Object.fromEntries(
    nextOrder.map((id, index) => [id, OBJECT_Z_MIN + index])
  ) as Record<ArchiveObjectId, number>;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * A small, local cursor layer for the archive only. The native pointer remains
 * visible; this delayed orb is feedback for proximity and direct manipulation.
 */
function useMagneticArchiveCursor(
  surfaceRef: RefObject<HTMLDivElement | null>,
  cursorRef: RefObject<HTMLSpanElement | null>
) {
  useEffect(() => {
    const surface = surfaceRef.current;
    const cursor = cursorRef.current;
    if (!surface || !cursor) return;

    const media = window.matchMedia(MAGNETIC_CURSOR_QUERY);
    let enabled = false;
    let visible = false;
    let frame: number | null = null;
    let lastTime = 0;
    let hasPosition = false;
    let target: Point = { x: 0, y: 0 };
    let current: Point = { x: 0, y: 0 };
    let magneticObject: HTMLElement | null = null;

    const clearMagneticObject = () => {
      if (!magneticObject) return;
      magneticObject.removeAttribute('data-magnetic');
      magneticObject.style.removeProperty('--magnetic-x');
      magneticObject.style.removeProperty('--magnetic-y');
      magneticObject = null;
    };

    const render = (time: number) => {
      const elapsed = lastTime ? Math.min(time - lastTime, 48) : 16;
      lastTime = time;
      const lag = cursor.dataset.grab === 'true' ? CURSOR_GRAB_LAG_MS : CURSOR_LAG_MS;
      const alpha = 1 - Math.exp(-elapsed / lag);
      current = {
        x: current.x + (target.x - current.x) * alpha,
        y: current.y + (target.y - current.y) * alpha
      };
      cursor.style.transform =
        `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;

      if (visible && (Math.abs(target.x - current.x) > 0.08 || Math.abs(target.y - current.y) > 0.08)) {
        frame = requestAnimationFrame(render);
      } else {
        frame = null;
      }
    };

    const ensureFrame = () => {
      if (frame === null) frame = requestAnimationFrame(render);
    };

    const setEnabled = () => {
      enabled = media.matches;
      surface.dataset.magneticCursor = enabled ? 'ready' : 'off';
      cursor.dataset.visible = 'false';
      if (enabled) return;
      visible = false;
      hasPosition = false;
      cursor.dataset.proximity = 'false';
      cursor.dataset.hover = 'false';
      cursor.dataset.grab = 'false';
      clearMagneticObject();
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    };

    const updatePointer = (event: PointerEvent) => {
      if (!enabled) return;
      const surfaceRect = surface.getBoundingClientRect();
      const pointer = {
        x: event.clientX - surfaceRect.left,
        y: event.clientY - surfaceRect.top
      };
      let cursorTarget = pointer;
      let nearest: HTMLElement | null = null;
      let nearestDistance = Number.POSITIVE_INFINITY;
      let nearestRect: DOMRect | null = null;

      for (const portal of surface.querySelectorAll<HTMLElement>('[data-object]')) {
        const rect = portal.getBoundingClientRect();
        const edgeX = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right);
        const edgeY = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom);
        const distance = Math.hypot(edgeX, edgeY);
        if (distance >= nearestDistance) continue;
        nearestDistance = distance;
        nearest = portal;
        nearestRect = rect;
      }

      const hovered = event.target instanceof Element
        ? event.target.closest<HTMLElement>('[data-object]')
        : null;
      cursor.dataset.hover = hovered ? 'true' : 'false';

      if (nearest && nearestRect && nearestDistance <= PORTAL_PROXIMITY_PX) {
        const rect = nearestRect as DOMRect;
        const strength = Math.pow(1 - nearestDistance / PORTAL_PROXIMITY_PX, 2);
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const normalizedX = clamp((event.clientX - centerX) / Math.max(rect.width / 2, 1), -1, 1);
        const normalizedY = clamp((event.clientY - centerY) / Math.max(rect.height / 2, 1), -1, 1);

        if (magneticObject !== nearest) clearMagneticObject();
        magneticObject = nearest;
        magneticObject.dataset.magnetic = 'true';
        magneticObject.style.setProperty('--magnetic-x', `${normalizedX * 3.5 * strength}px`);
        magneticObject.style.setProperty('--magnetic-y', `${normalizedY * 2.5 * strength}px`);

        cursorTarget = {
          x: pointer.x + clamp(centerX - event.clientX, -7, 7) * strength,
          y: pointer.y + clamp(centerY - event.clientY, -7, 7) * strength
        };
        cursor.dataset.proximity = 'true';
      } else {
        cursor.dataset.proximity = 'false';
        clearMagneticObject();
      }

      target = cursorTarget;
      if (!hasPosition) {
        current = target;
        hasPosition = true;
      }
      visible = true;
      cursor.dataset.visible = 'true';
      ensureFrame();
    };

    const hideCursor = () => {
      if (!enabled) return;
      visible = false;
      cursor.dataset.visible = 'false';
      cursor.dataset.hover = 'false';
      cursor.dataset.grab = 'false';
      clearMagneticObject();
    };

    const showGrab = (event: PointerEvent) => {
      if (!enabled || !(event.target instanceof Element)) return;
      if (event.target.closest('[data-object]')) cursor.dataset.grab = 'true';
    };

    const clearGrab = () => {
      cursor.dataset.grab = 'false';
    };

    setEnabled();
    media.addEventListener?.('change', setEnabled);
    surface.addEventListener('pointerenter', updatePointer);
    surface.addEventListener('pointermove', updatePointer);
    surface.addEventListener('pointerleave', hideCursor);
    surface.addEventListener('pointerdown', showGrab);
    surface.addEventListener('pointerup', clearGrab);
    surface.addEventListener('pointercancel', clearGrab);

    return () => {
      media.removeEventListener?.('change', setEnabled);
      surface.removeEventListener('pointerenter', updatePointer);
      surface.removeEventListener('pointermove', updatePointer);
      surface.removeEventListener('pointerleave', hideCursor);
      surface.removeEventListener('pointerdown', showGrab);
      surface.removeEventListener('pointerup', clearGrab);
      surface.removeEventListener('pointercancel', clearGrab);
      clearMagneticObject();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [cursorRef, surfaceRef]);
}

export default function ArchiveDesk() {
  const deskRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const overflowRef = useRef<HTMLDetailsElement>(null);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const [zMap, setZMap] = useState<Record<ArchiveObjectId, number>>(initialZMap);

  useMagneticArchiveCursor(deskRef, cursorRef);

  const bringToFront = (id: ArchiveObjectId) => {
    setZMap((current) => promoteWithinObjectLayer(current, id));
  };

  const resetLayout = () => {
    try {
      localStorage.removeItem(ARCHIVE_LAYOUT_STORAGE_KEY);
      localStorage.removeItem('chloe-archive-layout');
    } catch {
      // The desk remains usable when local storage is unavailable.
    }

    setZMap(initialZMap());
    setLayoutVersion((current) => current + 1);
    if (overflowRef.current) overflowRef.current.open = false;
  };

  return (
    <section className={styles.section} aria-labelledby="archive-title">
      <div className={styles.stage} data-ready="true" data-router="five-worlds">
        <div ref={deskRef} className={styles.surface}>
          <header className={styles.identity}>
            <span className={styles.folio}>A.00 / 数字收藏室 / 2026</span>
            <ChloesArchiveWordmark
              as="h1"
              id="archive-title"
              className={styles.signature}
              stacked
              ariaLabel="Chloe’s Archive，小悦的数字收藏室"
            />
            <p className={styles.descriptor}>关于 / 作品 / 实验 / 笔记 / 花园</p>
          </header>

          {archiveObjects.map((object) => (
            <ArchiveObject
              key={`${layoutVersion}-${object.id}`}
              object={object}
              containerRef={deskRef}
              zIndex={zMap[object.id] ?? object.z}
              onBringToFront={bringToFront}
            />
          ))}

          <span
            ref={cursorRef}
            className={styles.magneticCursor}
            data-visible="false"
            data-proximity="false"
            data-hover="false"
            data-grab="false"
            data-lag={`${CURSOR_LAG_MS}ms`}
            aria-hidden="true"
          />

          <details ref={overflowRef} className={styles.overflow}>
            <summary aria-label="档案桌设置"><span aria-hidden="true">···</span></summary>
            <div className={styles.overflowMenu}>
              <button type="button" onClick={resetLayout}>恢复桌面位置</button>
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
