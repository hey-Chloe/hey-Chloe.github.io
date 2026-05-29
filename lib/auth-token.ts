import { SignJWT, jwtVerify } from 'jose'

export const AUTH_COOKIE = 'sakura_token'

export type JwtPayload = {
  sub: string
  email: string
  name: string
  role: 'ADMIN' | 'USER'
}

function secretKey() {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters long')
  }
  return new TextEncoder().encode(secret)
}

export async function signAuthToken(payload: JwtPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey())
}

export async function verifyAuthToken(token?: string | null): Promise<JwtPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secretKey())
    if (payload.role !== 'ADMIN' && payload.role !== 'USER') return null
    return {
      sub: String(payload.sub),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role as 'ADMIN' | 'USER'
    }
  } catch {
    return null
  }
}
