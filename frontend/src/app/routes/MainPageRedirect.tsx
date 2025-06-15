import { userStore } from '@entities/user';
import { authStore } from '@features/auth';
import { AppRoutes } from '@shared/types/routes';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const MainPageRedirect: FC = observer(() => {
  const location = useLocation();
  const isAuthenticated = authStore.isAuthenticated;
  const isSuperuser = userStore.isSuperuser;

  const from = location.state?.from;
  if (from && isAuthenticated) {
    return <Navigate to={from.pathname + from.search} replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to={AppRoutes.TASKS} replace />;
  }

  if (isSuperuser) {
    return <Navigate to={AppRoutes.DASHBOARD} replace />;
  }

  return <Navigate to={AppRoutes.TASKS} replace />;
});

export default MainPageRedirect;
