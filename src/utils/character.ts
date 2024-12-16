import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Character, AppearanceInput } from '../types/character';

// Base XP required for level 1
const BASE_XP = 100;
// XP multiplier for each level
const LEVEL_MULTIPLIER = 1.5;

export function calculateRequiredXP(level: number): number {
  return Math.floor(BASE_XP * Math.pow(LEVEL_MULTIPLIER, level - 1));
}

export async function createCharacter(
  name: string,
  appearance: AppearanceInput
): Promise<Character> {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if character already exists
  const { data: existingCharacter } = await supabase
    .from('characters')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (existingCharacter) {
    throw new Error('Character already exists');
  }

  // Create new character
  const { data: character, error } = await supabase
    .from('characters')
    .insert({
      user_id: user.id,
      name,
      level: 1,
      experience: 0,
      strength: 5,
      agility: 5,
      intelligence: 5
    })
    .select()
    .single();

  if (error) throw error;
  if (!character) throw new Error('Failed to create character');

  // Create character appearance
  const { error: appearanceError } = await supabase
    .from('character_appearances')
    .insert({
      character_id: character.id,
      ...appearance
    });

  if (appearanceError) {
    // Rollback character creation if appearance creation fails
    await supabase
      .from('characters')
      .delete()
      .eq('id', character.id);
    throw appearanceError;
  }

  // Get complete character with appearance
  const { data: completeCharacter, error: getError } = await supabase
    .from('characters')
    .select(`
      *,
      character_appearance:character_appearances(*)
    `)
    .eq('id', character.id)
    .single();

  if (getError) throw getError;
  if (!completeCharacter) throw new Error('Failed to retrieve character');

  return completeCharacter as Character;
}

export async function getCharacter(): Promise<Character> {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: character, error } = await supabase
    .from('characters')
    .select(`
      *,
      character_appearance:character_appearances(*)
    `)
    .eq('user_id', user.id)
    .single();

  if (error) throw error;
  if (!character) throw new Error('Character not found');

  return character as Character;
}

export async function addExperience(characterId: string, amount: number): Promise<void> {
  const supabase = createClientComponentClient();
  const { data: character, error: getError } = await supabase
    .from('characters')
    .select('experience, level, strength, agility, intelligence')
    .eq('id', characterId)
    .single();

  if (getError) throw getError;
  if (!character) throw new Error('Character not found');

  const newExperience = character.experience + amount;
  let newLevel = character.level;

  // Check if character should level up
  while (newExperience >= calculateRequiredXP(newLevel + 1)) {
    newLevel++;
  }

  const { error: updateError } = await supabase
    .from('characters')
    .update({
      experience: newExperience,
      level: newLevel,
      // Increase stats on level up
      ...(newLevel > character.level ? {
        strength: character.strength + 1,
        agility: character.agility + 1,
        intelligence: character.intelligence + 1,
      } : {})
    })
    .eq('id', characterId);

  if (updateError) throw updateError;
}

export async function checkAchievements(characterId: string): Promise<void> {
  const supabase = createClientComponentClient();
  
  // Get character's current stats
  const { data: character, error: characterError } = await supabase
    .from('characters')
    .select(`
      id,
      level,
      experience,
      strength,
      agility,
      intelligence,
      habits:habits(count),
      goals:goals(count)
    `)
    .eq('id', characterId)
    .single();

  if (characterError) throw characterError;
  if (!character) throw new Error('Character not found');

  // Check for achievements
  const achievements = [];

  // Level achievements
  if (character.level >= 5) achievements.push('Apprentice');
  if (character.level >= 10) achievements.push('Journeyman');
  if (character.level >= 20) achievements.push('Master');

  // Stats achievements
  if (character.strength >= 10) achievements.push('Warrior');
  if (character.agility >= 10) achievements.push('Scout');
  if (character.intelligence >= 10) achievements.push('Sage');

  // Habit/Goal achievements
  if (character.habits.count >= 5) achievements.push('Questmaster');
  if (character.goals.count >= 3) achievements.push('Epic Hero');

  // Add achievements to database
  for (const title of achievements) {
    const { error: achievementError } = await supabase
      .from('achievements')
      .upsert({
        character_id: characterId,
        title,
        unlocked_at: new Date().toISOString()
      }, {
        onConflict: 'character_id,title'
      });

    if (achievementError) throw achievementError;
  }
}

export async function calculateStreakBonus(characterId: string, habitId: string): Promise<number> {
  const supabase = createClientComponentClient();
  
  // Get habit logs for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: logs, error } = await supabase
    .from('habit_logs')
    .select('completed_at')
    .eq('habit_id', habitId)
    .gte('completed_at', sevenDaysAgo.toISOString())
    .order('completed_at', { ascending: false });

  if (error) throw error;

  // Calculate streak
  let streak = 0;
  let currentDate = new Date();
  
  for (const log of logs) {
    const logDate = new Date(log.completed_at);
    if (logDate.toDateString() === currentDate.toDateString()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Award XP bonus based on streak
  const streakBonus = streak * 5; // 5 XP per day in streak
  if (streakBonus > 0) {
    await addExperience(characterId, streakBonus);
  }

  return streak;
}
