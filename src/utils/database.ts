import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { addExperience } from './character';
import { XP_REWARDS } from '../types/character';

// Habits
export async function getUserHabits() {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: habits, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return habits;
}

export async function createHabit(name: string, frequency: string, target_days: number) {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: habit, error } = await supabase
    .from('habits')
    .insert({
      user_id: user.id,
      name,
      frequency,
      target_days
    })
    .select()
    .single();

  if (error) throw error;
  return habit;
}

export async function completeHabit(habitId: string) {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get the character ID
  const { data: character, error: characterError } = await supabase
    .from('characters')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (characterError) throw characterError;

  // Log habit completion
  const { error: logError } = await supabase
    .from('habit_logs')
    .insert({
      habit_id: habitId,
      user_id: user.id,
      completed_at: new Date().toISOString()
    });

  if (logError) throw logError;

  // Add XP for completing habit
  await addExperience(character.id, XP_REWARDS.COMPLETE_HABIT);
}

// Goals
export async function getUserGoals() {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: goals, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return goals;
}

export async function createGoal(
  name: string,
  description: string | null,
  target_value: number,
  current_value: number,
  unit: string | null,
  deadline: string | null
) {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: goal, error } = await supabase
    .from('goals')
    .insert({
      user_id: user.id,
      name,
      description,
      target_value,
      current_value,
      unit,
      deadline,
      status: 'in_progress'
    })
    .select()
    .single();

  if (error) throw error;
  return goal;
}

export async function updateGoalProgress(
  goalId: string,
  currentValue: number,
  notes: string | null = null
) {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get the character ID
  const { data: character, error: characterError } = await supabase
    .from('characters')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (characterError) throw characterError;

  // Get the goal to check if it's completed
  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .select('target_value, status')
    .eq('id', goalId)
    .single();

  if (goalError) throw goalError;

  // Update goal progress
  const { error: updateError } = await supabase
    .from('goals')
    .update({
      current_value: currentValue,
      status: currentValue >= goal.target_value ? 'completed' : 'in_progress',
      updated_at: new Date().toISOString()
    })
    .eq('id', goalId);

  if (updateError) throw updateError;

  // Log progress
  const { error: logError } = await supabase
    .from('goal_progress')
    .insert({
      goal_id: goalId,
      user_id: user.id,
      value: currentValue,
      notes
    });

  if (logError) throw logError;

  // If goal is newly completed, add XP
  if (currentValue >= goal.target_value && goal.status !== 'completed') {
    await addExperience(character.id, XP_REWARDS.COMPLETE_GOAL);
  }
}

export async function deleteGoal(goalId: string) {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId)
    .eq('user_id', user.id);

  if (error) throw error;
}
