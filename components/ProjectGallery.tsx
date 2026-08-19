'use client';

import { useEffect, useState } from 'react';

type Category = '全部' | 'AI Agent' | '企业应用' | '安全研究' | '量化实验';

const projects = [
  { title: 'Enterprise Agentic RAG', category: 'AI Agent', index: '01', mark: 'RAG', summary: '企业知识库智能检索与问答平台', stack: 'LangGraph · Milvus · FastAPI', metrics: ['10,368 条评测问题', '97.92% 文档召回', 'RBAC / Wiki / SSE'], flow: ['多格式文档', '混合检索', '重排与 Agent', '引用式回答'], outcome: '从文档解析、层级切块到检索评测，完成了一条可复现的企业 RAG 全链路。' },
  { title: 'MiniClaudeCode', category: 'AI Agent', index: '02', mark: 'CODE', summary: '轻量、可测试的 Coding Agent Runtime', stack: 'Python · Tool Calling · Policy', metrics: ['Bounded Agent Loop', 'ALLOW / ASK / DENY', 'Checkpoint Resume'], flow: ['任务规划', '工具调用', '安全审批', '验证与恢复'], outcome: '把模型、工具、安全策略和运行时边界拆开，形成可测试、可恢复的 Agent Harness。' },
  { title: 'mini-Runtime-Agent', category: 'AI Agent', index: '03', mark: 'RUN', summary: '从零实现的最小可用 Agent Runtime', stack: 'Python stdlib · SQLite · Trace', metrics: ['零 Agent 框架', '确定性 Runtime', '离线测试'], flow: ['会话存储', '上下文压缩', '工具注册', 'Trace 记录'], outcome: '仅依赖 Python 标准库实现核心循环，把概率性留给模型、确定性留给 Runtime。' },
  { title: 'OKR Agent Platform', category: '企业应用', index: '04', mark: 'OKR', summary: '支持细粒度权限的企业 OKR Agent', stack: 'FastAPI · PostgreSQL · Redis', metrics: ['500 用户样例', '5,000 Objectives', 'RBAC + ABAC'], flow: ['意图识别', '权限判定', '数据查询', '流式回答'], outcome: '将自然语言问数与企业权限模型结合，覆盖个人、部门与管理员的数据范围。' },
  { title: 'ReminderCat', category: '企业应用', index: '05', mark: 'CAT', summary: '企业微信里的自然语言提醒助手', stack: 'Java 21 · Spring Boot · WeCom', metrics: ['真实手机验收', '消息幂等', '失败退避重试'], flow: ['微信消息', '意图解析', '任务调度', '主动提醒'], outcome: '打通企业微信回调、LLM 意图解析、持久化调度和手机端主动推送完整链路。' },
  { title: 'CTF-Agent', category: '安全研究', index: '06', mark: 'CTF', summary: '面向授权靶场的自动化解题 Agent', stack: 'ReAct · LangGraph · Docker', metrics: ['隔离执行', '多 LLM 后端', 'Checkpoint 恢复'], flow: ['读取题目', '选择工具', '观察结果', '输出候选'], outcome: '用容器隔离命令与安全工具，把多轮 CTF 分析过程组织成可恢复的 ReAct 循环。' },
  { title: 'SakuraSec', category: '安全研究', index: '07', mark: 'SEC', summary: '安全研究、CTF 与博客一体化平台', stack: 'Next.js · MDX · Prisma', metrics: ['JWT 管理后台', 'CTF 五分类', '完整 SEO'], flow: ['安全内容', '作品与友链', '后台管理', '持续发布'], outcome: '将安全研究内容、CTF Writeup、个人作品和管理后台整合为完整的全栈站点。' },
  { title: 'Quant Strategy Evolver', category: '量化实验', index: '08', mark: 'QNT', summary: '自动发现与验证量化策略的研究框架', stack: 'Python · Backtest · Genetic Algo', metrics: ['因子基因库', '样本外验证', '自动报告'], flow: ['生成策略', '批量回测', '遗传进化', '稳健性验证'], outcome: '从候选策略生成到样本外检验形成端到端研究管线，并自动沉淀指标与报告。' }
] as const;

const categories: Category[] = ['全部', 'AI Agent', '企业应用', '安全研究', '量化实验'];

