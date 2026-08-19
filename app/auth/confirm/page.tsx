// app/auth/confirm/page.tsx
'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const status = searchParams.get('status')
  const error = searchParams.get('error')

  if (status === 'success') {
    return (
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Email Confirmed! 🎉</h1>
        <p className="text-gray-400 mb-6">Your email has been successfully verified.</p>
        <Link
          href="/dashboard"
          className="inline-block bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 font-bold py-3 px-8 rounded-full transition duration-300 hover:shadow-2xl hover:shadow-yellow-500/30"
        >
          Go to Dashboard
        </Link>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="text-center">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Confirmation Failed</h1>
        <p className="text-gray-400 mb-2">
          {error || 'We couldn\'t verify your email.'}
        </p>
        <p className="text-gray-500 text-sm mb-6">
          The confirmation link may have expired or already been used.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 font-bold py-3 px-8 rounded-full transition duration-300"
          >
            Back to Login
          </Link>
          <Link
            href="/resend-confirmation"
            className="border border-white/20 text-white font-medium py-3 px-8 rounded-full transition duration-300 hover:bg-white/10"
          >
            Resend Confirmation
          </Link>
        </div>
      </div>
    )
  }

  // Still loading – no status yet (shouldn't happen if callback redirects properly)
  return (
    <div className="text-center">
      <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mx-auto mb-4" />
      <p className="text-gray-400">Verifying your email...</p>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      <div className="max-w-md w-full">
        <Suspense fallback={
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mx-auto" />
            <p className="text-gray-400 mt-4">Loading...</p>
          </div>
        }>
          <ConfirmationContent />
        </Suspense>
      </div>
    </div>
  )
}