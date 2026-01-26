import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  
  // Allow access to register page without authentication
  if (pathname === '/account/register') {
    return <>{children}</>
  }

  // Server Layout Guard: Check authentication for account routes
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    const loginUrl = '/login'
    const searchParams = new URLSearchParams()
    const returnUrl = pathname
    if (returnUrl !== '/account') {
      searchParams.set('return_url', encodeURIComponent(returnUrl))
    }
    redirect(loginUrl + (searchParams.toString() ? `?${searchParams.toString()}` : ''))
  }

  return <>{children}</>
}
