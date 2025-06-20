import { apiClient } from '@shared/api/client';
import { Attempt, AttemptCreate, AttemptPublic,AttemptsResponse } from '@shared/types/attempt';

export const attemptAPI = {
  async createAttempt(attemptData: AttemptCreate): Promise<{ id: number; status: string }> {
    const response = await apiClient.post('/attempts', attemptData);
    return response.data;
  },

  async getAttemptsByTask(
    taskId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<AttemptsResponse> {
    const skip = (page - 1) * limit;
    const response = await apiClient.get(`/attempts/task/${taskId}`, {
      params: { skip, limit },
    });
    return response.data;
  },

  async getAttemptById(attemptId: number): Promise<Attempt> {
    const response = await apiClient.get(`/attempts/${attemptId}`);
    return response.data;
  },

  async getAttemptDetails(attemptId: number): Promise<AttemptPublic> {
    const response = await apiClient.get(`/attempts/${attemptId}`);
    return response.data;
  },

  async getAttemptStatus(
    attemptId: number,
    timeoutSeconds: number = 30,
    signal?: AbortSignal
  ): Promise<{
      id: number;
      status: string;
      time_used_ms?: number;
      memory_used_bytes?: number;
      error_traceback?: string;
      failed_test_number?: number;
      source_code_output?: string;
      expected_output?: string;
    }> {
    const response = await apiClient.get(`/attempts/${attemptId}/status`, {
      params: { timeout_seconds: timeoutSeconds },
      signal,
    });
    return response.data;
  },
};
