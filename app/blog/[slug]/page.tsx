import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArchiveNav from '@/components/ArchiveNav';
import { formatDate, getAllPostSlugs, getPostBySlug } from '@/lib/posts';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: '文章未找到' };

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags
    }
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="archive-page">
      <ArchiveNav compact />
      <article className="blog-detail mx-auto max-w-[1050px] px-5 pb-28 pt-10">
        <Link href="/blog" className="menu-link">← Back to blog</Link>
        <p className="blog-detail-date mt-8 text-center text-lg text-fog/80">{formatDate(post.date)}</p>
        <h1 className="blog-detail-title mx-auto mt-3 text-center font-normal text-white">
          {post.title}
        </h1>
        <p className="blog-detail-description mx-auto mt-6 max-w-[760px] text-center text-xl leading-8 text-fog/85">{post.description}</p>
        <div className="prose mx-auto mt-12 max-w-[760px]" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </article>
    </div>
  );
}
