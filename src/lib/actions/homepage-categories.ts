'use server'

import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { CategoryCarouselItem } from './homepage'

/**
 * Get category carousel items (cached)
 */
export const getCategoryCarouselItems = unstable_cache(
  async (): Promise<CategoryCarouselItem[]> => {
    try {
      const supabase = createAdminClient()
      
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name, image_url')
        .not('image_url', 'is', null)
        .neq('image_url', '')
        .order('sort_order', { ascending: true })

      if (!categories) return []

      return categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        image: cat.image_url || ''
      }))
    } catch (error) {
      console.error('Error fetching category carousel items:', error)
      return []
    }
  },
  ['category-carousel-items'],
  {
    revalidate: 3600, // 1 hour cache (categories don't change often)
    tags: ['homepage', 'categories']
  }
)
