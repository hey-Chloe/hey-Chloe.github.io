'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const DEFAULT_SENTENCES = [
  '每一个努力的人都不会太差，对吗',
  '我又划着我的断桨出发了',
  '山河不足惧，重在遇知己',
  '给时光以生命，而不是给生命以时光'
]

type TypewriterProps = {
  sentences?: string[]
  typingSpeed?: number
  deletingSpeed?: number
  pauseMs?: number
  easing?: (t: number) => number
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export function TypewriterText({
  sentences = DEFAULT_SENTENCES,
  typingSpeed = 72,
  deletingSpeed = 38,
  pauseMs = 1500,
  easing = easeOutCubic
}: TypewriterProps) {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [mode, setMode] = useState<'typing' | 'pausing' | 'deleting'>('typing')

  const current = sentences[phraseIndex]
  const text = current.slice(0, charIndex)

  const delay = useMemo(() => {
    if (mode === 'pausing') return pauseMs
    const progress = current.length === 0 ? 1 : charIndex / current.length
    const eased = easing(Math.min(1, Math.max(0, progress)))
    const base = mode === 'typing' ? typingSpeed : deletingSpeed
    return Math.max(16, base - eased * 18)
  }, [charIndex, current.length, deletingSpeed, easing, mode, pauseMs, typingSpeed])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (mode === 'typing') {
        if (charIndex < current.length) {
          setCharIndex((value) => value + 1)
        } else {
          setMode('pausing')
        }
        return
      }

      if (mode === 'pausing') {
        setMode('deleting')
        return
      }

      if (charIndex > 0) {
        setCharIndex((value) => value - 1)
      } else {
        setPhraseIndex((value) => (value + 1) % sentences.length)
        setMode('typing')
      }
    }, delay)

    return () => window.clearTimeout(timer)
  }, [charIndex, current.length, delay, mode, sentences.length])

  return (
    <span className="inline-flex min-h-[2.6rem] items-center">
      <span>{text}</span>
      <motion.span
        className="ml-1 inline-block h-8 w-[3px] rounded-full bg-sakura-400"
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
      />
    </span>
  )
}

export function TypewriterHero() {
  return (
    <section className="container relative flex min-h-[calc(100vh-7rem)] items-center py-16">
      <div className="grid items-center gap-10 lg:grid-cols-[1.04fr_0.96fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-2 text-sm font-semibold text-lavender-600 shadow-soft backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-sakura-500" /> 少女风安全研究与 CTF 花园
          </div>
          <div className="space-y-5">
            <h1 className="font-soft text-5xl font-black leading-tight tracking-[-0.05em] text-[#50326f] md:text-7xl">
              Soft cyber, <span className="gradient-text">strong security.</span>
            </h1>
            <p className="max-w-2xl text-xl font-semibold leading-9 text-lavender-600 md:text-2xl">
              <TypewriterText />
            </p>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              用淡紫、粉色、蓝紫渐变与毛玻璃，把安全研究、MDX 博客、CTF Writeup、作品集和后台 CMS 做成一个温柔但专业的全栈项目。
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/ctf" className="gap-2">
                开始探索 CTF <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/blog">阅读安全博客</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute -inset-12 rounded-full bg-pastel-glow opacity-30 blur-3xl" />
          <div className="glass relative overflow-hidden rounded-[2.5rem] p-6">
            <div className="mb-5 flex gap-2">
              <span className="h-3 w-3 rounded-full bg-sakura-400" />
              <span className="h-3 w-3 rounded-full bg-lavender-400" />
              <span className="h-3 w-3 rounded-full bg-cyber-blue" />
            </div>
            <div className="rounded-[1.5rem] bg-[#352455]/90 p-5 font-mono text-sm leading-7 text-white shadow-card">
              <p className="text-sakura-200">$ whoami</p>
              <p>security-researcher · ctf-player · soft-ui-builder</p>
              <p className="mt-4 text-cyber-blue">$ scan --target sakura-sec</p>
              <p>✓ auth middleware protected</p>
              <p>✓ mdx blog rendered</p>
              <p>✓ ctf payload archived</p>
              <p>✓ pastel particles online</p>
              <p className="mt-4 text-sakura-200">$ echo "keep going"</p>
              <p className="text-white/80">给时光以生命，而不是给生命以时光。</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
