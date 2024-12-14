import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  // URLs that don't require authentication
  const publicUrls = [
    '/',
    '/auth',
    '/auth/callback',
  ];

  // Check if the current URL is public
  const isPublicUrl = publicUrls.some(url => req.nextUrl.pathname === url);

  // URLs that require authentication but don't require a character
  const authOnlyUrls = [
    '/character/create',
  ];

  // Check if the URL only requires authentication
  const isAuthOnlyUrl = authOnlyUrls.some(url => req.nextUrl.pathname === url);

  // If user is not signed in and tries to access a protected route
  if (!session && !isPublicUrl) {
    const redirectUrl = new URL('/auth', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is signed in and tries to access auth page
  if (session && req.nextUrl.pathname === '/auth') {
    const redirectUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is signed in, check for character on protected routes
  if (session && !isPublicUrl && !isAuthOnlyUrl) {
    try {
      // Check if user has a character
      const { data: character, error } = await supabase
        .from('characters')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      // If no character and not on character creation page, redirect to character creation
      if (!character && !error && req.nextUrl.pathname !== '/character/create') {
        const redirectUrl = new URL('/character/create', req.url);
        return NextResponse.redirect(redirectUrl);
      }

      // If has character and on character creation page, redirect to dashboard
      if (character && req.nextUrl.pathname === '/character/create') {
        const redirectUrl = new URL('/dashboard', req.url);
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('Error in middleware:', error);
      // On error, proceed with the request
      return res;
    }
  }

  return res;
}

// Specify which routes this middleware should run for
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     * - api routes (backend endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
