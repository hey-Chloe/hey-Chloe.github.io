import type { Metadata } from "next";
import { absoluteUrl, assetPath } from "@/lib/site";

export const metadata: Metadata = {
  title: "数字花园",
  alternates: { canonical: absoluteUrl("/archive/garden/") },
};

const paths = [
  { title: "模型与算法", folio: "SEED 01 / RESEARCH", description: "Agent、检索、排序、VLM 与评测。实验状态、失败和证据都留在桌上。", href: "/research/", action: "查看研究" },
  { title: "产品与系统", folio: "SEED 02 / WORK", description: "把能运行的系统、真实试用入口和项目边界整理成作品。", href: "/projects/", action: "打开作品" },
  { title: "近期笔记", folio: "SEED 03 / NOTES", description: "项目记录、实验复现，以及还在形成中的想法。", href: "/writing/", action: "阅读笔记" },
];

export default function ArchiveGardenPage() {
  return <article className="archive-reading archive-garden">
    <a className="archive-back" href={assetPath("/archive/")}>← 回到桌面</a>
    <header><p className="archive-folio">G.01 / DIGITAL GARDEN</p><h1>数字花园</h1><p>一张持续生长的知识地图。选一颗种子，看看今天想去的方向。</p></header>
    <div className="archive-seeds">{paths.map((path, index) => <a className="archive-seed" key={path.href} href={assetPath(path.href)}>
      <span className="archive-folio">{path.folio}</span><span className="archive-sprout" aria-hidden="true">{["✳", "✤", "❋"][index]}</span>
      <h2>{path.title}</h2><p>{path.description}</p><span className="archive-seed-action">{path.action} ↗</span>
    </a>)}</div>
  </article>;
}
