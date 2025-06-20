import { userStore } from '@entities/user';
import { authStore } from '@features/auth';
import { NavigationHelpers } from '@shared/lib/routes';
import { default as cn } from 'classnames';
import { observer } from 'mobx-react-lite';
import { FC, FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPage: FC = observer(() => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const validatePasswords = (): boolean => {
    const errors: Record<string, string> = {};

    if (password.length < 8) {
      errors.password = 'Пароль должен содержать минимум 8 символов';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (localErrors.password || localErrors.confirmPassword) {
      setLocalErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.password;
        if (confirmPassword && value === confirmPassword) {
          delete newErrors.confirmPassword;
        }
        return newErrors;
      });
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (localErrors.confirmPassword) {
      setLocalErrors(prev => {
        const newErrors = { ...prev };
        if (password === value) {
          delete newErrors.confirmPassword;
        }
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validatePasswords()) {
      return;
    }

    const success = await authStore.register({
      email: email.toLowerCase(),
      password,
      first_name: firstName,
      last_name: lastName || undefined,
    });

    if (success) {
      const isSuperuser = userStore.isSuperuser;
      navigate(NavigationHelpers.getDefaultRouteForUser(true, isSuperuser));
    }
  };

  const getFieldError = (field: string): string | undefined => {
    return localErrors[field] || authStore.getFieldError(field);
  };

  const hasFieldError = (field: string): boolean => {
    return Boolean(localErrors[field] || authStore.hasFieldError(field));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="max-w-md w-full space-y-8 p-6 bg-surface rounded-lg shadow-lg border border-surface">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-strong">
            Регистрация
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {authStore.error && (
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded">
              {authStore.error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <input
                type="email"
                required
                className={cn(
                  'relative block w-full px-3 py-2 border rounded-md placeholder-subtle text-strong bg-canvas focus:outline-none focus:ring-2 focus:ring-surface-accent focus:border-transparent transition-colors',
                  hasFieldError('email')
                    ? 'border-error'
                    : 'border-surface'
                )}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {hasFieldError('email') && (
                <p className="mt-2 text-sm text-error">{getFieldError('email')}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                required
                className={cn(
                  'relative block w-full px-3 py-2 border rounded-md placeholder-subtle text-strong bg-canvas focus:outline-none focus:ring-2 focus:ring-surface-accent focus:border-transparent transition-colors',
                  hasFieldError('password')
                    ? 'border-error'
                    : 'border-surface'
                )}
                placeholder="Пароль (минимум 8 символов)"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
              />
              {hasFieldError('password') && (
                <p className="mt-2 text-sm text-error">{getFieldError('password')}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                required
                className={cn(
                  'relative block w-full px-3 py-2 border rounded-md placeholder-subtle text-strong bg-canvas focus:outline-none focus:ring-2 focus:ring-surface-accent focus:border-transparent transition-colors',
                  hasFieldError('confirmPassword')
                    ? 'border-error'
                    : 'border-surface'
                )}
                placeholder="Подтвердите пароль"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              />
              {hasFieldError('confirmPassword') && (
                <p className="mt-2 text-sm text-error">{getFieldError('confirmPassword')}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                required
                className={cn(
                  'relative block w-full px-3 py-2 border rounded-md placeholder-subtle text-strong bg-canvas focus:outline-none focus:ring-2 focus:ring-surface-accent focus:border-transparent transition-colors',
                  hasFieldError('first_name')
                    ? 'border-error'
                    : 'border-surface'
                )}
                placeholder="Имя"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              {hasFieldError('first_name') && (
                <p className="mt-2 text-sm text-error">{getFieldError('first_name')}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                className={cn(
                  'relative block w-full px-3 py-2 border rounded-md placeholder-subtle text-strong bg-canvas focus:outline-none focus:ring-2 focus:ring-surface-accent focus:border-transparent transition-colors',
                  hasFieldError('last_name')
                    ? 'border-error'
                    : 'border-surface'
                )}
                placeholder="Фамилия (необязательно)"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              {hasFieldError('last_name') && (
                <p className="mt-2 text-sm text-error">{getFieldError('last_name')}</p>
              )}
            </div>
          </div>

          <div className="bg-canvas border border-surface rounded-lg p-3">
            <p className="text-sm text-medium mb-2">
              <strong>Требования к паролю:</strong>
            </p>
            <ul className="text-xs text-subtle space-y-1">
              <li className={cn(
                'flex items-center gap-2',
                password.length >= 8 ? 'text-success' : 'text-subtle'
              )}>
                <span className={cn(
                  'w-2 h-2 rounded-full',
                  password.length >= 8 ? 'bg-success' : 'bg-subtle'
                )} />
                Минимум 8 символов
              </li>
              <li className={cn(
                'flex items-center gap-2',
                password && confirmPassword && password === confirmPassword ? 'text-success' : 'text-subtle'
              )}>
                <span className={cn(
                  'w-2 h-2 rounded-full',
                  password && confirmPassword && password === confirmPassword ? 'bg-success' : 'bg-subtle'
                )} />
                Пароли совпадают
              </li>
            </ul>
          </div>

          <div>
            <button
              type="submit"
              disabled={authStore.isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-inverse bg-brand hover:bg-brand-hover active:bg-brand-active focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-disabled disabled:cursor-not-allowed transition-colors"
            >
              {authStore.isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="font-medium text-brand hover:text-brand-hover transition-colors">
              Уже есть аккаунт? Войти
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
});

export default RegisterPage;
