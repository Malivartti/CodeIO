import { usersStore } from '@entities/admin';
import { adminAPI } from '@entities/admin';
import { userAPI } from '@entities/user';
import ErrorPage from '@pages/ErrorPage';
import LeftArrowIcon from '@shared/assets/icons/LeftArrow.svg';
import { UserForAdmin } from '@shared/types/statistic';
import Avatar from '@shared/ui/Avatar';
import Container from '@widgets/Container';
import { observer } from 'mobx-react-lite';
import { FC, ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

interface InfoItemProps {
  label: string;
  value: ReactNode;
}

const InfoItem: FC<InfoItemProps> = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <dt className="text-xs font-medium uppercase tracking-wide text-subtle">{label}</dt>
    <dd className="text-strong break-all">{value}</dd>
  </div>
);

interface InfoCardProps {
  title: string;
  children: ReactNode;
}

const InfoCard: FC<InfoCardProps> = ({ title, children }) => (
  <section className="rounded-2xl border border-surface bg-surface/70 backdrop-blur-md p-6 shadow-sm">
    <h2 className="mb-5 text-lg font-semibold text-strong">{title}</h2>
    <div className="flex flex-col gap-5">{children}</div>
  </section>
);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const UserViewPage: FC = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDeleting } = usersStore;

  const [user, setUser] = useState<UserForAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        navigate('/dashboard/users');
        return;
      }
      try {
        setIsLoading(true);
        setLoadError(null);

        const userData = await adminAPI.getUser(id);
        setUser(userData);

        if (userData.avatar_filename) {
          setIsAvatarLoading(true);
          try {
            const url = await userAPI.getAvatarBlob(userData.avatar_filename);
            setAvatarUrl(url);
          } finally {
            setIsAvatarLoading(false);
          }
        }
      } catch (e: any) {
        setLoadError(e.response?.data?.detail ?? 'Ошибка при загрузке пользователя');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  /* ---------------- loading ---------------- */
  if (isLoading) {
    return (
      <Container>
        <div className="mx-auto max-w-5xl py-10">
          <div className="space-y-8 animate-pulse">
            <div className="h-5 w-40 rounded bg-surface-unaccent" />
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-surface p-6">
                <div className="mb-6 flex items-center gap-6">
                  <div className="h-24 w-24 rounded-full bg-surface-unaccent" />
                  <div className="h-6 w-40 rounded bg-surface-unaccent" />
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-64 rounded bg-surface-unaccent" />
                  <div className="h-4 w-32 rounded bg-surface-unaccent" />
                  <div className="h-4 w-48 rounded bg-surface-unaccent" />
                </div>
              </div>
              <div className="rounded-2xl border border-surface p-6">
                <div className="h-6 w-48 rounded bg-surface-unaccent mb-6" />
                <div className="space-y-4">
                  <div className="h-4 w-40 rounded bg-surface-unaccent" />
                  <div className="h-4 w-32 rounded bg-surface-unaccent" />
                  <div className="h-4 w-64 rounded bg-surface-unaccent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  /* ---------------- error ---------------- */
  if (loadError) {
    return (
      <ErrorPage
        title="Ошибка загрузки"
        error="Что-то пошло не так"
        showRetry
        onRetry={() => window.location.reload()}
      />
    );
  }

  /* ---------------- not found ---------------- */
  if (!user) {
    return (
      <Container>
        <div className="mx-auto max-w-lg py-10">
          <InfoCard title="Пользователь не найден">
            <p className="text-medium">
              Возможно, пользователь был удалён или у вас нет прав доступа.
            </p>
            <Link
              to="/dashboard/users"
              className="inline-flex w-max items-center justify-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-inverse transition-colors hover:bg-brand-hover active:bg-brand-active"
            >
              Назад к списку
            </Link>
          </InfoCard>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mx-auto max-w-5xl py-10">
        <Link
          to="/dashboard/users"
          className="mb-6 inline-flex items-center gap-2 text-sm text-medium transition-colors hover:text-brand"
        >
          <LeftArrowIcon width={16} height={16} />
          Назад к пользователям
        </Link>

        <div className="grid gap-6 lg:grid-cols-2">
          <InfoCard title="Профиль">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              {isAvatarLoading ? (
                <div className="h-24 w-24 animate-pulse rounded-full bg-surface-unaccent" />
              ) : (
                <Avatar
                  src={avatarUrl}
                  name={`${user.first_name} ${user.last_name ?? ''}`}
                  size="xl"
                  className="shrink-0"
                />
              )}
              <div className="flex flex-col gap-4">
                <InfoItem label="Имя" value={user.first_name} />
                {user.last_name && <InfoItem label="Фамилия" value={user.last_name} />}
                <InfoItem label="Email" value={user.email} />
                <InfoItem
                  label="ID пользователя"
                  value={<span className="font-mono text-sm">{user.id}</span>}
                />
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Системная информация">
            <InfoItem
              label="Статус аккаунта"
              value={
                <span className={user.is_active ? 'text-success font-medium' : 'text-error font-medium'}>
                  {user.is_active ? 'Активен' : 'Заблокирован'}
                </span>
              }
            />
            <InfoItem
              label="Права доступа"
              value={user.is_superuser ? 'Администратор' : 'Обычный пользователь'}
            />
            {user.created_at && (
              <InfoItem label="Дата регистрации" value={formatDate(user.created_at)} />
            )}
          </InfoCard>
        </div>
      </div>
    </Container>
  );
});

export default UserViewPage;
