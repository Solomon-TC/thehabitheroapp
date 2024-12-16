export type HairStyle = 'short' | 'medium' | 'long' | 'curly' | 'spiky';
export type ShirtStyle = 'tshirt' | 'hoodie' | 'tank' | 'robe' | 'armor';
export type PantsStyle = 'jeans' | 'shorts' | 'skirt' | 'leggings' | 'plate';
export type ShoesStyle = 'sneakers' | 'boots' | 'sandals' | 'dress' | 'combat';

export const HAIR_STYLES: HairStyle[] = ['short', 'medium', 'long', 'curly', 'spiky'];
export const SHIRT_STYLES: ShirtStyle[] = ['tshirt', 'hoodie', 'tank', 'robe', 'armor'];
export const PANTS_STYLES: PantsStyle[] = ['jeans', 'shorts', 'skirt', 'leggings', 'plate'];
export const SHOES_STYLES: ShoesStyle[] = ['sneakers', 'boots', 'sandals', 'dress', 'combat'];

export type ClothingColor = {
  name: string;
  value: string;
};

export const COLOR_PALETTE = {
  skin: [
    { name: 'Light', value: '#FFE0BD' },
    { name: 'Medium', value: '#D8B094' },
    { name: 'Dark', value: '#8D5524' },
  ],
  hair: [
    { name: 'Black', value: '#1A1A1A' },
    { name: 'Brown', value: '#4A2F23' },
    { name: 'Blonde', value: '#E6B980' },
    { name: 'Red', value: '#8C3330' },
    { name: 'Gray', value: '#808080' },
  ],
  eyes: [
    { name: 'Brown', value: '#634E34' },
    { name: 'Blue', value: '#3B83BD' },
    { name: 'Green', value: '#50C878' },
    { name: 'Hazel', value: '#8E7618' },
    { name: 'Gray', value: '#808080' },
  ],
  clothing: [
    { name: 'Red', value: '#FF0000' },
    { name: 'Blue', value: '#0000FF' },
    { name: 'Green', value: '#008000' },
    { name: 'Yellow', value: '#FFD700' },
    { name: 'Purple', value: '#800080' },
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Gray', value: '#808080' },
  ],
};

export interface CharacterAppearance {
  id: string;
  character_id: string;
  hair_style: HairStyle;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  shirt_style: ShirtStyle;
  shirt_color: string;
  pants_style: PantsStyle;
  pants_color: string;
  shoes_style: ShoesStyle;
  shoes_color: string;
  created_at: string;
  updated_at: string;
}

export interface AppearanceInput {
  hair_style: HairStyle;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  shirt_style: ShirtStyle;
  shirt_color: string;
  pants_style: PantsStyle;
  pants_color: string;
  shoes_style: ShoesStyle;
  shoes_color: string;
}

export type AppearanceState = AppearanceInput;

export function createDefaultAppearance(): AppearanceState {
  return {
    hair_style: 'short',
    hair_color: COLOR_PALETTE.hair[0].value,
    skin_color: COLOR_PALETTE.skin[0].value,
    eye_color: COLOR_PALETTE.eyes[0].value,
    shirt_style: 'tshirt',
    shirt_color: COLOR_PALETTE.clothing[0].value,
    pants_style: 'jeans',
    pants_color: COLOR_PALETTE.clothing[5].value,
    shoes_style: 'sneakers',
    shoes_color: COLOR_PALETTE.clothing[5].value,
  };
}

export interface Character {
  id: string;
  user_id: string;
  name: string;
  level: number;
  experience: number;
  strength: number;
  agility: number;
  intelligence: number;
  character_appearance: CharacterAppearance;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  character_id: string;
  title: string;
  unlocked_at: string;
  created_at: string;
}

export const XP_REWARDS = {
  COMPLETE_HABIT: 10,
  COMPLETE_GOAL: 50,
  UNLOCK_ACHIEVEMENT: 100,
  STREAK_BONUS: 5 // per day in streak
} as const;

export const ACHIEVEMENT_TITLES = {
  APPRENTICE: 'Apprentice',
  JOURNEYMAN: 'Journeyman',
  MASTER: 'Master',
  WARRIOR: 'Warrior',
  SCOUT: 'Scout',
  SAGE: 'Sage',
  QUESTMASTER: 'Questmaster',
  EPIC_HERO: 'Epic Hero'
} as const;
