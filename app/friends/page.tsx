import Link from 'next/link'
import type { Metadata } from 'next'
import { Heart, Sparkles } from 'lucide-react'
import { db } from '@/lib/db'
import { parseTags } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Friends',
  description: 'SakuraSec 少女风友链页面。'
}

export default async function FriendsPage() {
  const friends = await db.friend.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <main className="container py-16">
      <div className="mb-10 space-y-4 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-sakura-500">Friend Links</p>
        <h1 className="text-4xl font-black tracking-tight text-[#50326f] md:text-6xl">在柔光里遇见知己</h1>
        <p className="mx-auto max-w-2xl leading-8 text-muted-foreground">山河不足惧，重在遇知己。这里收集安全研究、CTF 与个人博客朋友们的温柔小站。</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {friends.map((friend) => (
          <Link key={friend.id} href={friend.link} target="_blank">
            <Card className="group relative h-full overflow-hidden text-center">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-pastel-glow opacity-20 blur-2xl transition group-hover:opacity-45" />
              <div className="relative mx-auto mb-5 h-24 w-24 overflow-hidden rounded-full border-4 border-white/70 bg-white/70 shadow-glow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={friend.avatar} alt={friend.name} className="h-full w-full object-cover" />
              </div>
              <h2 className="mb-2 flex items-center justify-center gap-2 text-2xl font-black text-[#50326f]">
                <Heart className="h-5 w-5 text-sakura-500" /> {friend.name}
              </h2>
              <p className="mb-5 leading-7 text-muted-foreground">{friend.description}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {parseTags(friend.tagsJson).map((tag) => <Badge key={tag}>{tag}</Badge>)}
              </div>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sakura-600">
                <Sparkles className="h-4 w-4" /> 访问小站
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  )
}
