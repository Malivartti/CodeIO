import { userStore } from '@entities/user';
import CrossIcon from '@shared/assets/icons/Cross.svg';
import Container from '@widgets/Container';
import { observer } from 'mobx-react-lite';
import { FC, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const ConfirmEmailChangePage: FC = observer(() => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Токен не найден в ссылке');
      return;
    }

    const confirmEmailChange = async () => {
      const result = await userStore.confirmEmailChange(token);

      if (result.success) {
        setStatus('success');
        setMessage(result.message || 'Email успешно изменен');
      } else {
        setStatus('error');
        setMessage(result.message || 'Ошибка при подтверждении смены email');
      }
    };

    confirmEmailChange();
  }, [searchParams]);

  return (
    <Container>
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-surface rounded-xl shadow-lg border border-surface p-6 sm:p-8">
            <div className="text-center">
              {status === 'loading' && (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto border-4 border-brand border-t-transparent rounded-full animate-spin" />
                  <div>
                    <h2 className="text-xl font-semibold text-strong mb-2">
                      Подтверждение смены email
                    </h2>
                    <p className="text-medium">
                      Обрабатываем ваш запрос...
                    </p>
                  </div>
                </div>
              )}

              {status === 'success' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-strong mb-2">
                      Email успешно изменен!
                    </h2>
                    <p className="text-medium">
                      {message}
                    </p>
                  </div>
                  <div className="space-y-3 pt-4">
                    <Link
                      to="/profile"
                      className="block w-full px-4 py-2 bg-brand hover:bg-brand-hover text-inverse rounded-md font-medium transition-colors text-center"
                    >
                      Вернуться в профиль
                    </Link>
                    <Link
                      to="/tasks"
                      className="block w-full px-4 py-2 bg-canvas hover:bg-surface-hover border border-surface text-strong rounded-md font-medium transition-colors text-center"
                    >
                      К задачам
                    </Link>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-error rounded-full flex items-center justify-center">
                    <CrossIcon width={32} height={32} className="text-inverse" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-strong mb-2">
                      Ошибка подтверждения
                    </h2>
                    <p className="text-medium">
                      {message}
                    </p>
                  </div>
                  <div className="space-y-3 pt-4">
                    <Link
                      to="/profile"
                      className="block w-full px-4 py-2 bg-brand hover:bg-brand-hover text-inverse rounded-md font-medium transition-colors text-center"
                    >
                      Попробовать еще раз
                    </Link>
                    <Link
                      to="/"
                      className="block w-full px-4 py-2 bg-canvas hover:bg-surface-hover border border-surface text-strong rounded-md font-medium transition-colors text-center"
                    >
                      На главную
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
});

export default ConfirmEmailChangePage;
