import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SubscriptionContextType {
  isSubscribed: boolean;
  isLoading: boolean;
  checkSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsSubscribed(false);
        return;
      }

      // For now, everyone is on the free plan
      setIsSubscribed(false);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  return (
    <SubscriptionContext.Provider value={{ isSubscribed, isLoading, checkSubscription }}>
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
