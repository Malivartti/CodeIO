import { userStore } from '@entities/user';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';

import ActivityCalendar from './ActivityCalendar';
import RecentSolvedTasks from './RecentSolvedTasks';
import SolvedTasksStats from './SolvedTasksStats';
import UserStatsSkeleton from './UserStatsSkeleton';

const UserStatsSection: FC = observer(() => {
  const { stats, isLoadingStats } = userStore;

  if (isLoadingStats) {
    return <UserStatsSkeleton />;
  }

  if (!stats) {
    return (
      <div className="bg-surface border border-surface rounded-xl p-6">
        <div className="text-center py-8">
          <p className="text-subtle">Не удалось загрузить статистику</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SolvedTasksStats stats={stats.solved_by_difficulty} />

      <ActivityCalendar
        activityDays={stats.activity_days}
        totalSolved={stats.total_solved_this_year}
        averagePerMonth={stats.average_per_month}
        averagePerWeek={stats.average_per_week}
      />

      <RecentSolvedTasks tasks={stats.recent_solved_tasks} />
    </div>
  );
});

export default UserStatsSection;
