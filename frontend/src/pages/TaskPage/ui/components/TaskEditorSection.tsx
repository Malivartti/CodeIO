import { ProgrammingLanguage } from '@shared/types/attempt';
import React from 'react';

import CodeEditor from './CodeEditor';

interface TaskEditorSectionProps {
  taskId: number;
  isAuthorized: boolean;
  selectedLanguage: ProgrammingLanguage;
  onLanguageChange: (lang: ProgrammingLanguage) => void;
  sourceCode: string;
  onSourceCodeChange: (code: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error?: string | null;
  onClearError?: () => void;
}

const TaskEditorSection: React.FC<TaskEditorSectionProps> = ({
  taskId,
  isAuthorized,
  selectedLanguage,
  onLanguageChange,
  sourceCode,
  onSourceCodeChange,
  onSubmit,
  isSubmitting,
  error,
  onClearError,
}) => {
  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 flex flex-col">
      <CodeEditor
        selectedLanguage={selectedLanguage}
        onLanguageChange={onLanguageChange}
        sourceCode={sourceCode}
        onSourceCodeChange={onSourceCodeChange}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        isAuthorized={isAuthorized}
        taskId={taskId}
      />

      {error && (
        <div className="bg-surface border border-error rounded-lg p-3 sm:p-4 flex items-start gap-3 mt-3 sm:mt-4">
          <div className="text-error text-sm flex-1 min-w-0 break-words">{error}</div>
          {onClearError && (
            <button
              type="button"
              onClick={onClearError}
              className="text-subtle hover:text-error transition-colors flex-shrink-0 p-1 -m-1 rounded focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2"
              aria-label="Закрыть ошибку"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskEditorSection;
