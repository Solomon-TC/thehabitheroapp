import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Character } from '../types/character';

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

  return character;
}

export async function createCharacter(name: string, appearance: any): Promise<Character> {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Create character
  const { data: character, error: characterError } = await supabase
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

  if (characterError) throw characterError;
  if (!character) throw new Error('Failed to create character');

  // Create character appearance
  const { error: appearanceError } = await supabase
    .from('character_appearances')
    .insert({
      character_id: character.id,
      ...appearance
    });

  if (appearanceError) throw appearanceError;

  return character;
}

export async function addExperience(characterId: string, amount: number): Promise<void> {
  const supabase = createClientComponentClient();
  
  // Get current character stats
  const { data: character, error: getError } = await supabase
    .from('characters')
    .select('*')
    .eq('id', characterId)
    .single();

  if (getError) throw getError;
  if (!character) throw new Error('Character not found');

  // Calculate new experience and level
  const newExperience = character.experience + amount;
  const experienceForNextLevel = character.level * 1000;
  let newLevel = character.level;
  let remainingExperience = newExperience;

  // Level up if enough experience
  while (remainingExperience >= experienceForNextLevel) {
    remainingExperience -= experienceForNextLevel;
    newLevel++;
  }

  // Update character
  const { error: updateError } = await supabase
    .from('characters')
    .update({
      level: newLevel,
      experience: remainingExperience,
      // Increase stats on level up
      ...(newLevel > character.level ? {
        strength: character.strength + 1,
        agility: character.agility + 1,
        intelligence: character.intelligence + 1
      } : {})
    })
    .eq('id', characterId);

  if (updateError) throw updateError;
}

export function calculateStreakBonus(currentStreak: number): number {
  if (currentStreak < 7) return 0;
  if (currentStreak < 30) return 5;
  if (currentStreak < 100) return 10;
  return 15;
}

export async function checkAchievements(characterId: string): Promise<void> {
  const supabase = createClientComponentClient();

  // Get character stats
  const { data: character, error: characterError } = await supabase
    .from('characters')
    .select('level')
    .eq('id', characterId)
    .single();

  if (characterError) throw characterError;
  if (!character) throw new Error('Character not found');

  // Level achievements
  const levelAchievements = [
    { level: 5, title: 'Apprentice Hero' },
    { level: 10, title: 'Rising Star' },
    { level: 25, title: 'Veteran Adventurer' },
    { level: 50, title: 'Legendary Champion' }
  ];

  for (const achievement of levelAchievements) {
    if (character.level >= achievement.level) {
      // Try to add achievement if not already earned
      await supabase
        .from('achievements')
        .insert({
          character_id: characterId,
          title: achievement.title
        })
        .match({ character_id: characterId, title: achievement.title });
    }
  }
}
