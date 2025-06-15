import { authStore } from '@features/auth';
import ErrorPage from '@pages/ErrorPage';
import { AccessLevel } from '@shared/types/routes';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';
import { Navigate } from 'react-router-dom';

interface AccessDeniedHandlerProps {
  accessLevel: AccessLevel;
}

const AccessDeniedHandler: FC<AccessDeniedHandlerProps> = observer(({ accessLevel }) => {
  const isAuthenticated = authStore.isAuthenticated;

  switch (accessLevel) {
    case AccessLevel.GUEST:
      return <Navigate to="/dashboard" replace />;

    case AccessLevel.USER:
      return <Navigate to="/login" replace />;

    case AccessLevel.SUPERUSER:
      if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
      } else {
        return (
          <ErrorPage
            title="Доступ запрещен"
            error="У вас нет прав на посещение данное страницы"
            showRetry={false}
          />
        );
      }

    default:
      return <Navigate to="/404" replace />;
  }
});

export default AccessDeniedHandler;
