import { userStore } from '@entities/user';
import { authStore } from '@features/auth/model/store';
import { NavigationHelpers } from '@shared/lib/routes';
import { default as cn } from 'classnames';
import { observer } from 'mobx-react-lite';
import { FC, FormEvent, useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';

const RegisterPage: FC = observer(() => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const success = await authStore.register({
      email,
      password,
      first_name: firstName,
      last_name: lastName || undefined,
    });
    if (success) {
      const isSuperuser = userStore.isSuperuser;
      navigate(NavigationHelpers.getDefaultRouteForUser(true, isSuperuser));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-text-primary">
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
                  'relative block w-full px-3 py-2 border rounded-md placeholder-text-tertiary text-text-primary bg-bg-primary focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent transition-colors',
                  authStore.hasFieldError('email')
                    ? 'border-error'
                    : 'border-border-primary hover:border-border-accent'
                )}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {authStore.hasFieldError('email') && (
                <p className="mt-2 text-sm text-error">{authStore.getFieldError('email')}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                required
                className={cn(
                  'relative block w-full px-3 py-2 border rounded-md placeholder-text-tertiary text-text-primary bg-bg-primary focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent transition-colors',
                  authStore.hasFieldError('password')
                    ? 'border-error'
                    : 'border-border-primary hover:border-border-accent'
                )}
                placeholder="Пароль (минимум 8 символов)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {authStore.hasFieldError('password') && (
                <p className="mt-2 text-sm text-error">{authStore.getFieldError('password')}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                required
                className={cn(
                  'relative block w-full px-3 py-2 border rounded-md placeholder-text-tertiary text-text-primary bg-bg-primary focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent transition-colors',
                  authStore.hasFieldError('first_name')
                    ? 'border-error'
                    : 'border-border-primary hover:border-border-accent'
                )}
                placeholder="Имя"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              {authStore.hasFieldError('first_name') && (
                <p className="mt-2 text-sm text-error">{authStore.getFieldError('first_name')}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                className={cn(
                  'relative block w-full px-3 py-2 border rounded-md placeholder-text-tertiary text-text-primary bg-bg-primary focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent transition-colors',
                  authStore.hasFieldError('last_name')
                    ? 'border-error'
                    : 'border-border-primary hover:border-border-accent'
                )}
                placeholder="Фамилия (необязательно)"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              {authStore.hasFieldError('last_name') && (
                <p className="mt-2 text-sm text-error">{authStore.getFieldError('last_name')}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={authStore.isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-text-inverse bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-focus disabled:bg-state-disabled disabled:cursor-not-allowed transition-colors"
            >
              {authStore.isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="font-medium text-primary hover:text-primary-hover transition-colors">
              Уже есть аккаунт? Войти
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
});

export default RegisterPage;
