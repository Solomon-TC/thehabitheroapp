import { useState, useEffect } from 'react';
import { getUserGoals, updateGoalProgress } from '../utils/database';
import type { Goal } from '../types/database';

interface GoalListProps {
  onGoalUpdated: () => void;
}

export default function GoalList({ onGoalUpdated }: GoalListProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingGoal, setUpdatingGoal] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState<Record<string, number>>({});

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const data = await getUserGoals();
      setGoals(data);
      const initialProgress = Object.fromEntries(
        data.map(goal => [goal.id, goal.current_value])
      );
      setProgressValue(initialProgress);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (goalId: string) => {
    try {
      setUpdatingGoal(goalId);
      const value = progressValue[goalId];
      await updateGoalProgress(goalId, value);
      await loadGoals();
      onGoalUpdated();

      // Show completion animation if goal is completed
      const goal = goals.find(g => g.id === goalId);
      if (goal && value >= goal.target_value) {
        const element = document.getElementById(`goal-${goalId}`);
        if (element) {
          element.classList.add('animate-level-up');
          setTimeout(() => {
            element.classList.remove('animate-level-up');
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Failed to update goal:', error);
    } finally {
      setUpdatingGoal(null);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rpg-border h-32"></div>
        ))}
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-8 rpg-panel">
        <p className="text-rpg-light-darker font-pixel">No epic quests</p>
        <p className="text-sm text-rpg-light-darker mt-2">Begin your legendary journey by adding an epic quest</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {goals.map((goal) => {
        const progress = (goal.current_value / goal.target_value) * 100;
        const isCompleted = goal.status === 'completed';
        const isUpdating = updatingGoal === goal.id;

        return (
          <div
            key={goal.id}
            id={`goal-${goal.id}`}
            className={`quest-card transform transition-all duration-300 ${
              isCompleted ? 'opacity-75' : 'hover:scale-102'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-rpg-light">
                  {goal.name}
                </h3>
                {goal.description && (
                  <p className="mt-1 text-sm text-rpg-light-darker">
                    {goal.description}
                  </p>
                )}
                <div className="flex items-center mt-2 space-x-2">
                  {goal.deadline && (
                    <span className="stat-badge text-xs">
                      🎯 Due {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  )}
                  <span className={`stat-badge text-xs ${
                    isCompleted ? 'bg-gradient-to-r from-rarity-epic to-rarity-legendary' : ''
                  }`}>
                    {isCompleted ? '✨ Completed' : '🔥 In Progress'}
                  </span>
                </div>
              </div>

              {!isCompleted && (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={progressValue[goal.id] || 0}
                    onChange={(e) => setProgressValue({
                      ...progressValue,
                      [goal.id]: Number(e.target.value)
                    })}
                    className="rpg-border w-20 text-center bg-transparent text-rpg-light"
                    min={0}
                    max={goal.target_value}
                  />
                  <button
                    onClick={() => handleUpdateProgress(goal.id)}
                    disabled={isUpdating}
                    className="rpg-button min-w-[100px]"
                  >
                    {isUpdating ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                      </div>
                    ) : (
                      'Update'
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-rpg-light-darker mt-1">
                <span>{goal.current_value} / {goal.target_value} {goal.unit || 'points'}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
