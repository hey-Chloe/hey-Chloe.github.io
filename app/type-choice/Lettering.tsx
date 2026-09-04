import ArchiveInkLettering from '@/components/ArchiveInkLettering';

/** Original four-character Bézier lettering. No font outlines were extracted.
 * This is a wordmark study, not a complete typeface. Semantic text lives in page.tsx. */
const flowing = [
  // 关
  [
    'M25 13 Q37 16 40 27 Q36 34 32 27 Q29 19 25 13Z',
    'M65 10 Q75 9 71 16 Q65 26 55 30 Q62 20 65 10Z',
    'M17 37 Q47 36 77 31 L82 36 Q48 42 20 42Z',
    'M10 58 Q48 56 84 51 L91 56 Q52 61 12 63Z',
    'M48 38 Q59 36 56 46 Q52 84 12 104 Q7 105 14 99 Q42 76 48 38Z',
    'M53 62 Q68 81 89 87 L96 97 Q75 99 52 66Z',
  ],
  // 于
  [
    'M21 22 Q44 22 67 16 L74 21 Q48 27 24 27Z',
    'M9 47 Q48 47 85 38 L90 44 Q52 51 11 53Z',
    'M47 25 Q57 24 57 29 L55 87 Q55 103 45 102 Q40 94 30 89 Q43 92 45 89 Q49 75 47 25Z',
  ],
  // 小
  [
    'M48 11 Q58 9 58 16 L56 86 Q56 103 46 104 Q42 96 30 92 Q43 94 46 89 Q49 58 48 11Z',
    'M27 43 Q33 40 33 45 Q29 66 12 78 Q8 79 12 73 Q23 57 27 43Z',
    'M73 43 Q85 49 91 64 Q93 73 87 75 Q82 75 81 67 Q78 54 73 43Z',
  ],
  // 悦 — 忄 + 兑, with open counters at small sizes.
  [
    'M9 40 Q14 36 14 41 Q15 54 8 61 Q3 58 6 52Z',
    'M23 10 Q31 8 30 17 L28 99 Q26 108 22 101Z',
    'M34 32 Q44 37 43 45 Q39 49 37 42Z',
    'M47 13 Q56 14 60 25 Q57 32 53 27Z',
    'M79 9 Q89 9 85 17 Q79 27 69 31 Q77 19 79 9Z',
    'M44 36 L50 37 L51 66 L45 68Z',
    'M48 37 Q68 35 84 33 L89 37 L85 64 L78 65 L81 39 L49 42Z',
    'M49 61 L83 58 L85 64 L49 67Z',
    'M55 66 L63 64 Q62 88 39 101 Q31 105 37 99 Q54 83 55 66Z',
    'M71 66 L78 64 L76 87 Q76 94 85 93 Q94 93 96 80 L98 93 Q92 100 80 100 Q68 100 69 86Z',
  ],
];

const inscription = [
  [
    'M27 12 Q35 13 41 26 L36 30 Q32 20 27 12Z',
    'M68 10 L77 12 Q70 26 58 31 Q66 20 68 10Z',
    'M16 37 L75 32 L83 37 L19 42Z',
    'M10 58 L86 53 L92 59 L13 63Z',
    'M49 40 L59 38 Q56 81 14 103 L10 102 Q45 77 49 40Z',
    'M56 62 Q72 81 95 89 L94 99 Q74 98 52 65Z',
  ],
  [
    'M22 17 L72 14 L76 20 L25 23Z',
    'M8 44 L87 39 L90 45 L11 50Z',
    'M48 23 L57 22 L56 93 Q56 108 46 105 L31 91 L46 96 Q49 76 48 23Z',
  ],
  [
    'M49 10 L58 9 L56 94 Q55 106 45 104 L31 91 L45 96 Q48 69 49 10Z',
    'M27 43 L34 46 Q28 66 11 79 L9 77 Q24 59 27 43Z',
    'M72 43 Q88 52 93 71 L86 78 Q83 59 72 43Z',
  ],
  [
    'M9 39 L14 40 Q15 55 8 63 L4 59Z',
    'M23 10 L31 9 L28 104 L23 102Z',
    'M35 33 Q44 37 46 46 L40 50Z',
    'M48 12 Q56 15 61 26 L56 30Z',
    'M81 10 L89 11 Q82 25 71 31 L68 31Z',
    'M45 36 L52 38 L52 68 L46 66Z',
    'M49 37 L87 34 L90 38 L86 64 L79 65 L82 40 L50 43Z',
    'M51 61 L85 59 L85 65 L51 67Z',
    'M57 66 L65 66 Q64 91 38 104 L33 103 Q55 89 57 66Z',
    'M73 66 L81 65 L79 89 Q78 96 88 94 L95 92 L98 80 L99 98 Q91 102 78 101 Q70 100 72 88Z',
  ],
];

