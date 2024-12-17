import { useEffect, useState } from 'react';
import { getCharacter } from '../utils/character';
import type { Character } from '../types/character';
import AuthWrapper from '../components/AuthWrapper';
import { createClient } from '../lib/supabase';

interface Stats {
  totalHabits: number;
  completedHabits: number;
  totalGoals: number;
  completedGoals: number;
  currentStreak: number;
  longestStreak: number;
}

function ProgressReportPage() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load character
      const characterData = await getCharacter();
      setCharacter(characterData);

      // Load stats
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get habits stats
      const { data: habits } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id);

      const { data: habitLogs } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id);

      // Get goals stats
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);

      // Calculate stats
      const totalHabits = habits?.length || 0;
      const completedHabits = habitLogs?.length || 0;
      const totalGoals = goals?.length || 0;
      const completedGoals = goals?.filter(g => g.status === 'completed').length || 0;

      // Calculate streaks
      const streaks = habits?.map(habit => habit.streak) || [];
      const currentStreak = Math.max(...streaks, 0);
      const longestStreak = currentStreak; // This should be stored in the database for accuracy

      setStats({
        totalHabits,
        completedHabits,
        totalGoals,
        completedGoals,
        currentStreak,
        longestStreak
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress data');
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
      <h1 className="text-3xl font-pixel text-rpg-primary mb-8">Progress Report</h1>

      {character && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Character Progress */}
          <div className="rpg-panel">
            <h2 className="text-2xl font-pixel text-rpg-light mb-6">Character Progress</h2>
            <div className="space-y-4">
              <div>
                <p className="text-rpg-light-darker">Level</p>
                <p className="text-2xl text-rpg-primary">{character.level}</p>
              </div>
              <div>
                <p className="text-rpg-light-darker">Experience</p>
                <div className="rpg-progress-bar">
                  <div
                    className="rpg-progress-fill bg-rpg-primary"
                    style={{ width: `${(character.experience / (character.level * 1000)) * 100}%` }}
                  />
                  <span className="rpg-progress-text">
                    {character.experience} / {character.level * 1000}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quest Stats */}
          <div className="rpg-panel">
            <h2 className="text-2xl font-pixel text-rpg-light mb-6">Quest Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-rpg-light-darker">Daily Quests</p>
                <p className="text-2xl text-rpg-primary">{stats.completedHabits} / {stats.totalHabits}</p>
              </div>
              <div>
                <p className="text-rpg-light-darker">Long-term Quests</p>
                <p className="text-2xl text-rpg-primary">{stats.completedGoals} / {stats.totalGoals}</p>
              </div>
              <div>
                <p className="text-rpg-light-darker">Current Streak</p>
                <p className="text-2xl text-rpg-primary">{stats.currentStreak} days</p>
              </div>
              <div>
                <p className="text-rpg-light-darker">Longest Streak</p>
                <p className="text-2xl text-rpg-primary">{stats.longestStreak} days</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProgressReport() {
  return (
    <AuthWrapper>
      <ProgressReportPage />
    </AuthWrapper>
  );
}
