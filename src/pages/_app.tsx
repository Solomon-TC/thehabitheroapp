import { useState } from 'react';
import type { AppProps } from 'next/app';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { NotificationProvider } from '../contexts/NotificationContext';
import { SubscriptionProvider } from '../contexts/SubscriptionContext';
import '../styles/globals.css';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
}

if (!process.env.NEXT_PUBLIC_BASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_BASE_URL');
}

export default function App({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <NotificationProvider>
        <SubscriptionProvider>
          <Component {...pageProps} />
        </SubscriptionProvider>
      </NotificationProvider>
    </SessionContextProvider>
  );
}
