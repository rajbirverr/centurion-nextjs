import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/supabase/admin'
import Sidebar from '@/components/admin/Sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get current pathname from headers (set by middleware)
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  
  // Don't protect the /admin login page itself
  if (pathname === '/admin') {
    return <>{children}</>
  }
  
  // Protect all other admin routes (e.g., /admin/dashboard, /admin/products)
  const user = await getServerUser()
  
  if (!user) {
    redirect('/admin')
  }

  const isAdmin = await verifyAdmin(user.id)
  if (!isAdmin) {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-[#fafafa] auth-page" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <Sidebar />
      <div className="md:ml-64 p-4 md:p-8">
        {children}
      </div>
    </div>
  )
}

