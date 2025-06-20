import { userStore } from '@entities/user';
import { authStore } from '@features/auth';
import { AppRoutes } from '@shared/types/routes';
import { useLocation } from 'react-router-dom';

export const useMainPagePath = () => {
  const location = useLocation();
  const isAuthenticated = authStore.isAuthenticated;
  const isSuperuser = userStore.isSuperuser;

  const from = location.state?.from;

  if (from && isAuthenticated) {
    return from.pathname + from.search;
  }

  if (!isAuthenticated) {
    return AppRoutes.TASKS;
  }

  if (isSuperuser) {
    return AppRoutes.DASHBOARD;
  }

  return AppRoutes.TASKS;
};
