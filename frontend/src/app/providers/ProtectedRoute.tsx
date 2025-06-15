import { appStore } from '@app/stores/AppStore';
import { userStore } from '@entities/user';
import { authStore } from '@features/auth';
import ErrorPage from '@pages/ErrorPage/ErrorPage';
import LoadingPage from '@pages/LoadingPage';
import { AccessLevel } from '@shared/types/routes';
import { observer } from 'mobx-react-lite';
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedAccessLevels: AccessLevel[];
  redirectTo?: string;
  fallbackComponent?: ReactNode;
}

const ProtectedRoute = observer(({
  children,
  allowedAccessLevels,
  redirectTo = '/login',
  fallbackComponent,
}: ProtectedRouteProps) => {
  const location = useLocation();

  if (!appStore.allStoresReady) {
    return (
      <LoadingPage
        message="Проверка доступа"
        description="Загружаем данные пользователя..."
      />
    );
  }

  if (authStore.hasInitializationError) {
    return (
      <ErrorPage
        title="Ошибка загрузки"
        error={authStore.initializationError || 'Не удалось загрузить данные'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const getUserAccessLevel = (): AccessLevel => {
    if (!authStore.isAuthenticated) return AccessLevel.GUEST;
    if (userStore.isSuperuser) return AccessLevel.SUPERUSER;
    return AccessLevel.USER;
  };

  const hasAccess = (allowedLevels: AccessLevel[], userLevel: AccessLevel): boolean => {
    if (allowedLevels.includes(AccessLevel.PUBLIC) || !allowedLevels.length) {
      return true;
    }
    return allowedLevels.includes(userLevel);
  };

  const userAccessLevel = getUserAccessLevel();
  const hasPageAccess = hasAccess(allowedAccessLevels, userAccessLevel);

  // Если требуется аутентификация для GUEST страниц, а пользователь авторизован
  if (allowedAccessLevels.includes(AccessLevel.GUEST) && authStore.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Если страница требует аутентификации, а пользователь не авторизован
  if (!allowedAccessLevels.includes(AccessLevel.GUEST) &&
      !allowedAccessLevels.includes(AccessLevel.PUBLIC) &&
      !authStore.isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{
          from: location,
          message: 'Для доступа к этой странице требуется авторизация',
        }}
        replace
      />
    );
  }

  // Если у пользователя нет доступа к странице
  if (!hasPageAccess) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    const getAccessErrorMessage = (): string => {
      if (allowedAccessLevels.includes(AccessLevel.SUPERUSER)) {
        return 'Требуются права суперпользователя для доступа к этой странице';
      }
      if (allowedAccessLevels.includes(AccessLevel.USER)) {
        return 'Требуется авторизация для доступа к этой странице';
      }
      return 'У вас недостаточно прав для доступа к этой странице';
    };

    return (
      <ErrorPage
        title="Доступ запрещен"
        error={getAccessErrorMessage()}
        showRetry={false}
      />
    );
  }

  return <>{children}</>;
});

export default ProtectedRoute;
