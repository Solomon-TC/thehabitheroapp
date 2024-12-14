export interface CharacterAppearance {
  id: string;
  character_id: string;
  hair_style: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  shirt_style: string;
  shirt_color: string;
  pants_style: string;
  pants_color: string;
  shoes_style: string;
  shoes_color: string;
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
  character_appearance: CharacterAppearance;
}

export type HairStyle = typeof HAIR_STYLES[number];
export type ShirtStyle = typeof SHIRT_STYLES[number];
export type PantsStyle = typeof PANTS_STYLES[number];
export type ShoesStyle = typeof SHOES_STYLES[number];

export const HAIR_STYLES = [
  'short',
  'medium',
  'long',
  'curly',
  'wavy',
  'bald'
] as const;

export const SHIRT_STYLES = [
  'basic',
  'hoodie',
  'sweater',
  'tank',
  'formal'
] as const;

export const PANTS_STYLES = [
  'basic',
  'shorts',
  'formal',
  'athletic'
] as const;

export const SHOES_STYLES = [
  'basic',
  'athletic',
  'formal',
  'boots'
] as const;

export type SkinColor = typeof COLOR_PALETTE.SKIN[number];
export type HairColor = typeof COLOR_PALETTE.HAIR[number];
export type EyeColor = typeof COLOR_PALETTE.EYES[number];
export type ClothingColor = typeof COLOR_PALETTE.CLOTHING[number];

export const COLOR_PALETTE = {
  SKIN: [
    '#8D5524', // dark brown
    '#C68642', // medium brown
    '#E0AC69', // light brown
    '#F1C27D', // very light brown
    '#FFDBAC', // pale
  ],
  HAIR: [
    '#090806', // black
    '#2C222B', // dark brown
    '#71635A', // medium brown
    '#B7A69E', // light brown
    '#D4B599', // blonde
    '#F4E1C1', // light blonde
    '#A7A7A7', // gray
    '#E8E1E1', // white
  ],
  EYES: [
    '#1B4B36', // green
    '#428398', // blue
    '#89581F', // brown
    '#2C1810', // dark brown
    '#A5A5A5', // gray
  ],
  CLOTHING: [
    '#000000', // black
    '#FFFFFF', // white
    '#FF0000', // red
    '#00FF00', // green
    '#0000FF', // blue
    '#FFFF00', // yellow
    '#FF00FF', // magenta
    '#00FFFF', // cyan
    '#808080', // gray
    '#800000', // maroon
    '#808000', // olive
    '#008000', // dark green
    '#800080', // purple
    '#008080', // teal
    '#000080', // navy
  ]
} as const;

export interface AppearanceState {
  hair_style: HairStyle;
  hair_color: HairColor;
  skin_color: SkinColor;
  eye_color: EyeColor;
  shirt_style: ShirtStyle;
  shirt_color: ClothingColor;
  pants_style: PantsStyle;
  pants_color: ClothingColor;
  shoes_style: ShoesStyle;
  shoes_color: ClothingColor;
  created_at: string;
  updated_at: string;
}

export const XP_REWARDS = {
  COMPLETE_HABIT: 10,
  COMPLETE_GOAL: 50,
  STREAK_BONUS: 5,
  ACHIEVEMENT: 100
} as const;

export function calculateRequiredXP(level: number): number {
  // Experience required for next level follows a quadratic curve
  // Level 1: 100 XP
  // Level 2: 250 XP
  // Level 3: 450 XP
  // etc.
  return Math.floor(100 * level + 50 * Math.pow(level - 1, 2));
}

export function calculateStats(
  level: number,
  baseStats: {
    strength: number;
    agility: number;
    intelligence: number;
  }
) {
  // Each level provides a small boost to all stats
  const levelBonus = Math.floor(level * 0.5);

  return {
    strength: baseStats.strength + levelBonus,
    agility: baseStats.agility + levelBonus,
    intelligence: baseStats.intelligence + levelBonus
  };
}

// Helper function to create a new character appearance
export function createDefaultAppearance(): AppearanceState {
  return {
    hair_style: HAIR_STYLES[0],
    hair_color: COLOR_PALETTE.HAIR[0],
    skin_color: COLOR_PALETTE.SKIN[0],
    eye_color: COLOR_PALETTE.EYES[0],
    shirt_style: SHIRT_STYLES[0],
    shirt_color: COLOR_PALETTE.CLOTHING[0],
    pants_style: PANTS_STYLES[0],
    pants_color: COLOR_PALETTE.CLOTHING[0],
    shoes_style: SHOES_STYLES[0],
    shoes_color: COLOR_PALETTE.CLOTHING[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}
