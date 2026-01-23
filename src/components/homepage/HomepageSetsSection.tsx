'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getHomepageSetsData, getProductsForFilter, getProductsByCategorySlug, getAllProductsForSets, type HomepageSetsFilter } from '@/lib/actions/homepage-sets'

// Default values outside component to avoid recreating on each render
const defaultSection = {
  id: 'default',
  title: 'Just for you - we have sets',
  button_text: 'SHOP BEST SELLERS',
  button_link: '/all-products',
  is_enabled: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const defaultFilters: HomepageSetsFilter[] = [
  {
    id: 'default-1',
    label: 'SETS',
    category_slug: 'sets',
    link_url: '/all-products?category=sets',
    display_order: 1,
    is_enabled: true,
    is_default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'default-2',
    label: 'CURATED COMBOS',
    link_url: '/all-products',
    display_order: 2,
    is_enabled: true,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'default-3',
    label: 'MATCHING SETS',
    link_url: '/all-products',
    display_order: 3,
    is_enabled: true,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

interface HomepageSetsSectionProps {
  initialData?: {
    section: typeof defaultSection | null
    filters: HomepageSetsFilter[]
    products: any[]
  }
}

export default function HomepageSetsSection({ initialData }: HomepageSetsSectionProps) {
  const [data, setData] = useState<any>(initialData || null)
  const [loading, setLoading] = useState(!initialData)
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null)
  const [products, setProducts] = useState<any[]>(initialData?.products || [])

  // Use database data or defaults
  const section = useMemo(() => data?.section || defaultSection, [data?.section])
  const filters = useMemo(() => {
    return (data?.filters && data.filters.length > 0) ? data.filters : defaultFilters
  }, [data?.filters])

  // Load initial data only if not provided as prop
  useEffect(() => {
    if (initialData) {
      // Set active filter from initial data
      if (initialData.filters && initialData.filters.length > 0) {
        const defaultFilter = initialData.filters.find((f: HomepageSetsFilter) => f.is_default) || initialData.filters[0]
        setActiveFilterId(defaultFilter.id)
      }
      return
    }

    const loadData = async () => {
      try {
        const result = await getHomepageSetsData()
        setData(result)
        if (result.filters && result.filters.length > 0) {
          const defaultFilter = result.filters.find((f: HomepageSetsFilter) => f.is_default) || result.filters[0]
          setActiveFilterId(defaultFilter.id)
          setProducts(result.products || [])
        }
      } catch (error) {
        console.error('Error loading homepage sets:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [initialData])

  // Set default filter and load products when data is ready
  useEffect(() => {
    if (!loading && filters.length > 0 && !activeFilterId) {
      const defaultFilter = filters.find((f: HomepageSetsFilter) => f.is_default) || filters[0]
      setActiveFilterId(defaultFilter.id)

      // Use products from data if available, otherwise load them
      if (data?.products && data.products.length > 0) {
        setProducts(data.products)
      } else if (!defaultFilter.id.startsWith('default-')) {
        // For database filters, use the server action
        getProductsForFilter(defaultFilter.id).then(setProducts).catch(console.error)
      } else {
        // For default filters, load products based on category
        if (defaultFilter.category_slug) {
          getProductsByCategorySlug(defaultFilter.category_slug).then(setProducts).catch(console.error)
        } else {
          getAllProductsForSets().then(setProducts).catch(console.error)
        }
      }
    }
  }, [loading, filters, activeFilterId, data])

  const handleFilterClick = async (filter: HomepageSetsFilter) => {
    setActiveFilterId(filter.id)

    // For database filters, use the server action
    if (!filter.id.startsWith('default-')) {
      try {
        const filterProducts = await getProductsForFilter(filter.id)
        setProducts(filterProducts)
      } catch (error) {
        console.error('Error loading filter products:', error)
        setProducts([])
      }
    } else {
      // For default filters, use category slug or all products
      try {
        if (filter.category_slug) {
          const categoryProducts = await getProductsByCategorySlug(filter.category_slug)
          setProducts(categoryProducts)
        } else {
          const allProducts = await getAllProductsForSets()
          setProducts(allProducts)
        }
      } catch (error) {
        console.error('Error loading filter products:', error)
        setProducts([])
      }
    }
  }

  // Early returns after all hooks
  if (loading) {
    return null // Don't show while loading
  }

  // Don't show if explicitly disabled
  if (data?.section && !data.section.is_enabled) {
    return null
  }

  // If no filters, don't show
  if (filters.length === 0) {
    return null
  }

  return (
    <section className="w-full bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 pt-8 md:pt-12 pb-12 md:pb-16">
        {/* Title - EXACT Honeylove styling */}
        <h2 className="font-normal text-[#2B2B2B] text-[36px] leading-[100%] md:text-[56px] mx-auto max-w-[300px] md:max-w-[800px] mb-12 md:mb-16 text-center">
          {section.title}
        </h2>

        {/* Filter Buttons Container - EXACT Honeylove styling with flex-row */}
        <div className="flex justify-center mb-10 md:mb-14">
          <div className="w-full relative bg-[#D4D4CB] flex flex-row rounded-full p-[2px] max-w-[800px]">
            {filters.map((filter: HomepageSetsFilter) => {
              const isActive = activeFilterId === filter.id
              return (
                <button
                  key={filter.id}
                  onClick={() => handleFilterClick(filter)}
                  className={`text-center border-none m-[2px] text-black z-[9] cursor-pointer overflow-hidden uppercase transition-all duration-200 flex-1 text-[10px] xs:text-[12px] md:text-[16px] min-h-[32px] md:min-h-[37px] flex items-center justify-center leading-none px-1 rounded-full ${isActive
                    ? 'bg-white shadow-sm'
                    : 'bg-transparent hover:bg-black/5'
                    }`}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Products Grid - EXACT Honeylove layout */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10 md:mb-14">
            {products.map((product) => (
              <div key={product.id} className="flex flex-col justify-between items-start">
                <div className="flex flex-col justify-between items-start w-full grow">
                  <div className="flex flex-col justify-start items-start w-full">
                    {/* Product Image - EXACT aspect ratio */}
                    <div className="relative box-border aspect-[100/127] w-full mb-4 overflow-hidden bg-white">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                          unoptimized={product.image_url.includes('supabase.co') || product.image_url.includes('supabase.in')}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Info - EXACT Honeylove structure */}
                    <div className="text-left w-full">
                      {/* Category Name - ABOVE product name */}
                      {product.category && (
                        <p className="text-xs md:text-sm text-[#2B2B2B]/70 uppercase tracking-wide mb-1 font-normal">
                          {product.category.name}
                        </p>
                      )}

                      {/* Product Name */}
                      <div className="mb-2">
                        <Link
                          href={`/product/${product.slug}`}
                          className="text-base font-normal text-[#2B2B2B] hover:underline inline-block"
                        >
                          {product.name}
                        </Link>
                      </div>

                      {/* Price */}
                      <p className="text-base text-[#2B2B2B] font-normal mb-3">
                        ₹{product.price.toLocaleString('en-IN')}
                      </p>

                      {/* Color Swatches */}
                      {product.colors && product.colors.length > 0 && (
                        <div className="flex items-center gap-1.5 mb-3">
                          {product.colors.slice(0, 6).map((color: any, index: number) => (
                            <button
                              key={index}
                              type="button"
                              className="w-3 h-3 rounded-full border border-gray-300 hover:border-gray-400 transition-colors"
                              style={{ backgroundColor: color.code || '#ccc' }}
                              title={color.name}
                              aria-label={`Color: ${color.name}`}
                            />
                          ))}
                          {product.colors.length > 6 && (
                            <span className="text-[13px] text-[#757575] pt-2">+{product.colors.length - 6}</span>
                          )}
                        </div>
                      )}

                      {/* Shop Link */}
                      <Link
                        href={`/product/${product.slug}`}
                        className="inline-block text-base font-normal text-[#2B2B2B] hover:underline"
                      >
                        Shop
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#2B2B2B]/60">No products found for this filter.</p>
          </div>
        )}

        {/* Button - EXACT Honeylove link style */}
        <div className="flex justify-center">
          <Link
            href={section?.button_link || '/all-products'}
            className="inline-block bg-[#2d2d2d] hover:bg-black text-white px-8 py-3 md:px-10 md:py-4 text-sm md:text-base font-medium transition-colors"
          >
            {section?.button_text || 'SHOP BEST SELLERS'}
          </Link>
        </div>
      </div>
    </section>
  )
}
