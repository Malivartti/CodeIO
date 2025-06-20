import CrossIcon from '@shared/assets/icons/Cross.svg';
import { default as cn } from 'classnames';
import React, { FC, useEffect } from 'react';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
}

const ConfirmModal: FC<Props> = ({
  isOpen,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  confirmVariant = 'primary',
  isLoading = false,
  onConfirm,
  onCancel,
  className,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isLoading, onCancel]);

  const handleOverlayClick = () => {
    if (!isLoading) {
      onCancel();
    }
  };

  const handleOverlayKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isLoading) {
      e.preventDefault();
      onCancel();
    }
  };

  if (!isOpen) return null;

  const confirmButtonClass = confirmVariant === 'danger'
    ? 'bg-error hover:bg-error-hover active:bg-error-active text-inverse'
    : 'bg-brand hover:bg-brand-hover active:bg-brand-active text-inverse';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-overlay transition-opacity cursor-pointer"
        onClick={handleOverlayClick}
        onKeyDown={handleOverlayKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Закрыть модальное окно"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={cn(
            'relative w-full max-w-md transform rounded-xl bg-surface border border-surface shadow-xl transition-all',
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 id="modal-title" className="text-lg font-semibold text-strong">
              {title}
            </h2>
            {!isLoading && (
              <button
                onClick={onCancel}
                className="p-1 -m-1 text-subtle hover:text-strong rounded transition-colors"
                aria-label="Закрыть"
              >
                <CrossIcon width={20} height={20} />
              </button>
            )}
          </div>

          <div className="px-6 pb-4">
            <p id="modal-description" className="text-medium">
              {message}
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 p-6 pt-4">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-canvas hover:bg-surface-hover active:bg-surface-active border border-surface text-strong rounded-md font-medium transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                'flex-1 px-4 py-2 rounded-md font-medium transition-colors disabled:bg-disable disabled:cursor-not-allowed',
                confirmButtonClass,
                confirmVariant === 'danger' ? 'focus:ring-error' : 'focus:ring-brand'
              )}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-inverse border-t-transparent rounded-full animate-spin" />
                  Удаление...
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
