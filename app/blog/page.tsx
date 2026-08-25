import type { Metadata } from 'next';
import Link from 'next/link';
import { archiveActionLabels } from '@/components/ArchiveObjectLanguage';
import ChloesArchiveWordmark from '@/components/ChloesArchiveWordmark';
import WorldNav from '@/components/WorldNav';
import XiaoyueMark from '@/components/XiaoyueMark';
import { formatDate, getAllPosts, type PostMeta } from '@/lib/posts';

export const metadata: Metadata = {
  title: '笔记与现场记录',
  description: 'Chloe 的笔记归档：项目记录、实验入口、安全实践与早期 Java 学习笔记。',
  alternates: { canonical: '/blog/' },
  openGraph: {
    type: 'website',
    url: '/blog/',
    siteName: 'Chloe’s Archive',
    title: '笔记与现场记录 — Chloe’s Archive',
    description: '项目记录、实验入口、安全实践与早期学习笔记。',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Chloe’s Archive — 笔记与现场记录' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '笔记与现场记录 — Chloe’s Archive',
    description: '项目记录、实验入口、安全实践与早期学习笔记。',
    images: ['/og.jpg']
  }
};

const fieldRecords = [
  {
    folio: 'FIELD 01',
    title: 'Agent 的边界应该画在哪里？',
    description: '模型负责下一步动作选择；运行时负责校验、约束与执行。打开实验桌查看当前材料。',
    href: '/lab/',
    kind: 'newspaper',
    action: archiveActionLabels['view-experiment']
  },
  {
    folio: 'FIELD 02',
    title: '从 Demo 到 Benchmark',
    description: '公开与合成数据上的离线排序实验，连同数据边界和当前限制一起保留。',
    href: '/work/algorithm-lab/?tab=compute',
    kind: 'lab-sheet',
    action: archiveActionLabels['view-experiment']
  },
  {
    folio: 'FIELD 03',
    title: 'RAG 不只是接个向量库',
    description: '从混合检索、融合与重排，到回答中的引用和评测入口。',
    href: '/work/enterprise-agentic-rag/',
    kind: 'blueprint',
    action: archiveActionLabels['view-project']
  }
] as const;

const javaPostSlugs = new Set([
  'java-note',
  'java-types-variables-operators',
  'java-methods-parameters-return',
  'java-classes-objects-references',
  'java-magic-square'
]);

function NoteLink({ post, index }: { post: PostMeta; index: number }) {
  return (
    <article className={`notes-loose-paper notes-loose-paper--${index + 1}`}>
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
      <p>{post.description}</p>
      <Link href={`/blog/${post.slug}`} className="notes-object-action">阅读笔记 ↗</Link>
    </article>
  );
}

export default function BlogPage() {
  const posts = getAllPosts();
  const javaPosts = posts.filter((post) => javaPostSlugs.has(post.slug));
  const systemsPosts = posts.filter((post) => !javaPostSlugs.has(post.slug));

  return (
    <div className="notes-world">
      <WorldNav active="notes" />
      <main id="main-content">
        <header className="notes-hero">
          <div className="notes-hero__mark"><XiaoyueMark /><span>N.001 / FIELD RECORDS</span></div>
          <ChloesArchiveWordmark as="div" className="notes-hero__signature" />
          <div className="notes-hero__title">
            <h1>笔记</h1>
            <p>Notes &amp; Field Records</p>
          </div>
          <p className="notes-hero__lede">学习、实验、复现与随手记。旧笔记没有消失，它们被放回成长发生的位置。</p>
        </header>

        <section className="notes-field-records" aria-labelledby="field-records-title">
          <div className="notes-section-label">
            <span>NOW / 2026</span>
            <h2 id="field-records-title">近期现场记录</h2>
            <p>这些是现有项目与实验的入口，不是伪装成文章的新标题。</p>
          </div>
          <div className="notes-record-desk">
            {fieldRecords.map((record) => (
              <Link
                key={record.folio}
                href={record.href}
                className={`notes-record-object notes-record-object--${record.kind}`}
              >
                <span>{record.folio}</span>
                <h3>{record.title}</h3>
                <p>{record.description}</p>
                <i>{record.action} ↗</i>
              </Link>
            ))}
          </div>
        </section>

        <section className="notes-systems" aria-labelledby="systems-notes-title">
          <div className="notes-section-label notes-section-label--dark">
            <span>2026 / SECURITY &amp; SYSTEMS</span>
            <h2 id="systems-notes-title">安全与系统笔记</h2>
            <p>已经写下来的实践与基础记录，按原始日期保留。</p>
          </div>
          <div className="notes-loose-stack">
            {systemsPosts.map((post, index) => <NoteLink key={post.slug} post={post} index={index} />)}
          </div>
        </section>

        <section className="notes-early" aria-labelledby="early-notes-title">
          <div className="notes-notebook">
            <div className="notes-notebook__cover">
              <span>EARLY NOTES</span>
              <h2 id="early-notes-title">Java 学习本</h2>
              <p>基础语法、类与对象、方法，以及一次 3×3 幻方练习。</p>
            </div>
            <ol className="notes-notebook__index">
              {javaPosts.map((post, index) => (
                <li key={post.slug}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <footer className="notes-footer">
        <ChloesArchiveWordmark decorative />
        <span>THINK / LEARN / KEEP</span>
      </footer>
    </div>
  );
}
