import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSubscriptionStatus } from './lib/stripe';

const PREMIUM_ROUTES = [
  '/dashboard',
  '/character-stats',
  '/progress-report',
  '/friends',
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Check auth status
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect to login if not authenticated
  if (!session) {
    const redirectUrl = new URL('/auth', req.url);
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check if accessing premium route
  const isPremiumRoute = PREMIUM_ROUTES.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  if (isPremiumRoute) {
    try {
      // Check subscription status
      const status = await getSubscriptionStatus(session.user.id);

      if (status !== 'active') {
        // Redirect to subscription page if not subscribed
        return NextResponse.redirect(new URL('/subscription', req.url));
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      // In case of error, redirect to subscription page to be safe
      return NextResponse.redirect(new URL('/subscription', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't require subscription
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth|api/webhook).*)',
  ],
};
