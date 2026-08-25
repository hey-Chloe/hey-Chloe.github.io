import type { Metadata } from 'next';
import ClickFlowerEffect from '@/components/ClickFlowerEffect';
import './globals.css';
import './xiaoyue-home.css';
import './work-lab.css';
import './lab-soft.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://hey-chloe.github.io'),
  title: {
    default: '小悦的数字收藏室 — Chloe’s Archive',
    template: '%s | Chloe’s Archive'
  },
  description: '小悦的数字收藏室：柔软、可玩的个人档案，以及真实的 AI 作品与实验。',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: '/',
    siteName: 'Chloe’s Archive',
    title: '小悦的数字收藏室 — Chloe’s Archive',
    description: '柔软、可玩的个人档案，以及真实的 AI 作品与实验。',
    images: [
      {
        url: '/og.jpg',
        width: 1200,
        height: 630,
        alt: 'Chloe’s Archive — 小悦的数字收藏室'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: '小悦的数字收藏室 — Chloe’s Archive',
    description: '柔软、可玩的个人档案，以及真实的 AI 作品与实验。',
    images: ['/og.jpg']
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <body>
        <ClickFlowerEffect />
        {children}
      </body>
    </html>
  );
}
