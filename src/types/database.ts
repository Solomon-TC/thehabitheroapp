export interface Habit {
  id: string;
  user_id: string;
  character_id: string;
  name: string;
  frequency: string;
  target_days: number;
  streak: number;
  last_completed: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  character_id: string;
  name: string;
  description: string | null;
  target_value: number;
  current_value: number;
  unit: string | null;
  deadline: string | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  character_id: string;
  completed_at: string;
  created_at: string;
}

export interface GoalProgress {
  id: string;
  goal_id: string;
  user_id: string;
  character_id: string;
  value: number;
  notes: string | null;
  created_at: string;
}

export interface Stats {
  habits_completed: number;
  goals_completed: number;
  max_streak: number;
  achievements_unlocked: number;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  price_id: string;
  quantity: number;
  cancel_at_period_end: boolean;
  created_at: string;
  current_period_start: string;
  current_period_end: string;
  ended_at: string | null;
  cancel_at: string | null;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
}

export interface Price {
  id: string;
  product_id: string;
  active: boolean;
  description: string | null;
  unit_amount: number;
  currency: string;
  type: 'one_time' | 'recurring';
  interval: 'day' | 'week' | 'month' | 'year' | null;
  interval_count: number | null;
  trial_period_days: number | null;
  metadata: Record<string, string>;
}

export interface Product {
  id: string;
  active: boolean;
  name: string;
  description: string | null;
  image: string | null;
  metadata: Record<string, string>;
}

export interface Customer {
  id: string;
  stripe_customer_id: string | null;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Friend {
  friend_id: string;
  friends_since: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'friend_request' | 'achievement' | 'level_up' | 'streak';
  title: string;
  message: string;
  friend_request_id?: string;
  read: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      habits: {
        Row: Habit;
        Insert: Omit<Habit, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Habit, 'id' | 'created_at' | 'updated_at'>>;
      };
      goals: {
        Row: Goal;
        Insert: Omit<Goal, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Goal, 'id' | 'created_at' | 'updated_at'>>;
      };
      habit_logs: {
        Row: HabitLog;
        Insert: Omit<HabitLog, 'id' | 'created_at'>;
        Update: Partial<Omit<HabitLog, 'id' | 'created_at'>>;
      };
      goal_progress: {
        Row: GoalProgress;
        Insert: Omit<GoalProgress, 'id' | 'created_at'>;
        Update: Partial<Omit<GoalProgress, 'id' | 'created_at'>>;
      };
      friend_requests: {
        Row: FriendRequest;
        Insert: Omit<FriendRequest, 'id' | 'created_at' | 'updated_at' | 'status'>;
        Update: Partial<Pick<FriendRequest, 'status'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at' | 'read'>;
        Update: Partial<Pick<Notification, 'read'>>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'id' | 'created_at'>;
        Update: Partial<Omit<Subscription, 'id' | 'created_at'>>;
      };
      prices: {
        Row: Price;
        Insert: Omit<Price, 'id'>;
        Update: Partial<Omit<Price, 'id'>>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id'>;
        Update: Partial<Omit<Product, 'id'>>;
      };
      customers: {
        Row: Customer;
        Insert: Omit<Customer, 'id'>;
        Update: Partial<Omit<Customer, 'id'>>;
      };
    };
    Views: {
      friends: {
        Row: Friend;
      };
    };
    Functions: {
      handle_friend_request: {
        Args: { request_id: string; new_status: string };
        Returns: void;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
