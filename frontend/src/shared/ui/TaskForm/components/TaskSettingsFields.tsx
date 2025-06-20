import { TaskCreateForm } from '@shared/types/task';
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

const TaskSettingsFields: FC<Props> = ({
  formData,
  onFormDataChange,
  getFieldError,
  hasError,
  className,
}) => {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      <div>
        <label htmlFor="time-limit" className="block text-sm font-medium text-strong mb-2">
          Лимит времени (сек) *
        </label>
        <input
          id="time-limit"
          type="number"
          required
          min={1}
          max={60}
          value={formData.time_limit_seconds}
          onChange={(e) => onFormDataChange({ time_limit_seconds: parseInt(e.target.value) })}
          className={cn(
            'w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-surface-accent focus:border-transparent text-strong bg-canvas transition-colors',
            hasError('time_limit_seconds') ? 'border-error focus:ring-error' : 'border-surface'
          )}
        />
        {hasError('time_limit_seconds') && (
          <p className="mt-1 text-xs text-error">{getFieldError('time_limit_seconds')}</p>
        )}
      </div>

      <div>
        <label htmlFor="memory-limit" className="block text-sm font-medium text-strong mb-2">
          Лимит памяти (МБ) *
        </label>
        <input
          id="memory-limit"
          type="number"
          required
          min={1}
          max={1024}
          value={formData.memory_limit_megabytes}
          onChange={(e) => onFormDataChange({ memory_limit_megabytes: parseInt(e.target.value) })}
          className={cn(
            'w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-surface-accent focus:border-transparent text-strong bg-canvas transition-colors',
            hasError('memory_limit_megabytes') ? 'border-error focus:ring-error' : 'border-surface'
          )}
        />
        {hasError('memory_limit_megabytes') && (
          <p className="mt-1 text-xs text-error">{getFieldError('memory_limit_megabytes')}</p>
        )}
      </div>
    </div>
  );
};

export default TaskSettingsFields;
