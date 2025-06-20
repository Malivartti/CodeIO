import { userStore } from '@entities/user';
import { authStore } from '@features/auth';
import AlertIcon from '@shared/assets/icons/Alert.svg';
import CrossIcon from '@shared/assets/icons/Cross.svg';
import { NavigationHelpers } from '@shared/lib/routes';
import { AppRoutes } from '@shared/types/routes';
import { default as cn } from 'classnames';
import { observer } from 'mobx-react-lite';
import { FC, FormEvent, useState } from 'react';
import { Link,useLocation,useNavigate } from 'react-router-dom';

const LoginPage: FC = observer(() => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showMessage, setShowMessage] = useState(true);

  const location = useLocation();
  const redirectMessage = location.state?.message;

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const success = await authStore.login({ email: email.toLocaleLowerCase(), password });
    if (success) {
      const isSuperuser = userStore.isSuperuser;
      const redirectUrl = location.state?.from?.pathname || NavigationHelpers.getDefaultRouteForUser(true, isSuperuser);
      navigate(redirectUrl);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="max-w-md w-full space-y-8 p-6 bg-surface rounded-lg shadow-lg border border-surface">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-strong">
            Вход в систему
          </h2>
        </div>

        {showMessage && redirectMessage && (
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0 text-warning flex items-center">
                <AlertIcon width={24} height={24}/>
              </div>
              <div className="ml-3">
                <p className="text-sm text-warning font-medium">
                  {redirectMessage}
                </p>
              </div>
              <div className="ml-auto pl-3 flex items-center">
                <button
                  onClick={() => setShowMessage(false)}
                  className="text-warning hover:text-warning/80 transition-colors"
                >
                  <CrossIcon className="" width={30} height={30}/>
                </button>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {authStore.error && (
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded">
              {authStore.error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={cn(
                'relative block w-full px-3 py-2 border rounded-md placeholder-subtle text-strong bg-canvas focus:outline-none focus:ring-2 focus:ring-surface-accent focus:border-transparent transition-colors',
                authStore.hasFieldError('email')
                  ? 'border-error'
                  : 'border-surface'
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
            <label htmlFor="password" className="sr-only">Пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className={cn(
                'relative block w-full px-3 py-2 border rounded-md placeholder-subtle text-strong bg-canvas focus:outline-none focus:ring-2 focus:ring-surface-accent focus:border-transparent transition-colors',
                authStore.hasFieldError('password')
                  ? 'border-error'
                  : 'border-surface'
              )}
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {authStore.hasFieldError('password') && (
              <p className="mt-2 text-sm text-error">{authStore.getFieldError('password')}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={authStore.isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-inverse bg-brand hover:bg-brand-hover active:bg-brand-active focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bg-brand-active disabled:bg-disabled disabled:cursor-not-allowed transition-colors"
            >
              {authStore.isLoading ? 'Загрузка...' : 'Войти'}
            </button>
          </div>

          <div className="text-center">
            <Link to={AppRoutes.REGISTER} className="font-medium text-brand hover:text-brand-hover transition-colors">
              Нет аккаунта? Зарегистрироваться
            </Link>
          </div>
          <div className="text-center">
            <Link
              to={AppRoutes.FORGOT_PASSWORD}
              className="font-medium text-brand hover:text-brand-hover transition-colors">
              Забыли пароль?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
});

export default LoginPage;
