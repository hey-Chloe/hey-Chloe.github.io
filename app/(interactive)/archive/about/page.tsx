import type { Metadata } from "next";
import Image from "next/image";
import { profile } from "@/data/profile";
import { absoluteUrl, assetPath } from "@/lib/site";

export const metadata: Metadata = {
  title: "关于小悦",
  alternates: { canonical: absoluteUrl("/archive/about/") },
};

export default function ArchiveAboutPage() {
  return <article className="archive-reading archive-letter">
    <a className="archive-back" href={assetPath("/archive/")}>← 回到桌面</a>
    <header><p className="archive-folio">A.02 / 一封放在桌上的信</p><h1>关于小悦</h1></header>
    <div className="archive-letter-grid">
      <figure className="archive-portrait">
        <Image src={assetPath(profile.portrait!.src)} alt={profile.portrait!.alt} width={420} height={560} sizes="(max-width: 720px) 70vw, 280px" priority />
        <figcaption>小悦 / 生活切片</figcaption>
      </figure>
      <div className="archive-letter-paper">
        <h2>你好，我是小悦。</h2>
        <p>{profile.biography?.zh}</p>
        <p>我喜欢把研究做成能被检查、也能被使用的东西。数据协议、失败案例与运行记录留在实验桌；真正完成的作品放进收藏；学习、复现和阶段反思则留在笔记里。</p>
        <p>技术之外，我也喜欢旅行、照片、设计、游戏和日常里有一点可爱的东西。这间数字收藏室，也留给这些兴趣。</p>
        <p className="archive-signoff">— 小悦</p>
        <a className="archive-text-link" href={assetPath("/research/")}>看看我正在做的研究 ↗</a>
      </div>
    </div>
  </article>;
}
