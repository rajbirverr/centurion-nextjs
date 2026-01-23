'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth'
import SignupForm from '@/components/auth/SignupForm'
import LoginHero from '@/components/auth/LoginHero'

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams?.get('return_url')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const result = await getCurrentUser()
        if (result.success && result.user) {
          // User is already logged in, redirect to account
          router.push('/account')
        }
      } catch (error) {
        // Not logged in, show signup page
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

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
        <SignupForm returnUrl={returnUrl || null} />
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f3f0ef]">
        <div className="text-[#5a4c46]">Loading...</div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}

