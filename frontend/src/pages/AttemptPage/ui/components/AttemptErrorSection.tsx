import { AttemptStatus } from '@shared/types/attempt';
import { FC } from 'react';

interface Props {
  errorTraceback: string;
  status: AttemptStatus;
}

const AttemptErrorSection: FC<Props> = ({ errorTraceback, status }) => {
  const getErrorTitle = () => {
    switch (status) {
      case AttemptStatus.COMPILATION_ERROR:
        return 'Ошибка компиляции';
      case AttemptStatus.RUNTIME_ERROR:
        return 'Ошибка времени выполнения';
      case AttemptStatus.TIME_LIMIT_EXCEEDED:
        return 'Превышено время выполнения';
      case AttemptStatus.MEMORY_LIMIT_EXCEEDED:
        return 'Превышен лимит памяти';
      case AttemptStatus.OUTPUT_LIMIT_EXCEEDED:
        return 'Превышен лимит вывода';
      default:
        return 'Ошибка';
    }
  };

  return (
    <div className="bg-elevated rounded-xl">
      <div className="p-4 border-b border-surface">
        <h3 className="text-lg font-medium text-error">{getErrorTitle()}</h3>
      </div>

      <div className="p-4">
        <pre className="bg-surface rounded-lg p-4 text-sm text-strong font-mono overflow-x-auto whitespace-pre-wrap break-words">
          {errorTraceback}
        </pre>
      </div>
    </div>
  );
};

export default AttemptErrorSection;
