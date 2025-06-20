import { formatMemory, formatTime } from '@shared/lib/formaters';
import { NavigationHelpers } from '@shared/lib/routes';
import { AttemptForListPublic, AttemptStatus } from '@shared/types/attempt';
import Pagination from '@shared/ui/Pagination';
import { FC } from 'react';
import { Link } from 'react-router-dom';

import AttemptsTableSkeleton from './AttemptsTableSkeleton';

interface AttemptsTableProps {
  attempts: AttemptForListPublic[];
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

const AttemptsTable: FC<AttemptsTableProps> = ({
  attempts,
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  isLoading = false,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getStatusColor = (status: AttemptStatus) => {
    switch (status) {
      case AttemptStatus.OK:
        return 'text-success';
      case AttemptStatus.RUNNING:
        return 'text-brand';
      case AttemptStatus.COMPILATION_ERROR:
      case AttemptStatus.RUNTIME_ERROR:
      case AttemptStatus.TIME_LIMIT_EXCEEDED:
      case AttemptStatus.MEMORY_LIMIT_EXCEEDED:
      case AttemptStatus.OUTPUT_LIMIT_EXCEEDED:
      case AttemptStatus.WRONG_ANSWER:
        return 'text-error';
      default:
        return 'text-strong';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
      }),
      time: date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  if (isLoading) {
    return <AttemptsTableSkeleton rowsCount={itemsPerPage} />;
  }

  if (attempts.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8 text-subtle">
        <p className="text-sm sm:text-base">Пока нет ни одной попытки решения</p>
      </div>
    );
  }

  return (
    <div>
      <div className="block md:hidden space-y-3">
        {attempts.map(attempt => {
          const { date, time } = formatDate(attempt.created_at);
          return (
            <div key={attempt.id} className="bg-surface border border-surface rounded-lg p-4 hover:bg-surface-hover transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-strong">
                    {date} {time}
                  </div>
                  <div className="text-xs text-medium">
                    {attempt.programming_language}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(attempt.status)} bg-surface`}>
                  {attempt.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <div className="text-xs text-subtle">Время</div>
                  <div className="text-strong">{formatTime(attempt.time_used_ms)}</div>
                </div>
                <div>
                  <div className="text-xs text-subtle">Память</div>
                  <div className="text-strong">{formatMemory(attempt.memory_used_bytes)}</div>
                </div>
                <div>
                  <div className="text-xs text-subtle">Тест</div>
                  <div className="text-strong">{attempt.failed_test_number || '-'}</div>
                </div>
                <div className="flex items-end">
                  <Link
                    to={NavigationHelpers.getAttemptUrl(attempt.id)}
                    className="text-brand hover:text-brand-hover transition-colors text-sm font-medium"
                  >
                    Подробнее →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-surface">
              <th className="p-3 text-left text-subtle text-sm font-medium">Время</th>
              <th className="p-3 text-left text-subtle text-sm font-medium">Язык</th>
              <th className="p-3 text-left text-subtle text-sm font-medium">Статус</th>
              <th className="p-3 text-left text-subtle text-sm font-medium">Время</th>
              <th className="p-3 text-left text-subtle text-sm font-medium">Память</th>
              <th className="p-3 text-left text-subtle text-sm font-medium">Тест</th>
              <th className="p-3 text-left text-subtle text-sm font-medium">Подробнее</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map(attempt => (
              <tr key={attempt.id} className="border-b border-surface hover:bg-surface-hover transition-colors">
                <td className="p-3 text-strong text-sm">
                  {new Date(attempt.created_at).toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="p-3 text-strong text-sm">{attempt.programming_language}</td>
                <td className={`p-3 text-sm font-medium ${getStatusColor(attempt.status)}`}>
                  {attempt.status}
                </td>
                <td className="p-3 text-strong text-sm">{formatTime(attempt.time_used_ms)}</td>
                <td className="p-3 text-strong text-sm">
                  {formatMemory(attempt.memory_used_bytes)}
                </td>
                <td className="p-3 text-strong text-sm">
                  {attempt.failed_test_number || '-'}
                </td>
                <td className="p-3">
                  <Link
                    to={NavigationHelpers.getAttemptUrl(attempt.id)}
                    className="text-brand hover:text-brand-hover transition-colors text-sm font-medium"
                  >
                    Подробнее
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 sm:mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default AttemptsTable;
