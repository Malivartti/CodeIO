import { userStore } from '@entities/user';
import CrossIcon from '@shared/assets/icons/Cross.svg';
import Avatar from '@shared/ui/Avatar';
import { observer } from 'mobx-react-lite';
import React, { FC, useEffect, useRef, useState } from 'react';

interface Props {
  onCancel: () => void;
  onSuccess: () => void;
}

const ALLOWED_IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

const EditUserForm: FC<Props> = observer(({ onCancel, onSuccess }) => {
  const { user, avatarUrl, isUpdating } = userStore;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [localAvatarFile, setLocalAvatarFile] = useState<File | null>(null);
  const [localAvatarPreview, setLocalAvatarPreview] = useState<string | null>(null);
  const [avatarToDelete, setAvatarToDelete] = useState(false);

  useEffect(() => {
    if (localAvatarFile) {
      const objectUrl = URL.createObjectURL(localAvatarFile);
      setLocalAvatarPreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setLocalAvatarPreview(null);
    }
  }, [localAvatarFile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateImageFile = (file: File): string | null => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return `Поддерживаются только файлы: ${ALLOWED_IMAGE_TYPES.join(', ')}`;
    }

    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_IMAGE_TYPES.some(ext => fileName.endsWith(ext));

    if (!hasValidExtension) {
      return `Поддерживаются только файлы: ${ALLOWED_IMAGE_TYPES.join(', ')}`;
    }

    if (file.size > 5 * 1024 * 1024) {
      return 'Размер файла не должен превышать 5MB';
    }

    return null;
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setErrors(prev => ({ ...prev, avatar: validationError }));
      event.target.value = '';
      return;
    }

    setLocalAvatarFile(file);
    setAvatarToDelete(false);
    setErrors(prev => ({ ...prev, avatar: '' }));

    event.target.value = '';
  };

  const handleAvatarDelete = () => {
    setLocalAvatarFile(null);
    setLocalAvatarPreview(null);
    setAvatarToDelete(true);
    setErrors(prev => ({ ...prev, avatar: '' }));
  };

  const handleCancel = () => {
    setLocalAvatarFile(null);
    setLocalAvatarPreview(null);
    setAvatarToDelete(false);
    onCancel();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Имя обязательно';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (avatarToDelete && user?.avatar_filename) {
        const avatarSuccess = await userStore.deleteAvatar();
        if (!avatarSuccess) {
          setErrors({ avatar: 'Ошибка при удалении аватара' });
          return;
        }
      }

      if (localAvatarFile) {
        const avatarSuccess = await userStore.uploadAvatar(localAvatarFile);
        if (!avatarSuccess) {
          setErrors({ avatar: 'Ошибка при загрузке аватара' });
          return;
        }
      }

      const success = await userStore.updateUser({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim() || undefined,
      });

      if (success) {
        onSuccess();
      } else {
        setErrors({ general: 'Ошибка при сохранении данных' });
      }
    } catch {
      setErrors({ general: 'Произошла неожиданная ошибка' });
    }
  };

  if (!user) return null;

  const getCurrentAvatarSrc = () => {
    if (avatarToDelete) return null;
    if (localAvatarPreview) return localAvatarPreview;
    return avatarUrl;
  };

  const getDisplayName = () => {
    return `${formData.first_name}${formData.last_name ? ` ${formData.last_name}` : ''}`;
  };

  const hasAvatarChanges = localAvatarFile || avatarToDelete;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-strong">Редактирование профиля</h3>
        <button
          type="button"
          onClick={handleCancel}
          className="text-subtle hover:text-strong p-1 -m-1 rounded"
        >
          <CrossIcon width={20} height={20} />
        </button>
      </div>

      {errors.general && (
        <div className="p-3 bg-canvas border border-error rounded-lg text-error text-sm">
          {errors.general}
        </div>
      )}

      <div>
        <div className="block text-sm font-medium text-strong mb-3">
          Аватар
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative">
            <Avatar
              src={getCurrentAvatarSrc()}
              name={getDisplayName()}
              size="lg"
            />
            {hasAvatarChanges && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full border-2 border-surface" />
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUpdating}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-canvas hover:bg-surface-hover active:bg-surface-active border border-surface rounded-md transition-colors"
            >
              <span className="text-strong">Загрузить</span>
            </button>

            {(user.avatar_filename || localAvatarFile) && !avatarToDelete && (
              <button
                type="button"
                onClick={handleAvatarDelete}
                disabled={isUpdating}
                className="px-3 py-2 text-sm text-error hover:bg-error hover:text-inverse border border-error rounded-md transition-colors"
              >
                Удалить
              </button>
            )}
          </div>
        </div>

        {errors.avatar && (
          <p className="mt-1 text-sm text-error">{errors.avatar}</p>
        )}

        <p className="mt-1 text-xs text-subtle">
          Поддерживаемые форматы: JPG, JPEG, PNG, GIF, WebP. Максимальный размер: 5MB
        </p>

        {hasAvatarChanges && (
          <p className="mt-1 text-sm text-warning">
            {avatarToDelete ? 'Аватар будет удален после сохранения' : 'Новый аватар будет установлен после сохранения'}
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          onChange={handleAvatarUpload}
          className="hidden"
        />
      </div>

      <div>
        <label htmlFor="first_name" className="block text-sm font-medium text-strong mb-2">
          Имя *
        </label>
        <input
          type="text"
          id="first_name"
          value={formData.first_name}
          onChange={(e) => handleInputChange('first_name', e.target.value)}
          className="w-full px-3 py-2 border border-surface rounded-md bg-canvas text-strong placeholder-subtle focus:outline-none focus:ring-2 focus:ring-surface-accent focus:border-transparent"
          placeholder="Введите имя"
        />
        {errors.first_name && (
          <p className="mt-1 text-sm text-error">{errors.first_name}</p>
        )}
      </div>

      <div>
        <label htmlFor="last_name" className="block text-sm font-medium text-strong mb-2">
          Фамилия
        </label>
        <input
          type="text"
          id="last_name"
          value={formData.last_name}
          onChange={(e) => handleInputChange('last_name', e.target.value)}
          className="w-full px-3 py-2 border border-surface rounded-md bg-canvas text-strong placeholder-subtle focus:outline-none focus:ring-2 focus:ring-surface-accent focus:border-transparent"
          placeholder="Введите фамилию"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="submit"
          disabled={isUpdating}
          className="flex-1 px-4 py-2 bg-brand hover:bg-brand-hover active:bg-brand-active text-inverse rounded-md font-medium transition-colors disabled:bg-disabled"
        >
          {isUpdating ? 'Сохранение...' : 'Сохранить'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isUpdating}
          className="flex-1 px-4 py-2 bg-canvas hover:bg-surface-hover border border-surface text-strong rounded-md font-medium transition-colors"
        >
          Отмена
        </button>
      </div>
    </form>
  );
});

export default EditUserForm;
