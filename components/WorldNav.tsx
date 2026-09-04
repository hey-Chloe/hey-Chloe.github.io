import Link from 'next/link';
import XiaoyueMark from '@/components/XiaoyueMark';

const worlds = [
  { href: '/archive', folio: 'A', label: 'ARCHIVE', key: 'archive' },
  { href: '/work', folio: 'W', label: 'WORK', key: 'work' },
  { href: '/lab', folio: 'L', label: 'LAB', key: 'lab' },
  { href: '/blog', folio: 'N', label: 'NOTES', key: 'notes' }
] as const;

export default function WorldNav({ active = 'home' }: { active?: 'home' | 'archive' | 'work' | 'lab' | 'notes' }) {
  const skipTarget = active === 'work' ? '#work-title' : active === 'lab' ? '#lab-title' : '#main-content';

  return (
    <header className={`world-nav world-nav--${active}`}>
      <a className="world-nav__skip" href={skipTarget}>跳到主要内容</a>
      <Link href="/" className="world-nav__brand" aria-label="回到小悦数字档案首页">
        <XiaoyueMark variant="seal" />
        <span className="world-nav__brand-copy"><b>Xiaoyue</b><small>数字档案</small></span>
      </Link>
      <nav className="world-nav__links" aria-label="世界导航 / World navigation">
        {worlds.map((world) => (
          <Link
            key={world.key}
            href={world.href}
            aria-current={active === world.key ? 'page' : undefined}
          >
            <span>{world.folio}</span>
            <b>{world.label}</b>
          </Link>
        ))}
      </nav>
      <time className="world-nav__year" dateTime="2026"><span>2026</span> / GROWING</time>
    </header>
  );
}
