import { userStore } from '@entities/user';
import { tokenStorage } from '@shared/lib/auth';
import { InitializationMixin } from '@shared/stores/InitializationMixin';
import { UserLogin, UserRegister } from '@shared/types/auth';
import { IInitializableStore } from '@shared/types/store';
import { makeAutoObservable, runInAction } from 'mobx';

import { authAPI, AuthAPIError } from '../api/auth';

class AuthStore implements IInitializableStore {
  initialization = new InitializationMixin();
  isLoading = false;
  error: string | null = null;
  validationErrors: Record<string, string> = {};

  constructor() {
    makeAutoObservable(this);
    this.initialization.performInitialization(() => this.initialize());
  }

  get isInitializing(): boolean {
    return this.initialization.isInitializing;
  }

  get initializationError(): string | null {
    return this.initialization.initializationError;
  }

  get isInitialized(): boolean {
    return this.initialization.isInitialized;
  }

  get hasInitializationError(): boolean {
    return this.initialization.hasInitializationError;
  }


  private async initialize(): Promise<void> {
    if (tokenStorage.hasTokens()) {
      try {
        await userStore.fetchUser();
      } catch {
        this.logout();
      }
    }
  }

  private setLoading(loading: boolean): void {
    this.isLoading = loading;
  }

  private setError(error: string | null): void {
    this.error = error;
  }

  private setValidationErrors(errors: Record<string, string>): void {
    this.validationErrors = errors;
  }

  private clearErrors(): void {
    this.error = null;
    this.validationErrors = {};
  }

  private async handleAuthSuccess(tokens: any): Promise<void> {
    tokenStorage.setTokens(tokens);
    await userStore.fetchUser();
  }

  private handleAuthError(error: AuthAPIError): void {
    if (error.validationErrors) {
      const validationErrors = error.validationErrors.reduce((acc, err) => {
        acc[err.field] = err.message;
        return acc;
      }, {} as Record<string, string>);
      this.setValidationErrors(validationErrors);
    } else {
      this.setError(error.detail);
    }
  }

  async login(credentials: UserLogin): Promise<boolean> {
    this.setLoading(true);
    this.clearErrors();

    try {
      const tokens = await authAPI.login(credentials);
      await runInAction(async () => {
        await this.handleAuthSuccess(tokens);
        this.setLoading(false);
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.handleAuthError(error as AuthAPIError);
        this.setLoading(false);
      });
      return false;
    }
  }

  async register(userData: UserRegister): Promise<boolean> {
    this.setLoading(true);
    this.clearErrors();

    try {
      const tokens = await authAPI.register(userData);
      await runInAction(async () => {
        await this.handleAuthSuccess(tokens);
        this.setLoading(false);
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.handleAuthError(error as AuthAPIError);
        this.setLoading(false);
      });
      return false;
    }
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return false;
    }

    try {
      const tokens = await authAPI.refreshToken({ token: refreshToken });
      runInAction(() => {
        tokenStorage.setTokens(tokens);
      });
      return true;
    } catch {
      runInAction(() => {
        this.logout();
      });
      return false;
    }
  }

  logout(): void {
    tokenStorage.clearTokens();
    userStore.clearUser();
    this.clearErrors();
  }

  getFieldError(field: string): string | undefined {
    return this.validationErrors[field];
  }

  hasFieldError(field: string): boolean {
    return Boolean(this.validationErrors[field]);
  }

  get isAuthenticated(): boolean {
    return userStore.isAuthenticated;
  }
}

export const authStore = new AuthStore();
