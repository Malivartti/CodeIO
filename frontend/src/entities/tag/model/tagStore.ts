import { TagPublic } from '@shared/types/tag';
import { makeAutoObservable, runInAction } from 'mobx';

import { tagAPI } from '../api/tag';

class TagStore {
  data: TagPublic[] = [];
  IsLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get filteredTags() {
    return (search: string) => {
      if (!search.trim()) return this.data;
      return this.data.filter(tag =>
        tag.name.toLowerCase().includes(search.toLowerCase())
      );
    };
  }

  fetchTags = async () => {
    if (this.IsLoading) return;

    try {
      this.IsLoading = true;
      this.error = null;
      const result = await tagAPI.getTags();
      runInAction(() => {
        this.data = result.data;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Не удалось получить теги';
      });
    } finally {
      runInAction(() => {
        this.IsLoading = false;
      });
    }
  };
}

export const tagStore = new TagStore();
