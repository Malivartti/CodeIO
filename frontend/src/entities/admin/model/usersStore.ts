import { userAPI } from '@entities/user';
import { UserForAdmin } from '@shared/types/statistic';
import { makeAutoObservable, runInAction } from 'mobx';

import { adminAPI } from '../api/adminApi';

class UsersStore {
  users: UserForAdmin[] = [];
  totalUsers = 0;
  currentPage = 1;
  itemsPerPage = 20;
  isLoading = false;
  isCreating = false;
  isUpdating = false;
  isDeleting = false;
  error: string | null = null;
  searchQuery = '';
  avatarUrls: Map<string, string> = new Map();
  loadingAvatars: Set<string> = new Set();

  constructor() {
    makeAutoObservable(this);
  }

  setSearchQuery(query: string): void {
    this.searchQuery = query;
    this.currentPage = 1;
  }

  setCurrentPage(page: number): void {
    this.currentPage = page;
  }

  clearError(): void {
    this.error = null;
  }

  async loadAvatar(filename: string): Promise<string | null> {
    if (this.loadingAvatars.has(filename)) {
      return this.avatarUrls.get(filename) || null;
    }

    if (this.avatarUrls.has(filename)) {
      return this.avatarUrls.get(filename) || null;
    }

    this.loadingAvatars.add(filename);

    try {
      const avatarUrl = await userAPI.getAvatarBlob(filename);
      runInAction(() => {
        this.avatarUrls.set(filename, avatarUrl);
        this.loadingAvatars.delete(filename);
      });
      return avatarUrl;
    } catch {
      runInAction(() => {
        this.loadingAvatars.delete(filename);
      });
      return null;
    }
  }

  async loadUsers(page: number = this.currentPage): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const skip = (page - 1) * this.itemsPerPage;
      const response = await adminAPI.getUsers(skip, this.itemsPerPage);

      runInAction(() => {
        this.users = response.data;
        this.totalUsers = response.count;
        this.currentPage = page;
        this.isLoading = false;
      });

      for (const user of response.data) {
        if (user.avatar_filename && !this.avatarUrls.has(user.avatar_filename)) {
          this.loadAvatar(user.avatar_filename);
        }
      }
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.detail || 'Ошибка при загрузке пользователей';
        this.isLoading = false;
      });
    }
  }

  async createUser(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name?: string;
    is_active: boolean;
    is_superuser: boolean;
  }): Promise<boolean> {
    this.isCreating = true;
    this.error = null;

    try {
      const newUser = await adminAPI.createUser(userData);
      runInAction(() => {
        this.users.unshift(newUser);
        this.totalUsers += 1;
        this.isCreating = false;
      });
      return true;
    } catch (error: any) {
      runInAction(() => {
        this.error = this.getErrorMessage(error);
        this.isCreating = false;
      });
      return false;
    }
  }

  async updateUser(userId: string, userData: {
    email?: string;
    first_name?: string;
    last_name?: string;
    is_active?: boolean;
    is_superuser?: boolean;
  }): Promise<boolean> {
    this.isUpdating = true;
    this.error = null;

    try {
      const updatedUser = await adminAPI.updateUser(userId, userData);
      runInAction(() => {
        const index = this.users.findIndex(user => user.id === userId);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        this.isUpdating = false;
      });
      return true;
    } catch (error: any) {
      runInAction(() => {
        this.error = this.getErrorMessage(error);
        this.isUpdating = false;
      });
      return false;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    this.isDeleting = true;
    this.error = null;

    try {
      await adminAPI.deleteUser(userId);
      runInAction(() => {
        this.users = this.users.filter(user => user.id !== userId);
        this.totalUsers -= 1;
        this.isDeleting = false;
      });
      return true;
    } catch (error: any) {
      runInAction(() => {
        this.error = this.getErrorMessage(error);
        this.isDeleting = false;
      });
      return false;
    }
  }

  getAvatarUrl(filename: string | undefined): string | null {
    if (!filename) return null;
    return this.avatarUrls.get(filename) || null;
  }

  isAvatarLoading(filename: string | undefined): boolean {
    if (!filename) return false;
    return this.loadingAvatars.has(filename);
  }

  private getErrorMessage(error: any): string {
    if (error.response?.status === 409) {
      return 'Пользователь с таким email уже существует';
    }
    if (error.response?.status === 404) {
      return 'Пользователь не найден';
    }
    return error.response?.data?.detail || 'Произошла ошибка';
  }

  get filteredUsers(): UserForAdmin[] {
    if (!this.searchQuery) return this.users;

    const query = this.searchQuery.toLowerCase();
    return this.users.filter(user => {
      const fullName = `${user.first_name} ${user.last_name || ''}`.toLowerCase();
      return fullName.includes(query) || user.email.toLowerCase().includes(query);
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalUsers / this.itemsPerPage);
  }

  reset(): void {
    this.users = [];
    this.totalUsers = 0;
    this.currentPage = 1;
    this.isLoading = false;
    this.isCreating = false;
    this.isUpdating = false;
    this.isDeleting = false;
    this.error = null;
    this.searchQuery = '';

    this.avatarUrls.forEach(url => URL.revokeObjectURL(url));
    this.avatarUrls.clear();
    this.loadingAvatars.clear();
  }
}

export const usersStore = new UsersStore();
