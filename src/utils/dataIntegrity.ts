import { supabase } from '../lib/supabase';
import { habitSchema, goalSchema, characterSchema } from './validation';
import { DatabaseError } from './errorHandling';

interface DataIntegrityReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

// Check database constraints
async function checkDatabaseConstraints(userId: string): Promise<string[]> {
  const errors: string[] = [];

  try {
    // Check character uniqueness
    const { count: characterCount, error: characterError } = await supabase
      .from('characters')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (characterError) throw characterError;
    if (characterCount !== 1) {
      errors.push(`User should have exactly one character (found ${characterCount})`);
    }

    // Check habit constraints
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId);

    if (habitsError) throw habitsError;
    habits?.forEach(habit => {
      if (!habitSchema.safeParse(habit).success) {
        errors.push(`Invalid habit data: ${habit.id}`);
      }
    });

    // Check goal constraints
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);

    if (goalsError) throw goalsError;
    goals?.forEach(goal => {
      if (!goalSchema.safeParse(goal).success) {
        errors.push(`Invalid goal data: ${goal.id}`);
      }
    });

  } catch (error) {
    if (error instanceof Error) {
      errors.push(`Database constraint check failed: ${error.message}`);
    } else {
      errors.push('Database constraint check failed: Unknown error');
    }
  }

  return errors;
}

// Verify data relationships
async function verifyDataRelationships(userId: string): Promise<string[]> {
  const errors: string[] = [];

  try {
    // Check character-habit relationships
    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('id, level, experience')
      .eq('user_id', userId)
      .single();

    if (characterError) throw characterError;

    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('id, completed_dates, character_id')
      .eq('user_id', userId);

    if (habitsError) throw habitsError;

    habits?.forEach(habit => {
      if (habit.character_id !== character.id) {
        errors.push(`Habit ${habit.id} has invalid character reference`);
      }
    });

    // Check goal progression consistency
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('id, progress, milestones, completed_at')
      .eq('user_id', userId);

    if (goalsError) throw goalsError;

    goals?.forEach(goal => {
      if (goal.progress === 100 && !goal.completed_at) {
        errors.push(`Goal ${goal.id} is complete but missing completion timestamp`);
      }
      if (goal.progress < 100 && goal.completed_at) {
        errors.push(`Goal ${goal.id} is incomplete but has completion timestamp`);
      }
    });

  } catch (error) {
    if (error instanceof Error) {
      errors.push(`Data relationship verification failed: ${error.message}`);
    } else {
      errors.push('Data relationship verification failed: Unknown error');
    }
  }

  return errors;
}

// Check state consistency
async function checkStateConsistency(userId: string): Promise<string[]> {
  const warnings: string[] = [];

  try {
    // Check habit streaks
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('id, frequency, completed_dates, current_streak, longest_streak')
      .eq('user_id', userId);

    if (habitsError) throw habitsError;

    habits?.forEach(habit => {
      // Verify streak calculations
      const completedDates = habit.completed_dates || [];
      const calculatedStreak = calculateCurrentStreak(completedDates, habit.frequency);
      if (calculatedStreak !== habit.current_streak) {
        warnings.push(`Habit ${habit.id} has inconsistent current streak`);
      }

      // Verify longest streak
      if (habit.current_streak > habit.longest_streak) {
        warnings.push(`Habit ${habit.id} has current streak longer than longest streak`);
      }
    });

    // Check character progression
    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('id, level, experience')
      .eq('user_id', userId)
      .single();

    if (characterError) throw characterError;

    // Verify level-experience consistency
    const expectedLevel = calculateExpectedLevel(character.experience);
    if (expectedLevel !== character.level) {
      warnings.push(`Character level is inconsistent with experience points`);
    }

  } catch (error) {
    if (error instanceof Error) {
      warnings.push(`State consistency check failed: ${error.message}`);
    } else {
      warnings.push('State consistency check failed: Unknown error');
    }
  }

  return warnings;
}

// Generate recommendations
function generateRecommendations(errors: string[], warnings: string[]): string[] {
  const recommendations: string[] = [];

  if (errors.length > 0) {
    recommendations.push('Run data repair utility to fix database constraints');
    recommendations.push('Verify all user data relationships');
  }

  if (warnings.length > 0) {
    recommendations.push('Recalculate habit streaks');
    recommendations.push('Update character progression');
    recommendations.push('Clean up completed goals');
  }

  return recommendations;
}

// Helper function to calculate current streak
function calculateCurrentStreak(completedDates: string[], frequency: string): number {
  if (!completedDates.length) return 0;

  const dates = completedDates
    .map(date => new Date(date))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 1;
  const today = new Date();
  let lastDate = dates[0];

  // Check if the streak is still active
  const daysSinceLastCompletion = Math.floor(
    (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastCompletion > getFrequencyDays(frequency)) {
    return 0;
  }

  // Calculate streak
  for (let i = 1; i < dates.length; i++) {
    const daysBetween = Math.floor(
      (lastDate.getTime() - dates[i].getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysBetween <= getFrequencyDays(frequency)) {
      streak++;
      lastDate = dates[i];
    } else {
      break;
    }
  }

  return streak;
}

// Helper function to get frequency in days
function getFrequencyDays(frequency: string): number {
  switch (frequency) {
    case 'daily':
      return 1;
    case 'weekly':
      return 7;
    case 'monthly':
      return 30;
    default:
      return 1;
  }
}

// Helper function to calculate expected level
function calculateExpectedLevel(experience: number): number {
  // Experience required for each level follows a curve
  return Math.floor(Math.sqrt(experience / 100)) + 1;
}

// Main data integrity check function
export async function checkDataIntegrity(userId: string): Promise<DataIntegrityReport> {
  const errors = await checkDatabaseConstraints(userId);
  const relationshipErrors = await verifyDataRelationships(userId);
  const warnings = await checkStateConsistency(userId);

  const allErrors = [...errors, ...relationshipErrors];
  const recommendations = generateRecommendations(allErrors, warnings);

  return {
    isValid: allErrors.length === 0 && warnings.length === 0,
    errors: allErrors,
    warnings,
    recommendations
  };
}

// Repair data inconsistencies
export async function repairDataInconsistencies(userId: string): Promise<void> {
  try {
    // Get all user data
    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (characterError) throw characterError;

    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId);

    if (habitsError) throw habitsError;

    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);

    if (goalsError) throw goalsError;

    // Repair character data
    const expectedLevel = calculateExpectedLevel(character.experience);
    if (expectedLevel !== character.level) {
      await supabase
        .from('characters')
        .update({ level: expectedLevel })
        .eq('id', character.id);
    }

    // Repair habits
    for (const habit of habits) {
      const currentStreak = calculateCurrentStreak(habit.completed_dates, habit.frequency);
      const longestStreak = Math.max(currentStreak, habit.longest_streak);

      await supabase
        .from('habits')
        .update({
          current_streak: currentStreak,
          longest_streak: longestStreak,
          character_id: character.id
        })
        .eq('id', habit.id);
    }

    // Repair goals
    for (const goal of goals) {
      const needsUpdate = (goal.progress === 100 && !goal.completed_at) ||
                         (goal.progress < 100 && goal.completed_at);

      if (needsUpdate) {
        await supabase
          .from('goals')
          .update({
            completed_at: goal.progress === 100 ? new Date().toISOString() : null
          })
          .eq('id', goal.id);
      }
    }

  } catch (error) {
    if (error instanceof Error) {
      throw new DatabaseError('Failed to repair data inconsistencies', error);
    } else {
      throw new DatabaseError('Failed to repair data inconsistencies: Unknown error');
    }
  }
}
