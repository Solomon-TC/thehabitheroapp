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
  character_appearance?: CharacterAppearance;
}

export interface CharacterAppearance {
  id: string;
  character_id: string;
  skin_color: string;
  hair_color: string;
  eye_color: string;
  outfit_color: string;
  created_at: string;
  updated_at: string;
}

export interface AppearanceInput {
  skin_color: string;
  hair_color: string;
  eye_color: string;
  outfit_color: string;
}

export const SKIN_COLORS = [
  '#ffdbac',
  '#f1c27d',
  '#e0ac69',
  '#c68642',
  '#8d5524'
];

export const HAIR_COLORS = [
  '#090806', // Black
  '#71462c', // Brown
  '#b1740f', // Golden Brown
  '#e6be8a', // Blonde
  '#58423f', // Dark Brown
  '#8c4a32', // Auburn
  '#594545' // Dark Auburn
];

export const EYE_COLORS = [
  '#634e34', // Brown
  '#2c1810', // Dark Brown
  '#238ed1', // Blue
  '#36a832', // Green
  '#808080', // Gray
  '#634e34' // Hazel
];

export const OUTFIT_COLORS = [
  '#1a237e', // Indigo
  '#b71c1c', // Red
  '#1b5e20', // Green
  '#4a148c', // Purple
  '#e65100', // Orange
  '#263238' // Blue Gray
];

export const DEFAULT_APPEARANCE: AppearanceInput = {
  skin_color: SKIN_COLORS[0],
  hair_color: HAIR_COLORS[0],
  eye_color: EYE_COLORS[0],
  outfit_color: OUTFIT_COLORS[0]
};

export const XP_REWARDS = {
  COMPLETE_HABIT: 10,
  MAINTAIN_STREAK: 5,
  COMPLETE_GOAL: 50,
  GOAL_MILESTONE: 15,
  FRIEND_ADDED: 20
};
