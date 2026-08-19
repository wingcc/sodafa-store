// app/auth/callback/route.ts
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  // Default: redirect to confirm page with error status
  const confirmUrl = new URL('/auth/confirm', request.url)

  if (code) {
    try {
      const supabase = createServerClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('❌ Code exchange error:', error)
        confirmUrl.searchParams.set('status', 'error')
        confirmUrl.searchParams.set('error', error.message)
      } else {
        // ✅ Success!
        confirmUrl.searchParams.set('status', 'success')
      }
    } catch (err) {
      console.error('🔥 Unexpected error:', err)
      confirmUrl.searchParams.set('status', 'error')
      confirmUrl.searchParams.set('error', 'An unexpected error occurred')
    }
  } else {
    // No code provided
    confirmUrl.searchParams.set('status', 'error')
    confirmUrl.searchParams.set('error', 'No confirmation code found')
  }

  return NextResponse.redirect(confirmUrl)
}