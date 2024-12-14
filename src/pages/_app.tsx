import { useState } from 'react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import type { AppProps } from 'next/app';
import AuthWrapper from '../components/AuthWrapper';
import { NotificationProvider } from '../contexts/NotificationContext';
import '../styles/globals.css';

// Routes that don't need authentication or the AuthWrapper
const publicRoutes = ['/', '/auth', '/auth/callback'];

export default function App({ Component, pageProps, router }: AppProps) {
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const isPublicRoute = publicRoutes.includes(router.pathname);

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <NotificationProvider>
        {isPublicRoute ? (
          <Component {...pageProps} />
        ) : (
          <AuthWrapper>
            <Component {...pageProps} />
          </AuthWrapper>
        )}
      </NotificationProvider>
    </SessionContextProvider>
  );
}
