import AttemptedIcon from '@shared/assets/icons/Attempted.svg';
import DeleteIcon from '@shared/assets/icons/Delete.svg';
import EditIcon from '@shared/assets/icons/Edit.svg';
import HideIcon from '@shared/assets/icons/Hide.svg';
import SolvedIcon from '@shared/assets/icons/Solved.svg';
import { NavigationHelpers } from '@shared/lib/routes';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS, TaskPublicForList, TaskStatusEnum } from '@shared/types/task';
import Tooltip from '@shared/ui/Tooltip';
import { default as cn } from 'classnames';
import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  task: TaskPublicForList;
  showStatus: boolean;
  showPersonal: boolean;
  onDeleteClick: (e: React.MouseEvent, taskId: number, taskTitle: string) => void;
}

const TaskCard: FC<Props> = ({ task, showStatus, showPersonal, onDeleteClick }) => {
  const navigate = useNavigate();

  const handleTaskClick = (event: React.MouseEvent | React.KeyboardEvent) => {
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(NavigationHelpers.getTaskUrl(task.id));
  };

  const handleTaskKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTaskClick(event);
    }
  };

  const handleEditTask = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(NavigationHelpers.getTaskUpdateUrl(task.id));
  };

  const renderStatusText = (status?: TaskStatusEnum) => {
    switch (status) {
      case TaskStatusEnum.ATTEMPTED:
        return 'Попытались';
      case TaskStatusEnum.SOLVED:
        return 'Решено';
      default:
        return '';
    }
  };

  const renderStatusIcon = (status?: TaskStatusEnum) => {
    switch (status) {
      case TaskStatusEnum.ATTEMPTED:
        return <AttemptedIcon width={24} height={24} className="text-warning" />;
      case TaskStatusEnum.SOLVED:
        return <SolvedIcon width={24} height={24} className="text-success" />;
      default:
        return <div className="w-6" />;
    }
  };

  const renderPrivacyBadge = () => {
    if (!showPersonal || task.is_public) return null;

    return (
      <Tooltip content="Приватный" position="top">
        <HideIcon className="text-subtle" width={20} height={20} />
      </Tooltip>
    );
  };

  const renderActions = () => {
    if (!showPersonal) return null;

    return (
      <div className="flex items-center gap-2">
        <Tooltip content="Редактировать" position="top">
          <button
            type="button"
            className="flex items-center border border-surface bg-canvas hover:bg-surface-hover active:bg-surface-active rounded-md p-2 transition-colors"
            onClick={handleEditTask}
          >
            <EditIcon width={16} height={16} className="text-medium" />
          </button>
        </Tooltip>

        <Tooltip content="Удалить" position="top">
          <button
            type="button"
            className="flex items-center border border-surface bg-canvas hover:bg-surface-hover active:bg-surface-active rounded-md p-2 transition-colors hover:text-error hover:border-error"
            onClick={(e) => onDeleteClick(e, task.id, task.title)}
          >
            <DeleteIcon width={16} height={16} className="text-medium" />
          </button>
        </Tooltip>
      </div>
    );
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={handleTaskKeyDown}
      onClick={handleTaskClick}
      className="bg-surface border border-surface rounded-lg p-4 cursor-pointer hover:bg-surface-hover active:bg-surface-active transition-all duration-200 shadow-sm"
      aria-label={`Открыть задачу ${task.title}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-subtle">#{task.id}</span>
          {renderPrivacyBadge()}
        </div>

        <div className="flex items-center gap-2">
          {showStatus && (
            <Tooltip content={renderStatusText(task.user_attempt_status)} position="top">
              {renderStatusIcon(task.user_attempt_status)}
            </Tooltip>
          )}
          {renderActions()}
        </div>
      </div>

      <div className="mb-3">
        <h3 className="text-strong font-medium line-clamp-2 leading-5">
          {task.title}
        </h3>
      </div>

      <div className="flex items-center justify-between">
        <Tooltip content="Процент решений" position="top">
          <span className="text-sm text-medium">
            {(task.acceptance * 100).toFixed(1)}%
          </span>
        </Tooltip>

        <span className={cn('text-sm font-medium', DIFFICULTY_COLORS[task.difficulty])}>
          {DIFFICULTY_LABELS[task.difficulty]}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;
