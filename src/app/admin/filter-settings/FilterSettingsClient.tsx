'use client'

import { useState } from 'react'
import { createFilterConfig, updateFilterConfig, deleteFilterConfig, type FilterConfig } from '@/lib/actions/filter-config'
import { Button, Input, Card, Badge } from '@/components/admin/ui'

interface FilterSettingsClientProps {
  initialConfigs: FilterConfig[]
}

export default function FilterSettingsClient({ initialConfigs }: FilterSettingsClientProps) {
  const [configs, setConfigs] = useState<FilterConfig[]>(initialConfigs)
  const [showForm, setShowForm] = useState(false)
  const [editingConfig, setEditingConfig] = useState<FilterConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    filter_type: 'product_type' as FilterConfig['filter_type'],
    value: '',
    display_label: '',
    sort_order: 0,
    is_active: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let result
      if (editingConfig) {
        result = await updateFilterConfig(editingConfig.id, formData)
      } else {
        result = await createFilterConfig(formData)
      }

      if (result.success) {
        // Reload page to get updated configs
        window.location.reload()
      } else {
        setError(result.error || 'Failed to save filter config')
      }
    } catch (err: any) {
      console.error('Error saving filter config:', err)
      setError(err.message || 'Failed to save filter config')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this filter config?')) return

    try {
      const result = await deleteFilterConfig(id)
      if (result.success) {
        window.location.reload()
      } else {
        alert(result.error || 'Failed to delete filter config')
      }
    } catch (error: any) {
      console.error('Error deleting filter config:', error)
      alert(error.message || 'Failed to delete filter config')
    }
  }

  const handleEdit = (config: FilterConfig) => {
    setEditingConfig(config)
    setFormData({
      filter_type: config.filter_type,
      value: config.value,
      display_label: config.display_label,
      sort_order: config.sort_order,
      is_active: config.is_active
    })
    setShowForm(true)
  }

  const handleNew = () => {
    setEditingConfig(null)
    setFormData({
      filter_type: 'product_type',
      value: '',
      display_label: '',
      sort_order: 0,
      is_active: true
    })
    setShowForm(true)
  }

  const groupedConfigs = configs.reduce((acc, config) => {
    if (!acc[config.filter_type]) {
      acc[config.filter_type] = []
    }
    acc[config.filter_type].push(config)
    return acc
  }, {} as Record<string, FilterConfig[]>)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">Manage filter options for product filtering</p>
        <Button onClick={handleNew}>+ New Filter Config</Button>
      </div>

      {showForm && (
        <Card title={editingConfig ? 'Edit Filter Config' : 'New Filter Config'}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter Type
                </label>
                <select
                  value={formData.filter_type}
                  onChange={(e) => setFormData({ ...formData, filter_type: e.target.value as FilterConfig['filter_type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                  required
                >
                  <option value="product_type">Product Type</option>
                  <option value="color">Color</option>
                  <option value="price">Price</option>
                  <option value="size">Size</option>
                  <option value="sort">Sort</option>
                </select>
              </div>

              <Input
                label="Value"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                required
              />

              <Input
                label="Display Label"
                value={formData.display_label}
                onChange={(e) => setFormData({ ...formData, display_label: e.target.value })}
                required
              />

              <Input
                label="Sort Order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-[#5a4c46] focus:ring-[#5a4c46] border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingConfig(null)
                  setError(null)
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={loading}
                disabled={loading}
              >
                {editingConfig ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {Object.keys(groupedConfigs).map((filterType) => (
        <Card key={filterType} title={filterType.replace('_', ' ').toUpperCase()} className="capitalize">
          <div className="space-y-3">
            {groupedConfigs[filterType].map((config) => (
              <div
                key={config.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-gray-900">{config.display_label}</p>
                    <Badge variant={config.is_active ? 'success' : 'default'}>
                      {config.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Value: {config.value} | Sort: {config.sort_order}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(config)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(config.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {configs.length === 0 && (
        <Card>
          <p className="text-center text-gray-500 py-8">No filter configurations found. Create one to get started.</p>
        </Card>
      )}
    </div>
  )
}

