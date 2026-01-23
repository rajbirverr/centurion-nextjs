'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { createAdminClient, verifyAdmin } from '@/lib/supabase/admin'

// Upload image to Supabase Storage
export async function uploadDeliveryImageToStorage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Only image files are allowed' }
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'File size must be less than 10MB' }
    }

    const supabase = createAdminClient()
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `homepage-delivery/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading delivery image:', uploadError)
      return { success: false, error: uploadError.message || 'Failed to upload image' }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return { success: true, url: urlData.publicUrl }
  } catch (error: any) {
    console.error('Error in uploadDeliveryImageToStorage:', error)
    return { success: false, error: error.message || 'Failed to upload image' }
  }
}

export interface HomepageDeliverySection {
  id: string
  title: string
  button_text: string
  button_link: string
  shipping_text: string
  left_image_url?: string
  right_image_url?: string
  is_enabled: boolean
  created_at: string
  updated_at: string
}

// Get delivery section for public display
export async function getHomepageDeliverySection(): Promise<HomepageDeliverySection | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('homepage_delivery_section')
      .select('*')
      .eq('is_enabled', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error fetching delivery section:', error)
      // Return null - component will use defaults
      return null
    }

    console.log('Fetched delivery section:', data)
    return data as HomepageDeliverySection | null
  } catch (error) {
    console.error('Error in getHomepageDeliverySection:', error)
    return null
  }
}

// Get delivery section for admin (including disabled)
export async function getHomepageDeliverySectionForAdmin(): Promise<HomepageDeliverySection | null> {
  try {
    const user = await getServerUser()
    if (!user) {
      return null
    }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) {
      return null
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('homepage_delivery_section')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error fetching delivery section:', error)
      return null
    }

    return data as HomepageDeliverySection | null
  } catch (error) {
    console.error('Error in getHomepageDeliverySectionForAdmin:', error)
    return null
  }
}

// Update delivery section
export async function updateHomepageDeliverySection(data: Partial<Omit<HomepageDeliverySection, 'id' | 'created_at' | 'updated_at'>>) {
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
    
    // Check if section exists
    const { data: existing } = await supabase
      .from('homepage_delivery_section')
      .select('id')
      .limit(1)
      .maybeSingle()

    let result
    if (existing) {
      // Update existing
      const updateResult = await supabase
        .from('homepage_delivery_section')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
      result = updateResult
    } else {
      // Insert new
      const insertResult = await supabase
        .from('homepage_delivery_section')
        .insert({
          title: data.title || 'Support crafted for a seamless wedding day',
          button_text: data.button_text || 'SHOP WEDDING',
          button_link: data.button_link || '/all-products',
          shipping_text: data.shipping_text || 'Free shipping on ₹100 and 30-day hassle-free returns',
          left_image_url: data.left_image_url || null,
          right_image_url: data.right_image_url || null,
          is_enabled: data.is_enabled !== undefined ? data.is_enabled : true,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      result = insertResult
    }

    if (result.error) {
      return { success: false, error: result.error.message }
    }

    revalidatePath('/')
    return { success: true, data: result.data }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update delivery section' }
  }
}
