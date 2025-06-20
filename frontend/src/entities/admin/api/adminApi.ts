import { apiClient } from '@shared/api/client';
import { AdminStats, UserForAdmin, UsersPublic } from '@shared/types/statistic';
import { TagPublic, TagsPublic } from '@shared/types/tag';

export const adminAPI = {
  async getStats(): Promise<AdminStats> {
    const response = await apiClient.get<AdminStats>('/stats');
    return response.data;
  },

  async getUsers(skip = 0, limit = 100): Promise<UsersPublic> {
    const response = await apiClient.get<UsersPublic>('/users', {
      params: { skip, limit },
    });
    return response.data;
  },

  async getUser(userId: string): Promise<UserForAdmin> {
    const response = await apiClient.get<UserForAdmin>(`/users/${userId}`);
    return response.data;
  },

  async createUser(userData: any): Promise<UserForAdmin> {
    const response = await apiClient.post<UserForAdmin>('/users', userData);
    return response.data;
  },

  async updateUser(userId: string, userData: any): Promise<UserForAdmin> {
    const response = await apiClient.patch<UserForAdmin>(`/users/${userId}`, userData);
    return response.data;
  },

  async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  },

  async getTags(skip = 0, limit = 100): Promise<TagsPublic> {
    const response = await apiClient.get<TagsPublic>('/tags', {
      params: { skip, limit },
    });
    return response.data;
  },

  async createTag(tagData: { name: string }): Promise<TagPublic> {
    const response = await apiClient.post<TagPublic>('/tags', tagData);
    return response.data;
  },

  async updateTag(tagId: number, tagData: { name: string }): Promise<TagPublic> {
    const response = await apiClient.patch<TagPublic>(`/tags/${tagId}`, tagData);
    return response.data;
  },

  async deleteTag(tagId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/tags/${tagId}`);
    return response.data;
  },
};
