import { userStore } from '@entities/user';
import EditIcon from '@shared/assets/icons/Edit.svg';
import Avatar from '@shared/ui/Avatar';
import { observer } from 'mobx-react-lite';
import { FC, useState } from 'react';

import ChangeEmailForm from './ChangeEmailForm';
import ChangePasswordForm from './ChangePasswordForm';
import EditUserForm from './EditUserForm';

type EditMode = 'none' | 'profile' | 'email' | 'password';

const UserInfoSection: FC = observer(() => {
  const [editMode, setEditMode] = useState<EditMode>('none');
  const { user, avatarUrl, displayName } = userStore;

  const handleCancelEdit = () => {
    if (editMode === 'email') {
      userStore.clearEmailChangeState();
    } else if (editMode === 'password') {
      userStore.clearPasswordChangeState();
    }
    setEditMode('none');
  };

  const handleSuccessEdit = () => {
    setEditMode('none');
  };

  const handleOpenEmailForm = () => {
    userStore.clearEmailChangeState();
    setEditMode('email');
  };

  const handleOpenPasswordForm = () => {
    userStore.clearPasswordChangeState();
    setEditMode('password');
  };

  if (!user) return null;

  if (editMode === 'profile') {
    return (
      <div className="bg-surface border border-surface rounded-xl p-4 sm:p-6">
        <EditUserForm
          onCancel={handleCancelEdit}
          onSuccess={handleSuccessEdit}
        />
      </div>
    );
  }

  if (editMode === 'email') {
    return (
      <ChangeEmailForm
        onCancel={handleCancelEdit}
        onSuccess={handleSuccessEdit}
      />
    );
  }

  if (editMode === 'password') {
    return (
      <ChangePasswordForm
        onCancel={handleCancelEdit}
        onSuccess={handleSuccessEdit}
      />
    );
  }

  return (
    <div className="bg-surface border border-surface rounded-xl p-4 sm:p-6">
      <div className="flex flex-col mb-6">
        <h2 className="text-lg font-semibold text-strong mb-2">Информация</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleOpenPasswordForm}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-medium hover:text-strong bg-canvas hover:bg-surface-hover active:bg-surface-active border border-surface rounded-md transition-colors"
          >
            <EditIcon width={16} height={16} />
            <span>Пароль</span>
          </button>
          <button
            onClick={handleOpenEmailForm}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-medium hover:text-strong bg-canvas hover:bg-surface-hover active:bg-surface-active border border-surface rounded-md transition-colors"
          >
            <EditIcon width={16} height={16} />
            <span>Email</span>
          </button>
          <button
            onClick={() => setEditMode('profile')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-medium hover:text-strong bg-canvas hover:bg-surface-hover active:bg-surface-active border border-surface rounded-md transition-colors"
          >
            <EditIcon width={16} height={16} />
            <span>Профиль</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col items-center">
          <Avatar
            src={avatarUrl}
            name={displayName}
            size="xl"
          />
        </div>

        <div className="space-y-4">
          <div>
            <div className="block text-sm font-medium text-subtle mb-1">
              Имя
            </div>
            <div className="text-strong font-medium">
              {displayName || 'Не указано'}
            </div>
          </div>

          <div>
            <div className="block text-sm font-medium text-subtle mb-1">
              Email
            </div>
            <div className="text-strong">
              {user.email}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default UserInfoSection;
