import { FC } from 'react';

interface Props {
  isLoading: boolean;
  submitText: string;
  cancelText?: string;
  onCancel?: () => void;
  className?: string;
}

const TaskFormActions: FC<Props> = ({
  isLoading,
  submitText,
  cancelText = 'Отмена',
  onCancel,
  className,
}) => {
  return (
    <div className={`flex justify-end space-x-4 ${className}`}>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-surface border border-surface hover:bg-surface-hover text-strong rounded-md transition-colors"
        >
          {cancelText}
        </button>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-2 bg-brand hover:bg-brand-hover disabled:opacity-50 text-inverse rounded-md transition-colors"
      >
        {isLoading ? 'Обработка...' : submitText}
      </button>
    </div>
  );
};

export default TaskFormActions;
