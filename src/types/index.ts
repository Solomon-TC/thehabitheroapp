export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  completed_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_date?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email?: string;
  created_at: string;
}
