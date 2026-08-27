import type { Metadata } from 'next';
import Image from 'next/image';
import ArchiveNav from '@/components/ArchiveNav';
import './about.css';

export const metadata: Metadata = {
  title: '关于小悦',
  description: '关于小悦：大模型算法、可靠 AI 系统、产品实践，以及不止于技术的生活收藏。'
};

const currentFocus = [
  {
    index: '01',
    title: '模型与算法',
    copy: '数据选择与微调、Retrieval、Ranking 和 Evaluation；不只看模型能不能跑，也检查数据、切分、基线与失败条件。'
  },
  {
    index: '02',
    title: 'Agent 与系统',
    copy: '工具调用、运行边界、状态恢复与可追溯证据；让模型负责选择，让系统负责约束。'
  },
  {
    index: '03',
    title: '产品与创造',
    copy: 'AI 电商、企业后台、算力平台、小游戏与移动端体验；把研究和工程继续做成真正能点开的东西。'
  }
];

export default function AboutPage() {
  return (
    <div className="about-profile">
      <ArchiveNav compact />
      <main className="about-profile__main">
        <header className="about-profile__intro">
          <p>A.02 / 个人来信 / 2026</p>
          <h1>关于小悦</h1>
          <strong>我在做大模型算法，也不止于此。</strong>
        </header>

        <section className="about-profile__desk" aria-label="小悦的个人介绍">
          <div className="about-profile__photos" aria-label="小悦的两张生活照片">
            <figure className="about-profile__photo about-profile__photo--primary">
              <div className="about-profile__photo-frame">
                <Image
                  src="/about/xiaoyue-portrait.jpg"
                  alt="小悦穿着浅色和服站在木质街景前"
                  fill
                  priority
                  sizes="(max-width: 760px) 76vw, 34vw"
                />
              </div>
              <figcaption>小悦 / 一张认真看向镜头的照片</figcaption>
            </figure>

            <figure className="about-profile__photo about-profile__photo--secondary">
              <div className="about-profile__photo-frame">
                <Image
                  src="/about/xiaoyue-botanical.jpg"
                  alt="小悦坐在植物装饰的室内空间"
                  fill
                  sizes="(max-width: 760px) 58vw, 23vw"
                />
              </div>
              <figcaption>生活切片 / 植物、旅行和一点松弛</figcaption>
            </figure>
          </div>

          <article className="about-profile__letter">
            <div className="about-profile__letter-meta">
              <span>江南大学在读</span>
              <span>预计 2028 毕业</span>
            </div>

            <p className="about-profile__hello">你好，我是小悦。</p>
            <p>
              现在把主要精力放在大模型算法与可靠 AI 系统上：检索、排序、评测、VLM 数据选择与微调，
              也持续研究 Agent 的边界、工具使用和可恢复运行。
            </p>
            <p>
              我喜欢把研究做成能被检查、也能被使用的东西。数据协议、Benchmark、失败案例与 Trace 留在实验桌；
              真正完成的产品、系统和可交互 Demo 放进作品收藏；学习、复现和阶段反思则留在笔记里。
            </p>

            <section className="about-profile__focus" aria-labelledby="about-focus-title">
              <h2 id="about-focus-title">现在正在做</h2>
              <ol>
                {currentFocus.map((item) => (
                  <li key={item.index}>
                    <span>{item.index}</span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.copy}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <p className="about-profile__closing">
              技术之外，我也喜欢旅行、照片、设计、游戏和日常里有一点可爱的东西。
              这里不是一份被职位名称框住的简历，而是一间会继续生长的数字收藏室。
            </p>
            <p className="about-profile__signoff">— 小悦</p>
          </article>
        </section>
      </main>
    </div>
  );
}
