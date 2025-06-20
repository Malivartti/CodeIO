import { tasksStore } from '@entities/task';
import TasksSearchAndFilters from '@features/tasks-search';
import { TasksType } from '@shared/types/task';
import TasksList from '@widgets/TasksList';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';

interface TasksContentProps {
  activeTab: TasksType;
  isAuth: boolean;
}

const TasksContent: FC<TasksContentProps> = observer(({ activeTab, isAuth }) => {
  const handleFiltersChange = (filters: any) => {
    const updatedFilters = {
      ...filters,
      tasks_type: activeTab,
    };
    tasksStore.setFilters(updatedFilters);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      tasks_type: activeTab,
    };
    tasksStore.resetFilters();
    tasksStore.setFilters(defaultFilters);
  };

  return (
    <>
      <TasksSearchAndFilters
        filters={tasksStore.filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
        showStatusFilter={isAuth}
      />

      {tasksStore.data && !tasksStore.isInitialLoading && (
        <div className="text-sm text-subtle">
          Найдено задач: {tasksStore.data.count}
        </div>
      )}

      {tasksStore.error && (
        <div className="text-error text-sm">
          Ошибка загрузки: {tasksStore.error}
        </div>
      )}

      <TasksList
        tasks={tasksStore.data?.data || []}
        showStatus={isAuth}
        showPersonal={activeTab == TasksType.PERSONAL}
        showSkeleton={tasksStore.isInitialLoading}
        isFilterLoading={tasksStore.isFilterLoading}
        loadingMore={tasksStore.loadingMore}
      />
    </>
  );
});

export default TasksContent;
