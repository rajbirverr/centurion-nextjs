'use server'

import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { ShineCarouselProduct } from './homepage'

/**
 * Get showcase card image URL (cached)
 */
export const getShowcaseCardImageUrl = unstable_cache(
  async (): Promise<string | null> => {
    try {
      const supabase = createAdminClient()
      const { data } = await supabase
        .from('site_settings')
        .select('hero_image_url')
        .eq('setting_key', 'showcase_card_image')
        .single()
      
      return data?.hero_image_url || null
    } catch (error) {
      console.error('Error fetching showcase card image:', error)
      return null
    }
  },
  ['showcase-card-image'],
  {
    revalidate: 300, // 5 minutes cache
    tags: ['homepage', 'site-settings']
  }
)

/**
 * Get shine carousel products (cached)
 */
export const getShineCarouselProducts = unstable_cache(
  async (): Promise<ShineCarouselProduct[]> => {
    try {
      const supabase = createAdminClient()
      
      // Get products
      const { data: products } = await supabase
        .from('products')
        .select('id, name, category_id')
        .eq('in_shine_carousel', true)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(5)

      if (!products || products.length === 0) return []

      // Get images in parallel
      const productIds = products.map(p => p.id)
      const { data: images } = await supabase
        .from('product_images')
        .select('product_id, image_url, is_primary')
        .in('product_id', productIds)
        .eq('is_primary', true)

      // Get categories
      const categoryIds = [...new Set(products.map(p => p.category_id).filter(Boolean))]
      const { data: categories } = categoryIds.length > 0 ? await supabase
        .from('categories')
        .select('id, name')
        .in('id', categoryIds) : { data: [] }

      return products.map(product => {
        const productImage = images?.find(img => img.product_id === product.id)
        const category = categories?.find(cat => cat.id === product.category_id)
        
        return {
          id: product.id,
          name: product.name,
          location: category?.name || '',
          image: productImage?.image_url || ''
        }
      })
    } catch (error) {
      console.error('Error fetching shine carousel products:', error)
      return []
    }
  },
  ['shine-carousel-products'],
  {
    revalidate: 300, // 5 minutes cache
    tags: ['homepage', 'products']
  }
)
