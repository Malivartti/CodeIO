import { userStore } from '@entities/user';
import { authStore } from '@features/auth/model/store';
import DownArrowIcon from '@shared/assets/icons/DownArrow.svg';
import LogoutIcon from '@shared/assets/icons/Logout.svg';
import ProfileIcon from '@shared/assets/icons/Profile.svg';
import { useAccess } from '@shared/hooks/useAccess';
import { AppRoutes } from '@shared/types/routes';
import { default as cn } from 'classnames';
import { observer } from 'mobx-react-lite';
import { FC, useEffect,useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import UserAvatar from '../UserAvatar/UserAvatar';

const UserProfile: FC = observer(() => {
  const { isAuthenticated } = useAccess();
  const user = userStore.user;
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    authStore.logout();
    setIsOpen(false);
    navigate(AppRoutes.TASKS);
  };

  const handleMenuToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    navigate(AppRoutes.PROFILE);
  };

  if (!isAuthenticated) {
    return (
      <Link
        to={AppRoutes.LOGIN}
        className="bg-primary hover:bg-primary-hover text-text-inverse px-4 py-2 rounded-md text-sm font-medium transition-colors"
      >
        Войти
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleMenuToggle}
        className="flex items-center space-x-2 hover:bg-state-hover rounded-md px-3 py-2 transition-colors"
      >
        <UserAvatar
          avatarFilename={user?.avatar_filename}
          firstName={user?.first_name}
        />

        <span className="text-sm text-text-secondary font-medium">
          {user?.first_name}
        </span>

        <DownArrowIcon
          className={cn(
            'ml-auto h-4 w-4 text-text-secondary transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          width={16}
          height={16}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-bg-primary border border-border-primary rounded-lg shadow-lg z-50">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-border-secondary">
              <p className="text-sm font-medium text-text-primary">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-text-secondary truncate">
                {user?.email}
              </p>
            </div>

            <button
              onClick={handleProfileClick}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-hover focus:bg-hover transition-colors flex items-center space-x-2"
            >
              <ProfileIcon width={20} height={20} />
              <span>Профиль</span>
            </button>

            <div className="border-t border-border-secondary my-1"></div>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-hover focus:bg-hover transition-colors flex items-center space-x-2"
            >
              <LogoutIcon width={20} height={20} />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default UserProfile;
