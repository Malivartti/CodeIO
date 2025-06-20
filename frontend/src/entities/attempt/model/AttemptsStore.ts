import { userStore } from '@entities/user';
import { AttemptForListPublic, AttemptStatus, ProgrammingLanguage } from '@shared/types/attempt';
import { makeAutoObservable, runInAction } from 'mobx';

import { attemptAPI } from '../api/attemptApi';

interface ApiError {
  response?: {
    status: number;
    data?: {
      detail?: string;
      message?: string;
    };
  };
  message: string;
}

class AttemptsStore {
  attempts: AttemptForListPublic[] = [];
  totalAttempts = 0;
  currentPage = 1;
  itemsPerPage = 10;

  isLoading = false;
  isSubmitting = false;

  error: string | null = null;

  private currentAttemptId: number | null = null;
  private longPollingController: AbortController | null = null;
  private currentTaskId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  private getErrorInfo(error: unknown): { message: string } {
    const apiError = error as ApiError;

    let message = 'Произошла неизвестная ошибка';

    if (apiError.response?.data?.detail) {
      message = apiError.response.data.detail;
    } else if (apiError.response?.data?.message) {
      message = apiError.response.data.message;
    } else if (apiError.message) {
      message = apiError.message;
    }

    return { message };
  }

  private isFinalStatus(status: AttemptStatus): boolean {
    return status !== AttemptStatus.RUNNING;
  }

  private stopLongPolling(): void {
    if (this.longPollingController) {
      this.longPollingController.abort();
      this.longPollingController = null;
    }

    runInAction(() => {
      this.currentAttemptId = null;
      this.isSubmitting = false;
    });
  }

  private async startLongPolling(attemptId: number, taskId: number): Promise<void> {
    if (this.currentAttemptId === attemptId) {
      return;
    }

    this.stopLongPolling();

    this.currentAttemptId = attemptId;
    this.currentTaskId = taskId;

    runInAction(() => {
      this.isSubmitting = true;
    });

    while (this.currentAttemptId === attemptId && this.isSubmitting) {
      try {
        this.longPollingController = new AbortController();

        const result = await attemptAPI.getAttemptStatus(
          attemptId,
          30,
          this.longPollingController.signal
        );

        runInAction(() => {
          const index = this.attempts.findIndex(a => a.id === attemptId);
          if (index !== -1) {
            this.attempts[index] = {
              ...this.attempts[index],
              status: result.status,
              time_used_ms: result.time_used_ms || 0,
              memory_used_bytes: result.memory_used_bytes || 0,
              failed_test_number: result.failed_test_number,
            };
          }
        });

        if (this.isFinalStatus(result.status)) {
          this.stopLongPolling();
          if (this.currentTaskId) {
            await this.loadAttempts(this.currentTaskId, this.currentPage);
          }
          break;
        }

      } catch (error: any) {
        if (error.name === 'AbortError') {
          break;
        }

        console.error('Long polling error:', error);

        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  private checkAndResumePolling(taskId: number): void {
    if (!userStore.user) return;

    const runningAttempt = this.attempts.find(attempt =>
      attempt.status === AttemptStatus.RUNNING
    );

    if (runningAttempt) {
      this.startLongPolling(runningAttempt.id, taskId);
    }
  }

  async loadAttempts(taskId: number, page: number = 1): Promise<void> {
    try {
      runInAction(() => {
        this.isLoading = true;
        this.currentPage = page;
      });

      const attemptsResponse = await attemptAPI.getAttemptsByTask(
        taskId,
        page,
        this.itemsPerPage
      );

      runInAction(() => {
        this.attempts = attemptsResponse.data;
        this.totalAttempts = attemptsResponse.count;
      });

      if (page === 1) {
        this.checkAndResumePolling(taskId);
      }

    } catch {
      runInAction(() => {
        this.attempts = [];
        this.totalAttempts = 0;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async submitAttempt(taskId: number, language: ProgrammingLanguage, sourceCode: string): Promise<boolean> {
    if (!userStore.user || this.isSubmitting) return false;

    try {
      runInAction(() => {
        this.isSubmitting = true;
        this.error = null;
      });

      const response = await attemptAPI.createAttempt({
        user_id: userStore.user.id,
        task_id: taskId,
        programming_language: language,
        source_code: sourceCode,
      });

      const newAttempt: AttemptForListPublic = {
        id: response.id,
        status: AttemptStatus.RUNNING,
        programming_language: language,
        time_used_ms: 0,
        memory_used_bytes: 0,
        failed_test_number: null,
        created_at: new Date().toISOString(),
      };

      runInAction(() => {
        this.attempts = [newAttempt, ...this.attempts];
        this.totalAttempts += 1;
      });

      this.startLongPolling(response.id, taskId);

      return true;
    } catch (error) {
      const { message } = this.getErrorInfo(error);

      runInAction(() => {
        this.error = message;
        this.isSubmitting = false;
      });

      return false;
    }
  }

  clearError(): void {
    runInAction(() => {
      this.error = null;
    });
  }

  reset(): void {
    this.stopLongPolling();

    runInAction(() => {
      this.attempts = [];
      this.totalAttempts = 0;
      this.currentPage = 1;
      this.isLoading = false;
      this.isSubmitting = false;
      this.error = null;
      this.currentTaskId = null;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalAttempts / this.itemsPerPage);
  }

  get isSolved(): boolean {
    if (!userStore.user) return false;

    return this.attempts.some(
      attempt =>
        attempt.status === AttemptStatus.OK
    );
  }

  get hasRunningAttempt(): boolean {
    return this.attempts.some(attempt => attempt.status === AttemptStatus.RUNNING);
  }
}

export const attemptsStore = new AttemptsStore();
