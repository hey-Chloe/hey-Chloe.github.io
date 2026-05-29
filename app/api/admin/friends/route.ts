import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireApiAdmin } from '@/lib/auth'
import { stringifyTags } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(1),
  avatar: z.string().url(),
  description: z.string().min(1),
  link: z.string().url(),
  tags: z.union([z.array(z.string()), z.string()]).optional().default([])
})

export async function POST(request: Request) {
  const guard = await requireApiAdmin()
  if (guard.error) return guard.error
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ message: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 })
  const friend = await db.friend.create({
    data: {
      name: parsed.data.name,
      avatar: parsed.data.avatar,
      description: parsed.data.description,
      link: parsed.data.link,
      tagsJson: stringifyTags(parsed.data.tags)
    }
  })
  return NextResponse.json({ friend })
}
