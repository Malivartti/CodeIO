import { passwordRecoveryStore } from '@features/auth';
import { AppRoutes } from '@shared/types/routes';
import { observer } from 'mobx-react-lite';
import React, { FC, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage: FC = observer(() => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const {
    isRequestingReset,
    requestError,
    requestSuccess,
  } = passwordRecoveryStore;

  useEffect(() => {
    passwordRecoveryStore.clearRequestState();

    return () => {
      passwordRecoveryStore.reset();
    };
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setEmailError('Email обязателен');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Введите корректный email');
      return;
    }

    setEmailError('');
    await passwordRecoveryStore.requestPasswordReset(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      setEmailError('');
    }
    if (requestError) {
      passwordRecoveryStore.clearRequestState();
    }
  };

  if (requestSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-surface rounded-xl shadow-lg border border-surface  p-6 sm:p-8">
            <div className="text-center space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-strong mb-2">
                  Письмо отправлено!
                </h2>
                <p className="text-medium text-sm">
                  Мы отправили инструкции по восстановлению пароля на адрес{' '}
                  <span className="font-medium text-strong">{email}</span>
                </p>
              </div>

              <div className="bg-canvas border border-surface rounded-lg p-4">
                <p className="text-sm text-medium">
                  Проверьте папку "Спам", если письмо не пришло в течение нескольких минут.
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <Link
                  to={AppRoutes.LOGIN}
                  className="block w-full px-4 py-2 bg-brand hover:bg-brand-hover text-inverse rounded-md font-medium transition-colors text-center"
                >
                  Вернуться к входу
                </Link>
                <button
                  onClick={() => {
                    passwordRecoveryStore.clearRequestState();
                    setEmail('');
                  }}
                  className="block w-full px-4 py-2 bg-canvas hover:bg-surface-hover border border-surface text-strong rounded-md font-medium transition-colors"
                >
                  Отправить еще раз
                </button>
              </div>
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
              Забыли пароль?
            </h1>
            <p className="text-medium">
              Введите ваш email и мы отправим ссылку для восстановления пароля
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-strong mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className="w-full px-3 py-2 border border-surface rounded-md bg-canvas text-strong placeholder-subtle focus:outline-none focus:ring-2 focus:ring-surface-accent focus:border-transparent"
                placeholder="Введите ваш email"
                disabled={isRequestingReset}
              />
              {emailError && (
                <p className="mt-1 text-sm text-error">{emailError}</p>
              )}
              {requestError && (
                <p className="mt-1 text-sm text-error">{requestError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isRequestingReset || !email.trim()}
              className="w-full px-4 py-2 bg-brand hover:bg-brand-hover active:bg-brand-active text-inverse rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
            >
              {isRequestingReset ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-inverse border-t-transparent rounded-full animate-spin" />
                  Отправляем...
                </div>
              ) : (
                'Восстановить пароль'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to={AppRoutes.LOGIN}
              className="text-brand hover:text-brand-hover transition-colors text-sm"
            >
              Вернуться к входу
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ForgotPasswordPage;
