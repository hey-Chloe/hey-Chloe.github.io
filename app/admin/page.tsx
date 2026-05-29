import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth'
import { AdminDashboard } from './admin-dashboard'

export const metadata: Metadata = {
  title: 'Admin Panel',
  robots: { index: false, follow: false }
}

export default async function AdminPage() {
  const session = await requireAdmin()
  return <AdminDashboard session={session} />
}
