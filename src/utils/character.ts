import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  calculateLevel,
  calculateRequiredXP,
  XP_REWARDS,
  type Character,
  type CharacterAppearance,
  type Achievement,
  type UserAchievement,
  type ExperienceLog,
  type UpdateCharacterInput,
  type UpdateCharacterAppearanceInput,
  type CharacterCreationFormData
} from '../types/character';

// Character Management
export async function createCharacter(formData: CharacterCreationFormData) {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  // Start a transaction by using a single connection
  const { data: character, error: characterError } = await supabase
    .from('characters')
    .insert([{
      user_id: user.id,
      name: formData.name,
      level: 1,
      experience: 0,
      strength: 1,
      agility: 1,
      intelligence: 1
    }])
    .select()
    .single();

  if (characterError) throw characterError;

  const { error: appearanceError } = await supabase
    .from('character_appearance')
    .insert([{
      character_id: character.id,
      hair_style: formData.hair_style,
      hair_color: formData.hair_color,
      skin_color: formData.skin_color,
      eye_color: formData.eye_color,
      outfit: formData.outfit
    }]);

  if (appearanceError) throw appearanceError;

  return character;
}

export async function getCharacter() {
  const supabase = createClientComponentClient();
  const { data: character, error: characterError } = await supabase
    .from('characters')
    .select(`
      *,
      character_appearance (*)
    `)
    .single();

  if (characterError) throw characterError;
  return character;
}

export async function updateCharacter(characterId: string, updates: UpdateCharacterInput) {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase
    .from('characters')
    .update(updates)
    .eq('id', characterId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCharacterAppearance(
  characterId: string,
  updates: UpdateCharacterAppearanceInput
) {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase
    .from('character_appearance')
    .update(updates)
    .eq('character_id', characterId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Experience and Leveling
export async function addExperience(amount: number, sourceType: 'habit' | 'goal' | 'achievement', sourceId: string) {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  // Log the experience gain
  const { error: logError } = await supabase
    .from('experience_logs')
    .insert([{
      user_id: user.id,
      amount,
      source_type: sourceType,
      source_id: sourceId
    }]);

  if (logError) throw logError;

  // Update character experience and level
  const { data: character, error: characterError } = await supabase
    .from('characters')
    .select('experience, level')
    .single();

  if (characterError) throw characterError;

  const newExperience = character.experience + amount;
  const newLevel = calculateLevel(newExperience);
  const leveledUp = newLevel > character.level;

  const { error: updateError } = await supabase
    .from('characters')
    .update({
      experience: newExperience,
      level: newLevel
    })
    .eq('user_id', user.id);

  if (updateError) throw updateError;

  return {
    newExperience,
    newLevel,
    leveledUp
  };
}

// Achievements
export async function getAchievements() {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase
    .from('achievements')
    .select('*');

  if (error) throw error;
  return data;
}

export async function getUserAchievements() {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievements (*)
    `);

  if (error) throw error;
  return data;
}

export async function awardAchievement(achievementId: string) {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  // Check if achievement already earned
  const { data: existing } = await supabase
    .from('user_achievements')
    .select()
    .eq('user_id', user.id)
    .eq('achievement_id', achievementId)
    .single();

  if (existing) return null; // Achievement already earned

  // Get achievement details
  const { data: achievement } = await supabase
    .from('achievements')
    .select()
    .eq('id', achievementId)
    .single();

  if (!achievement) throw new Error('Achievement not found');

  // Award achievement
  const { error: awardError } = await supabase
    .from('user_achievements')
    .insert([{
      user_id: user.id,
      achievement_id: achievementId
    }]);

  if (awardError) throw awardError;

  // Award experience points
  await addExperience(
    achievement.experience_reward,
    'achievement',
    achievementId
  );

  return achievement;
}

// Helper function to check and award achievements based on actions
export async function checkAchievements(action: 'habit' | 'goal', count: number) {
  // Example achievement checks
  if (action === 'habit' && count === 1) {
    await awardAchievement('first-habit-achievement-id');
  }
  if (action === 'goal' && count === 1) {
    await awardAchievement('first-goal-achievement-id');
  }
  // Add more achievement checks as needed
}
