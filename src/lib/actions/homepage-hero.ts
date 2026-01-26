'use server'

import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Get hero image URL (cached)
 */
export const getHeroImageUrl = unstable_cache(
  async (): Promise<string | null> => {
    try {
      const supabase = createAdminClient()
      const { data } = await supabase
        .from('site_settings')
        .select('hero_image_url')
        .eq('setting_key', 'hero_image')
        .single()
      
      return data?.hero_image_url || null
    } catch (error) {
      console.error('Error fetching hero image:', error)
      return null
    }
  },
  ['hero-image'],
  {
    revalidate: 300, // 5 minutes cache
    tags: ['homepage', 'site-settings']
  }
)
