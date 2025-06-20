import { userStore } from '@entities/user';
import { authStore } from '@features/auth';
import ThemeSwitcher from '@features/theme-switcher';
import { AppRoutes } from '@shared/types/routes';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';

import Logo from './Logo';
import Navigation from './Navigation';
import UserProfile from './UserProfilel';

const HeaderDesktop: FC = observer(() => {
  const isAuthenticated = authStore.isAuthenticated;
  const isSuperuser = userStore.isSuperuser;

  const navigationItems = [
    ...(isSuperuser ? [{ to: AppRoutes.DASHBOARD, label: 'Дашборд' }] : []),
    { to: AppRoutes.TASKS, label: 'Задачи' },
    { to: AppRoutes.LEADERBOARD, label: 'Рейтинг' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-surface border-b border-surface z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2">
          <Logo isAuthenticated={isAuthenticated} isSuperuser={isSuperuser} />

          <nav className="flex items-center space-x-6">
            <Navigation items={navigationItems} variant="horizontal" />
            <div className="flex items-center">
              <ThemeSwitcher />
              <UserProfile />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
});

export default HeaderDesktop;
