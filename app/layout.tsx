import type { Metadata } from 'next';
import ClickFlowerEffect from '@/components/ClickFlowerEffect';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://hey-chloe.github.io'),
  title: {
    default: "Chloe's Archive",
    template: "%s | Chloe's Archive"
  },
  description: '一个档案桌风格的个人技术博客，记录 Java、Web 安全、CTF、计算机基础和自学成长。'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <ClickFlowerEffect />
        {children}
      </body>
    </html>
  );
}
