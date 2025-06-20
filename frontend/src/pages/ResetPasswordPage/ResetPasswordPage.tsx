import { passwordRecoveryStore } from '@features/auth';
import CrossIcon from '@shared/assets/icons/Cross.svg';
import HideIcon from '@shared/assets/icons/Hide.svg';
import ViewIcon from '@shared/assets/icons/View.svg';
import { AppRoutes } from '@shared/types/routes';
import { observer } from 'mobx-react-lite';
import React, { FC, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const ResetPasswordPage: FC = observer(() => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const token = searchParams.get('token');

  const {
    isResettingPassword,
    resetError,
    resetSuccess,
  } = passwordRecoveryStore;

  useEffect(() => {
    passwordRecoveryStore.clearResetState();

    return () => {
      passwordRecoveryStore.reset();
    };
  }, []);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Пароль должен содержать минимум 8 символов';
    }
    if (password.length > 40) {
      return 'Пароль не должен превышать 40 символов';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!newPassword) {
      newErrors.newPassword = 'Пароль обязателен';
    } else {
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        newErrors.newPassword = passwordError;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Подтверждение пароля обязательно';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!token) {
      setErrors({ general: 'Отсутствует токен восстановления' });
      return;
    }

    setErrors({});
    await passwordRecoveryStore.resetPassword(token, newPassword);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'newPassword') {
      setNewPassword(value);
    } else {
      setConfirmPassword(value);
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    if (resetError) {
      passwordRecoveryStore.clearResetState();
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-surface rounded-xl shadow-lg border border-surface p-6 sm:p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-error rounded-full flex items-center justify-center">
                <CrossIcon width={32} height={32} className="text-inverse" />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-strong mb-2">
                  Недействительная ссылка
                </h2>
                <p className="text-medium">
                  Ссылка для восстановления пароля недействительна или истекла
                </p>
              </div>

              <Link
                to={AppRoutes.FORGOT_PASSWORD}
                className="block w-full px-4 py-2 bg-brand hover:bg-brand-hover text-inverse rounded-md font-medium transition-colors text-center"
              >
                Запросить новую ссылку
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-surface rounded-xl shadow-lg border border-surface p-6 sm:p-8">
            <div className="text-center space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-strong mb-2">
                  Пароль успешно изменен!
                </h2>
                <p className="text-medium">
                  Теперь вы можете войти в систему с новым паролем
                </p>
              </div>

              <Link
                to={AppRoutes.LOGIN}
                className="block w-full px-4 py-2 bg-brand hover:bg-brand-hover text-inverse rounded-md font-medium transition-colors text-center"
              >
                Войти в систему
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-surface rounded-xl shadow-lg border border-surface p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-strong mb-2">
              Новый пароль
            </h1>
            <p className="text-medium">
              Введите новый пароль для вашего аккаунта
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-strong mb-2">
                Новый пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-surface rounded-md bg-canvas text-strong placeholder-subtle focus:outline-none focus:ring-2 focus:ring-surface-accent focus:border-transparent"
                  placeholder="Введите новый пароль"
                  disabled={isResettingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-medium transition-colors"
                >
                  {showPassword ? (
                    <ViewIcon width={20} height={20} />
                  ) : (
                    <HideIcon width={20} height={20} />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-error">{errors.newPassword}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-strong mb-2">
                Подтверждение пароля
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-surface rounded-md bg-canvas text-strong placeholder-subtle focus:outline-none focus:ring-2 focus:ring-surface-accent focus:border-transparent"
                  placeholder="Повторите новый пароль"
                  disabled={isResettingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-medium transition-colors"
                >
                  {showConfirmPassword ? (
                    <ViewIcon width={20} height={20} />
                  ) : (
                    <HideIcon width={20} height={20} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-error">{errors.confirmPassword}</p>
              )}
            </div>

            {(resetError || errors.general) && (
              <div className="p-3 bg-canvas border border-error rounded-lg text-error text-sm">
                {resetError || errors.general}
              </div>
            )}

            <div className="bg-canvas border border-surface rounded-lg p-3">
              <p className="text-sm text-medium mb-2">
                <strong>Требования к паролю:</strong>
              </p>
              <ul className="text-xs text-subtle space-y-1">
                <li>• Минимум 8 символов</li>
                <li>• Максимум 40 символов</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isResettingPassword || !newPassword.trim() || !confirmPassword.trim()}
              className="w-full px-4 py-2 bg-brand hover:bg-brand-hover active:bg-brand-active text-inverse rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResettingPassword ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-inverse border-t-transparent rounded-full animate-spin" />
                  Изменяем пароль...
                </div>
              ) : (
                'Изменить пароль'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
});

export default ResetPasswordPage;
