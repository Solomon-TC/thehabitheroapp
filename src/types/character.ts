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
  shirt_style: string;
  shirt_color: string;
  pants_style: string;
  pants_color: string;
  shoes_style: string;
  shoes_color: string;
  armor_head?: string;
  armor_body?: string;
  armor_legs?: string;
  accessory_1?: string;
  accessory_2?: string;
  created_at: string;
  updated_at: string;
}

export const HAIR_STYLES = [
  'hero',
  'noble',
  'long',
  'ponytail',
  'messy',
  'mohawk',
  'bob',
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

export const SHIRT_STYLES = [
  'plain',
  'striped',
  'collared',
  'vest',
  'robe',
  'tunic'
] as const;

export const PANTS_STYLES = [
  'plain',
  'shorts',
  'skirt',
  'baggy',
  'tight',
  'armored'
] as const;

export const SHOES_STYLES = [
  'boots',
  'sandals',
  'sneakers',
  'armored',
  'magical',
  'ninja'
] as const;

export const ARMOR_HEAD = [
  'none',
  'leather_cap',
  'iron_helmet',
  'mage_hood',
  'ninja_mask',
  'crown'
] as const;

export const ARMOR_BODY = [
  'none',
  'leather_armor',
  'iron_armor',
  'mage_robe',
  'ninja_garb',
  'royal_armor'
] as const;

export const ARMOR_LEGS = [
  'none',
  'leather_greaves',
  'iron_greaves',
  'mage_pants',
  'ninja_pants',
  'royal_greaves'
] as const;

export const ACCESSORIES = [
  'none',
  'necklace',
  'ring',
  'belt',
  'cape',
  'wings',
  'shield',
  'book'
] as const;

// Color palettes for clothing
export const CLOTHING_COLORS = [
  // Primary colors
  'red',
  'blue',
  'yellow',
  // Secondary colors
  'green',
  'purple',
  'orange',
  // Neutral colors
  'white',
  'black',
  'gray',
  'brown',
  // Special colors
  'gold',
  'silver',
  'bronze'
] as const;

export interface CharacterCreationFormData {
  name: string;
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
  armor_head?: string;
  armor_body?: string;
  armor_legs?: string;
  accessory_1?: string;
  accessory_2?: string;
}

// Helper function to calculate required XP for next level
export function calculateRequiredXP(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Helper function to get color hex values
export function getColorHex(color: string): string {
  const colors: Record<string, string> = {
    // Hair colors
    black: '#1a1a1a',
    brown: '#8b4513',
    blonde: '#ffd700',
    red: '#dc143c',
    white: '#ffffff',
    blue: '#4169e1',
    purple: '#800080',
    green: '#228b22',
    // Skin colors
    fair: '#ffe4c4',
    light: '#f5deb3',
    medium: '#deb887',
    dark: '#d2691e',
    deep: '#8b4513',
    // Eye colors
    hazel: '#daa520',
    gray: '#808080',
    amber: '#ffa500',
    violet: '#800080',
    // Clothing colors
    yellow: '#ffd700',
    orange: '#ffa500',
    gold: '#ffd700',
    silver: '#c0c0c0',
    bronze: '#cd7f32'
  };
  return colors[color] || '#000000';
}
