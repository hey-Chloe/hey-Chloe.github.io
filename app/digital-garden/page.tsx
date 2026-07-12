import type { Metadata } from 'next';
import PageIntro from '@/components/PageIntro';

export const metadata: Metadata = {
  title: 'Digital Garden',
  description: '知识索引和成长中的笔记。'
};

const items = [
  ['Digital Flora', 'Java 基础、类与对象、集合、异常。'],
  ['3D Visual Exploration', 'HTTP、Cookie、Session、请求响应链路。'],
  ['Concept Environment', 'SQL 注入、XSS、文件上传、认证授权。'],
  ['3D Printed Objects', 'CTF Web 题目复盘和 payload 记录。']
];

export default function DigitalGardenPage() {
  return (
    <PageIntro title="Garden">
      <section className="mt-16">
        <p className="green-caption text-xl">点击分类进入对应知识区域</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {items.map(([title, desc]) => (
            <article key={title} className="glass-card p-6">
              <h2 className="font-mono text-2xl text-mossDark">{title}</h2>
              <p className="mt-4 font-mono leading-7 text-mossDark/80">{desc}</p>
            </article>
          ))}
        </div>
      </section>
    </PageIntro>
  );
}
