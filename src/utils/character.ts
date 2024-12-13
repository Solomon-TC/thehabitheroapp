import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  calculateLevel,
  calculateRequiredXP,
  XP_REWARDS,
  type Character,
  type CharacterAppearance,
  type CharacterCreationFormData
} from '../types/character';

const supabase = createClientComponentClient();

export async function createCharacter(data: CharacterCreationFormData): Promise<Character> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Create character
  const { data: character, error: characterError } = await supabase
    .from('characters')
    .insert({
      user_id: user.id,
      name: data.name,
      level: 1,
      experience: 0,
      strength: 1,
      agility: 1,
      intelligence: 1
    })
    .select()
    .single();

  if (characterError) throw characterError;

  // Create character appearance
  const { error: appearanceError } = await supabase
    .from('character_appearance')
    .insert({
      character_id: character.id,
      hair_style: data.hair_style,
      hair_color: data.hair_color,
      skin_color: data.skin_color,
      eye_color: data.eye_color,
      shirt_style: data.shirt_style,
      shirt_color: data.shirt_color,
      pants_style: data.pants_style,
      pants_color: data.pants_color,
      shoes_style: data.shoes_style,
      shoes_color: data.shoes_color
    });

  if (appearanceError) throw appearanceError;

  return character;
}

export async function getCharacter(): Promise<Character & { character_appearance: CharacterAppearance }> {
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
  if (!character) throw new Error('Character not found');

  return character;
}

export async function updateCharacterAppearance(
  characterId: string,
  appearance: Partial<CharacterAppearance>
): Promise<void> {
  const { error } = await supabase
    .from('character_appearance')
    .update({
      hair_style: appearance.hair_style,
      hair_color: appearance.hair_color,
      skin_color: appearance.skin_color,
      eye_color: appearance.eye_color,
      shirt_style: appearance.shirt_style,
      shirt_color: appearance.shirt_color,
      pants_style: appearance.pants_style,
      pants_color: appearance.pants_color,
      shoes_style: appearance.shoes_style,
      shoes_color: appearance.shoes_color,
      armor_head: appearance.armor_head,
      armor_body: appearance.armor_body,
      armor_legs: appearance.armor_legs,
      accessory_1: appearance.accessory_1,
      accessory_2: appearance.accessory_2
    })
    .eq('character_id', characterId);

  if (error) throw error;
}

export async function addExperience(characterId: string, amount: number): Promise<void> {
  // Get current character stats
  const { data: character, error: getError } = await supabase
    .from('characters')
    .select('experience, level')
    .eq('id', characterId)
    .single();

  if (getError) throw getError;

  const totalXP = character.experience + amount;
  const newLevel = calculateLevel(totalXP);
  const leveledUp = newLevel > character.level;

  // Update character
  const { error: updateError } = await supabase
    .from('characters')
    .update({
      experience: totalXP,
      level: newLevel,
      // Increase stats on level up
      ...(leveledUp ? {
        strength: character.strength + 1,
        agility: character.agility + 1,
        intelligence: character.intelligence + 1
      } : {})
    })
    .eq('id', characterId);

  if (updateError) throw updateError;

  // Log experience gain
  const { error: logError } = await supabase
    .from('experience_logs')
    .insert({
      character_id: characterId,
      amount,
      source_type: 'action',
      leveled_up: leveledUp
    });

  if (logError) throw logError;
}

export async function completeHabit(characterId: string): Promise<void> {
  await addExperience(characterId, XP_REWARDS.COMPLETE_HABIT);
}

export async function completeGoal(characterId: string): Promise<void> {
  await addExperience(characterId, XP_REWARDS.COMPLETE_GOAL);
}

export async function maintainStreak(characterId: string): Promise<void> {
  await addExperience(characterId, XP_REWARDS.MAINTAIN_STREAK);
}

export async function unlockAchievement(characterId: string): Promise<void> {
  await addExperience(characterId, XP_REWARDS.UNLOCK_ACHIEVEMENT);
}
