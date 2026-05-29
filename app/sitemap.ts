import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { siteConfig } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, tasks] = await Promise.all([
    db.post.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    db.ctfTask.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } })
  ])

  const staticRoutes = ['', '/blog', '/ctf', '/projects', '/friends'].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date()
  }))

  return [
    ...staticRoutes,
    ...posts.map((post) => ({ url: `${siteConfig.url}/blog/${post.slug}`, lastModified: post.updatedAt })),
    ...tasks.map((task) => ({ url: `${siteConfig.url}/ctf/${task.slug}`, lastModified: task.updatedAt }))
  ]
}
