'use client'

import { useState, useEffect } from 'react'
import { getUserAddresses, deleteAddress, setDefaultAddress, type CustomerAddress } from '@/lib/actions/addresses'
import AddressForm from './AddressForm'

export default function AddressSection() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addresses, setAddresses] = useState<CustomerAddress[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null)

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    try {
      setLoading(true)
      const result = await getUserAddresses()

      if (result.success && result.addresses) {
        setAddresses(result.addresses)
      } else {
        setError(result.error || 'Failed to load addresses')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load addresses')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return
    }

    try {
      const result = await deleteAddress(addressId)

      if (result.success) {
        await loadAddresses()
      } else {
        alert(result.error || 'Failed to delete address')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete address')
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      const result = await setDefaultAddress(addressId)

      if (result.success) {
        await loadAddresses()
      } else {
        alert(result.error || 'Failed to set default address')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to set default address')
    }
  }

  const handleEdit = (address: CustomerAddress) => {
    setEditingAddress(address)
    setShowForm(true)
  }

  const handleAddNew = () => {
    setEditingAddress(null)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingAddress(null)
    loadAddresses()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingAddress(null)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-[#84756f]">Loading addresses...</div>
      </div>
    )
  }

  if (showForm) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={handleFormCancel}
            className="text-[#5a4c46] hover:text-[#4a3c36] text-sm"
          >
            ← Back to addresses
          </button>
        </div>
        <h2 className="text-xl font-semibold text-[#5a4c46] mb-6">
          {editingAddress ? 'Edit Address' : 'Add New Address'}
        </h2>
        <div className="max-w-2xl">
          <AddressForm
            address={editingAddress || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      </div>
    )
  }

  // Get default address (or first address if no default)
  const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0]

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#84756f] mb-4">No saved addresses</p>
          <button
            onClick={handleAddNew}
            className="border border-[#5a4c46] text-[#5a4c46] px-8 py-2 uppercase tracking-wider text-xs hover:bg-[#5a4c46] hover:text-white transition-colors"
          >
            ADD NEW ADDRESS
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Default Address - Rhode Style */}
          {defaultAddress && (
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[#5a4c46] text-sm mb-2">Default Address</p>
                <p className="text-[#5a4c46] text-sm">{defaultAddress.country}</p>
              </div>
              <div className="flex flex-col gap-2 ml-8">
                <button
                  onClick={() => handleEdit(defaultAddress)}
                  className="text-[#5a4c46] text-xs border border-[#e5e2e0] px-4 py-2 hover:bg-[#f5f5f5] transition-colors uppercase tracking-wider"
                >
                  EDIT
                </button>
                <button
                  onClick={() => handleDelete(defaultAddress.id)}
                  className="text-[#5a4c46] text-xs border border-[#e5e2e0] px-4 py-2 hover:bg-[#f5f5f5] transition-colors uppercase tracking-wider"
                >
                  DELETE
                </button>
              </div>
            </div>
          )}

          {/* Add New Address Button - Centered */}
          <div className="pt-4">
            <button
              onClick={handleAddNew}
              className="border border-[#5a4c46] text-[#5a4c46] px-8 py-2 uppercase tracking-wider text-xs hover:bg-[#5a4c46] hover:text-white transition-colors"
            >
              ADD NEW ADDRESS
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

