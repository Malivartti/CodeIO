import { AdminStats } from '@shared/types/statistic';
import { makeAutoObservable, runInAction } from 'mobx';

import { adminAPI } from '../api/adminApi';

class StatisticsStore {
  stats: AdminStats | null = null;
  isLoadingStats = false;
  statsError: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  clearStatsError(): void {
    this.statsError = null;
  }

  async fetchStats(): Promise<void> {
    this.isLoadingStats = true;
    this.statsError = null;

    try {
      const stats = await adminAPI.getStats();
      runInAction(() => {
        this.stats = stats;
        this.isLoadingStats = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.statsError = error.response?.data?.detail || 'Ошибка при загрузке статистики';
        this.isLoadingStats = false;
      });
    }
  }

  reset(): void {
    this.stats = null;
    this.isLoadingStats = false;
    this.statsError = null;
  }
}

export const statisticsStore = new StatisticsStore();
