import { userStore } from '@entities/user';
import CrossIcon from '@shared/assets/icons/Cross.svg';
import { observer } from 'mobx-react-lite';
import React, { FC } from 'react';

interface Props {
  onCancel: () => void;
  onSuccess: () => void;
}

const ChangeEmailForm: FC<Props> = observer(({ onCancel }) => {
  const {
    user,
    isChangingEmail,
    emailChangeError,
    emailChangeSuccess,
    pendingNewEmail,
  } = userStore;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getLocalValidationError = (email: string): string | null => {
    if (!email.trim()) {
      return 'Email обязателен';
    }
    if (!validateEmail(email)) {
      return 'Введите корректный email';
    }
    if (email === user?.email) {
      return 'Новый email не может совпадать с текущим';
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationError = getLocalValidationError(pendingNewEmail);
    if (validationError) {
      return;
    }

    await userStore.updateEmail(pendingNewEmail.toLocaleLowerCase());

  };

  const handleEmailChange = (value: string) => {
    userStore.setPendingNewEmail(value);
  };

  const localValidationError = getLocalValidationError(pendingNewEmail);
  const hasValidationError = localValidationError && pendingNewEmail.trim() !== '';

  if (!user) return null;

  return (
    <div className="bg-surface border border-surface rounded-xl p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-strong">Изменение email</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-subtle hover:text-strong p-1 -m-1 rounded focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
        >
          <CrossIcon width={20} height={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="block text-sm font-medium text-subtle mb-1">
            Текущий email
          </div>
          <div className="text-strong">
            {user.email}
          </div>
        </div>

        <div>
          <label htmlFor="new_email" className="block text-sm font-medium text-strong mb-2">
            Новый email *
          </label>
          <input
            type="email"
            id="new_email"
            value={pendingNewEmail}
            onChange={(e) => handleEmailChange(e.target.value)}
            disabled={isChangingEmail}
            className="w-full px-3 py-2 border border-surface rounded-md bg-canvas text-strong placeholder-subtle focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent disabled:opacity-50"
            placeholder="Введите новый email"
          />
          {hasValidationError && (
            <p className="mt-1 text-sm text-error">{localValidationError}</p>
          )}
          {!hasValidationError && emailChangeError && (
            <p className="mt-1 text-sm text-error">{emailChangeError}</p>
          )}
        </div>

        {emailChangeSuccess && (
          <div className="p-3 bg-canvas border border-success rounded-lg text-success text-sm">
            {emailChangeSuccess}
          </div>
        )}

        <div className="bg-canvas border border-surface rounded-lg p-3">
          <p className="text-sm text-medium">
            <strong>Внимание:</strong> На ваш текущий email ({user.email}) будет отправлено письмо с ссылкой для подтверждения смены email.
            После перехода по ссылке смена email будет завершена.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={Boolean(isChangingEmail || !pendingNewEmail.trim() || hasValidationError)}
            className="flex-1 px-4 py-2 bg-brand hover:bg-brand-hover active:bg-brand-active text-inverse rounded-md font-medium transition-colors disabled:bg-disabled"
          >
            {isChangingEmail ? 'Отправка...' : 'Отправить'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isChangingEmail}
            className="flex-1 px-4 py-2 bg-canvas hover:bg-surface-hover active:bg-surface-active border border-surface text-strong rounded-md font-medium transition-colors"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
});

export default ChangeEmailForm;
