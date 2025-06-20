import { tagStore } from '@entities/tag';
import SearchIcon from '@shared/assets/icons/Search.svg';
import TickIcon from '@shared/assets/icons/Tick.svg';
import { default as cn } from 'classnames';
import { observer } from 'mobx-react-lite';
import { FC, useEffect, useRef, useState } from 'react';

import FilterField from './FilterField';

interface Props {
  tagIds: number[];
  onTagIdsChange: (tagIds: number[]) => void;
}

const TagsFilter: FC<Props> = observer(({ tagIds, onTagIdsChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
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

  const selectedTags = tagStore.data.filter(tag => tagIds.includes(tag.id));
  const tagsText = selectedTags.length > 0 ? selectedTags.map(tag => tag.name).join(', ') : '';

  const filteredTags = tagStore.filteredTags(tagSearch);

  const handleTagToggle = (tagId: number) => {
    const updated = tagIds.includes(tagId)
      ? tagIds.filter(id => id !== tagId)
      : [...tagIds, tagId];
    onTagIdsChange(updated);
  };

  const handleOpen = () => {
    setIsOpen(v => !v);
    if (!isOpen && tagStore.data.length === 0) {
      tagStore.fetchTags();
    }
  };

  return (
    <div className="relative">
      <FilterField
        ref={fieldRef}
        label="Теги"
        value={tagsText}
        onClick={handleOpen}
        isOpen={isOpen}
      />
      {isOpen && (
        <div
          ref={containerRef}
          className="absolute top-full right-0 mt-1 bg-surface border border-surface rounded-lg shadow-lg z-[60] min-w-64 max-h-64 overflow-hidden"
        >
          <div className="p-3 border-b border-surface">
            <div className="relative">
              <SearchIcon
                width={16}
                height={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-subtle"
              />
              <input
                type="text"
                placeholder="Поиск тегов..."
                value={tagSearch}
                onChange={(e) => {
                  e.stopPropagation();
                  setTagSearch(e.target.value);
                }}
                onKeyDown={(e) => e.stopPropagation()}
                className="w-full pl-10 pr-4 py-2 border border-surface rounded-md focus:outline-none focus:ring-2 focus:ring-surface-accent bg-canvas text-strong placeholder-subtle text-sm transition-colors"
              />
            </div>
          </div>
          <div className="p-3 overflow-y-auto max-h-48">
            {tagStore.IsLoading ? (
              <div className="text-sm text-subtle text-center py-4">
                Загрузка тегов...
              </div>
            ) : tagStore.error ? (
              <div className="text-sm text-error text-center py-4">
                Ошибка загрузки тегов
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTagToggle(tag.id);
                    }}
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors',
                      tagIds.includes(tag.id)
                        ? 'bg-surface-accent border border-surface-accent'
                        : 'bg-canvas text-medium hover:bg-surface-hover active:bg-surface-active border border-surface'
                    )}
                  >
                    <span>{tag.name}</span>
                    {tagIds.includes(tag.id) && (
                      <TickIcon className="h-3 w-3" width={12} height={12} />
                    )}
                  </button>
                ))}
              </div>
            )}
            {!tagStore.IsLoading && !tagStore.error && filteredTags.length === 0 && (
              <div className="text-sm text-subtle text-center py-4">
                Теги не найдены
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default TagsFilter;
