import { useEffect, useState } from 'react';
import { getUserHabits, completeHabit } from '../utils/database';
import { useNotificationHelpers } from '../contexts/NotificationContext';
import type { Habit } from '../types/database';

interface HabitListProps {
  onHabitCompleted: () => void;
}

export default function HabitList({ onHabitCompleted }: HabitListProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [habits, setHabits] = useState<Habit[]>([]);
  const { showSuccess } = useNotificationHelpers();

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const data = await getUserHabits();
      setHabits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (habit: Habit) => {
    try {
      await completeHabit(habit.id);
      await loadHabits();
      onHabitCompleted();
      showSuccess(
        'Habit Completed!',
        `You've completed "${habit.name}" and earned experience!`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete habit');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <p className="text-gray-500 mb-4">No habits yet</p>
        <p className="text-sm text-gray-400">
          Add your first habit to start tracking your progress
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {habits.map(habit => (
        <div
          key={habit.id}
          className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{habit.name}</h3>
              <div className="mt-1 text-sm text-gray-500">
                <span className="inline-flex items-center">
                  <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {habit.frequency}
                </span>
                <span className="mx-2">•</span>
                <span className="inline-flex items-center">
                  <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {habit.target_days} days
                </span>
              </div>
            </div>
            <button
              onClick={() => handleComplete(habit)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Complete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
