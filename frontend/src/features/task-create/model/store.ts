import { taskAPI } from '@entities/task';
import { TaskCreate, TaskCreateForm } from '@shared/types/task';
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

class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class TaskCreateStore {
  isLoading = false;
  error: string | null = null;
  fieldErrors: Record<string, string> = {};

  constructor() {
    makeAutoObservable(this);
  }

  clearError() {
    this.error = null;
    this.fieldErrors = {};
  }

  private getErrorMessage(error: unknown): string {
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
      return 'Недостаточно прав для создания задачи';
    }

    if (status >= 500) {
      return 'Внутренняя ошибка сервера. Попробуйте позже';
    }

    return data?.detail || data?.message || apiError.message || 'Не удалось создать задачу';
  }

  private handleValidationError(error: unknown) {
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

  async createTask(formData: TaskCreateForm): Promise<number | null> {
    try {
      runInAction(() => {
        this.isLoading = true;
        this.error = null;
        this.fieldErrors = {};
      });

      if (!formData.title.trim()) {
        throw new ValidationError('Название задачи не может быть пустым', 'title');
      }

      if (!formData.description.trim()) {
        throw new ValidationError('Описание задачи не может быть пустым', 'description');
      }

      if (formData.tests.length === 0) {
        throw new ValidationError('Необходимо добавить хотя бы один тест', 'tests');
      }

      const invalidTestIndex = formData.tests.findIndex(
        (test) =>
          !Array.isArray(test.inputs) ||
    !Array.isArray(test.outputs) ||
    test.inputs.length === 0 ||
    test.outputs.length === 0
      );

      if (invalidTestIndex !== -1) {
        throw new ValidationError(
          `У теста №${invalidTestIndex + 1} должны быть заполнены входные и выходные данные`, 'tests'
        );
      }

      const tests = formData.tests.map(test => [test.inputs, test.outputs]);

      const taskData: TaskCreate = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        difficulty: formData.difficulty,
        time_limit_seconds: formData.time_limit_seconds,
        memory_limit_megabytes: formData.memory_limit_megabytes,
        tests,
        is_public: formData.is_public,
      };

      const createdTask = await taskAPI.createTask(taskData);

      const tagErrors: string[] = [];

      for (const tagId of formData.tag_ids) {
        try {
          await taskAPI.addTagToTask(createdTask.id, tagId);
        } catch {
          tagErrors.push(`Не удалось добавить тег с ID ${tagId}`);
        }
      }

      if (tagErrors.length > 0) {
        runInAction(() => {
          this.error = `Задача создана, но возникли ошибки с тегами: ${tagErrors.join(', ')}`;
        });
      }

      return createdTask.id;
    } catch (error) {
      runInAction(() => {
        if (!this.handleValidationError(error)) {
          this.error = this.getErrorMessage(error);
        }
      });

      return null;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async retryCreateTask(formData: TaskCreateForm): Promise<number | null> {
    this.clearError();
    return this.createTask(formData);
  }

  get hasFieldErrors(): boolean {
    return Object.keys(this.fieldErrors).length > 0;
  }

  getFieldError(field: string): string | undefined {
    return this.fieldErrors[field];
  }
}

export const taskCreateStore = new TaskCreateStore();
