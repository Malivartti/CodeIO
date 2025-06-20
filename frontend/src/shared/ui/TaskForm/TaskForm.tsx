import { TaskCreateForm, TaskUpdateForm, TestCase } from '@shared/types/task';
import { default as cn } from 'classnames';
import React, { FC } from 'react';

import TagSelector from './components/TagSelector';
import TaskBasicFields from './components/TaskBasicFields';
import TaskErrorDisplay from './components/TaskErrorDisplay';
import TaskFormActions from './components/TaskFormActions';
import TaskPublicToggle from './components/TaskPublicToggle';
import TaskSettingsFields from './components/TaskSettingsFields';
import TestsSection from './components/TestsSection';

export type TaskFormData = TaskCreateForm | TaskUpdateForm;

interface Props {
  formData: TaskFormData;
  onFormDataChange: (updates: Partial<TaskCreateForm>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  title: string;
  submitText: string;
  cancelText?: string;
  onCancel?: () => void;
  getFieldError: (fieldName: string) => string | undefined;
  hasError: (fieldName: string) => boolean;
  className?: string;
  error?: string | null;
  fieldErrors?: Record<string, string>;
  onClearError?: () => void;
  onRetry?: () => void;
}

const TaskForm: FC<Props> = ({
  formData,
  onFormDataChange,
  onSubmit,
  isLoading,
  title,
  submitText,
  cancelText = 'Отмена',
  onCancel,
  getFieldError,
  hasError,
  className,
  error,
  fieldErrors,
  onClearError,
}) => {
  const handleTagsChange = (tag_ids: number[]) => {
    onFormDataChange({ tag_ids });
  };

  const handleTestsChange = (tests: TestCase[]) => {
    onFormDataChange({ tests });
  };

  return (
    <div className={cn('min-h-screen bg-canvas', className)}>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold text-strong mb-6">{title}</h1>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="bg-surface rounded-lg p-6 space-y-4">
            <TaskBasicFields
              formData={formData}
              onFormDataChange={onFormDataChange}
              getFieldError={getFieldError}
              hasError={hasError}
            />

            <TaskSettingsFields
              formData={formData}
              onFormDataChange={onFormDataChange}
              getFieldError={getFieldError}
              hasError={hasError}
            />

            <TaskPublicToggle
              isPublic={formData.is_public}
              onChange={(is_public) => onFormDataChange({ is_public })}
            />
          </div>

          <div className="bg-surface rounded-lg p-6">
            <TagSelector
              selectedTagIds={formData.tag_ids}
              onTagsChange={handleTagsChange}
            />
            {hasError('tag_ids') && (
              <p className="mt-2 text-xs text-error">{getFieldError('tag_ids')}</p>
            )}
          </div>

          <div className="bg-surface rounded-lg p-6">
            <TestsSection
              tests={formData.tests}
              onTestsChange={handleTestsChange}
            />
            {hasError('tests') && (
              <p className="mt-2 text-xs text-error">{getFieldError('tests')}</p>
            )}
          </div>

          <TaskErrorDisplay
            error={error}
            fieldErrors={fieldErrors}
            onClearError={onClearError}
          />

          <TaskFormActions
            isLoading={isLoading}
            submitText={submitText}
            cancelText={cancelText}
            onCancel={onCancel}
          />
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
