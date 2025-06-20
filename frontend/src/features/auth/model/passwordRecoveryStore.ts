import { makeAutoObservable, runInAction } from 'mobx';

import { authAPI } from '../api/auth';

class PasswordRecoveryStore {
  isRequestingReset = false;
  isResettingPassword = false;
  requestError: string | null = null;
  resetError: string | null = null;
  requestSuccess = false;
  resetSuccess = false;

  constructor() {
    makeAutoObservable(this);
  }

  clearRequestState(): void {
    this.requestError = null;
    this.requestSuccess = false;
  }

  clearResetState(): void {
    this.resetError = null;
    this.resetSuccess = false;
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    this.isRequestingReset = true;
    this.requestError = null;
    this.requestSuccess = false;

    try {
      await authAPI.requestPasswordReset(email);
      runInAction(() => {
        this.requestSuccess = true;
        this.isRequestingReset = false;
      });
      return true;
    } catch (error: any) {
      const errorMessage = this.getErrorMessage(error);
      runInAction(() => {
        this.requestError = errorMessage;
        this.isRequestingReset = false;
      });
      return false;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    this.isResettingPassword = true;
    this.resetError = null;
    this.resetSuccess = false;

    try {
      await authAPI.resetPassword({
        token,
        new_password: newPassword,
      });
      runInAction(() => {
        this.resetSuccess = true;
        this.isResettingPassword = false;
      });
      return true;
    } catch (error: any) {
      const errorMessage = this.getErrorMessage(error);
      runInAction(() => {
        this.resetError = errorMessage;
        this.isResettingPassword = false;
      });
      return false;
    }
  }

  private getErrorMessage(error: any): string {
    if (error.response?.status === 404) {
      return 'Пользователь с таким email не найден';
    }
    if (error.response?.status === 400) {
      const detail = error.response?.data?.detail;
      if (detail === 'Невалидный токен' || detail === 'Invalid token') {
        return 'Ссылка недействительна или истекла';
      }
      if (detail === 'Учетная запись не активна') {
        return 'Учетная запись заблокирована';
      }
    }
    return error.response?.data?.detail || 'Произошла ошибка';
  }

  reset(): void {
    this.isRequestingReset = false;
    this.isResettingPassword = false;
    this.requestError = null;
    this.resetError = null;
    this.requestSuccess = false;
    this.resetSuccess = false;
  }
}

export const passwordRecoveryStore = new PasswordRecoveryStore();
