import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserForLogin, setAuthCookie, signAuthToken } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 })

  const user = await getUserForLogin(parsed.data.email)
  if (!user) return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash)
  if (!ok) return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })

  const token = await signAuthToken({ sub: user.id, email: user.email, name: user.name, role: user.role })
  const response = NextResponse.json({ user: { email: user.email, name: user.name, role: user.role } })
  setAuthCookie(response, token)
  return response
}
