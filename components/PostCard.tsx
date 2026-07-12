import Link from 'next/link';
import type { PostMeta } from '@/lib/posts';
import { formatDate } from '@/lib/posts';

type PostCardProps = {
  post: PostMeta;
};

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-line bg-white/80 p-5 shadow-card transition hover:-translate-y-1 hover:border-rose/40">
      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-soft px-2.5 py-1 text-xs font-medium text-gray-600">
            {tag}
          </span>
        ))}
      </div>
      <h3 className="mt-4 text-lg font-bold leading-7 text-gray-950 group-hover:text-rose">
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h3>
      <p className="mt-2 text-sm text-muted">{formatDate(post.date)}</p>
      <p className="mt-3 flex-1 text-sm leading-7 text-gray-600">{post.description}</p>
      <Link href={`/blog/${post.slug}`} className="mt-5 text-sm font-semibold text-gray-800 hover:text-rose">
        继续阅读 →
      </Link>
    </article>
  );
}
