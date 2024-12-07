export interface User {
  id: string;
  email: string;
}

export interface Habit {
  id: number;
  user_id: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  created_at: string;
}

export interface Goal {
  id: number;
  user_id: string;
  title: string;
  description: string;
  target_date: string;
  completed: boolean;
  created_at: string;
}
