'use server'

import { revalidatePath, unstable_cache } from 'next/cache'
import { getServerUser } from '@/lib/supabase/server'
import { createAdminClient, verifyAdmin } from '@/lib/supabase/admin'

export interface FilterConfig {
  id: string
  filter_type: 'product_type' | 'color' | 'price' | 'size' | 'sort'
  value: string
  display_label: string
  sort_order: number
  is_active: boolean
  metadata?: any
  created_at: string
  updated_at: string
}

export async function getFilterConfigs(): Promise<{ success: boolean; data?: FilterConfig[]; error?: string }> {
  return unstable_cache(
    async () => {
      try {
        const supabase = createAdminClient()
        const { data, error } = await supabase
          .from('filter_config')
          .select('*')
          .eq('is_active', true)
          .order('filter_type', { ascending: true })
          .order('sort_order', { ascending: true })

        if (error) {
          // If table doesn't exist or other error, return empty array instead of failing
          // This allows the page to load without filter configs
          if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
            // Table doesn't exist - return empty array
            return { success: true, data: [] }
          }
          console.error('Error fetching filter configs:', error)
          // Still return success with empty array to prevent page crash
          return { success: true, data: [] }
        }

        return { success: true, data: (data || []) as FilterConfig[] }
      } catch (error: any) {
        // Catch any unexpected errors and return empty array to prevent page crash
        console.error('Error in getFilterConfigs:', error)
        return { success: true, data: [] }
      }
    },
    ['filter-configs'],
    {
      revalidate: 3600, // Cache for 1 hour
      tags: ['filter-configs']
    }
  )()
}

export async function getAllFilterConfigs(): Promise<FilterConfig[]> {
  try {
    const user = await getServerUser()
    if (!user) {
      return []
    }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) {
      return []
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('filter_config')
      .select('*')
      .order('filter_type', { ascending: true })
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching all filter configs:', error)
      return []
    }

    return (data || []) as FilterConfig[]
  } catch (error) {
    console.error('Error in getAllFilterConfigs:', error)
    return []
  }
}

export async function createFilterConfig(data: {
  filter_type: FilterConfig['filter_type']
  value: string
  display_label: string
  sort_order?: number
  is_active?: boolean
  metadata?: any
}) {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()
    const { data: config, error } = await supabase
      .from('filter_config')
      .insert({
        ...data,
        sort_order: data.sort_order || 0,
        is_active: data.is_active !== undefined ? data.is_active : true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating filter config:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/filter-settings')
    revalidatePath('/all-products')

    return { success: true, data: config }
  } catch (error: any) {
    console.error('Error in createFilterConfig:', error)
    return { success: false, error: error.message || 'Failed to create filter config' }
  }
}

export async function updateFilterConfig(id: string, data: Partial<FilterConfig>) {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()
    const { data: config, error } = await supabase
      .from('filter_config')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating filter config:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/filter-settings')
    revalidatePath('/all-products')

    return { success: true, data: config }
  } catch (error: any) {
    console.error('Error in updateFilterConfig:', error)
    return { success: false, error: error.message || 'Failed to update filter config' }
  }
}

export async function deleteFilterConfig(id: string) {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('filter_config')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting filter config:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/filter-settings')
    revalidatePath('/all-products')

    return { success: true }
  } catch (error: any) {
    console.error('Error in deleteFilterConfig:', error)
    return { success: false, error: error.message || 'Failed to delete filter config' }
  }
}

