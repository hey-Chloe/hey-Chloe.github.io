import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireApiAdmin } from '@/lib/auth'
import { slugify, stringifyTags } from '@/lib/utils'

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  coverImage: z.string().optional().nullable(),
  tags: z.union([z.array(z.string()), z.string()]).optional().default([]),
  published: z.boolean().optional().default(true)
})

export async function GET() {
  const guard = await requireApiAdmin()
  if (guard.error) return guard.error
  const posts = await db.post.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ posts })
}

export async function POST(request: Request) {
  const guard = await requireApiAdmin()
  if (guard.error) return guard.error
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ message: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
  const slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.title)
  const post = await db.post.create({
    data: {
      title: parsed.data.title,
      slug,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      coverImage: parsed.data.coverImage || null,
      tagsJson: stringifyTags(parsed.data.tags),
      published: parsed.data.published
    }
  })
  return NextResponse.json({ post })
}
