import { AttemptPublic, AttemptStatus } from '@shared/types/attempt';
import { FC } from 'react';

interface Props {
  attempt: AttemptPublic;
}

const AttemptResultsSection: FC<Props> = ({ attempt }) => {
  const formatMemory = (bytes: number) => {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms} мс`;
    return `${(ms / 1000).toFixed(2)} сек`;
  };

  return (
    <div className="bg-elevated rounded-xl">
      <div className="p-4 border-b border-surface">
        <h3 className="text-lg font-medium text-strong">Результаты выполнения</h3>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface rounded-lg p-3">
            <div className="text-sm text-subtle mb-1">Время выполнения</div>
            <div className="text-lg font-medium text-strong">
              {formatTime(attempt.time_used_ms)}
            </div>
          </div>

          <div className="bg-surface rounded-lg p-3">
            <div className="text-sm text-subtle mb-1">Использовано памяти</div>
            <div className="text-lg font-medium text-strong">
              {formatMemory(attempt.memory_used_bytes)}
            </div>
          </div>
        </div>

        {attempt.failed_test_number !== null && attempt.status !== AttemptStatus.OK && (
          <div className="bg-surface rounded-lg p-3">
            <div className="text-sm text-subtle mb-1">Провалившийся тест</div>
            <div className="text-lg font-medium text-error">
              Тест #{attempt.failed_test_number}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttemptResultsSection;
