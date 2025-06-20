import { usersStore } from '@entities/admin';
import { adminAPI } from '@entities/admin';
import { UserForAdmin } from '@shared/types/statistic';
import Container from '@widgets/Container';
import { observer } from 'mobx-react-lite';
import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import UserForm from '../DashboardUsersPage/ui/components/UserForm';

const EditUserPage: FC = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isUpdating, error } = usersStore;

  const [user, setUser] = useState<UserForAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      if (!id) {
        navigate('/dashboard/users');
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(null);
        const userData = await adminAPI.getUser(id);
        setUser(userData);
      } catch (error: any) {
        setLoadError(error.response?.data?.detail || 'Ошибка при загрузке пользователя');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [id, navigate]);

  const handleSubmit = async (userData: any): Promise<boolean> => {
    if (!id) return false;

    const success = await usersStore.updateUser(id, userData);
    if (success) {
      navigate('/dashboard/users');
    }
    return success;
  };

  const handleCancel = () => {
    navigate('/dashboard/users');
  };

  if (isLoading) {
    return (
      <Container>
        <div className="py-6 lg:py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-surface rounded-xl border border-surface p-6 animate-pulse">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="h-6 bg-surface-unaccent rounded w-48" />
                  <div className="h-4 bg-surface-unaccent rounded w-64" />
                </div>
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-surface-unaccent rounded w-24" />
                    <div className="h-10 bg-surface-unaccent rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (loadError) {
    return (
      <Container>
        <div className="py-6 lg:py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-surface rounded-xl border border-surface p-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-strong mb-2">
                  Ошибка загрузки
                </h2>
                <p className="text-error mb-4">{loadError}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-brand hover:bg-brand-hover text-inverse rounded-md transition-colors"
                  >
                    Попробовать снова
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-canvas hover:bg-surface-hover border border-surface text-strong rounded-md transition-colors"
                  >
                    Назад к списку
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <div className="py-6 lg:py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-surface rounded-xl border border-surface p-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-strong mb-2">
                  Пользователь не найден
                </h2>
                <p className="text-medium mb-4">
                  Возможно, пользователь был удален или у вас нет прав доступа
                </p>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-brand hover:bg-brand-hover text-inverse rounded-md transition-colors"
                >
                  Назад к списку
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-6 lg:py-8">
        <div className="max-w-2xl mx-auto">
          <UserForm
            user={user}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isUpdating}
            error={error}
          />
        </div>
      </div>
    </Container>
  );
});

export default EditUserPage;
