"use client"

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
}

interface CategoryFilterBarProps {
  categories: Category[]
}

export default function CategoryFilterBar({ categories }: CategoryFilterBarProps) {
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category')

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {/* SHOP ALL Button - Always first */}
            <Link
              href="/all-products"
              prefetch={true}
              className={`flex-shrink-0 px-5 py-3 rounded-full text-xs uppercase tracking-wide font-medium transition-colors duration-200 ${
                !activeCategory
                  ? 'bg-[#5a4c46] text-white border border-[#5a4c46]'
                  : 'bg-white text-[#5a4c46] border border-[#e5e2e0] hover:border-[#5a4c46]'
              }`}
            >
              SHOP ALL
            </Link>

            {/* Category Buttons */}
            {categories.map((category) => {
              const isActive = activeCategory === category.slug
              return (
                <Link
                  key={category.id}
                  href={`/all-products?category=${category.slug}`}
                  prefetch={true}
                  className={`flex-shrink-0 px-5 py-3 rounded-full text-xs uppercase tracking-wide font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-[#5a4c46] text-white border border-[#5a4c46]'
                      : 'bg-white text-[#5a4c46] border border-[#e5e2e0] hover:border-[#5a4c46]'
                  }`}
                >
                  {category.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

