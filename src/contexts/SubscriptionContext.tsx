import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { getSubscriptionStatus, createCheckoutSession, createPortalSession } from '../lib/stripe';
import { useNotification } from './NotificationContext';

interface SubscriptionDetails {
  status: 'active' | 'inactive' | 'past_due' | 'cancelled';
  periodStart?: Date;
  periodEnd?: Date;
  isActive: boolean;
  daysRemaining: number;
}

interface SubscriptionContextType {
  subscription: SubscriptionDetails | null;
  isLoading: boolean;
  checkoutSubscription: () => Promise<void>;
  manageSubscription: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    checkSubscriptionStatus();
    subscribeToSubscriptionChanges();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;

      if (!session) {
        setSubscription(null);
        return;
      }

      const { data, error } = await supabase
        .rpc('get_subscription_details', { user_id: session.user.id });

      if (error) throw error;

      if (data) {
        setSubscription({
          status: data.status,
          periodStart: data.period_start ? new Date(data.period_start) : undefined,
          periodEnd: data.period_end ? new Date(data.period_end) : undefined,
          isActive: data.is_active,
          daysRemaining: data.days_remaining
        });
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      showNotification('Failed to load subscription status', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToSubscriptionChanges = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const subscription = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscription_history',
          filter: `user_id=eq.${session.user.id}`
        },
        () => {
          checkSubscriptionStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  const checkoutSubscription = async () => {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;

      if (!session) {
        router.push('/auth');
        return;
      }

      const checkoutSession = await createCheckoutSession(session.user.id);
      if (checkoutSession.url) {
        router.push(checkoutSession.url);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      showNotification('Failed to start subscription process', 'error');
    }
  };

  const manageSubscription = async () => {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;

      if (!session) {
        router.push('/auth');
        return;
      }

      const portalSession = await createPortalSession(session.user.id);
      if (portalSession.url) {
        router.push(portalSession.url);
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      showNotification('Failed to open subscription management', 'error');
    }
  };

  const refreshSubscription = async () => {
    setIsLoading(true);
    await checkSubscriptionStatus();
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        checkoutSubscription,
        manageSubscription,
        refreshSubscription
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

// Hook to protect premium features
export function usePremiumFeature() {
  const { subscription, isLoading } = useSubscription();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!subscription || !subscription.isActive)) {
      router.push('/subscription');
    }
  }, [subscription, isLoading, router]);

  return {
    isLoading,
    hasAccess: subscription?.isActive ?? false
  };
}

// Hook to check if specific feature is available
export function useFeatureAccess(featureKey: string) {
  const { subscription } = useSubscription();

  // Add feature-specific logic here if needed
  const hasAccess = subscription?.isActive ?? false;

  return {
    hasAccess,
    subscriptionStatus: subscription?.status ?? 'inactive'
  };
}
