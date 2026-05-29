import { db } from '@/lib/db'
import { siteConfig } from '@/lib/site'

function escapeXml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const posts = await db.post.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' }, take: 20 })
  const items = posts
    .map((post) => {
      const url = `${siteConfig.url}/blog/${post.slug}`
      return `<item><title>${escapeXml(post.title)}</title><link>${url}</link><guid>${url}</guid><description>${escapeXml(post.excerpt)}</description><pubDate>${post.createdAt.toUTCString()}</pubDate></item>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0"><channel><title>${escapeXml(siteConfig.title)}</title><link>${siteConfig.url}</link><description>${escapeXml(siteConfig.description)}</description>${items}</channel></rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8'
    }
  })
}
