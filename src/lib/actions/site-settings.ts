'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getServerUser } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

/**
 * Get hero image URL from database
 */
export async function getHeroImage(): Promise<string | null> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('site_settings')
      .select('hero_image_url')
      .eq('setting_key', 'hero_image')
      .single()

    if (error) {
      // If table doesn't exist or no setting found, return null
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching hero image:', error)
      return null
    }

    return data?.hero_image_url || null
  } catch (error: any) {
    console.error('Error in getHeroImage:', error)
    return null
  }
}

/**
 * Update hero image URL (admin only)
 */
export async function updateHeroImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
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
    
    // Use upsert to insert or update
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        setting_key: 'hero_image',
        hero_image_url: imageUrl,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'setting_key'
      })

    if (error) {
      console.error('Error updating hero image:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (error: any) {
    console.error('Error in updateHeroImage:', error)
    return { success: false, error: error.message || 'Failed to update hero image' }
  }
}

/**
 * Upload image file to Supabase Storage and return public URL
 */
export async function uploadHeroImageToStorage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
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

    const supabase = createAdminClient()
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `hero-image-${Date.now()}.${fileExt}`
    const filePath = `hero/${fileName}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage - NEVER use upsert, always create new versioned file
    // This ensures immutable URLs for aggressive caching
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false, // Never overwrite - creates new versioned file
        cacheControl: '31536000' // 1 year cache - immutable
      })

    if (uploadError) {
      console.error('Error uploading to storage:', uploadError)
      // Provide helpful error message for missing bucket
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
        return { 
          success: false, 
          error: 'Storage bucket "images" not found. Please create it in Supabase Storage, or use URL mode instead.' 
        }
      }
      return { success: false, error: uploadError.message || 'Failed to upload image' }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return { success: true, url: urlData.publicUrl }
  } catch (error: any) {
    console.error('Error in uploadHeroImageToStorage:', error)
    return { success: false, error: error.message || 'Failed to upload image' }
  }
}

/**
 * Get showcase card image URL from database
 */
export async function getShowcaseCardImage(): Promise<string | null> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('site_settings')
      .select('hero_image_url')
      .eq('setting_key', 'showcase_card_image')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching showcase card image:', error)
      return null
    }

    return data?.hero_image_url || null
  } catch (error: any) {
    console.error('Error in getShowcaseCardImage:', error)
    return null
  }
}

/**
 * Update showcase card image URL (admin only)
 */
export async function updateShowcaseCardImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
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
      .from('site_settings')
      .upsert({
        setting_key: 'showcase_card_image',
        hero_image_url: imageUrl,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'setting_key'
      })

    if (error) {
      console.error('Error updating showcase card image:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (error: any) {
    console.error('Error in updateShowcaseCardImage:', error)
    return { success: false, error: error.message || 'Failed to update showcase card image' }
  }
}

/**
 * Upload showcase card image file to Supabase Storage
 */
export async function uploadShowcaseCardImageToStorage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Only image files are allowed' }
    }

    const supabase = createAdminClient()
    
    const fileExt = file.name.split('.').pop()
    const fileName = `showcase-card-${Date.now()}.${fileExt}`
    const filePath = `showcase/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage - NEVER use upsert, always create new versioned file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false, // Never overwrite - creates new versioned file
        cacheControl: '31536000' // 1 year cache - immutable
      })

    if (uploadError) {
      console.error('Error uploading to storage:', uploadError)
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
        return { 
          success: false, 
          error: 'Storage bucket "images" not found. Please create it in Supabase Storage, or use URL mode instead.' 
        }
      }
      return { success: false, error: uploadError.message || 'Failed to upload image' }
    }

    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return { success: true, url: urlData.publicUrl }
  } catch (error: any) {
    console.error('Error in uploadShowcaseCardImageToStorage:', error)
    return { success: false, error: error.message || 'Failed to upload image' }
  }
}

/**
 * Get homepage carousel product images from database
 */
export async function getHomepageCarouselProducts(): Promise<Array<{ id: number; name: string; location: string; image: string }> | null> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('site_settings')
      .select('hero_image_url')
      .eq('setting_key', 'homepage_carousel_products')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching carousel products:', error)
      return null
    }

    if (data?.hero_image_url) {
      try {
        return JSON.parse(data.hero_image_url)
      } catch {
        return null
      }
    }

    return null
  } catch (error: any) {
    console.error('Error in getHomepageCarouselProducts:', error)
    return null
  }
}

/**
 * Update homepage carousel product images (admin only)
 */
export async function updateHomepageCarouselProducts(products: Array<{ id: number; name: string; location: string; image: string }>): Promise<{ success: boolean; error?: string }> {
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
      .from('site_settings')
      .upsert({
        setting_key: 'homepage_carousel_products',
        hero_image_url: JSON.stringify(products),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'setting_key'
      })

    if (error) {
      console.error('Error updating carousel products:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (error: any) {
    console.error('Error in updateHomepageCarouselProducts:', error)
    return { success: false, error: error.message || 'Failed to update carousel products' }
  }
}
