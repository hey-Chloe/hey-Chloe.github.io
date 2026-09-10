import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { createElement, cache, type ReactNode } from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";
import matter from "gray-matter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { getMdxComponents } from "@/components/mdx";
import type { Locale } from "@/lib/localization";

const writingDirectory = path.join(process.cwd(), "content", "writing");
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface NoteSummary {
  slug: string;
  title: string;
  description: string;
  /** A calendar date in YYYY-MM-DD format. */
  date: string;
  tags: string[];
  /** Estimated reading time in minutes. */
  readingTime: number;
}

export interface Note extends NoteSummary {
  content: ReactNode;
}

interface NoteSource {
  summary: NoteSummary;
  source: string;
}

function contentError(file: string, message: string): never {
  throw new Error(`Invalid research note "${file}": ${message}`);
}

function requiredString(value: unknown, field: string, file: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return contentError(file, `${field} must be a non-empty string.`);
  }
  return value.trim();
}

function calendarDate(value: unknown, file: string): string {
  if (value instanceof Date) {
    return contentError(file, 'quote date as "YYYY-MM-DD" so YAML cannot silently normalize an invalid day.');
  }
  const date = requiredString(value, "date", file);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return contentError(file, 'date must use the "YYYY-MM-DD" format.');
  }
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== date) {
    return contentError(file, "date must be a valid calendar date.");
  }
  return date;
}

interface CitationNode {
  type: string;
  name?: string;
  attributes?: { type: string; name?: string; value?: unknown }[];
  children?: CitationNode[];
}

function remarkValidateCitations() {
  return (tree: unknown) => {
    const citations = new Set<string>();
    const references = new Set<string>();
    function walk(node: CitationNode) {
      if (
        (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
        (node.name === "Cite" || node.name === "Reference")
      ) {
        const id = node.attributes?.find((attribute) => attribute.type === "mdxJsxAttribute" && attribute.name === "id")?.value;
        if (typeof id !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(id)) {
          throw new Error(`${node.name} requires a literal id with letters, digits, hyphens, or underscores.`);
        }
        if (node.name === "Reference") {
          if (references.has(id)) throw new Error(`Duplicate bibliography reference: ${id}.`);
          references.add(id);
        } else {
          citations.add(id);
        }
      }
      node.children?.forEach(walk);
    }
    walk(tree as CitationNode);
    for (const id of citations) {
      if (!references.has(id)) throw new Error(`Citation "${id}" has no matching Reference.`);
    }
  };
}

function estimateReadingTime(source: string): number {
  // Count CJK characters separately so bilingual notes receive a useful estimate.
  const text = source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ");
  const cjkCharacters = text.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const words = text.replace(/[\u3400-\u9fff]/g, " ").match(/\S+/g)?.length ?? 0;
  return Math.max(1, Math.ceil(words / 220 + cjkCharacters / 400));
}

const readSources = cache(async (): Promise<NoteSource[]> => {
  const files = await fs.readdir(writingDirectory, { withFileTypes: true });
  const sources = await Promise.all(
    files
      .filter((file) => file.isFile() && file.name.endsWith(".mdx"))
      .map(async (file): Promise<NoteSource | null> => {
        const raw = await fs.readFile(path.join(writingDirectory, file.name), "utf8");
        const { data, content } = matter(raw);

        // Publishing requires an explicit decision; incomplete notes stay private.
        if (data.draft !== undefined && typeof data.draft !== "boolean") {
          return contentError(file.name, "draft must be a boolean, not a string.");
        }
        if (data.draft !== false) return null;

        const slug = file.name.slice(0, -4);
        if (!slugPattern.test(slug)) {
          return contentError(file.name, "use a lowercase, hyphen-separated filename.");
        }
        const title = requiredString(data.title, "title", file.name);
        const description = requiredString(data.description, "description", file.name);
        const date = calendarDate(data.date, file.name);
        if (
          !Array.isArray(data.tags) ||
          !data.tags.every((tag: unknown) => typeof tag === "string" && tag.trim().length > 0)
        ) {
          return contentError(file.name, "tags must be an array of non-empty strings.");
        }
        if (content.trim().length === 0) {
          return contentError(file.name, "published notes must have content.");
        }
        return {
          summary: {
            slug,
            title,
            description,
            date,
            tags: [...new Set<string>(data.tags.map((tag: string) => tag.trim()))],
            readingTime: estimateReadingTime(content),
          },
          source: content,
        };
      }),
  );
  return sources
    .filter((note): note is NoteSource => note !== null)
    .sort((a, b) => b.summary.date.localeCompare(a.summary.date) || a.summary.slug.localeCompare(b.summary.slug));
});

/** Read published summaries without evaluating MDX. */
export const getNotes = cache(async (): Promise<NoteSummary[]> => {
  return (await readSources()).map(({ summary }) => summary);
});

/** Compile trusted repository content at build time; never pass user input here. */
export const getNote = cache(async (slug: string, locale:Locale="zh"): Promise<Note | null> => {
  if (!slugPattern.test(slug)) return null;
  const note = (await readSources()).find(({ summary }) => summary.slug === slug);
  if (!note) return null;

  const { default: Content } = await evaluate(note.source, {
    ...jsxRuntime,
    development: false,
    remarkPlugins: [remarkGfm, remarkMath, remarkValidateCitations],
    rehypePlugins: [
      rehypeSlug,
      rehypeKatex,
      [rehypePrettyCode, { theme: "github-light", keepBackground: false }],
    ],
  });

  return {
    ...note.summary,
    content: createElement(Content, { components: getMdxComponents(locale) }),
  };
});
