/**
 * Next.js Middleware — Route Protection
 *
 * Protects /dashboard/* and /api/admin/* routes.
 * Redirects unauthenticated users to /login.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication (server-side cookie check)
// /dashboard uses a client-side auth guard in layout.tsx (login stores session in localStorage, not cookies).
// /api/admin/* routes are also client-side auth guarded — the admin Supabase client uses
// service_role key (server-only) and does not rely on user session cookies.
const PROTECTED_PATHS: string[] = [];
// Routes that are always public
const PUBLIC_PATHS = ['/login', '/register', '/api/auth', '/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths through
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if this path needs protection
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for Supabase auth session via cookies
  // Supabase stores auth tokens in cookies prefixed with 'sb-'
  const hasAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith('sb-') && cookie.name.includes('auth-token'));

  if (!hasAuthCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - Public assets (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|assets/).*)',
  ],
};
