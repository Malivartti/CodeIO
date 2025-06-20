export interface AdminStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  superusers: number;
  total_tasks: number;
  public_tasks: number;
  private_tasks: number;
  tasks_by_difficulty: Record<string, number>;
  total_attempts: number;
  successful_attempts: number;
  success_rate: number;
  attempts_by_language: Record<string, number>;
  total_tags: number;
  most_used_tags: Array<{ name: string; usage_count: number }>;
  registrations_last_30_days: number;
  attempts_last_30_days: number;
}

export interface UserForAdmin {
  id: string;
  email: string;
  first_name: string;
  last_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  avatar_filename?: string;
  created_at: string
}

export interface UsersPublic {
  data: UserForAdmin[];
  count: number;
}
