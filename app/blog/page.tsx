import type { Metadata } from 'next';
import Link from 'next/link';
import PageIntro from '@/components/PageIntro';
import { formatDate, getAllPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Chloe 的学习笔记归档。'
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <PageIntro title="Blog">
      <section className="mt-14 space-y-5">
        <p className="green-caption text-xl">学习笔记 / 漏洞复盘 / 阶段总结</p>
        <div className="mt-8 overflow-hidden border border-white/20 bg-black/35">
          {posts.map((post, index) => (
            <article key={post.slug} className="grid gap-4 border-b border-white/15 p-5 font-mono text-fog last:border-b-0 md:grid-cols-[120px_1fr]">
              <time className="text-sm opacity-75">{formatDate(post.date)}</time>
              <div>
                <h2 className="text-2xl font-bold">
                  <Link href={`/blog/${post.slug}`} className="text-white">{post.title}</Link>
                </h2>
                <p className="mt-2 leading-7 opacity-82">{post.description}</p>
                <p className="mt-3 text-sm opacity-60">{String(index + 1).padStart(2, '0')} / archive note</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageIntro>
  );
}
