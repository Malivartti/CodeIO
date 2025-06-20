export interface UserStatsByDifficulty {
  easy: { solved: number; total: number };
  medium: { solved: number; total: number };
  hard: { solved: number; total: number };
}

export interface ActivityDay {
  date: string;
  count: number;
}

export interface RecentSolvedTask {
  id: number;
  title: string;
  solved_at: string;
}

export interface UserStats {
  solved_by_difficulty: UserStatsByDifficulty;
  activity_days: ActivityDay[];
  recent_solved_tasks: RecentSolvedTask[];
  total_solved_this_year: number;
  average_per_month: number;
  average_per_week: number;
}

export interface LeaderboardEntry {
  user_id: string;
  first_name: string;
  last_name?: string;
  avatar_filename?: string;
  total_score: number;
  solved_tasks_count: number;
}

export interface Leaderboard {
  data: LeaderboardEntry[];
  count: number;
}