function ProjectDemo({ mark, compact = false }: { mark: string; compact?: boolean }) {
  if (mark === 'RAG') return <div className={`project-demo demo-rag ${compact ? 'compact' : ''}`}><div className="demo-top"><i /><i /><span>Enterprise Knowledge</span></div><aside><b>DOCUMENTS</b><span>产品手册.pdf</span><span>安全规范.docx</span><span>财务制度.xlsx</span></aside><main><p>Q&nbsp; 新员工的设备申请流程是什么？</p><div className="demo-thinking">检索 · 融合 · 重排</div><blockquote>入职员工需由部门负责人提交申请… <b>[1]</b></blockquote><small>[1] IT 设备管理制度 · P.12</small></main></div>;
  if (mark === 'OKR') return <div className={`project-demo demo-okr ${compact ? 'compact' : ''}`}><div className="demo-top"><i /><i /><span>OKR Agent</span></div><aside><b>2026 Q3</b><strong>72%</strong><span>Overall progress</span><div><i /></div></aside><main><p>“查看产品部本季度高风险 KR”</p><div><span>权限检查</span><b>DEPARTMENT ✓</b></div><ul><li>移动端发布 <em>68%</em></li><li>支付成功率 <em>91%</em></li></ul></main></div>;
  if (mark === 'CAT') return <div className={`project-demo demo-chat ${compact ? 'compact' : ''}`}><div className="demo-top"><i /><i /><span>企业微信 · ReminderCat</span></div><main><p>明天下午 3 点提醒我开会</p><div>已创建提醒&nbsp; ✓<br /><small>内容：开会<br />时间：明天 15:00</small></div><span>15:00</span><div>⏰ 该开会啦</div></main></div>;
  if (mark === 'QNT') return <div className={`project-demo demo-quant ${compact ? 'compact' : ''}`}><div className="demo-top"><i /><i /><span>Strategy Evolution / OOS</span></div><div className="quant-metrics"><span><b>1.84</b>SHARPE</span><span><b>+23.6%</b>RETURN</span><span><b>-8.2%</b>MAX DD</span></div><svg viewBox="0 0 420 150" role="img" aria-label="策略回测曲线"><path className="quant-grid" d="M10 30H410M10 75H410M10 120H410" /><path className="quant-area" d="M10 126L45 119 76 124 112 101 147 108 182 72 218 81 254 59 291 65 328 31 367 42 410 16V140H10Z" /><path className="quant-line" d="M10 126L45 119 76 124 112 101 147 108 182 72 218 81 254 59 291 65 328 31 367 42 410 16" /></svg></div>;
  if (mark === 'SEC') return <div className={`project-demo demo-sec ${compact ? 'compact' : ''}`}><div className="demo-top"><i /><i /><span>SakuraSec</span></div><main><p>Security Research</p><h5>柔软地记录，<br />认真地攻防。</h5><div><span>WEB</span><span>PWN</span><span>CRYPTO</span></div><article><b>JWT 攻防笔记</b><small>8 min read · Web</small></article></main></div>;
  return <div className={`project-demo demo-terminal ${compact ? 'compact' : ''}`}><div className="demo-top"><i /><i /><span>{mark === 'CTF' ? 'ctf-agent / session' : 'agent-runtime / trace'}</span></div><code><b>$</b> {mark === 'CTF' ? 'ctf-agent solve challenge.json' : 'agent run "inspect this repo"'}</code><code><em>THINK</em> {mark === 'CTF' ? 'inspect target & attachments' : 'plan repository inspection'}</code><code><em>TOOL</em> {mark === 'CTF' ? 'strings → binwalk → python' : 'read_file → search → verify'}</code><code><span>✓</span> {mark === 'CTF' ? 'checkpoint saved / candidate found' : 'verification passed / trace saved'}</code><div className="demo-cursor">_</div></div>;
}

export default function ProjectGallery() {
  const [category, setCategory] = useState<Category>('全部');
  const [active, setActive] = useState<(typeof projects)[number] | null>(null);
  const [slide, setSlide] = useState(0);
  const visible = category === '全部' ? projects : projects.filter((project) => project.category === category);

  const close = () => { setActive(null); setSlide(0); };
  const move = (direction: number) => setSlide((current) => (current + direction + 3) % 3);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!active) return;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === 'ArrowRight') move(1);
    };
    document.body.style.overflow = active ? 'hidden' : '';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [active]);

  return (
    <section className="home-projects" aria-labelledby="home-projects-title">
      <header className="home-projects__header">
        <p className="home-projects__eyebrow">06 · PROJECT INDEX / 项目索引</p>
        <h2 id="home-projects-title">Selected works</h2>
      </header>

      <nav className="project-filters" aria-label="项目分类">
        {categories.map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}
      </nav>

      <div className="project-mini-grid">
        {visible.map((project) => (
          <button key={project.title} className="project-mini" onClick={() => { setActive(project); setSlide(0); }}>
            <span className="project-mini__index">{project.index}</span>
            <div className="project-mini__screen"><ProjectDemo mark={project.mark} compact /></div>
            <span className="project-mini__category">{project.category}</span>
            <strong>{project.title}</strong>
            <span className="project-mini__summary">{project.summary}</span>
            <span className="project-mini__open">OPEN FILE ↗</span>
          </button>
        ))}
      </div>

      {active && (
        <div className="project-slideshow" role="dialog" aria-modal="true" aria-label={`${active.title} 项目详情`} onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <div className="project-slideshow__paper">
            <header><span>PROJECT FILE · {active.index}</span><span>{slide + 1} / 3</span><button onClick={close} aria-label="关闭项目详情">×</button></header>
            <div className="project-slide">
              {slide === 0 && <div className="project-slide__intro"><div className="project-slide__demo"><ProjectDemo mark={active.mark} /></div><div className="project-slide__intro-copy"><p>{active.category} / LIVE FEATURE DEMO</p><h3>{active.title}</h3><h4>{active.summary}</h4><div className="project-slide__stack">{active.stack}</div></div></div>}
              {slide === 1 && <div className="project-slide__flow"><p>02 / HOW IT WORKS</p><h3>核心工作流</h3><div>{active.flow.map((step, index) => <span key={step}><b>0{index + 1}</b>{step}{index < active.flow.length - 1 && <i>→</i>}</span>)}</div></div>}
              {slide === 2 && <div className="project-slide__result"><p>03 / OUTCOME</p><h3>成果与证据</h3><blockquote>{active.outcome}</blockquote><ul>{active.metrics.map((metric) => <li key={metric}><span>✓</span>{metric}</li>)}</ul></div>}
            </div>
            <footer><button onClick={() => move(-1)} aria-label="上一页">← PREV</button><div>{[0,1,2].map((dot) => <button key={dot} className={slide === dot ? 'active' : ''} onClick={() => setSlide(dot)} aria-label={`第 ${dot + 1} 页`} />)}</div><button onClick={() => move(1)} aria-label="下一页">NEXT →</button></footer>
          </div>
        </div>
      )}
    </section>
  );
}
