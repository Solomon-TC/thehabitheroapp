export type UserRole = 'user' | 'admin' | 'moderator';

export interface AdminLog {
  id: string;
  admin_email: string;
  action: string;
  details: any;
  created_at: string;
}

export interface AdminSettings {
  id: string;
  key: string;
  value: any;
  updated_at: string;
  updated_by: string;
}

export interface UserRoleInfo {
  user_id: string;
  email: string;
  role: UserRole;
  assigned_by: string;
  assigned_at: string;
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  total_habits: number;
  total_goals: number;
  completed_habits: number;
  completed_goals: number;
  average_user_level: number;
}

export interface AdminAction {
  type: 'add_admin' | 'remove_admin' | 'update_settings' | 'moderate_user';
  payload: any;
}

export interface UserReport {
  user_id: string;
  email: string;
  created_at: string;
  last_sign_in: string;
  total_habits: number;
  total_goals: number;
  character_level: number;
  is_active: boolean;
}

export interface SystemHealth {
  database_status: 'healthy' | 'warning' | 'error';
  api_status: 'healthy' | 'warning' | 'error';
  last_backup: string;
  active_connections: number;
  average_response_time: number;
}

export interface AdminDashboardData {
  stats: AdminStats;
  recent_logs: AdminLog[];
  system_health: SystemHealth;
  user_reports: UserReport[];
}
