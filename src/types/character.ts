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
