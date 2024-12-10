import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type {
  Habit,
  Goal,
  HabitLog,
  GoalProgress,
  CreateHabitInput,
  CreateGoalInput,
  UpdateHabitInput,
  UpdateGoalInput,
  CreateHabitLogInput,
  CreateGoalProgressInput,
} from '../types/database';

// Habits
export async function createHabit(habit: CreateHabitInput) {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('habits')
    .insert([{ ...habit, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateHabit(habitId: string, updates: UpdateHabitInput) {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', habitId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteHabit(habitId: string) {
  const supabase = createClientComponentClient();
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId);

  if (error) throw error;
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

// Goals
export async function createGoal(goal: CreateGoalInput) {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('goals')
    .insert([{
      ...goal,
      user_id: user.id,
      current_value: 0,
      status: 'in_progress'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateGoal(goalId: string, updates: UpdateGoalInput) {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGoal(goalId: string) {
  const supabase = createClientComponentClient();
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId);

  if (error) throw error;
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

// Habit Logs
export async function logHabitCompletion(habitId: string, notes?: string) {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('habit_logs')
    .insert([{
      habit_id: habitId,
      user_id: user.id,
      notes
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getHabitLogs(habitId: string, startDate?: string, endDate?: string) {
  const supabase = createClientComponentClient();
  let query = supabase
    .from('habit_logs')
    .select('*')
    .eq('habit_id', habitId);

  if (startDate) {
    query = query.gte('completed_at', startDate);
  }
  if (endDate) {
    query = query.lte('completed_at', endDate);
  }

  const { data, error } = await query.order('completed_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Goal Progress
export async function updateGoalProgress(goalId: string, value: number, notes?: string) {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  // Start a transaction to update both goal progress and current value
  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .select('current_value, target_value')
    .eq('id', goalId)
    .single();

  if (goalError) throw goalError;

  const newValue = goal.current_value + value;
  const status = newValue >= goal.target_value ? 'completed' : 'in_progress';

  const { data: progressData, error: progressError } = await supabase
    .from('goal_progress')
    .insert([{
      goal_id: goalId,
      user_id: user.id,
      value,
      notes
    }])
    .select()
    .single();

  if (progressError) throw progressError;

  const { error: updateError } = await supabase
    .from('goals')
    .update({ 
      current_value: newValue,
      status
    })
    .eq('id', goalId);

  if (updateError) throw updateError;

  return progressData;
}

export async function getGoalProgress(goalId: string) {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase
    .from('goal_progress')
    .select('*')
    .eq('goal_id', goalId)
    .order('recorded_at', { ascending: false });

  if (error) throw error;
  return data;
}
