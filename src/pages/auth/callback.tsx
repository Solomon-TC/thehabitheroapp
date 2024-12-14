import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getCharacter } from '../../utils/character';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session) {
          // No session, redirect to auth page
          router.push('/auth');
          return;
        }

        // Check if user has a character
        try {
          const character = await getCharacter();
          if (character) {
            // User has a character, redirect to dashboard
            router.push('/dashboard');
          } else {
            // User needs to create a character
            router.push('/character/create');
          }
        } catch (err) {
          // Error getting character (likely doesn't exist), redirect to character creation
          router.push('/character/create');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        router.push('/auth');
      }
    };

    // Get the error and error_description query parameters
    const { error, error_description } = router.query;
    if (error) {
      console.error('Auth error:', error, error_description);
      router.push('/auth');
      return;
    }

    handleCallback();
  }, [router, supabase.auth]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Setting up your adventure...</p>
      </div>
    </div>
  );
}
