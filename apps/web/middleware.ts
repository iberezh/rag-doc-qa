import { type NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'helpbase_token';

// Gate the dashboard (/app/*); the landing page, auth pages, and widget stay public.
// Presence-only check for fast redirects; the API verifies the JWT on every request.
export function middleware(req: NextRequest): NextResponse {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const path = req.nextUrl.pathname;

  if (path.startsWith('/app') && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if ((path === '/login' || path === '/signup') && token) {
    return NextResponse.redirect(new URL('/app', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/login', '/signup'],
};
