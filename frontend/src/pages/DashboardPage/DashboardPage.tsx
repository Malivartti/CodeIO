import { AppRoutes } from '@shared/types/routes';
import Container from '@widgets/Container/Container';
import { FC } from 'react';
import { Link } from 'react-router-dom';

const DashboardPage: FC = () => {
  return (
    <div className="min-h-screen bg-canvas">
      <Container>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-strong">Панель администратора</h1>
            <p className="mt-2 text-medium">Управление системой и пользователями</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface p-6 rounded-lg border border-surface shadow-sm">
              <h2 className="text-xl font-semibold text-strong mb-4">Управление пользователями</h2>
              <p className="text-medium mb-4">Просмотр и управление учетными записями пользователей</p>
              <Link to={AppRoutes.USERS} className="bg-brand hover:bg-brand-hover text-inverse px-4 py-2 rounded-md transition-colors">
                Открыть
              </Link>
            </div>

            <div className="bg-surface p-6 rounded-lg border border-surface shadow-sm">
              <h2 className="text-xl font-semibold text-strong mb-4">Управление тегами</h2>
              <p className="text-medium mb-4">Добавление и редактирование тегов</p>
              <Link to={AppRoutes.TAGS} className="bg-brand hover:bg-brand-hover text-inverse px-4 py-2 rounded-md transition-colors">
                Открыть
              </Link>
            </div>

            <div className="bg-surface p-6 rounded-lg border border-surface shadow-sm">
              <h2 className="text-xl font-semibold text-strong mb-4">Статистика</h2>
              <p className="text-medium mb-4">Аналитика и отчеты системы</p>
              <Link to={AppRoutes.STATISTICS} className="bg-brand hover:bg-brand-hover text-inverse px-4 py-2 rounded-md transition-colors">
                Открыть
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default DashboardPage;
