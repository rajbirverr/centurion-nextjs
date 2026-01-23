'use client'

import ProductDetailClient from './ProductDetailClient'

interface ProductDetailWrapperProps {
  product: {
    id: string
    name: string
    slug: string
    description?: string
    short_description?: string
    price: number
    compare_price?: number
    inventory_count: number
    images: string[]
    category?: { id: string; name: string; slug: string } | null
  }
}

export default function ProductDetailWrapper({ product }: ProductDetailWrapperProps) {
  return <ProductDetailClient product={product} />
}

