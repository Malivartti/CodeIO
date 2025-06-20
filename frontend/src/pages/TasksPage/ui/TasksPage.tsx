import { tagStore } from '@entities/tag';
import { tasksStore } from '@entities/task';
import { authStore } from '@features/auth';
import { useInfiniteScroll } from '@shared/hooks/useInfiniteScroll';
import { TasksType } from '@shared/types/task';
import Container from '@widgets/Container';
import { observer } from 'mobx-react-lite';
import { FC, useEffect, useState } from 'react';

import TasksContent from './components/TasksContent';
import TasksHeader from './components/TasksHeader';
import TasksTabs from './components/TasksTabs';


const TasksPage: FC = observer(() => {
  const [activeTab, setActiveTab] = useState<TasksType>(TasksType.PUBLIC);
  const isAuth = authStore.isAuthenticated;

  const containerRef = useInfiniteScroll({
    loading: tasksStore.loadingMore,
    hasMore: tasksStore.hasMore,
    onLoadMore: tasksStore.loadMore,
    threshold: tasksStore.filters.limit,
  });

  useEffect(() => {
    tasksStore.fetchTasks(true);
    tagStore.fetchTags();
  }, []);

  useEffect(() => {
    const filters = {
      ...tasksStore.filters,
      tasks_type: activeTab,
    };
    tasksStore.setFilters(filters);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-canvas">
      <div
        ref={containerRef}
        className="h-screen overflow-y-auto"
      >
        <Container>
          <div className="space-y-6">
            <TasksHeader
              activeTab={activeTab}
              isAuth={isAuth}
            />

            {isAuth && (
              <TasksTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            )}

            <TasksContent
              activeTab={activeTab}
              isAuth={isAuth}
            />
          </div>
        </Container>
      </div>
    </div>
  );
});

export default TasksPage;
