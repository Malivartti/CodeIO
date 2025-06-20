import { FC } from 'react';

interface LoadingPageProps {
  message?: string;
  description?: string;
}

const LoadingPage: FC<LoadingPageProps> = ({
  message = 'Загрузка...',
  description = 'Пожалуйста, подождите',
}) => {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-surface rounded-lg shadow-lg border border-surface p-8">
          <div className="flex flex-col items-center space-y-6">

            <div className="relative">
              <div className="w-16 h-16 border-4 border-surface-unaccent rounded-full animate-spin border-t-brand"></div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-strong">
                {message}
              </h2>
              <p className="text-medium">
                {description}
              </p>
            </div>

            <div className="w-full bg-surface-unaccent rounded-full h-2">
              <div className="bg-brand h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
