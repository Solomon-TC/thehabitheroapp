import { useEffect, useState } from 'react';
import { getUserGoals, updateGoalProgress, deleteGoal } from '../utils/database';
import { useNotificationHelpers } from '../contexts/NotificationContext';
import type { Goal } from '../types/database';

interface GoalListProps {
  onGoalUpdated: () => void;
}

export default function GoalList({ onGoalUpdated }: GoalListProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [progressInput, setProgressInput] = useState<{ [key: string]: number }>({});
  const { showSuccess } = useNotificationHelpers();

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const data = await getUserGoals();
      setGoals(data);
      // Initialize progress inputs
      const inputs: { [key: string]: number } = {};
      data.forEach(goal => {
        inputs[goal.id] = goal.current_value;
      });
      setProgressInput(inputs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (goal: Goal) => {
    try {
      const newValue = progressInput[goal.id];
      await updateGoalProgress(goal.id, newValue);
      await loadGoals();
      onGoalUpdated();

      if (newValue >= goal.target_value && goal.status !== 'completed') {
        showSuccess(
          'Goal Completed! 🎉',
          `Congratulations! You've achieved your goal: "${goal.name}"`
        );
      } else {
        showSuccess(
          'Progress Updated',
          `Updated progress for "${goal.name}"`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal progress');
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      await deleteGoal(goalId);
      await loadGoals();
      onGoalUpdated();
      showSuccess('Goal Deleted', 'Goal has been successfully deleted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete goal');
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

  if (goals.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <p className="text-gray-500 mb-4">No goals yet</p>
        <p className="text-sm text-gray-400">
          Set your first goal to start tracking your achievements
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {goals.map(goal => (
        <div
          key={goal.id}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{goal.name}</h3>
              {goal.description && (
                <p className="mt-1 text-sm text-gray-500">{goal.description}</p>
              )}
            </div>
            <button
              onClick={() => handleDelete(goal.id)}
              className="text-gray-400 hover:text-red-600 transition-colors duration-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Progress</span>
                <span>
                  {goal.current_value} / {goal.target_value}
                  {goal.unit && ` ${goal.unit}`}
                </span>
              </div>
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (goal.current_value / goal.target_value) * 100)}%`
                  }}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <input
                type="number"
                value={progressInput[goal.id]}
                onChange={e => setProgressInput(prev => ({
                  ...prev,
                  [goal.id]: parseFloat(e.target.value) || 0
                }))}
                min={0}
                max={goal.target_value}
                className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button
                onClick={() => handleUpdateProgress(goal)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Update Progress
              </button>
            </div>

            {goal.deadline && (
              <div className="text-sm text-gray-500">
                Deadline: {new Date(goal.deadline).toLocaleDateString()}
              </div>
            )}

            {goal.status === 'completed' && (
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <svg className="mr-1.5 h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Completed
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
