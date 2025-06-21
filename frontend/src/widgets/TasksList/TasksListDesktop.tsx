import { TaskPublicForList } from '@shared/types/task';
import { default as cn } from 'classnames';
import React, { FC } from 'react';

import TaskRow from './TaskRow';

interface Props {
  tasks: TaskPublicForList[];
  showStatus: boolean;
  showPersonal: boolean;
  isFilterLoading: boolean;
  loadingMore: boolean;
  onDeleteClick: (e: React.MouseEvent, taskId: number, taskTitle: string) => void;
}

const TasksListDesktop: FC<Props> = ({
  tasks,
  showStatus,
  showPersonal,
  isFilterLoading,
  loadingMore,
  onDeleteClick,
}) => {
  return (
    <>
      <div className={cn(
        'rounded-lg border border-surface bg-surface transition-opacity duration-200',
        isFilterLoading && 'opacity-50'
      )}>
        <table className="w-full border-collapse">
          <tbody className="divide-y divide-[var(--border-color-surface)]">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                showStatus={showStatus}
                showPersonal={showPersonal}
                onDeleteClick={onDeleteClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      {loadingMore && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2 py-3 px-6 bg-surface rounded-md border border-[var(--border-color-surface)]">
            <div className="w-4 h-4 border-2 border-[var(--color-strong)] border-t-transparent rounded-full animate-spin" />
            <span className="text-[var(--color-medium)] font-medium">Загрузка новых задач...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default TasksListDesktop;
