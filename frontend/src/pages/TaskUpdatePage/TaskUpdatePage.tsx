import { taskUpdateStore } from '@features/task-update';
import { AppRoutes } from '@shared/types/routes';
import { DifficultyEnum, TaskUpdateForm } from '@shared/types/task';
import TaskForm from '@shared/ui/TaskForm';
import Container from '@widgets/Container';
import { observer } from 'mobx-react-lite';
import React, { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const TaskUpdatePage: FC = observer(() => {
  const navigate = useNavigate();
  const { id: taskId } = useParams<{ id: string }>();
  const [isInitialized, setIsInitialized] = useState(false);

  const [formData, setFormData] = useState<TaskUpdateForm>({
    id: 0,
    title: '',
    description: '',
    difficulty: DifficultyEnum.EASY,
    time_limit_seconds: 1,
    memory_limit_megabytes: 128,
    tests: [],
    is_public: false,
    tag_ids: [],
  });

  useEffect(() => {
    const loadTask = async () => {
      if (!taskId) return;

      const taskIdNum = parseInt(taskId);

      const [task, tagIds] = await Promise.all([
        taskUpdateStore.fetchTask(taskIdNum),
        taskUpdateStore.fetchTaskTags(taskIdNum),
      ]);

      if (task) {
        setFormData({
          id: task.id,
          title: task.title,
          description: task.description,
          difficulty: task.difficulty,
          time_limit_seconds: task.time_limit_seconds,
          memory_limit_megabytes: task.memory_limit_megabytes,
          tests: task.tests || [],
          is_public: task.is_public,
          tag_ids: tagIds,
        });
        setIsInitialized(true);
      }
    };

    loadTask();
    return () => taskUpdateStore.reset();
  }, [taskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    taskUpdateStore.clearError();
    const success = await taskUpdateStore.updateTask(formData);
    if (success) {
      navigate(AppRoutes.TASKS);
    }
  };

  const updateFormData = (updates: Partial<TaskUpdateForm>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    if (taskUpdateStore.error || taskUpdateStore.hasFieldErrors) {
      taskUpdateStore.clearError();
    }
  };

  const getFieldError = (fieldName: string) => taskUpdateStore.getFieldError(fieldName);
  const hasError = (fieldName: string) => !!taskUpdateStore.getFieldError(fieldName);

  if (taskUpdateStore.isLoadingTask || taskUpdateStore.isLoadingTags) {
    return (
      <Container>
        <div className="text-center text-subtle py-8">
          {taskUpdateStore.isLoadingTask ? 'Загрузка задачи...' : 'Загрузка тегов...'}
        </div>
      </Container>
    );
  }

  if (!isInitialized) {
    return (
      <Container>
        <div className="text-center text-error py-8">
          {taskUpdateStore.error || 'Задача не найдена или произошла ошибка загрузки'}
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <TaskForm
        formData={formData}
        onFormDataChange={updateFormData}
        onSubmit={handleSubmit}
        isLoading={taskUpdateStore.isLoading}
        title="Редактирование задачи"
        submitText="Сохранить изменения"
        onCancel={() => navigate(AppRoutes.TASKS)}
        getFieldError={getFieldError}
        hasError={hasError}
        error={taskUpdateStore.error}
        fieldErrors={taskUpdateStore.fieldErrors}
        onClearError={() => taskUpdateStore.clearError()}
        onRetry={() => taskUpdateStore.retryUpdateTask(formData)}
      />
    </Container>
  );
});

export default TaskUpdatePage;
