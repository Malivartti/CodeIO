import { userStore } from '@entities/user';
import { authStore } from '@features/auth';
import ThemeSwitcher from '@features/theme-switcher';
import { AppRoutes } from '@shared/types/routes';
import { observer } from 'mobx-react-lite';
import { FC, useState } from 'react';

import Logo from './Logo';
import MobileMenu from './MobileMenu';
import MobileMenuButton from './MobileMenuButton';
import UserProfile from './UserProfilel';

const HeaderMobile: FC = observer(() => {
  const isAuthenticated = authStore.isAuthenticated;
  const isSuperuser = userStore.isSuperuser;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    ...(isSuperuser ? [{ to: AppRoutes.DASHBOARD, label: 'Дашборд' }] : []),
    { to: AppRoutes.TASKS, label: 'Задачи' },
    { to: AppRoutes.LEADERBOARD, label: 'Рейтинг' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-surface border-b border-surface z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2">
          <Logo isAuthenticated={isAuthenticated} isSuperuser={isSuperuser} />
          <MobileMenuButton
            isOpen={isMobileMenuOpen}
            onClick={toggleMobileMenu}
          />
        </div>
      </div>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        navigationItems={navigationItems}
        themeSwitcher={<ThemeSwitcher />}
        userProfile={<UserProfile />}
      />
    </header>
  );
});

export default HeaderMobile;
