'use server'

import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { DripCarouselProduct } from './homepage'

/**
 * Get drip carousel products (cached)
 */
export const getDripCarouselProducts = unstable_cache(
  async (): Promise<DripCarouselProduct[]> => {
    try {
      const supabase = createAdminClient()
      
      // Get products
      const { data: products } = await supabase
        .from('products')
        .select('id, name, short_description, description, price')
        .eq('in_drip_carousel', true)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(5)

      if (!products || products.length === 0) return []

      // Get images
      const productIds = products.map(p => p.id)
      const { data: images } = await supabase
        .from('product_images')
        .select('product_id, image_url, is_primary')
        .in('product_id', productIds)
        .eq('is_primary', true)

      return products.map(product => {
        const productImage = images?.find(img => img.product_id === product.id)
        
        return {
          id: product.id,
          name: product.name,
          description: product.short_description || product.description || '',
          image: productImage?.image_url || '',
          price: Number(product.price) || 0
        }
      })
    } catch (error) {
      console.error('Error fetching drip carousel products:', error)
      return []
    }
  },
  ['drip-carousel-products'],
  {
    revalidate: 300, // 5 minutes cache
    tags: ['homepage', 'products']
  }
)
