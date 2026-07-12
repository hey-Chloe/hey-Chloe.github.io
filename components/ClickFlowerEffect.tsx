'use client';

import { useEffect } from 'react';

export default function ClickFlowerEffect() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const starts = new Map<number, { x: number; y: number }>();

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      starts.set(event.pointerId, { x: event.clientX, y: event.clientY });
    };

    const createFlower = (event: PointerEvent) => {
      const start = starts.get(event.pointerId);
      starts.delete(event.pointerId);
      if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) return;

      const flower = document.createElement('span');
      const size = 24 + Math.round(Math.random() * 14);
      const rotation = -10 + Math.round(Math.random() * 20);

      flower.className = 'click-flower';
      flower.setAttribute('aria-hidden', 'true');
      flower.style.left = `${event.clientX}px`;
      flower.style.top = `${event.clientY}px`;
      flower.style.width = `${size}px`;
      flower.style.height = `${size}px`;
      flower.style.setProperty('--flower-rotation', `${rotation}deg`);
      flower.style.setProperty('--flower-duration', reducedMotion.matches ? '240ms' : '680ms');
      flower.innerHTML = `
        <svg viewBox="0 0 40 40" focusable="false" aria-hidden="true">
          <g fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round">
            <ellipse cx="20" cy="10.2" rx="5.2" ry="8.1" />
            <ellipse cx="29.2" cy="14.8" rx="5.2" ry="8.1" transform="rotate(60 29.2 14.8)" />
            <ellipse cx="29.2" cy="25.2" rx="5.2" ry="8.1" transform="rotate(120 29.2 25.2)" />
            <ellipse cx="20" cy="29.8" rx="5.2" ry="8.1" />
            <ellipse cx="10.8" cy="25.2" rx="5.2" ry="8.1" transform="rotate(60 10.8 25.2)" />
            <ellipse cx="10.8" cy="14.8" rx="5.2" ry="8.1" transform="rotate(120 10.8 14.8)" />
            <circle cx="20" cy="20" r="10.7" stroke-dasharray="1.4 2.3" opacity=".75" />
            <circle cx="20" cy="20" r="3.2" fill="rgba(244,240,229,.72)" />
          </g>
        </svg>`;

      document.body.appendChild(flower);
      flower.addEventListener('animationend', () => flower.remove(), { once: true });
      window.setTimeout(() => flower.remove(), reducedMotion.matches ? 400 : 900);
    };

    const cancel = (event: PointerEvent) => starts.delete(event.pointerId);
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', createFlower, { passive: true });
    window.addEventListener('pointercancel', cancel, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', createFlower);
      window.removeEventListener('pointercancel', cancel);
    };
  }, []);

  return null;
}
