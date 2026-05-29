import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireApiAdmin } from '@/lib/auth'

export async function GET() {
  const guard = await requireApiAdmin()
  if (guard.error) return guard.error

  const [posts, ctfTasks, projects, friends] = await Promise.all([
    db.post.findMany({ orderBy: { createdAt: 'desc' } }),
    db.ctfTask.findMany({ orderBy: { createdAt: 'desc' } }),
    db.project.findMany({ orderBy: { createdAt: 'desc' } }),
    db.friend.findMany({ orderBy: { createdAt: 'desc' } })
  ])

  return NextResponse.json({ posts, ctfTasks, projects, friends })
}
