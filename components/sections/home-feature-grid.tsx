import { BookOpenText, FolderGit2, HeartHandshake, ShieldCheck, Sparkles, TerminalSquare } from 'lucide-react'
import { AnimatedCard } from '@/components/motion/animated-card'

const features = [
  { icon: BookOpenText, title: 'MDX 安全博客', desc: '标签、阅读时间、TOC、上一篇/下一篇，适合沉淀安全研究。' },
  { icon: TerminalSquare, title: 'CTF Writeup 平台', desc: '分类、题解、Payload、Exp 与知识点总结一站式管理。' },
  { icon: ShieldCheck, title: 'JWT 权限系统', desc: 'httpOnly Cookie、Middleware 和 API 二次校验守住后台边界。' },
  { icon: FolderGit2, title: '作品集展示', desc: 'GitHub、Demo、技术栈和标签，面试展示更完整。' },
  { icon: HeartHandshake, title: '少女风友链', desc: '毛玻璃卡片、hover 浮动、柔和光晕，保留个人站温度。' },
  { icon: Sparkles, title: '柔和科技动效', desc: 'Framer Motion、微光粒子、按钮光晕和 blur 过渡。' }
]

export function HomeFeatureGrid() {
  return (
    <section className="container py-12">
      <div className="mb-10 max-w-2xl space-y-3">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-sakura-500">Feature Garden</p>
        <h2 className="text-3xl font-black tracking-tight text-[#50326f] md:text-5xl">把安全研究做成温柔的工程作品。</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <AnimatedCard key={feature.title}>
            <feature.icon className="mb-5 h-9 w-9 text-sakura-500" />
            <h3 className="mb-2 text-xl font-bold text-[#50326f]">{feature.title}</h3>
            <p className="leading-7 text-muted-foreground">{feature.desc}</p>
          </AnimatedCard>
        ))}
      </div>
    </section>
  )
}
