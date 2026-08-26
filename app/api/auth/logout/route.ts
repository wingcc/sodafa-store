// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notificationService } from '@/lib/services/notificationService'

export async function POST() {
  try {
    // Attempt server-side signOut (best-effort, ignore error if dummy client)
    try {
      const supabase = createServerClient()
      await supabase.auth.signOut()
    } catch {}

    // Clear all Supabase auth cookies so middleware sees no session
    const cookieStore = await cookies()
    const response = NextResponse.json({ success: true, data: { message: 'Logged out successfully' } })

    // Expire every sb-* cookie (covers sb-<ref>-auth-token, refresh-token, etc.)
    for (const cookie of cookieStore.getAll()) {
      if (cookie.name.startsWith('sb-')) {
        response.cookies.set(cookie.name, '', {
          path: '/',
          maxAge: 0,
          expires: new Date(0),
        })
        // Also clear with default path variations Supabase may use
        response.cookies.set(cookie.name, '', {
          path: '/',
          maxAge: 0,
        })
      }
    }
    // Ensure the main auth-token cookies are explicitly cleared even if not enumerated
    // (covers cases where cookies are httpOnly and not visible)
    response.cookies.set('sb-access-token', '', { path: '/', maxAge: 0 })
    response.cookies.set('sb-refresh-token', '', { path: '/', maxAge: 0 })

    // Send security notification
    try {
      const admin = createAdminClient()
      await notificationService.create({
        type: 'security',
        title: 'User signed out',
        message: 'A user has signed out of the dashboard.',
        priority: 'low',
      })
    } catch {}

    return response
  } catch (error) {
    console.error('Logout error:', error)
    // Still return a response that clears cookies
    const response = NextResponse.json({ success: true, data: { message: 'Logged out (forced)' } })
    response.cookies.set('sb-access-token', '', { path: '/', maxAge: 0 })
    response.cookies.set('sb-refresh-token', '', { path: '/', maxAge: 0 })
    return response
  }
}