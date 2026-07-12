import Link from 'next/link';
import Logo from '@/components/Logo';

export default function NotFound() {
  return (
    <div className="archive-page flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <Logo />
      <h1 className="mt-12 font-mono text-5xl">404</h1>
      <p className="mt-4 font-mono text-xl">This document is missing from the archive.</p>
      <Link href="/" className="green-caption mt-8 text-xl no-underline">Back home</Link>
    </div>
  );
}
