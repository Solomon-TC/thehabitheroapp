import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import CharacterCreation from './CharacterCreation';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [needsCharacter, setNeedsCharacter] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user && !router.pathname.startsWith('/auth')) {
        router.push('/auth');
        return;
      }

      if (user) {
        const { data: character } = await supabase
          .from('characters')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!character && !router.pathname.startsWith('/auth')) {
          setNeedsCharacter(true);
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCharacterCreationComplete = () => {
    setNeedsCharacter(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (needsCharacter) {
    return <CharacterCreation onComplete={handleCharacterCreationComplete} />;
  }

  return <>{children}</>;
}
