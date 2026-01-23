'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// Types
export interface BlogPost {
    id: string
    title: string
    slug: string
    excerpt: string | null
    content: string | null
    featured_image: string | null
    category: string
    author: string
    published_at: string | null
    is_featured: boolean
    seo_title: string | null
    seo_description: string | null
    created_at: string
    updated_at: string
}

export interface BlogProduct {
    blog_id: string
    product_id: string
}

export interface ProductSummary {
    id: string
    name: string
    image_url: string | null
    price: number
}

/* 
  -----------------------------------------------------------------------------
  PUBLIC FETCHING
  -----------------------------------------------------------------------------
*/

// Fetch all published blogs for the public index page
export async function getPublishedBlogs(category?: string) {
    try {
        const supabase = createAdminClient()
        let query = supabase
            .from('blogs')
            .select('*')
            .not('published_at', 'is', null)
            .lte('published_at', new Date().toISOString())
            .order('is_featured', { ascending: false }) // Featured first
            .order('published_at', { ascending: false })

        if (category && category !== 'ALL') {
            query = query.ilike('category', category)
        }

        const { data, error } = await query

        if (error) throw error
        return data as BlogPost[]
    } catch (error) {
        console.error('Error fetching published blogs:', error)
        return []
    }
}

// Fetch single blog by slug for public detail page
export async function getBlogBySlug(slug: string) {
    try {
        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('blogs')
            .select('*, blog_products(*)') // Ideally join to get product details, but simple join first
            .eq('slug', slug)
            .single()

        if (error) return null
        return data as BlogPost
    } catch (error) {
        console.error('Error fetching blog by slug:', error)
        return null
    }
}

/* 
  -----------------------------------------------------------------------------
  ADMIN FETCHING
  -----------------------------------------------------------------------------
*/

export async function getAllBlogsForAdmin() {
    try {
        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return { success: true, data: data as BlogPost[] }
    } catch (error) {
        console.error('Error fetching admin blogs:', error)
        return { success: false, error }
    }
}

export async function getBlogById(id: string) {
    try {
        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return { success: true, data: data as BlogPost }
    } catch (error) {
        console.error('Error fetching blog by id:', error)
        return { success: false, error }
    }
}

/* 
  -----------------------------------------------------------------------------
  ADMIN MUTATIONS
  -----------------------------------------------------------------------------
*/

export async function createBlog(data: Partial<BlogPost>) {
    try {
        const supabase = createAdminClient()

        // Auto-generate slug if not provided
        if (!data.slug && data.title) {
            data.slug = data.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '')
        }

        const { data: newBlog, error } = await supabase
            .from('blogs')
            .insert(data)
            .select()
            .single()

        if (error) throw error
        revalidatePath('/admin/blogs')
        revalidatePath('/blogs')
        return { success: true, data: newBlog }
    } catch (error: any) {
        console.error('Error creating blog:', error)
        return { success: false, error: error.message }
    }
}

export async function updateBlog(id: string, data: Partial<BlogPost>) {
    try {
        const supabase = createAdminClient()
        const { data: updatedBlog, error } = await supabase
            .from('blogs')
            .update(data)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        revalidatePath('/admin/blogs')
        revalidatePath('/blogs')
        revalidatePath(`/blogs/${updatedBlog.slug}`)
        return { success: true, data: updatedBlog }
    } catch (error: any) {
        console.error('Error updating blog:', error)
        return { success: false, error: error.message }
    }
}

export async function deleteBlog(id: string) {
    try {
        const supabase = createAdminClient()
        const { error } = await supabase
            .from('blogs')
            .delete()
            .eq('id', id)

        if (error) throw error
        revalidatePath('/admin/blogs')
        return { success: true }
    } catch (error: any) {
        console.error('Error deleting blog:', error)
        return { success: false, error: error.message }
    }
}

export async function searchProductsForBlog(query: string): Promise<ProductSummary[]> {
    try {
        const supabase = createAdminClient()

        // 1. Fetch Products matching name
        let dbQuery = supabase
            .from('products')
            .select('id, name, price')
            .order('created_at', { ascending: false })
            .limit(10)

        if (query) {
            dbQuery = dbQuery.ilike('name', `%${query}%`)
        }

        const { data: products, error } = await dbQuery

        if (error) throw error
        if (!products || products.length === 0) return []

        // 2. Fetch Images for these products manually
        const productIds = products.map(p => p.id)
        const { data: images } = await supabase
            .from('product_images')
            .select('product_id, image_url, is_primary')
            .in('product_id', productIds)

        // Map images back to products
        return products.map((p: any) => {
            // Find primary image, or any image
            const productImages = images?.filter(img => img.product_id === p.id) || []
            const primary = productImages.find(img => img.is_primary)
            const first = productImages[0]

            return {
                id: p.id,
                name: p.name,
                image_url: primary?.image_url || first?.image_url || null,
                price: p.price
            }
        }) as ProductSummary[]

    } catch (error) {
        console.error('Error searching products:', error)
        return []
    }
}
