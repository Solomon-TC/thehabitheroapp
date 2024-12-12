import { useState, useEffect } from 'react';
import { getUserGoals, updateGoalProgress } from '../utils/database';
import type { Goal } from '../types/database';

interface GoalListProps {
  onAddGoal: () => void;
}

export default function GoalList({ onAddGoal }: GoalListProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingGoal, setUpdatingGoal] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState<number>(0);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const goals = await getUserGoals();
      setGoals(goals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (goalId: string) => {
    if (!progressValue) return;

    try {
      setUpdatingGoal(goalId);
      await updateGoalProgress(goalId, progressValue);
      setProgressValue(0);
      loadGoals(); // Reload goals to get updated progress
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress');
    } finally {
      setUpdatingGoal(null);
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
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

  if (goals.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">No goals yet</h3>
        <button
          onClick={onAddGoal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add Your First Goal
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Your Goals</h2>
        <button
          onClick={onAddGoal}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add Goal
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="mb-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">{goal.name}</h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    goal.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : goal.status === 'abandoned'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {goal.status.replace('_', ' ')}
                </span>
              </div>
              {goal.description && (
                <p className="mt-1 text-sm text-gray-500">{goal.description}</p>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Progress</span>
                  <span>
                    {goal.current_value} / {goal.target_value}
                    {goal.unit ? ` ${goal.unit}` : ''}
                  </span>
                </div>
                <div className="mt-1 relative">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                    <div
                      style={{
                        width: `${calculateProgress(goal.current_value, goal.target_value)}%`
                      }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {goal.status === 'in_progress' && (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={progressValue}
                    onChange={(e) => setProgressValue(parseFloat(e.target.value) || 0)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder={`Add progress${goal.unit ? ` in ${goal.unit}` : ''}`}
                  />
                  <button
                    onClick={() => handleUpdateProgress(goal.id)}
                    disabled={updatingGoal === goal.id || !progressValue}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {updatingGoal === goal.id ? 'Updating...' : 'Update'}
                  </button>
                </div>
              )}

              {goal.deadline && (
                <div className="text-sm text-gray-500">
                  Deadline: {new Date(goal.deadline).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
