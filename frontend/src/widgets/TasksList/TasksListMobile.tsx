import { TaskPublicForList } from '@shared/types/task';
import { default as cn } from 'classnames';
import React, { FC } from 'react';

import TaskCard from './TaskCard';

interface Props {
  tasks: TaskPublicForList[];
  showStatus: boolean;
  showPersonal: boolean;
  isFilterLoading: boolean;
  loadingMore: boolean;
}

const TasksListMobile: FC<Props> = ({
  tasks,
  showStatus,
  showPersonal,
  isFilterLoading,
  loadingMore,
}) => {
  return (
    <>
      <div className={cn(
        'space-y-3 transition-opacity duration-200',
        isFilterLoading && 'opacity-50'
      )}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            showStatus={showStatus}
            showPersonal={showPersonal}
          />
        ))}
      </div>

      {loadingMore && (
        <div className="justify-center flex mt-6">
          <div className="flex items-center gap-2 py-3 px-6 bg-surface rounded-md border border-[var(--border-color-surface)]">
            <div className="w-4 h-4 border-2 border-[var(--color-strong)] border-t-transparent rounded-full animate-spin" />
            <span className="text-[var(--color-medium)] font-medium">Загрузка новых задач...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default TasksListMobile;
