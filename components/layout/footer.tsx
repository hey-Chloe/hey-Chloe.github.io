import Link from 'next/link'
import { Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="container mt-24 pb-10">
      <div className="glass flex flex-col items-center justify-between gap-4 rounded-[2rem] px-6 py-6 text-center text-sm text-muted-foreground md:flex-row md:text-left">
        <p className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-sakura-500" /> SakuraSec · 少女风安全研究花园
        </p>
        <div className="flex gap-4">
          <Link href="/rss.xml" className="hover:text-sakura-600">RSS</Link>
          <Link href="/sitemap.xml" className="hover:text-sakura-600">Sitemap</Link>
          <Link href="/admin" className="hover:text-sakura-600">Admin</Link>
        </div>
      </div>
    </footer>
  )
}
