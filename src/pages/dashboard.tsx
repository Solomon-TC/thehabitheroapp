import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Habit, Goal } from '../types';
import AddHabitForm from '../components/AddHabitForm';
import AddGoalForm from '../components/AddGoalForm';
import { useNotification } from '../contexts/NotificationContext';

export default function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchHabitsAndGoals();
  }, []);

  const fetchHabitsAndGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const [habitsResponse, goalsResponse] = await Promise.all([
        supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (habitsResponse.error) throw habitsResponse.error;
      if (goalsResponse.error) throw goalsResponse.error;

      setHabits(habitsResponse.data || []);
      setGoals(goalsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Failed to load your habits and goals', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const completeHabit = async (habitId: string) => {
    try {
      const { error } = await supabase
        .from('habit_logs')
        .insert([{ habit_id: habitId }]);

      if (error) throw error;

      showNotification('Habit marked as complete!', 'success');
      // You might want to update the UI or refetch the data here
    } catch (error) {
      console.error('Error completing habit:', error);
      showNotification('Failed to mark habit as complete', 'error');
    }
  };

  const updateGoalStatus = async (goalId: string, status: Goal['status']) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ status })
        .eq('id', goalId);

      if (error) throw error;

      setGoals(goals.map(goal => 
        goal.id === goalId ? { ...goal, status } : goal
      ));
      
      showNotification(`Goal ${status}!`, 'success');
    } catch (error) {
      console.error('Error updating goal:', error);
      showNotification('Failed to update goal status', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Habits Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Habits</h2>
            <AddHabitForm />
            <div className="mt-6 space-y-4">
              {habits.map(habit => (
                <div key={habit.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-medium">{habit.title}</h3>
                  {habit.description && (
                    <p className="text-gray-600 text-sm mt-1">{habit.description}</p>
                  )}
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-sm text-gray-500">{habit.frequency}</span>
                    <button
                      onClick={() => completeHabit(habit.id)}
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goals Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Goals</h2>
            <AddGoalForm />
            <div className="mt-6 space-y-4">
              {goals.map(goal => (
                <div key={goal.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-medium">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-gray-600 text-sm mt-1">{goal.description}</p>
                  )}
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Status: {goal.status}
                    </span>
                    <div className="space-x-2">
                      {goal.status === 'in_progress' && (
                        <>
                          <button
                            onClick={() => updateGoalStatus(goal.id, 'completed')}
                            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => updateGoalStatus(goal.id, 'abandoned')}
                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                          >
                            Abandon
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
