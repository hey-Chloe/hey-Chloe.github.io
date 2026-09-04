'use client';

import { useEffect, useState } from 'react';

/** An absent font must not silently turn a comparison into a fallback sample. */
export default function FontLoadStatus({ family }: { family: string }) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    let active = true;
    document.fonts.load(`110px "${family}"`, '关于小悦')
      .then((faces) => {
        if (active) setState(faces.length > 0 && faces.every((face) => face.status === 'loaded') ? 'ready' : 'error');
      })
      .catch(() => { if (active) setState('error'); });
    return () => { active = false; };
  }, [family]);

  return <span data-font-family={family} data-font-state={state} role="status" hidden={state === 'ready'}>
    {state === 'error' ? '字体未载入，暂不展示替代字形。请刷新后重试。' : '正在载入题字…'}
  </span>;
}
