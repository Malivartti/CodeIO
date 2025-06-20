import HideIcon from '@shared/assets/icons/Hide.svg';
import ViewIcon from '@shared/assets/icons/View.svg';
import { UserForAdmin } from '@shared/types/statistic';
import React, { FC, useState } from 'react';

interface Props {
  user?: UserForAdmin;
  onSubmit: (userData: any) => Promise<boolean>;
  onCancel: () => void;
  isSubmitting: boolean;
  error?: string | null;
}

interface FormData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_superuser: boolean;
}

const UserForm: FC<Props> = ({ user, onSubmit, onCancel, isSubmitting, error }) => {
  const isEditing = Boolean(user);

  const [formData, setFormData] = useState<FormData>({
    email: user?.email || '',
    password: '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    is_active: user?.is_active ?? true,
    is_superuser: user?.is_superuser ?? false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = 'Пароль обязателен';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Пароль должен содержать минимум 8 символов';
      } else if (formData.password.length > 40) {
        newErrors.password = 'Пароль не должен превышать 40 символов';
      }
    } else if (formData.password && (formData.password.length < 8 || formData.password.length > 40)) {
      newErrors.password = 'Пароль должен содержать от 8 до 40 символов';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Имя обязательно';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: any = {
      email: formData.email.trim(),
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim() || undefined,
      is_active: formData.is_active,
      is_superuser: formData.is_superuser,
    };

    if (!isEditing || formData.password) {
      submitData.password = formData.password;
    }

    const success = await onSubmit(submitData);
    if (success && !isEditing) {
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        is_active: true,
        is_superuser: false,
      });
      setErrors({});
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-surface p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-strong">
          {isEditing ? 'Редактирование пользователя' : 'Создание пользователя'}
        </h2>
        <p className="text-medium mt-1">
          {isEditing
            ? 'Измените данные пользователя в форме ниже'
            : 'Заполните форму для создания нового пользователя'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-strong mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-surface rounded-md bg-canvas text-strong placeholder-subtle focus:outline-none focus:ring-2 focus:ring-surface-accent focus:border-transparent"
            placeholder="user@example.com"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-error">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-strong mb-2">
            Пароль {!isEditing && '*'}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-surface rounded-md bg-canvas text-strong placeholder-subtle focus:outline-none focus:ring-2 focus:ring-surface-accent focus:border-transparent"
              placeholder={isEditing ? 'Оставьте пустым, чтобы не менять' : 'Введите пароль'}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-medium transition-colors"
            >
              {showPassword ? (
                <ViewIcon width={20} height={20} />
              ) : (
                <HideIcon width={20} height={20} />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-error">{errors.password}</p>
          )}
          {!errors.password && (
            <p className="mt-1 text-xs text-subtle">
              Пароль должен содержать от 8 до 40 символов
            </p>
          )}
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
            disabled={isSubmitting}
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
            placeholder="Введите фамилию (необязательно)"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-strong">Настройки аккаунта</h3>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className="w-4 h-4 text-brand border-surface rounded focus:ring-surface-accent focus:ring-2"
              disabled={isSubmitting}
            />
            <label htmlFor="is_active" className="text-sm font-medium text-strong">
              Активный аккаунт
            </label>
          </div>
          <p className="text-xs text-subtle ml-7">
            Неактивные пользователи не могут войти в систему
          </p>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_superuser"
              checked={formData.is_superuser}
              onChange={(e) => handleInputChange('is_superuser', e.target.checked)}
              className="w-4 h-4 text-brand border-surface rounded focus:ring-surface-accent focus:ring-2"
              disabled={isSubmitting}
            />
            <label htmlFor="is_superuser" className="text-sm font-medium text-strong">
              Права администратора
            </label>
          </div>
          <p className="text-xs text-subtle ml-7">
            Администраторы имеют доступ к панели управления
          </p>
        </div>

        {error && (
          <div className="p-3 bg-canvas border border-error rounded-lg text-error text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-brand hover:bg-brand-hover active:bg-brand-active text-inverse rounded-md font-medium transition-colors disabled:bg-disable disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-inverse border-t-transparent rounded-full animate-spin" />
                {isEditing ? 'Сохранение...' : 'Создание...'}
              </div>
            ) : (
              isEditing ? 'Сохранить изменения' : 'Создать пользователя'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-canvas hover:bg-surface-hover active:bg-surface-active border border-surface text-strong rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
