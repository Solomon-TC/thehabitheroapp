// Core types
export interface Character {
  id: string;
  user_id: string;
  name: string;
  level: number;
  experience: number;
  character_type: string;
  attributes: Attributes;
  custom_attributes: CustomAttributes;
  appearance: {
    color: string;
    accessories: string[];
    achievements: string[];
  };
}

export interface Attributes {
  physical: number;
  financial: number;
  mental: number;
  spiritual: number;
  social: number;
}

export interface CustomAttributes {
  [key: string]: number;
}

export interface CharacterLevelUp {
  newLevel: number;
  attributeIncreases: Partial<Record<AttributeType, number>>;
  unlockedAccessories?: string[];
  unlockedAchievements?: string[];
}

export type CoreAttributeType = 'physical' | 'financial' | 'mental' | 'spiritual' | 'social';
export type AttributeType = CoreAttributeType | string;

export interface AttributeInfo {
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const CORE_ATTRIBUTES: Record<CoreAttributeType, AttributeInfo> = {
  physical: {
    name: 'Physical',
    description: 'Health, fitness, and physical well-being',
    icon: '💪',
    color: '#FF5555'
  },
  financial: {
    name: 'Financial',
    description: 'Money management and financial growth',
    icon: '💰',
    color: '#55FF55'
  },
  mental: {
    name: 'Mental',
    description: 'Learning, focus, and cognitive development',
    icon: '🧠',
    color: '#5555FF'
  },
  spiritual: {
    name: 'Spiritual',
    description: 'Inner peace, meditation, and spiritual growth',
    icon: '🕊️',
    color: '#FFFF55'
  },
  social: {
    name: 'Social',
    description: 'Relationships, communication, and social skills',
    icon: '👥',
    color: '#FF55FF'
  }
};

// Habit and Goal types
export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target_count: number;
  current_streak: number;
  longest_streak: number;
  attribute_type: AttributeType;
  experience_reward: number;
  created_at: string;
  completed_dates: string[];
  is_custom_attribute?: boolean;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_date: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  attribute_type: AttributeType;
  experience_reward: number;
  created_at: string;
  completed_at?: string;
  is_custom_attribute?: boolean;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  completed_at: string;
  experience_gained: number;
}

export interface Achievement {
  id: string;
  user_id: string;
  title: string;
  description: string;
  attribute_type: AttributeType;
  unlocked_at: string;
  icon?: string;
}

// Form Types
export interface HabitFormData {
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target_count: number;
  attribute_type: AttributeType;
  is_custom_attribute?: boolean;
  custom_attribute_name?: string;
}

export interface GoalFormData {
  title: string;
  description?: string;
  target_date: string;
  attribute_type: AttributeType;
  is_custom_attribute?: boolean;
  custom_attribute_name?: string;
}

// Friend Types
export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface FriendActivity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_data: any;
  is_public: boolean;
  created_at: string;
}

export interface FriendProfile {
  id: string;
  email: string;
  character: Character;
  recent_activities: FriendActivity[];
}

export interface FriendSuggestion {
  user_id: string;
  email: string;
  common_friends: number;
  character?: Character;
}
