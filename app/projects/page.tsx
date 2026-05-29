import Link from 'next/link'
import type { Metadata } from 'next'
import { ExternalLink, Github } from 'lucide-react'
import { db } from '@/lib/db'
import { parseTags } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Projects',
  description: '安全工具、CTF 工具、渗透测试、Web 与自动化作品集。'
}

export default async function ProjectsPage() {
  const projects = await db.project.findMany({ orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }] })

  return (
    <main className="container py-16">
      <div className="mb-10 space-y-4">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-sakura-500">Portfolio</p>
        <h1 className="text-4xl font-black tracking-tight text-[#50326f] md:text-6xl">作品集与安全工具</h1>
        <p className="max-w-2xl leading-8 text-muted-foreground">展示 GitHub、Demo、技术栈与项目定位，让面试官快速看到工程能力与安全方向沉淀。</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id}>
            <div className="mb-5 flex flex-wrap gap-2">
              {parseTags(project.tagsJson).map((tag) => <Badge key={tag}>{tag}</Badge>)}
            </div>
            <h2 className="mb-3 text-2xl font-black text-[#50326f]">{project.name}</h2>
            <p className="mb-5 leading-8 text-muted-foreground">{project.description}</p>
            <p className="mb-6 rounded-2xl bg-white/55 p-4 text-sm font-semibold text-lavender-600">{project.techStack}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="sm" variant="secondary"><Link href={project.githubUrl} target="_blank"><Github className="mr-2 h-4 w-4" /> GitHub</Link></Button>
              {project.demoUrl && <Button asChild size="sm"><Link href={project.demoUrl} target="_blank"><ExternalLink className="mr-2 h-4 w-4" /> Demo</Link></Button>}
            </div>
          </Card>
        ))}
      </div>
    </main>
  )
}
