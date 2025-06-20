import { usersStore } from '@entities/admin';
import { AppRoutes } from '@shared/types/routes';
import Container from '@widgets/Container';
import { observer } from 'mobx-react-lite';
import React, { FC, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import UsersList from './components/UsersList';
import UsersTableSkeleton from './components/UsersTableSkeleton';

const AdminUsersPage: FC = observer(() => {
  const {
    isLoading,
    error,
    totalUsers,
    currentPage,
    totalPages,
  } = usersStore;

  useEffect(() => {
    usersStore.loadUsers(1);

    return () => {
      usersStore.reset();
    };
  }, []);

  const handlePageChange = (page: number) => {
    usersStore.loadUsers(page);
  };

  return (
    <Container>
      <div className="py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-strong">Управление пользователями</h1>
            <p className="text-medium mt-1">
              Всего пользователей: {totalUsers}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-canvas hover:bg-surface-hover active:bg-surface-active border border-surface text-strong rounded-md transition-colors"
            >
              Назад к панели
            </Link>
            <Link
              to={AppRoutes.USER_CREATE}
              className="px-4 py-2 bg-brand hover:bg-brand-hover active:bg-brand-active text-inverse rounded-md transition-colors font-medium"
            >
              Создать пользователя
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-canvas border border-error rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-error">{error}</span>
              <button
                onClick={() => {
                  usersStore.clearError();
                  usersStore.loadUsers(currentPage);
                }}
                className="text-brand hover:text-brand-hover transition-colors font-medium"
              >
                Повторить
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <UsersTableSkeleton />
        ) : (
          <UsersList
            onPageChange={handlePageChange}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        )}
      </div>
    </Container>
  );
});

export default AdminUsersPage;
