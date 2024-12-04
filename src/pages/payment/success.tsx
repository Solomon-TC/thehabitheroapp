import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const { session_id } = router.query;

  useEffect(() => {
    if (session_id) {
      verifySubscription();
    }
  }, [session_id]);

  const verifySubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth');
        return;
      }

      // Verify the subscription was activated
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;

      if (profile?.subscription_status === 'active') {
        showNotification('Subscription activated successfully!', 'success');
      } else {
        // Wait a bit and check again as webhook might be delayed
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('id', session.user.id)
          .single();

        if (updateError) throw updateError;

        if (updatedProfile?.subscription_status === 'active') {
          showNotification('Subscription activated successfully!', 'success');
        } else {
          showNotification('Subscription status pending. Please refresh in a moment.', 'info');
        }
      }

      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error verifying subscription:', error);
      showNotification('Error verifying subscription status', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-start to-gradient-end flex items-center justify-center">
      <div className="game-card p-8 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <svg
            className="w-16 h-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold">Payment Successful!</h1>
        
        <p className="text-white/60">
          {loading
            ? 'Verifying your subscription...'
            : 'Your subscription has been activated. Redirecting to dashboard...'}
        </p>

        {loading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}
