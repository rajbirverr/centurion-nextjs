"use client"

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
}

interface SaleCategoryFilterBarProps {
  categories: Category[]
}

export default function SaleCategoryFilterBar({ categories }: SaleCategoryFilterBarProps) {
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category')

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {/* SAVE YOUR COLLECTION Button - Always first */}
            <Link
              href="/sale"
              className={`flex-shrink-0 px-5 py-3 rounded-full text-xs uppercase tracking-wide font-medium transition-colors duration-200 ${
                !activeCategory
                  ? 'bg-[#E91E63] text-white border border-[#E91E63]'
                  : 'bg-white text-[#5a4c46] border border-[#e5e2e0] hover:border-[#E91E63]'
              }`}
            >
              SAVE YOUR COLLECTION
            </Link>

            {/* Category Buttons */}
            {categories.map((category) => {
              const isActive = activeCategory === category.slug
              return (
                <Link
                  key={category.id}
                  href={`/sale?category=${category.slug}`}
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
