import Link from 'next/link';
import Container from '@/components/Container';

const navItems = [
  { href: '/', label: '首页' },
  { href: '/blog', label: '文章' },
  { href: '/projects', label: '项目' },
  { href: '/friends', label: 'Friends' },
  { href: '/about', label: '关于' }
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-white/75 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-base font-bold tracking-tight text-gray-950">
          Chloe<span className="text-rose">.</span>
        </Link>
        <nav aria-label="主导航" className="flex items-center gap-1 overflow-x-auto rounded-full border border-line bg-white/70 p-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-soft hover:text-gray-950 sm:px-4"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </header>
  );
}
