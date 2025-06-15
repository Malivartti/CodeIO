import { AppRoutePages } from '@app/routes/AppRoutePages';
import { appStore } from '@app/stores/AppStore';
import { authStore } from '@features/auth';
import ErrorPage from '@pages/ErrorPage';
import LoadingPage from '@pages/LoadingPage';
import { AppRoutes } from '@shared/types/routes';
import { observer } from 'mobx-react-lite';
import { Suspense } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';

const AppRouter = observer(() => {
  if (!appStore.allStoresReady) {
    return (
      <LoadingPage
        message="Инициализация веб-приложения"
        description="Загружаем необходимые данные..."
      />
    );
  }

  if (authStore.hasInitializationError) {
    return (
      <ErrorPage
        title="Ошибка инициализации"
        error={authStore.initializationError || 'Не удалось инициализировать веб-приложение'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <Router>
      <Suspense fallback={
        <LoadingPage
          message="Загрузка страницы"
          description="Подготавливаем контент..."
        />
      }>
        <Routes>
          {AppRoutePages.map(({ path, element, accessLevels }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute allowedAccessLevels={accessLevels}>
                  {element}
                </ProtectedRoute>
              }
            />
          ))}

          <Route
            path={AppRoutes.WILDCARD}
            element={<Navigate to={AppRoutes.NOT_FOUND} replace />}
          />
        </Routes>
      </Suspense>
    </Router>
  );
});

export default AppRouter;
