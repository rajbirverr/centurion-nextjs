'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updatePassword, signOut } from '@/lib/actions/auth'

export default function SettingsSection() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      setLoading(false)
      return
    }

    // Validate password strength
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const result = await updatePassword(passwordData.newPassword)

      if (result.success) {
        setSuccess(true)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error || 'Failed to update password')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to log out?')) {
      return
    }

    setLoggingOut(true)
    try {
      await signOut()
      router.push('/')
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to log out')
      setLoggingOut(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Password Change */}
      <div>
        <h2 className="text-xl font-semibold text-[#5a4c46] mb-6">Change Password</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
            Password updated successfully!
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-[#5a4c46] mb-1 uppercase tracking-wider text-xs">
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full px-4 py-2 bg-[#f3f0ef] border-none rounded-md text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-[#5a4c46] mb-1 uppercase tracking-wider text-xs">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              required
              minLength={6}
              className="w-full px-4 py-2 bg-[#f3f0ef] border-none rounded-md text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
              placeholder="Enter new password"
            />
            <p className="mt-1 text-xs text-[#84756f]">Must be at least 6 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#5a4c46] mb-1 uppercase tracking-wider text-xs">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              required
              minLength={6}
              className="w-full px-4 py-2 bg-[#f3f0ef] border-none rounded-md text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
              placeholder="Confirm new password"
            />
          </div>

          <div className="pt-4 border-t border-[#e5e2e0]">
            <button
              type="submit"
              className="px-6 py-2 bg-[#5a4c46] text-white hover:bg-[#4a3c36] rounded-md uppercase tracking-wider text-xs transition-colors duration-200"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Logout */}
      <div className="pt-8 border-t border-[#e5e2e0]">
        <h2 className="text-xl font-semibold text-[#5a4c46] mb-4">Account Actions</h2>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md uppercase tracking-wider text-xs transition-colors duration-200"
          disabled={loggingOut}
        >
          {loggingOut ? 'Logging Out...' : 'Log Out'}
        </button>
      </div>
    </div>
  )
}


