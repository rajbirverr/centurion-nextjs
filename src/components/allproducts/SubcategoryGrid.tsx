"use client"

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'

interface Subcategory {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  display_order: number
}

interface SubcategoryGridProps {
  subcategories: Subcategory[]
  categorySlug: string
  categoryName: string
}

export default function SubcategoryGrid({ subcategories, categorySlug, categoryName }: SubcategoryGridProps) {
  const searchParams = useSearchParams()
  const activeSubcategory = searchParams.get('subcategory')

  if (!subcategories || subcategories.length === 0) {
    return null
  }

  return (
    <div className="bg-white py-1 md:py-2">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {/* Category Title */}
        <div className="mb-2 md:mb-3">
          <h1 className="text-3xl md:text-4xl font-bold text-[#5a4c46] uppercase tracking-tight">
            {categoryName}
          </h1>
          {/* Optional: Add category description here if available */}
        </div>

        {/* Subcategory Grid */}
        <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4">
          {subcategories.map((subcategory) => {
            const isActive = activeSubcategory === subcategory.slug
            const subcategoryUrl = `/all-products?category=${categorySlug}&subcategory=${subcategory.slug}`
            
            return (
              <Link
                key={subcategory.id}
                href={subcategoryUrl}
                className={`flex-shrink-0 group transition-all duration-200 ${
                  isActive ? 'opacity-100' : 'opacity-90 hover:opacity-100'
                }`}
              >
                <div className="w-[140px] md:w-[180px]">
                  {/* Subcategory Image */}
                  <div className="relative w-full aspect-[3/4] mb-3 overflow-hidden bg-[#f3f0ef] rounded-md">
                    {subcategory.image_url ? (
                      <Image
                        src={subcategory.image_url}
                        alt={subcategory.name}
                        fill
                        className={`object-cover transition-transform duration-300 ${
                          isActive ? 'scale-105' : 'group-hover:scale-105'
                        }`}
                        sizes="(max-width: 768px) 140px, 180px"
                        unoptimized={subcategory.image_url.includes('supabase.co') || subcategory.image_url.includes('supabase.in')}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-[#84756f]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute inset-0 border-2 border-[#5a4c46] rounded-md" />
                    )}
                  </div>
                  
                  {/* Subcategory Label */}
                  <div className="text-center">
                    <h3 className={`text-sm md:text-base font-medium transition-colors ${
                      isActive 
                        ? 'text-[#5a4c46]' 
                        : 'text-[#5a4c46] group-hover:text-[#91594c]'
                    }`}>
                      {subcategory.name}
                    </h3>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
