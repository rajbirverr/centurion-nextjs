'use server'

import { revalidatePath } from 'next/cache'
import { getServerUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface UserProfile {
  id: string
  display_name: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  role: string
  created_at: string
  updated_at: string
}

export interface UpdateProfileData {
  first_name?: string
  last_name?: string
  display_name?: string
  phone?: string
}

export async function getUserProfile(userId?: string): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  try {
    const user = await getServerUser()
    if (!user && !userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const targetUserId = userId || user!.id
    const supabase = createAdminClient()

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUserId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return { success: false, error: error.message }
    }

    // Get email from auth - use admin client for this
    const adminClient = createAdminClient()
    const { data: authUser } = await adminClient.auth.admin.getUserById(targetUserId)
    
    const profileWithEmail = {
      ...profile,
      email: authUser?.user?.email,
    }

    return { success: true, profile: profileWithEmail as UserProfile }
  } catch (error: any) {
    console.error('Error in getUserProfile:', error)
    return { success: false, error: error.message || 'Failed to fetch profile' }
  }
}

export async function updateUserProfile(data: UpdateProfileData) {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = createAdminClient()

    // Build update object
    const updateData: any = {}
    if (data.first_name) updateData.first_name = data.first_name
    if (data.last_name) updateData.last_name = data.last_name
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.display_name) {
      updateData.display_name = data.display_name
    } else if (data.first_name && data.last_name) {
      updateData.display_name = `${data.first_name} ${data.last_name}`
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/account')
    return { success: true, profile }
  } catch (error: any) {
    console.error('Error in updateUserProfile:', error)
    return { success: false, error: error.message || 'Failed to update profile' }
  }
}

export async function updatePhone(phone: string) {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    return updateUserProfile({ phone })
  } catch (error: any) {
    console.error('Error in updatePhone:', error)
    return { success: false, error: error.message || 'Failed to update phone' }
  }
}

