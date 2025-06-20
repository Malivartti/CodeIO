import { TaskPublicForList } from '@shared/types/task';
import { default as cn } from 'classnames';
import { FC } from 'react';

import TasksListDesktop from './TasksListDesktop';
import TasksListMobile from './TasksListMobile';
import TasksListSkeleton from './TasksListSkeleton';

interface Props {
  className?: string;
  tasks: TaskPublicForList[];
  showStatus?: boolean;
  showPersonal?: boolean;
  showSkeleton?: boolean;
  isFilterLoading?: boolean;
  loadingMore?: boolean;
}

const TasksList: FC<Props> = ({
  className,
  tasks,
  showStatus = false,
  showPersonal = false,
  showSkeleton = false,
  isFilterLoading = false,
  loadingMore = false,
}) => {
  if (showSkeleton) {
    return (
      <TasksListSkeleton
        className={className}
        showStatus={showStatus}
        rowsCount={10}
      />
    );
  }

  if (tasks.length === 0) {
    return (
      <div className={cn('flex justify-center py-8', className)}>
        <div className="text-medium">
          {showPersonal ? 'У вас пока нет задач' : 'Задачи не найдены'}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="block md:hidden">
        <TasksListMobile
          tasks={tasks}
          showStatus={showStatus}
          showPersonal={showPersonal}
          isFilterLoading={isFilterLoading}
          loadingMore={loadingMore}
        />
      </div>

      <div className="hidden md:block">
        <TasksListDesktop
          tasks={tasks}
          showStatus={showStatus}
          showPersonal={showPersonal}
          isFilterLoading={isFilterLoading}
          loadingMore={loadingMore}
        />
      </div>
    </div>
  );
};

export default TasksList;
