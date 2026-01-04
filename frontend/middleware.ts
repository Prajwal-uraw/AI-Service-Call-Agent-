import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();
  
  // Check if it's AlertStream subdomain
  if (hostname.includes('alertstream.kestrelvoice.com') || hostname.includes('alertstream.localhost')) {
    // Root → AlertStream home
    if (url.pathname === '/') {
      url.pathname = '/alertstream';
      return NextResponse.rewrite(url);
    }
    
    // Already has /alertstream prefix, continue
    if (url.pathname.startsWith('/alertstream')) {
      return NextResponse.next();
    }
    
    // Add /alertstream prefix for subdomain requests
    url.pathname = `/alertstream${url.pathname}`;
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
