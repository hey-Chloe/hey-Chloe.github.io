import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireApiAdmin } from '@/lib/auth'
import { slugify, stringifyTags } from '@/lib/utils'

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  category: z.enum(['Web', 'Pwn', 'Crypto', 'Reverse', 'Misc']).default('Web'),
  difficulty: z.string().min(1).default('Easy'),
  description: z.string().min(1),
  analysis: z.string().min(1),
  payload: z.string().default(''),
  exp: z.string().default(''),
  summary: z.string().min(1),
  tags: z.union([z.array(z.string()), z.string()]).optional().default([]),
  published: z.boolean().optional().default(true)
})

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const guard = await requireApiAdmin()
  if (guard.error) return guard.error
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ message: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
  const task = await db.ctfTask.update({
    where: { id: params.id },
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.title),
      category: parsed.data.category,
      difficulty: parsed.data.difficulty,
      description: parsed.data.description,
      analysis: parsed.data.analysis,
      payload: parsed.data.payload,
      exp: parsed.data.exp,
      summary: parsed.data.summary,
      tagsJson: stringifyTags(parsed.data.tags),
      published: parsed.data.published
    }
  })
  return NextResponse.json({ task })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireApiAdmin()
  if (guard.error) return guard.error
  await db.ctfTask.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
