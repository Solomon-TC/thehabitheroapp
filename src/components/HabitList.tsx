import { useState, useEffect } from 'react';
import { getUserHabits, completeHabit } from '../utils/database';
import type { Habit } from '../types/database';

interface HabitListProps {
  onAddHabit: () => void;
}

export default function HabitList({ onAddHabit }: HabitListProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completingHabit, setCompletingHabit] = useState<string | null>(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const habits = await getUserHabits();
      setHabits(habits);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (habitId: string) => {
    try {
      setCompletingHabit(habitId);
      await completeHabit(habitId);
      await loadHabits(); // Reload habits to get updated completion status
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete habit');
    } finally {
      setCompletingHabit(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-4">
        {error}
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">No habits yet</h3>
        <button
          onClick={onAddHabit}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add Your First Habit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Your Habits</h2>
        <button
          onClick={onAddHabit}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add Habit
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => (
          <div
            key={habit.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{habit.name}</h3>
                <p className="text-sm text-gray-500 capitalize">
                  {habit.frequency} • {habit.target_days} day{habit.target_days !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => handleComplete(habit.id)}
                disabled={completingHabit === habit.id}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {completingHabit === habit.id ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Completing...
                  </>
                ) : (
                  'Complete'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
