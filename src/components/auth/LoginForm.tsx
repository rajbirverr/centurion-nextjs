'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/actions/auth'

interface LoginFormProps {
  onForgotPassword: () => void
  returnUrl?: string | null
}

export default function LoginForm({ onForgotPassword, returnUrl }: LoginFormProps) {
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn(email, password)

      if (result.success) {
        // Redirect based on return_url or user role
        // Use window.location.href for full page reload to ensure session cookie is read
        if (returnUrl) {
          window.location.href = decodeURIComponent(returnUrl)
        } else if (result.isAdmin) {
          window.location.href = '/admin/dashboard'
        } else {
          window.location.href = '/account'
        }
      } else {
        setError(result.error || 'Failed to sign in')
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
        Login
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#5a4c46] mb-2 uppercase tracking-wider text-xs">
            Email
          </label>
          <input
            id="email"
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
          <label htmlFor="password" className="block text-sm font-medium text-[#5a4c46] mb-2 uppercase tracking-wider text-xs">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-transparent border-b border-[#5a4c46] text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:border-[#5a4c46] transition-colors"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-black text-white hover:bg-[#1a1a1a] uppercase tracking-[0.1em] text-xs font-normal rounded-[14px] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:bg-[#0a0a0a]"
        >
          {loading ? 'SIGNING IN...' : 'SIGN IN'}
        </button>

        <div className="space-y-2 text-sm">
          <p>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[#5a4c46] hover:underline"
            >
              Forgot your password?
            </button>
          </p>
          <p className="text-[#84756f]">
            Don't have an account?{' '}
            <Link 
              href={returnUrl ? `/account/register?return_url=${encodeURIComponent(returnUrl)}` : "/account/register"} 
              className="text-[#5a4c46] hover:underline"
            >
              Sign up!
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}

