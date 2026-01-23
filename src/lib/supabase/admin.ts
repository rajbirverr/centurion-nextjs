import { createClient } from '@supabase/supabase-js'

/**
 * Admin Supabase client with service role key
 * USE ONLY IN SERVER ACTIONS - NEVER IN CLIENT COMPONENTS
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin environment variables')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Verify user is admin
 */
export async function verifyAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error || !data) {
      console.error('Error verifying admin:', error)
      return false
    }

    return data.role === 'admin'
  } catch (error) {
    console.error('Error in verifyAdmin:', error)
    return false
  }
}

