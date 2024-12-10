import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import AuthForm from '../components/AuthForm';

export default function Auth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Check for access token in the URL
    const handleInitialRedirect = async () => {
      if (router.query.error) {
        setMessage(router.query.error_description as string || 'Error during authentication');
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Auth error:', error);
        setMessage(error instanceof Error ? error.message : 'Authentication error');
      } finally {
        setLoading(false);
      }
    };

    handleInitialRedirect();
  }, [router, supabase.auth]);

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
        console.log('Signup successful:', data);
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-xl mb-4">Loading...</div>
        <div className="text-sm text-gray-500">
          {message && <div className="mt-2">{message}</div>}
        </div>
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
