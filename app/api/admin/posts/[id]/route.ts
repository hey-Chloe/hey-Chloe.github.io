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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const guard = await requireApiAdmin()
  if (guard.error) return guard.error
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ message: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
  const post = await db.post.update({
    where: { id: params.id },
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.title),
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      coverImage: parsed.data.coverImage || null,
      tagsJson: stringifyTags(parsed.data.tags),
      published: parsed.data.published
    }
  })
  return NextResponse.json({ post })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireApiAdmin()
  if (guard.error) return guard.error
  await db.post.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
