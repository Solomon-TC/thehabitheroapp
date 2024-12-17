export interface AppearanceInput {
  skin_color: string;
  hair_color: string;
  eye_color: string;
  outfit_color: string;
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
  character_appearance: AppearanceInput;
}

export interface CharacterWithAppearance extends Character {
  character_appearance: AppearanceInput;
}

export const DEFAULT_APPEARANCE: AppearanceInput = {
  skin_color: '#FFD5B4',
  hair_color: '#8B4513',
  eye_color: '#4B3621',
  outfit_color: '#1E90FF'
};

// Color options for character customization
export const SKIN_COLORS = [
  '#FFD5B4', // Light
  '#F1C27D', // Medium Light
  '#E0AC69', // Medium
  '#C68642', // Medium Dark
  '#8D5524'  // Dark
];

export const HAIR_COLORS = [
  '#090806', // Black
  '#8B4513', // Brown
  '#D4B499', // Blonde
  '#A52A2A', // Auburn
  '#808080'  // Gray
];

export const EYE_COLORS = [
  '#4B3621', // Brown
  '#1E90FF', // Blue
  '#228B22', // Green
  '#808080', // Gray
  '#800020'  // Hazel
];

export const OUTFIT_COLORS = [
  '#1E90FF', // Blue
  '#228B22', // Green
  '#800020', // Burgundy
  '#4B0082', // Indigo
  '#FFD700'  // Gold
];
