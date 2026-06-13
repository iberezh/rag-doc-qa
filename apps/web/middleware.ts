import { type NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'helpbase_token';
const PUBLIC_PATHS = ['/login', '/signup'];

// Presence-only gate for fast redirects; the API verifies the JWT on every request.
export function middleware(req: NextRequest): NextResponse {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const isPublic = PUBLIC_PATHS.some((path) => req.nextUrl.pathname.startsWith(path));

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (token && isPublic) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|widget).*)'],
};
