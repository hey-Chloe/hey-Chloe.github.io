import type { Metadata } from 'next';
import PageIntro from '@/components/PageIntro';

export const metadata: Metadata = {
  title: 'Media Diary',
  description: '学习资料、阅读和观看记录。'
};

const items = [
  ['Java Course', '类、对象、集合、异常处理。'],
  ['HTTP Notes', '请求行、请求头、请求体、状态码。'],
  ['Security Videos', 'SQL 注入、XSS、反序列化。'],
  ['CTF Writeups', '做题记录与复盘。']
];

export default function MediaDiaryPage() {
  return (
    <PageIntro title="Media Diary">
      <section className="mt-16 space-y-4">
        {items.map(([title, desc], index) => (
          <article key={title} className="grid gap-4 border-t border-white/20 py-6 font-mono md:grid-cols-[80px_1fr_1.2fr]">
            <p>0{index + 1}</p>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p>{desc}</p>
          </article>
        ))}
      </section>
    </PageIntro>
  );
}
