import { apiClient } from '@shared/api/client';
import { Leaderboard } from '@shared/types/userStats';

interface LeaderboardParams {
  limit?: number;
  search?: string;
}

export const leaderboardAPI = {
  async getLeaderboard(params: LeaderboardParams = {}): Promise<Leaderboard> {
    const response = await apiClient.get<Leaderboard>('/users/leaderboard', {
      params,
    });
    return response.data;
  },
};
