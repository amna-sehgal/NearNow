import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publicRoutes = ['/', '/auth'];

  const { response, user } = await updateSession(request);

  // Not logged in + trying to access protected route → redirect to auth
  if (!user && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Logged in + on auth page → redirect to feed
  if (user && pathname === '/auth') {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};