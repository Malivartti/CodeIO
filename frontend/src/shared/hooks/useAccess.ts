import { userStore } from '@entities/user';
import { authStore } from '@features/auth/model/store';
import { AccessLevel } from '@shared/types/routes';

export const useAccess = () => {
  const isAuthenticated = authStore.isAuthenticated;
  const isSuperuser = userStore.isSuperuser;

  const hasAccess = (accessLevel: AccessLevel): boolean => {
    switch (accessLevel) {
      case AccessLevel.PUBLIC:
        return true;
      case AccessLevel.GUEST:
        return !isAuthenticated;
      case AccessLevel.USER:
        return isAuthenticated;
      case AccessLevel.SUPERUSER:
        return isAuthenticated && isSuperuser;
      default:
        return false;
    }
  };

  const canViewAdminFeatures = isAuthenticated && isSuperuser;
  const shouldShowGuestFeatures = !isAuthenticated;

  return {
    isAuthenticated,
    isSuperuser,
    hasAccess,
    canViewAdminFeatures,
    shouldShowGuestFeatures,
  };
};
