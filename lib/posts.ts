import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
};

export type Post = PostMeta & {
  contentHtml: string;
};

type RawFrontmatter = {
  title?: string;
  date?: string | Date;
  description?: string;
  tags?: string[];
};

const fallbackPostDate = '1970-01-01T00:00:00.000Z';

function isMarkdownFile(fileName: string) {
  return fileName.endsWith('.md') || fileName.endsWith('.mdx');
}

function getSlugFromFileName(fileName: string) {
  return fileName.replace(/\.mdx?$/, '');
}

function getFileNameBySlug(slug: string) {
  const mdFile = path.join(postsDirectory, `${slug}.md`);
  const mdxFile = path.join(postsDirectory, `${slug}.mdx`);

  if (fs.existsSync(mdFile)) {
    return mdFile;
  }

  if (fs.existsSync(mdxFile)) {
    return mdxFile;
  }

  return null;
}

function normalizeDate(value: RawFrontmatter['date']): string {
  if (!value) {
    return fallbackPostDate;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? fallbackPostDate : date.toISOString();
}

function normalizeFrontmatter(data: RawFrontmatter, slug: string): PostMeta {
  return {
    slug,
    title: data.title ?? slug,
    date: normalizeDate(data.date),
    description: data.description ?? '',
    tags: Array.isArray(data.tags) ? data.tags : []
  };
}

export function getAllPostSlugs() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  return fs.readdirSync(postsDirectory).filter(isMarkdownFile).map(getSlugFromFileName);
}

export function getPostMetaBySlug(slug: string): PostMeta | null {
  const fullPath = getFileNameBySlug(slug);

  if (!fullPath) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data } = matter(fileContents);

  return normalizeFrontmatter(data as RawFrontmatter, slug);
}

export function getAllPosts(): PostMeta[] {
  return getAllPostSlugs()
    .map((slug) => getPostMetaBySlug(slug))
    .filter((post): post is PostMeta => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const fullPath = getFileNameBySlug(slug);

  if (!fullPath) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  return {
    ...normalizeFrontmatter(data as RawFrontmatter, slug),
    contentHtml
  };
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(date));
}
