type Props = {
  layout: 'light-hand' | 'personal-hand';
  id: string;
  className?: string;
  tonalInk?: boolean;
  slender?: boolean;
};

/** Licensed regular glyphs shared by the approved specimen and About letter. */
export default function ArchiveInkLettering({ layout, id, className, tonalInk = false, slender = false }: Props) {
  const glyphs = layout === 'light-hand'
    ? [
        { char: '关', x: 9, y: 90, size: 89, angle: -3 },
        { char: '于', x: 110, y: 99, size: 79, angle: 1.5 },
        { char: '小', x: 204, y: 103, size: 101, angle: -2 },
        { char: '悦', x: 316, y: 94, size: 96, angle: 1 },
      ]
    : [
        { char: '关', x: 14, y: 68, size: 59, angle: -3 },
        { char: '于', x: 75, y: 79, size: 64, angle: 1 },
        { char: '小', x: 165, y: 108, size: 106, angle: -3 },
        { char: '悦', x: 292, y: 96, size: 101, angle: 1.5 },
      ];
  const washes = [
    { x1: '6%', y1: '0%', x2: '78%', y2: '100%', strength: [.98, .9, .6, .86, .94] },
    { x1: '18%', y1: '0%', x2: '92%', y2: '90%', strength: [.74, .88, .94, .55, .82] },
    { x1: '100%', y1: '6%', x2: '8%', y2: '100%', strength: [.92, .68, .96, .76, .9] },
    { x1: '4%', y1: '5%', x2: '100%', y2: '95%', strength: [.88, .96, .58, .82, .96] },
  ];
  return (
    <svg className={className} viewBox="0 0 450 120" aria-hidden="true" focusable="false">
      {tonalInk && <defs>
        {washes.map(({ strength, ...direction }, index) => (
          <linearGradient id={`${id}-wash-${index}`} key={index} {...direction}>
            {strength.map((opacity, stop) => (
              <stop key={stop} offset={`${[0, 22, 48, 73, 100][stop]}%`}
                stopColor="currentColor" stopOpacity={opacity} />
            ))}
          </linearGradient>
        ))}
        <filter id={`${id}-paper-ink`} x="-4%" y="-8%" width="108%" height="116%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency=".62 .23" numOctaves="2" seed="23" result="fibre" />
          <feColorMatrix in="fibre" type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  .35 0 0 0 .78" result="absorption" />
          <feComposite in="SourceGraphic" in2="absorption" operator="in" />
        </filter>
      </defs>}
      <g fill="currentColor" fontFamily="Archive Zhi Mang Xing" fontWeight="400"
        filter={tonalInk ? `url(#${id}-paper-ink)` : undefined}>
        {glyphs.map(({ char, x, y, size, angle }, index) => {
          const cx = x + size / 2;
          const cy = y - size / 2;
          const proportion = slender
            ? ` translate(${cx} ${cy}) scale(.92 1.08) translate(${-cx} ${-cy})`
            : '';
          return (
            <text key={char} x={x} y={y} fontSize={size}
              fill={tonalInk ? `url(#${id}-wash-${index})` : undefined}
              transform={`rotate(${angle} ${cx} ${cy})${proportion}`}>{char}</text>
          );
        })}
      </g>
    </svg>
  );
}
