'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { createAdminClient, verifyAdmin } from '@/lib/supabase/admin'

export interface FooterSection {
  id: string
  title: string
  position: number
  is_enabled: boolean
  links?: FooterLink[]
}

export interface FooterLink {
  id: string
  section_id: string
  label: string
  url: string
  position: number
  is_enabled: boolean
}

export interface SocialMedia {
  id: string
  platform: string
  url: string
  is_enabled: boolean
}

export interface FooterSettings {
  brand_name: string
  newsletter_enabled: boolean
  newsletter_description: string
  sms_enabled: boolean
  sms_text: string
  sms_number: string
  copyright_text: string
}

export interface FooterData {
  sections: FooterSection[]
  socialMedia: SocialMedia[]
  settings: FooterSettings
}

// Get all footer data for public display
export async function getFooterData(): Promise<FooterData> {
  try {
    const supabase = await createServerSupabaseClient()

    // Get enabled sections with their links
    const { data: sections, error: sectionsError } = await supabase
      .from('footer_sections')
      .select(`
        id,
        title,
        position,
        is_enabled,
        footer_links (
          id,
          section_id,
          label,
          url,
          position,
          is_enabled
        )
      `)
      .eq('is_enabled', true)
      .order('position', { ascending: true })

    if (sectionsError) {
      console.error('Error fetching footer sections:', sectionsError)
    }

    // Get enabled social media
    const { data: socialMedia, error: socialError } = await supabase
      .from('footer_social_media')
      .select('*')
      .eq('is_enabled', true)
      .order('platform', { ascending: true })

    if (socialError) {
      console.error('Error fetching social media:', socialError)
    }

    // Get footer settings
    const { data: settings, error: settingsError } = await supabase
      .from('footer_settings')
      .select('key, value')

    if (settingsError) {
      console.error('Error fetching footer settings:', settingsError)
    }

    // Parse settings into object
    const settingsObj: Partial<FooterSettings> = {}
    if (settings) {
      settings.forEach((s: any) => {
        const key = s.key as keyof FooterSettings
        if (key === 'newsletter_enabled' || key === 'sms_enabled') {
          settingsObj[key] = s.value === 'true'
        } else {
          settingsObj[key] = s.value as any
        }
      })
    }

    // Default settings if not found
    const defaultSettings: FooterSettings = {
      brand_name: 'Centurion',
      newsletter_enabled: true,
      newsletter_description: 'Be the first to discover new drops, special offers, and all things Centurion',
      sms_enabled: false,
      sms_text: 'Text CENTURION to 68805 to never miss a drop!',
      sms_number: '68805',
      copyright_text: 'All Rights Reserved.'
    }

    return {
      sections: (sections || []).map((section: any) => ({
        ...section,
        links: (section.footer_links || [])
          .filter((link: any) => link.is_enabled)
          .sort((a: any, b: any) => a.position - b.position)
      })) as FooterSection[],
      socialMedia: (socialMedia || []) as SocialMedia[],
      settings: { ...defaultSettings, ...settingsObj } as FooterSettings
    }
  } catch (error) {
    console.error('Error in getFooterData:', error)
    return {
      sections: [],
      socialMedia: [],
      settings: {
        brand_name: 'Centurion',
        newsletter_enabled: true,
        newsletter_description: 'Be the first to discover new drops, special offers, and all things Centurion',
        sms_enabled: false,
        sms_text: 'Text CENTURION to 68805 to never miss a drop!',
        sms_number: '68805',
        copyright_text: 'All Rights Reserved.'
      }
    }
  }
}

