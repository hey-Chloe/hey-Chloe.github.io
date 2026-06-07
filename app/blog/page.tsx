import Link from 'next/link'
import type { Metadata } from 'next'
import { BookOpenText, Clock } from 'lucide-react'
import { db } from '@/lib/db'
import { formatDate, parseTags } from '@/lib/utils'
import { getReadingMeta } from '@/lib/mdx'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'SakuraSec 安全研究、Web、Java、Reverse 与工程化实践 MDX 博客。'
}

export default async function BlogPage({ searchParams }: { searchParams: { tag?: string } }) {
  const posts = await db.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' }
  })
  const allTags = Array.from(new Set(posts.flatMap((post) => parseTags(post.tagsJson))))
  const activeTag = searchParams.tag
  const visiblePosts = activeTag ? posts.filter((post) => parseTags(post.tagsJson).includes(activeTag)) : posts

  return (
    <main className="container py-16">
      <div className="mb-10 space-y-4">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-sakura-500">MDX Blog</p>
        <h1 className="text-4xl font-black tracking-tight text-[#50326f] md:text-6xl">安全研究笔记</h1>
        <p className="max-w-2xl leading-8 text-muted-foreground">用 MDX 记录 Web、安全工程、逆向和 CTF 复盘。每一篇文章都带有阅读时间、标签与结构化目录。</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <Link href="/blog"><Badge className={!activeTag ? 'bg-sakura-100 text-sakura-600' : ''}>All</Badge></Link>
        {allTags.map((tag) => (
          <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
            <Badge className={activeTag === tag ? 'bg-sakura-100 text-sakura-600' : ''}>{tag}</Badge>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {visiblePosts.map((post) => {
          const reading = getReadingMeta(post.content)
          const tags = parseTags(post.tagsJson)
          return (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="h-full">
                <div className="mb-5 flex items-center gap-3 text-sm text-muted-foreground">
                  <BookOpenText className="h-4 w-4 text-sakura-500" />
                  <span>{formatDate(post.createdAt)}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {reading.text}</span>
                </div>
                <h2 className="mb-3 text-2xl font-black text-[#50326f]">{post.title}</h2>
                <p className="mb-5 leading-7 text-muted-foreground">{post.excerpt}</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
