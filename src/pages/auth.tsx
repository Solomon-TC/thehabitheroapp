import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import AuthForm from '../components/AuthForm';

export default function Auth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Handle email confirmation
    const handleEmailConfirmation = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        try {
          setLoading(true);
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (data?.session) {
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error confirming email:', error);
          setMessage('Error confirming email. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    handleEmailConfirmation();
  }, [router]);

  const handleSignUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
      if (error) throw error;
      setMessage('Check your email for the confirmation link!');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Habit Tracker
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
