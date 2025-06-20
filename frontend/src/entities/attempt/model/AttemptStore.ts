import { AttemptPublic } from '@shared/types/attempt';
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

class AttemptStore {
  attempt: AttemptPublic | null = null;
  isLoading = false;
  errorTitle: string = '';
  errorMessage: string = '';
  showRetry = false;
  shouldNavigateToError = false;

  private error: string | null = null;
  private errorStatus: number | null = null;
  private lastAttemptId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  private getErrorInfo(error: unknown): { message: string; status: number | null } {
    const apiError = error as ApiError;

    const status = apiError.response?.status || null;
    let message = 'Произошла неизвестная ошибка';

    if (apiError.response?.data?.detail) {
      message = apiError.response.data.detail;
    } else if (apiError.response?.data?.message) {
      message = apiError.response.data.message;
    } else if (apiError.message) {
      message = apiError.message;
    }

    return { message, status };
  }

  private handleError(attemptId: number): void {
    if (!this.error || !this.errorStatus) return;

    let title = 'Ошибка';
    let message = this.error;
    let showRetry = true;

    switch (this.errorStatus) {
      case 404:
        title = 'Попытка не найдена';
        message = 'Запрашиваемая попытка не существует или была удалена';
        showRetry = false;
        break;
      case 403:
        title = 'Доступ запрещен';
        message = 'У вас нет прав для просмотра этой попытки';
        showRetry = false;
        break;
      case 401:
        title = 'Требуется авторизация';
        message = 'Эта попытка доступна только авторизованным пользователям';
        showRetry = false;
        break;
      default:
        title = 'Что-то пошло не так';
        message = this.error || 'Произошла неожиданная ошибка при загрузке попытки';
    }

    runInAction(() => {
      this.errorTitle = title;
      this.errorMessage = message;
      this.showRetry = showRetry;
      this.shouldNavigateToError = true;
    });
  }

  async loadAttempt(attemptId: number): Promise<void> {
    try {
      runInAction(() => {
        this.isLoading = true;
        this.error = null;
        this.errorStatus = null;
        this.shouldNavigateToError = false;
        this.lastAttemptId = attemptId;
      });

      const attemptData = await attemptAPI.getAttemptDetails(attemptId);

      runInAction(() => {
        this.attempt = attemptData;
      });
    } catch (error) {
      const { message, status } = this.getErrorInfo(error);

      runInAction(() => {
        this.error = message;
        this.errorStatus = status;
        this.attempt = null;
      });

      if (status === 403 || status === 404 || status === 401) {
        this.handleError(attemptId);
      }
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  retryLoadAttempt(): void {
    if (this.lastAttemptId) {
      this.loadAttempt(this.lastAttemptId);
    }
  }

  clearNavigationFlag(): void {
    runInAction(() => {
      this.shouldNavigateToError = false;
    });
  }

  clearError(): void {
    runInAction(() => {
      this.error = null;
      this.errorStatus = null;
      this.errorTitle = '';
      this.errorMessage = '';
      this.showRetry = false;
      this.shouldNavigateToError = false;
    });
  }

  reset(): void {
    runInAction(() => {
      this.attempt = null;
      this.isLoading = false;
      this.error = null;
      this.errorStatus = null;
      this.errorTitle = '';
      this.errorMessage = '';
      this.showRetry = false;
      this.shouldNavigateToError = false;
      this.lastAttemptId = null;
    });
  }
}

export const attemptStore = new AttemptStore();
