import { tagStore } from '@entities/tag';
import CrossIcon from '@shared/assets/icons/Cross.svg';
import SearchIcon from '@shared/assets/icons/Search.svg';
import TickIcon from '@shared/assets/icons/Tick.svg';
import { default as cn } from 'classnames';
import { observer } from 'mobx-react-lite';
import { FC, useEffect, useRef, useState } from 'react';

interface Props {
  selectedTagIds: number[];
  onTagsChange: (tagIds: number[]) => void;
  className?: string;
}

const TagSelector: FC<Props> = observer(({ selectedTagIds, onTagsChange, className }) => {
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

  const selectedTags = tagStore.data.filter(tag => selectedTagIds.includes(tag.id));
  const tagsText = selectedTags.length > 0 ? selectedTags.map(tag => tag.name).join(', ') : '';

  const filteredTags = tagStore.filteredTags(tagSearch);

  const handleTagToggle = (tagId: number) => {
    const updated = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId];
    onTagsChange(updated);
  };

  const handleOpen = () => {
    setIsOpen(v => !v);
    if (!isOpen && tagStore.data.length === 0) {
      tagStore.fetchTags();
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="block text-sm font-medium text-strong">
        Теги
      </div>

      <div className="relative">
        <button
          ref={fieldRef}
          type="button"
          onClick={handleOpen}
          className={cn(
            'w-full p-3 border border-surface rounded-md text-left bg-canvas hover:bg-surface-hover transition-colors text-medium',
            isOpen && 'ring-2 ring-surface-accent'
          )}
        >
          {tagsText || 'Выберите теги'}
        </button>

        {isOpen && (
          <div
            ref={containerRef}
            className="absolute top-full left-0 mt-1 bg-surface border border-surface rounded-lg shadow-lg z-[60] w-full min-w-64 max-h-64 overflow-hidden"
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
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTagToggle(tag.id);
                      }}
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors',
                        selectedTagIds.includes(tag.id)
                          ? 'bg-surface-accent border border-surface-accent text-strong'
                          : 'bg-canvas text-medium hover:bg-surface-hover active:bg-surface-active border border-surface'
                      )}
                    >
                      <span>{tag.name}</span>
                      {selectedTagIds.includes(tag.id) && (
                        <TickIcon width={16} height={16} />
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

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-surface-accent text-strong border border-surface-accent"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className="ml-1 text-subtle hover:text-strong transition-colors"
              >
                <CrossIcon width={16} height={16} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
});

export default TagSelector;