// Admin functions - Get all footer data (including disabled)
export async function getFooterDataForAdmin(): Promise<{
  sections: FooterSection[]
  socialMedia: SocialMedia[]
  settings: FooterSettings
}> {
  try {
    const user = await getServerUser()
    if (!user) {
      return { sections: [], socialMedia: [], settings: {} as FooterSettings }
    }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) {
      return { sections: [], socialMedia: [], settings: {} as FooterSettings }
    }

    const supabase = createAdminClient()

    // Get all sections with links
    const { data: sections, error: sectionsError } = await supabase
      .from('footer_sections')
      .select(`
        id,
        title,
        position,
        is_enabled,
        footer_links (
          id,
          section_id,
          label,
          url,
          position,
          is_enabled
        )
      `)
      .order('position', { ascending: true })

    if (sectionsError) {
      console.error('Error fetching footer sections:', sectionsError)
    }

    // Get all social media
    const { data: socialMedia, error: socialError } = await supabase
      .from('footer_social_media')
      .select('*')
      .order('platform', { ascending: true })

    if (socialError) {
      console.error('Error fetching social media:', socialError)
    }

    // Get footer settings
    const { data: settings, error: settingsError } = await supabase
      .from('footer_settings')
      .select('key, value')

    if (settingsError) {
      console.error('Error fetching footer settings:', settingsError)
    }

    // Parse settings
    const settingsObj: Partial<FooterSettings> = {}
    if (settings) {
      settings.forEach((s: any) => {
        const key = s.key as keyof FooterSettings
        if (key === 'newsletter_enabled' || key === 'sms_enabled') {
          settingsObj[key] = s.value === 'true'
        } else {
          settingsObj[key] = s.value as any
        }
      })
    }

    const defaultSettings: FooterSettings = {
      brand_name: 'Centurion',
      newsletter_enabled: true,
      newsletter_description: 'Be the first to discover new drops, special offers, and all things Centurion',
      sms_enabled: false,
      sms_text: 'Text CENTURION to 68805 to never miss a drop!',
      sms_number: '68805',
      copyright_text: 'All Rights Reserved.'
    }

    return {
      sections: (sections || []).map((section: any) => ({
        ...section,
        links: (section.footer_links || []).sort((a: any, b: any) => a.position - b.position)
      })) as FooterSection[],
      socialMedia: (socialMedia || []) as SocialMedia[],
      settings: { ...defaultSettings, ...settingsObj } as FooterSettings
    }
  } catch (error) {
    console.error('Error in getFooterDataForAdmin:', error)
    return { sections: [], socialMedia: [], settings: {} as FooterSettings }
  }
}

// Section CRUD
export async function createFooterSection(data: { title: string; position: number }) {
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
    const { data: section, error } = await supabase
      .from('footer_sections')
      .insert(data)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true, data: section }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create section' }
  }
}

export async function updateFooterSection(id: string, data: Partial<{ title: string; position: number; is_enabled: boolean }>) {
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
    const { data: section, error } = await supabase
      .from('footer_sections')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true, data: section }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update section' }
  }
}

export async function deleteFooterSection(id: string) {
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
      .from('footer_sections')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete section' }
  }
}

// Link CRUD
export async function createFooterLink(data: { section_id: string; label: string; url: string; position: number }) {
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
    const { data: link, error } = await supabase
      .from('footer_links')
      .insert(data)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true, data: link }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create link' }
  }
}

export async function updateFooterLink(id: string, data: Partial<{ label: string; url: string; position: number; is_enabled: boolean }>) {
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
    const { data: link, error } = await supabase
      .from('footer_links')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true, data: link }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update link' }
  }
}

export async function deleteFooterLink(id: string) {
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
      .from('footer_links')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete link' }
  }
}

// Social Media CRUD
export async function updateSocialMedia(id: string, data: Partial<{ url: string; is_enabled: boolean }>) {
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
    const { data: social, error } = await supabase
      .from('footer_social_media')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true, data: social }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update social media' }
  }
}

// Settings CRUD
export async function updateFooterSetting(key: string, value: string) {
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
    
    // Check if setting exists
    const { data: existing } = await supabase
      .from('footer_settings')
      .select('id')
      .eq('key', key)
      .maybeSingle()

    let data, error

    if (existing) {
      // Update existing record
      const result = await supabase
        .from('footer_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key)
        .select()
        .single()
      data = result.data
      error = result.error
    } else {
      // Insert new record
      const result = await supabase
        .from('footer_settings')
        .insert({ key, value, updated_at: new Date().toISOString() })
        .select()
        .single()
      data = result.data
      error = result.error
      
      // If insert fails due to duplicate (race condition), try update
      if (error && error.code === '23505') {
        const retryResult = await supabase
          .from('footer_settings')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('key', key)
          .select()
          .single()
        data = retryResult.data
        error = retryResult.error
      }
    }

    revalidatePath('/')
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update setting' }
  }
}
