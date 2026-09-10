import type { Metadata } from "next";
import type { ReactNode } from "react";
import ArchiveFonts from "@/components/archive/ArchiveFonts";
import { absoluteUrl, assetPath, hasPublicOrigin } from "@/lib/site";
import "./archive.css";

export const metadata: Metadata = {
  title: { default: "小悦的数字收藏室 — Chloe’s Archive", template: "%s | Chloe’s Archive" },
  description: "小悦的互动档案室：移动桌上的物件，打开作品、研究与生活来信。",
  alternates: { canonical: absoluteUrl("/archive/") },
  icons: { icon: assetPath("/icon.svg") },
  robots: { index: hasPublicOrigin, follow: true },
  openGraph: {
    title: "小悦的数字收藏室 — Chloe’s Archive",
    description: "移动桌上的物件，打开作品、研究与生活来信。",
    url: absoluteUrl("/archive/"), type: "website", locale: "zh_CN",
    images: [{ url: absoluteUrl("/og.png"), width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: [absoluteUrl("/og.png")] },
};

export default function ArchiveLayout({ children }: { children: ReactNode }) {
  return <html lang="zh-CN">
    <head>
      <link
        rel="preload"
        as="image"
        href={assetPath("/images/pearl-marble-texture.svg")}
        fetchPriority="high"
        media="(min-width: 721px)"
      />
      <link
        rel="preload"
        as="font"
        href={assetPath("/fonts/kaushan-script/KaushanScript-Regular.woff2")}
        type="font/woff2"
        crossOrigin="anonymous"
      />
    </head>
    <body className="archive-document">
    <ArchiveFonts />
    <a className="archive-skip" href="#archive-main">跳至档案室内容</a>
    <header className="archive-navigation">
      <a className="archive-brand" href={assetPath("/archive/")}>
        <span aria-hidden="true">✳</span><span>Chloe’s Archive<small>小悦的数字收藏室</small></span>
      </a>
      <nav aria-label="两个主页之间切换">
        <a href={assetPath("/")}>学术主页 <span aria-hidden="true">↗</span></a>
      </nav>
    </header>
    <main id="archive-main" tabIndex={-1}>{children}</main>
  </body></html>;
}
