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
    <div className="min-h-screen bg-bg-secondary flex items-center justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-bg-primary rounded-lg shadow-sm border border-border-primary p-8">
          <div className="flex flex-col items-center space-y-6">

            <div className="relative">
              <div className="w-16 h-16 border-4 border-border-primary rounded-full animate-spin border-t-primary"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-pulse border-t-primary-light"></div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-text-primary">
                {message}
              </h2>
              <p className="text-text-secondary">
                {description}
              </p>
            </div>

            <div className="w-full bg-bg-tertiary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
