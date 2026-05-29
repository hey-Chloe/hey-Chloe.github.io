import type { Metadata } from 'next'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Admin Login',
  robots: { index: false, follow: false }
}

export default function AdminLoginPage() {
  return (
    <main className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-16">
      <LoginForm />
    </main>
  )
}
