import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import { db } from '@/lib/db'
import { extractToc, getReadingMeta } from '@/lib/mdx'
import { formatDate, parseTags } from '@/lib/utils'
import { mdxComponents } from '@/components/mdx/mdx-components'
import { Badge } from '@/components/ui/badge'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await db.post.findUnique({ where: { slug: params.slug } })
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article'
    }
  }
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = await db.post.findUnique({ where: { slug: params.slug } })
  if (!post || !post.published) notFound()

  const posts = await db.post.findMany({ where: { published: true }, orderBy: { createdAt: 'asc' } })
  const index = posts.findIndex((item) => item.slug === post.slug)
  const prev = posts[index - 1]
  const next = posts[index + 1]
  const tags = parseTags(post.tagsJson)
  const toc = extractToc(post.content)
  const reading = getReadingMeta(post.content)

  return (
    <main className="container grid gap-8 py-16 lg:grid-cols-[minmax(0,1fr)_260px]">
      <article className="glass rounded-[2.4rem] p-6 md:p-10">
        <Link href="/blog" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-sakura-600">
          <ArrowLeft className="h-4 w-4" /> 返回博客
        </Link>
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{formatDate(post.createdAt)}</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {reading.text}</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#50326f] md:text-6xl">{post.title}</h1>
          <p className="text-lg leading-8 text-muted-foreground">{post.excerpt}</p>
          <div className="flex flex-wrap gap-2">{tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
        </div>

        <div className="prose prose-lg max-w-none prose-sakura">
          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } }}
          />
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {prev && (
            <Link href={`/blog/${prev.slug}`} className="glass rounded-2xl p-4 text-sm font-semibold text-lavender-600 hover:text-sakura-600">
              ← 上一篇<br /><span className="text-[#50326f]">{prev.title}</span>
            </Link>
          )}
          {next && (
            <Link href={`/blog/${next.slug}`} className="glass rounded-2xl p-4 text-right text-sm font-semibold text-lavender-600 hover:text-sakura-600">
              下一篇 →<br /><span className="text-[#50326f]">{next.title}</span>
            </Link>
          )}
        </div>
      </article>

      <aside className="hidden lg:block">
        <div className="glass sticky top-28 rounded-[2rem] p-5">
          <h2 className="mb-4 font-black text-[#50326f]">目录</h2>
          <nav className="space-y-3 text-sm">
            {toc.length === 0 ? <p className="text-muted-foreground">暂无目录</p> : toc.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="block text-muted-foreground transition hover:text-sakura-600" style={{ paddingLeft: (item.level - 2) * 14 }}>
                {item.text}
              </a>
            ))}
          </nav>
        </div>
      </aside>
    </main>
  )
}
