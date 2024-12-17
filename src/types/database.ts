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

export interface Profile {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;
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
  profile: Profile;
  character: {
    id: string;
    name: string;
    level: number;
    character_appearance: {
      skin_color: string;
      hair_color: string;
      eye_color: string;
      outfit_color: string;
    };
  };
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  friend_request_id: string | null;
  read: boolean;
  created_at: string;
}

export interface Achievement {
  id: string;
  character_id: string;
  title: string;
  unlocked_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  type: 'bug' | 'feature' | 'general';
  content: string;
  status: 'pending' | 'reviewed' | 'implemented' | 'rejected';
  created_at: string;
  updated_at: string;
}
