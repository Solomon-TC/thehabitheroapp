import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { addExperience, checkAchievements } from './character';
import { XP_REWARDS } from '../types/character';

// Habits
export async function createHabit(name: string, frequency: string, targetDays: number = 1) {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('habits')
    .insert([{
      user_id: user.id,
      name,
      frequency,
      target_days: targetDays
    }])
    .select()
    .single();

  if (error) throw error;

  // Check for first habit achievement
  const { count } = await supabase
    .from('habits')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id);

  if (count === 1) {
    await checkAchievements('habit', 1);
  }

  return data;
}

export async function getUserHabits() {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function completeHabit(habitId: string) {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  // Log the completion
  const { error: logError } = await supabase
    .from('habit_logs')
    .insert([{
      habit_id: habitId,
      user_id: user.id
    }]);

  if (logError) throw logError;

  // Award XP
  await addExperience(XP_REWARDS.COMPLETE_HABIT, 'habit', habitId);

  // Check for streaks
  const { data: logs } = await supabase
    .from('habit_logs')
    .select('completed_at')
    .eq('habit_id', habitId)
    .order('completed_at', { ascending: false })
    .limit(7);

  if (logs && logs.length === 7) {
    // Week streak achieved
    await addExperience(XP_REWARDS.HABIT_STREAK.WEEK, 'habit', habitId);
  }

  return true;
}

// Goals
export async function createGoal(input: {
  name: string;
  description?: string;
  target_value: number;
  current_value?: number;
  unit?: string;
  deadline?: string;
}) {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('goals')
    .insert([{
      user_id: user.id,
      ...input,
      current_value: input.current_value || 0,
      status: 'in_progress'
    }])
    .select()
    .single();

  if (error) throw error;

  // Check for first goal achievement
  const { count } = await supabase
    .from('goals')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id);

  if (count === 1) {
    await checkAchievements('goal', 1);
  }

  return data;
}

export async function getUserGoals() {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateGoalProgress(goalId: string, progress: number) {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  // Get current goal data
  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .select('*')
    .eq('id', goalId)
    .single();

  if (goalError) throw goalError;

  const newValue = goal.current_value + progress;
  const completed = newValue >= goal.target_value;
  const status = completed ? 'completed' : 'in_progress';

  // Update goal
  const { error: updateError } = await supabase
    .from('goals')
    .update({
      current_value: newValue,
      status
    })
    .eq('id', goalId);

  if (updateError) throw updateError;

  // Log progress
  const { error: logError } = await supabase
    .from('goal_progress')
    .insert([{
      goal_id: goalId,
      user_id: user.id,
      value: progress
    }]);

  if (logError) throw logError;

  // Award XP for progress
  const progressXP = Math.floor((progress / goal.target_value) * XP_REWARDS.COMPLETE_GOAL);
  await addExperience(progressXP, 'goal', goalId);

  // If goal completed, award full completion XP
  if (completed) {
    await addExperience(XP_REWARDS.COMPLETE_GOAL, 'goal', goalId);
    
    // Check for milestone achievements
    const { count } = await supabase
      .from('goals')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('status', 'completed');

    if (count === 1) {
      await checkAchievements('goal', 1);
    }
  }

  return {
    newValue,
    completed
  };
}
