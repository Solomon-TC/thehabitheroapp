import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import AuthForm from '../components/AuthForm';

export default function Auth() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if we're returning from email confirmation
    const handleEmailConfirmation = async () => {
      const hash = window.location.hash;
      const error = router.query.error;
      const errorDescription = router.query.error_description;
      
      if (hash || error) {
        setLoading(true);
        try {
          if (hash && hash.includes('access_token')) {
            // Get session from URL fragment
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            if (session) {
              router.push('/dashboard');
              return;
            }
          } else if (error) {
            setMessage(errorDescription as string || 'Error confirming email');
          }
        } catch (error) {
          console.error('Error handling confirmation:', error);
          setMessage(error instanceof Error ? error.message : 'Error confirming email');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    handleEmailConfirmation();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      setMessage('');

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        }
      });

      if (error) throw error;

      if (data.user?.identities?.length === 0) {
        setMessage('This email is already registered. Please sign in instead.');
      } else {
        setMessage('Please check your email for the confirmation link.');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      setMessage(error instanceof Error ? error.message : 'Error signing up');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setMessage('');

      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.session) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setMessage(error instanceof Error ? error.message : 'Error signing in');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Habit Hero
          </h2>
          {message && (
            <div className="mt-2 text-center text-sm text-gray-600">
              {message}
            </div>
          )}
        </div>
        <AuthForm
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          loading={loading}
        />
      </div>
    </div>
  );
}
