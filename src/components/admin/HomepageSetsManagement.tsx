'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  getHomepageSetsForAdmin,
  updateHomepageSetsSection,
  createHomepageSetsFilter,
  updateHomepageSetsFilter,
  deleteHomepageSetsFilter,
  type HomepageSetsSection,
  type HomepageSetsFilter
} from '@/lib/actions/homepage-sets'
import { Button, Input } from './ui'

interface HomepageSetsManagementProps {
  initialData: {
    section: HomepageSetsSection | null
    filters: HomepageSetsFilter[]
    categories: Array<{ id: string; name: string; slug: string }>
    categoriesWithSubcategories: Array<{
      id: string
      name: string
      slug: string
      subcategories: Array<{ id: string; name: string; slug: string }>
    }>
  }
}

export default function HomepageSetsManagement({ initialData }: HomepageSetsManagementProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<HomepageSetsFilter[]>(initialData.filters || [])
  const [categories] = useState(initialData.categories || [])
  const [categoriesWithSubcategories] = useState(initialData.categoriesWithSubcategories || [])
  const [availableSubcategories, setAvailableSubcategories] = useState<Array<{ id: string; name: string; slug: string }>>([])

  const [sectionData, setSectionData] = useState({
    title: initialData.section?.title || 'Just for you - we have sets',
    button_text: initialData.section?.button_text || 'SHOP BEST SELLERS',
    button_link: initialData.section?.button_link || '/all-products',
    is_enabled: initialData.section?.is_enabled ?? true
  })

  const [showFilterForm, setShowFilterForm] = useState(false)
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null)
  const [filterForm, setFilterForm] = useState({
    label: '',
    category_slug: '',
    subcategory_slug: '',
    link_url: '',
    display_order: filters.length + 1,
    is_enabled: true,
    is_default: false
  })

  // Update available subcategories when category changes
  const updateSubcategories = (categorySlug: string) => {
    const category = categoriesWithSubcategories.find(c => c.slug === categorySlug)
    setAvailableSubcategories(category?.subcategories || [])
  }

  const handleSaveSection = async () => {
    if (!sectionData.title.trim()) {
      setError('Title is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await updateHomepageSetsSection(sectionData)
      if (result.success) {
        router.refresh()
        window.location.reload()
      } else {
        setError(result.error || 'Failed to save section')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save section')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveFilter = async () => {
    if (!filterForm.label.trim()) {
      setError('Filter label is required')
      return
    }

    if (!filterForm.link_url.trim() && !filterForm.category_slug) {
      setError('Either category or link URL is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let result
      if (editingFilterId) {
        result = await updateHomepageSetsFilter(editingFilterId, {
          ...filterForm,
          link_url: filterForm.category_slug
            ? filterForm.subcategory_slug
              ? `/all-products?category=${filterForm.category_slug}&subcategory=${filterForm.subcategory_slug}`
              : `/all-products?category=${filterForm.category_slug}`
            : filterForm.link_url
        })
      } else {
        result = await createHomepageSetsFilter({
          ...filterForm,
          link_url: filterForm.category_slug
            ? filterForm.subcategory_slug
              ? `/all-products?category=${filterForm.category_slug}&subcategory=${filterForm.subcategory_slug}`
              : `/all-products?category=${filterForm.category_slug}`
            : filterForm.link_url
        })
      }

      if (result.success) {
        // Refresh data
        const refreshResult = await getHomepageSetsForAdmin()
        if (refreshResult.success && refreshResult.data) {
          setFilters(refreshResult.data.filters)
        }
        setShowFilterForm(false)
        setEditingFilterId(null)
        setFilterForm({
          label: '',
          category_slug: '',
          subcategory_slug: '',
          link_url: '',
          display_order: filters.length + 1,
          is_enabled: true,
          is_default: false
        })
        setAvailableSubcategories([])
        router.refresh()
      } else {
        setError(result.error || 'Failed to save filter')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save filter')
    } finally {
      setLoading(false)
    }
  }

  const handleEditFilter = (filter: HomepageSetsFilter) => {
    setEditingFilterId(filter.id)
    // Load subcategories for this category
    if (filter.category_slug) {
      updateSubcategories(filter.category_slug)
    }
    setFilterForm({
      label: filter.label,
      category_slug: filter.category_slug || '',
      subcategory_slug: filter.subcategory_slug || '',
      link_url: filter.link_url,
      display_order: filter.display_order,
      is_enabled: filter.is_enabled,
      is_default: filter.is_default
    })
    setShowFilterForm(true)
  }

  const handleDeleteFilter = async (id: string) => {
    if (!confirm('Are you sure you want to delete this filter?')) {
      return
    }

    setLoading(true)
    try {
      const result = await deleteHomepageSetsFilter(id)
      if (result.success) {
        const refreshResult = await getHomepageSetsForAdmin()
        if (refreshResult.success && refreshResult.data) {
          setFilters(refreshResult.data.filters)
        }
        router.refresh()
      } else {
        setError(result.error || 'Failed to delete filter')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete filter')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFilter = async (filter: HomepageSetsFilter) => {
    setLoading(true)
    try {
      const result = await updateHomepageSetsFilter(filter.id, {
        is_enabled: !filter.is_enabled
      })
      if (result.success) {
        const refreshResult = await getHomepageSetsForAdmin()
        if (refreshResult.success && refreshResult.data) {
          setFilters(refreshResult.data.filters)
        }
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update filter')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Section Settings */}
      <div className="border-b pb-6">
        <h2 className="text-xl font-semibold text-[#5a4c46] mb-4">Section Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Section Title"
              value={sectionData.title}
              onChange={(e) => setSectionData({ ...sectionData, title: e.target.value })}
              placeholder="Just for you - we have sets"
              required
            />
          </div>
          <Input
            label="Button Text"
            value={sectionData.button_text}
            onChange={(e) => setSectionData({ ...sectionData, button_text: e.target.value })}
            placeholder="SHOP BEST SELLERS"
            required
          />
          <Input
            label="Button Link"
            value={sectionData.button_link}
            onChange={(e) => setSectionData({ ...sectionData, button_link: e.target.value })}
            placeholder="/all-products"
            required
          />
          <div className="md:col-span-2 flex items-center">
            <input
              type="checkbox"
              id="section_enabled"
              checked={sectionData.is_enabled}
              onChange={(e) => setSectionData({ ...sectionData, is_enabled: e.target.checked })}
              className="w-4 h-4 text-[#5a4c46] border-gray-300 rounded focus:ring-[#5a4c46]"
            />
            <label htmlFor="section_enabled" className="ml-2 text-sm font-medium text-gray-700">
              Enable Section on Homepage
            </label>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSaveSection} isLoading={loading} disabled={loading}>
            Save Section Settings
          </Button>
        </div>
      </div>

      {/* Filters Management */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#5a4c46]">Filter Tabs</h2>
          <Button onClick={() => {
            setShowFilterForm(true)
            setEditingFilterId(null)
            setFilterForm({
              label: '',
              category_slug: '',
              subcategory_slug: '',
              link_url: '',
              display_order: filters.length + 1,
              is_enabled: true,
              is_default: false
            })
            setAvailableSubcategories([])
          }}>
            + Add Filter
          </Button>
        </div>

        {/* Filter Form */}
        {showFilterForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
            <h3 className="text-lg font-medium text-[#5a4c46] mb-4">
              {editingFilterId ? 'Edit Filter' : 'Add Filter'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Filter Label"
                  value={filterForm.label}
                  onChange={(e) => setFilterForm({ ...filterForm, label: e.target.value })}
                  placeholder="SETS"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link to Category (or use custom URL below)
                </label>
                <select
                  value={filterForm.category_slug}
                  onChange={(e) => {
                    const slug = e.target.value
                    updateSubcategories(slug)
                    setFilterForm({
                      ...filterForm,
                      category_slug: slug,
                      subcategory_slug: '',
                      link_url: slug ? `/all-products?category=${slug}` : filterForm.link_url
                    })
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                >
                  <option value="">Select Category (Optional)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              {filterForm.category_slug && availableSubcategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory (Optional)
                  </label>
                  <select
                    value={filterForm.subcategory_slug}
                    onChange={(e) => {
                      const subcatSlug = e.target.value
                      setFilterForm({
                        ...filterForm,
                        subcategory_slug: subcatSlug,
                        link_url: subcatSlug
                          ? `/all-products?category=${filterForm.category_slug}&subcategory=${subcatSlug}`
                          : `/all-products?category=${filterForm.category_slug}`
                      })
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                  >
                    <option value="">All Subcategories</option>
                    {availableSubcategories.map((subcat) => (
                      <option key={subcat.id} value={subcat.slug}>
                        {subcat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <Input
                  label="Custom Link URL (if not using category)"
                  value={filterForm.link_url}
                  onChange={(e) => setFilterForm({ ...filterForm, link_url: e.target.value })}
                  placeholder="/all-products"
                  disabled={!!filterForm.category_slug}
                />
              </div>
              <div>
                <Input
                  label="Display Order"
                  type="number"
                  value={filterForm.display_order}
                  onChange={(e) => setFilterForm({ ...filterForm, display_order: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filterForm.is_enabled}
                    onChange={(e) => setFilterForm({ ...filterForm, is_enabled: e.target.checked })}
                    className="w-4 h-4 text-[#5a4c46] border-gray-300 rounded focus:ring-[#5a4c46]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enabled</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filterForm.is_default}
                    onChange={(e) => setFilterForm({ ...filterForm, is_default: e.target.checked })}
                    className="w-4 h-4 text-[#5a4c46] border-gray-300 rounded focus:ring-[#5a4c46]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Default (shown first)</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowFilterForm(false)
                  setEditingFilterId(null)
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveFilter} isLoading={loading} disabled={loading}>
                {editingFilterId ? 'Update' : 'Add'} Filter
              </Button>
            </div>
          </div>
        )}

        {/* Filters List */}
        <div className="space-y-2">
          {filters.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No filters added yet. Click "Add Filter" to create one.</p>
          ) : (
            filters.map((filter) => (
              <div key={filter.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-[#5a4c46]">{filter.label}</span>
                    {filter.is_default && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">DEFAULT</span>
                    )}
                    {!filter.is_enabled && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">DISABLED</span>
                    )}
                    <span className="text-xs text-gray-500">Order: {filter.display_order}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {filter.category_slug ? (
                      <span>
                        Category: {categories.find(c => c.slug === filter.category_slug)?.name || filter.category_slug}
                        {filter.subcategory_slug && (
                          <span className="ml-1">
                            → Subcategory: {
                              categoriesWithSubcategories
                                .find(c => c.slug === filter.category_slug)
                                ?.subcategories.find(s => s.slug === filter.subcategory_slug)?.name
                              || filter.subcategory_slug
                            }
                          </span>
                        )}
                      </span>
                    ) : (
                      <span>Link: {filter.link_url}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filter.is_enabled}
                      onChange={() => handleToggleFilter(filter)}
                      className="w-4 h-4 text-[#5a4c46] border-gray-300 rounded focus:ring-[#5a4c46]"
                    />
                  </label>
                  <Button
                    variant="outline"
                    onClick={() => handleEditFilter(filter)}
                    disabled={loading}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteFilter(filter.id)}
                    disabled={loading}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
