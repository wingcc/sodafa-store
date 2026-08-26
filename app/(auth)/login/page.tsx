// app/(auth)/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight,
  Shield,
} from 'lucide-react'
import { Suspense } from 'react'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          router.push(returnUrl)
        }
      } catch (err) {
        console.error('Session check error:', err)
      }
    }
    checkSession()
  }, [router, returnUrl, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    try {
      console.log('🔐 Attempting login...', { email: email.trim() })

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        console.error('❌ Sign in error:', signInError)

        // Send security notification for failed login
        fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'security',
            title: 'Failed login attempt',
            message: `Failed login attempt for ${email.trim()}: ${signInError.message}`,
            priority: 'urgent',
          }),
        }).catch(() => {})

        const errorMessages: Record<string, string> = {
          'Invalid login credentials': 'Invalid email or password. Please try again.',
          'Email not confirmed': 'Please confirm your email address before signing in.',
          'User not found': 'No account found with this email.',
          'Invalid email': 'Please enter a valid email address.',
          'User already registered': 'This email is already registered. Please sign in instead.',
        }
        const userMessage = errorMessages[signInError.message] || signInError.message
        setError(userMessage)
        setIsLoading(false)
        return
      }

      console.log('✅ Login successful', data)

      // Send security notification for successful login
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'security',
          title: 'Successful login',
          message: `User ${email.trim()} signed in successfully.`,
          priority: 'medium',
        }),
      }).catch(() => {})

      router.push(returnUrl)
      router.refresh()
    } catch (err) {
      console.error('🔥 Unhandled login error:', err)
      const message = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      setError(message)
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{ 
        background: `radial-gradient(ellipse at top, #0b3d2e, #061c16)`,
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl"
          style={{ background: '#cda552', opacity: 0.06 }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl"
          style={{ background: '#cda552', opacity: 0.05 }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
          style={{ background: '#cda552', opacity: 0.04 }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-4"
            style={{ 
              background: `linear-gradient(135deg, #cda552, #cda552)`,
              boxShadow: '0 8px 32px rgba(205, 165, 82, 0.25)'
            }}
          >
            <Shield className="w-8 h-8" style={{ color: '#061c16' }} />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: '#f5f0e6' }}>Welcome Back</h1>
          <p className="mt-2" style={{ color: '#e8dfc8' }}>Sign in to your account to continue</p>
        </div>

        {/* Login Card */}
        <div 
          className="backdrop-blur-xl border rounded-2xl p-8 shadow-2xl"
          style={{ 
            background: 'rgba(15, 61, 49, 0.4)',
            borderColor: 'rgba(205, 165, 82, 0.12)'
          }}
        >
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div 
                className="px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                style={{ 
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#f87171'
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#f87171' }} />
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: '#f5f0e6' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#e8dfc8' }} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#cda552] transition-all duration-300"
                  style={{
                    background: 'rgba(10, 44, 35, 0.5)',
                    borderColor: 'rgba(205, 165, 82, 0.12)',
                    color: '#f5f0e6',
                  }}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium" style={{ color: '#f5f0e6' }}>
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs transition-colors"
                  style={{ color: '#cda552' }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#e8dfc8' }} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#cda552] transition-all duration-300"
                  style={{
                    background: 'rgba(10, 44, 35, 0.5)',
                    borderColor: 'rgba(205, 165, 82, 0.12)',
                    color: '#f5f0e6',
                  }}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#e8dfc8' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                  rememberMe
                    ? 'border-[#cda552]'
                    : 'border-[#e8dfc8]/20 hover:border-[#e8dfc8]/40'
                }`}
                style={{ background: rememberMe ? '#cda552' : 'transparent' }}
              >
                {rememberMe && <span className="text-xs" style={{ color: '#cda552' }}>✓</span>}
              </button>
              <span className="text-sm" style={{ color: '#e8dfc8' }}>Remember me</span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, #cda552, #cda552)`,
                color: '#061c16',
                boxShadow: '0 4px 20px rgba(205, 165, 82, 0.25)'
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'rgba(205, 165, 82, 0.08)' }} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4" style={{ color: '#e8dfc8' }}>{"Don't have an account?"}</span>
            </div>
          </div>

          {/* Register link */}
          <Link
            href={`/register${returnUrl ? `?returnUrl=${returnUrl}` : ''}`}
            className="w-full py-3 px-4 rounded-xl border text-white font-medium text-sm transition-all duration-300 hover:bg-white/5 flex items-center justify-center gap-2 group"
            style={{ 
              borderColor: 'rgba(205, 165, 82, 0.15)',
              color: '#f5f0e6'
            }}
          >
            <span>Create an account</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          {/* Back to home */}
          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-sm transition-colors"
              style={{ color: '#e8dfc8' }}
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs mt-6" style={{ color: '#e8dfc8' }}>
          By signing in, you agree to our{' '}
          <Link href="/terms" className="transition-colors" style={{ color: '#cda552' }}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="transition-colors" style={{ color: '#cda552' }}>
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a2c23] text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}