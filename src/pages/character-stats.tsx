import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Character {
  id: string;
  name: string;
  level: number;
  experience: number;
}

export default function CharacterStats() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCharacter();
  }, []);

  const fetchCharacter = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setCharacter(data);
    } catch (error) {
      console.error('Error fetching character:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading character stats...</div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">No Character Found</h2>
          <p className="text-gray-600">
            You haven't created a character yet. Head to the dashboard to create one!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6">{character.name}</h1>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Level</h2>
              <div className="text-4xl font-bold text-blue-600">{character.level}</div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Experience</h2>
              <div className="bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full"
                  style={{ width: `${(character.experience % 100)}%` }}
                />
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {character.experience} XP
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
