import type { Metadata } from 'next';

const TARGET_URL = 'https://kai-gpu.itankg64.chatgpt.site/';

export const metadata: Metadata = {
  title: 'KAI GPU 算力市场',
  description: '跳转到 KAI GPU 算力指数与推荐算法展示。',
  alternates: { canonical: TARGET_URL },
  robots: { index: false, follow: true }
};

export default function GpuShortLinkPage() {
  return (
    <main
      style={{
        minHeight: '100svh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        background: '#f5f5f2',
        color: '#101114',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif',
        textAlign: 'center'
      }}
    >
      <meta httpEquiv="refresh" content={`0;url=${TARGET_URL}`} />
      <div>
        <p style={{ margin: '0 0 10px', color: '#285fcf', fontSize: '12px', fontWeight: 800, letterSpacing: '.16em' }}>
          KAI GPU
        </p>
        <h1 style={{ margin: 0, fontSize: 'clamp(32px, 6vw, 58px)', letterSpacing: '-.05em' }}>正在打开算力市场</h1>
        <p style={{ margin: '18px 0 28px', color: '#656b74' }}>如果没有自动跳转，请点击下面的按钮。</p>
        <a
          href={TARGET_URL}
          style={{
            display: 'inline-flex',
            minHeight: '46px',
            alignItems: 'center',
            padding: '0 22px',
            borderRadius: '999px',
            background: '#101114',
            color: '#fff',
            fontWeight: 700,
            textDecoration: 'none'
          }}
        >
          打开 KAI GPU
        </a>
      </div>
    </main>
  );
}
