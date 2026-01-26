import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Server component that refreshes Supabase session
 * This replaces the session refresh logic from middleware
 */
export async function SessionRefresher() {
  const supabase = await createServerSupabaseClient()
  // Refresh session by calling getUser (this triggers session refresh)
  await supabase.auth.getUser()
  return null
}
