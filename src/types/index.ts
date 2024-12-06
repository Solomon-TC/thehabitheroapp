export interface Character {
  id: string;
  name: string;
  level: number;
  experience: number;
  appearance: {
    color: string;
    accessories: string[];
  };
  stats: {
    strength: number;
    agility: number;
    wisdom: number;
    charisma: number;
  };
  achievements: {
    id: string;
    name: string;
    description: string;
    dateUnlocked: string;
  }[];
  habits: {
    id: string;
    name: string;
    streak: number;
    lastCompleted: string | null;
  }[];
  goals: {
    id: string;
    name: string;
    progress: number;
    target: number;
    deadline: string | null;
  }[];
}

export type CoreAttributeType = 'strength' | 'agility' | 'wisdom' | 'charisma';

export const CORE_ATTRIBUTES: CoreAttributeType[] = [
  'strength',
  'agility',
  'wisdom',
  'charisma'
];
