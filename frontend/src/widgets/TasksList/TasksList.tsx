import { tasksStore } from '@entities/task';
import { TaskPublicForList } from '@shared/types/task';
import ConfirmModal from '@shared/ui/ConfirmModal';
import { default as cn } from 'classnames';
import React, { FC, useState } from 'react';

import TasksListDesktop from './TasksListDesktop';
import TasksListMobile from './TasksListMobile';
import TasksListSkeleton from './TasksListSkeleton';

interface DeleteModalState {
  isOpen: boolean;
  taskId: number | null;
  taskTitle: string;
}

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
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    taskId: null,
    taskTitle: '',
  });

  const handleDeleteClick = (e: React.MouseEvent, taskId: number, taskTitle: string) => {
    e.stopPropagation();
    e.preventDefault();
    setDeleteModal({
      isOpen: true,
      taskId,
      taskTitle,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.taskId) return;

    const success = await tasksStore.deleteTask(deleteModal.taskId);
    if (success) {
      setDeleteModal({
        isOpen: false,
        taskId: null,
        taskTitle: '',
      });
    }
  };

  const handleDeleteCancel = () => {
    if (tasksStore.isDeleting) return;

    setDeleteModal({
      isOpen: false,
      taskId: null,
      taskTitle: '',
    });
  };

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
    <>
      <div className={className}>
        <div className="block md:hidden">
          <TasksListMobile
            tasks={tasks}
            showStatus={showStatus}
            showPersonal={showPersonal}
            isFilterLoading={isFilterLoading}
            loadingMore={loadingMore}
            onDeleteClick={handleDeleteClick}
          />
        </div>

        <div className="hidden md:block">
          <TasksListDesktop
            tasks={tasks}
            showStatus={showStatus}
            showPersonal={showPersonal}
            isFilterLoading={isFilterLoading}
            loadingMore={loadingMore}
            onDeleteClick={handleDeleteClick}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Удаление задачи"
        message={`Вы уверены, что хотите удалить задачу "${deleteModal.taskTitle}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        confirmVariant="danger"
        isLoading={tasksStore.isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
};

export default TasksList;
