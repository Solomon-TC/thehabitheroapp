import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Character,
  CharacterAppearance,
  calculateRequiredXP,
  calculateStats,
  XP_REWARDS
} from '../types/character';
import { useNotificationHelpers } from '../contexts/NotificationContext';
import type { Stats } from '../types/database';

export async function getCharacter() {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: character, error: characterError } = await supabase
    .from('characters')
    .select(`
      *,
      character_appearance (*)
    `)
    .eq('user_id', user.id)
    .single();

  if (characterError) throw characterError;
  return character;
}

export async function getCharacterStats(characterId: string): Promise<Stats> {
  const supabase = createClientComponentClient();

  const { data: character, error: characterError } = await supabase
    .from('characters')
    .select(`
      *,
      experience_logs (amount),
      achievements (achievement_type)
    `)
    .eq('id', characterId)
    .single();

  if (characterError) throw characterError;

  // Get habit completion stats
  const { data: habitStats, error: habitError } = await supabase
    .from('habit_logs')
    .select('*', { count: 'exact' })
    .eq('character_id', characterId);

  if (habitError) throw habitError;

  // Get goal completion stats
  const { data: goalStats, error: goalError } = await supabase
    .from('goals')
    .select('*', { count: 'exact' })
    .eq('character_id', characterId);

  if (goalError) throw goalError;

  // Calculate total experience
  const totalExperience = character.experience_logs?.reduce(
    (sum: number, log: { amount: number }) => sum + log.amount,
    0
  ) || 0;

  return {
    character,
    habits_completed: habitStats?.length || 0,
    goals_completed: goalStats?.filter(g => g.status === 'completed').length || 0,
    total_goals: goalStats?.length || 0,
    total_experience: totalExperience,
    achievements_earned: character.achievements?.length || 0,
    streak_days: 0 // TODO: Implement streak calculation
  };
}

export async function createCharacter(
  name: string,
  appearance: Omit<CharacterAppearance, 'id' | 'character_id'>
) {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Start a transaction
  const { data: character, error: characterError } = await supabase
    .from('characters')
    .insert({
      user_id: user.id,
      name,
      level: 1,
      experience: 0,
      strength: 10,
      agility: 10,
      intelligence: 10
    })
    .select()
    .single();

  if (characterError) throw characterError;

  const { error: appearanceError } = await supabase
    .from('character_appearance')
    .insert({
      character_id: character.id,
      ...appearance
    });

  if (appearanceError) {
    // Rollback by deleting the character if appearance creation fails
    await supabase
      .from('characters')
      .delete()
      .eq('id', character.id);
    throw appearanceError;
  }

  return character;
}

export async function updateCharacterAppearance(
  characterId: string,
  appearance: Partial<Omit<CharacterAppearance, 'id' | 'character_id'>>
) {
  const supabase = createClientComponentClient();
  const { error } = await supabase
    .from('character_appearance')
    .update(appearance)
    .eq('character_id', characterId);

  if (error) throw error;
}

export async function addExperience(characterId: string, amount: number) {
  const supabase = createClientComponentClient();

  // Get current character stats
  const { data: character, error: characterError } = await supabase
    .from('characters')
    .select('*')
    .eq('id', characterId)
    .single();

  if (characterError) throw characterError;

  // Calculate new experience and check for level up
  const newExperience = character.experience + amount;
  let newLevel = character.level;
  let requiredXP = calculateRequiredXP(newLevel);

  // Handle multiple level ups
  while (newExperience >= requiredXP) {
    newLevel++;
    requiredXP = calculateRequiredXP(newLevel);
  }

  // Calculate new stats if leveled up
  const stats = newLevel > character.level
    ? calculateStats(newLevel, {
        strength: character.strength,
        agility: character.agility,
        intelligence: character.intelligence
      })
    : null;

  // Update character
  const { error: updateError } = await supabase
    .from('characters')
    .update({
      experience: newExperience,
      level: newLevel,
      ...(stats && {
        strength: stats.strength,
        agility: stats.agility,
        intelligence: stats.intelligence
      }),
      updated_at: new Date().toISOString()
    })
    .eq('id', characterId);

  if (updateError) throw updateError;

  // Log experience gain
  const { error: logError } = await supabase
    .from('experience_logs')
    .insert({
      character_id: characterId,
      amount,
      reason: 'action_completed',
      levels_gained: newLevel - character.level
    });

  if (logError) throw logError;

  return {
    newLevel,
    leveledUp: newLevel > character.level,
    newExperience,
    stats
  };
}

