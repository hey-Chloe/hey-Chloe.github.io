import type { Metadata } from 'next';
import Link from 'next/link';
import ChloesArchiveWordmark from '@/components/ChloesArchiveWordmark';
import PageIntro from '@/components/PageIntro';

export const metadata: Metadata = { title: 'Projects', description: 'Chloe 的项目成果与学习实践档案。' };

const projects = [
  { number: '01', title: 'RuleForge-SAST', eyebrow: 'Security tool · Featured', description: '一套基于 Semgrep 的轻量级代码安全扫描工作流，从漏洞命中、Git Diff 分析到 Patch 修复验证。', result: '把分散的安全检查整理成一条可重复、可验证的扫描链路。', tags: ['Semgrep', 'SAST', 'Git Diff', 'Patch'], href: '/blog/ruleforge-sast', visual: 'terminal' },
  { number: '02', title: 'Web Security Notes', eyebrow: 'Knowledge system', description: '围绕 HTTP、SQL 注入、XSS、文件上传与认证授权建立的安全知识索引。', result: '将漏洞原理、利用路径和防御策略连接成可检索的知识地图。', tags: ['HTTP', 'SQLi', 'XSS', 'Auth'], href: '/blog/web-security-note', visual: 'map' },
  { number: '03', title: 'Java Practice Lab', eyebrow: 'Learning by building', description: '从语法、方法与对象一路延伸到集合、异常处理和小型算法练习。', result: '每个知识点都落到一段可运行代码，而不只停留在概念摘录。', tags: ['Java', 'OOP', 'Algorithms'], href: '/blog/java-note', visual: 'code' },
  { number: '04', title: 'Chloe’s Archive', eyebrow: 'This website', description: '使用 Next.js、TypeScript 与 Markdown 构建的个人数字档案馆，并部署在 GitHub Pages。', result: '把项目、笔记与持续学习的轨迹收拢成一个长期生长的个人空间。', tags: ['Next.js', 'TypeScript', 'Markdown'], href: 'https://github.com/hey-Chloe/hey-Chloe.github.io', visual: 'archive', external: true }
] as const;

function ProjectVisual({ type }: { type: (typeof projects)[number]['visual'] }) {
  if (type === 'terminal') return <div className="result-visual result-terminal" aria-label="RuleForge 扫描结果示意图"><div className="terminal-bar"><i /><i /><i /><span>ruleforge / scan</span></div><code><b>$</b> ruleforge scan --diff</code><code><span>✓</span> 42 files inspected</code><code><em>!</em> 3 findings reviewed</code><div className="scan-meter"><span /></div><p>PATCH VERIFIED <strong>100%</strong></p></div>;
  if (type === 'map') return <div className="result-visual result-map" aria-label="Web 安全知识地图示意图"><span className="map-node map-node--core">WEB<br />SECURITY</span><span className="map-node map-node--one">HTTP</span><span className="map-node map-node--two">SQLi</span><span className="map-node map-node--three">XSS</span><span className="map-node map-node--four">AUTH</span><i className="map-line map-line--one" /><i className="map-line map-line--two" /><i className="map-line map-line--three" /><i className="map-line map-line--four" /></div>;
  if (type === 'code') return <div className="result-visual result-code" aria-label="Java 代码运行结果示意图"><div className="code-file">MagicSquare.java <span>●</span></div><pre><b>public class</b> MagicSquare {'{'}{`\n`}  <em>int</em> size = <strong>3</strong>;{`\n`}  solve(size);{`\n`}{'}'}</pre><div className="code-output"><span>RUN</span><code>8 1 6<br />3 5 7<br />4 9 2</code></div></div>;
  return <div className="result-visual result-archive" aria-label="Chloe’s Archive 页面结构示意图"><ChloesArchiveWordmark className="archive-mini-logo" decorative /><div className="archive-mini-desk"><span>NOTES</span><span>PROJECTS</span><span>GARDEN</span><span>ABOUT</span></div><p>built to keep growing ↗</p></div>;
}

export default function ProjectsPage() {
  return <PageIntro title="Project File"><section className="projects-showcase mt-12">
    <header className="projects-lede"><p className="projects-kicker">SELECTED WORK · 2026</p><h2>不只记录做了什么，<br />也展示它如何工作。</h2><p>这里收集我在安全、编程与知识整理中的实践。每一项成果，都保留过程、结果和继续生长的入口。</p></header>
    <div className="project-feature-list">{projects.map((project) => {
      const card = <article className="project-feature"><div className="project-feature__copy"><div className="project-feature__meta"><span>{project.number}</span><span>{project.eyebrow}</span></div><h3>{project.title}</h3><p className="project-feature__description">{project.description}</p><div className="project-outcome"><span>OUTCOME</span><p>{project.result}</p></div><ul aria-label="技术标签">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul><span className="project-open">查看完整档案 <b aria-hidden="true">↗</b></span></div><ProjectVisual type={project.visual} /></article>;
      return 'external' in project && project.external ? <a key={project.title} href={project.href} target="_blank" rel="noreferrer" className="project-feature-link">{card}</a> : <Link key={project.title} href={project.href} className="project-feature-link">{card}</Link>;
    })}</div>
    <footer className="projects-footnote"><span>01—04</span><p>更多练习与过程笔记，持续归档中。</p><Link href="/blog">进入 Blog Archive →</Link></footer>
  </section></PageIntro>;
}
