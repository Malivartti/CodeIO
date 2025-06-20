import { useMainPagePath } from '@app/routes/MainPageRedirect';
import { observer } from 'mobx-react-lite';
import { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
interface Props {
  title?: string;
  error?: string;
  showRetry?: boolean,
  onRetry?: () => void;
  children?: ReactNode
}

const ErrorPage: FC<Props> = observer(({
  title,
  error,
  showRetry = false,
  onRetry,
  children,
}) => {
  const mainPath = useMainPagePath();

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-surface rounded-lg shadow-lg border border-surface p-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-strong">
                {title}
              </h2>
              <p className="text-medium">
                {error}
              </p>
            </div>

            {children}

            {showRetry && <button
              onClick={onRetry}
              className="flex-1 bg-canvas hover:bg-surface-hover active:bg-surface-active text-strong px-4 py-2 rounded-md font-medium border border-surface transition-colors"
            >
              Повторить
            </button>}

            <Link
              to={mainPath}
              className="flex-1 bg-canvas hover:bg-surface-hover active:bg-surface-active text-strong px-4 py-2 rounded-md font-medium border border-surface transition-colors"
            >
              На главную
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
});

export default ErrorPage;
