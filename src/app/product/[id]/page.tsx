import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import ProductDetailWrapper from '@/components/product/ProductDetailWrapper'
import ReviewsSection from '@/components/reviews/ReviewsSection'

interface ProductDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  
  const { data: product } = await supabase
    .from('products')
    .select('name, description, seo_title, seo_description')
    .eq('slug', id)
    .eq('status', 'published')
    .single()

  if (!product) {
    return {
      title: 'Product Not Found | Centurion',
    }
  }

  return {
    title: product.seo_title || `${product.name} | Centurion`,
    description: product.seo_description || product.description || '',
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  // Fetch product by slug
  // Note: watermark_enabled may not exist yet if migration hasn't been run
  // We'll default to true in the component if not present
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('slug', id)
    .eq('status', 'published')
    .single()

  if (productError || !product) {
    notFound()
  }

  // Fetch product images
  const { data: images } = await supabase
    .from('product_images')
    .select('image_url, alt_text, is_primary, sort_order')
    .eq('product_id', product.id)
    .order('is_primary', { ascending: false })
    .order('sort_order', { ascending: true })

  const productImages = images?.map(img => img.image_url) || []

  // Fetch category if available
  let category = null
  if (product.category_id) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('id', product.category_id)
      .single()
    category = categoryData
  }

  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading product...</div>}>
        <ProductDetailWrapper 
          product={{
            ...product,
            images: productImages,
            price: Number(product.price),
            compare_price: product.compare_price ? Number(product.compare_price) : undefined,
            category: category ? {
              id: category.id,
              name: category.name,
              slug: category.slug
            } : null,
            watermark_enabled: product.watermark_enabled ?? true,
            watermark_color: product.watermark_color || undefined,
            watermark_font_size: product.watermark_font_size || undefined,
            watermark_position: product.watermark_position || undefined,
            watermark_text: product.watermark_text || undefined
          }}
        />
      </Suspense>
      <ReviewsSection 
        productId={product.id} 
        productName={product.name}
      />
    </div>
  )
}
