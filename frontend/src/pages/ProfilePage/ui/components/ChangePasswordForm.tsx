import { userStore } from '@entities/user';
import CrossIcon from '@shared/assets/icons/Cross.svg';
import HideIcon from '@shared/assets/icons/Hide.svg';
import ViewIcon from '@shared/assets/icons/View.svg';
import { observer } from 'mobx-react-lite';
import React, { FC, useState } from 'react';

interface Props {
  onCancel: () => void;
  onSuccess: () => void;
}

const ChangePasswordForm: FC<Props> = observer(({ onCancel }) => {
  const {
    isChangingPassword,
    passwordChangeError,
    passwordChangeSuccess,
    pendingPasswords,
  } = userStore;

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Пароль должен содержать минимум 8 символов';
    }
    if (password.length > 40) {
      return 'Пароль не должен превышать 40 символов';
    }
    return null;
  };

  const getValidationErrors = () => {
    const errors: Record<string, string> = {};

    if (pendingPasswords.current && pendingPasswords.current.length < 8) {
      errors.current = 'Минимум 8 символов';
    }

    if (pendingPasswords.new) {
      const newPasswordError = validatePassword(pendingPasswords.new);
      if (newPasswordError) {
        errors.new = newPasswordError;
      } else if (pendingPasswords.new === pendingPasswords.current) {
        errors.new = 'Новый пароль не может совпадать с текущим';
      }
    }

    if (pendingPasswords.confirm && pendingPasswords.new !== pendingPasswords.confirm) {
      errors.confirm = 'Пароли не совпадают';
    }

    return errors;
  };

  const validationErrors = getValidationErrors();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!pendingPasswords.current || !pendingPasswords.new || !pendingPasswords.confirm) {
      return;
    }

    await userStore.updatePassword(pendingPasswords.current, pendingPasswords.new);
  };

  const handlePasswordChange = (field: 'current' | 'new' | 'confirm', value: string) => {
    userStore.setPendingPassword(field, value);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const isFormValid = pendingPasswords.current &&
                     pendingPasswords.new &&
                     pendingPasswords.confirm &&
                     Object.keys(validationErrors).length === 0;

  return (
    <div className="bg-surface border border-surface rounded-xl p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-strong">Изменение пароля</h3>
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
          <label htmlFor="current_password" className="block text-sm font-medium text-strong mb-2">
            Текущий пароль *
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              id="current_password"
              value={pendingPasswords.current}
              onChange={(e) => handlePasswordChange('current', e.target.value)}
              disabled={isChangingPassword}
              className="w-full px-3 py-2 pr-10 border border-surface rounded-md bg-canvas text-strong placeholder-subtle focus:outline-none focus:ring-2 focus:ring-surface-accent focus:border-transparent disabled:opacity-50"
              placeholder="Введите текущий пароль"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-medium transition-colors"
            >
              {showPasswords.current ? (
                <ViewIcon width={20} height={20} />
              ) : (
                <HideIcon width={20} height={20} />
              )}
            </button>
          </div>
          {validationErrors.current && (
            <p className="mt-1 text-sm text-error">{validationErrors.current}</p>
          )}
        </div>

        <div>
          <label htmlFor="new_password" className="block text-sm font-medium text-strong mb-2">
            Новый пароль *
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              id="new_password"
              value={pendingPasswords.new}
              onChange={(e) => handlePasswordChange('new', e.target.value)}
              disabled={isChangingPassword}
              className="w-full px-3 py-2 pr-10 border border-surface rounded-md bg-canvas text-strong placeholder-subtle focus:outline-none focus:ring-2 focus:ring-surface-accent focus:border-transparent disabled:opacity-50"
              placeholder="Введите новый пароль"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-medium transition-colors"
            >
              {showPasswords.new ? (
                <ViewIcon width={20} height={20} />
              ) : (
                <HideIcon width={20} height={20} />
              )}
            </button>
          </div>
          {validationErrors.new && (
            <p className="mt-1 text-sm text-error">{validationErrors.new}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirm_password" className="block text-sm font-medium text-strong mb-2">
            Подтверждение пароля *
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              id="confirm_password"
              value={pendingPasswords.confirm}
              onChange={(e) => handlePasswordChange('confirm', e.target.value)}
              disabled={isChangingPassword}
              className="w-full px-3 py-2 pr-10 border border-surface rounded-md bg-canvas text-strong placeholder-subtle focus:outline-none focus:ring-2 focus:ring-surface-accent focus:border-transparent disabled:opacity-50"
              placeholder="Повторите новый пароль"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-medium transition-colors"
            >
              {showPasswords.confirm ? (
                <ViewIcon width={20} height={20} />
              ) : (
                <HideIcon width={20} height={20} />
              )}
            </button>
          </div>
          {validationErrors.confirm && (
            <p className="mt-1 text-sm text-error">{validationErrors.confirm}</p>
          )}
        </div>

        {passwordChangeError && (
          <div className="p-3 bg-canvas border border-error rounded-lg text-error text-sm">
            {passwordChangeError}
          </div>
        )}

        {passwordChangeSuccess && (
          <div className="p-3 bg-canvas border border-success rounded-lg text-success text-sm">
            {passwordChangeSuccess}
          </div>
        )}

        <div className="bg-canvas border border-surface rounded-lg p-3">
          <p className="text-sm text-medium mb-2">
            <strong>Требования к паролю:</strong>
          </p>
          <ul className="text-xs text-subtle space-y-1">
            <li>• Минимум 8 символов</li>
            <li>• Максимум 40 символов</li>
            <li>• Новый пароль должен отличаться от текущего</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={isChangingPassword || !isFormValid}
            className="flex-1 px-4 py-2 bg-brand hover:bg-brand-hover active:bg-brand-active text-inverse rounded-md font-medium transition-colors disabled:bg-disabled"
          >
            {isChangingPassword ? 'Изменение...' : 'Изменить'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isChangingPassword}
            className="flex-1 px-4 py-2 bg-canvas hover:bg-surface-hover active:bg-surface-active border border-surface text-strong rounded-md font-medium transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
});

export default ChangePasswordForm;
