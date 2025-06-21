import { apiClient } from '@shared/api/client';
import { Task, TaskApi, TaskCreate, TasksFilters, TasksPublic, TaskUpdate, TestCase } from '@shared/types/task';
import { AxiosResponse } from 'axios';

interface TagUpdateError {
  tagId: number;
  error: string;
}

interface TagUpdateResult {
  successfulTags: number[];
  errors: TagUpdateError[];
}

export const taskAPI = {
  async getTasks(filters: TasksFilters): Promise<TasksPublic> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, item.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await apiClient.get(`/tasks?${params.toString()}`);
    return response.data;
  },

  async createTask(taskData: TaskCreate): Promise<Task> {
    const response = await apiClient.post('/tasks', taskData);
    return response.data;
  },

  async updateTask(taskId: number, taskData: TaskUpdate): Promise<Task> {
    const response = await apiClient.patch(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  async deleteTask(taskId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/tasks/${taskId}`);
    return response.data;
  },

  async getTaskById(taskId: number): Promise<Task> {
    const response: AxiosResponse<TaskApi> = await apiClient.get(`/tasks/${taskId}`);
    const task: Task = {
      ...response.data,
      tests: response.data.tests.map(test => ({
        id: Date.now(),
        inputs: test[0],
        outputs: test[1],
      }) as TestCase),
    };

    return task;
  },

  async addTagToTask(taskId: number, tagId: number): Promise<void> {
    await apiClient.post(`/tasks/${taskId}/tags/${tagId}`);
  },

  async removeTagFromTask(taskId: number, tagId: number): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}/tags/${tagId}`);
  },

  async getTaskTags(taskId: number): Promise<any[]> {
    const response = await apiClient.get(`/tasks/${taskId}/tags`);
    return response.data;
  },

  async updateTaskTags(taskId: number, newTagIds: number[]): Promise<TagUpdateResult> {
    const result: TagUpdateResult = {
      successfulTags: [],
      errors: [],
    };

    try {
      const currentTags = await this.getTaskTags(taskId);
      const currentTagIds = currentTags.map(tag => tag.id);

      const tagsToRemove = currentTagIds.filter(tagId => !newTagIds.includes(tagId));

      const tagsToAdd = newTagIds.filter(tagId => !currentTagIds.includes(tagId));

      for (const tagId of tagsToRemove) {
        try {
          await this.removeTagFromTask(taskId, tagId);
        } catch (error: any) {
          const isNotExistsError = error.response?.status === 404 ||
                                  error.response?.data?.detail?.includes('не существует');
          if (!isNotExistsError) {
            result.errors.push({
              tagId,
              error: `Ошибка удаления тега: ${error.response?.data?.detail || error.message}`,
            });
          }
        }
      }

      for (const tagId of tagsToAdd) {
        try {
          await this.addTagToTask(taskId, tagId);
          result.successfulTags.push(tagId);
        } catch (error: any) {
          let errorMessage = 'Неизвестная ошибка';

          if (error.response?.status === 404) {
            errorMessage = 'Тег не найден';
          } else if (error.response?.status === 409) {
            errorMessage = 'Тег уже добавлен к задаче';
            result.successfulTags.push(tagId);
            continue;
          } else if (error.response?.data?.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.message) {
            errorMessage = error.message;
          }

          result.errors.push({
            tagId,
            error: errorMessage,
          });
        }
      }

    } catch (error: any) {
      throw new Error(`Не удалось получить текущие теги задачи: ${error.response?.data?.detail || error.message}`);
    }

    return result;
  },
};