export async function calculateStreakBonus(characterId: string, habitId: string) {
  const supabase = createClientComponentClient();

  // Get the last 7 days of habit completions
  const { data: logs, error } = await supabase
    .from('habit_logs')
    .select('completed_at')
    .eq('habit_id', habitId)
    .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('completed_at', { ascending: false });

  if (error) throw error;

  // Calculate streak (consecutive days)
  let streak = 1;
  for (let i = 0; i < logs.length - 1; i++) {
    const current = new Date(logs[i].completed_at);
    const previous = new Date(logs[i + 1].completed_at);
    const diffDays = Math.floor((current.getTime() - previous.getTime()) / (24 * 60 * 60 * 1000));
    
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  // Award bonus XP for streaks
  if (streak > 1) {
    await addExperience(characterId, XP_REWARDS.STREAK_BONUS * streak);
  }

  return streak;
}

export async function checkAchievements(characterId: string) {
  const supabase = createClientComponentClient();

  // Get character progress
  const { data: progress, error: progressError } = await supabase
    .from('characters')
    .select(`
      level,
      habit_logs (count),
      goals (count)
    `)
    .eq('id', characterId)
    .single();

  if (progressError) throw progressError;

  const achievements = [];

  // Level achievements
  if (progress.level >= 5) achievements.push('reached_level_5');
  if (progress.level >= 10) achievements.push('reached_level_10');
  if (progress.level >= 25) achievements.push('reached_level_25');

  // Habit achievements
  const habitCount = progress.habit_logs[0]?.count || 0;
  if (habitCount >= 10) achievements.push('complete_10_habits');
  if (habitCount >= 50) achievements.push('complete_50_habits');
  if (habitCount >= 100) achievements.push('complete_100_habits');

  // Goal achievements
  const goalCount = progress.goals[0]?.count || 0;
  if (goalCount >= 5) achievements.push('complete_5_goals');
  if (goalCount >= 25) achievements.push('complete_25_goals');
  if (goalCount >= 50) achievements.push('complete_50_goals');

  // Award achievements not already earned
  for (const achievement of achievements) {
    const { data: existing } = await supabase
      .from('achievements')
      .select()
      .eq('character_id', characterId)
      .eq('achievement_type', achievement)
      .single();

    if (!existing) {
      await supabase
        .from('achievements')
        .insert({
          character_id: characterId,
          achievement_type: achievement
        });

      // Award XP for new achievement
      await addExperience(characterId, XP_REWARDS.ACHIEVEMENT);
    }
  }

  return achievements;
}

export function useCharacterNotifications() {
  const { showLevelUp, showAchievement } = useNotificationHelpers();

  const handleLevelUp = (level: number) => {
    showLevelUp(level);
  };

  const handleNewAchievement = (achievementType: string) => {
    const achievementTitles: Record<string, string> = {
      'reached_level_5': 'Novice Adventurer',
      'reached_level_10': 'Seasoned Adventurer',
      'reached_level_25': 'Master Adventurer',
      'complete_10_habits': 'Habit Beginner',
      'complete_50_habits': 'Habit Expert',
      'complete_100_habits': 'Habit Master',
      'complete_5_goals': 'Goal Setter',
      'complete_25_goals': 'Goal Achiever',
      'complete_50_goals': 'Goal Master'
    };

    const achievementMessages: Record<string, string> = {
      'reached_level_5': "You've reached level 5! Keep up the great work!",
      'reached_level_10': "Level 10 achieved! You're becoming a true master of habits!",
      'reached_level_25': "Level 25! You're an inspiration to others!",
      'complete_10_habits': "You've completed 10 habits! A great start to your journey!",
      'complete_50_habits': "Incredible! 50 habits completed!",
      'complete_100_habits': "Amazing! You've completed 100 habits!",
      'complete_5_goals': "You've achieved 5 goals! Keep pushing forward!",
      'complete_25_goals': "25 goals achieved! You're unstoppable!",
      'complete_50_goals': "Phenomenal! 50 goals accomplished!"
    };

    showAchievement(
      achievementTitles[achievementType] || 'Achievement Unlocked!',
      achievementMessages[achievementType] || "You've unlocked a new achievement!"
    );
  };

  return {
    handleLevelUp,
    handleNewAchievement
  };
}
