'use client';

import { useEffect, useId, useState } from 'react';
import ArchiveInkLettering from './ArchiveInkLettering';
import styles from './AboutLetterFace.module.css';

type Props = { folio: string; subtitle: string; lines: string[] };

export default function AboutLetterFace({ folio, subtitle, lines }: Props) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [fontState, setFontState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let mounted = true;
    if (!document.fonts) {
      setFontState('error');
      return;
    }
    document.fonts.load('110px "Archive Zhi Mang Xing"', '关于小悦').then((faces) => {
      if (mounted) setFontState(faces.length > 0 && faces.every((face) => face.status === 'loaded') ? 'ready' : 'error');
    }).catch(() => { if (mounted) setFontState('error'); });
    return () => { mounted = false; };
  }, []);

  return (
    <span className={styles.face} data-lettering="light-ink-01"
      data-font-family="Archive Zhi Mang Xing" data-font-state={fontState}>
      <span className={styles.upperPlane}>
        <span className={styles.folio}>{folio}</span>
        <span className={styles.english}>{lines.join(' / ')}</span>
      </span>
      <span className={styles.subtitle}>{subtitle}</span>
      <span className={styles.title}>
        <span className={styles.fallback}>关于小悦</span>
        <span className={styles.inkTop}>
          <ArchiveInkLettering layout="light-hand" id={`${id}-top`} className={styles.wordmark} tonalInk slender />
        </span>
        <span className={styles.inkBottom}>
          <ArchiveInkLettering layout="light-hand" id={`${id}-bottom`} className={styles.wordmark} tonalInk slender />
        </span>
      </span>
    </span>
  );
}
