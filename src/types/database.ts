export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target_days: number;
  created_at: string;
  updated_at: string;
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

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  notes?: string;
}

export interface GoalProgress {
  id: string;
  goal_id: string;
  user_id: string;
  value: number;
  notes?: string;
  recorded_at: string;
}

// Helper types for creating and updating
export type CreateHabitInput = Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type UpdateHabitInput = Partial<CreateHabitInput>;

export type CreateGoalInput = Omit<Goal, 'id' | 'user_id' | 'current_value' | 'status' | 'created_at' | 'updated_at'>;
export type UpdateGoalInput = Partial<CreateGoalInput>;

export type CreateHabitLogInput = Omit<HabitLog, 'id' | 'user_id' | 'completed_at'>;
export type UpdateHabitLogInput = Partial<Omit<CreateHabitLogInput, 'habit_id'>>;

export type CreateGoalProgressInput = Omit<GoalProgress, 'id' | 'user_id' | 'recorded_at'>;
export type UpdateGoalProgressInput = Partial<Omit<CreateGoalProgressInput, 'goal_id'>>;

// Database error types
export interface DatabaseError {
  code: string;
  message: string;
  details?: string;
}
