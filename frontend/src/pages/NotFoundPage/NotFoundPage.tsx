import { userStore } from '@entities/user';
import { NavigationHelpers } from '@shared/lib/routes';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: FC = observer(() => {
  const isAuthenticated = userStore.isAuthenticated;
  const isSuperuser = userStore.isSuperuser;

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-surface rounded-lg shadow-sm border border-surface p-8 text-center">
          <div className="space-y-6">
            <div className="mx-auto flex items-center justify-center">
              <span className="text-4xl font-bold text-strong">404</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-strong">
                Страница не найдена
              </h1>
              <p className="text-medium">
                Запрашиваемая страница не существует или была перемещена
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Link
                to={NavigationHelpers.getDefaultRouteForUser(isAuthenticated, isSuperuser)}
                className="bg-brand hover:bg-brand-hover active:bg-brand-active text-inverse px-4 py-2 rounded-md font-medium transition-colors text-center w-full max-w-xs"
              >
                На главную
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default NotFoundPage;
