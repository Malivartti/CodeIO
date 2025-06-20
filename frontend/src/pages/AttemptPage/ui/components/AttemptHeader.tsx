import { AttemptPublic, AttemptStatus } from '@shared/types/attempt';
import { AppRoutes } from '@shared/types/routes';
import { Task } from '@shared/types/task';
import { default as cn } from 'classnames';
import { FC } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  attempt: AttemptPublic;
  task?: Task | null;
}

const STATUS_COLORS = {
  [AttemptStatus.RUNNING]: 'text-warning',
  [AttemptStatus.OK]: 'text-success',
  [AttemptStatus.WRONG_ANSWER]: 'text-error',
  [AttemptStatus.COMPILATION_ERROR]: 'text-error',
  [AttemptStatus.RUNTIME_ERROR]: 'text-error',
  [AttemptStatus.TIME_LIMIT_EXCEEDED]: 'text-error',
  [AttemptStatus.MEMORY_LIMIT_EXCEEDED]: 'text-error',
  [AttemptStatus.OUTPUT_LIMIT_EXCEEDED]: 'text-error',
};

const AttemptHeader: FC<Props> = ({ attempt, task }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  return (
    <div className="bg-elevated rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2 text-sm text-subtle mb-2">
            <span>Попытка #{attempt.id}</span>
            <span>•</span>
            <span>{formatDate(attempt.created_at)}</span>
          </div>

          <h1 className="text-2xl font-bold text-strong mb-2">
            {task ? (
              <Link
                to={`${AppRoutes.TASKS}/${attempt.task_id}`}
                className="hover:text-brand transition-colors"
              >
                {task.title}
              </Link>
            ) : (
              `Задача #${attempt.task_id}`
            )}
          </h1>

          <div className="flex items-center space-x-4 text-sm">
            <span className="bg-surface px-2 py-1 rounded text-medium">
              {attempt.programming_language}
            </span>
            <span className={cn('font-medium px-2 py-1 rounded', STATUS_COLORS[attempt.status])}>
              {attempt.status}
            </span>
          </div>
        </div>

        <Link
          to={task ? `${AppRoutes.TASKS}/${attempt.task_id}` : AppRoutes.TASKS}
          className="text-brand hover:text-brand-hover transition-colors text-sm"
        >
          Назад к задаче
        </Link>
      </div>
    </div>
  );
};

export default AttemptHeader;
