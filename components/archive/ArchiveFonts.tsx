import { assetPath } from '@/lib/site';

/** Include once in the isolated archive layout; only uniquely named font faces are global. */
export default function ArchiveFonts() {
  return <style>{`
    @font-face {
      font-family: 'Archive Kaushan Script';
      src: url("${assetPath('/fonts/kaushan-script/KaushanScript-Regular.woff2')}") format('woff2');
      font-style: normal;
      font-weight: 400;
      font-display: swap;
    }
    @font-face {
      font-family: 'Archive Zhi Mang Xing';
      src: url("${assetPath('/fonts/type-choice/zhi-mang-xing-about.ttf')}") format('truetype');
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      unicode-range: U+5173, U+4E8E, U+5C0F, U+60A6;
    }
  `}</style>;
}
