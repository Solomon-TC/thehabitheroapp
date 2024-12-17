import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase';
import type { Goal } from '../types/database';

interface GoalListProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
}

export default function GoalList({ goals, setGoals }: GoalListProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;
      setGoals(goals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (goalId: string, value: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const newValue = goal.current_value + value;
      const status = newValue >= goal.target_value ? 'completed' : 'in_progress';

      const { data: updatedGoal, error: updateError } = await supabase
        .from('goals')
        .update({
          current_value: newValue,
          status
        })
        .eq('id', goalId)
        .select()
        .single();

      if (updateError) throw updateError;

      const { error: progressError } = await supabase
        .from('goal_progress')
        .insert({
          goal_id: goalId,
          user_id: user.id,
          character_id: goal.character_id,
          value
        });

      if (progressError) throw progressError;

      setGoals(prev => prev.map(g => 
        g.id === goalId ? { ...g, ...updatedGoal } : g
      ));
    } catch (err) {
      console.error('Error updating goal progress:', err);
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

  if (goals.length === 0) {
    return (
      <div className="rpg-panel text-center py-8">
        <p className="text-rpg-light-darker">No long-term quests yet. Add one to begin your epic journey!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <div key={goal.id} className="rpg-panel">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-rpg-light">{goal.name}</h3>
              <p className="text-rpg-light-darker">{goal.description}</p>
            </div>

            <div>
              <div className="flex justify-between text-rpg-light-darker mb-2">
                <span>Progress: {goal.current_value} / {goal.target_value} {goal.unit}</span>
                <span>Status: {goal.status.replace('_', ' ')}</span>
              </div>
              <div className="rpg-progress-bar">
                <div
                  className="rpg-progress-fill bg-rpg-primary"
                  style={{ width: `${(goal.current_value / goal.target_value) * 100}%` }}
                />
              </div>
            </div>

            {goal.status !== 'completed' && (
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => updateProgress(goal.id, 1)}
                  className="rpg-button-secondary"
                >
                  +1 {goal.unit}
                </button>
                <button
                  onClick={() => updateProgress(goal.id, 5)}
                  className="rpg-button-secondary"
                >
                  +5 {goal.unit}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