// Revision: cut nib entries, thinner connecting strokes, tapered endings.
// Keep complete strokes rather than eroding the old silhouettes with a filter.
const refined = [
  // 关 — light 丷; the final sweep carries weight only near its turn.
  [
    'M25 12 Q34 17 38 24 L35 28 Q32 20 25 12Z',
    'M68 9 L73 12 Q66 24 57 29 Q65 18 68 9Z',
    'M17 36 Q47 36 77 31 L81 33 Q48 39 19 39Z',
    'M10 57 Q48 55 85 51 L90 54 Q50 59 13 60Z',
    'M49 38 L55 37 Q53 64 42 77 Q29 93 12 103 Q36 82 43 65 Q48 54 49 38Z',
    'M53 61 Q70 81 84 86 L96 96 Q80 92 67 80 Q58 70 53 61Z',
  ],
  // 于 — a fine headstroke and deliberate, pointed hook.
  [
    'M22 21 Q47 21 69 16 L73 18 Q48 24 24 24Z',
    'M10 47 Q49 44 84 39 L89 42 Q50 48 12 50Z',
    'M49 24 L55 23 Q56 54 54 83 Q53 96 49 102 L35 92 L47 95 Q50 78 49 24Z',
  ],
  // 小 — no rounded cap, droplet terminal or ballooning hook.
  [
    'M50 10 L56 9 Q56 53 54 85 Q54 97 49 103 L35 93 L47 96 Q50 72 50 10Z',
    'M28 43 L32 44 Q27 64 12 78 Q23 61 28 43Z',
    'M73 43 Q85 52 90 67 L87 73 Q83 57 73 43Z',
  ],
  // 悦 — quieter 忄, open mouth counter, angular rather than bulbous dots.
  [
    'M11 40 L13 40 Q12 54 7 61 L5 58Z',
    'M24 11 L30 9 L27 101 L24 104Z',
    'M35 33 Q42 38 43 44 L40 48 Q39 40 35 33Z',
    'M48 13 Q57 18 59 25 L56 28 Q53 20 48 13Z',
    'M81 10 L86 12 Q79 25 71 30 Q79 19 81 10Z',
    'M46 37 L51 38 L51 65 L47 67Z',
    'M49 37 Q68 35 83 34 L87 37 L83 62 L79 64 L82 38 L50 40Z',
    'M51 61 L82 59 L84 62 L51 64Z',
    'M57 64 L63 63 Q60 88 38 101 Q53 86 57 64Z',
    'M73 64 L78 63 L76 88 Q75 95 85 94 L93 92 L97 81 L96 97 Q85 101 74 98 Q70 96 72 84Z',
  ],
];

export type LetteringStyle = 'flowing' | 'inscription' | 'refined' | 'longcang' | 'zhimangxing' | 'light-hand' | 'personal-hand';

export default function Lettering({ variant, id, className, tonalInk = false, slender = false }: {
  variant: LetteringStyle;
  id: string;
  className?: string;
  tonalInk?: boolean;
  slender?: boolean;
}) {
  if (variant === 'light-hand' || variant === 'personal-hand') {
    return <ArchiveInkLettering layout={variant} id={id} className={className} tonalInk={tonalInk} slender={slender} />;
  }
  // These are licensed typefaces, not our own glyph drawings. Only the four
  // preview characters are loaded; copyright + OFL ship beside the font files.
  if (variant === 'longcang' || variant === 'zhimangxing') {
    return (
      <svg className={className} viewBox="0 0 450 120" aria-hidden="true" focusable="false">
        <text
          x="5" y="100" fill="currentColor" fontSize="110" fontWeight="400"
          fontFamily={variant === 'longcang' ? 'Archive Long Cang' : 'Archive Zhi Mang Xing'}
        >关于小悦</text>
      </svg>
    );
  }
  const shapes = variant === 'refined' ? refined : variant === 'flowing' ? flowing : inscription;
  const transforms = variant === 'refined'
    ? ['translate(8 7) rotate(-1 50 55)', 'translate(119 2) rotate(.4 50 55)', 'translate(226 6) rotate(-.8 50 55)', 'translate(335 0) rotate(-1 50 55)']
    : variant === 'flowing'
    ? ['translate(8 7) rotate(-3 50 55)', 'translate(119 2) rotate(1 50 55)', 'translate(226 6) rotate(-2 50 55)', 'translate(335 0) rotate(-2 50 55)']
    : ['translate(12 37) scale(.62 .65)', 'translate(88 33) scale(.60 .65)', 'translate(166 0) scale(1.08 1.03)', 'translate(294 -4) scale(1.1 1.09)'];

  return (
    <svg className={className} viewBox="0 0 450 120" aria-hidden="true" focusable="false">
      <defs>
        <filter id={`${id}-ink`} x="-2%" y="-3%" width="104%" height="106%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="2" seed="17" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .2 .78" result="ink-grain" />
          <feComposite in="SourceGraphic" in2="ink-grain" operator="in" />
        </filter>
      </defs>
      <g fill="currentColor" filter={`url(#${id}-ink)`}>
        {shapes.map((glyph, index) => (
          <g key={index} transform={transforms[index]}>
            {glyph.map((d, stroke) => <path key={stroke} d={d} />)}
          </g>
        ))}
      </g>
    </svg>
  );
}
