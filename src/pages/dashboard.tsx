import { useEffect, useState } from 'react';
import AuthWrapper from '../components/AuthWrapper';
import CharacterDisplay from '../components/CharacterDisplay';
import HabitList from '../components/HabitList';
import GoalList from '../components/GoalList';
import { createClient } from '../lib/supabase';
import type { Character } from '../types/character';

function DashboardPage() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      if (!character) throw new Error('Character not found');

      setCharacter(character as Character);
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Character Section */}
        <div className="lg:col-span-1">
          <CharacterDisplay />
        </div>

        {/* Quests Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Daily Quests */}
          <div className="rpg-panel">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-pixel text-rpg-light">Daily Quests</h2>
              <a href="/manage" className="rpg-button-secondary">
                Manage Quests
              </a>
            </div>
            <HabitList />
          </div>

          {/* Epic Quests */}
          <div className="rpg-panel">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-pixel text-rpg-light">Epic Quests</h2>
              <a href="/manage" className="rpg-button-secondary">
                Manage Quests
              </a>
            </div>
            <GoalList />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPageWrapper() {
  return (
    <AuthWrapper>
      <DashboardPage />
    </AuthWrapper>
  );
}
