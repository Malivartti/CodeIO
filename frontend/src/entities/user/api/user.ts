import { apiClient } from '@shared/api/client';
import { User } from '@shared/types/auth';

export const userAPI = {
  async getMe(): Promise<User> {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },

  async getAvatarBlob(filename: string): Promise<string> {
    const response = await apiClient.get(`/users/me/avatar/${filename}`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data);
  },
};
