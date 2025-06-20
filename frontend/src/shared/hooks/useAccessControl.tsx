import { userStore } from '@entities/user';
import { authStore } from '@features/auth';
import { AccessLevel } from '@shared/types/routes';
import { useLocation } from 'react-router-dom';

interface AccessControlResult {
  hasAccess: boolean;
  shouldRedirectToLogin: boolean;
  shouldRedirectToMain: boolean;
  redirectState?: any;
  errorMessage?: string;
}

export const useAccessControl = (allowedAccessLevels: AccessLevel[]): AccessControlResult => {
  const location = useLocation();

  const getUserAccessLevel = (): AccessLevel => {
    if (!authStore.isAuthenticated) return AccessLevel.GUEST;
    if (userStore.isSuperuser) return AccessLevel.SUPERUSER;
    return AccessLevel.USER;
  };

  const checkAccess = (allowedLevels: AccessLevel[], userLevel: AccessLevel): boolean => {
    if (allowedLevels.includes(AccessLevel.PUBLIC) || !allowedLevels.length) {
      return true;
    }
    return allowedLevels.includes(userLevel);
  };

  const userAccessLevel = getUserAccessLevel();
  const hasPageAccess = checkAccess(allowedAccessLevels, userAccessLevel);

  if (allowedAccessLevels.includes(AccessLevel.GUEST) && authStore.isAuthenticated) {
    return {
      hasAccess: false,
      shouldRedirectToLogin: false,
      shouldRedirectToMain: true,
    };
  }

  if (!allowedAccessLevels.includes(AccessLevel.GUEST) &&
      !allowedAccessLevels.includes(AccessLevel.PUBLIC) &&
      !authStore.isAuthenticated) {
    return {
      hasAccess: false,
      shouldRedirectToLogin: true,
      shouldRedirectToMain: false,
      redirectState: {
        from: location,
        message: 'Для доступа к этой странице требуется авторизация',
      },
    };
  }

  if (!hasPageAccess) {
    const getAccessErrorMessage = (): string => {
      if (allowedAccessLevels.includes(AccessLevel.SUPERUSER)) {
        return 'Требуются права суперпользователя для доступа к этой странице';
      }
      if (allowedAccessLevels.includes(AccessLevel.USER)) {
        return 'Требуется авторизация для доступа к этой странице';
      }
      return 'У вас недостаточно прав для доступа к этой странице';
    };

    return {
      hasAccess: false,
      shouldRedirectToLogin: false,
      shouldRedirectToMain: false,
      errorMessage: getAccessErrorMessage(),
    };
  }

  return {
    hasAccess: true,
    shouldRedirectToLogin: false,
    shouldRedirectToMain: false,
  };
};
