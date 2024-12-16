import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase';
import { Goal } from '../types/database';

interface GoalListProps {
  onUpdate?: (goals: Goal[]) => void;
}

export default function GoalList({ onUpdate }: GoalListProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    if (onUpdate) {
      onUpdate(goals);
    }
  }, [goals, onUpdate]);

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
      setError('Failed to load goals');
      console.error('Error loading goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      setGoals(prev => prev.filter(g => g.id !== goalId));
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
  };

  const handleStatusUpdate = async (goalId: string, status: Goal['status']) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ status })
        .eq('id', goalId);

      if (error) throw error;

      setGoals(prev => prev.map(g => 
        g.id === goalId ? { ...g, status } : g
      ));
    } catch (err) {
      console.error('Error updating goal status:', err);
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
      <div className="text-rpg-light text-center py-8">
        <p>No epic quests added yet.</p>
        <p className="text-rpg-light-darker mt-2">Add some quests to begin your journey!</p>
      </div>
    );
  }

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      case 'in_progress':
        return 'text-yellow-500';
      default:
        return 'text-rpg-light-darker';
    }
  };

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <div key={goal.id} className="rpg-panel-secondary p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-pixel text-rpg-light">{goal.name}</h3>
              {goal.description && (
                <p className="text-rpg-light-darker mt-1">{goal.description}</p>
              )}
              <div className="text-sm text-rpg-light-darker mt-2">
                Progress: {goal.current_value} / {goal.target_value} {goal.unit}
              </div>
              {goal.deadline && (
                <div className="text-sm text-rpg-light-darker">
                  Due by: {new Date(goal.deadline).toLocaleDateString()}
                </div>
              )}
              <div className={`text-sm mt-1 ${getStatusColor(goal.status)}`}>
                Status: {goal.status.replace('_', ' ')}
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <select
                value={goal.status}
                onChange={(e) => handleStatusUpdate(goal.id, e.target.value as Goal['status'])}
                className="rpg-select"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
              <button
                onClick={() => handleDelete(goal.id)}
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
