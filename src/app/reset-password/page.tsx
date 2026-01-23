'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import LoginHero from '@/components/auth/LoginHero'

function ResetPasswordContent() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [initializing, setInitializing] = useState(true)

  // Handle Supabase password reset tokens from URL hash
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Debug: Log the full URL to see what we're getting
        console.log('Full URL:', window.location.href)
        console.log('URL Hash:', window.location.hash)
        console.log('URL Search:', window.location.search)
        
        // Check for tokens in URL hash (Supabase sends them in hash)
        const hash = window.location.hash.substring(1)
        const hashParams = new URLSearchParams(hash)
        
        // Also check query params (sometimes Supabase sends them there)
        const searchParams = new URLSearchParams(window.location.search)
        
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token')
        const type = hashParams.get('type') || searchParams.get('type')
        
        console.log('Tokens found:', { type, hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken })

        if (type === 'recovery' && accessToken && refreshToken) {
          // Exchange tokens for session
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            console.error('Error setting session:', sessionError)
            setError(`Invalid or expired reset link: ${sessionError.message}. Please request a new password reset.`)
            setInitializing(false)
            return
          }

          if (data.session) {
            // Session established successfully
            console.log('Session established successfully')
            setInitializing(false)
          } else {
            setError('Failed to establish session. Please request a new password reset.')
            setInitializing(false)
          }
        } else {
          // No tokens found - show helpful error
          console.error('No tokens found in URL', { 
            hash, 
            search: window.location.search,
            type,
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken
          })
          
          // Check if there's an existing session (user might have already reset)
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            console.log('Found existing session')
            setInitializing(false)
          } else {
            setError('Invalid reset link - no tokens found. Please check: 1) The redirect URL is added in Supabase Dashboard, 2) You clicked the link from a NEW password reset email (old links won\'t work).')
            setInitializing(false)
          }
        }
      } catch (err: any) {
        console.error('Error initializing:', err)
        setError(`Failed to initialize password reset: ${err.message}. Please try again.`)
        setInitializing(false)
      }
    }

    initializeSession()
  }, [])

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
      // Update password using client-side supabase (requires session from tokens)
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        setError(updateError.message || 'Failed to update password')
        setLoading(false)
        return
      }

      // Success! Sign out and redirect to login
      await supabase.auth.signOut()
      setSuccess(true)
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  if (initializing) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-1/2">
          <LoginHero />
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center bg-white min-h-[50vh] md:min-h-screen py-12 md:py-0">
          <div className="w-full max-w-md mx-auto px-6 py-8 md:py-0 auth-page">
            <div className="text-[#5a4c46]">Initializing...</div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-1/2">
          <LoginHero />
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center bg-white min-h-[50vh] md:min-h-screen py-12 md:py-0">
          <div className="w-full max-w-md mx-auto px-6 py-8 md:py-0 auth-page">
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md mb-4 text-sm">
              Password updated successfully! Redirecting to login...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Hero Section - Left side on desktop, top on mobile */}
      <div className="w-full md:w-1/2">
        <LoginHero />
      </div>

      {/* Form Section - Right side on desktop, bottom on mobile */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white min-h-[50vh] md:min-h-screen py-12 md:py-0">
        <div className="w-full max-w-md mx-auto px-6 py-8 md:py-0 auth-page">
          <h1 className="text-3xl font-normal text-[#5a4c46] mb-8">
            Reset Password
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#5a4c46] mb-2 uppercase tracking-wider text-xs">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-transparent border-b border-[#5a4c46] text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:border-[#5a4c46] transition-colors"
                placeholder="Enter new password"
                minLength={6}
                autoFocus
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
                placeholder="Confirm new password"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-white hover:bg-[#1a1a1a] uppercase tracking-[0.1em] text-xs font-normal rounded-[14px] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:bg-[#0a0a0a]"
            >
              {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
            </button>

            <p className="text-sm text-center text-[#84756f]">
              Remember your password?{' '}
              <a href="/login" className="text-[#5a4c46] hover:underline">
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f3f0ef]">
        <div className="text-[#5a4c46]">Loading...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}

