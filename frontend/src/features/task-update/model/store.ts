import { taskAPI } from '@entities/task';
import { Task, TaskUpdate, TaskUpdateForm } from '@shared/types/task';
import { makeAutoObservable, runInAction } from 'mobx';

interface ApiError {
  response?: {
    status: number;
    data?: {
      detail?: string;
      message?: string;
    };
  };
  message: string;
}

interface TagUpdateError {
  tagId: number;
  error: string;
}

class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class TaskUpdateStore {
  isLoading = false;
  isLoadingTask = false;
  isLoadingTags = false;
  error: string | null = null;
  fieldErrors: Record<string, string> = {};
  currentTask: Task | null = null;
  currentTaskTags: any[] = [];
  tagErrors: TagUpdateError[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  clearError() {
    this.error = null;
    this.fieldErrors = {};
    this.tagErrors = [];
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof ValidationError) {
      return error.message;
    }

    if (error instanceof Error && !('response' in error)) {
      return error.message;
    }

    const apiError = error as ApiError;

    if (!apiError.response) {
      return 'Ошибка подключения к серверу';
    }

    const { status, data } = apiError.response;

    if (status === 400) {
      return data?.detail || data?.message || 'Некорректные данные формы';
    }

    if (status === 403) {
      return 'Недостаточно прав для редактирования задачи';
    }

    if (status === 404) {
      return 'Задача не найдена';
    }

    if (status >= 500) {
      return 'Внутренняя ошибка сервера. Попробуйте позже';
    }

    return data?.detail || data?.message || apiError.message || 'Не удалось обновить задачу';
  }

  private handleValidationError(error: unknown): boolean {
    const apiError = error as ApiError;

    if (apiError.response?.status === 422 && apiError.response.data) {
      const validationData = apiError.response.data as any;

      if (validationData.detail && Array.isArray(validationData.detail)) {
        const fieldErrors: Record<string, string> = {};

        validationData.detail.forEach((err: any) => {
          if (err.loc && err.msg) {
            const field = err.loc[err.loc.length - 1];
            fieldErrors[field] = err.msg;
          }
        });

        runInAction(() => {
          this.fieldErrors = fieldErrors;
        });

        return Object.keys(fieldErrors).length > 0;
      }
    }

    return false;
  }

  async fetchTask(taskId: number): Promise<Task | null> {
    try {
      runInAction(() => {
        this.isLoadingTask = true;
        this.error = null;
      });

      const task = await taskAPI.getTaskById(taskId);

      runInAction(() => {
        this.currentTask = task;
      });

      return task;
    } catch (error) {
      runInAction(() => {
        this.error = this.getErrorMessage(error);
      });

      return null;
    } finally {
      runInAction(() => {
        this.isLoadingTask = false;
      });
    }
  }

  async fetchTaskTags(taskId: number): Promise<number[]> {
    try {
      runInAction(() => {
        this.isLoadingTags = true;
      });

      const tags = await taskAPI.getTaskTags(taskId);
      const tagIds = tags.map(tag => tag.id);

      runInAction(() => {
        this.currentTaskTags = tags;
        this.isLoadingTags = false;
      });

      return tagIds;
    } catch (error) {
      runInAction(() => {
        this.error = this.getErrorMessage(error);
        this.isLoadingTags = false;
      });

      return [];
    }
  }

  async updateTask(formData: TaskUpdateForm): Promise<boolean> {
    try {
      runInAction(() => {
        this.isLoading = true;
        this.error = null;
        this.fieldErrors = {};
        this.tagErrors = [];
      });

      if (formData.title !== undefined && !formData.title.trim()) {
        throw new ValidationError('Название задачи не может быть пустым', 'title');
      }

      if (formData.description !== undefined && !formData.description.trim()) {
        throw new ValidationError('Описание задачи не может быть пустым', 'description');
      }

      if (formData.tests !== undefined && formData.tests.length === 0) {
        throw new ValidationError('Необходимо добавить хотя бы один тест', 'tests');
      }

      if (formData.tests) {
        const invalidTestIndex = formData.tests.findIndex(
          test => !Array.isArray(test.inputs) || !Array.isArray(test.outputs) ||
                  test.inputs.length === 0 || test.outputs.length === 0
        );
        if (invalidTestIndex !== -1) {
          throw new ValidationError(
            `У теста №${invalidTestIndex + 1} должны быть заполнены входные и выходные данные`,
            'tests'
          );
        }
      }

      const tests = formData.tests?.map(test => [test.inputs, test.outputs]);

      const taskData: TaskUpdate = {
        title: formData.title?.trim(),
        description: formData.description?.trim(),
        difficulty: formData.difficulty,
        time_limit_seconds: formData.time_limit_seconds,
        memory_limit_megabytes: formData.memory_limit_megabytes,
        tests,
        is_public: formData.is_public,
      };

      Object.keys(taskData).forEach(key => {
        if (taskData[key as keyof TaskUpdate] === undefined) {
          delete taskData[key as keyof TaskUpdate];
        }
      });

      const updatedTask = await taskAPI.updateTask(formData.id, taskData);

      runInAction(() => {
        this.currentTask = updatedTask;
      });

      if (formData.tag_ids !== undefined) {
        try {
          const tagResult = await taskAPI.updateTaskTags(formData.id, formData.tag_ids);

          runInAction(() => {
            this.tagErrors = tagResult.errors;

            if (tagResult.errors.length > 0) {
              const failedTagsCount = tagResult.errors.length;
              const successfulTagsCount = tagResult.successfulTags.length;

              if (successfulTagsCount > 0) {
                this.error = `Задача обновлена. ${successfulTagsCount} тег(ов) обновлено успешно, ${failedTagsCount} тег(ов) с ошибками.`;
              } else {
                this.error = 'Задача обновлена, но не удалось обновить теги.';
              }
            }
          });
        } catch (error) {
          runInAction(() => {
            this.error = `Задача обновлена, но возникла ошибка при обновлении тегов: ${this.getErrorMessage(error)}`;
          });
        }
      }

      return true;
    } catch (error) {
      runInAction(() => {
        if (error instanceof ValidationError) {
          if (error.field) {
            this.fieldErrors[error.field] = error.message;
          } else {
            this.error = error.message;
          }
          return;
        }

        if (!this.handleValidationError(error)) {
          this.error = this.getErrorMessage(error);
        }
      });

      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async retryUpdateTask(formData: TaskUpdateForm): Promise<boolean> {
    this.clearError();
    return this.updateTask(formData);
  }

  get hasFieldErrors(): boolean {
    return Object.keys(this.fieldErrors).length > 0;
  }

  get hasTagErrors(): boolean {
    return this.tagErrors.length > 0;
  }

  getFieldError(field: string): string | undefined {
    return this.fieldErrors[field];
  }

  getTagErrorsText(): string {
    if (this.tagErrors.length === 0) return '';

    return this.tagErrors
      .map(err => `Тег ID ${err.tagId}: ${err.error}`)
      .join('\n');
  }

  reset() {
    this.isLoading = false;
    this.isLoadingTask = false;
    this.isLoadingTags = false;
    this.error = null;
    this.fieldErrors = {};
    this.tagErrors = [];
    this.currentTask = null;
    this.currentTaskTags = [];
  }
}

export const taskUpdateStore = new TaskUpdateStore();
