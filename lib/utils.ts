import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path = '') {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"!@#$%^&*()+=[\]{};:,.<>/?\\|`~]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function parseTags(tagsJson?: string | null): string[] {
  if (!tagsJson) return []
  try {
    const parsed = JSON.parse(tagsJson)
    return Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : []
  } catch {
    return []
  }
}

export function stringifyTags(tags: string[] | string) {
  const list = Array.isArray(tags)
    ? tags
    : tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
  return JSON.stringify([...new Set(list)])
}

export function formatDate(input: Date | string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(input))
}

export function estimateMinutes(text: string) {
  const zh = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const en = text.replace(/[\u4e00-\u9fa5]/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil((zh / 400) + (en / 220)))
}
