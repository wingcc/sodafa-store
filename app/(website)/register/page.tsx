// app/register/page.tsx
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
  User,
  Check,
  X,
  Sparkles
} from 'lucide-react'
import { Suspense } from 'react'

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/dashboard'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const supabase = createClient()

  const hasMinLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password)
  const passwordStrength = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push(returnUrl)
      }
    }
    checkSession()
  }, [router, returnUrl, supabase])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }

    if (!agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy')
      setIsLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: name.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          setError('An account with this email already exists. Please sign in instead.')
        } else {
          setError(signUpError.message)
        }
        setIsLoading(false)
        return
      }

      if (data?.user?.identities?.length === 0) {
        setError('This email is already registered. Please sign in.')
        setIsLoading(false)
        return
      }

      router.push(returnUrl)
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{ 
        background: `radial-gradient(ellipse at top, var(--color-mediumGreen), var(--color-darkGreen))`,
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl"
          style={{ background: 'var(--color-gold)', opacity: 0.06 }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl"
          style={{ background: 'var(--color-gold)', opacity: 0.05 }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'var(--color-gold)', opacity: 0.04 }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
         

        <div 
          className="backdrop-blur-xl border rounded-2xl p-8 shadow-2xl"
          style={{ 
            background: 'rgba(15, 61, 49, 0.4)',
            borderColor: 'rgba(205, 165, 82, 0.12)'
          }}
        >
          <form onSubmit={handleRegister} className="space-y-5">
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

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-cream)' }}>
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-warmCream)' }} />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all duration-300"
                  style={{
                    background: 'rgba(10, 44, 35, 0.5)',
                    borderColor: 'rgba(205, 165, 82, 0.12)',
                    color: 'var(--color-cream)',
                  }}
                  disabled={isLoading}
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-cream)' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-warmCream)' }} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all duration-300"
                  style={{
                    background: 'rgba(10, 44, 35, 0.5)',
                    borderColor: 'rgba(205, 165, 82, 0.12)',
                    color: 'var(--color-cream)',
                  }}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-cream)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-warmCream)' }} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-12 py-3 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all duration-300"
                  style={{
                    background: 'rgba(10, 44, 35, 0.5)',
                    borderColor: 'rgba(205, 165, 82, 0.12)',
                    color: 'var(--color-cream)',
                  }}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--color-warmCream)' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-cream)' }}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-warmCream)' }} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-12 py-3 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all duration-300"
                  style={{
                    background: 'rgba(10, 44, 35, 0.5)',
                    borderColor: 'rgba(205, 165, 82, 0.12)',
                    color: 'var(--color-cream)',
                  }}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--color-warmCream)' }}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {password.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        passwordStrength <= 2
                          ? 'bg-red-500'
                          : passwordStrength <= 3
                          ? 'bg-yellow-500'
                          : passwordStrength <= 4
                          ? 'bg-blue-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs whitespace-nowrap" style={{ color: 'var(--color-warmCream)' }}>
                    {passwordStrength <= 2 ? 'Weak' : passwordStrength <= 3 ? 'Fair' : passwordStrength <= 4 ? 'Good' : 'Strong'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className={`flex items-center gap-1 ${hasMinLength ? 'text-green-400' : 'text-gray-500'}`}>
                    {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1 ${hasUpperCase ? 'text-green-400' : 'text-gray-500'}`}>
                    {hasUpperCase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Uppercase</span>
                  </div>
                  <div className={`flex items-center gap-1 ${hasLowerCase ? 'text-green-400' : 'text-gray-500'}`}>
                    {hasLowerCase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Lowercase</span>
                  </div>
                  <div className={`flex items-center gap-1 ${hasNumber ? 'text-green-400' : 'text-gray-500'}`}>
                    {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Number</span>
                  </div>
                  <div className={`flex items-center gap-1 col-span-2 ${hasSpecialChar ? 'text-green-400' : 'text-gray-500'}`}>
                    {hasSpecialChar ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Special character</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 pt-1">
              <button
                type="button"
                onClick={() => setAgreeToTerms(!agreeToTerms)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 mt-0.5 ${
                  agreeToTerms
                    ? 'border-gold'
                    : 'border-warmCream/20 hover:border-warmCream/40'
                }`}
                style={{ background: agreeToTerms ? 'var(--color-gold)' : 'transparent' }}
              >
                {agreeToTerms && <span className="text-xs" style={{ color: 'var(--color-darkGreen)' }}>✓</span>}
              </button>
              <span className="text-sm" style={{ color: 'var(--color-warmCream)' }}>
                I agree to the{' '}
                <Link href="/terms" className="transition-colors" style={{ color: 'var(--color-gold)' }}>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="transition-colors" style={{ color: 'var(--color-gold)' }}>
                  Privacy Policy
                </Link>
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, var(--color-gold), var(--color-gold))`,
                color: 'var(--color-darkGreen)',
                boxShadow: '0 4px 20px rgba(205, 165, 82, 0.25)'
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'rgba(205, 165, 82, 0.08)' }} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4" style={{ color: 'var(--color-warmCream)' }}>Already have an account?</span>
            </div>
          </div>

          <Link
            href={`/login${returnUrl ? `?returnUrl=${returnUrl}` : ''}`}
            className="w-full py-3 px-4 rounded-xl border text-white font-medium text-sm transition-all duration-300 hover:bg-white/5 flex items-center justify-center gap-2 group"
            style={{ 
              borderColor: 'rgba(205, 165, 82, 0.15)',
              color: 'var(--color-cream)'
            }}
          >
            <span>Sign in instead</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-sm transition-colors"
              style={{ color: 'var(--color-warmCream)' }}
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--color-warmCream)' }}>
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="transition-colors" style={{ color: 'var(--color-gold)' }}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="transition-colors" style={{ color: 'var(--color-gold)' }}>
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a2c23] text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}