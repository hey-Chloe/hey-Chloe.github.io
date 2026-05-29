'use client'

import { FormEvent, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LockKeyhole, Mail, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('admin@sakura.dev')
  const [password, setPassword] = useState('Sakura@123456')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    setLoading(false)
    if (!response.ok) {
      setError('登录失败，请检查账号或密码。')
      return
    }
    router.push(searchParams.get('next') || '/admin')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="glass mx-auto w-full max-w-md rounded-[2.5rem] p-8 shadow-glow">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pastel-glow text-white shadow-glow">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-black text-[#50326f]">管理员登录</h1>
        <p className="mt-2 text-sm text-muted-foreground">进入 SakuraSec 后台，管理博客、CTF、作品和友链。</p>
      </div>
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">邮箱</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sakura-400" />
            <Input id="email" value={email} onChange={(event) => setEmail(event.target.value)} className="pl-11" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">密码</Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sakura-400" />
            <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="pl-11" />
          </div>
        </div>
        {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}
        <Button className="w-full" disabled={loading}>{loading ? '登录中...' : '进入后台'}</Button>
      </div>
    </form>
  )
}
