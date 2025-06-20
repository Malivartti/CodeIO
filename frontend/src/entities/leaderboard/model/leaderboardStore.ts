import { userAPI } from '@entities/user';
import { LeaderboardEntry } from '@shared/types/userStats';
import { makeAutoObservable, runInAction } from 'mobx';

import { leaderboardAPI } from '../api/leaderboardApi';

class LeaderboardStore {
  entries: LeaderboardEntry[] = [];
  isLoading = false;
  error: string | null = null;
  searchQuery = '';
  limit = 50;
  hasMore = true;
  avatarUrls: Map<string, string> = new Map();
  loadingAvatars: Set<string> = new Set();

  constructor() {
    makeAutoObservable(this);
  }

  setSearchQuery(query: string): void {
    this.searchQuery = query;
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
    } catch (error) {
      runInAction(() => {
        this.loadingAvatars.delete(filename);
      });
      console.error('Failed to load avatar:', error);
      return null;
    }
  }

  async fetchLeaderboard(reset = false): Promise<void> {
    if (reset) {
      this.entries = [];
      this.hasMore = true;
    }

    this.isLoading = true;
    this.error = null;

    try {
      const result = await leaderboardAPI.getLeaderboard({
        limit: this.limit,
        search: this.searchQuery || undefined,
      });

      runInAction(() => {
        if (reset) {
          this.entries = result.data;
        } else {
          this.entries = [...this.entries, ...result.data];
        }
        this.hasMore = result.data.length === this.limit;
        this.isLoading = false;
      });

      const newEntries = reset ? result.data : result.data;
      for (const entry of newEntries) {
        if (entry.avatar_filename && !this.avatarUrls.has(entry.avatar_filename)) {
          this.loadAvatar(entry.avatar_filename);
        }
      }
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.detail || 'Ошибка при загрузке рейтинга';
        this.isLoading = false;
      });
    }
  }

  async searchLeaderboard(query: string): Promise<void> {
    this.setSearchQuery(query);
    await this.fetchLeaderboard(true);
  }

  reset(): void {
    this.entries = [];
    this.isLoading = false;
    this.error = null;
    this.searchQuery = '';
    this.hasMore = true;

    this.avatarUrls.forEach(url => URL.revokeObjectURL(url));
    this.avatarUrls.clear();
    this.loadingAvatars.clear();
  }

  getAvatarUrl(filename: string | undefined): string | null {
    if (!filename) return null;
    return this.avatarUrls.get(filename) || null;
  }

  isAvatarLoading(filename: string | undefined): boolean {
    if (!filename) return false;
    return this.loadingAvatars.has(filename);
  }

  get filteredEntries(): LeaderboardEntry[] {
    if (!this.searchQuery) return this.entries;

    const query = this.searchQuery.toLowerCase();
    return this.entries.filter(entry => {
      const fullName = `${entry.first_name} ${entry.last_name || ''}`.toLowerCase();
      return fullName.includes(query);
    });
  }
}

export const leaderboardStore = new LeaderboardStore();
