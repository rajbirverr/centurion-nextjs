'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { resetPassword } from '@/lib/actions/auth'

interface PasswordResetFormProps {
  onCancel: () => void
}

export default function PasswordResetForm({ onCancel }: PasswordResetFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await resetPassword(email)
      if (result.success) {
        setResetSent(true)
        setError('')
      } else {
        setError(result.error || 'Failed to send reset email')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (resetSent) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md mb-4 text-sm">
          We've sent you an email with a link to update your password.
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-[#5a4c46] text-sm hover:underline uppercase tracking-wider"
        >
          Back to Login
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto auth-page">
      <h2 className="text-2xl font-normal text-[#5a4c46] mb-2">
        Reset your password
      </h2>
      <p className="text-sm text-[#84756f] mb-6">
        We will send you an email to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="reset-email" className="block text-sm font-medium text-[#5a4c46] mb-2 uppercase tracking-wider text-xs">
            Email
          </label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-transparent border-b border-[#5a4c46] text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:border-[#5a4c46] transition-colors"
            placeholder="Enter your email"
            autoFocus
          />
        </div>

        <div className="flex gap-3 items-center">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-black text-white hover:bg-[#1a1a1a] uppercase tracking-[0.1em] text-xs font-normal rounded-[14px] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:bg-[#0a0a0a]"
          >
            {loading ? 'SUBMITTING...' : 'SUBMIT'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-4 text-[#5a4c46] hover:text-black uppercase tracking-[0.1em] text-xs font-normal transition-colors duration-200 active:opacity-70"
          >
            CANCEL
          </button>
        </div>
      </form>
    </div>
  )
}

