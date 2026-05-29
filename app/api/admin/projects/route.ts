import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireApiAdmin } from '@/lib/auth'
import { slugify, stringifyTags } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().min(1),
  techStack: z.string().min(1),
  githubUrl: z.string().url(),
  demoUrl: z.string().url().optional().or(z.literal('')),
  tags: z.union([z.array(z.string()), z.string()]).optional().default([]),
  featured: z.boolean().optional().default(false)
})

export async function POST(request: Request) {
  const guard = await requireApiAdmin()
  if (guard.error) return guard.error
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ message: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
  const project = await db.project.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.name),
      description: parsed.data.description,
      techStack: parsed.data.techStack,
      githubUrl: parsed.data.githubUrl,
      demoUrl: parsed.data.demoUrl || null,
      tagsJson: stringifyTags(parsed.data.tags),
      featured: parsed.data.featured
    }
  })
  return NextResponse.json({ project })
}
