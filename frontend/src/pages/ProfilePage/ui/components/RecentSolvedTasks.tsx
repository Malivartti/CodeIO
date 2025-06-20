import { NavigationHelpers } from '@shared/lib/routes';
import { RecentSolvedTask } from '@shared/types/userStats';
import { FC } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  tasks: RecentSolvedTask[];
}

const RecentSolvedTasks: FC<Props> = ({ tasks }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Сегодня';
    if (diffInDays === 1) return 'Вчера';
    if (diffInDays < 7) return `${diffInDays} дн. назад`;

    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="bg-surface border border-surface rounded-xl p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-strong">Последние решенные задачи</h3>
        {tasks.length > 0 && (
          <Link
            to="/tasks"
            className="text-sm text-brand hover:text-brand-hover transition-colors"
          >
            Все задачи
          </Link>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-subtle">Пока нет решенных задач</p>
          <Link
            to="/tasks"
            className="inline-block mt-3 px-4 py-2 bg-brand hover:bg-brand-hover text-inverse rounded-md font-medium transition-colors"
          >
            Начать решать
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 bg-canvas border border-surface rounded-lg hover:bg-surface-hover active:bg-surface-active transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  <span className="text-sm text-subtle">#{task.id}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    to={NavigationHelpers.getTaskUrl(task.id)}
                    className="text-strong font-medium hover:text-brand transition-colors group-hover:text-brand truncate block"
                  >
                    {task.title}
                  </Link>
                </div>
              </div>

              <div className="flex-shrink-0 ml-3">
                <span className="text-sm text-subtle">
                  {formatDate(task.solved_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentSolvedTasks;
