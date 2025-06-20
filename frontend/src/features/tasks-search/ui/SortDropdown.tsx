import AscSortIcon from '@shared/assets/icons/AscSort.svg';
import DescSortIcon from '@shared/assets/icons/DescSort.svg';
import SortIcon from '@shared/assets/icons/Sort.svg';
import { SortByEnum, SortOrderEnum } from '@shared/types/task';
import Dropdown from '@shared/ui/Dropdown';
import Tooltip from '@shared/ui/Tooltip';
import { default as cn } from 'classnames';
import React, { FC } from 'react';

interface Props {
  className?: string;
  sortBy: SortByEnum;
  sortOrder: SortOrderEnum;
  onSortChange: (sortBy: SortByEnum, sortOrder: SortOrderEnum) => void;
  onReset: () => void;
}

const SORT_OPTIONS = [
  { value: SortByEnum.ID, label: 'ID' },
  { value: SortByEnum.DIFFICULTY, label: 'Сложность' },
  { value: SortByEnum.ACCEPTANCE, label: 'Процент решений' },
];

const SortDropdown: FC<Props> = ({ className, sortBy, sortOrder, onSortChange, onReset }) => {
  const currentOption = SORT_OPTIONS.find(option => option.value === sortBy);
  const isDefault = sortBy === SortByEnum.ID && sortOrder === SortOrderEnum.ASC;

  const handleSortSelect = (newSortBy: SortByEnum) => {
    onSortChange(newSortBy, sortOrder);
  };

  const toggleSortOrder = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const newOrder = sortOrder === SortOrderEnum.ASC ? SortOrderEnum.DESC : SortOrderEnum.ASC;
    onSortChange(sortBy, newOrder);
  };

  const trigger = (
    <Tooltip content="Сортировка" position="top">
      <button
        type="button"
        className="flex items-center gap-2 border border-surface bg-surface hover:bg-surface-hover active:bg-surface-active rounded-md p-3 transition-colors"
        aria-haspopup="listbox"
      >
        {isDefault ? (
          <SortIcon width={16} height={16} className="text-medium" />
        ) : (
          <>
            {sortOrder === SortOrderEnum.ASC ? (
              <AscSortIcon width={16} height={16} className="text-strong" />
            ) : (
              <DescSortIcon width={16} height={16} className="text-strong" />
            )}
            <span className="text-sm text-strong">{currentOption?.label}</span>
          </>
        )}
      </button>
    </Tooltip>
  );

  const content = (
    <div className="overflow-hidden min-w-48 bg-surface rounded-md py-1">
      <button
        onClick={onReset}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-surface-hover active:bg-surface-active text-medium"
      >
        Сбросить
      </button>
      <div className="border-t border-surface" />
      {SORT_OPTIONS.map((option) => (
        <div
          key={option.value}
          className={cn(
            'flex items-center justify-between hover:bg-surface-hover',
            sortBy === option.value && 'bg-surface-accent'
          )}
        >
          <button
            onClick={() => handleSortSelect(option.value)}
            className={cn(
              'flex-1 flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
              sortBy === option.value ? 'text-strong' : 'text-medium'
            )}
          >
            <span>{option.label}</span>
          </button>
          {sortBy === option.value && (
            <button
              onClick={toggleSortOrder}
              className="px-2 py-2 hover:bg-surface-hover active:bg-surface-active transition-colors rounded-md "
              title={sortOrder === SortOrderEnum.ASC ? 'Переключить на убывание' : 'Переключить на возрастание'}
            >
              {sortOrder === SortOrderEnum.ASC ? (
                <AscSortIcon width={16} height={16} className="text-strong" />
              ) : (
                <DescSortIcon width={16} height={16} className="text-strong" />
              )}
            </button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Dropdown
      trigger={trigger}
      content={content}
      placement="center"
      offset={8}
      className={className}
      contentClassName="min-w-48"
    />
  );
};

export default SortDropdown;
