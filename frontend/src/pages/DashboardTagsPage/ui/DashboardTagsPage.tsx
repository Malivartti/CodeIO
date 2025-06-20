import { tagsStore } from '@entities/admin';
import SearchIcon from '@shared/assets/icons/Search.svg';
import Container from '@widgets/Container';
import { observer } from 'mobx-react-lite';
import React, { FC, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import CreateTagForm from './components/CreateTagForm';
import TagsList from './components/TagsList';

const DashboardTagsPage: FC = observer(() => {
  const [searchValue, setSearchValue] = useState('');
  const {
    isLoading,
    error,
    totalTags,
    searchQuery,
  } = tagsStore;

  useEffect(() => {
    tagsStore.loadTags(1);

    return () => {
      tagsStore.reset();
    };
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    tagsStore.setSearchQuery(searchValue);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (!value.trim() && searchQuery) {
      tagsStore.setSearchQuery('');
    }
  };

  return (
    <Container>
      <div className="py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-strong">Управление тегами</h1>
            <p className="text-medium mt-1">
              Всего тегов: {totalTags}
            </p>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-canvas hover:bg-surface-hover border border-surface text-strong rounded-md transition-colors"
          >
            Назад к панели
          </Link>
        </div>

        <div className="mb-6">
          <CreateTagForm />
        </div>

        <div className="mb-6">
          <form onSubmit={handleSearch} className="max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Поиск тегов..."
                className="w-full pl-10 pr-4 py-3 border border-surface rounded-lg bg-canvas text-strong placeholder-subtle focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <SearchIcon width={20} height={20} className="text-subtle" />
              </div>
            </div>
          </form>
        </div>

        {error && (
          <div className="bg-canvas border border-error rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-error">{error}</span>
              <button
                onClick={() => {
                  tagsStore.clearError();
                  tagsStore.loadTags();
                }}
                className="text-brand hover:text-brand-hover transition-colors font-medium"
              >
                Повторить
              </button>
            </div>
          </div>
        )}

        <TagsList isLoading={isLoading} />
      </div>
    </Container>
  );
});

export default DashboardTagsPage;
