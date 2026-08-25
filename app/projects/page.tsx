import type { Metadata } from 'next';
import WorkIndexPage from '@/app/work/page';

export const metadata: Metadata = {
  title: 'Projects — 项目试用索引',
  description: '旧 Projects 地址保留，并统一进入小悦的项目试用索引。',
  alternates: { canonical: '/work/' },
  openGraph: {
    title: 'Work — 小悦的项目试用索引',
    description: '在线页面、真实演示、本地运行说明和源码，各自标清边界。',
    url: '/work/'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Work — 小悦的项目试用索引',
    description: '在线页面、真实演示、本地运行说明和源码，各自标清边界。'
  },
  robots: { index: false, follow: true }
};

export default WorkIndexPage;
