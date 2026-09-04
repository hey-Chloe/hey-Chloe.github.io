import type { Metadata } from 'next';
import Lettering, { type LetteringStyle } from './Lettering';
import FontLoadStatus from './FontLoadStatus';
import styles from './type-choice.module.css';

export const metadata: Metadata = {
  title: '关于小悦 · 定制字形小样',
  description: '两版轻墨行草题字的独立比较，第 1 版已用于 Archive 关于小悦信纸。',
};

const options: { id: string; variant: LetteringStyle; name: string; note: string }[] = [
  { id: '01', variant: 'light-hand', name: '轻墨 · 错落 · 已选', note: '墨色加浓一点，保留瘦长字面、浓淡变化和错落。' },
  { id: '02', variant: 'personal-hand', name: '随笔 · 落款', note: '「关于」轻写，「小悦」舒展，留一点私人落款的节奏。' },
];

export default function TypeChoicePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>字形小样 / 只做选择</p>
        <h1>轻墨 · 错落</h1>
        <p>第一版微调：只加浓墨色，不加粗笔画，也不动字形与排布。</p>
      </header>

      <section className={styles.grid} aria-label="关于小悦定制艺术字比较">
        {options.map((option) => (
          <article className={styles.option} key={option.id}>
            <header className={styles.caption}>
              <span className={styles.number}>{option.id}</span>
              <div>
                <h2>{option.name}</h2><p>{option.note}</p>
                <FontLoadStatus family="Archive Zhi Mang Xing" />
              </div>
            </header>
            <div className={`${styles.letter} ${styles.lightLetter} ${option.id === '01' ? `${styles.tonalLetter} ${styles.richerInk}` : ''}`}>
              <img className={styles.asset} src="/archive/phase-1/r3-folded-letter.webp" alt="" aria-hidden="true" />
              <div className={styles.upperPlane} aria-hidden="true">
                <span className={styles.folio}>A.02</span>
                <span className={styles.english}>Products / Systems / Models</span>
              </div>
              <p className={styles.subtitle}>一封放在桌上的信</p>
              <h3 className={styles.title}>
                <span className={styles.srOnly}>关于小悦</span>
                {/* Shared canvas, split at the real lower paper crease. */}
                <span className={styles.inkTop}>
                  <Lettering variant={option.variant} id={`${option.id}-top`} className={styles.wordmark} tonalInk={option.id === '01'} slender={option.id === '01'} />
                </span>
                <span className={styles.inkBottom}>
                  <Lettering variant={option.variant} id={`${option.id}-bottom`} className={styles.wordmark} tonalInk={option.id === '01'} slender={option.id === '01'} />
                </span>
              </h3>
            </div>
            <details className={styles.detail}>
              <summary>看清笔形 <span aria-hidden="true">＋</span></summary>
              <div className={`${styles.detailContent} ${styles.lightDetail} ${option.id === '01' ? `${styles.tonalDetail} ${styles.richerDetail}` : ''}`}>
                <Lettering variant={option.variant} id={`${option.id}-detail`} className={styles.wordmark} tonalInk={option.id === '01'} slender={option.id === '01'} />
                <p>字形：Zhi Mang Xing，OFL 开源授权。{option.id === '01' ? '原字形横向收窄 8%、纵向拉高 8%；保留墨色浓淡和纸纹，不换字、不加描边。' : '保留作排布对照，未继续修改。'}</p>
              </div>
            </details>
          </article>
        ))}
      </section>
      <details className={styles.baseline}>
        <summary>对照第一版加浓前的墨色 <span aria-hidden="true">＋</span></summary>
        <div className={styles.baselineLetter}>
          <div className={`${styles.letter} ${styles.lightLetter} ${styles.tonalLetter}`}>
            <img className={styles.asset} src="/archive/phase-1/r3-folded-letter.webp" alt="" aria-hidden="true" />
            <div className={styles.upperPlane} aria-hidden="true"><span className={styles.folio}>A.02</span><span className={styles.english}>Products / Systems / Models</span></div>
            <p className={styles.subtitle}>一封放在桌上的信</p>
            <h3 className={styles.title}>
              <span className={styles.srOnly}>关于小悦</span>
              <span className={styles.inkTop}><Lettering variant="light-hand" id="baseline-top" className={styles.wordmark} tonalInk slender /></span>
              <span className={styles.inkBottom}><Lettering variant="light-hand" id="baseline-bottom" className={styles.wordmark} tonalInk slender /></span>
            </h3>
          </div>
        </div>
      </details>
      <footer className={styles.footer}>
        第 1 版已用于<a href="/">首页「关于小悦」信纸</a>。字体与授权：
        <a href="https://github.com/google/fonts/tree/main/ofl/zhimangxing">Zhi Mang Xing</a>。
      </footer>
    </main>
  );
}
