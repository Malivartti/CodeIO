import { statisticsStore } from '@entities/admin';
import Container from '@widgets/Container';
import { observer } from 'mobx-react-lite';
import { FC, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DashboardStatisticsPage: FC = observer(() => {
  const { stats, isLoadingStats, statsError } = statisticsStore;

  useEffect(() => {
    statisticsStore.fetchStats();

    return () => {
      statisticsStore.reset();
    };
  }, []);

  if (isLoadingStats) {
    return (
      <Container>
        <div className="py-6 lg:py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-surface-unaccent rounded w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="bg-surface p-6 rounded-xl">
                  <div className="h-4 bg-surface-unaccent rounded w-24 mb-3" />
                  <div className="h-8 bg-surface-unaccent rounded w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (statsError) {
    return (
      <Container>
        <div className="py-6 lg:py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-strong mb-4">Статистика</h1>
            <div className="bg-surface border border-error rounded-xl p-6">
              <div className="text-error mb-4">{statsError}</div>
              <button
                onClick={() => statisticsStore.fetchStats()}
                className="px-4 py-2 bg-brand hover:bg-brand-hover text-inverse rounded-md transition-colors"
              >
                Повторить
              </button>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (!stats) return null;

  return (
    <Container>
      <div className="py-6 lg:py-8">
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-strong">Статистика системы</h1>
            <p className="text-medium mt-1">Общая аналитика использования платформы</p>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-canvas hover:bg-surface-hover active:bg-surface-active border border-surface text-strong rounded-md transition-colors"
          >
            Назад к панели
          </Link>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-strong mb-4">Пользователи</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface p-6 rounded-xl border border-surface">
                <div className="text-sm text-subtle mb-1">Всего пользователей</div>
                <div className="text-2xl font-bold text-strong">{stats.total_users}</div>
              </div>
              <div className="bg-surface p-6 rounded-xl border border-surface">
                <div className="text-sm text-subtle mb-1">Активные</div>
                <div className="text-2xl font-bold text-success">{stats.active_users}</div>
              </div>
              <div className="bg-surface p-6 rounded-xl border border-surface">
                <div className="text-sm text-subtle mb-1">Неактивные</div>
                <div className="text-2xl font-bold text-error">{stats.inactive_users}</div>
              </div>
              <div className="bg-surface p-6 rounded-xl border border-surface">
                <div className="text-sm text-subtle mb-1">Администраторы</div>
                <div className="text-2xl font-bold text-brand">{stats.superusers}</div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-strong mb-4">Задачи</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-surface p-6 rounded-xl border border-surface">
                <div className="text-sm text-subtle mb-1">Всего задач</div>
                <div className="text-2xl font-bold text-strong">{stats.total_tasks}</div>
              </div>
              <div className="bg-surface p-6 rounded-xl border border-surface">
                <div className="text-sm text-subtle mb-1">Публичные</div>
                <div className="text-2xl font-bold text-success">{stats.public_tasks}</div>
              </div>
              <div className="bg-surface p-6 rounded-xl border border-surface">
                <div className="text-sm text-subtle mb-1">Приватные</div>
                <div className="text-2xl font-bold text-medium">{stats.private_tasks}</div>
              </div>
              <div className="bg-surface p-6 rounded-xl border border-surface">
                <div className="text-sm text-subtle mb-1">Легкие</div>
                <div className="text-2xl font-bold text-success">{stats.tasks_by_difficulty.easy || 0}</div>
              </div>
              <div className="bg-surface p-6 rounded-xl border border-surface">
                <div className="text-sm text-subtle mb-1">Средние</div>
                <div className="text-2xl font-bold text-warning">{stats.tasks_by_difficulty.medium || 0}</div>
              </div>
              <div className="bg-surface p-6 rounded-xl border border-surface">
                <div className="text-sm text-subtle mb-1">Сложные</div>
                <div className="text-2xl font-bold text-error">{stats.tasks_by_difficulty.hard || 0}</div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-strong mb-4">Попытки решений</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface p-6 rounded-xl border border-surface">
                <div className="text-sm text-subtle mb-1">Всего попыток</div>
                <div className="text-2xl font-bold text-strong">{stats.total_attempts}</div>
              </div>
              <div className="bg-surface p-6 rounded-xl border border-surface">
                <div className="text-sm text-subtle mb-1">Успешные</div>
                <div className="text-2xl font-bold text-success">{stats.successful_attempts}</div>
              </div>
              <div className="bg-surface p-6 rounded-xl border border-surface">
                <div className="text-sm text-subtle mb-1">Процент успеха</div>
                <div className="text-2xl font-bold text-strong">{stats.success_rate}%</div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-strong mb-4">Активность за 30 дней</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface p-6 rounded-xl border border-surface">
                <div className="text-sm text-subtle mb-1">Новые регистрации</div>
                <div className="text-2xl font-bold text-brand">{stats.registrations_last_30_days}</div>
              </div>
              <div className="bg-surface p-6 rounded-xl border border-surface">
                <div className="text-sm text-subtle mb-1">Попытки решений</div>
                <div className="text-2xl font-bold text-strong">{stats.attempts_last_30_days}</div>
              </div>
            </div>
          </div>

          {Object.keys(stats.attempts_by_language).length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-strong mb-4">Популярные языки программирования</h2>
              <div className="bg-surface rounded-xl border border-surface p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(stats.attempts_by_language)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 6)
                    .map(([language, count]) => (
                      <div key={language} className="flex justify-between items-center p-3 bg-canvas rounded-lg">
                        <span className="font-medium text-strong">{language}</span>
                        <span className="text-medium">{count} попыток</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}

          {stats.most_used_tags.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-strong mb-4">Популярные теги</h2>
              <div className="bg-surface rounded-xl border border-surface p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.most_used_tags.slice(0, 9).map((tag) => (
                    <div key={tag.name} className="flex justify-between items-center p-3 bg-canvas rounded-lg">
                      <span className="font-medium text-strong">{tag.name}</span>
                      <span className="text-medium">{tag.usage_count} задач</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold text-strong mb-4">Дополнительная информация</h2>
            <div className="bg-surface rounded-xl border border-surface p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-subtle mb-2">Всего тегов в системе</div>
                  <div className="text-xl font-semibold text-strong">{stats.total_tags}</div>
                </div>
                <div>
                  <div className="text-sm text-subtle mb-2">Средний процент успеха</div>
                  <div className="text-xl font-semibold text-strong">{stats.success_rate}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
});

export default DashboardStatisticsPage;
