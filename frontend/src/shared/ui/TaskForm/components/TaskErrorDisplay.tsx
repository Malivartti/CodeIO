
import CrossIcon from '@shared/assets/icons/Cross.svg';
import { FC } from 'react';

interface Props {
  error?: string | null;
  fieldErrors?: Record<string, string>;
  onClearError?: () => void;
  className?: string;
}

const TaskErrorDisplay: FC<Props> = ({
  error,
  fieldErrors = {},
  onClearError,
  className,
}) => {
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  if (!error && !hasFieldErrors) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {hasFieldErrors && (
        <div className="bg-surface border border-error rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-medium text-error">Ошибки валидации:</h4>
          {Object.entries(fieldErrors).map(([field, errorMsg]) => (
            <div key={field} className="text-xs text-error">
              <strong className="capitalize">{field}:</strong> {errorMsg}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-surface border border-error rounded-lg p-4 flex items-start justify-between">
          <div className="text-error text-sm flex-1">{error}</div>
          <div className="flex items-center space-x-2 ml-4">
            {onClearError && (
              <button
                type="button"
                onClick={onClearError}
                className="text-subtle hover:text-error transition-colors"
              >
                <CrossIcon width={20} height={20} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskErrorDisplay;
