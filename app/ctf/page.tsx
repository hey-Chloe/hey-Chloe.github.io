import Link from 'next/link'
import type { Metadata } from 'next'
import { Flag, ShieldQuestion } from 'lucide-react'
import { db } from '@/lib/db'
import { parseTags } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'CTF',
  description: 'Web / Pwn / Crypto / Reverse / Misc CTF 题解、Payload 与 Writeup。'
}

const categories = ['Web', 'Pwn', 'Crypto', 'Reverse', 'Misc'] as const
type Category = (typeof categories)[number]

function isCategory(value?: string): value is Category {
  return Boolean(value && categories.includes(value as Category))
}

export default async function CtfPage({ searchParams }: { searchParams: { category?: string } }) {
  const category = searchParams.category
  const tasks = await db.ctfTask.findMany({
    where: { published: true, ...(isCategory(category) ? { category } : {}) },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <main className="container py-16">
      <div className="mb-10 space-y-4">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-sakura-500">CTF Garden</p>
        <h1 className="text-4xl font-black tracking-tight text-[#50326f] md:text-6xl">题目复盘与 Payload 档案</h1>
        <p className="max-w-2xl leading-8 text-muted-foreground">分类沉淀题目描述、思路分析、Payload / Exp 和知识点总结，让每次刷题都变成可展示的研究成果。</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <Link href="/ctf"><Badge className={!category ? 'bg-sakura-100 text-sakura-600' : ''}>All</Badge></Link>
        {categories.map((item) => (
          <Link key={item} href={`/ctf?category=${item}`}><Badge className={category === item ? 'bg-sakura-100 text-sakura-600' : ''}>{item}</Badge></Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <Link key={task.id} href={`/ctf/${task.slug}`}>
            <Card className="h-full">
              <div className="mb-5 flex items-center justify-between">
                <Flag className="h-8 w-8 text-sakura-500" />
                <Badge>{task.category}</Badge>
              </div>
              <h2 className="mb-3 text-2xl font-black text-[#50326f]">{task.title}</h2>
              <p className="mb-5 line-clamp-3 leading-7 text-muted-foreground">{task.description}</p>
              <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-lavender-600">
                <ShieldQuestion className="h-4 w-4" /> {task.difficulty}
              </div>
              <div className="flex flex-wrap gap-2">{parseTags(task.tagsJson).map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  )
}
