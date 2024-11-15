import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/account', '/feedback'];
// Public routes that don't require authentication
const publicRoutes = ['/', '/auth'];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // If user is authenticated and on a public page, redirect to dashboard
        if (publicRoutes.includes(router.pathname)) {
          router.push('/dashboard');
        }
      } else {
        // If user is not authenticated and tries to access protected routes
        if (protectedRoutes.includes(router.pathname)) {
          router.push('/');
        }
      }
    });

    // Check initial auth state
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user && protectedRoutes.includes(router.pathname)) {
        router.push('/');
      } else if (user && publicRoutes.includes(router.pathname)) {
        router.push('/dashboard');
      }
    };
    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return <Component {...pageProps} />;
}
