'use server'

import { unstable_cache } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Cached function to get products by category
 * Uses unstable_cache for 5-minute cache with tags for on-demand revalidation
 */
export async function getProductsByCategory(
  categoryId: string | null,
  subcategoryId: string | null = null,
  searchQuery: string | null = null
) {
  return unstable_cache(
    async () => {
      const supabase = await createServerSupabaseClient()
      
      let query = supabase
        .from('products')
        .select('*')
        .eq('status', 'published')

      if (searchQuery && searchQuery.trim().length > 0) {
        query = query.ilike('name', `%${searchQuery.trim()}%`)
      } else if (categoryId) {
        query = query.eq('category_id', categoryId)
        if (subcategoryId) {
          query = query.eq('subcategory_id', subcategoryId)
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) {
        console.error('[PRODUCTS] Error:', error)
        return []
      }

      return data || []
    },
    [`products-${categoryId || 'all'}-${subcategoryId || 'none'}-${searchQuery || 'none'}`],
    {
      revalidate: 300, // 5 minutes cache
      tags: ['products', categoryId ? `products-category-${categoryId}` : 'products-all']
    }
  )()
}

/**
 * Cached function to get product images
 */
export async function getProductImages(productIds: string[]) {
  if (productIds.length === 0) return []
  
  return unstable_cache(
    async () => {
      const supabase = await createServerSupabaseClient()
      const { data, error } = await supabase
        .from('product_images')
        .select('product_id, image_url, is_primary')
        .in('product_id', productIds)
        .eq('is_primary', true)

      if (error) {
        console.error('[PRODUCT IMAGES] Error:', error)
        return []
      }

      return data || []
    },
    [`product-images-${productIds.sort().join('-')}`],
    {
      revalidate: 3600, // 1 hour cache
      tags: ['product-images']
    }
  )()
}

/**
 * Cached function to get categories by IDs
 */
export async function getCategoriesByIds(categoryIds: string[]) {
  if (categoryIds.length === 0) return []
  
  return unstable_cache(
    async () => {
      const supabase = await createServerSupabaseClient()
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .in('id', categoryIds)

      if (error) {
        console.error('[CATEGORIES] Error:', error)
        return []
      }

      return data || []
    },
    [`categories-${categoryIds.sort().join('-')}`],
    {
      revalidate: 3600, // 1 hour cache
      tags: ['categories']
    }
  )()
}
