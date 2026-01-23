import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getServerUser } from '@/lib/supabase/server'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  
  // Allow access to register page without authentication
  // The middleware sets x-pathname header for /account/register
  if (pathname === '/account/register') {
    return <>{children}</>
  }

  const user = await getServerUser()

  if (!user) {
    redirect('/login')
  }

  return <>{children}</>
}

