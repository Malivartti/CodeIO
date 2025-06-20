import { taskCreateStore } from '@features/task-create';
import { DifficultyEnum, TaskCreateForm } from '@shared/types/task';
import TaskForm from '@shared/ui/TaskForm';
import Container from '@widgets/Container';
import { observer } from 'mobx-react-lite';
import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TaskCreatePage: FC = observer(() => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<TaskCreateForm>({
    title: '',
    description: '',
    difficulty: DifficultyEnum.EASY,
    time_limit_seconds: 1,
    memory_limit_megabytes: 128,
    tests: [],
    is_public: false,
    tag_ids: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    taskCreateStore.clearError();
    const taskId = await taskCreateStore.createTask(formData);
    if (taskId) {
      navigate(`/tasks/${taskId}`);
    }
  };

  const updateFormData = (updates: Partial<TaskCreateForm>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    if (taskCreateStore.error || taskCreateStore.hasFieldErrors) {
      taskCreateStore.clearError();
    }
  };

  const getFieldError = (fieldName: string) => taskCreateStore.getFieldError(fieldName);
  const hasError = (fieldName: string) => !!taskCreateStore.getFieldError(fieldName);

  return (
    <Container>
      <TaskForm
        formData={formData}
        onFormDataChange={updateFormData}
        onSubmit={handleSubmit}
        isLoading={taskCreateStore.isLoading}
        title="Создание задачи"
        submitText="Создать задачу"
        onCancel={() => navigate('/tasks')}
        getFieldError={getFieldError}
        hasError={hasError}
        error={taskCreateStore.error}
        fieldErrors={taskCreateStore.fieldErrors}
        onClearError={() => taskCreateStore.clearError()}
        onRetry={() => taskCreateStore.retryCreateTask(formData)}
      />
    </Container>
  );
});

export default TaskCreatePage;
