import { SortByEnum, SortOrderEnum, TasksFilters, TasksPublic, TasksType } from '@shared/types/task';
import { makeAutoObservable, runInAction } from 'mobx';

import { taskAPI } from '../api/task';

class TasksStore {
  data: TasksPublic | null = null;
  isInitialLoading = false;
  isFilterLoading = false;
  loadingMore = false;
  error: string | null = null;
  filters: TasksFilters = {
    tasks_type: TasksType.PUBLIC,
    search: '',
    sort_by: SortByEnum.ID,
    sort_order: SortOrderEnum.ASC,
    skip: 0,
    limit: 13,
  };
  isFirstLoad = true;

  constructor() {
    makeAutoObservable(this);
  }

  get hasUserStatusTasks() {
    return this.data?.data.some(task => task.user_attempt_status !== undefined) ?? false;
  }

  get hasMore() {
    if (!this.data) return false;
    return this.data.data.length < this.data.count;
  }

  get isLoading() {
    return this.isInitialLoading || this.isFilterLoading;
  }

  setFilters = async (newFilters: TasksFilters) => {
    const isFilterChange = JSON.stringify(this.filters) !== JSON.stringify({ ...this.filters, ...newFilters, skip: 0 });

    this.filters = { ...this.filters, ...newFilters, skip: 0 };

    if (isFilterChange) {
      await this.fetchTasks(false);
    }
  };

  resetFilters = () => {
    this.filters = {
      tasks_type: this.filters.tasks_type,
      search: '',
      sort_by: SortByEnum.ID,
      sort_order: SortOrderEnum.ASC,
      skip: 0,
      limit: 10,
    };
    this.fetchTasks(false);
  };

  loadMore = async () => {
    if (this.loadingMore || !this.hasMore) return;

    try {
      this.loadingMore = true;
      this.error = null;

      const nextFilters = {
        ...this.filters,
        skip: this.data?.data.length || 0,
      };

      const result = await taskAPI.getTasks(nextFilters);

      runInAction(() => {
        if (this.data && result.data) {
          this.data.data.push(...result.data);
        }
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Не удалось загрузить задачи';
      });
    } finally {
      runInAction(() => {
        this.loadingMore = false;
      });
    }
  };

  async fetchTasks(isInitial = true): Promise<void> {
    try {
      if (isInitial || this.isFirstLoad) {
        this.isInitialLoading = true;
        this.isFilterLoading = false;
      } else {
        this.isFilterLoading = true;
        this.isInitialLoading = false;
      }

      this.error = null;

      const result = await taskAPI.getTasks(this.filters);

      runInAction(() => {
        this.data = result;
        this.isFirstLoad = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Не удалось получить задачи';
      });
    } finally {
      runInAction(() => {
        this.isInitialLoading = false;
        this.isFilterLoading = false;
      });
    }
  }
}

export const tasksStore = new TasksStore();
