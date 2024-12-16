import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase';
import { Habit } from '../types/database';

interface HabitListProps {
  onUpdate?: (habits: Habit[]) => void;
}

export default function HabitList({ onUpdate }: HabitListProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadHabits();
  }, []);

  useEffect(() => {
    if (onUpdate) {
      onUpdate(habits);
    }
  }, [habits, onUpdate]);

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
      setError('Failed to load habits');
      console.error('Error loading habits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (habitId: string) => {
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId);

      if (error) throw error;

      setHabits(prev => prev.filter(h => h.id !== habitId));
    } catch (err) {
      console.error('Error deleting habit:', err);
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
      <div className="text-rpg-light text-center py-8">
        <p>No daily quests added yet.</p>
        <p className="text-rpg-light-darker mt-2">Add some quests to begin your journey!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => (
        <div key={habit.id} className="rpg-panel-secondary p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-pixel text-rpg-light">{habit.name}</h3>
              <div className="text-sm text-rpg-light-darker">
                {habit.frequency} • Target: {habit.target_days} days
              </div>
              {habit.streak > 0 && (
                <div className="text-sm text-rpg-primary mt-1">
                  🔥 {habit.streak} day streak!
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleDelete(habit.id)}
                className="rpg-button-ghost text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
