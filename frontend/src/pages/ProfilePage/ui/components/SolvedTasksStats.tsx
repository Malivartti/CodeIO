import { UserStatsByDifficulty } from '@shared/types/userStats';
import { FC } from 'react';

interface Props {
  stats: UserStatsByDifficulty;
}

const SolvedTasksStats: FC<Props> = ({ stats }) => {
  const difficulties = [
    { key: 'easy', label: 'Легкие', color: 'text-success' },
    { key: 'medium', label: 'Средние', color: 'text-warning' },
    { key: 'hard', label: 'Сложные', color: 'text-error' },
  ] as const;

  const totalSolved = Object.values(stats).reduce((sum, { solved }) => sum + solved, 0);
  const totalTasks = Object.values(stats).reduce((sum, { total }) => sum + total, 0);

  return (
    <div className="bg-surface border border-surface rounded-xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h3 className="text-lg font-semibold text-strong">Решенные задачи</h3>
        <div className="text-sm text-medium">
          Всего решено: <span className="font-medium text-strong">{totalSolved}</span> из <span className="font-medium text-strong">{totalTasks}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {difficulties.map(({ key, label, color }) => {
          const { solved, total } = stats[key];
          const percentage = total > 0 ? (solved / total) * 100 : 0;

          return (
            <div key={key} className="bg-canvas border border-surface rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-medium ${color}`}>{label}</h4>
                <span className="text-sm text-medium">
                  {solved}/{total}
                </span>
              </div>

              <div className="mb-2">
                <div className="w-full bg-surface-accent rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      key === 'easy' ? 'bg-success' :
                        key === 'medium' ? 'bg-warning' : 'bg-error'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              <div className="text-xs text-subtle">
                {percentage.toFixed(1)}% завершено
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SolvedTasksStats;
