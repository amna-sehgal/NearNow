import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publicRoutes = ['/', '/auth'];

  const response = await updateSession(request);

  const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const rawKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

  const supabase = createServerClient(rawUrl, rawKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll() {},
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

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