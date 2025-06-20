import { usersStore } from '@entities/admin';
import DeleteIcon from '@shared/assets/icons/Delete.svg';
import EditIcon from '@shared/assets/icons/Edit.svg';
import LeftArrowIcon from '@shared/assets/icons/LeftArrow.svg';
import RightArrowIcon from '@shared/assets/icons/RightArrow.svg';
import { NavigationHelpers } from '@shared/lib/routes';
import Avatar from '@shared/ui/Avatar';
import ConfirmModal from '@shared/ui/ConfirmModal';
import { observer } from 'mobx-react-lite';
import React, { FC, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface DeleteModalState {
  isOpen: boolean;
  userId: string | null;
  userEmail: string;
}

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const UsersList: FC<Props> = observer(({ currentPage, totalPages, onPageChange }) => {
  const navigate = useNavigate();
  const { filteredUsers, isDeleting } = usersStore;
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    userId: null,
    userEmail: '',
  });

  useEffect(() => {
    filteredUsers.forEach(user => {
      if (user.avatar_filename && !usersStore.getAvatarUrl(user.avatar_filename)) {
        usersStore.loadAvatar(user.avatar_filename);
      }
    });
  }, [filteredUsers]);

  const handleDeleteClick = (e: React.MouseEvent, userId: string, userEmail: string) => {
    e.stopPropagation();
    e.preventDefault();
    setDeleteModal({
      isOpen: true,
      userId,
      userEmail,
    });
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleRowClick = (userId: string) => {
    navigate(NavigationHelpers.getUsertUrl(userId));
  };

  const handleRowKeyDown = (e: React.KeyboardEvent, userId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowClick(userId);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.userId) return;

    const success = await usersStore.deleteUser(deleteModal.userId);
    if (success) {
      setDeleteModal({
        isOpen: false,
        userId: null,
        userEmail: '',
      });
    }
  };

  const handleDeleteCancel = () => {
    if (isDeleting) return;

    setDeleteModal({
      isOpen: false,
      userId: null,
      userEmail: '',
    });
  };

  if (filteredUsers.length === 0) {
    return (
      <div className="bg-surface border border-surface rounded-xl p-8">
        <div className="text-center">
          <p className="text-medium text-lg mb-2">Пользователи не найдены</p>
          <p className="text-subtle">Попробуйте изменить параметры поиска</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="block lg:hidden space-y-4">
          {filteredUsers.map((user) => {
            const avatarUrl = usersStore.getAvatarUrl(user.avatar_filename);
            const isAvatarLoading = usersStore.isAvatarLoading(user.avatar_filename);

            return (
              <div
                key={user.id}
                className="bg-surface border border-surface rounded-xl p-4 cursor-pointer hover:bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                onClick={() => handleRowClick(user.id)}
                onKeyDown={(e) => handleRowKeyDown(e, user.id)}
                tabIndex={0}
                role="button"
                aria-label={`Просмотр пользователя ${user.first_name} ${user.last_name}`}
              >
                <div className="flex items-start gap-4">
                  {isAvatarLoading ? (
                    <div className="w-12 h-12 rounded-full bg-surface-unaccent animate-pulse" />
                  ) : (
                    <Avatar
                      src={avatarUrl}
                      name={`${user.first_name} ${user.last_name || ''}`}
                      size="md"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-strong truncate">
                        {user.first_name} {user.last_name}
                      </h3>
                      {user.is_superuser && (
                        <span className="px-2 py-0.5 bg-brand text-inverse text-xs rounded-full">
                          Админ
                        </span>
                      )}
                    </div>

                    <p className="text-medium text-sm mb-2">{user.email}</p>

                    <div className="flex items-center gap-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.is_active
                          ? 'bg-success-light text-success'
                          : 'bg-error-light text-error'
                      }`}>
                        {user.is_active ? 'Активен' : 'Заблокирован'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={NavigationHelpers.getUserUpdatetUrl(user.id)}
                      onClick={handleEditClick}
                      className="p-2 text-subtle hover:text-brand border border-surface hover:border-brand rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                    >
                      <EditIcon width={16} height={16} />
                    </Link>
                    <button
                      onClick={(e) => handleDeleteClick(e, user.id, user.email)}
                      disabled={isDeleting}
                      className="p-2 text-subtle hover:text-error border border-surface hover:border-error rounded-md transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2"
                    >
                      <DeleteIcon width={16} height={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden lg:block bg-surface border border-surface rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface bg-surface">
                <th className="px-6 py-4 text-left text-sm font-semibold text-strong">Пользователь</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-strong">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-strong">Статус</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-strong">Роль</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-strong">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color-surface)]">
              {filteredUsers.map((user) => {
                const avatarUrl = usersStore.getAvatarUrl(user.avatar_filename);
                const isAvatarLoading = usersStore.isAvatarLoading(user.avatar_filename);

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-surface-hover transition-colors cursor-pointer focus:outline-none focus:bg-surface-hover"
                    onClick={() => handleRowClick(user.id)}
                    onKeyDown={(e) => handleRowKeyDown(e, user.id)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Просмотр пользователя ${user.first_name} ${user.last_name}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {isAvatarLoading ? (
                          <div className="w-8 h-8 rounded-full bg-surface-unaccent animate-pulse" />
                        ) : (
                          <Avatar
                            src={avatarUrl}
                            name={`${user.first_name} ${user.last_name || ''}`}
                            size="sm"
                          />
                        )}
                        <div>
                          <div className="font-medium text-strong">
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-strong">{user.email}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.is_active
                          ? 'bg-success-light text-success'
                          : 'bg-error-light text-error'
                      }`}>
                        {user.is_active ? 'Активен' : 'Заблокирован'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {user.is_superuser && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-brand-light text-brand">
                          Администратор
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={NavigationHelpers.getUserUpdatetUrl(user.id)}
                          onClick={handleEditClick}
                          className="p-2 text-subtle hover:text-brand border border-surface bg-canvas hover:bg-surface-hover active:bg-surface-active rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                          title="Редактировать"
                        >
                          <EditIcon width={16} height={16} />
                        </Link>
                        <button
                          onClick={(e) => handleDeleteClick(e, user.id, user.email)}
                          disabled={isDeleting}
                          className="p-2 text-subtle hover:text-error border border-surface bg-canvas hover:bg-surface-hover active:bg-surface-active rounded-md transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2"
                          title="Удалить"
                        >
                          <DeleteIcon width={16} height={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-surface rounded-md text-strong hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
              >
                <LeftArrowIcon width={20} height={20} />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + Math.max(1, currentPage - 2);
                if (page > totalPages) return null;

                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${
                      currentPage === page
                        ? 'border-brand bg-brand text-inverse'
                        : 'border-surface text-strong hover:bg-surface-hover'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-surface rounded-md text-strong hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
              >
                <RightArrowIcon width={20} height={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Удаление пользователя"
        message={`Вы уверены, что хотите удалить пользователя "${deleteModal.userEmail}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
});

export default UsersList;
