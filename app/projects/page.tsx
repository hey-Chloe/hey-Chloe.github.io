import type { Metadata } from 'next';
import PageIntro from '@/components/PageIntro';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Chloe 的项目档案。'
};

const projects = [
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
    'AI Security Lab',
    '探索 AI 与网络安全结合方向，包括 LLM 安全、漏洞分析与自动化安全工具。'
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
