import { User, UserUpdateMe } from '@shared/types/auth';
import { UserStats } from '@shared/types/userStats';
import { makeAutoObservable, runInAction } from 'mobx';

import { userAPI } from '../api/user';

class UserStore {
  user: User | null = null;
  isAuthenticated = false;
  isLoading = false;
  isUpdating = false;
  stats: UserStats | null = null;
  isLoadingStats = false;
  avatarUrl: string | null = null;

  isChangingEmail = false;
  emailChangeError: string | null = null;
  emailChangeSuccess: string | null = null;
  pendingNewEmail: string = '';

  isChangingPassword = false;
  passwordChangeError: string | null = null;
  passwordChangeSuccess: string | null = null;
  pendingPasswords: {
    current: string;
    new: string;
    confirm: string;
  } = {
    current: '',
    new: '',
    confirm: '',
  };

  constructor() {
    makeAutoObservable(this);
  }

  setUser(user: User | null): void {
    this.user = user;
    this.isAuthenticated = Boolean(user);
  }

  clearUser(): void {
    this.user = null;
    this.isAuthenticated = false;
    this.stats = null;
    this.clearAvatarUrl();
    this.clearEmailChangeState();
    this.clearPasswordChangeState();
  }

  clearAvatarUrl(): void {
    if (this.avatarUrl) {
      URL.revokeObjectURL(this.avatarUrl);
      this.avatarUrl = null;
    }
  }

  clearEmailChangeState(): void {
    this.emailChangeError = null;
    this.emailChangeSuccess = null;
    this.pendingNewEmail = '';
  }

  clearPasswordChangeState(): void {
    this.passwordChangeError = null;
    this.passwordChangeSuccess = null;
    this.pendingPasswords = {
      current: '',
      new: '',
      confirm: '',
    };
  }

  clearEmailChangeError(): void {
    this.emailChangeError = null;
  }

  clearEmailChangeSuccess(): void {
    this.emailChangeSuccess = null;
  }

  clearPasswordChangeError(): void {
    this.passwordChangeError = null;
  }

  clearPasswordChangeSuccess(): void {
    this.passwordChangeSuccess = null;
  }

  setPendingNewEmail(email: string): void {
    this.pendingNewEmail = email;
    this.emailChangeError = null;
    this.emailChangeSuccess = null;
  }

  setPendingPassword(field: 'current' | 'new' | 'confirm', value: string): void {
    this.pendingPasswords[field] = value;
    this.passwordChangeError = null;
    this.passwordChangeSuccess = null;
  }

  async fetchUser(): Promise<void> {
    this.isLoading = true;
    try {
      const user = await userAPI.getMe();
      runInAction(() => {
        this.setUser(user);
        this.isLoading = false;
      });

      if (user.avatar_filename) {
        await this.loadAvatar(user.avatar_filename);
      } else {
        this.clearAvatarUrl();
      }
    } catch (error) {
      runInAction(() => {
        this.clearUser();
        this.isLoading = false;
      });
    }
  }

  async updateUser(data: UserUpdateMe): Promise<boolean> {
    if (!this.user) return false;

    this.isUpdating = true;
    try {
      const updatedUser = await userAPI.updateMe(data);
      runInAction(() => {
        this.setUser(updatedUser);
        this.isUpdating = false;
      });
      return true;
    } catch {
      runInAction(() => {
        this.isUpdating = false;
      });
      return false;
    }
  }

