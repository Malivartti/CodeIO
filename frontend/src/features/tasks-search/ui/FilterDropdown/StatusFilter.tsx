import TickIcon from '@shared/assets/icons/Tick.svg';
import { TaskStatusEnum } from '@shared/types/task';
import { default as cn } from 'classnames';
import { FC, useEffect, useMemo, useRef, useState } from 'react';

import FilterField from './FilterField';

interface Props {
  statuses: TaskStatusEnum[];
  onStatusChange: (statuses: TaskStatusEnum[]) => void;
}

const STATUS_OPTIONS = [
  { value: TaskStatusEnum.TODO, label: 'Не решена' },
  { value: TaskStatusEnum.ATTEMPTED, label: 'В процессе' },
  { value: TaskStatusEnum.SOLVED, label: 'Решена' },
];

const StatusFilter: FC<Props> = ({ statuses, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node) &&
          fieldRef.current && !fieldRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const statusText = useMemo(() => statuses.length > 0
    ? STATUS_OPTIONS.filter(opt => statuses.includes(opt.value)).map(opt => opt.label).join(', ')
    : '', [statuses]);

  const handleStatusToggle = (status: TaskStatusEnum) => {
    const updated = statuses.includes(status)
      ? statuses.filter(s => s !== status)
      : [...statuses, status];
    onStatusChange(updated);
  };

  return (
    <div className="relative">
      <FilterField
        ref={fieldRef}
        label="Статус"
        value={statusText}
        onClick={() => setIsOpen(v => !v)}
        isOpen={isOpen}
      />
      {isOpen && (
        <div
          ref={containerRef}
          className="absolute top-full right-0 mt-1 bg-surface border border-surface rounded-lg shadow-lg z-[60] min-w-40"
        >
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={(e) => {
                e.stopPropagation();
                handleStatusToggle(option.value);
              }}
              className={cn(
                'w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-surface-hover active:bg-surface-active first:rounded-t-lg last:rounded-b-lg',
                statuses.includes(option.value) ? 'bg-surface-accent text-strong' : 'text-medium'
              )}
            >
              <span>{option.label}</span>
              {statuses.includes(option.value) && (
                <TickIcon className="h-4 w-4 text-strong" width={16} height={16} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusFilter;
