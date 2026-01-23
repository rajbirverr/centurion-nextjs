'use client'

import { useState, useEffect } from 'react'
import { getUserProfile, updateUserProfile, type UserProfile } from '@/lib/actions/profile'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

export default function ProfileSection() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const result = await getUserProfile()

      if (result.success && result.profile) {
        setProfile(result.profile)
        setFormData({
          first_name: result.profile.first_name || '',
          last_name: result.profile.last_name || '',
          email: result.profile.email || '',
          phone: result.profile.phone || '',
        })
      } else {
        setError(result.error || 'Failed to load profile')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const result = await updateUserProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || undefined,
      })

      if (result.success) {
        setSuccess(true)
        await loadProfile() // Reload profile
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error || 'Failed to update profile')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-[#84756f]">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label htmlFor="email" className="block text-sm font-medium text-[#5a4c46] mb-1 uppercase tracking-wider text-xs">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            disabled
            className="w-full px-4 py-2 bg-gray-100 border-none rounded-md text-[#84756f] cursor-not-allowed"
            placeholder="Email (cannot be changed)"
          />
          <p className="mt-1 text-xs text-[#84756f]">Email cannot be changed</p>
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
              style={{
                '--react-international-phone-text-color': '#5a4c46',
                '--react-international-phone-border-color': '#e5e2e0',
                '--react-international-phone-selected-dropdown-item-background-color': '#f3f0ef',
              } as React.CSSProperties}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#e5e2e0]">
          <button
            type="submit"
            className="px-6 py-2 bg-[#5a4c46] text-white hover:bg-[#4a3c36] rounded-md uppercase tracking-wider text-xs transition-colors duration-200"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

