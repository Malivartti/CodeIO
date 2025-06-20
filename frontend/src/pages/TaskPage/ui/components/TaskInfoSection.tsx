import { taskStore } from '@entities/task';
import AttemptedIcon from '@shared/assets/icons/Attempted.svg';
import MemoryIcon from '@shared/assets/icons/Memory.svg';
import SolvedIcon from '@shared/assets/icons/Solved.svg';
import TimeIcon from '@shared/assets/icons/Time.svg';
import { markdownToHTML } from '@shared/lib/converters';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS, Task } from '@shared/types/task';
import Tooltip from '@shared/ui/Tooltip';
import { default as cn } from 'classnames';
import { observer } from 'mobx-react-lite';
import React from 'react';

import TaskInfoSkeleton from './TaskInfoSkeleton';

interface TaskInfoSectionProps {
  task: Task | null;
  isSolved: boolean;
  hasAttempts: boolean;
}

const TaskInfoSection: React.FC<TaskInfoSectionProps> = observer(({
  task,
  isSolved,
  hasAttempts,
}) => {
  if (!task) {
    return <TaskInfoSkeleton />;
  }

  const { taskTags, isLoadingTags } = taskStore;

  return (
    <div className="space-y-6 h-full">
      <div className="rounded-xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-strong leading-tight">
            {task.title}
          </h1>
          <Tooltip content="Статус решения" position="bottom">
            <div className="flex items-center flex-shrink-0">
              {hasAttempts && (
                isSolved ? (
                  <>
                    <span className="text-strong mr-2 text-sm sm:text-base">Решена</span>
                    <SolvedIcon width={24} height={24} className="text-success" />
                  </>
                ) : (
                  <>
                    <span className="text-strong mr-2 text-sm sm:text-base">Пытались</span>
                    <AttemptedIcon width={24} height={24} className="text-warning" />
                  </>
                )
              )}
            </div>
          </Tooltip>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
          <Tooltip content="Сложность" position="bottom">
            <div className={cn('text-sm font-medium px-2 py-1 rounded', DIFFICULTY_COLORS[task.difficulty])}>
              {DIFFICULTY_LABELS[task.difficulty]}
            </div>
          </Tooltip>

          <Tooltip content="Лимит времени" position="bottom">
            <div className="flex items-center text-subtle">
              <TimeIcon width={18} height={18} className="mr-1.5" />
              <span className="text-sm">{task.time_limit_seconds} сек.</span>
            </div>
          </Tooltip>

          <Tooltip content="Лимит памяти" position="bottom">
            <div className="flex items-center text-subtle">
              <MemoryIcon width={18} height={18} className="mr-1.5" />
              <span className="text-sm">{task.memory_limit_megabytes} МБ</span>
            </div>
          </Tooltip>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-medium text-strong mb-2">Теги</h2>
          <div className="flex flex-wrap gap-2">
            {isLoadingTags ? (
              <div className="flex gap-2">
                {Array.from({ length: 3 }, (_, i) => (
                  <div
                    key={i}
                    className="h-7 bg-surface-unaccent rounded-full animate-pulse"
                    style={{ width: `${60 + Math.random() * 40}px` }}
                  />
                ))}
              </div>
            ) : taskTags.length > 0 ? (
              taskTags.map(tag => (
                <span
                  key={tag.id}
                  className="px-3 py-1 bg-surface hover:bg-surface-hover rounded-full text-sm text-strong transition-colors cursor-default"
                >
                  {tag.name}
                </span>
              ))
            ) : (
              <span className="text-subtle text-sm">Теги не указаны</span>
            )}
          </div>
        </div>

        <div>
          <div
            className="prose prose-sm sm:prose max-w-none text-strong prose-headings:text-strong prose-p:text-strong prose-li:text-strong prose-strong:text-strong"
            dangerouslySetInnerHTML={{ __html: markdownToHTML(task.description) }}
          />
        </div>
      </div>
    </div>
  );
});

export default TaskInfoSection;
