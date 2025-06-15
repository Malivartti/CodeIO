import Container from '@widgets/Container/Container';
import Header from '@widgets/Header/Header';
import { FC } from 'react';
import { Link } from 'react-router-dom';

const DashboardPage: FC = () => {
  return (
    <div className="min-h-screen bg-bg-secondary">
      <Header />
      <Container>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Панель администратора</h1>
            <p className="mt-2 text-text-secondary">Управление системой и пользователями</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-bg-primary p-6 rounded-lg border border-border-primary">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Управление пользователями</h2>
              <p className="text-text-secondary mb-4">Просмотр и управление учетными записями пользователей</p>
              <Link to="#" className="bg-primary hover:bg-primary-hover text-text-inverse px-4 py-2 rounded-md transition-colors">
                Открыть
              </Link>
            </div>


            <div className="bg-bg-primary p-6 rounded-lg border border-border-primary">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Управление задачами</h2>
              <p className="text-text-secondary mb-4">Добавление и редактирование задач</p>
              <Link to="#" className="bg-primary hover:bg-primary-hover text-text-inverse px-4 py-2 rounded-md transition-colors">
                Открыть
              </Link>
            </div>

            <div className="bg-bg-primary p-6 rounded-lg border border-border-primary">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Управление коллекциями</h2>
              <p className="text-text-secondary mb-4">Создание и редактирование коллекций</p>
              <Link to="#" className="bg-primary hover:bg-primary-hover text-text-inverse px-4 py-2 rounded-md transition-colors">
                Открыть
              </Link>
            </div>

            <div className="bg-bg-primary p-6 rounded-lg border border-border-primary">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Статистика</h2>
              <p className="text-text-secondary mb-4">Аналитика и отчеты системы</p>
              <Link to="#" className="bg-primary hover:bg-primary-hover text-text-inverse px-4 py-2 rounded-md transition-colors">
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
