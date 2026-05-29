import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { AUTH_COOKIE, signAuthToken, verifyAuthToken } from '@/lib/auth-token'

export { AUTH_COOKIE, signAuthToken, verifyAuthToken }

export async function getSession() {
  const token = cookies().get(AUTH_COOKIE)?.value
  return verifyAuthToken(token)
}

export async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/admin/login')
  return session
}

export async function requireApiAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return { session: null, error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) }
  }
  return { session, error: null }
}

export async function getUserForLogin(email: string) {
  return db.user.findUnique({ where: { email } })
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  })
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })
}
