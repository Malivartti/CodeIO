import { apiClient } from '@shared/api/client';
import { TagsPublic } from '@shared/types/tag';

export const tagAPI = {
  async getTags(): Promise<TagsPublic> {
    const response = await apiClient.get('/tags');
    return response.data;
  },
};
