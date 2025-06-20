import ResetIcon from '@shared/assets/icons/Reset.svg';
import { DifficultyEnum, SortByEnum, SortOrderEnum, TasksFilters, TaskStatusEnum } from '@shared/types/task';
import Tooltip from '@shared/ui/Tooltip';
import { default as cn } from 'classnames';
import { FC, useCallback } from 'react';

import FilterDropdown from './FilterDropdown';
import SearchInput from './SearchInput';
import SortDropdown from './SortDropdown';

interface Props {
  className?: string;
  filters: TasksFilters;
  onFiltersChange: (filters: Partial<TasksFilters>) => void;
  onReset: () => void;
  showStatusFilter?: boolean;
}

const TasksSearchAndFilters: FC<Props> = ({
  className,
  filters,
  onFiltersChange,
  onReset,
  showStatusFilter = false,
}) => {
  const handleSearchChange = useCallback(
    (value: string) => {
      onFiltersChange({ search: value || undefined });
    },
    [onFiltersChange]
  );

  const handleSortChange = useCallback(
    (sortBy: SortByEnum, sortOrder: SortOrderEnum) => {
      onFiltersChange({ sort_by: sortBy, sort_order: sortOrder });
    },
    [onFiltersChange]
  );

  const handleSortReset = useCallback(() => {
    onFiltersChange({ sort_by: SortByEnum.ID, sort_order: SortOrderEnum.ASC });
  }, [onFiltersChange]);

  const handleDifficultyChange = useCallback(
    (difficulties: DifficultyEnum[]) => {
      onFiltersChange({ difficulties: difficulties.length > 0 ? difficulties : undefined });
    },
    [onFiltersChange]
  );

  const handleStatusChange = useCallback(
    (statuses: TaskStatusEnum[]) => {
      onFiltersChange({ statuses: statuses.length > 0 ? statuses : undefined });
    },
    [onFiltersChange]
  );

  const handleTagIdsChange = useCallback(
    (tagIds: number[]) => {
      onFiltersChange({ tag_ids: tagIds.length > 0 ? tagIds : undefined });
    },
    [onFiltersChange]
  );

  const handleFilterReset = useCallback(() => {
    onFiltersChange({ difficulties: undefined, statuses: undefined, tag_ids: undefined });
  }, [onFiltersChange]);

  return (
    <div className={cn('flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-lg', className)}>
      <div className="w-full max-w-md">
        <SearchInput
          value={filters.search || ''}
          onValueChange={handleSearchChange}
        />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <SortDropdown
          sortBy={filters.sort_by || SortByEnum.ID}
          sortOrder={filters.sort_order || SortOrderEnum.ASC}
          onSortChange={handleSortChange}
          onReset={handleSortReset}
        />

        <FilterDropdown
          difficulties={filters.difficulties || []}
          statuses={filters.statuses || []}
          tagIds={filters.tag_ids || []}
          showStatusFilter={showStatusFilter}
          onDifficultyChange={handleDifficultyChange}
          onStatusChange={handleStatusChange}
          onTagIdsChange={handleTagIdsChange}
          onReset={handleFilterReset}
        />

        <Tooltip content="Сброс" position="top">
          <button
            onClick={onReset}
            className="border border-surface bg-surface hover:bg-surface-hover active:bg-surface-active rounded-md p-3 transition-colors"
          >
            <ResetIcon className="text-medium" width={16} height={16} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default TasksSearchAndFilters;
