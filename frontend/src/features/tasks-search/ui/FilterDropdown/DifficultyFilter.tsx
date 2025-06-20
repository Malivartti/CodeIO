import TickIcon from '@shared/assets/icons/Tick.svg';
import { DifficultyEnum } from '@shared/types/task';
import { default as cn } from 'classnames';
import { FC, useEffect, useMemo, useRef, useState } from 'react';

import FilterField from './FilterField';

interface Props {
  difficulties: DifficultyEnum[];
  onDifficultyChange: (difficulties: DifficultyEnum[]) => void;
}

const DIFFICULTY_OPTIONS = [
  { value: DifficultyEnum.EASY, label: 'Легкая' },
  { value: DifficultyEnum.MEDIUM, label: 'Средняя' },
  { value: DifficultyEnum.HARD, label: 'Сложная' },
];

const DifficultyFilter: FC<Props> = ({ difficulties, onDifficultyChange }) => {
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

  const difficultyText = useMemo(() => difficulties.length > 0
    ? DIFFICULTY_OPTIONS.filter(opt => difficulties.includes(opt.value)).map(opt => opt.label).join(', ')
    : '', [difficulties]);

  const handleDifficultyToggle = (difficulty: DifficultyEnum) => {
    const updated = difficulties.includes(difficulty)
      ? difficulties.filter(d => d !== difficulty)
      : [...difficulties, difficulty];
    onDifficultyChange(updated);
  };

  return (
    <div className="relative">
      <FilterField
        ref={fieldRef}
        label="Сложность"
        value={difficultyText}
        onClick={() => setIsOpen(v => !v)}
        isOpen={isOpen}
      />
      {isOpen && (
        <div
          ref={containerRef}
          className="absolute top-full right-0 mt-1 bg-surface border border-surface rounded-lg z-[60] min-w-40"
        >
          {DIFFICULTY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={(e) => {
                e.stopPropagation();
                handleDifficultyToggle(option.value);
              }}
              className={cn(
                'w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-surface-hover active:bg-surface-active first:rounded-t-lg last:rounded-b-lg',
                difficulties.includes(option.value) ? 'bg-surface-accent text-strong' : 'text-medium'
              )}
            >
              <span>{option.label}</span>
              {difficulties.includes(option.value) && (
                <TickIcon className="h-4 w-4 text-strong" width={16} height={16} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DifficultyFilter;
