import FilterIcon from '@shared/assets/icons/Filter.svg';
import { DifficultyEnum, TaskStatusEnum } from '@shared/types/task';
import Dropdown from '@shared/ui/Dropdown';
import Tooltip from '@shared/ui/Tooltip';
import { default as cn } from 'classnames';
import { FC } from 'react';

import DifficultyFilter from './DifficultyFilter';
import StatusFilter from './StatusFilter';
import TagsFilter from './TagsFilter';

interface Props {
  className?: string;
  difficulties: DifficultyEnum[];
  statuses: TaskStatusEnum[];
  tagIds: number[];
  showStatusFilter: boolean;
  onDifficultyChange: (difficulties: DifficultyEnum[]) => void;
  onStatusChange: (statuses: TaskStatusEnum[]) => void;
  onTagIdsChange: (tagIds: number[]) => void;
  onReset: () => void;
}

const FilterDropdown: FC<Props> = ({
  className,
  difficulties,
  statuses,
  tagIds,
  showStatusFilter,
  onDifficultyChange,
  onStatusChange,
  onTagIdsChange,
  onReset,
}) => {
  const activeFilterTypes = [
    difficulties.length > 0,
    statuses.length > 0 && showStatusFilter,
    tagIds.length > 0,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterTypes > 0;

  const trigger = (
    <Tooltip content="Фильтр" position="top">
      <button
        type="button"
        className={cn(
          'flex items-center gap-2 border border-surface bg-surface hover:bg-surface-hover active:bg-surface-active rounded-md p-3 transition-colors'
        )}
        aria-haspopup="listbox"
      >
        <FilterIcon
          width={16}
          height={16}
          className={cn(
            'transition-colors',
            hasActiveFilters ? 'text-strong' : 'text-medium'
          )}
        />
        {hasActiveFilters && (
          <span className="text-sm text-strong">
            {activeFilterTypes}
          </span>
        )}
      </button>
    </Tooltip>
  );

  const content = (
    <div className="overflow-visible w-80 sm:w-100 bg-surface rounded-md shadow-lg py-1">
      <button
        onClick={onReset}
        className="w-full flex items-center text-sm text-medium transition-colors px-3 py-2 hover:bg-surface-hover active:bg-surface-active"
      >
        Сбросить фильтры
      </button>

      <div className="p-3 space-y-4">
        <DifficultyFilter
          difficulties={difficulties}
          onDifficultyChange={onDifficultyChange}
        />

        {showStatusFilter && (
          <StatusFilter
            statuses={statuses}
            onStatusChange={onStatusChange}
          />
        )}

        <TagsFilter
          tagIds={tagIds}
          onTagIdsChange={onTagIdsChange}
        />
      </div>
    </div>
  );

  return (
    <Dropdown
      trigger={trigger}
      content={content}
      placement="center"
      offset={8}
      className={className}
    />
  );
};

export default FilterDropdown;
