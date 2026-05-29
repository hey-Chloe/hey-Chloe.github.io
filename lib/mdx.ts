import readingTime from 'reading-time'
import { estimateMinutes } from '@/lib/utils'

export type TocItem = {
  id: string
  text: string
  level: number
}

export function createHeadingId(text: string) {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[`*_~]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
}

export function extractToc(content: string): TocItem[] {
  const matches = [...content.matchAll(/^(##|###)\s+(.+)$/gm)]
  return matches.map((match) => ({
    level: match[1].length,
    text: match[2].replace(/[#`*_]/g, '').trim(),
    id: createHeadingId(match[2])
  }))
}

export function getReadingMeta(content: string) {
  const stats = readingTime(content)
  const fallback = estimateMinutes(content)
  return {
    minutes: Math.max(1, Math.ceil(stats.minutes || fallback)),
    text: `${Math.max(1, Math.ceil(stats.minutes || fallback))} min read`
  }
}
