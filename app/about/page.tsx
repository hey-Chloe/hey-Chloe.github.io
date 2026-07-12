import type { Metadata } from 'next';
import PageIntro from '@/components/PageIntro';

export const metadata: Metadata = {
  title: 'About',
  description: '关于 Chloe。'
};

export default function AboutPage() {
  return (
    <PageIntro title="About">
      <section className="about-paper mx-auto mt-14 max-w-[820px] p-8 sm:p-10">
        <h2 className="about-heading text-2xl text-mossDark">About Me</h2>
        <div className="mt-7 grid gap-9 md:grid-cols-[1fr_1.18fr]">
          <div className="about-photo-wrap">
            <img
              src="/images/green-photo.svg"
              alt=""
              className="h-full min-h-[360px] w-full object-cover opacity-75 mix-blend-multiply"
            />
          </div>
          <div className="about-copy space-y-6 text-mossDark/85">
            <section>
              <h3>Who I Am / 关于我</h3>
              <p className="about-hello">Hello, I&apos;m 小悦。</p>
              <p>目前是江南大学的一名学生，预计于 2028 年毕业。这里记录着我学习 Java、Web 安全、CTF、计算机基础和 AI 的过程，也收藏一些项目、笔记与成长碎片。</p>
            </section>
            <section>
              <h3>Education / 学习内容</h3>
              <p>Java、HTTP、SQL Injection、XSS、CTF Web、计算机基础与 AI。</p>
              <p>目前仍在持续学习和实践，希望把零散的知识慢慢整理成属于自己的长期档案。</p>
            </section>
            <section>
              <h3>What I Do / 我在做什么</h3>
              <p>整理学习笔记、复盘漏洞与题目、制作小项目，也会记录一些日常碎碎念、旅行日记和生活片段。</p>
              <p>这里不仅是一份技术档案，也是一处保存成长过程的小小角落。</p>
            </section>
          </div>
        </div>
      </section>
    </PageIntro>
  );
}
