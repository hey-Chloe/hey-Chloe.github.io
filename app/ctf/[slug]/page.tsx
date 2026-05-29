import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, Terminal } from 'lucide-react'
import { db } from '@/lib/db'
import { parseTags } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const task = await db.ctfTask.findUnique({ where: { slug: params.slug } })
  if (!task) return {}
  return { title: task.title, description: task.description }
}

export default async function CtfDetailPage({ params }: { params: { slug: string } }) {
  const task = await db.ctfTask.findUnique({ where: { slug: params.slug } })
  if (!task || !task.published) notFound()
  const tags = parseTags(task.tagsJson)

  return (
    <main className="container py-16">
      <article className="glass rounded-[2.4rem] p-6 md:p-10">
        <Link href="/ctf" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-sakura-600">
          <ArrowLeft className="h-4 w-4" /> 返回 CTF
        </Link>
        <div className="mb-10 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge>{task.category}</Badge>
            <Badge>{task.difficulty}</Badge>
            {tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#50326f] md:text-6xl">{task.title}</h1>
          <p className="max-w-3xl text-lg leading-8 text-muted-foreground">{task.description}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="glass rounded-[2rem] p-6">
            <h2 className="mb-4 text-2xl font-black text-[#50326f]">思路分析</h2>
            <p className="leading-8 text-muted-foreground">{task.analysis}</p>
          </section>
          <section className="glass rounded-[2rem] p-6">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black text-[#50326f]"><Terminal className="h-6 w-6 text-sakura-500" /> Payload</h2>
            <pre className="overflow-x-auto rounded-2xl bg-[#352455]/95 p-5 text-sm text-white"><code>{task.payload}</code></pre>
          </section>
          <section className="glass rounded-[2rem] p-6 lg:col-span-2">
            <h2 className="mb-4 text-2xl font-black text-[#50326f]">Exp</h2>
            <pre className="overflow-x-auto rounded-2xl bg-[#352455]/95 p-5 text-sm text-white"><code>{task.exp}</code></pre>
          </section>
          <section className="glass rounded-[2rem] p-6 lg:col-span-2">
            <h2 className="mb-4 text-2xl font-black text-[#50326f]">知识点总结</h2>
            <p className="leading-8 text-muted-foreground">{task.summary}</p>
          </section>
        </div>
      </article>
    </main>
  )
}
