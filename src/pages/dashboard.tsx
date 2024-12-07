import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Habit } from '../types';
import AddHabitForm from '../components/AddHabitForm';

export default function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { data, error: supabaseError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      setHabits(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Habits</h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Habit</h2>
          <AddHabitForm onHabitAdded={fetchHabits} />
        </div>

        <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
          {habits.map((habit) => (
            <div key={habit.id} className="p-6">
              <h3 className="text-lg font-medium text-gray-900">{habit.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{habit.description}</p>
              <p className="mt-2 text-sm text-gray-500">Frequency: {habit.frequency}</p>
            </div>
          ))}
          {habits.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No habits added yet. Start by adding a new habit above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
