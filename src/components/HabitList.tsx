import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase';
import type { Habit } from '../types/database';

interface HabitListProps {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
}

export default function HabitList({ habits, setHabits }: HabitListProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (habitsError) throw habitsError;
      setHabits(habits || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const completeHabit = async (habitId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const { error: logError } = await supabase
        .from('habit_logs')
        .insert({
          habit_id: habitId,
          user_id: user.id,
          character_id: habit.character_id
        });

      if (logError) throw logError;

      // Update habit streak
      const { data: updatedHabit, error: updateError } = await supabase
        .from('habits')
        .update({
          streak: habit.streak + 1,
          last_completed: new Date().toISOString()
        })
        .eq('id', habitId)
        .select()
        .single();

      if (updateError) throw updateError;

      setHabits(prev => prev.map(h => 
        h.id === habitId ? { ...h, ...updatedHabit } : h
      ));
    } catch (err) {
      console.error('Error completing habit:', err);
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

  if (habits.length === 0) {
    return (
      <div className="rpg-panel text-center py-8">
        <p className="text-rpg-light-darker">No daily quests yet. Add one to begin your journey!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => (
        <div key={habit.id} className="rpg-panel">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-rpg-light">{habit.name}</h3>
              <p className="text-rpg-light-darker">
                Streak: {habit.streak} days | Target: {habit.target_days} days
              </p>
            </div>
            <button
              onClick={() => completeHabit(habit.id)}
              className="rpg-button-secondary"
              disabled={new Date(habit.last_completed || 0).toDateString() === new Date().toDateString()}
            >
              Complete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
