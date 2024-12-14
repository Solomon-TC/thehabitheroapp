export interface Habit {
  id: string;
  user_id: string;
  character_id?: string;
  name: string;
  frequency: string;
  target_days: number;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  character_id?: string;
  completed_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  character_id?: string;
  name: string;
  description: string | null;
  target_value: number;
  current_value: number;
  unit: string | null;
  deadline: string | null;
  status: 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface GoalProgress {
  id: string;
  goal_id: string;
  user_id: string;
  character_id?: string;
  value: number;
  notes: string | null;
  created_at: string;
}

export interface ExperienceLog {
  id: string;
  character_id: string;
  amount: number;
  reason: 'action_completed' | 'streak_bonus' | 'achievement';
  levels_gained: number;
  created_at: string;
}

export interface Achievement {
  id: string;
  character_id: string;
  achievement_type: 
    | 'reached_level_5'
    | 'reached_level_10'
    | 'reached_level_25'
    | 'complete_10_habits'
    | 'complete_50_habits'
    | 'complete_100_habits'
    | 'complete_5_goals'
    | 'complete_25_goals'
    | 'complete_50_goals';
  created_at: string;
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
}

export interface Stats {
  character: Character;
  habits_completed: number;
  goals_completed: number;
  total_goals: number;
  total_experience: number;
  achievements_earned: number;
  streak_days: number;
}

export interface DatabaseUser {
  id: string;
  email: string;
  created_at: string;
  subscription_status: 'free' | 'premium' | 'cancelled';
  subscription_period_end?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

// Helper type for Supabase responses
export type SupabaseResponse<T> = {
  data: T | null;
  error: Error | null;
};

// Helper type for pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

// Helper type for date ranges
export interface DateRange {
  start: string;
  end: string;
}

// Helper type for notifications
export interface Notification {
  id: string;
  user_id: string;
  type: 'achievement' | 'level_up' | 'streak' | 'goal_completed';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

// Helper type for activity logs
export interface ActivityLog {
  id: string;
  user_id: string;
  character_id?: string;
  activity_type: 'habit' | 'goal' | 'experience' | 'achievement';
  activity_id: string;
  details: Record<string, any>;
  created_at: string;
}

// Helper type for character progress
export interface CharacterProgress {
  character_id: string;
  total_experience: number;
  current_level: number;
  habits_completed: number;
  goals_completed: number;
  achievements_earned: number;
  longest_streak: number;
  current_streak: number;
  last_active: string;
}

// Helper type for leaderboard entries
export interface LeaderboardEntry {
  character_id: string;
  character_name: string;
  level: number;
  experience: number;
  achievements: number;
  rank: number;
}

// Helper type for character equipment
export interface CharacterEquipment {
  character_id: string;
  slot: 'head' | 'body' | 'legs' | 'accessory1' | 'accessory2';
  item_id: string;
  equipped_at: string;
}

// Helper type for inventory items
export interface InventoryItem {
  id: string;
  character_id: string;
  item_id: string;
  quantity: number;
  acquired_at: string;
}

// Helper type for item definitions
export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  type: 'armor' | 'accessory' | 'consumable';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stats: Record<string, number>;
  requirements?: {
    level?: number;
    achievements?: string[];
    stats?: Record<string, number>;
  };
}
