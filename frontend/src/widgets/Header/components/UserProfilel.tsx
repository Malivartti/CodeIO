import { userStore } from '@entities/user';
import { authStore } from '@features/auth';
import LogoutIcon from '@shared/assets/icons/Logout.svg';
import ProfileIcon from '@shared/assets/icons/Profile.svg';
import { AppRoutes } from '@shared/types/routes';
import Dropdown from '@shared/ui/Dropdown';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import UserAvatar from './UserAvatar';

const UserProfile: FC = observer(() => {
  const isAuthenticated = authStore.isAuthenticated;
  const user = userStore.user;
  const navigate = useNavigate();

  const handleLogout = () => {
    authStore.logout();
    navigate(AppRoutes.TASKS);
  };

  const handleProfileClick = () => {
    navigate(AppRoutes.PROFILE);
  };

  if (!isAuthenticated) {
    return (
      <Link
        to={AppRoutes.LOGIN}
        className="bg-brand hover:bg-brand-hover text-inverse px-4 py-2 rounded-md text-sm font-medium transition-colors"
      >
        Войти
      </Link>
    );
  }

  const trigger = (
    <button
      className="flex items-center space-x-2 bg-surface hover:bg-surface-hover active:bg-surface-active rounded-md px-3 py-2 transition-colors"
    >
      <UserAvatar
        avatarFilename={user?.avatar_filename}
        firstName={user?.first_name}
      />

      <span className="text-sm text-medium font-medium">
        {user?.first_name}
      </span>
    </button>
  );

  const content = (
    <div className="py-1 w-48 bg-surface  rounded-md">
      <div className="px-4 py-2 border-b border-surface">
        <p className="text-sm font-medium text-strong">
          {user?.first_name} {user?.last_name}
        </p>
        <p className="text-xs text-subtle truncate">
          {user?.email}
        </p>
      </div>

      <button
        onClick={handleProfileClick}
        className="w-full text-left px-4 py-2 text-sm text-medium hover:bg-surface-hover active:bg-surface-active transition-colors flex items-center space-x-2"
      >
        <ProfileIcon width={20} height={20} />
        <span>Профиль</span>
      </button>

      <div className="border-t border-surface" />

      <button
        onClick={handleLogout}
        className="w-full text-left px-4 py-2 text-sm text-medium hover:bg-surface-hover active:bg-surface-active transition-colors flex items-center space-x-2"
      >
        <LogoutIcon width={20} height={20} />
        <span>Выйти</span>
      </button>
    </div>
  );

  return (
    <Dropdown
      trigger={trigger}
      content={content}
      placement="bottom"
      offset={8}
    />
  );
});

export default UserProfile;
