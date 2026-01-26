'use server'

import { unstable_cache } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Cached function to get product by slug
 */
export async function getProductBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const supabase = await createServerSupabaseClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (error || !data) {
        return null
      }

      return data
    },
    [`product-${slug}`],
    {
      revalidate: 300, // 5 minutes cache
      tags: ['products', `product-${slug}`]
    }
  )()
}

/**
 * Cached function to get product images
 */
export async function getProductImagesByProductId(productId: string) {
  return unstable_cache(
    async () => {
      const supabase = await createServerSupabaseClient()
      const { data, error } = await supabase
        .from('product_images')
        .select('image_url, alt_text, is_primary, sort_order')
        .eq('product_id', productId)
        .order('is_primary', { ascending: false })
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('[PRODUCT IMAGES] Error:', error)
        return []
      }

      return data?.map(img => img.image_url) || []
    },
    [`product-images-${productId}`],
    {
      revalidate: 3600, // 1 hour cache
      tags: ['product-images', `product-images-${productId}`]
    }
  )()
}

/**
 * Cached function to get category by ID
 */
export async function getCategoryById(categoryId: string) {
  return unstable_cache(
    async () => {
      const supabase = await createServerSupabaseClient()
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('id', categoryId)
        .single()

      return data
    },
    [`category-${categoryId}`],
    {
      revalidate: 3600, // 1 hour cache
      tags: ['categories', `category-${categoryId}`]
    }
  )()
}
