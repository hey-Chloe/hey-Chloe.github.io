import Link from 'next/link';
import Logo from '@/components/Logo';
import { menuItems } from '@/components/ArchiveData';

export default function ArchiveNav({ compact = false }: { compact?: boolean }) {
  return (
    <header className={`mx-auto flex max-w-[1180px] items-start justify-between px-5 ${compact ? 'py-8' : 'py-10'}`}>
      <Link href="/" className="no-underline">
        <Logo small />
      </Link>
      <nav className="flex flex-wrap justify-end gap-x-5 gap-y-2 pt-2 text-sm">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} className="menu-link">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
