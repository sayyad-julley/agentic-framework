import { NextRequest, NextResponse } from 'next/server';

// ✅ FIXED: Lightweight middleware example
// Note: For demo purposes, authentication is not enforced
// In production, you would redirect unauthenticated users to /login
export function middleware(request: NextRequest) {
  // ✅ Lightweight: Cookie check only (for demonstration)
  const token = request.cookies.get('auth-token')?.value;

  // ✅ Lightweight: Logging
  console.log(`${request.method} ${request.nextUrl.pathname}`);

  // Demo mode: Allow all requests
  // In production, you would add:
  // if (!token && !request.nextUrl.pathname.startsWith('/login')) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};

