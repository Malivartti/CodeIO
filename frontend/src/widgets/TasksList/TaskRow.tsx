import AttemptedIcon from '@shared/assets/icons/Attempted.svg';
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
}

const TaskRow: FC<Props> = ({ task, showStatus, showPersonal }) => {
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
      <Tooltip content="Редактировать" position="top">
        <button
          type="button"
          className="flex items-center border border-surface bg-canvas hover:bg-surface-hover active:bg-surface-active rounded-md p-2 transition-colors"
          onClick={handleEditTask}
        >
          <EditIcon width={16} height={16} className="text-medium" />
        </button>
      </Tooltip>
    );
  };

  return (
    <tr
      role="button"
      tabIndex={0}
      onClick={handleTaskClick}
      onKeyDown={handleTaskKeyDown}
      className="hover:bg-surface-hover active:bg-surface-active transition-all duration-200 cursor-pointer"
      aria-label={`Открыть задачу ${task.title}`}
    >
      <td className="px-4 py-3 w-8">
        {renderPrivacyBadge()}
      </td>

      {showStatus && (
        <td className="px-4 py-3 w-12">
          <Tooltip content={renderStatusText(task.user_attempt_status)} position="top">
            {renderStatusIcon(task.user_attempt_status)}
          </Tooltip>
        </td>
      )}

      <td className="px-4 py-3 w-full max-w-0 overflow-hidden">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm text-subtle whitespace-nowrap flex-shrink-0">#{task.id}</span>
          <span className="font-medium text-strong truncate flex-1 min-w-0">{task.title}</span>
        </div>
      </td>

      <td className="px-4 py-3 text-right w-20">
        <Tooltip content="Процент решений" position="top">
          <span className="text-sm text-medium whitespace-nowrap">
            {(task.acceptance * 100).toFixed(1)}%
          </span>
        </Tooltip>
      </td>

      <td className="px-4 py-3 text-right w-24">
        <span className={cn('text-sm font-medium whitespace-nowrap', DIFFICULTY_COLORS[task.difficulty])}>
          {DIFFICULTY_LABELS[task.difficulty]}
        </span>
      </td>

      {showPersonal && (
        <td className="px-4 py-3 text-right w-16">
          {renderActions()}
        </td>
      )}
    </tr>
  );
};

export default TaskRow;
