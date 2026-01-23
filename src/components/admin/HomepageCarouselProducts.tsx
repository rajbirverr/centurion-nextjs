'use client'

import { useState, useEffect, useRef } from 'react'
import { updateHomepageCarouselProducts, getHomepageCarouselProducts } from '@/lib/actions/site-settings'

interface CarouselProduct {
  id: number
  name: string
  location: string
  image: string
}

const DEFAULT_PRODUCTS: CarouselProduct[] = [
  { id: 1, name: "Product 1", location: "Jewelry Collection", image: "/nobackgroundimage/products/photoroom/Photoroom-20250423_132546.png" },
  { id: 2, name: "Product 2", location: "Premium Series", image: "/nobackgroundimage/products/photoroom/Photoroom-20250423_132406.png" },
  { id: 3, name: "Product 3", location: "Limited Edition", image: "/nobackgroundimage/products/photoroom/Photoroom-20250423_132156.png" },
  { id: 4, name: "Product 4", location: "Designer Piece", image: "/nobackgroundimage/products/photoroom/Photoroom-20250423_131410.png" },
  { id: 5, name: "Product 5", location: "Signature Line", image: "/nobackgroundimage/products/photoroom/Photoroom-20250423_125838.png" }
]

export default function HomepageCarouselProducts() {
  const [products, setProducts] = useState<CarouselProduct[]>(DEFAULT_PRODUCTS)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const loadedProducts = await getHomepageCarouselProducts()
    if (loadedProducts && loadedProducts.length > 0) {
      setProducts(loadedProducts)
    }
  }

  const handleProductChange = (index: number, field: keyof CarouselProduct, value: string) => {
    const updated = [...products]
    updated[index] = { ...updated[index], [field]: value }
    setProducts(updated)
    setError(null)
    setSuccess(false)
  }

  const handleSave = async () => {
    setError(null)
    setSuccess(false)
    setSaving(true)

    try {
      // Validate all products have required fields
      for (let i = 0; i < products.length; i++) {
        if (!products[i].name.trim() || !products[i].location.trim() || !products[i].image.trim()) {
          setError(`Product ${i + 1} is missing required fields (name, location, or image)`)
          setSaving(false)
          return
        }
      }

      const result = await updateHomepageCarouselProducts(products)
      if (!result.success) {
        setError(result.error || 'Failed to save carousel products')
        setSaving(false)
        return
      }

      setSuccess(true)
      setEditingIndex(null)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save carousel products')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-lg">
      <h2 className="text-lg font-medium text-gray-900 mb-2">Homepage Carousel Products</h2>
      <p className="text-sm text-gray-600 mb-6">Manage the 5 product images displayed in "The Shine" carousel on the homepage.</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          Carousel products updated successfully!
        </div>
      )}

      <div className="space-y-6">
        {products.map((product, index) => (
          <div key={product.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-4">
              {/* Product Image Preview */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 border border-gray-300 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder-image.png'
                    }}
                  />
                </div>
              </div>

              {/* Product Details Form */}
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Product 1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Location/Collection
                  </label>
                  <input
                    type="text"
                    value={product.location}
                    onChange={(e) => handleProductChange(index, 'location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Jewelry Collection"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={product.image}
                    onChange={(e) => handleProductChange(index, 'image', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="/nobackgroundimage/products/your-image.png"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter image path (e.g., /nobackgroundimage/products/image.png) or full URL
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save All Products'}
        </button>
      </div>
    </div>
  )
}
