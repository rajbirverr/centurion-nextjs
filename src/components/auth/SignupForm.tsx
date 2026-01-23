'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/actions/auth'

interface SignupFormProps {
  returnUrl?: string | null
}

export default function SignupForm({ returnUrl }: SignupFormProps) {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newsletter, setNewsletter] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const result = await signUp({
        email,
        password,
        firstName,
        lastName,
      })

      if (result.success) {
        // Redirect based on return_url or default to account page
        // Use window.location.href for full page reload to ensure session cookie is read
        if (returnUrl) {
          window.location.href = decodeURIComponent(returnUrl)
        } else {
          window.location.href = '/account'
        }
      } else {
        setError(result.error || 'Failed to create account')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto px-6 py-8 md:py-0 auth-page">
      <h1 className="text-3xl font-normal text-[#5a4c46] mb-8">
        Create Account
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-[#5a4c46] mb-2 uppercase tracking-wider text-xs">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-transparent border-b border-[#5a4c46] text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:border-[#5a4c46] transition-colors"
              placeholder="First"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-[#5a4c46] mb-2 uppercase tracking-wider text-xs">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-transparent border-b border-[#5a4c46] text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:border-[#5a4c46] transition-colors"
              placeholder="Last"
            />
          </div>
        </div>

        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-[#5a4c46] mb-2 uppercase tracking-wider text-xs">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-transparent border-b border-[#5a4c46] text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:border-[#5a4c46] transition-colors"
            placeholder="Enter your email"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium text-[#5a4c46] mb-2 uppercase tracking-wider text-xs">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-transparent border-b border-[#5a4c46] text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:border-[#5a4c46] transition-colors"
            placeholder="Enter your password"
            minLength={6}
          />
          <p className="mt-1 text-xs text-[#84756f]">Must be at least 6 characters</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#5a4c46] mb-2 uppercase tracking-wider text-xs">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-transparent border-b border-[#5a4c46] text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:border-[#5a4c46] transition-colors"
            placeholder="Confirm your password"
            minLength={6}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="newsletter"
            checked={newsletter}
            onChange={(e) => setNewsletter(e.target.checked)}
            className="mr-2 h-4 w-4 text-[#5a4c46] focus:ring-[#5a4c46] rounded"
          />
          <label htmlFor="newsletter" className="text-[#84756f] text-xs">
            Subscribe to our newsletter
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-black text-white hover:bg-[#1a1a1a] uppercase tracking-[0.1em] text-xs font-normal rounded-[14px] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:bg-[#0a0a0a]"
        >
          {loading ? 'REGISTERING...' : 'REGISTER'}
        </button>

        <p className="text-sm text-center text-[#84756f]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#5a4c46] hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}

