export interface Habit {
  id: string;
  user_id: string;
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
  completed_at: string;
  notes?: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  target_value: number;
  current_value: number;
  unit?: string;
  deadline?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
}

export interface GoalProgress {
  id: string;
  goal_id: string;
  user_id: string;
  value: number;
  notes?: string;
  recorded_at: string;
}

// Input types for creating and updating
export interface CreateHabitInput {
  name: string;
  frequency: string;
  target_days: number;
}

export interface CreateGoalInput {
  name: string;
  description?: string;
  target_value: number;
  current_value?: number;
  unit?: string;
  deadline?: string;
}

export interface UpdateGoalInput {
  name?: string;
  description?: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  deadline?: string;
  status?: 'in_progress' | 'completed' | 'abandoned';
}
