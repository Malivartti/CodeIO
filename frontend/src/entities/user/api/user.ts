import { apiClient } from '@shared/api/client';
import { User, UserUpdateMe, UserUpdateMePassword } from '@shared/types/auth';
import { UserUpdateMeEmail } from '@shared/types/auth';
import { Message, Token } from '@shared/types/common';
import { Leaderboard,UserStats } from '@shared/types/userStats';

export const userAPI = {
  async getMe(): Promise<User> {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },

  async updateMe(data: UserUpdateMe): Promise<User> {
    const response = await apiClient.patch<User>('/users/me', data);
    return response.data;
  },

  async updateEmail(data: UserUpdateMeEmail): Promise<Message> {
    const response = await apiClient.post<Message>('/users/me/update-email', data);
    return response.data;
  },

  async confirmEmailChange(data: Token): Promise<Message> {
    const response = await apiClient.post<Message>('/users/me/update-email/confirm', data);
    return response.data;
  },

  async updatePassword(data: UserUpdateMePassword): Promise<Message> {
    const response = await apiClient.post<Message>('/users/me/update-password', data);
    return response.data;
  },

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<User>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteAvatar(): Promise<User> {
    const response = await apiClient.delete<User>('/users/me/avatar');
    return response.data;
  },

  async getAvatarBlob(filename: string): Promise<string> {
    const response = await apiClient.get(`/users/avatar/${filename}`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data);
  },

  async getUserStats(year?: number): Promise<UserStats> {
    const params = year ? { year } : {};
    const response = await apiClient.get<UserStats>('/users/me/stats', { params });
    return response.data;
  },

  async getLeaderboard(limit: number = 100): Promise<Leaderboard> {
    const response = await apiClient.get<Leaderboard>('/users/leaderboard', {
      params: { limit },
    });
    return response.data;
  },
};
