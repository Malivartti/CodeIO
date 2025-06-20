import ErrorPage from '@pages/ErrorPage';
import { useAccessControl } from '@shared/hooks/useAccessControl';
import { AccessLevel } from '@shared/types/routes';
import { observer } from 'mobx-react-lite';
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

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
  const {
    hasAccess,
    shouldRedirectToLogin,
    shouldRedirectToMain,
    redirectState,
    errorMessage,
  } = useAccessControl(allowedAccessLevels);

  if (shouldRedirectToMain) {
    return <Navigate to="/" replace />;
  }

  if (shouldRedirectToLogin) {
    return <Navigate to={redirectTo} state={redirectState} replace />;
  }

  if (!hasAccess) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    return (
      <ErrorPage
        title="Доступ запрещен"
        error={errorMessage || 'У вас недостаточно прав для доступа к этой странице'}

      />
    );
  }

  return <>{children}</>;
});

export default ProtectedRoute;
