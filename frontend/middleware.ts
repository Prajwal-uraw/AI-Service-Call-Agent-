import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// NOTE: Auth is handled client-side via localStorage for demo purposes
// For production, implement proper cookie-based authentication here

export function middleware(request: NextRequest) {
  // Allow all routes - auth is handled client-side
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
