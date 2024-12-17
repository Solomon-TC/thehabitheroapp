import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { addExperience, checkAchievements, calculateStreakBonus } from './character';
import { XP_REWARDS } from '../types/character';
import type { Habit, Goal, HabitLog, GoalProgress } from '../types/database';

// Get the user's character ID
export async function getCharacterId() {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: character } = await supabase
    .from('characters')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!character) throw new Error('Character not found');
  return character.id;
}

// Complete a habit
export async function completeHabit(habit: Habit) {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Add habit log
  const { error: logError } = await supabase
    .from('habit_logs')
    .insert({
      habit_id: habit.id,
      user_id: user.id,
      character_id: habit.character_id
    });

  if (logError) throw logError;

  // Calculate streak bonus and XP
  const streakBonus = calculateStreakBonus(habit.streak);
  const xpGained = XP_REWARDS.COMPLETE_HABIT + streakBonus;

  // Update habit streak
  const { data: updatedHabit, error: updateError } = await supabase
    .from('habits')
    .update({
      streak: habit.streak + 1,
      last_completed: new Date().toISOString()
    })
    .eq('id', habit.id)
    .select()
    .single();

  if (updateError) throw updateError;

  // Add experience
  await addExperience(habit.character_id, xpGained);
  await checkAchievements(habit.character_id);

  return updatedHabit;
}

// Update goal progress
export async function updateGoalProgress(goal: Goal, value: number) {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const newValue = goal.current_value + value;
  const status = newValue >= goal.target_value ? 'completed' : 'in_progress';
  const wasCompleted = goal.status !== 'completed' && status === 'completed';

  // Update goal
  const { data: updatedGoal, error: updateError } = await supabase
    .from('goals')
    .update({
      current_value: newValue,
      status
    })
    .eq('id', goal.id)
    .select()
    .single();

  if (updateError) throw updateError;

  // Add progress log
  const { error: progressError } = await supabase
    .from('goal_progress')
    .insert({
      goal_id: goal.id,
      user_id: user.id,
      character_id: goal.character_id,
      value
    });

  if (progressError) throw progressError;

  // Add experience if goal was completed
  if (wasCompleted) {
    await addExperience(goal.character_id, XP_REWARDS.COMPLETE_GOAL);
    await checkAchievements(goal.character_id);
  } else {
    // Add milestone experience
    await addExperience(goal.character_id, XP_REWARDS.GOAL_MILESTONE);
  }

  return updatedGoal;
}

// Get habit logs for a specific habit
export async function getHabitLogs(habitId: string) {
  const supabase = createClientComponentClient();
  const { data: logs, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('habit_id', habitId)
    .order('completed_at', { ascending: false });

  if (error) throw error;
  return logs;
}

// Get goal progress for a specific goal
export async function getGoalProgress(goalId: string) {
  const supabase = createClientComponentClient();
  const { data: progress, error } = await supabase
    .from('goal_progress')
    .select('*')
    .eq('goal_id', goalId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return progress;
}
