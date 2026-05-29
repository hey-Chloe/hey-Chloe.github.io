import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="container flex min-h-[60vh] items-center justify-center py-16 text-center">
      <div className="glass max-w-xl rounded-[2.5rem] p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-sakura-500">404</p>
        <h1 className="mt-4 text-4xl font-black text-[#50326f]">这片花瓣飘走了</h1>
        <p className="my-6 leading-8 text-muted-foreground">页面不存在或已被删除。返回首页继续探索 SakuraSec。</p>
        <Button asChild><Link href="/">回到首页</Link></Button>
      </div>
    </main>
  )
}
