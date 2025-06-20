import { AppRoutePages } from '@app/routes/AppRoutePages';
import { useMainPagePath } from '@app/routes/MainPageRedirect';
import { appStore } from '@app/stores/AppStore';
import { authStore } from '@features/auth';
import ErrorPage from '@pages/ErrorPage';
import LoadingPage from '@pages/LoadingPage';
import { AppRoutes } from '@shared/types/routes';
import { autorun } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import { MainLayout } from './Layouts';
import ProtectedRoute from './ProtectedRoute';

const AppRouterContent = observer(() => {
  const navigate = useNavigate();
  const mainPath = useMainPagePath();

  useEffect(() => {
    const dispose = autorun(() => {
      if (authStore.hasInitializationError) {

        return <ErrorPage
          title="Ошибка инициализации"
          error={authStore.initializationError || 'Не удалось проверить авторизацию'}
          showRetry
          onRetry={() => window.location.reload()}
        />;
      }
    });

    return dispose;
  }, [navigate]);

  return (
    <Suspense fallback={
      <LoadingPage
        message="Загрузка страницы"
        description="Подготавливаем контент..."
      />
    }>
      <MainLayout>
        <Routes>
          <Route
            path={AppRoutes.MAIN}
            element={<Navigate to={mainPath} replace />}
          />

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
      </MainLayout>
    </Suspense>
  );
});

const AppRouter = observer(() => {

  if (!appStore.allStoresReady) {
    return (
      <LoadingPage
        message="Инициализация приложения"
        description="Загружаем необходимые данные..."
      />
    );
  }

  return (
    <Router>
      <AppRouterContent />
    </Router>
  );
});

export default AppRouter;
