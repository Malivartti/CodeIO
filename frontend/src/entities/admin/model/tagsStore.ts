import { TagPublic } from '@shared/types/tag';
import { makeAutoObservable, runInAction } from 'mobx';

import { adminAPI } from '../api/adminApi';

class TagsStore {
  tags: TagPublic[] = [];
  totalTags = 0;
  currentPage = 1;
  itemsPerPage = 50;
  isLoading = false;
  isCreating = false;
  isUpdating = false;
  isDeleting = false;
  error: string | null = null;
  searchQuery = '';
  editingTagId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setSearchQuery(query: string): void {
    this.searchQuery = query;
    this.currentPage = 1;
  }

  setEditingTagId(tagId: number | null): void {
    this.editingTagId = tagId;
  }

  clearError(): void {
    this.error = null;
  }

  async loadTags(page: number = this.currentPage): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const skip = (page - 1) * this.itemsPerPage;
      const response = await adminAPI.getTags(skip, this.itemsPerPage);

      runInAction(() => {
        this.tags = response.data;
        this.totalTags = response.count;
        this.currentPage = page;
        this.isLoading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.detail || 'Ошибка при загрузке тегов';
        this.isLoading = false;
      });
    }
  }

  async createTag(name: string): Promise<boolean> {
    this.isCreating = true;
    this.error = null;

    try {
      const newTag = await adminAPI.createTag({ name: name.trim() });
      runInAction(() => {
        this.tags.unshift(newTag);
        this.totalTags += 1;
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

  async updateTag(tagId: number, name: string): Promise<boolean> {
    this.isUpdating = true;
    this.error = null;

    try {
      const updatedTag = await adminAPI.updateTag(tagId, { name: name.trim() });
      runInAction(() => {
        const index = this.tags.findIndex(tag => tag.id === tagId);
        if (index !== -1) {
          this.tags[index] = updatedTag;
        }
        this.editingTagId = null;
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

  async deleteTag(tagId: number): Promise<boolean> {
    this.isDeleting = true;
    this.error = null;

    try {
      await adminAPI.deleteTag(tagId);
      runInAction(() => {
        this.tags = this.tags.filter(tag => tag.id !== tagId);
        this.totalTags -= 1;
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

  private getErrorMessage(error: any): string {
    if (error.response?.status === 409) {
      return 'Тег с таким названием уже существует';
    }
    if (error.response?.status === 404) {
      return 'Тег не найден';
    }
    if (error.response?.status === 400) {
      const detail = error.response?.data?.detail;
      if (typeof detail === 'string') {
        return detail;
      }
      if (Array.isArray(detail)) {
        return detail.map(err => err.msg || err.message).join(', ');
      }
    }
    return error.response?.data?.detail || 'Произошла ошибка';
  }

  get filteredTags(): TagPublic[] {
    if (!this.searchQuery) return this.tags;

    const query = this.searchQuery.toLowerCase();
    return this.tags.filter(tag =>
      tag.name.toLowerCase().includes(query)
    );
  }

  get totalPages(): number {
    return Math.ceil(this.totalTags / this.itemsPerPage);
  }

  reset(): void {
    this.tags = [];
    this.totalTags = 0;
    this.currentPage = 1;
    this.isLoading = false;
    this.isCreating = false;
    this.isUpdating = false;
    this.isDeleting = false;
    this.error = null;
    this.searchQuery = '';
    this.editingTagId = null;
  }
}

export const tagsStore = new TagsStore();
