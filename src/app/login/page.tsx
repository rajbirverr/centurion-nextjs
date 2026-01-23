'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth'
import LoginForm from '@/components/auth/LoginForm'
import PasswordResetForm from '@/components/auth/PasswordResetForm'
import LoginHero from '@/components/auth/LoginHero'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('return_url')
  const [loading, setLoading] = useState(true)
  const [showReset, setShowReset] = useState(false)

  useEffect(() => {
    // Check URL hash for password reset
    const hash = window.location.hash
    if (hash === '#recover') {
      setShowReset(true)
    }

    // Handle hash changes
    const handleHashChange = () => {
      if (window.location.hash === '#recover') {
        setShowReset(true)
      } else {
        setShowReset(false)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const result = await getCurrentUser()
        if (result.success && result.user) {
          // User is already logged in, redirect to account
          router.push('/account')
        }
      } catch (error) {
        // Not logged in, show login page
      } finally {
        setLoading(false)
      }
    }
    checkAuth()

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [router])

  const handleForgotPassword = () => {
    window.location.hash = '#recover'
    setShowReset(true)
  }

  const handleCancelReset = () => {
    window.location.hash = ''
    setShowReset(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f0ef]">
        <div className="text-[#5a4c46]">Loading...</div>
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
        {showReset ? (
          <PasswordResetForm onCancel={handleCancelReset} />
        ) : (
          <LoginForm onForgotPassword={handleForgotPassword} returnUrl={returnUrl} />
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f3f0ef]">
        <div className="text-[#5a4c46]">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}

