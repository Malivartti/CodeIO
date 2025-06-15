import { User } from '@shared/types/auth';
import { makeAutoObservable, runInAction } from 'mobx';

import { userAPI } from '../api/user';

class UserStore {
  user: User | null = null;
  isAuthenticated = false;
  isLoading = false;

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
  }

  async fetchUser(): Promise<void> {
    this.isLoading = true;
    try {
      const user = await userAPI.getMe();
      runInAction(() => {
        this.setUser(user);
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.clearUser();
        this.isLoading = false;
      });
    }
  }

  get isSuperuser(): boolean {
    return Boolean(this.user?.is_superuser);
  }
}

export const userStore = new UserStore();
