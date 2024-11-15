export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target_count: number;
  current_streak: number;
  longest_streak: number;
  created_at: string;
  last_tracked: string | null;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_date: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  completed_at: string;
  count: number;
}
