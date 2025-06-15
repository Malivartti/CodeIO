import { userStore } from '@entities/user';
import { NavigationHelpers } from '@shared/lib/routes';
import { FC, ReactNode } from 'react';

interface ErrorPageProps {
  error?: string;
  title?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  children?: ReactNode;
}

const ErrorPage: FC<ErrorPageProps> = ({
  error = 'Произошла неизвестная ошибка',
  title = 'Что-то пошло не так',
  onRetry,
  showRetry = true,
  children,
}) => {
  const isAuthenticated = userStore.isAuthenticated;
  const isSuperuser = userStore.isSuperuser;

  const toMain = () => {
    window.location.href = NavigationHelpers.getDefaultRouteForUser(isAuthenticated, isSuperuser);
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary flex items-center justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-bg-primary rounded-lg shadow-sm border border-border-primary p-8">
          <div className="flex flex-col items-center space-y-6">

            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-text-primary">
                {title}
              </h2>
              <p className="text-text-secondary">
                {error}
              </p>
            </div>


            {children && (
              <div className="w-full">
                {children}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {showRetry && (
                <button
                  onClick={handleRetry}
                  className="flex-1 bg-primary hover:bg-primary-hover text-text-inverse px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Обновить страницу
                </button>
              )}
              <button
                onClick={toMain}
                className="flex-1 bg-bg-tertiary hover:bg-state-hover text-text-primary px-4 py-2 rounded-md font-medium border border-border-primary transition-colors"
              >
                На главную
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
