export interface Character {
  id: string;
  user_id: string;
  name: string;
  level: number;
  experience: number;
  strength: number;
  agility: number;
  intelligence: number;
  created_at: string;
  updated_at: string;
}

export interface CharacterAppearance {
  id: string;
  character_id: string;
  hair_style: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  outfit: string;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  experience_reward: number;
  icon: string;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

export interface ExperienceLog {
  id: string;
  user_id: string;
  amount: number;
  source_type: 'habit' | 'goal' | 'achievement';
  source_id: string;
  earned_at: string;
}

// Form data type for character creation
export interface CharacterCreationFormData {
  name: string;
  hair_style: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  outfit: string;
}

// Helper types for creating and updating
export type CreateCharacterInput = Pick<Character, 'name'>;

export type UpdateCharacterInput = Partial<Pick<Character, 
  'name' | 'strength' | 'agility' | 'intelligence'
>>;

export type CreateCharacterAppearanceInput = Pick<CharacterAppearance,
  'hair_style' | 'hair_color' | 'skin_color' | 'eye_color' | 'outfit'
> & {
  character_id: string;
};

export type UpdateCharacterAppearanceInput = Partial<Omit<CharacterAppearance,
  'id' | 'character_id' | 'created_at' | 'updated_at'
>>;

// Constants for character customization
export const HAIR_STYLES = [
  'short',
  'medium',
  'long',
  'curly',
  'straight',
  'spiky'
] as const;

export const HAIR_COLORS = [
  'black',
  'brown',
  'blonde',
  'red',
  'white',
  'blue',
  'purple',
  'green'
] as const;

export const SKIN_COLORS = [
  'fair',
  'light',
  'medium',
  'dark',
  'deep'
] as const;

export const EYE_COLORS = [
  'brown',
  'blue',
  'green',
  'hazel',
  'gray',
  'amber',
  'violet'
] as const;

export const OUTFITS = [
  'casual',
  'warrior',
  'mage',
  'rogue',
  'noble',
  'explorer'
] as const;

// Level system constants
export const BASE_XP_REQUIREMENT = 100;
export const XP_MULTIPLIER = 1.5;

export const calculateRequiredXP = (level: number): number => {
  return Math.floor(BASE_XP_REQUIREMENT * Math.pow(XP_MULTIPLIER, level - 1));
};

export const calculateLevel = (totalXP: number): number => {
  let level = 1;
  let requiredXP = BASE_XP_REQUIREMENT;
  
  while (totalXP >= requiredXP) {
    totalXP -= requiredXP;
    level++;
    requiredXP = calculateRequiredXP(level);
  }
  
  return level;
};

// XP rewards for different actions
export const XP_REWARDS = {
  COMPLETE_HABIT: 50,
  COMPLETE_GOAL: 200,
  HABIT_STREAK: {
    WEEK: 100,
    MONTH: 500
  },
  FIRST_ACHIEVEMENT: 100
} as const;
