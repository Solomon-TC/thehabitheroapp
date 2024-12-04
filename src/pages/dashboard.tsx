import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import CharacterDisplay from '../components/CharacterDisplay';
import AddHabitForm from '../components/AddHabitForm';
import AddGoalForm from '../components/AddGoalForm';
import { supabase } from '../lib/supabase';
import { calculateCharacterProgression, getProgressionMessages } from '../utils/characterProgression';
import { useGameNotifications } from '../contexts/NotificationContext';
import type { Habit, Goal, Character } from '../types';

export default function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);

  const {
    notifyLevelUp,
    notifyAttributeIncrease,
    notifyAchievement,
    notifyStreak,
    notifyGoalComplete,
    notifyError
  } = useGameNotifications();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch character
      const { data: characterData, error: characterError } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (characterError) throw characterError;
      setCharacter(characterData);

      // Fetch habits
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: false });

      if (habitsError) throw habitsError;
      setHabits(habitsData || []);

      // Fetch goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;
      setGoals(goalsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      notifyError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleHabitComplete = async (habit: Habit) => {
    try {
      // Log habit completion
      const { error: logError } = await supabase.from('habit_logs').insert([
        { 
          habit_id: habit.id,
          experience_gained: habit.experience_reward
        }
      ]);

      if (logError) throw logError;

      // Update character progression
      if (character) {
        const progressionResult = await calculateCharacterProgression(
          character.id,
          habit.experience_reward,
          habit.attribute_type
        );

        // Show notifications for character progression
        if (progressionResult.levelUp) {
          notifyLevelUp(progressionResult.levelUp.newLevel);
        }

        Object.entries(progressionResult.attributeIncreases).forEach(([attr, value]) => {
          notifyAttributeIncrease(attr, value);
        });

        progressionResult.newAchievements.forEach(achievement => {
          notifyAchievement(achievement);
        });

        if (progressionResult.streakMilestone) {
          notifyStreak(progressionResult.streakMilestone);
        }
      }

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error completing habit:', error);
      notifyError('Failed to complete habit. Please try again.');
    }
  };

  const updateGoalProgress = async (goal: Goal, newProgress: number) => {
    try {
      const wasCompleted = goal.status === 'completed';
      const isNowCompleted = newProgress === 100;
      
      const { error } = await supabase
        .from('goals')
        .update({ 
          progress: newProgress,
          status: newProgress === 100 ? 'completed' : 'in_progress'
        })
        .eq('id', goal.id);

      if (error) throw error;

      // Award experience only when goal is newly completed
      if (!wasCompleted && isNowCompleted) {
        if (character) {
          const progressionResult = await calculateCharacterProgression(
            character.id,
            goal.experience_reward,
            goal.attribute_type
          );

          // Show notifications for character progression
          if (progressionResult.levelUp) {
            notifyLevelUp(progressionResult.levelUp.newLevel);
          }

          Object.entries(progressionResult.attributeIncreases).forEach(([attr, value]) => {
            notifyAttributeIncrease(attr, value);
          });

          progressionResult.newAchievements.forEach(achievement => {
            notifyAchievement(achievement);
          });

          notifyGoalComplete(goal.title);
        }
      }

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating goal progress:', error);
      notifyError('Failed to update goal progress. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Character Section */}
        <div className="lg:col-span-1">
          <CharacterDisplay />
        </div>

        {/* Habits and Goals Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Habits Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">My Habits</h2>
              <button 
                onClick={() => setShowAddHabit(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Add Habit
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : habits.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No habits created yet</p>
            ) : (
              <ul className="space-y-4">
                {habits.map((habit) => (
                  <li key={habit.id} className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900">{habit.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{habit.description}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <div>
                        <span className="text-sm text-gray-600 mr-4">
                          Streak: {habit.current_streak} days
                        </span>
                        <span className="text-sm text-gray-600">
                          XP: {habit.experience_reward}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleHabitComplete(habit)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Complete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Goals Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">My Goals</h2>
              <button 
                onClick={() => setShowAddGoal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Add Goal
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : goals.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No goals created yet</p>
            ) : (
              <ul className="space-y-4">
                {goals.map((goal) => (
                  <li key={goal.id} className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900">{goal.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{goal.description}</p>
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">
                          Progress: {goal.progress}%
                        </span>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-4">
                            XP: {goal.experience_reward}
                          </span>
                          <span className="text-sm text-gray-600">
                            Due: {new Date(goal.target_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 rounded-full h-2"
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 flex justify-end space-x-2">
                        <button
                          onClick={() => updateGoalProgress(goal, Math.min(goal.progress + 10, 100))}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                        >
                          +10%
                        </button>
                        <button
                          onClick={() => updateGoalProgress(goal, Math.max(goal.progress - 10, 0))}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-sm"
                        >
                          -10%
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Add Habit Form Modal */}
      {showAddHabit && (
        <AddHabitForm
          onClose={() => setShowAddHabit(false)}
          onHabitAdded={fetchData}
        />
      )}

      {/* Add Goal Form Modal */}
      {showAddGoal && (
        <AddGoalForm
          onClose={() => setShowAddGoal(false)}
          onGoalAdded={fetchData}
        />
      )}
    </Layout>
  );
}
