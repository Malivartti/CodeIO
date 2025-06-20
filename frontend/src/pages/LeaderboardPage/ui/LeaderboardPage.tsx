import { leaderboardStore } from '@entities/leaderboard';
import Container from '@widgets/Container';
import { observer } from 'mobx-react-lite';
import React, { FC, useEffect } from 'react';

import LeaderboardList from './components/LeaderboardList';
import LeaderboardSkeleton from './components/LeaderboardSkeleton';

const LeaderboardPage: FC = observer(() => {
  const { entries, isLoading, error } = leaderboardStore;

  useEffect(() => {
    leaderboardStore.fetchLeaderboard(true);

    return () => {
      leaderboardStore.reset();
    };
  }, []);


  return (
    <Container>
      <div className="py-6 lg:py-8">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-strong mb-2">Рейтинг</h1>
          <p className="text-medium">
            Топ участников по количеству набранных очков за решенные задачи
          </p>
        </div>

        <div className="bg-surface border border-surface rounded-xl p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-strong mb-4">Система очков</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-canvas rounded-lg">
              <div className="text-2xl font-bold text-success mb-1">3</div>
              <div className="text-sm text-medium">Легкая задача</div>
            </div>
            <div className="text-center p-4 bg-canvas rounded-lg">
              <div className="text-2xl font-bold text-warning mb-1">5</div>
              <div className="text-sm text-medium">Средняя задача</div>
            </div>
            <div className="text-center p-4 bg-canvas rounded-lg">
              <div className="text-2xl font-bold text-error mb-1">10</div>
              <div className="text-sm text-medium">Сложная задача</div>
            </div>
          </div>
          <p className="text-xs text-subtle mt-4 text-center">
            Очки начисляются только за первое успешное решение каждой задачи
          </p>
        </div>

        {error && (
          <div className="bg-canvas border border-error rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-error">{error}</span>
              <button
                onClick={() => leaderboardStore.fetchLeaderboard(true)}
                className="text-brand hover:text-brand-hover transition-colors font-medium"
              >
                Повторить
              </button>
            </div>
          </div>
        )}

        {isLoading && entries.length === 0 ? (
          <LeaderboardSkeleton />
        ) : (
          <LeaderboardList />
        )}
      </div>
    </Container>
  );
});

export default LeaderboardPage;
