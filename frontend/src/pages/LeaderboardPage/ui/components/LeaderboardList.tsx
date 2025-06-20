import { leaderboardStore } from '@entities/leaderboard';
import Avatar from '@shared/ui/Avatar';
import { observer } from 'mobx-react-lite';
import { FC, useEffect } from 'react';

const LeaderboardList: FC = observer(() => {
  const { entries, isLoading } = leaderboardStore;

  useEffect(() => {
    entries.forEach(entry => {
      if (entry.avatar_filename && !leaderboardStore.getAvatarUrl(entry.avatar_filename)) {
        leaderboardStore.loadAvatar(entry.avatar_filename);
      }
    });
  }, [entries]);

  if (entries.length === 0 && !isLoading) {
    return (
      <div className="bg-surface border border-surface rounded-xl p-8">
        <div className="text-center">
          <p className="text-medium text-lg mb-2">Рейтинг пуст</p>
          <p className="text-subtle">Пока никто не решил ни одной задачи</p>
        </div>
      </div>
    );
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const getRankStyle = (position: number) => {
    switch (position) {
      case 1:
        return 'text-yellow-600 font-bold';
      case 2:
        return 'text-gray-500 font-bold';
      case 3:
        return 'text-yellow-700 font-bold';
      default:
        return 'text-medium';
    }
  };

  return (
    <div className="space-y-4">
      <div className="block md:hidden space-y-3">
        {entries.map((entry, index) => {
          const position = index + 1;
          const displayName = `${entry.first_name}${entry.last_name ? ` ${entry.last_name}` : ''}`;
          const avatarUrl = leaderboardStore.getAvatarUrl(entry.avatar_filename);
          const isAvatarLoading = leaderboardStore.isAvatarLoading(entry.avatar_filename);

          return (
            <div
              key={entry.user_id}
              className="bg-surface border border-surface rounded-xl p-4 hover:bg-surface-hover transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 text-center">
                  {getRankIcon(position) ? (
                    <span className="text-2xl">{getRankIcon(position)}</span>
                  ) : (
                    <span className={`text-lg font-semibold ${getRankStyle(position)}`}>
                      {position}
                    </span>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {isAvatarLoading ? (
                    <div className="w-12 h-12 rounded-full bg-surface-unaccent animate-pulse" />
                  ) : (
                    <Avatar
                      src={avatarUrl}
                      name={displayName}
                      size="md"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-strong truncate">{displayName}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-medium">
                    <span>{entry.total_score} очков</span>
                    <span>{entry.solved_tasks_count} задач</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block bg-surface border border-surface rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface bg-surface">
              <th className="px-6 py-4 text-left text-sm font-semibold text-strong">Место</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-strong">Участник</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-strong">Очки</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-strong">Задач решено</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color-surface)]">
            {entries.map((entry, index) => {
              const position = index + 1;
              const displayName = `${entry.first_name}${entry.last_name ? ` ${entry.last_name}` : ''}`;
              const avatarUrl = leaderboardStore.getAvatarUrl(entry.avatar_filename);
              const isAvatarLoading = leaderboardStore.isAvatarLoading(entry.avatar_filename);

              return (
                <tr
                  key={entry.user_id}
                  className="hover:bg-surface-hover transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getRankIcon(position) && (
                        <span className="text-xl">{getRankIcon(position)}</span>
                      )}
                      <span className={`text-lg font-semibold ${getRankStyle(position)}`}>
                        {position}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {isAvatarLoading ? (
                        <div className="w-12 h-12 rounded-full bg-surface-unaccent animate-pulse" />
                      ) : (
                        <Avatar
                          src={avatarUrl}
                          name={displayName}
                          size="md"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-strong">{displayName}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center text-lg font-bold text-strong">
                    {entry.total_score}
                  </td>

                  <td className="px-6 py-4 text-center text-lg font-semibold text-medium">
                    {entry.solved_tasks_count}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isLoading && entries.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="flex items-center gap-2 text-medium">
            <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            <span>Загрузка...</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default LeaderboardList;
