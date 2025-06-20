import { taskAPI } from '@entities/task';
import { Task } from '@shared/types/task';
import { makeAutoObservable, runInAction } from 'mobx';

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

class TaskStore {
  task: Task | null = null;
  taskTags: Array<{ id: number; name: string }> = [];
  isLoading = false;
  isLoadingTags = false;
  error: string | null = null;
  errorTitle = 'Ошибка';
  errorMessage = 'Что-то пошло не так';
  showRetry = false;

  constructor() {
    makeAutoObservable(this);
  }

  get shouldNavigateToError(): boolean {
    return this.error !== null && this.showRetry;
  }

  private getErrorMessage(error: unknown): string {
    const apiError = error as ApiError;

    if (!apiError.response) {
      return 'Ошибка подключения к серверу';
    }

    const { status, data } = apiError.response;

    if (status === 404) {
      return 'Задача не найдена';
    }

    if (status === 403) {
      return 'Доступ к задаче запрещен';
    }

    if (status >= 500) {
      return 'Внутренняя ошибка сервера';
    }

    return data?.detail || data?.message || apiError.message || 'Не удалось загрузить задачу';
  }

  async loadTask(taskId: number): Promise<void> {
    try {
      runInAction(() => {
        this.isLoading = true;
        this.error = null;
        this.showRetry = false;
      });

      const task = await taskAPI.getTaskById(taskId);

      runInAction(() => {
        this.task = task;
        this.isLoading = false;
      });

      this.loadTaskTags(taskId);

    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
        this.error = this.getErrorMessage(error);
        this.errorMessage = this.error;
        this.showRetry = true;

        if ((error as ApiError).response?.status === 404) {
          this.errorTitle = 'Задача не найдена';
        } else if ((error as ApiError).response?.status === 403) {
          this.errorTitle = 'Доступ запрещен';
        } else {
          this.errorTitle = 'Ошибка загрузки';
        }
      });
    }
  }

  async loadTaskTags(taskId: number): Promise<void> {
    try {
      runInAction(() => {
        this.isLoadingTags = true;
      });

      const tags = await taskAPI.getTaskTags(taskId);

      runInAction(() => {
        this.taskTags = tags;
        this.isLoadingTags = false;
      });

    } catch (error) {
      console.warn('Failed to load task tags:', error);
      runInAction(() => {
        this.taskTags = [];
        this.isLoadingTags = false;
      });
    }
  }

  async retryLoadTask(): Promise<void> {
    if (this.task?.id) {
      await this.loadTask(this.task.id);
    }
  }

  reset(): void {
    this.task = null;
    this.taskTags = [];
    this.isLoading = false;
    this.isLoadingTags = false;
    this.error = null;
    this.errorTitle = 'Ошибка';
    this.errorMessage = 'Что-то пошло не так';
    this.showRetry = false;
  }
}

export const taskStore = new TaskStore();
