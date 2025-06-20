import { userStore } from '@entities/user';
import Container from '@widgets/Container';
import { observer } from 'mobx-react-lite';
import { FC, useEffect } from 'react';

import UserInfoSection from './components/UserInfoSection';
import UserStatsSection from './components/UserStatsSection';

const ProfilePage: FC = observer(() => {
  useEffect(() => {
    userStore.fetchUserStats();
  }, []);

  if (!userStore.user) {
    return (
      <Container>
        <div className="text-center py-12 text-subtle">
          Пользователь не найден
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-6 lg:py-8">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-strong">Профиль</h1>
          <p className="text-medium mt-1">Управление аккаунтом и просмотр статистики</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-1">
            <UserInfoSection />
          </div>

          <div className="lg:col-span-2">
            <UserStatsSection />
          </div>
        </div>
      </div>
    </Container>
  );
});

export default ProfilePage;
