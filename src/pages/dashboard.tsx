import { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase';
import AuthWrapper from '../components/AuthWrapper';
import CharacterDisplay from '../components/CharacterDisplay';
import HabitList from '../components/HabitList';
import type { Character } from '../types/character';
import type { Habit } from '../types/database';

function DashboardPage() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [habits, setHabits] = useState<Habit[]>([]);
  const supabase = createClient();

  useEffect(() => {
    loadCharacter();
  }, []);

  const loadCharacter = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: character, error: characterError } = await supabase
        .from('characters')
        .select(`
          *,
          character_appearance:character_appearances(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (characterError) throw characterError;
      setCharacter(character);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load character');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rpg-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-pixel text-rpg-primary mb-8">Your Quest Board</h1>

      {character && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Character Stats */}
          <div className="md:col-span-1">
            <CharacterDisplay character={character} />
          </div>

          {/* Daily Quests */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-pixel text-rpg-light mb-6">Daily Quests</h2>
            <HabitList habits={habits} setHabits={setHabits} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthWrapper>
      <DashboardPage />
    </AuthWrapper>
  );
}