  async updateEmail(newEmail: string): Promise<boolean> {
    this.isChangingEmail = true;
    this.emailChangeError = null;
    this.emailChangeSuccess = null;

    try {
      const response = await userAPI.updateEmail({ new_email: newEmail });
      runInAction(() => {
        this.isChangingEmail = false;
        this.emailChangeSuccess = response.message;
        this.pendingNewEmail = '';
      });
      return true;
    } catch (error: any) {
      const errorMessage = this.getEmailChangeErrorMessage(error);
      runInAction(() => {
        this.isChangingEmail = false;
        this.emailChangeError = errorMessage;
      });
      return false;
    }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    this.isChangingPassword = true;
    this.passwordChangeError = null;
    this.passwordChangeSuccess = null;

    try {
      const response = await userAPI.updatePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      runInAction(() => {
        this.isChangingPassword = false;
        this.passwordChangeSuccess = response.message;
        this.clearPasswordChangeState();
      });
      return true;
    } catch (error: any) {
      const errorMessage = this.getPasswordChangeErrorMessage(error);
      runInAction(() => {
        this.isChangingPassword = false;
        this.passwordChangeError = errorMessage;
      });
      return false;
    }
  }

  async confirmEmailChange(token: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await userAPI.confirmEmailChange({ token });
      await this.fetchUser();
      return { success: true, message: response.message };
    } catch (error: any) {
      const errorMessage = this.getEmailChangeErrorMessage(error);
      return { success: false, message: errorMessage };
    }
  }

  private getEmailChangeErrorMessage(error: any): string {
    if (error.response?.status === 409) {
      return 'Пользователь с таким email уже существует';
    }
    if (error.response?.status === 400) {
      const detail = error.response?.data?.detail;
      if (detail === 'Новый email не может совпадать с текущим') {
        return 'Новый email не может совпадать с текущим';
      }
      if (detail === 'Указанный email не совпадает с вашим') {
        return 'Токен недействителен или истек';
      }
      if (detail === 'Невалидный токен') {
        return 'Токен недействителен или истек';
      }
    }
    return error.response?.data?.detail || 'Произошла ошибка при смене email';
  }

  private getPasswordChangeErrorMessage(error: any): string {
    if (error.response?.status === 400) {
      const detail = error.response?.data?.detail;
      if (detail === 'Неправильный пароль') {
        return 'Неправильный текущий пароль';
      }
      if (detail === 'Новый пароль не может совпадать с текущим') {
        return 'Новый пароль не может совпадать с текущим';
      }
    }
    return error.response?.data?.detail || 'Произошла ошибка при смене пароля';
  }

  async uploadAvatar(file: File): Promise<boolean> {
    this.isUpdating = true;
    try {
      const updatedUser = await userAPI.uploadAvatar(file);
      runInAction(() => {
        this.setUser(updatedUser);
      });

      if (updatedUser.avatar_filename) {
        await this.loadAvatar(updatedUser.avatar_filename);
      }

      runInAction(() => {
        this.isUpdating = false;
      });
      return true;
    } catch {
      runInAction(() => {
        this.isUpdating = false;
      });
      return false;
    }
  }

  async deleteAvatar(): Promise<boolean> {
    this.isUpdating = true;
    try {
      const updatedUser = await userAPI.deleteAvatar();
      runInAction(() => {
        this.setUser(updatedUser);
        this.clearAvatarUrl();
        this.isUpdating = false;
      });
      return true;
    } catch {
      runInAction(() => {
        this.isUpdating = false;
      });
      return false;
    }
  }

  async loadAvatar(filename: string): Promise<void> {
    try {
      this.clearAvatarUrl();
      const avatarUrl = await userAPI.getAvatarBlob(filename);
      runInAction(() => {
        this.avatarUrl = avatarUrl;
      });
    } catch {
      runInAction(() => {
        this.avatarUrl = null;
      });
    }
  }

  async fetchUserStats(year?: number): Promise<void> {
    this.isLoadingStats = true;
    try {
      const stats = await userAPI.getUserStats(year);
      runInAction(() => {
        this.stats = stats;
        this.isLoadingStats = false;
      });
    } catch {
      runInAction(() => {
        this.isLoadingStats = false;
      });
    }
  }

  get isSuperuser(): boolean {
    return Boolean(this.user?.is_superuser);
  }

  get displayName(): string {
    if (!this.user) return '';
    return `${this.user.first_name}${this.user.last_name ? ` ${this.user.last_name}` : ''}`;
  }
}

export const userStore = new UserStore();
