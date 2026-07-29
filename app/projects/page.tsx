import type { Metadata } from 'next';
import PageIntro from '@/components/PageIntro';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Chloe 的项目档案。'
};

const projects = [
  [
    'Static Blog',
    'Next.js + TypeScript + Tailwind CSS + Markdown，部署在 GitHub Pages。'
  ],
  [
    'RuleForge-SAST',
    '基于 Semgrep 的轻量级 SAST 代码安全扫描工具，实现漏洞检测、Git Diff 分析以及 Patch 修复验证。'
  ],
  [
    'Web Security Notes',
    'HTTP、SQL注入、XSS、文件上传和认证授权的学习整理。'
  ],
  [
    'CTF Writeups',
    'Web 方向题目的入口、payload、卡点和复盘。'
  ],
  [
    'Java Practice Lab',
    'Java 基础语法、面向对象、集合与异常处理练习。'
  ]
];

export default function ProjectsPage() {
  return (
    <PageIntro title="Project File">
      <section className="project-paper-grid mt-14 grid gap-6 md:grid-cols-2">
        {projects.map(([title, desc], index) => (
          <article key={title} className={`project-paper project-paper--${index + 1}`}>
            <p className="project-number">0{index + 1}</p>
            <h2 className="project-title">{title}</h2>
            <span className="project-rule" aria-hidden="true" />
            <p className="project-description">{desc}</p>
          </article>
        ))}
      </section>
    </PageIntro>
  );
}
