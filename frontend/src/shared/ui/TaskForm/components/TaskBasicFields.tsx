import { TaskEditor } from '@features/task-editor';
import { DifficultyEnum, TaskCreateForm } from '@shared/types/task';
import { default as cn } from 'classnames';
import { FC } from 'react';

import type { TaskFormData } from '../TaskForm';



interface Props {
  formData: TaskFormData;
  onFormDataChange: (updates: Partial<TaskCreateForm>) => void;
  getFieldError: (fieldName: string) => string | undefined;
  hasError: (fieldName: string) => boolean;
  className?: string;
}

const TaskBasicFields: FC<Props> = ({
  formData,
  onFormDataChange,
  getFieldError,
  hasError,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-strong mb-2">
          Название задачи *
        </label>
        <input
          id="title"
          type="text"
          maxLength={255}
          value={formData.title}
          onChange={(e) => onFormDataChange({ title: e.target.value })}
          className={cn(
            'w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-surface-accent focus:border-transparent text-strong bg-canvas transition-colors',
            hasError('title') ? 'border-error focus:ring-error' : 'border-surface'
          )}
          placeholder="Введите название задачи"
        />
        {hasError('title') && (
          <p className="mt-1 text-xs text-error">{getFieldError('title')}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-strong mb-2">
          Описание *
        </label>
        <TaskEditor
          placeholder="Введите описание задачи..."
          onContentChange={(description) => onFormDataChange({ description })}
          initialContent={formData.description}
        />
        {hasError('description') && (
          <p className="mt-1 text-xs text-error">{getFieldError('description')}</p>
        )}
      </div>

      <div>
        <label htmlFor="difficulty" className="block text-sm font-medium text-strong mb-2">
          Сложность *
        </label>
        <select
          id="difficulty"
          required
          value={formData.difficulty}
          onChange={(e) => onFormDataChange({ difficulty: e.target.value as DifficultyEnum })}
          className={cn(
            'w-full p-3 border rounded-md focus:ring-2 focus:ring-surface-accent focus:border-transparent text-strong bg-canvas transition-colors',
            hasError('difficulty') ? 'border-error focus:ring-error' : 'border-surface'
          )}
        >
          <option value={DifficultyEnum.EASY}>Легкая</option>
          <option value={DifficultyEnum.MEDIUM}>Средняя</option>
          <option value={DifficultyEnum.HARD}>Сложная</option>
        </select>
        {hasError('difficulty') && (
          <p className="mt-1 text-xs text-error">{getFieldError('difficulty')}</p>
        )}
      </div>
    </div>
  );
};

export default TaskBasicFields;
