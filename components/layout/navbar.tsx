import Link from 'next/link'
import { ShieldCheck, Sparkles } from 'lucide-react'
import { siteConfig } from '@/lib/site'
import { Button } from '@/components/ui/button'

export function Navbar() {
  return (
    <header className="sticky top-4 z-50 mx-auto w-full px-4">
      <nav className="container flex h-16 items-center justify-between rounded-full border border-white/70 bg-white/55 px-4 shadow-soft backdrop-blur-2xl">
        <Link href="/" className="flex items-center gap-2 font-black text-[#50326f]">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pastel-glow text-white shadow-glow">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span>SakuraSec</span>
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {siteConfig.nav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-4 py-2 text-sm font-semibold text-lavender-600 transition hover:bg-white/65 hover:text-sakura-600">
              {item.label}
            </Link>
          ))}
        </div>
        <Button asChild size="sm">
          <Link href="/admin/login" className="gap-2">
            <Sparkles className="h-4 w-4" /> Admin
          </Link>
        </Button>
      </nav>
    </header>
  )
}
