import { userStore } from '@entities/user';
import ThemeSwitcher from '@features/ThemeSwitcher';
import { useAccess } from '@shared/hooks/useAccess';
import { NavigationHelpers } from '@shared/lib/routes';
import { AppRoutes } from '@shared/types/routes';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';
import { Link } from 'react-router-dom';

import UserProfile from './UserProfile/UserProfilel';

const Header: FC = observer(() => {
  const { isAuthenticated } = useAccess();
  const isSuperuser = userStore.isSuperuser;

  return (
    <header className="bg-bg-primary border-b border-border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2">
          <Link to={NavigationHelpers.getDefaultRouteForUser(isAuthenticated, isSuperuser)} className="flex items-center space-x-2">
            <div className="p-2 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-text-inverse font-bold text-sm">CodeIO</span>
            </div>
          </Link>

          <nav className="flex items-center space-x-6">
            {
              isSuperuser && <>
                <Link to={AppRoutes.DASHBOARD} className="text-text-secondary hover:text-text-primary transition-colors">
                  Дашборд
                </Link>
              </>
            }

            <Link to={AppRoutes.TASKS} className="text-text-secondary hover:text-text-primary transition-colors">
              Задачи
            </Link>
            <Link to={AppRoutes.COLLECTIONS} className="text-text-secondary hover:text-text-primary transition-colors">
              Коллекции
            </Link>
            <Link to={AppRoutes.LEADERBOARD} className="text-text-secondary hover:text-text-primary transition-colors">
              Рейтинг
            </Link>
            <div className='flex items-center'>
              <ThemeSwitcher />
              <UserProfile />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
});

export default Header;
