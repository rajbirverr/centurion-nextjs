'use client'

import { useState, useEffect } from 'react'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { createAddress, updateAddress, type CustomerAddress, type CreateAddressData, type UpdateAddressData } from '@/lib/actions/addresses'

interface AddressFormProps {
  address?: CustomerAddress
  onSuccess: () => void
  onCancel: () => void
}

export default function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<CreateAddressData>({
    label: address?.label || 'Home',
    first_name: address?.first_name || '',
    last_name: address?.last_name || '',
    phone: address?.phone || '',
    address_line_1: address?.address_line_1 || '',
    address_line_2: address?.address_line_2 || '',
    city: address?.city || '',
    state: address?.state || '',
    postal_code: address?.postal_code || '',
    country: address?.country || 'India',
    is_default: address?.is_default || false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let result
      if (address) {
        result = await updateAddress({
          id: address.id,
          ...formData,
        })
      } else {
        result = await createAddress(formData)
      }

      if (result.success) {
        onSuccess()
      } else {
        setError(result.error || 'Failed to save address')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save address')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="label" className="block text-sm font-medium text-[#5a4c46] mb-1 uppercase tracking-wider text-xs">
          Label
        </label>
        <select
          id="label"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          className="w-full px-4 py-2 bg-[#f3f0ef] border-none rounded-md text-[#5a4c46] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
        >
          <option value="Home">Home</option>
          <option value="Work">Work</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-[#5a4c46] mb-1 uppercase tracking-wider text-xs">
            First Name
          </label>
          <input
            id="first_name"
            type="text"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
            className="w-full px-4 py-2 bg-[#f3f0ef] border-none rounded-md text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
            placeholder="First name"
          />
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-[#5a4c46] mb-1 uppercase tracking-wider text-xs">
            Last Name
          </label>
          <input
            id="last_name"
            type="text"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
            className="w-full px-4 py-2 bg-[#f3f0ef] border-none rounded-md text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
            placeholder="Last name"
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-[#5a4c46] mb-1 uppercase tracking-wider text-xs">
          Phone Number
        </label>
        <div className="react-phone-input-wrapper">
          <PhoneInput
            international
            defaultCountry="IN"
            value={formData.phone}
            onChange={(value) => setFormData({ ...formData, phone: value || '' })}
            className="phone-input"
            placeholder="Enter phone number"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="address_line_1" className="block text-sm font-medium text-[#5a4c46] mb-1 uppercase tracking-wider text-xs">
          Address Line 1
        </label>
        <input
          id="address_line_1"
          type="text"
          value={formData.address_line_1}
          onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
          required
          className="w-full px-4 py-2 bg-[#f3f0ef] border-none rounded-md text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
          placeholder="Street address"
        />
      </div>

      <div>
        <label htmlFor="address_line_2" className="block text-sm font-medium text-[#5a4c46] mb-1 uppercase tracking-wider text-xs">
          Address Line 2 (Optional)
        </label>
        <input
          id="address_line_2"
          type="text"
          value={formData.address_line_2}
          onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
          className="w-full px-4 py-2 bg-[#f3f0ef] border-none rounded-md text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
          placeholder="Apartment, suite, etc."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-[#5a4c46] mb-1 uppercase tracking-wider text-xs">
            City
          </label>
          <input
            id="city"
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
            className="w-full px-4 py-2 bg-[#f3f0ef] border-none rounded-md text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
            placeholder="City"
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-[#5a4c46] mb-1 uppercase tracking-wider text-xs">
            State
          </label>
          <input
            id="state"
            type="text"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            required
            className="w-full px-4 py-2 bg-[#f3f0ef] border-none rounded-md text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
            placeholder="State"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="postal_code" className="block text-sm font-medium text-[#5a4c46] mb-1 uppercase tracking-wider text-xs">
            Postal Code
          </label>
          <input
            id="postal_code"
            type="text"
            value={formData.postal_code}
            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
            required
            className="w-full px-4 py-2 bg-[#f3f0ef] border-none rounded-md text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
            placeholder="Postal code"
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-[#5a4c46] mb-1 uppercase tracking-wider text-xs">
            Country
          </label>
          <input
            id="country"
            type="text"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            required
            className="w-full px-4 py-2 bg-[#f3f0ef] border-none rounded-md text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
            placeholder="Country"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_default"
          checked={formData.is_default}
          onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
          className="mr-2 h-4 w-4 text-[#5a4c46] focus:ring-[#5a4c46] rounded"
        />
        <label htmlFor="is_default" className="text-[#84756f] text-sm">
          Set as default address
        </label>
      </div>

      <div className="flex gap-4 pt-4 border-t border-[#e5e2e0]">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-[#5a4c46] text-[#5a4c46] hover:bg-[#5a4c46] hover:text-white rounded-md uppercase tracking-wider text-xs transition-colors duration-200"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-[#5a4c46] text-white hover:bg-[#4a3c36] rounded-md uppercase tracking-wider text-xs transition-colors duration-200"
          disabled={loading}
        >
          {loading ? 'Saving...' : address ? 'Update Address' : 'Add Address'}
        </button>
      </div>
    </form>
  )
}


