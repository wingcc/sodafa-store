// app/api/auth/logout/route.ts
import { createServerClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api'
import { ApiError } from '@/lib/api'

export async function POST() {
  try {
    const supabase = createServerClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return errorResponse('LOGOUT_FAILED', error.message, 500)
    }

    return successResponse({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return errorResponse(
      'INTERNAL_SERVER_ERROR',
      'An unexpected error occurred',
      500
    )
  }
}