import { useState, useEffect } from 'react';
import { getUserHabits, logHabitCompletion, getHabitLogs } from '../utils/database';
import type { Habit, HabitLog } from '../types/database';

interface HabitListProps {
  onAddHabit: () => void;
}

export default function HabitList({ onAddHabit }: HabitListProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<Record<string, HabitLog[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const habits = await getUserHabits();
      setHabits(habits);
      
      // Load today's logs for each habit
      const today = new Date().toISOString().split('T')[0];
      const logsPromises = habits.map(async (habit) => {
        const logs = await getHabitLogs(habit.id, today);
        return { habitId: habit.id, logs };
      });

      const logsResults = await Promise.all(logsPromises);
      const logsMap = logsResults.reduce((acc, { habitId, logs }) => {
        acc[habitId] = logs;
        return acc;
      }, {} as Record<string, HabitLog[]>);

      setHabitLogs(logsMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (habitId: string) => {
    try {
      await logHabitCompletion(habitId);
      // Reload habits to get updated completion status
      loadHabits();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete habit');
    }
  };

  const isCompletedToday = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return habitLogs[habitId]?.some(log => 
      log.completed_at.startsWith(today)
    );
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
                {habit.description && (
                  <p className="text-sm text-gray-500 mt-1">{habit.description}</p>
                )}
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {habit.frequency}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Target: {habit.target_days} days
              </div>
              <button
                onClick={() => handleComplete(habit.id)}
                disabled={isCompletedToday(habit.id)}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md ${
                  isCompletedToday(habit.id)
                    ? 'bg-green-100 text-green-800 cursor-default'
                    : 'text-white bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isCompletedToday(habit.id) ? 'Completed' : 'Complete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
